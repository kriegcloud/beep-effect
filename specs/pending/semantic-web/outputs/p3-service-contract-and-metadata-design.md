# P3 — Service Contract and Metadata Design

## Purpose

Define the public service contracts, provenance posture, evidence-anchoring policy, and metadata application rules for `@beep/semantic-web`.

## Public Service Contracts

| Contract | v1 Status | Role |
|---|---|---|
| `services/jsonld-document` | required | compact, expand, frame, and normalize document-oriented JSON-LD work behind a stable contract |
| `services/jsonld-context` | required | parse and normalize contexts behind a bounded contract |
| `services/canonicalization` | required | canonicalize and fingerprint RDF datasets with bounded-work policy |
| `services/shacl-validation` | required | validate RDF data against SHACL shapes |
| `services/provenance-projection` | required | emit bounded provenance views and summaries |
| `services/sparql-query` | extension-tier | minimal query seam only; runtime and parser specifics stay out of the stable v1 core |

## Provenance Posture

### Minimal stable core

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

### Required supporting posture

- explicit evidence anchors
- bounded provenance projections
- explicit lifecycle time fields where domain semantics require them

## Metadata Application Rules

Metadata annotations are:

- required for important public semantic schema families
- optional for adapter-local DTOs and transitional helpers
- avoided for trivial internal scaffolding

The metadata pattern must record:

- semantic role
- equivalence basis
- spec grounding
- representation notes
- provenance / evidence expectations where relevant

## Outcome

This P3 baseline is ready for execution. The package now has a clear contract layer, a bounded provenance posture, and an explicit metadata policy that later implementation can follow without implying that a separate P3 execution session already ran.

## Remaining Open Questions

### SPARQL Contract Breadth

Should the initial `services/sparql-query` contract support only query execution inputs and outputs, or also expose parsed or generated query artifacts?

Recommended default:

- keep the stable v1 contract at execution inputs and outputs only
- treat parsed or generated query artifacts as extension-tier work

### Metadata Citation Enforcement

Should `SemanticSchemaMetadata.specifications` stay strongly typed but descriptive in v1, or become partially machine-checkable immediately?

Recommended default:

- keep `specifications` strongly typed but descriptive in v1
- defer machine-checkable citation enforcement until there is stronger local evidence that it improves real package workflows
