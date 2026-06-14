---
title: index.ts
nav_order: 5
parent: "@beep/workspace-tables"
---

## index.ts overview

CandidateDraft table metadata namespace.

**Example**

```ts
import { CandidateDraft } from "@beep/workspace-tables/entities"

console.log(CandidateDraft.Table.definition.tableName)
```

Since v0.0.0

---
## Exports Grouped by Category
- [tables](#tables)
  - [CandidateDraft (namespace export)](#candidatedraft-namespace-export)
  - [CandidateProject (namespace export)](#candidateproject-namespace-export)
---

# tables

## CandidateDraft (namespace export)

Re-exports all named exports from the "./CandidateDraft/index.ts" module as `CandidateDraft`.

**Example**

```ts
import { CandidateDraft } from "@beep/workspace-tables/entities"

console.log(CandidateDraft.Table.definition.tableName)
```

**Signature**

```ts
export * as CandidateDraft from "./CandidateDraft/index.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/workspace/tables/src/entities/index.ts#L21)

Since v0.0.0

## CandidateProject (namespace export)

Re-exports all named exports from the "./CandidateProject/index.ts" module as `CandidateProject`.

**Example**

```ts
import { CandidateProject } from "@beep/workspace-tables/entities"

console.log(CandidateProject.Table.definition.tableName)
```

**Signature**

```ts
export * as CandidateProject from "./CandidateProject/index.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/workspace/tables/src/entities/index.ts#L35)

Since v0.0.0