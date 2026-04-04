/**
 * Wink-backed tokenization layer.
 *
 * @since 0.0.0
 * @module @beep/nlp/Wink/WinkTokenizer
 */

import { Chunk, Clock, Effect, Layer } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import type { ItemSentence, ItemToken, ItsHelpers, Document as WinkDocument } from "wink-nlp";
import { Document, DocumentId } from "../Core/Document.ts";
import { Sentence, SentenceIndex } from "../Core/Sentence.ts";
import { CharPosition, Token, TokenIndex } from "../Core/Token.ts";
import { Tokenization, TokenizationError } from "../Core/Tokenization.ts";
import { WinkEngine, WinkEngineLive } from "./WinkEngine.ts";
import type { WinkEngineError, WinkTokenizationError } from "./WinkErrors.ts";

const makeTokenizationError =
  (operation: string) =>
  (cause: WinkEngineError | WinkTokenizationError): TokenizationError =>
    new TokenizationError({ cause, operation });

const isSpan = (value: unknown): value is readonly [number, number] =>
  A.isArray(value) && value.length >= 2 && P.isNumber(value[0]) && P.isNumber(value[1]);

const getSentenceSpan = (sentence: ItemSentence, its: ItsHelpers): readonly [number, number] | undefined => {
  const span = sentence.out(its.span);
  return isSpan(span) ? [span[0], span[1]] : undefined;
};

const tryOut = (token: ItemToken, itsFunction: unknown): unknown => {
  try {
    return token.out(itsFunction as never);
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
  return value === undefined || !P.isBoolean(value) ? O.none() : O.some(value);
};

const optionFromTokenNumber = (token: ItemToken, itsFunction: unknown): O.Option<number> => {
  const value = tryOut(token, itsFunction);
  return value === undefined || !P.isNumber(value) ? O.none() : O.some(value);
};

const readPrecedingSpaces = (token: ItemToken, its: ItsHelpers): string =>
  O.getOrElse(optionFromTokenString(token, its.precedingSpaces), () => "");

const makeToken = (token: ItemToken, index: number, its: ItsHelpers, previousEnd: number): readonly [Token, number] => {
  const text = token.out();
  const precedingSpaces = readPrecedingSpaces(token, its);
  const start = previousEnd + precedingSpaces.length;
  const end = start + text.length;

  return [
    Token.makeUnsafe({
      abbrevFlag: optionFromTokenBoolean(token, its.abbrevFlag),
      case: optionFromTokenString(token, its.case),
      contractionFlag: optionFromTokenBoolean(token, its.contractionFlag),
      end: CharPosition.makeUnsafe(end),
      index: TokenIndex.makeUnsafe(index),
      lemma: optionFromTokenString(token, its.lemma),
      negationFlag: optionFromTokenBoolean(token, its.negationFlag),
      normal: optionFromTokenString(token, its.normal),
      pos: optionFromTokenString(token, its.pos),
      prefix: optionFromTokenString(token, its.prefix),
      precedingSpaces: precedingSpaces.length === 0 ? O.none() : O.some(precedingSpaces),
      shape: optionFromTokenString(token, its.shape),
      start: CharPosition.makeUnsafe(start),
      stem: optionFromTokenString(token, its.stem),
      stopWordFlag: optionFromTokenBoolean(token, its.stopWordFlag),
      suffix: optionFromTokenString(token, its.suffix),
      tags: [],
      text,
      uniqueId: optionFromTokenNumber(token, its.uniqueId),
    }),
    end,
  ] as const;
};

const collectTokens = (doc: WinkDocument, its: ItsHelpers): Chunk.Chunk<Token> => {
  const tokens: Array<Token> = [];
  let previousEnd = 0;

  doc.tokens().each((token, index) => {
    const [mappedToken, nextEnd] = makeToken(token, index, its, previousEnd);
    tokens.push(mappedToken);
    previousEnd = nextEnd;
  });

  return Chunk.fromIterable(tokens);
};

const collectSentences = (doc: WinkDocument, tokens: Chunk.Chunk<Token>, its: ItsHelpers): Chunk.Chunk<Sentence> => {
  const tokenArray = Chunk.toReadonlyArray(tokens);
  const sentences: Array<Sentence> = [];

  doc.sentences().each((sentence, index) => {
    const [rawStart, rawEnd] = getSentenceSpan(sentence, its) ?? [0, Math.max(tokenArray.length - 1, 0)];
    const safeStart = Math.max(0, Math.min(rawStart, tokenArray.length === 0 ? 0 : tokenArray.length - 1));
    const safeEnd = Math.max(safeStart, Math.min(rawEnd, tokenArray.length === 0 ? 0 : tokenArray.length - 1));
    const sentenceTokens = tokenArray.slice(safeStart, safeEnd + 1);
    const firstToken = sentenceTokens[0];
    const lastToken = sentenceTokens[sentenceTokens.length - 1];

    sentences.push(
      Sentence.makeUnsafe({
        end: lastToken?.index ?? TokenIndex.makeUnsafe(0),
        importance: O.none(),
        index: SentenceIndex.makeUnsafe(index),
        markedUpText: O.none(),
        negationFlag: O.none(),
        sentiment: O.none(),
        start: firstToken?.index ?? TokenIndex.makeUnsafe(0),
        text: sentence.out(),
        tokens: Chunk.fromIterable(sentenceTokens),
      })
    );
  });

  return Chunk.fromIterable(sentences);
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

const makeWinkTokenization = Effect.gen(function* () {
  const engine = yield* WinkEngine;

  return Tokenization.of({
    document: Effect.fn("Nlp.Wink.WinkTokenizer.document")(function* (text: string, id?: DocumentId | string) {
      const doc = yield* engine.getWinkDoc(text).pipe(Effect.mapError(makeTokenizationError("document")));
      const its = yield* engine.its.pipe(Effect.mapError(makeTokenizationError("document")));
      const timestamp = yield* Clock.currentTimeMillis;
      const tokens = collectTokens(doc, its);
      const sentences = collectSentences(doc, tokens, its);
      const documentId = id === undefined ? DocumentId.makeUnsafe(`doc-${timestamp}`) : DocumentId.makeUnsafe(id);
      return buildDocument(text, documentId, tokens, sentences, doc, its);
    }),
    sentences: Effect.fn("Nlp.Wink.WinkTokenizer.sentences")(function* (text: string) {
      const doc = yield* engine.getWinkDoc(text).pipe(Effect.mapError(makeTokenizationError("sentences")));
      const its = yield* engine.its.pipe(Effect.mapError(makeTokenizationError("sentences")));
      const tokens = collectTokens(doc, its);
      return Chunk.toReadonlyArray(collectSentences(doc, tokens, its));
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
 * @since 0.0.0
 * @category Layers
 */
export const WinkTokenization = Layer.effect(Tokenization, makeWinkTokenization);

/**
 * Wink-backed tokenization layer with the live engine provided.
 *
 * @since 0.0.0
 * @category Layers
 */
export const WinkTokenizationLive = WinkTokenization.pipe(Layer.provide(WinkEngineLive));
