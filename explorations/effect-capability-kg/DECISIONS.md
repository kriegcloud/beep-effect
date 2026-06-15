# Decisions

## 2026-06-15 — packet identity

**Question:** What is the exploration slug and title?

**Answer:** Use `effect-capability-kg` / "Effect Capability KG".

**Rationale:** The name is short, focused on Effect capability guidance rather
than general repo memory, and leaves room for later implementation goals.

## 2026-06-15 — architecture ownership

**Question:** Which architecture family owns the meaning?

**Answer:** `tooling` first.

**Rationale:** The work is developer-operational guidance for coding agents and
repo quality. It is not product behavior, shared-kernel product language, or an
external driver. Rejected alternatives: `agents` as an architecture family
(superseded doctrine), `shared` (not product language), and `foundation` (too
generic before a tooling proof exists).

## 2026-06-15 — first success surface

**Question:** Should v1 enforce usage or advise first?

**Answer:** Advisory pipeline first.

**Rationale:** The current risk is false positives: good modules are underused,
but we do not yet know which call sites should be blocked. Advisory findings can
cite deterministic KG evidence and collect misses before promotion into Fallow,
docgen quality, or other ratcheted gates.

## 2026-06-15 — run depth

**Question:** How far should this packet be run now?

**Answer:** Run capture, research, and align; stop before `BRIEF.md` and
`MAP.md`.

**Rationale:** The idea needed grounding and branch-closing decisions before a
Shape Up brief. Drafting goal packets now would pretend the ontology, routing,
and enforcement surfaces are implementation-ready.

## 2026-06-15 — seed corpus

**Question:** What corpus should prove the first slice?

**Answer:** Seed wedge: `Combiner`, `Reducer`, and `Filter`, plus adjacent
helpers in `Option`, `Struct`, `Array`, `Record`, `Number`, `String`, and
`Boolean`.

**Rationale:** These modules are rich enough to exercise capability
relationships, "when to use" prose, category tags, examples, and usage gaps
without boiling the full Effect ocean.

## 2026-06-15 — relation to repo-codegraph-jsdoc

**Question:** Should this replace or extend `goals/repo-codegraph-jsdoc`?

**Answer:** Treat it as a focused child/provenance-linked exploration.

**Rationale:** `repo-codegraph-jsdoc` is broad prior art. This packet narrows to
Effect v4 capability guidance, JSDoc-derived graph shape, specialist profiles,
judge routing, and hook backpressure.

## 2026-06-15 — ontology role

**Question:** Should the ontology be a full authority layer?

**Answer:** Use a bounded classifier.

**Rationale:** Ontology helps explain and classify Effect capabilities, but
deterministic source facts remain authority. Rejected alternative: ontology as
the source of truth, which would violate memory doctrine and over-model before
the seed wedge.

## 2026-06-15 — ontology bootstrap

**Question:** How should the ontology avoid the chicken-and-egg problem?

**Answer:** Kernel then expand.

**Rationale:** Start with a tiny upper-aligned kernel, ingest deterministic
facts, classify them, and use unclassified or misclassified facts to drive the
next ontology revision. Do not design a comprehensive UFO-derived ontology up
front.

## 2026-06-15 — JSDoc dialects

**Question:** How should Effect v4 JSDoc and this repo's JSDoc law relate?

**Answer:** Dual dialect.

**Rationale:** Effect v4 JSDoc is upstream capability evidence: top-level module
docs, exported-symbol docs, `@category`, `@since`, `@see`, `**When to use**`,
`**Details**`, and titled examples. This repo's JSDoc law is the local
normalization/agent-context overlay: required export tags, custom tags, category
normalization, docgen quality, and hook/agent context lifting.

## 2026-06-15 — agent integration lane

**Question:** Should integration begin as runtime-specific hooks/sub-agents?

**Answer:** CLI/context first.

**Rationale:** Repo-owned guidance artifacts and advisory commands are more
stable than Codex/Claude runtime config. Runtime-specific hooks and sub-agents
can be generated or configured later from stable contracts.

## 2026-06-15 — enforcement model

**Question:** How should usage be enforced over time?

**Answer:** Graduated ratchet.

**Rationale:** Start advisory, log false positives/false negatives, then
promote proven patterns into Fallow/docgen quality/reuse gates only when the KG
evidence is strong enough.

## 2026-06-15 — sub-agent shape

**Question:** What is the first sub-agent deliverable?

**Answer:** Profiles first, not concrete harness-native agents.

**Rationale:** A specialist profile can define corpus scope, evidence contract,
query recipes, and response shape without committing to a single agent runtime.
Concrete Codex/Claude/other configs can be generated later.

## 2026-06-15 — hook backpressure point

**Question:** Where should hook backpressure happen first?

**Answer:** Pre-write verify.

**Rationale:** Inspect proposed code/diff before write or commit, query the KG,
and return structured advisory findings with evidence. This is safer than
blocking prompts or editing generated code blindly.

## 2026-06-15 — specialist partition

**Question:** How broad should the first specialist taxonomy be?

**Answer:** One high-quality seed specialist for the seed wedge.

**Rationale:** A broad section taxonomy is premature. One specialist profile for
Combiner/Reducer/Filter exercises the judge, KG evidence, and hook finding shape
with low blast radius.

## 2026-06-15 — judge/router model

**Question:** How should the correct specialist be chosen?

**Answer:** Hybrid router.

**Rationale:** Use deterministic KG/query classification first, then an LLM
tie-breaker only when evidence is ambiguous. The router must return evidence,
confidence, and a reason for selecting or declining a specialist.

## 2026-06-15 — KG authority sources

**Question:** Which facts can the KG treat as authoritative?

**Answer:** Deterministic facts: AST declarations, type signatures, import/export
edges, source spans, JSDoc tags/sections, examples, repo export catalog entries,
and observed call sites.

**Rationale:** Ontology classifications, embeddings, and LLM summaries are
derived or candidate facts until backed by deterministic evidence. This follows
the repo memory architecture.

## 2026-06-15 — conceptual node and edge vocabulary

**Question:** What graph vocabulary should the shape stage start from?

**Answer:** Start with `EffectModule`, `CapabilitySymbol`, `DocSection`,
`UsageScenario`, `ExampleCase`, `CategoryRole`, `SeeAlsoRelation`,
`SpecialistProfile`, `JudgeRoutingDecision`, and `HookFinding`.

**Rationale:** These nodes map directly to deterministic Effect v4 JSDoc and
repo-agent surfaces. Initial edges: `defines`, `hasCategory`, `introducedIn`,
`hasWhenToUse`, `hasDetails`, `demonstratedBy`, `seeAlso`, `imports`,
`composesWith`, `routesToSpecialist`, and `citesCapabilityEvidence`.

## 2026-06-15 — deferred implementation questions

**Question:** Which questions are deferred rather than unresolved?

**Answer:** Defer graph storage choice, final ontology formalism, exact CLI/API
names, generated sub-agent config format, hook JSON/TOML shape, hard-enforcement
thresholds, and goal-packet decomposition.

**Rationale:** These depend on the next `shape` and `decompose` stages. They are
not blocking the exploration's current research/alignment run.

## 2026-06-15 — decompose checkpoint

**Question:** Should the packet move from shaped brief into goal decomposition?

**Answer:** Yes. Draft `MAP.md`, choose the first vertical slice, and preserve
the explicit pause before any `./goals` packets are created.

**Rationale:** The brief is strong enough to name concrete candidate goals, but
the owner has asked to stop before graduation/scaffolding. Decomposition should
therefore prepare the goal map without creating goal packet files.
