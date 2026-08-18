# Future Scaling Roadmap & Phase 2 Architecture — Code Arena

This document outlines the architectural upgrade path from synchronous MVP execution to a distributed, horizontally scalable platform, alongside the Phase 2 AI features layer.

## Distributed Judge Queue Architecture

```mermaid
flowchart TD
    subgraph Client ["Client Tier"]
        Browser["React Client Workspace"]
    end

    subgraph API ["FastAPI Web Cluster"]
        API1["FastAPI API Instance 1"]
        API2["FastAPI API Instance 2"]
    end

    subgraph Broker ["Message Broker & State Cache"]
        Redis[("Redis / Valkey<br/>Task Queue + Pub/Sub + Rate Limiting")]
    end

    subgraph Workers ["Distributed Celery / Nomad Judge Worker Fleet"]
        W1["Judge Worker 1 (Host A)"]
        W2["Judge Worker 2 (Host A)"]
        W3["Judge Worker 3 (Host B)"]
    end

    subgraph AI ["Phase 2: AI Assistance Layer (Post-MVP)"]
        LLM["LLM Inference Gateway (Claude / Gemini)<br/>• Explain Wrong Answer<br/>• Better Complexity Suggestions<br/>• AI Hint Generation<br/>• Code Quality Review"]
    end

    Browser -->|POST /api/submissions/submit| API1
    Browser -->|WebSocket Subscriptions| API1
    API1 -->|Enqueues Task JSON| Redis
    Redis -->|Dispatches Job| W1
    Redis -->|Dispatches Job| W2
    Redis -->|Dispatches Job| W3
    W1 -->|Publishes Verdict Results| Redis
    Redis -->|Real-time Push Notification| API1
    API1 -->|WebSocket Result Event| Browser

    Browser -.->|Optional AI Inquiry| LLM
```

## Scaling Milestones

1. **Celery + Redis Asynchronous Task Queue**:
   - Replace synchronous judge runner invocations with Celery worker pool.
   - Enables horizontal scaling of judge workers across multiple cloud nodes without blocking FastAPI event loops.

2. **WebSocket Real-time Stream**:
   - Stream test-case-by-test-case execution progress (`Passed 14/25 cases...`) to candidate UI.

3. **Materialized View Caching for Leaderboard**:
   - Cache expensive leaderboard point calculations with hourly PostgreSQL materialized view refreshes.

4. **Phase 2 AI Assistant Layer (Post-MVP)**:
   - **Explain Wrong Answer**: Pinpoint divergence between code logic and failed test cases without spoiling full solutions.
   - **Complexity Optimization Suggestions**: Propose $O(n)$ data structures when $O(n^2)$ code is submitted.
   - **AI Hint Generator**: Scoped hints based on the candidate's partial attempt.
