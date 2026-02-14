# Phase 2 Handoff: Lexical Canonical Editor

**Date**: 2026-02-14
**From**: Phase 2 (Design & Implementation)
**To**: Phase 3 (Cleanup & Polish)
**Status**: Ready for implementation

---

## Phase 2 Summary

Phase 2 (Design & Implementation) created the canonical `LexicalEditor` component at `apps/todox/src/components/editor/` and replaced the tiptap editor on the `/` route in both MailCompose and MailDetails. The component uses the newer `defineExtension` + `LexicalExtensionComposer` API, mounts 16 custom + 6 built-in plugins, registers 10 email-compose nodes, and outputs Markdown via `@lexical/markdown`.

### Key Findings

1. **Component Created**: `lexical-editor.tsx` with configurable props API (`initialMarkdown`, `onChange`, `fullscreenEnabled`, `placeholder`, etc.)
2. **Plugins**: 16 custom plugins imported from POC via relative paths + 6 built-in `@lexical/react` plugins
3. **Fullscreen**: Implemented using React `createPortal` + CSS fixed positioning + Escape key listener + `rerenderKey` pattern
4. **Markdown**: Input via `$convertFromMarkdownString`, output via `$convertToMarkdownString` using `PLAYGROUND_TRANSFORMERS`
5. **Tiptap Replaced**: Both `mail-compose.tsx` and `mail-details.tsx` now use `<LexicalEditor>` instead of `<Editor>`

### Key Decisions Made

From Phase 2:
1. **Import strategy**: Plugins and nodes imported from POC via relative paths (not duplicated) to keep POC intact
2. **Fullscreen mechanism**: React `createPortal` (not MUI Portal) to avoid MUI coupling in the Lexical component
3. **Rerender strategy**: `key` prop on `LexicalExtensionComposer` with incrementing counter forces fresh editor instance on fullscreen toggle
4. **Theme consolidation**: Confirmed playground theme and existing theme were identical content -- no replacement needed
5. **Markdown hook**: Custom `useMarkdownOnChange` hook using `editor.registerUpdateListener` (no debounce)

### Known Issues from Phase 2

1. **Fullscreen state loss**: `rerenderKey` approach destroys editor state on fullscreen toggle -- content resets to `initialMarkdown`
2. **Standalone fullscreen button**: Toggle is a separate hover button, not integrated into ToolbarPlugin
3. **Pre-existing upstream errors**: ~72 TS errors from stale `@beep/ui` build outputs + `@beep/customization-ui` Hotkeys.atoms.ts failure
4. **No debounce on markdown serialization**: `useMarkdownOnChange` fires on every editor update
5. **Relative POC imports create hidden dependency**: 3 custom nodes + 16 plugins depend on POC directory structure

---

## Context for Phase 3

### Working Context (~1500 tokens, budget <=2K)

**Current Task**: Cleanup and polish the canonical LexicalEditor -- remove tiptap dependencies, fix fullscreen state preservation, integrate fullscreen into toolbar, clean up old editor files, and improve accessibility.

**Success Criteria**:
- [ ] `features/editor/` directory deleted (tiptap editor code)
- [ ] `@tiptap/*` packages removed from `apps/todox/package.json`
- [ ] Fullscreen toggle preserves editor content across transitions (no state loss)
- [ ] Fullscreen toggle integrated into ToolbarPlugin (standalone button removed)
- [ ] `components/blocks/editor-00/` removed if no longer referenced
- [ ] Markdown serialization debounced (200ms, matching prior tiptap behavior)
- [ ] Custom nodes (ImageNode, MentionNode, EmojiNode) extracted from POC to `components/editor/nodes/`
- [ ] ARIA attributes added to editor container and toolbar
- [ ] Keyboard navigation works for toolbar buttons (Tab/Arrow keys)
- [ ] `bun run check --filter @beep/todox` passes (or upstream errors documented)
- [ ] `REFLECTION_LOG.md` updated with Phase 3 learnings

**Blocking Issues**: None.

**Constraints**:
- Do NOT modify files in `app/lexical/` (POC stays intact for reference)
- Verify no other files import from `features/editor/` before deleting
- Verify no other files import from `components/blocks/editor-00/` before deleting
- Preserve all current Lexical editor functionality while removing tiptap

### Episodic Context (~600 tokens, budget <=1K)

**Phase 2 Outcome**: Canonical LexicalEditor component created and integrated into MailCompose + MailDetails. All 16 custom plugins and 10 nodes functional. Markdown serialization working. Fullscreen toggle functional but loses content on transition.

**Critical Bug**: The `rerenderKey` pattern (incrementing `key` prop to force re-render) destroys all editor state when toggling fullscreen. The editor reinitializes from `initialMarkdown`, so any edits made before toggling are lost. Fix requires either: (a) capturing current markdown before toggle and passing as new `initialMarkdown`, or (b) sharing `EditorState` across the remount.

**Critical Discovery**: Tiptap removal is not as simple as deleting `features/editor/` -- the `mail-compose.tsx` and `mail-details.tsx` files may still reference tiptap-related state variables (`fullScreen.value`, `fullItem` prop). These integration points need explicit verification before deletion.

**Critical Discovery**: Three custom nodes (ImageNode, MentionNode, EmojiNode) are imported from the POC via relative paths. These must be extracted to `components/editor/nodes/` to remove the hidden dependency on POC structure.

### Semantic Context (~300 tokens, budget <=500)

**Tech Stack**:
- Lexical `@lexical/*` packages (already in todox dependencies)
- `defineExtension` + `LexicalExtensionComposer` API
- `@lexical/markdown` for serialization
- React 19, Next.js 16 App Router
- Tailwind CSS + shadcn/ui for styling

**File Structure (current)**:
```
apps/todox/src/components/editor/
├── index.ts                          # Barrel export
├── lexical-editor.tsx                # Main component
├── nodes/
│   └── email-compose-nodes.ts        # 10 email compose nodes
├── plugins/
│   └── index.tsx                     # Plugin composition (16 custom + 6 built-in)
├── hooks/
│   └── use-markdown-editor.ts        # Markdown serialization hook
├── themes/
│   ├── editor-theme.ts               # Playground theme
│   └── editor-theme.css              # Playground CSS + fullscreen styles
└── editor-ui/
    └── content-editable.tsx          # ContentEditable wrapper
```

### Procedural Context (links only)

**Primary Reference**: `specs/pending/lexical-canonical-editor/outputs/codebase-context.md`
**Phase 2 Handoff**: `specs/pending/lexical-canonical-editor/handoffs/HANDOFF_P2.md`
**Plugin Architecture**: `specs/completed/lexical-playground-port/outputs/02-plugin-architecture.md`
**Effect Patterns**: `.claude/rules/effect-patterns.md`
**Repository Rules**: `.claude/rules/general.md`

---

## Implementation Tasks (Phase 3)

### Task 1: Remove Tiptap Dependencies

**Objective**: Delete tiptap editor code and remove npm packages.

**Pre-deletion verification**:
1. Search for ALL imports from `features/editor/` across the codebase
2. Search for ALL `@tiptap/*` imports across the codebase
3. Confirm no file outside of `features/editor/` itself imports from that directory
4. Confirm `mail-compose.tsx` and `mail-details.tsx` no longer reference tiptap

**Files to delete**:
- `apps/todox/src/features/editor/` (entire directory)

**Package.json changes**:
- Remove `@tiptap/core`, `@tiptap/react`, `@tiptap/starter-kit`, and any other `@tiptap/*` packages from `apps/todox/package.json`
- Run `bun install` after removal

### Task 2: Fix Fullscreen State Preservation

**Objective**: Editor content must persist across fullscreen toggles.

**Current behavior**: `rerenderKey` increments the `key` prop on `LexicalExtensionComposer`, causing a full remount that reinitializes content from `initialMarkdown`.

**Recommended approach**:
1. Before toggling fullscreen, capture current markdown via `$convertToMarkdownString`
2. Store the captured markdown in a ref
3. After toggle, use the captured markdown as the new initial state
4. The `rerenderKey` pattern can remain, but the `initialMarkdown` prop should read from the ref

**Alternative approach**: Use `editor.getEditorState()` before toggle and `editor.setEditorState()` after, avoiding the markdown round-trip.

**File to modify**: `apps/todox/src/components/editor/lexical-editor.tsx`

### Task 3: Integrate Fullscreen into Toolbar

**Objective**: Move fullscreen toggle from standalone hover button into the ToolbarPlugin.

**Current state**: Fullscreen toggle is a separate button that appears on hover over the editor container, plus an exit button visible in fullscreen mode.

**Target state**: Fullscreen toggle appears as a toolbar button (expand icon) at the end of the toolbar, consistent with where users expect editor controls.

**Files to modify**:
- `apps/todox/src/components/editor/lexical-editor.tsx` (remove standalone button)
- `apps/todox/src/components/editor/plugins/index.tsx` (pass fullscreen callback to ToolbarPlugin)
- May need to extend ToolbarPlugin props or create a wrapper that adds the fullscreen button

**Note**: The ToolbarPlugin is imported from the POC via relative path. If modification is needed, create a wrapper component rather than modifying the POC source.

### Task 4: Extract Custom Nodes from POC

**Objective**: Copy the 3 custom nodes used by the canonical editor from the POC to `components/editor/nodes/`.

**Nodes to extract**:
- `ImageNode` from `app/lexical/nodes/ImageNode.tsx`
- `MentionNode` from `app/lexical/nodes/MentionNode.ts`
- `EmojiNode` from `app/lexical/nodes/EmojiNode.tsx`

**After extraction**:
- Update imports in `components/editor/nodes/email-compose-nodes.ts` to use local copies
- Update any plugin imports that reference POC node paths
- Verify the extracted nodes have no dependencies on other POC-only modules

### Task 5: Clean Up Old Editor Files

**Objective**: Remove unused editor wrappers if no longer referenced.

**Pre-deletion verification**:
1. Search for ALL imports from `components/blocks/editor-00/` across the codebase
2. If zero references found (outside the directory itself), delete the directory
3. If references exist, document them and skip deletion

**Files to potentially delete**:
- `apps/todox/src/components/blocks/editor-00/` (entire directory, if unreferenced)

### Task 6: Add Markdown Serialization Debounce

**Objective**: Prevent excessive markdown serialization on rapid typing.

**Current behavior**: `useMarkdownOnChange` fires `$convertToMarkdownString` on every `editor.registerUpdateListener` callback with no throttling.

**Target behavior**: Debounce markdown output by 200ms (matching tiptap's prior debounce interval).

**File to modify**: `apps/todox/src/components/editor/hooks/use-markdown-editor.ts`

### Task 7: Accessibility Improvements

**Objective**: Add ARIA attributes and keyboard navigation to the editor.

**Requirements**:
- `role="textbox"` and `aria-multiline="true"` on editor container
- `aria-label` on editor (use `placeholder` prop value or "Rich text editor")
- `role="toolbar"` and `aria-label="Formatting options"` on toolbar container
- Toolbar buttons navigable with Tab and Arrow keys
- Fullscreen toggle accessible via keyboard (already has Escape key for exit)

---

## Verification Steps

```bash
# Verify tiptap fully removed
grep -r "@tiptap" apps/todox/src/ --include="*.ts" --include="*.tsx"
# Expected: zero results

# Verify tiptap packages removed from package.json
grep "@tiptap" apps/todox/package.json
# Expected: zero results

# Verify no imports from deleted directories
grep -r "features/editor" apps/todox/src/ --include="*.ts" --include="*.tsx"
# Expected: zero results (or only in features/editor/ itself if not yet deleted)

grep -r "blocks/editor-00" apps/todox/src/ --include="*.ts" --include="*.tsx"
# Expected: zero results (or document references if deletion skipped)

# Verify custom nodes extracted
ls apps/todox/src/components/editor/nodes/ImageNode.tsx
ls apps/todox/src/components/editor/nodes/MentionNode.ts
ls apps/todox/src/components/editor/nodes/EmojiNode.tsx

# Type check
bun run check --filter @beep/todox

# Verify ARIA attributes present
grep -r "role=\"toolbar\"" apps/todox/src/components/editor/
grep -r "aria-label" apps/todox/src/components/editor/
```

---

## Known Issues & Gotchas

1. **Pre-existing upstream errors**: ~72 TS errors from stale `@beep/ui` build outputs (TS6305) and `@beep/customization-ui` Hotkeys.atoms.ts failure. These are NOT caused by our changes. If `bun run check --filter @beep/todox` fails, verify the errors are upstream by checking if they exist on the `main` branch.

2. **ToolbarPlugin is a POC import**: The ToolbarPlugin is imported from `app/lexical/plugins/ToolbarPlugin/` via relative path. Do NOT modify the POC file. Create a wrapper component if fullscreen integration requires toolbar changes.

3. **POC plugin dependencies**: The 16 custom plugins imported via relative paths may have internal dependencies on other POC utilities (e.g., shared contexts, utility functions). When extracting nodes, audit import chains for hidden dependencies.

4. **MailCompose fullscreen conflict**: MailCompose uses its own `fullScreen` state for the containing Paper element's sizing. The LexicalEditor's fullscreen is independent. After removing tiptap, verify the MailCompose fullscreen state variable is either removed or repurposed.

5. **Markdown round-trip fidelity**: Converting editor state to markdown and back may not be perfectly lossless for all formatting. Test with complex content (nested lists, inline images, emoji sequences) to identify any round-trip degradation.

---

## Implementation Order

1. **Task 2**: Fix fullscreen state preservation (highest impact bug fix)
2. **Task 4**: Extract custom nodes from POC (removes hidden dependency)
3. **Task 1**: Remove tiptap dependencies (requires verification first)
4. **Task 5**: Clean up old editor files (requires verification first)
5. **Task 3**: Integrate fullscreen into toolbar (UX improvement)
6. **Task 6**: Add markdown serialization debounce (performance improvement)
7. **Task 7**: Accessibility improvements (polish)

---

## Success Criteria

Phase 3 is complete when:
- [ ] `features/editor/` directory deleted and `@tiptap/*` packages removed
- [ ] Fullscreen toggle preserves editor content (no state loss)
- [ ] Fullscreen toggle integrated into toolbar (standalone button removed)
- [ ] Custom nodes (ImageNode, MentionNode, EmojiNode) extracted from POC
- [ ] `components/blocks/editor-00/` removed or references documented
- [ ] Markdown serialization debounced (200ms)
- [ ] ARIA attributes added (role, aria-label on editor and toolbar)
- [ ] `bun run check --filter @beep/todox` passes (or upstream errors documented)
- [ ] `REFLECTION_LOG.md` updated with Phase 3 learnings
- [ ] Spec README updated with completion status

**Note**: Phase 3 is the final phase of this spec. After completion, move the spec from `specs/pending/` to `specs/completed/` using `bun run spec:move -- lexical-canonical-editor completed`.
