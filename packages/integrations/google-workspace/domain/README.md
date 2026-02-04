# @beep/google-workspace-domain

Domain models, error types, and scope constants for Google Workspace integrations.

## Purpose

Provides foundational domain concepts for Google Workspace API integration:
- Tagged error types for type-safe error handling
- OAuth scope constants for Gmail, Calendar, Drive
- Token model schemas

## Key Exports

| Export | Description |
|--------|-------------|
| `GoogleApiError` | Generic Google API failure error |
| `GoogleRateLimitError` | Rate limit exceeded error |
| `GoogleAuthenticationError` | Authentication failure error |
| `GoogleTokenExpiredError` | Token expiration error |
| `GoogleTokenRefreshError` | Token refresh failure error |
| `GoogleScopeExpansionRequiredError` | Additional scopes required error |
| `GmailScopes` | Gmail OAuth scope constants |
| `CalendarScopes` | Calendar OAuth scope constants |
| `DriveScopes` | Drive OAuth scope constants |
| `GoogleOAuthToken` | Token model schema |

## Usage

```typescript
import * as Effect from "effect/Effect";
import { GoogleApiError, GmailScopes } from "@beep/google-workspace-domain";

const scopes = [GmailScopes.read, GmailScopes.send];

const program = Effect.gen(function* () {
  return yield* Effect.fail(
    new GoogleApiError({
      message: "API request failed",
      statusCode: 500,
      endpoint: "/gmail/v1/users/me/messages",
    })
  );
});
```

## Dependencies

| Package | Purpose |
|---------|---------|
| `@beep/identity` | Package identifier system |
| `@beep/schema` | Schema utilities |
| `effect` | Effect runtime |

## Development

```bash
bun run check --filter @beep/google-workspace-domain
bun run lint --filter @beep/google-workspace-domain
```
