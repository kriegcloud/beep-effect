# lexical-editor-qa Handoff: Phase 1a

> Context + constraints to start Phase 1a (Bug Inventory — categories 1-5).

---

## Context for Phase 1a

### Working Context

- **Current task**: Begin bug inventory — test categories 1-5
- **Scope**: Console baseline, text formatting, block types, links, images
- **Method**: `next-devtools` (PRIORITY) + `claude-in-chrome` browser testing + source code investigation
- **Output**: `outputs/bug-inventory-partial.md` with P1a findings documented including file:line references
- **Success criteria**:
  - [ ] Categories 1-5 tested and documented
  - [ ] Console errors/warnings catalogued
  - [ ] Root causes identified with exact file:line references
  - [ ] Suggested fixes provided for each issue
- **Constraints**:
  - Do NOT fix bugs in this phase — only document them
  - Only test categories 1-5 (console baseline, text formatting, block types, links, images)
  - Categories 6-10 are deferred to P1b
  - Use browser automation for testing, source code reading for root cause analysis

### Episodic Context

- Phase 0 outcome: Spec scaffolded with README containing full test matrix and architecture context
- Previous work: `lexical-canonical-editor` spec completed (Phase 3) — migrated editor from `app/lexical/` to `components/editor/`
- Known fixed issues (9): SSR crashes, missing contexts, transformer dependency warnings
- Unknown issues: Many features untested in email compose context

### Semantic Context

- **Editor location**: `apps/todox/src/components/editor/`
- **Integration route**: `/` (root route with email compose)
- **Node set**: `EMAIL_COMPOSE_NODES` — 10 nodes (HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode, AutoLinkNode, HorizontalRuleNode, ImageNode, MentionNode, EmojiNode)
- **Transformer set**: `EMAIL_COMPOSE_TRANSFORMERS` — filtered to exclude Table, Code, Equation, Tweet transformers
- **Dev server**: `bun run dev` (localhost:3000)
- **Diagnostic tools**: `next-devtools` MCP plugin provides `nextjs_index` (discover server), `nextjs_call` (runtime diagnostics), and `browser_eval` (Playwright automation). Prioritize over browser console reading for error details.

### Procedural Context (links only)

- Full spec: `specs/pending/lexical-editor-qa/README.md`
- Entry prompt: `handoffs/P1_ORCHESTRATOR_PROMPT.md`
- Previous spec: `specs/completed/lexical-canonical-editor/README.md`

---

## Verification Commands

```bash
bun run lint:fix --filter @beep/todox
bun run check --filter @beep/todox
```
