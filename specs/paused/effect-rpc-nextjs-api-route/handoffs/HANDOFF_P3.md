# Handoff P3: Implementation

## Objective

Implement the approved P2 plan in `apps/web` for both basic and streaming RPC routes.

## Inputs

- [README.md](../README.md)
- [outputs/p1-design.md](../outputs/p1-design.md)
- [outputs/p2-implementation-plan.md](../outputs/p2-implementation-plan.md)

## Required Work

1. Implement routes:
   - `/api/rpc/basic` with `HttpEffect.toWebHandler`
   - `/api/rpc/stream` with `HttpEffect.toWebHandlerWith`
2. Implement new RPC demo modules in `apps/web/src/lib/effect/rpc-demo`.
3. Implement tests:
   - `apps/web/test/effect/rpc-basic-route.test.ts`
   - `apps/web/test/effect/rpc-stream-route.test.ts`
4. Ensure stream route proves injected service behavior via response header.
5. Record deviations from plan and rationale.

## Deliverable

- [outputs/p3-implementation-notes.md](../outputs/p3-implementation-notes.md)

## Completion Checklist

- [ ] All planned files are implemented.
- [ ] Both handler APIs are demonstrated.
- [ ] Tests compile and run at least once.
- [ ] Deviations are documented clearly.

## Exit Gate

P3 is complete when all planned code exists and is ready for formal verification.
