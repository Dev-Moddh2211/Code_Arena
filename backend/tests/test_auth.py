def test_demo_login_student(client):
    res = client.post("/api/auth/demo-login", json={"role": "student"})
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["username"] == "demo_student"
    assert data["user"]["is_demo"] is True

def test_demo_login_admin(client):
    res = client.post("/api/auth/demo-login", json={"role": "admin"})
    assert res.status_code == 200
    data = res.json()
    assert data["user"]["role"] == "admin"
    assert data["user"]["username"] == "demo_admin"

def test_register_and_login_flow(client):
    reg_res = client.post(
        "/api/auth/register",
        json={"username": "new_tester", "email": "new_tester@test.com", "password": "SecurePass123!"}
    )
    assert reg_res.status_code == 200
    token = reg_res.json()["access_token"]
    assert token is not None

    login_res = client.post(
        "/api/auth/login",
        json={"email": "new_tester@test.com", "password": "SecurePass123!"}
    )
    assert login_res.status_code == 200
    assert login_res.json()["user"]["username"] == "new_tester"

def test_get_me_unauthorized(client):
    res = client.get("/api/auth/me")
    assert res.status_code == 401
