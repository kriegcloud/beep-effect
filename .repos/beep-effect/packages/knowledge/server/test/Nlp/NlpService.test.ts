import { NlpService, NlpServiceLive } from "@beep/knowledge-server/Nlp/NlpService";
import { assertTrue, describe, layer, strictEqual } from "@beep/testkit";
import * as A from "effect/Array";
import * as Chunk from "effect/Chunk";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import * as Str from "effect/String";

describe("NlpService", () => {
  layer(NlpServiceLive, { timeout: Duration.seconds(60) })("NlpService operations", (it) => {
    it.effect("chunks short text into single chunk", () =>
      Effect.gen(function* () {
        const nlp = yield* NlpService;
        const text = "This is a short sentence.";

        const chunks = yield* nlp.chunkTextAll(text);

        strictEqual(A.length(chunks), 1);
        strictEqual(chunks[0]?.text, text);
        strictEqual(chunks[0]?.startOffset, 0);
        strictEqual(chunks[0]?.endOffset, Str.length(text));
      })
    );

    it.effect("chunks long text into multiple chunks", () =>
      Effect.gen(function* () {
        const nlp = yield* NlpService;
        const sentences = A.join(A.replicate("This is a test sentence that will be repeated.", 50), " ");

        const chunks = yield* nlp.chunkTextAll(sentences, {
          maxChunkSize: 200,
          preserveSentences: true,
          overlapSentences: 0,
        });

        assertTrue(A.length(chunks) > 1);
        A.forEach(A.zip(A.dropRight(chunks, 1), A.drop(chunks, 1)), ([current, next]) => {
          strictEqual(current.endOffset, next.startOffset);
        });
      })
    );

    it.effect("preserves sentence boundaries", () =>
      Effect.gen(function* () {
        const nlp = yield* NlpService;
        const text = "First sentence. Second sentence. Third sentence.";

        const chunks = yield* nlp.chunkTextAll(text, {
          maxChunkSize: 30,
          preserveSentences: true,
          overlapSentences: 0,
        });

        for (const chunk of chunks) {
          const trimmed = Str.trim(chunk.text);
          const lastChar = Str.takeRight(1)(trimmed);
          assertTrue(lastChar === "." || lastChar === "!" || lastChar === "?" || Str.isEmpty(trimmed));
        }
      })
    );

    it.effect("handles empty input", () =>
      Effect.gen(function* () {
        const nlp = yield* NlpService;

        const chunks = yield* nlp.chunkTextAll("");

        strictEqual(A.length(chunks), 0);
      })
    );

    it.effect("returns stream of chunks", () =>
      Effect.gen(function* () {
        const nlp = yield* NlpService;
        const text = "Sentence one. Sentence two. Sentence three.";

        const stream = nlp.chunkText(text, { maxChunkSize: 1000, preserveSentences: true, overlapSentences: 0 });
        const collected = yield* Stream.runCollect(stream);

        strictEqual(Chunk.size(collected), 1);
      })
    );

    it.effect("splits sentences correctly", () =>
      Effect.gen(function* () {
        const nlp = yield* NlpService;
        const text = "First. Second? Third!";

        const sentences = yield* nlp.splitSentences(text);

        assertTrue(A.length(sentences) >= 1);
      })
    );

    it.effect("estimates tokens", () =>
      Effect.gen(function* () {
        const nlp = yield* NlpService;
        const text = "This is a test.";

        const tokens = yield* nlp.estimateTokens(text);

        strictEqual(tokens, 4);
      })
    );

    it.effect("maintains chunk indices", () =>
      Effect.gen(function* () {
        const nlp = yield* NlpService;
        const sentences = A.join(A.replicate("This is sentence number X.", 10), " ");

        const chunks = yield* nlp.chunkTextAll(sentences, {
          maxChunkSize: 50,
          preserveSentences: true,
          overlapSentences: 0,
        });

        A.forEach(chunks, (chunk, i) => {
          strictEqual(chunk.index, i);
        });
      })
    );
  });
});
