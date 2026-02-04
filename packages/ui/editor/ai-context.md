---
path: packages/ui/editor
summary: Lexical-based rich text editor components with formatting, code blocks, and collaboration
tags: [ui, editor, lexical, rich-text, collaboration, react]
---

# @beep/ui-editor

Rich text editor UI components built on Lexical. Provides document editing interface with formatting plugins, code highlighting, tables, and real-time collaboration via Liveblocks integration.

## Architecture

```
|-------------------|     |-------------------|     |-----------------|
|  LexicalComposer  | --> |  RichTextPlugin   | --> |  ContentEditable|
|-------------------|     |-------------------|     |-----------------|
        |                         |
        v                         v
|-------------------|     |-------------------|
|  Editor Plugins   |     |  BeepEditorTheme  |
|-------------------|     |-------------------|
        |
        v
|-------------------|
|  Liveblocks/Yjs   |
|-------------------|
```

## Core Modules

| Module | Purpose |
|--------|---------|
| `src/index.ts` | Main barrel export for editor components |
| `src/hooks/use-debounce.ts` | Debounced value hook for editor state |
| `src/hooks/use-report.ts` | Error reporting utilities |
| `src/hooks/use-update-toolbar.ts` | Toolbar state synchronization |
| `src/utils/debounce.ts` | Debounce utility function |

## Usage Patterns

### Basic Editor Setup

```typescript
import * as React from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { BeepEditorTheme } from "@beep/ui-editor";

const editorConfig = {
  namespace: "BeepEditor",
  theme: BeepEditorTheme,
  onError: (error: Error) => console.error(error),
};

export const DocumentEditor: React.FC = () => {
  return (
    <LexicalComposer initialConfig={editorConfig}>
      <RichTextPlugin
        contentEditable={<ContentEditable />}
        placeholder={<div>Start typing...</div>}
      />
    </LexicalComposer>
  );
};
```

### With Collaboration (Liveblocks)

```typescript
import * as React from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { CollaborationPlugin } from "@lexical/react/LexicalCollaborationPlugin";

// Liveblocks integration for real-time collaboration
// Requires @liveblocks/client and @liveblocks/react setup
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Lexical over Slate/ProseMirror | Better React integration, maintained by Meta, extensible plugin system |
| Liveblocks for collaboration | Managed WebSocket infrastructure, Yjs CRDT support |
| MUI theme integration | Consistent styling with rest of application |
| Effect-atom state management | Reactive state patterns consistent with repo conventions |

## Dependencies

**Internal**: `@beep/ui-core`, `@beep/ui`, `@beep/schema`, `@beep/utils`, `@beep/identity`

**External**: `lexical`, `@lexical/*` (code, link, list, table, react, rich-text, etc.), `@liveblocks/client`, `@liveblocks/react`, `@mui/material`, `@tanstack/react-form`, `effect`

## Related

- **AGENTS.md** - Contributor guardrails and plugin registration patterns
- **@beep/ui** - Base component patterns consumed by editor
- **apps/web** - Primary consumer for document editing views
