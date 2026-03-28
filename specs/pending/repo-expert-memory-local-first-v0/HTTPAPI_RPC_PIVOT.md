# HttpApi / Rpc Pivot Note

## Thesis
The earlier `HttpApi` rewrite investigation produced useful transport findings, but the rewrite itself is now superseded.

The correct long-term split for this spec is:
- `effect/unstable/httpapi` for the app-facing control plane and ordinary resource reads
- `effect/unstable/rpc` plus workflow primitives for long-lived run execution and streaming

This note preserves the useful source exploration so that work is not repeated, while making it explicit that the paused `HttpApi` rewrite plan should not be executed.

## Status
The prior plans to rewrite the current sidecar transport around `HttpApi`, including the reduced control-plane-only variant, are superseded.

They were technically viable, but they are not the right next mutation because the repo is now moving toward the `cluster-first`, `workflow-backed` direction described in [CLUSTER_FIRST_REPO_EXPERT_MEMORY_PLAN.md](./CLUSTER_FIRST_REPO_EXPERT_MEMORY_PLAN.md).

Use this note as:
- evidence from the source exploration
- a record of what was learned
- a guardrail against resuming the paused rewrite accidentally

Do not use it as an implementation checklist for the current codebase.

## What The Exploration Established

### 1. Current transport and business seams are already split
The current handwritten HTTP transport lives in:
- [packages/runtime/server/src/index.ts](../../../packages/runtime/server/src/index.ts)

The repo-memory business logic lives in:
- [packages/repo-memory/runtime/src/index.ts](../../../packages/repo-memory/runtime/src/index.ts)

That means any transport rewrite would primarily churn the runtime composition root, not the repo-memory service layer.

### 2. `HttpApi` still serves through `HttpRouter`
Source exploration of:
- [HttpApiBuilder.ts](../../../.repos/effect-v4/packages/effect/src/unstable/httpapi/HttpApiBuilder.ts)

established that `HttpApi` does not replace the listener edge.

The idiomatic pattern is still:
- define `HttpApi` contracts
- implement groups with `HttpApiBuilder.group(...)`
- register them through `HttpApiBuilder.layer(...)`
- serve them with `HttpRouter.serve(...)`

This finding remains useful for the future shared-router design. It means `HttpApi`, internal cluster routes, and future `Rpc` transport can coexist on one router without inventing a separate serving model.

### 3. `HttpApi` can technically stream, but that should not define the run path
The same `HttpApiBuilder` source shows that handlers can return raw `HttpServerResponse` values.

That means a route could technically stay inside an `HttpApi` contract and still return a raw stream or SSE response. The exploration also confirmed that `HttpApiSchema.asText(...)` can annotate non-JSON response content types in:
- [HttpApiSchema.ts](../../../.repos/effect-v4/packages/effect/src/unstable/httpapi/HttpApiSchema.ts)

This is a feasibility result, not a recommendation.

The new architectural direction is that long-lived runs should not be formalized around `HttpApi` or SSE-only semantics just because `HttpApi` can technically stream a raw response.

### 4. The repo already has a local `HttpApi` pattern
The repo contains an internal example of the local `HttpApi` style in:
- [packages/ai/sdk/src/core/service/AgentHttpApi.ts](../../../packages/ai/sdk/src/claude/service/AgentHttpApi.ts)
- [packages/ai/sdk/src/core/service/AgentHttpHandlers.ts](../../../packages/ai/sdk/src/claude/service/AgentHttpHandlers.ts)
- [packages/ai/sdk/src/core/service/AgentHttpServer.ts](../../../packages/ai/sdk/src/claude/service/AgentHttpServer.ts)

That pattern is useful evidence for future control-plane design:
- shared `*HttpApi` contract
- group-specific handler layers
- `HttpRouter.serve(...)` at the edge

### 5. The reduced rewrite still targeted the wrong seams
Even after reducing scope to control-plane endpoints only, the paused plan still would have:
- kept the current `SidecarRuntime` façade in place
- preserved the current handwritten route ownership model as an intermediate architecture
- mutated [packages/runtime/server/src/index.ts](../../../packages/runtime/server/src/index.ts)
- mutated [packages/runtime/protocol/src/index.ts](../../../packages/runtime/protocol/src/index.ts)

Those are now exactly the seams most likely to be structurally replaced by the cluster/workflow redesign.

## Technical Feasibility vs Current Architectural Fit

### Technical feasibility
The exploration showed that a hybrid approach was feasible:
- `HttpApi` for control-plane routes
- handwritten `HttpRouter` for run mutation and streaming routes
- one shared Bun server and one shared router

That is a useful fact.

### Current architectural fit
That feasible plan is still the wrong move now because it would harden the old sidecar façade while the runtime substrate is being redesigned around:
- cluster-first execution
- workflow-backed runs
- journal-backed projections
- a shared router that hosts `"/__cluster"`, `"/api/v0"`, and `"/api/v0/rpc"`

The right conclusion is:
- the exploration was valuable
- the rewrite should remain paused

## Why The Rewrite Is Paused
The paused `HttpApi` rewrite should not be resumed for these reasons:
- it is still anchored to the current `SidecarRuntime` and current server assembly
- it preserves temporary route ownership assumptions that are about to change
- it bakes the old HTTP façade deeper into the code just before a substrate-level redesign
- it would create near-term churn in the two files most likely to be replaced structurally

In short:
- the rewrite is not blocked because `HttpApi` is wrong
- the rewrite is paused because the surrounding runtime architecture has moved ahead of it

## Revised Architecture Direction
The current direction for this spec set is:
- cluster-first runtime substrate
- `ClusterWorkflowEngine`
- `WorkflowProxy`
- journal-backed run projections
- one shared router with:
  - `"/__cluster"`
  - `"/api/v0"`
  - `"/api/v0/rpc"`

Within that direction:
- `HttpApi` remains the right control-plane abstraction
- `Rpc` remains the right execution and streaming abstraction
- workflow remains the semantic model for run lifecycle

## Near-Term Guardrails
Until the cluster/workflow pass lands:
- do not run the paused `HttpApi` rewrite plan
- do not partially port the existing sidecar to `HttpApi`
- do not define a long-term `HttpApi` contract for run streaming
- do not calcify the current `SidecarRuntime` route ownership model as an intermediate step
- do not mutate the current control-plane transport just to preserve a design that is already being replaced

## Useful Next Read-Only Exploration
If more salvage work is needed before the redesign, keep it read-only and focus on these questions:
- How should `HttpApiBuilder.layer(...)`, `WorkflowProxyServer.layerRpcHandlers(...)`, and `HttpRunner.layerHttpOptions(...)` share one router cleanly?
- How should `"/api/v0"` control-plane reads coexist with `"/api/v0/rpc"` without reintroducing the old sidecar transport split?
- How should journal-backed run projections serve `GET /api/v0/runs` and `GET /api/v0/runs/:runId` once the workflow model is authoritative?
- Which current protocol shapes can survive intact, and which should be regenerated from workflow and projection boundaries?

## Evidence
Primary source files explored for this note:
- [packages/runtime/server/src/index.ts](../../../packages/runtime/server/src/index.ts)
- [packages/repo-memory/runtime/src/index.ts](../../../packages/repo-memory/runtime/src/index.ts)
- [packages/ai/sdk/src/core/service/AgentHttpApi.ts](../../../packages/ai/sdk/src/claude/service/AgentHttpApi.ts)
- [packages/ai/sdk/src/core/service/AgentHttpHandlers.ts](../../../packages/ai/sdk/src/claude/service/AgentHttpHandlers.ts)
- [packages/ai/sdk/src/core/service/AgentHttpServer.ts](../../../packages/ai/sdk/src/claude/service/AgentHttpServer.ts)
- [HttpApiBuilder.ts](../../../.repos/effect-v4/packages/effect/src/unstable/httpapi/HttpApiBuilder.ts)
- [HttpApiSchema.ts](../../../.repos/effect-v4/packages/effect/src/unstable/httpapi/HttpApiSchema.ts)

## Bottom Line
The earlier `HttpApi` rewrite investigation was useful because it answered three concrete questions:
1. where the current transport seam lives
2. how `HttpApi` actually composes with `HttpRouter`
3. why streaming feasibility is not enough to justify using `HttpApi` for long-lived run execution

That is the value to keep.

The implementation conclusion is unchanged:
- do not execute the paused rewrite
- carry these findings forward into the cluster/workflow redesign instead
