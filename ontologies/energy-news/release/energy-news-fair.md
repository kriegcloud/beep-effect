# FAIR Assessment — Energy News Ontology v0.2.0

Date: 2026-02-12
Assessor: ontology-curator skill

## Summary

Overall FAIR readiness: **Development stage** — satisfies most FAIR
sub-principles at the artifact level. Publishing and registration (F4, A1)
are deferred until the namespace moves from `example.org` to a production
IRI scheme.

## Findable

| Sub-principle | Status | Evidence |
|---------------|--------|----------|
| F1: Globally unique identifiers | PARTIAL | IRIs use `http://example.org/ontology/energy-news#` — unique within project but not resolvable. Production deployment needs a persistent IRI scheme (w3id.org or purl.org). |
| F2: Rich metadata | PASS | `dcterms:title`, `dcterms:description`, `dcterms:creator`, `dcterms:created`, `dcterms:modified`, `dcterms:license`, `owl:versionIRI`, `owl:versionInfo`, `owl:priorVersion` all present on ontology header. Every class has `rdfs:label` and `skos:definition`. |
| F3: Metadata references identifiers | PASS | `owl:versionIRI` provides versioned identifier. `owl:priorVersion` links to v0.1.0. |
| F4: Registered in searchable resource | NOT YET | Not registered in OBO Foundry, BioPortal, OLS, or LOV. Appropriate for development stage. |

## Accessible

| Sub-principle | Status | Evidence |
|---------------|--------|----------|
| A1: Retrievable via standard protocol | NOT YET | `example.org` IRIs are not dereferenceable. Production deployment would serve via HTTPS with content negotiation. |
| A1.1: Open protocol | PASS (design) | Will use HTTP/HTTPS when published. |
| A1.2: Auth where needed | N/A | Open-access ontology under MIT license. |
| A2: Metadata persists | PASS | Versioned ontology files in git. `owl:priorVersion` preserves version chain. Metadata embedded in each artifact. |

## Interoperable

| Sub-principle | Status | Evidence |
|---------------|--------|----------|
| I1: Formal KR language | PASS | OWL 2 DL serialized as Turtle. Release also in OWL/XML and Manchester Syntax. |
| I2: FAIR vocabularies | PASS | Uses DCMI (`dcterms:`), SKOS, BFO (ISO 21838-2), Schema.org, SIOC. All are widely adopted FAIR vocabularies. |
| I3: Qualified links | PASS | `owl:equivalentClass` (Schema.org, SIOC), `owl:equivalentProperty` (Schema.org), `rdfs:subPropertyOf` (Schema.org), `rdfs:subClassOf` (BFO, Schema.org), `skos:relatedMatch`. |

## Reusable

| Sub-principle | Status | Evidence |
|---------------|--------|----------|
| R1: Rich provenance | PASS | `dcterms:creator`, `dcterms:created`, `dcterms:modified`, `owl:priorVersion`. KGCL change log tracks all changes with dates, authors, and rationale. |
| R1.1: Usage license | PASS | `dcterms:license <https://spdx.org/licenses/MIT>` on all three ontology modules. |
| R1.2: Provenance of terms | PASS | KGCL change log (`energy-news-changes.kgcl`) documents creation, modification, and fixes for every term and axiom. |
| R1.3: Community standards | PARTIAL | Follows OWL 2 DL, uses SKOS for concepts, BFO for upper ontology alignment. Not yet OBO Foundry compliant (would need `obo:IAO_0000115` definitions, OBO PURLs). |

## Actions for Future Releases

1. **Mint persistent IRIs** — migrate from `example.org` to `w3id.org/energy-news/` or equivalent
2. **Content negotiation** — serve Turtle, OWL/XML via HTTPS with Accept header routing
3. **Registry submission** — register in LOV and/or BioPortal once IRIs are stable
4. **PROV-O provenance** — add `prov:wasGeneratedBy`, `prov:wasAttributedTo` with ORCID
5. **OBO compliance** (optional) — add `obo:IAO_0000115` definitions if OBO Foundry submission desired
