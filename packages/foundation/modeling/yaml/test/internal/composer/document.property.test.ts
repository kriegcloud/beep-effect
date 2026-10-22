import { fcRuns } from "@beep/fc-runs/FastCheckRuns";
import {
  composeAllDocuments,
  composeDocument,
  composeFirstDocument,
  composeFirstDocumentCounted,
} from "@beep/yaml/internal/composer/document";
import { composeFlowMap, composeFlowSeq } from "@beep/yaml/internal/composer/flow";
import { createState } from "@beep/yaml/internal/composer/state";
import { parseCSTAll } from "@beep/yaml/internal/cst-parser";
import { stringifyDocument, stringifyValue } from "@beep/yaml/internal/stringifier";
import { YamlMap } from "@beep/yaml/YamlNode";
import { describe, expect, it } from "@effect/vitest";
import * as Arbitrary from "effect/Arbitrary";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import type { RawYamlDocument } from "@beep/yaml/internal/raw-document";

const runs = { arbitrary: fcRuns(100) };
const Sample = S.Struct({
  name: S.String,
  count: S.Int.check(S.isBetween({ minimum: -10000, maximum: 10000 })),
  enabled: S.Boolean,
  tags: S.Array(S.String),
});
const direct = (text: string): RawYamlDocument => {
  const [cst] = parseCSTAll(text);
  if (cst === undefined) return composeFirstDocument(text);
  return composeDocument(createState(text, { composeFlowMap, composeFlowSeq }))(cst);
};
const parsers = [composeFirstDocument, (text: string) => composeFirstDocumentCounted(text).document, direct];

type ComposedDocument = ReturnType<typeof composeFirstDocument>;

const assertReadmeComments = (document: ComposedDocument) => {
  expect(document.errors).toEqual([]);
  expect(document.commentBefore).toBe(" document");
  expect(document.comment).toBe(" trailing");
  expect(document.contents?.commentBefore).toBe(" root");
  expect(S.is(YamlMap)(document.contents)).toBe(true);
};

const assertInlineScalarSpan = (document: ComposedDocument, text: string, value: number) => {
  const scalar = S.is(YamlMap)(document.contents) ? document.contents.items[0]?.value : null;
  expect(scalar?.comment).toBe(" inline");
  if (scalar !== undefined && scalar !== null)
    expect(Str.slice(scalar.offset, scalar.offset + scalar.length)(text)).toBe(`${value}`);
};

const assertReadmeRoundtrip = (document: ComposedDocument) => {
  const formatted = stringifyDocument(document);
  const reparsed = composeFirstDocument(formatted);
  expect(reparsed.contents?.toValue()).toEqual(document.contents?.toValue());
  expect(reparsed.commentBefore).toBe(document.commentBefore);
  expect(reparsed.comment).toBe(document.comment);
  expect(reparsed.contents?.commentBefore).toBe(document.contents?.commentBefore);
  expect(S.is(YamlMap)(reparsed.contents)).toBe(true);
  if (S.is(YamlMap)(reparsed.contents)) expect(reparsed.contents.items[0]?.value?.comment).toBe(" inline");
  expect(stringifyDocument(reparsed)).toBe(formatted);
};

describe("document composer property floor", () => {
  for (const [index, parse] of parsers.entries()) {
    it.effect.prop(
      `parser ${index}: value fidelity and canonical rendering idempotence`,
      [Arbitrary.schema(Sample)],
      ([value]) =>
        Effect.sync(() => {
          const parsed = parse(stringifyValue(value));
          expect(parsed.errors).toEqual([]);
          expect(parsed.contents?.toValue()).toEqual(value);
          const formatted = stringifyDocument(parsed);
          const reparsed = parse(formatted);
          expect(reparsed.errors).toEqual([]);
          expect(reparsed.contents?.toValue()).toEqual(parsed.contents?.toValue());
          expect(stringifyDocument(reparsed)).toBe(formatted);
        }),
      runs
    );
  }

  it.effect.prop(
    "all-document parsing preserves every value, framing and document comment at a fixed point",
    [Arbitrary.schema(S.Array(Sample).check(S.isMinLength(1)))],
    ([values]) =>
      Effect.sync(() => {
        const text = A.join(
          A.map(values, (value) => `# header\n---\n${stringifyValue(value)}...\n# tail\n`),
          ""
        );
        const parsed = composeAllDocuments(text);
        expect(parsed.streamErrors).toEqual([]);
        expect(A.map(parsed.documents, (document) => document.contents?.toValue())).toEqual(values);
        const formatted = A.join(
          A.map(parsed.documents, (document) => stringifyDocument(document)),
          ""
        );
        const reparsed = composeAllDocuments(formatted);
        expect(reparsed.streamErrors).toEqual([]);
        expect(A.map(reparsed.documents, (document) => document.contents?.toValue())).toEqual(values);
        expect(A.map(reparsed.documents, (document) => [document.commentBefore, document.comment])).toEqual(
          A.map(parsed.documents, (document) => [document.commentBefore, document.comment])
        );
        expect(
          A.join(
            A.map(reparsed.documents, (document) => stringifyDocument(document)),
            ""
          )
        ).toBe(formatted);
      }),
    runs
  );

  it.effect.prop(
    "README fidelity: composition retains comments and exact source spans while canonicalizing",
    [Arbitrary.schema(S.Int)],
    ([value]) =>
      Effect.sync(() => {
        const text = `# document\n---\n# root\nvalue: ${value} # inline\n...\n# trailing\n`;
        const document = composeFirstDocument(text);
        assertReadmeComments(document);
        assertInlineScalarSpan(document, text, value);
        assertReadmeRoundtrip(document);
      }),
    runs
  );
});
