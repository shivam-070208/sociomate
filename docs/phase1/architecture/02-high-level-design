# High-Level Design (HLD)

## Overview

The Social Agent platform follows a modular, event-driven architecture designed for scalability, maintainability, and extensibility. The system separates request handling from execution by introducing a dedicated worker service responsible for asynchronous operations.

The platform exposes a unified API that is consumed by multiple clients including the Dashboard, CLI, and MCP server. All long-running operations are executed asynchronously through RabbitMQ and monitored in real time using Server-Sent Events (SSE).

---

# Architectural Goals

* Build a scalable event-driven platform.
* Keep request handling and execution independent.
* Support multiple client interfaces.
* Enable reusable provider integrations.
* Provide real-time execution visibility.
* Design for future extensibility without architectural changes.

---

# High-Level Architecture

```text
                                Users
                                  │
          ┌───────────────────────┼────────────────────────┐
          │                       │                        │
          ▼                       ▼                        ▼
   Dashboard (Next.js)        CLI (Go)               MCP Server (Go)
          │                       │                        │
          └───────────────────────┼────────────────────────┘
                                  │
                           REST API (NestJS)
                                  │
          ┌──────────────┬─────────┴──────────┬─────────────┐
          │              │                    │             │
          ▼              ▼                    ▼             ▼
    PostgreSQL      RabbitMQ              SSE Stream     Asset Storage
          │              │
          │              ▼
          │       Worker (NestJS)
          │              │
          └──────────────┼───────────────────────────┐
                         ▼                           ▼
                    X Provider              Instagram Provider
```

---

# Component Responsibilities

## Dashboard

Provides a graphical interface for:

* Account management
* Asset management
* Workflow management
* Execution monitoring
* Analytics
* Platform settings

The dashboard communicates exclusively with the REST API and receives live updates through SSE.

---

## CLI

The CLI enables developers and power users to interact with the platform directly from the terminal.

Capabilities include:

* Authentication
* Asset management
* Workflow execution
* Execution monitoring
* Provider management

The CLI communicates with the REST API and subscribes to execution events through SSE.

---

## MCP Server

The MCP server exposes the platform as AI tools compatible with MCP-enabled clients.

Responsibilities:

* Tool execution
* Resource exposure
* Prompt execution
* API communication

The MCP server never communicates directly with providers.

---

## API

The API acts as the orchestration layer.

Responsibilities:

* Authentication & Authorization
* Workspace management
* Business validation
* Asset management
* Execution creation
* Job publishing
* Provider management
* SSE streaming
* REST endpoints

The API does not execute long-running operations.

---

## Worker

The Worker executes asynchronous tasks.

Responsibilities:

* Consume RabbitMQ jobs
* Execute workflows
* Call provider APIs
* Update execution status
* Emit execution events
* Handle retries and failures

The Worker does not expose REST endpoints.

---

## RabbitMQ

RabbitMQ enables asynchronous communication between the API and Worker.

Primary responsibilities:

* Job distribution
* Event propagation
* Decoupling services
* Reliable message delivery

---

## PostgreSQL

Acts as the primary source of truth.

Stores:

* Users
* Workspaces
* Social Accounts
* Assets
* Executions
* Execution Steps
* Workflows
* Skills
* Audit Logs

---

## Provider Layer

Each social platform is implemented independently behind a common provider abstraction.

Phase 1 providers:

* X
* Instagram
* Whatsapp
* Telegram

Future providers:

* LinkedIn
* Threads
* Facebook
* Bluesky
* Reddit

---

# Communication Flow

## Request Flow

```
Client

↓

REST API

↓

Validation

↓

Create Execution

↓

Publish RabbitMQ Job

↓

Return Execution ID
```

---

## Execution Flow

```
Worker

↓

Consume Job

↓

Execute Steps

↓

Update Database

↓

Emit Events

↓

Execution Completed
```

---

## Realtime Flow

```
Worker

↓

Execution Event

↓

RabbitMQ

↓

API

↓

SSE

↓

Client
```

---

# Architectural Principles

* API accepts requests but never performs long-running work.
* Worker performs all asynchronous execution.
* PostgreSQL is the system of record.
* RabbitMQ is responsible for asynchronous messaging.
* SSE provides real-time execution updates.
* Every automation is represented as an Execution.
* Every provider implements a common abstraction.
* Clients never communicate directly with external providers.

---

# Design Decisions

| Decision         | Reason                                       |
| ---------------- | -------------------------------------------- |
| Monorepo         | Centralized development and shared packages  |
| NestJS           | Modular backend architecture                 |
| Go               | High-performance CLI and MCP server          |
| RabbitMQ         | Reliable asynchronous messaging              |
| PostgreSQL       | Strong consistency and relational data model |
| SSE              | Lightweight real-time updates                |
| Provider Pattern | Platform-independent integrations            |
| Execution Engine | Unified automation lifecycle                 |

---

# Non-Functional Requirements

## Scalability

* Independent API and Worker scaling.
* Additional workers can be introduced without changing clients.
* Provider integrations remain isolated.

---

## Reliability

* Durable job processing.
* Persistent execution state.
* Retry support.
* Event-driven architecture.

---

## Extensibility

The architecture allows adding:

* New social platforms.
* AI providers.
* New workflows.
* Additional workers.
* Enterprise capabilities.

without major architectural changes.

---

# Future Architecture

The current architecture is intentionally modular and can evolve into independently scalable services, including dedicated workers for AI, analytics, notifications, scheduling, and provider synchronization while preserving the same public API and execution model.

