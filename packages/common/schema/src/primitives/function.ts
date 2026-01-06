import { $SchemaId } from "@beep/identity/packages";
import { variance } from "@beep/schema/core";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import type * as ParseResult from "effect/ParseResult";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";

const $I = $SchemaId.create("schema/primitives/function");

export type FnOptions<IA, IE, OA, OE> = {
  readonly input: S.Schema<IA, IE>;
  readonly output: S.Schema<OA, OE>;
};

/**
 * Static methods added to FnSchema classes.
 */
export interface FnSchemaStatics<IA, IE, OA, OE> {
  readonly [S.TypeId]: typeof variance;
  /**
   * Wraps a pure handler with validation.
   * Returns a function that produces an Effect.
   */
  readonly implement: (handler: (args: IA) => OA) => (input: unknown) => Effect.Effect<OA, ParseResult.ParseError>;
  /**
   * Wraps an effectful handler with validation.
   */
  readonly implementEffect: <E, R>(
    handler: (args: IA) => Effect.Effect<OA, E, R>
  ) => (input: unknown) => Effect.Effect<OA, ParseResult.ParseError | E, R>;
  /**
   * Synchronous version (throws on validation errors).
   */
  readonly implementSync: (handler: (args: IA) => OA) => (input: unknown) => OA;
  /** The input schema for validation */
  readonly inputSchema: S.Schema<IA, IE>;
  /** The output schema for validation */
  readonly outputSchema: S.Schema<OA, OE>;
}

/**
 * Interface describing the return type of `Fn`.
 * Explicitly exported so TypeScript can name it in declaration files.
 */
export type FnSchema<IA, IE, OA, OE> = S.Schema<(args: IA) => OA, (args: IA) => OA> & FnSchemaStatics<IA, IE, OA, OE>;

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
): FnSchema<IA, IE, OA, OE> => {
  const baseSchema = S.declare((i: unknown): i is (args: IA) => OA => P.isFunction(i)).pipe(
    S.annotations({ ...annotations })
  );

  const statics: FnSchemaStatics<IA, IE, OA, OE> = {
    [S.TypeId]: variance,
    implement:
      (handler: (args: IA) => OA) =>
      (input: unknown): Effect.Effect<OA, ParseResult.ParseError> =>
        F.pipe(input, S.decodeUnknown(opts.input), Effect.map(handler), Effect.flatMap(S.validate(opts.output))),
    implementEffect:
      <E, R>(handler: (args: IA) => Effect.Effect<OA, E, R>) =>
      (input: unknown): Effect.Effect<OA, ParseResult.ParseError | E, R> =>
        F.pipe(input, S.decodeUnknown(opts.input), Effect.flatMap(handler), Effect.flatMap(S.validate(opts.output))),
    implementSync:
      (handler: (args: IA) => OA) =>
      (input: unknown): OA =>
        F.pipe(input, S.decodeUnknownSync(opts.input), handler, S.validateSync(opts.output)),
    inputSchema: opts.input,
    outputSchema: opts.output,
  };

  return Object.assign(baseSchema, statics);
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
