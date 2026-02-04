---
path: packages/shared/integrations
summary: Effect-native wrappers for Google APIs (Gmail, Calendar) with typed errors and DI
tags: [integrations, gmail, google-api, oauth, effect-wrapper]
---

# @beep/shared-integrations

Effect-based integration wrappers for third-party services. Provides type-safe, dependency-injected access to Google APIs (Gmail, Calendar) with Schema-validated models, typed error handling, and the `@beep/wrap` action pattern.

## Architecture

```
|-------------------|     |------------------|     |------------------|
|   Actions Layer   | --> |   GmailClient    | --> |  @googleapis/*   |
| (Wrap.WrapperGroup)|     | (Context.Tag DI) |     | (External APIs)  |
|-------------------|     |------------------|     |------------------|
        |
        v
|-------------------|     |------------------|
|  wrapGmailCall    | --> | GmailMethodError |
| (Promise->Effect) |     | (Typed Errors)   |
|-------------------|     |------------------|
        |
        v
|-------------------|
|   Domain Models   |
| (Email, Label...) |
|-------------------|
```

## Core Modules

| Module | Purpose |
|--------|---------|
| `google/gmail/common/GmailClient.ts` | Context.Tag for Gmail API client dependency injection |
| `google/gmail/common/wrap-gmail-call.ts` | Promise-to-Effect wrapper with error mapping |
| `google/gmail/errors.ts` | Tagged errors: GmailOperationError, GmailAuthenticationError |
| `google/gmail/models/` | Domain schemas: Email, Label, Attachment |
| `google/gmail/actions/layer.ts` | WrapperGroup combining all Gmail action handlers |
| `google/scopes.ts` | OAuth scope constants and validation helpers |
| `google/calendar/models.ts` | Calendar domain schemas |
| `utils/email-processor.ts` | HTML sanitization for email display |

## Usage Patterns

### Providing GmailClient

```typescript
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { GmailClient } from "@beep/shared-integrations/google/gmail/common";

const GmailClientLive = Layer.succeed(GmailClient, {
  client: authenticatedGmailInstance,
});

const program = Effect.gen(function* () {
  const result = yield* someGmailAction;
  return result;
}).pipe(Effect.provide(GmailClientLive));
```

### Using Actions via WrapperGroup

```typescript
import * as Effect from "effect/Effect";
import { Actions } from "@beep/shared-integrations/google/gmail/actions";

const program = Effect.gen(function* () {
  const handler = yield* Actions.Group.GetEmail;
  const email = yield* handler({ emailId: "abc123" });
  return email;
}).pipe(Effect.provide(Actions.layer));
```

### Error Handling with Tagged Errors

```typescript
import * as Effect from "effect/Effect";
import { GmailAuthenticationError, GmailOperationError } from "@beep/shared-integrations/google/gmail/errors";

const program = Effect.gen(function* () {
  const email = yield* getEmailEffect;
  return email;
}).pipe(
  Effect.catchTag("GmailAuthenticationError", (e) =>
    Effect.fail(new ReauthRequired({ suggestion: e.suggestion }))
  ),
  Effect.catchTag("GmailOperationError", (e) =>
    Effect.logWarning(`Gmail operation failed: ${e.message}`)
  )
);
```

### OAuth Scope Validation

```typescript
import * as F from "effect/Function";
import { GoogleOAuthToken, hasRequiredScopes, GMAIL_REQUIRED_SCOPES } from "@beep/shared-integrations/google/scopes";

const validateToken = (token: GoogleOAuthToken) =>
  F.pipe(
    token,
    (t) => hasRequiredScopes(t, GMAIL_REQUIRED_SCOPES),
    (valid) => valid ? "authorized" : "missing-scopes"
  );
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Wrap pattern (contract + handler) | Consistent action structure via `@beep/wrap`, separates API shape from implementation |
| GmailClient as Context.Tag | Enables dependency injection and testability without global state |
| wrapGmailCall helper | Centralizes Promise-to-Effect conversion and error classification |
| Typed error union (GmailMethodError) | Enables exhaustive error handling with `catchTag` |
| OAuth tokens use S.Redacted | Prevents sensitive refresh tokens from appearing in logs |
| $SharedIntegrationsId annotations | Consistent schema identity for debugging and tracing |

## Dependencies

**Internal**: `@beep/wrap`, `@beep/schema`, `@beep/identity`, `@beep/utils`, `@beep/shared-domain`, `@beep/shared-env`

**External**: `@googleapis/gmail`, `effect`, `@effect/platform`, `@effect/experimental`

## Related

- **AGENTS.md** - Detailed contributor guidance with action implementation examples
- **@beep/wrap** - Wrapper pattern documentation
- **@beep/comms-server** - Primary consumer for email operations
