# P1 — Core Schema and Value Design

## Purpose

Define the public schema and value families that give `@beep/semantic-web` its core identity.

## Source-Grounded Inputs

- `IRI.ts` provides syntax-boundary rigor.
- `ProvO.ts` provides a deep provenance seed surface.
- old `uri.ts` prior art provides canonical strings plus parse / normalize / resolve / equal helpers.
- local Effect v4 evidence confirms `Schema.toEquivalence(...)` and related schema-derived helpers.

## v1 Public Schema Families

| Family | Required In v1 | Notes |
|---|---|---|
| IRI values and canonical IRI strings | yes | semantic default for identifiers |
| URI values and canonical URI strings | yes | interoperability and transport companion surface |
| RDF terms, literals, quads, datasets, prefixes, and namespaces | yes | primary semantic value layer |
| Vocabulary term values | yes | public reusable term modules |
| JSON-LD document and context values | yes | JSON-LD is first-class |
| PROV profile values | yes | minimal stable profile plus extension tier |
| Evidence-anchor values | yes | explicit evidence posture |
| Service-contract schemas | yes | public contract layer |

## Equality, Identity, and Normalization Policy

| Concern | Default |
|---|---|
| schema-modeled value equality | `Schema.toEquivalence(...)` |
| normalization-sensitive comparisons | explicit `Equivalence` where needed |
| graph or dataset semantic identity | canonicalization before hashing |
| raw `Hash` / `Equal` | internal only after canonicalization |
| Effect `Graph` | projection-only |
| JSON-LD document edits | `JsonPatch` / `JsonPointer` allowed only at document layer |
| generic XML encoding | not RDF/XML |

## Metadata Requirements

Semantic schema metadata is required for:

- public identifier schemas
- public RDF and vocabulary schemas
- public JSON-LD schemas
- public provenance and evidence schemas
- public service-contract schemas

Metadata is optional or avoided for internal helpers as defined in the metadata design note.

## Outcome

P1 is complete. The core value families and their equality, identity, and metadata posture are explicit enough for adapter and service design work.

## Remaining Open Question

Should the first implementation slice ship both class-style and branded-string surfaces for every identifier family immediately, or stage branded strings first and class models second?

Recommended default:

- ship both where local prior art and current seed assets already justify both
- avoid inventing redundant wrapper classes where branded strings and transforms are sufficient
