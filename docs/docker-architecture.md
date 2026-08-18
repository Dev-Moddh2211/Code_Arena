# Docker Architecture & Sandbox Isolation — Code Arena

Code Arena utilizes lightweight, specialized container images to sandbox untrusted code execution.

## Docker Architecture

```mermaid
flowchart TD
    Host["Host OS (Linux / Ubuntu VPS)"] --> DockerDaemon["Docker Engine Service (/var/run/docker.sock)"]
    
    subgraph Images ["Pre-built Minimal Judge Base Images"]
        ImgPython["judge-python:latest<br/>(python:3.12-alpine, unprivileged user)"]
        ImgNode["judge-node:latest<br/>(node:20-alpine, unprivileged user)"]
        ImgCpp["judge-cpp:latest<br/>(alpine:3.19 + g++, unprivileged user)"]
        ImgJava["judge-java:latest<br/>(openjdk:17-alpine, unprivileged user)"]
    end

    DockerDaemon --> ImgPython
    DockerDaemon --> ImgNode
    DockerDaemon --> ImgCpp
    DockerDaemon --> ImgJava

    subgraph ContainerRuntime ["Ephemeral Container Invocation Security"]
        direction TB
        C1["Ephemeral Runner Instance<br/>Flags:<br/>--rm (auto-destroy on exit)<br/>--network none (no sockets / egress)<br/>--memory=256m --memory-swap=256m<br/>--cpus=1.0<br/>--pids-limit=64 (prevent fork bombs)<br/>--tmpfs /sandbox:rw,size=32m,noexec<br/>--user 1000:1000"]
    end

    ImgPython -.-> C1
```

## Security Constraints Matrix

| Constraint | Enforcement Mechanism | Purpose |
|---|---|---|
| **Network Isolation** | `--network none` | Prevents data exfiltration, port scanning, and outbound network calls |
| **CPU Limit** | `--cpus 1.0` | Prevents CPU starvation on the host machine |
| **Memory Limit** | `--memory 256m --memory-swap 256m` | Prevents memory allocation attacks / OOM crashes |
| **Fork Bomb Protection** | `--pids-limit 64` | Restricts total spawned subprocess threads |
| **Non-Root Execution** | `--user 1000:1000` | Prevents privilege escalation |
| **Volatile Storage** | `--tmpfs /sandbox:rw,size=32m` | Zero disk persistence of user-written temporary binaries |
