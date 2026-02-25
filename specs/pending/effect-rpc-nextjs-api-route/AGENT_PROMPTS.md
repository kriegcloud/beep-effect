# Agent Prompts

## Prompt: P0 Orchestrator (Research)

Research and document the exact Effect v4 unstable RPC + HTTP API signatures required for this spec.
Use only local source-of-truth files listed in `README.md` and produce:
- `outputs/p0-research.md`

You must verify:
- `HttpEffect.toWebHandler` vs `HttpEffect.toWebHandlerWith`
- `Rpc.make`, `RpcGroup.make`, `RpcServer.toHttpEffect`
- `RpcSerialization.layerJsonRpc` vs `RpcSerialization.layerNdJsonRpc`
- Next.js route export shape consistency in `apps/web`

## Prompt: P1 Orchestrator (Design)

Produce a decision-complete design for the RPC demo in `apps/web` with no open architecture decisions.
Write:
- `outputs/p1-design.md`

The design must lock:
- file/module layout
- route contracts
- RPC contract schemas
- serialization strategy per route
- test harness strategy (`RpcClient.layerProtocolHttp` + custom fetch)

## Prompt: P2 Orchestrator (Implementation Plan)

Create a file-by-file implementation plan for downstream execution.
Write:
- `outputs/p2-implementation-plan.md`

The plan must include:
- exact change order
- ownership per file
- acceptance criteria per task
- quality gates and rollback notes

## Prompt: P3 Orchestrator (Implementation)

Implement the approved P2 plan in `apps/web` and document what changed.
Write:
- `outputs/p3-implementation-notes.md`

Mandatory constraints:
- keep `basic` and `stream` routes separate
- use module-level singleton handlers in route files
- include both handler APIs exactly as specified

## Prompt: P4 Orchestrator (Verification)

Run required verification commands and capture evidence.
Write:
- `outputs/p4-verification.md`

You must include:
- command-by-command pass/fail evidence
- explanation of any failures
- proof for unrelated pre-existing failures, if applicable
- final readiness summary
