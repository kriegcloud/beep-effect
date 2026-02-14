# Lexical Editor Keyboard Shortcuts Inventory

> Complete catalog of all keyboard shortcuts in `apps/todox/src/app/lexical/`
> Generated from codebase analysis of ShortcutsPlugin, Lexical built-ins, and plugin-specific bindings.

---

## Custom Shortcuts (ShortcutsPlugin)

**Source**: `apps/todox/src/app/lexical/plugins/ShortcutsPlugin/shortcuts.ts` and `index.tsx`

All shortcuts use `Cmd` on Mac and `Ctrl` on Windows/Linux unless noted otherwise.

### Block Formatting

| # | Mac | Windows/Linux | Action | Source Line |
|---|-----|---------------|--------|-------------|
| 1 | Cmd+Opt+0 | Ctrl+Alt+0 | Normal paragraph | index.tsx:73-74 |
| 2 | Cmd+Opt+1 | Ctrl+Alt+1 | Heading 1 | index.tsx:75-78 |
| 3 | Cmd+Opt+2 | Ctrl+Alt+2 | Heading 2 | index.tsx:75-78 |
| 4 | Cmd+Opt+3 | Ctrl+Alt+3 | Heading 3 | index.tsx:75-78 |
| 5 | Cmd+Opt+C | Ctrl+Alt+C | Code block | index.tsx:85-86 |
| 6 | Cmd+Opt+M | Ctrl+Alt+M | Insert inline comment | index.tsx:125-126 |

### Lists

| # | Mac | Windows/Linux | Action | Source Line |
|---|-----|---------------|--------|-------------|
| 7 | Cmd+Shift+8 | Ctrl+Shift+8 | Bullet list | index.tsx:79-80 |
| 8 | Cmd+Shift+7 | Ctrl+Shift+7 | Numbered list | index.tsx:81-82 |
| 9 | Cmd+Shift+9 | Ctrl+Shift+9 | Check list | index.tsx:83-84 |

### Text Formatting

| # | Mac | Windows/Linux | Action | Source Line |
|---|-----|---------------|--------|-------------|
| 10 | Cmd+Shift+X | Ctrl+Shift+X | Strikethrough | index.tsx:89-90 |
| 11 | Cmd+Shift+C | Ctrl+Shift+C | Inline code | index.tsx:113-114 |
| 12 | Cmd+Shift+. | Ctrl+Shift+. | Increase font size | index.tsx:115-116 |
| 13 | Cmd+Shift+, | Ctrl+Shift+, | Decrease font size | index.tsx:117-118 |
| 14 | Cmd+, | Ctrl+, | Subscript | index.tsx:109-110 |
| 15 | Cmd+. | Ctrl+. | Superscript | index.tsx:111-112 |
| 16 | Cmd+\\ | Ctrl+\\ | Clear formatting | index.tsx:119-120 |

### Text Case

| # | Mac | Windows/Linux | Action | Source Line |
|---|-----|---------------|--------|-------------|
| 17 | Ctrl+Shift+1 | Ctrl+Shift+1 | Lowercase | index.tsx:91-92 |
| 18 | Ctrl+Shift+2 | Ctrl+Shift+2 | UPPERCASE | index.tsx:93-94 |
| 19 | Ctrl+Shift+3 | Ctrl+Shift+3 | Capitalize Each Word | index.tsx:95-96 |

### Alignment

| # | Mac | Windows/Linux | Action | Source Line |
|---|-----|---------------|--------|-------------|
| 20 | Cmd+Shift+E | Ctrl+Shift+E | Center align | index.tsx:101-102 |
| 21 | Cmd+Shift+L | Ctrl+Shift+L | Left align | index.tsx:103-104 |
| 22 | Cmd+Shift+R | Ctrl+Shift+R | Right align | index.tsx:105-106 |
| 23 | Cmd+Shift+J | Ctrl+Shift+J | Justify | index.tsx:107-108 |

### Indentation

| # | Mac | Windows/Linux | Action | Source Line |
|---|-----|---------------|--------|-------------|
| 24 | Cmd+] | Ctrl+] | Indent | index.tsx:97-98 |
| 25 | Cmd+[ | Ctrl+[ | Outdent | index.tsx:99-100 |

### Block Quote

| # | Mac | Windows/Linux | Action | Source Line |
|---|-----|---------------|--------|-------------|
| 26 | Ctrl+Shift+Q | Ctrl+Shift+Q | Block quote | index.tsx:87-88 |

### Links

| # | Mac | Windows/Linux | Action | Source Line |
|---|-----|---------------|--------|-------------|
| 27 | Cmd+K | Ctrl+K | Insert/edit link | index.tsx:121-124 |

---

## Lexical Built-in Shortcuts

**Source**: Lexical core via `RichTextPlugin` and `HistoryPlugin`

### Text Formatting (Built-in)

| # | Mac | Windows/Linux | Action | Source |
|---|-----|---------------|--------|--------|
| 28 | Cmd+B | Ctrl+B | Bold | RichTextPlugin (Lexical built-in) |
| 29 | Cmd+I | Ctrl+I | Italic | RichTextPlugin (Lexical built-in) |
| 30 | Cmd+U | Ctrl+U | Underline | RichTextPlugin (Lexical built-in) |

### History

| # | Mac | Windows/Linux | Action | Source |
|---|-----|---------------|--------|--------|
| 31 | Cmd+Z | Ctrl+Z | Undo | HistoryPlugin (Lexical built-in) |
| 32 | Cmd+Shift+Z | Ctrl+Y | Redo | HistoryPlugin (Lexical built-in) |

---

## AI Assistant Plugin

**Source**: `apps/todox/src/app/lexical/plugins/AiAssistantPlugin/index.tsx`

| # | Mac | Windows/Linux | Action | Source Line |
|---|-----|---------------|--------|-------------|
| 33 | Cmd+Shift+I | Ctrl+Shift+I | Open AI panel | index.tsx:114-125 |
| 34 | Esc | Esc | Close AI panel | index.tsx:101-112 |

---

## Tab & Indentation

**Source**: `TabIndentationPlugin`, `TabFocusPlugin`, `AutocompletePlugin`

| # | Key | Action | Source |
|---|-----|--------|--------|
| 35 | Tab | Accept autocomplete / Indent in lists | AutocompletePlugin, TabIndentationPlugin |
| 36 | Shift+Tab | Outdent in lists | TabIndentationPlugin |

---

## Context-Specific Navigation

**Source**: Various plugins

| # | Key | Action | Context | Source |
|---|-----|--------|---------|--------|
| 37 | Enter | Exit collapsible title / New line | Inside collapsible | CollapsiblePlugin |
| 38 | Esc | Exit link editing mode | Link editor open | FloatingLinkEditorPlugin |
| 39 | Arrow keys | Navigate in collapsible containers | Inside collapsible | CollapsiblePlugin |
| 40 | Arrow keys | Navigate between layout columns | Inside layout | LayoutPlugin |

---

## Typeahead Triggers

**Not keyboard shortcuts per se, but keyboard-initiated interactions.**

| # | Trigger | Action | Source |
|---|---------|--------|--------|
| 41 | `/` (slash) | Open slash command menu | ComponentPickerPlugin/index.tsx:385 |
| 42 | `@` (at) | Open mentions menu | MentionsPlugin/index.tsx:31,596 |
| 43 | `:` (colon) | Open emoji picker | EmojiPickerPlugin/index.tsx:122 |

---

## Markdown Auto-Transforms

**Source**: `apps/todox/src/app/lexical/plugins/MarkdownTransformers/index.ts`

Triggered by typing markdown syntax followed by space or closing delimiter.

### Block Transforms

| # | Pattern | Action | Transformer |
|---|---------|--------|-------------|
| 44 | `# ` | Heading 1 | ELEMENT_TRANSFORMERS |
| 45 | `## ` | Heading 2 | ELEMENT_TRANSFORMERS |
| 46 | `### ` | Heading 3 | ELEMENT_TRANSFORMERS |
| 47 | `* ` or `- ` | Bullet list | ELEMENT_TRANSFORMERS |
| 48 | `1. ` | Numbered list | ELEMENT_TRANSFORMERS |
| 49 | `[] ` or `[x] ` | Check list | CHECK_LIST transformer |
| 50 | `---` or `***` | Horizontal rule | HR transformer (line 39) |

### Inline Transforms

| # | Pattern | Action | Transformer |
|---|---------|--------|-------------|
| 51 | `` `code` `` | Inline code | TEXT_FORMAT_TRANSFORMERS |
| 52 | `**bold**` | Bold text | TEXT_FORMAT_TRANSFORMERS |
| 53 | `*italic*` or `_italic_` | Italic text | TEXT_FORMAT_TRANSFORMERS |
| 54 | `~~strikethrough~~` | Strikethrough | TEXT_FORMAT_TRANSFORMERS |

### Special Element Transforms

| # | Pattern | Action | Transformer |
|---|---------|--------|-------------|
| 55 | `![alt](url)` | Insert image | IMAGE transformer (line 60) |
| 56 | `:emoji_name:` | Convert to emoji | EMOJI transformer (line 84) |
| 57 | `$equation$` | Insert LaTeX equation | EQUATION transformer (line 103) |
| 58 | `\| table \|` | Create table | TABLE transformer (line 145) |

---

## Draggable Block Plugin

**Source**: `apps/todox/src/app/lexical/plugins/DraggableBlockPlugin/index.tsx`

| # | Key | Action | Context | Source Line |
|---|-----|--------|---------|-------------|
| 59 | Arrow Down | Move focus to next block | While dragging | index.tsx:154-166 |
| 60 | Arrow Up | Move focus to previous block | While dragging | index.tsx:154-166 |
| 61 | Esc | Cancel drag | While dragging | index.tsx:154-166 |

---

## Summary

| Category | Count |
|----------|-------|
| Custom shortcuts (ShortcutsPlugin) | 27 |
| Lexical built-in shortcuts | 5 |
| AI assistant shortcuts | 2 |
| Tab/indentation | 2 |
| Context-specific navigation | 4 |
| Typeahead triggers | 3 |
| Markdown auto-transforms | 15 |
| Draggable block | 3 |
| **Total** | **61** |

---

## Browser & OS Conflict Analysis

### Platform Branching in ShortcutsPlugin

The plugin uses a single constant for platform detection:

```typescript
const CONTROL_OR_META = { ctrlKey: !IS_APPLE, metaKey: IS_APPLE };
```

- **Mac**: Uses `Cmd` (metaKey) — Chrome DevTools uses `Cmd+Option`, so `Cmd+Shift` combinations are free.
- **Linux/Windows**: Uses `Ctrl` (ctrlKey) — Chrome DevTools uses `Ctrl+Shift+{I,J,C}`, creating direct conflicts.

**Exceptions**: Quote (`Ctrl+Shift+Q`) and text case (`Ctrl+Shift+{1,2,3}`) always use `ctrlKey: true` on both platforms.

### Chrome Browser Conflicts (Linux/Windows)

These shortcuts are intercepted by Chrome before they reach the web page:

| # | Shortcut | Editor Action | Chrome Action | Severity |
|---|----------|---------------|---------------|----------|
| 33 | Ctrl+Shift+I | Open AI panel | Open DevTools | BROKEN |
| 23 | Ctrl+Shift+J | Justify text | Open DevTools Console | BROKEN |
| 11 | Ctrl+Shift+C | Inline code | DevTools Inspect Element | BROKEN |
| 27 | Ctrl+K | Insert/edit link | Focus address bar (search) | LIKELY BROKEN |

**Note**: `Ctrl+K` behavior varies — some Chrome versions allow `preventDefault()` when the editor has focus, others always redirect to the address bar.

### Potential Linux Desktop Environment Conflicts

Depending on the user's DE (KDE, GNOME, XFCE, i3, etc.), `Ctrl+Alt+{number}` may be reserved for workspace switching:

| # | Shortcut | Editor Action | DE Action | Severity |
|---|----------|---------------|-----------|----------|
| 1 | Ctrl+Alt+0 | Normal paragraph | Varies by DE | RISK |
| 2 | Ctrl+Alt+1 | Heading 1 | Switch to workspace 1 (KDE/GNOME) | RISK |
| 3 | Ctrl+Alt+2 | Heading 2 | Switch to workspace 2 (KDE/GNOME) | RISK |
| 4 | Ctrl+Alt+3 | Heading 3 | Switch to workspace 3 (KDE/GNOME) | RISK |
| 5 | Ctrl+Alt+C | Code block | Varies by DE | RISK |

These are OS-level intercepts — the browser never sees the keypress.

### Shortcuts Safe Across All Platforms

These have no known conflicts with Chrome or common Linux DEs:

| # | Shortcut (Linux/Win) | Action | Status |
|---|----------------------|--------|--------|
| 7-9 | Ctrl+Shift+{7,8,9} | Lists | SAFE |
| 10 | Ctrl+Shift+X | Strikethrough | SAFE |
| 12-13 | Ctrl+Shift+{.,} | Font size | SAFE |
| 14-15 | Ctrl+{.,} | Sub/superscript | SAFE |
| 16 | Ctrl+\\ | Clear formatting | SAFE |
| 17-19 | Ctrl+Shift+{1,2,3} | Text case | SAFE |
| 20 | Ctrl+Shift+E | Center align | SAFE |
| 21 | Ctrl+Shift+L | Left align | SAFE |
| 22 | Ctrl+Shift+R | Right align | SAFE |
| 24-25 | Ctrl+{[,]} | Indent/outdent | SAFE |
| 26 | Ctrl+Shift+Q | Block quote | SAFE |
| 28-32 | Ctrl+{B,I,U,Z,Y} | Built-in formatting | SAFE |

### Suggested Alternative Bindings

For the BROKEN shortcuts on Linux/Windows:

| # | Current (Broken) | Suggested Alternative | Rationale |
|---|------------------|-----------------------|-----------|
| 33 | Ctrl+Shift+I | Ctrl+Alt+I or Ctrl+Shift+/ | Avoids DevTools; `/` is mnemonic for AI slash |
| 23 | Ctrl+Shift+J | Ctrl+Alt+J | Avoids Console; keeps same letter |
| 11 | Ctrl+Shift+C | Ctrl+Alt+` or Ctrl+Shift+` | Avoids Inspect; backtick is mnemonic for code |
| 27 | Ctrl+K | Ctrl+Shift+K | Avoids address bar; common link shortcut in other editors |

**Implementation note**: The fix should only apply the alternative bindings on non-Apple platforms. Mac bindings (`Cmd+Shift+{I,J,C}`, `Cmd+K`) are safe and should remain unchanged.

---

## QA Status

| # | Status | Conflict | Notes |
|---|--------|----------|-------|
| 1 | PENDING | RISK (Linux DE) | Ctrl+Alt+0 may conflict with DE workspace switching |
| 2 | PENDING | RISK (Linux DE) | Ctrl+Alt+1 may conflict with DE workspace switching |
| 3 | PENDING | RISK (Linux DE) | Ctrl+Alt+2 may conflict with DE workspace switching |
| 4 | PENDING | RISK (Linux DE) | Ctrl+Alt+3 may conflict with DE workspace switching |
| 5 | PENDING | RISK (Linux DE) | Ctrl+Alt+C may conflict with DE |
| 6 | PENDING | - | |
| 7 | PENDING | - | |
| 8 | PENDING | - | |
| 9 | PENDING | - | |
| 10 | PENDING | - | |
| 11 | PENDING | BROKEN (Chrome) | Ctrl+Shift+C opens DevTools Inspect Element |
| 12 | PENDING | - | |
| 13 | PENDING | - | |
| 14 | PENDING | - | |
| 15 | PENDING | - | |
| 16 | PENDING | - | |
| 17 | PENDING | - | |
| 18 | PENDING | - | |
| 19 | PENDING | - | |
| 20 | PENDING | - | |
| 21 | PENDING | - | |
| 22 | PENDING | - | |
| 23 | PENDING | BROKEN (Chrome) | Ctrl+Shift+J opens DevTools Console |
| 24 | PENDING | - | |
| 25 | PENDING | - | |
| 26 | PENDING | - | |
| 27 | PENDING | LIKELY BROKEN (Chrome) | Ctrl+K may focus address bar |
| 28 | PENDING | - | |
| 29 | PENDING | - | |
| 30 | PENDING | - | |
| 31 | PENDING | - | |
| 32 | PENDING | - | |
| 33 | PENDING | BROKEN (Chrome) | Ctrl+Shift+I opens DevTools |
| 34 | PENDING | - | |
| 35 | PENDING | - | |
| 36 | PENDING | - | |
| 37 | PENDING | - | |
| 38 | PENDING | - | |
| 39 | PENDING | - | |
| 40 | PENDING | - | |
| 41 | PENDING | - | |
| 42 | PENDING | - | |
| 43 | PENDING | - | |
| 44 | PENDING | - | |
| 45 | PENDING | - | |
| 46 | PENDING | - | |
| 47 | PENDING | - | |
| 48 | PENDING | - | |
| 49 | PENDING | - | |
| 50 | PENDING | - | |
| 51 | PENDING | - | |
| 52 | PENDING | - | |
| 53 | PENDING | - | |
| 54 | PENDING | - | |
| 55 | PENDING | - | |
| 56 | PENDING | - | |
| 57 | PENDING | - | |
| 58 | PENDING | - | |
| 59 | PENDING | - | |
| 60 | PENDING | - | |
| 61 | PENDING | - | |
