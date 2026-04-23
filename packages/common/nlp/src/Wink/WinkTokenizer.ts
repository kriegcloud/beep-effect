/**
 * Wink-backed tokenization layer.
 *
 * @since 0.0.0
 * @module
 */

import { $NlpId } from "@beep/identity";
import { thunkEmptyStr } from "@beep/utils";
import { Chunk, Clock, Effect, Layer, pipe, Ref } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import type { ItemSentence, ItemToken, ItsHelpers, Document as WinkDocument } from "wink-nlp";
import { Document, DocumentId } from "../Core/Document.ts";
import { Tokenization, TokenizationError } from "../Core/index.ts";
import { Sentence, SentenceIndex } from "../Core/Sentence.ts";
import { CharPosition, Token, TokenIndex } from "../Core/Token.ts";
import { WinkEngine, WinkEngineLive } from "./WinkEngine.ts";

const $I = $NlpId.create("Wink/WinkTokenizer");

const makeTokenizationError =
  (operation: string) =>
  (cause: unknown): TokenizationError =>
    new TokenizationError({
      cause,
      operation,
    });

/**
 * Failure raised when wink sentence spans cannot be derived from the token stream.
 *
 * @example
 * ```ts
 * import { SentenceSpanFailure } from "@beep/nlp/Wink/WinkTokenizer"
 *
 * console.log(SentenceSpanFailure)
 * ```
 *
 * @since 0.0.0
 * @category Errors
 */
export class SentenceSpanFailure extends S.TaggedClass<SentenceSpanFailure>($I`SentenceSpanFailure`)(
  "SentenceSpanFailure",
  {
    reason: S.String,
    sentenceIndex: S.Number,
    sentenceText: S.String,
  },
  $I.annote("SentenceSpanFailure", {
    description: "Failure raised when wink sentence spans cannot be derived from token positions.",
  })
) {}

const decodeDocumentIdOption = S.decodeUnknownOption(DocumentId);

const isSpan = (value: unknown): value is readonly [number, number] =>
  A.isArray(value) && value.length >= 2 && P.isNumber(value[0]) && P.isNumber(value[1]);

const getSentenceSpan = (sentence: ItemSentence, its: ItsHelpers): readonly [number, number] | undefined => {
  const span = sentence.out(its.span);
  return isSpan(span) ? [span[0], span[1]] : undefined;
};

const countSentenceTokens = (sentence: ItemSentence): number => {
  let count = 0;

  sentence.tokens().each(() => {
    count += 1;
  });

  return count;
};

const deriveSequentialSentenceSpan = (
  sentence: ItemSentence,
  nextTokenStart: number,
  totalTokenCount: number
): O.Option<readonly [number, number]> => {
  const sentenceTokenCount = countSentenceTokens(sentence);

  if (sentenceTokenCount <= 0) {
    return O.none();
  }

  const end = nextTokenStart + sentenceTokenCount - 1;
  return end >= totalTokenCount ? O.none() : O.some([nextTokenStart, end] as const);
};

const resolveSentenceSpan = (
  sentence: ItemSentence,
  its: ItsHelpers,
  nextTokenStart: number,
  totalTokenCount: number
): O.Option<readonly [number, number]> =>
  pipe(
    (() => {
      const span = getSentenceSpan(sentence, its);
      return P.isUndefined(span) ? O.none() : O.some(span);
    })(),
    O.filter(([start, end]) => start >= 0 && end >= start && end < totalTokenCount),
    O.orElse(() => deriveSequentialSentenceSpan(sentence, nextTokenStart, totalTokenCount))
  );

const tryOut = (token: ItemToken, itsFunction: unknown): unknown => {
  try {
    return Reflect.apply(token.out, token, [itsFunction]);
  } catch {
    return undefined;
  }
};

const optionFromTokenString = (token: ItemToken, itsFunction: unknown): O.Option<string> => {
  const value = tryOut(token, itsFunction);
  return value === undefined || !P.isString(value) ? O.none() : O.some(value);
};

const optionFromTokenBoolean = (token: ItemToken, itsFunction: unknown): O.Option<boolean> => {
  const value = tryOut(token, itsFunction);
  return P.isUndefined(value) || !P.isBoolean(value) ? O.none() : O.some(value);
};

const optionFromTokenNumber = (token: ItemToken, itsFunction: unknown): O.Option<number> => {
  const value = tryOut(token, itsFunction);
  return P.isUndefined(value) || !P.isNumber(value) ? O.none() : O.some(value);
};

const readPrecedingSpaces = (token: ItemToken, its: ItsHelpers): string =>
  O.getOrElse(optionFromTokenString(token, its.precedingSpaces), thunkEmptyStr);

const makeToken = (token: ItemToken, index: number, its: ItsHelpers, previousEnd: number): readonly [Token, number] => {
  const text = token.out();
  const precedingSpaces = readPrecedingSpaces(token, its);
  const start = previousEnd + precedingSpaces.length;
  const end = start + text.length;

  return [
    Token.make({
      abbrevFlag: optionFromTokenBoolean(token, its.abbrevFlag),
      case: optionFromTokenString(token, its.case),
      contractionFlag: optionFromTokenBoolean(token, its.contractionFlag),
      end: CharPosition.make(end),
      index: TokenIndex.make(index),
      lemma: optionFromTokenString(token, its.lemma),
      negationFlag: optionFromTokenBoolean(token, its.negationFlag),
      normal: optionFromTokenString(token, its.normal),
      pos: optionFromTokenString(token, its.pos),
      prefix: optionFromTokenString(token, its.prefix),
      precedingSpaces: precedingSpaces.length === 0 ? O.none() : O.some(precedingSpaces),
      shape: optionFromTokenString(token, its.shape),
      start: CharPosition.make(start),
      stem: optionFromTokenString(token, its.stem),
      stopWordFlag: optionFromTokenBoolean(token, its.stopWordFlag),
      suffix: optionFromTokenString(token, its.suffix),
      tags: A.empty(),
      text,
      uniqueId: optionFromTokenNumber(token, its.uniqueId),
    }),
    end,
  ] as const;
};

const collectTokens = (doc: WinkDocument, its: ItsHelpers): Chunk.Chunk<Token> => {
  const tokens = A.empty<Token>();
  let previousEnd = 0;

  doc.tokens().each((token, index) => {
    const [mappedToken, nextEnd] = makeToken(token, index, its, previousEnd);
    tokens.push(mappedToken);
    previousEnd = nextEnd;
  });

  return Chunk.fromIterable(tokens);
};

const collectSentences = (
  doc: WinkDocument,
  tokens: Chunk.Chunk<Token>,
  its: ItsHelpers
): Effect.Effect<Chunk.Chunk<Sentence>, SentenceSpanFailure> => {
  const tokenArray = Chunk.toReadonlyArray(tokens);
  const sentences = A.empty<Sentence>();
  let failure: O.Option<SentenceSpanFailure> = O.none();
  let nextTokenStart = 0;

  doc.sentences().each((sentence, index) => {
    if (O.isSome(failure)) {
      return;
    }

    const resolvedSpan = resolveSentenceSpan(sentence, its, nextTokenStart, tokenArray.length);

    if (O.isNone(resolvedSpan)) {
      failure = O.some({
        _tag: "SentenceSpanFailure",
        reason: "Unable to derive a stable sentence token span.",
        sentenceIndex: index,
        sentenceText: sentence.out(),
      });
      return;
    }

    const [safeStart, safeEnd] = resolvedSpan.value;
    const sentenceTokens = pipe(tokenArray, A.drop(safeStart), A.take(safeEnd - safeStart + 1));
    const firstToken = sentenceTokens[0];

    if (P.isUndefined(firstToken)) {
      failure = O.some(
        new SentenceSpanFailure({
          reason: "Resolved sentence span produced no tokens.",
          sentenceIndex: index,
          sentenceText: sentence.out(),
        })
      );
      return;
    }

    const lastToken = A.reduce(sentenceTokens, firstToken, (_, token) => token);

    sentences.push(
      Sentence.make({
        end: lastToken.index,
        importance: O.none(),
        index: SentenceIndex.make(index),
        markedUpText: O.none(),
        negationFlag: O.none(),
        sentiment: O.none(),
        start: firstToken.index,
        text: sentence.out(),
        tokens: Chunk.fromIterable(sentenceTokens),
      })
    );

    nextTokenStart = safeEnd + 1;
  });

  return O.match(failure, {
    onNone: () => Effect.succeed(Chunk.fromIterable(sentences)),
    onSome: Effect.fail,
  });
};

const buildDocument = (
  text: string,
  documentId: DocumentId,
  tokens: Chunk.Chunk<Token>,
  sentences: Chunk.Chunk<Sentence>,
  doc: WinkDocument,
  its: ItsHelpers
): Document => {
  const sentiment = doc.out(its.sentiment);

  return Document.make({
    id: documentId,
    sentiment: P.isNumber(sentiment) ? O.some(sentiment) : O.none(),
    sentences,
    text,
    tokens,
  });
};

const resolveDocumentId = (
  rawId: DocumentId | string,
  operation: string
): Effect.Effect<DocumentId, TokenizationError> =>
  O.match(decodeDocumentIdOption(rawId), {
    onNone: () =>
      Effect.fail(
        new TokenizationError({
          cause: {
            input: rawId,
            reason: "Document ids must be non-empty strings.",
          },
          operation,
        })
      ),
    onSome: Effect.succeed,
  });

const makeWinkTokenization = Effect.gen(function* () {
  const engine = yield* WinkEngine;
  const documentIdCounterRef = yield* Ref.make(0);

  const allocateDocumentId = Ref.updateAndGet(documentIdCounterRef, (current) => current + 1).pipe(
    Effect.flatMap(
      Effect.fnUntraced(function* (counter) {
        return yield* Clock.currentTimeMillis.pipe(Effect.map((nowMs) => `doc-${nowMs}-${counter}`));
      })
    )
  );

  return Tokenization.of({
    document: Effect.fn("Nlp.Wink.WinkTokenizer.document")(function* (text: string, id?: DocumentId | string) {
      const doc = yield* engine.getWinkDoc(text).pipe(Effect.mapError(makeTokenizationError("document")));
      const its = yield* engine.its.pipe(Effect.mapError(makeTokenizationError("document")));
      const tokens = collectTokens(doc, its);
      const sentences = yield* collectSentences(doc, tokens, its).pipe(
        Effect.mapError(makeTokenizationError("document"))
      );
      const rawDocumentId = P.isUndefined(id) ? yield* allocateDocumentId : id;
      const documentId = yield* resolveDocumentId(rawDocumentId, "document");
      return buildDocument(text, documentId, tokens, sentences, doc, its);
    }),
    sentences: Effect.fn("Nlp.Wink.WinkTokenizer.sentences")(function* (text: string) {
      const doc = yield* engine.getWinkDoc(text).pipe(Effect.mapError(makeTokenizationError("sentences")));
      const its = yield* engine.its.pipe(Effect.mapError(makeTokenizationError("sentences")));
      const tokens = collectTokens(doc, its);
      return yield* collectSentences(doc, tokens, its).pipe(
        Effect.map(Chunk.toReadonlyArray),
        Effect.mapError(makeTokenizationError("sentences"))
      );
    }),
    tokenCount: Effect.fn("Nlp.Wink.WinkTokenizer.tokenCount")(function* (text: string) {
      return yield* engine.getWinkTokenCount(text).pipe(Effect.mapError(makeTokenizationError("tokenCount")));
    }),
    tokenize: Effect.fn("Nlp.Wink.WinkTokenizer.tokenize")(function* (text: string) {
      const doc = yield* engine.getWinkDoc(text).pipe(Effect.mapError(makeTokenizationError("tokenize")));
      const its = yield* engine.its.pipe(Effect.mapError(makeTokenizationError("tokenize")));
      return Chunk.toReadonlyArray(collectTokens(doc, its));
    }),
  });
}).pipe(Effect.withSpan("Nlp.Wink.WinkTokenizer.make"));

/**
 * Wink-backed tokenization layer.
 *
 * @example
 * ```ts
 * import { WinkTokenization } from "@beep/nlp/Wink/WinkTokenizer"
 *
 * console.log(WinkTokenization)
 * ```
 *
 * @since 0.0.0
 * @category Layers
 */
export const WinkTokenization = Layer.effect(Tokenization, makeWinkTokenization);

/**
 * Wink-backed tokenization layer with the live engine provided.
 *
 * @example
 * ```ts
 * import { WinkTokenizationLive } from "@beep/nlp/Wink/WinkTokenizer"
 *
 * console.log(WinkTokenizationLive)
 * ```
 *
 * @since 0.0.0
 * @category Layers
 */
export const WinkTokenizationLive = WinkTokenization.pipe(Layer.provide(WinkEngineLive));
