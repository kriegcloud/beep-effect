# @beep/shared-integrations

Effect-based integration wrappers for third-party services, primarily Google APIs (Gmail, Calendar).

## Overview

This package provides type-safe, Effect-native wrappers around external service APIs. It:

- Wraps `@googleapis/gmail` with Effect patterns (typed errors, dependency injection, Schema validation)
- Defines domain models for external service entities (Email, Label, Attachment)
- Uses the `@beep/wrap` pattern for consistent action structure (contract + handler)
- Provides OAuth token schemas and scope management for Google services

## Key Exports

| Export | Description |
|--------|-------------|
| `GmailClient` | Context.Tag for Gmail API client dependency injection |
| `GmailMethodError` | Union error type for Gmail operations (authentication or operation errors) |
| `GmailOperationError` | Tagged error for Gmail API failures |
| `GmailAuthenticationError` | Tagged error for OAuth/authentication issues |
| `GoogleOAuthToken` | Schema for Google OAuth token structure |
| `GOOGLE_OAUTH_SCOPES` | OAuth scope constants for Gmail and Calendar |
| `Models.Email` | Schema class for Gmail email messages |
| `Models.Label` | Schema class for Gmail labels |
| `Actions.Group` | WrapperGroup containing all Gmail action wrappers |
| `Actions.layer` | Layer providing all Gmail action handlers |

## Directory Structure

```
src/
  google/
    gmail/
      actions/           # Gmail operations (get, list, send, etc.)
        get-email/       # contract.ts + handler.ts pattern
        list-emails/
        send-email/
        ...
        layer.ts         # Combined Layer for all actions
      common/            # Shared utilities
        GmailClient.ts   # Context.Tag definition
        wrap-gmail-call.ts # Error-handling wrapper
        gmail.schemas.ts # Gmail API type helpers
      models/            # Domain schemas
        email.ts
        label.ts
        attachment.ts
      errors.ts          # Tagged error definitions
    scopes.ts            # OAuth scope constants
    calendar/
      models.ts          # Calendar domain schemas
  utils/
    email-processor.ts   # HTML sanitization for email display
```

## Dependencies

| Package | Purpose |
|---------|---------|
| `@beep/wrap` | Wrapper pattern for action contracts |
| `@beep/schema` | Extended Schema helpers (BS) |
| `@beep/identity` | Package identity for annotations |
| `@beep/utils` | Utility functions (noOp, thunks) |
| `@googleapis/gmail` | Google Gmail API client |
| `effect` | Core Effect runtime |

## Key Patterns

### Action Structure (Wrap Pattern)

Each Gmail action follows the contract + handler pattern using `@beep/wrap`:

```typescript
import * as Effect from "effect/Effect"
import * as S from "effect/Schema"
import { Wrap } from "@beep/wrap"
import { GmailMethodError } from "../../errors"

// contract.ts - Define payload, success, and error types
export const Wrapper = Wrap.Wrapper.make("GetEmail", {
  payload: Payload,
  success: Success,
  error: GmailMethodError,
})

// handler.ts - Implement the operation
export const Handler = Wrapper.implement(
  Effect.fn(function* (payload) {
    const response = yield* wrapGmailCall({
      operation: (client) => client.users.messages.get(payload),
      failureMessage: "Failed to get email",
    })
    return yield* S.decode(Success)(parseMessageToEmail(response.data))
  })
)
```

### GmailClient Dependency Injection

All Gmail operations require the `GmailClient` service:

```typescript
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import { GmailClient } from "@beep/shared-integrations/google/gmail/common"

// Provide the client via Layer
const GmailClientLive = Layer.succeed(GmailClient, {
  client: authenticatedGmailInstance,
})

// Use in program
const program = pipe(
  getEmailEffect,
  Effect.provide(GmailClientLive)
)
```

### Error Handling

Gmail errors are typed and distinguishable:

```typescript
import * as Effect from "effect/Effect"
import { GmailAuthenticationError, GmailOperationError } from "@beep/shared-integrations/google/gmail/errors"

const program = pipe(
  someGmailEffect,
  Effect.catchTag("GmailAuthenticationError", (e) =>
    Effect.fail(new ReauthRequired({ suggestion: e.suggestion }))
  ),
  Effect.catchTag("GmailOperationError", (e) =>
    Effect.logWarning(`Gmail failed: ${e.message}`)
  )
)
```

### OAuth Scope Checking

```typescript
import * as F from "effect/Function"
import { GoogleOAuthToken, hasRequiredScopes, GMAIL_REQUIRED_SCOPES } from "@beep/shared-integrations/google/scopes"

const checkScopes = (token: GoogleOAuthToken) =>
  F.pipe(
    token,
    (t) => hasRequiredScopes(t, GMAIL_REQUIRED_SCOPES),
    (valid) => valid ? "authorized" : "missing-scopes"
  )
```

## Integration Points

- **Consumed by**: `@beep/comms-server` for email operations, CLI commands for Gmail sync
- **Depends on**: `@beep/wrap` for action contract pattern
- **Provides to**: Server packages that need Google API access

## Notes

- All actions use `wrapGmailCall` which handles Promise-to-Effect conversion and error mapping
- Models include `toRaw()` methods for converting back to Gmail API format (e.g., `Email.toRaw()` for sending)
- OAuth tokens use `S.Redacted` for sensitive fields (refresh tokens)
- The `$SharedIntegrationsId` pattern provides consistent schema annotations across the package
