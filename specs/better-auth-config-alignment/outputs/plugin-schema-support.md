# Plugin Schema Configuration Support

> Generated from Better Auth source code analysis (Phase 0 research)

---

## Schema Support Levels

Better Auth plugins have **heterogeneous** schema configuration support. The key distinction is:

- **`InferOptionSchema<T>`**: Only supports `modelName` + `fields` (column renaming) — **PARTIAL support**
- **Custom type with `additionalFields`**: Supports adding new fields — **FULL support**
- **Direct properties on options**: Minimal customization — **MINIMAL support**
- **No schema option**: Cannot configure schema — **NONE**

---

## Plugin Support Matrix

| Plugin | Support Level | Models Affected | additionalFields | Configuration Pattern |
|--------|---------------|-----------------|------------------|----------------------|
| **organization** | FULL | organization, member, invitation, team, teamMember, organizationRole | ✅ (5 of 6 models) | `organization({ schema: { organization: { additionalFields: {...} } } })` |
| **username** | PARTIAL | user | ❌ | `username({ schema: { user: { modelName?, fields? } } })` |
| **twoFactor** | PARTIAL | twoFactor | ❌ | `twoFactor({ schema: { twoFactor: { modelName?, fields? } } })` |
| **passkey** | PARTIAL | passkey | ❌ | `passkey({ schema: { passkey: { modelName?, fields? } } })` |
| **phoneNumber** | PARTIAL | user | ❌ | `phoneNumber({ schema: { user: { fields? } } })` |
| **anonymous** | PARTIAL | user | ❌ | `anonymous({ schema: { user: { fields? } } })` |
| **admin** | PARTIAL | user, session | ❌ | `admin({ schema: { user: { fields? }, session: { fields? } } })` |
| **stripe** | PARTIAL | subscription | ❌ | Uses `InferOptionSchema` |
| **sso** | MINIMAL | ssoProvider | ❌ | `sso({ modelName?: string, fields?: {...} })` |
| **siwe** | PARTIAL | walletAddress | ❌ | `siwe({ schema: { walletAddress: { modelName?, fields? } } })` |
| **jwt** | PARTIAL | jwks | ❌ | `jwt({ schema: { jwks: { modelName?, fields? } } })` |
| **oidcProvider** | PARTIAL | oauthApplication, oauthAccessToken, oauthConsent | ❌ | Uses `InferOptionSchema` |
| **deviceAuthorization** | PARTIAL | deviceCode | ❌ | Uses `InferOptionSchema` |
| **apiKey** | PARTIAL | apikey | ❌ | Uses `InferOptionSchema` |
| **lastLoginMethod** | NONE | user | ❌ | Uses `storeInDatabase` boolean only |

---

## Core Models (Full additionalFields Support)

Better Auth core models support `additionalFields` via the main auth options:

```typescript
const auth = betterAuth({
  user: {
    additionalFields: {
      // Your custom fields here
      displayName: { type: "string", required: false },
    }
  },
  session: {
    additionalFields: {
      // Your custom fields here
      deviceId: { type: "string", required: false },
    }
  },
  // Note: account does NOT support additionalFields in core options
});
```

---

## Organization Plugin Detail (FULL Support)

The organization plugin is the ONLY plugin with FULL `additionalFields` support across multiple models:

```typescript
organization({
  schema: {
    organization: {
      modelName?: string,
      fields?: { [fieldName]: string },  // Column renaming
      additionalFields?: { [fieldName]: DBFieldAttributeConfig }  // ✅ FULL
    },
    member: {
      modelName?: string,
      fields?: { [fieldName]: string },
      additionalFields?: { [fieldName]: DBFieldAttributeConfig }  // ✅ FULL
    },
    invitation: {
      modelName?: string,
      fields?: { [fieldName]: string },
      additionalFields?: { [fieldName]: DBFieldAttributeConfig }  // ✅ FULL
    },
    team: {
      modelName?: string,
      fields?: { [fieldName]: string },
      additionalFields?: { [fieldName]: DBFieldAttributeConfig }  // ✅ FULL
    },
    teamMember: {
      modelName?: string,
      fields?: { [fieldName]: string },
      // ⚠️ NO additionalFields for teamMember
    },
    organizationRole: {
      modelName?: string,
      fields?: { [fieldName]: string },
      additionalFields?: { [fieldName]: DBFieldAttributeConfig }  // ✅ FULL
    },
    session: {
      fields?: { [fieldName]: string },
      // ⚠️ NO additionalFields - only field renaming
    }
  }
})
```

---

## InferOptionSchema Pattern (PARTIAL Support)

Most plugins use `InferOptionSchema<T>` which only allows:

```typescript
{
  modelName?: string,  // Rename the table
  fields?: {
    [existingField: string]: string  // Rename a column
  }
}
```

This pattern does NOT support adding new fields. The type definition from `tmp/better-auth/packages/better-auth/src/types/plugins.ts`:

```typescript
export type InferOptionSchema<S extends BetterAuthPluginDBSchema> = {
  [K in keyof S]?: {
    modelName?: string;
    fields?: {
      [P in keyof S[K]["fields"]]?: string;
    };
  };
};
```

---

## Plugin-Specific Fields Added to User Model

Several plugins extend the user model with their own fields:

| Plugin | Fields Added to User | Type | Notes |
|--------|---------------------|------|-------|
| username | `username`, `displayName` | string | Optional fields |
| phoneNumber | `phoneNumber`, `phoneNumberVerified` | string, boolean | |
| anonymous | `isAnonymous` | boolean | |
| admin | `role`, `banned`, `banReason`, `banExpires` | string, boolean, string, date | |
| lastLoginMethod | `lastLoginMethod` | string | Only if `storeInDatabase: true` |

---

## Implications for beep-effect

### What CAN be configured:

1. **Core user/session additionalFields** — Use `options.user.additionalFields` and `options.session.additionalFields`
2. **Organization plugin models** — Use `organization({ schema: { ... } })` with `additionalFields`
3. **Column renaming for all plugins** — Use `fields: { existingField: "newColumnName" }`
4. **Table renaming for most plugins** — Use `modelName: "customTableName"`

### What CANNOT be configured:

1. **additionalFields for PARTIAL plugins** — passkey, twoFactor, admin, stripe, etc.
2. **additionalFields for teamMember** — Organization plugin limitation
3. **additionalFields for session in org plugin** — Only field renaming supported
4. **Schema for lastLoginMethod** — Hardcoded schema

### Workaround for PARTIAL plugins:

For custom columns in plugin tables that don't support `additionalFields`, you must:
1. Add the columns directly to your Drizzle schema
2. Accept that Better Auth won't know about them in the API layer
3. Handle them separately in your application code

---

## Source Files Referenced

| File | Purpose |
|------|---------|
| `tmp/better-auth/packages/core/src/db/type.ts` | DBFieldAttributeConfig type definition |
| `tmp/better-auth/packages/better-auth/src/types/plugins.ts` | InferOptionSchema type |
| `tmp/better-auth/packages/better-auth/src/plugins/organization/types.ts` | Organization plugin full schema |
| `tmp/better-auth/packages/<plugin>/src/types.ts` | External plugin options |
| `tmp/better-auth/packages/better-auth/src/plugins/<name>/types.ts` | Built-in plugin options |
