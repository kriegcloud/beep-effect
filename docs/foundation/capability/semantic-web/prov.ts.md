---
title: prov.ts
nav_order: 12
parent: "@beep/semantic-web"
---

## prov.ts overview

Minimal stable PROV core and early extension tier for `@beep/semantic-web`.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [Activity (class)](#activity-class)
  - [Agent (class)](#agent-class)
  - [Association (class)](#association-class)
  - [Attribution (class)](#attribution-class)
  - [Collection (class)](#collection-class)
  - [Delegation (class)](#delegation-class)
  - [Derivation (class)](#derivation-class)
  - [End (class)](#end-class)
  - [Entity (class)](#entity-class)
  - [Generation (class)](#generation-class)
  - [LifecycleTimes (class)](#lifecycletimes-class)
  - [ObjectRef](#objectref)
  - [ObjectRef (type alias)](#objectref-type-alias)
  - [Organization (class)](#organization-class)
  - [Person (class)](#person-class)
  - [Plan (class)](#plan-class)
  - [PrimarySource (class)](#primarysource-class)
  - [ProvBundle (class)](#provbundle-class)
  - [ProvDateTime](#provdatetime)
  - [ProvDateTime (type alias)](#provdatetime-type-alias)
  - [ProvDateTimeEncoded](#provdatetimeencoded)
  - [ProvDateTimeEncoded (type alias)](#provdatetimeencoded-type-alias)
  - [ProvO](#provo)
  - [ProvO (type alias)](#provo-type-alias)
  - [ProvRecord](#provrecord)
  - [ProvRecord (type alias)](#provrecord-type-alias)
  - [Quotation (class)](#quotation-class)
  - [Revision (class)](#revision-class)
  - [SoftwareAgent (class)](#softwareagent-class)
  - [Start (class)](#start-class)
  - [Usage (class)](#usage-class)
---

# models

## Activity (class)

PROV activity.

**Example**

```ts
```typescript
import * as S from "effect/Schema"
import { Activity } from "@beep/semantic-web/prov"

const activity = S.decodeUnknownSync(Activity)({
  provType: "Activity",
  id: "activity:build"
})
console.log(activity.provType) // "Activity"
```
```

**Signature**

```ts
declare class Activity
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/prov.ts#L300)

Since v0.0.0

## Agent (class)

PROV agent.

**Example**

```ts
```typescript
import * as S from "effect/Schema"
import { Agent } from "@beep/semantic-web/prov"

const agent = S.decodeUnknownSync(Agent)({
  provType: "Agent",
  name: "CI"
})
console.log(agent.provType) // "Agent"
```
```

**Signature**

```ts
declare class Agent
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/prov.ts#L341)

Since v0.0.0

## Association (class)

PROV association relation.

**Example**

```ts
import { Association } from "@beep/semantic-web/prov"

console.log(Association)
```

**Signature**

```ts
declare class Association
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/prov.ts#L600)

Since v0.0.0

## Attribution (class)

PROV attribution relation.

**Example**

```ts
import { Attribution } from "@beep/semantic-web/prov"

console.log(Attribution)
```

**Signature**

```ts
declare class Attribution
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/prov.ts#L625)

Since v0.0.0

## Collection (class)

PROV collection.

**Example**

```ts
import { Collection } from "@beep/semantic-web/prov"

console.log(Collection)
```

**Signature**

```ts
declare class Collection
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/prov.ts#L440)

Since v0.0.0

## Delegation (class)

PROV delegation relation.

**Example**

```ts
import { Delegation } from "@beep/semantic-web/prov"

console.log(Delegation)
```

**Signature**

```ts
declare class Delegation
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/prov.ts#L649)

Since v0.0.0

## Derivation (class)

PROV derivation relation.

**Example**

```ts
import { Derivation } from "@beep/semantic-web/prov"

console.log(Derivation)
```

**Signature**

```ts
declare class Derivation
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/prov.ts#L674)

Since v0.0.0

## End (class)

PROV end relation.

**Example**

```ts
import { End } from "@beep/semantic-web/prov"

console.log(End)
```

**Signature**

```ts
declare class End
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/prov.ts#L795)

Since v0.0.0

## Entity (class)

PROV entity.

**Example**

```ts
```typescript
import * as S from "effect/Schema"
import { Entity } from "@beep/semantic-web/prov"

const entity = S.decodeUnknownSync(Entity)({
  provType: "Entity",
  id: "entity:artifact"
})
console.log(entity.provType) // "Entity"
```
```

**Signature**

```ts
declare class Entity
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/prov.ts#L254)

Since v0.0.0

## Generation (class)

PROV generation relation.

**Example**

```ts
import { Generation } from "@beep/semantic-web/prov"

console.log(Generation)
```

**Signature**

```ts
declare class Generation
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/prov.ts#L575)

Since v0.0.0

## LifecycleTimes (class)

Explicit lifecycle time fields retained outside plain PROV activity timestamps.

**Example**

```ts
import { LifecycleTimes } from "@beep/semantic-web/prov"

console.log(LifecycleTimes)
```

**Signature**

```ts
declare class LifecycleTimes
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/prov.ts#L210)

Since v0.0.0

## ObjectRef

PROV object reference encoded as an IRI, CURIE, or local identifier.

**Example**

```ts
```typescript
import * as S from "effect/Schema"
import { ObjectRef } from "@beep/semantic-web/prov"

const ref = S.decodeUnknownSync(ObjectRef)("prov:entity1")
console.log(ref) // "prov:entity1"
```
```

**Signature**

```ts
declare const ObjectRef: AnnotatedSchema<S.brand<S.String, "ProvObjectRef">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/prov.ts#L75)

Since v0.0.0

## ObjectRef (type alias)

Type for `ObjectRef`.

**Example**

```ts
import type { ObjectRef } from "@beep/semantic-web/prov"

const acceptObjectRef = (value: ObjectRef) => value
console.log(acceptObjectRef)
```

**Signature**

```ts
type ObjectRef = typeof ObjectRef.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/prov.ts#L105)

Since v0.0.0

## Organization (class)

PROV organization.

**Example**

```ts
import { Organization } from "@beep/semantic-web/prov"

console.log(Organization)
```

**Signature**

```ts
declare class Organization
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/prov.ts#L506)

Since v0.0.0

## Person (class)

PROV person.

**Example**

```ts
import { Person } from "@beep/semantic-web/prov"

console.log(Person)
```

**Signature**

```ts
declare class Person
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/prov.ts#L473)

Since v0.0.0

## Plan (class)

PROV plan.

**Example**

```ts
import { Plan } from "@beep/semantic-web/prov"

console.log(Plan)
```

**Signature**

```ts
declare class Plan
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/prov.ts#L407)

Since v0.0.0

## PrimarySource (class)

PROV primary-source relation.

**Example**

```ts
import { PrimarySource } from "@beep/semantic-web/prov"

console.log(PrimarySource)
```

**Signature**

```ts
declare class PrimarySource
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/prov.ts#L698)

Since v0.0.0

## ProvBundle (class)

Bounded provenance bundle exported by the semantic-web surface.

**Example**

```ts
```typescript
import * as S from "effect/Schema"
import { ProvBundle } from "@beep/semantic-web/prov"

const bundle = S.decodeUnknownSync(ProvBundle)({ records: [] })
console.log(bundle.records.length) // 0
```
```

**Signature**

```ts
declare class ProvBundle
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/prov.ts#L891)

Since v0.0.0

## ProvDateTime

PROV timestamp decoded to `DateTime.Utc`.

**Example**

```ts
import { ProvDateTime } from "@beep/semantic-web/prov"

console.log(ProvDateTime)
```

**Signature**

```ts
declare const ProvDateTime: AnnotatedSchema<S.compose<S.DateTimeUtcFromString, AnnotatedSchema<S.brand<S.String, "ProvDateTimeEncoded">>>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/prov.ts#L165)

Since v0.0.0

## ProvDateTime (type alias)

Type for `ProvDateTime`.

**Example**

```ts
import type { ProvDateTime } from "@beep/semantic-web/prov"

const acceptProvDateTime = (value: ProvDateTime) => value
console.log(acceptProvDateTime)
```

**Signature**

```ts
type ProvDateTime = typeof ProvDateTime.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/prov.ts#L195)

Since v0.0.0

## ProvDateTimeEncoded

Encoded PROV timestamp string.

**Example**

```ts
import { ProvDateTimeEncoded } from "@beep/semantic-web/prov"

console.log(ProvDateTimeEncoded)
```

**Signature**

```ts
declare const ProvDateTimeEncoded: AnnotatedSchema<S.brand<S.String, "ProvDateTimeEncoded">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/prov.ts#L120)

Since v0.0.0

## ProvDateTimeEncoded (type alias)

Type for `ProvDateTimeEncoded`.

**Example**

```ts
import type { ProvDateTimeEncoded } from "@beep/semantic-web/prov"

const acceptProvDateTimeEncoded = (value: ProvDateTimeEncoded) => value
console.log(acceptProvDateTimeEncoded)
```

**Signature**

```ts
type ProvDateTimeEncoded = typeof ProvDateTimeEncoded.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/prov.ts#L150)

Since v0.0.0

## ProvO

Public provenance entrypoint union.

**Example**

```ts
import { ProvO } from "@beep/semantic-web/prov"

console.log(ProvO)
```

**Signature**

```ts
declare const ProvO: AnnotatedSchema<S.Union<readonly [typeof ProvBundle, AnnotatedSchema<S.Union<readonly [typeof Entity, typeof Activity, typeof Agent, typeof SoftwareAgent, typeof Plan, typeof Collection, typeof Person, typeof Organization, typeof Usage, typeof Generation, typeof Association, typeof Attribution, typeof Delegation, typeof Derivation, typeof PrimarySource, typeof Quotation, typeof Revision, typeof Start, typeof End]>>]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/prov.ts#L925)

Since v0.0.0

## ProvO (type alias)

Type for `ProvO`.

**Example**

```ts
import type { ProvO } from "@beep/semantic-web/prov"

const acceptProvO = (value: ProvO) => value
console.log(acceptProvO)
```

**Signature**

```ts
type ProvO = typeof ProvO.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/prov.ts#L954)

Since v0.0.0

## ProvRecord

Public PROV record union for the stable semantic-web surface.

**Example**

```ts
```typescript
import * as S from "effect/Schema"
import { Agent, ProvRecord } from "@beep/semantic-web/prov"

const decoded = S.decodeUnknownSync(ProvRecord)({ provType: "Agent", name: "bob" })

if (S.is(Agent)(decoded)) {

}
```
```

**Signature**

```ts
declare const ProvRecord: AnnotatedSchema<S.Union<readonly [typeof Entity, typeof Activity, typeof Agent, typeof SoftwareAgent, typeof Plan, typeof Collection, typeof Person, typeof Organization, typeof Usage, typeof Generation, typeof Association, typeof Attribution, typeof Delegation, typeof Derivation, typeof PrimarySource, typeof Quotation, typeof Revision, typeof Start, typeof End]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/prov.ts#L825)

Since v0.0.0

## ProvRecord (type alias)

Type for `ProvRecord`.

**Example**

```ts
import type { ProvRecord } from "@beep/semantic-web/prov"

const acceptProvRecord = (value: ProvRecord) => value
console.log(acceptProvRecord)
```

**Signature**

```ts
type ProvRecord = typeof ProvRecord.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/prov.ts#L874)

Since v0.0.0

## Quotation (class)

PROV quotation relation.

**Example**

```ts
import { Quotation } from "@beep/semantic-web/prov"

console.log(Quotation)
```

**Signature**

```ts
declare class Quotation
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/prov.ts#L722)

Since v0.0.0

## Revision (class)

PROV revision relation.

**Example**

```ts
import { Revision } from "@beep/semantic-web/prov"

console.log(Revision)
```

**Signature**

```ts
declare class Revision
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/prov.ts#L746)

Since v0.0.0

## SoftwareAgent (class)

PROV software agent.

**Example**

```ts
import { SoftwareAgent } from "@beep/semantic-web/prov"

console.log(SoftwareAgent)
```

**Signature**

```ts
declare class SoftwareAgent
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/prov.ts#L374)

Since v0.0.0

## Start (class)

PROV start relation.

**Example**

```ts
import { Start } from "@beep/semantic-web/prov"

console.log(Start)
```

**Signature**

```ts
declare class Start
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/prov.ts#L770)

Since v0.0.0

## Usage (class)

PROV usage relation.

**Example**

```ts
import { Usage } from "@beep/semantic-web/prov"

console.log(Usage)
```

**Signature**

```ts
declare class Usage
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/prov.ts#L550)

Since v0.0.0