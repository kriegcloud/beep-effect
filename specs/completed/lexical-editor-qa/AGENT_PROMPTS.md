# lexical-editor-qa: Agent Prompts

> Pre-configured prompts for each phase.

---

## Phase 1: Bug Inventory

### Next.js Runtime Diagnostics (PRIORITY — use BEFORE browser console)

The `next-devtools` MCP plugin provides superior error reporting compared to browser console reading:

1. **Initialize**: `mcp__next-devtools__init` — Call first to establish devtools context
2. **Discover**: `mcp__next-devtools__nextjs_index` — Lists the running Next.js server and ALL available MCP tools with schemas
3. **Diagnose**: `mcp__next-devtools__nextjs_call` — Execute specific Next.js MCP tools for:
   - Runtime error details (more detailed than console.error)
   - Component tree inspection
   - Route diagnostics
   - Build/compilation errors
   - Server-side error details that don't appear in browser console
4. **Browser Automation**: `mcp__next-devtools__browser_eval` — Playwright-based alternative to claude-in-chrome with actions: navigate, click, type, fill_form, evaluate, screenshot, console_messages

**IMPORTANT**: Always use `nextjs_index` then `nextjs_call` for error investigation FIRST. Only use browser console reading as a fallback. The Next.js MCP endpoint captures errors that never reach the browser console (server-side errors, build failures, hydration details).

### Browser Testing (Orchestrator with claude-in-chrome)

The orchestrator handles browser testing directly using `claude-in-chrome` tools:
- `mcp__claude-in-chrome__navigate` — Navigate to `/` route
- `mcp__claude-in-chrome__read_page` — Read page content
- `mcp__claude-in-chrome__read_console_messages` — Monitor console output
- `mcp__claude-in-chrome__javascript_tool` — Execute JavaScript for testing
- `mcp__claude-in-chrome__form_input` — Type into editor
- `mcp__claude-in-chrome__computer` — Click toolbar buttons
- `mcp__claude-in-chrome__find` — Locate UI elements
- `mcp__claude-in-chrome__gif_creator` — Record multi-step interactions

### Source Code Investigation (Explore Agent)

```
Investigate the source code at `apps/todox/src/components/editor/` to find the
root cause of the following console error/warning:

[paste exact error message]

Identify:
1. The exact file and line number causing the issue
2. Why it occurs (missing dependency, SSR incompatibility, wrong import, etc.)
3. A concrete suggested fix with code snippet

Key files to check:
- plugins/index.tsx (EmailComposePlugins component)
- plugins/MarkdownTransformers/index.ts (transformer configuration)
- nodes/email-compose-nodes.ts (registered nodes)
- lexical-editor.tsx (main component)
```

---

## Phase 2: Fix Implementation

### General-Purpose Agent (Code Writer)

```
Read `specs/pending/lexical-editor-qa/outputs/bug-inventory.md`.

Implement ALL fixes listed in the bug inventory, sorted by severity (Critical first).

## Fix Ordering (from P1a root cause analysis)

Issues #1, #2, and #6 share the same root cause: the toolbar/picker was ported from the
full Lexical playground without filtering for email compose context. Fix these TOGETHER:
- Create a context-aware filtering mechanism based on EMAIL_COMPOSE_NODES
- Remove/hide toolbar block type items for unregistered nodes (Code Block)
- Remove/hide Insert dropdown items for unregistered nodes (11 of 14 items)
- Remove/hide ComponentPickerPlugin (slash command) items for unregistered nodes

Issue #3 (Ctrl+K conflict): Add `event.stopPropagation()` in ShortcutsPlugin/index.tsx
for the `isInsertLink(event)` handler to prevent global command palette from firing.

Issues #4/#5 (floating link editor): Investigate `isLink` state management in
FloatingLinkEditorPlugin — the CLICK_COMMAND handler (lines 386-401) only handles
Ctrl/Meta+click for opening links. It may need to also detect link nodes and update
`isLink` state so the floating editor renders.

For each fix:
1. Read the affected file(s) listed in the issue
2. Apply the suggested fix (or a better alternative if the suggestion is flawed)
3. Verify the fix doesn't introduce new issues

Rules:
- Only modify files in `apps/todox/src/components/editor/` and its consumers
- Follow Effect patterns from `.claude/rules/effect-patterns.md`
- Do NOT add features — only fix broken behavior
- Prefer removing/hiding broken UI over adding unneeded nodes

After all fixes:
- Run `bun run lint:fix --filter @beep/todox`
- Run `bun run check --filter @beep/todox`
- Update `outputs/bug-inventory.md` adding "Status: Fixed" to each resolved issue
```

---

## Phase 3: Validation

### Browser Re-Testing (Orchestrator with claude-in-chrome)

Same as Phase 1 browser testing, but additionally:
- For each previously-found issue, explicitly verify it's resolved
- Record any NEW issues discovered during re-testing
- Update `outputs/bug-inventory.md` with validation results

```
Re-run the full test matrix from Phase 1 on the `/` route.

For each issue in `outputs/bug-inventory.md` marked "Status: Fixed":
- Reproduce the original bug steps
- Verify it no longer occurs
- Mark as "Status: Verified" or "Status: Regression"

Record any NEW issues found during re-testing.
Update the bug inventory with a "Validation Pass" section.
```
