# TrustGraph Documentation Ontology

## Status

PENDING

## Purpose

This spec workspace turns the TrustGraph documentation-memory exploration plan into runnable artifacts for the `beep-effect` documentation domain.

The package produces:

- a TrustGraph-native ontology JSON artifact for the documentation TBox
- a mechanically derived scaffold for the broader JSDoc and docgen domain
- a companion semantic-web seed layer grounded in RDF, PROV, evidence anchors, and bounded SHACL shapes
- local verification outputs that separate structural validation from rule-enforcement feasibility

## Quick Start

Rebuild the artifacts:

```bash
bun specs/pending/trustgraph-doc-ontology/scripts/build-artifacts.ts
```

Run local verification:

```bash
bun specs/pending/trustgraph-doc-ontology/scripts/verify-artifacts.ts
```

## Output Map

- `outputs/beep-effect-documentation-ontology.json`
- `outputs/beep-effect-documentation-tag-scaffold.json`
- `outputs/beep-effect-documentation-seed.dataset.json`
- `outputs/beep-effect-documentation-seed.nq`
- `outputs/beep-effect-documentation-seed.provenance.json`
- `outputs/beep-effect-documentation-seed.evidence.json`
- `outputs/beep-effect-documentation-shapes.json`
- `outputs/beep-effect-documentation-capability-audit.md`
- `outputs/source-authority-matrix.md`
- `outputs/manifest.json`
- `outputs/verification-report.json`

## Scope Notes

- The ontology artifact is TBox-only and uses TrustGraph's current native ontology JSON structure.
- Rule instances, provenance records, evidence anchors, and SHACL shapes live in the companion outputs rather than inside the ontology JSON.
- The governing worked examples focus on `@param`, `@returns`, `@throws`, `@since`, `@category`, and `@example`, while the broader tag catalog is scaffolded mechanically from the repo's JSDoc source.
