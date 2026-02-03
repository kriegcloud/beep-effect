# @beep/shared-integrations

Effect-first third-party service integrations for the beep-effect monorepo.

## Purpose

`@beep/shared-integrations` provides Effect-wrapped clients for external service APIs, starting with Google services (Gmail, Calendar). All integrations use Effect patterns for error handling, dependency injection, and typed schemas.

## Installation

```bash
# This package is internal to the monorepo
# Add as a dependency in your package.json:
"@beep/shared-integrations": "workspace:*"
```

## Features

### Google Gmail Integration

Complete Gmail API integration with Effect-based handlers:

| Action | Description |
|--------|-------------|
| `ListEmails` | List emails with metadata |
| `GetEmail` | Get full email content |
| `SearchEmails` | Search emails with Gmail query syntax |
| `SendEmail` | Send emails with attachments |
| `TrashEmail` | Move email to trash |
| `DeleteEmail` | Permanently delete email |
| `ModifyEmail` | Add/remove labels |
| `BatchModify` | Batch label modifications |
| `ListLabels` | List all labels |
| `CreateLabel` | Create new label |
| `UpdateLabel` | Update label properties |
| `DeleteLabel` | Delete label |

### Google OAuth Scopes

Pre-configured OAuth scope constants for Gmail and Calendar:

```typescript
import { GOOGLE_OAUTH_SCOPES, GMAIL_REQUIRED_SCOPES } from "@beep/shared-integrations/google/scopes";

// Individual scopes
GOOGLE_OAUTH_SCOPES.GMAIL.READONLY
GOOGLE_OAUTH_SCOPES.GMAIL.SEND
GOOGLE_OAUTH_SCOPES.GMAIL.MODIFY
GOOGLE_OAUTH_SCOPES.CALENDAR.CALENDAR
GOOGLE_OAUTH_SCOPES.CALENDAR.EVENTS

// Scope validation
import { hasRequiredScopes, GoogleOAuthToken } from "@beep/shared-integrations/google/scopes";
const hasAccess = hasRequiredScopes(token, GMAIL_REQUIRED_SCOPES);
```

## Key Exports

### Gmail Client

```typescript
import { GmailClient } from "@beep/shared-integrations/google/gmail/common";
import * as Context from "effect/Context";

// GmailClient is an Effect Context.Tag for dependency injection
// Requires a configured @googleapis/gmail client instance
```

### Gmail Actions

```typescript
import { Group, layer } from "@beep/shared-integrations/google/gmail/actions/layer";
import * as Effect from "effect/Effect";

// All handlers require GmailClient in context
// Use the layer for dependency injection
const program = Effect.gen(function* () {
  // Actions available via Group
}).pipe(Effect.provide(layer));
```

### Models

```typescript
import { Models } from "@beep/shared-integrations/google/gmail/models";

// Email model with parsing utilities
const email: Models.Email = {
  id: "msg_123",
  threadId: "thread_456",
  subject: "Hello",
  from: "sender@example.com",
  to: ["recipient@example.com"],
  snippet: "Preview text...",
  labels: ["INBOX"],
  // ...
};

// Parse Gmail API response to Email model
const parsed = Models.parseMessageToEmail(gmailResponse);
```

### Error Handling

```typescript
import { GmailOperationError, GmailAuthenticationError, GmailMethodError } from "@beep/shared-integrations/google/gmail/errors";

// Typed errors for Gmail operations
// GmailAuthenticationError - OAuth token issues
// GmailOperationError - API operation failures
// GmailMethodError - Union of both error types
```

## Usage Example

```typescript
import * as Effect from "effect/Effect";
import { GmailClient } from "@beep/shared-integrations/google/gmail/common";
import { ListEmails } from "@beep/shared-integrations/google/gmail/actions/list-emails";
import { gmail } from "@googleapis/gmail";

// Create Gmail client
const gmailClient = gmail({ version: "v1", auth: oauthClient });

// List emails
const program = ListEmails.Handler({ userId: "me", maxResults: 10 }).pipe(
  Effect.provideService(GmailClient, { client: gmailClient })
);

const result = yield* program;
// result.data contains Email[] array
```

## Package Structure

```
src/
├── index.ts                    # Main exports
├── google/
│   ├── scopes.ts              # OAuth scope constants and helpers
│   ├── calendar/
│   │   └── models.ts          # Calendar models (placeholder)
│   └── gmail/
│       ├── errors.ts          # Gmail-specific errors
│       ├── constants.ts       # Gmail constants
│       ├── rateLimit.ts       # Rate limiting utilities
│       ├── common/
│       │   ├── GmailClient.ts # Effect Context.Tag
│       │   ├── gmail.schemas.ts
│       │   ├── wrap-gmail-call.ts
│       │   └── build-raw-email.ts
│       ├── models/
│       │   ├── email.ts       # Email model
│       │   ├── label.ts       # Label model
│       │   ├── attachment.ts  # Attachment model
│       │   └── ...
│       └── actions/
│           ├── layer.ts       # Actions layer composition
│           ├── list-emails/
│           ├── get-email/
│           ├── send-email/
│           └── ...
└── utils/
    └── email-processor.ts     # Email processing utilities
```

## Dependencies

| Package | Purpose |
|---------|---------|
| `effect` | Core Effect runtime |
| `@effect/platform` | Platform abstractions |
| `@googleapis/gmail` | Google Gmail API client |
| `@beep/schema` | Schema utilities |
| `@beep/shared-domain` | Entity IDs and models |
| `@beep/wrap` | Wrapper utilities for action composition |

## Development

```bash
# Type check
bun run check --filter @beep/shared-integrations

# Lint
bun run lint --filter @beep/shared-integrations

# Test
bun run test --filter @beep/shared-integrations

# Build
bun run build --filter @beep/shared-integrations
```

## Effect Patterns

This package follows strict Effect-first conventions:

```typescript
// Namespace imports
import * as Effect from "effect/Effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Match from "effect/Match";

// No native array methods
A.map(items, (item) => item.name);  // Correct
A.filter(items, (item) => item.active);  // Correct

// PascalCase Schema constructors
S.Struct({ name: S.String });  // Correct
S.Array(S.String);  // Correct
```

## License

MIT
