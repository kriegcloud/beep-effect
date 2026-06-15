---
title: index.ts
nav_order: 25
parent: "@beep/shared-domain"
---

## index.ts overview

The shared domain identity module - Contains modules for slice entity ids.

Since v0.0.0

---
## Exports Grouped by Category
- [entity-ids](#entity-ids)
  - [AgentCapability (namespace export)](#agentcapability-namespace-export)
  - [Epistemic (namespace export)](#epistemic-namespace-export)
  - [LawPractice (namespace export)](#lawpractice-namespace-export)
  - [Shared (namespace export)](#shared-namespace-export)
  - [WealthManagement (namespace export)](#wealthmanagement-namespace-export)
  - [Workspace (namespace export)](#workspace-namespace-export)
- [guards](#guards)
  - [isIdentityComposer](#isidentitycomposer)
- [models](#models)
  - [AnyIdentityComposer (type alias)](#anyidentitycomposer-type-alias)
- [schemas](#schemas)
  - [AnyIdentityComposer](#anyidentitycomposer)
---

# entity-ids

## AgentCapability (namespace export)

Re-exports all named exports from the "./AgentCapability.ts" module as `AgentCapability`.

**Example**

```ts
import * as AgentCapability from "@beep/shared-domain/identity/AgentCapability"

console.log(AgentCapability.AgentId.tableName)
```

**Signature**

```ts
export * as AgentCapability from "./AgentCapability.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/index.ts#L150)

Since v0.0.0

## Epistemic (namespace export)

Re-exports all named exports from the "./Epistemic.ts" module as `Epistemic`.

**Example**

```ts
import * as Epistemic from "@beep/shared-domain/identity/Epistemic"

console.log(Epistemic.CandidateClaimId.tableName)
```

**Signature**

```ts
export * as Epistemic from "./Epistemic.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/index.ts#L164)

Since v0.0.0

## LawPractice (namespace export)

Re-exports all named exports from the "./LawPractice.ts" module as `LawPractice`.

**Example**

```ts
import * as LawPractice from "@beep/shared-domain/identity/LawPractice"

console.log(LawPractice.LegalClientId.tableName)
```

**Signature**

```ts
export * as LawPractice from "./LawPractice.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/index.ts#L178)

Since v0.0.0

## Shared (namespace export)

Re-exports all named exports from the "./Shared.ts" module as `Shared`.

**Example**

```ts
import * as Shared from "@beep/shared-domain/identity/Shared"

console.log(Shared.OrganizationId.tableName)
```

**Signature**

```ts
export * as Shared from "./Shared.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/index.ts#L192)

Since v0.0.0

## WealthManagement (namespace export)

Re-exports all named exports from the "./WealthManagement.ts" module as `WealthManagement`.

**Example**

```ts
import * as WealthManagement from "@beep/shared-domain/identity/WealthManagement"

console.log(WealthManagement.HouseholdId.tableName)
```

**Signature**

```ts
export * as WealthManagement from "./WealthManagement.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/index.ts#L206)

Since v0.0.0

## Workspace (namespace export)

Re-exports all named exports from the "./Workspace.ts" module as `Workspace`.

**Example**

```ts
import * as Workspace from "@beep/shared-domain/identity/Workspace"

console.log(Workspace.WorkspaceId.tableName)
```

**Signature**

```ts
export * as Workspace from "./Workspace.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/index.ts#L220)

Since v0.0.0

# guards

## isIdentityComposer

Guard for runtime identity composer values.

**Example**

```ts
import { $SharedDomainId } from "@beep/identity"
import { isIdentityComposer } from "@beep/shared-domain/identity"

console.log(isIdentityComposer($SharedDomainId)) // true
console.log(isIdentityComposer({ identifier: "@beep/shared-domain" })) // false
```

**Signature**

```ts
declare const isIdentityComposer: (value: unknown) => value is IdentityComposerType<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/index.ts#L81)

Since v0.0.0

# models

## AnyIdentityComposer (type alias)

Runtime type for `AnyIdentityComposer`.

**Example**

```ts
import type { AnyIdentityComposer } from "@beep/shared-domain/identity"

const readIdentifier = (composer: AnyIdentityComposer) => composer.identifier
console.log(readIdentifier)
```

**Signature**

```ts
type AnyIdentityComposer = typeof AnyIdentityComposer.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/index.ts#L135)

Since v0.0.0

# schemas

## AnyIdentityComposer

Effect Schema for validating any runtime `IdentityComposerType` value.

**Example**

```ts
import { $SharedDomainId } from "@beep/identity"
import { AnyIdentityComposer } from "@beep/shared-domain/identity"
import * as S from "effect/Schema"

const isComposer = S.is(AnyIdentityComposer)

console.log(isComposer($SharedDomainId)) // true
```

**Signature**

```ts
declare const AnyIdentityComposer: AnnotatedSchema<S.declare<IdentityComposerType<string>, IdentityComposerType<string>>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/index.ts#L115)

Since v0.0.0