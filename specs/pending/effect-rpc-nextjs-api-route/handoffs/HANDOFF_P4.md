# Handoff P4: Verification

## Objective

Run required commands and publish verification evidence for the RPC demo deliverable.

## Inputs

- [README.md](../README.md)
- [outputs/p3-implementation-notes.md](../outputs/p3-implementation-notes.md)

## Required Work

Run and capture results for:
1. `bunx vitest run apps/web/test/effect/rpc-basic-route.test.ts apps/web/test/effect/rpc-stream-route.test.ts`
2. `bun run check`
3. `bun run lint`
4. `bun run test`

If any failure is unrelated and pre-existing:
- document exact error,
- include proof it is pre-existing,
- explain why this spec remains valid or blocked.

## Deliverable

- [outputs/p4-verification.md](../outputs/p4-verification.md)

## Completion Checklist

- [ ] Required commands were executed.
- [ ] Output includes pass/fail with evidence.
- [ ] Residual issues are classified as spec-related or pre-existing.
- [ ] Final readiness statement is explicit.

## Exit Gate

P4 is complete when verification evidence is complete enough for merge readiness evaluation.
