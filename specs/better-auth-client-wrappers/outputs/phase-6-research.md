# Phase 6 Research: Organization + API Key + Anonymous Methods

> Research completed: 2026-01-22

---

## Organization Category Methods

### 1. checkSlug (Query-wrapped → Standard POST)

**Client call**: `client.organization.checkSlug({ slug })`
**Method**: POST `/organization/check-slug`
**mutatesSession**: `false`

**Payload**:
```typescript
{
  slug: S.String
}
```

**Response**:
```typescript
{
  status: S.Boolean  // true if available
}
```

---

### 2. getInvitation (Query-wrapped)

**Client call**: `client.organization.getInvitation({ query: { invitationId } })`
**Method**: GET `/organization/get-invitation`
**mutatesSession**: `false`

**Payload**:
```typescript
{
  invitationId: S.String
}
```

**Response**: Invitation schema (id, organizationId, email, role, status, etc.)

---

### 3. listUserInvitations (No-payload)

**Client call**: `client.organization.listUserInvitations()`
**Method**: GET `/organization/list-user-invitations`
**mutatesSession**: `false`

**Response**: Array of invitations for current user

---

### 4. getActiveMember (No-payload)

**Client call**: `client.organization.getActiveMember()`
**Method**: GET `/organization/get-active-member`
**mutatesSession**: `false`

**Response**:
```typescript
{
  id: S.String,
  organizationId: S.String,
  userId: S.String,
  role: S.String,
  createdAt: BS.DateFromAllAcceptable,
  teamId: S.optional(S.String),  // if teams enabled
  user: { id, name, email, image }
} | null
```

---

### 5. getActiveMemberRole (No-payload / optional query)

**Client call**: `client.organization.getActiveMemberRole()` or `client.organization.getActiveMemberRole({ query: {...} })`
**Method**: GET `/organization/get-active-member-role`
**mutatesSession**: `false`

**Optional Query**:
```typescript
{
  userId: S.optional(S.String),
  organizationId: S.optional(S.String),
  organizationSlug: S.optional(S.String)
}
```

**Response**:
```typescript
{
  role: S.String
}
```

---

### 6. addMember (Standard)

**Client call**: `client.organization.addMember(payload)`
**Method**: POST `/organization/add-member`
**mutatesSession**: `true`

**Payload**:
```typescript
{
  userId: S.String,
  role: S.Union(S.String, S.mutable(S.Array(S.String))),
  organizationId: S.optional(S.String),
  teamId: S.optional(S.String)  // if teams enabled
}
```

**Response**: Member object or null

---

### 7. leave (Standard)

**Client call**: `client.organization.leave({ organizationId })`
**Method**: POST `/organization/leave`
**mutatesSession**: `true`

**Payload**:
```typescript
{
  organizationId: S.String
}
```

**Response**: Member object (the one leaving)

---

### 8. createRole (Standard)

**Client call**: `client.organization.createRole(payload)`
**Method**: POST `/organization/create-role`
**mutatesSession**: `true` (adds role to org)

**Payload**:
```typescript
{
  organizationId: S.optional(S.String),
  role: S.String,
  permission: S.Record({ key: S.String, value: S.mutable(S.Array(S.String)) })
}
```

**Response**:
```typescript
{
  success: S.Boolean,
  roleData: {
    id: S.String,
    organizationId: S.String,
    role: S.String,
    permission: S.Record({ key: S.String, value: S.Array(S.String) }),
    createdAt: BS.DateFromAllAcceptable,
    updatedAt: S.optional(BS.DateFromAllAcceptable)
  },
  statements: S.Unknown
}
```

---

### 9. deleteRole (Standard)

**Client call**: `client.organization.deleteRole(payload)`
**Method**: POST `/organization/delete-role`
**mutatesSession**: `true`

**Payload** (union - either roleName OR roleId):
```typescript
{
  organizationId: S.optional(S.String),
  roleName: S.optional(S.String),
  roleId: S.optional(S.String)
}
```

**Response**:
```typescript
{
  success: S.Boolean
}
```

---

### 10. listRoles (No-payload / optional query)

**Client call**: `client.organization.listRoles()` or `client.organization.listRoles({ query: {...} })`
**Method**: GET `/organization/list-roles`
**mutatesSession**: `false`

**Optional Query**:
```typescript
{
  organizationId: S.optional(S.String)
}
```

**Response**: Array of role objects

---

### 11. getRole (Query-wrapped)

**Client call**: `client.organization.getRole({ query: {...} })`
**Method**: GET `/organization/get-role`
**mutatesSession**: `false`

**Payload**:
```typescript
{
  organizationId: S.optional(S.String),
  roleName: S.optional(S.String),
  roleId: S.optional(S.String)
}
```

**Response**: Role object

---

### 12. updateRole (Standard)

**Client call**: `client.organization.updateRole(payload)`
**Method**: POST `/organization/update-role`
**mutatesSession**: `true`

**Payload**:
```typescript
{
  organizationId: S.optional(S.String),
  data: {
    permission: S.optional(S.Record({ key: S.String, value: S.mutable(S.Array(S.String)) })),
    roleName: S.optional(S.String)
  },
  // Either roleName or roleId
  roleName: S.optional(S.String),
  roleId: S.optional(S.String)
}
```

**Response**:
```typescript
{
  success: S.Boolean,
  roleData: OrganizationRole
}
```

---

### 13. createTeam (Standard)

**Client call**: `client.organization.createTeam(payload)`
**Method**: POST `/organization/create-team`
**mutatesSession**: `true`

**Payload**:
```typescript
{
  name: S.String,
  organizationId: S.optional(S.String)
}
```

**Response**: Team object
```typescript
{
  id: S.String,
  name: S.String,
  organizationId: S.String,
  createdAt: BS.DateFromAllAcceptable,
  updatedAt: S.optional(BS.DateFromAllAcceptable)
}
```

---

### 14. listTeams (No-payload / optional query)

**Client call**: `client.organization.listTeams()` or `client.organization.listTeams({ query: {...} })`
**Method**: GET `/organization/list-teams`
**mutatesSession**: `false`

**Optional Query**:
```typescript
{
  organizationId: S.optional(S.String)
}
```

**Response**: Array of team objects

---

### 15. updateTeam (Standard)

**Client call**: `client.organization.updateTeam(payload)`
**Method**: POST `/organization/update-team`
**mutatesSession**: `true`

**Payload**:
```typescript
{
  teamId: S.String,
  data: {
    name: S.optional(S.String),
    organizationId: S.optional(S.String)
  }
}
```

**Response**: Team object or null

---

### 16. removeTeam (Standard)

**Client call**: `client.organization.removeTeam(payload)`
**Method**: POST `/organization/remove-team`
**mutatesSession**: `true`

**Payload**:
```typescript
{
  teamId: S.String,
  organizationId: S.optional(S.String)
}
```

**Response**:
```typescript
{
  message: S.String
} | null
```

---

### 17. setActiveTeam (Standard)

**Client call**: `client.organization.setActiveTeam(payload)`
**Method**: POST `/organization/set-active-team`
**mutatesSession**: `true`

**Payload**:
```typescript
{
  teamId: S.optionalWith(S.String, { nullable: true })
}
```

**Response**: Team object or null

---

### 18. listUserTeams (No-payload)

**Client call**: `client.organization.listUserTeams()`
**Method**: GET `/organization/list-user-teams`
**mutatesSession**: `false`

**Response**: Array of team objects

---

### 19. addTeamMember (Standard)

**Client call**: `client.organization.addTeamMember(payload)`
**Method**: POST `/organization/add-team-member`
**mutatesSession**: `true`

**Payload**:
```typescript
{
  teamId: S.String,
  userId: S.String
}
```

**Response**: TeamMember object
```typescript
{
  id: S.String,
  teamId: S.String,
  userId: S.String,
  createdAt: BS.DateFromAllAcceptable
}
```

---

### 20. removeTeamMember (Standard)

**Client call**: `client.organization.removeTeamMember(payload)`
**Method**: POST `/organization/remove-team-member`
**mutatesSession**: `true`

**Payload**:
```typescript
{
  teamId: S.String,
  userId: S.String
}
```

**Response**:
```typescript
{
  message: S.String
}
```

---

### 21. hasPermission (Standard) - REPLACES checkRolePermission

**Client call**: `client.organization.hasPermission(payload)`
**Method**: POST `/organization/has-permission`
**mutatesSession**: `false`

**Note**: `checkRolePermission` from orchestrator is actually a client-side only function. The server-side equivalent is `hasPermission`.

**Payload**:
```typescript
{
  permission: S.Record({ key: S.String, value: S.mutable(S.Array(S.String)) }),
  organizationId: S.optional(S.String)
}
```

**Response**:
```typescript
{
  success: S.Boolean
}
```

---

## Anonymous Category Methods

### 22. deleteAnonymousUser (Standard)

**Client call**: `client.anonymous.deleteAnonymousUser()`
**Method**: POST `/delete-anonymous-user`
**mutatesSession**: `true` (invalidates session)

**Payload**: None (requires session)

**Response**:
```typescript
{
  success: S.Boolean
}
```

---

## API Key Category Methods

### 23. create (Standard)

**Client call**: `client.apiKey.create(payload)`
**Method**: POST `/api-key/create`
**mutatesSession**: `false`

**Payload**:
```typescript
{
  name: S.optional(S.String),
  expiresIn: S.optional(S.Number),  // milliseconds
  userId: S.optional(S.String),
  prefix: S.optional(S.String),
  remaining: S.optional(S.Number),
  metadata: S.optional(S.Unknown),
  refillAmount: S.optional(S.Number),
  refillInterval: S.optional(S.Number),
  rateLimitTimeWindow: S.optional(S.Number),
  rateLimitMax: S.optional(S.Number),
  rateLimitEnabled: S.optional(S.Boolean),
  permissions: S.optional(S.Record({ key: S.String, value: S.mutable(S.Array(S.String)) }))
}
```

**Response**: Full ApiKey object including the `key` field (only time key is returned)

---

### 24. get (Query-wrapped)

**Client call**: `client.apiKey.get({ query: { id } })`
**Method**: GET `/api-key/get`
**mutatesSession**: `false`

**Payload**:
```typescript
{
  id: S.String
}
```

**Response**: ApiKey object (without key field)

---

### 25. update (Standard)

**Client call**: `client.apiKey.update(payload)`
**Method**: POST `/api-key/update`
**mutatesSession**: `false`

**Payload**:
```typescript
{
  keyId: S.String,
  userId: S.optional(S.String),
  name: S.optional(S.String),
  enabled: S.optional(S.Boolean),
  remaining: S.optional(S.Number),
  refillAmount: S.optional(S.Number),
  refillInterval: S.optional(S.Number),
  metadata: S.optional(S.Unknown),
  expiresIn: S.optionalWith(S.Number, { nullable: true }),
  rateLimitEnabled: S.optional(S.Boolean),
  rateLimitTimeWindow: S.optional(S.Number),
  rateLimitMax: S.optional(S.Number),
  permissions: S.optionalWith(S.Record({ key: S.String, value: S.mutable(S.Array(S.String)) }), { nullable: true })
}
```

**Response**: Updated ApiKey object

---

### 26. delete (Standard)

**Client call**: `client.apiKey.delete({ keyId })`
**Method**: POST `/api-key/delete`
**mutatesSession**: `false`

**Payload**:
```typescript
{
  keyId: S.String
}
```

**Response**:
```typescript
{
  success: S.Boolean
}
```

---

### 27. list (No-payload)

**Client call**: `client.apiKey.list()`
**Method**: GET `/api-key/list`
**mutatesSession**: `false`

**Response**: Array of ApiKey objects

---

## Shared Schema Definitions

### ApiKey Schema
```typescript
{
  id: S.String,
  name: S.optionalWith(S.String, { nullable: true }),
  start: S.optionalWith(S.String, { nullable: true }),
  prefix: S.optionalWith(S.String, { nullable: true }),
  key: S.optional(S.String),  // only on create response
  userId: S.String,
  refillInterval: S.optionalWith(S.Number, { nullable: true }),
  refillAmount: S.optionalWith(S.Number, { nullable: true }),
  lastRefillAt: S.optionalWith(BS.DateFromAllAcceptable, { nullable: true }),
  enabled: S.Boolean,
  rateLimitEnabled: S.Boolean,
  rateLimitTimeWindow: S.optionalWith(S.Number, { nullable: true }),
  rateLimitMax: S.optionalWith(S.Number, { nullable: true }),
  requestCount: S.Number,
  remaining: S.optionalWith(S.Number, { nullable: true }),
  lastRequest: S.optionalWith(BS.DateFromAllAcceptable, { nullable: true }),
  expiresAt: S.optionalWith(BS.DateFromAllAcceptable, { nullable: true }),
  createdAt: BS.DateFromAllAcceptable,
  updatedAt: BS.DateFromAllAcceptable,
  metadata: S.optionalWith(S.Record({ key: S.String, value: S.Unknown }), { nullable: true }),
  permissions: S.optionalWith(S.Record({ key: S.String, value: S.Array(S.String) }), { nullable: true })
}
```

### Team Schema
```typescript
{
  id: S.String,
  name: S.String,
  organizationId: S.String,
  createdAt: BS.DateFromAllAcceptable,
  updatedAt: S.optional(BS.DateFromAllAcceptable)
}
```

### TeamMember Schema
```typescript
{
  id: S.String,
  teamId: S.String,
  userId: S.String,
  createdAt: BS.DateFromAllAcceptable
}
```

### OrganizationRole Schema
```typescript
{
  id: S.String,
  organizationId: S.String,
  role: S.String,
  permission: S.Record({ key: S.String, value: S.Array(S.String) }),
  createdAt: BS.DateFromAllAcceptable,
  updatedAt: S.optional(BS.DateFromAllAcceptable)
}
```

---

## Notes

1. **SCIM generateToken**: Not found in organization plugin client types. May require separate plugin or server-only. **SKIPPED**.

2. **checkRolePermission**: This is a **client-side only** function in Better Auth. It doesn't make a network call. **Replaced with `hasPermission`** which is a server endpoint.

3. **Query-wrapped methods**: `getInvitation`, `getRole`, `apiKey.get` require `{ query: payload }` wrapper.

4. **No-payload methods**: `listUserInvitations`, `getActiveMember`, `listUserTeams`, `apiKey.list`, `deleteAnonymousUser` don't take payload.

5. **Session-mutating methods** (mutatesSession: true):
   - addMember, leave
   - createRole, deleteRole, updateRole
   - createTeam, removeTeam, updateTeam, setActiveTeam
   - addTeamMember, removeTeamMember
   - deleteAnonymousUser

6. **Total Methods**: 27 (21 org + 1 anonymous + 5 api-key)
