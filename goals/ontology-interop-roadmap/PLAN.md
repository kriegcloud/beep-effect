# Ontology Interop Roadmap Plan

## Status

This plan executes [SPEC.md](./SPEC.md). Packet research is complete; package
implementation is intentionally deferred to a future session.

## Phase 0 - Packet And Research

- [x] Create `goals/ontology-interop-roadmap`.
- [x] Mirror the canonical `goals/_template` packet shape.
- [x] Inspect `AGENTS.md`, `CLAUDE.md`, `standards/ARCHITECTURE.md`, and
  `goals/README.md`.
- [x] Inspect `goals/ontology-modeling-foundation`.
- [x] Inspect live `@beep/rdf` and `@beep/ontology` source, exports, and tests.
- [x] Benchmark FOLIO browse/detail/export behavior.
- [x] Inventory relevant standards and format options.
- [x] Research SKOS profile behavior.
- [x] Research Effect v4 JSON Schema sidecar support.
- [x] Ground legal/OIP workflow fit from the baseline scratch and local corpus.
- [x] Resolve branch-closing grill decisions.

## Phase 1 - RDF Vocabulary Foundation

- [ ] Add `@beep/rdf/Vocab/Skos` with generic SKOS constants.
- [ ] Add focused tests for namespace and constant IRIs.
- [ ] Update public exports and dtslint examples.
- [ ] Move local SKOS constants out of `@beep/ontology` cleanup-on-touch.
- [ ] Consider a small `@beep/rdf/Vocab/Dcterms` follow-up if DCTERMS source
  constants remain local to `@beep/ontology`.

## Phase 2 - Ontology SKOS Profile

- [ ] Add opt-in SKOS profile metadata models in `@beep/ontology`.
- [ ] Preserve current class metadata compatibility fields.
- [ ] Support multilingual labels and notes beside current plain string fields.
- [ ] Allow dual `rdfs:Class` plus `skos:Concept` only when explicitly opted in.
- [ ] Implement profile validation with hard errors and warnings.
- [ ] Enrich JSON-LD and Turtle projections for profile fields.

## Phase 3 - Markdown Documentation Projection

- [ ] Add deterministic Markdown projection in `@beep/ontology`.
- [ ] Default to portable Markdown links.
- [ ] Add explicit Obsidian wikilink mode for vault/RAG workflows.
- [ ] Cover ontology, class/concept, predicate, scheme, hierarchy, mapping,
  source/provenance, and sidecar-pointer sections.
- [ ] Keep HTML pages, route suffixes, and browsers out of v1 package scope.

## Phase 4 - JSON Schema Sidecars And Provenance

- [ ] Derive `JsonSchema.Document<"draft-2020-12">` with
  `S.toJsonSchemaDocument(...)` from source class schemas.
- [ ] Attach sidecars as non-RDF ontology metadata.
- [ ] Use safe generation defaults and avoid broad annotation leakage.
- [ ] Add optional domain-agnostic provenance hooks.
- [ ] Keep legal/OIP provenance requirements in future ingestion/product slices.

## Phase 5 - Focused Verification

- [ ] Run package type checks for `@beep/rdf` and `@beep/ontology`.
- [ ] Run package tests for `@beep/rdf` and `@beep/ontology`.
- [ ] Add or update dtslint examples for public surfaces.
- [ ] Refresh repo export catalog only after package checks are green.
- [ ] Escalate to broader repo quality lanes only if touched surfaces require it.

## Deferred Follow-Ups

- RDF/XML and OWL XML projection/import.
- OWL functional syntax and OWL profile modeling.
- TriG and N-Quads once named graph provenance is real.
- Full SHACL validators and reasoners in `@beep/semantic-web`.
- FOLIO-style HTML pages, API suffix routes, and visual browser UI.
- OBO bridges for non-OIP ontology ecosystems.
