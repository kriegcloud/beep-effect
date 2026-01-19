# @beep/ui-editor — Agent Guide

## Purpose & Fit
- Rich text editor UI components built on Lexical.
- Provides document editing interface with formatting, code blocks, and collaboration features.
- Integrates with MUI theming and Effect-atom state management.
- Consumes `@beep/ui` and `@beep/ui-core` for base component patterns.

## Surface Map
- **Index (`src/index.ts`)** — Main barrel export for editor components.
- **Editor Components** — Lexical-based rich text editor with plugins.
- **Plugins** — Code highlighting, tables, links, and formatting plugins.

## Usage Snapshots
- `apps/web/` — Imports editor for document creation and editing.
- `packages/documents/ui/` — May compose editor components for document views.

## Authoring Guardrails
- ALWAYS use Lexical APIs for editor state management, not direct DOM manipulation.
- Components MUST follow Effect-atom patterns for React state.
- NEVER use `dangerouslySetInnerHTML`; use Lexical's safe HTML import/export.
- Styling MUST use MUI theming system for consistency.
- Plugin registration MUST use Lexical's composer pattern.

## Quick Recipes
```tsx
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

## Verifications
- `bun run check --filter @beep/ui-editor`
- `bun run lint --filter @beep/ui-editor`
- `bun run test --filter @beep/ui-editor`

## Contributor Checklist
- [ ] Lexical plugins registered via composer pattern.
- [ ] No direct DOM manipulation; use Lexical commands.
- [ ] Accessibility attributes for screen reader support.
- [ ] MUI theme tokens used for styling.
