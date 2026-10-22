import { assert, describe, it } from "@effect/vitest";
import * as A from "effect/Array";
import * as HashSet from "effect/HashSet";
import * as Str from "effect/String";
import { reachableFrom } from "./sources.ts";

const SRC = "schema-org/src";

describe("entrypoint boundary", () => {
  /**
   * The whole point of the two-entrypoint split: a consumer who only builds
   * graphs must not pay for the vocabulary table. Review cannot enforce this —
   * one convenience import from any node module would silently undo it, and
   * nothing would fail — so it is asserted structurally.
   */
  it("nothing reachable from `.` imports the vocabulary dataset", () => {
    const reachable = reachableFrom(`${SRC}/index.ts`);

    const offenders = A.filter(A.fromIterable(reachable), (file) => /internal\/vocabulary\.ts$/.test(file));

    assert.deepStrictEqual(
      offenders,
      [],
      "a module reachable from the default entrypoint imports the vocabulary table, which defeats the split"
    );
  });

  it("nothing reachable from `.` imports Vocabulary or Conformance either", () => {
    const reachable = reachableFrom(`${SRC}/index.ts`);

    const offenders = A.filter(A.fromIterable(reachable), (file) =>
      /schema-org\/src\/(Vocabulary|Conformance)\.ts$/.test(file)
    );

    assert.deepStrictEqual(offenders, [], "the validator and its data belong behind `./conformance`");
  });

  /**
   * The positive control. Without it the two assertions above would pass just
   * as well against a typo in the path regex, an empty reachable set, or a
   * walker that silently resolves nothing.
   */
  it("positive control: the conformance entrypoint DOES reach the dataset", () => {
    const reachable = reachableFrom(`${SRC}/conformance-entry.ts`);

    assert.isAbove(HashSet.size(reachable), 1, "the walker must actually resolve imports");
    assert.isTrue(
      A.some(A.fromIterable(reachable), (file) => /schema-org\/src\/Vocabulary\.ts$/.test(file)),
      "if this fails the walker is broken and the assertions above prove nothing"
    );
  });

  it("the walker sees the node modules from `.`, or it is proving nothing", () => {
    const reachable = reachableFrom(`${SRC}/index.ts`);

    for (const module of ["JsonLdDocument.ts", "NodeRef.ts", "TechArticle.ts", "SoftwareSourceCode.ts", "Thing.ts"]) {
      assert.isTrue(
        A.some(A.fromIterable(reachable), (file) => Str.endsWith(`/${module}`)(file)),
        `${module} must be reachable from the default entrypoint`
      );
    }
  });
});
