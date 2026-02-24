# P1b Orchestrator Prompt — Lexical Editor QA Bug Inventory (Categories 6-10)

You are continuing **Phase 1** of the `lexical-editor-qa` spec. P1a completed categories 1-5. Your job is to test categories 6-10 and produce the complete bug inventory.

## Context

**Read P1a findings first**: `specs/pending/lexical-editor-qa/outputs/bug-inventory-partial.md`
**Read the full spec**: `specs/pending/lexical-editor-qa/README.md`

## Your Mission

1. **Ensure the dev server is running** (`bun run dev`) — confirm with user first
2. **Initialize browser tools** — Use `claude-in-chrome` for browser testing and console monitoring. Optionally initialize `next-devtools` (`mcp__next-devtools__init` → `mcp__next-devtools__nextjs_index`) for SSR/hydration errors, but P1a showed it was not needed for client-side editor bugs.
3. **Use browser automation** to navigate to `http://localhost:3000`
4. **Test categories 6-10** from the test matrix below
5. **Monitor for errors** using `mcp__claude-in-chrome__read_console_messages` (PRIMARY) and `mcp__next-devtools__nextjs_call` (for SSR errors only)
6. **For each bug found**, investigate source code for exact file:line
7. **Merge P1a findings** and write the complete inventory to `outputs/bug-inventory.md`

## Test Matrix (Categories 6-10 Only)

### 6. Special Features
- Emoji picker (`:` trigger)
- Component picker (`/` slash command)
- Mention picker (`@` trigger)
- Horizontal rule insertion
- Markdown shortcuts (`# ` for heading, `- ` for list, etc.)

**P1a note**: Issue #6 from P1a suspects ComponentPickerPlugin has the same unregistered-node problem as Issue #2. Confirm via **code audit** of `ComponentPickerPlugin/index.tsx` — cross-reference offered slash command options against `EMAIL_COMPOSE_NODES`. This is faster and more reliable than clicking each slash command individually.

### 7. Editor Modes
- Fullscreen toggle (expand/collapse, content preservation, escape key, scroll lock)

### 8. Keyboard Shortcuts
- Undo/Redo, Tab focus

### 9. Markdown Serialization
- Verify onChange fires, round-trip fidelity

### 10. Edge Cases
- Empty editor, paste text/HTML, rapid formatting, select all + delete

**P1a warning**: NEVER use `document.execCommand('selectAll')` or `document.execCommand('delete')` to clear editor content — this breaks Lexical's internal state and requires page reload. Instead, reload the page (`window.location.reload()`) between tests, or use Lexical's API: `editor.update(() => { $getRoot().clear(); })`.

## Output

Merge P1a findings from `outputs/bug-inventory-partial.md` with P1b findings into:
`specs/pending/lexical-editor-qa/outputs/bug-inventory.md`

Use the same format as P1a (severity, reproduction, root cause, suggested fix).

## Delegation Strategy

- Use `mcp__next-devtools__nextjs_call` for runtime error details (PRIORITY)
- Use `mcp__next-devtools__nextjs_index` at session start to discover available diagnostic tools
- Use `codebase-explorer` or `Explore` agents to investigate source code for root causes
- Use `claude-in-chrome` tools for interactive browser testing
- Do NOT attempt fixes — only document

## Context Budget Tracking

| Metric | Budget | Action if Exceeded |
|--------|--------|--------------------|
| Direct tool calls | Max 20 per test category | Summarize findings, move to next category |
| Large file reads | Max 5 files at once | Delegate deeper investigation to Explore agent |
| Sub-agent delegations | Max 10 total | Consolidate remaining categories |

## Testing Resilience (from P1a learnings)

- **Multi-step dialogs**: Auth session times out during dialog interactions. For features requiring dialogs (image insert, etc.), prefer code-level analysis of the insertion path over fighting UI timeouts.
- **Code-first for systemic issues**: Cross-reference UI options against `EMAIL_COMPOSE_NODES` before browser-testing. P1a found 11 broken items this way in seconds.
- **Reload between categories**: Use `window.location.reload()` to reset editor state cleanly.
- **NEVER use `document.execCommand`** on Lexical editors — breaks internal state.

## Completion Checklist

When done:
- [ ] `outputs/bug-inventory.md` written (complete, merging P1a + P1b)
- [ ] `REFLECTION_LOG.md` updated with P1 learnings
- [ ] `handoffs/HANDOFF_P2.md` created with context for fix phase
- [ ] `handoffs/P2_ORCHESTRATOR_PROMPT.md` created with fix instructions
