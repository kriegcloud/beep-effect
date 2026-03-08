# Provenance and Evidence

## Purpose

Define the provenance backbone, evidence-anchoring policy, bounded projection strategy, and lifecycle time posture for `@beep/semantic-web`.

## Evidence Basis

### Source-grounded facts

- [`packages/common/schema/src/internal/ProvO/ProvO.ts`](../../../packages/common/schema/src/internal/ProvO/ProvO.ts) already models `Entity`, `Activity`, `Agent`, `SoftwareAgent`, `Plan`, `PrimarySource`, `Quotation`, and `Revision`.
- [Assessment of W3C PROV-O for Provenance in an Expert-Memory System.md](../../expert-memory-big-picture/research/Assessment%20of%20W3C%20PROV-O%20for%20Provenance%20in%20an%20Expert-Memory%20System.md) explicitly recommends a small stable PROV profile, Web Annotation-compatible evidence anchoring, bounded provenance projections, and explicit lifecycle time fields.

### Assumptions

- The package should define reusable provenance and evidence values even when the operational storage model outside this package is not “RDF everywhere”.
- Evidence anchors must be usable without forcing every caller to commit to Web Annotation as their only persisted operational model.

## Decision 1: Minimal Stable PROV Profile In v1

### Required core profile

- `prov:Entity`
- `prov:Activity`
- `prov:Agent`
- `prov:SoftwareAgent`
- `prov:used`
- `prov:wasGeneratedBy`
- `prov:wasAssociatedWith`
- `prov:startedAtTime`
- `prov:endedAtTime`

### Early extension tier

- `prov:hadPrimarySource`
- `prov:wasQuotedFrom`
- `prov:wasRevisionOf`
- `prov:wasDerivedFrom`
- `prov:Plan`

### Why

This balances interoperability with bounded scope:

- it aligns with the PROV-O assessment
- it aligns with the current local `ProvO` seed asset
- it avoids forcing qualified-relation maximalism into v1

## Decision 2: Evidence Anchoring Is Explicit, Not Implied

The package should define a core evidence-anchor abstraction that can represent:

- text-position or text-quote selectors
- document-anchored evidence IDs
- internal span or pointer references

Web Annotation is the main interoperability seam for these anchors, but not the only admissible operational representation.

## Decision 3: Provenance Is Exported As Bounded Projections

The package should design for:

- per-run provenance views
- per-derived-claim provenance views
- per-retrieval-packet provenance views
- audit-oriented bounded export bundles

It should not assume:

- one unbounded global provenance graph that callers continuously append to and query directly

## Decision 4: Lifecycle Time Semantics Stay Explicit

PROV activity times are insufficient for all lifecycle meanings relevant to expert-memory and semantic knowledge work.

The package should therefore preserve explicit domain time fields where needed, including:

- `observedAt`
- `publishedAt`
- `ingestedAt`
- `assertedAt`
- `derivedAt`
- `effectiveAt`
- `supersededAt`

## Decision 5: Web Annotation Is An Adapter Seam

The package should include:

- a core evidence anchor value family
- a Web Annotation-compatible mapping seam or adapter

The package should not require:

- every consumer to persist or exchange evidence exclusively as Web Annotation objects

## Module Implications

| Module Family | Responsibility |
|---|---|
| `prov/` | stable provenance values, profile modules, projection-friendly provenance shapes |
| `evidence/` | evidence anchor values, selectors, and adapter-neutral anchor modeling |
| `vocab/prov` and `vocab/oa` | vocabulary helpers for PROV and Web Annotation terms |
| `services/provenance` | provenance projection, summarization, or export service contracts |
| `adapters/web-annotation` | optional adapter that maps evidence anchors to and from Web Annotation-compatible representations |

## Acceptance Criteria

The provenance design is ready for implementation planning once:

- the core PROV profile is explicit
- the extension tier is explicit
- evidence anchoring is explicit
- bounded projection strategy is explicit
- lifecycle time policy is explicit

## Open Question

Should the first implementation slice include a public Web Annotation adapter module, or only the core evidence-anchor values plus a documented seam?

Recommended default:

- ship the core evidence-anchor values first
- define the adapter seam now
- implement the Web Annotation adapter in the first adapter-focused slice if it does not slow core value delivery
