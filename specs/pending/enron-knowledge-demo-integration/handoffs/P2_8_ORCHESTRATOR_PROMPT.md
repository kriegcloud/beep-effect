You are implementing Phase 2.8 for `enron-knowledge-demo-integration`.

**Target runtime**: Claude Code (interactive session with browser automation)

Read first:
- `specs/pending/enron-knowledge-demo-integration/handoffs/HANDOFF_P2_8.md`
- `specs/pending/enron-knowledge-demo-integration/handoffs/HANDOFF_P2.md` (Phase 2 success criteria)
- `specs/pending/enron-knowledge-demo-integration/MASTER_ORCHESTRATION.md`
- `specs/pending/enron-knowledge-demo-integration/outputs/beep-server-grafana-logs.json` (error evidence)

## Mission

Fix the knowledge-demo until scenario ingest works end-to-end. The demo must:
1. Accept "Ingest Scenario" click
2. Progress through batch lifecycle states visibly in the UI
3. Complete extraction with entities and relations
4. Display extracted data via GraphRAG query

## Known Root Cause — START HERE

**The OpenAI API key is invalid.** The `.env` file's `AI_OPENAI_API_KEY` points to an archived OpenAI project. Every LLM call returns 401 Unauthorized:

```
POST https://api.openai.com/v1/responses → 401
"The project you are requesting has been archived and is no longer accessible"
```

### Immediate Actions

1. **Check which LLM provider the knowledge pipeline requires**:
   - Search `packages/knowledge/server/src/` for OpenAI/Anthropic provider usage
   - Check `packages/runtime/server/src/` for LLM layer composition
   - Determine if Anthropic can be used as alternative

2. **Ask the user** if they need to update the API key:
   - "The OpenAI API key in your `.env` points to an archived project. Would you like to:
     a) Provide a new OpenAI API key
     b) Switch the knowledge pipeline to use Anthropic (if `AI_ANTHROPIC_API_KEY` is valid)
     c) Something else?"

3. **After fixing the API key, restart servers** (`bun run purge && bun run dev`)

4. **Test ingest in browser** — navigate to `localhost:3000/knowledge-demo`, sign in, select scenario-1, click "Ingest Scenario"

## Debugging Toolkit (Use in Order)

### 1. Grafana Dashboard (`http://localhost:4000`)
- Navigate in Claude-in-Chrome to `http://localhost:4000`
- Check Explore → Logs for `service_name: "beep-server"`
- Filter for errors: `detected_level: "ERROR" OR detected_level: "WARN"`
- Check Explore → Traces for extraction pipeline spans

### 2. Claude in Chrome (Browser Automation)
- `mcp__claude-in-chrome__tabs_context_mcp` — check current browser tabs
- `mcp__claude-in-chrome__navigate` — go to `http://localhost:3000/knowledge-demo`
- `mcp__claude-in-chrome__read_console_messages` — check for JS errors
- `mcp__claude-in-chrome__read_network_requests` — inspect WebSocket RPC responses
- `mcp__claude-in-chrome__browser_take_screenshot` — capture UI state as evidence

### 3. Server Terminal Logs
- Watch dev server output for Effect structured logs
- Look for `ClassificationError`, `ExtractionError`, `BatchFailed` events
- Check for unhandled defects (stack traces)

## Fix Loop Protocol

```
repeat {
  diagnose:
    - Check Grafana for error spans/logs
    - Check browser console for JS errors
    - Check server terminal for Effect errors

  research:
    - Read relevant source files
    - Understand the error chain
    - Identify the minimal fix

  implement:
    - Apply the fix
    - Ask user to restart dev servers if needed

  verify:
    - bun run check --filter @beep/knowledge-server
    - bun run test --filter @beep/knowledge-server
    - Browser: ingest scenario-1, watch lifecycle progress
    - Browser: confirm entities/relations appear after completion
    - Browser: confirm no console errors

  evidence:
    - Screenshot of successful ingest
    - Screenshot of entity/relation display
    - Grafana trace showing completed extraction

} until ALL Phase 2 success criteria are met
```

## Hard Constraints

- Do NOT reintroduce mock data paths
- Do NOT flatten typed errors
- Do NOT skip browser verification
- Do NOT create new phase output documents beyond what's specified
- Preserve existing observability instrumentation from Phase 2.7 (if present)
- Use `bun run purge` to clear artifacts if cache issues suspected
- Tell user to restart dev servers (do NOT auto-launch long-running processes)

## Success Criteria (ALL must be met)

From Phase 2 contract (`HANDOFF_P2.md`):
- [ ] Default flow no longer calls mock `extractFromText` / `queryGraphRAG` actions
- [ ] Knowledge RPC client points to `/v1/knowledge/rpc` with NDJSON
- [ ] Scenario ingest lifecycle visible (`pending/extracting/resolving/completed`)
- [ ] Duplicate ingest blocked client-side
- [ ] Route gated behind `ENABLE_ENRON_KNOWLEDGE_DEMO`

From Phase 2.8:
- [ ] Scenario-1 ingest completes successfully
- [ ] Extracted entities visible in UI
- [ ] GraphRAG query returns results
- [ ] No unhandled browser console errors
- [ ] No unhandled server errors
- [ ] `bun run check --filter @beep/knowledge-server` passes
- [ ] `bun run test --filter @beep/knowledge-server` passes

## Required Outputs

- `specs/pending/enron-knowledge-demo-integration/outputs/phase-2.8-root-cause-confirmed.md`
- `specs/pending/enron-knowledge-demo-integration/outputs/phase-2.8-validation.md`

Then update:
- `specs/pending/enron-knowledge-demo-integration/REFLECTION_LOG.md` (Phase 2.8 entry)
