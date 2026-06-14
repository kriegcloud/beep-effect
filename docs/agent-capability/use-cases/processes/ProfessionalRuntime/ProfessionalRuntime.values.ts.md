---
title: ProfessionalRuntime.values.ts
nav_order: 9
parent: "@beep/agent-capability-use-cases"
---

## ProfessionalRuntime.values.ts overview

Concept-local value vocabularies for Agentic Professional Runtime contracts.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [RuntimeActivityType](#runtimeactivitytype)
  - [RuntimeApprovalDecision](#runtimeapprovaldecision)
  - [RuntimeCandidateLifecycle](#runtimecandidatelifecycle)
  - [RuntimeClaimConfidence](#runtimeclaimconfidence)
  - [RuntimeRequestKind](#runtimerequestkind)
  - [RuntimeSourceKind](#runtimesourcekind)
  - [RuntimeUsageMode](#runtimeusagemode)
---

# models

## RuntimeActivityType

Activity types emitted by deterministic runtime fixtures.

**Example**

```ts
import { RuntimeActivityType } from "@beep/agent-capability-use-cases/public"

console.log(RuntimeActivityType)
```

**Signature**

```ts
declare const RuntimeActivityType: LiteralKit<readonly ["artifact_ingested", "candidate_work_proposed"], undefined>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/agent-capability/use-cases/src/processes/ProfessionalRuntime/ProfessionalRuntime.values.ts#L120)

Since v0.0.0

## RuntimeApprovalDecision

Approval decision vocabulary for candidate approval gates.

**Example**

```ts
import { RuntimeApprovalDecision } from "@beep/agent-capability-use-cases/public"

console.log(RuntimeApprovalDecision)
```

**Signature**

```ts
declare const RuntimeApprovalDecision: LiteralKit<readonly ["pending"], undefined>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/agent-capability/use-cases/src/processes/ProfessionalRuntime/ProfessionalRuntime.values.ts#L63)

Since v0.0.0

## RuntimeCandidateLifecycle

Candidate lifecycle vocabulary used by runtime output sections.

**Example**

```ts
import { RuntimeCandidateLifecycle } from "@beep/agent-capability-use-cases/public"

console.log(RuntimeCandidateLifecycle)
```

**Signature**

```ts
declare const RuntimeCandidateLifecycle: LiteralKit<readonly ["candidate"], undefined>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/agent-capability/use-cases/src/processes/ProfessionalRuntime/ProfessionalRuntime.values.ts#L25)

Since v0.0.0

## RuntimeClaimConfidence

Confidence vocabulary for candidate claims.

**Example**

```ts
import { RuntimeClaimConfidence } from "@beep/agent-capability-use-cases/public"

console.log(RuntimeClaimConfidence)
```

**Signature**

```ts
declare const RuntimeClaimConfidence: LiteralKit<readonly ["high", "medium", "low"], undefined>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/agent-capability/use-cases/src/processes/ProfessionalRuntime/ProfessionalRuntime.values.ts#L44)

Since v0.0.0

## RuntimeRequestKind

Runtime request kinds represented in context packets.

**Example**

```ts
import { RuntimeRequestKind } from "@beep/agent-capability-use-cases/public"

console.log(RuntimeRequestKind)
```

**Signature**

```ts
declare const RuntimeRequestKind: LiteralKit<readonly ["email_to_candidate_work"], undefined>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/agent-capability/use-cases/src/processes/ProfessionalRuntime/ProfessionalRuntime.values.ts#L82)

Since v0.0.0

## RuntimeSourceKind

Source artifact kinds represented in context packets.

**Example**

```ts
import { RuntimeSourceKind } from "@beep/agent-capability-use-cases/public"

console.log(RuntimeSourceKind)
```

**Signature**

```ts
declare const RuntimeSourceKind: LiteralKit<readonly ["email"], undefined>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/agent-capability/use-cases/src/processes/ProfessionalRuntime/ProfessionalRuntime.values.ts#L101)

Since v0.0.0

## RuntimeUsageMode

Usage modes emitted by deterministic runtime fixtures.

**Example**

```ts
import { RuntimeUsageMode } from "@beep/agent-capability-use-cases/public"

console.log(RuntimeUsageMode)
```

**Signature**

```ts
declare const RuntimeUsageMode: LiteralKit<readonly ["deterministic_fixture"], undefined>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/agent-capability/use-cases/src/processes/ProfessionalRuntime/ProfessionalRuntime.values.ts#L139)

Since v0.0.0