# Workspace Module

## Table of Contents

- [Overview](#overview)
- [Objectives](#objectives)
- [Workspace Model](#workspace-model)
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

The Workspace module is responsible for managing user workspaces and providing the ownership boundary for resources within the Social Automation Platform.

The platform follows a **multiple workspaces per user** model.

The module **does not support**:

- Workspace members
- Invitations
- Roles
- Permissions
- Team management

A workspace acts as the parent resource for platform features such as:

- Social Accounts
- Assets
- Content
- Scheduling
- Executions
- Analytics

---

## Objectives

The main objectives of this module are:

- Create workspaces for the authenticated user.
- List all workspaces owned by the authenticated user.
- Retrieve a specific workspace by ID.
- Manage workspace information.
- Update workspace settings.
- Delete a workspace.
- Establish workspace ownership for future resources.

---

## Workspace Model

A workspace belongs to an authenticated user. A user can own multiple workspaces.

### Relationship

```text
User
  |
  | 1 : N
  v
Workspace
```

### Workspace Hierarchy

Each workspace will act as the ownership boundary for future modules.

```text
Workspace
  |
  +---- Social Accounts
  |
  +---- Assets
  |
  +---- Content
  |
  +---- Scheduler
  |
  +---- Executions
  |
  +---- Analytics
```

### Workspace Ownership

Every workspace has one owner.

The owner is determined from the authenticated user.

The client must **never** provide the `ownerId`.

#### Ownership Flow

```text
Authenticated User
        |
        v
Authentication Guard
        |
        v
User ID
        |
        v
Workspace.ownerId
```

All workspace operations must verify that the workspace belongs to the authenticated user.

---

## API Endpoints

### Create Workspace

```http
POST /workspace
```

Creates a workspace for the authenticated user.

**Request Body:**

| Field    | Type   | Required | Description          |
| -------- | ------ | -------- | -------------------- |
| `name`   | string | Yes      | Workspace name       |
| `slug`   | string | No       | URL-friendly slug    |
| `logo`   | string | No       | Workspace logo URL   |

**Response:**

- `201 Created` — Workspace created successfully.
- `409 Conflict` — Workspace with the same slug already exists.

---

### List Workspaces

```http
GET /workspace
```

Returns all workspaces owned by the authenticated user.

**Response:**

- `200 OK` — Returns an array of workspaces.

---

### Get Workspace

```http
GET /workspace/:id
```

Returns a specific workspace by ID.

**Path Parameters:**

| Parameter | Type   | Description    |
| --------- | ------ | -------------- |
| `id`      | string | Workspace ID   |

**Response:**

- `200 OK` — Returns the workspace.
- `404 Not Found` — Workspace not found.
- `403 Forbidden` — User does not own this workspace.

---

### Update Workspace

```http
PATCH /workspace/:id
```

Updates a workspace owned by the authenticated user.

**Path Parameters:**

| Parameter | Type   | Description    |
| --------- | ------ | -------------- |
| `id`      | string | Workspace ID   |

**Request Body:**

| Field    | Type   | Required | Description          |
| -------- | ------ | -------- | -------------------- |
| `name`   | string | No       | Workspace name       |
| `slug`   | string | No       | URL-friendly slug    |
| `logo`   | string | No       | Workspace logo URL   |

Only fields provided in the request should be updated.

**Response:**

- `200 OK` — Workspace updated successfully.
- `404 Not Found` — Workspace not found.
- `403 Forbidden` — User does not own this workspace.
- `409 Conflict` — Slug already in use by another workspace.

---

### Delete Workspace

```http
DELETE /workspace/:id
```

Deletes a workspace owned by the authenticated user.

**Path Parameters:**

| Parameter | Type   | Description    |
| --------- | ------ | -------------- |
| `id`      | string | Workspace ID   |

**Response:**

- `200 OK` — Workspace deleted successfully.
- `404 Not Found` — Workspace not found.
- `403 Forbidden` — User does not own this workspace.

---

## Architecture

```text
                    Authenticated User
                           |
                           v
                    Workspace Module
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

---

## Module Responsibilities

### Workspace Controller

Responsible for:

- Handling workspace HTTP requests.
- Validating request data.
- Applying authentication guards.
- Calling the Workspace Service.
- Returning API responses.

### Workspace Service

Responsible for:

- Workspace creation.
- Workspace listing.
- Workspace retrieval.
- Workspace updates.
- Workspace deletion.
- Workspace ownership validation.
- Workspace business rules.

### Workspace DAO

Responsible for:

- Creating workspace records.
- Finding workspace by owner.
- Finding workspace by ID.
- Listing all workspaces by owner.
- Updating workspace records.
- Deleting workspace records.

> The DAO should only handle database operations and should not contain business logic.

---

## Flows

### Workspace Creation Flow

```text
User
  |
  v
POST /workspace
  |
  v
Authentication Guard
  |
  v
Get Authenticated User ID
  |
  v
Validate Input
  |
  v
Check Slug Uniqueness
  |
  v
Slug Exists?
  |
  +---- Yes → 409 Conflict
  |
  +---- No
         |
         v
  Create Workspace
         |
         v
  Set ownerId
         |
         v
  Return Workspace
```

### Workspace Listing Flow

```text
User
  |
  v
GET /workspace
  |
  v
Authentication Guard
  |
  v
Get Authenticated User ID
  |
  v
Find All Workspaces By Owner ID
  |
  v
Return Workspaces Array
```

### Workspace Retrieval Flow

```text
User
  |
  v
GET /workspace/:id
  |
  v
Authentication Guard
  |
  v
Get Authenticated User ID
  |
  v
Find Workspace By ID
  |
  v
Workspace Exists?
  |
  +---- No → 404 Not Found
  |
  +---- Yes
         |
         v
  Validate Ownership
         |
         v
  Owner Matches?
         |
         +---- No → 403 Forbidden
         |
         +---- Yes
                |
                v
         Return Workspace
```

### Workspace Update Flow

```text
User
  |
  v
PATCH /workspace/:id
  |
  v
Authentication Guard
  |
  v
Get Authenticated User ID
  |
  v
Validate Input
  |
  v
Find Workspace By ID
  |
  v
Workspace Exists?
  |
  +---- No → 404 Not Found
  |
  +---- Yes
         |
         v
  Validate Ownership
         |
         v
  Owner Matches?
         |
         +---- No → 403 Forbidden
         |
         +---- Yes
                |
                v
  Slug Changed?
         |
         +---- Yes → Check Slug Uniqueness
         |               |
         |               +---- Exists → 409 Conflict
         |               |
         |               +---- Not Exists → Proceed
         |
         +---- No → Proceed
                |
                v
         Update Workspace
                |
                v
         Return Workspace
```

### Workspace Deletion Flow

```text
User
  |
  v
DELETE /workspace/:id
  |
  v
Authentication Guard
  |
  v
Get Authenticated User ID
  |
  v
Find Workspace By ID
  |
  v
Workspace Exists?
  |
  +---- No → 404 Not Found
  |
  +---- Yes
         |
         v
  Validate Ownership
         |
         v
  Owner Matches?
         |
         +---- No → 403 Forbidden
         |
         +---- Yes
                |
                v
  Delete Workspace
         |
         v
  Return Success
```

---

## Security

### Authentication

All workspace endpoints must require authentication.

### Ownership Validation

A user must only be able to access their own workspaces.

```text
User A
  |
  v
Workspace A ✅

User B
  |
  v
Workspace A ❌
```

### Client Trust

The client must **never** be trusted to determine workspace ownership.

Do **not** accept:

```json
{
  "ownerId": "..."
}
```

The owner must always be derived from the authenticated user.

### Workspace Limit (Optional)

To prevent abuse, consider implementing:

- Maximum workspaces per user limit.
- Rate limiting on workspace creation.

---

## V1 Scope

### Included

- [x] Workspace creation
- [x] Workspace listing
- [x] Workspace retrieval by ID
- [x] Workspace update
- [x] Workspace deletion
- [x] Ownership validation
- [x] Workspace settings (name, slug, logo)
- [x] Multiple workspaces per user

### Not Included

- [ ] Workspace members
- [ ] Invitations
- [ ] Roles
- [ ] Permissions
- [ ] Team management
- [ ] Organization management
- [ ] Workspace-level billing
- [ ] Workspace audit logs

---

## Folder Structure

```text
workspace/
├── controllers/
│   └── workspace.controller.ts
│
├── services/
│   └── workspace.service.ts
│
├── daos/
│   └── workspace.dao.ts
│
├── dto/
│   ├── create-workspace.dto.ts
│   └── update-workspace.dto.ts
│
├── validators/
│   └── workspace.validator.ts
│
└── workspace.module.ts
```

---

## Future Improvements

- Workspace members
- Invitations
- Role-based access control
- Workspace permissions
- Workspace audit logs
- Workspace-level billing
- Team management
- Workspace switching UI
- Organization management
- Workspace cloning
- Workspace templates
