# 02 -- Thread Triage

Every open memory-related thread in this project gets a verdict here. The goal
is not to preserve optionality. The goal is to destroy it. Nine threads became
three priorities and a clear "leave it alone" for everything else.

Definitions:

- **GO** -- Active build work. Has a priority rank.
- **PAUSE** -- Not abandoned, but no investment until a GO thread demands it.
- **DROP** -- Disable, remove, stop thinking about it.
- **LEARN-ONLY** -- Research artifact. Read it when relevant, never build from it directly.

---

## 1. repo-memory v0

**Location:** `specs/pending/repo-expert-memory-local-first-v0/`,
`packages/repo-memory/`

**Status:** Substantially built. Tauri v2 desktop app, Effect runtime on
`effect/unstable/cluster`, ts-morph deterministic indexing, 15+ query classes,
durable workflows with interrupt/resume, grounded retrieval with citations.
Remaining P0 gaps: RunProjector extraction seams, projection bootstrap/cursor
ownership, query-preparation acceptance surface.

**Verdict:** GO -- Priority 1

**Rationale:** Deterministic code intelligence operates outside the No-Escape
Theorem. It does not degrade at scale. It cannot. AST extraction, type
resolution, and dependency graphs produce facts at certainty=1.0 -- no
semantic proximity, no interference, no forgetting curve. This is the single
strongest asset in the entire memory portfolio and the project's core
competitive advantage. Every week spent elsewhere instead of finishing this is
opportunity cost against an asset no competitor can replicate with embeddings.

**Next action:** Close the remaining P0 gaps. Ship it.

---

## 2. Expert Memory Big Picture

**Location:** `specs/pending/expert-memory-big-picture/` (14 documents)

**Status:** Thorough architectural thesis across kernel, control plane,
claims/evidence, representation layers, ontology, temporal modeling, domain
transfer. The older `knowledge` slice validated key ideas in practice:
MentionRecords, RelationEvidence, CitationValidation, ReasoningTraces,
ProvenanceEmission. The ClaimRecord abstraction is well-defined but not yet
implemented.

**Verdict:** GO -- Priority 2 (architecture reference, not active build)

**Rationale:** The architecture already contains the escape routes the theorem
demands: deterministic substrate, claims with evidence, provenance, symbolic
verification. But the spec's own recommendation is correct -- artifact-to-packet
first, full ClaimRecord later. The big picture is the map, not the road. Do not
start building the ClaimRecord kernel until repo-memory v0 has shipped and
validated the simpler path.

**Next action:** Use as architecture reference. Do NOT implement ClaimRecord
until repo-memory v0 ships and validates artifact-to-packet.

---

## 3. TrustGraph TypeScript Port

**Location:** `~/YeeBois/dev/trustgraph/ts`

**Status:** Complete, deployable port. All Python services reimplemented in
imperative TypeScript. Microservices over NATS JetStream, FalkorDB + Qdrant
backends, full Docker Compose with observability stack, working React workbench
UI. Six packages (base, flow, client, cli, mcp, workbench).

**Verdict:** PAUSE

**Rationale:** This is a working proof of architecture, but it is imperative
TypeScript with no Effect patterns. Its value is as a reference for the
BeepGraph Effect rewrite -- it proves the design works. Running it in production
adds operational complexity (20+ Docker services) that is not justified while
repo-memory v0 is the priority. The provenance and trust-scoring concepts are
valuable, but they enter the project through BeepGraph, not through deploying
this standalone.

**Next action:** None. Keep as reference. Do not invest further.

---

## 4. BeepGraph (Effect-Native TrustGraph)

**Location:** `/home/elpresidank/YeeBois/projects/beep-effect2/packages/graph`

**Status:** Foundation complete -- all 17 schema modules, NatsClient with
JetStream lifecycle, ResponseRouter with correlation-based dispatch,
RequestResponse RPC (single + streaming), ServiceRunner,
TypedConsumer/Producer/Requestor, ConfigPush, GraphRag pipeline (6 steps),
DocumentRag pipeline (4 steps), gateway API definition, BeepGraphClient
interface. Tests pass. Missing: all individual service implementations (LLM
adapters, storage backends, agent, librarian, knowledge extraction) and gateway
handler wiring.

**Verdict:** GO -- Priority 3 (selective port only)

**Rationale:** The foundation work is the hard part and it is done well. But
porting all 15 services from the TS reference is a multi-quarter distraction.
The No-Escape Theorem identifies the "external symbolic verifier" as an escape
route. That is the provenance/verification layer. That is what to port. The full
TrustGraph pipeline -- LLM adapters, librarian, agent -- is not what makes this
valuable. Provenance tracing, trust scoring, and whatever storage/retrieval
repo-memory v0 actually needs for Layer 4 relational memory is what makes this
valuable. Port those. Ignore the rest until concrete demand exists.

**Next action:** Identify which BeepGraph services repo-memory v0 needs for
provenance-verified relational queries. Port those services. Do not port
anything else.

---

## 5. Graphiti MCP (Shared Memory)

**Location:** Configured in `.mcp.json`, backed by FalkorDB, managed via
`bun run beep graphiti proxy`

**Status:** Running. Shared between Claude Code and Codex. Extensive bootstrap
protocol and query catalog documented. User reports it has become less effective
as the knowledge graph has grown -- degradation at scale.

**Verdict:** PAUSE

**Rationale:** The user's experience is exactly what the No-Escape Theorem
predicts. Graphiti uses embedding-based edge construction (cosine > 0.7) which
inherits the full geometric vulnerability. The paper measured graph memory at
b=0.478 forgetting and FA=0.208 false recall. As the graph grows, interference
increases, retrieval quality degrades. This is not a bug to fix. It is a
mathematical consequence of the architecture.

Graphiti is not suitable as a long-term knowledge store. It can work as Layer 2
(short-term/session memory) if temporal windows are enforced, old data is pruned
aggressively, and a consolidation pipeline promotes high-signal facts to Layer 1.
Without those constraints, it is actively degrading.

**Next action:** Either implement temporal pruning and session-scoping, or
disable until a consolidation pipeline exists. Stop adding unbounded knowledge.

---

## 6. Supermemory

**Location:** Configured as Claude plugin in `.claude/settings.json`

**Status:** Authentication keeps timing out. Enabled but unreliable.

**Verdict:** DROP

**Rationale:** A third memory backend in an already-fragmented landscape
increases cognitive load without clear benefit. Supermemory's "auto-evolving
knowledge graph" operates inside the No-Escape Theorem and will degrade at
scale. Its connector ecosystem is immature. The project already has Graphiti for
semantic memory and file-based memory for durable knowledge. A system that
cannot maintain authentication is noise, not signal.

**Next action:** Disable the plugin. Remove from settings.

---

## 7. TrustGraph MCP (External Sync)

**Location:** Configured in `.mcp.json`, tracks 45+ synced documents

**Status:** Running against external server
(`dankserver.tailc7c348.ts.net:8444`).

**Verdict:** PAUSE

**Rationale:** This is the external TrustGraph deployment, separate from the TS
port. Its value depends on whether the provenance/trust features are providing
retrieval signal. Once BeepGraph's provenance layer ships locally, this external
dependency should be evaluated for retirement.

**Next action:** Audit whether the synced documents are providing value. If not,
disable to reduce operational surface.

---

## 8. Karpathy-Style LLM Wiki

**Location:** N/A (concept only, not implemented)

**Status:** Not implemented. The concept: LLM compiles raw sources into a
markdown wiki, iteratively enhances it, uses the wiki for Q&A.

**Verdict:** LEARN-ONLY

**Rationale:** The concept is inside the No-Escape Theorem for its semantic
retrieval layer, and the community building it will hit the interference wall.
But three ideas are worth extracting: (a) LLM-assisted health checks / linting
over curated knowledge (useful for Layer 1 maintenance), (b) the principle that
outputs should "add up" in a knowledge base (useful for consolidation pipeline
design), (c) the separation between raw sources and compiled wiki mirrors the
episodic-to-durable promotion pattern in Layer 2 to Layer 1. Do not implement as
a standalone system. Cherry-pick the consolidation ideas.

**Next action:** None. Extract consolidation patterns when designing the
Layer 2 to Layer 1 promotion pipeline.

---

## 9. repo-codegraph-jsdoc Research

**Location:** `specs/pending/repo-codegraph-jsdoc/outputs/compiled_sources/`

**Status:** Pure research compilation -- 29 papers/reports synthesized.
Validates the deterministic-first approach with evidence (32.8% improvement from
RepoGraph, 36.36% pass@1 from KG-CodeGen). No code written from this research
directly.

**Verdict:** LEARN-ONLY

**Rationale:** This research is the evidentiary foundation for repo-memory v0's
approach. Its key insights -- three-tier certainty model, JSDoc as structured
semantic surface, property graphs over RDF for code, ts-morph as primary
extractor -- are already baked into the v0 design. The research has been
absorbed. No further action on the research itself.

**Next action:** None. Reference when making repo-memory v0 architecture
decisions.

---

## Summary

| # | Thread | Verdict | Priority | Layer Served |
|---|---|---|---|---|
| 1 | repo-memory v0 | **GO** | P1 | Layer 3 (Procedural) |
| 2 | Expert Memory Big Picture | **GO** (ref) | P2 | All layers (architecture) |
| 3 | TrustGraph TS Port | **PAUSE** | -- | Reference only |
| 4 | BeepGraph (selective) | **GO** | P3 | Layer 4 (Relational) |
| 5 | Graphiti MCP | **PAUSE** | -- | Layer 2 (if bounded) |
| 6 | Supermemory | **DROP** | -- | -- |
| 7 | TrustGraph MCP | **PAUSE** | -- | Evaluate later |
| 8 | Karpathy LLM Wiki | **LEARN-ONLY** | -- | Consolidation patterns |
| 9 | repo-codegraph research | **LEARN-ONLY** | -- | Already absorbed |

Three threads get investment. Three are paused pending demand. One is dropped.
Two are research artifacts. The search space is closed.
