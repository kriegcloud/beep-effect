Absolutely — the cleanest way to make this ontology-agnostic is to treat your system as a platform for “time-indexed claims + provenance + inference deltas”, where the domain ontology is a plug-in / pack that the platform can load, introspect, and render.

Below is a fleshed-out architecture that explicitly separates:
	•	Platform infrastructure & code architecture (works for any ontology),
	•	Ontology/domain work (Seattle mayor is just one pack),
	•	And the contracts between them (so you can ticket it cleanly).

⸻

1) Separation of concerns: Platform vs Ontology Pack

Platform responsibilities (domain-agnostic)

These are the things your system should do without knowing anything about “mayors”:

A. Timeline primitives
	•	Represent documents, batches, claims, assertions, derived assertions, rule runs, conflicts, curation decisions
	•	Provide bitemporal timestamps:
	•	publishedAt (document)
	•	ingestedAt (system)
	•	eventTime (if known)
	•	assertedAt / derivedAt (KB update time)

B. Evidence & provenance
	•	For every claim/triple: store:
	•	source doc
	•	evidence spans (offsets / quote / selector)
	•	pipeline version, confidence, entity linking decisions
	•	Provide a uniform “Why?” / explain interface (even if implementation varies by reasoner)

C. Change computation (“knowledge commits”)
	•	For each batch/run:
	•	what was added/removed/changed (asserted)
	•	what new inferences appeared (derived)
	•	what conflicts were introduced/resolved

D. Generic ontology rendering
	•	Display any RDF/OWL graph as:
	•	triples view
	•	entity profile view
	•	neighborhood graph
	•	schema browser (classes/properties)
	•	Use introspection (labels, domains/ranges, class hierarchy) for a “generic mode”

E. Pack loading + configuration
	•	Load domain ontology (OWL files, SHACL shapes, rules)
	•	Load optional “rendering config” (templates, event grouping heuristics, UI facets)
	•	Keep this configurable, not hard-coded.

⸻

Ontology pack responsibilities (domain-specific)

The “Seattle Mayor Pack” is an example of this, but you could have any pack.

A. The ontology itself (TBox)
	•	classes, properties, constraints
	•	imported vocabularies if desired
	•	competency questions (as tests)

B. Rules / constraints (optional)
	•	SHACL rules or OWL RL rules or custom rules
	•	Any domain logic (“If role is DeputyMayor, infer AdministrationMember”)

C. Mapping / “semantic adapter” (optional)

Even if extraction is done, you often need mapping:
	•	which extracted relations become which ontology properties
	•	how to construct event nodes (AppointmentEvent vs simple triple)
	•	what to do when multiple sources disagree

D. Rendering & grouping config (optional but huge UX win)
	•	“This pattern of triples is an Appointment event”
	•	“Render it like: {Mayor} appointed {Person} as {Role}”
	•	“These predicates are important facets”

⸻

2) A domain-neutral core model: treat facts as “Claims” + “Assertions”

If you want one decision that makes everything easier later, it’s this:

Don’t store “truth” first — store claims with provenance

News produces claims. Your KB later decides what’s “accepted” or “current”.

Platform meta-model (works for any ontology)

You keep a platform graph (or platform tables) that is not Seattle-specific:
	•	Document
	•	metadata: publisher, url, publishedAt, author
	•	full text + offsets
	•	Mention
	•	span offsets + surface form
	•	linked entity (or candidates)
	•	Claim
	•	createdFrom: Document
	•	claimType (optional: Appointment, BudgetAction…)
	•	confidence
	•	evidence spans
	•	Assertion
	•	“a statement this claim asserts”
	•	references one or more RDF triples (or a small RDF subgraph)
	•	DerivedAssertion
	•	producedBy: RuleRun
	•	supports: Assertions/DerivedAssertions
	•	RuleRun
	•	ruleset version hash
	•	startedAt/endedAt
	•	scope (delta vs backfill)
	•	CurationDecision (optional)
	•	accepted/rejected/needs-review
	•	appliedTo Claim or Assertion

Why this separation is gold
	•	Your domain ontology stays focused on describing the world.
	•	Your platform model focuses on “how we learned it, when, from where, with what confidence.”

⸻

3) Storage architecture: keep “platform metadata” separate from “domain triples”

A clean separation pattern that scales across ontologies:

Storage layers
	1.	Document Store
	•	raw docs + extracted text
	•	typical: object store (S3/GCS) + metadata in Postgres
	2.	Platform Metadata DB
	•	Documents, Claims, Evidence spans, BatchRuns, RuleRuns, Curation
	•	typical: Postgres (strong indexing + transactional writes)
	3.	Knowledge Store (RDF)
	•	domain ontology + instance data (triples)
	•	plus inferred triples (separate graph)
	•	triple store of your choice
	4.	Search Index (optional but recommended)
	•	full-text doc search
	•	entity lookup (“typeahead”)
	•	OpenSearch/Elastic-style

This gives you:
	•	fast timeline queries (Postgres)
	•	rich semantics queries (SPARQL)
	•	fast keyword search (search index)

If you try to do everything inside only RDF, the “timeline feed” queries can get painful and slow (especially with evidence spans and UI pagination).

⸻

4) Event sourcing: model ingestion as “fact deltas” (ontology-agnostic)

You’re basically building an event-sourced system for semantic updates.

Canonical internal event stream

Every batch produces a sequence of normalized events like:
	•	DocumentIngested(docId, publishedAt, ingestedAt, source…)
	•	ClaimCreated(claimId, docId, confidence, claimType?)
	•	AssertionAdded(assertionId, triples[], claimId)
	•	InferenceProduced(derivedAssertionId, triples[], ruleRunId, supports[])
	•	ConflictDetected(conflictId, competingAssertionIds[])
	•	RuleSetUpdated(ruleSetVersionId, diffSummary)
	•	BackfillCompleted(ruleRunId, newInferencesCount, ...)

This is the abstraction that lets you build a timeline UI once and reuse it everywhere.

⸻

5) Pipeline architecture: where ontology work plugs in without contaminating the platform

Here’s the “separation” pipeline end-to-end (the center boxes are ontology-agnostic; the rightmost are pack-specific):

        ┌─────────────────┐
        │ Document fetch  │  (RSS, webhooks, uploads)
        └────────┬────────┘
                 │
                 v
        ┌─────────────────┐
        │ Doc normalization│  (dedupe, canonical url, timestamps)
        └────────┬────────┘
                 │
                 v
        ┌──────────────────────────┐
        │ Extraction Adapter        │  (your pipeline output in a standard JSON)
        │ - entities, spans         │
        │ - candidate relations     │
        └────────┬─────────────────┘
                 │
                 v
        ┌──────────────────────────┐
        │ Claim Builder (platform)  │  <-- still ontology-agnostic
        │ - make Claim objects      │
        │ - attach evidence spans   │
        └────────┬─────────────────┘
                 │
                 v
        ┌──────────────────────────┐
        │ Semantic Mapper (pack)    │  <-- ontology pack plugin point
        │ - map to ontology IRIs    │
        │ - build event subgraphs   │
        │ - apply constraints       │
        └────────┬─────────────────┘
                 │
                 v
        ┌──────────────────────────┐
        │ Assertion Writer (platform)│
        │ - write triples to KG     │
        │ - link assertion <-> claim│
        └────────┬─────────────────┘
                 │
                 v
        ┌──────────────────────────┐
        │ Reasoning Service (pack-ish)│
        │ - apply rules/reasoner    │
        │ - produce DerivedAssertions│
        └────────┬─────────────────┘
                 │
                 v
        ┌──────────────────────────┐
        │ Delta/Timeline Indexer    │
        │ - batch summary           │
        │ - per-entity timeline idx │
        └──────────────────────────┘

Key point: the platform never “knows” what a Mayor is — it knows what a Claim and an Assertion are.

⸻

6) How to make the UI ontology-agnostic but still “nice” for any domain

You want two modes:

Mode 1: Generic mode (no pack config required)

This is how the platform works with any ontology on day 1:
	•	Entity chip = show rdfs:label (fallback to localname)
	•	Triple rows = subject/predicate/object with icons based on RDF type:
	•	IRI vs literal vs blank node
	•	Simple grouping:
	•	“Facts from this document” = all assertions tied to claims from that doc
	•	Graph neighborhood:
	•	render N-hop neighbors around an entity
	•	Timeline:
	•	show claims grouped by doc and ingestion time

This makes the platform universally usable.

Mode 2: Curated mode (pack provides rendering/grouping)

Domain packs can optionally provide:
	•	Event grouping rules
	•	e.g. “RoleAssignmentEvent has properties person+role+org”
	•	Natural language templates
	•	“{announcer} appointed {person} as {role}”
	•	Facet definitions
	•	“Show these predicates as filters”
	•	Important class list
	•	“Show Persons, Orgs, Roles in summary bar”

The UI reads this config and becomes “Wikipedia-like” and polished without hard-coding mayor-specific logic.

⸻

7) “Ontology pack” as a first-class artifact (portable across domains)

Treat each domain as a pack with this structure:

packs/
  seattle-mayor/
    ontology/
      tbox.owl
      shapes.shacl
    rules/
      rules.ttl
    mapping/
      mapping.ts   (or mapping.yaml)
    ui/
      render.yaml  (templates, event grouping)
      facets.yaml
    tests/
      competency-queries.sparql
      golden-docs/
        doc1.json + expected-assertions.ttl

Pack API contract (very important)

Define a stable interface like:
	•	mapExtractionToClaims(extractionJson, context) -> ClaimGraph
	•	groupAssertions(claimGraph) -> EventGroups
	•	renderEvent(eventGroup) -> {title, summary, slots, triples[]}
	•	getFacets() -> facet definitions
	•	getRules() -> rule set
	•	getCompetencyTests() -> SPARQL tests

This lets engineering build “the system” while ontology folks build packs.

⸻

8) Backend code architecture (TypeScript-first, web-native)

Here’s a clean way to architect the code so the separation stays real.

Suggested repo layout (monorepo)

/packages
  /platform-core
    /types        (Document, Claim, Assertion, BatchRun...)
    /storage      (postgres, object store, search)
    /kg           (sparql client, graph writer, named graph mgmt)
    /delta        (diff engine, batch summary)
    /plugins      (pack loader, interfaces)
  /api
    (REST/GraphQL endpoints: timeline, entity, doc, explain)
  /reasoning
    (reasoner adapters: owlrl/shacl/jena/etc.)
  /ui
    /components   (Timeline, DocViewer, TripleInspector...)
    /state        (query params, caching, selection model)
    /pack-runtime (reads pack render.yaml + templates)
  /packs
    /seattle-mayor
    /another-domain

Backend service boundaries

You can run as one service initially, but keep modules distinct:
	•	Doc Service
	•	doc ingest, storage, retrieval, highlighting
	•	Claim/Assertion Service
	•	stores claims, assertions, evidence
	•	KG Service
	•	writes triples, reads entity profiles, schema introspection
	•	Reasoning Service
	•	triggers reasoning, stores derived assertions + explanations
	•	Timeline Service
	•	produces feed pages + batch summaries

Even as one deployable Node service, this structure prevents domain logic from leaking.

⸻

9) KG graph partitioning strategy (keeps things explainable and reversible)

To support “incremental reasoning timeline” and backfills cleanly, use named graphs:
	•	graph:domain/asserted/current
	•	graph:domain/asserted/batch/{batchId} (optional if you want snapshots)
	•	graph:domain/inferred/current
	•	graph:domain/inferred/ruleRun/{ruleRunId}
	•	graph:platform/meta (docs/claims/runs metadata if you store some in RDF)
	•	graph:domain/ontology (TBox)

Why partition inferred triples

When a ruleset updates:
	•	you can compute new inferences without overwriting prior runs
	•	you can show “RuleRun X created these derived facts”
	•	you can “garbage collect” older inferred graphs when safe

⸻

10) Work ticket structure that enforces separation

If you want to prevent “Seattle mayor logic” creeping into the platform, ticket it like this:

Platform epics (ontology-agnostic)
	1.	Core domain-neutral timeline model
	2.	Doc viewer + evidence highlighting
	3.	Claim/Assertion storage + API
	4.	KG adapter (SPARQL read/write, schema introspection)
	5.	Reasoner adapter interface + explanation contract
	6.	Timeline feed + diff/batch summaries
	7.	Generic rendering mode
	8.	Pack loading system

Ontology pack epics (domain-specific)

A) Seattle Mayor ontology modeling + constraints
B) Seattle mapping adapter (extraction → ontology IRIs)
C) Seattle rendering templates + facets
D) Seattle competency tests + golden docs

The key is: a pack should be buildable/releasable without modifying platform-core.

⸻

11) What “incremental reasoning in a timeline” looks like in the platform model

This is the part you explicitly care about; here’s how to keep it generic:

Rule changes are first-class timeline events

When a new ruleset is deployed:
	•	create RuleSetVersion(ruleSetId, hash, deployedAt)
	•	create RuleRun(ruleSetVersion, scope=[delta|backfill], startedAt…)

Then the timeline can show:
	•	“Rules updated → backfill produced 238 new inferences”

Derived facts appear as “DerivedAssertion” objects

A derived assertion stores:
	•	triples produced
	•	ruleRunId
	•	supports[] = links to the assertions that triggered it
	•	derivedAt

So the UI can show:
	•	✅ asserted: from doc
	•	✳️ inferred: from rule run
	•	“Why?” graph: rule + supports + source docs

This works no matter what the domain ontology is.

⸻

12) Minimal “pack config” you’ll want (to avoid hard-coding)

Even a tiny config layer makes the UI dramatically better.

Example render.yaml (domain pack)

eventGrouping:
  - name: RoleAssignmentEvent
    requiredPredicates:
      - ex:person
      - ex:role
    groupBy: ["ex:person", "ex:role"]

renderTemplates:
  - match:
      type: ex:RoleAssignmentEvent
    title: "{announcer} announced staff role"
    summary: "{person} → {role}"
    slots:
      announcer: { path: "ex:announcer" }
      person:    { path: "ex:person" }
      role:      { path: "ex:role" }

The platform UI reads this and renders “nice” cards.
Without it, it still works (generic mode), just less polished.

⸻

13) A practical decision guide (so you don’t overfit to Seattle)

If you want “works for any ontology” in practice, design for these invariants:

Invariant 1: Everything starts as a claim tied to a document.
Invariant 2: Every displayed fact has evidence + provenance.
Invariant 3: Time is multi-dimensional (published/ingested/event/derived).
Invariant 4: Reasoning is a producer of “new knowledge events,” not just “background compute.”
Invariant 5: Packs are the only place domain semantics live (mapping/rules/templates).

If you enforce these five, the system stays general.

⸻

If you want, next I can produce:
	•	A concrete API contract (JSON shapes) for: timeline feed, doc detail, entity profile, explain endpoint.
	•	A component architecture for the UI that supports cross-highlighting without coupling (selection model, shared store).
	•	A “generic to curated” roadmap: what must be built in platform vs what can be deferred into packs.

Tell me what you’re using for the knowledge store (or if that’s still open), and I’ll tailor the storage/graph partitioning recommendations to that reality.
