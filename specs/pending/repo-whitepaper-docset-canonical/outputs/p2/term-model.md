# P2 Term Model

## Objective

Define canonical terminology for D01-D12 so claims remain consistent and non-ambiguous.

## Tier-1 Terms

| Term | Canonical Meaning | Synonyms to Avoid | Owner |
|---|---|---|---|
| corpus | The 12-document output set governed by this spec | package, dump | Domain Model Lead |
| source area | One of the four locked input surfaces | repository slice | Evidence Editor |
| evidence ID | Stable reference to a source-backed claim | citation token | Evidence Editor |
| normative claim | A claim used as technical truth in corpus docs | narrative statement | Quality Lead |
| primary ownership | Single document with authoritative scope for a topic | shared ownership | Spec Orchestrator |
| traceability link | Mapping from source artifact to document claim surface | citation edge | Evidence Editor |
| quality gate | Pass/fail criterion required for phase promotion | checklist item | Quality Lead |

## Usage Rules

1. Tier-1 terms must be used exactly as defined.
2. Synonyms can appear only in parenthetical clarifications.
3. Any new Tier-1 term requires entry in this file and cross-reference in D03.

## Validation Checklist

1. D01-D12 use Tier-1 terms consistently.
2. No unresolved term collisions in conflict register.
3. D03 glossary reproduces this model exactly.
