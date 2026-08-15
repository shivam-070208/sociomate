# API URL & Naming Conventions

## Purpose

Defines the URL routing and naming conventions every API module must follow in the Social Automation Platform.

All modules must comply with these conventions so routes stay consistent, predictable, and lowercased.

---

## Route Convention

Every resource URL must be **lowercase**.

Path parameters must follow the `referencekey/:referencekey` pattern.

### Pattern

```text
POST /<resource>/<referencekey>/:<referencekey>
```

Where:

- `<resource>` — the resource collection name, lowercase.
- `<referencekey>` — the identifying field name, lowercase.
- `:<referencekey>` — the dynamic path parameter, named after the field it matches.

### Examples

```text
POST   /workspace
GET    /workspace/workspaceslug/:workspaceslug
PATCH  /workspace/workspaceslug/:workspaceslug
DELETE /workspace/workspaceslug/:workspaceslug

GET    /workspace/workspaceslug/:workspaceslug/social-account
POST   /workspace/workspaceslug/:workspaceslug/social-account/connect
GET    /workspace/workspaceslug/:workspaceslug/social-account/socialaccountid/:socialaccountid
```

---

## Rules

### 1. All URLs Must Be Lowercase

- Resource names, path segments, and parameter values must be lowercase.
- No camelCase, PascalCase, or mixed-case segments.

### 2. Path Parameters Use Referencekey Naming

Name the path parameter after the field it matches:

- `workspaceId` → `:workspaceid`
- `socialAccountId` → `:socialaccountid`
- `slug` → keep the slug param name for the field (`workplaceslug` for workspace slug)

Follow the DB field name, lowercased, as the dynamic segment.

### 3. Nested Resources Are Scoped Under Their Parent

Child resources are nested under their owning parent reference.

Example: Social Accounts belong to a Workspace, so routes are scoped under the workspace slug.

```text
/workspace/workspaceslug/:workspaceslug/social-account/...
```

### 4. Resource Naming

- Collection endpoints use the resource name in lowercase singular form for the module path segment.
- The controller base path should match the resource.
- HTTP verbs (`POST`, `GET`, `PATCH`, `DELETE`) define the operation.

---

## Controller Example

```ts
@Controller("workspace")
export class WorkspaceController {
  @Post()
  public async createWorkspace(@Body() dto: CreateWorkspaceDto) {}

  @Get("workspaceslug/:workspaceslug")
  public async getWorkspace(@Param("workspaceslug") workspaceslug: string) {}

  @Patch("workspaceslug/:workspaceslug")
  public async updateWorkspace(
    @Param("workspaceslug") workspaceslug: string,
    @Body() dto: UpdateWorkspaceDto,
  ) {}
}
```

---

## Checklist for New Modules

- [ ] All URLs are lowercase.
- [ ] Path params follow `referencekey/:referencekey` naming.
- [ ] Nested resources are scoped under their parent reference.
- [ ] DTO fields use camelCase.
- [ ] Controller method names describe the action and resource.
- [ ] Service method names describe the action and domain.
- [ ] DAO method names describe the query and scope (see `session.dao.ts` / `user.dao.ts`).