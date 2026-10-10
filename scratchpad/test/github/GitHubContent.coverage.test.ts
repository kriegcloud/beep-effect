import { assert, describe, it } from "@effect/vitest";
import { assertNone, assertSome } from "@effect/vitest/utils";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { GitHubContent } from "../../effected/github/GitHubContent.ts";
import { Repo, RepoRef } from "../../effected/github/Repo.ts";
import { harness } from "./harness.ts";

describe("GitHubContent coverage", () => {
  it.effect("unstubbed members name the missing override", () => Effect.sync(() => {
    const content = GitHubContent.makeTest();
    assert.throws(() => content.getFile("a"), /getFile\(\) was called but not stubbed/);
    assert.throws(() => content.getFileOption("a"), /getFileOption\(\) was called but not stubbed/);
  }));

  it.layer(Layer.merge(GitHubContent.layerTest({
    getFile: () => Effect.succeed("text"),
    getFileOption: () => Effect.succeedSome("text"),
  }), Repo.layer(RepoRef.make({ owner: "o", repo: "r" }))), { timeout: "30 seconds" })((it) => {
  it.effect("test layer preserves both overrides", () => Effect.gen(function* () {
    const content = yield* GitHubContent;
    assert.strictEqual(yield* content.getFile("a"), "text");
    assertSome(yield* content.getFileOption("a"), "text");
  }));
  });

  it.layer(Layer.merge(GitHubContent.layerTest(), Repo.layer(RepoRef.make({ owner: "o", repo: "r" }))), { timeout: "30 seconds" })((it) => {
  it.effect("default test layer leaves reads unstubbed", () => Effect.gen(function* () {
    const content = yield* GitHubContent;
    assert.throws(() => content.getFile("a"), /getFile/);
  }));
  });

  const { script, base } = harness([
    { status: 200, body: { type: "symlink" } },
    { status: 200, body: { type: "submodule" } },
    { status: 200, body: { type: "file", encoding: "base64", content: " a G V s\nb G 8=\t" } },
    { status: 404, body: { message: "Not Found" } },
    { status: 200, body: { type: "file", encoding: "none", content: "" } },
  ]);
  it.layer(GitHubContent.layer.pipe(Layer.provideMerge(base)), { timeout: "30 seconds" })((it) => {
    it.effect("rejects non-files, preserves option success, and catches only absence", () => Effect.gen(function* () {
      const content = yield* GitHubContent;
      for (const type of ["symlink", "submodule"]) {
        const error = yield* Effect.flip(content.getFile("link", {}));
        assert.strictEqual(error.kind, "rejected");
        assert.include(error.reason, `is a ${type}, not a file`);
      }
      assertSome(yield* content.getFileOption("a", { ref: "topic" }), "hello");
      assert.strictEqual(script.queryOf(2).get("ref"), "topic");
      assertNone(yield* content.getFileOption("missing"));
      const error = yield* Effect.flip(content.getFileOption("large"));
      assert.strictEqual(error.kind, "rejected");
      assert.include(error.reason, 'encoding "none"');
    }));
  });
});
