# Social Accounts Module

## Table of Contents

- [Overview](#overview)
- [Objectives](#objectives)
- [Supported Platforms](#supported-platforms)
- [Database Model](#database-model)
- [API Endpoints](#api-endpoints)
- [Architecture](#architecture)
- [Module Responsibilities](#module-responsibilities)
- [Flows](#flows)
- [Security](#security)
- [V1 Scope](#v1-scope)
- [Folder Structure](#folder-structure)
- [Future Improvements](#future-improvements)

---

## Overview

The Social Accounts module is responsible for connecting and managing external social media accounts inside a user's workspace.

It acts as the integration layer between the Social Automation Platform and external platforms.

The module manages:

- Connecting social accounts
- Storing provider account information
- Managing access credentials
- Refreshing expired credentials
- Disconnecting social accounts
- Checking connection status
- Retrieving connected accounts

For V1, social accounts belong to a workspace.

---

## Objectives

The main objectives of this module are:

- Connect external social platforms.
- Store connected account information.
- Securely manage provider credentials.
- Maintain account connection status.
- Support multiple social platforms.
- Provide a common abstraction for external platforms.
- Allow other modules to use connected accounts for publishing and automation.

---

## Supported Platforms

The architecture should support multiple providers.

Initial providers:

```text
INSTAGRAM
WHATSAPP
TELEGRAM
```

Future providers can be added without changing the core architecture:

```text
X
LINKEDIN
FACEBOOK
YOUTUBE
TIKTOK
```

---

## Database Model

A social account belongs to a workspace.

### Relationship

```text
Workspace

    |

    | 1 : N

    v

SocialAccount
```

Example:

```text
Workspace
    |
    +---- Instagram Account
    |
    +---- WhatsApp Account
    |
    +---- Telegram Account
```

### Social Account Information

The database should store information such as:

```text
SocialAccount

id

workspaceId

provider

providerAccountId

username

displayName

accessToken

refreshToken

tokenExpiresAt

status

createdAt

updatedAt
```

Provider-specific information should be stored only when required by that provider.

### Provider

The provider identifies which external platform the account belongs to.

Example:

```text
INSTAGRAM
WHATSAPP
TELEGRAM
```

This allows the application to determine which provider implementation should be used.

Example:

```text
provider = INSTAGRAM

        ↓

InstagramService
```

### Account Status

The connection status should indicate whether the account can currently be used.

Example values:

```text
ACTIVE
EXPIRED
REVOKED
DISCONNECTED
```

Flow:

```text
ACTIVE
  |
  | Token expires
  v
EXPIRED
  |
  | Refresh succeeds
  v
ACTIVE
```

If the provider revokes the credentials:

```text
ACTIVE
  |
  | Provider revokes access
  v
REVOKED
```

### Credential Management

Provider credentials must never be exposed to the frontend unnecessarily.

Sensitive information includes:

```text
Access Token
Refresh Token
Provider Secrets
```

These should be stored securely.

The frontend should receive only safe account information:

```json
{
  "id": "...",
  "provider": "INSTAGRAM",
  "username": "mybrand",
  "status": "ACTIVE"
}
```

---

## API Endpoints

### Connect Account

```http
POST /social-accounts/connect
```

Starts the connection flow for a social platform.

**Request Body:**

| Field      | Type   | Required | Description                |
| ---------- | ------ | -------- | -------------------------- |
| `provider` | string | Yes      | Provider to connect        |

**Response:**

- `201 Created` — Connection flow started.
- `400 Bad Request` — Unsupported provider.

---

### OAuth Callback

```http
GET /social-accounts/:provider/callback
```

Handles the provider OAuth callback where applicable.

**Response:**

- `200 OK` — Account connected successfully.
- `400 Bad Request` — Invalid or failed OAuth response.

---

### List Accounts

```http
GET /social-accounts
```

Returns all social accounts connected to the authenticated user's workspace.

**Response:**

- `200 OK` — Returns an array of social accounts.

---

### Get Account

```http
GET /social-accounts/:id
```

Returns information about a specific connected account.

**Path Parameters:**

| Parameter | Type   | Description    |
| --------- | ------ | -------------- |
| `id`      | string | Social account ID |

**Response:**

- `200 OK` — Returns the social account.
- `404 Not Found` — Social account not found.
- `403 Forbidden` — User does not own the owning workspace.

---

### Disconnect Account

```http
DELETE /social-accounts/:id
```

Disconnects a social account from the workspace.

Provider credentials should be revoked where supported.

**Path Parameters:**

| Parameter | Type   | Description    |
| --------- | ------ | -------------- |
| `id`      | string | Social account ID |

**Response:**

- `200 OK` — Social account disconnected successfully.
- `404 Not Found` — Social account not found.
- `403 Forbidden` — User does not own the owning workspace.

---

### Refresh Account

```http
POST /social-accounts/:id/refresh
```

Refreshes provider credentials when supported.

**Path Parameters:**

| Parameter | Type   | Description    |
| --------- | ------ | -------------- |
| `id`      | string | Social account ID |

**Response:**

- `200 OK` — Credentials refreshed successfully.
- `404 Not Found` — Social account not found.
- `403 Forbidden` — User does not own the owning workspace.

---

## Architecture

```text
                  Authenticated User
                         |
                         v
              Social Accounts Module
                         |
          +--------------+--------------+
          |              |              |
          v              v              v
     Controller       Service          DAO
          |              |              |
          +--------------+--------------+
                         |
                         v
                     Prisma
                         |
                         v
                   PostgreSQL
```

The Social Accounts module provides a common layer for managing different providers.

---

## Module Responsibilities

### Social Account Controller

Responsible for:

- Handling social account HTTP requests.
- Validating request data.
- Applying authentication guards.
- Calling the Social Account Service.
- Returning API responses.

### Social Account Service

Responsible for:

- Connecting social accounts.
- Disconnecting social accounts.
- Listing connected accounts.
- Retrieving account information.
- Checking connection status.
- Coordinating provider authentication.
- Managing provider credentials.

### Provider Services

Each external platform should have its own provider implementation.

Example:

```text
SocialAccountService
        |
        +---- InstagramService
        |
        +---- WhatsAppService
        |
        +---- TelegramService
```

Provider services are responsible for provider-specific operations.

For example:

```text
InstagramService

- OAuth
- Get Instagram Account
- Get Access Token
- Refresh Token
- Validate Token
- Disconnect
```

The core Social Account service should not contain provider-specific API logic.

### Social Account DAO

Responsible for:

- Creating social account records.
- Finding a social account by ID.
- Finding a social account by provider account.
- Listing all social accounts by workspace.
- Updating social account records.
- Deleting social account records.

> The DAO should only handle database operations and should not contain business logic.

---

## Flows

### Connect Account Flow

```text
User

↓

Select Platform

↓

POST /social-accounts/connect

↓

Generate Provider Authorization URL

↓

User Authorizes Provider

↓

Provider OAuth Callback

↓

Validate OAuth Response

↓

Exchange Authorization Code

↓

Get Provider Account Information

↓

Store Social Account

↓

Return Connected Account
```

### OAuth Flow

For OAuth-based platforms:

```text
Client

↓

API Server

↓

Provider Authorization

↓

OAuth Callback

↓

API Server

↓

Exchange Code For Token

↓

Fetch Provider Account

↓

Store Account + Credentials

↓

Return Success
```

The OAuth callback must never trust the provider account information without validating the OAuth response.

### Existing Account Handling

When connecting an account, check whether the provider account is already connected.

Example:

```text
Workspace
    |
    +---- Instagram @brand
```

Trying to connect the same provider account again should not create a duplicate record.

The system should either:

- Return the existing connection.
- Update the existing credentials.

### Account Isolation

A user must only be able to access social accounts belonging to their workspace.

Example:

```text
User A
   |
Workspace A
   |
Instagram A ✅


User B
   |
Workspace B
   |
Instagram A ❌
```

Every query should enforce workspace ownership.

### Provider Abstraction

The core module should avoid code such as:

```ts
if (provider === "INSTAGRAM") {
   // Instagram logic
}

if (provider === "WHATSAPP") {
   // WhatsApp logic
}
```

throughout the application.

Instead, use provider-specific services.

```text
SocialAccountService
        |
        v
Provider Resolver
        |
        +---- InstagramService
        +---- WhatsAppService
        +---- TelegramService
```

This makes adding a new provider easier.

---

## Security

### Authentication

All social account endpoints must require authentication.

### Token Storage

Access and refresh tokens must be treated as sensitive credentials.

Never return them directly to the client.

### Workspace Validation

Every social account operation must verify:

```text
socialAccount.workspaceId
        ==
authenticatedUser.workspaceId
```

### OAuth State

OAuth flows should use a state value to protect against CSRF attacks.

The state should be:

- Generated server-side.
- Short-lived.
- Validated during callback.

### Token Expiration

The system should track token expiration when the provider provides expiration information.

Before performing provider operations:

```text
Token valid?
   |
   +---- Yes → Continue
   |
   +---- No → Refresh
```

If refresh fails:

```text
Account Status = EXPIRED
```

---

## V1 Scope

### Included

- [x] Connect social account
- [x] OAuth integration where required
- [x] Store provider account information
- [x] Store provider credentials securely
- [x] List connected accounts
- [x] Get connected account
- [x] Disconnect account
- [x] Account status
- [x] Provider abstraction
- [x] Workspace ownership

### Not Included

- [ ] Publishing
- [ ] Scheduling
- [ ] Content management
- [ ] Analytics
- [ ] Automation rules
- [ ] Campaign management
- [ ] Team members
- [ ] Roles and permissions

Those will belong to other modules.

---

## Folder Structure

```text
src/
├── daos/
│   └── social-account.dao.ts
│
└── modules/
    └── social-account/
        ├── controllers/
        │   └── social-account.controller.ts
        │
        ├── services/
        │   ├── social-account.service.ts
        │   └── providers/
        │       ├── instagram.service.ts
        │       ├── whatsapp.service.ts
        │       └── telegram.service.ts
        │
        ├── dto/
        │   ├── connect-social-account.dto.ts
        │   └── update-social-account.dto.ts
        │
        └── social-account.module.ts
```

---

## Future Improvements

- Automatic token refresh
- Webhook management
- Provider health checks
- Connection monitoring
- Multiple accounts per provider
- Provider-specific capabilities
- Rate-limit tracking
- Provider API error handling
- Credential rotation
- Account synchronization

**Important architectural point:** keep this module focused on **connection and credential management**. Don't put publishing logic here. When we build publishing later, it should consume a `SocialAccount` and use the appropriate provider service.