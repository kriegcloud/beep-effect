# lexical-editor-qa: Master Orchestration

> Audit → Fix → Validate loop for the canonical Lexical editor component.

---

## Overview

This spec runs a systematic QA loop:

```
P1a: Bug Inventory — categories 1-5 (console, formatting, blocks, links, images)
     ↓
P1b: Bug Inventory — categories 6-10 (special features, modes, shortcuts, markdown, edge cases)
     ↓
P2:  Fix Implementation (apply all fixes from inventory)
     ↓
P3:  Validation (re-test everything, update inventory)
     ↓
   ┌─── New bugs found? ───┐
   │ YES → Return to P2     │
   │ NO  → Done              │
   └────────────────────────┘
```

---

## Phase 0: Scaffolding ✅

### Completed Items
- [x] Created spec folder structure
- [x] README.md with full test matrix and architecture context
- [x] REFLECTION_LOG.md template
- [x] P1 handoff and orchestrator prompt

### Outputs
- `specs/pending/lexical-editor-qa/README.md`
- `specs/pending/lexical-editor-qa/REFLECTION_LOG.md`

---

## Phase 1a: Bug Inventory — Categories 1-5

### Objective
Begin the exhaustive bug inventory by testing the first 5 categories: console baseline, text formatting, block types, links, and images.

### Method
1. Use `claude-in-chrome` browser automation to navigate to `http://localhost:3000`
1b. Initialize `next-devtools` (`mcp__next-devtools__init` then `mcp__next-devtools__nextjs_index`) to discover Next.js MCP diagnostic tools
2. Systematically test categories 1-5 from the test matrix
3. Monitor for errors using `mcp__next-devtools__nextjs_call` (PRIORITY) and browser console (fallback)
4. Investigate source code for root causes (exact file:line)
5. Document suggested fixes

### Tasks
- [ ] Console baseline — record all editor-related warnings/errors on page load
- [ ] Text formatting — test bold, italic, underline, strikethrough, clear format
- [ ] Block types — test headings, quote, lists, checklist
- [ ] Links — test insert, edit, remove, auto-link, floating editor
- [ ] Images — test toolbar insert, paste, drag-drop

### Outputs
- `outputs/bug-inventory-partial.md` — P1a findings with severity, reproduction steps, root cause, suggested fix

### Handoffs
- `handoffs/HANDOFF_P1B.md` — Summary of P1a findings for continuation
- `handoffs/P1B_ORCHESTRATOR_PROMPT.md` — Instructions for testing categories 6-10

---

## Phase 1b: Bug Inventory — Categories 6-10

### Objective
Complete the exhaustive bug inventory by testing the remaining 5 categories: special features, editor modes, keyboard shortcuts, markdown serialization, and edge cases. Merge P1a findings into the complete inventory.

### Method
1. Read P1a findings from `outputs/bug-inventory-partial.md`
2. Systematically test categories 6-10 from the test matrix
3. Monitor for errors using `mcp__next-devtools__nextjs_call` (PRIORITY) and browser console (fallback)
4. Investigate source code for root causes (exact file:line)
5. Merge P1a + P1b findings into complete inventory

### Tasks
- [ ] Special features — test emoji picker, slash commands, mentions, HR, markdown shortcuts
- [ ] Editor modes — test fullscreen toggle, content preservation, escape key
- [ ] Keyboard shortcuts — test undo/redo, tab focus
- [ ] Markdown serialization — verify onChange, round-trip
- [ ] Edge cases — empty editor, paste, rapid formatting, select all + delete

### Outputs
- `outputs/bug-inventory.md` — Complete inventory merging P1a + P1b findings

### Handoffs
- `handoffs/HANDOFF_P2.md` — Summary of all findings for fix phase
- `handoffs/P2_ORCHESTRATOR_PROMPT.md` — Instructions for implementing fixes

### Phase 1 Sizing Rationale

P1 has 10 test categories (30+ checks), which exceeds the safe limit for a single phase. Pre-split into P1a/P1b because:
- QA specs have high uncertainty — unknown bug count and unknown investigation depth per category make context usage unpredictable
- Pre-splitting is cheaper than emergency mid-phase checkpointing (avoids context recovery overhead)
- P1a produces a partial inventory (`bug-inventory-partial.md`) that P1b merges into the final document, maintaining a single complete inventory for P2
- Each sub-phase has 5 categories (~15 checks), well within safe context budget
- Mid-point handoff captures episodic context (what was found, what tools worked) that benefits P1b execution
- `next-devtools` MCP provides error details efficiently, but source code investigation for root causes can still consume significant context

---

## Phase 2: Fix Implementation

### Objective
Implement ALL fixes identified in `outputs/bug-inventory.md`.

### Method
1. Read inventory, sort by severity (Critical → Warning → Minor)
2. Implement fixes in batches
3. Run `bun run lint:fix --filter @beep/todox` after each batch
4. Run `bun run check --filter @beep/todox` to verify no regressions
5. Update inventory with fix status

### Tasks
- [ ] Fix all Critical issues
- [ ] Fix all Warning issues
- [ ] Fix all Minor issues
- [ ] Lint passes
- [ ] Type check passes (or pre-existing errors documented)

### Rules
- Only modify files in `apps/todox/src/components/editor/` and its consumers
- Follow all Effect patterns from `.claude/rules/effect-patterns.md`
- Do NOT add features — only fix broken behavior
- If a fix requires architectural changes, document in REFLECTION_LOG and defer

### Outputs
- Updated `outputs/bug-inventory.md` with fix status column

### Handoffs
- `handoffs/HANDOFF_P3.md` — Summary of fixes for validation
- `handoffs/P3_ORCHESTRATOR_PROMPT.md` — Instructions for validation

---

## Phase 3: Validation

### Objective
Re-run the entire P1 test matrix to verify fixes and discover regressions.

### Method
1. Use `claude-in-chrome` to re-test ALL items from the P1 test matrix
2. For each previously-found issue, verify resolution
3. Record any NEW issues
4. Update `outputs/bug-inventory.md` with validation results

### Loop Condition
- New issues found → Return to Phase 2
- No new issues → Done

### Exit Criteria
- Zero Critical issues
- Zero Warning-level console noise from editor code
- All toolbar features functional
- All test matrix items pass

---

## Verification Commands

```bash
bun run lint:fix --filter @beep/todox
bun run lint --filter @beep/todox
bun run check --filter @beep/todox
bun run build --filter @beep/todox
```

---

## Success Criteria

- [ ] Zero console errors/warnings from editor code on `/` route
- [ ] All toolbar buttons functional in email compose context
- [ ] Markdown serialization round-trips correctly
- [ ] Fullscreen toggle works without state loss
- [ ] Image insertion works (paste, drag-drop, toolbar)
- [ ] Link insertion and editing works
- [ ] Keyboard shortcuts work
- [ ] Checklist creation/toggling works
- [ ] Emoji picker works
- [ ] Mention picker works
- [ ] No SSR/hydration errors
- [ ] Reflection log completed

---

## Related Specs

- `specs/completed/lexical-canonical-editor/` — The spec that created this editor (Phase 3 outputs)
- `specs/completed/lexical-canonical-editor/REFLECTION_LOG.md` — Learnings from the migration

---

## Entry Points

- **Fresh start**: Use `handoffs/P1_ORCHESTRATOR_PROMPT.md` to begin Phase 1a
- **After P1a**: Use `handoffs/P1B_ORCHESTRATOR_PROMPT.md` to continue with Phase 1b
- **After P1b**: Use `handoffs/P2_ORCHESTRATOR_PROMPT.md` to begin fixes
- **After P2**: Use `handoffs/P3_ORCHESTRATOR_PROMPT.md` to validate
