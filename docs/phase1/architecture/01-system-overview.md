# System Overview

## Introduction

**Social Agent** is an AI-powered social media automation platform designed to simplify how individuals, creators, and businesses manage their social media presence. The platform provides a unified interface to create, schedule, publish, and monitor content across multiple social media platforms through a web dashboard, command-line interface (CLI), and Model Context Protocol (MCP) server.

The platform follows an event-driven architecture where every long-running operation is treated as an **Execution**. Each execution is broken into multiple steps, tracked in real time, and streamed back to clients, providing complete visibility into the automation lifecycle.

---

# Vision

To build a developer-first and AI-native platform that enables users and AI assistants to automate social media workflows through a single, extensible system.

---

# Goals

* Provide a unified platform for managing multiple social media providers.
* Support multiple interaction methods including Dashboard, CLI, and MCP.
* Execute long-running automations asynchronously.
* Track every execution with detailed progress, logs, and events.
* Support reusable workflows and skills.
* Build a provider-agnostic architecture that can easily integrate additional platforms.
* Maintain a scalable and modular architecture suitable for future enterprise features.

---

# Supported Platforms (Phase 1)

* X (Twitter)
* Instagram

Future platforms:

* LinkedIn
* Threads
* Facebook
* Bluesky
* Reddit
* YouTube
* Discord
* Slack

---

# Primary Clients

## Dashboard

A web application for managing workspaces, connected accounts, executions, assets, analytics, workflows, and platform settings.

---

## CLI

A developer-focused command-line application for interacting with the platform, triggering workflows, managing assets, monitoring executions, and performing automation directly from the terminal.

---

## MCP Server

A Model Context Protocol server that exposes platform capabilities as AI tools, allowing compatible AI assistants to interact with the platform using natural language.

---

# Core Components

## API

The API is the central entry point of the platform. It is responsible for authentication, authorization, business logic, execution creation, workspace management, provider management, and exposing REST APIs to all clients.

---

## Worker

The Worker is responsible for executing long-running operations. It consumes jobs from RabbitMQ, performs automation tasks, communicates with external providers, updates execution state, and emits execution events.

---

## PostgreSQL

Stores all persistent application data including users, workspaces, connected accounts, executions, execution steps, assets, workflows, and configuration.

---

## RabbitMQ

Acts as the event bus between services and enables asynchronous processing of long-running tasks.

---

## Server-Sent Events (SSE)

Provides real-time execution progress to connected clients, allowing dashboards and CLI sessions to monitor execution status without polling.

---

# Core Domain

The platform revolves around a single concept:

> **Everything is an Execution.**

Examples include:

* Publishing a post
* Running a workflow
* Synchronizing a social account
* Refreshing access tokens
* Importing media
* Generating AI content
* Cross-posting content

Each execution consists of multiple ordered steps, where every step produces events, logs, outputs, and execution history.

---

# High-Level Architecture

```text
                    User
                      │
      ┌───────────────┼───────────────┐
      │               │               │
 Dashboard          CLI             MCP
 (Next.js)          (Go)            (Go)
      │               │               │
      └───────────────┼───────────────┘
                      │
                 REST API
                 (NestJS)
                      │
          ┌───────────┼───────────┐
          │           │           │
     PostgreSQL   RabbitMQ      SSE
          │           │           │
          │           ▼           │
          │      Worker (NestJS)  │
          │           │           │
          └───────────┼───────────┘
                      │
          X API   Instagram API
```

---

# Technology Stack

| Layer            | Technology                                  |
| ---------------- | ------------------------------------------- |
| Dashboard        | Next.js                                     |
| API              | NestJS                                      |
| Worker           | NestJS                                      |
| CLI              | Go                                          |
| MCP              | Go                                          |
| Database         | PostgreSQL                                  |
| Message Broker   | RabbitMQ                                    |
| Realtime         | Server-Sent Events (SSE)                    |
| Monorepo         | Turborepo + Bun                             |
| Storage          | Local (Development), S3 Compatible (Future) |
| Containerization | Docker Compose                              |

---

# Guiding Principles

* API is responsible for accepting requests and enforcing business rules.
* Worker executes asynchronous and long-running tasks.
* Every automation is represented as an Execution.
* Every execution is composed of ordered execution steps.
* All long-running operations communicate through RabbitMQ.
* Real-time progress is streamed using Server-Sent Events.
* Social platforms are integrated through provider abstractions.
* Dashboard, CLI, and MCP are equal clients of the same platform.
* The architecture is designed to support future providers and AI capabilities without major structural changes.

