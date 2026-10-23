// Unit coverage for the three frontmatter codec modules (P3 Task 2).
//
// Each codec is a free-standing named export over its kit peer — never a
// namespace object (the config-file tree-shaking rule). The contract is
// field-identical across the three: check the capture's `format` marker
// first (mismatch fails typed, before any parsing), then decode through the
// peer's public parse surface, wrapping its typed failure structurally.
//
// Empty-capture behavior is pinned per engine, verified by probe: yaml's
// empty document is `null`, toml's is `{}`, and JSON has no empty-document
// value so the json codec fails typed on an empty capture.

import { fcRuns } from "@beep/fc-runs/FastCheckRuns";
import { JsoncParseError } from "@beep/jsonc/Jsonc";
import {
  FrontmatterCodec,
  FrontmatterDecodeError,
  FrontmatterEncodeError,
  FrontmatterFormatMismatchError,
} from "@beep/markdown/Frontmatter";
import { JsonFrontmatter } from "@beep/markdown/JsonFrontmatter";
import { Markdown, MarkdownParseOptions } from "@beep/markdown/Markdown";
import { Frontmatter, Point, Position } from "@beep/markdown/MarkdownNode";
import { TomlFrontmatter } from "@beep/markdown/TomlFrontmatter";
import { YamlFrontmatter } from "@beep/markdown/YamlFrontmatter";
import { TomlParseError } from "@beep/toml/Toml";
import { YamlParseError } from "@beep/yaml/Yaml";
import { assert, describe, it } from "@effect/vitest";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Result from "effect/Result";
import * as S from "effect/Schema";
import type { FrontmatterFormat } from "@beep/markdown/MarkdownNode";

const withFrontmatter = MarkdownParseOptions.make({ frontmatter: true });

/** A hand-built capture node; the position is synthetic and irrelevant here. */
const capture = (format: FrontmatterFormat, value: string): Frontmatter =>
  Frontmatter.make({
    format,
    value,
    position: Position.make({
      start: Point.make({ line: 1, column: 1, offset: 0 }),
      end: Point.make({ line: 1, column: 1, offset: 0 }),
    }),
  });

/** The head frontmatter node of a real capture-enabled parse. */
const parsedCapture = (source: string) =>
  Effect.map(Markdown.parse(source, withFrontmatter), (root) => {
    const head = root.children[0];
    assert.isDefined(head, "expected a head node");
    assert.strictEqual(head?.type, "frontmatter");
    if (head?.type !== "frontmatter") {
      throw new TypeError("unreachable: asserted the type above");
    }
    return head;
  });

describe("frontmatter codecs", () => {
  describe("YamlFrontmatter", () => {
    it.effect("decodes a valid yaml capture to data", () =>
      Effect.gen(function* () {
        const data = yield* YamlFrontmatter.decode(capture("yaml", "title: Hello\ntags:\n  - a\n  - b\n"));
        assert.deepStrictEqual(data, { title: "Hello", tags: ["a", "b"] });
      })
    );

    it.effect("decodes an empty capture to null, yaml's empty document", () =>
      Effect.gen(function* () {
        const data = yield* YamlFrontmatter.decode(capture("yaml", ""));
        assert.isNull(data);
      })
    );

    it.effect("fails typed on unparseable yaml, carrying the YamlParseError structurally", () =>
      Effect.gen(function* () {
        const result = yield* Effect.result(YamlFrontmatter.decode(capture("yaml", "a: [1\n")));
        if (Result.isSuccess(result)) assert.fail("expected frontmatter decoding to fail");
        const error = result.failure;
        assert.instanceOf(error, FrontmatterDecodeError);
        assert.strictEqual(error.format, "yaml");
        assert.instanceOf(error.cause, YamlParseError);
      })
    );

    it.effect("fails typed on a format mismatch, before any parsing", () =>
      Effect.gen(function* () {
        const result = yield* Effect.result(YamlFrontmatter.decode(capture("toml", "a = 1\n")));
        if (Result.isSuccess(result)) assert.fail("expected frontmatter decoding to fail");
        const error = result.failure;
        assert.instanceOf(error, FrontmatterFormatMismatchError);
        assert.strictEqual(error.expected, "yaml");
        assert.strictEqual(error.actual, "toml");
      })
    );
  });

  describe("TomlFrontmatter", () => {
    it.effect("decodes a valid toml capture to data", () =>
      Effect.gen(function* () {
        const data = yield* TomlFrontmatter.decode(capture("toml", 'title = "Hello"\n\n[owner]\nname = "spencer"\n'));
        assert.deepStrictEqual(data, { title: "Hello", owner: { name: "spencer" } });
      })
    );

    it.effect("decodes an empty capture to an empty table, toml's empty document", () =>
      Effect.gen(function* () {
        const data = yield* TomlFrontmatter.decode(capture("toml", ""));
        assert.deepStrictEqual(data, {});
      })
    );

    it.effect("fails typed on unparseable toml, carrying the TomlParseError structurally", () =>
      Effect.gen(function* () {
        const result = yield* Effect.result(TomlFrontmatter.decode(capture("toml", "a = = 1\n")));
        if (Result.isSuccess(result)) assert.fail("expected frontmatter decoding to fail");
        const error = result.failure;
        assert.instanceOf(error, FrontmatterDecodeError);
        assert.strictEqual(error.format, "toml");
        assert.instanceOf(error.cause, TomlParseError);
      })
    );

    it.effect("fails typed on a format mismatch, before any parsing", () =>
      Effect.gen(function* () {
        const result = yield* Effect.result(TomlFrontmatter.decode(capture("json", '{"a": 1}')));
        if (Result.isSuccess(result)) assert.fail("expected frontmatter decoding to fail");
        const error = result.failure;
        assert.instanceOf(error, FrontmatterFormatMismatchError);
        assert.strictEqual(error.expected, "toml");
        assert.strictEqual(error.actual, "json");
      })
    );
  });

  describe("JsonFrontmatter", () => {
    it.effect("decodes a valid json capture to data", () =>
      Effect.gen(function* () {
        const data = yield* JsonFrontmatter.decode(capture("json", '{"title": "Hello", "draft": false}'));
        assert.deepStrictEqual(data, { title: "Hello", draft: false });
      })
    );

    it.effect("decodes jsonc leniencies — comments and trailing commas — rather than failing", () =>
      Effect.gen(function* () {
        const data = yield* JsonFrontmatter.decode(capture("json", '{\n\t// a comment\n\t"a": 1,\n}'));
        assert.deepStrictEqual(data, { a: 1 });
      })
    );

    it.effect("fails typed on an empty capture: JSON has no empty document", () =>
      Effect.gen(function* () {
        const result = yield* Effect.result(JsonFrontmatter.decode(capture("json", "")));
        if (Result.isSuccess(result)) assert.fail("expected frontmatter decoding to fail");
        const error = result.failure;
        assert.instanceOf(error, FrontmatterDecodeError);
        assert.strictEqual(error.format, "json");
        assert.instanceOf(error.cause, JsoncParseError);
      })
    );

    it.effect("fails typed on unparseable json, carrying the JsoncParseError structurally", () =>
      Effect.gen(function* () {
        const result = yield* Effect.result(JsonFrontmatter.decode(capture("json", "{a: \n")));
        if (Result.isSuccess(result)) assert.fail("expected frontmatter decoding to fail");
        const error = result.failure;
        assert.instanceOf(error, FrontmatterDecodeError);
        assert.strictEqual(error.format, "json");
        assert.instanceOf(error.cause, JsoncParseError);
      })
    );

    it.effect("fails typed on a format mismatch, before any parsing", () =>
      Effect.gen(function* () {
        const result = yield* Effect.result(JsonFrontmatter.decode(capture("yaml", "a: 1\n")));
        if (Result.isSuccess(result)) assert.fail("expected frontmatter decoding to fail");
        const error = result.failure;
        assert.instanceOf(error, FrontmatterFormatMismatchError);
        assert.strictEqual(error.expected, "json");
        assert.strictEqual(error.actual, "yaml");
      })
    );
  });

  describe("end to end over Markdown.parse", () => {
    it.effect("yaml: parse with capture, decode the captured node", () =>
      Effect.gen(function* () {
        const node = yield* parsedCapture("---\ntitle: Hello\n---\n\n# Body\n");
        const data = yield* YamlFrontmatter.decode(node);
        assert.deepStrictEqual(data, { title: "Hello" });
      })
    );

    it.effect("toml: parse with capture, decode the captured node", () =>
      Effect.gen(function* () {
        const node = yield* parsedCapture('+++\ntitle = "Hello"\n+++\n\n# Body\n');
        const data = yield* TomlFrontmatter.decode(node);
        assert.deepStrictEqual(data, { title: "Hello" });
      })
    );

    it.effect("json: parse with capture, decode the captured node", () =>
      Effect.gen(function* () {
        const node = yield* parsedCapture('---json\n{"title": "Hello"}\n---\n\n# Body\n');
        const data = yield* JsonFrontmatter.decode(node);
        assert.deepStrictEqual(data, { title: "Hello" });
      })
    );
  });

  describe("contract shape", () => {
    it("the three codecs are FrontmatterCodec instances with both Effect and Result directions", () => {
      const codecs: ReadonlyArray<FrontmatterCodec> = [YamlFrontmatter, TomlFrontmatter, JsonFrontmatter];
      for (const codec of codecs) {
        assert.isTrue(codec instanceof FrontmatterCodec);
        assert.isFunction(codec.decode);
        assert.isFunction(codec.encode);
        assert.isFunction(codec.decodeResult);
        assert.isFunction(codec.encodeResult);
      }
      assert.deepStrictEqual(
        A.map(codecs, (codec) => codec.format),
        ["yaml", "toml", "json"]
      );
    });
  });

  describe("decodeResult / encodeResult", () => {
    it("decodes each codec's capture synchronously", () => {
      assert.deepStrictEqual(Result.getOrThrow(YamlFrontmatter.decodeResult(capture("yaml", "title: Hi\n"))), {
        title: "Hi",
      });
      assert.deepStrictEqual(Result.getOrThrow(TomlFrontmatter.decodeResult(capture("toml", 'title = "Hi"\n'))), {
        title: "Hi",
      });
      assert.deepStrictEqual(Result.getOrThrow(JsonFrontmatter.decodeResult(capture("json", '{"title":"Hi"}'))), {
        title: "Hi",
      });
    });

    it("fails a mismatched capture before parsing", () => {
      const failure = YamlFrontmatter.decodeResult(capture("toml", "x: [")).pipe(Result.flip, Result.getOrThrow);
      assert.instanceOf(failure, FrontmatterFormatMismatchError);
      if (S.is(FrontmatterFormatMismatchError)(failure)) {
        assert.strictEqual(failure.expected, "yaml");
        assert.strictEqual(failure.actual, "toml");
      }
    });

    it("wraps each engine's parse failure structurally", () => {
      const yaml = YamlFrontmatter.decodeResult(capture("yaml", "x: [")).pipe(Result.flip, Result.getOrThrow);
      const toml = TomlFrontmatter.decodeResult(capture("toml", "x = ")).pipe(Result.flip, Result.getOrThrow);
      const json = JsonFrontmatter.decodeResult(capture("json", "")).pipe(Result.flip, Result.getOrThrow);
      assert.isTrue(S.is(FrontmatterDecodeError)(yaml) && yaml.format === "yaml" && S.is(YamlParseError)(yaml.cause));
      assert.isTrue(S.is(FrontmatterDecodeError)(toml) && toml.format === "toml" && S.is(TomlParseError)(toml.cause));
      assert.isTrue(S.is(FrontmatterDecodeError)(json) && json.format === "json" && S.is(JsoncParseError)(json.cause));
    });

    it("encodes synchronously and fails typed on an unrepresentable value", () => {
      assert.strictEqual(Result.getOrThrow(JsonFrontmatter.encodeResult({})), "{}");
      assert.strictEqual(Result.getOrThrow(TomlFrontmatter.encodeResult({})), "");
      const cyclic: Record<string, unknown> = {};
      cyclic.self = cyclic;
      const failure = JsonFrontmatter.encodeResult(cyclic).pipe(Result.flip, Result.getOrThrow);
      assert.instanceOf(failure, FrontmatterEncodeError);
      assert.strictEqual(failure.format, "json");
    });

    it.effect("agrees with the Effect direction on success and failure", () =>
      Effect.gen(function* () {
        for (const node of [capture("yaml", "a: 1\n"), capture("yaml", "x: ["), capture("json", "{}")]) {
          const viaEffect = yield* Effect.result(YamlFrontmatter.decode(node));
          assert.deepStrictEqual(viaEffect, YamlFrontmatter.decodeResult(node));
        }
      })
    );

    it.effect.prop(
      "the Result and Effect directions agree on every JSON value, both ways",
      [S.Json],
      ([value]) =>
        Effect.gen(function* () {
          for (const codec of [YamlFrontmatter, TomlFrontmatter, JsonFrontmatter]) {
            const body = codec.encodeResult(value);
            assert.deepStrictEqual(yield* Effect.result(codec.encode(value)), body);
            if (Result.isSuccess(body)) {
              const node = capture(codec.format, body.success);
              assert.deepStrictEqual(yield* Effect.result(codec.decode(node)), codec.decodeResult(node));
            }
          }
        }),
      { arbitrary: fcRuns(100) }
    );
  });
});
