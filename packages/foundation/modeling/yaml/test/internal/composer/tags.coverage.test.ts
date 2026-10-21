import { composeFlowMap, composeFlowSeq } from "@beep/yaml/internal/composer/flow";
import { createState } from "@beep/yaml/internal/composer/state";
import { parseDirective, resolveTagHandle, validateTagHandlesInDocument } from "@beep/yaml/internal/composer/tags";
import { RawDiagnostic } from "@beep/yaml/internal/diagnostics";
import { RawDirective } from "@beep/yaml/internal/raw-document";
import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as MutableHashMap from "effect/MutableHashMap";
import * as O from "effect/Option";
import type { CstNode, CstNodeType } from "@beep/yaml/internal/cst";

const stateFor = (text = "") => createState(text, { composeFlowMap, composeFlowSeq });
const token = (type: CstNodeType, source: string, offset = 0): CstNode => ({
  type,
  source,
  offset,
  length: source.length,
});

describe("tag composer coverage", () => {
  it.effect("tag handles resolve defaults, custom prefixes, empty prefixes and verbatim URIs", () =>
    Effect.sync(() => {
      const state = stateFor();
      for (const [tag, expected] of [
        ["!", "!"],
        ["plain", "plain"],
        ["!<uri%20x>", "uri%20x"],
        ["!<open", "!<open"],
        ["!!str", "tag:yaml.org,2002:str"],
        ["!app!x", "!app!x"],
      ]) {
        if (tag !== undefined) assert.strictEqual(resolveTagHandle(tag, state), expected);
      }
      for (const handle of ["!", "!!", "!app!"]) MutableHashMap.set(state.tagMap, handle, "");
      assert.strictEqual(resolveTagHandle("!!x", state), "tag:yaml.org,2002:x");
      assert.strictEqual(resolveTagHandle("!app!x", state), "!app!x");
      assert.strictEqual(resolveTagHandle("!local", state), "!local");
      for (const handle of ["!", "!!", "!app!"]) MutableHashMap.set(state.tagMap, handle, "urn:");
      assert.strictEqual(resolveTagHandle("!!a%20b", state), "urn:a b");
      assert.strictEqual(resolveTagHandle("!app!a%20b", state), "urn:a b");
      assert.strictEqual(resolveTagHandle("!local", state), "urn:local");
      assert.strictEqual(resolveTagHandle("!app!", state), "urn:");
    })
  );
  it.effect("malformed tag diagnostics find distinct lexical occurrences and ignore prior unrelated errors", () =>
    Effect.sync(() => {
      const state = stateFor("[!other x, !bad%ZZ x, !bad%ZZ x]");
      state.errors.push(RawDiagnostic.make({ code: "UnexpectedToken", message: "prior", offset: 11, length: 7 }));
      assert.strictEqual(resolveTagHandle("!bad%ZZ", state), "!bad%ZZ");
      assert.strictEqual(resolveTagHandle("!bad%ZZ", state), "!bad%ZZ");
      assert.strictEqual(resolveTagHandle("!bad%ZZ", state), "!bad%ZZ");
      assert.deepStrictEqual(
        state.errors.map((error) => [error.code, error.offset]),
        [
          ["UnexpectedToken", 11],
          ["UnresolvedTag", 11],
          ["UnresolvedTag", 22],
        ]
      );
      assert.strictEqual(resolveTagHandle("!missing%ZZ", state), "!missing%ZZ");
      assert.strictEqual(state.errors.length, 3);
    })
  );
  it.effect("directives trim whitespace, stop at comments and reject absent names", () =>
    Effect.sync(() => {
      for (const source of ["", "plain", "%", " % "]) assert.strictEqual(O.getOrNull(parseDirective(source)), null);
      assert.deepStrictEqual(
        O.getOrNull(parseDirective(" \t%TAG !a! urn:a # ignored\n")),
        RawDirective.make({
          name: "TAG",
          parameters: ["!a!", "urn:a"],
        })
      );
      assert.deepStrictEqual(
        O.getOrNull(parseDirective("%UNKNOWN")),
        RawDirective.make({ name: "UNKNOWN", parameters: [] })
      );
    })
  );
  it.effect("document validation handles empty CSTs, local directives and nested malformed tags", () =>
    Effect.sync(() => {
      const state = stateFor();
      validateTagHandlesInDocument(token("document", ""), state);
      const children = [
        token("directive", "plain"),
        token("directive", "%YAML 1.2"),
        token("directive", "%TAG !short!"),
        token("directive", "%TAG !app! urn:app"),
        ...["!<uri>", "!!str", "!", "!local", "!app!x", "!missing!x", "!!bad%ZZ", "!app!bad%ZZ"].map((source, index) =>
          token("tag", source, index * 20)
        ),
      ];
      validateTagHandlesInDocument({ ...token("document", ""), children }, state);
      assert.deepStrictEqual(
        state.errors.map((error) => [error.code, error.offset]),
        [
          ["UnresolvedTag", 140],
          ["UnresolvedTag", 120],
          ["UnresolvedTag", 100],
        ]
      );
      const second = stateFor();
      validateTagHandlesInDocument({ ...token("document", ""), children: [token("tag", "!app!x")] }, second);
      assert.strictEqual(second.errors[0]?.message, "Tag handle !app! is not declared in this document");
      validateTagHandlesInDocument(
        { ...token("document", ""), children: [{ ...token("flow-seq", ""), children: Array<CstNode>(1) }] },
        second
      );
      assert.strictEqual(second.errors.length, 1);
    })
  );
});
