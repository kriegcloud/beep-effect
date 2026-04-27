# Memory Architecture Standard

This is a foundational architectural standard for this monorepo, alongside `effect-first-development.md` and `effect-laws-v1.md`. It governs all memory-related design, implementation, and evaluation work. It is not another exploration. It is a decision record that constrains and directs. If a proposed memory feature contradicts this document, the proposal must change or this document must be formally amended.

## Core Thesis

Different memory problems require different architectures, and mathematical constraints govern which approaches can work at scale. The No-Escape Theorem (from "The Price of Meaning: Why Every Semantic Memory System Forgets", arXiv:2603.27116) proves that any system organizing information by conceptual relatedness will degrade as it scales. Interference, forgetting, and false recall are mathematical consequences of finite-dimensional semantic spaces, not implementation bugs to be fixed with better embeddings or smarter retrieval. The only escape routes are: (a) exact episodic or symbolic records that do not rely on semantic proximity, (b) external symbolic verifiers that can detect and correct drift, or (c) infinite effective dimensionality, which is impossible in practice.

This means the project's deterministic-first approach -- AST-derived code facts stored at certainty=1.0, provenance-tracked, schema-validated -- is mathematically immune to the degradation that plagues every semantic memory system. Every SaaS vendor, every embedding-based knowledge graph, every LLM-inferred fact store will hit the interference wall. Deterministic code intelligence will not. This is the competitive advantage. Lean into it.

The practical consequence: stop evaluating semantic memory products as potential foundations. They are useful as managed caches over a deterministic substrate, never as sources of truth. The search is over.

## The Three Imperatives

### 1. Finish repo-memory v0

Deterministic code intelligence escapes the No-Escape Theorem entirely. AST extraction, type resolution, dependency graphs, and call-site analysis produce facts that are either correct or not -- there is no semantic drift, no interference, no graceful degradation into hallucination. The P0 gaps in `repo-expert-memory-local-first-v0` are "finish and harden." This is the diamond. Everything else is decoration until this works.

### 2. Treat semantic layers as managed caches, not sources of truth

Graphiti, vector embeddings, LLM-inferred knowledge graphs, and conversational memory will degrade. The theorem guarantees it. This does not make them useless -- it makes them caches. Design them with explicit interference management: consolidation windows, provenance-gated pruning, TTL-based compression, and hard ceiling policies on node/edge counts. Budget for degradation management, not elimination. Every semantic fact must trace back to a deterministic source or carry an explicit uncertainty marker.

### 3. Port only what repo-memory v0 needs from TrustGraph/BeepGraph

The provenance and verification layers in TrustGraph provide the "external symbolic verifier" escape route the paper identifies. They are valuable. But TrustGraph is 15+ services, and porting all of them is a multi-quarter distraction. Port the provenance model, the verification primitives, and the graph storage layer. Leave the rest until repo-memory v0 is running and the next bottleneck is identified.

## Document Index

| Document | Purpose |
|---|---|
| `00-no-escape-theorem.md` | Mathematical constraints that govern all memory architecture decisions |
| `01-memory-layer-taxonomy.md` | Four memory layers, their escape routes, and concrete architectures |
| `02-thread-triage.md` | Go/no-go decisions on every open memory-related thread |
| `03-saas-landscape-assessment.md` | Condensed evaluations of external solutions (closed, not ongoing) |
| `04-decision-log.md` | Dated decision entries as the architecture evolves |

## Relationship to Other Standards

| Standard | Relationship |
|---|---|
| `standards/effect-first-development.md` | Effect patterns govern all memory service implementation |
| `standards/effect-laws-v1.md` | Effect laws constrain all memory service code |
| `initiatives/repo-architecture-automation/` | Current architecture automation path; the pre-automation memory packets live only in git history and the archive branch |

## Anti-Goals

- This is **not** another SaaS evaluation. The landscape is assessed in `03-saas-landscape-assessment.md` and that assessment is closed.
- This is **not** a research compilation. The relevant research is distilled into `00-no-escape-theorem.md` and the thesis above.
- This is **not** a "someday maybe" exploration. Every section contains closed decisions or explicit next actions.
- This **is** a set of closed decisions that reduce the search space so building can begin.
