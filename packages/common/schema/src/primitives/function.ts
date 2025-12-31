import { $SchemaId } from "@beep/identity/packages";
import { variance } from "@beep/schema/core";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import type * as ParseResult from "effect/ParseResult";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";

const $I = $SchemaId.create("schema/primitives/function");

type FnOptions<IA, IE, OA, OE> = {
  readonly input: S.Schema<IA, IE>;
  readonly output: S.Schema<OA, OE>;
};

/**
 * Creates a validated function factory.
 * NOT a Schema - functions are not data to be validated.
 * Instead, this creates wrappers that validate inputs/outputs at runtime.
 *
 * @example
 * ```ts
 * const myFn = Fn({
 *   input: S.Number,
 *   output: S.String,
 * });
 *
 * // Effect-based (preferred)
 * const impl = myFn.implement((n) => n.toString());
 * Effect.runSync(impl(42)); // "42"
 *
 * // Sync (throws on error)
 * const implSync = myFn.implementSync((n) => n.toString());
 * implSync(42); // "42"
 * ```
 */
export const Fn = <IA, IE, OA, OE>(
  opts: FnOptions<IA, IE, OA, OE>,
  annotations?: undefined | S.Annotations.Schema<(args: IA) => OA>
) => {
  class Base extends S.declare((i: unknown): i is (args: IA) => OA => P.isFunction(i)).pipe(
    S.annotations({
      ...annotations,
    })
  ) {
    override [S.TypeId] = variance;
    static override [S.TypeId] = variance;
    /**
     * Wraps a pure handler with validation.
     * Returns a function that produces an Effect.
     */
    static readonly implement = (handler: (args: IA) => OA) => {
      return (input: unknown): Effect.Effect<OA, ParseResult.ParseError> =>
        F.pipe(input, S.decodeUnknown(opts.input), Effect.map(handler), Effect.flatMap(S.validate(opts.output)));
    };
    /**
     * Wraps an effectful handler with validation.
     */
    static readonly implementEffect = <E, R>(handler: (args: IA) => Effect.Effect<OA, E, R>) => {
      return (input: unknown): Effect.Effect<OA, ParseResult.ParseError | E, R> =>
        F.pipe(input, S.decodeUnknown(opts.input), Effect.flatMap(handler), Effect.flatMap(S.validate(opts.output)));
    };
    /**
     * Synchronous version (throws on validation errors).
     * Use when you need direct values without Effect wrapper.
     */
    static readonly implementSync = (handler: (args: IA) => OA) => {
      return (input: unknown): OA =>
        F.pipe(input, S.decodeUnknownSync(opts.input), handler, S.validateSync(opts.output));
    };
    // Expose schemas for external use (e.g., generating docs, introspection)
    static readonly inputSchema = opts.input;
    static readonly outputSchema = opts.output;
  }

  return Base;
};

export class AnyFn extends S.declare((u: unknown): u is Function => P.isFunction(u)).annotations(
  $I.annotations("AnyFn", {
    description: "Any function",
  })
) {}

export declare namespace AnyFn {
  export type Type = typeof AnyFn.Type;
}

export const ThunkOf = <A, I, R>(schema: S.Schema<A, I, R>) =>
  S.declare((u: unknown): u is () => S.Schema.Type<typeof schema> => P.isFunction(u));

export declare namespace ThunkOf {
  export type Type<A, I, R> = () => S.Schema.Type<S.Schema<A, I, R>>;
}
