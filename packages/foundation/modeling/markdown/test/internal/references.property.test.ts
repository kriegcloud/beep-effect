import { fcRuns } from "@beep/fc-runs/FastCheckRuns";
import { assert, describe, it } from "@effect/vitest";
import * as Arbitrary from "effect/Arbitrary";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

const runs = { arbitrary: fcRuns(100) };

import {
  normalizeLabelText,
  normalizeReference,
  ParsedReference,
  parseReference,
  ReferenceScanner,
} from "@beep/markdown/internal/references";
import { assertNone, assertSome } from "@effect/vitest/utils";
import * as O from "effect/Option";
import { codePointWord } from "./inlines/propertyFloor.ts";

const word = codePointWord("x");
describe("reference parser property floor", () => {
  it("validates plain definitions with optional titles and finite consumed lengths", () => {
    const source = '[Guide]: /guide "Read me"';
    const parsed = O.getOrThrow(parseReference(source));
    assertSome(
      parseReference(source),
      ParsedReference.make({
        key: "GUIDE",
        identifier: "guide",
        label: "Guide",
        url: "/guide",
        title: "Read me",
        length: source.length,
      })
    );
    assert.isTrue(S.is(ParsedReference)(parsed));
    const untitledSource = "[Guide]: /guide";
    const untitled = O.getOrThrow(parseReference(untitledSource));
    assert.deepStrictEqual(
      untitled,
      ParsedReference.make({
        key: "GUIDE",
        identifier: "guide",
        label: "Guide",
        url: "/guide",
        length: untitledSource.length,
      })
    );
    assert.isTrue(S.is(ParsedReference)(untitled));
    assertNone(parseReference("paragraph text"));
    assert.isFalse(S.is(ParsedReference)({ ...parsed, title: 1 }));
    for (const field of ["key", "identifier", "label", "url"]) {
      assert.isFalse(S.is(ParsedReference)({ ...parsed, [field]: 1 }));
    }
    for (const length of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])
      assert.isFalse(S.is(ParsedReference)({ ...parsed, length }));
  });
  it.effect.prop(
    "label normalization is idempotent and bracket fidelity holds",
    [Arbitrary.schema(S.String)],
    ([label]) =>
      Effect.sync(() => {
        const normalized = normalizeLabelText(label);
        assert.strictEqual(normalizeLabelText(normalized), normalized);
        assert.strictEqual(normalizeReference(`[${label}]`), normalized);
      }),
    runs
  );
  it.effect.prop(
    "definitions and scanner destinations/titles retain parsed values through canonical spelling",
    [word, word, word],
    ([label, url, title]) =>
      Effect.sync(() => {
        const source = `[${label}]: <${url}> "${title}"`;
        const parsed = O.getOrThrow(parseReference(source));
        const canonical = `[${parsed.label}]: <${parsed.url}> "${parsed.title}"`;
        assertSome(parseReference(canonical), parsed);
        assert.strictEqual(new ReferenceScanner(`<${url}>`).parseLinkDestination(), url);
        assert.strictEqual(new ReferenceScanner(`"${title}"`).parseLinkTitle(), title);
        const scanner = new ReferenceScanner(`[${label}]`);
        assert.strictEqual(scanner.parseLinkLabel(), label.length + 2);
        assert.strictEqual(scanner.pos, label.length + 2);
        assert.strictEqual(`[${label}]: <${url}> "${title}"`, canonical);
      }),
    runs
  );
});
