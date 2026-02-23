# Phase 1 Handoff: Lexical Canonical Editor

**Date**: 2026-02-14
**From**: Phase 1 (Discovery)
**To**: Phase 2 (Design & Implementation)
**Status**: Ready for implementation

---

## Phase 1 Summary

Phase 1 (Discovery) systematically explored the codebase to map the Lexical POC structure, tiptap integration points, existing Lexical wrappers, and feature mapping. Three parallel codebase-researcher agents explored 200+ files across the todox app.

### Key Findings

1. **Lexical POC**: 53 custom plugins, 34 node types, comprehensive Tailwind/shadcn theme with dark mode. Uses newer `defineExtension` + `LexicalExtensionComposer` API.
2. **Tiptap Integration**: 22 toolbar features, HTML output via `editor.getHTML()`, fullscreen via MUI Portal + CSS fixed positioning. Send buttons are non-functional (purely presentational).
3. **Existing Wrappers**: `editor-00` has clean dual-callback API but only 4 nodes/2 plugins. Shared `components/editor/` provides simpler theme (superseded by playground theme). Playground has its own theme + ContentEditable (duplication).
4. **Feature Mapping**: 22/25 tiptap features have Lexical equivalents. 2 missing: Fullscreen Toggle (must implement), Text Transform command (nice-to-have).

### Key Decisions Made

From Phase 0:
1. **Location**: `apps/todox/src/components/editor/` (app-specific, not shared package)
2. **Wire Format**: Markdown (Lexical ↔ Markdown serialization)
3. **Plugin Strategy**: Configurable composition, not all 53 plugins hardcoded
4. **UI Modes**: Fullscreen toggle + rich/simple mode toggle
5. **Mobile**: Simplified toolbar, not separate component
6. **First Integration**: Replace tiptap on `/` route (email compose)

From Phase 1:
7. **Composer API**: Use `defineExtension` + `LexicalExtensionComposer` (newer API from playground)
8. **Theme**: Consolidate to playground theme (206 lines, dark mode, variants)
9. **External API**: Preserve dual-callback pattern from `editor-00`, extend with `onMarkdownChange`
10. **Node architecture**: Modular sets (`coreNodes`, `emailNodes`, `fullNodes`)
11. **Email compose plugins**: 16 custom + 6 built-in (see codebase-context.md)
12. **Fullscreen**: Must be implemented (not in POC). Use tiptap's pattern: React state + Portal + CSS fixed + Escape key.

---

## Context for Phase 2

### Working Context (~1200 tokens, budget ≤2K)

**Current Task**: Design and implement the canonical LexicalEditor component at `apps/todox/src/components/editor/`, then replace tiptap on the `/` route.

**Success Criteria**:
- [ ] `apps/todox/src/components/editor/lexical-editor.tsx` created with configurable plugin composition
- [ ] Props API: `initialMarkdown`, `onChange(markdown)`, `fullscreenEnabled`, `richSimpleToggleEnabled`, `mobileSimplified`, `plugins[]`, `nodes[]`, `className`, `placeholder`
- [ ] 16 email-compose plugins wired up and functional
- [ ] 10 email-compose nodes registered
- [ ] Fullscreen toggle implemented (React state + Portal + CSS fixed + Escape key)
- [ ] Markdown serialization working (`$convertToMarkdownString` / `$convertFromMarkdownString`)
- [ ] Tiptap editor on `/` route replaced with canonical Lexical editor
- [ ] Rich/simple mode toggle functional
- [ ] Mobile toolbar simplification (responsive, not separate component)
- [ ] `bun run check --filter @beep/todox` passes
- [ ] Visual parity with current tiptap toolbar (formatting, links, images)

**Blocking Issues**: None.

**Constraints**:
- No cross-package Lexical imports -- all Lexical code stays in todox app
- Use `@beep/*` path aliases for any shared imports
- Follow Effect patterns (namespace imports, no native JS methods)
- Playground theme should be the canonical theme source
- No code changes to the Lexical POC (`app/lexical/`) -- extract, don't modify

### Episodic Context (~600 tokens, budget ≤1K)

**Phase 1 Outcome**: Comprehensive codebase-context.md created with all 4 sections. 53 plugins cataloged, 22 tiptap features mapped, 2 gaps identified (fullscreen toggle, text transform).

**Critical Discovery**: The tiptap Send button has no onClick handler -- it's purely presentational. The canonical editor doesn't need to worry about send integration until a real handler is implemented.

**Critical Discovery**: The `fullItem` prop on tiptap's Editor controls toolbar complexity. When not passed (default), advanced buttons (Code, Code Block, Blockquote, HR, Undo, Redo) are hidden. The canonical editor should have a similar configuration mechanism.

**Critical Discovery**: Tiptap content is extracted as HTML, debounced 200ms. The canonical editor must output Markdown instead, requiring `@lexical/markdown` transformers.

### Semantic Context (~300 tokens, budget ≤500)

**Tech Stack**:
- Lexical `@lexical/*` packages (already in todox dependencies)
- `defineExtension` + `LexicalExtensionComposer` API (newer composer)
- `@lexical/markdown` for serialization
- Tailwind CSS + shadcn/ui for styling
- React 19, Next.js 16 App Router

**File Structure Target**:
```
apps/todox/src/components/editor/
├── lexical-editor.tsx          # Main component (LexicalExtensionComposer)
├── plugins/                    # Extracted plugins (subset of POC)
├── nodes/                      # Node registration sets
├── themes/                     # Consolidated theme (from POC)
├── hooks/                      # Extracted hooks
├── utils/                      # Extracted utilities
└── index.ts                    # Barrel export
```

### Procedural Context (links only)

**Primary Reference**: `specs/pending/lexical-canonical-editor/outputs/codebase-context.md`
**Plugin Architecture**: `specs/completed/lexical-playground-port/outputs/02-plugin-architecture.md`
**Node System**: `specs/completed/lexical-playground-port/outputs/04-node-system.md`
**Theming**: `specs/completed/lexical-playground-port/outputs/03-theming-styling.md`
**Component Design Template**: `specs/pending/lexical-canonical-editor/templates/component-design.template.md`
**Effect Patterns**: `.claude/rules/effect-patterns.md`
**Repository Rules**: `.claude/rules/general.md`

---

## Implementation Tasks (Phase 2)

### Task 1: Create Editor Component

**Objective**: Build the canonical LexicalEditor component with configurable props API.

**Sub-tasks**:
1. Create `lexical-editor.tsx` with `LexicalExtensionComposer`
2. Define props interface (see Component API below)
3. Wire up 16 email-compose plugins
4. Register 10 email-compose node types
5. Integrate consolidated theme

**Key Files to Extract From**:
- `app/lexical/App.tsx` (composer pattern)
- `app/lexical/Editor.tsx` (plugin mounting)
- `app/lexical/plugins/ToolbarPlugin/` (toolbar)
- `app/lexical/themes/editor-theme.ts` (theme)

### Task 2: Implement Fullscreen Toggle

**Objective**: Add fullscreen mode matching tiptap's UX.

**Pattern from tiptap** (`features/editor/editor.tsx:97-139`):
```typescript
// State
const [fullscreen, setFullscreen] = useState(false)

// Toggle: unmount → toggle state → force re-render
const handleToggleFullscreen = useCallback(() => {
  editor?.unmount();
  setFullscreen((prev) => !prev);
  setRerenderKey((prev) => prev + 1);
}, [editor]);

// Escape key exits fullscreen
// Portal wraps editor when fullscreen
// CSS: position: fixed, 16px margin, modal z-index
```

### Task 3: Implement Markdown Serialization

**Objective**: Wire format is Markdown, not HTML.

**Key APIs**:
- `$convertToMarkdownString(PLAYGROUND_TRANSFORMERS)` for output
- `$convertFromMarkdownString(markdown, PLAYGROUND_TRANSFORMERS)` for input
- Transformers defined in `app/lexical/plugins/MarkdownTransformers/`

### Task 4: Replace Tiptap on `/` Route

**Objective**: Swap tiptap Editor in MailCompose and MailDetails with canonical Lexical editor.

**Files to modify**:
- `apps/todox/src/features/mail/mail-compose.tsx` (line 127: Editor usage)
- `apps/todox/src/features/mail/mail-details.tsx` (line 240: Editor usage)

**Current tiptap API**:
```typescript
<Editor
  value={message}          // HTML string
  onChange={handleChange}   // (html: string) => void
  placeholder="Type a message"
/>
```

**Target Lexical API**:
```typescript
<LexicalEditor
  initialMarkdown={message}
  onChange={handleChange}    // (markdown: string) => void
  placeholder="Type a message"
  fullscreenEnabled
/>
```

### Task 5: Mobile Responsive Toolbar

**Objective**: Simplified toolbar on small screens.

**Pattern**: Use viewport width detection (playground already has this in `Editor.tsx:129-143`) to conditionally render a reduced toolbar set.

---

## Component API (from Phase 0 decisions + Phase 1 findings)

```typescript
interface LexicalEditorProps {
  // Content
  initialMarkdown?: string;
  onChange?: (markdown: string) => void;
  onEditorStateChange?: (state: EditorState) => void;

  // UI Modes
  fullscreenEnabled?: boolean;
  richSimpleToggleEnabled?: boolean;
  mobileSimplified?: boolean;

  // Plugin Composition
  plugins?: React.ReactNode[];
  nodes?: Array<Klass<LexicalNode>>;

  // Styling
  className?: string;
  placeholder?: string;
}
```

---

## Verification Steps

```bash
# Type check
bun run check --filter @beep/todox

# Verify new files exist
ls apps/todox/src/components/editor/lexical-editor.tsx

# Verify tiptap imports removed from mail
grep -r "@tiptap" apps/todox/src/features/mail/

# Visual: load / route and verify editor renders with toolbar
```

---

## Known Issues & Gotchas

1. **Tiptap removal**: After replacing tiptap, the entire `features/editor/` directory and tiptap npm packages can be removed. Do NOT remove in Phase 2 -- defer cleanup to Phase 3.

2. **Content format migration**: Existing `message` state in MailCompose stores HTML. When switching to Markdown, ensure empty string handling works correctly.

3. **Re-render strategy**: The tiptap editor uses `rerenderKey` + `shouldRerenderOnTransaction` for performance. The Lexical editor may need a similar optimization.

4. **MailCompose Portal**: MailCompose is already rendered via MUI Portal at bottom-right. The editor's own fullscreen toggle should not conflict with this outer portal.

5. **Toolbar state**: Tiptap uses `useEditorState` with a selector for efficient re-renders. Lexical uses `useToolbarContext` + `useUpdateToolbarHandler`. Both are efficient but architecturally different.

---

## Success Criteria

Phase 2 is complete when:
- [ ] `apps/todox/src/components/editor/lexical-editor.tsx` exists with full props API
- [ ] 16 email-compose plugins mounted and functional
- [ ] Fullscreen toggle works (enter/exit, Escape key)
- [ ] Markdown serialization works (input and output)
- [ ] Tiptap replaced on `/` route (MailCompose + MailDetails)
- [ ] Toolbar has visual parity with tiptap toolbar
- [ ] `bun run check --filter @beep/todox` passes
- [ ] `REFLECTION_LOG.md` updated with Phase 2 learnings
- [ ] `HANDOFF_P3.md` created (cleanup + testing phase)
- [ ] `P3_ORCHESTRATOR_PROMPT.md` created

**Critical**: Phase 2 is NOT complete until BOTH handoff files exist.
