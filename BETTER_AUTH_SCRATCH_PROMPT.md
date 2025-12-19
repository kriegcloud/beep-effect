# Better Auth Server Migration - Agent Orchestration Prompt

> **Purpose**: Orchestrate the migration of Better Auth from a Next.js catch-all route to Effect Platform's HttpApi system.
>
> **Source Route**: `apps/web/src/app/api/v1/auth/[...all]/route.ts`
> **Target Server**: `apps/server/src/server.ts`

---

## Agent Role

You are a **migration specialist** working in the `beep-effect` monorepo—an Effect-first TypeScript codebase using Bun. Your task is to systematically migrate ~135 Better Auth endpoints to Effect Platform's type-safe HttpApi system.

You have two responsibilities:
1. **Documentation**: Break down a large OpenAPI spec into consumable references
2. **Implementation**: Create and execute a milestone-based migration plan

---

## Current State

Before proceeding, understand what already exists:

### Completed Work (M0-M2)

The following endpoints have already been implemented:

| Milestone | Group        | Endpoints             | Domain Path   | Infra Path    |
|-----------|--------------|-----------------------|---------------|---------------|
| M0        | `iam.core`   | get-session, sign-out | `v1/core/`    | `v1/core/`    |
| M1        | `iam.signIn` | email, social         | `v1/sign-in/` | `v1/sign-in/` |
| M2        | `iam.signUp` | email                 | `v1/sign-up/` | `v1/sign-up/` |

### Existing Structure

**Domain Layer** (`packages/iam/domain/src/api/`):
```
api/
├── api.ts              # IamApi class with OpenApi annotations
├── index.ts            # Barrel export
├── common/
│   ├── common-fields.ts   # Shared field schemas
│   ├── errors.ts          # IamAuthError tagged error
│   └── index.ts
└── v1/
    ├── api.ts             # V1 Api aggregating groups
    ├── index.ts
    ├── sign-in/           # M1 - complete
    ├── sign-up/           # M2 - complete
    └── core/              # M0 - complete
```

**Infra Layer** (`packages/iam/server/src/api/`):
```
api/
├── index.ts            # IamApiLive layer export
├── common/
│   ├── common.ts
│   ├── types.ts           # HandlerEffect type
│   └── index.ts
└── v1/
    ├── api.ts             # V1.ApiLive combining groups
    ├── index.ts
    ├── sign-in/           # M1 - complete
    ├── sign-up/           # M2 - complete
    └── core/              # M0 - complete
```

---

## Phase 1: OpenAPI Specification Breakdown

### Context

The file `nextjs-better-auth-api-spec.json` contains a ~23,500 line (~680KB) OpenAPI 3.1.1 specification exported from Better Auth's `openAPI` plugin. This spec is too large to consume directly.

> **⚠️ IMPORTANT - Large File Handling**: The source file exceeds typical tool size limits (~256KB). You MUST use command-line tools (jq, Bash scripts) to process it programmatically rather than reading it with the Read tool. See [Processing Large Files](#processing-large-files) below.

### Objective

Decompose the OpenAPI spec into focused markdown documents that implementation agents can reference.

### Tools to Use

- `Bash` with `jq` — to extract data from the large JSON file
- `Write` — to create documentation files
- `Glob` — to verify file creation

### Deliverables

Create the following structure:

```
.specs/better-auth-specs/
├── README.md              # Index with priority table
├── SCHEMAS.md             # Component schemas (extract once, reference everywhere)
├── COMMON_ERRORS.md       # Standard error responses (document once)
├── VALIDATION.md          # Quality assurance report
├── CORE.md                # Root-level endpoints (no prefix)
├── SIGN_IN.md             # /sign-in/* endpoints
├── SIGN_UP.md             # /sign-up/* endpoints
├── ADMIN.md               # /admin/* endpoints
├── ORGANIZATION.md        # /organization/* endpoints
├── TWO_FACTOR.md          # /two-factor/* endpoints
├── PASSKEY.md             # /passkey/* endpoints
├── OAUTH2.md              # /oauth2/* endpoints
├── SSO.md                 # /sso/* endpoints
├── PHONE_NUMBER.md        # /phone-number/* endpoints
├── API_KEY.md             # /api-key/* endpoints
├── DEVICE.md              # /device/* endpoints
├── MULTI_SESSION.md       # /multi-session/* endpoints
└── MISC.md                # Remaining: siwe, stripe, well-known, etc.
```

### Processing Large Files

The OpenAPI spec is too large for direct Read tool access. Use these patterns:

```bash
# List all endpoint paths
jq -r '.paths | keys[]' nextjs-better-auth-api-spec.json

# Count total endpoints (each path can have multiple methods)
jq '[.paths | to_entries[] | .value | keys[] | select(. != "parameters")] | length' nextjs-better-auth-api-spec.json

# Extract endpoints by path prefix
jq '.paths | to_entries | map(select(.key | startswith("/sign-in")))' nextjs-better-auth-api-spec.json

# Extract a specific endpoint
jq '.paths["/sign-in/email"]["post"]' nextjs-better-auth-api-spec.json

# Extract all component schemas
jq '.components.schemas | keys[]' nextjs-better-auth-api-spec.json

# Extract a specific schema
jq '.components.schemas["User"]' nextjs-better-auth-api-spec.json

# Extract root-level endpoints (no path prefix after /)
jq '.paths | to_entries | map(select(.key | test("^/[^/]+$")))' nextjs-better-auth-api-spec.json
```

### Categorization Rules

Apply these rules IN ORDER to assign each endpoint to exactly one category:

1. If path starts with `/sign-in/` → **SIGN_IN.md**
2. If path starts with `/sign-up/` → **SIGN_UP.md**
3. If path starts with `/admin/` → **ADMIN.md**
4. If path starts with `/organization/` → **ORGANIZATION.md**
5. If path starts with `/two-factor/` → **TWO_FACTOR.md**
6. If path starts with `/passkey/` → **PASSKEY.md**
7. If path starts with `/oauth2/` → **OAUTH2.md**
8. If path starts with `/sso/` → **SSO.md**
9. If path starts with `/phone-number/` → **PHONE_NUMBER.md**
10. If path starts with `/api-key/` → **API_KEY.md**
11. If path starts with `/device/` → **DEVICE.md**
12. If path starts with `/multi-session/` → **MULTI_SESSION.md**
13. If path matches `/siwe/*`, `/stripe/*`, `/.well-known/*`, `/one-tap/*`, `/token/*`, `/callback/*`, `/oauth-proxy-callback` → **MISC.md**
14. **Default**: All other paths (including root-level like `/get-session`, `/sign-out`) → **CORE.md**

### Priority Criteria

Assign priorities based on migration importance:

| Priority | Description | Categories |
|----------|-------------|------------|
| **P0** | Core authentication flows (MVP requirements) | CORE, SIGN_IN, SIGN_UP |
| **P1** | Multi-tenancy and enhanced security | ORGANIZATION, TWO_FACTOR |
| **P2** | Advanced authentication methods | ADMIN, PASSKEY, SSO, PHONE_NUMBER, API_KEY, MULTI_SESSION |
| **P3** | Provider functionality and edge cases | OAUTH2, DEVICE, MISC |

### Milestone Alignment

Use the milestone numbers defined in Phase 2. Map categories to milestones:

| Category | Milestone(s) |
|----------|--------------|
| CORE | M0, M3-M8 (split across multiple milestones) |
| SIGN_IN | M1 |
| SIGN_UP | M2 |
| ADMIN | M9 |
| ORGANIZATION | M10 |
| TWO_FACTOR | M11 |
| PASSKEY | M12 |
| OAUTH2 | M13 |
| SSO | M14 |
| PHONE_NUMBER, API_KEY, DEVICE, MULTI_SESSION | M15 (Advanced) |
| MISC | M15 (Advanced) |

> **Note**: Do NOT invent new milestones beyond M15. All edge-case categories go into M15.

### Execution Order

1. **Extract metadata**: Use jq to get OpenAPI info (version, title)
2. **Count endpoints**: Get total count for validation baseline
3. **Create COMMON_ERRORS.md**: Document standard error responses once
4. **Create SCHEMAS.md**: Extract all component schemas
5. **Create category documents**: Process each category using jq filters
6. **Create README.md**: Summarize with endpoint counts and priorities
7. **Create VALIDATION.md**: Document completion checklist
8. **Verify counts**: Sum endpoints across all files and compare to source

### Document Formats

#### README.md

````markdown
# Better Auth API Specifications

> Decomposed from `nextjs-better-auth-api-spec.json` for Effect Platform migration.

## Quick Reference

| Document | Endpoint Count | Priority | Migration Milestone |
|----------|----------------|----------|---------------------|
| CORE.md | 25 | P0 | M0, M3-M8 |
| SIGN_IN.md | 7 | P0 | M1 |
| SIGN_UP.md | 1 | P0 | M2 |
| ADMIN.md | 15 | P2 | M9 |
| ORGANIZATION.md | 35 | P1 | M10 |
| TWO_FACTOR.md | 8 | P1 | M11 |
| PASSKEY.md | 7 | P2 | M12 |
| OAUTH2.md | 8 | P3 | M13 |
| SSO.md | 5 | P2 | M14 |
| PHONE_NUMBER.md | 4 | P2 | M15 |
| API_KEY.md | 5 | P2 | M15 |
| DEVICE.md | 5 | P3 | M15 |
| MULTI_SESSION.md | 3 | P2 | M15 |
| MISC.md | 10 | P3 | M15 |

## Category Descriptions

### Core (`CORE.md`)
Root-level operations: session management, password flows, email verification, user management.

### Sign In (`SIGN_IN.md`)
Authentication methods: email/password, social OAuth, anonymous, phone, username.

[Continue for each category...]

## Schema Reference

All component schemas are in `SCHEMAS.md`. Reference format: `See [\`SchemaName\`](SCHEMAS.md#kebab-case-anchor)`

Example: `See [\`User\`](SCHEMAS.md#user)`, `See [\`Session\`](SCHEMAS.md#session)`

## Error Reference

Standard error responses are documented in `COMMON_ERRORS.md`. Endpoint documents only note endpoint-specific errors.

## Validation

Total endpoints in source: [N]
Total endpoints documented: [N]
Coverage: 100%
````

#### COMMON_ERRORS.md

````markdown
# Common Error Responses

> Standard error responses shared by all Better Auth endpoints.
> Endpoint documents reference this file instead of duplicating these definitions.

## Standard Error Codes

All endpoints may return these standard errors:

### 400 - Bad Request

Usually due to missing or invalid parameters.

```json
{
  "message": "string (required)"
}
```

### 401 - Unauthorized

Due to missing or invalid authentication.

```json
{
  "message": "string (required)"
}
```

### 403 - Forbidden

You do not have permission to access this resource or perform this action.

```json
{
  "message": "string"
}
```

### 404 - Not Found

The requested resource was not found.

```json
{
  "message": "string"
}
```

### 429 - Too Many Requests

You have exceeded the rate limit. Try again later.

```json
{
  "message": "string"
}
```

### 500 - Internal Server Error

This is a problem with the server.

```json
{
  "message": "string"
}
```

## Usage in Endpoint Documents

Endpoint documents should reference this file:

```markdown
**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

Additional endpoint-specific errors:
- `422` — Email already exists
```
````

#### SCHEMAS.md

````markdown
# Better Auth Component Schemas

> Extracted from `nextjs-better-auth-api-spec.json` → `components.schemas`

## Index

| Schema | Anchor | Description |
|--------|--------|-------------|
| User | [#user](#user) | Core user model |
| Session | [#session](#session) | Session data |
| Account | [#account](#account) | Linked auth provider |
| ... | ... | ... |

## Schemas

### User

```json
{
  "type": "object",
  "properties": {
    "id": { "type": "string" },
    "name": { "type": "string" },
    "email": { "type": "string" },
    "emailVerified": { "type": "boolean" },
    "image": { "type": "string", "nullable": true },
    "createdAt": { "type": "string", "format": "date-time" },
    "updatedAt": { "type": "string", "format": "date-time" }
  },
  "required": ["id", "name", "email", "emailVerified", "createdAt", "updatedAt"]
}
```

**Used by**: `POST /sign-up/email`, `GET /get-session`, `POST /update-user`

---

[Repeat for each schema]
````

#### VALIDATION.md

````markdown
# Phase 1 Validation Report

Generated: [DATE]

## Completion Status

- [ ] All 14 category documents created
- [ ] SCHEMAS.md contains all component schemas
- [ ] COMMON_ERRORS.md documents standard errors
- [ ] README.md has accurate endpoint counts
- [ ] Total documented endpoints = total source endpoints
- [ ] No duplicate endpoints across documents

## Statistics

| Metric | Count |
|--------|-------|
| Source Endpoints | [N] |
| Documented Endpoints | [N] |
| Coverage | [%] |
| Component Schemas | [N] |
| Category Documents | 14 |
| Total Files | 18 |

## Category Breakdown

| Category | File | Endpoints | Priority | Milestones |
|----------|------|-----------|----------|------------|
| Core | CORE.md | [N] | P0 | M0, M3-M8 |
| Sign In | SIGN_IN.md | [N] | P0 | M1 |
| ... | ... | ... | ... | ... |

## Quality Checks

- [ ] Verbatim extraction (no paraphrasing)
- [ ] Kebab-case markdown anchors
- [ ] Single source of truth for schemas
- [ ] Error responses reference COMMON_ERRORS.md
- [ ] All schema references use correct anchor format
````

#### Endpoint Category Documents (CORE.md, SIGN_IN.md, etc.)

````markdown
# [Category] API Specifications

> Source: `nextjs-better-auth-api-spec.json`
> Schemas: See [SCHEMAS.md](./SCHEMAS.md)
> Errors: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

**Priority**: P[N]
**Milestones**: M[N]
**Endpoint Count**: [N]

## Overview

[Brief description of this category's purpose in Better Auth]

## Endpoints

### `POST /endpoint-path`

**Description**: [From OpenAPI `description` or `summary` field]

**Request Body**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string (email) | Yes | User's email address |
| password | string | Yes | User's password |
| rememberMe | boolean | No | Extend session duration |
| callbackURL | string | No | Redirect URL after auth |

**Success Response** (`200`):

| Field | Type | Description |
|-------|------|-------------|
| user | See [`User`](SCHEMAS.md#user) | Authenticated user |
| session | See [`Session`](SCHEMAS.md#session) | Session data |
| token | string | Session token |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

**Notes**: [Any special behavior, redirects, or requirements]

---

### `GET /endpoint-path`

**Description**: [From OpenAPI `description` or `summary` field]

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| disableCookieCache | boolean | No | Bypass session cache |

**Success Response** (`200`):

| Field | Type | Description |
|-------|------|-------------|
| session | See [`Session`](SCHEMAS.md#session) | Current session |
| user | See [`User`](SCHEMAS.md#user) | Current user |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

[Repeat for each endpoint in this category]
````

### JSON Output Format

When documenting request/response bodies, use **table format** (as shown above) instead of raw JSON. This provides:
- Clear required/optional indication
- Type information with formats
- Field descriptions
- Schema references as markdown links

For complex nested objects, either:
1. Reference a schema in SCHEMAS.md: `See [\`SchemaName\`](SCHEMAS.md#anchor)`
2. Create a sub-table for inline objects

### Constraints

1. **Single source of truth**: Schemas appear ONLY in `SCHEMAS.md`; other docs use anchor references
2. **Verbatim extraction**: Copy spec data exactly—do not paraphrase or infer behavior
3. **Anchor format**: Use kebab-case markdown anchors (e.g., `#user`, `#session`). Reference format: `See [\`SchemaName\`](SCHEMAS.md#kebab-case-anchor)`
4. **Complete coverage**: Every endpoint in the source must appear in exactly one category document
5. **DRY errors**: Document standard errors ONCE in `COMMON_ERRORS.md`; endpoint docs only list endpoint-specific errors
6. **Table format**: Use markdown tables for request/response bodies, not raw JSON
7. **OpenAPI tags**: Note that the generated server uses `x-tagGroups` extension for grouping. All groups use `iam.` prefix (e.g., `iam.signIn`, `iam.core`)

### Success Criteria

- [ ] All 14 category documents created
- [ ] `SCHEMAS.md` contains all component schemas
- [ ] `COMMON_ERRORS.md` documents standard error responses
- [ ] `VALIDATION.md` contains completion checklist
- [ ] `README.md` has accurate endpoint counts
- [ ] Total documented endpoints = total source endpoints
- [ ] No duplicate endpoints across documents
- [ ] All schema references use correct anchor format

---

## Phase 2: Migration Planning

> **Phase Clarification**: Phase 2 creates planning documents (PLAN.md, PATTERNS.md, milestone docs). Phase 2.5 (covered in milestone docs) is the actual boilerplating execution where stub files are created.

### Objective

Create a milestone-based migration plan with implementation checklists.

### Tools to Use

- `Read` — to examine existing implementations
- `Write` — to create plan documents
- `Glob` — to discover existing files

### Deliverables

Create the following structure:

```
.specs/better-auth-server-migration/
├── PLAN.md                    # Master plan with dependency graph
├── PATTERNS.md                # Implementation patterns reference
├── M0_CORE_AUTH.md            # COMPLETE
├── M1_SIGN_IN.md              # COMPLETE
├── M2_SIGN_UP.md              # COMPLETE
├── M3_PASSWORD_FLOWS.md       # change-password, reset-password, forget-password
├── M4_EMAIL_VERIFICATION.md   # verify-email, send-verification-email
├── M5_USER_MANAGEMENT.md      # update-user, delete-user, account-info
├── M6_SESSION_MANAGEMENT.md   # list-sessions, revoke-session, revoke-other-sessions
├── M7_ACCOUNT_LINKING.md      # link-social, unlink-account, list-accounts
├── M8_TOKEN_MANAGEMENT.md     # refresh-token, get-access-token
├── M9_ADMIN.md                # admin/* endpoints
├── M10_ORGANIZATION.md        # organization/* endpoints
├── M11_TWO_FACTOR.md          # two-factor/* endpoints
├── M12_PASSKEY.md             # passkey/* endpoints
├── M13_OAUTH2.md              # oauth2/* endpoints
├── M14_SSO.md                 # sso/* endpoints
└── M15_ADVANCED.md            # phone-number, api-key, device, multi-session
```

### Discovery Commands (Run First)

Before creating planning documents, discover what already exists:

```bash
# Discover existing domain contracts
bun --bun find packages/iam/domain/src/api/v1 -name "*.ts" -not -name "_group.ts" -not -name "index.ts"

# Discover existing infra handlers
bun --bun find packages/iam/server/src/api/v1 -name "*.ts" -not -name "_group.ts" -not -name "index.ts"

# Count endpoints per category from Phase 1 specs
grep -c "^### " .specs/better-auth-specs/*.md

# Alternative using Glob tool (recommended for agents)
# Glob: packages/iam/domain/src/api/v1/**/*.ts
# Glob: packages/iam/server/src/api/v1/**/*.ts
```

This discovery step is critical for:
- Marking milestones with existing domain contracts as partially complete
- Identifying the domain-infra gap (contracts exist but handlers don't)
- Accurately setting initial milestone statuses in PLAN.md

### Execution Order

1. **Run discovery commands** to identify existing contracts and handlers
2. Read existing implementations in `packages/iam/domain/src/api/` and `packages/iam/server/src/api/`
3. Read Phase 1 spec documents
4. Create `PATTERNS.md` (extracted from existing M0-M2 implementations)
5. Create milestone documents M3-M15
6. Create `PLAN.md` (master index)

### Document Formats

#### PLAN.md

````markdown
# Better Auth Server Migration Plan

> Migrating from Next.js catch-all route to Effect Platform HttpApi

## Progress

| Milestone | Name | Status | Endpoints |
|-----------|------|--------|-----------|
| M0 | Core Auth | COMPLETE | get-session, sign-out |
| M1 | Sign In | COMPLETE | email, social |
| M2 | Sign Up | COMPLETE | email |
| M3 | Password Flows | PENDING | change-password, reset-password, forget-password |
| M4 | Email Verification | PENDING | verify-email, send-verification-email |
| M5 | User Management | PENDING | update-user, delete-user, account-info |
| M6 | Session Management | PENDING | list-sessions, revoke-session, revoke-other-sessions |
| M7 | Account Linking | PENDING | link-social, unlink-account, list-accounts |
| M8 | Token Management | PENDING | refresh-token, get-access-token |
| M9 | Admin | PENDING | admin/* (12 endpoints) |
| M10 | Organization | PENDING | organization/* (15 endpoints) |
| M11 | Two Factor | PENDING | two-factor/* (8 endpoints) |
| M12 | Passkey | PENDING | passkey/* (7 endpoints) |
| M13 | OAuth2 | PENDING | oauth2/* (10 endpoints) |
| M14 | SSO | PENDING | sso/* (5 endpoints) |
| M15 | Advanced | PENDING | phone-number, api-key, device, multi-session |

## Status Legend

| Status | Meaning | Next Action |
|--------|---------|-------------|
| `PENDING` | Not started | Boilerplating agent creates stubs |
| `BOILERPLATED` | Stub files created with JSDoc | Implementation agent fills in code |
| `IN_PROGRESS` | Implementation underway | Continue until all endpoints pass |
| `COMPLETE` | All checks pass | Move to next milestone |

## Dependency Graph

```text
                               ┌──────────────────────┐
                               │   M0: Core Auth      │ ← Foundation (get-session, sign-out)
                               └──────────┬───────────┘
                                          │
                    ┌─────────────────────┴─────────────────────┐
                    │                                           │
           ┌────────▼─────────┐                      ┌──────────▼─────────┐
           │   M1: Sign In    │                      │   M2: Sign Up      │
           └────────┬─────────┘                      └──────────┬─────────┘
                    │                                           │
           ┌────────▼─────────┐                      ┌──────────▼─────────┐
           │  M3: Password    │                      │  M4: Email Verify  │
           │     Flows        │                      └──────────┬─────────┘
           └────────┬─────────┘                                 │
                    │                                           │
                    └─────────────────┬─────────────────────────┘
                                      │
                           ┌──────────▼──────────┐
                           │  M5: User Mgmt      │ ← Gate for advanced features
                           └──────────┬──────────┘
                                      │
          ┌───────────────────────────┼───────────────────────────┐
          │                           │                           │
   ┌──────▼──────┐            ┌───────▼───────┐           ┌───────▼───────┐
   │ M6: Session │            │ M7: Linking   │           │  M8: Token    │
   │    Mgmt     │            │               │           │    Mgmt       │
   └─────────────┘            └───────────────┘           └───────────────┘

   ═══════════════════════════════════════════════════════════════════════
   PARALLEL AFTER M5 (no inter-dependencies):
   ═══════════════════════════════════════════════════════════════════════
   M9:  Admin           - admin/* (12 endpoints)
   M10: Organization    - organization/* (15 endpoints)
   M11: Two Factor      - two-factor/* (8 endpoints)
   M12: Passkey         - passkey/* (7 endpoints)
   M13: OAuth2          - oauth2/* (10 endpoints)
   M14: SSO             - sso/* (5 endpoints)
   M15: Advanced        - phone-number, api-key, device, multi-session
```

### Execution Order Summary

1. **Sequential Required**: M0 → M1/M2 (parallel) → M3/M4 (parallel) → M5 → M6/M7/M8 (parallel)
2. **Parallel Batch**: After M5 completes, M9-M15 can execute in any order or parallel

## Spec → Milestone Cross-Reference

| Spec File           | Milestones  | Endpoints |
|---------------------|-------------|-----------|
| CORE.md             | M0, M3-M8   | 29        |
| SIGN_IN.md          | M1          | 7         |
| SIGN_UP.md          | M2          | 1         |
| ADMIN.md            | M9          | 15        |
| ORGANIZATION.md     | M10         | 35        |
| TWO_FACTOR.md       | M11         | 8         |
| PASSKEY.md          | M12         | 7         |
| OAUTH2.md           | M13         | 8         |
| SSO.md              | M14         | 5         |
| PHONE_NUMBER.md     | M15         | 4         |
| API_KEY.md          | M15         | 5         |
| DEVICE.md           | M15         | 4         |
| MULTI_SESSION.md    | M15         | 3         |
| MISC.md             | M15         | 7         |

## Completion Criteria (Per Milestone)

1. All domain contracts defined with proper `$IamDomainId` identifiers
2. All infra handlers implemented with cookie forwarding
3. Group `_group.ts` updated with new contracts/handlers
4. `bun run check` passes
5. `bun run build --filter=@beep/iam-domain --filter=@beep/iam-server` succeeds
````

#### PATTERNS.md

````markdown
# Implementation Patterns Reference

> Extracted from completed milestones M0-M2

## Domain Contract Pattern

### File Location
`packages/iam/domain/src/api/v1/[group]/[endpoint].ts`

### Template (POST with Body)

```typescript
import { CommonFields, IamAuthError } from "../../../common";
import { $IamDomainId } from "@beep/identity/packages";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

// Unique identifier for this endpoint's schemas
const $I = $IamDomainId.create("api/v1/[group]/[endpoint]");

// Request payload schema
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    email: CommonFields.UserEmail,
    password: CommonFields.UserPassword,
    // Add fields based on OpenAPI spec
  },
  $I.annotations("EndpointPayload", {
    description: "Description from OpenAPI spec",
  })
) {}

// Success response schema
export class Success extends S.Class<Success>($I`Success`)(
  {
    user: User.Model,
    // Add fields based on OpenAPI spec
  },
  $I.annotations("EndpointSuccess", {
    description: "Description from OpenAPI spec",
  })
) {}

// Contract definition
export const Contract = HttpApiEndpoint.post("endpoint-name", "/path")
  .setPayload(Payload)
  .addSuccess(Success)
  .addError(
    IamAuthError.annotations(
      $I.annotations("EndpointError", {
        description: "Error description",
      })
    )
  );
```

### Template (GET with Query Parameters)

```typescript
import { CommonFields, IamAuthError } from "../../../common";
import { $IamDomainId } from "@beep/identity/packages";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/[group]/[endpoint]");

// Query parameters schema (for GET requests)
export class UrlParams extends S.Class<UrlParams>($I`UrlParams`)(
  {
    disableCookieCache: S.optionalWith(S.Boolean, { default: () => false }),
  },
  $I.annotations("EndpointUrlParams", {
    description: "Query parameters",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)({
  session: Session.Model,
  user: User.Model,
}) {}

export const Contract = HttpApiEndpoint.get("endpoint-name", "/path")
  .setUrlParams(UrlParams)  // Use setUrlParams for GET query params
  .addSuccess(Success)
  .addError(IamAuthError);
```

### Template (POST with Path Parameters)

```typescript
import { CommonFields, IamAuthError } from "../../../common";
import { $IamDomainId } from "@beep/identity/packages";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as HttpApiSchema from "@effect/platform/HttpApiSchema";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/[group]/[endpoint]");

// Path parameters schema
export class PathParams extends S.Class<PathParams>($I`PathParams`)(
  {
    token: S.String,  // Maps to :token in path
  }
) {}

export class Success extends S.Class<Success>($I`Success`)({
  status: S.Boolean,
}) {}

// Path uses :param syntax for path parameters
export const Contract = HttpApiEndpoint.post("endpoint-name", "/path/:token")
  .setPath(PathParams)  // Use setPath for path params
  .addSuccess(Success)
  .addError(IamAuthError);
```

### Available Common Fields

From `packages/iam/domain/src/api/common/common-fields.ts`:

| Field          | Type               | Description                        |
|----------------|--------------------|------------------------------------|
| `UserEmail`    | `Redacted<string>` | Email address (redacted in logs)   |
| `UserPassword` | `Redacted<string>` | Password (redacted in logs)        |
| `CallbackURL`  | `Option<string>`   | Optional redirect after auth       |
| `RememberMe`   | `Option<boolean>`  | Extended session flag              |
| `SessionToken` | `string`           | Session token                      |
| `Redirect`     | `boolean`          | Whether response triggers redirect |
| `RedirectURL`  | `Option<string>`   | Where to redirect                  |

### Schema Usage Guidelines

The `@beep/schema` package provides custom schemas that MUST be used in specific scenarios. Import as:

```typescript
import { BS } from "@beep/schema";
```

#### Nullable Fields → `S.optionalWith` with Option

For nullable properties, use `S.optionalWith` with `as: "Option"` so decoded values use `effect/Option`:

```typescript
// ❌ WRONG - loses nullability semantics at runtime
callbackURL: S.NullOr(S.String)

// ✅ CORRECT - nullable field decoded as Option<string>
callbackURL: S.optionalWith(BS.URLPath, { as: "Option", nullable: true })
```

#### URL Strings → `BS.URLString`

For full URL properties (http/https):

```typescript
// ❌ WRONG
redirectUrl: S.String

// ✅ CORRECT
redirectUrl: BS.URLString  // Validates http:// or https://
```

#### URL Paths → `BS.URLPath`

For path-only properties like callback URLs (`/dashboard`, `/auth/verify`):

```typescript
// ❌ WRONG - no path validation
callbackURL: S.optional(S.String)

// ✅ CORRECT - validates path format
callbackURL: S.optionalWith(BS.URLPath, { as: "Option", nullable: true })
```

#### Sensitive Data / PII → `S.Redacted`

For passwords, tokens, API keys, and other sensitive fields:

```typescript
// ❌ WRONG - will appear in logs
password: S.String

// ✅ CORRECT - redacted in logs and traces
password: S.Redacted(S.String)  // Or use CommonFields.UserPassword
```

> **Note**: CommonFields.UserEmail and CommonFields.UserPassword already wrap with `S.Redacted`.

#### Default Values → `BS.toOptionalWithDefault` / `BS.BoolWithDefault`

For optional fields with defaults:

```typescript
// ❌ WRONG - manual default handling
rememberMe: S.optionalWith(S.Boolean, { default: () => false })

// ✅ PREFERRED - use helper from @beep/schema
import { toOptionalWithDefault } from "@beep/schema/core/utils/to-optional-with";
rememberMe: toOptionalWithDefault(S.Boolean)(false)

// ✅ ALSO CORRECT - Effect's optionalWith is fine for simple cases
rememberMe: S.optionalWith(S.Boolean, { default: F.constFalse })
```

#### Domain Entities → `@beep/iam-domain/entities`

For User, Session, Account responses, use the `@effect/sql/Model` schemas:

```typescript
// ❌ WRONG - inline object definition
user: S.Struct({ id: S.String, name: S.String, email: S.String })

// ✅ CORRECT - use domain entity model
import { User } from "@beep/iam-domain/entities";

export class Success extends S.Class<Success>($I`Success`)({
  user: User.Model,
  session: Session.Model,
}) {}
```

#### Identifier Composer → `$IamDomainId`

ALWAYS use the identifier composer for schema annotations:

```typescript
import { $IamDomainId } from "@beep/identity/packages";

const $I = $IamDomainId.create("api/v1/sign-in/email");

// Use $I for:
// 1. Class identifiers: S.Class<Payload>($I`Payload`)
// 2. Annotations: $I.annotations("PayloadName", { description: "..." })
```

#### Error Handling → Single `IamAuthError`

Use `IamAuthError` for ALL endpoint errors. Do NOT create individual error schemas per endpoint:

```typescript
// ❌ WRONG - creating separate error schemas
export class SignInError extends S.TaggedError<SignInError>()("SignInError", { ... }) {}
export class InvalidCredentialsError extends S.TaggedError<...>() { ... }

// ✅ CORRECT - single error class handles all cases
import { IamAuthError } from "@beep/iam-domain/api/common";

export const Contract = HttpApiEndpoint.post("email", "/email")
  .setPayload(Payload)
  .addSuccess(Success)
  .addError(IamAuthError.annotations($I.annotations("IamAuthError", {
    description: "An Error indicating a failure to sign in.",
  })));
```

The `IamAuthError.flowMap()` and `IamAuthError.mapError()` utilities capture context automatically.

### OpenAPI to Effect Schema Mapping

When translating OpenAPI types to Effect Schema:

| OpenAPI Type/Format | Effect Schema | Notes |
|---------------------|---------------|-------|
| `{ "type": "string" }` | `S.String` | Basic string |
| `{ "type": "string", "format": "email" }` | `CommonFields.UserEmail` | Redacted, use common field |
| `{ "type": "string", "format": "password" }` | `CommonFields.UserPassword` | Redacted, use common field |
| `{ "type": "string", "format": "date-time" }` | `S.DateTimeUtc` | ISO 8601 datetime |
| `{ "type": "string", "format": "uri" }` | `BS.URLString` | Full URL (http/https) |
| Path-like strings (e.g., `/dashboard`) | `BS.URLPath` | Path validation |
| `{ "type": "boolean" }` | `S.Boolean` | |
| `{ "type": "integer" }` | `S.Number.pipe(S.int())` | |
| `{ "type": "number" }` | `S.Number` | |
| `{ "type": "array", "items": {...} }` | `S.Array(ItemSchema)` | |
| `{ "type": "object" }` | `S.Class` | ALWAYS use S.Class for named types |
| `{ "nullable": true }` | `S.optionalWith(Schema, { as: "Option", nullable: true })` | Decodes to Option |
| Required field | Field in struct | No wrapper needed |
| Optional with default | `S.optionalWith(Schema, { default: () => value })` | |
| Optional without default | `S.optionalWith(Schema, { as: "Option" })` | Decodes to Option |
| User/Session/Account objects | `User.Model`, `Session.Model` | Use domain entities |

### Barrel Export Pattern

When exporting from `index.ts` files:

```typescript
// packages/iam/domain/src/api/v1/core/index.ts
export * as GetSession from "./get-session.ts";
export * as SignOut from "./sign-out.ts";
export * as ChangePassword from "./change-password.ts";
// Namespace re-export pattern - each endpoint as a namespace
```

## Infra Handler Pattern

### File Location
`packages/iam/server/src/api/v1/[group]/[endpoint].ts`

### Template (POST with Body)

```typescript
import { IamAuthError, V1 } from "@beep/iam-domain/api";
import { Auth } from "@beep/iam-server";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as HttpServerResponse from "@effect/platform/HttpServerResponse";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";
import type { Common } from "../../common";

type HandlerEffect = Common.HandlerEffect<V1.[Group].[Endpoint].Payload>;

export const Handler: HandlerEffect = Effect.fn("EndpointName")(function* ({ payload }) {
  const auth = yield* Auth.Service;
  const request = yield* HttpServerRequest.HttpServerRequest;

  const { headers, response } = yield* F.pipe(
    Effect.Do,
    Effect.bind("result", () =>
      Effect.tryPromise(() =>
        auth.api.[betterAuthMethod]({
          body: {
            email: Redacted.value(payload.email),
            password: Redacted.value(payload.password),
            // Map payload fields to Better Auth API
          },
          headers: request.headers,
          returnHeaders: true,
        })
      )
    ),
    Effect.bindAll(({ result }) => ({
      headers: Effect.succeed(result.headers),
      response: S.decodeUnknown(V1.[Group].[Endpoint].Success)(result.response),
    }))
  );

  // Forward set-cookie header from Better Auth
  const setCookie = headers.get("set-cookie");

  return yield* F.pipe(
    response,
    HttpServerResponse.json,
    Effect.map((jsonResponse) =>
      setCookie
        ? F.pipe(jsonResponse, HttpServerResponse.setHeader("set-cookie", setCookie))
        : jsonResponse
    )
  );
}, IamAuthError.flowMap("[endpoint-name]"));
```

### Template (GET with URL Params)

```typescript
import { IamAuthError, V1 } from "@beep/iam-domain/api";
import { Auth } from "@beep/iam-server";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as HttpServerResponse from "@effect/platform/HttpServerResponse";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as S from "effect/Schema";
import type { Common } from "../../common";

// For GET requests, use UrlParams instead of Payload
type HandlerEffect = Common.HandlerEffect<V1.[Group].[Endpoint].UrlParams>;

export const Handler: HandlerEffect = Effect.fn("EndpointName")(function* ({ urlParams }) {
  const auth = yield* Auth.Service;
  const request = yield* HttpServerRequest.HttpServerRequest;

  const { headers, response } = yield* F.pipe(
    Effect.Do,
    Effect.bind("result", () =>
      Effect.tryPromise(() =>
        auth.api.[betterAuthMethod]({
          query: {
            // Map urlParams to Better Auth query parameters
            disableCookieCache: urlParams.disableCookieCache,
          },
          headers: request.headers,
          returnHeaders: true,
        })
      )
    ),
    Effect.bindAll(({ result }) => ({
      headers: Effect.succeed(result.headers),
      response: S.decodeUnknown(V1.[Group].[Endpoint].Success)(result.response),
    }))
  );

  const setCookie = headers.get("set-cookie");

  return yield* F.pipe(
    response,
    HttpServerResponse.json,
    Effect.map((jsonResponse) =>
      setCookie
        ? F.pipe(jsonResponse, HttpServerResponse.setHeader("set-cookie", setCookie))
        : jsonResponse
    )
  );
}, IamAuthError.flowMap("[endpoint-name]"));
```

### Better Auth API Methods

Method names use camelCase, endpoints use kebab-case. The pattern is: remove leading slash, replace hyphens with camelCase, e.g., `/sign-in/email` → `signInEmail`.

#### Core Methods (M0, M3-M8)

| Method           | Endpoint              | Description              |
|------------------|-----------------------|--------------------------|
| `getSession`     | GET /get-session      | Retrieve current session |
| `signOut`        | POST /sign-out        | End session              |
| `changePassword` | POST /change-password | Update password          |
| `resetPassword`  | POST /reset-password  | Complete password reset  |
| `forgetPassword` | POST /forget-password | Request reset email (name is "forget" not "request-password-reset") |
| `verifyEmail`    | GET /verify-email     | Confirm email address    |
| `sendVerificationEmail` | POST /send-verification-email | Resend verification |
| `updateUser`     | POST /update-user     | Modify user profile      |
| `deleteUser`     | POST /delete-user     | Remove account           |
| `getAccountInfo` | GET /account-info     | Get provider account info |
| `listSessions`   | GET /list-sessions    | Get all user sessions    |
| `revokeSession`  | POST /revoke-session  | End specific session     |
| `revokeSessions` | POST /revoke-sessions | End all sessions         |
| `revokeOtherSessions` | POST /revoke-other-sessions | End all other sessions |
| `linkSocial`     | POST /link-social     | Connect OAuth account    |
| `unlinkAccount`  | POST /unlink-account  | Remove linked account    |
| `listAccounts`   | GET /list-accounts    | List linked accounts     |
| `refreshToken`   | POST /refresh-token   | Refresh OAuth token      |
| `getAccessToken` | POST /get-access-token | Get valid access token  |
| `changeEmail`    | POST /change-email    | Change user email        |

#### Sign In Methods (M1)

| Method           | Endpoint              | Description              |
|------------------|-----------------------|--------------------------|
| `signInEmail`    | POST /sign-in/email   | Email/password sign in   |
| `signInSocial`   | POST /sign-in/social  | OAuth provider sign in   |
| `signInAnonymous` | POST /sign-in/anonymous | Anonymous sign in      |
| `signInPhoneNumber` | POST /sign-in/phone-number | Phone sign in       |
| `signInUsername` | POST /sign-in/username | Username sign in        |
| `signInOAuth2`   | POST /sign-in/oauth2  | OAuth2 sign in           |
| `signInSSO`      | POST /sign-in/sso     | SSO sign in              |

#### Sign Up Methods (M2)

| Method           | Endpoint              | Description              |
|------------------|-----------------------|--------------------------|
| `signUpEmail`    | POST /sign-up/email   | Email registration       |

#### Admin Methods (M9)

| Method           | Endpoint              | Description              |
|------------------|-----------------------|--------------------------|
| `admin.listUsers` | GET /admin/list-users | List all users          |
| `admin.getUser`  | GET /admin/get-user   | Get user by ID           |
| `admin.createUser` | POST /admin/create-user | Create new user        |
| `admin.updateUser` | POST /admin/update-user | Update user            |
| `admin.removeUser` | POST /admin/remove-user | Delete user            |
| `admin.banUser`  | POST /admin/ban-user  | Ban user                 |
| `admin.unbanUser` | POST /admin/unban-user | Unban user              |
| `admin.setRole`  | POST /admin/set-role  | Set user role            |
| `admin.setUserPassword` | POST /admin/set-user-password | Set user password |
| `admin.impersonateUser` | POST /admin/impersonate-user | Impersonate user  |
| `admin.stopImpersonating` | POST /admin/stop-impersonating | Stop impersonation |
| `admin.hasPermission` | POST /admin/has-permission | Check permission    |
| `admin.listUserSessions` | POST /admin/list-user-sessions | List user sessions |
| `admin.revokeUserSession` | POST /admin/revoke-user-session | Revoke session   |
| `admin.revokeUserSessions` | POST /admin/revoke-user-sessions | Revoke all sessions |

#### Organization Methods (M10)

| Method           | Endpoint              | Description              |
|------------------|-----------------------|--------------------------|
| `organization.create` | POST /organization/create | Create organization |
| `organization.update` | POST /organization/update | Update organization |
| `organization.delete` | POST /organization/delete | Delete organization |
| `organization.list` | GET /organization/list | List organizations     |
| `organization.getFullOrganization` | GET /organization/get-full-organization | Get full details |
| `organization.setActive` | POST /organization/set-active | Set active org   |
| `organization.inviteMember` | POST /organization/invite-member | Invite member  |
| `organization.cancelInvitation` | POST /organization/cancel-invitation | Cancel invite |
| `organization.acceptInvitation` | POST /organization/accept-invitation | Accept invite |
| `organization.rejectInvitation` | POST /organization/reject-invitation | Reject invite |
| `organization.getInvitation` | GET /organization/get-invitation | Get invitation  |
| `organization.listInvitations` | GET /organization/list-invitations | List invitations |
| `organization.listUserInvitations` | GET /organization/list-user-invitations | User invites |
| `organization.removeMember` | POST /organization/remove-member | Remove member   |
| `organization.updateMemberRole` | POST /organization/update-member-role | Update role |
| `organization.listMembers` | GET /organization/list-members | List members     |
| `organization.getActiveMember` | GET /organization/get-active-member | Get active member |
| `organization.getActiveMemberRole` | GET /organization/get-active-member-role | Get role |
| `organization.leave` | POST /organization/leave | Leave organization    |
| `organization.hasPermission` | POST /organization/has-permission | Check permission |
| `organization.createTeam` | POST /organization/create-team | Create team      |
| `organization.updateTeam` | POST /organization/update-team | Update team      |
| `organization.removeTeam` | POST /organization/remove-team | Remove team      |
| `organization.listTeams` | GET /organization/list-teams | List teams        |
| `organization.addTeamMember` | POST /organization/add-team-member | Add to team   |
| `organization.removeTeamMember` | POST /organization/remove-team-member | Remove from team |
| `organization.listTeamMembers` | GET /organization/list-team-members | Team members  |
| `organization.listUserTeams` | GET /organization/list-user-teams | User's teams   |
| `organization.setActiveTeam` | POST /organization/set-active-team | Set active team |
| `organization.createRole` | POST /organization/create-role | Create role      |
| `organization.updateRole` | POST /organization/update-role | Update role      |
| `organization.deleteRole` | POST /organization/delete-role | Delete role      |
| `organization.listRoles` | GET /organization/list-roles | List roles        |
| `organization.getRole` | GET /organization/get-role | Get role           |
| `organization.checkSlug` | POST /organization/check-slug | Check slug availability |

#### Two-Factor Methods (M11)

| Method           | Endpoint              | Description              |
|------------------|-----------------------|--------------------------|
| `twoFactor.enable` | POST /two-factor/enable | Enable 2FA            |
| `twoFactor.disable` | POST /two-factor/disable | Disable 2FA          |
| `twoFactor.getTotpUri` | POST /two-factor/get-totp-uri | Get TOTP URI    |
| `twoFactor.verifyTotp` | POST /two-factor/verify-totp | Verify TOTP     |
| `twoFactor.sendOtp` | POST /two-factor/send-otp | Send OTP email       |
| `twoFactor.verifyOtp` | POST /two-factor/verify-otp | Verify OTP        |
| `twoFactor.generateBackupCodes` | POST /two-factor/generate-backup-codes | Generate codes |
| `twoFactor.verifyBackupCode` | POST /two-factor/verify-backup-code | Verify backup |

#### Passkey Methods (M12)

| Method           | Endpoint              | Description              |
|------------------|-----------------------|--------------------------|
| `passkey.generateRegisterOptions` | GET /passkey/generate-register-options | Register options |
| `passkey.verifyRegistration` | POST /passkey/verify-registration | Verify registration |
| `passkey.generateAuthenticateOptions` | GET /passkey/generate-authenticate-options | Auth options |
| `passkey.verifyAuthentication` | POST /passkey/verify-authentication | Verify auth |
| `passkey.listUserPasskeys` | GET /passkey/list-user-passkeys | List passkeys   |
| `passkey.updatePasskey` | POST /passkey/update-passkey | Update passkey    |
| `passkey.deletePasskey` | POST /passkey/delete-passkey | Delete passkey    |

#### OAuth2 Methods (M13)

| Method           | Endpoint              | Description              |
|------------------|-----------------------|--------------------------|
| `oauth2.authorize` | GET /oauth2/authorize | Authorization endpoint |
| `oauth2.token`   | POST /oauth2/token    | Token endpoint           |
| `oauth2.consent` | POST /oauth2/consent  | Consent endpoint         |
| `oauth2.register` | POST /oauth2/register | Register client         |
| `oauth2.userinfo` | GET /oauth2/userinfo | User info endpoint       |
| `oauth2.link`    | POST /oauth2/link     | Link OAuth account       |
| `oauth2.getClient` | GET /oauth2/client/:id | Get client info        |
| `oauth2.callback` | GET /oauth2/callback/:providerId | OAuth callback  |

#### SSO Methods (M14)

| Method           | Endpoint              | Description              |
|------------------|-----------------------|--------------------------|
| `sso.register`   | POST /sso/register    | Register SSO provider    |
| `sso.callback`   | GET /sso/callback/:providerId | SSO callback      |
| `sso.saml2Callback` | POST /sso/saml2/callback/:providerId | SAML callback |
| `sso.saml2SpAcs` | POST /sso/saml2/sp/acs/:providerId | SAML ACS       |
| `sso.saml2SpMetadata` | GET /sso/saml2/sp/metadata | SAML metadata   |

#### Advanced Methods (M15)

| Method           | Endpoint              | Description              |
|------------------|-----------------------|--------------------------|
| `phoneNumber.sendOtp` | POST /phone-number/send-otp | Send phone OTP    |
| `phoneNumber.verify` | POST /phone-number/verify | Verify phone        |
| `phoneNumber.requestPasswordReset` | POST /phone-number/request-password-reset | Phone reset |
| `phoneNumber.resetPassword` | POST /phone-number/reset-password | Reset via phone |
| `apiKey.create`  | POST /api-key/create  | Create API key           |
| `apiKey.get`     | GET /api-key/get      | Get API key              |
| `apiKey.list`    | GET /api-key/list     | List API keys            |
| `apiKey.update`  | POST /api-key/update  | Update API key           |
| `apiKey.delete`  | POST /api-key/delete  | Delete API key           |
| `device.code`    | POST /device/code     | Get device code          |
| `device.approve` | POST /device/approve  | Approve device           |
| `device.deny`    | POST /device/deny     | Deny device              |
| `device.token`   | POST /device/token    | Get device token         |
| `multiSession.listDeviceSessions` | GET /multi-session/list-device-sessions | List sessions |
| `multiSession.setActive` | POST /multi-session/set-active | Set active session |
| `multiSession.revoke` | POST /multi-session/revoke | Revoke session     |

> **Note**: Method names can also be discovered from Better Auth's TypeScript types: `auth.api.*`. The OpenAPI spec `operationId` field also indicates the method name.

## Domain Group Pattern

### File Location
`packages/iam/domain/src/api/v1/[group]/_group.ts`

### Template

```typescript
import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import * as Endpoint1 from "./endpoint1.ts";
import * as Endpoint2 from "./endpoint2.ts";

export class Group extends HttpApiGroup.make("iam.[groupName]")
  .add(Endpoint1.Contract)
  .add(Endpoint2.Contract)
  .prefix("/[group-path]") {}

export { Endpoint1, Endpoint2 };
```

## Infra Group Pattern

### File Location
`packages/iam/server/src/api/v1/[group]/_group.ts`

### Template

```typescript
import { IamApi, IamAuthError } from "@beep/iam-domain";
import type { Auth } from "@beep/iam-server";
import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder";
import type * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import type * as Layer from "effect/Layer";
import * as Endpoint1 from "./endpoint1.ts";
import * as Endpoint2 from "./endpoint2.ts";

export type Service = HttpApiGroup.ApiGroup<"iam", "iam.[groupName]">;
export type ServiceError = IamAuthError;
export type ServiceDependencies = Auth.Service;

export type Routes = Layer.Layer<Service, ServiceError, ServiceDependencies>;

export const Routes: Routes = HttpApiBuilder.group(IamApi, "iam.[groupName]", (h) =>
  h.handle("endpoint1", Endpoint1.Handler)
   .handle("endpoint2", Endpoint2.Handler)
);
```

## Naming Conventions

| OpenAPI Path              | File Name            | Contract Name             | Handler Name        |
|---------------------------|----------------------|---------------------------|---------------------|
| `/change-password`        | `change-password.ts` | `ChangePassword.Contract` | `"change-password"` |
| `/reset-password/{token}` | `reset-password.ts`  | `ResetPassword.Contract`  | `"reset-password"`  |
| `/sign-in/email`          | `sign-in/email.ts`   | `Email.Contract`          | `"email"`           |

## Verification Commands

```bash
# Type check entire workspace
bun run check

# Build affected packages
bun run build --filter=@beep/iam-domain --filter=@beep/iam-server

# Full build
bun run build
```
````

#### Milestone Documents (M3_PASSWORD_FLOWS.md, etc.)

```markdown
# Milestone [N]: [Name]

> **Status**: PENDING | BOILERPLATED | IN_PROGRESS | COMPLETE
> **Spec Reference**: [.specs/better-auth-specs/CATEGORY.md](../better-auth-specs/CATEGORY.md)
> **Patterns Reference**: [PATTERNS.md](./PATTERNS.md)

## Quick Start

**Current State** (from discovery):
- Domain contracts: [✅ Exist | ❌ Need creation]
- Infra handlers: [✅ Exist | ❌ Need creation]

**If domain contracts exist**: Skip to Implementation Checklist → Infra Handlers
**If domain contracts don't exist**: Start with Boilerplating Checklist → Domain Contracts

## Pre-Implementation Validation

- [ ] Read corresponding spec document (link above)
- [ ] Verify endpoint count matches spec
- [ ] Check for any custom authentication requirements
- [ ] Identify any endpoints with complex nested objects

## Overview

[Brief description of what this milestone accomplishes]

## Endpoints

| Method | Path | Domain File | Infra File | Better Auth Method |
|--------|------|-------------|------------|-------------------|
| POST | /change-password | `v1/core/change-password.ts` | `v1/core/change-password.ts` | `changePassword` |
| POST | /reset-password | `v1/core/reset-password.ts` | `v1/core/reset-password.ts` | `resetPassword` |

## Phase 2.5: Boilerplating Checklist

> Complete this section BEFORE implementation. Creates stub files with JSDoc.

### Boilerplate Domain Contracts

#### `change-password.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/core/change-password.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint path and method
  - Spec reference anchor
  - Better Auth method name
  - Implementation requirements from spec
- [ ] Add `Payload` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields from spec
- [ ] Add `Success` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields from spec
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

#### Update `_group.ts`

- [ ] Import `* as ChangePassword from "./change-password.ts"`
- [ ] Add `.add(ChangePassword.Contract)` to Group class

[Repeat for each endpoint...]

### Boilerplate Infra Handlers

#### `change-password.ts`

- [ ] Create stub file `packages/iam/server/src/api/v1/core/change-password.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type with JSDoc
- [ ] Add `Handler` stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comments with implementation template
  - Placeholder `Effect.fail(new Error("Not implemented"))`
- [ ] Update `index.ts` barrel export

#### Update `_group.ts`

- [ ] Import `* as ChangePassword from "./change-password.ts"`
- [ ] Add `.handle("change-password", ChangePassword.Handler)` to Routes

[Repeat for each endpoint...]

### Boilerplate Verification

- [ ] All stub files created with complete JSDoc
- [ ] All group files updated with imports/registrations
- [ ] `bun run check` runs (failures expected for TODO placeholders)
- [ ] Status updated to `BOILERPLATED` in PLAN.md

---

## Implementation Checklist

> Complete this section AFTER boilerplating. Fills in stub implementations.

### 1. Domain Contracts

#### `change-password.ts`

- [ ] Implement `Payload` class fields:
  - `currentPassword: CommonFields.UserPassword`
  - `newPassword: CommonFields.UserPassword`
  - `revokeOtherSessions: S.optionalWith(S.Boolean, { default: () => false })`
- [ ] Implement `Success` class fields from spec
- [ ] Update JSDoc @example with realistic values
- [ ] Remove TODO comments

[Repeat for each endpoint...]

### 2. Infra Handlers

#### `change-password.ts`

- [ ] Implement `Handler` logic:
  - Call `auth.api.changePassword()`
  - Decode response with `V1.Core.ChangePassword.Success`
  - Forward `set-cookie` header
- [ ] Remove placeholder `Effect.fail(...)`
- [ ] Update JSDoc @example if needed

[Repeat for each endpoint...]

### 3. Verification

- [ ] `bun run check` passes
- [ ] `bun run build --filter=@beep/iam-domain --filter=@beep/iam-server` succeeds
- [ ] Endpoints appear in OpenAPI spec at server `/docs`
- [ ] Status updated to `COMPLETE` in PLAN.md

## Notes

[Any special considerations, edge cases, or implementation details]
```

### Constraints

1. **Reference Phase 1 docs**: Every milestone links to relevant spec documents
2. **Follow patterns exactly**: Use PATTERNS.md templates without deviation
3. **Incremental verification**: Run checks after each endpoint, not just at milestone end
4. **Atomic commits**: Each endpoint can be committed separately if needed

### Success Criteria

- [ ] `PLAN.md` created with accurate status
- [ ] `PATTERNS.md` extracted from existing implementations
- [ ] All milestone documents M3-M15 created with complete checklists
- [ ] All spec references point to valid Phase 1 documents

---

## Phase 2.5: Boilerplating

### Objective

Create stub files with complete structure and JSDoc documentation BEFORE implementation. This reduces context needed by implementation agents and ensures consistent documentation from the start.

### Why Boilerplating?

1. **Context Reduction**: Implementation agents don't need to read specs—the stub file contains everything
2. **Documentation-First**: JSDoc is written upfront, not retrofitted
3. **Clear Structure**: Section separators and TODO markers guide implementation
4. **Linting-Ready**: Stub files pass linting immediately (just need implementation)
5. **Parallel Work**: Multiple agents can boilerplate different milestones simultaneously

### Deliverables Per Milestone

For each endpoint in a milestone, create:

1. **Domain Contract Stub** (`packages/iam/domain/src/api/v1/[group]/[endpoint].ts`)
2. **Infra Handler Stub** (`packages/iam/server/src/api/v1/[group]/[endpoint].ts`)
3. **Updated Group Files** (add imports and stub registrations)

### Domain Contract Stub Template

````typescript
/**
 * @module [endpoint-name]
 *
 * Implements the [endpoint-name] endpoint for [brief description].
 *
 * ## Endpoint Details
 * - **Method**: [POST|GET]
 * - **Path**: `/[path]`
 * - **Spec Reference**: `.specs/better-auth-specs/[CATEGORY].md#[anchor]`
 * - **Better Auth Method**: `auth.api.[methodName]`
 *
 * ## Implementation Requirements
 * [List key requirements from spec, e.g.:]
 * - Validate [field] before processing
 * - Handle [edge case]
 * - Forward cookies from Better Auth response
 *
 * @category exports
 * @since 0.1.0
 */

import { CommonFields, IamAuthError } from "../../../common";
import { $IamDomainId } from "@beep/identity/packages";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";
// TODO: Add domain entity imports if needed
// import { User, Session } from "@beep/iam-domain/entities";

const $I = $IamDomainId.create("api/v1/[group]/[endpoint]");

// ============================================================================
// Request Payload
// ============================================================================

/**
 * Request payload for [endpoint-name].
 *
 * @example
 * ```typescript
 * import { V1 } from "@beep/iam-domain/api"
 * import * as Redacted from "effect/Redacted"
 *
 * const payload = V1.[Group].[Endpoint].Payload.make({
 *   // TODO: Add example field values
 * })
 * ```
 *
 * @category schemas
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    // TODO: Implement fields from spec
    // Spec reference: .specs/better-auth-specs/[CATEGORY].md#[anchor]
    //
    // Example fields:
    // email: CommonFields.UserEmail,                                    // Required
    // password: CommonFields.UserPassword,                              // Required
    // callbackURL: S.optionalWith(BS.URLPath, { as: "Option", nullable: true }),
    // rememberMe: S.optionalWith(S.Boolean, { default: F.constFalse }),
  },
  $I.annotations("[Endpoint]Payload", {
    description: "[Description from OpenAPI spec]",
  })
) {}

// ============================================================================
// Success Response
// ============================================================================

/**
 * Success response for [endpoint-name].
 *
 * @example
 * ```typescript
 * import { V1 } from "@beep/iam-domain/api"
 * import * as S from "effect/Schema"
 *
 * const response = S.decodeUnknownSync(V1.[Group].[Endpoint].Success)({
 *   // TODO: Add example response
 * })
 * ```
 *
 * @category schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    // TODO: Implement fields from spec
    // Spec reference: .specs/better-auth-specs/[CATEGORY].md#[anchor]
    //
    // Example fields:
    // user: User.Model,
    // session: Session.Model,
    // token: S.optional(S.String),
  },
  $I.annotations("[Endpoint]Success", {
    description: "[Description from OpenAPI spec]",
  })
) {}

// ============================================================================
// URL Parameters (for GET requests only)
// ============================================================================

// TODO: Uncomment if this is a GET endpoint with query parameters
// /**
//  * URL parameters for [endpoint-name].
//  *
//  * @example
//  * ```typescript
//  * import { V1 } from "@beep/iam-domain/api"
//  *
//  * const params: V1.[Group].[Endpoint].UrlParams = {
//  *   // TODO: Add example params
//  * }
//  * ```
//  *
//  * @category schemas
//  * @since 0.1.0
//  */
// export class UrlParams extends S.Class<UrlParams>($I`UrlParams`)(
//   {
//     // TODO: Implement query parameters from spec
//   },
//   $I.annotations("[Endpoint]UrlParams", {
//     description: "Query parameters for [endpoint-name]",
//   })
// ) {}

// ============================================================================
// Path Parameters (for routes with :param segments)
// ============================================================================

// TODO: Uncomment if this endpoint has path parameters (e.g., /reset-password/:token)
// /**
//  * Path parameters for [endpoint-name].
//  *
//  * @example
//  * ```typescript
//  * import { V1 } from "@beep/iam-domain/api"
//  *
//  * const params: V1.[Group].[Endpoint].PathParams = {
//  *   token: "abc123"
//  * }
//  * ```
//  *
//  * @category schemas
//  * @since 0.1.0
//  */
// export class PathParams extends S.Class<PathParams>($I`PathParams`)(
//   {
//     token: S.String,
//   }
// ) {}

// ============================================================================
// Contract Definition
// ============================================================================

/**
 * HttpApiEndpoint contract for [endpoint-name].
 *
 * @example
 * ```typescript
 * import { V1 } from "@beep/iam-domain/api"
 *
 * // Used in group definition:
 * // HttpApiGroup.make("iam.[group]").add(V1.[Group].[Endpoint].Contract)
 * ```
 *
 * @category constructors
 * @since 0.1.0
 */
export const Contract = HttpApiEndpoint.post("[endpoint-name]", "/[path]")
  .setPayload(Payload)
  // TODO: Uncomment appropriate method based on endpoint type:
  // .setUrlParams(UrlParams)   // For GET with query params
  // .setPath(PathParams)       // For routes with path params
  .addSuccess(Success)
  .addError(
    IamAuthError.annotations(
      $I.annotations("[Endpoint]Error", {
        description: "Error during [endpoint-name]",
      })
    )
  );
````

### Infra Handler Stub Template

````typescript
/**
 * @module [endpoint-name]
 *
 * Handler implementation for the [endpoint-name] endpoint.
 *
 * ## Implementation Notes
 * - Calls `auth.api.[methodName]()` from Better Auth
 * - Forwards cookies from Better Auth response
 * - Decodes response using domain Success schema
 *
 * ## Spec Reference
 * - Domain: `packages/iam/domain/src/api/v1/[group]/[endpoint].ts`
 * - Spec: `.specs/better-auth-specs/[CATEGORY].md#[anchor]`
 *
 * @category exports
 * @since 0.1.0
 */

import { IamAuthError, V1 } from "@beep/iam-domain/api";
import { Auth } from "@beep/iam-server";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as HttpServerResponse from "@effect/platform/HttpServerResponse";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";
import type { Common } from "../../common";

// ============================================================================
// Handler Type
// ============================================================================

/**
 * Handler effect type for [endpoint-name].
 *
 * @category models
 * @since 0.1.0
 */
type HandlerEffect = Common.HandlerEffect<V1.[Group].[Endpoint].Payload>;
// TODO: For GET requests, use UrlParams instead:
// type HandlerEffect = Common.HandlerEffect<V1.[Group].[Endpoint].UrlParams>;

// ============================================================================
// Handler Implementation
// ============================================================================

/**
 * Handler for the [endpoint-name] endpoint.
 *
 * @example
 * ```typescript
 * import { [Endpoint] } from "@beep/iam-server/api/v1/[group]"
 *
 * // Used in group Routes:
 * // HttpApiBuilder.group(IamApi, "iam.[group]", (h) =>
 * //   h.handle("[endpoint-name]", [Endpoint].Handler)
 * // )
 * ```
 *
 * @category constructors
 * @since 0.1.0
 */
export const Handler: HandlerEffect = Effect.fn("[Endpoint]Name")(function* ({ payload }) {
  const auth = yield* Auth.Service;
  const request = yield* HttpServerRequest.HttpServerRequest;

  // TODO: Implement handler logic
  // 1. Call Better Auth API method
  // 2. Decode response
  // 3. Forward set-cookie header
  //
  // Template:
  // const { headers, response } = yield* F.pipe(
  //   Effect.Do,
  //   Effect.bind("result", () =>
  //     Effect.tryPromise(() =>
  //       auth.api.[methodName]({
  //         body: {
  //           // Map payload fields to Better Auth API
  //           // Use Redacted.value() for sensitive fields
  //         },
  //         headers: request.headers,
  //         returnHeaders: true,
  //       })
  //     )
  //   ),
  //   Effect.bindAll(({ result }) => ({
  //     headers: Effect.succeed(result.headers),
  //     response: S.decodeUnknown(V1.[Group].[Endpoint].Success)(result.response),
  //   }))
  // );
  //
  // const setCookie = headers.get("set-cookie");
  //
  // return yield* F.pipe(
  //   response,
  //   HttpServerResponse.json,
  //   Effect.map((jsonResponse) =>
  //     setCookie
  //       ? F.pipe(jsonResponse, HttpServerResponse.setHeader("set-cookie", setCookie))
  //       : jsonResponse
  //   )
  // );

  // Placeholder - will fail type check until implemented
  return yield* Effect.fail(new Error("Not implemented"));
}, IamAuthError.flowMap("[endpoint-name]"));
````

### Group File Updates

When boilerplating, also update the group files:

**Domain Group (`_group.ts`)**:
```typescript
// Add import at top
import * as NewEndpoint from "./new-endpoint.ts";

// Add to class chain
export class Group extends HttpApiGroup.make("iam.[groupName]")
  .add(ExistingEndpoint.Contract)
  .add(NewEndpoint.Contract)  // ← Add new contract
  .prefix("/[group-path]") {}

// Add to exports
export { ExistingEndpoint, NewEndpoint };
```

**Infra Group (`_group.ts`)**:
```typescript
// Add import at top
import * as NewEndpoint from "./new-endpoint.ts";

// Add to Routes chain
export const Routes: Routes = HttpApiBuilder.group(IamApi, "iam.[groupName]", (h) =>
  h.handle("existing-endpoint", ExistingEndpoint.Handler)
   .handle("new-endpoint", NewEndpoint.Handler)  // ← Add new handler
);
```

### Execution Order

1. **Read milestone document**: Identify all endpoints to boilerplate
2. **For each endpoint**:
   a. Read spec from Phase 1 docs (`.specs/better-auth-specs/[CATEGORY].md`)
   b. Create domain contract stub with filled-in metadata
   c. Create infra handler stub with filled-in metadata
   d. Update group files with imports and registrations
3. **Verify structure**: Run `bun run check` (expect errors for TODO placeholders—that's OK)
4. **Mark milestone as BOILERPLATED** in `PLAN.md`

### Boilerplate Quality Checklist

For each stub file, verify:

- [ ] Module-level JSDoc with spec reference
- [ ] `@category`, `@example`, `@since` on all exports
- [ ] Correct import statements
- [ ] TODO comments with spec field references
- [ ] Section separators (`// ====...`) for readability
- [ ] Placeholder values that will fail type check (ensures implementation is required)

### Success Criteria

- [ ] All endpoint stubs created for target milestone
- [ ] All group files updated with imports/registrations
- [ ] JSDoc documentation complete on all exports
- [ ] `bun run check` runs (failures expected for unimplemented TODOs)
- [ ] Milestone status updated to `BOILERPLATED` in PLAN.md

### Milestone Status Progression

```
PENDING → BOILERPLATED → IN_PROGRESS → COMPLETE
```

| Status | Meaning |
|--------|---------|
| `PENDING` | Not started |
| `BOILERPLATED` | Stub files created, ready for implementation |
| `IN_PROGRESS` | Implementation agent is filling in TODOs |
| `COMPLETE` | All checks pass, endpoints functional |

---

## Error Handling

### If OpenAPI spec has malformed data:
1. Document the issue in the relevant category file
2. Mark affected endpoint with `[NEEDS CLARIFICATION]`
3. Continue with other endpoints
4. Report issues in README.md

### If existing implementation differs from patterns:
1. Prefer existing implementation patterns (they're tested)
2. Update PATTERNS.md if existing code is clearly better
3. Document any deviations with rationale

### If build/check fails:
1. Isolate the failing endpoint
2. Comment out the failing code temporarily
3. Continue with other endpoints
4. Return to fix after gathering more context

---

## Implementation Agent Instructions

### For Boilerplating Agents

When creating stub files:

1. **Identify target**: Read `PLAN.md` → find next `PENDING` milestone
2. **Load context**: Read milestone document + Phase 1 spec doc
3. **Create stubs**: Use Domain Contract Stub Template and Infra Handler Stub Template
4. **Fill metadata**: Replace `[placeholders]` with actual endpoint details from spec
5. **Update groups**: Add imports and registrations to `_group.ts` files
6. **Verify structure**: Run `bun run check` (errors OK—stubs have intentional failures)
7. **Update PLAN.md**: Change milestone status to `BOILERPLATED`

### For Implementation Agents

When filling in stub implementations:

1. **Identify target**: Read `PLAN.md` → find next `BOILERPLATED` milestone
2. **Load context**: Read stub files (they contain all needed spec info in JSDoc)
3. **Implement systematically**: Follow TODO comments in each file
4. **Verify incrementally**: Run `bun run check` after each endpoint
5. **Update status**: Mark completed items in milestone doc
6. **Final verification**: Run full build before marking milestone COMPLETE
7. **Update PLAN.md**: Change milestone status to `COMPLETE`

### Key Insight

**Boilerplating agents** work from Phase 1 spec docs → create stubs with JSDoc.
**Implementation agents** work from stub files → don't need to read specs.

This separation reduces context requirements and parallelizes work.

### Commands Reference

```bash
# Type checking
bun run check

# Package build
bun run build --filter=@beep/iam-domain --filter=@beep/iam-server

# Full workspace build
bun run build

# Lint fix
bun run lint:fix
```
