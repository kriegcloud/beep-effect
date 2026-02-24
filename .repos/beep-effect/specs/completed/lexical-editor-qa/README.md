# lexical-editor-qa

> Systematic bug inventory, fix, and validation loop for the canonical Lexical editor component.

---

## Purpose

After completing `lexical-canonical-editor` (Phase 3), the canonical Lexical editor was moved from `apps/todox/src/app/lexical/` to `apps/todox/src/components/editor/` and integrated into the email compose area on the `/` route. Multiple runtime issues were discovered and patched during initial verification, but an exhaustive QA pass has not been done. This spec orchestrates a thorough audit-fix-validate cycle until the editor is production-ready.

---

## Problem Statement

The canonical Lexical editor at `apps/todox/src/components/editor/` has known and unknown issues:

### Known Issues (Already Fixed)
These were patched during Phase 3 of `lexical-canonical-editor`:
- Missing `commentEditorTheme` and `stickyEditorTheme` exports in `editor-theme.ts`
- `window is not defined` SSR crash in `settings.ts`
- `useAiContext must be used within AiContextProvider` - created `useAiContextSafe`
- `window is not defined` in `ExcalidrawModal.tsx` - used `next/dynamic`
- Missing `FlashMessageContext` - created `useFlashMessageContextSafe`
- `document is not defined` in `ImagesPlugin/index.tsx` - lazy-initialized `getDragImage()`
- `useCollaborationContext: no context provider found` - used raw `useContext` with fallback
- `MarkdownShortcuts: missing dependency table for transformer` - created `EMAIL_COMPOSE_TRANSFORMERS`
- `MarkdownShortcuts: missing dependency code for transformer` - filtered `CodeNode` from transformers

### Suspected Remaining Issues
- Additional console warnings/errors not yet discovered
- Plugin features that silently fail (no error but broken behavior)
- Toolbar buttons that don't work in email compose context
- Keyboard shortcuts that conflict or don't fire
- Fullscreen mode edge cases (state loss, scroll lock, escape key)
- Image paste/drag-drop functionality
- Link editing/floating toolbar issues
- Markdown round-trip fidelity (compose → serialize → deserialize)
- Mobile viewport responsiveness

---

## Scope

### In Scope
- **Exhaustive browser testing** of ALL enabled editor features on the `/` route
- **Console error/warning inventory** across all editor interactions
- **Bug documentation** with exact file paths, line numbers, and suggested fixes
- **Implementation of all fixes** identified in the inventory
- **Validation loop** — re-test after fixes, document new findings, repeat until clean

### Out of Scope
- The full Lexical playground at `/lexical` (separate context, different node set)
- New feature development (no adding features, only fixing what's broken)
- Package extraction to `packages/ui/editor` (future spec)
- Performance optimization (unless causing visible bugs)

---

## Success Criteria

- [ ] Zero console errors/warnings from editor-related code on `/` route
- [ ] All toolbar buttons functional in email compose context
- [ ] Markdown serialization round-trips correctly (type → serialize → clear → deserialize → matches)
- [ ] Fullscreen toggle works without state loss
- [ ] Image insertion (paste, drag-drop, toolbar button) works
- [ ] Link insertion and editing works (floating editor appears)
- [ ] Keyboard shortcuts work (bold, italic, underline, etc.)
- [ ] Checklist creation and toggling works
- [ ] Emoji picker works
- [ ] Mention picker works
- [ ] No SSR/hydration errors from editor code
- [ ] `bun run check --filter @beep/todox` passes (or pre-existing errors documented)
- [ ] `AGENT_PROMPTS.md` updated with any discovered prompt improvements

---

## Phase Overview

| Phase | Focus | Agents | Deliverable |
|-------|-------|--------|-------------|
| P1a | Bug Inventory (categories 1-5) | codebase-explorer + claude-in-chrome + next-devtools | `outputs/bug-inventory-partial.md` |
| P1b | Bug Inventory (categories 6-10) | codebase-explorer + claude-in-chrome + next-devtools | `outputs/bug-inventory.md` (merged) |
| P2 | Fix Implementation | general-purpose (code writer) | All fixes applied |
| P3 | Validation | claude-in-chrome | Re-test, update inventory |
| P2-P3 Loop | Iterate | Repeat P2→P3 until clean | Final clean inventory |

---

## Architecture Context

### Editor Location
```
apps/todox/src/components/editor/
├── lexical-editor.tsx          # Main LexicalEditor component (uses LexicalExtensionComposer)
├── plugins/
│   ├── index.tsx               # EmailComposePlugins - mounts 16 custom + 6 built-in plugins
│   ├── MarkdownTransformers/   # PLAYGROUND_TRANSFORMERS + EMAIL_COMPOSE_TRANSFORMERS
│   ├── MarkdownShortcutPlugin/ # Wrapper with configurable transformers prop
│   ├── ActionsPlugin/          # Markdown toggle, import/export
│   ├── ToolbarPlugin/          # Main formatting toolbar
│   ├── FloatingLinkEditorPlugin/
│   ├── FloatingTextFormatToolbarPlugin/
│   ├── ImagesPlugin/
│   ├── ComponentPickerPlugin/  # Slash command menu
│   ├── EmojiPickerPlugin/
│   ├── MentionsPlugin/
│   ├── AutoLinkPlugin/
│   ├── LinkPlugin/
│   ├── ShortcutsPlugin/
│   ├── TabFocusPlugin/
│   ├── DragDropPastePlugin/
│   ├── EmojisPlugin/
│   └── PreserveSelectionPlugin/
├── nodes/
│   ├── email-compose-nodes.ts  # 10-node subset for email compose
│   ├── ImageNode.tsx
│   ├── EmojiNode.tsx
│   ├── MentionNode.ts
│   ├── EquationNode.tsx        # NOT in email-compose-nodes
│   ├── embeds/TweetNode.tsx    # NOT in email-compose-nodes
│   └── ...
├── hooks/
│   └── use-markdown-editor.ts  # useMarkdownOnChange hook
├── context/
│   ├── SharedHistoryContext.tsx
│   └── toolbar-context.tsx
├── themes/
│   ├── editor-theme.ts
│   └── editor-theme.css
├── ui/
│   └── ContentEditable.tsx
├── utils/
│   └── emoji-list.ts
└── index.ts
```

### Integration Point
- **Route**: `/` (root route, mail inbox page)
- **Components**: `mail-compose.tsx` and `mail-details.tsx` in `apps/todox/src/features/mail/`
- **Entry**: `<LexicalEditor>` component from `apps/todox/src/components/editor/lexical-editor.tsx`

### Node Configuration
Email compose uses `EMAIL_COMPOSE_NODES` (10 nodes):
- HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode, AutoLinkNode
- HorizontalRuleNode, ImageNode, MentionNode, EmojiNode

NOT included (but some transformers/plugins may reference):
- TableNode, TableRowNode, TableCellNode, CodeNode, CodeHighlightNode
- EquationNode, TweetNode, ExcalidrawNode, etc.

### Transformer Configuration
Email compose uses `EMAIL_COMPOSE_TRANSFORMERS`:
- Custom: HR, IMAGE, EMOJI, CHECK_LIST
- Built-in: `ELEMENT_TRANSFORMERS` filtered to remove CodeNode deps
- Built-in: `MULTILINE_ELEMENT_TRANSFORMERS` filtered to remove CodeNode deps
- Built-in: `TEXT_FORMAT_TRANSFORMERS`, `TEXT_MATCH_TRANSFORMERS` (unfiltered)

---

## P1 Orchestrator Instructions

### Phase 1: Bug Inventory

**Objective**: Create an exhaustive inventory of ALL bugs in the canonical Lexical editor on the `/` route.

**Method**: The orchestrator should use browser automation (`claude-in-chrome`) to systematically test every enabled feature while monitoring console output.

**Diagnostic Tools**: In addition to browser automation, the orchestrator MUST use the `next-devtools` MCP plugin for superior error diagnostics:
1. Call `mcp__next-devtools__init` at the start of the session to initialize the devtools context
2. Call `mcp__next-devtools__nextjs_index` to discover the running Next.js dev server and list ALL available MCP tools
3. Use `mcp__next-devtools__nextjs_call` for runtime error details, component tree inspection, and build diagnostics — this provides MORE DETAIL than reading browser console messages
4. Use `mcp__next-devtools__browser_eval` for Playwright-based browser automation as an alternative to `claude-in-chrome`
5. Only fall back to `mcp__claude-in-chrome__read_console_messages` when `nextjs_call` tools are unavailable

#### Test Matrix

The following features MUST be tested. For each, record:
- Feature name
- Test action (what was done)
- Result (pass/fail)
- Console output (errors, warnings)
- File & line number where issue originates (if applicable)
- Suggested fix

##### 1. Console Baseline
- [ ] Navigate to `/` route
- [ ] Open DevTools console
- [ ] Record ALL existing console errors/warnings from editor code
- [ ] Filter out non-editor noise (React DevTools, Next.js HMR, etc.)

##### 2. Text Formatting (Toolbar)
- [ ] Bold (toolbar button + Ctrl+B)
- [ ] Italic (toolbar button + Ctrl+I)
- [ ] Underline (toolbar button + Ctrl+U)
- [ ] Strikethrough (toolbar button)
- [ ] Clear formatting

##### 3. Block Types
- [ ] Heading 1/2/3 selection
- [ ] Quote block
- [ ] Bullet list
- [ ] Ordered list
- [ ] Checklist (create, toggle items)

##### 4. Links
- [ ] Insert link via toolbar
- [ ] Floating link editor appears on link click
- [ ] Edit existing link
- [ ] Remove link
- [ ] Auto-link detection (typing a URL)

##### 5. Images
- [ ] Insert via toolbar button (if available)
- [ ] Paste image from clipboard
- [ ] Drag and drop image
- [ ] Image displays correctly

##### 6. Special Features
- [ ] Emoji picker (`:` trigger)
- [ ] Component picker (`/` slash command) — audit options against EMAIL_COMPOSE_NODES first
- [ ] Mention picker (`@` trigger)
- [ ] Horizontal rule insertion
- [ ] Markdown shortcuts (e.g., `# ` for heading, `- ` for list)

##### 7. Editor Modes
- [ ] Fullscreen toggle (expand → content preserved → collapse → content preserved)
- [ ] Escape key exits fullscreen
- [ ] Body scroll locked during fullscreen

##### 8. Keyboard Shortcuts
- [ ] Undo (Ctrl+Z)
- [ ] Redo (Ctrl+Y / Ctrl+Shift+Z)
- [ ] Tab focus navigation

##### 9. Markdown Serialization
- [ ] Type formatted content → check onChange callback fires with valid markdown
- [ ] Verify markdown round-trip (if initialMarkdown prop is used)

##### 10. Edge Cases
- [ ] Empty editor behavior
- [ ] Paste plain text
- [ ] Paste HTML content
- [ ] Rapidly toggle formatting on/off
- [ ] Select all + delete

#### Output Format

Create `outputs/bug-inventory.md` with this structure:

```markdown
# Lexical Editor Bug Inventory

## Summary
- Total issues found: N
- Critical (blocks functionality): N
- Warning (console noise): N
- Minor (cosmetic/UX): N

## Issues

### Issue #1: [Short Description]
- **Severity**: Critical / Warning / Minor
- **Category**: Console Error | Broken Feature | SSR | UX
- **Reproduction**: [Step-by-step to reproduce]
- **Observed Behavior**: [What happens]
- **Expected Behavior**: [What should happen]
- **Console Output**: [Exact error/warning message]
- **Root Cause**: [File path:line number + explanation]
- **Suggested Fix**: [Concrete fix with code snippet]
- **Affected Files**: [List of files to modify]

### Issue #2: ...
```

---

## P2 Orchestrator Instructions

### Phase 2: Fix Implementation

**Objective**: Implement ALL fixes from `outputs/bug-inventory.md`.

**Method**:
1. Read `outputs/bug-inventory.md`
2. Sort issues by severity (Critical first)
3. For each issue, implement the suggested fix
4. Run `bun run lint:fix --filter @beep/todox` after each batch of fixes
5. Run `bun run check --filter @beep/todox` to verify no type regressions
6. Update `outputs/bug-inventory.md` with fix status (Fixed / Deferred / Won't Fix)

**Rules**:
- Only modify files in `apps/todox/src/components/editor/` and its consumers
- Follow all Effect patterns from `.claude/rules/effect-patterns.md`
- Do NOT add new features — only fix broken behavior
- If a fix requires architectural changes, document in REFLECTION_LOG and defer

---

## P3 Orchestrator Instructions

### Phase 3: Validation

**Objective**: Re-run the entire P1 test matrix to verify all fixes and discover regressions.

**Method**:
1. Use browser automation to re-test ALL items from the P1 test matrix
2. For each previously-found issue, verify it's resolved
3. Record any NEW issues discovered during re-testing
4. Update `outputs/bug-inventory.md` with validation results

**Loop Condition**: If new issues are found, return to P2. Continue P2→P3 loop until:
- Zero Critical issues remain
- Zero Warning-level console noise from editor code
- All toolbar features work as expected

---

## Complexity Assessment

**Score: 44 → High**

| Factor | Value | Weight | Score |
|--------|-------|--------|-------|
| Phase Count | 3 (+ loop) | 2 | 6 |
| Agent Diversity | 4 | 3 | 12 |
| Cross-Package | 1 | 4 | 4 |
| External Deps | 1 (Lexical) | 3 | 3 |
| Uncertainty | 3 (unknown bugs) | 5 | 15 |
| Research | 2 | 2 | 4 |
| **Total** | | | **44** |

---

## Prompt Refinement Strategy

After each phase, update prompts based on learnings:

| Phase | Expected Refinements |
|-------|---------------------|
| P1 | Refine test matrix based on actual editor capabilities, update AGENT_PROMPTS with discovered diagnostic patterns |
| P2 | Add fix patterns to AGENT_PROMPTS (common fix types, verification steps) |
| P3 | Update test matrix with regression-prone areas, refine browser automation sequences |

Document all refinements in `REFLECTION_LOG.md` under "Prompt Refinements".

---

## Quality Commands

```bash
bun run lint:fix --filter @beep/todox
bun run lint --filter @beep/todox
bun run check --filter @beep/todox
bun run build --filter @beep/todox
```

---

## Related Specs

- `specs/completed/lexical-canonical-editor/` — The spec that created this editor (Phase 3 outputs)
- `specs/completed/lexical-canonical-editor/REFLECTION_LOG.md` — Learnings from the migration

---

## Entry Points

- **Fresh start**: Use `handoffs/P1_ORCHESTRATOR_PROMPT.md` to begin Phase 1
- **After P1**: Use `handoffs/P2_ORCHESTRATOR_PROMPT.md` to begin fixes
- **After P2**: Use `handoffs/P3_ORCHESTRATOR_PROMPT.md` to validate
