import { ParserOptions, parseCsvRows } from "@beep/schema/csv/parse";
import { describe, expect, it } from "@effect/vitest";
import { Cause, Effect, Exit } from "effect";

describe("parseCsvRows", () => {
  it.effect("parses BOM-prefixed CSV with CRLF and CR row delimiters", () =>
    Effect.gen(function* () {
      const rows = yield* parseCsvRows("\ufeffa,b\r\nc,d\re,f", ParserOptions.new());

      expect(rows).toEqual([
        ["a", "b"],
        ["c", "d"],
        ["e", "f"],
      ]);
    })
  );

  it.effect("supports curried usage and left or right trimming", () =>
    Effect.gen(function* () {
      const parseLeftTrimmed = parseCsvRows(ParserOptions.new({ ltrim: true }));
      const leftTrimmed = yield* parseLeftTrimmed("  a,  b\n");
      const rightTrimmed = yield* parseCsvRows("a  ,b  \n", ParserOptions.new({ rtrim: true }));

      expect(leftTrimmed).toEqual([["a", "b"]]);
      expect(rightTrimmed).toEqual([["a", "b"]]);
    })
  );

  it.effect("keeps quoted delimiters, escaped quotes, whitespace padding, and trailing empty cells", () =>
    Effect.gen(function* () {
      const rows = yield* parseCsvRows(' "a,\\"b" ,c,\nlast,', ParserOptions.new({ escape: "\\", trim: true }));

      expect(rows).toEqual([
        ['a,"b', "c", ""],
        ["last", ""],
      ]);
    })
  );

  it.effect("parses leading empty cells, empty rows, and literal escape characters", () =>
    Effect.gen(function* () {
      const rows = yield* parseCsvRows(',a\n\n"b\\zc",d', ParserOptions.new({ escape: "\\" }));

      expect(rows).toEqual([["", "a"], [], ["b\\zc", "d"]]);
    })
  );

  it.effect("falls back to unquoted parsing when quotes are disabled", () =>
    Effect.gen(function* () {
      const rows = yield* parseCsvRows('"literal",value', ParserOptions.new({ quote: null }));

      expect(rows).toEqual([['"literal"', "value"]]);
    })
  );

  it.effect("skips comments, drops empty rows, and supports comments without a final newline", () =>
    Effect.gen(function* () {
      const rows = yield* parseCsvRows(
        "# skipped\n \nvalue\n# trailing",
        ParserOptions.new({ comment: "#", ignoreEmpty: true })
      );

      expect(rows).toEqual([["value"]]);
    })
  );

  it.effect("rejects missing closing quotes", () =>
    Effect.gen(function* () {
      const result = yield* Effect.exit(parseCsvRows('"unterminated', ParserOptions.new()));

      expect(Exit.isFailure(result)).toBe(true);
      if (Exit.isFailure(result)) {
        expect(Cause.pretty(result.cause)).toContain("missing closing quote");
      }
    })
  );

  it.effect("rejects non-whitespace content after a closing quote", () =>
    Effect.gen(function* () {
      const result = yield* Effect.exit(parseCsvRows('"quoted"x,next', ParserOptions.new()));

      expect(Exit.isFailure(result)).toBe(true);
      if (Exit.isFailure(result)) {
        expect(Cause.pretty(result.cause)).toContain("expected delimiter or newline after closing quote");
      }
    })
  );
});
