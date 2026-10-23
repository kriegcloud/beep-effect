// Plain-scalar continuation lines against an independent parser.
//
// YAML 1.2 s-ns-plain-next-line admits any ns-plain-char at the start of a
// continuation line. A line led by a quote or a block-scalar indicator used
// to lex as a new quoted or block scalar, which split the value into stray
// keys with no diagnostic (effected-promotion wave 3, W3-d). The oracle is
// the `yaml` devDependency, so a shared-defect round-trip cannot go green.

import { fcRuns } from "@beep/fc-runs/FastCheckRuns";
import { Yaml } from "@beep/yaml";
import { assert, describe, it } from "@effect/vitest";
import * as Arbitrary from "effect/Arbitrary";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Result from "effect/Result";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { parse } from "yaml";

const runs = { arbitrary: fcRuns(200) };

const Word = S.Array(S.Literals(["a", "b", "x", "y", "z"])).check(S.isMinLength(1), S.isMaxLength(4));

const ContinuationLine = S.Struct({
  lead: S.Literals(['"', "'", "|", ">"]),
  body: Word,
  closes: S.Boolean,
  tail: S.Array(Word).check(S.isMaxLength(2)),
  blankBefore: S.Boolean,
  extraIndent: S.Literals([0, 1, 2]),
});

const Layout = S.Literals(["map", "nested-map", "seq", "compact-map", "root", "flow-seq"]);

type ContinuationLine = typeof ContinuationLine.Type;
type Layout = typeof Layout.Type;

/**
 * Per layout: the fewest spaces a continuation line needs (the parent
 * collection's indent plus one), and the document around the scalar.
 */
const layouts: Readonly<
  Record<Layout, { readonly indent: number; readonly wrap: (value: string, body: string) => string }>
> = {
  map: { indent: 1, wrap: (value, body) => `k: ${value}\n${body}z: 1\n` },
  "nested-map": { indent: 3, wrap: (value, body) => `p:\n  k: ${value}\n${body}  z: 1\n` },
  seq: { indent: 1, wrap: (value, body) => `- ${value}\n${body}- w\n` },
  "compact-map": { indent: 3, wrap: (value, body) => `- k: ${value}\n${body}  z: 1\n` },
  root: { indent: 0, wrap: (value, body) => `${value}\n${body}` },
  "flow-seq": { indent: 1, wrap: (value, body) => `[${value}\n${body}, w]\n` },
};

const renderLine = (indent: number, line: ContinuationLine): string => {
  const quoteClose = line.closes && (line.lead === '"' || line.lead === "'") ? line.lead : "";
  const tail = A.join(
    A.map(line.tail, (word) => ` ${A.join(word, "")}`),
    ""
  );
  const text = `${line.lead}${A.join(line.body, "")}${quoteClose}${tail}`;
  return `${line.blankBefore ? "\n" : ""}${Str.repeat(indent + line.extraIndent)(" ")}${text}\n`;
};

const render = (layout: Layout, first: ReadonlyArray<string>, lines: ReadonlyArray<ContinuationLine>): string => {
  const { indent, wrap } = layouts[layout];
  return wrap(
    A.join(first, ""),
    A.join(
      A.map(lines, (line) => renderLine(indent, line)),
      ""
    )
  );
};

describe("plain-scalar continuation lines", () => {
  it.effect.prop(
    "quote- and block-indicator-led continuation lines match the yaml oracle",
    [
      Arbitrary.schema(Layout),
      Arbitrary.schema(Word),
      Arbitrary.schema(S.Array(ContinuationLine).check(S.isMinLength(1), S.isMaxLength(3))),
    ],
    ([layout, first, lines]) =>
      Effect.sync(() => {
        const input = render(layout, first, lines);
        const ours = Yaml.parseResult(input);
        assert.isTrue(Result.isSuccess(ours), input);
        assert.deepStrictEqual(Result.getOrThrow(ours), parse(input), input);
      }),
    runs
  );

  it.effect("a quote-led continuation line that ends at a value indicator stays invalid", () =>
    Effect.sync(() => {
      for (const input of ['a: x\n  "y": 1\n', "a: x\n  'y': 1\n"]) {
        assert.throws(() => parse(input));
        assert.isTrue(Result.isFailure(Yaml.parseResult(input)), input);
      }
    })
  );
});
