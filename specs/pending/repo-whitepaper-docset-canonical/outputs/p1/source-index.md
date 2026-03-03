# P1 Source Index

## Objective

Enumerate the full source corpus and establish normalized source IDs for evidence mapping.

## Indexed Source Areas

| Source Area ID | Path | Surface Notes | Index Status |
|---|---|---|---|
| S01 | `tooling/repo-utils/src/JSDoc/*` | TypeScript JSDoc models and tag definitions | indexed |
| S02 | `specs/pending/repo-codegraph-canonical/*` | Canonical orchestration package and phase gates | indexed |
| S03 | `specs/pending/repo-codegraph-jsdoc/*` | Exploratory and synthesis docs with architecture and NLP concepts | indexed |
| S04 | `.repos/beep-effect/packages/knowledge/_docs` | Architecture, ontology, plans, audits, operations corpus | indexed |

## Surface Inventory Snapshot

| Source Area ID | Approximate File Count | Notes |
|---|---|---|
| S01 | 31 | Includes `JSDoc.ts`, model files, tag-value unions |
| S02 | 7 | Includes `README`, orchestration, rubrics, handoff, quick start |
| S03 | 40+ | Includes `OVERVIEW` and multiple output artifacts |
| S04 | 72 | Includes architecture, ontology research, plans, mvp, audits |

## Evidence ID Convention

- Format: `E-<SourceAreaID>-<NNN>`
- Example: `E-S01-001`

## Index Exit Checklist

1. Every source area has an entry in this file.
2. Every source area has at least one evidence ID in `fact-ledger.json`.
3. Coverage baseline is generated in `coverage-baseline.md`.
