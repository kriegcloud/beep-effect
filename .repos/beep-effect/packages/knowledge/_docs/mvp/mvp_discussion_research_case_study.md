Below is a “use-it-as-a-spec” version of your Seattle mayor timeline case study. I’m going to make it concrete enough that you can turn it directly into epics / stories / tickets, while still keeping it as a reusable template for other civic domains.

I’ll anchor a few example entries to real, public transition documents (so the case study feels grounded), and I’ll keep anything beyond that as clearly hypothetical.

⸻

Case study: Seattle mayor administration knowledge timeline

Why this case is perfect for ontology + timeline UX

Seattle mayor politics generates high-frequency, high-ambiguity updates:
• “Appointments” / staffing announcements (roles, effective dates, reporting structure)
• “Policy intents” (plans, promises, initiatives)
• “Council interactions” (votes, confirmations, amendments)
• “Departments” / agencies / boards & commissions (org structure, governance)
• “Conflicts” (two sources disagree, corrections, walk-backs)

It’s exactly the kind of domain where:
• You want human-readable narrative (what happened),
• But also want machine-readable structure (who/what/when/where + provenance),
• And where “new knowledge” is a stream of asserted facts + inferred facts.

Real-world anchoring (for the narrative)
• Katie Wilson is described as Seattle’s next mayor (mayor-elect), after defeating incumbent Bruce Harrell in the Nov. 4, 2025 election. ￼
• The City’s official “Mayor-Elect” site includes transition content and links to announcements (e.g., senior staff announcements). ￼
• A City of Seattle transition press release dated Dec 3, 2025 announces a “Senior Staff Team,” listing names + roles (Chief of Staff, Deputy Mayor, etc.). ￼

Those documents are perfect “seed documents” for an MVP because they’re structured, name-rich, and clearly about appointments/roles.

⸻

The product vision as a single sentence

A web app where each day’s documents appear on a timeline, aligned with the facts (triples) and derived facts (rules/inference) extracted from those documents—so a user can read the news, see what the system believed, and watch the knowledge graph evolve.

⸻

The core UX: dual-lane timeline (documents ⇄ facts), plus drill-down

Layout (matches your left-docs/right-triples mental model)

Think of a vertically scrolling timeline (like Slack/Notion activity feed), but with two aligned lanes:

┌─────────────────────────────────────────────────────────────────────┐
│ Filters: [date] [source] [entity] [predicate] [asserted/inferred] │
│ [confidence] [rule fired] [only conflicts] [only curated] │
├─────────────── Documents Lane ───────────────┬────── Facts Lane ─────┤
│ [Doc card] Dec 3, 2025 │ [Fact group card] │
│ Seattle.gov press release │ “Wilson announced...” │
│ - title, publisher, author, url │ + 7 RoleAssignments │
│ - snippet + open full text │ + (inferred) 14 facts │
│ - entity highlights in text │ expand: triples + why │
│ │ │
│ [Doc card] Nov 14, 2025 │ [Fact group card] │
│ Cascade PBS article │ “Wilson will be next…”│
│ ... │ triples + evidence │
└─────────────────────────────────────────────────────────────────────┘

What “alignment” means

Each document card has timestamps:
• publishedAt (publisher timestamp)
• ingestedAt (your system’s ingestion time)

Each fact/triple has timestamps:
• assertedAt (when the system added it)
• derivedAt (when inferred)
• optionally eventTime (when the underlying real-world event occurred, if extracted)

In the UI you can:
• Sort the timeline by publishedAt or ingestedAt or eventTime (this becomes a big deal later; more on that under “bitemporal”).

The key interaction (your “text → triple in order” requirement)

When a user opens a document card:
• The document viewer highlights entities inline (e.g., Katie Wilson, Brian Surratt, Chief of Staff).
• Hovering a highlighted span shows:
• resolved entity IRI (or “unresolved candidate”)
• types (Person, Role, Organization…)
• confidence + alias/NER evidence

Then:
• A “Facts extracted from this document” panel lists triples in the order they appear in the text, grouped by event/claim.
• Clicking a triple highlights the supporting text span(s) in the document viewer.

This is the “Wikipedia vibe,” but with provenance + structured deltas + reasoning.

⸻

Make the timeline feel like “knowledge commits”

A surprisingly useful framing is: each daily ingestion batch is a commit.

Each commit has:
• batchId (e.g., batch/2025-12-03)
• counts: docs ingested, entities created, asserted triples added, inferred triples added, conflicts detected
• hashes: content checksum for each doc, pipeline version

In the timeline UI, each day can show a collapsible “Batch Summary” node:
• Batch 2025-12-03
• 12 docs ingested
• +31 asserted facts
• +84 inferred facts
• 2 conflicts introduced
• ruleset v12.4 applied

This is what makes the system operationally usable—it’s not just “pretty,” it’s auditable.

⸻

Concrete mini-scenario: Dec 3 staff announcement becomes “facts + events”

Use the Dec 3, 2025 City press release as a canonical example.

The press release states Mayor-elect Katie Wilson announced a senior staff team and lists:
• Kate Brunette Kreuzer — Chief of Staff
• Jen Chan — Director of Departments
• Seferiana Day Hasegawa — Director of Communications
• Alex Gallo-Brown — Director of Community Relations
• Aly Pennucci — Director of City Budget Office
• Brian Surratt — Deputy Mayor
• Nicole Vallestero Soper — Director of Policy and Innovation ￼

How to model this (so the timeline UI is natural)

Recommended pattern: “event as first-class node” (n-ary relationship)
Instead of trying to encode everything as direct triples on the person, you create an AnnouncementEvent (or RoleAssignmentEvent). This gives you a clean “timeline object.”

Example (conceptual RDF, not exact syntax):
• :event/2025-12-03/senior-staff-announcement a :StaffAnnouncementEvent
• :announcer :KatieWilson
• :announcedAt "2025-12-03"
• prov:wasDerivedFrom :doc/seattle-gov/pr-2025-12-03
• :includesRoleAssignment :ra1, :ra2, ...

Each role assignment is its own node:
• :ra1 a :RoleAssignment
• :person :KateBrunetteKreuzer
• :role :ChiefOfStaff
• :forAdministration :Administration/KatieWilson
• :announcedIn :event/2025-12-03/...
• :effectiveDate (if known / extracted)

This structure makes it trivial to:
• render a timeline card (“Senior staff announced”),
• render details (“7 role assignments”),
• support reasoning (“role implies worksFor MayorOffice”).

Optional: materialize “convenience triples” for fast querying
From each RoleAssignment, you might also assert or infer:
• :KateBrunetteKreuzer :holdsRole :ChiefOfStaff
• :KateBrunetteKreuzer :memberOf :Administration/KatieWilson

In the UI you can show:
• asserted facts (from extraction)
• inferred facts (from rules)

⸻

Provenance design: “every fact is inspectable”

Your UI concept depends on a strong provenance model.

For each extracted fact (or role assignment), store:
• prov:wasDerivedFrom → Document IRI
• Evidence pointers → exact quote and/or char offsets
• Extraction metadata:
• pipeline version (model + rules)
• confidence score
• entity linking confidence
• normalization decisions (which IRI chosen)

Practical representation options

You have two clean implementation paths: 1. RDF-star for triple-level provenance (very ergonomic for “triple viewer”)

    •	You can annotate a triple with provenance and evidence.
    •	Great for UI that shows a triple and then expands “why.”

    2.	Claim / Assertion nodes (more verbose, but handles conflicts cleanly)

    •	Create :Claim123 objects that “assert” one or more triples.
    •	Multiple docs can make conflicting claims without overwriting each other.

Given you’re doing news, I’d strongly lean toward Claim nodes because:
• you will get contradictions,
• you’ll get updates/corrections,
• you’ll want “curated accepted fact” vs “reported claim.”

In the UI, that maps to:
• Fact card defaults to “claims”
• Optional toggle: “show only curated/accepted facts”

⸻

Timeline semantics: you probably need bitemporal thinking

News has at least two clocks: 1. World time: when the event happened (appointment date, vote date) 2. Knowledge time: when your system learned it (ingested/published date)

If you don’t model this explicitly, your timeline gets confusing fast.

Recommendation

Every Event or Claim should carry:
• eventTime (if extractable)
• publishedAt (doc)
• ingestedAt (system)
• assertedAt / derivedAt (KB commit time)

UX-wise:
• Default timeline sort = publishedAt (feels like “news feed”)
• Toggle = eventTime (“what happened when”)
• Debug mode = assertedAt/derivedAt (“what did the system do when”)

⸻

Incremental reasoning: how to make “new inference” visible (and not misleading)

You explicitly want to visualize:
• new triples
• new rules
• incremental reasoning
• new fact generation

The trap: a derived fact might not be “new in the world,” it’s “newly derived.”

UI pattern that avoids confusion

Add a “Reasoning Events” lane (could be a sublane on the facts side):
• ✅ “Asserted facts” (from documents)
• ✳️ “Derived facts” (from rules)
• 🧩 “Rule deployed/updated”
• 🔁 “Backfill reasoning run” (rule change causes new inferences on old data)

Example:
• Dec 03: Asserted “Wilson announced senior staff list”
• Dec 03: Derived “Each named person is a SeniorStaffMember”
• Dec 10: Rule v13 deployed (“Deputy Mayor implies ExecutiveOfficeMember”)
• Dec 10: Backfill run derives 30 facts from older documents

In the UI, derived facts should always show:
• which rule fired
• what supporting facts triggered it
• the timestamps of those supporting facts

This is where an “Explain” button becomes a core feature, not a nice-to-have.

⸻

Entity-centric drill-down (necessary once the feed gets busy)

A timeline is great, but users will quickly ask:
• “Show me everything about Brian Surratt”
• “All changes affecting Transportation & Environment”
• “Everything related to the City Budget Office”

So every entity needs a “profile page” with:
• Summary (types, labels, aliases)
• Current roles and org membership
• Timeline of facts involving that entity
• Source list (docs that mention it)
• Conflicts about it (if any)
• Graph neighborhood (“show me connected entities”)

This keeps the timeline from becoming the only navigation mode.

⸻

Competency questions → UI requirements → ontology shape

Here’s a tight set of competency questions that map directly to tickets.

A. Administration / staffing
• Who is the mayor / mayor-elect at time T? ￼
• What senior staff has been announced, by role, with sources? ￼
• For a given person, what role(s) do they hold, and when did that become known?

UI: filter by RoleAssignment events, show “people roster,” show sources.

B. Departments & governance
• What departments exist and who leads them?
• What boards/commissions exist and who sits on them?

UI: org chart view + timeline of changes.

C. Policy initiatives and actions
• What initiatives did the mayor announce?
• What budget actions happened, and what entities were impacted?

UI: Event taxonomy + “initiative timeline.”

D. Trust & provenance
• For any displayed fact, what document(s) support it?
• What exact text spans are evidence?
• What is the extraction confidence?

UI: evidence highlighting + provenance panel + confidence indicators.

E. Reasoning behavior
• Which inferred facts were produced today?
• Which rule produced them and why?
• What changed because we updated a rule?

UI: “derived facts feed” + rule explorer + backfill run entries.

⸻

A very usable “MVP → V1 → V2” build path

MVP (get the timeline working end-to-end)

Goal: “Docs on left, facts on right, aligned by time; click shows text spans ↔ triples.”
• ingest docs daily
• store docs + extracted entities + extracted triples
• show timeline of docs + extracted facts
• provenance: document-level + text span evidence
• basic filters: date/source/entity/asserted vs inferred (even if inferred is stubbed)

V1 (make it robust and explainable)
• introduce Claim objects (support conflicts)
• integrate reasoner outputs (derived facts)
• explanations: show which rule + supporting facts
• entity profile pages

V2 (make it operational + scalable)
• batch/commit diff view (“what changed today?”)
• bitemporal sorting
• rule versioning + backfill timeline events
• curation workflow (“accept/reject claim”)

⸻

Work tickets you can directly paste into a tracker

I’ll write these as epics → stories with acceptance criteria. (Adjust naming to your internal conventions.)

Epic 1 — Core data model for timeline knowledge

1.1 Define canonical IDs for Document, Batch, Claim, Event, Assertion
• AC: Given a document, system can assign stable docId; given a batch run, stable batchId; given an extracted fact, stable claimId and assertionId.

1.2 Implement bitemporal fields
• AC: Every Claim/Event stores publishedAt, ingestedAt; and supports optional eventTime. API can sort by any of these.

1.3 Choose provenance representation strategy (Claim nodes vs RDF-star vs hybrid)
• AC: Architecture decision doc + example serialization + UI contract for “show me evidence and source.”

⸻

Epic 2 — Provenance + evidence (text ⇄ triple traceability)

2.1 Store document text + normalized text offsets
• AC: API can return exact substring evidence for a given extraction with stable offsets.

2.2 Evidence model for each extracted triple (or claim)
• AC: For any fact shown in UI, user can click “Evidence” and see highlighted text span(s) in the document.

2.3 Provenance panel component
• AC: Fact detail view shows: source doc(s), publisher, author (if known), publishedAt, ingestedAt, extractor version, confidence.

⸻

Epic 3 — Timeline API

3.1 Timeline feed endpoint
• AC: Supports query parameters: date range, sort key (publishedAt|eventTime|ingestedAt), entity filter, source filter, asserted/inferred filter.

3.2 “Facts from document” endpoint
• AC: Given docId, returns extracted facts grouped by event/claim, ordered by appearance in document.

3.3 “Diff for batch” endpoint
• AC: Given batchId, returns counts + added/removed facts, added entities, inferred facts, conflicts.

⸻

Epic 4 — Timeline UI skeleton (documents lane + facts lane)

4.1 Two-lane timeline layout
• AC: Timeline renders document cards on left and fact-group cards on right aligned on the same time axis.

4.2 Expand/collapse behavior
• AC: Clicking a document card expands to show snippet + entity highlights + “facts from this doc.”
• AC: Clicking a fact card expands to show human-readable statement + triples + provenance.

4.3 Timeline filters
• AC: Filters update URL params and can be shared/bookmarked.

⸻

Epic 5 — Document viewer with entity highlighting

5.1 Inline entity highlight renderer
• AC: Entities appear highlighted in the document text; hover shows tooltip with entity label/type/confidence.

5.2 Click-to-focus entity
• AC: Clicking an entity opens entity side panel and highlights facts involving that entity.

5.3 Evidence cross-highlighting
• AC: Clicking a triple highlights the supporting text span(s). Clicking a span highlights related triple(s).

⸻

Epic 6 — Fact viewer: human-readable + triple view

6.1 Natural-language rendering templates
• AC: For top predicates/events (appointment, announcement, confirmation), UI shows a readable sentence generated from ontology labels.

6.2 Triple inspector
• AC: Each fact can be expanded to show triples (subject/predicate/object) + types + IRIs.

6.3 Group facts by event
• AC: Staff announcement shows as a single “event” with multiple RoleAssignments (not 7 totally separate cards).

⸻

Epic 7 — Inference + rules visualization

7.1 Display inferred facts in timeline
• AC: Inferred facts are visually distinct (badge, icon, styling) and are filterable.

7.2 Explanation view (“why is this inferred?”)
• AC: For an inferred fact, system shows: rule id/name, supporting facts, and source documents for supporting facts.

7.3 Rule explorer page
• AC: List rules with version, last run, count of inferences produced in last batch.

⸻

Epic 8 — Batch/commit UX (operationalize ingestion)

8.1 Daily batch summary nodes in timeline
• AC: Each day shows an expandable summary: docs ingested, new facts, inferred facts, conflicts, pipeline version.

8.2 Batch detail page
• AC: Dedicated view showing diff + links to impacted entities + top sources.

⸻

Epic 9 — Conflicts & corrections (news reality)

9.1 Conflict detection heuristic
• AC: If two claims assert incompatible role occupancy for the same time window, conflict is flagged.

9.2 Conflict UI
• AC: Conflict card shows competing claims, sources, timestamps, and confidence.

9.3 Curation actions (optional for V2)
• AC: Curator can mark a claim “accepted/rejected/needs review,” and UI can filter to accepted facts.

⸻

Epic 10 — Entity profile pages (escape hatch from timeline overload)

10.1 Entity summary view
• AC: Shows types, aliases, key relationships, current roles.

10.2 Entity timeline
• AC: Shows all events/facts involving entity, with filters.

10.3 Neighborhood graph mini-view
• AC: Renders a small graph around the entity (top N connections), clickable into details.

⸻

A “golden path” demo you can build toward (end-to-end)

If you need a crisp demo scenario for stakeholders, this is a strong one: 1. Timeline shows:

    •	Nov 14, 2025: news article indicates Wilson will be next mayor  ￼
    •	Dec 3, 2025: official press release announcing senior staff team  ￼

    2.	User clicks Dec 3 press release document card:

    •	sees highlighted names + roles
    •	sees extracted RoleAssignment events in order
    •	expands one assignment and sees triples + evidence span

    3.	User toggles “show inferred facts”:

    •	sees membership in “Wilson Administration” derived
    •	opens “Why?” and sees the rule + supporting facts

That single flow proves:
• ingestion
• provenance
• ontology alignment
• timeline alignment
• incremental reasoning visibility

⸻

One extra detail that will make your system feel “inevitable”

Add a “What changed today?” header that is always visible on the timeline (like GitHub PR summary):
• Today
• +7 role assignments
• +1 new administration entity
• +14 inferred memberships
• 0 conflicts

This turns the timeline into a daily briefing tool—not just a visualization.

⸻

If you want, I can take this one level further into:
• a proposed ontology slice for “appointments + staff + departments” (classes/properties + examples),
• and a UI spec with component boundaries (React components, state shape, API contracts),
so you can hand it straight to engineering/design.
