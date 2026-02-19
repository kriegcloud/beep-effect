# AGENTS.md Template Reference

This file contains templates and examples for creating and updating AGENTS.md files in the beep-effect monorepo.

---

## Standard AGENTS.md Template

When creating new AGENTS.md files, use this structure:

```markdown
# Package Name AGENTS.md

Brief description of the package purpose.

## Overview

What this package provides and its role in the architecture.

## Key Exports

| Export | Description |
|--------|-------------|
| `ExportName` | What it does |

## Dependencies

- `@beep/dependency` — Why it's needed

## Usage Patterns

### Common Pattern Name

```typescript
import * as Effect from "effect/Effect"
import { ServiceName } from "@beep/package-name"

const program = Effect.gen(function* () {
  const service = yield* ServiceName
  return yield* service.method()
})
```

## Integration Points

How this package connects with others in the monorepo.
```

---

## Before/After Transformation Example

### BEFORE (Poor Quality AGENTS.md)

```markdown
# client

Client package for documents.

## Tooling & Docs Shortcuts

- `jetbrains__get_open_projects` — get open projects
- `context7__resolve` — resolve context

## Usage

```typescript
import { DocumentClient } from "@beep/documents-client"
const docs = await DocumentClient.getAll()
```

## Deps
- effect
- @beep/documents-client
```

### AFTER (Quality AGENTS.md Following Template)

```markdown
# @beep/documents-client

Effect-based client contracts and handlers for the Documents slice.

## Overview

Provides the client-side API surface for document operations. This package:
- Defines RPC handlers for document CRUD operations
- Exports client contracts used by the web app
- Sits in the documents/client layer, consumed by product Next.js apps (e.g. `@beep/todox`)

## Key Exports

| Export | Description |
|--------|-------------|
| `DocumentsClientLive` | Live implementation of document client handlers |
| `DocumentsContract` | RPC contract definitions for type-safe client-server communication |
| `DocumentsHandlers` | Effect handlers for document operations |

## Dependencies

| Package | Purpose |
|---------|---------|
| `@beep/documents-domain` | Domain entities and business logic |
| `@beep/shared-client` | Shared client utilities and base contracts |
| `effect` | Core Effect runtime |

## Usage Patterns

### Fetching Documents

\`\`\`typescript
import * as Effect from "effect/Effect"
import { DocumentsClientLive, DocumentsContract } from "@beep/documents-client"

const program = Effect.gen(function* () {
  const client = yield* DocumentsContract.Client
  const documents = yield* client.list({ workspaceId })
  return documents
}).pipe(Effect.provide(DocumentsClientLive))
\`\`\`

### With Layer Composition

\`\`\`typescript
import * as Layer from "effect/Layer"
import { DocumentsClientLive } from "@beep/documents-client"
import { HttpClientLive } from "@beep/shared-client"

const AppLayer = Layer.provide(DocumentsClientLive, HttpClientLive)
\`\`\`

## Integration Points

- **Consumed by**: product Next.js apps (e.g. `@beep/todox`) for document operations in the frontend
- **Depends on**: `@beep/documents-domain` for entity types
- **Communicates with**: `@beep/documents-server` via RPC contracts
```

---

## Anti-Patterns Reference

### FORBIDDEN: Stale Package References

```markdown
## Dependencies
- `@beep/core-db` — Database utilities
- `@beep/core-env` — Environment config
```

### REQUIRED: Current Package References

```markdown
## Dependencies
| Package | Purpose |
|---------|---------|
| `@beep/shared-server` | Database utilities and server infrastructure |
| `@beep/shared-env` | Environment configuration |
```

---

### FORBIDDEN: MCP Tool Shortcuts in AGENTS.md

```markdown
## Tooling & Docs Shortcuts

- `jetbrains__get_open_projects` — get open projects
- `context7__resolve` — resolve context
- `effect_docs__search` — search Effect docs
```

### REQUIRED: Remove Tool Shortcuts Entirely

Tool shortcuts are runtime IDE/editor configurations, NOT documentation.
They should be removed from all AGENTS.md files.

---

### FORBIDDEN: Named Imports from Effect

```typescript
// BAD - named imports
import { Effect, Layer, Context } from "effect";
```

### REQUIRED: Namespace Imports

```typescript
// GOOD - namespace imports
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Context from "effect/Context"
```

---

### FORBIDDEN: async/await in Examples

```typescript
// BAD - async/await
async function getDocument(id: string) {
  const doc = await DocumentClient.get(id);
  return doc;
}
```

### REQUIRED: Effect.gen Pattern

```typescript
// GOOD - Effect.gen
import * as Effect from "effect/Effect"

const getDocument = (id: string) => Effect.gen(function* () {
  const client = yield* DocumentsContract.Client
  return yield* client.get({ id })
})
```

---

### FORBIDDEN: Native Array/String Methods

```typescript
// BAD - native methods
const names = docs.map(d => d.name);
const parts = path.split("/");
```

### REQUIRED: Effect Utilities with Pipe

```typescript
// GOOD - Effect utilities
import * as A from "effect/Array"
import * as Str from "effect/String"
import * as F from "effect/Function"

const names = F.pipe(docs, A.map(d => d.name))
const parts = F.pipe(path, Str.split("/"))
```

---

### FORBIDDEN: Vague Documentation

```markdown
## Overview
This is the client package. It has client stuff.

## Usage
Use the exports.
```

### REQUIRED: Specific, Contextual Documentation

```markdown
## Overview
Provides Effect-based RPC handlers for document operations. This package:
- Defines type-safe contracts between client and server
- Implements optimistic updates for document mutations
- Handles offline-first caching via TanStack Query integration

## Usage
### Creating a Document
\`\`\`typescript
const program = Effect.gen(function* () {
  const client = yield* DocumentsContract.Client
  return yield* client.create({ title: "New Doc", workspaceId })
})
\`\`\`
```

---

### FORBIDDEN: Invalid Cross-References

```markdown
## See Also
- [IAM Server AGENTS.md](../../iam/server/AGENTS.md) (if file doesn't exist)
- Check `@beep/core-utils` for helpers (deleted package)
```

### REQUIRED: Validated Cross-References

```markdown
## See Also
- [IAM Domain](../../iam/domain/AGENTS.md) — Entity definitions
- [Shared Client](../../shared/client/AGENTS.md) — Base client utilities

**Note**: Only include cross-references to files that exist. Verify before adding.
```
