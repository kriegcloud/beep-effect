# @beep/documents-ui

React UI components for the documents slice. Houses reusable document editing, knowledge management, discussion, and file upload components that compose with the design system and integrate with document domain models.

## Status

Currently a placeholder export (`beep`) while domain and SDK packages stabilize. This package serves as the staging area for all document-related React components, preventing UI duplication across apps.

## Planned Components

When implemented, this package will provide:

- **Document Editor**: Block-based document editing components with rich text support
- **Knowledge Pages**: Display and editing components for knowledge base pages
- **Discussions**: Thread and comment components for collaborative editing
- **File Management**: Upload, preview, and attachment handling components
- **Version History**: Document version timeline and comparison viewers
- **Navigation**: Knowledge space browser and page tree navigation

## Architecture Fit

- **Vertical Slice**: UI layer for the documents slice, consuming `@beep/documents-domain` and `@beep/documents-sdk`
- **Design System**: Built on `@beep/ui/ui` components and `@beep/ui/core` design tokens
- **Effect Integration**: Data fetching uses Effect-based hooks with TanStack Query for caching
- **Client Boundaries**: Explicit `"use client"` markers for Next.js App Router compatibility
- **Path Alias**: Import as `@beep/documents-ui`

## Package Dependencies

| Package                  | Purpose                                           |
|--------------------------|---------------------------------------------------|
| `@beep/ui`               | Base component library (MUI, shadcn, Tailwind)    |
| `@beep/ui-core`          | Design tokens and theme pipeline                  |
| `@beep/documents-domain` | Domain entities and validation schemas            |
| `@beep/documents-sdk`    | Client contracts for document operations          |
| `@beep/shared-domain`    | Cross-slice entities and policies                 |
| `@beep/shared-sdk`       | Shared SDK contracts                              |
| `@beep/shared-ui`        | Shared UI components and utilities                |
| `@beep/schema`           | Schema utilities and validators                   |
| `@beep/utils`            | Pure runtime helpers                              |
| `@beep/errors`           | Logging and error handling                        |
| `@beep/constants`        | Schema-backed enums and constants                 |
| `effect`                 | Core Effect runtime                               |

## Future Usage Patterns

### Document Editor Component

```typescript
import { DocumentEditor } from "@beep/documents-ui";
import * as Effect from "effect/Effect";

export function DocumentPage({ documentId }: { documentId: string }) {
  return (
    <DocumentEditor
      documentId={documentId}
      onSave={(content) => Effect.runPromise(saveDocument(content))}
      readOnly={false}
    />
  );
}
```

### Knowledge Page Viewer

```typescript
import { KnowledgePageViewer } from "@beep/documents-ui";

export function KnowledgePage({ pageId }: { pageId: string }) {
  return (
    <KnowledgePageViewer
      pageId={pageId}
      showComments={true}
      enableEditing={true}
    />
  );
}
```

### Discussion Thread

```typescript
import { DiscussionThread } from "@beep/documents-ui";
import * as F from "effect/Function";

export function DocumentDiscussion({ documentId }: { documentId: string }) {
  return (
    <DiscussionThread
      documentId={documentId}
      onCommentSubmit={(comment) =>
        F.pipe(
          comment,
          submitComment,
          Effect.runPromise
        )
      }
    />
  );
}
```

### File Upload Component

```typescript
import { FileUploader } from "@beep/documents-ui";
import * as A from "effect/Array";

export function FileUploadZone() {
  return (
    <FileUploader
      accept={["image/*", "application/pdf"]}
      maxSize={10 * 1024 * 1024} // 10MB
      onUpload={(files) =>
        F.pipe(
          files,
          A.map(uploadFile),
          Effect.all,
          Effect.runPromise
        )
      }
    />
  );
}
```

### Effect-Based Data Fetching Hook

```typescript
import { useDocument } from "@beep/documents-ui";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";

export function DocumentContainer({ documentId }: { documentId: string }) {
  const { data, isLoading, error, refetch } = useDocument(documentId);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;

  return F.pipe(
    data,
    O.match({
      onNone: () => <NotFound />,
      onSome: (doc) => <DocumentView document={doc} onRefresh={refetch} />
    })
  );
}
```

## Design & Implementation Guidelines

### Component Structure

- **Composition First**: Build on `@beep/ui/ui` primitives (MUI components, shadcn/ui, Tailwind utilities)
- **Theme Integration**: Respect `@beep/ui/core` design tokens and settings pipeline
- **No Bespoke Styling**: Avoid custom theme objects; use CSS variables and component overrides
- **Separation of Concerns**: Keep data fetching separate from presentation; inject dependencies via props

### Effect Patterns

- **No async/await**: Use Effect-based data fetching exclusively
- **Array Utilities**: Use `A.map`, `A.filter`, etc. instead of native array methods
- **String Utilities**: Use `Str.*` utilities instead of native string methods
- **Pipe Composition**: Prefer `F.pipe` for all transformations

```typescript
// ❌ FORBIDDEN
const names = documents.map(doc => doc.name.toUpperCase());

// ✅ REQUIRED
import * as A from "effect/Array";
import * as Str from "effect/String";
import * as F from "effect/Function";

const names = F.pipe(
  documents,
  A.map((doc) => F.pipe(doc.name, Str.toUpperCase))
);
```

### Client Boundaries

Mark components with `"use client"` when they use:
- React hooks (`useState`, `useEffect`, etc.)
- Browser APIs (`localStorage`, `window`, etc.)
- Event handlers (`onClick`, `onChange`, etc.)

```typescript
"use client";

import { useState } from "react";
import * as Effect from "effect/Effect";

export function DocumentEditor({ documentId }: Props) {
  const [content, setContent] = useState("");
  // Component implementation
}
```

### Data Validation

- **Domain Schemas**: Validate all external data with `@beep/documents-domain` schemas
- **No Trust**: Never trust props or API responses without schema validation
- **Effect Schema**: Use `S.decodeUnknown` or `S.parseEffect` for runtime validation

```typescript
import * as S from "effect/Schema";
import * as Effect from "effect/Effect";
import { DocumentSchema } from "@beep/documents-domain";

const validateDocument = (data: unknown) =>
  Effect.gen(function* () {
    return yield* S.decode(DocumentSchema)(data);
  });
```

### TanStack Query Integration

Use Effect-based queries for optimal caching and invalidation:

```typescript
import { useQuery, useMutation } from "@tanstack/react-query";
import * as Effect from "effect/Effect";

export function useDocument(documentId: string) {
  return useQuery({
    queryKey: ["document", documentId],
    queryFn: () => Effect.runPromise(fetchDocument(documentId))
  });
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (update: DocumentUpdate) =>
      Effect.runPromise(updateDocument(update)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document"] });
    }
  });
}
```

## What Belongs Here

- **Reusable Document Components**: Editor, viewer, navigation, upload, preview
- **Knowledge Management UI**: Page display, editing, navigation, search
- **Discussion Components**: Comments, threads, replies, notifications
- **File Management**: Upload zones, file previews, attachment lists
- **Effect-Based Hooks**: Data fetching with TanStack Query integration
- **Form Components**: Document creation, editing, settings forms

## What Must NOT Go Here

- **Business Logic**: Keep domain rules in `@beep/documents-domain`
- **Data Fetching Implementation**: Use `@beep/documents-sdk` contracts; inject as props
- **Database Queries**: Belong in `@beep/documents-infra`
- **Hardcoded API Calls**: Always inject clients or use SDK contracts
- **Cross-Slice UI**: Shared components belong in `@beep/shared-ui`
- **Native Array/String Methods**: Use Effect utilities exclusively

## Development

```bash
# Type check
bun run check --filter=@beep/documents-ui

# Lint
bun run lint --filter=@beep/documents-ui

# Lint and auto-fix
bun run lint:fix --filter=@beep/documents-ui

# Run tests
bun run test --filter=@beep/documents-ui

# Test with coverage
bun run coverage --filter=@beep/documents-ui

# Build
bun run build --filter=@beep/documents-ui
```

## Testing Strategy

- **Component Tests**: Use Vitest + React Testing Library for component behavior
- **Integration Tests**: Test Effect hook integration with TanStack Query
- **Visual Tests**: Consider Storybook for component documentation
- **Accessibility**: Test ARIA attributes and keyboard navigation

## Contributor Checklist

When adding new components:

- [ ] Component uses `@beep/ui/ui` primitives and respects theme/settings
- [ ] Validation uses `@beep/documents-domain` schemas
- [ ] Data fetching is injected via props or uses `@beep/documents-sdk`
- [ ] No native array/string/object methods; Effect utilities only
- [ ] Appropriate `"use client"` markers for React 19 + Next.js 15
- [ ] Effect-based data fetching with TanStack Query integration
- [ ] Tests added under `packages/documents/ui/test/`
- [ ] Documentation includes usage examples

## See Also

- `packages/documents/ui/AGENTS.md` — Implementation guardrails and integration notes
- `packages/ui/ui/AGENTS.md` — Component library patterns and design system
- `packages/ui/core/AGENTS.md` — Design tokens and theme pipeline
- `packages/documents/domain/AGENTS.md` — Domain entities and validation
- `packages/documents/sdk/AGENTS.md` — Client SDK contracts
- `packages/shared/ui/AGENTS.md` — Shared UI components and utilities

## Versioning and Changes

- Prefer **additive changes** to maintain backward compatibility
- For breaking changes, coordinate with dependent apps (`apps/web`)
- Document migrations in PR descriptions for consumer guidance
