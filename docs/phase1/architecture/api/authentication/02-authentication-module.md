# Authentication Module

## Overview

The Authentication module is responsible for user identity verification, session management, and securing access to the Social Automation Platform.

The module supports multiple authentication methods:

- Email & Password
- Google OAuth
- GitHub OAuth

The Authentication module provides a unified authentication layer for all clients:

- Dashboard
- CLI
- MCP

---

# Objectives

The main objectives of this module are:

- Secure user authentication.
- Manage user sessions.
- Generate and validate access tokens.
- Support OAuth authentication.
- Protect platform resources.
- Provide authentication support for multiple clients.

---

# Authentication Methods

## Email & Password

Users can register and authenticate using their email address and password.

Flow:

```text
User

↓

Register

↓

Hash Password

↓

Store User

↓

Login

↓

Verify Password

↓

Generate Tokens
```

---

## Google OAuth

Users can authenticate using their Google account.

Flow:

```text
User

↓

Google Login

↓

OAuth Callback

↓

Verify User Identity

↓

Create / Find User

↓

Create Session

↓

Return Tokens
```

---

## GitHub OAuth

Users can authenticate using their GitHub account.

Flow:

```text
User

↓

GitHub Login

↓

OAuth Callback

↓

Verify User Identity

↓

Create / Find User

↓

Create Session

↓

Return Tokens
```

---

# Architecture

```text
                 Dashboard
                     |
                     |
              CLI / MCP Clients
                     |
                     |
                     v

              NestJS API Server

                     |

              Authentication Module

        +------------+-------------+
        |            |             |
        v            v             v

   Auth Service  OAuth Service  Token Service

        |
        |
        v

      Prisma

        |
        |
        v

   PostgreSQL Database
```

---

# Module Responsibilities

## Auth Service

Responsible for:

- User registration
- Email login
- Credential validation
- User lookup

---

## OAuth Service

Responsible for:

- Google authentication
- GitHub authentication
- OAuth callbacks
- Provider account linking

---

## Token Service

Responsible for:

- Access token generation
- Refresh token generation
- Token validation
- Token rotation

---

## Session Service

Responsible for:

- Creating sessions
- Validating sessions
- Revoking sessions
- Managing refresh tokens

---

# Database Models

## User

Stores basic user information.

```text
User

id
email
name
avatar
createdAt
updatedAt
```

---

## Account

Stores authentication provider information.

A user can have multiple authentication providers.

Example:

```text
User

 |
 +---- Email
 |
 +---- Google
 |
 +---- GitHub
```

Schema:

```text
Account

id

userId

provider
providerAccountId

accessToken
refreshToken

createdAt
updatedAt
```

Provider values:

```text
EMAIL
GOOGLE
GITHUB
```

---

## Session

Stores active authentication sessions.

Schema:

```text
Session

id

userId

refreshToken

expiresAt

createdAt
updatedAt
```

---

# Token Strategy

## Access Token

Purpose:

Used for authenticated API requests.

Properties:

- JWT based
- Short expiry
- Sent using Authorization header


Example:

```http
Authorization: Bearer <access_token>
```

---

## Refresh Token

Purpose:

Generate new access tokens.

Properties:

- Long expiry
- Stored securely
- Revocable
- Rotated after usage

---

# Client Authentication

## Dashboard

Authentication method:

```text
HTTP Only Cookie
```

Flow:

```text
Browser

↓

Login

↓

Receive Cookie

↓

Send Requests

↓

API validates Session
```

---

## CLI

Authentication method:

```text
Access Token + Refresh Token
```

Flow:

```text
CLI

↓

Login

↓

Store Token Locally

↓

Send API Requests
```

---

## MCP

Authentication method:

```text
Access Token
```

Flow:

```text
MCP

↓

Authenticate

↓

Call API
```

---

# API Endpoints

## Register User

```
POST /auth/register
```

Creates a new user account.

---

## Login

```
POST /auth/login
```

Authenticates user using email and password.

---

## Logout

```
POST /auth/logout
```

Invalidates current session.

---

## Refresh Token

```
POST /auth/refresh
```

Creates a new access token.

---

## Current User

```
GET /auth/me
```

Returns authenticated user details.

---

## Google OAuth

```
GET /auth/google
```

Starts Google authentication flow.


```
GET /auth/google/callback
```

Handles Google OAuth callback.

---

## GitHub OAuth

```
GET /auth/github
```

Starts GitHub authentication flow.


```
GET /auth/github/callback
```

Handles GitHub OAuth callback.

---

# Security

## Password Security

- Use Argon2 hashing.
- Never store plain passwords.
- Validate password strength.

---

## Token Security

- Short-lived access tokens.
- Refresh token rotation.
- Token revocation support.
- Secure cookie storage.

---

## OAuth Security

- Validate OAuth responses.
- Store only required provider data.
- Protect callback endpoints.

---

# Folder Structure

```text
authentication/

├── controllers/
│   └── auth.controller.ts
│
├── services/
│   ├── auth.service.ts
│   ├── token.service.ts
│   ├── session.service.ts
│   └── oauth.service.ts
│
├── strategies/
│   ├── google.strategy.ts
│   └── github.strategy.ts
│
├── guards/
│   └── auth.guard.ts
│
├── dto/
│   ├── login.dto.ts
│   └── register.dto.ts
│
└── auth.module.ts
```

---

# Future Improvements

- Two-factor authentication
- API Keys
- Passkeys
- Magic links
- Enterprise SSO
- Organization invitations

---

