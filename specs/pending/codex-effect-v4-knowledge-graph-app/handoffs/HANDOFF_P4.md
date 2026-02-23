# HANDOFF P4: Chat Route

## Phase Transition

- From: P3 (Toolkit + Chat Foundation)
- To: P4 (Chat Route)
- Date: 2026-02-22

## Working Context

Build `/api/chat` using Effect AI + OpenAI with the shared toolkit/service layer from P3.

Update this handoff with concrete P3 outcomes before coding.

## Objectives

1. Implement chat handler with `LanguageModel.generateText`.
2. Register shared toolkit tools for grounded responses.
3. Return answer payload with tool/citation metadata for UI.
4. Ensure server-side auth gate remains enforced.

## Target File Surfaces

- `apps/web/src/app/api/chat/route.ts`
- `apps/web/src/lib/graph/tools.ts`
- `apps/web/src/lib/effect/runtime.ts`
- `apps/web/src/state/chat.atoms.ts` (if needed for response contract)

## Verification Commands

```bash
bun run check
bun run test
bun run lint
bun run build
```

Add route-level tests for grounded chat behavior and tool trace presence.

## Phase Exit Criteria

- `/api/chat` returns grounded responses using toolkit tools.
- Non-allowlisted sessions are rejected.
- Error handling covers OpenAI/Zep transient failures.
- Response contract supports frontend rendering needs.

## Deliverables Checklist

- [ ] Chat route implemented
- [ ] Grounded tool-calling behavior validated
- [ ] Chat response contract documented/tested
- [ ] `HANDOFF_P5.md` updated with actual outcomes
- [ ] `P5_ORCHESTRATOR_PROMPT.md` updated for next phase
