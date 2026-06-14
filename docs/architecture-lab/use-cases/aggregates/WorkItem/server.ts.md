---
title: server.ts
nav_order: 2
parent: "@beep/architecture-lab-use-cases"
---

## server.ts overview

Public WorkItem use-case contract exports available to server code.

Since v0.0.0

---
## Exports Grouped by Category
- [repositories](#repositories)
  - ["./WorkItem.repository.js" (namespace export)](#workitemrepositoryjs-namespace-export)
- [use-cases](#use-cases)
  - ["./index.js" (namespace export)](#indexjs-namespace-export)
  - [makeWorkItemUseCases](#makeworkitemusecases)
  - [toWorkItemActionError](#toworkitemactionerror)
---

# repositories

## "./WorkItem.repository.js" (namespace export)

Re-exports all named exports from the "./WorkItem.repository.js" module.

**Signature**

```ts
export * from "./WorkItem.repository.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/use-cases/src/aggregates/WorkItem/server.ts#L14)

Since v0.0.0

# use-cases

## "./index.js" (namespace export)

Re-exports all named exports from the "./index.js" module.

**Signature**

```ts
export * from "./index.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/use-cases/src/aggregates/WorkItem/server.ts#L7)

Since v0.0.0

## makeWorkItemUseCases

WorkItem server-side use-case factories.

**Signature**

```ts
declare const makeWorkItemUseCases: (repository: WorkItemRepositoryShape) => WorkItemUseCasesShape
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/use-cases/src/aggregates/WorkItem/server.ts#L21)

Since v0.0.0

## toWorkItemActionError

WorkItem server-side use-case factories.

**Signature**

```ts
declare const toWorkItemActionError: (error: WorkItemRepositoryError | WorkItemDomainError) => WorkItemActionError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/use-cases/src/aggregates/WorkItem/server.ts#L21)

Since v0.0.0