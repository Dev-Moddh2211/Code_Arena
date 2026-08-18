# System Architecture — Code Arena

Code Arena is architected as a decoupled, multi-tier web application consisting of a modern single-page React frontend, a high-throughput FastAPI backend REST API, and an isolated multi-language code-execution sandbox service.

## Architecture Diagram

```mermaid
flowchart TD
    subgraph Client ["Client Tier (Browser)"]
        SPA["React 18 SPA (TypeScript + Vite)<br/>• Workspace (Monaco Editor)<br/>• Analytics Dashboard<br/>• Admin CMS Wizard<br/>• Company Problem Sheets"]
    end

    subgraph API ["Application Tier (FastAPI)"]
        Router["FastAPI Gateway / Routers<br/>• /api/auth (JWT & Demo Login)<br/>• /api/problems (Catalog & Filters)<br/>• /api/submissions (Run & Submit)<br/>• /api/dashboard (Streak & Heatmap Aggregations)<br/>• /api/admin (CMS Workflow & Analytics)"]
        Services["Core Services<br/>• Submission Service<br/>• Dashboard Service<br/>• Problem Service<br/>• Auth Service"]
        JudgeEngine["Judge Service Engine<br/>• Normalizer<br/>• Language Configs<br/>• Sandboxed Docker Runner"]
    end

    subgraph Data ["Data Tier"]
        Postgres[("PostgreSQL 16 Database<br/>Users, Problems, Submissions,<br/>Progress, Notes, Sheets, Badges")]
    end

    subgraph Sandbox ["Execution Tier (Ephemeral Containers)"]
        Docker["Host Docker Daemon"]
        C1["Ephemeral Python Runner<br/>--network none, tmpfs, cgroups"]
        C2["Ephemeral Node.js Runner<br/>--network none, tmpfs, cgroups"]
        C3["Ephemeral C++ Runner<br/>--network none, tmpfs, cgroups"]
        C4["Ephemeral Java Runner<br/>--network none, tmpfs, cgroups"]
    end

    SPA -->|HTTPS / JSON / Bearer JWT| Router
    Router --> Services
    Services -->|SQLAlchemy 2.0 ORM| Postgres
    Services --> JudgeEngine
    JudgeEngine -->|Docker Engine Socket| Docker
    Docker --> C1
    Docker --> C2
    Docker --> C3
    Docker --> C4
```

## Component Responsibilities

1. **Client Tier (React 18 SPA)**:
   - Delivers a rich, multi-panel coding workspace with Monaco Editor, KaTeX math parsing, tabbed problem context, and interactive diagnostics console.
   - Powers the candidate analytics dashboard with SVG GitHub-style streak heatmap and Recharts difficulty/performance graphs.
   - Provides a full-featured Admin CMS wizard for authoring problems, configuring language wrappers, testing sample inputs, and managing publication state.

2. **Application Tier (FastAPI REST API)**:
   - Handles stateless JWT authentication with role-based authorization (`user` vs `admin`) and instantaneous demo logins.
   - Computes query-time aggregations for heatmap activity, streaks, topic mastery, and leaderboard scores.
   - Orchestrates code evaluation against public and hidden test cases.

3. **Execution Tier (Judge Engine)**:
   - Injects user code into per-language execution harnesses.
   - Spawns isolated, resource-limited ephemeral containers with `--network none`, capped CPU/memory, and non-root user permissions.
   - Normalizes JSON test outputs, respecting order-independent matching and float tolerances.
