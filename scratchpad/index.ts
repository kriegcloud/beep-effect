import * as S from "effect/Schema";
import { $ScratchpadId } from "@beep/identity";
import { Effect, Console } from "effect";
import { SchemaUtils } from "@beep/schema";

const $I = $ScratchpadId.create("index");

export class ManualFallbackOptions extends S.Class<ManualFallbackOptions>($I`ManualFallbackOptions`)(
  {
    param1: S.optionalKey(S.String),
    param2: S.optionalKey(S.String),
  },
  $I.annote("ManualFallbackOptions", {
    description: "Options with optional fields that are filled by ad-hoc function defaults instead of schema defaults."
  })
) {

}

// =============================================================================
// Anti-pattern 1: defining defaults in the function parameter
// =============================================================================

export const logWithInlineDefaults = Effect.fn("logWithInlineDefaults")(function* (
  params: ManualFallbackOptions = {
    param1: "default1",
    param2: "default2",
  }
) {
  return yield* Console.log(params)
});

// =============================================================================
// Anti-pattern 2: defining defaults as a constant outside function scope
// =============================================================================

const defaultFnOptions = {
  param1: "default1",
  param2: "default2",
}

export const logWithMergedDefaults = Effect.fn("logWithMergedDefaults")(function* (
  params?: ManualFallbackOptions
) {
  const things = typeof params === "undefined" ? defaultFnOptions : {
    ...defaultFnOptions,
    ...params,
  };
  return yield* Console.log(things)
});

// =============================================================================
// Preferred pattern: define defaults in the schema
// =============================================================================

export class DefaultedOptions extends S.Class<DefaultedOptions>($I`DefaultedOptions`)(
  {
    param1: S.String.pipe(
      SchemaUtils.withKeyDefaults("default1")
    ),
    param2: S.String.pipe(
      SchemaUtils.withKeyDefaults("default2")
    ),
  },
  $I.annote("DefaultedOptions", {
    description: "Options whose constructor and missing-key decode defaults live in the schema definition."
  })
) {

}

export const desiredWay = Effect.fn("desiredWay")(function* (
  params = DefaultedOptions.make()
) {
  return yield* Console.log(params)
})

// =============================================================================
// Example of each defaults combinator
// =============================================================================

const DecodingDefaultTimeout = S.Struct({
  timeoutMs: S.FiniteFromString.pipe(
    S.withDecodingDefault(Effect.succeed("5000"))
  ),
});

export const withDecodingDefaultExample = {
  when: "Use when external input may omit a value or pass undefined, and the fallback is in the encoded representation.",
  what: "The encoded side becomes optional; a missing key or undefined value is replaced before the field decoder runs.",
  schema: DecodingDefaultTimeout,
  decodesMissingKeyToDefault: S.decodeUnknownEffect(DecodingDefaultTimeout)({}),
  decodesUndefinedToDefault: S.decodeUnknownEffect(DecodingDefaultTimeout)({ timeoutMs: undefined }),
  decodesProvidedValue: S.decodeUnknownEffect(DecodingDefaultTimeout)({ timeoutMs: "2500" }),
  encodesProvidedValue: S.encodeUnknownEffect(DecodingDefaultTimeout)({ timeoutMs: 2500 }),
};

const ConstructorDefaultTimeout = S.Struct({
  timeoutMs: S.FiniteFromString.pipe(
    S.withConstructorDefault(Effect.succeed(5000))
  ),
});

export const withConstructorDefaultExample = {
  when: "Use when application constructors may omit a field, but decoding external input should not silently fill it.",
  what: "The default is applied by make/makeEffect and class constructors only; decoding and encoding behavior are unchanged.",
  schema: ConstructorDefaultTimeout,
  constructsMissingKeyWithDefault: ConstructorDefaultTimeout.makeEffect({}),
  constructsProvidedValue: ConstructorDefaultTimeout.makeEffect({ timeoutMs: 2500 }),
  decodingMissingKeyStillFails: S.decodeUnknownEffect(ConstructorDefaultTimeout)({}),
};

const DecodingDefaultTypeTimeout = S.Struct({
  timeoutMs: S.FiniteFromString.pipe(
    S.withDecodingDefaultType(Effect.succeed(5000))
  ),
});

export const withDecodingDefaultTypeExample = {
  when: "Use when external input may omit a value or pass undefined, and the fallback is already decoded.",
  what: "The encoded side becomes optional, but the default is a Type value, so it does not pass through the decoder.",
  schema: DecodingDefaultTypeTimeout,
  decodesMissingKeyToDefault: S.decodeUnknownEffect(DecodingDefaultTypeTimeout)({}),
  decodesUndefinedToDefault: S.decodeUnknownEffect(DecodingDefaultTypeTimeout)({ timeoutMs: undefined }),
  decodesProvidedValue: S.decodeUnknownEffect(DecodingDefaultTypeTimeout)({ timeoutMs: "2500" }),
  encodesProvidedValue: S.encodeUnknownEffect(DecodingDefaultTypeTimeout)({ timeoutMs: 2500 }),
};

const DecodingDefaultKeyTimeout = S.Struct({
  timeoutMs: S.FiniteFromString.pipe(
    S.withDecodingDefaultKey(Effect.succeed("5000"))
  ),
});

export const withDecodingDefaultKeyExample = {
  when: "Use for object fields where an absent key should default, but an explicit undefined should remain invalid input.",
  what: "The encoded struct key becomes optionalKey; only a missing key uses the encoded default before decoding.",
  schema: DecodingDefaultKeyTimeout,
  decodesMissingKeyToDefault: S.decodeUnknownEffect(DecodingDefaultKeyTimeout)({}),
  explicitUndefinedStillFails: S.decodeUnknownEffect(DecodingDefaultKeyTimeout)({ timeoutMs: undefined }),
  decodesProvidedValue: S.decodeUnknownEffect(DecodingDefaultKeyTimeout)({ timeoutMs: "2500" }),
  encodesProvidedValue: S.encodeUnknownEffect(DecodingDefaultKeyTimeout)({ timeoutMs: 2500 }),
};

const DecodingDefaultTypeKeyTimeout = S.Struct({
  timeoutMs: S.FiniteFromString.pipe(
    S.withDecodingDefaultTypeKey(Effect.succeed(5000))
  ),
});

export const withDecodingDefaultTypeKeyExample = {
  when: "Use for object fields where an absent key should default, explicit undefined should fail, and the fallback is already decoded.",
  what: "The encoded struct key becomes optionalKey; only a missing key uses the Type default without decoding it first.",
  schema: DecodingDefaultTypeKeyTimeout,
  decodesMissingKeyToDefault: S.decodeUnknownEffect(DecodingDefaultTypeKeyTimeout)({}),
  explicitUndefinedStillFails: S.decodeUnknownEffect(DecodingDefaultTypeKeyTimeout)({ timeoutMs: undefined }),
  decodesProvidedValue: S.decodeUnknownEffect(DecodingDefaultTypeKeyTimeout)({ timeoutMs: "2500" }),
  encodesProvidedValue: S.encodeUnknownEffect(DecodingDefaultTypeKeyTimeout)({ timeoutMs: 2500 }),
};

const DecodingDefaultOmitStrategy = S.Struct({
  debug: S.Boolean.pipe(
    S.withDecodingDefault(Effect.succeed(false), { encodingStrategy: "omit" })
  ),
});

export const withDecodingDefaultOmitStrategyExample = {
  when: "The list repeats S.withDecodingDefault; this variant shows the optional omit encoding strategy.",
  what: "Decoding still fills missing or undefined values, while encoding omits the key instead of passing it through.",
  schema: DecodingDefaultOmitStrategy,
  decodesMissingKeyToDefault: S.decodeUnknownEffect(DecodingDefaultOmitStrategy)({}),
  decodesUndefinedToDefault: S.decodeUnknownEffect(DecodingDefaultOmitStrategy)({ debug: undefined }),
  encodesByOmittingKey: S.encodeUnknownEffect(DecodingDefaultOmitStrategy)({ debug: true }),
};
