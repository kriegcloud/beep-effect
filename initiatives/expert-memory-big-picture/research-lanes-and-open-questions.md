# Research Lanes and Open Questions

## Thesis
The current repo exploration is already rich enough to justify several credible forward paths. The goal now is not to invent more abstraction. It is to identify which lanes would teach the most about expert memory with the least wasted motion.

## Current Repo Reality
This repository now shows four live pressure points:
- repo-codegraph as the strongest deterministic proving ground
- semantic integration as the strongest trust and ontology framing
- IP-law as the strongest early domain-transfer signal
- the older `knowledge` slice as proof that execution control, evidence records, and temporal modeling are part of the same architecture

That means future work can now be organized by learning lane rather than by raw feature accumulation.

## Strongly Supported Pattern
The most credible lanes are the ones that strengthen the kernel or the control plane rather than only adding domain-specific surface area.

## Exploratory Direction
The best next explorations are those that answer one of these:
- can the kernel stay trustworthy as ambiguity rises?
- can temporal and contradiction modeling stay comprehensible?
- can retrieval packets stay useful without hiding uncertainty?
- can the control plane keep expensive, long-running AI workflows sane?
- can one semantic core support more than one serious domain?

## Lane 1: Local-First Expert Memory
### Why it matters
A local-first system is the fastest way to learn what a serious expert-memory product feels like in everyday use.

### Main risk
It is easy to optimize for local delight and avoid the harder questions of shared truth, concurrency, and history.

### First experiment
Build a local-first repo expert-memory workflow with:
- incremental graph updates
- retrieval packets for change impact and explanation
- explicit claim and evidence records
- basic temporal correction chain support

### What success would teach
Whether the kernel feels valuable before any cloud or multi-user concerns are introduced.

## Lane 2: Claim And Evidence Architecture
### Why it matters
This lane tests whether `ClaimRecord` really is the right central abstraction.

### Main risk
It is easy to over-model claims before proving which evidence and lifecycle fields matter in practice.

### First experiment
Implement one narrow claim family with:
- mention records
- evidence spans
- claim lifecycle state
- retrieval packet projection
- explicit answer-time validation hooks

### What success would teach
Whether claim-first modeling materially improves trust and explainability.

## Lane 3: Semantic Verification And SHACL
### Why it matters
This lane tests whether semantic validation actually improves trust or just adds ceremony.

### Main risk
You can overfit to formal validation and neglect user workflows.

### First experiment
Pick a narrow claim family and add:
- ontology-backed vocabulary
- SHACL-style validation rules
- retrieval packet annotations explaining pass, warn, or reject outcomes

### What success would teach
Whether semantic rigor is pulling its weight in practice.

## Lane 4: Temporal And Bitemporal Memory
### Why it matters
This is the lane most likely to differentiate a serious expert-memory system from a generic graph or RAG product.

### Main risk
The model can become too heavy too early if every event gets full historical ceremony.

### First experiment
Introduce a minimal multi-time claim model with:
- publishedAt
- ingestedAt
- assertedAt
- derivedAt
- eventTime or effectiveAt
- claim lifecycle state

### What success would teach
Whether users actually benefit from historical posture, not just current-state answers.

## Lane 5: Domain Ontologies
### Why it matters
This lane tests whether the kernel can hold meaning stable while the domain changes.

### Main risk
It is easy to disappear into ontology research without producing a usable product shape.

### First experiment
Use two thin adapters over the same kernel:
- one for repo intelligence
- one for a narrow legal or compliance domain

### What success would teach
Whether the kernel abstractions are truly domain-adaptable or secretly code-specific.

## Lane 6: Hybrid Retrieval
### Why it matters
A graph alone is not enough for many tasks, and vector search alone is not trustworthy enough for expert workflows.

### Main risk
Hybrid retrieval can become a bag of heuristics with no explainability discipline.

### First experiment
Define a retrieval packet builder that combines:
- graph neighborhood selection
- text chunk selection
- evidence ranking
- certainty-aware packing
- optional validation or reasoning traces

### What success would teach
Whether mixed retrieval can remain inspectable and trust-bearing.

## Lane 7: Contradiction Management
### Why it matters
This is the lane that separates `knowledge graph` from `expert memory`. Expert domains are full of competing claims.

### Main risk
A simplistic contradiction model can collapse into either noisy alert spam or hidden overwrites.

### First experiment
Model a narrow contradiction workflow with:
- competing claims
- explicit conflict status
- preferred current claim
- retained historical alternatives
- retrieval packet disclosure of the conflict

### What success would teach
Whether the system can surface disagreement without becoming unusable.

## Lane 8: Control Plane And Execution Trust
### Why it matters
This lane tests whether the architecture can survive real execution pressure from retries, streaming, budgets, and failures.

### Main risk
It is easy to build a semantic system that demos well but fails under reruns, timeouts, and slow clients.

### First experiment
Implement a minimal control plane with:
- stable execution identity and idempotency keys
- durable workflow state
- typed progress events
- partial-result semantics
- per-stage model budgets and timeout controls

### What success would teach
Whether the architecture is becoming a real product runtime rather than just a graph design.

## Lane 9: User-Facing Expert Workflows
### Why it matters
The graph only matters if it supports a concrete expert task.

### Main risk
It is easy to produce beautiful graph structure that has no compelling workflow attached.

### First experiment
Choose one workflow and over-design it on purpose:
- repo change impact brief
- legal position memo skeleton
- investment-policy breach explanation

### What success would teach
What the retrieval packet must actually contain to be useful.

## Lane 10: Grounded Answer Verification
### Why it matters
This lane tests whether the system can do more than retrieve context. It asks whether answers can carry explicit validation posture, citation checks, and reasoning traces.

### Main risk
It is easy to bolt verification onto the end of generation and call it trust without actually grounding the answer path.

### First experiment
Take one retrieval workflow and add:
- citation or source-reference validation
- direct versus inferred answer labeling
- reasoning trace formatting for inferred support
- explicit partial-result disclosure when verification is incomplete

### What success would teach
Whether the expert-memory system can move from `context provider` to `grounded answer substrate`.

## Three Credible Forward Paths
| Path | What it optimizes for |
|---|---|
| `Repo-first kernel hardening` | trust, evidence, temporal discipline, retrieval quality under low ambiguity |
| `Epistemic runtime hardening` | idempotency, workflow state, progress, budgets, and answer verification |
| `Law or wealth as domain stress test` | semantic rigor, authority handling, identity, multi-clock time, contradiction posture |

## Questions That Matter More Than The Next Library Choice
- What is the primary durable abstraction: graph entity, claim, retrieval packet, or execution record?
- Which domain is the best second proving ground after code?
- How much history should be visible by default in answers?
- What level of semantic rigor materially improves trust instead of merely sounding sophisticated?
- Which contradictions should be surfaced immediately versus resolved silently by policy?
- Which control-plane guarantees are non-negotiable even for a local-first product?

## A Useful Next-Move Heuristic
Choose the next lane by asking:
- does it strengthen the semantic kernel?
- does it force better trust boundaries?
- does it clarify temporal or contradiction semantics?
- does it improve the control plane for real execution?
- does it produce a better retrieval packet for a real workflow?

If the answer is no, it is probably interesting research but not the highest-value next move for this repository.

## Questions Worth Keeping Open
- Which lane best balances learning value and implementation tractability in the next quarter?
- Should the first serious product shape be local-first or service-grade?
- Which domain will force the cleanest `ClaimRecord` design?
- Which lane will force the clearest control-plane requirements?
- Where is the right stopping point between exploratory semantic rigor and usable engineering?
