import { makeInlineNode } from "@beep/markdown/internal/inlineNode";
import { scanDelims } from "@beep/markdown/internal/inlines/emphasis";
import { assert, it } from "@effect/vitest";
import { assertSome } from "@effect/vitest/utils";
import * as Effect from "effect/Effect";
import { dual } from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import * as O from "effect/Option";
import * as Str from "effect/String";
import type { InlineNode } from "@beep/markdown/internal/inlineNode";
import type { InlineScanner } from "@beep/markdown/internal/inlineTypes";

const scannerFor = (subject: string): InlineScanner => {
  const scanner: InlineScanner = {
    subject,
    pos: 0,
    refmap: HashMap.empty(),
    footnoteLabels: HashSet.empty(),
    delimiters: undefined,
    brackets: undefined,
    peek: () => O.getOrElse(Str.charCodeAt(subject, scanner.pos), () => -1),
    match: (pattern) => {
      const matched = pattern.exec(subject.slice(scanner.pos));
      if (matched === null || matched.index !== 0) return undefined;
      const value = matched[0];
      scanner.pos += value.length;
      return value;
    },
    matchAhead: () => undefined,
    hasAhead: () => false,
    closingBacktickRun: dual(2, (_from: number, _length: number): number | undefined => undefined),
    append: () => {},
    appendText: dual(
      3,
      (value: string, from: number, to: number): InlineNode => makeInlineNode("text", from, to, value)
    ),
    lastChild: () => undefined,
    unputText: () => false,
    trimTrailingSpaces: () => 0,
    removeDelimiter: () => {},
    addBracket: dual(3, (_node: InlineNode, _index: number, _image: boolean): void => {}),
    removeBracket: () => {},
    deactivateLinkOpeners: () => {},
    processEmphasis: () => {},
  };
  return scanner;
};

it.effect("classifies a leading unmatched low surrogate without looking before the source", () =>
  Effect.sync(() => {
    const scanner = scannerFor("\udc00*a");
    scanner.pos = 1;
    assertSome(scanDelims(scanner, 42), { numdelims: 1, canOpen: true, canClose: true });
    assert.strictEqual(scanner.pos, 1);
  })
);
