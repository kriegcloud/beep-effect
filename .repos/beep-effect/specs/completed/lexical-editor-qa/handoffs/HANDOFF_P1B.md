# lexical-editor-qa Handoff: Phase 1b

> Context + constraints to continue Phase 1 (Bug Inventory — categories 6-10).

---

## Context for Phase 1b

### Working Context

- **Current task**: Continue bug inventory — test categories 6-10
- **Scope**: Special features, editor modes, keyboard shortcuts, markdown serialization, edge cases
- **Method**: `claude-in-chrome` browser testing + source code investigation (PRIMARY). `next-devtools` only for SSR/hydration errors (not needed for client-side editor bugs).
- **Input**: `outputs/bug-inventory-partial.md` (findings from P1a)
- **Output**: `outputs/bug-inventory.md` (complete inventory merging P1a + P1b findings)
- **Success criteria**:
  - [ ] Categories 6-10 tested and documented
  - [ ] P1a findings merged into complete inventory
  - [ ] Root causes identified with exact file:line references
  - [ ] Suggested fixes provided for each issue
- **Constraints**:
  - Do NOT fix bugs — only document them
  - Merge P1a partial inventory into final document

### Episodic Context

- P1a completed: Categories 1-5 tested (console baseline, formatting, blocks, links, images)
- Findings from P1a: See `outputs/bug-inventory-partial.md` — **7 issues found (2 Critical, 4 Warning, 1 Minor)**
- Known diagnostic tools: `next-devtools` (nextjs_index → nextjs_call) for error details
- **Key P1a findings to be aware of:**
  - Issue #1 (CRITICAL): CodeNode not registered — Code Block in toolbar/shortcuts crashes
  - Issue #2 (CRITICAL): 11 of 14 Insert dropdown items reference unregistered nodes — will crash
  - Issue #3: Ctrl+K conflicts with global command palette (stopPropagation missing)
  - Issues #4-5: Floating link editor doesn't appear when clicking existing links
  - Issue #6: ComponentPickerPlugin (slash commands) suspected to have same unregistered node problem
  - Issue #7: Image insertion untested due to auth session instability
- **Session instability warning**: Auth session times out during multi-step dialog interactions. Use code-level analysis as fallback (JavaScript command dispatch via `require('lexical')` does NOT work in browser context).
- **NEVER use `document.execCommand` on Lexical editors** — breaks internal state, requires page reload

### P1a Methodology (what worked — reuse these patterns)

- **Cross-reference before browser testing**: Audit features against `EMAIL_COMPOSE_NODES` array before clicking UI. In P1a this found 11 broken Insert dropdown items in seconds vs hours of UI clicking.
- **Reload page between test categories**: Use `window.location.reload()` to reset editor state. NEVER use `document.execCommand`.
- **Background agents for code investigation**: Spawn `Explore` or `codebase-explorer` agents for deep root cause analysis while continuing browser testing in main context.
- **Code analysis when UI is blocked**: If auth session crashes during dialog interactions, pivot to reading source code rather than fighting timeouts.
- **Console monitoring**: Clear and re-read console between categories for clean signal.

### Semantic Context

- **Editor location**: `apps/todox/src/components/editor/`
- **Integration route**: `/` (root route with email compose)
- **Node set**: `EMAIL_COMPOSE_NODES` — 10 nodes
- **Transformer set**: `EMAIL_COMPOSE_TRANSFORMERS` — filtered to exclude Table, Code, Equation, Tweet
- **Dev server**: `bun run dev` (localhost:3000)
- **Diagnostic tools**: `next-devtools` MCP plugin provides `nextjs_index`, `nextjs_call`, `browser_eval`

### Procedural Context (links only)

- Full spec: `specs/pending/lexical-editor-qa/README.md`
- Entry prompt: `handoffs/P1B_ORCHESTRATOR_PROMPT.md`
- P1a findings: `outputs/bug-inventory-partial.md`
