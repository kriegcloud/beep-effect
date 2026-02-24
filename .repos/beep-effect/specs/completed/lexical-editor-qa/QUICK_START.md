# lexical-editor-qa Quick Start

> Start here to kick off the QA cycle.

---

## 1) Read the spec

`specs/pending/lexical-editor-qa/README.md` — Contains full test matrix, architecture context, and phase instructions.

## 2) Start Phase 1a: Bug Inventory (Categories 1-5)

Phase 1 is pre-split into P1a and P1b to manage context budget. Start with P1a:

`specs/pending/lexical-editor-qa/handoffs/P1_ORCHESTRATOR_PROMPT.md`

## 3) Phase 1a Produces

- `outputs/bug-inventory-partial.md` — Bugs found in categories 1-5 (console, formatting, blocks, links, images)
- `handoffs/HANDOFF_P1B.md` + `handoffs/P1B_ORCHESTRATOR_PROMPT.md` — For continuing with categories 6-10

## 3b) Phase 1b Produces

- `outputs/bug-inventory.md` — Complete inventory merging P1a + P1b findings
- `handoffs/HANDOFF_P2.md` + `handoffs/P2_ORCHESTRATOR_PROMPT.md` — For the fix phase

## 4) Phase 2→3 Loop

After P1, alternate between fixing (P2) and validating (P3) until no bugs remain.

## 5) Completion

When all tests pass and zero console noise remains:
- Update `REFLECTION_LOG.md`
- Move spec to `specs/completed/`

---

## Prerequisite

- Dev server must be running: `bun run dev`
- Chrome must be open with claude-in-chrome extension active
- `next-devtools` MCP plugin must be configured (provides superior runtime error diagnostics)
- Navigate to `http://localhost:3000` to test the `/` route
