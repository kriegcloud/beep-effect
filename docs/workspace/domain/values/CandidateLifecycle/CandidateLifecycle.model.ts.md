---
title: CandidateLifecycle.model.ts
nav_order: 26
parent: "@beep/workspace-domain"
---

## CandidateLifecycle.model.ts overview

Workspace candidate lifecycle value schemas.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [CandidateLifecycle (type alias)](#candidatelifecycle-type-alias)
- [schemas](#schemas)
  - [CandidateLifecycle](#candidatelifecycle)
---

# models

## CandidateLifecycle (type alias)

Runtime type for `CandidateLifecycle`.

**Example**

```ts
import type { CandidateLifecycle } from "@beep/workspace-domain"

const value: CandidateLifecycle = "candidate"
console.log(value)
```

**Signature**

```ts
type CandidateLifecycle = typeof CandidateLifecycle.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/workspace/domain/src/values/CandidateLifecycle/CandidateLifecycle.model.ts#L45)

Since v0.0.0

# schemas

## CandidateLifecycle

Candidate lifecycle vocabulary for proof outputs.

**Example**

```ts
import { CandidateLifecycle } from "@beep/workspace-domain"

console.log(CandidateLifecycle.is.candidate("candidate"))
```

**Signature**

```ts
declare const CandidateLifecycle: AnnotatedSchema<LiteralKit<readonly ["candidate"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/workspace/domain/src/values/CandidateLifecycle/CandidateLifecycle.model.ts#L25)

Since v0.0.0