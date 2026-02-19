# P1a Orchestrator Prompt — Lexical Editor QA Bug Inventory (Categories 1-5)

You are orchestrating **Phase 1a** of the `lexical-editor-qa` spec. Your job is to test categories 1-5 and produce a partial bug inventory. Categories 6-10 are handled in P1b.

## Context

The Lexical editor was recently migrated from `apps/todox/src/app/lexical/` to `apps/todox/src/components/editor/` and integrated into the email compose area on the `/` route (replacing a tiptap editor). Multiple runtime issues were found and patched, but a thorough QA pass hasn't been done.

**Read the full spec first**: `specs/pending/lexical-editor-qa/README.md`

## Your Mission

1. **Ensure the dev server is running** (`bun run dev`) — confirm with user first
2. **Initialize `next-devtools`** — Call `mcp__next-devtools__init` then `mcp__next-devtools__nextjs_index` to discover the running Next.js server and available diagnostic tools. Use `mcp__next-devtools__nextjs_call` throughout testing to get detailed runtime errors (PRIORITIZE this over browser console reading).
3. **Use `claude-in-chrome` browser automation** to navigate to `http://localhost:3000`
4. **Systematically test categories 1-5** from the test matrix below
5. **Monitor for errors** using `mcp__next-devtools__nextjs_call` (PRIORITY) and `mcp__claude-in-chrome__read_console_messages` (fallback)
6. **For each bug found**, investigate the source code to identify the exact file:line causing it
7. **Write the partial bug inventory** to `specs/pending/lexical-editor-qa/outputs/bug-inventory-partial.md`

## Test Matrix (Categories 1-5 Only)

You MUST test all of these systematically. Categories 6-10 are deferred to P1b.

### 1. Console Baseline
- Navigate to `/`, open console, record ALL editor-related errors/warnings
- Filter out non-editor noise (React DevTools, Next.js HMR, etc.)

### 2. Text Formatting
- Bold (toolbar + Ctrl+B), Italic (toolbar + Ctrl+I), Underline (toolbar + Ctrl+U)
- Strikethrough, Clear formatting

### 3. Block Types
- Headings (H1/H2/H3), Quote, Bullet list, Ordered list, Checklist

### 4. Links
- Insert link, floating editor, edit/remove link, auto-link detection

### 5. Images
- Toolbar insert, paste from clipboard, drag-and-drop

## Output Format

Write `specs/pending/lexical-editor-qa/outputs/bug-inventory-partial.md` with this structure:

```markdown
# Lexical Editor Bug Inventory

**Date**: YYYY-MM-DD
**Tester**: Claude (automated via claude-in-chrome)
**Route**: `/` (root route, mail compose editor)
**Editor Location**: `apps/todox/src/components/editor/`

## Summary
- Total issues found: N
- Critical (blocks functionality): N
- Warning (console noise): N
- Minor (cosmetic/UX): N

## Console Baseline
[List ALL console messages from editor code on initial page load]

## Issues

### Issue #1: [Short Description]
- **Severity**: Critical / Warning / Minor
- **Category**: Console Error | Broken Feature | SSR | UX
- **Reproduction**:
  1. Step 1
  2. Step 2
- **Observed Behavior**: [What happens]
- **Expected Behavior**: [What should happen]
- **Console Output**: ```[exact message]```
- **Root Cause**: `file/path.tsx:42` — [explanation]
- **Suggested Fix**:
  [code snippet or description]
- **Affected Files**:
  - `apps/todox/src/components/editor/...`

## Feature Test Results

| Feature | Status | Notes |
|---------|--------|-------|
| Bold | Pass/Fail | ... |
| Italic | Pass/Fail | ... |
| ... | ... | ... |
```

## Key Files for Investigation

When you find a bug, these are the most likely files to check:

- `apps/todox/src/components/editor/lexical-editor.tsx` — Main component
- `apps/todox/src/components/editor/plugins/index.tsx` — Plugin composition (EmailComposePlugins)
- `apps/todox/src/components/editor/plugins/MarkdownTransformers/index.ts` — Transformer config
- `apps/todox/src/components/editor/nodes/email-compose-nodes.ts` — Node registry (10 nodes)
- `apps/todox/src/components/editor/plugins/ToolbarPlugin/index.tsx` — Toolbar
- `apps/todox/src/components/editor/plugins/FloatingLinkEditorPlugin/index.tsx` — Link editing
- `apps/todox/src/components/editor/plugins/ImagesPlugin/index.tsx` — Image handling
- `apps/todox/src/components/editor/plugins/ShortcutsPlugin/index.tsx` — Keyboard shortcuts
- `apps/todox/src/components/editor/plugins/ActionsPlugin/index.tsx` — Markdown toggle
- `apps/todox/src/components/editor/plugins/ComponentPickerPlugin/index.tsx` — Slash commands
- `apps/todox/src/components/editor/plugins/EmojiPickerPlugin/index.tsx` — Emoji picker
- `apps/todox/src/components/editor/plugins/MentionsPlugin/index.tsx` — Mentions
- `apps/todox/src/features/mail/mail-compose.tsx` — Integration point
- `apps/todox/src/features/mail/mail-details.tsx` — Integration point

## Delegation Strategy

- Use `codebase-explorer` or `Explore` agents to investigate source code for root causes
- Use `mcp__next-devtools__nextjs_call` for runtime error details (PRIORITY over console reading)
- Use `mcp__next-devtools__nextjs_index` at session start to discover available diagnostic tools
- Use `claude-in-chrome` tools directly for browser testing
- Use `Grep` to find related error patterns across the editor codebase
- Do NOT attempt fixes in this phase — only document

## Context Budget Tracking

Monitor your context usage throughout Phase 1a. If you approach limits, write findings immediately.

| Metric | Budget | Token Est. | Action if Exceeded |
|--------|--------|------------|--------------------|
| Direct tool calls | Max 20 per category | ~500/call | Summarize findings, move to next category |
| Large file reads | Max 5 files at once | ~2K/file | Delegate deeper investigation to Explore agent |
| Sub-agent delegations | Max 10 total | ~1K/delegation | Consolidate remaining categories |
| Total findings | Unlimited | ~200/finding | Document all, prioritize by severity |
| **Estimated P1a total** | | **~15K tokens** | |

**Yellow Zone**: If you've completed 3+ categories and context feels heavy, write findings so far to `outputs/bug-inventory-partial.md` and note remaining categories.

**Red Zone**: If context is near capacity, immediately write all findings to `outputs/bug-inventory-partial.md`, update REFLECTION_LOG, and note which of categories 1-5 still need testing in the P1b handoff.

## Completion Checklist

When done:
- [ ] `outputs/bug-inventory-partial.md` written with categories 1-5 findings
- [ ] `REFLECTION_LOG.md` updated with P1a learnings
- [ ] `handoffs/HANDOFF_P1B.md` created with context for P1b (categories 6-10)
- [ ] `handoffs/P1B_ORCHESTRATOR_PROMPT.md` created with P1b instructions

**Note**: P1a does NOT produce the P2 handoff. That is created by P1b after the complete inventory is assembled.
