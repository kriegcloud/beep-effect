---
title: Reuse.model.ts
nav_order: 42
parent: "@beep/repo-utils"
---

## Reuse.model.ts overview

Reuse-catalog domain models and request/response schemas.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [ReuseCandidate (class)](#reusecandidate-class)
  - [ReuseCandidateKind](#reusecandidatekind)
  - [ReuseCandidateKind (type alias)](#reusecandidatekind-type-alias)
  - [ReuseCatalogEntry (class)](#reusecatalogentry-class)
  - [ReuseCatalogOrigin](#reusecatalogorigin)
  - [ReuseCatalogOrigin (type alias)](#reusecatalogorigin-type-alias)
  - [ReuseFindResult (class)](#reusefindresult-class)
  - [ReuseInventory (class)](#reuseinventory-class)
  - [ReusePacket (class)](#reusepacket-class)
  - [ReusePartitionPlan (class)](#reusepartitionplan-class)
  - [ReuseSourceSymbolRef (class)](#reusesourcesymbolref-class)
  - [ReuseWorkUnit (class)](#reuseworkunit-class)
  - [ReuseWorkUnitKind](#reuseworkunitkind)
  - [ReuseWorkUnitKind (type alias)](#reuseworkunitkind-type-alias)
---

# models

## ReuseCandidate (class)

Ranked reuse candidate inventory item.

**Example**

```ts
import { ReuseCandidate } from "@beep/repo-utils/Reuse/Reuse.model"
const candidate = ReuseCandidate.make({
  blockingConcerns: [],
  candidateId: "candidate:extract-schema",
  catalogMatchIds: [],
  confidence: 0.8,
  evidence: ["Duplicate schema shape."],
  implementationSteps: ["Extract shared schema."],
  kind: "extract-schema",
  proposedDestinationModule: "src/shared.ts",
  proposedDestinationPackage: "@beep/repo-utils",
  recommendedAction: "Extract schema.",
  sourceScopes: ["packages/tooling/library/repo-utils"],
  sourceSymbols: [],
  title: "Extract shared schema",
  verificationCommands: ["bun test"]
})
console.log(candidate.candidateId)
```

**Signature**

```ts
declare class ReuseCandidate
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/Reuse/Reuse.model.ts#L290)

Since v0.0.0

## ReuseCandidateKind

Candidate kind domain for inventory items.

**Example**

```ts
import { ReuseCandidateKind } from "@beep/repo-utils/Reuse/Reuse.model"
const schema = ReuseCandidateKind
console.log(schema)
```

**Signature**

```ts
declare const ReuseCandidateKind: AnnotatedSchema<LiteralKit<readonly ["extract-function", "extract-schema", "extract-type", "replace-with-existing", "structural-clone", "near-miss-clone"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/Reuse/Reuse.model.ts#L104)

Since v0.0.0

## ReuseCandidateKind (type alias)

Runtime type for `ReuseCandidateKind`.

**Example**

```ts
import type { ReuseCandidateKind } from "@beep/repo-utils/Reuse/Reuse.model"
const kind: ReuseCandidateKind = "extract-schema"
console.log(kind)
```

**Signature**

```ts
type ReuseCandidateKind = typeof ReuseCandidateKind.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/Reuse/Reuse.model.ts#L122)

Since v0.0.0

## ReuseCatalogEntry (class)

Catalog entry describing an existing reusable symbol or curated pattern.

**Example**

```ts
import { ReuseCatalogEntry } from "@beep/repo-utils/Reuse/Reuse.model"
import * as O from "effect/Option"
const entry = ReuseCatalogEntry.make({
  applicability: ["schema models"],
  id: "repo-utils:ReuseCatalogEntry",
  keywords: ["reuse"],
  modulePath: "Reuse/Reuse.model",
  origin: "repo-tooling",
  packageName: "@beep/repo-utils",
  packagePath: "packages/tooling/library/repo-utils",
  summary: O.some("Reusable catalog entry model."),
  symbolKind: "class",
  symbolName: "ReuseCatalogEntry"
})
console.log(entry.id)
```

**Signature**

```ts
declare class ReuseCatalogEntry
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/Reuse/Reuse.model.ts#L177)

Since v0.0.0

## ReuseCatalogOrigin

Catalog entry origin domain.

**Example**

```ts
import { ReuseCatalogOrigin } from "@beep/repo-utils/Reuse/Reuse.model"
const schema = ReuseCatalogOrigin
console.log(schema)
```

**Signature**

```ts
declare const ReuseCatalogOrigin: AnnotatedSchema<S.Union<readonly [S.Literal<"repo-foundation">, S.Literal<"repo-tooling">, S.Literal<"effect-v4-curated">]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/Reuse/Reuse.model.ts#L27)

Since v0.0.0

## ReuseCatalogOrigin (type alias)

Runtime type for `ReuseCatalogOrigin`.

**Example**

```ts
import type { ReuseCatalogOrigin } from "@beep/repo-utils/Reuse/Reuse.model"
const origin: ReuseCatalogOrigin = "repo-foundation"
console.log(origin)
```

**Signature**

```ts
type ReuseCatalogOrigin = typeof ReuseCatalogOrigin.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/Reuse/Reuse.model.ts#L49)

Since v0.0.0

## ReuseFindResult (class)

Results for local-file reuse lookups.

**Example**

```ts
import { ReuseFindResult } from "@beep/repo-utils/Reuse/Reuse.model"
import * as O from "effect/Option"
const result = ReuseFindResult.make({
  filePath: "src/example.ts",
  query: O.some("schema"),
  symbolId: O.none()
})
console.log(result.filePath)
```

**Signature**

```ts
declare class ReuseFindResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/Reuse/Reuse.model.ts#L407)

Since v0.0.0

## ReuseInventory (class)

Inventory payload produced for a requested scope.

**Example**

```ts
import { NonNegativeInt } from "@beep/schema"
import { ReuseInventory } from "@beep/repo-utils/Reuse/Reuse.model"
import * as S from "effect/Schema"

const zero = S.decodeUnknownSync(NonNegativeInt)(0)
const inventory = ReuseInventory.make({
  candidateCount: zero,
  catalogEntryCount: zero,
  generatedAt: "2026-04-21T00:00:00.000Z",
  scopeSelector: "packages/tooling/library/repo-utils"
})
console.log(inventory.candidateCount)
```

**Signature**

```ts
declare class ReuseInventory
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/Reuse/Reuse.model.ts#L333)

Since v0.0.0

## ReusePacket (class)

Materialized implementation packet for one reuse candidate.

**Example**

```ts
import { ReuseCandidate, ReusePacket } from "@beep/repo-utils/Reuse/Reuse.model"
const candidate = ReuseCandidate.make({
  blockingConcerns: [],
  candidateId: "candidate:extract-schema",
  catalogMatchIds: [],
  confidence: 0.8,
  evidence: ["Duplicate schema shape."],
  implementationSteps: ["Extract shared schema."],
  kind: "extract-schema",
  proposedDestinationModule: "src/shared.ts",
  proposedDestinationPackage: "@beep/repo-utils",
  recommendedAction: "Extract schema.",
  sourceScopes: ["packages/tooling/library/repo-utils"],
  sourceSymbols: [],
  title: "Extract shared schema",
  verificationCommands: ["bun test"]
})
const packet = ReusePacket.make({ candidate })
console.log(packet.candidate)
```

**Signature**

```ts
declare class ReusePacket
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/Reuse/Reuse.model.ts#L377)

Since v0.0.0

## ReusePartitionPlan (class)

Partition plan covering scout and specialist work units for a selected scope.

**Example**

```ts
import { NonNegativeInt } from "@beep/schema"
import { ReusePartitionPlan } from "@beep/repo-utils/Reuse/Reuse.model"
import * as S from "effect/Schema"

const zero = S.decodeUnknownSync(NonNegativeInt)(0)
const plan = ReusePartitionPlan.make({
  catalogEntryCount: zero,
  scopeSelector: "packages/tooling/library/repo-utils"
})
console.log(plan.scopeSelector)
```

**Signature**

```ts
declare class ReusePartitionPlan
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/Reuse/Reuse.model.ts#L245)

Since v0.0.0

## ReuseSourceSymbolRef (class)

File-local source symbol reference tied to a reuse opportunity.

**Example**

```ts
import { ReuseSourceSymbolRef } from "@beep/repo-utils/Reuse/Reuse.model"
const ref = ReuseSourceSymbolRef.make({
  filePath: "src/example.ts",
  symbolId: "src/example.ts#makeExample",
  symbolKind: "function",
  symbolName: "makeExample"
})
console.log(ref.symbolName)
```

**Signature**

```ts
declare class ReuseSourceSymbolRef
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/Reuse/Reuse.model.ts#L141)

Since v0.0.0

## ReuseWorkUnit (class)

Partition work unit emitted for package scouts or hotspot specialists.

**Example**

```ts
import { ReuseWorkUnit } from "@beep/repo-utils/Reuse/Reuse.model"
const unit = ReuseWorkUnit.make({
  id: "scout:repo-utils",
  kind: "scout",
  label: "Repo utils scan",
  rationale: "Find reuse candidates.",
  scopeSelector: "packages/tooling/library/repo-utils"
})
console.log(unit.kind)
```

**Signature**

```ts
declare class ReuseWorkUnit
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/Reuse/Reuse.model.ts#L213)

Since v0.0.0

## ReuseWorkUnitKind

Partition work-unit kind.

**Example**

```ts
import { ReuseWorkUnitKind } from "@beep/repo-utils/Reuse/Reuse.model"
const schema = ReuseWorkUnitKind
console.log(schema)
```

**Signature**

```ts
declare const ReuseWorkUnitKind: AnnotatedSchema<LiteralKit<readonly ["scout", "specialist"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/Reuse/Reuse.model.ts#L63)

Since v0.0.0

## ReuseWorkUnitKind (type alias)

Runtime type for `ReuseWorkUnitKind`.

**Example**

```ts
import type { ReuseWorkUnitKind } from "@beep/repo-utils/Reuse/Reuse.model"
const kind: ReuseWorkUnitKind = "scout"
console.log(kind)
```

**Signature**

```ts
type ReuseWorkUnitKind = typeof ReuseWorkUnitKind.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/Reuse/Reuse.model.ts#L81)

Since v0.0.0