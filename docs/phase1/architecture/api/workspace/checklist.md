# Workspace Module Checklist

## Implementation Checklist

### Database

- [ ] Create `workspace` table in Prisma schema
- [ ] Define fields: `id`, `name`, `slug`, `logo`, `ownerId`, `createdAt`, `updatedAt`
- [ ] Set `ownerId` as foreign key to `User` table
- [ ] Add unique constraint on `slug` per owner
- [ ] Run database migration

---

### DTOs & Validators

- [ ] Create `create-workspace.dto.ts`
  - [ ] `name` field (required, string)
  - [ ] `slug` field (optional, string)
  - [ ] `logo` field (optional, string)
- [ ] Create `update-workspace.dto.ts`
  - [ ] `name` field (optional, string)
  - [ ] `slug` field (optional, string)
  - [ ] `logo` field (optional, string)
- [ ] Create `workspace.validator.ts`
  - [ ] Validate `name` is not empty
  - [ ] Validate `slug` format (URL-friendly)
  - [ ] Validate `logo` is a valid URL if provided

---

### DAO Layer

- [ ] Create `workspace.dao.ts`
- [ ] Implement `create(data)` — Create new workspace
- [ ] Implement `findByOwnerId(ownerId)` — Find all workspaces by owner
- [ ] Implement `findById(id)` — Find workspace by ID
- [ ] Implement `findBySlugAndOwnerId(slug, ownerId)` — Check slug uniqueness
- [ ] Implement `update(id, data)` — Update workspace
- [ ] Implement `delete(id)` — Delete workspace

---

### Service Layer

- [ ] Create `workspace.service.ts`
- [ ] Implement `createWorkspace(userId, dto)`
  - [ ] Check slug uniqueness per owner
  - [ ] Set `ownerId` from authenticated user
  - [ ] Return created workspace
- [ ] Implement `listWorkspaces(userId)`
  - [ ] Return all workspaces for authenticated user
- [ ] Implement `getWorkspace(userId, workspaceId)`
  - [ ] Find workspace by ID
  - [ ] Validate ownership
  - [ ] Return workspace or throw error
- [ ] Implement `updateWorkspace(userId, workspaceId, dto)`
  - [ ] Find workspace by ID
  - [ ] Validate ownership
  - [ ] Check slug uniqueness if slug changed
  - [ ] Update workspace
  - [ ] Return updated workspace
- [ ] Implement `deleteWorkspace(userId, workspaceId)`
  - [ ] Find workspace by ID
  - [ ] Validate ownership
  - [ ] Delete workspace
  - [ ] Return success

---

### Controller Layer

- [ ] Create `workspace.controller.ts`
- [ ] Implement `POST /workspace` — Create workspace
- [ ] Implement `GET /workspace` — List workspaces
- [ ] Implement `GET /workspace/:id` — Get workspace
- [ ] Implement `PATCH /workspace/:id` — Update workspace
- [ ] Implement `DELETE /workspace/:id` — Delete workspace
- [ ] Apply authentication guard to all endpoints
- [ ] Return proper HTTP status codes

---

### Module Setup

- [ ] Create `workspace.module.ts`
- [ ] Register controller, service, DAO
- [ ] Import Prisma module
- [ ] Register module in app module

---

### Error Handling

- [ ] `404 Not Found` — Workspace not found
- [ ] `403 Forbidden` — User does not own workspace
- [ ] `409 Conflict` — Slug already exists
- [ ] `400 Bad Request` — Invalid input data
- [ ] `401 Unauthorized` — User not authenticated

---

### Testing

- [ ] Unit tests for DAO
- [ ] Unit tests for Service
- [ ] Unit tests for Controller
- [ ] Integration tests for API endpoints
- [ ] Test workspace creation flow
- [ ] Test workspace listing flow
- [ ] Test workspace retrieval flow
- [ ] Test workspace update flow
- [ ] Test workspace deletion flow
- [ ] Test ownership validation
- [ ] Test slug uniqueness validation
- [ ] Test authentication guard

---

## Status

| Section          | Status      |
| ---------------- | ----------- |
| Database         | Pending     |
| DTOs & Validators| Pending     |
| DAO Layer        | Pending     |
| Service Layer    | Pending     |
| Controller Layer | Pending     |
| Module Setup     | Pending     |
| Error Handling   | Pending     |
| Testing          | Pending     |
