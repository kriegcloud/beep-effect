# @beep/shared-ui

Shared React components for file and folder management UI across the beep-effect monorepo.

## Purpose

`@beep/shared-ui` provides reusable UI components for file and folder management that are consumed by multiple applications in the monorepo. It bridges domain entities from `@beep/shared-domain` with UI components from `@beep/ui`, managing file browsing, uploads, folder organization, and selection workflows.

This package sits in the shared layer because file management UI is used across multiple feature slices (documents, IAM profile images, etc.) and applications. All components are client-side only and require Next.js "use client" directive.

Key responsibilities:
- File and folder browsing interfaces with hierarchical display
- Upload progress tracking UI with compression status
- File/folder selection and bulk operations
- Dialog flows for creating folders, moving files, and deletion confirmations
- Integration with Effect Atom state management for reactive updates

## Installation

```bash
# This package is internal to the monorepo
# Add as a dependency in your package.json:
"@beep/shared-ui": "workspace:*"
```

## Key Exports

| Export | Description |
|--------|-------------|
| **Components** | |
| `FilesPage` | Main file browser component showing root files and folders |
| `FilesLayout` | Layout wrapper with toolbar, selection controls, and action buttons |
| `FilesEmptyState` | Empty state UI when no files or folders exist |
| `FileItem` | Individual file display component with metadata |
| `PendingFileItem` | Upload-in-progress file display with progress indicator |
| `FolderSection` | Collapsible folder section with nested files |
| `RootFilesSection` | Display section for root-level files |
| `CreateFolderDialog` | Dialog for creating new folders |
| `DeleteConfirmationDialog` | Confirmation dialog for deleting files/folders |
| `MoveFilesDialog` | Dialog for moving files to different folders |

## Dependencies

| Package | Purpose |
|---------|---------|
| `@beep/schema` | `BS.formatSize` for file size display, schema annotations |
| `@beep/shared-domain` | File and Folder entity models, `EntityKind`, `SharedEntityIds` |
| `@beep/shared-client` | Effect Atom state management (filesAtom, selectedFilesAtom, uploadAtom, etc.) |
| `@beep/ui` | Base component library (Banner, Button, Dialog, DropdownMenu, Input, Label, Checkbox) |
| `@beep/ui-core` | Design utilities (`cn` helper for className merging) |
| `@beep/identity` | Package identity for schema annotations |
| `@beep/utils` | `exact` utility for struct operations |
| `@effect-atom/atom-react` | React bindings for Effect Atom (Result.builder, useAtomValue, useAtomSet) |
| `effect` | Effect runtime, Array, String, Predicate, Function, Option, Equal, Schema, DateTime |

## Usage

### Basic File Browser

```typescript
"use client";
import * as React from "react";
import { FilesLayout, FilesPage } from "@beep/shared-ui";

export default function MyFilesPage() {
  return (
    <FilesLayout>
      <FilesPage />
    </FilesLayout>
  );
}
```

### Folder Display

```typescript
"use client";
import * as React from "react";
import { FolderSection } from "@beep/shared-ui/files/folder";
import { EntityKind } from "@beep/shared-domain";
import type { Folder } from "@beep/shared-domain/entities";

export function MyFolderView({ folder }: { folder: Folder.Type }) {
  return (
    <FolderSection
      folder={folder}
      entityKind={EntityKind.Enum.user}
      entityAttribute="image"
      entityIdentifier="shared_user__73df4268-ea84-4c58-bc89-7ca868de0d56"
      metadata={/* file metadata */}
    />
  );
}
```

### Upload Progress Display

```typescript
"use client";
import * as React from "react";
import * as A from "effect/Array";
import * as F from "effect/Function";
import { PendingFileItem } from "@beep/shared-ui/files/file-item";
import type { ActiveUpload } from "@beep/shared-client/atom";

function MyUploadsList({ uploads }: { uploads: ActiveUpload[] }) {
  return (
    <div>
      {F.pipe(
        uploads,
        A.map((upload) => (
          <PendingFileItem key={upload.id} upload={upload} />
        ))
      )}
    </div>
  );
}
```

## Integration

### With Applications
-  - Primary consumer for file management pages in dashboard

### With Feature Slices
- `packages/documents/ui` - May compose these components for document-specific workflows
- `packages/iam/ui` - Profile image upload flows

### With Shared Layer
- `packages/shared/client` - Consumes atoms for state management (filesAtom, uploadAtom, etc.)
- `packages/shared/domain` - Uses File and Folder entity types
- `packages/ui` - Composes base components into file management features

## State Management

This package consumes the following atoms from `@beep/shared-client/atom`:

| Atom | Purpose |
|------|---------|
| `filesAtom` | File and folder tree data (returns Result with rootFiles and folders) |
| `activeUploadsAtom` | Currently uploading files with progress and status |
| `selectedFilesAtom` | Selected file and folder IDs for bulk operations |
| `startUploadAtom` | Action atom for initiating file uploads |
| `uploadAtom(uploadId)` | Individual upload progress tracking (compression, upload, sync phases) |
| `cancelUploadAtom` | Action atom for canceling active uploads |
| `toggleFileSelectionAtom` | Action atom for toggling file selection state |
| `createFolderAtom` | Action atom for creating new folders |
| `moveFilesAtom` | Action atom for moving files to different folders |
| `deleteFilesAtom` | Action atom for deleting files and folders |

All state is managed via Effect Atom, providing reactive updates when files are uploaded, moved, or deleted. Components use `Result.builder` to handle loading, success, and error states declaratively.

## Effect-First Patterns

### Loading States with Result.builder

Components use `Result.builder` from `@effect-atom/atom-react` to handle loading and error states declaratively:

```typescript
import { Result, useAtomValue } from "@effect-atom/atom-react";
import { filesAtom } from "@beep/shared-client/atom";

function MyComponent() {
  const filesResult = useAtomValue(filesAtom);

  return Result.builder(filesResult)
    .onSuccess(({ rootFiles, folders }) => {
      // Render files and folders UI
      return <div>{/* ... */}</div>;
    })
    .onFailure(() => {
      // Render error state
      return <div>Error loading files</div>;
    })
    .orNull();
}
```

### Effect Array Utilities

All array operations follow Effect patterns (NEVER use native array methods):

```typescript
import * as A from "effect/Array";
import * as F from "effect/Function";

// ❌ FORBIDDEN: Native array methods
const filtered = activeUploads.filter((u) => u.folderId === null);
const isSelected = selection.fileIds.includes(file.id);

// ✅ REQUIRED: Effect array utilities
const filtered = F.pipe(
  activeUploads,
  A.filter((u) => u.folderId === null)
);
const isSelected = A.contains(selection.fileIds, file.id);

// ✅ REQUIRED: Map folders to components
F.pipe(
  folders,
  A.map((folder) => <FolderSection key={folder.id} folder={folder} />)
);
```

### Date Formatting

All date formatting uses `effect/DateTime`:

```typescript
import * as DateTime from "effect/DateTime";

// Format file timestamp
const formattedDate = DateTime.formatLocal(file.updatedAt, {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});
```

### Hydration Safety

All components use client-side hydration guards to prevent SSR mismatches with atom state:

```typescript
const [hydrated, setHydrated] = React.useState(false);

React.useEffect(() => {
  setHydrated(true);
}, []);

if (!hydrated) {
  return null;
}
```

This pattern is critical because Effect Atom state may not be available during server-side rendering.

## Upload Progress Tracking

The `PendingFileItem` component displays real-time upload progress with multiple phases:

```typescript
import * as A from "effect/Array";
import * as F from "effect/Function";
import { PendingFileItem } from "@beep/shared-ui/files/file-item";
import type { ActiveUpload } from "@beep/shared-client/atom";

// The component automatically tracks these phases:
// 1. "Compressing..." - Image compression in progress
// 2. "Uploading..." - File upload to storage
// 3. "Syncing..." - Syncing metadata to database
// 4. "Done" - Upload complete
// 5. Error states with specific messages

function MyUploadsList({ uploads }: { uploads: ActiveUpload[] }) {
  return (
    <div>
      {F.pipe(
        uploads,
        A.map((upload) => (
          <PendingFileItem key={upload.id} upload={upload} />
        ))
      )}
    </div>
  );
}
```

Error handling includes specific error types from `@beep/shared-client/atom`:
- `ImageTooLargeAfterCompression` - Displays compressed size in error message using `BS.formatSize`
- Generic upload failures show "Upload failed"

## Common Pitfalls

### Never Use Native Array Methods

```typescript
// ❌ FORBIDDEN
const fileIds = files.map((f) => f.id);
const hasSelection = selection.fileIds.length > 0;
const firstFolder = folders[0];

// ✅ REQUIRED
import * as A from "effect/Array";
const fileIds = A.map(files, (f) => f.id);
const hasSelection = A.isNonEmptyArray(selection.fileIds);
const firstFolder = A.headNonEmpty(folders);
```

### Client Component Directive Placement

```typescript
// ❌ WRONG: Directive after imports
import * as React from "react";
"use client";

// ✅ CORRECT: Directive as first statement
"use client";
import * as React from "react";
```

### Effect Atom Result Handling

```typescript
// ❌ WRONG: Accessing value directly
const files = useAtomValue(filesAtom).value;

// ✅ CORRECT: Use Result.builder
const filesResult = useAtomValue(filesAtom);
return Result.builder(filesResult)
  .onSuccess((data) => <div>{/* render data */}</div>)
  .onFailure(() => <div>Error</div>)
  .orNull();
```

## Type Safety Notes

- All file operations return Effect results via atoms
- File and Folder types come from `@beep/shared-domain/entities`
- Upload phases are discriminated unions from `@beep/shared-client/atom`
- Components require explicit type annotations for props (no implicit any)

## Development

```bash
# Type check
bun run --filter @beep/shared-ui check

# Lint
bun run --filter @beep/shared-ui lint

# Build
bun run --filter @beep/shared-ui build

# Test
bun run --filter @beep/shared-ui test
```

## Notes

### React 19 / Next.js 16 App Router
- The `"use client"` directive MUST be the first statement in a file, BEFORE imports
- All components in this package are client-side only
- Components expect Effect Atom providers to be set up in the application root
- `useSearchParams()` suspends in App Router - wrap consumers in `<Suspense>`

### Effect Atom Integration
- Atom state may not be available during SSR - always use hydration guards
- Result.builder handles loading/error states - never access `.value` directly
- Upload progress is local state - do NOT cache in TanStack Query
- After successful operations, atoms auto-invalidate - components re-render automatically

### File Upload Specific
- Upload progress tracking happens in `@beep/shared-client/atom`, not here
- This package only displays upload state, doesn't manage upload logic
- File metadata schemas use `effect/Arbitrary` for testing
- Download functionality uses imperative browser APIs (document.createElement)

### Build Notes
- Generates both ESM and CJS builds via Babel
- Uses `babel-plugin-transform-next-use-client` to preserve Next.js client boundaries
- All components are client-side only (use `"use client"` directive)
- Build output includes source maps for debugging
- No external runtime dependencies (all peer dependencies)

### Testing Notes
- File components can be tested with mock atom values
- Use `mockMetadata` constant for file metadata in tests
- Effect Atom provides test utilities via `@effect-atom/atom`
