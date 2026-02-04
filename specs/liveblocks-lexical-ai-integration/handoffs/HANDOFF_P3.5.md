# Phase 3.5 Handoff: Browser Testing & Runtime Error Fixing

**Date**: 2026-02-03
**From**: P3 (AI Streaming Verification)
**To**: P3.5 (Browser Testing & Runtime Error Fixing)
**Status**: Pending

---

## Objective

Fix the critical Lexical version mismatch runtime error blocking browser testing, then validate the end-to-end collaborative AI features in the browser.

---

## Phase 3 Completion Summary

### What Was Done

| Task | Status | Notes |
|------|--------|-------|
| OpenAI environment configuration | Verified | `OPENAI_API_KEY` already in root `.env` |
| Error handling in ai.ts | Verified | 5 error types + fallback already implemented |
| AiActivityOverlay integration | Fixed | Now renders via portal in CollaborativeFloatingAiPanel |
| Conflict guard verification | Verified | `canProceed` check already existed in handlePromptSelect |
| Typecheck | Passed | 101/101 tasks |
| Lint | Passed | Modified files clean |

### Key Findings

1. **Error handling was already comprehensive**: The `ai.ts` server action has 5 error types (API_KEY_INVALID, RATE_LIMIT_EXCEEDED, MODEL_UNAVAILABLE, NETWORK_ERROR, UNKNOWN) with proper fallback.

2. **AiActivityOverlay fix**: Added portal rendering so collaborators see AI activity even when their own panel is closed.

3. **Conflict guard existed**: The `canProceed` check in `handlePromptSelect` blocks operations when there's an active conflict.

---

## Critical Pre-Testing Fix Required

### Lexical Version Mismatch Error

**Error Type**: Runtime Error

**Error Message**:
```
HeadingNode (type heading) does not subclass LexicalNode from the lexical package
used by this editor (version <unknown>). All lexical and @lexical/* packages used
by an editor must have identical versions.
```

**Stack Trace**:
```
at App (src/app/lexical/App.tsx:127:7)
at PlaygroundApp (src/app/lexical/App.tsx:157:9)
at LexicalPage (src/app/lexical/page.tsx:21:7)
```

**Code Location** (`apps/todox/src/app/lexical/App.tsx:125-127`):
```typescript
return (
  <LexicalCollaboration>
    <LexicalExtensionComposer extension={app} contentEditable={null}>
```

### Root Cause Analysis

This error indicates multiple versions of the `lexical` package are being loaded. The Lexical internal mechanism checks that all node classes extend from the same `LexicalNode` base class, but when multiple versions are bundled, the prototype chain breaks.

**Current Package Versions** (from root `package.json` catalog):
- `lexical`: `^0.40.0`
- `@lexical/*`: `^0.40.0`
- `@liveblocks/react-lexical`: `^3.13.3`
- `@liveblocks/node-lexical`: `^3.13.3`

**Common Causes**:

1. **Liveblocks Lexical packages bundle their own lexical**
   - `@liveblocks/react-lexical` and `@liveblocks/node-lexical` may have peer dependency on a different lexical version
   - Check: `bun pm ls @liveblocks/react-lexical` to see transitive deps

2. **ESM/CJS dual loading**
   - Next.js turbopack may load both ESM and CJS versions
   - Check: Look for `.cjs` vs `.mjs` file loading in browser devtools Network tab

3. **Workspace package version drift**
   - A workspace package may have its own lexical dependency
   - Check: `grep -r '"lexical"' packages/*/package.json`

4. **Bundler deduplication failure**
   - Turbopack may not properly deduplicate packages
   - Fix: Try building with `next build` (webpack) to see if error persists

### Recommended Investigation Steps

```bash
# 1. Check for duplicate lexical installations
bun pm why lexical

# 2. Check Liveblocks peer dependencies
bun pm why @liveblocks/react-lexical

# 3. Search for lexical in workspace packages
grep -r '"lexical"' packages/*/package.json

# 4. Check bun.lock for multiple lexical versions
grep -A 5 '"lexical"' bun.lock | head -30

# 5. Clear cache and reinstall
rm -rf node_modules .next
bun install

# 6. Try non-turbopack build to isolate bundler issue
cd apps/todox && bun run dotenvx -- next build
```

### Potential Fixes

1. **Pin exact versions**: Change `^0.40.0` to `0.40.0` in catalog
2. **Add resolutions/overrides**: Force all packages to use same version
3. **Check Liveblocks compatibility**: Ensure `@liveblocks/react-lexical@3.13.3` supports `lexical@0.40.0`
4. **Disable turbopack temporarily**: Test with `next dev` (no `--turbopack`) to isolate bundler

---

## Testing Infrastructure

### MCP Tools Available

**1. claude-in-chrome** (Browser Automation):
| Tool | Purpose |
|------|---------|
| `mcp__claude-in-chrome__navigate` | Navigate to URL |
| `mcp__claude-in-chrome__read_page` | Read page content |
| `mcp__claude-in-chrome__read_console_messages` | Read console logs/errors |
| `mcp__claude-in-chrome__javascript_tool` | Execute JS in browser |
| `mcp__claude-in-chrome__form_input` | Fill forms |
| `mcp__claude-in-chrome__computer` | Click, type interactions |

**2. next-devtools** (Next.js Development):
- Runtime error detection
- Console error monitoring
- Build error information

### Browser Testing URL

```
http://localhost:3000/lexical
```

**Note**: Must start dev server first: `cd apps/todox && bun run dev`

---

## Test Plan

### Pre-Test: Fix Lexical Version Error

- [ ] Investigate version mismatch using commands above
- [ ] Apply fix (version pinning, resolutions, or bundler config)
- [ ] Verify editor loads without runtime error
- [ ] Verify `bun run check --filter @beep/todox` still passes

### Test 1: Basic Editor Loading

- [ ] Navigate to `http://localhost:3000/lexical`
- [ ] No console errors on page load
- [ ] Editor renders with content editable area
- [ ] Toolbar displays correctly
- [ ] Can type in editor without errors

### Test 2: AI Panel Interaction

- [ ] Select text in editor
- [ ] AI panel opens (via keyboard shortcut or toolbar)
- [ ] Prompt options display correctly
- [ ] Can close AI panel without errors

### Test 3: AI Streaming (Requires OPENAI_API_KEY)

- [ ] Select text and trigger AI operation
- [ ] Loading indicator appears
- [ ] Tokens stream progressively (not all at once)
- [ ] First token latency < 2 seconds
- [ ] Can abort/cancel mid-stream
- [ ] Result can be inserted/replaced

### Test 4: Error Handling

- [ ] Trigger AI with invalid text selection (empty)
- [ ] Verify user-friendly error message displays
- [ ] No console errors or crashes
- [ ] Panel returns to idle state

### Test 5: Presence Broadcasting (Multi-Tab)

- [ ] Open editor in Tab 1
- [ ] Open same document in Tab 2
- [ ] Tab 1: Select text and trigger AI operation
- [ ] Tab 2: Verify AiActivityOverlay shows collaborator using AI
- [ ] Tab 1: Complete operation
- [ ] Tab 2: Verify overlay disappears

### Test 6: Conflict Detection (Multi-Tab)

- [ ] Tab 1: Select lines 1-5
- [ ] Tab 2: Select lines 3-7 (overlapping)
- [ ] Tab 1: Trigger AI operation
- [ ] Tab 2: Verify conflict warning displays
- [ ] Both tabs can still proceed (warning only)

---

## Environment Requirements

### Required Environment Variables

```bash
# Root .env file
OPENAI_API_KEY=sk-...          # Required for AI streaming
LIVEBLOCKS_SECRET_KEY=sk_...   # Required for collaboration
```

### Dev Server

```bash
cd apps/todox && bun run dev
```

### User Authentication

Tests require a signed-in user session:
1. Navigate to login page
2. Sign in with test credentials
3. Session cookie (`better-auth.session_token`) must be present

---

## Key Files

### Lexical App (Error Location)

| File | Purpose |
|------|---------|
| `apps/todox/src/app/lexical/page.tsx` | Page entry point |
| `apps/todox/src/app/lexical/App.tsx` | Main app with LexicalExtensionComposer |
| `apps/todox/src/app/lexical/nodes/PlaygroundNodes.ts` | Node registrations |

### AI Integration

| File | Purpose |
|------|---------|
| `apps/todox/src/actions/ai.ts` | Server action with error handling |
| `apps/todox/src/app/lexical/plugins/AiAssistantPlugin/index.tsx` | Main plugin |
| `apps/todox/src/app/lexical/plugins/AiAssistantPlugin/hooks/useAiStreaming.ts` | Streaming hook |
| `apps/todox/src/app/lexical/plugins/AiAssistantPlugin/hooks/useCollaborativeAi.ts` | Conflict detection |
| `apps/todox/src/app/lexical/plugins/AiAssistantPlugin/components/CollaborativeFloatingAiPanel.tsx` | UI with AiActivityOverlay portal |
| `apps/todox/src/app/lexical/plugins/AiAssistantPlugin/components/AiActivityOverlay.tsx` | Collaborator activity indicator |

### Package Versions

| File | Purpose |
|------|---------|
| `package.json` | Catalog definitions (root) |
| `apps/todox/package.json` | App dependencies |
| `bun.lock` | Locked versions |

---

## Success Criteria

- [ ] Lexical version mismatch error resolved
- [ ] Editor loads without console errors
- [ ] AI panel opens and displays prompts
- [ ] AI streaming works (tokens appear progressively)
- [ ] First token latency < 2 seconds
- [ ] AiActivityOverlay shows collaborator AI activity in other tabs
- [ ] Conflict warning displays for overlapping selections
- [ ] Error states display user-friendly messages (not crashes)
- [ ] `bun run check --filter @beep/todox` passes
- [ ] `bun run lint --filter @beep/todox` passes

---

## Known Risks

### Risk 1: Lexical/Liveblocks Version Incompatibility

**Risk**: `@liveblocks/react-lexical@3.13.3` may require a different lexical version than `0.40.0`.
**Mitigation**: Check Liveblocks changelog/docs for compatible lexical versions.
**Impact**: High - blocks all browser testing.

### Risk 2: Turbopack-Specific Issue

**Risk**: Error may only occur with turbopack bundler.
**Mitigation**: Test with `next dev` (webpack) to isolate.
**Impact**: Medium - may need to disable turbopack for dev.

### Risk 3: OpenAI API Key Not Configured

**Risk**: AI streaming tests will fail without valid API key.
**Mitigation**: Verify `OPENAI_API_KEY` in root `.env` before AI tests.
**Impact**: Medium - AI tests blocked, other tests proceed.

### Risk 4: Session Cookie Expiry

**Risk**: Tests may fail if session expires during testing.
**Mitigation**: Re-authenticate if 401 errors appear in console.
**Impact**: Low - quick fix.

---

## Agent Recommendations

| Agent | Task | Rationale |
|-------|------|-----------|
| `codebase-researcher` | Find lexical version resolution patterns | Understand workspace deduplication |
| `manual-tester` | Execute browser test plan | Human-in-the-loop for visual verification |
| `mcp__claude-in-chrome` | Automated browser testing | Read console errors, navigate pages |

### Orchestrator Direct Actions

The orchestrator MAY directly:
- Run investigation commands for version mismatch
- Start dev server
- Use MCP tools for browser automation
- Read console errors via `mcp__claude-in-chrome__read_console_messages`
- Document test results

---

## Files to Create/Update Post-P3.5

After Phase 3.5 completion:

- [ ] Update `REFLECTION_LOG.md` with version mismatch resolution details
- [ ] Document Lexical/Liveblocks version compatibility in `outputs/`
- [ ] If version fix required package.json changes, verify CI passes
- [ ] Update `HANDOFF_P4.md` checklist with browser test results

---

## Decision Log

| Decision Point | Choice | Rationale |
|----------------|--------|-----------|
| Phase numbering | P3.5 (not P4) | Intermediate phase for blocking issue before Effect AI migration |
| Testing approach | MCP + manual | Browser testing requires visual verification |
| Version fix priority | First task | Blocks all other testing |
| Turbopack investigation | Secondary | Only if version pinning doesn't resolve |

---

## Next Phase Preview

**Phase 4: Effect AI Migration** will:
- Replace `@ai-sdk/openai` with `@effect/ai-openai`
- Server action uses `Effect.gen`, not `async/await`
- Error handling uses `S.TaggedError` + `Effect.catchTag`
- LLM Layer follows pattern from `@beep/knowledge-server`

**Prerequisite from P3.5**: Browser must load without errors to manually verify Effect AI migration works.

---

## Handoff Checklist

Before starting Phase 3.5:

- [x] P3 complete: Error handling verified, AiActivityOverlay fixed
- [x] Typecheck passes
- [x] Lint passes
- [ ] Dev server can be started (`cd apps/todox && bun run dev`)
- [ ] OpenAI API key configured in root `.env`
- [ ] Test user account available for authentication
