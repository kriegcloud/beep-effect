---
path: packages/shared/ui
summary: Cross-slice React components for file management UI with Effect Atom state integration
tags: [react, ui, files, effect-atom, client-components]
---

# @beep/shared-ui

Reusable React components for file and folder management that bridge domain entities from `@beep/shared-domain` with base components from `@beep/ui`. All components are client-side only and integrate with Effect Atom for reactive state management.

## Architecture

```
|-------------------|     |-------------------|     |-------------------|
|  @beep/shared-ui  | --> | @beep/shared-client | --> | @beep/shared-domain |
|  (Components)     |     |  (Atoms/State)    |     |  (File/Folder)    |
|-------------------|     |-------------------|     |-------------------|
        |
        v
|-------------------|
|     @beep/ui      |
| (Base Components) |
|-------------------|

File Management Flow:
|--------------|     |--------------|     |--------------|
| FilesLayout  | --> |  FilesPage   | --> | FolderSection|
| (Toolbar)    |     | (Root View)  |     | (Nested)     |
|--------------|     |--------------|     |--------------|
                            |
                            v
                     |--------------|
                     |   FileItem   |
                     | PendingFileItem|
                     |--------------|
```

## Core Modules

| Module | Purpose |
|--------|---------|
| `files/FilesLayout` | Layout wrapper with toolbar, selection controls, action buttons |
| `files/FilesPage` | Main file browser showing root files and folders |
| `files/FilesEmptyState` | Empty state UI when no files exist |
| `files/file-item/FileItem` | Individual file display with metadata |
| `files/file-item/PendingFileItem` | Upload-in-progress display with progress indicator |
| `files/folder/FolderSection` | Collapsible folder section with nested files |
| `files/RootFilesSection` | Display section for root-level files |
| `files/CreateFolderDialog` | Dialog for creating new folders |
| `files/DeleteConfirmationDialog` | Confirmation dialog for file/folder deletion |
| `files/MoveFilesDialog` | Dialog for moving files between folders |
| `schemas/ReactNodeSchema` | Effect Schema for validating React nodes |

## Usage Patterns

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

### Result.builder for Loading States

```typescript
import { Result, useAtomValue } from "@effect-atom/atom-react";
import { filesAtom } from "@beep/shared-client/atom";

function MyComponent() {
  const filesResult = useAtomValue(filesAtom);

  return Result.builder(filesResult)
    .onSuccess(({ rootFiles, folders }) => <div>{/* render */}</div>)
    .onFailure(() => <div>Error loading files</div>)
    .orNull();
}
```

### Hydration Safety Pattern

```typescript
const [hydrated, setHydrated] = React.useState(false);

React.useEffect(() => {
  setHydrated(true);
}, []);

if (!hydrated) return null;
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Client-only components | File management requires browser APIs and Effect Atom state |
| Effect Atom over TanStack Query | Upload progress is local state, not server-cached data |
| Result.builder pattern | Declarative handling of loading/success/error states |
| Hydration guards | Prevents SSR mismatches with atom state |
| Effect Array utilities | Follows codebase-wide prohibition on native array methods |

## Key Atoms Consumed

| Atom | Purpose |
|------|---------|
| `filesAtom` | File and folder tree data |
| `activeUploadsAtom` | Currently uploading files with progress |
| `selectedFilesAtom` | Selected file/folder IDs for bulk operations |
| `CreateFolderAtom` | Action for creating folders |
| `moveFilesAtom` | Action for moving files |
| `deleteFilesAtom` | Action for deleting files/folders |

## Dependencies

**Internal**: `@beep/shared-domain`, `@beep/shared-client`, `@beep/ui`, `@beep/ui-core`, `@beep/schema`, `@beep/identity`

**External**: `effect`, `@effect-atom/atom-react`, `lucide-react`

## Related

- **AGENTS.md** - Comprehensive contributor guidance with 28 code examples
- **@beep/shared-client** - Atom state management consumed by these components
- **@beep/shared-domain** - File and Folder entity types
