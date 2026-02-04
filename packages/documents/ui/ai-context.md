---
path: packages/documents/ui
summary: React components for documents slice - editors, viewers, discussions (stub, planned implementation)
tags: [documents, ui, react, components, editor, tanstack-query]
---

# @beep/documents-ui

Reusable React components for the documents slice. Currently a stub awaiting domain and client completion. Will provide document editors, knowledge page components, discussion threads, file upload widgets, and version history viewers built on `@beep/ui` design system.

## Architecture (Planned)

```
|-------------------|     |-------------------|     |-------------------|
|   Editor Comps    |     |  Display Comps    |     |   Form Comps      |
|-------------------|     |-------------------|     |-------------------|
| BlockEditor       |     | DocumentViewer    |     | DocumentForm      |
| RichTextEditor    |     | KnowledgePage     |     | CommentForm       |
|-------------------|     | CommentThread     |     |-------------------|
                          |-------------------|
        |                         |                         |
        +-------------------------+-------------------------+
                                  |
                                  v
                    |---------------------------|
                    |         Hooks             |
                    |---------------------------|
                    | useDocument               |
                    | useDiscussion             |
                    | useKnowledgePage          |
                    |---------------------------|
                                  |
                                  v
                    |---------------------------|
                    | @beep/documents-client    |
                    | + TanStack Query          |
                    |---------------------------|
```

## Core Modules

| Module | Purpose |
|--------|---------|
| `src/index.ts` | Stub export (placeholder) |

## Usage Patterns (Planned)

### Document Editor with Effect + TanStack Query

```typescript
"use client";

import * as Effect from "effect/Effect";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DocumentsClient } from "@beep/documents-client";

export const useDocument = (documentId: string) =>
  useQuery({
    queryKey: ["documents", documentId],
    queryFn: () =>
      Effect.gen(function* () {
        const client = yield* DocumentsClient;
        return yield* client.getDocument(documentId);
      }).pipe(Effect.provide(clientLayer), Effect.runPromise),
  });

export const useUpdateDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateDocumentInput) =>
      Effect.gen(function* () {
        const client = yield* DocumentsClient;
        return yield* client.updateDocument(data);
      }).pipe(Effect.provide(clientLayer), Effect.runPromise),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["documents", variables.id] });
    },
  });
};
```

### Server vs Client Component Boundary

```typescript
// Server Component - data fetching only
export async function DocumentPage({ params }: { params: { id: string } }) {
  const doc = await fetchDocument(params.id);
  return <DocumentEditor initialData={doc} />;
}

// Client Component - interactive editor
"use client";
export function DocumentEditor({ initialData }: { initialData: Document }) {
  // Rich text editor, event handlers, etc.
}
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| TanStack Query integration | Caching, invalidation, optimistic updates for document operations |
| Client boundary awareness | "use client" only where DOM/hooks required |
| DateTime via effect/DateTime | Immutable, timezone-safe date handling |
| Match over switch | Pattern matching with effect/Match for type-safe branching |

## Dependencies

**Internal**: (planned) `@beep/documents-domain`, `@beep/documents-client`, `@beep/ui`, `@beep/ui-core`

**External**: `effect`

## Related

- **AGENTS.md** - Detailed contributor guidance and React 19 gotchas
- **@beep/documents-domain** - Domain schemas for validation
- **@beep/documents-client** - Data fetching client
- **@beep/ui** - Design system primitives
