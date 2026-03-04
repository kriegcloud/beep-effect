# Source Map

## Source Index

| Source ID | Source | Type | Notes |
|---|---|---|---|
| SRC-001 | Completed Palantir ontology README and outputs | Internal primary | Core ontology/security/runtime blueprint |
| SRC-002 | `security.json` from Palantir ontology outputs | Internal primary | PBAC/markings/audit model reference |
| SRC-003 | `architecture.json` from Palantir ontology outputs | Internal primary | Platform/runtime structure patterns |
| SRC-004 | `ai-llm.json` from Palantir ontology outputs | Internal primary | OAG/tooling/agent patterns |
| SRC-005 | Graphiti memory facts (`palantir-ontology`) | Internal supplemental | Runtime/control-plane supplemental facts |
| SRC-006 | AWS official architecture and service docs | External primary | Cloud capability and security controls |
| SRC-007 | SST official docs | External primary | App-layer IaC and runtime orchestration patterns |
| SRC-008 | Terraform/OpenTofu provider docs | External primary | Infra module and provider capability coverage |
| SRC-009 | Compliance reference materials (SOC2 control mappings) | External primary | Control objectives and evidence expectations |

## Source Quality Policy

1. Primary sources are required for any provider, compliance, or architecture recommendation.
2. Supplemental sources (including `SRC-005`) cannot independently justify a high-impact decision.
3. Any claim based on supplemental evidence must include a confidence label and corroboration status.
4. Contradictions between primary sources must be documented in `source-citations.md` before final scoring.

## Conflict Handling Workflow

1. Log conflicting claim statements with source IDs.
2. Prefer newer official documentation where scope and version match.
3. If conflict remains unresolved, mark decision area as constrained and carry a risk item forward.
4. Record final adjudication rationale in `source-citations.md` and reference it from affected artifacts.

## Confidence Annotation Rules

| Confidence | Rule |
|---|---|
| high | Supported by >=2 independent primary sources with no unresolved conflict |
| medium | Supported by 1 primary source plus corroborating supplemental evidence |
| low | Supported only by supplemental evidence or unresolved source conflict |

## Question-to-Source Evidence Plan

| Research Question ID | Primary Sources | Minimum Primary Evidence | Fallback Channel | Confidence Requirement |
|---|---|---|---|---|
| RQ-001 | SRC-006, SRC-009 | 2 | SRC-001, SRC-003 | medium or high |
| RQ-002 | SRC-007, SRC-008 | 2 | SRC-006 | medium or high |
| RQ-003 | SRC-001, SRC-002 | 2 | SRC-009 | medium or high |
| RQ-004 | SRC-001, SRC-002 | 2 | SRC-005 | medium or high |
| RQ-005 | SRC-003, SRC-004, SRC-006 | 2 | SRC-005 | medium or high |
| RQ-006 | SRC-003, SRC-004 | 1 | SRC-001 | medium or high |
| RQ-007 | SRC-006 | 1 | SRC-003 | medium or high |
| RQ-008 | SRC-009, SRC-002 | 2 | SRC-006 | medium or high |
| RQ-009 | SRC-006 | 1 | SRC-003 | medium or high |
| RQ-010 | SRC-001 | 1 | SRC-005 | low, medium, or high (must state corroboration status) |

## Evidence Standards

1. Every major conclusion in P1/P2 must reference at least one source ID.
2. Claims based on `SRC-005` alone must include a confidence note and limitation statement.
3. Every `RQ-*` in the backlog must appear in the table above with a primary-source plan.
4. If sources conflict, document conflict explicitly in `source-citations.md`.
