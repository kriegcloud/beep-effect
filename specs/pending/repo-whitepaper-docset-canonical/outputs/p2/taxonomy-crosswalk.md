# P2 Taxonomy Crosswalk

## Objective

Reconcile category systems across JSDoc modeling, codegraph canonical architecture, exploratory corpus taxonomy, and knowledge-doc ontology structures.

## Crosswalk Table

| Source Taxonomy | Example Categories | Mapped Canonical Axis | Rationale |
|---|---|---|---|
| JSDoc tag-value category unions | Structural, Documentation, TypeDoc, Closure | Documentation Semantics | Describes annotation intent and syntactic constraints |
| Canonical codegraph classification | domain, data-access, validation, transformation, side-effect | Architectural Responsibility | Describes runtime/system responsibility |
| Exploratory jsdoc/codegraph taxonomy | domain model, utility, use case, integration | Knowledge-Graph Functional Role | Describes extraction and graph reasoning role |
| Knowledge docs ontology clusters | architecture, ontology research, control, audits, plans | Evidence Domain | Describes operational/research provenance context |

## Canonical Axes Adopted for Docset

1. Documentation Semantics Axis (tags and annotation logic).
2. Architectural Responsibility Axis (system function and boundaries).
3. Reasoning and Representation Axis (inference and modeling strategy).
4. Operational Assurance Axis (reliability, controls, auditability).
5. Governance and Evidence Axis (risk, roadmap, traceability).

## Open Questions

1. Whether to merge exploratory taxonomy labels into a constrained canonical enum for D08.
2. Whether audit categories should be normalized as a dedicated operational subtype in D10.
