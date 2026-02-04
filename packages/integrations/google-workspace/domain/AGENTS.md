# @beep/google-workspace-domain

Domain layer for Google Workspace integration infrastructure.

## Surface Map

| Path | Purpose |
|------|---------|
| `src/errors/auth.errors.ts` | Authentication-related tagged errors |
| `src/errors/api.errors.ts` | API-related tagged errors |
| `src/scopes/gmail.scopes.ts` | Gmail OAuth scope constants |
| `src/scopes/calendar.scopes.ts` | Calendar OAuth scope constants |
| `src/scopes/drive.scopes.ts` | Drive OAuth scope constants |
| `src/models/token.model.ts` | GoogleOAuthToken schema |
| `src/index.ts` | Public API barrel |

## Key Patterns

```typescript
import { GoogleApiError, GmailScopes, GoogleOAuthToken } from "@beep/google-workspace-domain";
import * as Effect from "effect/Effect";

// Using scope constants
const requiredScopes = [GmailScopes.read, GmailScopes.send];

// Handling errors
const program = Effect.gen(function* () {
  return yield* Effect.fail(
    new GoogleApiError({
      message: "Request failed",
      statusCode: 500,
      endpoint: "/api/endpoint",
    })
  );
});
```

## Verification

```bash
bun run check --filter @beep/google-workspace-domain
bun run lint --filter @beep/google-workspace-domain
```

## Guardrails

- All errors extend `S.TaggedError`
- All scope constants use `as const`
- Token model uses `S.Redacted` for sensitive fields
- NO client or server logic (domain layer only)
- ALWAYS use namespace imports for Effect modules
