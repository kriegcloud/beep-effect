# Effect RPC on Next.js API Routes (`toWebHandler` + `toWebHandlerWith`)

## Status
PENDING

## Owner
@elpresidank

## Created
2026-02-25

## Updated
2026-02-25

## Quick Navigation
- [Quick Start](./QUICK_START.md)
- [Agent Prompts](./AGENT_PROMPTS.md)
- [Reflection Log](./REFLECTION_LOG.md)
- [Handoff P0](./handoffs/HANDOFF_P0.md)
- [Handoff P1](./handoffs/HANDOFF_P1.md)
- [Handoff P2](./handoffs/HANDOFF_P2.md)
- [Handoff P3](./handoffs/HANDOFF_P3.md)
- [Handoff P4](./handoffs/HANDOFF_P4.md)
- [Outputs Manifest](./outputs/manifest.json)
- [P0 Research Output](./outputs/p0-research.md)
- [P1 Design Output](./outputs/p1-design.md)
- [P2 Implementation Plan Output](./outputs/p2-implementation-plan.md)
- [P3 Implementation Notes Output](./outputs/p3-implementation-notes.md)
- [P4 Verification Output](./outputs/p4-verification.md)

## Purpose

**Problem:** There is no canonical, repo-local spec that teaches a clean `effect/unstable/rpc` setup for Next.js API routes with both non-stream and stream behavior using `HttpEffect.toWebHandler` and `HttpEffect.toWebHandlerWith`.

**Solution:** Define a canonical pending spec package that another agent can execute end-to-end to research, design, plan, implement, and verify an `apps/web` demo with two routes:
1. Basic RPC route (`/api/rpc/basic`) using `HttpEffect.toWebHandler`.
2. Streaming RPC route (`/api/rpc/stream`) using `HttpEffect.toWebHandlerWith`.

**Why it matters:** This provides a stable, source-backed blueprint for future RPC route work in this repo and reduces trial-and-error when working with Effect v4 unstable RPC + HTTP APIs.

## Source-of-Truth Contract

All decisions in this spec must be verified against local source, in this order:

1. [HttpEffect.ts](/home/elpresidank/YeeBois/projects/beep-effect3/.repos/effect-smol/packages/effect/src/unstable/http/HttpEffect.ts)
2. [Rpc.ts](/home/elpresidank/YeeBois/projects/beep-effect3/.repos/effect-smol/packages/effect/src/unstable/rpc/Rpc.ts)
3. [RpcGroup.ts](/home/elpresidank/YeeBois/projects/beep-effect3/.repos/effect-smol/packages/effect/src/unstable/rpc/RpcGroup.ts)
4. [RpcServer.ts](/home/elpresidank/YeeBois/projects/beep-effect3/.repos/effect-smol/packages/effect/src/unstable/rpc/RpcServer.ts)
5. [RpcClient.ts](/home/elpresidank/YeeBois/projects/beep-effect3/.repos/effect-smol/packages/effect/src/unstable/rpc/RpcClient.ts)
6. [RpcSerialization.ts](/home/elpresidank/YeeBois/projects/beep-effect3/.repos/effect-smol/packages/effect/src/unstable/rpc/RpcSerialization.ts)
7. [McpServer.test.ts](/home/elpresidank/YeeBois/projects/beep-effect3/.repos/effect-smol/packages/effect/test/unstable/ai/McpServer.test.ts)
8. [HttpEffect.test.ts](/home/elpresidank/YeeBois/projects/beep-effect3/.repos/effect-smol/packages/effect/test/unstable/http/HttpEffect.test.ts)
9. [Current chat route pattern](/home/elpresidank/YeeBois/projects/beep-effect3/apps/web/src/app/api/chat/route.ts)

The downstream agent must not rely on memory or generic examples when local source files disagree.

## Scope

### In Scope
- Canonical spec package creation under `specs/pending/effect-rpc-nextjs-api-route`.
- Downstream implementation planning for `apps/web` RPC demo routes.
- Two route patterns: one basic RPC and one streaming RPC.
- Tests for behavior, serialization pairing, and handler wiring.
- Explicit verification gates and evidence capture.

### Out of Scope
- UI demo page or client-side visual components.
- Changes to non-RPC API routes unrelated to this demo.
- Broad RPC framework abstractions beyond the requested demo.
- Production hardening beyond what is needed to demonstrate setup correctness.

## Architecture Decision Records

| ADR | Decision | Rationale |
|---|---|---|
| ADR-001 | Two route demo (`basic` and `stream`) to demonstrate both handler APIs | Keeps each route focused and makes the `toWebHandler` vs `toWebHandlerWith` difference explicit. |
| ADR-002 | JSON-RPC for basic route; NDJSON-RPC for streaming route | Matches framing behavior expectations and provides concrete serialization contrast. |
| ADR-003 | API + tests only; no demo page | Keeps scope constrained to setup correctness and avoids frontend distraction. |
| ADR-004 | Module-level singleton handlers in Next route files | Matches existing `apps/web` pattern and avoids per-request handler reconstruction. |

## Phase Breakdown

| Phase | Focus | Deliverable | Exit Criteria |
|---|---|---|---|
| P0 | Research | `outputs/p0-research.md` | API signatures, serialization behavior, and Next export shape are source-verified with citations. |
| P1 | Design | `outputs/p1-design.md` | Module boundaries, contracts, and test architecture are decision-complete. |
| P2 | Implementation Plan | `outputs/p2-implementation-plan.md` | File-by-file plan includes ownership, order, quality gates, and rollback notes. |
| P3 | Implementation | `outputs/p3-implementation-notes.md` | Planned `apps/web` files are implemented, and deviations are documented. |
| P4 | Verification | `outputs/p4-verification.md` | Required commands are run, evidence is captured, and unresolved issues are explicit. |

## Success Criteria

- [ ] Full canonical spec package exists with README, QUICK_START, AGENT_PROMPTS, REFLECTION_LOG, handoffs, and outputs manifest.
- [ ] README follows the ordered section contract in this spec.
- [ ] P0 research output includes source-backed verification of handler and serialization APIs.
- [ ] P1 design output locks routes, RPC contracts, adapters, and tests with no open architectural decisions.
- [ ] P2 implementation plan is file-level, execution-ordered, and assignable to another agent without ambiguity.
- [ ] P3 implementation notes capture what was implemented and any deltas from plan.
- [ ] P4 verification includes command results and explicit notes about unrelated pre-existing failures.
- [ ] Planned interface additions for routes/modules/tests are explicitly documented.

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Incorrect assumptions about unstable RPC APIs | High | Enforce source-of-truth contract against local `effect-smol` files before finalizing design. |
| Serialization mismatch between server and client test harness | High | Include explicit positive and negative serialization tests and document expected failure mode. |
| Route export shape mismatch for Next.js app router | Medium | Reuse established module-level singleton + exported method wrapper pattern from existing routes. |
| Scope drift into UI and non-essential abstractions | Medium | Keep ADR-003 locked and reject non-API additions in phase handoffs. |
| Hidden pre-existing repo failures blocking verification | Medium | Require proof of pre-existing failures in P4 output when gates cannot be fully green. |

## Execution Plan For Another Agent Instance

### P0 Research
- Confirm `HttpEffect.toWebHandler` and `HttpEffect.toWebHandlerWith` signatures against local Effect source.
- Confirm RPC construction and server bridge APIs: `Rpc.make`, `RpcGroup.make`, `RpcServer.toHttpEffect`.
- Confirm serialization differences and framing expectations between `RpcSerialization.layerJsonRpc` and `RpcSerialization.layerNdJsonRpc`.
- Confirm Next.js export conventions from existing `apps/web` route patterns.
- Write findings in [outputs/p0-research.md](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/effect-rpc-nextjs-api-route/outputs/p0-research.md).

### P1 Design
- Lock module layout for `apps/web/src/lib/effect/rpc-demo/*`.
- Lock route contract for `/api/rpc/basic` and `/api/rpc/stream`.
- Lock RPC contracts:
  - `Echo`: payload `{ message: string }`, success `string`.
  - `CountStream`: payload `{ from: int }`, stream success chunk `int`.
- Lock test architecture using `RpcClient.layerProtocolHttp` with custom fetch handler injection.
- Write finalized design in [outputs/p1-design.md](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/effect-rpc-nextjs-api-route/outputs/p1-design.md).

### P2 Implementation Plan
- Produce explicit file-by-file work order and ownership for code changes.
- Define acceptance criteria per file and per test.
- Define quality gates and rollback path.
- Write plan in [outputs/p2-implementation-plan.md](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/effect-rpc-nextjs-api-route/outputs/p2-implementation-plan.md).

### P3 Implementation
- Implement planned files in `apps/web`.
- Keep handlers module-level singletons in Next route files.
- Keep `basic` and `stream` routes intentionally separate.
- Record exact deltas and rationale in [outputs/p3-implementation-notes.md](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/effect-rpc-nextjs-api-route/outputs/p3-implementation-notes.md).

### P4 Verification
- Run all required verification commands.
- Capture command outputs, pass/fail status, and environment notes.
- If failures are unrelated and pre-existing, record concrete proof.
- Publish evidence in [outputs/p4-verification.md](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/effect-rpc-nextjs-api-route/outputs/p4-verification.md).

### Important Planned Public API / Interface Additions

1. New API routes:
- [apps/web/src/app/api/rpc/basic/route.ts](/home/elpresidank/YeeBois/projects/beep-effect3/apps/web/src/app/api/rpc/basic/route.ts)
- [apps/web/src/app/api/rpc/stream/route.ts](/home/elpresidank/YeeBois/projects/beep-effect3/apps/web/src/app/api/rpc/stream/route.ts)

2. New RPC contracts:
- `Echo`: non-stream RPC (payload `{ message: string }`, success `string`).
- `CountStream`: stream RPC (payload `{ from: int }`, success chunk `int`, `stream: true`).

3. New internal library modules:
- [apps/web/src/lib/effect/rpc-demo/rpcs.ts](/home/elpresidank/YeeBois/projects/beep-effect3/apps/web/src/lib/effect/rpc-demo/rpcs.ts)
- [apps/web/src/lib/effect/rpc-demo/handlers.ts](/home/elpresidank/YeeBois/projects/beep-effect3/apps/web/src/lib/effect/rpc-demo/handlers.ts)
- [apps/web/src/lib/effect/rpc-demo/server-basic.ts](/home/elpresidank/YeeBois/projects/beep-effect3/apps/web/src/lib/effect/rpc-demo/server-basic.ts)
- [apps/web/src/lib/effect/rpc-demo/server-stream.ts](/home/elpresidank/YeeBois/projects/beep-effect3/apps/web/src/lib/effect/rpc-demo/server-stream.ts)

4. Handler conversion requirements:
- `basic` route uses `HttpEffect.toWebHandler`.
- `stream` route uses `HttpEffect.toWebHandlerWith` and proves injected service usage via response header.

### Test Cases and Scenarios

Create these tests:
- [apps/web/test/effect/rpc-basic-route.test.ts](/home/elpresidank/YeeBois/projects/beep-effect3/apps/web/test/effect/rpc-basic-route.test.ts)
- [apps/web/test/effect/rpc-stream-route.test.ts](/home/elpresidank/YeeBois/projects/beep-effect3/apps/web/test/effect/rpc-stream-route.test.ts)

Required scenarios:
1. Basic RPC call returns expected success payload.
2. Streaming RPC call yields multiple chunks in order and terminates cleanly.
3. Stream route returns expected injected header value from `toWebHandlerWith` provided services.
4. Client/server serialization pairing is correct:
   - basic route + `RpcSerialization.layerJsonRpc`
   - stream route + `RpcSerialization.layerNdJsonRpc`
5. Negative check: wrong serialization pairing fails predictably (documented in research or verification output).

### Verification and Acceptance Gates

Required commands for downstream execution:
1. `bunx vitest run apps/web/test/effect/rpc-basic-route.test.ts apps/web/test/effect/rpc-stream-route.test.ts`
2. `bun run check`
3. `bun run lint`
4. `bun run test`
5. If unrelated pre-existing failures exist, document them with concrete proof.

### Assumptions and Defaults

1. Spec depth is full canonical package (not README-only).
2. Demo scope is API + tests only (no UI page).
3. Both handler APIs are explicitly demonstrated.
4. Route names default to `/api/rpc/basic` and `/api/rpc/stream`.
5. This spec package is the deliverable now; implementation in `apps/web` is delegated via handoff phases.

## Exit Condition

This spec is complete when another agent can execute P0-P4 without making any additional design decisions and can deliver an `apps/web` RPC demo with:
- one non-stream route using `HttpEffect.toWebHandler`,
- one streaming route using `HttpEffect.toWebHandlerWith`,
- passing targeted RPC tests,
- and verification evidence captured in `outputs/p4-verification.md`.
