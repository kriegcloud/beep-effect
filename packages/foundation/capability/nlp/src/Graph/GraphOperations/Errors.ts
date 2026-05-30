/**
 * GraphOperations/Errors - failures raised during graph-operation execution.
 *
 * Ported from the `adjunct` repo (Effect v3) to Effect v4 / `@beep/nlp`:
 * each `Data.TaggedError` becomes a {@link @beep/schema#TaggedErrorClass} scoped
 * by a `$NlpId` composer, `unknown` cause fields become
 * `S.DefectWithStack`, and the `NodeId` brand is carried as `S.String`.
 *
 * @since 0.0.0
 * @packageDocumentation
 */

import { $NlpId } from "@beep/identity";
import { TaggedErrorClass } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $NlpId.create("Graph/GraphOperations/Errors");

/**
 * Operation cannot be applied to a node.
 *
 * @example
 * ```ts
 * import { ValidationError } from "@beep/nlp/Graph/GraphOperations/Errors"
 *
 * console.log(ValidationError)
 * ```
 *
 * @since 0.0.0
 * @category errors
 */
export class ValidationError extends TaggedErrorClass<ValidationError>($I`ValidationError`)(
  "ValidationError",
  {
    errors: S.Array(S.String),
    nodeId: S.String,
    operationName: S.String,
  },
  $I.annote("ValidationError", {
    description: "Raised when a graph operation cannot validly be applied to a node.",
  })
) {}

/**
 * Operation exceeded its time limit.
 *
 * @example
 * ```ts
 * import { TimeoutError } from "@beep/nlp/Graph/GraphOperations/Errors"
 *
 * console.log(TimeoutError)
 * ```
 *
 * @since 0.0.0
 * @category errors
 */
export class TimeoutError extends TaggedErrorClass<TimeoutError>($I`TimeoutError`)(
  "TimeoutError",
  {
    nodeId: S.String,
    operationName: S.String,
    timeoutMs: S.Number,
  },
  $I.annote("TimeoutError", {
    description: "Raised when a graph operation exceeds its configured time limit.",
  })
) {}

/**
 * Operation failed during execution.
 *
 * @example
 * ```ts
 * import { OperationError } from "@beep/nlp/Graph/GraphOperations/Errors"
 *
 * console.log(OperationError)
 * ```
 *
 * @since 0.0.0
 * @category errors
 */
export class OperationError extends TaggedErrorClass<OperationError>($I`OperationError`)(
  "OperationError",
  {
    cause: S.DefectWithStack,
    nodeId: S.String,
    operationName: S.String,
  },
  $I.annote("OperationError", {
    description: "Raised when a graph operation fails while being applied to a node.",
  })
) {}

/**
 * Invalid graph structure.
 *
 * @example
 * ```ts
 * import { GraphError } from "@beep/nlp/Graph/GraphOperations/Errors"
 *
 * console.log(GraphError)
 * ```
 *
 * @since 0.0.0
 * @category errors
 */
export class GraphError extends TaggedErrorClass<GraphError>($I`GraphError`)(
  "GraphError",
  {
    message: S.String,
    nodeId: S.OptionFromOptionalKey(S.String),
  },
  $I.annote("GraphError", {
    description: "Raised when a graph has an invalid structure for the requested operation.",
  })
) {}

/**
 * Failed to store or retrieve a cached result.
 *
 * @example
 * ```ts
 * import { StorageError } from "@beep/nlp/Graph/GraphOperations/Errors"
 *
 * console.log(StorageError)
 * ```
 *
 * @since 0.0.0
 * @category errors
 */
export class StorageError extends TaggedErrorClass<StorageError>($I`StorageError`)(
  "StorageError",
  {
    cause: S.DefectWithStack,
    operation: S.Literals(["store", "retrieve", "delete", "query"]),
  },
  $I.annote("StorageError", {
    description: "Raised when the result store fails to store, retrieve, delete, or query a result.",
  })
) {}

/**
 * General execution failure.
 *
 * @example
 * ```ts
 * import { ExecutionError } from "@beep/nlp/Graph/GraphOperations/Errors"
 *
 * console.log(ExecutionError)
 * ```
 *
 * @since 0.0.0
 * @category errors
 */
export class ExecutionError extends TaggedErrorClass<ExecutionError>($I`ExecutionError`)(
  "ExecutionError",
  {
    cause: S.OptionFromOptionalKey(S.DefectWithStack),
    message: S.String,
  },
  $I.annote("ExecutionError", {
    description: "Raised on a general graph-operation execution failure (e.g. an unknown strategy).",
  })
) {}

/**
 * Union of all graph-operation failures.
 *
 * @example
 * ```ts
 * import type { GraphOperationError } from "@beep/nlp/Graph/GraphOperations/Errors"
 *
 * type Example = GraphOperationError
 * ```
 *
 * @since 0.0.0
 * @category errors
 */
export type GraphOperationError =
  | ValidationError
  | TimeoutError
  | OperationError
  | GraphError
  | StorageError
  | ExecutionError;
