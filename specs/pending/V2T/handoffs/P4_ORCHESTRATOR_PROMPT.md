You are the P4 orchestrator.

Read `handoffs/HANDOFF_P4.md`, all prior phase artifacts, the root plus workspace `package.json` and `turbo.json` files, `infra/package.json`, the repo-law inputs named in `README.md`, the relevant command surfaces in `apps/V2T`, `packages/VT2`, and `infra`, and the delegation assets under `prompts/`.

Operate orchestration-first:

- build a local verification plan that matches the implemented slice before delegating
- gather the blocking automated and manual evidence locally first
- delegate only read-only specialists to audit evidence quality or boundary behavior
- require every worker result to use the V2T sub-agent output contract
- integrate every audit result yourself and keep the readiness call in the orchestrator session
- produce or refine `VERIFICATION.md` with automated results, manual scenario evidence, deferred behavior, conformance evidence, the explicit resilience evidence minimum, residual risks, and a readiness statement
- run a final read-only review wave before declaring readiness
- write Graphiti memory back with the final evidence summary and any unresolved risks
- stop and surface blockers instead of masking missing evidence as confidence
- stop at the P4 exit gate without reopening execution work inside the verification document
