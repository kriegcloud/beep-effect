import { $KnowledgeServerId } from "@beep/identity/packages";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Stream from "effect/Stream";
import * as Str from "effect/String";
import { type ChunkingConfig, defaultChunkingConfig, TextChunk } from "./TextChunk";

const $I = $KnowledgeServerId.create("Nlp/NlpService");

const SENTENCE_END_PATTERN = /(?<=[.!?])\s+(?=[A-Z])|(?<=[.!?])$/g;

const splitIntoSentences = (text: string): readonly string[] => {
  const parts: Array<string> = [];
  let lastEnd = 0;
  const matches = Str.matchAll(SENTENCE_END_PATTERN)(text);

  for (const match of matches) {
    if (match.index !== undefined) {
      parts.push(Str.slice(lastEnd, match.index)(text));
      lastEnd = match.index;
    }
  }

  if (lastEnd < Str.length(text)) {
    parts.push(Str.slice(lastEnd)(text));
  }

  return A.isNonEmptyReadonlyArray(parts) ? parts : [text];
};

const createChunksFromSentences = (
  sentences: readonly string[],
  config: ChunkingConfig,
  documentOffset: number
): readonly TextChunk[] => {
  const chunks = A.empty<TextChunk>();
  let currentChunkSentences = A.empty<string>();
  let currentChunkStart = documentOffset;
  let chunkIndex = 0;
  let currentCharPos = documentOffset;

  const flushChunk = () => {
    if (A.isEmptyReadonlyArray(currentChunkSentences)) return;

    const text = A.join(currentChunkSentences, "");
    const chunk = new TextChunk({
      index: chunkIndex,
      text,
      startOffset: currentChunkStart,
      endOffset: currentChunkStart + Str.length(text),
    });
    chunks.push(chunk);
    chunkIndex++;

    if (config.overlapSentences > 0 && A.length(currentChunkSentences) > config.overlapSentences) {
      const overlapSentences = A.takeRight(currentChunkSentences, config.overlapSentences);
      const overlapText = A.join(overlapSentences, "");
      currentChunkStart = currentChunkStart + Str.length(text) - Str.length(overlapText);
      currentChunkSentences = [...overlapSentences];
    } else {
      currentChunkStart = currentChunkStart + Str.length(text);
      currentChunkSentences = A.empty<string>();
    }
  };

  for (const sentence of sentences) {
    const currentLength = Str.length(A.join(currentChunkSentences, ""));

    if (
      currentLength + Str.length(sentence) > config.maxChunkSize &&
      A.isNonEmptyReadonlyArray(currentChunkSentences)
    ) {
      flushChunk();
    }

    currentChunkSentences.push(sentence);
    currentCharPos += Str.length(sentence);
  }

  if (A.isNonEmptyReadonlyArray(currentChunkSentences)) {
    const text = A.join(currentChunkSentences, "");
    const prevChunk = A.last(chunks);
    if (Str.length(text) < (config.minChunkSize ?? 100) && O.isSome(prevChunk)) {
      const prev = prevChunk.value;
      chunks[A.length(chunks) - 1] = new TextChunk({
        index: prev.index,
        text: prev.text + text,
        startOffset: prev.startOffset,
        endOffset: prev.endOffset + Str.length(text),
      });
    } else {
      flushChunk();
    }
  }

  return chunks;
};

const createRawChunks = (text: string, config: ChunkingConfig): readonly TextChunk[] => {
  const chunks = A.empty<TextChunk>();
  let offset = 0;
  let index = 0;
  const textLen = Str.length(text);

  while (offset < textLen) {
    const endOffset = Math.min(offset + config.maxChunkSize, textLen);
    const chunkText = Str.slice(offset, endOffset)(text);

    chunks.push(
      new TextChunk({
        index,
        text: chunkText,
        startOffset: offset,
        endOffset,
      })
    );

    index++;
    offset = endOffset;
  }

  return chunks;
};

const splitIntoChunks = (text: string, config: ChunkingConfig): readonly TextChunk[] => {
  const textLen = Str.length(text);

  if (textLen === 0) {
    return A.empty<TextChunk>();
  }

  if (textLen <= config.maxChunkSize) {
    return [
      new TextChunk({
        index: 0,
        text,
        startOffset: 0,
        endOffset: textLen,
      }),
    ];
  }

  if (config.preserveSentences) {
    const sentences = splitIntoSentences(text);
    return createChunksFromSentences(sentences, config, 0);
  }

  return createRawChunks(text, config);
};

export interface NlpServiceShape {
  readonly chunkText: (text: string, config?: ChunkingConfig) => Stream.Stream<TextChunk>;
  readonly chunkTextAll: (text: string, config?: ChunkingConfig) => Effect.Effect<readonly TextChunk[]>;
  readonly splitSentences: (text: string) => Effect.Effect<readonly string[]>;
  readonly estimateTokens: (text: string) => Effect.Effect<number>;
}

export class NlpService extends Context.Tag($I`NlpService`)<NlpService, NlpServiceShape>() {}

const serviceEffect: Effect.Effect<NlpServiceShape> = Effect.gen(function* () {
  const chunkText = (text: string, config: ChunkingConfig = defaultChunkingConfig) =>
    Stream.fromIterable(splitIntoChunks(text, config));

  const chunkTextAll = Effect.fn("NlpService.chunkTextAll")(
    (text: string, config: ChunkingConfig = defaultChunkingConfig) => Effect.sync(() => splitIntoChunks(text, config))
  );

  const splitSentences = Effect.fn("NlpService.splitSentences")((text: string) =>
    Effect.sync(() => splitIntoSentences(text))
  );

  const estimateTokens = Effect.fn("NlpService.estimateTokens")((text: string) =>
    Effect.sync(() => Math.ceil(Str.length(text) / 4))
  );

  return NlpService.of({
    chunkText,
    chunkTextAll,
    splitSentences,
    estimateTokens,
  });
});

export const NlpServiceLive = Layer.effect(NlpService, serviceEffect);
