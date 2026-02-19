# Lexical Canonical Editor - Component Design

**Date**: YYYY-MM-DD
**Phase**: 2 (Design & Implementation)

---

## Component API

```typescript
interface LexicalEditorProps {
  // Content
  initialMarkdown?: string;
  onChange?: (markdown: string) => void;

  // UI Modes
  fullscreenEnabled?: boolean;
  richSimpleToggleEnabled?: boolean;
  mobileSimplified?: boolean;

  // Plugin Composition
  plugins?: LexicalPlugin[];
  nodes?: LexicalNode[];

  // Styling
  className?: string;
  placeholder?: string;
}
```

### Props Decision Log

| Prop | Type | Default | Rationale |
|------|------|---------|-----------|
| ... | ... | ... | ... |

---

## File Structure

```
apps/todox/src/components/editor/
├── lexical-editor.tsx
├── plugins/
│   ├── ...
├── nodes/
│   ├── ...
├── themes/
│   ├── ...
└── index.ts
```

### File Responsibilities

| File | Responsibility | Exports |
|------|---------------|---------|
| ... | ... | ... |

---

## Plugin Architecture

### Included Plugins (Email Compose MVP)

| Plugin | Source | Modifications |
|--------|--------|---------------|
| ... | POC / New / blocks/editor-00 | None / [describe changes] |

### Plugin Composition Pattern

```typescript
// How plugins are composed
```

---

## State Management

### Markdown Serialization

- Input: `initialMarkdown` → Lexical state via `$convertFromMarkdownString`
- Output: Lexical state → Markdown via `$generateMarkdownFromNodes`
- Trigger: [onChange callback timing]

### Fullscreen Toggle

- Approach: [CSS / Portal / State]
- State management: [React state / Atom / URL param]

### Rich/Simple Toggle

- Approach: [Conditional render / Show/hide / Swap components]
- State preservation: [How content is preserved across mode switches]

---

## Integration Plan

### Tiptap Replacement Steps

1. [Step-by-step plan for replacing tiptap on `/` route]

### Send Button Integration

- [How the editor's content will be passed to the send handler]

---

## Mobile Responsive Design

### Toolbar Simplification

- Desktop: [Full toolbar description]
- Mobile: [Simplified toolbar description]
- Breakpoint: [px value]

### Slash Commands

- [Which features are accessible via slash commands on mobile]
