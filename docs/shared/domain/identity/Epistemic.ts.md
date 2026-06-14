---
title: Epistemic.ts
nav_order: 24
parent: "@beep/shared-domain"
---

## Epistemic.ts overview

Epistemic slice entity-id registry.

Since v0.0.0

---
## Exports Grouped by Category
- [entity-ids](#entity-ids)
  - [ActivityId](#activityid)
  - [ActivityId (type alias)](#activityid-type-alias)
  - [CandidateClaimId](#candidateclaimid)
  - [CandidateClaimId (type alias)](#candidateclaimid-type-alias)
  - [EvidenceId](#evidenceid)
  - [EvidenceId (type alias)](#evidenceid-type-alias)
  - [UsageRecordId](#usagerecordid)
  - [UsageRecordId (type alias)](#usagerecordid-type-alias)
---

# entity-ids

## ActivityId

Activity entity identifier.

**Example**

```ts
import * as Epistemic from "@beep/shared-domain/identity/Epistemic"

console.log(Epistemic.ActivityId.entityType)
```

**Signature**

```ts
declare const ActivityId: EntityId.EntityId<"epistemic", "activity", "epistemic_activity", "epistemic.activity", "EpistemicActivity", "EpistemicActivityId">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/Epistemic.ts#L103)

Since v0.0.0

## ActivityId (type alias)

Runtime type for `ActivityId`.

**Example**

```ts
import { Effect } from "effect"
import * as Epistemic from "@beep/shared-domain/identity/Epistemic"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const id: Epistemic.ActivityId = yield* S.decodeUnknownEffect(Epistemic.ActivityId)(1)
  return id
})
console.log(program)
```

**Signature**

```ts
type ActivityId = typeof ActivityId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/Epistemic.ts#L126)

Since v0.0.0

## CandidateClaimId

Candidate claim entity identifier.

**Example**

```ts
import * as Epistemic from "@beep/shared-domain/identity/Epistemic"

console.log(Epistemic.CandidateClaimId.entityType)
```

**Signature**

```ts
declare const CandidateClaimId: EntityId.EntityId<"epistemic", "candidate_claim", "epistemic_candidate_claim", "epistemic.candidate_claim", "EpistemicCandidateClaim", "EpistemicCandidateClaimId">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/Epistemic.ts#L27)

Since v0.0.0

## CandidateClaimId (type alias)

Runtime type for `CandidateClaimId`.

**Example**

```ts
import { Effect } from "effect"
import * as Epistemic from "@beep/shared-domain/identity/Epistemic"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const id: Epistemic.CandidateClaimId = yield* S.decodeUnknownEffect(Epistemic.CandidateClaimId)(1)
  return id
})
console.log(program)
```

**Signature**

```ts
type CandidateClaimId = typeof CandidateClaimId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/Epistemic.ts#L50)

Since v0.0.0

## EvidenceId

Evidence entity identifier.

**Example**

```ts
import * as Epistemic from "@beep/shared-domain/identity/Epistemic"

console.log(Epistemic.EvidenceId.entityType)
```

**Signature**

```ts
declare const EvidenceId: EntityId.EntityId<"epistemic", "evidence", "epistemic_evidence", "epistemic.evidence", "EpistemicEvidence", "EpistemicEvidenceId">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/Epistemic.ts#L65)

Since v0.0.0

## EvidenceId (type alias)

Runtime type for `EvidenceId`.

**Example**

```ts
import { Effect } from "effect"
import * as Epistemic from "@beep/shared-domain/identity/Epistemic"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const id: Epistemic.EvidenceId = yield* S.decodeUnknownEffect(Epistemic.EvidenceId)(1)
  return id
})
console.log(program)
```

**Signature**

```ts
type EvidenceId = typeof EvidenceId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/Epistemic.ts#L88)

Since v0.0.0

## UsageRecordId

Usage record entity identifier.

**Example**

```ts
import * as Epistemic from "@beep/shared-domain/identity/Epistemic"

console.log(Epistemic.UsageRecordId.entityType)
```

**Signature**

```ts
declare const UsageRecordId: EntityId.EntityId<"epistemic", "usage_record", "epistemic_usage_record", "epistemic.usage_record", "EpistemicUsageRecord", "EpistemicUsageRecordId">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/Epistemic.ts#L141)

Since v0.0.0

## UsageRecordId (type alias)

Runtime type for `UsageRecordId`.

**Example**

```ts
import { Effect } from "effect"
import * as Epistemic from "@beep/shared-domain/identity/Epistemic"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const id: Epistemic.UsageRecordId = yield* S.decodeUnknownEffect(Epistemic.UsageRecordId)(1)
  return id
})
console.log(program)
```

**Signature**

```ts
type UsageRecordId = typeof UsageRecordId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/Epistemic.ts#L164)

Since v0.0.0