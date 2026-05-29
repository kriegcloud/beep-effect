/**
 * Operations/Composable - composable NLP operations as Kleisli arrows.
 *
 * An {@link OperationBuilder} wraps an effectful arrow `A -> Effect<B, E, R>` with
 * its input/output schemas, exposing the categorical combinators: `map` (Functor),
 * `flatMap` (Monad), `product`/`zipWith` (Applicative), plus traversal helpers.
 * `run` applies the arrow to a typed input; the schemas are carried as metadata.
 *
 * Ported from the `adjunct` repo (Effect v3) to Effect v4 / `@beep/nlp`:
 * - the `@effect/typeclass` instances (Foldable/SemiApplicative/Traversable) are
 *   reimplemented on core `effect` (`Effect.zipWith`/`Effect.all`/`Effect.forEach`
 *   and `Monoid` from {@link @beep/nlp/Algebra/Monoid}), since `@effect/typeclass`
 *   is not a dependency here.
 * - the builder is parameterized by the DECODED value types `A`/`B` (schemas carried
 *   as `Schema.Schema<A>`/`Schema.Schema<B>`), avoiding `any` and the v4 schema
 *   variance (`DecodingServices`/tuple optionality) that leaks through `Schema.Top`.
 * - adjunct's `{} as Schema.Schema.Type<OutputSchema>` dummy-input hack in `flatMap`
 *   is gone: `flatMap` takes the next operation directly, so no fake value is
 *   constructed and there are no casts.
 * - `run` applies the (already typed `A`) input directly; the input/output schemas
 *   are carried as introspection metadata. adjunct's redundant decode-on-run is
 *   dropped because re-decoding a typed value would leak the schema's
 *   `DecodingServices` into the requirements channel.
 *
 * @since 0.0.0
 * @packageDocumentation
 */

import { A } from "@beep/utils";
import * as Effect from "effect/Effect";
import type * as S from "effect/Schema";
import type * as Monoid from "../Algebra/Monoid.ts";
import type { OperationDefinition } from "./Definition.ts";

/**
 * An effectful arrow from `A` to `B` requiring context `R` and failing with `E`.
 *
 * @since 0.0.0
 * @category models
 */
export type NLPOperation<A, B, R = never, E = never> = (input: A) => Effect.Effect<B, E, R>;

/**
 * A composable operation carrying its input/output schemas alongside its arrow,
 * parameterized by the decoded value types `A` (input) and `B` (output).
 *
 * @since 0.0.0
 * @category models
 */
export class OperationBuilder<A, B, R = never, E = never> {
  readonly operation: NLPOperation<A, B, R, E>;
  readonly inputSchema: S.Schema<A>;
  readonly outputSchema: S.Schema<B>;
  readonly name: string;

  constructor(operation: NLPOperation<A, B, R, E>, inputSchema: S.Schema<A>, outputSchema: S.Schema<B>, name: string) {
    this.operation = operation;
    this.inputSchema = inputSchema;
    this.outputSchema = outputSchema;
    this.name = name;
  }

  /**
   * Execute the operation on a typed input.
   *
   * @since 0.0.0
   * @category execution
   */
  run(input: A): Effect.Effect<B, E, R> {
    return this.operation(input);
  }

  /**
   * Functor map: transform the result, supplying the new output schema.
   *
   * @since 0.0.0
   * @category combinators
   */
  map<C>(f: (b: B) => C, outputSchema: S.Schema<C>): OperationBuilder<A, C, R, E> {
    return new OperationBuilder(
      (input) => Effect.map(this.operation(input), f),
      this.inputSchema,
      outputSchema,
      `${this.name}.map`
    );
  }

  /**
   * Monad flatMap: sequence into a dependent operation whose input is this
   * operation's output. The next operation's output schema becomes the result's.
   *
   * @since 0.0.0
   * @category combinators
   */
  flatMap<C, R2, E2>(next: OperationBuilder<B, C, R2, E2>): OperationBuilder<A, C, R | R2, E | E2> {
    return new OperationBuilder(
      (input) => Effect.flatMap(this.operation(input), (result) => next.run(result)),
      this.inputSchema,
      next.outputSchema,
      `${this.name}.flatMap`
    );
  }

  /**
   * Applicative product: run both operations on the same input, pairing results.
   *
   * @since 0.0.0
   * @category combinators
   */
  product<C, R2, E2>(
    that: OperationBuilder<A, C, R2, E2>,
    outputSchema: S.Schema<readonly [B, C]>
  ): OperationBuilder<A, readonly [B, C], R | R2, E | E2> {
    return new OperationBuilder(
      (input) => Effect.all([this.operation(input), that.operation(input)]),
      this.inputSchema,
      outputSchema,
      `${this.name}x${that.name}`
    );
  }

  /**
   * Applicative zipWith: run both operations on the same input, combining results.
   *
   * @since 0.0.0
   * @category combinators
   */
  zipWith<C, D, R2, E2>(
    that: OperationBuilder<A, C, R2, E2>,
    f: (b: B, c: C) => D,
    resultSchema: S.Schema<D>
  ): OperationBuilder<A, D, R | R2, E | E2> {
    return new OperationBuilder(
      (input) => Effect.zipWith(this.operation(input), that.operation(input), f),
      this.inputSchema,
      resultSchema,
      `${this.name}zip${that.name}`
    );
  }
}

/**
 * Build an {@link OperationBuilder} from name, schemas, and an effectful arrow.
 *
 * @example
 * ```ts
 * import { makeOperation } from "@beep/nlp/Operations/Composable"
 * import * as S from "effect/Schema"
 * import * as Effect from "effect/Effect"
 *
 * console.log(makeOperation("len", S.String, S.Number, (s) => Effect.succeed(s.length)).name)
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const makeOperation = <A, B, R = never, E = never>(
  name: string,
  inputSchema: S.Schema<A>,
  outputSchema: S.Schema<B>,
  f: NLPOperation<A, B, R, E>
): OperationBuilder<A, B, R, E> => new OperationBuilder(f, inputSchema, outputSchema, name);

/**
 * Build an {@link OperationBuilder} from a structured {@link OperationDefinition}.
 *
 * @example
 * ```ts
 * import { fromDefinition } from "@beep/nlp/Operations/Composable"
 * import * as S from "effect/Schema"
 * import * as Effect from "effect/Effect"
 *
 * console.log(fromDefinition({ name: "id", inputSchema: S.String, outputSchema: S.String, implementation: Effect.succeed }).name)
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const fromDefinition = <A, B, R, E>(definition: OperationDefinition<A, B, R, E>): OperationBuilder<A, B, R, E> =>
  new OperationBuilder(definition.implementation, definition.inputSchema, definition.outputSchema, definition.name);

/**
 * Build a pure (context-free, infallible) operation from a plain function.
 *
 * @example
 * ```ts
 * import { makePureOperation } from "@beep/nlp/Operations/Composable"
 * import * as S from "effect/Schema"
 *
 * console.log(makePureOperation("upper", S.String, S.String, (s) => s.toUpperCase()).name)
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const makePureOperation = <A, B>(
  name: string,
  inputSchema: S.Schema<A>,
  outputSchema: S.Schema<B>,
  f: (input: A) => B
): OperationBuilder<A, B> => new OperationBuilder((input) => Effect.succeed(f(input)), inputSchema, outputSchema, name);

/**
 * Sequential composition: feed the first operation's output into the second.
 *
 * @since 0.0.0
 * @category combinators
 */
export const compose = <A, B, C, R1, E1, R2, E2>(
  first: OperationBuilder<A, B, R1, E1>,
  second: OperationBuilder<B, C, R2, E2>
): OperationBuilder<A, C, R1 | R2, E1 | E2> => first.flatMap(second);

/**
 * The identity operation: returns its input unchanged.
 *
 * @example
 * ```ts
 * import { identity } from "@beep/nlp/Operations/Composable"
 * import * as S from "effect/Schema"
 *
 * console.log(identity(S.String).name)
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const identity = <A>(schema: S.Schema<A>): OperationBuilder<A, A> =>
  makePureOperation("identity", schema, schema, (a) => a);

/**
 * Traverse an array of inputs through an operation, collecting decoded results.
 *
 * @since 0.0.0
 * @category traversal
 */
export const traverse =
  <A, B, R, E>(operation: OperationBuilder<A, B, R, E>) =>
  (inputs: ReadonlyArray<A>): Effect.Effect<ReadonlyArray<B>, E, R> =>
    Effect.forEach(inputs, (input) => operation.run(input));

/**
 * Aggregate an array of values into a single value using a {@link Monoid.Monoid}.
 *
 * @since 0.0.0
 * @category aggregation
 */
export const aggregate =
  <A, M>(monoid: Monoid.Monoid<M>, f: (a: A) => M) =>
  (values: ReadonlyArray<A>): M =>
    A.reduce(values, monoid.empty, (acc, a) => monoid.combine(acc, f(a)));
