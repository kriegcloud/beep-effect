import { Doc, Render } from "@beep/cli-kit";
import { assert, describe, it } from "@effect/vitest";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Str from "effect/String";
import { contextOf } from "./helpers/renderContext.ts";

describe("a table cell's trailing line breaks", () => {
  it.effect("are trimmed in linear time: a long CRLF run before more text does not backtrack", () =>
    Effect.gen(function* () {
      const ctx = yield* contextOf({ color: "none" });
      const cell = `a${Str.repeat(26)("\r\n")}b`;
      const started = performance.now();
      const out = Render.plain([Doc.table([{ header: "h" }], [[cell]])], ctx);
      const elapsed = performance.now() - started;
      assert.strictEqual(out, `h\n${Str.repeat(2)("-")}\na${ctx.glyphs.ellipsis}`);
      assert.isBelow(elapsed, 500, `took ${elapsed} ms`);
    })
  );

  it.effect("only trailing breaks are dropped, of every kind, and a cell keeps its first line", () =>
    Effect.gen(function* () {
      const ctx = yield* contextOf({ color: "none" });
      const rows = A.map(["a\r\n\r\n", "a\n\r", "a\r\r\n\n", "a\nb\r\n"], (cell) => [cell]);
      assert.strictEqual(
        Render.plain([Doc.table([{ header: "h" }], rows)], ctx),
        A.join(["h", "--", "a", "a", "a", `a${ctx.glyphs.ellipsis}`], "\n")
      );
    })
  );
});

describe("a markdown table cell's edges", () => {
  it.effect("are trimmed in linear time: a long interior run of spaces or line breaks does not backtrack", () =>
    Effect.gen(function* () {
      const ctx = yield* contextOf({ color: "none" });
      for (const run of [Str.repeat(40_000)(" "), Str.repeat(40_000)("\n")]) {
        const started = performance.now();
        const out = Render.markdown([Doc.table([{ header: "h" }], [[`x${run}y`]])], ctx);
        const elapsed = performance.now() - started;
        assert.isTrue(Str.startsWith("| h |")(out), Str.slice(0, 20)(out));
        assert.isBelow(elapsed, 500, `took ${elapsed} ms`);
      }
    })
  );

  it.effect("drop only leading and trailing whitespace and line breaks", () =>
    Effect.gen(function* () {
      const ctx = yield* contextOf({ color: "none" });
      const cells = [" \n a b \n ", "\n\na", "a\n\n", "a \n b", "   ", "\n"];
      const out = Render.markdown(
        [
          Doc.table(
            [{ header: "h" }],
            A.map(cells, (cell) => [cell])
          ),
        ],
        ctx
      );
      assert.deepStrictEqual(Str.split(out, "\n").slice(2), [
        "| a b |",
        "| a |",
        "| a |",
        "| a <br> b |",
        "| |",
        "| |",
      ]);
    })
  );
});
