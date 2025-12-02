import * as A from "effect/Array";
import { constant, pipe } from "effect/Function";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as Str from "effect/String";
import type { Dedent, DedentOptions } from "./types.ts";

export type * from "./types.ts";

import * as Num from "effect/Number";

const constZero = constant(0);

const INDENT_PATTERN = /^(\s+)\S+/;
const LEADING_WHITESPACE_PATTERN = /^(\s+)/;

const escapeSpecialChars = (str: string): string =>
  pipe(
    str,
    Str.replace(/\\\n[ \t]*/g, ""),
    Str.replace(/\\`/g, "`"),
    Str.replace(/\\\$/g, "$"),
    Str.replace(/\\\{/g, "{")
  );

const unescapeNewlines = (str: string): string => pipe(str, Str.replace(/\\n/g, "\n"));

const getIndentLength = (line: string): O.Option<number> =>
  pipe(
    O.fromNullable(line.match(INDENT_PATTERN)),
    O.flatMap((m) => O.fromNullable(m[1])),
    O.map((indent) => indent.length)
  );

const findMinIndent = (lines: readonly string[]): O.Option<number> =>
  pipe(
    lines,
    A.filterMap(getIndentLength),
    A.match({
      onEmpty: O.none<number>,
      onNonEmpty: (indents) => O.some(Math.min(...indents)),
    })
  );

const stripIndent =
  (mindent: number) =>
  (line: string): string =>
    pipe(
      O.fromNullable(line[0]),
      O.filter((char) => char === " " || char === "\t"),
      O.match({
        onNone: constant(line),
        onSome: constant(Str.slice(mindent)(line)),
      })
    );

const alignValue = (value: unknown, precedingText: string): unknown =>
  pipe(
    O.liftPredicate(value, (v): v is string => typeof v === "string"),
    O.filter(Str.includes("\n")),
    O.map((str) => {
      const currentLine = pipe(
        precedingText,
        Str.slice(pipe(precedingText, Str.lastIndexOf("\n"), O.map(Num.sum(1)), O.getOrElse(constZero)))
      );
      return pipe(
        O.fromNullable(currentLine.match(LEADING_WHITESPACE_PATTERN)),
        O.flatMap(A.last),
        O.match({
          onNone: constant(str),
          onSome: (indent) => Str.replace(/\n/g, `\n${indent}`)(str),
        })
      );
    }),
    O.getOrElse(constant(value))
  );

const interpolate = (
  raw: ReadonlyArray<string>,
  values: ReadonlyArray<unknown>,
  opts: { readonly escapeSpecialCharacters: boolean; readonly alignValues: boolean }
): string =>
  pipe(
    raw,
    A.reduce("", (result, segment, i) => {
      const processed = opts.escapeSpecialCharacters ? escapeSpecialChars(segment) : segment;

      const withSegment = result + processed;

      return pipe(
        O.fromNullable(values[i]),
        O.map((v) => (opts.alignValues ? alignValue(v, withSegment) : v)),
        O.match({
          onNone: constant(withSegment),
          onSome: (v) => withSegment + String(v),
        })
      );
    })
  );

const dedentString = (
  input: string,
  opts: { readonly trimWhitespace: boolean; readonly escapeSpecialCharacters: boolean }
): string =>
  pipe(
    Str.split(input, "\n"),
    (lines) =>
      pipe(
        findMinIndent(lines),
        O.match({
          onNone: constant(lines),
          onSome: (mindent) => A.map(lines, stripIndent(mindent)),
        })
      ),
    A.join("\n"),
    (result) => (opts.trimWhitespace ? Str.trim(result) : result),
    (result) => (opts.escapeSpecialCharacters ? unescapeNewlines(result) : result)
  );

function createDedent(options: DedentOptions): Dedent {
  function dedent(literals: string): string;
  function dedent(strings: TemplateStringsArray, ...values: ReadonlyArray<unknown>): string;
  function dedent(strings: TemplateStringsArray | string, ...values: ReadonlyArray<unknown>): string {
    const raw = typeof strings === "string" ? A.make(strings) : [...strings.raw];
    const { alignValues = false, escapeSpecialCharacters = A.isArray(strings), trimWhitespace = true } = options;

    const interpolated = interpolate(raw, values, {
      escapeSpecialCharacters,
      alignValues,
    });

    return dedentString(interpolated, {
      trimWhitespace,
      escapeSpecialCharacters,
    });
  }

  dedent.withOptions = (newOptions: DedentOptions): Dedent => createDedent({ ...options, ...newOptions });

  return dedent;
}

const dedent: Dedent = createDedent(R.empty());

export default dedent;
