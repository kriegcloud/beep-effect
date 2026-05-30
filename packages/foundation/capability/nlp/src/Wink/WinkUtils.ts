/**
 * Wink utility wrappers for string, token, and n-gram helpers.
 *
 * @since 0.0.0
 * @packageDocumentation
 */

import { createRequire } from "node:module";
import { $NlpId } from "@beep/identity";
import { TaggedErrorClass } from "@beep/schema";
import { A } from "@beep/utils";
import { Context, Effect, Inspectable, Layer } from "effect";
import { dual } from "effect/Function";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";

const $I = $NlpId.create("Wink/WinkUtils");
const require = createRequire(import.meta.url);

type StringUtilities = {
  readonly bagOfNGrams: {
    (text: string, size: number): Record<string, number>;
    (size: number): (text: string) => Record<string, number>;
  };
  readonly edgeNGrams: {
    (text: string, size: number): ReadonlyArray<string>;
    (size: number): (text: string) => ReadonlyArray<string>;
  };
  readonly lowerCase: (text: string) => string;
  readonly removeElisions: (text: string) => string;
  readonly removeExtraSpaces: (text: string) => string;
  readonly removeHTMLTags: (text: string) => string;
  readonly removePunctuations: (text: string) => string;
  readonly removeSplChars: (text: string) => string;
  readonly retainAlphaNums: (text: string) => string;
  readonly sentences: (text: string) => ReadonlyArray<string>;
  readonly setOfNGrams: {
    (text: string, size: number): ReadonlySet<string>;
    (size: number): (text: string) => ReadonlySet<string>;
  };
  readonly trim: (text: string) => string;
  readonly upperCase: (text: string) => string;
};

type TokenUtilities = {
  readonly phonetize: (tokens: Array<string>) => ReadonlyArray<string>;
  readonly soundex: (tokens: Array<string>) => ReadonlyArray<string>;
};

class NGramResult extends S.Class<NGramResult>($I`NGramResult`)(
  {
    ngrams: S.Record(S.String, S.Number),
    totalNGrams: S.Number,
    uniqueNGrams: S.Number,
  },
  $I.annote("NGramResult", {
    description: "Result of n-gram analysis, including n-gram counts, total n-grams, and unique n-grams.",
  })
) {}

const isNGramRecord = (value: unknown): value is Record<string, number> => P.isObject(value);
const isStringArray = (value: unknown): value is ReadonlyArray<string> =>
  A.isArray(value) && A.every(value, P.isString);

type WinkUtilsShape = {
  readonly bagOfNGrams: {
    (text: string, size: number): Effect.Effect<NGramResult, WinkUtilsError>;
    (size: number): (text: string) => Effect.Effect<NGramResult, WinkUtilsError>;
  };
  readonly edgeNGrams: {
    (text: string, size: number): Effect.Effect<NGramResult, WinkUtilsError>;
    (size: number): (text: string) => Effect.Effect<NGramResult, WinkUtilsError>;
  };
  readonly lowerCase: (text: string) => Effect.Effect<string, WinkUtilsError>;
  readonly phonetize: (tokens: ReadonlyArray<string>) => Effect.Effect<ReadonlyArray<string>, WinkUtilsError>;
  readonly removeElisions: (text: string) => Effect.Effect<string, WinkUtilsError>;
  readonly removeExtraSpaces: (text: string) => Effect.Effect<string, WinkUtilsError>;
  readonly removeHTMLTags: (text: string) => Effect.Effect<string, WinkUtilsError>;
  readonly removePunctuations: (text: string) => Effect.Effect<string, WinkUtilsError>;
  readonly removeSplChars: (text: string) => Effect.Effect<string, WinkUtilsError>;
  readonly retainAlphaNums: (text: string) => Effect.Effect<string, WinkUtilsError>;
  readonly sentences: (text: string) => Effect.Effect<ReadonlyArray<string>, WinkUtilsError>;
  readonly setOfNGrams: {
    (text: string, size: number): Effect.Effect<NGramResult, WinkUtilsError>;
    (size: number): (text: string) => Effect.Effect<NGramResult, WinkUtilsError>;
  };
  readonly soundex: (tokens: ReadonlyArray<string>) => Effect.Effect<ReadonlyArray<string>, WinkUtilsError>;
  readonly trim: (text: string) => Effect.Effect<string, WinkUtilsError>;
  readonly upperCase: (text: string) => Effect.Effect<string, WinkUtilsError>;
};

const loadWinkUtils = (): {
  readonly string: StringUtilities;
  readonly tokens: TokenUtilities;
} => require("wink-nlp-utils");

const renderCause = (cause: unknown): string => Inspectable.toStringUnknown(cause);

const sanitizeNGramResult = (
  value: Record<string, number> | ReadonlyArray<string> | ReadonlySet<string>
): NGramResult => {
  if (isStringArray(value)) {
    const ngrams = R.fromEntries(A.map(value, (entry) => [entry, 1] as const));
    return { ngrams, totalNGrams: value.length, uniqueNGrams: value.length };
  }

  if (value instanceof Set) {
    const entries = A.fromIterable(value);
    const ngrams = R.fromEntries(A.map(entries, (entry) => [entry, 1] as const));
    return { ngrams, totalNGrams: entries.length, uniqueNGrams: entries.length };
  }

  if (!isNGramRecord(value)) {
    return { ngrams: {}, totalNGrams: 0, uniqueNGrams: 0 };
  }

  const ngrams = R.fromEntries(
    A.map(R.toEntries(value), ([key, count]) => [key, P.isNumber(count) ? count : 0] as const)
  );
  const totalNGrams = A.reduce(R.values(ngrams), 0, (sum, count) => sum + count);

  return {
    ngrams,
    totalNGrams,
    uniqueNGrams: R.keys(ngrams).length,
  };
};

/**
 * Typed failure for `wink-nlp-utils` string, token, and n-gram helpers.
 *
 * @example
 * ```ts
 * import { WinkUtilsError } from "@beep/nlp/Wink/WinkUtils"
 *
 * const error = WinkUtilsError.fromCause(new Error("bad helper output"), "bagOfNGrams")
 * console.log(error.operation)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class WinkUtilsError extends TaggedErrorClass<WinkUtilsError>($I`WinkUtilsError`)(
  "WinkUtilsError",
  {
    cause: S.DefectWithStack,
    message: S.String,
    operation: S.String,
  },
  $I.annote("WinkUtilsError", {
    description: "Failure raised while calling wink-nlp-utils helpers.",
  })
) {
  /**
   * Convert an unknown cause into a typed wink-utils error.
   *
   * @param cause - The underlying failure or defect.
   * @param operation - The wink utility operation that failed.
   * @returns A typed wink-utils error value.
   */
  static readonly fromCause: {
    (cause: unknown, operation: string): WinkUtilsError;
    (operation: string): (cause: unknown) => WinkUtilsError;
  } = dual(
    2,
    (cause: unknown, operation: string): WinkUtilsError =>
      WinkUtilsError.make({
        cause,
        message: `Wink utility ${operation} failed: ${renderCause(cause)}`,
        operation,
      })
  );
}

const makeWinkUtils = Effect.gen(function* () {
  const utils = yield* Effect.try({
    try: loadWinkUtils,
    catch: WinkUtilsError.fromCause("initialize"),
  });

  const runString = (operation: string, f: (helpers: StringUtilities) => string) =>
    Effect.try({
      try: () => f(utils.string),
      catch: WinkUtilsError.fromCause(operation),
    });

  const runTokens = (operation: string, f: (helpers: TokenUtilities) => ReadonlyArray<string>) =>
    Effect.try({
      try: () => f(utils.tokens),
      catch: WinkUtilsError.fromCause(operation),
    });

  const runNGrams = (
    operation: string,
    f: (helpers: StringUtilities) => Record<string, number> | ReadonlyArray<string> | ReadonlySet<string>
  ) =>
    Effect.try({
      try: () => sanitizeNGramResult(f(utils.string)),
      catch: WinkUtilsError.fromCause(operation),
    });

  return WinkUtils.of({
    bagOfNGrams: dual(
      2,
      Effect.fn("Nlp.Wink.WinkUtils.bagOfNGrams")(function* (text: string, size: number) {
        return yield* runNGrams("bagOfNGrams", (helpers) => helpers.bagOfNGrams(text, size));
      })
    ),
    edgeNGrams: dual(
      2,
      Effect.fn("Nlp.Wink.WinkUtils.edgeNGrams")(function* (text: string, size: number) {
        return yield* runNGrams("edgeNGrams", (helpers) => helpers.edgeNGrams(text, size));
      })
    ),
    lowerCase: Effect.fn("Nlp.Wink.WinkUtils.lowerCase")(function* (text: string) {
      return yield* runString("lowerCase", (helpers) => helpers.lowerCase(text));
    }),
    phonetize: Effect.fn("Nlp.Wink.WinkUtils.phonetize")(function* (tokens: ReadonlyArray<string>) {
      return yield* runTokens("phonetize", (helpers) => helpers.phonetize(A.fromIterable(tokens)));
    }),
    removeElisions: Effect.fn("Nlp.Wink.WinkUtils.removeElisions")(function* (text: string) {
      return yield* runString("removeElisions", (helpers) => helpers.removeElisions(text));
    }),
    removeExtraSpaces: Effect.fn("Nlp.Wink.WinkUtils.removeExtraSpaces")(function* (text: string) {
      return yield* runString("removeExtraSpaces", (helpers) => helpers.removeExtraSpaces(text));
    }),
    removeHTMLTags: Effect.fn("Nlp.Wink.WinkUtils.removeHTMLTags")(function* (text: string) {
      return yield* runString("removeHTMLTags", (helpers) => helpers.removeHTMLTags(text));
    }),
    removePunctuations: Effect.fn("Nlp.Wink.WinkUtils.removePunctuations")(function* (text: string) {
      return yield* runString("removePunctuations", (helpers) => helpers.removePunctuations(text));
    }),
    removeSplChars: Effect.fn("Nlp.Wink.WinkUtils.removeSplChars")(function* (text: string) {
      return yield* runString("removeSplChars", (helpers) => helpers.removeSplChars(text));
    }),
    retainAlphaNums: Effect.fn("Nlp.Wink.WinkUtils.retainAlphaNums")(function* (text: string) {
      return yield* runString("retainAlphaNums", (helpers) => helpers.retainAlphaNums(text));
    }),
    sentences: Effect.fn("Nlp.Wink.WinkUtils.sentences")(function* (text: string) {
      return yield* Effect.try({
        try: () => utils.string.sentences(text),
        catch: WinkUtilsError.fromCause("sentences"),
      });
    }),
    setOfNGrams: dual(
      2,
      Effect.fn("Nlp.Wink.WinkUtils.setOfNGrams")(function* (text: string, size: number) {
        return yield* runNGrams("setOfNGrams", (helpers) => helpers.setOfNGrams(text, size));
      })
    ),
    soundex: Effect.fn("Nlp.Wink.WinkUtils.soundex")(function* (tokens: ReadonlyArray<string>) {
      return yield* runTokens("soundex", (helpers) => helpers.soundex(A.fromIterable(tokens)));
    }),
    trim: Effect.fn("Nlp.Wink.WinkUtils.trim")(function* (text: string) {
      return yield* runString("trim", (helpers) => helpers.trim(text));
    }),
    upperCase: Effect.fn("Nlp.Wink.WinkUtils.upperCase")(function* (text: string) {
      return yield* runString("upperCase", (helpers) => helpers.upperCase(text));
    }),
  });
}).pipe(Effect.withSpan("Nlp.Wink.WinkUtils.make"));

/**
 * Service wrapping `wink-nlp-utils` string cleanup, phonetic, and n-gram helpers.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { WinkUtils, WinkUtilsLive } from "@beep/nlp/Wink/WinkUtils"
 *
 * const cleanup = Effect.gen(function* () {
 *   const utils = yield* WinkUtils
 *   return yield* utils.removeHTMLTags("<p>Effect NLP</p>")
 * })
 *
 * Effect.runPromise(cleanup.pipe(Effect.provide(WinkUtilsLive))).then(console.log)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export class WinkUtils extends Context.Service<WinkUtils, WinkUtilsShape>()($I`WinkUtils`) {}

/**
 * Live layer for the `wink-nlp-utils` wrappers.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { WinkUtils, WinkUtilsLive } from "@beep/nlp/Wink/WinkUtils"
 *
 * const ngrams = Effect.gen(function* () {
 *   const utils = yield* WinkUtils
 *   return yield* utils.bagOfNGrams("effect schema effect", 1)
 * })
 *
 * Effect.runPromise(ngrams.pipe(Effect.provide(WinkUtilsLive))).then((result) =>
 *   console.log(result.uniqueNGrams)
 * )
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const WinkUtilsLive = Layer.effect(WinkUtils, makeWinkUtils);
