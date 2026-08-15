# Social Accounts Module Checklist

## Implementation Checklist

### Database

- [ ] Create `social_account` table in Prisma schema
- [ ] Define fields: `id`, `workspaceId`, `provider`, `providerAccountId`, `username`, `displayName`, `accessToken`, `refreshToken`, `tokenExpiresAt`, `status`, `createdAt`, `updatedAt`
- [ ] Set `workspaceId` as foreign key to `Workspace` table
- [ ] Add unique constraint on `providerAccountId` per provider
- [ ] Encode account `status` as enum: `ACTIVE`, `EXPIRED`, `REVOKED`, `DISCONNECTED`
- [ ] Run database migration

---

### DTOs & Validators

- [ ] Create `connect-social-account.dto.ts`
  - [ ] `provider` field (required, enum of supported providers)
- [ ] Create `update-social-account.dto.ts`
  - [ ] `username` field (optional, string)
  - [ ] `displayName` field (optional, string)

---

### DAO Layer

- [ ] Create `social-account.dao.ts`
- [ ] Implement `create(data)` — Create new social account
- [ ] Implement `findById(id)` — Find social account by ID
- [ ] Implement `findByWorkspaceId(workspaceId)` — List accounts for workspace
- [ ] Implement `findByProviderAccount(workspaceId, provider, providerAccountId)` — Check existing connection
- [ ] Implement `update(id, data)` — Update social account
- [ ] Implement `delete(id)` — Delete social account

---

### Service Layer

- [ ] Create `social-account.service.ts`
- [ ] Implement `connect(workspaceId, dto)`
  - [ ] Resolve provider service
  - [ ] Return existing connection if already connected
  - [ ] Store account and credentials securely
- [ ] Implement `listAccounts(workspaceId)`
  - [ ] Return all social accounts for the workspace
  - [ ] Never return sensitive credentials
- [ ] Implement `getAccount(workspaceId, accountId)`
  - [ ] Find account by ID
  - [ ] Validate workspace ownership
  - [ ] Sanitize credentials from response
- [ ] Implement `disconnect(workspaceId, accountId)`
  - [ ] Find account by ID
  - [ ] Validate workspace ownership
  - [ ] Revoke provider credentials where supported
  - [ ] Delete account
- [ ] Implement `refresh(workspaceId, accountId)`
  - [ ] Find account by ID
  - [ ] Validate workspace ownership
  - [ ] Refresh provider credentials
  - [ ] Update `tokenExpiresAt`
  - [ ] Update account status

### Provider Services

- [ ] Create `instagram.service.ts`
  - [ ] OAuth authorization URL
  - [ ] Exchange authorization code
  - [ ] Get account information
  - [ ] Refresh token
  - [ ] Validate token
  - [ ] Disconnect / revoke
- [ ] Create `whatsapp.service.ts`
  - [ ] OAuth authorization URL
  - [ ] Exchange authorization code
  - [ ] Get account information
  - [ ] Refresh token
  - [ ] Validate token
  - [ ] Disconnect / revoke
- [ ] Create `telegram.service.ts`
  - [ ] OAuth authorization URL
  - [ ] Exchange authorization code
  - [ ] Get account information
  - [ ] Refresh token
  - [ ] Validate token
  - [ ] Disconnect / revoke

---

### Controller Layer

- [ ] Create `social-account.controller.ts`
- [ ] Implement `POST /social-accounts/connect` — Connect account
- [ ] Implement `GET /social-accounts/:provider/callback` — OAuth callback
- [ ] Implement `GET /social-accounts` — List accounts
- [ ] Implement `GET /social-accounts/:id` — Get account
- [ ] Implement `DELETE /social-accounts/:id` — Disconnect account
- [ ] Implement `POST /social-accounts/:id/refresh` — Refresh credentials
- [ ] Apply authentication guard to all endpoints
- [ ] Return proper HTTP status codes

---

### Module Setup

- [ ] Create `social-account.module.ts`
- [ ] Register controller, service, DAO
- [ ] Register provider services
- [ ] Import Prisma module
- [ ] Register module in app module

---

### Error Handling

- [ ] `404 Not Found` — Social account not found
- [ ] `403 Forbidden` — User does not own the owning workspace
- [ ] `400 Bad Request` — Invalid input data or unsupported provider
- [ ] `401 Unauthorized` — User not authenticated

---

### Security

- [ ] Store credentials securely (access token, refresh token)
- [ ] Never return credentials to the client
- [ ] Validate workspace ownership on every operation
- [ ] Use OAuth `state` to protect against CSRF
- [ ] Track token expiration and refresh before operations

---

### Testing

- [ ] Unit tests for DAO
- [ ] Unit tests for Service
- [ ] Unit tests for Controller
- [ ] Unit tests for each Provider Service
- [ ] Integration tests for API endpoints
- [ ] Test connect flow
- [ ] Test OAuth callback flow
- [ ] Test list accounts flow
- [ ] Test get account flow
- [ ] Test disconnect flow
- [ ] Test refresh flow
- [ ] Test workspace ownership validation
- [ ] Test credential sanitization
- [ ] Test authentication guard

---

## Status

| Section          | Status      |
| ---------------- | ----------- |
| Database         | Pending     |
| DTOs & Validators| Pending     |
| DAO Layer        | Pending     |
| Service Layer    | Pending     |
| Provider Services| Pending     |
| Controller Layer | Pending     |
| Module Setup     | Pending     |
| Error Handling   | Pending     |
| Security         | Pending     |
| Testing          | Pending     |