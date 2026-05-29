/**
 * Operations - composable, schema-typed NLP operations.
 *
 * An algebra of operations (`A -> Effect<B, E, R>`) with schema-checked
 * boundaries: define operations ({@link Definition}) and compose them
 * functorially/monadically/applicatively ({@link Composable}).
 *
 * The `adjunct` serialization/AST-reconstruction layer (Serialization,
 * SchemaASTMatchers, OperationCompiler, the deprecated Registry) is intentionally
 * not ported — see `goals/nlp-adjunct-port/research/operations-serialization-gap.md`.
 *
 * @since 0.0.0
 * @packageDocumentation
 */

/**
 * Composable operation builders and the categorical combinators (map/flatMap/
 * product/zipWith/traverse/aggregate).
 *
 * @example
 * ```typescript
 * import { Composable } from "@beep/nlp/Operations"
 *
 * console.log(typeof Composable.makeOperation)
 * ```
 *
 * @since 0.0.0
 * @category operations
 */
export * as Composable from "./Composable.ts";
/**
 * Structured operation definitions (metadata + schemas + implementation).
 *
 * @example
 * ```typescript
 * import { Definition } from "@beep/nlp/Operations"
 *
 * type Op = Definition.OperationDefinition<never, never>
 * ```
 *
 * @since 0.0.0
 * @category operations
 */
export type * as Definition from "./Definition.ts";
