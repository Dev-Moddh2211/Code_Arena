# Deployment Architecture — Code Arena

Code Arena is designed for production deployment across containerized infrastructure.

## Deployment Topology

```mermaid
flowchart TD
    subgraph Edge ["Global Edge Tier"]
        Client["Users & Evaluators"]
        VercelCDN["Vercel Edge Network / CDN<br/>(Hosts Frontend SPA Assets)"]
    end

    subgraph VPS ["Production Host (Ubuntu VPS / Cloud VM)"]
        Nginx["Nginx Reverse Proxy + Let's Encrypt SSL<br/>(Port 80 / 443)"]
        
        subgraph DockerCompose ["Docker Compose Mesh"]
            BackendApp["FastAPI Backend Container<br/>(Port 8000)"]
            PostgresDB[("PostgreSQL 16 Container<br/>(Port 5432, Persisted Volume)")]
            DockerSock["/var/run/docker.sock Mount"]
        end
    end

    Client -->|HTTPS (Static App)| VercelCDN
    Client -->|HTTPS /api Calls| Nginx
    Nginx -->|Proxy Pass http://127.0.0.1:8000| BackendApp
    BackendApp -->|Internal Network| PostgresDB
    BackendApp -->|Spawn Runners| DockerSock
```

## Production Deployment Checklist
1. **Frontend**: Continuous deployment to Vercel/Netlify with `VITE_API_BASE_URL=https://api.codearena.dev/api`.
2. **Backend**: Single Ubuntu VPS with Docker installed; `docker-compose.yml` mounts Docker socket and persists Postgres storage in `pgdata` volume.
3. **SSL Termination**: Nginx reverse proxy with automated certbot renewals.
