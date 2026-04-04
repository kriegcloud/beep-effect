/**
 * Pure Wink NLP Utils Service
 * Clean Effect-based wrappers around wink-nlp-utils with data-first, pipeable API
 * Based on https://winkjs.org/wink-nlp-utils/
 * @since 3.0.0
 */

import { Effect, Data, Context, Layer, Chunk, Option } from "effect";
import type { Token } from "../Core/Token.js";
import type { Document } from "../Core/Document.js";
import { createRequire } from "module";

// Import wink-nlp-utils using createRequire for ES modules
const require = createRequire(import.meta.url);
let nlpUtilsCache: ReturnType<typeof require> | undefined

const getNlpUtils = (): ReturnType<typeof require> => {
  if (nlpUtilsCache === undefined) {
    nlpUtilsCache = require("wink-nlp-utils")
  }
  return nlpUtilsCache
};

/**
 * Text transformation input
 */
export const TextInput = Data.case<{
  readonly text: string;
}>();
export type TextInput = ReturnType<typeof TextInput>;

/**
 * Token array input
 */
export const TokensInput = Data.case<{
  readonly tokens: Chunk.Chunk<string>;
}>();
export type TokensInput = ReturnType<typeof TokensInput>;

/**
 * Text transformation result
 */
export const TextResult = Data.case<{
  readonly text: string;
  readonly originalLength: number;
  readonly transformedLength: number;
}>();
export type TextResult = ReturnType<typeof TextResult>;

/**
 * Token transformation result
 */
export const TokensResult = Data.case<{
  readonly tokens: Chunk.Chunk<string>;
  readonly originalCount: number;
  readonly transformedCount: number;
}>();
export type TokensResult = ReturnType<typeof TokensResult>;

/**
 * Detailed tokenization result
 */
export const DetailedToken = Data.case<{
  readonly value: string;
  readonly tag:
    | "word"
    | "punctuation"
    | "email"
    | "hashtag"
    | "mention"
    | "url"
    | "number"
    | "currency";
}>();
export type DetailedToken = ReturnType<typeof DetailedToken>;

export const DetailedTokensResult = Data.case<{
  readonly tokens: Chunk.Chunk<DetailedToken>;
  readonly wordCount: number;
  readonly punctuationCount: number;
  readonly totalCount: number;
}>();
export type DetailedTokensResult = ReturnType<typeof DetailedTokensResult>;

/**
 * N-gram configuration
 */
export const NGramConfig = Data.case<{
  readonly size: number;
}>();
export type NGramConfig = ReturnType<typeof NGramConfig>;

/**
 * N-gram result - wink-nlp-utils returns objects with null prototype
 */
export const NGramResult = Data.case<{
  readonly ngrams: { readonly [key: string]: number };
  readonly totalNGrams: number;
  readonly uniqueNGrams: number;
}>();
export type NGramResult = ReturnType<typeof NGramResult>;

/**
 * Sentence detection result
 */
export const SentencesResult = Data.case<{
  readonly sentences: Chunk.Chunk<string>;
  readonly count: number;
}>();
export type SentencesResult = ReturnType<typeof SentencesResult>;

/**
 * Corpus composition input
 */
export const CorpusTemplate = Data.case<{
  readonly template: string;
}>();
export type CorpusTemplate = ReturnType<typeof CorpusTemplate>;

/**
 * Corpus composition result
 */
export const CorpusResult = Data.case<{
  readonly sentences: Chunk.Chunk<string>;
  readonly combinations: number;
}>();
export type CorpusResult = ReturnType<typeof CorpusResult>;

/**
 * Stop words configuration
 */
export const StopWordsConfig = Data.case<{
  readonly customStopWords: Option.Option<Chunk.Chunk<string>>;
}>();
export type StopWordsConfig = ReturnType<typeof StopWordsConfig>;

export const NGramComparison = Data.case<{
  readonly beforeFiltering: NGramResult;
  readonly afterFiltering: NGramResult;
  readonly removedNGrams: Chunk.Chunk<string>;
  readonly removalRate: number;
}>();
export type NGramComparison = ReturnType<typeof NGramComparison>;

/**
 * Wink utils transformation error
 */
export class WinkUtilsError extends Data.TaggedError("WinkUtilsError")<{
  message: string;
  cause?: unknown;
}> {}

/**
 * Wink NLP Utils Service - Pure wrappers around wink-nlp-utils functions
 */
export class WinkUtils extends Context.Tag("effect-nlp/WinkUtils")<
  WinkUtils,
  {
    // String transformations
    readonly amplifyNotElision: (
      input: TextInput
    ) => Effect.Effect<TextResult, WinkUtilsError>;

    readonly removeElisions: (
      input: TextInput
    ) => Effect.Effect<TextResult, WinkUtilsError>;

    readonly removeExtraSpaces: (
      input: TextInput
    ) => Effect.Effect<TextResult, WinkUtilsError>;

    readonly removeHTMLTags: (
      input: TextInput
    ) => Effect.Effect<TextResult, WinkUtilsError>;

    readonly removePunctuations: (
      input: TextInput
    ) => Effect.Effect<TextResult, WinkUtilsError>;

    readonly removeSplChars: (
      input: TextInput
    ) => Effect.Effect<TextResult, WinkUtilsError>;

    readonly retainAlphaNums: (
      input: TextInput
    ) => Effect.Effect<TextResult, WinkUtilsError>;

    readonly lowerCase: (
      input: TextInput
    ) => Effect.Effect<TextResult, WinkUtilsError>;

    readonly upperCase: (
      input: TextInput
    ) => Effect.Effect<TextResult, WinkUtilsError>;

    readonly trim: (
      input: TextInput
    ) => Effect.Effect<TextResult, WinkUtilsError>;

    readonly extractPersonsName: (
      input: TextInput
    ) => Effect.Effect<TextResult, WinkUtilsError>;

    readonly extractRunOfCapitalWords: (
      input: TextInput
    ) => Effect.Effect<TextResult, WinkUtilsError>;

    // Tokenization
    readonly tokenize: (
      input: TextInput
    ) => Effect.Effect<TokensResult, WinkUtilsError>;

    readonly tokenizeDetailed: (
      input: TextInput
    ) => Effect.Effect<DetailedTokensResult, WinkUtilsError>;

    readonly tokenize0: (
      input: TextInput
    ) => Effect.Effect<TokensResult, WinkUtilsError>;

    // Sentence detection
    readonly sentences: (
      input: TextInput
    ) => Effect.Effect<SentencesResult, WinkUtilsError>;

    // N-grams
    readonly bagOfNGrams: (
      input: TextInput,
      config: NGramConfig
    ) => Effect.Effect<NGramResult, WinkUtilsError>;

    readonly edgeNGrams: (
      input: TextInput,
      config: NGramConfig
    ) => Effect.Effect<NGramResult, WinkUtilsError>;

    readonly setOfNGrams: (
      input: TextInput,
      config: NGramConfig
    ) => Effect.Effect<NGramResult, WinkUtilsError>;

    // Corpus composition
    readonly composeCorpus: (
      input: CorpusTemplate
    ) => Effect.Effect<CorpusResult, WinkUtilsError>;

    // Token operations
    readonly removeWords: (
      input: TokensInput,
      config: StopWordsConfig
    ) => Effect.Effect<TokensResult, WinkUtilsError>;

    readonly stem: (
      input: TokensInput
    ) => Effect.Effect<TokensResult, WinkUtilsError>;

    readonly phonetize: (
      input: TokensInput
    ) => Effect.Effect<TokensResult, WinkUtilsError>;

    readonly soundex: (
      input: TokensInput
    ) => Effect.Effect<TokensResult, WinkUtilsError>;

    readonly bagOfWords: (
      input: TokensInput
    ) => Effect.Effect<NGramResult, WinkUtilsError>;

    readonly setOfWords: (
      input: TokensInput
    ) => Effect.Effect<NGramResult, WinkUtilsError>;

    readonly bigrams: (
      input: TokensInput
    ) => Effect.Effect<TokensResult, WinkUtilsError>;

    readonly appendBigrams: (
      input: TokensInput
    ) => Effect.Effect<TokensResult, WinkUtilsError>;

    readonly propagateNegations: (
      input: TokensInput
    ) => Effect.Effect<TokensResult, WinkUtilsError>;
  }
>() {}

/**
 * Create WinkUtils implementation
 */
const createWinkUtilsImpl = () => {
  // Input validation helper
  const validateTextInput = (text: string): string => {
    if (typeof text !== "string") {
      throw new Error("Input must be a string");
    }
    return text;
  };

  const createTextResult = (
    original: string,
    transformed: string
  ): TextResult =>
    TextResult({
      text: transformed || "", // Ensure transformed is never undefined
      originalLength: original.length,
      transformedLength: (transformed || "").length,
    });

  const createTokensResult = (
    originalTokens: Chunk.Chunk<string>,
    transformedTokens: Chunk.Chunk<string>
  ): TokensResult =>
    TokensResult({
      tokens: transformedTokens,
      originalCount: Chunk.size(originalTokens),
      transformedCount: Chunk.size(transformedTokens),
    });

  return WinkUtils.of({
    // String transformations
    amplifyNotElision: (input: TextInput) =>
      Effect.try({
        try: () => {
          const validatedText = validateTextInput(input.text);
          const result = getNlpUtils().string.amplifyNotElision(validatedText);
          return createTextResult(validatedText, result);
        },
        catch: (error) =>
          new WinkUtilsError({
            message: "Failed to amplify not elision",
            cause: error,
          }),
      }),

    removeElisions: (input: TextInput) =>
      Effect.try({
        try: () => {
          const result = getNlpUtils().string.removeElisions(input.text);
          return createTextResult(input.text, result);
        },
        catch: (error) =>
          new WinkUtilsError({
            message: "Failed to remove elisions",
            cause: error,
          }),
      }),

    removeExtraSpaces: (input: TextInput) =>
      Effect.try({
        try: () => {
          const result = getNlpUtils().string.removeExtraSpaces(input.text);
          return createTextResult(input.text, result);
        },
        catch: (error) =>
          new WinkUtilsError({
            message: "Failed to remove extra spaces",
            cause: error,
          }),
      }),

    removeHTMLTags: (input: TextInput) =>
      Effect.try({
        try: () => {
          const result = getNlpUtils().string.removeHTMLTags(input.text);
          return createTextResult(input.text, result);
        },
        catch: (error) =>
          new WinkUtilsError({
            message: "Failed to remove HTML tags",
            cause: error,
          }),
      }),

    removePunctuations: (input: TextInput) =>
      Effect.try({
        try: () => {
          const result = getNlpUtils().string.removePunctuations(input.text);
          return createTextResult(input.text, result);
        },
        catch: (error) =>
          new WinkUtilsError({
            message: "Failed to remove punctuations",
            cause: error,
          }),
      }),

    removeSplChars: (input: TextInput) =>
      Effect.try({
        try: () => {
          const result = getNlpUtils().string.removeSplChars(input.text);
          return createTextResult(input.text, result);
        },
        catch: (error) =>
          new WinkUtilsError({
            message: "Failed to remove special characters",
            cause: error,
          }),
      }),

    retainAlphaNums: (input: TextInput) =>
      Effect.try({
        try: () => {
          const result = getNlpUtils().string.retainAlphaNums(input.text);
          return createTextResult(input.text, result);
        },
        catch: (error) =>
          new WinkUtilsError({
            message: "Failed to retain alphanumeric characters",
            cause: error,
          }),
      }),

    lowerCase: (input: TextInput) =>
      Effect.try({
        try: () => {
          const result = getNlpUtils().string.lowerCase(input.text);
          return createTextResult(input.text, result);
        },
        catch: (error) =>
          new WinkUtilsError({
            message: "Failed to convert to lowercase",
            cause: error,
          }),
      }),

    upperCase: (input: TextInput) =>
      Effect.try({
        try: () => {
          const result = getNlpUtils().string.upperCase(input.text);
          return createTextResult(input.text, result);
        },
        catch: (error) =>
          new WinkUtilsError({
            message: "Failed to convert to uppercase",
            cause: error,
          }),
      }),

    trim: (input: TextInput) =>
      Effect.try({
        try: () => {
          const result = getNlpUtils().string.trim(input.text);
          return createTextResult(input.text, result);
        },
        catch: (error) =>
          new WinkUtilsError({
            message: "Failed to trim string",
            cause: error,
          }),
      }),

    extractPersonsName: (input: TextInput) =>
      Effect.try({
        try: () => {
          const result = getNlpUtils().string.extractPersonsName(input.text);
          return createTextResult(input.text, result);
        },
        catch: (error) =>
          new WinkUtilsError({
            message: "Failed to extract person's name",
            cause: error,
          }),
      }),

    extractRunOfCapitalWords: (input: TextInput) =>
      Effect.try({
        try: () => {
          const result = getNlpUtils().string.extractRunOfCapitalWords(input.text);
          // extractRunOfCapitalWords returns an array, join it to a string
          const resultText = Array.isArray(result)
            ? result.join(", ")
            : String(result);
          return createTextResult(input.text, resultText);
        },
        catch: (error) =>
          new WinkUtilsError({
            message: "Failed to extract run of capital words",
            cause: error,
          }),
      }),

    // Tokenization
    tokenize: (input: TextInput) =>
      Effect.try({
        try: () => {
          const result = getNlpUtils().string.tokenize(input.text, false);
          // Filter out any null/undefined values and ensure strings
          const cleanResult = result
            .filter((token: any) => token != null)
            .map(String);
          const tokens = Chunk.fromIterable(cleanResult);
          return createTokensResult(
            Chunk.empty(),
            tokens as Chunk.Chunk<string>
          );
        },
        catch: (error) =>
          new WinkUtilsError({
            message: "Failed to tokenize text",
            cause: error,
          }),
      }),

    tokenizeDetailed: (input: TextInput) =>
      Effect.try({
        try: () => {
          const result: Array<{ value: string; tag: string }> =
            getNlpUtils().string.tokenize(input.text, true);
          const detailedTokens = Chunk.fromIterable(
            result.map((token) => {
              // Validate tag type
              const validTags = [
                "word",
                "punctuation",
                "email",
                "hashtag",
                "mention",
                "url",
                "number",
                "currency",
              ] as const;
              const tag = validTags.includes(token.tag as any)
                ? (token.tag as DetailedToken["tag"])
                : "word"; // fallback to word for unknown tags

              return DetailedToken({
                value: token.value || "", // Ensure value is never undefined
                tag,
              });
            })
          );

          const wordCount = Chunk.size(
            Chunk.filter(detailedTokens, (token) => token.tag === "word")
          );
          const punctuationCount = Chunk.size(
            Chunk.filter(detailedTokens, (token) => token.tag === "punctuation")
          );

          return DetailedTokensResult({
            tokens: detailedTokens,
            wordCount,
            punctuationCount,
            totalCount: Chunk.size(detailedTokens),
          });
        },
        catch: (error) =>
          new WinkUtilsError({
            message: "Failed to tokenize text with details",
            cause: error,
          }),
      }),

    tokenize0: (input: TextInput) =>
      Effect.try({
        try: () => {
          const result = getNlpUtils().string.tokenize0(input.text);
          // Filter out any null/undefined values and ensure strings
          const cleanResult = result
            .filter((token: any) => token != null)
            .map(String);
          const tokens = Chunk.fromIterable(cleanResult);
          return createTokensResult(
            Chunk.empty(),
            tokens as Chunk.Chunk<string>
          );
        },
        catch: (error) =>
          new WinkUtilsError({
            message: "Failed to tokenize text (tokenize0)",
            cause: error,
          }),
      }),

    // Sentence detection
    sentences: (input: TextInput) =>
      Effect.try({
        try: () => {
          const result = getNlpUtils().string.sentences(input.text);
          const sentences = Chunk.fromIterable(result);
          return SentencesResult({
            sentences: sentences as Chunk.Chunk<string>,
            count: Chunk.size(sentences),
          });
        },
        catch: (error) =>
          new WinkUtilsError({
            message: "Failed to detect sentences",
            cause: error,
          }),
      }),

    // N-grams
    bagOfNGrams: (input: TextInput, config: NGramConfig) =>
      Effect.try({
        try: () => {
          const result = getNlpUtils().string.bagOfNGrams(input.text, config.size);
          const totalNGrams = Object.values(result).reduce((a, b) => {
            return (a as number) + (b as number);
          }, 0);
          return NGramResult({
            ngrams: result,
            totalNGrams: totalNGrams as unknown as number,
            uniqueNGrams: Object.keys(result).length,
          });
        },
        catch: (error) =>
          new WinkUtilsError({
            message: "Failed to generate bag of n-grams",
            cause: error,
          }),
      }),

    edgeNGrams: (input: TextInput, config: NGramConfig) =>
      Effect.try({
        try: () => {
          const result = getNlpUtils().string.edgeNGrams(input.text, config.size);
          // edgeNGrams returns an array, convert to object with counts
          const ngrams: { [key: string]: number } = {};
          if (Array.isArray(result)) {
            result.forEach((ngram: string) => {
              ngrams[ngram] = (ngrams[ngram] || 0) + 1;
            });
          }
          return NGramResult({
            ngrams,
            totalNGrams: result.length,
            uniqueNGrams: Object.keys(ngrams).length,
          });
        },
        catch: (error) =>
          new WinkUtilsError({
            message: "Failed to generate edge n-grams",
            cause: error,
          }),
      }),

    setOfNGrams: (input: TextInput, config: NGramConfig) =>
      Effect.try({
        try: () => {
          const result = getNlpUtils().string.setOfNGrams(input.text, config.size);
          // setOfNGrams returns a Set, convert to object with counts
          const ngrams: { [key: string]: number } = {};
          if (result instanceof Set) {
            result.forEach((ngram: string) => {
              ngrams[ngram] = 1; // Sets have unique items, so count is 1
            });
          }
          return NGramResult({
            ngrams,
            totalNGrams: result.size,
            uniqueNGrams: result.size,
          });
        },
        catch: (error) =>
          new WinkUtilsError({
            message: "Failed to generate set of n-grams",
            cause: error,
          }),
      }),

    // Corpus composition
    composeCorpus: (input: CorpusTemplate) =>
      Effect.try({
        try: () => {
          const result = getNlpUtils().string.composeCorpus(input.template);
          const sentences = Chunk.fromIterable(result);
          return CorpusResult({
            sentences: sentences as Chunk.Chunk<string>,
            combinations: Chunk.size(sentences),
          });
        },
        catch: (error) =>
          new WinkUtilsError({
            message: "Failed to compose corpus",
            cause: error,
          }),
      }),

    // Token operations
    removeWords: (input: TokensInput, config: StopWordsConfig) =>
      Effect.try({
        try: () => {
          const tokensArray = Chunk.toReadonlyArray(input.tokens);
          // When customStopWords is None, pass undefined to use wink-nlp-utils default stop words
          const customStopWords = Option.match(config.customStopWords, {
            onNone: () => undefined, // Use default stop words from wink-nlp-utils
            onSome: (words) =>
              getNlpUtils().helper.returnWordsFilter(Chunk.toReadonlyArray(words)),
          });

          const result = getNlpUtils().tokens.removeWords(
            tokensArray,
            customStopWords
          );
          const filteredTokens = Chunk.fromIterable(result);
          return createTokensResult(
            input.tokens,
            filteredTokens as Chunk.Chunk<string>
          );
        },
        catch: (error) =>
          new WinkUtilsError({
            message: "Failed to remove stop words",
            cause: error,
          }),
      }),

    stem: (input: TokensInput) =>
      Effect.try({
        try: () => {
          const tokensArray = Chunk.toReadonlyArray(input.tokens);
          const result = getNlpUtils().tokens.stem(tokensArray);
          const stemmedTokens = Chunk.fromIterable(result);
          return createTokensResult(
            input.tokens,
            stemmedTokens as Chunk.Chunk<string>
          );
        },
        catch: (error) =>
          new WinkUtilsError({
            message: "Failed to stem tokens",
            cause: error,
          }),
      }),

    phonetize: (input: TokensInput) =>
      Effect.try({
        try: () => {
          const tokensArray = Chunk.toReadonlyArray(input.tokens);
          const result = getNlpUtils().tokens.phonetize(tokensArray);
          const phoneticTokens = Chunk.fromIterable(result);
          return createTokensResult(
            input.tokens,
            phoneticTokens as Chunk.Chunk<string>
          );
        },
        catch: (error) =>
          new WinkUtilsError({
            message: "Failed to phonetize tokens",
            cause: error,
          }),
      }),

    soundex: (input: TokensInput) =>
      Effect.try({
        try: () => {
          const tokensArray = Chunk.toReadonlyArray(input.tokens);
          const result = getNlpUtils().tokens.soundex(tokensArray);
          const soundexTokens = Chunk.fromIterable(result);
          return createTokensResult(
            input.tokens,
            soundexTokens as Chunk.Chunk<string>
          );
        },
        catch: (error) =>
          new WinkUtilsError({
            message: "Failed to generate soundex codes",
            cause: error,
          }),
      }),

    bagOfWords: (input: TokensInput) =>
      Effect.try({
        try: () => {
          const tokensArray = Chunk.toReadonlyArray(input.tokens);
          const result = getNlpUtils().tokens.bagOfWords(tokensArray);
          const totalWords = Object.values(result).reduce((a, b) => {
            return (a as number) + (b as number);
          }, 0);
          return NGramResult({
            ngrams: result,
            totalNGrams: totalWords as unknown as number,
            uniqueNGrams: Object.keys(result).length,
          });
        },
        catch: (error) =>
          new WinkUtilsError({
            message: "Failed to generate bag of words",
            cause: error,
          }),
      }),

    setOfWords: (input: TokensInput) =>
      Effect.try({
        try: () => {
          const tokensArray = Chunk.toReadonlyArray(input.tokens);
          const result = getNlpUtils().tokens.setOfWords(tokensArray);
          // setOfWords returns a Set, convert to object with counts
          const ngrams: { [key: string]: number } = {};
          if (result instanceof Set) {
            result.forEach((word: string) => {
              ngrams[word] = 1; // Sets have unique items, so count is 1
            });
          }
          return NGramResult({
            ngrams,
            totalNGrams: result.size,
            uniqueNGrams: result.size,
          });
        },
        catch: (error) =>
          new WinkUtilsError({
            message: "Failed to generate set of words",
            cause: error,
          }),
      }),

    bigrams: (input: TokensInput) =>
      Effect.try({
        try: () => {
          const tokensArray = Chunk.toReadonlyArray(input.tokens);
          const result = getNlpUtils().tokens.bigrams(tokensArray);
          // bigrams returns array of arrays, we need to handle this properly
          const bigramTokens = Chunk.fromIterable(result);
          return createTokensResult(
            input.tokens,
            bigramTokens as Chunk.Chunk<string>
          );
        },
        catch: (error) =>
          new WinkUtilsError({
            message: "Failed to generate bigrams",
            cause: error,
          }),
      }),

    appendBigrams: (input: TokensInput) =>
      Effect.try({
        try: () => {
          const tokensArray = Chunk.toReadonlyArray(input.tokens);
          const result = getNlpUtils().tokens.appendBigrams(tokensArray);
          const appendedTokens = Chunk.fromIterable(result);
          return createTokensResult(
            input.tokens,
            appendedTokens as Chunk.Chunk<string>
          );
        },
        catch: (error) =>
          new WinkUtilsError({
            message: "Failed to append bigrams",
            cause: error,
          }),
      }),

    propagateNegations: (input: TokensInput) =>
      Effect.try({
        try: () => {
          const tokensArray = Chunk.toReadonlyArray(input.tokens);
          const result = getNlpUtils().tokens.propagateNegations(tokensArray);
          const negatedTokens = Chunk.fromIterable(result);
          return createTokensResult(
            input.tokens,
            negatedTokens as Chunk.Chunk<string>
          );
        },
        catch: (error) =>
          new WinkUtilsError({
            message: "Failed to propagate negations",
            cause: error,
          }),
      }),
  });
};

/**
 * Live implementation of WinkUtils
 */
export const WinkUtilsLive = Layer.succeed(WinkUtils, createWinkUtilsImpl());

/**
 * Data-first convenience functions for pipeable transformations
 */

// String transformations
export const amplifyNotElision = (input: TextInput) =>
  Effect.flatMap(WinkUtils, (service) => service.amplifyNotElision(input));

export const removeElisions = (input: TextInput) =>
  Effect.flatMap(WinkUtils, (service) => service.removeElisions(input));

export const removeExtraSpaces = (input: TextInput) =>
  Effect.flatMap(WinkUtils, (service) => service.removeExtraSpaces(input));

export const removeHTMLTags = (input: TextInput) =>
  Effect.flatMap(WinkUtils, (service) => service.removeHTMLTags(input));

export const removePunctuations = (input: TextInput) =>
  Effect.flatMap(WinkUtils, (service) => service.removePunctuations(input));

export const removeSplChars = (input: TextInput) =>
  Effect.flatMap(WinkUtils, (service) => service.removeSplChars(input));

export const retainAlphaNums = (input: TextInput) =>
  Effect.flatMap(WinkUtils, (service) => service.retainAlphaNums(input));

export const lowerCase = (input: TextInput) =>
  Effect.flatMap(WinkUtils, (service) => service.lowerCase(input));

export const upperCase = (input: TextInput) =>
  Effect.flatMap(WinkUtils, (service) => service.upperCase(input));

export const trim = (input: TextInput) =>
  Effect.flatMap(WinkUtils, (service) => service.trim(input));

export const extractPersonsName = (input: TextInput) =>
  Effect.flatMap(WinkUtils, (service) => service.extractPersonsName(input));

export const extractRunOfCapitalWords = (input: TextInput) =>
  Effect.flatMap(WinkUtils, (service) =>
    service.extractRunOfCapitalWords(input)
  );

// Tokenization (with utils prefix to avoid conflicts)
export const utilsTokenize = (input: TextInput) =>
  Effect.flatMap(WinkUtils, (service) => service.tokenize(input));

export const utilsTokenizeDetailed = (input: TextInput) =>
  Effect.flatMap(WinkUtils, (service) => service.tokenizeDetailed(input));

export const utilsTokenize0 = (input: TextInput) =>
  Effect.flatMap(WinkUtils, (service) => service.tokenize0(input));

// Sentence detection
export const sentences = (input: TextInput) =>
  Effect.flatMap(WinkUtils, (service) => service.sentences(input));

// N-grams
export const bagOfNGrams = (input: TextInput, config: NGramConfig) =>
  Effect.flatMap(WinkUtils, (service) => service.bagOfNGrams(input, config));

export const edgeNGrams = (input: TextInput, config: NGramConfig) =>
  Effect.flatMap(WinkUtils, (service) => service.edgeNGrams(input, config));

export const setOfNGrams = (input: TextInput, config: NGramConfig) =>
  Effect.flatMap(WinkUtils, (service) => service.setOfNGrams(input, config));

// Corpus composition
export const composeCorpus = (input: CorpusTemplate) =>
  Effect.flatMap(WinkUtils, (service) => service.composeCorpus(input));

// Token operations
export const removeWords = (input: TokensInput, config: StopWordsConfig) =>
  Effect.flatMap(WinkUtils, (service) => service.removeWords(input, config));

export const stem = (input: TokensInput) =>
  Effect.flatMap(WinkUtils, (service) => service.stem(input));

export const phonetize = (input: TokensInput) =>
  Effect.flatMap(WinkUtils, (service) => service.phonetize(input));

export const soundex = (input: TokensInput) =>
  Effect.flatMap(WinkUtils, (service) => service.soundex(input));

export const bagOfWords = (input: TokensInput) =>
  Effect.flatMap(WinkUtils, (service) => service.bagOfWords(input));

export const setOfWords = (input: TokensInput) =>
  Effect.flatMap(WinkUtils, (service) => service.setOfWords(input));

export const bigrams = (input: TokensInput) =>
  Effect.flatMap(WinkUtils, (service) => service.bigrams(input));

export const appendBigrams = (input: TokensInput) =>
  Effect.flatMap(WinkUtils, (service) => service.appendBigrams(input));

export const propagateNegations = (input: TokensInput) =>
  Effect.flatMap(WinkUtils, (service) => service.propagateNegations(input));

/**
 * Core Type Integration Helpers
 * Functions to bridge between Core types and WinkUtils primitive types
 */

/**
 * Convert Core Token array to TokensInput for WinkUtils
 */
export const tokensToTokensInput = (tokens: Chunk.Chunk<Token>): TokensInput =>
  TokensInput({
    tokens: Chunk.map(tokens, (token) =>
      Option.match(token.normal, {
        onNone: () => token.text,
        onSome: (normal) => normal ?? token.text,
      })
    ),
  });

/**
 * Convert Document to TextInput for WinkUtils text operations
 */
export const documentToTextInput = (document: Document): TextInput =>
  TextInput({ text: document.text });

/**
 * Extract normalized tokens from Document as TokensInput
 */
export const documentToTokensInput = (document: Document): TokensInput =>
  tokensToTokensInput(document.tokens);

/**
 * Process Document tokens with WinkUtils and return updated tokens as strings
 */
export const processDocumentTokens = (
  document: Document,
  processor: (input: TokensInput) => Effect.Effect<TokensResult, WinkUtilsError>
): Effect.Effect<Chunk.Chunk<string>, WinkUtilsError> =>
  Effect.gen(function* () {
    const tokensInput = documentToTokensInput(document);
    const result = yield* processor(tokensInput);
    return result.tokens;
  });
