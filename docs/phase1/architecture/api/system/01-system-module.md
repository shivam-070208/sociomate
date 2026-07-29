# System Module

## Overview

The System module provides operational and diagnostic capabilities for the platform. It exposes endpoints that allow developers, monitoring systems, orchestration platforms, and administrators to verify the application's health, monitor runtime information, inspect service availability, and retrieve build metadata.

Unlike business modules, the System module does not manage domain data or execute business logic. Instead, it focuses on improving the observability, reliability, and maintainability of the platform.

---

# Objectives

- Monitor application health.
- Verify service readiness.
- Support container orchestration.
- Expose runtime information.
- Provide application version details.
- Publish operational metrics.
- Assist developers during debugging.
- Enable monitoring and alerting systems.

---

# Responsibilities

The System module is responsible for:

- Health checks
- Readiness checks
- Liveness checks
- Runtime information
- Build information
- Version information
- Metrics
- Diagnostics

The module must never modify application data.

---

# Features

## Health Check

Returns the overall application health.

Checks:

- API status
- Database connectivity
- RabbitMQ connectivity
- Storage availability

---

## Readiness Check

Determines whether the application is ready to receive traffic.

Used by:

- Kubernetes
- Docker
- Load balancers

---

## Liveness Check

Determines whether the application process is alive.

Used to restart unhealthy containers automatically.

---

## Metrics

Provides operational metrics.

Examples:

- Uptime
- Request count
- Memory usage
- CPU usage
- Active SSE connections
- Queue statistics (Future)

---

## Version

Returns application metadata.

Examples:

- Version
- Build number
- Git commit hash
- Build timestamp

---

## Runtime

Provides runtime environment information.

Examples:

- Node.js version
- Operating system
- Architecture
- Timezone
- Environment

---

## Diagnostics

Provides additional debugging information for developers and operators.

Only available to authorized users.

---

# Architecture

```text
Client
   │
   ▼
REST API
   │
System Controller
   │
System Service
   │
───────────────
Health Service
Metrics Service
Info Service
```

---

# API Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | /system/health | Overall application health |
| GET | /system/ready | Readiness probe |
| GET | /system/live | Liveness probe |
| GET | /system/metrics | Runtime metrics |
| GET | /system/version | Version information |
| GET | /system/runtime | Runtime information |
| GET | /system/diagnostics | Diagnostic information |

---

# Request Flow

```text
Client
   │
   ▼
Controller
   │
   ▼
System Service
   │
   ▼
Required Checks
   │
   ▼
Response
```

---

# Security

| Endpoint | Authentication |
|----------|----------------|
| /health | Public |
| /ready | Public |
| /live | Public |
| /version | Public |
| /metrics | Admin |
| /runtime | Admin |
| /diagnostics | Admin |

---

# Error Handling

The module should never expose internal exceptions.

Standard response format:

```json
{
  "success": false,
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "RabbitMQ is unavailable."
  }
}
```

---

# Folder Structure

```text
system/

├── controllers/
├── services/
├── dto/
├── interfaces/
├── constants/
├── system.module.ts
└── index.ts
```

---

# Future Improvements

- Prometheus integration
- OpenTelemetry integration
- Distributed tracing
- Health history
- Queue monitoring
- Database performance metrics
- Cache metrics
- API rate statistics
- Build metadata endpoint