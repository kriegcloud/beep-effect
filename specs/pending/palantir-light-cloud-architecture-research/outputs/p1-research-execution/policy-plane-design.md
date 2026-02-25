# Policy Plane Design

## Objective

Specify a deterministic, explainable policy model that composes mandatory controls, purpose controls, and role controls while preserving AWS-first guardrails and SOC2 traceability goals [CIT-002][CIT-004][CIT-006][CIT-010][CIT-036].

## Policy Model

- Mandatory controls: classification/marking constraints applied first and treated as non-bypassable boundaries [CIT-006].
- Purpose controls: context-of-use eligibility gates (PBAC-like) applied after mandatory controls [CIT-006].
- Role/discretionary controls: role grants evaluated only if mandatory and purpose checks pass [CIT-006][CIT-010].
- Organization guardrails: SCP constraints enforce upper-bound permissions independent of app-level policy decisions [CIT-011].

## Precedence Rules (Deterministic)

1. `OrgGuardrailCheck`: reject if request violates organization or account-level guardrails (`deny` terminal) [CIT-011].
2. `MandatoryControlCheck`: reject if markings/classification conditions are not satisfied (`deny` terminal) [CIT-006].
3. `PurposeEligibilityCheck`: reject if declared purpose/context does not satisfy allowed purpose model (`deny` terminal) [CIT-006].
4. `RolePermissionCheck`: evaluate least-privilege role grants only after prior checks pass (`allow` or `deny`) [CIT-010].
5. `ObligationCheck`: if allowed, attach obligations (audit tags, provenance requirements, retention labels).

## Decision Explainability

Every policy decision emits a record with this schema:

```ts
{
  decisionId: string,
  subjectId: string,
  action: string,
  resourceId: string,
  evaluationPath: Array<"org" | "mandatory" | "purpose" | "role" | "obligation">,
  result: "allow" | "deny",
  matchedRules: Array<string>,
  evidenceRefs: Array<string>,
  timestamp: string
}
```

Explainability requirements:

- Include the first failing gate for denies.
- Include all matched allow constraints and obligations for allows.
- Carry citation IDs for policy model version and control mapping anchors [CIT-006][CIT-010][CIT-036].

## Conflict Resolution Matrix

| Conflict Class | Resolution |
|---|---|
| Role allow vs mandatory deny | mandatory deny wins |
| Purpose allow vs mandatory deny | mandatory deny wins |
| Role allow vs purpose deny | purpose deny wins |
| Multiple role grants with one deny condition | explicit deny wins |
| App-level allow vs SCP deny | SCP deny wins |

## Integration Points

1. Runtime services must call policy evaluation before privileged tool execution and sensitive data access [CIT-002][CIT-008].
2. Provenance/audit layers must persist policy decision IDs and evaluation paths for each user-visible output [CIT-002][CIT-018].
3. Compliance control mapping must bind policy controls to SOC2 control families (`CC6`, `C1`, `PI1`) [CIT-036][CIT-037].

## Inference Notes

1. Inference: this precedence model is the closest deterministic mapping between Palantir-style mandatory/purpose semantics and AWS explicit-deny behavior.
2. Inference: obligation attachment after allow is required to keep policy decisions and provenance envelopes synchronized in downstream validation scenarios.
