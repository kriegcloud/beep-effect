---
title: server.ts
nav_order: 7
parent: "@beep/canvas-use-cases"
---

## server.ts overview

Server-only CanvasProject repository exports.

Since v0.0.0

---
## Exports Grouped by Category
- [repositories](#repositories)
  - ["./CanvasProject.repository.js" (namespace export)](#canvasprojectrepositoryjs-namespace-export)
- [use-cases](#use-cases)
  - ["./index.js" (namespace export)](#indexjs-namespace-export)
  - [makeCanvasProjectUseCases](#makecanvasprojectusecases)
  - [toCanvasProjectActionError](#tocanvasprojectactionerror)
---

# repositories

## "./CanvasProject.repository.js" (namespace export)

Re-exports all named exports from the "./CanvasProject.repository.js" module.

**Signature**

```ts
export * from "./CanvasProject.repository.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/use-cases/src/aggregates/CanvasProject/server.ts#L14)

Since v0.0.0

# use-cases

## "./index.js" (namespace export)

Re-exports all named exports from the "./index.js" module.

**Signature**

```ts
export * from "./index.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/use-cases/src/aggregates/CanvasProject/server.ts#L28)

Since v0.0.0

## makeCanvasProjectUseCases

CanvasProject server-side use-case factories.

**Signature**

```ts
declare const makeCanvasProjectUseCases: (repository: CanvasProjectRepositoryShape) => CanvasProjectUseCasesShape
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/use-cases/src/aggregates/CanvasProject/server.ts#L21)

Since v0.0.0

## toCanvasProjectActionError

CanvasProject server-side use-case factories.

**Signature**

```ts
declare const toCanvasProjectActionError: (error: CanvasProjectRepositoryError | CanvasProjectDomainError) => CanvasProjectActionError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/use-cases/src/aggregates/CanvasProject/server.ts#L21)

Since v0.0.0