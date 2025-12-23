# @beep/shared-ui

Shared React components for file and folder management UI across the beep-effect monorepo.

## Purpose

This package provides reusable UI components for file and folder management that are consumed by multiple applications in the monorepo. It bridges domain entities from `@beep/shared-domain` with UI components from `@beep/ui`, managing file browsing, uploads, folder organization, and selection workflows.

Key responsibilities:
- File and folder browsing interfaces with hierarchical display
- Upload progress tracking UI with compression status
- File/folder selection and bulk operations
- Dialog flows for creating folders, moving files, and deletion confirmations
- Integration with Effect Atom state management for reactive updates

This package sits in the shared layer because file management UI is used across multiple feature slices (documents, IAM profile images, etc.) and applications. All components are client-side only and require Next.js "use client" directive.

## Installation

```bash
# This package is internal to the monorepo
# Add as a dependency in your package.json:
"@beep/shared-ui": "workspace:*"
```

## Key Exports

| Export | Description |
|--------|-------------|
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

## Usage

### Basic File Browser

```typescript
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

### With Selection and Actions

The `FilesLayout` component automatically integrates with the `selectedFilesAtom` from `@beep/shared-client/atom` to provide:
- Multi-select functionality for files and folders
- Bulk delete operations
- Move files to folders
- Create new folders
- Upload new files

```typescript
import * as React from "react";
import { FilesLayout, FilesPage } from "@beep/shared-ui";
import { useAtomValue } from "@effect-atom/atom-react";
import { selectedFilesAtom } from "@beep/shared-client/atom";

export default function FilesWithActions() {
  return (
    <FilesLayout>
      <FilesPage />
    </FilesLayout>
  );
}
```

### Folder Display

```typescript
import * as React from "react";
import { FolderSection } from "@beep/shared-ui";
import { EntityKind } from "@beep/shared-domain";
import type { Folder } from "@beep/shared-domain/entities";

export function MyFolderView({ folder }: { folder: Folder.Type }) {
  return (
    <FolderSection
      folder={folder}
      entityKind={EntityKind.Enum.user}
      entityAttribute="image"
      entityIdentifier="user__73df4268-ea84-4c58-bc89-7ca868de0d56"
      metadata={/* file metadata */}
    />
  );
}
```

## Dependencies

| Package | Purpose |
|---------|---------|
| `@beep/ui` | Base component library (buttons, dialogs, dropdowns) |
| `@beep/shared-domain` | File and Folder entity models, EntityKind schemas |
| `@beep/shared-client` | Effect Atom state management (filesAtom, selectedFilesAtom, uploadAtom, etc.) |
| `@beep/shared-env` | Environment configuration |
| `@beep/schema` | Schema validation utilities, file size formatting (BS.formatSize) |
| `@beep/utils` | Common utility functions |
| `@beep/ui-core` | Design utilities (cn helper for className merging) |
| `@beep/errors` | Error handling and logging |
| `@beep/constants` | Constant values |
| `@beep/identity` | Package identity |
| `@beep/invariant` | Assertion contracts |
| `@effect-atom/atom-react` | React bindings for Effect Atom (Result.builder, useAtomValue, useAtomSet) |

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

All state is managed via Effect Atom, providing reactive updates when files are uploaded, moved, or deleted. Components use `Result.builder` to handle loading, success, and error states declaratively.

## Integration

### With Applications
- `apps/web` - Primary consumer for file management pages
- `apps/notes` - Document attachments and media uploads

### With Feature Slices
- `packages/documents/ui` - May compose these components for document-specific workflows
- `packages/iam/ui` - Profile image upload flows

### With Shared Layer
- `packages/shared/client` - Consumes atoms for state management
- `packages/shared/domain` - Uses File and Folder entity types

## Component Patterns

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

### Effect Array Utilities

All array operations follow Effect patterns (no native array methods):

```typescript
import * as A from "effect/Array";
import * as F from "effect/Function";

// Filter pending uploads for root folder
const pendingUploads = F.pipe(
  activeUploads,
  A.filter((u) => u.folderId === null)
);

// Check if file is selected
const isSelected = A.contains(selection.fileIds, file.id);

// Map folders to components
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

## Development

```bash
# Type check
bun run --filter @beep/shared-ui check

# Lint
bun run --filter @beep/shared-ui lint

# Lint and fix
bun run --filter @beep/shared-ui lint:fix

# Build (ESM + CJS with "use client" transforms)
bun run --filter @beep/shared-ui build

# Test
bun run --filter @beep/shared-ui test
```

## Build Notes

- Generates both ESM and CJS builds via Babel
- Uses `babel-plugin-transform-next-use-client` to preserve Next.js client boundaries
- All components are client-side only (use `"use client"` directive)
- Build output includes source maps for debugging

## Upload Progress Tracking

The `PendingFileItem` component displays real-time upload progress with multiple phases:

```typescript
import { PendingFileItem } from "@beep/shared-ui";
import type { ActiveUpload } from "@beep/shared-client/atom";

// The component automatically tracks these phases:
// 1. "Compressing..." - Image compression in progress
// 2. "Uploading..." - File upload to storage
// 3. "Syncing..." - Syncing metadata to database
// 4. "Done" - Upload complete
// 5. Error states with specific messages (e.g., "Image too large after compression")

function MyUploadsList({ uploads }: { uploads: ActiveUpload[] }) {
  return (
    <div>
      {uploads.map((upload) => (
        <PendingFileItem key={upload.id} upload={upload} />
      ))}
    </div>
  );
}
```

Error handling includes specific error types from `@beep/shared-client/atom`:
- `ImageTooLargeAfterCompression` - Displays compressed size in error message
- Generic upload failures show "Upload failed"

## Notes

- All components require client-side execution (Next.js App Router `"use client"`)
- Components expect Effect Atom providers to be set up in the application root
- File metadata schemas are generated via `effect/Arbitrary` for development/testing (see `mockMetadata` constant)
- Empty states and error boundaries are built-in to all major components
- The main index.ts currently only exports a placeholder `beep` constant - components are imported via package.json exports pattern (`"./files/FilesPage"` etc.)
- Selection state supports both individual files and folders with separate tracking arrays
- Download functionality uses imperative browser APIs (document.createElement) for file downloads
