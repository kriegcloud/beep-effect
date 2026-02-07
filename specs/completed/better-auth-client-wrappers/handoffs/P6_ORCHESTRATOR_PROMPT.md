# Phase 6 Orchestrator Prompt

> Copy this entire prompt to start a new session for Phase 6

---

## Mission

Implement 29 better-auth client wrappers for Organization and API-key categories using the 3-stage batched workflow.

---

## Context Files (Read First)

```
specs/better-auth-client-wrappers/handoffs/HANDOFF_P6.md
specs/better-auth-client-wrappers/outputs/method-implementation-guide.md
specs/better-auth-client-wrappers/outputs/phase-0-pattern-analysis.md
```

---

## Pre-Flight Check

```bash
bun run check --filter @beep/iam-client
```

**If this fails, fix existing issues before proceeding.**

---

## Methods to Implement

### Organization Category (24 methods)

| # | Method | Pattern | mutatesSession | Notes |
|---|--------|---------|----------------|-------|
| 62 | organization.checkSlug | Query-wrapped | `false` | Check if slug is available |
| 63 | organization.getInvitation | Query-wrapped | `false` | Get invitation by ID |
| 64 | organization.listUserInvitations | No-payload | `false` | List current user's invitations |
| 65 | organization.getActiveMember | No-payload | `false` | Get active org member |
| 66 | organization.getActiveMemberRole | No-payload | `false` | Get active member's role |
| 67 | organization.addMember | Standard | `true` | Add member to org |
| 68 | organization.leave | Standard | `true` | Leave organization |
| 69 | organization.checkRolePermission | Standard | `false` | Check permission |
| 70 | organization.createRole | Standard | `true` | Create custom role |
| 71 | organization.deleteRole | Standard | `true` | Delete role |
| 72 | organization.listRoles | No-payload | `false` | List org roles |
| 73 | organization.getRole | Query-wrapped | `false` | Get role by ID |
| 74 | organization.updateRole | Standard | `true` | Update role |
| 75 | organization.createTeam | Standard | `true` | Create team |
| 76 | organization.listTeams | No-payload | `false` | List teams |
| 77 | organization.updateTeam | Standard | `true` | Update team |
| 78 | organization.removeTeam | Standard | `true` | Remove team |
| 79 | organization.setActiveTeam | Standard | `true` | Set active team |
| 80 | organization.listUserTeams | No-payload | `false` | List user's teams |
| 81 | organization.addTeamMember | Standard | `true` | Add team member |
| 82 | organization.removeTeamMember | Standard | `true` | Remove team member |
| 83 | organization.scim.generateToken | Standard | `false` | Generate SCIM token |
| 84 | anonymous.deleteAnonymousUser | Standard | `true` | Delete anonymous user |

### API-key Category (5 methods)

| # | Method | Pattern | mutatesSession | Notes |
|---|--------|---------|----------------|-------|
| 85 | apiKey.create | Standard | `false` | Create API key |
| 86 | apiKey.get | Query-wrapped | `false` | Get API key |
| 87 | apiKey.update | Standard | `false` | Update API key |
| 88 | apiKey.delete | Standard | `false` | Delete API key |
| 89 | apiKey.list | No-payload | `false` | List API keys |

---

## 3-Stage Workflow

### Stage 1: Research All Methods

Create `outputs/phase-6-research.md` documenting for each method:
- Payload schema (fields and types)
- Response schema
- Special patterns: query-wrapped, no-payload, sensitive fields

**Checkpoint**: All methods documented before Stage 2.

### Stage 2: Create All Contracts

```bash
# Organization category (extend existing)
mkdir -p packages/iam/client/src/organization/{check-slug,get-invitation,list-user-invitations,get-active-member,get-active-member-role,add-member,leave,check-role-permission,create-role,delete-role,list-roles,get-role,update-role,create-team,list-teams,update-team,remove-team,set-active-team,list-user-teams,add-team-member,remove-team-member,scim-generate-token}

# API-key category (new)
mkdir -p packages/iam/client/src/api-key/{create,get,update,delete,list}

# Anonymous extension
mkdir -p packages/iam/client/src/anonymous/delete-user
```

Create all `contract.ts` files. **Checkpoint**:
```bash
bun run check --filter @beep/iam-client
```

### Stage 3: Handlers + Wire-up

1. Create all `handler.ts` files
2. Create `mod.ts` and `index.ts` (boilerplate)
3. Update `organization/layer.ts` with new handlers
4. Create `api-key/layer.ts`, `api-key/mod.ts`, `api-key/index.ts`
5. Create `anonymous/layer.ts`, `anonymous/mod.ts`, `anonymous/index.ts`
6. Update main `src/index.ts` to export `ApiKey`, `Anonymous`

**Checkpoint**:
```bash
bun run check --filter @beep/iam-client
```

---

## Pattern Reference

**Query-wrapped handler** (checkSlug, getInvitation, getRole, apiKey.get):
```typescript
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encodedPayload) => client.organization.checkSlug({ query: encodedPayload }))
);
```

**No-payload handler** (listUserInvitations, getActiveMember, listRoles, apiKey.list):
```typescript
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })(() => client.organization.listUserInvitations())
);
```

**Session-mutating handler** (addMember, leave, createRole, setActiveTeam):
```typescript
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: true,
  })((encodedPayload) => client.organization.addMember(encodedPayload))
);
```

---

## Key Learnings from P5

1. **Snake_case fields**: Better Auth often uses snake_case (client_id, redirect_uris). Match exactly.
2. **Mutable arrays**: Use `S.mutable(S.Array(...))` for arrays passed to Better Auth
3. **Nested updates**: Some methods use `{ id, update: {...} }` structure
4. **Literal types**: Use `S.Literal()` for enum-like fields, not `S.String`

---

## Success Criteria

- [ ] All 29 `contract.ts` created
- [ ] All 29 `handler.ts` created
- [ ] Organization category extended with new handlers
- [ ] `api-key/` category created with layer
- [ ] `anonymous/` category created with layer
- [ ] `bun run check --filter @beep/iam-client` passes
- [ ] `HANDOFF_P7.md` created (completion summary)

---

## Verification Commands

```bash
# Type check
bun run check --filter @beep/iam-client

# Lint fix
bun run lint:fix --filter @beep/iam-client
```
