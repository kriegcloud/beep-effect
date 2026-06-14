---
title: server.ts
nav_order: 10
parent: "@beep/architecture-lab-use-cases"
---

## server.ts overview

Public Worker use-case contract exports available to server code.

Since v0.0.0

---
## Exports Grouped by Category
- [repositories](#repositories)
  - ["./Worker.repository.js" (namespace export)](#workerrepositoryjs-namespace-export)
- [use-cases](#use-cases)
  - ["./index.js" (namespace export)](#indexjs-namespace-export)
  - [makeWorkerUseCases](#makeworkerusecases)
  - [toWorkerActionError](#toworkeractionerror)
---

# repositories

## "./Worker.repository.js" (namespace export)

Re-exports all named exports from the "./Worker.repository.js" module.

**Signature**

```ts
export * from "./Worker.repository.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/use-cases/src/entities/Worker/server.ts#L14)

Since v0.0.0

# use-cases

## "./index.js" (namespace export)

Re-exports all named exports from the "./index.js" module.

**Signature**

```ts
export * from "./index.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/use-cases/src/entities/Worker/server.ts#L7)

Since v0.0.0

## makeWorkerUseCases

Worker use-case factory exports.

**Signature**

```ts
declare const makeWorkerUseCases: (repository: WorkerRepositoryShape) => WorkerUseCasesShape
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/use-cases/src/entities/Worker/server.ts#L21)

Since v0.0.0

## toWorkerActionError

Worker use-case factory exports.

**Signature**

```ts
declare const toWorkerActionError: (error: WorkerRepositoryError) => WorkerActionError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/use-cases/src/entities/Worker/server.ts#L21)

Since v0.0.0