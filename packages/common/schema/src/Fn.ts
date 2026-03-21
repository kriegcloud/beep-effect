/**
 * Callable schemas for runtime function values with schema-backed input and
 * output contracts.
 *
 * The schema itself only validates that a value is a function. The attached
 * helper methods validate payloads, results, and expected effect failures at
 * invocation time using the provided input, output, and error schemas.
 *
 * @since 0.0.0
 * @module @beep/schema/Fn
 */

import { $SchemaId } from "@beep/identity/packages";
import { Cause, Effect, SchemaIssue, SchemaParser } from "effect";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as SchemaUtils from "./SchemaUtils/index.ts";

const $I = $SchemaId.create("Fn");
type NoArgInputSchema = typeof S.Never | typeof S.Undefined | typeof S.Void;

const isNeverKeyword = P.isTagged("Never");
const isUndefinedKeyword = P.isTagged("Undefined");
const isVoidKeyword = P.isTagged("Void");

const isFunctionValue = <A>(value: unknown): value is A => P.isFunction(value);
const withNeverEquivalence = <Schema extends S.Top>(schema: Schema): Schema =>
  isNeverKeyword(schema.ast) ? (schema.pipe(S.overrideToEquivalence(() => () => true)) as Schema) : schema;

const validateOutputEffect = <Output extends S.Top>(
  outputSchema: Output,
  output: Output["Type"]
): Effect.Effect<Output["Type"], SchemaIssue.Issue> => SchemaParser.decodeUnknownEffect(S.toType(outputSchema))(output);

const validateErrorEffect = <Error extends S.Top>(
  errorSchema: Error,
  error: Error["Type"]
): Effect.Effect<Error["Type"], SchemaIssue.Issue> => SchemaParser.decodeUnknownEffect(S.toType(errorSchema))(error);

const decodeInputSync = <Input extends S.Top>(inputSchema: Input, input: unknown): Input["Type"] =>
  SchemaParser.decodeUnknownSync(S.make<S.Decoder<Input["Type"]>>(inputSchema.ast))(input);

const validateOutputSync = <Output extends S.Top>(outputSchema: Output, output: Output["Type"]): Output["Type"] => {
  return SchemaParser.decodeUnknownSync(S.make<S.Decoder<Output["Type"]>>(S.toType(outputSchema).ast))(output);
};

const validateFailReasonEffect = <Error extends S.Top>(
  errorSchema: Error,
  reason: Cause.Reason<Error["Type"]>
): Effect.Effect<Cause.Reason<Error["Type"]>, SchemaIssue.Issue> =>
  !Cause.isFailReason(reason)
    ? Effect.succeed(reason)
    : isNeverKeyword(errorSchema.ast)
      ? Effect.succeed(reason)
      : Effect.map(validateErrorEffect(errorSchema, reason.error), (error) =>
          Cause.makeFailReason(error).annotate(Cause.reasonAnnotations(reason))
        );

const validateErrorCauseEffect = <Error extends S.Top>(
  errorSchema: Error,
  cause: Cause.Cause<Error["Type"]>
): Effect.Effect<Cause.Cause<Error["Type"]>, SchemaIssue.Issue> =>
  Effect.map(
    Effect.forEach(cause.reasons, (reason) => validateFailReasonEffect(errorSchema, reason)),
    Cause.fromReasons
  );

const fnDeclarationAnnotations = {
  typeConstructor: {
    _tag: "@beep/schema/Fn",
  },
  generation: {
    runtime: "Fn({ input: ?, output: ?, error: ? })",
    Type: "FnType<?, ?>",
    importDeclaration: 'import { Fn, type FnType } from "@beep/schema"',
  },
  expected: "Function",
  description: "Schema for runtime function values with schema-backed input, output, and error contracts.",
  toEquivalence:
    () =>
    <A extends Function>(self: A, that: A): boolean =>
      self === that,
  toFormatter: () => (): string => "[Function]",
};

const anyFnAnnotations = {
  typeConstructor: {
    _tag: "@beep/schema/AnyFn",
  },
  generation: {
    runtime: "AnyFn",
    Type: "Function",
    importDeclaration: 'import { AnyFn } from "@beep/schema"',
  },
  expected: "Function",
  description: "Schema for any runtime function value.",
  toEquivalence:
    () =>
    <A extends Function>(self: A, that: A): boolean =>
      self === that,
  toFormatter: () => (): string => "[Function]",
};

/**
 * Function type helper used by {@link Fn}. Inputs modeled with `never`,
 * `undefined`, or `void` become thunk call signatures.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type FnType<Input, Output> = [Input] extends [never]
  ? () => Output
  : [Input] extends [void]
    ? () => Output
    : (input: Input) => Output;

type FnRuntime<Input extends S.Top, Output extends S.Top> = FnType<Input["Type"], Output["Type"]>;
type FnIso<Input extends S.Top, Output extends S.Top> = FnType<Input["Iso"], Output["Iso"]>;

type FnEffectWrapperNoArg<Output extends S.Top, E, R> = () => Effect.Effect<Output["Type"], E, R>;
type FnEffectWrapperUnary<Output extends S.Top, E, R> = (input: unknown) => Effect.Effect<Output["Type"], E, R>;
type FnSyncWrapperNoArg<Output extends S.Top> = () => Output["Type"];
type FnSyncWrapperUnary<Output extends S.Top> = (input: unknown) => Output["Type"];
type FnImplementEffectNoArg<Output extends S.Top, Error extends S.Top> = {
  <R>(
    handler: () => Effect.Effect<Output["Type"], Error["Type"], R>
  ): FnEffectWrapperNoArg<Output, Error["Type"] | SchemaIssue.Issue, R>;
  <E, R>(
    handler: [Error["Type"]] extends [never] ? () => Effect.Effect<Output["Type"], E, R> : never
  ): FnEffectWrapperNoArg<Output, E | SchemaIssue.Issue, R>;
};
type FnImplementEffectUnary<Input extends S.Top, Output extends S.Top, Error extends S.Top> = {
  <R>(
    handler: FnType<Input["Type"], Effect.Effect<Output["Type"], Error["Type"], R>>
  ): FnEffectWrapperUnary<Output, Error["Type"] | SchemaIssue.Issue, Input["DecodingServices"] | R>;
  <E, R>(
    handler: [Error["Type"]] extends [never] ? FnType<Input["Type"], Effect.Effect<Output["Type"], E, R>> : never
  ): FnEffectWrapperUnary<Output, E | SchemaIssue.Issue, Input["DecodingServices"] | R>;
};
type FnNoArgInput<Input extends S.Top> = [Input["Type"]] extends [never]
  ? typeof S.Never
  : [Input["Type"]] extends [undefined]
    ? typeof S.Undefined
    : [Input["Type"]] extends [void]
      ? typeof S.Void
      : NoArgInputSchema;

/**
 * Schema surface for thunk-like functions created by {@link Fn}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export interface FnSchemaNoArg<Input extends NoArgInputSchema, Output extends S.Top, Error extends S.Top>
  extends S.Codec<FnRuntime<Input, Output>, FnRuntime<Input, Output>> {
  readonly "~rebuild.out": this;
  readonly errorSchema: Error;
  readonly implement: (handler: () => Output["Type"]) => FnEffectWrapperNoArg<Output, SchemaIssue.Issue, never>;
  readonly implementEffect: FnImplementEffectNoArg<Output, Error>;
  readonly implementSync: (handler: () => Output["Type"]) => FnSyncWrapperNoArg<Output>;
  readonly inputSchema: Input;
  readonly outputSchema: Output;
}

/**
 * Schema surface for unary functions created by {@link Fn}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export interface FnSchemaUnary<Input extends S.Top, Output extends S.Top, Error extends S.Top>
  extends S.Codec<FnRuntime<Input, Output>, FnRuntime<Input, Output>> {
  readonly "~rebuild.out": this;
  readonly errorSchema: Error;
  readonly implement: (
    handler: FnType<Input["Type"], Output["Type"]>
  ) => FnEffectWrapperUnary<Output, SchemaIssue.Issue, Input["DecodingServices"]>;
  readonly implementEffect: FnImplementEffectUnary<Input, Output, Error>;
  readonly implementSync: (handler: FnType<Input["Type"], Output["Type"]>) => FnSyncWrapperUnary<Output>;
  readonly inputSchema: Input;
  readonly outputSchema: Output;
}

/**
 * Schema type returned by {@link Fn}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type FnSchema<Input extends S.Top, Output extends S.Top, Error extends S.Top = typeof S.Never> = [
  Input["Type"],
] extends [never]
  ? FnSchemaNoArg<FnNoArgInput<Input>, Output, Error>
  : [Input["Type"]] extends [void]
    ? FnSchemaNoArg<FnNoArgInput<Input>, Output, Error>
    : FnSchemaUnary<Input, Output, Error>;

/**
 * Static helper surface attached to {@link Fn} schemas.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type FnSchemaStatics<Input extends S.Top, Output extends S.Top, Error extends S.Top = typeof S.Never> = Pick<
  FnSchema<Input, Output, Error>,
  "implement" | "implementEffect" | "implementSync" | "inputSchema" | "outputSchema" | "errorSchema"
>;

const makeFnDeclaration = <Input extends S.Top, Output extends S.Top, Error extends S.Top>(
  inputSchema: Input,
  outputSchema: Output,
  errorSchema: Error
) =>
  S.declareConstructor<FnRuntime<Input, Output>, FnRuntime<Input, Output>, FnIso<Input, Output>>()(
    [withNeverEquivalence(inputSchema), withNeverEquivalence(outputSchema), withNeverEquivalence(errorSchema)],
    () => (value, ast) =>
      isFunctionValue<FnRuntime<Input, Output>>(value)
        ? Effect.succeed(value)
        : Effect.fail(new SchemaIssue.InvalidType(ast, O.some(value))),
    fnDeclarationAnnotations
  );

const makeNoArgStatics = <Input extends NoArgInputSchema, Output extends S.Top, Error extends S.Top>(
  inputSchema: Input,
  outputSchema: Output,
  errorSchema: Error
): Pick<
  FnSchemaNoArg<Input, Output, Error>,
  "implement" | "implementEffect" | "implementSync" | "inputSchema" | "outputSchema" | "errorSchema"
> => {
  const implement: FnSchemaNoArg<Input, Output, Error>["implement"] = (handler) => () =>
    Effect.flatMap(Effect.sync(handler), (output) => validateOutputEffect(outputSchema, output));

  const implementEffect = isNeverKeyword(errorSchema.ast)
    ? <HandlerError, R>(
        handler: () => Effect.Effect<Output["Type"], HandlerError, R>
      ): FnEffectWrapperNoArg<Output, HandlerError | SchemaIssue.Issue, R> =>
        () =>
          Effect.matchCauseEffect(handler(), {
            onFailure: (cause) => Effect.failCause(cause),
            onSuccess: (output) => validateOutputEffect(outputSchema, output),
          })
    : <R>(
        handler: () => Effect.Effect<Output["Type"], Error["Type"], R>
      ): FnEffectWrapperNoArg<Output, Error["Type"] | SchemaIssue.Issue, R> =>
        () =>
          Effect.matchCauseEffect(handler(), {
            onFailure: (cause) => Effect.flatMap(validateErrorCauseEffect(errorSchema, cause), Effect.failCause),
            onSuccess: (output) => validateOutputEffect(outputSchema, output),
          });

  const implementSync: FnSchemaNoArg<Input, Output, Error>["implementSync"] = (handler) => () =>
    validateOutputSync(outputSchema, handler());

  return {
    implement,
    implementEffect: implementEffect as FnSchemaNoArg<Input, Output, Error>["implementEffect"],
    implementSync,
    inputSchema,
    outputSchema,
    errorSchema,
  };
};

const makeUnaryStatics = <Input extends S.Top, Output extends S.Top, Error extends S.Top>(
  inputSchema: Input,
  outputSchema: Output,
  errorSchema: Error
): Pick<
  FnSchemaUnary<Input, Output, Error>,
  "implement" | "implementEffect" | "implementSync" | "inputSchema" | "outputSchema" | "errorSchema"
> => {
  const implement: FnSchemaUnary<Input, Output, Error>["implement"] = (handler) => (input) =>
    Effect.flatMap(SchemaParser.decodeUnknownEffect(inputSchema)(input), (decodedInput) =>
      Effect.flatMap(
        Effect.sync(() => handler(decodedInput)),
        (output) => validateOutputEffect(outputSchema, output)
      )
    );

  const implementEffect = isNeverKeyword(errorSchema.ast)
    ? <HandlerError, R>(
        handler: FnType<Input["Type"], Effect.Effect<Output["Type"], HandlerError, R>>
      ): FnEffectWrapperUnary<Output, HandlerError | SchemaIssue.Issue, Input["DecodingServices"] | R> =>
        (input: unknown) =>
          Effect.flatMap(SchemaParser.decodeUnknownEffect(inputSchema)(input), (decodedInput) =>
            Effect.matchCauseEffect(handler(decodedInput), {
              onFailure: (cause) => Effect.failCause(cause),
              onSuccess: (output) => validateOutputEffect(outputSchema, output),
            })
          )
    : <R>(
        handler: FnType<Input["Type"], Effect.Effect<Output["Type"], Error["Type"], R>>
      ): FnEffectWrapperUnary<Output, Error["Type"] | SchemaIssue.Issue, Input["DecodingServices"] | R> =>
        (input: unknown) =>
          Effect.flatMap(SchemaParser.decodeUnknownEffect(inputSchema)(input), (decodedInput) =>
            Effect.matchCauseEffect(handler(decodedInput), {
              onFailure: (cause) => Effect.flatMap(validateErrorCauseEffect(errorSchema, cause), Effect.failCause),
              onSuccess: (output) => validateOutputEffect(outputSchema, output),
            })
          );

  const implementSync: FnSchemaUnary<Input, Output, Error>["implementSync"] = (handler) => (input) =>
    validateOutputSync(outputSchema, handler(decodeInputSync(inputSchema, input)));

  return {
    implement,
    implementEffect: implementEffect as FnSchemaUnary<Input, Output, Error>["implementEffect"],
    implementSync,
    inputSchema,
    outputSchema,
    errorSchema,
  };
};

const makeNoArgFnSchema = <Input extends NoArgInputSchema, Output extends S.Top, Error extends S.Top>(
  inputSchema: Input,
  outputSchema: Output,
  errorSchema: Error
): FnSchemaNoArg<Input, Output, Error> => {
  const declaration = makeFnDeclaration(inputSchema, outputSchema, errorSchema);

  return S.make<FnSchemaNoArg<Input, Output, Error>>(declaration.ast).pipe(
    $I.annoteSchema("Fn", {
      description: "Schema for runtime function values with schema-backed input, output, and error contracts.",
    }),
    SchemaUtils.withStatics(() => ({ ...makeNoArgStatics(inputSchema, outputSchema, errorSchema) }))
  );
};

const makeUnaryFnSchema = <Input extends S.Top, Output extends S.Top, Error extends S.Top>(
  inputSchema: Input,
  outputSchema: Output,
  errorSchema: Error
): FnSchemaUnary<Input, Output, Error> => {
  const declaration = makeFnDeclaration(inputSchema, outputSchema, errorSchema);

  return S.make<FnSchemaUnary<Input, Output, Error>>(declaration.ast).pipe(
    $I.annoteSchema("Fn", {
      description: "Schema for runtime function values with schema-backed input, output, and error contracts.",
    }),
    SchemaUtils.withStatics(() => ({ ...makeUnaryStatics(inputSchema, outputSchema, errorSchema) }))
  );
};

/**
 * Schema for any runtime function value.
 *
 * @example
 * ```ts
 * import { AnyFn } from "@beep/schema"
 * import * as S from "effect/Schema"
 *
 * const fn = S.decodeUnknownSync(AnyFn)(() => "hello")
 * void fn
 * ```
 *
 * @since 0.0.0
 * @category Validation
 */
export const AnyFn = S.declare<Function>(isFunctionValue, anyFnAnnotations).pipe(
  $I.annoteSchema("AnyFn", {
    description: "Schema for any runtime function value.",
  })
);

/**
 * Type for {@link AnyFn}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type AnyFn = typeof AnyFn.Type;

/**
 * Creates a thunk schema whose invocation output is validated against the
 * provided schema and whose `implementEffect` error channel can optionally be
 * validated against the provided error schema.
 *
 * @example
 * ```ts
 * import { ThunkOf } from "@beep/schema"
 * import * as S from "effect/Schema"
 *
 * const GetGreeting = ThunkOf(S.String)
 * const greeting = GetGreeting.implementSync(() => "hello")
 *
 * void greeting
 * ```
 *
 * @param output - Schema for the thunk result.
 * @param error - Optional schema for the expected effect error channel.
 * @returns A zero-argument {@link Fn} schema.
 * @since 0.0.0
 * @category Validation
 */
export function ThunkOf<Output extends S.Top>(output: Output): FnSchema<typeof S.Never, Output, typeof S.Never>;
export function ThunkOf<Output extends S.Top, Error extends S.Top>(
  output: Output,
  error: Error
): FnSchema<typeof S.Never, Output, Error>;
export function ThunkOf<Output extends S.Top, Error extends S.Top>(
  output: Output,
  error?: Error
): FnSchema<typeof S.Never, Output, typeof S.Never | Error> {
  return makeNoArgFnSchema(S.Never, output, error ?? S.Never);
}

/**
 * Creates a zero-argument function schema whose result is validated against the
 * provided output schema.
 *
 * @example
 * ```ts
 * import { Fn } from "@beep/schema"
 * import * as S from "effect/Schema"
 *
 * const GetGreeting = Fn({ output: S.String })
 * const greeting = GetGreeting.implementSync(() => "hello")
 *
 * void greeting
 * ```
 *
 * @param options - Output and optional error contracts for the thunk.
 * @returns A thunk schema with invocation helpers.
 * @since 0.0.0
 * @category Validation
 */
export function Fn<Output extends S.Top, Error extends S.Top = typeof S.Never>(options: {
  readonly output: Output;
  readonly error?: Error;
}): FnSchema<typeof S.Never, Output, Error>;

/**
 * Creates a zero-argument function schema that preserves an explicit
 * `Schema.Undefined` input contract.
 *
 * @param options - Input/output contract for the thunk-like function.
 * @returns A thunk schema whose `inputSchema` remains `Schema.Undefined`.
 * @since 0.0.0
 * @category Validation
 */
export function Fn<Output extends S.Top, Error extends S.Top = typeof S.Never>(options: {
  readonly input: typeof S.Undefined;
  readonly output: Output;
  readonly error?: Error;
}): FnSchema<typeof S.Undefined, Output, Error>;

/**
 * Creates a zero-argument function schema that preserves an explicit
 * `Schema.Void` input contract.
 *
 * @param options - Input/output contract for the thunk-like function.
 * @returns A thunk schema whose `inputSchema` remains `Schema.Void`.
 * @since 0.0.0
 * @category Validation
 */
export function Fn<Output extends S.Top, Error extends S.Top = typeof S.Never>(options: {
  readonly input: typeof S.Void;
  readonly output: Output;
  readonly error?: Error;
}): FnSchema<typeof S.Void, Output, Error>;

/**
 * Creates a unary function schema. Invocation helpers decode incoming payloads
 * with `options.input` and validate handler results against `options.output`.
 *
 * @example
 * ```ts
 * import { Fn } from "@beep/schema"
 * import * as S from "effect/Schema"
 *
 * const FormatCount = Fn({
 *   input: S.NumberFromString,
 *   output: S.String,
 * })
 *
 * const formatCount = FormatCount.implementSync((count) => `${count}`)
 *
 * void formatCount
 * ```
 *
 * @param options - Input, output, and optional error contracts for the function.
 * @returns A unary function schema with invocation helpers.
 * @since 0.0.0
 * @category Validation
 */
export function Fn<Input extends S.Top, Output extends S.Top, Error extends S.Top = typeof S.Never>(options: {
  readonly input: Input;
  readonly output: Output;
  readonly error?: Error;
}): FnSchema<Input, Output, Error>;

export function Fn<Output extends S.Top, Error extends S.Top = typeof S.Never>(options: {
  readonly input?: S.Top;
  readonly output: Output;
  readonly error?: Error;
}):
  | FnSchemaNoArg<typeof S.Never, Output, typeof S.Never | Error>
  | FnSchemaNoArg<typeof S.Undefined, Output, typeof S.Never | Error>
  | FnSchemaNoArg<typeof S.Void, Output, typeof S.Never | Error>
  | FnSchemaUnary<S.Top, Output, typeof S.Never | Error> {
  const errorSchema = options.error ?? S.Never;

  if (options.input === undefined) {
    return makeNoArgFnSchema(S.Never, options.output, errorSchema);
  }

  if (isNeverKeyword(options.input.ast)) {
    return makeNoArgFnSchema(S.Never, options.output, errorSchema);
  }

  if (isUndefinedKeyword(options.input.ast)) {
    return makeNoArgFnSchema(S.Undefined, options.output, errorSchema);
  }

  if (isVoidKeyword(options.input.ast)) {
    return makeNoArgFnSchema(S.Void, options.output, errorSchema);
  }

  return makeUnaryFnSchema(options.input, options.output, errorSchema);
}
