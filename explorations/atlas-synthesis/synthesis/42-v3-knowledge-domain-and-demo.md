# 42 — v3 Knowledge Domain, Data & Enron Demo

> Date: 2026-06-17
> Scope: Survey + synthesize the v3 (Effect-v3) knowledge **domain model**, **persistence shape**,
> **client/ui surfaces**, and the **Enron knowledge demo** — then compare the v3 domain to the
> current v4 epistemic domain (`CandidateClaim`/`Evidence`/`Activity`/`UsageRecord`).
>
> **Repo under survey:** `/home/elpresidank/YeeBois/projects/beep-effect4` — the *older* Effect-v3
> codebase (dir name says "4", git log says "archiving main" / "preparing for migration to effect
> v4"). This is **proven prior art in another repo**, NOT current v4 product capability.
>
> **Current product repo:** `/home/elpresidank/YeeBois/projects/beep-effect3` (Effect-v4,
> Prose-to-Proof / BeepGraph IP-law workbench).

## Guardrail (applied throughout)

Three things kept separate:

1. **Reusable KG ENGINE / modeling patterns** — the schema-first entity/value/relation/evidence
   model, the triple shape, the evidence-span provenance pattern, the meeting-prep
   bullet→evidence citation chain. **Portable prior art.**
2. **Learning-vehicle DOMAIN bindings** — Enron email corpus, email threads/messages, meeting
   prep, todox app. This is the *email* domain the user used to **learn** KG engineering; it is
   **not** the IP-law product.
3. **The PRODUCT** — the solo IP-law flywheel (v4 / beep-effect3).

This document inventories v3 paths I actually opened. It does **not** claim any of this is present
v4 capability. The v4 build is a **migration/distillation**, not greenfield — that is the value.

---

## 1. The v3 Knowledge Domain Model (`@beep/knowledge-domain`)

Location: `/home/elpresidank/YeeBois/projects/beep-effect4/packages/knowledge/domain/src`

Structure: `entities/` (22 entity dirs, **19 `.model.ts`**), `values/`, `projections/`,
`services/`, `rpc/`, `errors/` (31 error modules). All schema-first via `@effect/sql/Model`
(`M.Class`), `makeFields(...EntityId, {...})`, `modelKit(Model)`, and `$KnowledgeDomainId`
identity composers — the same `Model.Class` + `$I` annote patterns the v4 repo still uses.

### 1.1 Entity census (entities/ dirs)

| Entity | Role | Bucket |
|---|---|---|
| `Entity` | Extracted KG node (mention + ontology types + attributes + provenance) | **ENGINE** |
| `Relation` | Subject–predicate–object triple w/ evidence | **ENGINE** |
| `Mention` / `MentionRecord` | Surface mention spans of an entity | **ENGINE** |
| `Evidence` / `RelationEvidence` | Source-span provenance for entities/relations | **ENGINE** |
| `EntityCluster` / `SameAsLink` / `MergeHistory` | Entity-resolution: clusters, owl:sameAs links, merge audit | **ENGINE** |
| `Embedding` | Vector embeddings (has own `.values.ts`) | **ENGINE** |
| `Extraction` | An extraction run/job | **ENGINE** |
| `Ontology` / `ClassDefinition` / `PropertyDefinition` | Ontology + class/property schema (the T-Box) | **ENGINE** |
| `GraphRag` | GraphRAG query/context projection | **ENGINE** |
| `Agent` (`KnowledgeAgent`) | Tool-bearing agent (has `.tool.ts`, `.http.ts`) | **ENGINE** |
| `Batch` | Batched extraction job w/ a state machine (`contracts/`: Start/Cancel/GetStatus/StreamProgress) | **ENGINE** |
| `MeetingPrep` / `MeetingPrepBullet` / `MeetingPrepEvidence` | Meeting-prep output bullets + their evidence citations | **LEARNING-VEHICLE app feature** (pattern reusable) |
| `EmailThread` / `EmailThreadMessage` | Email corpus structure | **LEARNING-VEHICLE DOMAIN** |

Each entity dir carries a consistent file fan-out: `.model.ts` (schema), `.repo.ts`
(`DbRepo`-style CRUD + custom queries), `.rpc.ts` / `.http.ts` (transport), `.errors.ts`,
`.tool.ts` (agent tool surface), `contracts/` (per-operation request/result schemas). This is a
**full schema→repo→rpc→tool vertical** per entity — a mature, repeatable pattern, not a sketch.

> Note: `Evidence` and `MeetingPrep` have **no `.model.ts`** — they are RPC/projection-only
> surfaces (`Evidence` = `evidence_List` read contract over Mention/RelationEvidence rows;
> `MeetingPrep` = generation RPC writing `MeetingPrepBullet` + `MeetingPrepEvidence` rows). Hence
> 19 models across 22 entity dirs.

### 1.2 The core triple model (the ENGINE heart)

**`Entity.model.ts`** (`packages/knowledge/domain/src/entities/Entity/Entity.model.ts`) — the
A-Box node:

```text
KnowledgeEntityId, organizationId         (org-scoped / RLS)
mention: NonEmptyString                    "Exact text span extracted from source"
types: NonEmptyArray(String)               ontology class URIs (≥1)
attributes: Attributes                     property→(string|number|boolean) record
ontologyId?, documentId?, sourceUri?       provenance scope
extractionId?                              which run produced it
groundingConfidence?: Confidence(0..1)     "system-verified confidence entity is grounded in source"
mentions?: Array(EvidenceSpan)             text spans where mentioned
```

**`Relation.model.ts`** — the edge / RDF triple (subject–predicate–object):

```text
RelationId, organizationId
subjectId: KnowledgeEntityId               triple subject
predicate: String                          ontology property URI
objectId?: String                          entity ref (object properties)   ─┐ exactly one
literalValue? + literalType?               literal + XSD datatype/lang tag   ─┘ (helpers isLiteralRelation / isEntityRelation)
ontologyId: OntologyId | "default"
extractionId?
evidence?: EvidenceSpanFromStorage         the source span proving the triple
groundingConfidence?: Confidence(0..1)
```

This is a literal **RDF triple store modeled in Effect Schema**, org-scoped, with
**per-triple evidence + grounding confidence** baked in — i.e. provenance-first from day one.

### 1.3 Values (`values/`) — the reusable vocabulary

- **`EvidenceSpan.value.ts`** — the load-bearing provenance primitive:
  `{ text, startChar: NonNegativeInt, endChar: NonNegativeInt, confidence?: 0..1 }`, plus
  `EvidenceSpanFromStorage` (a `S.Union` decoding legacy JSON-string and plain-text payloads back
  into spans — a real backward-compat migration seam).
- **`Attributes.value.ts`** — `Record<string, string|number|boolean>` (literal attrs) +
  `Confidence` (0..1 with an arbitrary for property tests).
- Ontology/RDF/reasoning/sparql value modules: `ClassIri`, `ShaclPolicy`, `ValidationReport`,
  `RelationDirection`, `MergeParams`, `EntityCandidate`, plus `rdf/`, `reasoning/`, `sparql/`
  subdirs and `BatchMachine.schema.ts` (state machine), `TokenBudget`, `ExtractionConfig`,
  `ExtractionProgress`.
- `projections/` — `GraphRagQueryResult.ts` (read-model for GraphRAG answers).
- `services/` — `EntityRegistry`, `IncrementalClusterer`, `MergeHistory`, `Split` (entity-res).

**Modeling patterns worth porting to v4:** the `EvidenceSpan` char-offset provenance primitive;
the entity/triple split with `groundingConfidence` on both; the `*FromStorage` legacy-union
decode pattern; the per-entity model→repo→rpc→tool fan-out; the bullet→evidence citation chain
(§3.3).

---

## 2. The Persistence Shape (`@beep/knowledge-tables`)

Location: `/home/elpresidank/YeeBois/projects/beep-effect4/packages/knowledge/tables/src/tables`
— **21 Drizzle pg tables**, all via `OrgTable.make(EntityId)(...)` (org-scoped w/ RLS-aligned
indexes). Tables mirror the domain models 1:1 plus the workflow/batch machinery:

```text
entity, relation, mention, mention-record, relation-evidence,
entity-cluster, same-as-link, merge-history,
embedding, extraction,
ontology, class-definition, property-definition,
email-thread, email-thread-message,
meeting-prep-bullet, meeting-prep-evidence,
batch-execution, workflow-execution, workflow-activity, workflow-signal
```

`entity.table.ts`: `mention text`, `types jsonb`, `attributes jsonb`, `grounding_confidence
real`, `mentions jsonb`, FK-ish `ontology_id/document_id/extraction_id text`, indexed on org +
ontology + document + extraction.

`relation.table.ts`: `subject_id/predicate/object_id/literal_value/literal_type`, `evidence
jsonb`, `grounding_confidence real`, and crucially a **`relation_triple_idx` on
(subject, predicate, object)** — a real triple-pattern lookup index. Embeddings as JSONB/vector,
extraction + batch + workflow tables give durable run state.

The presence of `workflow-execution / workflow-activity / workflow-signal` tables confirms the
extraction pipeline ran on a **durable workflow engine** (matches the v4 in-tree Workflow notes
in MEMORY: DurableActivity/DurableDeferred persisted to SqlClient), not fire-and-forget.

---

## 3. Client / UI Surfaces

### 3.1 `@beep/knowledge-client` and `@beep/knowledge-ui` are **EMPTY STUBS**

`packages/knowledge/client/src/index.ts` and `packages/knowledge/ui/src/index.ts` contain only
package docblocks and `// Export ... here` placeholders. **No client SDK or UI components live in
those packages.** (UNVERIFIED whether they were ever populated; at the surveyed commit they are
empty.) The real surfaces live in the **app**, not in shared packages — see §3.2.

### 3.2 The actual UI: `apps/todox/src/app/knowledge-demo`

This is where the demo surface lives — a substantial Next.js client route, **~18 components**:

```text
KnowledgeDemoClientPage.tsx, page.tsx, actions.ts, rpc-client.ts, constants.ts, types.ts
data/{scenarios.ts, sample-emails.ts}
components/: EntityCardList, EntityDetailDrawer, RelationTable, ClusterList,
  SameAsLinkTable, EntityResolutionPanel, GraphRAGQueryPanel, QueryConfigForm,
  QueryInput, QueryResultDisplay, ResultsTabs, SourceTextPanel, EmailInputPanel,
  EmptyState, ErrorAlert, Skeletons, DemoCallout, DemoHint
```

`rpc-client.ts` wires a **real Atom RPC client** (`@effect-atom/atom-react`,
`@effect/rpc/RpcClient` over `BrowserSocket`) against the merged knowledge RPC group:
`Batch ⊕ Entity ⊕ GraphRag ⊕ Evidence ⊕ MeetingPrep` (relation rows surface via Entity/GraphRag,
not a separate `Relation.Rpcs` merge), hitting endpoint
`/v1/knowledge/rpc`. So the UI talks to the live server runtime — entity cards, relation tables,
entity-resolution (clusters + sameAs), GraphRAG query panel, source-span/evidence inspection, and
meeting-prep panels were all real, RPC-backed surfaces.

### 3.3 Meeting-prep evidence chain (the citation pattern)

`MeetingPrepBullet.model.ts` = immutable bullet output `{ meetingPrepId, bulletIndex, text }`
(D-10, "immutable output for auditability"). `MeetingPrepEvidence.model.ts` resolves each bullet
to provenance via a `SourceType` discriminator `"mention" | "relation" | "document_span"` plus
optional `mentionId / relationEvidenceId / documentId+documentVersionId + startChar/endChar/text`
and `confidence` — annotated *"resolving to version-pinned spans (C-05)"*. **Every meeting-prep
bullet is traceable to a version-pinned source span.** This is the same "no claim without
evidence" discipline the v4 product calls *retrieval proposes / logic proves*.

---

## 4. The Enron Knowledge Demo — what it proved, on what data

Two complementary specs under `specs/pending/`:

### 4.1 `enron-data-pipeline` — corpus → pipeline ingestion

`specs/pending/enron-data-pipeline/README.md`: build a CLI (`bun run repo-cli enron`) in
`tooling/cli` that (1) downloads/caches the **Enron CMU corpus** from S3
(`arn:aws:s3:::static.vaultctx.com`), (2) parses RFC-2822 emails into TodoX document models,
(3) curates a high-value subset, (4) feeds them through extraction, (5) validates **end-to-end:
raw email → knowledge graph → meeting prep**. The CLI exists:
`tooling/cli/src/commands/enron/` = `s3-client, parser, thread-reconstructor, thread-scorer,
curator, document-bridge, extraction-harness, cache, schemas, test-ontology.ttl`. Stated motive
(in README): Enron is the realistic corpus to validate the pipeline **"before generating
synthetic wealth-management data"** — i.e. email/Enron was explicitly the **learning vehicle**,
the wealth-mgmt domain a later synthetic target. Neither is the IP-law product.

### 4.2 `enron-knowledge-demo-integration` — replace mocks with real RPC

`specs/pending/enron-knowledge-demo-integration/README.md`: upgrade
`apps/todox/src/app/knowledge-demo` from hardcoded mock entities/relations to **real
Enron-backed extraction, GraphRAG, and LLM meeting prep over runtime RPC**. Target flow:

```text
1. select curated scenario
2. ingest/extract into org-scoped persistence (cap 25 docs/scenario)
3. browse real entities/relations + GraphRAG context
4. generate live LLM-backed meeting prep
5. inspect evidence references by source spans (Evidence.List)
```

Locked: curated dataset only, explicit "Ingest Scenario" action, org-scoped + RLS,
**live LLM meeting prep** (not template IDs), RPC endpoint `/v1/knowledge/rpc` (NDJSON), gated by
`ENABLE_ENRON_KNOWLEDGE_DEMO`. Default ontology: `tooling/cli/.../enron/test-ontology.ttl`.

`data/scenarios.ts` contains **real curated Enron threads** (deterministic, ordered): e.g.
`scenario-1` "Re: Senator Joe Dunn's Conference Call" (querySeed "Joe Dunn"), `scenario-2`
"Re: Duke Exchange Deal" (financial/deal), `scenario-3` "SCE Legislative Language" (org-role
change) — each with real `thread:<sha>` / `email:<sha>` ids, participant/message counts, and a
rationale. So the demo ran over **real Enron email content**, curated into deterministic
scenarios.

### 4.3 Did it run end-to-end?

**Yes — strong evidence it did, and was reviewed 5.0/5.** Git log on the v3 repo:
`460f4d5757 finished demo`, `f5d243ec63 finished demo`,
`62192c5075 saving workflow progress for demo`, merged via
`1bb601af66 Merge PR #49 from kriegcloud/enron-knowledge-demo-integration`.
The spec `outputs/spec-review.md` grades it **Overall Grade 5.0/5 – Excellent** (Complexity
Critical/70) with all rubric checks PASS. `outputs/phase-2.5-validation.md` cites concrete server
files proving the batch ingest lifecycle (deterministic `batch_start`, status-discoverable batch
ids, infra-vs-NotFound error distinction, retry idempotency keyed on `retryOwner/retryAttempt`,
persistence regression tests). `outputs/` also has real telemetry artifacts
(`beep-client-traces.csv`, `beep-server-grafana-logs.json`) — i.e. the flow was actually executed
and observed, not just spec'd.

**What it proved end-to-end (on real Enron email data):**
curated email thread → durable batch extraction (org-scoped, ≤25 docs) → persisted KG
(entities + triples + evidence) → entity resolution (clusters/sameAs) → GraphRAG query/context →
**live LLM meeting-prep bullets, each cited back to version-pinned source spans** via
`Evidence.List`. That is the *entire* retrieval-proposes / provenance-grounded loop the v4 IP-law
product wants — demonstrated, in another repo, on the email learning corpus.

> Caveat: both specs sit in `specs/pending/` (not `completed/`). The "finished demo" commits +
> 5.0/5 review + telemetry indicate it ran and merged; the `pending` location may reflect
> spec-lifecycle bookkeeping rather than incompleteness. Marked **UNVERIFIED** whether every
> success-criterion checkbox was ticked vs. demo-grade "good enough".

---

## 5. v3 domain vs. v4 epistemic domain — redesign or distillation?

Current v4 epistemic domain:
`/home/elpresidank/YeeBois/projects/beep-effect3/packages/epistemic/domain/src` — entities
`CandidateClaim`, `Evidence`, `Activity`, `UsageRecord`; value `ClaimLifecycle`. Built on
`BaseEntity.Class` + `EntitySchema.persist.*` + `Epistemic.*Id` (a newer base-entity factory than
v3's `M.Class`+`makeFields`).

**The v4 epistemic domain is a radical DISTILLATION (and partly a fixture scaffold), not a port:**

| Concern | v3 `@beep/knowledge-domain` | v4 `@beep/epistemic-domain` |
|---|---|---|
| Claim/assertion | `Entity` + `Relation` (typed triple, attributes, types[]) | `CandidateClaim` = `{ fixtureKey, lifecycle: "candidate", snapshot: UnknownRecord }` |
| Evidence | `EvidenceSpan` `{text,startChar,endChar,confidence}` + `RelationEvidence` rows | `Evidence` = `{ artifactFixtureKey, spanFixtureKey }` (string refs, **no char offsets**) |
| Lifecycle | implicit (extraction → cluster → merge → grounding confidence) | explicit `ClaimLifecycle = LiteralKit(["candidate"])` — **one state only so far** |
| Provenance/runtime | Extraction/Batch/Workflow entities | `Activity` = `{ fixtureKey, snapshot }` ("provenance activity produced by the runtime proof") |
| Cost/usage | (none in domain) | `UsageRecord` — rich model/provider/token/cost/latency attribution linked to `Activity` (+ `TurnFinalizationUsageAppend`) |

Reading:

- **v4 distills v3's sprawling 19-model KG into ~4 epistemic primitives.** The v3 *richness*
  (typed triples, ontology T-Box, clustering, sameAs, GraphRAG projections) is **deliberately
  not yet present** in the v4 epistemic domain — confirming the ATLAS "all-spec-no-code middle /
  capability-rich, product-poor" finding for the *current* repo.
- The v4 entities are **fixture-keyed snapshots** (`fixtureKey`, `snapshot: UnknownRecord`) — a
  thin, deliberately under-specified scaffold standing in for the real shape, with the
  *vocabulary* (Claim / Evidence / Activity / span) carried forward but the *structure*
  collapsed to opaque JSON for now.
- **What v4 ADDS that v3 lacked:** `UsageRecord` (model/provider/token/cost/latency attribution
  tied to a provenance `Activity`) and an explicit `ClaimLifecycle`. These are *epistemic
  accounting* primitives — the "logic proves / who-did-what-at-what-cost" spine — that the v3 KG
  engine never modeled at the domain level.
- **What v4 will need to re-derive from v3:** the `EvidenceSpan` char-offset provenance
  primitive (v4's `Evidence` is currently just two string refs), the entity/triple A-Box, the
  ontology/T-Box, entity resolution, GraphRAG projections, and the bullet→evidence citation
  chain. All of that is **proven in v3** and de-risks the v4 build.

**Verdict:** v4 epistemic is a *redesign by distillation* — same provenance-first philosophy
(Claim + Evidence + provenance Activity), newer base-entity machinery, plus genuinely new
usage/cost accounting — but it has **shed** the v3 engine's richness and currently stands as a
fixture scaffold. The v3 knowledge slice is the **reference implementation** the v4 epistemic
domain can grow back toward (migration, not greenfield), with Enron/email swapped out for IP-law
as the domain binding.

---

## Confidence & Caveats

- **High confidence** (directly read): v3 domain `Entity`/`Relation`/`EvidenceSpan`/`Attributes`/
  `MeetingPrepBullet`/`MeetingPrepEvidence` models; the 21 Drizzle tables incl.
  `relation_triple_idx` and workflow tables; `knowledge/client` + `knowledge/ui` being **empty
  stubs**; the ~18-component todox `knowledge-demo` route with a real Atom RPC client; both Enron
  specs' READMEs; the demo's 5.0/5 `spec-review.md`, `phase-2.5-validation.md`, and telemetry
  outputs; the v4 epistemic `CandidateClaim/Evidence/Activity/UsageRecord/ClaimLifecycle` models.
- **Medium confidence:** that the demo ran *fully* end-to-end vs. demo-grade. Evidence (git
  "finished demo", 5.0/5 review, grafana/trace artifacts, real Enron scenario data) strongly
  supports it; but specs sit in `specs/pending/` and I did **not** execute anything (read-only,
  no builds), so I cannot independently confirm a live run. Marked UNVERIFIED above.
- **Not exhaustively read:** the v3 `server/` slice (Extraction/EntityResolution/Grounding/Rdf/
  Reasoning/Sparql/GraphRAG/Ontology/Nlp/Embedding/LlmControl) — covered by sibling synthesis
  docs; here I only confirmed server files cited by the demo validation artifacts. The 47KB
  `specs/KNOWLEDGE_LESSONS_LEARNED.md` was only skimmed (RDF/SPARQL/reasoning lessons).
- **Guardrail reaffirmed:** Enron/email + meeting-prep + todox = **learning-vehicle domain**, not
  product. The **modeling patterns** (evidence-span provenance, typed triples, grounding
  confidence, bullet→evidence citation, durable extraction workflow) are the **reusable** prior
  art. None of this is present v4 (beep-effect3) capability — it is proven prior art in the v3
  repo that **de-risks** the v4 epistemic build.
- **Repo-name caution:** the *older v3* code is under the directory `beep-effect4`; the *current
  v4 product* is under `beep-effect3`. All v3 paths above are absolute and rooted at
  `/home/elpresidank/YeeBois/projects/beep-effect4`.

### Verification (2026-06-17)

Adversarial read-only re-check of every cited v3 path. No builds/executions run.

**Confirmed exactly as stated:**
- v3 repo at `beep-effect4`; git HEAD `997a827454 archiving main`; demo commits
  `460f4d5757`/`f5d243ec63 finished demo`, `62192c5075`, merged via PR #49
  (`1bb601af66`); data-pipeline merged via PR #47 (`7dd68e685a`).
- Domain: **22 entity dirs, 19 `.model.ts`** (verified). `Evidence/` and `MeetingPrep/`
  have NO `.model.ts` (only `.rpc/.http/.tool/contracts`) — the doc's "19 across 22" note holds.
- Tables: **21 `.table.ts`**; `relation_triple_idx` is literally
  `pg.index("relation_triple_idx").on(t.subjectId, t.predicate, t.objectId)`; all 4
  workflow/batch tables present.
- `EvidenceSpan.value.ts` fields exact: `text/startChar(NonNegativeInt)/endChar/confidence?`,
  plus `EvidenceSpanFromPlainText` transform (the `*FromStorage` legacy seam).
- `knowledge/client` + `knowledge/ui` index.ts are docblock-only stubs (verified verbatim).
- todox `knowledge-demo`: 18 `.tsx` components + `index.ts`; real Atom RPC client
  (`@effect-atom/atom-react`, `@effect/rpc/RpcClient`, `@effect/platform-browser/BrowserSocket`).
- Enron specs + `outputs/` (incl. `spec-review.md` graded **5.0/5 – Excellent**, Complexity
  Critical 70; `phase-2.5-validation.md`; `beep-client-traces.csv`; `beep-server-grafana-logs.json`).
- CLI `tooling/cli/src/commands/enron/` files present (incl. `test-ontology.ttl`).
- `scenarios.ts`: real `thread:<sha>`/`email:<sha>` ids, scenario-1 querySeed "Joe Dunn".
- v4 epistemic domain: `CandidateClaim` (`ClaimLifecycle`+`UnknownRecord` snapshot),
  `Evidence` = `artifactFixtureKey`/`spanFixtureKey` (string refs, **no char offsets** — confirmed),
  `ClaimLifecycle = LiteralKit(["candidate"])` (single state), `Activity`, `UsageRecord`.

**Corrected:**
- §3.2 RPC merge group originally listed `Relation` as a merged RPC. Actual `rpc-client.ts`
  merges only `Batch ⊕ Entity ⊕ GraphRag ⊕ Evidence ⊕ MeetingPrep` (no `Relation.Rpcs`). Fixed.

**Minor (not corrected, within tolerance):** doc says "~18 components"; literal count is 18 `.tsx`
+ an `index.ts` barrel. Scenario file has **4** curated scenarios (doc names 1–3 as examples);
scenario-3 querySeed is actually "Rod Wright" (doc only attributed "Joe Dunn" to scenario-1, which
is correct, and characterized SCE as org-role change — matches its rationale "shifting political
ownership and decision authority").

**Remaining doubt (unchanged):** specs sit in `specs/pending/` not `completed/`; "finished demo" +
5.0/5 + telemetry strongly imply a real end-to-end run, but I executed nothing — the live-run claim
stays MEDIUM confidence / UNVERIFIED, as the doc already states.

**Guardrail holds:** ENGINE (triples, EvidenceSpan, clustering, GraphRAG, ontology) cleanly
separated from learning-vehicle DOMAIN (Enron/email/meeting-prep/todox); v3 consistently framed as
prior art in another repo, never as present v4 capability.
