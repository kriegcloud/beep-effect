# Package Home Decision

Date: 2026-06-04

## Question

Should the scratch ontology builder become a new package, fold into
`@beep/semantic-web`, or remain scratchpad-only?

## Decision

Create two `foundation/modeling` packages:

- `@beep/rdf` for domain-safe RDF/linked-data value models.
- `@beep/ontology` for schema-backed ontology authoring.

Keep `@beep/semantic-web` as `foundation/capability` for semantic-web services,
adapters, and compatibility re-exports.

## Rationale

`@beep/ontology` is intended to annotate Effect Schema definitions directly.
Those schemas may live in domain packages. The architecture standard allows
domain packages to import `foundation/primitive` and `foundation/modeling`, but
not `foundation/capability`.

`@beep/semantic-web` already lives in `foundation/capability`, which is correct
for semantic-web services and adapters. Folding ontology authoring into that
package would make domain-schema authoring depend on a capability package.

The current scratch POC depends on IRI, RDF `NamedNode`, and vocabulary values
from `@beep/semantic-web`. Those are pure value models, so they should be
extracted to `@beep/rdf` instead of creating a modeling-to-capability exception.

## Rejected Alternatives

| Alternative | Rejection |
| --- | --- |
| Fold into `@beep/semantic-web` | Convenient but not domain-safe under current architecture rules. |
| `foundation/capability/ontology` | Allows semantic-web reuse but blocks domain package imports. |
| Temporary dependency exception | Creates avoidable architecture drift and makes the proof less meaningful. |
| Scratchpad only | Does not create a reusable package surface for domain schema authoring. |

## V1 Cutline

Move only core pure models into `@beep/rdf`:

- IRI/URI schemas and constructors.
- RDF terms, quads, datasets, prefix maps, and deterministic helpers.
- JSON-LD pure value/document schemas.
- Core vocab modules for RDF, RDFS, OWL, XSD, OA, and PROV constants.

Leave PROV records, evidence anchors, services, live Layers, adapters, SHACL,
SPARQL, and canonicalization services in `@beep/semantic-web` for now.
