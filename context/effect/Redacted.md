# Redacted — Agent Context

> Quick reference for AI agents working with `effect/Redacted`

## Quick Reference

| Function | Purpose | Example |
|----------|---------|---------|
| `Redacted.make` | Wrap a sensitive value | `Redacted.make("secret-api-key")` |
| `Redacted.value` | Unwrap (use with caution) | `Redacted.value(redacted)` |
| `Redacted.isRedacted` | Type guard | `if (Redacted.isRedacted(val)) { ... }` |
| `Redacted.unsafeWipe` | Erase value from memory | `Redacted.unsafeWipe(redacted)` |
| `S.Redacted(schema)` | Schema for redacted values | `S.Redacted(S.String)` |

## Codebase Patterns

### Credential Fields in Schemas

ALWAYS use `S.Redacted(S.String)` for credential fields to prevent logging exposure:

```typescript
import * as S from "effect/Schema";

// Real usage from @beep/iam-client/sign-in/email/contract.ts
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    email: Common.UserEmail,
    password: Common.UserPassword,  // S.Redacted(S.String) internally
  },
  formValuesAnnotation({
    email: "",
    password: "",  // Encoded type is plain string for forms
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    token: S.optionalWith(S.Redacted(S.String), { as: "Option", nullable: true }),
    // ... other fields
  }
) {}
```

### Server Environment Secrets

Configuration secrets MUST use `Config.redacted` which returns `Redacted<string>`:

```typescript
import * as Config from "effect/Config";
import * as Redacted from "effect/Redacted";

// Real usage from @beep/shared-env/ServerEnv.ts
export const ServerConfig = Config.all({
  auth: Config.all({
    secret: Config.redacted(Config.nonEmptyString("BETTER_AUTH_SECRET")),
  }),
  cloud: Config.nested("CLOUD")(
    Config.all({
      aws: Config.nested("AWS")(
        Config.all({
          accessKeyId: Config.redacted(Config.nonEmptyString("ACCESS_KEY_ID"))
            .pipe(withPlaceholderRedacted),
          secretAccessKey: Config.redacted(Config.nonEmptyString("SECRET_ACCESS_KEY"))
            .pipe(withPlaceholderRedacted),
        })
      ),
    })
  ),
  // ... more config
});

// Check if a value is placeholder
export const isPlaceholder = <A>(configValue: A) =>
  Redacted.isRedacted(configValue)
    ? Redacted.value(configValue) === PLACEHOLDER_VALUE
    : configValue === PLACEHOLDER_VALUE;
```

### Sensitive Email Fields (Rare Use)

Use `S.Redacted` for email when it contains PII that should not appear in logs:

```typescript
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";

// Real usage from @beep/schema/primitives/string/email.ts
export const EmailRedacted = S.Redacted(EmailEncoded).pipe(
  S.brand("Email")
).annotations(
  $I.annotations("email/Email", {
    description: "Redacted, branded email string preventing accidental PII leakage.",
  })
);

// Create redacted email
const email = Redacted.make("user@example.com" as B.Branded<string, "Email">);
```

### Safe Unwrapping Pattern

Use `Redacted.value` only when necessary (e.g., passing to external APIs):

```typescript
import * as Redacted from "effect/Redacted";
import * as Effect from "effect/Effect";

// Unwrap inside Effect computation, never log it
const program = Effect.gen(function* () {
  const config = yield* ServerConfig;

  // Safe: unwrap only to pass to authenticated API client
  const apiClient = createClient({
    apiKey: Redacted.value(config.api.secretKey),
  });

  // NEVER log the unwrapped value
  yield* Effect.log(`Initializing client`);  // ✅ No secret in logs

  return apiClient;
});
```

### BS Helper for Sensitive Optional Fields

Use `BS.FieldSensitiveOptionOmittable` for optional sensitive fields:

```typescript
import { BS } from "@beep/schema";
import * as S from "effect/Schema";

// Canonical pattern from @beep/iam-client contracts
export class Payload extends S.Class<Payload>($I`Payload`)({
  apiKey: BS.FieldSensitiveOptionOmittable(S.String),  // Redacted + optional
}) {}
```

## Anti-Patterns

### NEVER: Log or expose Redacted values

```typescript
import * as Redacted from "effect/Redacted";
import * as Effect from "effect/Effect";

// FORBIDDEN - Logging exposes secret
const redactedKey = Redacted.make("secret-api-key");
console.log(`API Key: ${Redacted.value(redactedKey)}`);  // ❌ Leaks secret!
yield* Effect.log({ apiKey: Redacted.value(redactedKey) });  // ❌ Logged!

// REQUIRED - Never unwrap for logging
console.log(`API Key configured`);  // ✅ No secret
yield* Effect.log(`Initializing with credentials`);  // ✅ Safe
```

### NEVER: Store credentials as plain strings

```typescript
// FORBIDDEN - Plain string secrets
export const ServerConfig = Config.all({
  auth: Config.all({
    secret: Config.nonEmptyString("BETTER_AUTH_SECRET"),  // ❌ Not redacted!
  }),
});

// REQUIRED - Use Config.redacted
export const ServerConfig = Config.all({
  auth: Config.all({
    secret: Config.redacted(Config.nonEmptyString("BETTER_AUTH_SECRET")),  // ✅ Redacted
  }),
});
```

### NEVER: Use Redacted for non-sensitive data

```typescript
// FORBIDDEN - Over-redacting adds overhead without benefit
export class User extends S.Class<User>($I`User`)({
  id: S.Redacted(SharedEntityIds.UserId),  // ❌ UUID IDs are not sensitive
  createdAt: S.Redacted(S.Date),  // ❌ Timestamps are not sensitive
}) {}

// REQUIRED - Only redact credentials
export class User extends S.Class<User>($I`User`)({
  id: SharedEntityIds.UserId,  // ✅ Plain UUID
  createdAt: S.Date,  // ✅ Plain date
  hashedPassword: S.Redacted(S.String),  // ✅ Credential is redacted
}) {}
```

### NEVER: Forget to redact tokens in success schemas

```typescript
// FORBIDDEN - Token exposure in response
export class Success extends S.Class<Success>($I`Success`)({
  sessionToken: S.String,  // ❌ Token will be logged!
}) {}

// REQUIRED - Redact tokens
export class Success extends S.Class<Success>($I`Success`)({
  sessionToken: S.Redacted(S.String),  // ✅ Token is redacted
}) {}
```

## Redacted Decision Criteria

Ask: "If this value appeared in application logs, could an attacker use it to:"
- Impersonate a user or system?
- Access protected resources?
- Decrypt sensitive data?
- Bypass authentication or authorization?

**If YES** → Use `S.Redacted(schema)` or `Config.redacted`
**If NO** → Use plain schema

### Always Redact

- User passwords, hashed passwords
- API keys, API secrets
- OAuth tokens (access, refresh, ID tokens)
- Session tokens, CSRF tokens
- Private keys, signing secrets, encryption keys
- Webhook secrets
- Database passwords
- Service account credentials

### Never Redact

- User IDs (UUIDs, branded EntityIds)
- Timestamps (createdAt, updatedAt)
- Public identifiers (email addresses shown to users)
- Enums and status values
- Non-sensitive configuration (ports, hostnames, feature flags)

## Related Modules

- [Schema](./Schema.md) — Schema definition with `S.Redacted`
- [Context](./Context.md) — Service context with redacted configuration

## Source Reference

[.repos/effect/packages/effect/src/Redacted.ts](../../.repos/effect/packages/effect/src/Redacted.ts)
