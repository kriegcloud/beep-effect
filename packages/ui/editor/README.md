# @beep/ui-editor

Rich text editor UI components built on Lexical.

## Overview

This package provides document editing components for beep-effect applications:
- Lexical-based rich text editor
- Code highlighting, tables, and formatting plugins
- MUI-themed editor components

## Installation

```bash
bun add @beep/ui-editor
```

## Key Exports

| Export | Description |
|--------|-------------|
| Editor Components | Lexical-based rich text editor |
| `BeepEditorTheme` | MUI-integrated editor theme |
| Plugins | Code, table, and formatting plugins |

## Dependencies

| Package | Purpose |
|---------|---------|
| `lexical` | Rich text editor framework |
| `@lexical/react` | React bindings for Lexical |
| `@beep/ui` | Base UI components |
| `@beep/ui-core` | Core UI utilities |
| `@mui/material` | Material UI components |

## Usage

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

## Features

- **Rich Text Editing**: Bold, italic, underline, strikethrough
- **Code Blocks**: Syntax highlighting with Shiki
- **Tables**: Table creation and editing
- **Links**: URL insertion and editing
- **Lists**: Ordered and unordered lists

## Related Packages

| Package | Purpose |
|---------|---------|
| `@beep/ui` | Base UI components |
| `@beep/ui-core` | Core utilities |
| `@beep/documents-domain` | Document models |
