---
title: Errors.ts
nav_order: 21
parent: "@beep/nlp"
---

## Errors.ts overview

GraphOperations/Errors - failures raised during graph-operation execution.

Effect v4 `@beep/nlp` implementation notes:
each `Data.TaggedError` becomes a `@beep/schema#TaggedErrorClass` scoped
by a `$NlpId` composer, `unknown` cause fields become
`S.Defect({ includeStack: true })`, and the `NodeId` brand is carried as `S.String`.

Since v0.0.0

---
## Exports Grouped by Category
- [errors](#errors)
  - [ExecutionError (class)](#executionerror-class)
  - [GraphError (class)](#grapherror-class)
  - [GraphOperationError](#graphoperationerror)
  - [GraphOperationError (type alias)](#graphoperationerror-type-alias)
  - [OperationError (class)](#operationerror-class)
  - [StorageError (class)](#storageerror-class)
  - [TimeoutError (class)](#timeouterror-class)
  - [ValidationError (class)](#validationerror-class)
---

# errors

## ExecutionError (class)

Failure raised by the executor for orchestration problems.

**Example**

```ts
import { ExecutionError } from "@beep/nlp/Graph/GraphOperations/Errors"
import * as O from "effect/Option"

const error = ExecutionError.make({
  cause: O.none(),
  message: "Storage retrieve failed"
})

console.log(error.message) // "Storage retrieve failed"
```

**Signature**

```ts
declare class ExecutionError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/Errors.ts#L199)

Since v0.0.0

## GraphError (class)

Failure raised when graph structure is invalid for an operation.

**Example**

```ts
import { GraphError } from "@beep/nlp/Graph/GraphOperations/Errors"
import * as O from "effect/Option"

const error = GraphError.make({
  message: "Expected at least one leaf node",
  nodeId: O.some("node-root")
})

console.log(error.message) // "Expected at least one leaf node"
```

**Signature**

```ts
declare class GraphError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/Errors.ts#L136)

Since v0.0.0

## GraphOperationError

Schema union covering every graph-operation failure variant.

**Example**

```ts
import { GraphError, GraphOperationError } from "@beep/nlp/Graph/GraphOperations/Errors"
import * as O from "effect/Option"
import * as S from "effect/Schema"

const error = GraphError.make({ message: "Missing root", nodeId: O.none() })
console.log(S.is(GraphOperationError)(error)) // true
```

**Signature**

```ts
declare const GraphOperationError: AnnotatedSchema<S.Union<readonly [typeof ValidationError, typeof TimeoutError, typeof OperationError, typeof GraphError, typeof StorageError, typeof ExecutionError]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/Errors.ts#L231)

Since v0.0.0

## GraphOperationError (type alias)

Runtime type represented by `GraphOperationError`.

**Example**

```ts
import type { GraphOperationError } from "@beep/nlp/Graph/GraphOperations/Errors"
import { GraphError } from "@beep/nlp/Graph/GraphOperations/Errors"
import * as O from "effect/Option"

const error: GraphOperationError = GraphError.make({ message: "Missing root", nodeId: O.none() })
console.log(error._tag) // "GraphError"
```

**Signature**

```ts
type GraphOperationError = typeof GraphOperationError.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/Errors.ts#L260)

Since v0.0.0

## OperationError (class)

Failure raised when a node-level operation application defects.

**Example**

```ts
import { OperationError } from "@beep/nlp/Graph/GraphOperations/Errors"

const error = OperationError.make({
  operationName: "posTag",
  nodeId: "node-1",
  cause: new Error("backend defect")
})

console.log(error.operationName) // "posTag"
```

**Signature**

```ts
declare class OperationError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/Errors.ts#L105)

Since v0.0.0

## StorageError (class)

Failure raised by a result-store backend.

**Example**

```ts
import { StorageError } from "@beep/nlp/Graph/GraphOperations/Errors"

const error = StorageError.make({
  operation: "retrieve",
  cause: new Error("cache unavailable")
})

console.log(error.operation) // "retrieve"
```

**Signature**

```ts
declare class StorageError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/Errors.ts#L169)

Since v0.0.0

## TimeoutError (class)

Failure raised when an operation exceeds its configured timeout.

**Example**

```ts
import { TimeoutError } from "@beep/nlp/Graph/GraphOperations/Errors"

const error = TimeoutError.make({
  operationName: "extractEntities",
  nodeId: "node-1",
  timeoutMs: 1_000
})

console.log(error.timeoutMs) // 1000
```

**Signature**

```ts
declare class TimeoutError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/Errors.ts#L69)

Since v0.0.0

## ValidationError (class)

Failure raised when validation rejects an operation for a source node.

**Example**

```ts
import { ValidationError } from "@beep/nlp/Graph/GraphOperations/Errors"

const error = ValidationError.make({
  operationName: "tokenize",
  nodeId: "node-empty",
  errors: ["Node text is empty"]
})

console.log(error._tag) // "ValidationError"
```

**Signature**

```ts
declare class ValidationError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/Errors.ts#L38)

Since v0.0.0