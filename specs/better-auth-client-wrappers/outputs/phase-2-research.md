# Phase 2 Research: Admin Methods (7 methods)

> Research completed 2026-01-22

---

## Method 10: admin.setRole

| Field | Value |
|-------|-------|
| Pattern | Standard |
| mutatesSession | `false` |
| Client Path | `client.admin.setRole(encoded)` |
| Category | `Admin/SetRole` |
| Schema ID | `$IamClientId.create("admin/set-role")` |

**Payload:**
```typescript
{
  userId: S.optional(S.String),  // User to modify (optional per docs)
  role: S.Union(S.String, S.Array(S.String)),  // Can be single or array
}
```

**Success:**
```typescript
{
  user: Common.DomainUserFromBetterAuthUser
}
```

**Notes:** Role can be a string or array of strings.

---

## Method 11: admin.createUser

| Field | Value |
|-------|-------|
| Pattern | Standard |
| mutatesSession | `false` |
| Client Path | `client.admin.createUser(encoded)` |
| Category | `Admin/CreateUser` |
| Schema ID | `$IamClientId.create("admin/create-user")` |

**Payload:**
```typescript
{
  email: S.String,
  password: S.Redacted(S.String),  // Sensitive
  name: S.String,
  role: S.optional(S.Union(S.String, S.Array(S.String))),
  data: S.optional(S.Record({ key: S.String, value: S.Unknown })),
}
```

**Success:**
```typescript
{
  user: Common.DomainUserFromBetterAuthUser
}
```

**Notes:** Password is sensitive, use S.Redacted. Supports custom data fields.

---

## Method 12: admin.updateUser

| Field | Value |
|-------|-------|
| Pattern | Standard |
| mutatesSession | `false` |
| Client Path | `client.admin.updateUser(encoded)` |
| Category | `Admin/UpdateUser` |
| Schema ID | `$IamClientId.create("admin/update-user")` |

**Payload:**
```typescript
{
  userId: S.String,  // Required
  data: S.Record({ key: S.String, value: S.Unknown }),  // Fields to update
}
```

**Success:**
```typescript
{
  user: Common.DomainUserFromBetterAuthUser
}
```

**Notes:** Uses `data` object for flexible field updates.

---

## Method 13: admin.listUsers

| Field | Value |
|-------|-------|
| Pattern | **Query-wrapped** |
| mutatesSession | `false` |
| Client Path | `client.admin.listUsers({ query: encoded })` |
| Category | `Admin/ListUsers` |
| Schema ID | `$IamClientId.create("admin/list-users")` |

**Payload (Query Parameters):**
```typescript
{
  searchValue: S.optional(S.String),
  searchField: S.optional(S.Literal("email", "name")),
  searchOperator: S.optional(S.Literal("contains", "starts_with", "ends_with")),
  limit: S.optional(S.Union(S.String, S.Number)),
  offset: S.optional(S.Union(S.String, S.Number)),
  sortBy: S.optional(S.String),
  sortDirection: S.optional(S.Literal("asc", "desc")),
  filterField: S.optional(S.String),
  filterValue: S.optional(S.Union(S.String, S.Number, S.Boolean)),
  filterOperator: S.optional(S.Literal("eq", "ne", "lt", "lte", "gt", "gte")),
}
```

**Success:**
```typescript
{
  users: S.Array(Common.DomainUserFromBetterAuthUser),
  total: S.Number,
  limit: S.optional(S.Number),
  offset: S.optional(S.Number),
}
```

**Notes:** QUERY-WRAPPED - use `{ query: encoded }`. Has pagination + filter + sort.

---

## Method 14: admin.listUserSessions

| Field | Value |
|-------|-------|
| Pattern | Standard |
| mutatesSession | `false` |
| Client Path | `client.admin.listUserSessions(encoded)` |
| Category | `Admin/ListUserSessions` |
| Schema ID | `$IamClientId.create("admin/list-user-sessions")` |

**Payload:**
```typescript
{
  userId: S.String,  // Required
}
```

**Success:**
```typescript
S.Array(Common.DomainSessionFromBetterAuthSession)
```

**Notes:** Returns array of sessions directly. NOT query-wrapped (unlike listUsers).

---

## Method 15: admin.unbanUser

| Field | Value |
|-------|-------|
| Pattern | Standard |
| mutatesSession | `false` |
| Client Path | `client.admin.unbanUser(encoded)` |
| Category | `Admin/UnbanUser` |
| Schema ID | `$IamClientId.create("admin/unban-user")` |

**Payload:**
```typescript
{
  userId: S.String,  // Required
}
```

**Success:**
```typescript
{
  user: Common.DomainUserFromBetterAuthUser
}
```

---

## Method 16: admin.banUser

| Field | Value |
|-------|-------|
| Pattern | Standard |
| mutatesSession | `false` |
| Client Path | `client.admin.banUser(encoded)` |
| Category | `Admin/BanUser` |
| Schema ID | `$IamClientId.create("admin/ban-user")` |

**Payload:**
```typescript
{
  userId: S.String,  // Required
  banReason: S.optional(S.String),
  banExpiresIn: S.optional(S.Number),  // Duration in seconds
}
```

**Success:**
```typescript
{
  user: Common.DomainUserFromBetterAuthUser
}
```

**Notes:** banExpiresIn is in seconds. Omit for permanent ban.

---

## Summary

| # | Method | Pattern | Query-Wrapped |
|---|--------|---------|---------------|
| 10 | setRole | Standard | No |
| 11 | createUser | Standard | No |
| 12 | updateUser | Standard | No |
| 13 | listUsers | Query-wrapped | **Yes** |
| 14 | listUserSessions | Standard | **No** |
| 15 | unbanUser | Standard | No |
| 16 | banUser | Standard | No |

**All methods**: `mutatesSession: false` (admin operations don't affect current session)

## Implementation Notes

- **Role schemas**: Use `S.mutable(S.Array(...))` for role arrays to match Better Auth's mutable types
- **listUsers** uses `{ query: encoded }` pattern
- **listUserSessions** does NOT use query wrapping - passes `encoded` directly
- **password in createUser**: Use `S.optional(S.String)` - Better Auth expects plain string, not Redacted
