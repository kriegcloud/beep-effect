---json
{"contract":{"evidenceSubject":{"digest":{"sha256":"6a41c1628f333f0eb40897417655ee86d39b786cc065ec92590aa8d64a07b371"},"name":"https://beep-effect.com/ns/contracts/qa-inventory/v1@2.0.0"},"gates":{"declarations":[{"applicability":{"kind":"always"},"evidence":{"predicateType":"https://beep-effect.com/ns/qa/evidence/judge-output-inventory/v2"},"id":"judge-output-inventory-decodes","remediationOwner":"@beep/repo-cli/Qa","severity":"blocking"},{"applicability":{"kind":"always"},"evidence":{"predicateType":"https://beep-effect.com/ns/qa/evidence/declared-round-coherent/v2"},"id":"declared-round-coherent","remediationOwner":"@beep/repo-cli/Qa","severity":"blocking"},{"applicability":{"kind":"always"},"evidence":{"predicateType":"https://beep-effect.com/ns/qa/evidence/cited-artifact-exists/v2"},"id":"cited-artifact-exists","remediationOwner":"@beep/repo-cli/Qa","severity":"blocking"},{"applicability":{"kind":"always"},"evidence":{"predicateType":"https://beep-effect.com/ns/qa/evidence/cited-event-id-exists/v2"},"id":"cited-event-id-exists","remediationOwner":"@beep/repo-cli/Qa","severity":"blocking"},{"applicability":{"kind":"always"},"evidence":{"predicateType":"https://beep-effect.com/ns/qa/evidence/evidence-cross-check/v2"},"id":"evidence-cross-check-clean","remediationOwner":"@beep/repo-cli/Qa","severity":"blocking"}]},"id":"https://beep-effect.com/ns/contracts/qa-inventory/v1","input":{"schemaId":"https://beep-effect.com/ns/schemas/qa-judge-input/v1"},"output":{"schemaId":"https://beep-effect.com/ns/schemas/qa-judge-settlement/v1"},"promise":"Validate a qa-inventory/v1 value against its declared round and cited evidence.","receiptTypes":{"failure":"https://beep-effect.com/ns/skill-contract/evidence/failure/v2","gateSummary":"https://beep-effect.com/ns/skill-contract/evidence/gate-summary/v2","ladder":{"accepted":"https://beep-effect.com/ns/qa/receipts/accepted/v2","delivered":"https://beep-effect.com/ns/qa/receipts/delivered/v2","persisted":"https://beep-effect.com/ns/qa/receipts/persisted/v2","semanticallyApplied":"https://beep-effect.com/ns/qa/receipts/semantically-applied/v2"},"recoveryAttempt":"https://beep-effect.com/ns/qa/receipts/recovery-attempt/v2"},"recovery":{"mode":"none"},"version":"2.0.0"},"projection":"skill-contract/skill-md/v1"}
---

# `https://beep-effect.com/ns/contracts/qa-inventory/v1@2.0.0`

Validate a qa\-inventory/v1 value against its declared round and cited evidence\.

## Evidence subject

**Name:** `https://beep-effect.com/ns/contracts/qa-inventory/v1@2.0.0`

**SHA\-256:** `6a41c1628f333f0eb40897417655ee86d39b786cc065ec92590aa8d64a07b371`

## Input schema reference

`https://beep-effect.com/ns/schemas/qa-judge-input/v1`

## Output schema reference

`https://beep-effect.com/ns/schemas/qa-judge-settlement/v1`

## Gates

| id | severity | applicability | evidence predicateType | remediation owner |
| --- | --- | --- | --- | --- |
| `judge-output-inventory-decodes` | blocking | always | `https://beep-effect.com/ns/qa/evidence/judge-output-inventory/v2` | `@beep/repo-cli/Qa` |
| `declared-round-coherent` | blocking | always | `https://beep-effect.com/ns/qa/evidence/declared-round-coherent/v2` | `@beep/repo-cli/Qa` |
| `cited-artifact-exists` | blocking | always | `https://beep-effect.com/ns/qa/evidence/cited-artifact-exists/v2` | `@beep/repo-cli/Qa` |
| `cited-event-id-exists` | blocking | always | `https://beep-effect.com/ns/qa/evidence/cited-event-id-exists/v2` | `@beep/repo-cli/Qa` |
| `evidence-cross-check-clean` | blocking | always | `https://beep-effect.com/ns/qa/evidence/evidence-cross-check/v2` | `@beep/repo-cli/Qa` |

## Receipt types

| receipt | predicateType |
| --- | --- |
| `accepted` | `https://beep-effect.com/ns/qa/receipts/accepted/v2` |
| `persisted` | `https://beep-effect.com/ns/qa/receipts/persisted/v2` |
| `delivered` | `https://beep-effect.com/ns/qa/receipts/delivered/v2` |
| `semanticallyApplied` | `https://beep-effect.com/ns/qa/receipts/semantically-applied/v2` |
| `failure` | `https://beep-effect.com/ns/skill-contract/evidence/failure/v2` |
| `gateSummary` | `https://beep-effect.com/ns/skill-contract/evidence/gate-summary/v2` |
| `recoveryAttempt` | `https://beep-effect.com/ns/qa/receipts/recovery-attempt/v2` |

## Recovery policy

Mode: none