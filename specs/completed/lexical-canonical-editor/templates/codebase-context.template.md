# Lexical Canonical Editor - Codebase Context

**Date**: YYYY-MM-DD
**Phase**: 1 (Discovery)

---

## Lexical POC Structure

### Directory Map

```
apps/todox/src/app/lexical/
├── [tree structure here]
```

### Plugin Catalog

| # | Plugin Name | Category | Email Compose Needed? | Notes |
|---|-------------|----------|----------------------|-------|
| 1 | ... | Formatting / Layout / Media / AI / Collaboration / Dev | Yes / No | ... |

**Total plugins**: X / 54
**Email compose plugins**: Y

### Node Types

| Node | Module | Purpose | Email Compose? |
|------|--------|---------|----------------|
| ... | PlaygroundNodes.ts | ... | Yes / No |

### Themes

| Theme File | Purpose | Reusable? |
|------------|---------|-----------|
| ... | ... | Yes / No |

---

## Tiptap Integration Points

### Current Location

- Route: `/`
- Component file: `apps/todox/src/features/editor/editor.tsx`
- Integration point: [describe how tiptap is mounted in the `/` route]

### Feature List

| Feature | Toolbar Button? | Shortcut | API Method | Behavior |
|---------|-----------------|----------|------------|----------|
| Bold | Yes | Cmd+B | `toggleBold()` | Toggles bold on selection |
| Italic | Yes | Cmd+I | ... | ... |
| ... | ... | ... | ... | ... |

### Fullscreen Toggle Implementation

- Implementation file: [path]
- Approach: [CSS-based / portal / state-driven]
- Key code: [brief description]

### Send Button Integration

- How content is extracted: [method]
- Format sent: [HTML / Markdown / JSON]
- Event handler: [path and function name]

---

## Existing Lexical Infrastructure

### components/blocks/editor-00/

| File | Purpose | Lines | Reusable? |
|------|---------|-------|-----------|
| editor.tsx | ... | ... | ... |
| nodes.ts | ... | ... | ... |
| plugins.tsx | ... | ... | ... |

**Assessment**: [Can this be extended? Should it be replaced?]

### components/editor/

| File | Purpose | Lines | Reusable? |
|------|---------|-------|-----------|
| ... | ... | ... | ... |

**Assessment**: [What should be preserved? What should be restructured?]

### Reusable Patterns

- [List specific patterns, components, or utilities that can be leveraged]

---

## Feature Mapping Table

| Tiptap Feature | Lexical Plugin | Availability | Priority | Notes |
|----------------|----------------|-------------|----------|-------|
| Bold | RichTextPlugin + BoldNode | Available | Must-have | ... |
| Italic | ... | Available | Must-have | ... |
| Underline | ... | ... | ... | ... |
| Strikethrough | ... | ... | ... | ... |
| Bullet List | ... | ... | Must-have | ... |
| Ordered List | ... | ... | Must-have | ... |
| Align Left | ... | ... | ... | ... |
| Align Center | ... | ... | ... | ... |
| Align Right | ... | ... | ... | ... |
| Align Justify | ... | ... | ... | ... |
| Insert Link | ... | ... | Must-have | ... |
| Remove Link | ... | ... | ... | ... |
| Insert Image | ... | ... | ... | ... |
| Hard Break | ... | ... | ... | ... |
| Clear Format | ... | ... | ... | ... |
| Fullscreen Toggle | ... | ... | Must-have | ... |

**Summary**: X/Y features available, Z missing and need implementation.

---

## Recommendations

### Plugin Selection for Email Compose MVP

[List the specific plugins to include, with justification]

### Architecture Recommendations

[Key findings that should inform Phase 2 component design]

### Risks and Open Questions

[Any concerns or unknowns discovered during exploration]
