# Phase 3 Orchestrator Prompt: Lexical Canonical Editor

> Copy-paste this prompt to start Phase 3 (Cleanup & Polish).

---

You are implementing Phase 3 (Cleanup & Polish) of the lexical-canonical-editor spec.

### Context

Phase 2 (Design & Implementation) created the canonical `LexicalEditor` component at `apps/todox/src/components/editor/` and replaced the tiptap editor on the `/` route in MailCompose and MailDetails. The component mounts 16 custom plugins (imported from POC via relative paths) + 6 built-in plugins, registers 10 email-compose nodes, and outputs Markdown via `@lexical/markdown`. Fullscreen toggle is functional but **loses editor content** on transition due to the `rerenderKey` remount strategy.

**Key Issues to Fix**:
- Fullscreen toggle destroys editor state (content resets to `initialMarkdown`)
- Fullscreen button is a standalone hover element, not integrated into the toolbar
- Tiptap code and packages still exist in the codebase
- 3 custom nodes (ImageNode, MentionNode, EmojiNode) depend on POC via relative imports
- No debounce on markdown serialization
- No ARIA attributes on editor/toolbar

### Your Mission

Clean up, polish, and stabilize the canonical LexicalEditor component. Remove tiptap remnants, fix the fullscreen state bug, improve UX and accessibility.

**Specific Work Items** (in priority order):

1. **Fix fullscreen state preservation** (`components/editor/lexical-editor.tsx`)
   - Before toggling, capture current markdown via `$convertToMarkdownString` into a ref
   - Use captured markdown as new initial state after remount
   - The `rerenderKey` pattern can remain, but the initial content must come from the captured state
   - Alternative: use `editor.getEditorState()` / `editor.setEditorState()` to avoid markdown round-trip

2. **Extract custom nodes from POC** (`components/editor/nodes/`)
   - Copy `ImageNode.tsx`, `MentionNode.ts`, `EmojiNode.tsx` from `app/lexical/nodes/`
   - Update imports in `components/editor/nodes/email-compose-nodes.ts`
   - Audit for hidden dependencies on POC-only utilities

3. **Remove tiptap dependencies**
   - Verify no files import from `features/editor/` (except itself)
   - Delete `apps/todox/src/features/editor/` directory
   - Remove `@tiptap/*` packages from `apps/todox/package.json`
   - Run `bun install`

4. **Clean up old editor files**
   - Check if `components/blocks/editor-00/` is referenced anywhere
   - If unreferenced, delete it
   - If referenced, document the references and skip

5. **Integrate fullscreen into toolbar** (`components/editor/plugins/index.tsx`)
   - Remove standalone hover button from `lexical-editor.tsx`
   - Add fullscreen toggle button at the end of the toolbar
   - Do NOT modify POC files -- create a wrapper if needed

6. **Add markdown serialization debounce** (`components/editor/hooks/use-markdown-editor.ts`)
   - Debounce `$convertToMarkdownString` calls by 200ms

7. **Accessibility improvements**
   - `role="textbox"` + `aria-multiline="true"` on editor container
   - `aria-label` on editor (from `placeholder` prop or "Rich text editor")
   - `role="toolbar"` + `aria-label="Formatting options"` on toolbar
   - Toolbar buttons navigable with Tab/Arrow keys

### Current File Structure

```
apps/todox/src/components/editor/
├── index.ts                          # Barrel export
├── lexical-editor.tsx                # Main component (MODIFY: fullscreen fix, remove standalone button)
├── nodes/
│   └── email-compose-nodes.ts        # Node registry (MODIFY: update imports after extraction)
├── plugins/
│   └── index.tsx                     # Plugin composition (MODIFY: add fullscreen to toolbar)
├── hooks/
│   └── use-markdown-editor.ts        # Markdown hook (MODIFY: add debounce)
├── themes/
│   ├── editor-theme.ts               # Theme (keep as-is)
│   └── editor-theme.css              # CSS (keep as-is)
└── editor-ui/
    └── content-editable.tsx          # ContentEditable (keep as-is)
```

### Files to Delete

```
apps/todox/src/features/editor/       # Tiptap editor (VERIFY no external imports first)
apps/todox/src/components/blocks/editor-00/  # Old wrapper (VERIFY no external imports first)
```

### Pre-Existing Upstream Errors (NOT our fault)

The following errors exist on `main` and are NOT caused by our changes:
- ~72 TS6305 errors from stale `@beep/ui` build outputs
- `@beep/customization-ui` build failure in `Hotkeys.atoms.ts`
- These cause `bun run check --filter @beep/todox` to fail via cascading dependency checks

**Workaround**: Verify our files in isolation:
```bash
bun tsc --noEmit --isolatedModules apps/todox/src/components/editor/lexical-editor.tsx
```

### Critical Patterns

**Fullscreen State Preservation**:
```typescript
// Capture state before toggle
const markdownRef = useRef(initialMarkdown);

const handleToggleFullscreen = useCallback(() => {
  // Capture current content before remount
  editor.read(() => {
    markdownRef.current = $convertToMarkdownString(PLAYGROUND_TRANSFORMERS);
  });
  setFullscreen((prev) => !prev);
  setRerenderKey((prev) => prev + 1);
}, [editor]);

// Use ref value as initial state
<LexicalExtensionComposer
  key={rerenderKey}
  initialState={() => {
    $convertFromMarkdownString(markdownRef.current, PLAYGROUND_TRANSFORMERS);
  }}
>
```

**Pre-Deletion Import Verification**:
```bash
# Before deleting features/editor/
grep -r "features/editor" apps/todox/src/ --include="*.ts" --include="*.tsx" | grep -v "features/editor/"

# Before deleting components/blocks/editor-00/
grep -r "blocks/editor-00" apps/todox/src/ --include="*.ts" --include="*.tsx" | grep -v "blocks/editor-00/"
```

**Delegation Pattern** (REQUIRED):
- Use a general-purpose agent for implementation (single agent worked well in P2)
- Use `codebase-researcher` agent to verify import references before file deletion
- If upstream type errors block verification, use isolated `bun tsc --noEmit --isolatedModules` checks

**Do NOT**:
- Modify files in `app/lexical/` (POC stays intact)
- Remove plugins or nodes that are currently working
- Change the markdown wire format or transformer set
- Introduce new npm dependencies without justification

### Verification

```bash
# Verify tiptap fully removed
grep -r "@tiptap" apps/todox/src/ --include="*.ts" --include="*.tsx"
# Expected: zero results

# Verify tiptap packages removed
grep "@tiptap" apps/todox/package.json
# Expected: zero results

# Verify no imports from deleted directories
grep -r "features/editor" apps/todox/src/ --include="*.ts" --include="*.tsx"
# Expected: zero results

# Verify custom nodes extracted
ls apps/todox/src/components/editor/nodes/ImageNode.tsx
ls apps/todox/src/components/editor/nodes/MentionNode.ts
ls apps/todox/src/components/editor/nodes/EmojiNode.tsx

# Verify ARIA attributes
grep -r "role=\"toolbar\"" apps/todox/src/components/editor/
grep -r "aria-label" apps/todox/src/components/editor/

# Type check (may fail due to upstream -- use isolation if needed)
bun run check --filter @beep/todox
```

### Success Criteria

- [ ] `features/editor/` directory deleted and `@tiptap/*` packages removed from package.json
- [ ] Fullscreen toggle preserves editor content (no state loss on transition)
- [ ] Fullscreen toggle integrated into toolbar (standalone hover button removed)
- [ ] Custom nodes (ImageNode, MentionNode, EmojiNode) extracted from POC to `components/editor/nodes/`
- [ ] `components/blocks/editor-00/` removed or references documented
- [ ] Markdown serialization debounced (200ms)
- [ ] ARIA attributes added (role, aria-label on editor and toolbar)
- [ ] `bun run check --filter @beep/todox` passes (or upstream errors documented and our files verified in isolation)
- [ ] `REFLECTION_LOG.md` updated with Phase 3 learnings
- [ ] Spec README.md updated to completed status
- [ ] Spec moved to `specs/completed/` via `bun run spec:move -- lexical-canonical-editor completed`

### Handoff Document

Read full context in: `specs/pending/lexical-canonical-editor/handoffs/HANDOFF_P3.md`

### Related References

- **Codebase Context**: `specs/pending/lexical-canonical-editor/outputs/codebase-context.md`
- **Phase 2 Handoff**: `specs/pending/lexical-canonical-editor/handoffs/HANDOFF_P2.md`
- **Plugin Architecture**: `specs/completed/lexical-playground-port/outputs/02-plugin-architecture.md`
- **Effect Patterns**: `.claude/rules/effect-patterns.md`
- **Reflection Log**: `specs/pending/lexical-canonical-editor/REFLECTION_LOG.md`

### Finalization

Phase 3 is the final phase of this spec. After completing all tasks:
1. Update `REFLECTION_LOG.md` with Phase 3 learnings
2. Update spec `README.md` with completion status
3. Move spec: `bun run spec:move -- lexical-canonical-editor completed`
