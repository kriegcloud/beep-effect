---
title: ProfessionalRuntime.contracts.ts
nav_order: 3
parent: "@beep/agent-capability-use-cases"
---

## ProfessionalRuntime.contracts.ts overview

SDK data-transfer contracts for the Agentic Professional Runtime proof.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [CandidateOutputSet (class)](#candidateoutputset-class)
  - [RuntimeActivity (class)](#runtimeactivity-class)
  - [RuntimeApprovalGate (class)](#runtimeapprovalgate-class)
  - [RuntimeCandidateClaim (class)](#runtimecandidateclaim-class)
  - [RuntimeCandidateDraft (class)](#runtimecandidatedraft-class)
  - [RuntimeCandidateProject (class)](#runtimecandidateproject-class)
  - [RuntimeCandidateTask (class)](#runtimecandidatetask-class)
  - [RuntimeContextPacketRequest (class)](#runtimecontextpacketrequest-class)
  - [RuntimeDraftRecipient (class)](#runtimedraftrecipient-class)
  - [RuntimeEntityRef (class)](#runtimeentityref-class)
  - [RuntimeEvidenceRef (class)](#runtimeevidenceref-class)
  - [RuntimeScope (class)](#runtimescope-class)
  - [RuntimeSourceArtifact (class)](#runtimesourceartifact-class)
  - [RuntimeSourceSpanRef (class)](#runtimesourcespanref-class)
  - [RuntimeUsageRecord (class)](#runtimeusagerecord-class)
  - [SdkContextPacket (class)](#sdkcontextpacket-class)
---

# models

## CandidateOutputSet (class)

Batch of candidate outputs proposed by an agent run.

**Example**

```ts
import { CandidateOutputSet } from "@beep/agent-capability-use-cases/public"

console.log(CandidateOutputSet)
```

**Signature**

```ts
declare class CandidateOutputSet
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/agent-capability/use-cases/src/processes/ProfessionalRuntime/ProfessionalRuntime.contracts.ts#L434)

Since v0.0.0

## RuntimeActivity (class)

Runtime provenance activity included in a context packet.

**Example**

```ts
import { RuntimeActivity } from "@beep/agent-capability-use-cases/public"

console.log(RuntimeActivity)
```

**Signature**

```ts
declare class RuntimeActivity
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/agent-capability/use-cases/src/processes/ProfessionalRuntime/ProfessionalRuntime.contracts.ts#L346)

Since v0.0.0

## RuntimeApprovalGate (class)

Candidate approval gate proposed by the runtime.

**Example**

```ts
import { RuntimeApprovalGate } from "@beep/agent-capability-use-cases/public"

console.log(RuntimeApprovalGate)
```

**Signature**

```ts
declare class RuntimeApprovalGate
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/agent-capability/use-cases/src/processes/ProfessionalRuntime/ProfessionalRuntime.contracts.ts#L246)

Since v0.0.0

## RuntimeCandidateClaim (class)

Candidate claim proposed by the runtime.

**Example**

```ts
import { RuntimeCandidateClaim } from "@beep/agent-capability-use-cases/public"

console.log(RuntimeCandidateClaim)
```

**Signature**

```ts
declare class RuntimeCandidateClaim
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/agent-capability/use-cases/src/processes/ProfessionalRuntime/ProfessionalRuntime.contracts.ts#L107)

Since v0.0.0

## RuntimeCandidateDraft (class)

Candidate draft proposed by the runtime.

**Example**

```ts
import { RuntimeCandidateDraft } from "@beep/agent-capability-use-cases/public"

console.log(RuntimeCandidateDraft)
```

**Signature**

```ts
declare class RuntimeCandidateDraft
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/agent-capability/use-cases/src/processes/ProfessionalRuntime/ProfessionalRuntime.contracts.ts#L215)

Since v0.0.0

## RuntimeCandidateProject (class)

Candidate project proposed by the runtime.

**Example**

```ts
import { RuntimeCandidateProject } from "@beep/agent-capability-use-cases/public"

console.log(RuntimeCandidateProject)
```

**Signature**

```ts
declare class RuntimeCandidateProject
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/agent-capability/use-cases/src/processes/ProfessionalRuntime/ProfessionalRuntime.contracts.ts#L137)

Since v0.0.0

## RuntimeCandidateTask (class)

Candidate task proposed by the runtime.

**Example**

```ts
import { RuntimeCandidateTask } from "@beep/agent-capability-use-cases/public"

console.log(RuntimeCandidateTask)
```

**Signature**

```ts
declare class RuntimeCandidateTask
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/agent-capability/use-cases/src/processes/ProfessionalRuntime/ProfessionalRuntime.contracts.ts#L164)

Since v0.0.0

## RuntimeContextPacketRequest (class)

Request section embedded in a context packet.

**Example**

```ts
import { RuntimeContextPacketRequest } from "@beep/agent-capability-use-cases/public"

console.log(RuntimeContextPacketRequest)
```

**Signature**

```ts
declare class RuntimeContextPacketRequest
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/agent-capability/use-cases/src/processes/ProfessionalRuntime/ProfessionalRuntime.contracts.ts#L275)

Since v0.0.0

## RuntimeDraftRecipient (class)

Recipient for a candidate draft.

**Example**

```ts
import { RuntimeDraftRecipient } from "@beep/agent-capability-use-cases/public"

console.log(RuntimeDraftRecipient)
```

**Signature**

```ts
declare class RuntimeDraftRecipient
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/agent-capability/use-cases/src/processes/ProfessionalRuntime/ProfessionalRuntime.contracts.ts#L192)

Since v0.0.0

## RuntimeEntityRef (class)

Lightweight reference to a vertical or runtime entity.

**Example**

```ts
import { RuntimeEntityRef } from "@beep/agent-capability-use-cases/public"

console.log(RuntimeEntityRef)
```

**Signature**

```ts
declare class RuntimeEntityRef
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/agent-capability/use-cases/src/processes/ProfessionalRuntime/ProfessionalRuntime.contracts.ts#L60)

Since v0.0.0

## RuntimeEvidenceRef (class)

Source evidence reference for a candidate output.

**Example**

```ts
import { RuntimeEvidenceRef } from "@beep/agent-capability-use-cases/public"

console.log(RuntimeEvidenceRef)
```

**Signature**

```ts
declare class RuntimeEvidenceRef
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/agent-capability/use-cases/src/processes/ProfessionalRuntime/ProfessionalRuntime.contracts.ts#L83)

Since v0.0.0

## RuntimeScope (class)

Scope for an SDK request.

**Example**

```ts
import { RuntimeScope } from "@beep/agent-capability-use-cases/public"

console.log(RuntimeScope)
```

**Signature**

```ts
declare class RuntimeScope
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/agent-capability/use-cases/src/processes/ProfessionalRuntime/ProfessionalRuntime.contracts.ts#L36)

Since v0.0.0

## RuntimeSourceArtifact (class)

Source artifact declared by a context packet.

**Example**

```ts
import { RuntimeSourceArtifact } from "@beep/agent-capability-use-cases/public"

console.log(RuntimeSourceArtifact)
```

**Signature**

```ts
declare class RuntimeSourceArtifact
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/agent-capability/use-cases/src/processes/ProfessionalRuntime/ProfessionalRuntime.contracts.ts#L321)

Since v0.0.0

## RuntimeSourceSpanRef (class)

Source span declared by a context packet source artifact.

**Example**

```ts
import { RuntimeSourceSpanRef } from "@beep/agent-capability-use-cases/public"

console.log(RuntimeSourceSpanRef)
```

**Signature**

```ts
declare class RuntimeSourceSpanRef
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/agent-capability/use-cases/src/processes/ProfessionalRuntime/ProfessionalRuntime.contracts.ts#L298)

Since v0.0.0

## RuntimeUsageRecord (class)

Runtime usage attribution included in a context packet.

**Example**

```ts
import { RuntimeUsageRecord } from "@beep/agent-capability-use-cases/public"

console.log(RuntimeUsageRecord)
```

**Signature**

```ts
declare class RuntimeUsageRecord
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/agent-capability/use-cases/src/processes/ProfessionalRuntime/ProfessionalRuntime.contracts.ts#L372)

Since v0.0.0

## SdkContextPacket (class)

Context packet returned to SDK clients.

**Example**

```ts
import { SdkContextPacket } from "@beep/agent-capability-use-cases/public"

console.log(SdkContextPacket)
```

**Signature**

```ts
declare class SdkContextPacket
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/agent-capability/use-cases/src/processes/ProfessionalRuntime/ProfessionalRuntime.contracts.ts#L397)

Since v0.0.0