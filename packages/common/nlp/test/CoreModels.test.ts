import { Chunk, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import { describe, expect, it } from "vitest";
import { Document, DocumentId } from "../src/Core/Document.ts";
import { Sentence, SentenceIndex } from "../src/Core/Sentence.ts";
import { CharPosition, Token, TokenIndex } from "../src/Core/Token.ts";

const makeToken = (index: number, text: string, start: number, end: number): Token =>
  Token.makeUnsafe({
    abbrevFlag: O.none(),
    case: O.none(),
    contractionFlag: O.none(),
    end: CharPosition.makeUnsafe(end),
    index: TokenIndex.makeUnsafe(index),
    lemma: O.none(),
    negationFlag: O.none(),
    normal: O.none(),
    pos: O.none(),
    prefix: O.none(),
    precedingSpaces: O.none(),
    shape: O.none(),
    start: CharPosition.makeUnsafe(start),
    stem: O.none(),
    stopWordFlag: O.none(),
    suffix: O.none(),
    tags: [],
    text,
    uniqueId: O.none(),
  });

const makeSentence = (index: number, text: string, tokens: ReadonlyArray<Token>): Sentence => {
  const [firstToken, ...remainingTokens] = tokens;

  if (firstToken === undefined) {
    throw new Error("Sentences in this test fixture must contain at least one token.");
  }

  const lastToken = A.reduce(remainingTokens, firstToken, (_, token) => token);

  return Sentence.makeUnsafe({
    end: lastToken.index,
    importance: O.none(),
    index: SentenceIndex.makeUnsafe(index),
    markedUpText: O.none(),
    negationFlag: O.none(),
    sentiment: O.none(),
    start: firstToken.index,
    text,
    tokens: Chunk.fromIterable(tokens),
  });
};

const makeDocument = (text: string, tokens: ReadonlyArray<Token>, sentences: ReadonlyArray<Sentence>): Document =>
  Document.makeUnsafe({
    id: DocumentId.makeUnsafe("core-models"),
    sentences: Chunk.fromIterable(sentences),
    sentiment: O.none(),
    text,
    tokens: Chunk.fromIterable(tokens),
  });

describe("Core models", () => {
  it("returns tokens whose character spans overlap the requested range", () => {
    const tokens = [makeToken(0, "Ada", 0, 3), makeToken(1, "Loves", 3, 8), makeToken(2, "Code", 8, 12)];
    const sentence = makeSentence(0, "AdaLovesCode", tokens);
    const document = makeDocument("AdaLovesCode", tokens, [sentence]);

    const overlapping = Chunk.toReadonlyArray(Document.getTokensInRange(document, 2, 4));

    expect(A.map(overlapping, (token) => token.text)).toEqual(["Ada", "Loves"]);
  });

  it("uses document token indices for sentence range lookups", () => {
    const grace = makeToken(2, "Grace", 10, 15);
    const debugged = makeToken(3, "debugged", 16, 24);
    const sentence = makeSentence(1, "Grace debugged", [grace, debugged]);

    const inRange = Chunk.toReadonlyArray(Sentence.getTokensInRange(sentence, 2, 3));

    expect(A.map(inRange, (token) => token.text)).toEqual(["Grace", "debugged"]);
  });

  it("rebuilds filtered documents with consistent sentence and index lookups", () => {
    const ada = makeToken(0, "Ada", 0, 3);
    const wrote = makeToken(1, "wrote", 4, 9);
    const grace = makeToken(2, "Grace", 10, 15);
    const debugged = makeToken(3, "debugged", 16, 24);
    const tokens = [ada, wrote, grace, debugged];
    const sentences = [
      makeSentence(0, "Ada wrote", [ada, wrote]),
      makeSentence(1, "Grace debugged", [grace, debugged]),
    ];
    const document = makeDocument("Ada wrote Grace debugged", tokens, sentences);
    const filtered = Document.filterTokens(document, (token) => token.index === 0 || token.index === 2);

    expect(filtered.tokenCount).toBe(2);
    expect(filtered.sentenceCount).toBe(2);
    expect(
      pipe(
        Chunk.toReadonlyArray(filtered.sentences),
        A.map((sentence) =>
          pipe(
            Chunk.toReadonlyArray(sentence.tokens),
            A.map((token) => token.index)
          )
        )
      )
    ).toEqual([[0], [2]]);
    expect(O.isSome(Document.getTokenByIndex(filtered, ada.index))).toBe(true);
    expect(O.isNone(Document.getTokenByIndex(filtered, wrote.index))).toBe(true);
    expect(O.isSome(Document.getSentenceByIndex(filtered, sentences[1].index))).toBe(true);
  });
});
