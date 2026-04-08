import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { sentences, tokenCount, tokenize, tokenizeToDocument } from "../src/Core/Tokenization.ts";
import { WinkTokenizationLive } from "../src/Wink/index.ts";

const provideWink = Effect.provide(WinkTokenizationLive);

describe("WinkTokenization", () => {
  it("tokenizes text with lemma and position metadata", async () => {
    const program = tokenize("Ada Lovelace wrote the first algorithm.").pipe(provideWink);
    const tokens = await Effect.runPromise(program);

    expect(tokens).toHaveLength(7);
    expect(tokens[0]?.text).toBe("Ada");
    expect(tokens[0]?.pos._tag).toBe("Some");
    expect(tokens[0]?.start).toBe(0);
    expect(tokens[0]?.end).toBe(3);
    expect(tokens[6]?.text).toBe(".");
  });

  it("builds sentences and documents from the live layer", async () => {
    const program = Effect.all([
      sentences("Ada wrote code. Grace debugged it.").pipe(provideWink),
      tokenCount("Ada wrote code. Grace debugged it.").pipe(provideWink),
      tokenizeToDocument("Ada wrote code. Grace debugged it.", "history").pipe(provideWink),
    ]);
    const [sentenceList, count, document] = await Effect.runPromise(program);

    expect(sentenceList).toHaveLength(2);
    expect(sentenceList[0]?.text).toBe("Ada wrote code.");
    expect(sentenceList[1]?.text).toBe("Grace debugged it.");
    expect(count).toBe(8);
    expect(document.id).toBe("history");
    expect(document.sentenceCount).toBe(2);
    expect(document.tokenCount).toBe(8);
    expect(document.text).toBe("Ada wrote code. Grace debugged it.");
  });
});
