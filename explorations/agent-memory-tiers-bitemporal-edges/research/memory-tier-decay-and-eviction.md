# memory-tier-decay-and-eviction

Scope: four-tier consolidation taxonomy + retention/decay scoring (salience x exponential decay + reinforcement), hot/warm/cold/evictable thresholds, dryRun+audit eviction, working-tier compression/snapshot/restore, and how accessCount/strength attach to CandidateClaim/Evidence.

## Findings

### A. The port source: `rohitg00/agentmemory` (the algorithm we would reimplement)

- **Source + license.** `rohitg00/agentmemory` is **Apache-2.0** (permissive — port with attribution), latest tag **v0.9.27 (2026-06-07)**, a TypeScript MCP server built on the `iii-engine`/`iii-sdk` runtime. It **pins `iii-engine` v0.11.2 and refuses to attach to a different version** (0.11.6+ introduced a new sandbox model requiring an unfinished refactor); runtime deps are `iii-sdk ^0.11.0`, `zod`, Anthropic/OpenAI/Gemini SDKs, and `@xenova/transformers` for local embeddings. <https://github.com/rohitg00/agentmemory> — CAUTION: this is plain TS + Zod + the bespoke `iii-sdk`, **not** Effect/effect-Schema, so DI/Layer/service patterns do not transfer; reimplement the data models in Effect-Schema and reuse only the algorithms/constants below. (Confirms CAPTURE cautions.)

- **`ConsolidationTier` enum (verbatim, `src/types.ts`).** `export type ConsolidationTier = "working" | "episodic" | "semantic" | "procedural";` Semantics: working = raw observations; episodic = compressed session summaries; semantic = extracted facts/patterns; procedural = workflows/decision patterns. <https://github.com/rohitg00/agentmemory> / <https://signalforges.com/pages/rohitg00-agentmemory-best-practices-2026-05-13/>

- **`SemanticMemory` shape (verbatim).** Carries the retention fields that this subtopic must attach to CandidateClaim/Evidence:
  ```ts
  export interface SemanticMemory {
    id: string; fact: string; confidence: number;
    sourceSessionIds: string[]; sourceMemoryIds: string[];
    accessCount: number; lastAccessedAt: string; strength: number;
    createdAt: string; updatedAt: string;
  }
  ```
  `ProceduralMemory` mirrors it with `name/steps/triggerCondition/expectedOutcome/frequency/strength`. <https://raw.githubusercontent.com/rohitg00/agentmemory/main/src/types.ts>

- **The retention scoring formula (verbatim, `src/functions/retention.ts`).** This is the core "salience x exponential temporal decay + reinforcement boost":
  ```ts
  function computeRetention(salience, createdAt, accessTimestamps, config): number {
    const deltaT = (Date.now() - new Date(createdAt).getTime()) / (1000*60*60*24); // days
    const temporalDecay = Math.exp(-config.lambda * deltaT);
    const reinforcementBoost = computeReinforcementBoost(accessTimestamps, config.sigma);
    return Math.min(1, salience * temporalDecay + reinforcementBoost);
  }
  function computeReinforcementBoost(accessTimestamps, sigma): number {
    const now = Date.now(); let boost = 0;
    for (const tAccess of accessTimestamps) {
      if (!Number.isFinite(tAccess)) continue;
      const daysSinceAccess = (now - tAccess) / (1000*60*60*24);
      if (daysSinceAccess > 0) boost += 1 / daysSinceAccess;
    }
    return boost * sigma;
  }
  ```
  <https://raw.githubusercontent.com/rohitg00/agentmemory/main/src/functions/retention.ts>

- **Default decay config + tier thresholds (verbatim).** `DEFAULT_DECAY = { lambda: 0.01, sigma: 0.3, tierThresholds: { hot: 0.7, warm: 0.4, cold: 0.15 } }`. Tier classification: `hot` if `score >= 0.7`; `warm` if `0.4 <= score < 0.7`; `cold` if `0.15 <= score < 0.4`; `evictable` if `score < 0.15`. `RetentionScore` is a separate persisted record: `{ memoryId, source?: "episodic"|"semantic", score, salience, temporalDecay, reinforcementBoost, lastAccessed, accessCount }`. <https://raw.githubusercontent.com/rohitg00/agentmemory/main/src/functions/retention.ts> + <https://raw.githubusercontent.com/rohitg00/agentmemory/main/src/types.ts>

- **Eviction is dryRun-first + batched-audit (verbatim behavior, `mem::retention-evict`).** Accepts `threshold`, `dryRun`, and `maxEvictions` (hard-capped at **1,000** per call). `dryRun` "returns candidates without deletion." A live pass removes memories from **both episodic and semantic** namespaces, deletes the retention scores + access logs, updates search indices, and **records audit entries batched per invocation (not per-candidate)**. <https://raw.githubusercontent.com/rohitg00/agentmemory/main/src/functions/retention.ts>

### B. Parameter math (what the defaults actually imply — load-bearing for choosing tier boundaries)

- **Decay half-life.** With `lambda = 0.01 /day`, `temporalDecay = exp(-0.01 t)`; half-life = `ln2/0.01 ≈ 69.3 days`. This is a *gentle* decay tuned for the semantic tier, not for ephemeral working memory. (Derived from the verbatim formula above.)

- **Time-to-tier for a maximally salient (salience=1.0), never-reaccessed memory** (solve `exp(-0.01 t) = threshold`): crosses out of **hot** at `t = -100·ln(0.7) ≈ 35.7 d`; out of **warm** at `-100·ln(0.4) ≈ 91.6 d`; becomes **evictable** at `-100·ln(0.15) ≈ 189.7 d`. So a top-salience claim survives ~190 days of total silence before eviction. Lower-salience claims fall faster (e.g. salience 0.5 can never reach the 0.7 hot threshold without reinforcement, and is evictable by ~120 d). (Derived; flag for the align stage — if the working tier needs sub-week eviction, `lambda` must be tier-specific, e.g. `lambda≈0.1` → 6.9 d half-life, `lambda≈0.5` → 1.4 d.)

- **The reinforcement boost is recency-dominated and effectively unbounded pre-cap.** `boost = sigma · Σ (1/daysSinceAccess_i)`. A single access **1 day ago** contributes `0.3`; **0.5 d ago** → `0.6`; **2.4 h ago (0.1 d)** → `3.0` (then clipped by `Math.min(1, …)`). Net effect: **any access within roughly the last day forces the memory to the hot tier regardless of salience or age.** The most-recent access dominates the sum; an access at exactly `now` (`daysSinceAccess = 0`) is skipped by the `> 0` guard. (Derived from verbatim formula.) GOTCHA for the port: this conflates "recently touched" with "durably important," and the `1/Δt` singularity makes the score jittery for sub-day accesses — consider clamping `daysSinceAccess` to a floor (e.g. `max(Δt, ε)`) and/or capping per-access boost.

### C. Cross-source verification of the decay/reinforcement design

- **Exponential temporal decay is the consensus shape across LLM-memory systems.** Stanford **Generative Agents** scores retrieval as `score = α_recency·recency + α_importance·importance + α_relevance·relevance`, all `α = 1`, with `recency = 0.995^(hours since last retrieval)` (exponential decay) and importance from a 1–10 LLM "poignancy" prompt, the three normalized to [0,1] by min-max. This is the same salience(=importance) × exponential-decay(recency) shape agentmemory uses, but agentmemory folds *relevance* out (it scores retention, not query-time retrieval) and adds an additive reinforcement term. <https://ar5iv.labs.arxiv.org/html/2304.03442>

- **The reinforcement/strength idea is the Ebbinghaus forgetting-curve port (MemoryBank).** MemoryBank's memory updater uses `R = e^(−t/S)` (R = fraction retained, t = time since learning, S = memory strength). **S is initialized to 1; on recall, `S += 1` and `t` is reset to 0**, so recalled items forget more slowly. The authors call it "an exploratory and highly simplified memory updating model." <https://ar5iv.labs.arxiv.org/html/2305.10250> — DESIGN NOTE: MemoryBank reinforces via a **discrete strength counter that lengthens the decay timescale**, whereas agentmemory reinforces via an **additive recency term**. The agentmemory `SemanticMemory.strength` field exists but the verbatim `computeRetention` does **not** read it (it uses `salience` + `accessTimestamps`), so `strength` is currently vestigial in the scoring path — UNVERIFIED whether another code path consumes it. The MemoryBank `S += 1; t = 0` pattern is the better-grounded way to make `strength`/`accessCount` actually move the decay timescale.

- **ACT-R gives the rigorous cognitive baseline — and it is power-law, not exponential.** ACT-R base-level activation `B_i = ln(Σ_j t_j^(−d))` sums over *every* prior access `t_j` with decay `d` (typical `d ∈ [0.3, 0.7]`, canonical `0.5`). This is a **multi-trace power-law** of forgetting, considered "the most successful and frequently used part of ACT-R." <http://act-r.psy.cmu.edu/wordpress/wp-content/uploads/2021/07/ACTR2021anderson.pdf> / <https://www.researchgate.net/publication/328297415_A_Comparison_of_Approximations_for_Base-Level_Activation_in_ACT-R> — ADVERSARIAL NOTE: aggregate human forgetting fits a **power law** better than a single exponential (Wixted/Ebbesen tradition), so the agentmemory single-`exp(-λΔt)` is a deliberate simplification. ACT-R's `Σ t_j^(−d)` is closer to agentmemory's `Σ 1/Δt_i` reinforcement (which is exactly a power law with `d = 1`) than to its exponential decay term — i.e. agentmemory mixes an exponential base with a `d=1` power-law reinforcement. If fidelity matters, a single ACT-R-style multi-trace term is more principled than the exp + Σ(1/Δt) hybrid.

- **Modern spaced repetition (FSRS) flags a real flaw in the agentmemory reinforcement.** FSRS models each item with Difficulty/Stability/Retrievability, where **Stability = days for recall probability to drop from 100% to 90%**, and its key empirical insight is that **reviewing an item too soon barely strengthens it; reviewing just before forgetting strengthens it a lot** (the spacing effect, an inverted-U over interval). FSRS beats SM-2 by 20–30% fewer reviews at equal retention. <https://deepwiki.com/open-spaced-repetition/fsrs-optimizer/7.3-comparison-with-sm-2> + <https://pmc.ncbi.nlm.nih.gov/articles/PMC5476736/> (spacing effect) — IMPLICATION: agentmemory's `1/daysSinceAccess` boost does the **opposite** of the spacing effect: it rewards sub-day re-touches most. For an agent "hot working-set" signal that's arguably fine (recency = currently-relevant), but for *durable* semantic-tier importance it overweights churn. Recommend separating "hotness" (recency, agentmemory-style) from "durability" (MemoryBank/FSRS-style strength that grows only with well-spaced reinforcement).

### D. Four-tier taxonomy — cognitive grounding

- **The taxonomy maps cleanly onto Tulving + Squire, with one caveat.** Tulving (1972) split declarative long-term memory into **episodic** (events, with temporal+spatial context) vs **semantic** (facts/concepts, context-independent); Squire's brain-systems taxonomy adds **procedural** (non-declarative skills) and treats episodic+semantic as both "declarative." **Working memory** is the Baddeley & Hitch (1974) short-term store, a separate system, not a long-term tier. <https://inpact-psychologyconference.org/wp-content/uploads/2024/07/202401OP003.pdf> + <http://whoville.ucsd.edu/PDFs/384_Squire_%20NeurobiolLearnMem2004.pdf> — CAVEAT: agentmemory's flat four-tier `ConsolidationTier` collapses two orthogonal cognitive axes (working≈short-term store vs episodic/semantic/procedural≈long-term systems) into one enum. The repo's own `standards/memory-architecture/01-memory-layer-taxonomy.md` already encodes a *different* four-LAYER cut (Long-Term durable / Short-Term session / Procedural code-intelligence / Relational conceptual) tied to the No-Escape Theorem — the exploration must reconcile agentmemory's `ConsolidationTier` enum with that binding standard rather than adopt it raw. (In-repo standard, read directly.)

### E. Working-tier compression / snapshot / restore (MemGPT pattern behind research-squad memory_manager)

- **The canonical pattern is MemGPT/Letta virtual-context management.** MemGPT splits **main context** (the bounded prompt: read-only system instructions + a writable working scratchpad + a FIFO queue of recent messages) from **external context** (unbounded recall + archival stores, paged in only via explicit function calls). When the context exceeds a threshold it **evicts the oldest messages, generates a recursive compressed summary, and stores it at the front of the context** — explicitly "analogous to memory consolidation." <https://www.leoniemonigatti.com/blog/memgpt.html> + <https://www.emergentmind.com/topics/memgpt-style-memory-management> — this is the same shape as research-squad's `UtilitySaveResearchContext → MemorySnapshot{query, strategy, key findings, remaining tasks, constraints, completion %}` + `UtilityRestoreFromMemorySnapshot` (CAPTURE research-squad#10): progressive context reduction + snapshot persistence + recovery, triggered near the token limit. RECOMMENDATION: model the working tier as a MemGPT-style FIFO+recursive-summary buffer whose flushed content graduates into the episodic tier (compressed session summaries), exactly matching agentmemory's working→episodic consolidation step.

### F. Synthesis — how accessCount/strength attach to CandidateClaim/Evidence

- **Keep retention metadata OFF the immutable claim/evidence values; put it in a mutable sidecar.** The repo already grounds facts with immutable, provenance-anchored values: `Evidence`/`EvidenceSpan` carry `Confidence = UnitInterval` plus `startChar/endChar/quote` char-span grounding (`packages/epistemic/domain/src/values/EvidenceSpan/EvidenceSpan.model.ts`, per CAPTURE alreadyCovered), and the bitemporal-edge design mandates **never-overwrite / always-version** semantics. `accessCount`, `strength`, `lastAccessedAt`, and the computed `RetentionScore` are **mutable, monotonically-updated counters** — writing them onto `Evidence`/`CandidateClaim` would violate the never-overwrite invariant. Attach them instead to a separate `MemoryRecord`/`RetentionScore` row keyed by `claimId` (mirroring agentmemory's separate `RetentionScore` record, which references `memoryId`, not the fact body). (Synthesis grounded in CAPTURE alreadyCovered + agentmemory `RetentionScore` shape.)
- **Derive `salience` from existing signals rather than inventing it.** agentmemory takes `salience` as an input. Map it from what the epistemic slice already produces: claim/evidence `Confidence` (UnitInterval) × authority weighting from the research-squad `Source` schema (`quality_score 1–10`, `authority_level`, `is_primary_source` — CAPTURE research-squad#8). This keeps "salience" explainable and primary-source-weighted, consistent with the legal-authority preference. (Synthesis.)
- **`sourceMemoryIds`/`sourceSessionIds` align to the existing provenance graph,** not a new store: route them through `@beep/semantic-web` PROV-O + `@beep/provenance` TextAnchor (CAPTURE alreadyCovered) and the bitemporal `sourceObservationIds`. (Synthesis.)

## Sources

- agentmemory repo (license, version, deps, ConsolidationTier, SemanticMemory): <https://github.com/rohitg00/agentmemory>
- agentmemory `src/functions/retention.ts` (computeRetention, computeReinforcementBoost, DEFAULT_DECAY, tier thresholds, evict): <https://raw.githubusercontent.com/rohitg00/agentmemory/main/src/functions/retention.ts>
- agentmemory `src/types.ts` (ConsolidationTier, SemanticMemory, ProceduralMemory, RetentionScore, DecayConfig, GraphEdge): <https://raw.githubusercontent.com/rohitg00/agentmemory/main/src/types.ts>
- agentmemory deep-dive (four-tier semantics, iii-engine pinning): <https://signalforges.com/pages/rohitg00-agentmemory-best-practices-2026-05-13/>
- Generative Agents (recency 0.995 exp decay, importance 1–10, α=1, min-max norm): <https://ar5iv.labs.arxiv.org/html/2304.03442>
- MemoryBank (Ebbinghaus `R=e^(−t/S)`, S init 1, `S+=1`/`t=0` on recall): <https://ar5iv.labs.arxiv.org/html/2305.10250>
- ACT-R base-level activation (power-law `B_i=ln Σ t_j^(−d)`, d≈0.5): <http://act-r.psy.cmu.edu/wordpress/wp-content/uploads/2021/07/ACTR2021anderson.pdf>
- ACT-R approximations / typical d range: <https://www.researchgate.net/publication/328297415_A_Comparison_of_Approximations_for_Base-Level_Activation_in_ACT-R>
- FSRS vs SM-2 (stability/difficulty/retrievability, spacing insight): <https://deepwiki.com/open-spaced-repetition/fsrs-optimizer/7.3-comparison-with-sm-2>
- Spacing effect review (inverted-U, reviewing too soon): <https://pmc.ncbi.nlm.nih.gov/articles/PMC5476736/>
- Memory taxonomy Tulving vs Squire (episodic/semantic/procedural, declarative): <https://inpact-psychologyconference.org/wp-content/uploads/2024/07/202401OP003.pdf>
- Squire memory-systems history (declarative/non-declarative, working memory): <http://whoville.ucsd.edu/PDFs/384_Squire_%20NeurobiolLearnMem2004.pdf>
- MemGPT/Letta virtual context (main vs external context, recursive summary eviction): <https://www.leoniemonigatti.com/blog/memgpt.html>
- MemGPT-style memory management overview: <https://www.emergentmind.com/topics/memgpt-style-memory-management>
- In-repo: `standards/memory-architecture/01-memory-layer-taxonomy.md` (binding four-LAYER taxonomy + No-Escape Theorem) — read directly from working tree.

## Open / Unverified

- **`SemanticMemory.strength` is currently vestigial in scoring (UNVERIFIED).** The verbatim `computeRetention` reads `salience` + `accessTimestamps`, not `strength`. Whether any other agentmemory code path (e.g. consolidation/promotion or a query-time ranker) consumes `strength`/`accessCount` was not confirmed from source; only `retention.ts` and `types.ts` were fetched. Worth a second look before porting `strength` as load-bearing.
- **Exact line numbers drift.** CAPTURE cites `retention.ts:81-95` and `types.ts:494-527`; one secondary source put `ConsolidationTier` at `types.ts:429` and `SemanticMemory` at `types.ts:435-446`. Line numbers are unstable across versions (latest is v0.9.27) — treat them as approximate; the verbatim code blocks above are authoritative.
- **Time unit of MemoryBank `t` (UNVERIFIED).** The paper does not state whether `t` in `R=e^(−t/S)` is hours or days; agentmemory independently chose **days** for both decay and reinforcement. Pick days for the port to match agentmemory and document it.
- **No empirical tuning of `lambda=0.01 / sigma=0.3 / thresholds {0.7,0.4,0.15}` found.** These appear to be hand-picked agentmemory defaults, not benchmark-optimized. The derived time-to-tier numbers (Section B) suggest they suit a slow semantic tier; **a tier-specific `lambda` (faster for working/episodic) is almost certainly needed** but is a design decision, not a sourced fact.
- **PDF extraction of MemoryBank failed via `arxiv.org/pdf/2305.10250`; equations were recovered from the ar5iv HTML mirror instead.** Mirror content matches the published AAAI 2024 version but was not byte-diffed against the official PDF.
- **research-squad `memory_manager.baml` snapshot schema** is from the gold corpus (private), corroborated here only by the public MemGPT/Letta pattern it instantiates; the BAML file itself was not re-read in this research pass.
