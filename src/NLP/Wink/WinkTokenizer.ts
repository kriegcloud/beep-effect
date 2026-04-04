import { Chunk, Effect, Layer, Option } from "effect";
import type { ItemToken } from "wink-nlp";
import { CharPosition, Token, TokenIndex } from "../Core/Token.js";
import { Document, DocumentId } from "../Core/Document.js";
import { Sentence, SentenceIndex } from "../Core/Sentence.js";
import {
  Tokenization,
  TokenizationError,
} from "../Core/Tokenization.js";
import { WinkEngine } from "./WinkEngine.js";
import { WinkEngineRefLive } from "./WinkEngineRef.js";
import type { WinkError } from "./WinkErrors.js";

const makeTokenizationError =
  (operation: string) =>
  (cause: WinkError): TokenizationError =>
    new TokenizationError({ operation, cause });

const getSpan = (value: unknown): readonly [number, number] | undefined => {
  if (
    Array.isArray(value) &&
    value.length >= 2 &&
    typeof value[0] === "number" &&
    typeof value[1] === "number"
  ) {
    return [value[0], value[1]];
  }
  return undefined;
};

const safeOut = <T>(winkToken: ItemToken, accessor: any): T | undefined => {
  try {
    return winkToken.out(accessor) as T;
  } catch {
    return undefined;
  }
};

const optString = (value: unknown): Option.Option<string | undefined> =>
  value !== undefined && value !== null
    ? Option.some(String(value))
    : Option.none();

const optValue = <T>(value: T | undefined | null): Option.Option<T | undefined> =>
  value !== undefined && value !== null
    ? Option.some(value)
    : Option.none();

const makeToken = (
  winkToken: ItemToken,
  index: number,
  its: any,
  previousEnd: number
): readonly [Token, number] => {
  const text = String(winkToken.out() ?? "");
  const preceding = String(winkToken.out(its.precedingSpaces) ?? "");
  const start = previousEnd + preceding.length;
  const end = start + text.length;

  const token = Token.make({
    text,
    index: TokenIndex.make(index),
    start: CharPosition.make(start),
    end: CharPosition.make(end),
    pos: optString(safeOut(winkToken, its.pos)),
    lemma: optString(safeOut(winkToken, its.lemma)),
    stem: optString(safeOut(winkToken, its.stem)),
    normal: optString(safeOut(winkToken, its.normal)),
    shape: optString(safeOut(winkToken, its.shape)),
    prefix: optString(safeOut(winkToken, its.prefix)),
    suffix: optString(safeOut(winkToken, its.suffix)),
    case: optString(safeOut(winkToken, its.case)),
    uniqueId: optValue(safeOut<number>(winkToken, its.uniqueId)),
    abbrevFlag: optValue(safeOut<boolean>(winkToken, its.abbrevFlag)),
    contractionFlag: optValue(safeOut<boolean>(winkToken, its.contractionFlag)),
    stopWordFlag: optValue(safeOut<boolean>(winkToken, its.stopWordFlag)),
    negationFlag: optValue(safeOut<boolean>(winkToken, its.negationFlag)),
    precedingSpaces:
      preceding.length > 0 ? Option.some(preceding) : Option.none(),
    tags: [],
  });

  return [token, end] as const;
};

const collectTokens = (doc: any, its: any): Chunk.Chunk<Token> => {
  const tokensCursor = doc.tokens();
  const buffer: Array<Token> = [];
  let offset = 0;

  tokensCursor.each((winkToken: ItemToken, index: number) => {
    const [token, nextOffset] = makeToken(winkToken, index, its, offset);
    buffer.push(token);
    offset = nextOffset;
  });

  return Chunk.fromIterable(buffer);
};

const collectSentences = (
  doc: any,
  tokens: Chunk.Chunk<Token>,
  its: any
): Chunk.Chunk<Sentence> => {
  const sentencesCursor = doc.sentences();
  const tokenArray = Chunk.toReadonlyArray(tokens);
  const sentences: Array<Sentence> = [];

  sentencesCursor.each((winkSentence: any, index: number) => {
    const text = String(winkSentence.out() ?? "");
    const span = getSpan(winkSentence.out(its.span));
    const [startTokenIndex, endTokenIndex] = span ?? [0, tokenArray.length];

    const safeStart = Math.max(0, Math.min(startTokenIndex, tokenArray.length));
    const safeEnd = Math.max(safeStart, Math.min(endTokenIndex, tokenArray.length));
    const sentenceTokens = tokenArray.slice(safeStart, safeEnd);

    const sentenceChunk = Chunk.fromIterable(sentenceTokens);
    const firstToken = sentenceTokens[0];
    const lastToken = sentenceTokens[sentenceTokens.length - 1];

    sentences.push(
      Sentence.make({
        text,
        index: SentenceIndex.make(index),
        tokens: sentenceChunk,
        start:
          firstToken !== undefined
            ? firstToken.index
            : TokenIndex.make(0),
        end:
          lastToken !== undefined
            ? lastToken.index
            : TokenIndex.make(0),
        sentiment: Option.none(),
        importance: Option.none(),
        negationFlag: Option.none(),
        markedUpText: Option.none(),
      })
    );
  });

  return Chunk.fromIterable(sentences);
};

const buildDocument = (
  text: string,
  id: DocumentId | string | undefined,
  tokens: Chunk.Chunk<Token>,
  sentences: Chunk.Chunk<Sentence>,
  doc: any,
  its: any
): Document => {
  const sentiment = doc.out(its.sentiment);
  const documentId =
    typeof id === "string"
      ? DocumentId.make(id)
      : id ?? DocumentId.make(`doc-${Date.now()}`);

  return Document.make({
    id: documentId,
    text,
    tokens,
    sentences,
    sentiment:
      typeof sentiment === "number"
        ? Option.some(sentiment)
        : Option.none(),
  });
};

const baseLayer = Layer.effect(
  Tokenization,
  Effect.gen(function* () {
    const engine = yield* WinkEngine;

    const tokenize = (text: string) =>
      Effect.gen(function* () {
        const doc = yield* engine.getWinkDoc(text);
        const its = yield* engine.its;
        return collectTokens(doc, its);
      }).pipe(Effect.mapError(makeTokenizationError("tokenize")));

    const sentences = (text: string) =>
      Effect.gen(function* () {
        const doc = yield* engine.getWinkDoc(text);
        const its = yield* engine.its;
        const tokensChunk = collectTokens(doc, its);
        return collectSentences(doc, tokensChunk, its);
      }).pipe(Effect.mapError(makeTokenizationError("sentences")));

    const document = (text: string, id?: DocumentId | string) =>
      Effect.gen(function* () {
        const doc = yield* engine.getWinkDoc(text);
        const its = yield* engine.its;
        const tokensChunk = collectTokens(doc, its);
        const sentencesChunk = collectSentences(doc, tokensChunk, its);
        return buildDocument(text, id, tokensChunk, sentencesChunk, doc, its);
      }).pipe(Effect.mapError(makeTokenizationError("document")));

    const tokenCount = (text: string) =>
      Effect.gen(function* () {
        const doc = yield* engine.getWinkDoc(text);
        return doc.tokens().length();
      }).pipe(Effect.mapError(makeTokenizationError("tokenCount")));

    return {
      tokenize,
      sentences,
      document,
      tokenCount,
    };
  })
);

export const WinkTokenization = baseLayer;

export const WinkTokenizationLive = baseLayer.pipe(
  Layer.provide(WinkEngine.Default),
  Layer.provide(WinkEngineRefLive)
);
