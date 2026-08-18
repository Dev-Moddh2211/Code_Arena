from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import (
    security_bearer,
    verify_password,
    get_password_hash,
    create_access_token,
    decode_token,
)
from app.models.user import User
from app.schemas.auth import UserRegisterRequest, UserLoginRequest, TokenResponse, UserResponse

def get_optional_user(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
    db: Session = Depends(get_db)
) -> Optional[User]:
    if not auth:
        return None
    payload = decode_token(auth.credentials)
    if not payload:
        return None
    user_id = payload.get("sub")
    if not user_id:
        return None
    return db.query(User).filter(User.id == user_id).first()

def get_current_user(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
    db: Session = Depends(get_db)
) -> User:
    if not auth:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_token(auth.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user

def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user

class AuthService:
    @staticmethod
    def register(db: Session, req: UserRegisterRequest) -> TokenResponse:
        existing = db.query(User).filter((User.username == req.username) | (User.email == req.email)).first()
        if existing:
            if existing.username == req.username:
                raise HTTPException(status_code=400, detail="Username is already taken")
            raise HTTPException(status_code=400, detail="Email is already registered")

        user = User(
            username=req.username,
            email=req.email,
            password_hash=get_password_hash(req.password),
            role="user",
            is_demo=False
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        token = create_access_token(subject=user.id, role=user.role)
        return TokenResponse(access_token=token, token_type="bearer", user=UserResponse.model_validate(user))

    @staticmethod
    def login(db: Session, req: UserLoginRequest) -> TokenResponse:
        user = db.query(User).filter(User.email == req.email).first()
        if not user or not verify_password(req.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        token = create_access_token(subject=user.id, role=user.role)
        return TokenResponse(access_token=token, token_type="bearer", user=UserResponse.model_validate(user))

    @staticmethod
    def demo_login(db: Session, role: str) -> TokenResponse:
        target_username = "demo_student" if role.lower() == "student" else "demo_admin"
        user = db.query(User).filter(User.username == target_username).first()
        
        # If demo user does not exist yet (e.g. before full seed), auto-create
        if not user:
            user = User(
                username=target_username,
                email=f"{target_username}@codearena.dev",
                password_hash=get_password_hash("DemoSecret123!"),
                role="admin" if target_username == "demo_admin" else "user",
                bio="Demo account for Code Arena platform inspection" if target_username == "demo_student" else "Admin preview account",
                is_demo=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        token = create_access_token(subject=user.id, role=user.role)
        return TokenResponse(access_token=token, token_type="bearer", user=UserResponse.model_validate(user))
