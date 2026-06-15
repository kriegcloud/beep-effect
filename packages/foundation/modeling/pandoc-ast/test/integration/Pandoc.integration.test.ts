import { decodePandocJsonString, encodePandocJsonString } from "@beep/pandoc-ast/Pandoc.codec";
import { documentToPandoc, pandocToDocument } from "@beep/pandoc-ast/Pandoc.mapping";
import { describe, expect, it } from "@effect/vitest";
import * as Effect from "effect/Effect";

const fixture = (name: string): Effect.Effect<string> =>
  Effect.promise(() => Bun.file(new URL(`../fixtures/${name}`, import.meta.url)).text());

describe("Pandoc integration", () => {
  it("maps a committed fixture through Pandoc, Md, and JSON boundaries", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const source = yield* fixture("green-core.pandoc.json");
        const pandoc = yield* decodePandocJsonString(source);
        const mapped = yield* pandocToDocument(pandoc);
        const projected = yield* documentToPandoc(mapped.document);
        const encoded = yield* encodePandocJsonString(projected.pandoc);
        const roundTripped = yield* decodePandocJsonString(encoded);

        expect(mapped.report.profile).toBe("supported");
        expect(projected.report.profile).toBe("supported");
        expect(roundTripped.blocks.length).toBe(projected.pandoc.blocks.length);
      })
    ));
});
