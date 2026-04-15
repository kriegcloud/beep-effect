# Decision Log

Dated decision log for the memory architecture standard. Records decisions as they are made so the team can trace the evolution of thinking.

---

## 2026-04-15: Memory Architecture Standard Established

**Context:** After extensive exploration of agent memory systems -- including knowledge graphs (Graphiti, TrustGraph), SaaS solutions (Supermemory, Greptile, FalkorDB), research papers ("The Price of Meaning", arXiv:2603.27116), and multiple internal specs (expert-memory-big-picture, repo-codegraph-jsdoc, repo-expert-memory-local-first-v0) -- the project had accumulated too many open threads without clear prioritization. The "AI Knowledge Base" wave triggered by Andrej Karpathy's X post amplified the noise.

**Decision:** Establish a foundational memory architecture standard in `standards/memory-architecture/` that:
1. Codifies the mathematical constraints from the No-Escape Theorem as governing principles
2. Defines a four-layer memory taxonomy (long-term, short-term, procedural, relational) with concrete architectures per layer
3. Triages all open memory-related threads with clear go/no-go/pause verdicts
4. Assesses the external SaaS landscape with clear use/learn/ignore verdicts

**Rationale:**
- The No-Escape Theorem proves that semantic memory systems degrade at scale -- this is mathematical, not a bug. The project's deterministic-first approach (AST-derived code intelligence) is one of the few approaches that escapes this theorem entirely.
- The project's Graphiti deployment confirmed the theorem's predictions -- degrading effectiveness at scale.
- Too many open threads were diluting focus from the strongest asset (repo-memory v0).
- A standards document (not another spec) was needed to close doors, not open them.

**Consequences:**
- repo-memory v0 is confirmed as Priority 1. All other memory work is subordinate.
- Supermemory is dropped. Graphiti is demoted to bounded session memory.
- BeepGraph scope is narrowed to provenance/verification layers only.
- TrustGraph TS port is frozen as reference-only.
- Future memory architecture decisions must reference this standard and the No-Escape Theorem constraints.

---

## 2026-04-15: Deterministic-First as Core Competitive Advantage

**Context:** The repo-codegraph-jsdoc research compiled evidence from 29 papers showing that deterministic code graph approaches outperform semantic search for code intelligence (32.8% improvement from RepoGraph, 36.36% pass@1 from KG-CodeGen).

**Decision:** Deterministic code intelligence (AST + type-checker + JSDoc, certainty layers 1.0 and 0.85-0.95) is the project's primary competitive advantage and must be prioritized over semantic/LLM-inferred approaches.

**Rationale:** The No-Escape Theorem proves that AST-derived facts operate outside the theorem class -- they use exact symbolic records, not semantic proximity. This means deterministic code intelligence will never degrade at scale, while every semantic approach will. This is not a preference -- it is a mathematical guarantee.

**Consequences:**
- repo-memory v0's deterministic query classes are the highest-value deliverable.
- LLM-inferred knowledge (Layer 3 certainty 0.6-0.85) is supplementary, not foundational.
- Any future memory feature must first ask: "Can this be answered deterministically?" If yes, it belongs in the deterministic layer, not the semantic layer.

---

## 2026-04-15: Semantic Memory = Managed Cache, Not Source of Truth

**Context:** User experience with Graphiti confirmed the No-Escape Theorem's predictions -- semantic memory degrades as it scales. The X community's "LLM Knowledge Base" wave is building systems the paper proves will degrade.

**Decision:** All semantic memory layers (Graphiti, embeddings, LLM-inferred knowledge) are treated as managed caches with bounded lifetimes, not as sources of truth.

**Rationale:** The paper's key finding: compression via clustering (2,500 clusters) achieved b=0.163 with 92.8% accuracy -- the best Pareto point. Interference management (consolidation, pruning, temporal windowing) is required, not optional. The OpenClaw Dreaming pipeline's three-phase consolidation model is the most thoughtful approach in the landscape.

**Consequences:**
- Graphiti may only be used for session-scoped memory with temporal bounds.
- A consolidation pipeline (inspired by OpenClaw Dreaming) is required before expanding semantic memory scope.
- Provenance verification (from TrustGraph/BeepGraph) is required for any semantic fact promoted to durable storage.
- No semantic memory system is deployed without monitoring for competitor density and retrieval degradation.

---

_Future decisions should be appended above this line in the same format._
