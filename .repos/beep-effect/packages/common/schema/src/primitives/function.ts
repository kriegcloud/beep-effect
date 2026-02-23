import { $SchemaId } from "@beep/identity/packages";
import { variance } from "@beep/schema/core";
import { thunk } from "@beep/utils";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import type * as ParseResult from "effect/ParseResult";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";

const $I = $SchemaId.create("schema/primitives/function");

// -----------------------------------------------------------------------------
// Conditional Type Helpers
// -----------------------------------------------------------------------------

/**
 * Function type that becomes `() => OA` when IA is never/undefined,
 * otherwise `(args: IA) => OA`.
 */
export type FnType<IA, OA> = [IA] extends [never] ? () => OA : [IA] extends [undefined] ? () => OA : (args: IA) => OA;

// -----------------------------------------------------------------------------
// Schema Statics Interfaces
// -----------------------------------------------------------------------------

/**
 * Statics for thunk schemas (no input).
 */
interface FnSchemaStaticsThunk<OA, OE> {
  readonly [S.TypeId]: typeof variance;
  readonly implement: (handler: () => OA) => () => Effect.Effect<OA, ParseResult.ParseError>;
  readonly implementEffect: <E, R>(
    handler: () => Effect.Effect<OA, E, R>
  ) => () => Effect.Effect<OA, ParseResult.ParseError | E, R>;
  readonly implementSync: (handler: () => OA) => () => OA;
  readonly inputSchema: S.Schema<never, never>;
  readonly outputSchema: S.Schema<OA, OE>;
}

/**
 * Statics for undefined input schemas (behaves like thunk).
 */
interface FnSchemaStaticsUndefined<OA, OE> {
  readonly [S.TypeId]: typeof variance;
  readonly implement: (handler: () => OA) => () => Effect.Effect<OA, ParseResult.ParseError>;
  readonly implementEffect: <E, R>(
    handler: () => Effect.Effect<OA, E, R>
  ) => () => Effect.Effect<OA, ParseResult.ParseError | E, R>;
  readonly implementSync: (handler: () => OA) => () => OA;
  readonly inputSchema: S.Schema<undefined, undefined>;
  readonly outputSchema: S.Schema<OA, OE>;
}

/**
 * Statics for schemas with real input.
 */
interface FnSchemaStaticsInput<IA, IE, OA, OE> {
  readonly [S.TypeId]: typeof variance;
  readonly implement: (handler: (args: IA) => OA) => (input: unknown) => Effect.Effect<OA, ParseResult.ParseError>;
  readonly implementEffect: <E, R>(
    handler: (args: IA) => Effect.Effect<OA, E, R>
  ) => (input: unknown) => Effect.Effect<OA, ParseResult.ParseError | E, R>;
  readonly implementSync: (handler: (args: IA) => OA) => (input: unknown) => OA;
  readonly inputSchema: S.Schema<IA, IE>;
  readonly outputSchema: S.Schema<OA, OE>;
}

/**
 * Combined statics type using conditional to select the right interface.
 */
export type FnSchemaStatics<IA, IE, OA, OE> = [IA] extends [never]
  ? FnSchemaStaticsThunk<OA, OE>
  : [IA] extends [undefined]
    ? FnSchemaStaticsUndefined<OA, OE>
    : FnSchemaStaticsInput<IA, IE, OA, OE>;

/**
 * Interface describing the return type of `Fn`.
 */
export type FnSchema<IA, IE, OA, OE> = S.Schema<FnType<IA, OA>, FnType<IA, OA>> & FnSchemaStatics<IA, IE, OA, OE>;

// -----------------------------------------------------------------------------
// Internal Helpers
// -----------------------------------------------------------------------------

/**
 * Creates a thunk schema (no input validation).
 */
const makeThunkSchema = <OA, OE>(outputSchema: S.Schema<OA, OE>): FnSchema<never, never, OA, OE> => {
  const baseSchema = S.declare((i: unknown): i is () => OA => P.isFunction(i));

  const statics = {
    [S.TypeId]: variance,
    implement: (handler: () => OA) => () => F.pipe(Effect.sync(handler), Effect.flatMap(S.validate(outputSchema))),
    implementEffect:
      <E, R>(handler: () => Effect.Effect<OA, E, R>) =>
      () =>
        F.pipe(handler(), Effect.flatMap(S.validate(outputSchema))),
    implementSync: (handler: () => OA) => (): OA => F.pipe(handler(), S.validateSync(outputSchema)),
    inputSchema: S.Never,
    outputSchema,
  };

  return Object.assign(baseSchema, statics);
};

/**
 * Creates a thunk schema with explicit S.Undefined input.
 */
const makeUndefinedInputSchema = <OA, OE>(outputSchema: S.Schema<OA, OE>): FnSchema<undefined, undefined, OA, OE> => {
  const baseSchema = S.declare((i: unknown): i is () => OA => P.isFunction(i));

  const statics = {
    [S.TypeId]: variance,
    implement: (handler: () => OA) => () => F.pipe(Effect.sync(handler), Effect.flatMap(S.validate(outputSchema))),
    implementEffect:
      <E, R>(handler: () => Effect.Effect<OA, E, R>) =>
      () =>
        F.pipe(handler(), Effect.flatMap(S.validate(outputSchema))),
    implementSync: (handler: () => OA) => (): OA => F.pipe(handler(), S.validateSync(outputSchema)),
    inputSchema: S.Undefined,
    outputSchema,
  };

  return Object.assign(baseSchema, statics);
};

/**
 * Creates a function schema with input validation.
 * Uses FnSchemaStaticsInput directly (non-conditional) to avoid unresolved conditional types.
 */
const makeInputSchema = <IA, IE, OA, OE>(
  inputSchema: S.Schema<IA, IE>,
  outputSchema: S.Schema<OA, OE>
): S.Schema<(args: IA) => OA, (args: IA) => OA> & FnSchemaStaticsInput<IA, IE, OA, OE> => {
  const baseSchema = S.declare((i: unknown): i is (args: IA) => OA => P.isFunction(i));

  const statics: FnSchemaStaticsInput<IA, IE, OA, OE> = {
    [S.TypeId]: variance,
    implement: (handler) => (input) =>
      F.pipe(
        input,
        S.decodeUnknown(inputSchema),
        Effect.map((args) => handler(args)),
        Effect.flatMap(S.validate(outputSchema))
      ),
    implementEffect: (handler) => (input) =>
      F.pipe(
        input,
        S.decodeUnknown(inputSchema),
        Effect.flatMap((args) => handler(args)),
        Effect.flatMap(S.validate(outputSchema))
      ),
    implementSync: (handler) => (input) =>
      F.pipe(input, S.decodeUnknownSync(inputSchema), (args) => handler(args), S.validateSync(outputSchema)),
    inputSchema,
    outputSchema,
  };

  return Object.assign(baseSchema, statics);
};

// -----------------------------------------------------------------------------
// Fn Factory (Overloaded)
// -----------------------------------------------------------------------------

/**
 * Creates a validated thunk factory (no input).
 *
 * @example
 * ```ts
 * const myThunk = Fn({ output: S.String });
 *
 * const impl = myThunk.implement(() => "hello");
 * Effect.runSync(impl()); // "hello"
 * ```
 */
export function Fn<OA, OE>(opts: { readonly output: S.Schema<OA, OE> }): FnSchema<never, never, OA, OE>;

/**
 * Creates a validated function factory with input validation.
 * When input is S.Undefined, behaves like a thunk (no arguments).
 *
 * @example
 * ```ts
 * const myFn = Fn({
 *   input: S.Number,
 *   output: S.String,
 * });
 *
 * const impl = myFn.implement((n) => n.toString());
 * Effect.runSync(impl(42)); // "42"
 * ```
 */
export function Fn<IA, IE, OA, OE>(opts: {
  readonly input: S.Schema<IA, IE>;
  readonly output: S.Schema<OA, OE>;
}): FnSchema<IA, IE, OA, OE>;

export function Fn<IA, IE, OA, OE>(opts: {
  readonly input?: S.Schema<IA, IE>;
  readonly output: S.Schema<OA, OE>;
}):
  | FnSchema<never, never, OA, OE>
  | FnSchema<undefined, undefined, OA, OE>
  | (S.Schema<(args: IA) => OA, (args: IA) => OA> & FnSchemaStaticsInput<IA, IE, OA, OE>) {
  const inputSchema = opts.input;
  const thunkMakeThunkSchema = thunk(makeThunkSchema(opts.output));

  const match = Match.type<S.Schema<IA, IE, never> | undefined>().pipe(
    Match.when(P.isUndefined, thunkMakeThunkSchema),
    Match.whenOr(
      P.struct({
        ast: P.isTagged("NeverKeyword"),
      }),
      P.struct({
        ast: P.isTagged("VoidKeyword"),
      }),
      thunkMakeThunkSchema
    ),
    Match.when(P.struct({ ast: P.isTagged("UndefinedKeyword") }), thunk(makeUndefinedInputSchema(opts.output))),
    Match.orElse((fnSchema) => makeInputSchema(fnSchema, opts.output))
  );

  return match(inputSchema);
}

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
