# Handoff: Phase 6 Completion - Organization + API Key + Anonymous

> Implemented 26 better-auth client wrappers for Organization extensions, API Key, and Anonymous categories

---

## Phase Summary

| Metric | Value |
|--------|-------|
| Methods Implemented | 26 (organization roles/teams/access, api-key, anonymous) |
| Methods Removed | 1 (`addMember` - doesn't exist on client, use invitation flow) |
| Workflow | 3-stage batched approach |
| Predecessor | Phase 5 (COMPLETED) |

---

## Completed Implementations

### Organization Access (7 methods)

| Method | Handler | Notes |
|--------|---------|-------|
| `checkSlug` | ✅ | `mutatesSession: false` |
| `getInvitation` | ✅ | Query-wrapped `{ query: { id } }` |
| `listUserInvitations` | ✅ | No-payload handler |
| `getActiveMember` | ✅ | No-payload handler |
| `getActiveMemberRole` | ✅ | No-payload handler (custom type extraction) |
| `leave` | ✅ | `mutatesSession: true` |
| `hasPermission` | ✅ | `mutatesSession: false` |

**Removed:** `addMember` - Does not exist on Better Auth client. Members are added via invitation flow: `inviteMember` → `acceptInvitation`

### Organization Roles (5 methods)

| Method | Handler | Notes |
|--------|---------|-------|
| `createRole` | ✅ | Type cast required for `additionalFields` |
| `deleteRole` | ✅ | Standard handler |
| `listRoles` | ✅ | Query-wrapped `{ query: encodedPayload }` |
| `getRoleById` | ✅ | Query-wrapped `{ query: { roleId } }` |
| `updateRole` | ✅ | Type cast required for Better Auth types |

### Organization Teams (8 methods)

| Method | Handler | Notes |
|--------|---------|-------|
| `createTeam` | ✅ | `mutatesSession: false` |
| `listTeams` | ✅ | Query-wrapped `{ query: encodedPayload }` |
| `updateTeam` | ✅ | Standard handler |
| `removeTeam` | ✅ | `mutatesSession: false` |
| `setActiveTeam` | ✅ | `mutatesSession: true` |
| `listUserTeams` | ✅ | No-payload handler |
| `addTeamMember` | ✅ | Standard handler |
| `removeTeamMember` | ✅ | Standard handler |

### API Key (5 methods)

| Method | Handler | Notes |
|--------|---------|-------|
| `apiKey.create` | ✅ | Returns `ApiKeyWithKey` (includes full key) |
| `apiKey.get` | ✅ | Query-wrapped `{ query: { id } }` |
| `apiKey.update` | ✅ | Standard handler |
| `apiKey.delete` | ✅ | Standard handler |
| `apiKey.list` | ✅ | No-payload, returns array |

### Anonymous (1 method)

| Method | Handler | Notes |
|--------|---------|-------|
| `deleteAnonymousUser` | ✅ | Top-level method (not under `anonymous` namespace), `mutatesSession: true` |

---

## New Shared Schemas (`_internal/`)

| Schema File | Exports |
|-------------|---------|
| `role.schemas.ts` | `Permission`, `OrganizationRole` |
| `team.schemas.ts` | `Team`, `TeamMember` |
| `api-key.schemas.ts` | `ApiKey`, `ApiKeyWithKey` |

---

## Layer Structure

### Organization (extended)

```
organization/
├── layer.ts              # Updated: includes Access, Roles, Teams groups
├── access/
│   ├── layer.ts          # OrganizationAccessGroup (7 handlers)
│   └── mod.ts
├── roles/
│   ├── layer.ts          # OrganizationRolesGroup (5 handlers)
│   └── mod.ts
└── teams/
    ├── layer.ts          # OrganizationTeamsGroup (8 handlers)
    └── mod.ts
```

### API Key (new)

```
api-key/
├── layer.ts              # ApiKeyGroup (5 handlers)
├── mod.ts
├── index.ts
├── create/
├── get/
├── update/
├── delete/
└── list/
```

### Anonymous (new)

```
anonymous/
├── layer.ts              # AnonymousGroup (1 handler)
├── mod.ts
├── index.ts
└── delete-user/
```

---

## Key Learnings

### API Quirks Discovered

1. **`deleteAnonymousUser`**: Located at `client.deleteAnonymousUser()`, NOT `client.anonymous.deleteAnonymousUser()`

2. **`getInvitation`**: Expects `{ query: { id: string } }`, NOT `{ invitationId: string }`

3. **Organization Roles**: Better Auth types require `additionalFields` property even when empty - used type cast workaround

4. **`addMember`**: Does NOT exist on the client API. The proper flow is:
   - `inviteMember({ email, role })` → creates invitation
   - `acceptInvitation({ invitationId })` → user accepts and becomes member

5. **`getActiveMemberRole`**: Returns `{ role: string }` but uses `useActiveMemberRole` React hook - custom handler needed

### Handler Patterns Used

| Pattern | Example | When to Use |
|---------|---------|-------------|
| Standard | `(encoded) => client.method(encoded)` | POST with body |
| Query-wrapped | `(encoded) => client.method({ query: encoded })` | GET with query params |
| No-payload | `() => client.method()` | GET with no params |
| Type-cast | `(encoded) => client.method(encoded as Params)` | Better Auth type mismatch |

---

## Files Modified

### Main Index
- `src/index.ts` - Added `Anonymous`, `ApiKey` exports

### Organization Layer
- `src/organization/layer.ts` - Added `OrganizationAccessGroup`, `OrganizationRolesGroup`, `OrganizationTeamsGroup`
- `src/organization/mod.ts` - Added `Access`, `Roles`, `Teams` submodule exports

---

## Verification Commands

```bash
# Type check (should pass)
bun run check --filter @beep/iam-client

# Lint check
bun run lint --filter @beep/iam-client
```

---

## All Wrappers Now Implemented

| Category | Count | Status |
|----------|-------|--------|
| core | 10 | ✅ |
| sign-in | 5+ | ✅ |
| sign-up | 1 | ✅ |
| password | 3 | ✅ |
| two-factor | 8 | ✅ |
| admin | 15 | ✅ |
| passkey | 4 | ✅ |
| phone-number | 4 | ✅ |
| one-time-token | 2 | ✅ |
| sso | 3 | ✅ |
| oauth2 | 4 | ✅ |
| device | 3 | ✅ |
| jwt | 3 | ✅ |
| organization (full) | 23 | ✅ |
| api-key | 5 | ✅ |
| anonymous | 1 | ✅ |

**Total: ~90+ better-auth client wrappers implemented across all phases.**

---

## Next Steps

1. **Integration Testing**: Write tests for the new handlers with mocked Better Auth client
2. **Documentation**: Update `AGENTS.md` with new module structure
3. **UI Integration**: Use these wrappers in UI components for organization management, API keys, etc.
