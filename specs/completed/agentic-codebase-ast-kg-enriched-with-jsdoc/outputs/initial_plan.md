Spec Plan: Repo-Wide TypeScript AST KG + JSDoc Semantic Enrichment on Graphiti Memory
Summary
Build a deterministic TypeScript code graph (AST + type relationships) enriched with deterministic JSDoc semantics, persist it into the existing graphiti-memory MCP stack, and wire a .claude UserPromptSubmit hook path that injects high-signal KG context to improve agent task outcomes.
This plan uses canonical repo spec patterns and is executable by multiple agents with phase/agent handoffs, artifacts, gates, and rollback controls.

Step 0 Research (Completed Before Planning)
External candidate comparison
Candidate	Relevant capability	Monorepo/incremental support	Reuse decision	Must build ourselves
FalkorDB code-graph + code-graph-backend	End-to-end code graph architecture on FalkorDB	Early-stage app; backend README currently emphasizes Java/Python, JS planned	Reuse architecture ideas, UI/query patterns	TypeScript-first extractor + JSDoc semantic model
vitali87/code-graph-rag	Code graph + MCP + graph DB RAG pattern	Index/update workflow in project	Reuse ingestion/query orchestration patterns	Effect-style TS extractor + Graphiti-specific persistence contracts
getzep/graphiti + Graphiti MCP docs	Temporal KG + MCP tools + memory workflows	Episodic ingestion model	Reuse as required persistence target	Deterministic KG serialization format + conflict/update policy
ts-morph	TS AST + JSDoc + type info extraction	Works with TS project graph; deterministic	Primary extraction engine	Repo-specific symbol/edge schema and extractor pipeline
TypeScript Compiler API	Program/TypeChecker semantics	TS incremental compiler features	Use via ts-morph + direct API where needed	Repo-specific traversal + edge assembly
tree-sitter	Fast incremental syntax parsing	Native incremental parse (tree.edit)	Optional prefilter for changed files	Type-aware semantics (not provided by tree-sitter)
sourcegraph/scip + scip-typescript	Precise symbol/reference index format	Workspace/tsconfig-aware indexing	Optional secondary truth source for refs	Semantic architecture/business edges from JSDoc
TypeDoc	Structured docs/JSON output	Build-time docs output	Optional doc-quality oracle and metadata input	Graph persistence + runtime retrieval/hook integration
Nx affected	Changed-project detection	Strong CI optimization for changed scope	Optional changed-scope input for incremental indexing	Symbol-level delta graph recomputation
Internal reuse vs build
Category	Reuse now	Build new
JSDoc governance	eslint-plugin-jsdoc config + tsdoc.json tag contracts + @effect/docgen pipeline	KG-focused JSDoc semantic mapper (@domain/@provides/@depends/@errors to graph edges)
Graphiti integration	client.ts, mcp.ts, .mcp.json server wiring	Deterministic AstKgEpisodeV1 serializer, idempotent ingestion strategy, round-trip verifier
Hook framework	.claude/hooks/skill-suggester, schemas/tests, run wrappers	KG context retrieval and compact injection format integrated into hook path
Performance evaluation	tooling/agent-eval benchmark/report/compare/ingest commands	New benchmark condition/profile for kg_hook and KG-specific success metrics
Existing KG extraction precedent	specs/completed/effect-v4-knowledge-graph/* scripts and episode templates	Robust repo-wide TS AST graph (current scripts are regex-oriented and scope-limited)
Canonical spec structure and file layout
/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/agentic-codebase-ast-kg-enriched-with-jsdoc/
  README.md
  QUICK_START.md
  MASTER_ORCHESTRATION.md
  AGENT_PROMPTS.md
  RUBRICS.md
  REFLECTION_LOG.md
  handoffs/
    HANDOFF_P1.md
    HANDOFF_P2.md
    HANDOFF_P3.md
    HANDOFF_P4.md
    P1_ORCHESTRATOR_PROMPT.md
    P1_RESEARCH_AGENT_PROMPT.md
    P1_REUSE_AUDIT_AGENT_PROMPT.md
    P2_ORCHESTRATOR_PROMPT.md
    P2_SCHEMA_AGENT_PROMPT.md
    P2_GRAPHITI_CONTRACT_AGENT_PROMPT.md
    P2_HOOK_CONTRACT_AGENT_PROMPT.md
    P3_ORCHESTRATOR_PROMPT.md
    P3_AST_ENGINEER_PROMPT.md
    P3_SEMANTIC_ENGINEER_PROMPT.md
    P3_GRAPHITI_ENGINEER_PROMPT.md
    P3_HOOK_ENGINEER_PROMPT.md
    P3_EVAL_ENGINEER_PROMPT.md
    P4_ORCHESTRATOR_PROMPT.md
    P4_VALIDATION_ENGINEER_PROMPT.md
    P4_ROLLOUT_ENGINEER_PROMPT.md
  outputs/
    p1-research/
      landscape-comparison.md
      reuse-vs-build-matrix.md
      constraints-and-gaps.md
      agents/
        research-agent.md
        reuse-audit-agent.md
    p2-design/
      kg-schema-v1.md
      extraction-contract.md
      graphiti-persistence-contract.md
      incremental-update-design.md
      query-and-hook-contract.md
      evaluation-design.md
      rollout-and-fallback-design.md
      agents/
        schema-agent.md
        graphiti-contract-agent.md
        hook-contract-agent.md
    p3-execution/
      implementation-checklist.md
      integration-log.md
      changed-files-manifest.md
      agents/
        ast-engineer.md
        semantic-engineer.md
        graphiti-engineer.md
        hook-engineer.md
        eval-engineer.md
    p4-validation/
      coverage-correctness-report.md
      semantic-enrichment-quality-report.md
      query-usefulness-report.md
      agent-performance-impact-report.md
      rollout-readiness.md
      fallback-drill-report.md
      agents/
        validation-engineer.md
        rollout-engineer.md
Public interfaces and contracts (locked in this plan)
Interface	Contract
CLI command set	`bun run beep kg index --mode full
KG node ID	Stable deterministic ID: <workspace>::<file>::<symbol>::<kind>::<signature-hash>
KG edge provenance	`provenance = ast
Semantic tags to edges	@category -> IN_CATEGORY, @module -> IN_MODULE, @domain -> IN_DOMAIN, @provides -> PROVIDES, @depends -> DEPENDS_ON, @errors -> THROWS_DOMAIN_ERROR
Graphiti persistence envelope	AstKgEpisodeV1 JSON payload serialized in episode_body with source="json" where possible; fallback source="text" strict template
Hook context format	XML-style compact block: <kg-context>, <symbols>, <relationships>, <confidence>, <provenance>
Hook fail behavior	Hard timeout and no-throw: on any error, emit no KG block and preserve current hook behavior
4-phase execution plan
Phase 1: Research
Field	Plan
Objectives	Lock toolchain choices, lock reuse/build boundaries, lock risk register from evidence.
Inputs/dependencies	Existing research file, repo hook code, Graphiti clients, internet sources.
Workstreams	1) External comparison refresh. 2) Internal capability audit. 3) Decision log.
Artifacts/outputs	outputs/p1-research/* plus per-agent reports.
Agent ownership	Orchestrator + Research Agent + Reuse Audit Agent.
Entry criteria	Spec folder exists with baseline research output.
Exit criteria	Chosen stack and no unresolved architecture ambiguity for P2.
Risks	Biased tool selection and over-claiming benchmark evidence.
Mitigations	Primary-source citations only, explicit uncertainty notes, tradeoff matrix signed off in outputs.
Phase 2: Planning/Design
Field	Plan
Objectives	Produce decision-complete architecture/spec contracts for extraction, persistence, query, hook, and evaluation.
Inputs/dependencies	Phase 1 outputs, repo laws, .claude hook interfaces, Graphiti MCP contract.
Workstreams	1) KG schema and edge model. 2) Incremental update model. 3) Graphiti ingestion/upsert policy. 4) Hook context/query contract. 5) Validation protocol.
Artifacts/outputs	outputs/p2-design/* + phase handoff files.
Agent ownership	Orchestrator + Schema Agent + Graphiti Contract Agent + Hook Contract Agent.
Entry criteria	P1 decisions accepted and documented.
Exit criteria	No TBD in interfaces, exact command surface defined, phase-3 task graph frozen.
Risks	Deterministic KG vs Graphiti semantic extraction mismatch.
Mitigations	Canonical deterministic snapshot + Graphiti mirror + round-trip verifier + fallback read path policy.
Phase 3: Execution/Implementation
Field	Plan
Objectives	Build extractor, semantic enricher, Graphiti persistence pipeline, hook integration, and benchmark wiring.
Inputs/dependencies	Phase 2 contracts, existing hook and Graphiti clients, tooling/agent-eval.
Workstreams	1) New tooling/ast-kg package scaffold. 2) ts-morph extractor + type edges. 3) JSDoc semantic mapping. 4) Incremental diff/index pipeline. 5) Graphiti ingestion and verify commands. 6) .claude hook KG context integration. 7) agent-eval condition wiring.
Artifacts/outputs	Code + outputs/p3-execution/* + per-agent logs.
Agent ownership	Orchestrator + AST Engineer + Semantic Engineer + Graphiti Engineer + Hook Engineer + Eval Engineer.
Entry criteria	P2 contracts frozen and handoffs issued.
Exit criteria	All P3 code complete, integration smoke tests pass, no phase-local blockers.
Risks	Hook latency regressions, Graphiti ingest cost/time, stale graph deltas.
Mitigations	Timeout + cache + token cap, ingestion batching/debouncing, nightly full rebuild + drift check.
Phase 4: Validation
Field	Plan
Objectives	Prove correctness, usefulness, and measurable agent-performance impact, then gate rollout.
Inputs/dependencies	P3 implementation, benchmark catalog, validation rubrics.
Workstreams	1) Coverage/correctness audits. 2) Semantic quality scoring. 3) Query utility evaluation. 4) Agent A/B benchmarks. 5) Rollout readiness + fallback drills.
Artifacts/outputs	outputs/p4-validation/* + final scorecard in README/REFLECTION_LOG.
Agent ownership	Orchestrator + Validation Engineer + Rollout Engineer.
Entry criteria	P3 complete and commands runnable in CI/local.
Exit criteria	All quantitative thresholds met and rollback tested.
Risks	Gains not statistically meaningful, false positives in semantic edges.
Mitigations	Minimum sample sizes, baseline control condition, manual adjudication set for semantic precision.
Agent-by-agent handoff prompt set
Handoff file	Agent	Mission	Required output
P1_ORCHESTRATOR_PROMPT.md	Orchestrator	Coordinate P1 and approve final reuse/build decisions	reuse-vs-build-matrix.md
P1_RESEARCH_AGENT_PROMPT.md	Research Agent	External repos/tools evidence with citations	research-agent.md
P1_REUSE_AUDIT_AGENT_PROMPT.md	Reuse Audit Agent	In-repo reusable components and gaps	reuse-audit-agent.md
P2_ORCHESTRATOR_PROMPT.md	Orchestrator	Freeze architecture and contracts	extraction-contract.md
P2_SCHEMA_AGENT_PROMPT.md	Schema Agent	Node/edge schema and deterministic IDs	kg-schema-v1.md
P2_GRAPHITI_CONTRACT_AGENT_PROMPT.md	Graphiti Contract Agent	Ingestion/update/query contract for Graphiti memory	graphiti-persistence-contract.md
P2_HOOK_CONTRACT_AGENT_PROMPT.md	Hook Contract Agent	Hook context protocol, latency/error policies	query-and-hook-contract.md
P3_ORCHESTRATOR_PROMPT.md	Orchestrator	Coordinate implementation sequence and gates	implementation-checklist.md
P3_AST_ENGINEER_PROMPT.md	AST Engineer	Build TS AST/type extraction + deterministic graph build	ast-engineer.md
P3_SEMANTIC_ENGINEER_PROMPT.md	Semantic Engineer	JSDoc semantic edge mapper + validation	semantic-engineer.md
P3_GRAPHITI_ENGINEER_PROMPT.md	Graphiti Engineer	Graphiti ingestion, idempotency, verification tools	graphiti-engineer.md
P3_HOOK_ENGINEER_PROMPT.md	Hook Engineer	Integrate KG hints into .claude hook path	hook-engineer.md
P3_EVAL_ENGINEER_PROMPT.md	Eval Engineer	Add benchmark condition and telemetry	eval-engineer.md
P4_ORCHESTRATOR_PROMPT.md	Orchestrator	Validation sign-off and rollout decision	rollout-readiness.md
P4_VALIDATION_ENGINEER_PROMPT.md	Validation Engineer	Execute metric suite and compile scorecards	agent-performance-impact-report.md
P4_ROLLOUT_ENGINEER_PROMPT.md	Rollout Engineer	Rollout/fallback drill and operational runbook	fallback-drill-report.md
Validation strategy with measurable success criteria
1) Graph coverage and correctness
Metric	Target
Exported symbol coverage (captured_exports / total_exports)	>= 98%
Import edge precision (manual sample)	>= 95%
Call edge precision (manual sample)	>= 90%
Determinism (same commit => same IDs/edge hashes)	100%
2) Semantic enrichment quality
Metric	Target
Required tag parse success (@category,@module,@since,@param,@returns)	>= 99%
Domain semantic edge precision (@domain/@provides/@depends/@errors)	>= 90%
Semantic edge recall on labeled set	>= 85%
3) Query usefulness
Metric	Target
Top-5 hit rate on curated prompt set	>= 80%
Hook KG context relevance score (human review)	>= 4.0/5
kg hint latency p95 (warm)	<= 1.5s
kg hint latency p99	<= 2.5s
4) Agentic task performance impact
Metric	Target
Task success rate vs baseline (current)	+10pp minimum
Wrong-API/resource hallucination incidents	-30% minimum
First-pass check+lint success rate	+20% minimum
Median token cost per successful task	-10% minimum
Validation gates and commands
bun run check
bun run lint
bun run test
bun run docgen
bun run agents:pathless:check
bun run agent:bench with baseline + kg_hook condition
bun run agent:bench:report and bun run agent:bench:compare
Rollout and fallback plan
Rollout stages
Stage	Behavior	Promotion gate
R0 Shadow	Build/index/ingest only, no hook injection	Coverage/correctness targets met
R1 Advisory	Hook computes KG hints but logs only	Query usefulness targets met
R2 Limited On	Hook injects KG hints for selected contributors	Early benchmark improvement
R3 Default On	Hook enabled by default in repo hook path	Full performance thresholds met
Fallback controls
Trigger	Fallback action
Hook latency breach or timeout storm	Auto-disable KG injection; keep existing hook output
Graphiti unavailable	Use local deterministic cache only; skip Graphiti query path
Drift detected in incremental index	Force full rebuild and freeze incremental mode
Performance regression in A/B	Roll back to prior stage and disable kg_hook condition in defaults
Assumptions
The existing spec root remains /home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/agentic-codebase-ast-kg-enriched-with-jsdoc.
graphiti-memory MCP remains reachable at http://localhost:8000/mcp for dev.
Indexing scope default is apps/, packages/, tooling/, and .claude/hooks plus .claude/scripts.
Default Graphiti group for this system is beep-ast-kg to avoid polluting beep-dev.
.claude performance integration is implemented by extending current UserPromptSubmit hook path (skill-suggester) instead of introducing a parallel hook chain.
If unanswered open questions remain, recommended defaults in the next section are used.
Open questions requiring decisions
Read path policy: Graphiti-only retrieval or hybrid retrieval (local deterministic cache + Graphiti semantic layer).
Recommended default: hybrid.
Ingestion granularity: one episode per symbol or one episode per file delta.
Recommended default: per-file delta for throughput and lower ingestion overhead.
Group strategy: single stable group or branch-scoped groups.
Recommended default: stable beep-ast-kg with commit/version metadata.
Hook latency budget strictness: hard fail at 1.5s p95 or allow up to 2.5s p95 initially.
Recommended default: enforce 1.5s p95 from R2 onward.
Scope policy: include specs/ and .repos/ in indexing.
Recommended default: exclude both from v1 to reduce noise.
Research sources
FalkorDB code-graph README
FalkorDB code-graph-backend README
Code-Graph-RAG README
Graphiti README
Graphiti MCP server docs
ts-morph docs
ts-morph JSDoc API
ts-morph types API
TypeScript Compiler API (official wiki source)
TSConfig incremental option
tree-sitter advanced parsing (incremental edits)
SCIP protocol docs
scip-typescript README
Nx affected docs
TypeDoc output options
CodeQL supported languages/frameworks