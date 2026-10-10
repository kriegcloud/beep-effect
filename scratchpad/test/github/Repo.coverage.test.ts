import { assert, describe, it } from "@effect/vitest";
import { assertFailure, assertSuccess } from "@effect/vitest/utils";
import * as ConfigProvider from "effect/ConfigProvider";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as S from "effect/Schema";
import { InvalidRepoRefError, Repo, RepoRef } from "../../effected/github/Repo.ts";

const ref = RepoRef.make({ owner: "acme", repo: "widget" });

describe("Repo parsing and provisioning", () => {
  it.effect("parses exactly two nonempty segments and preserves invalid input in its error", () => Effect.gen(function* () {
    assertSuccess(RepoRef.parseResult("acme/widget"), ref);
    assert.deepStrictEqual(yield* RepoRef.parse("acme/widget"), ref);
    assert.strictEqual(ref.slug, "acme/widget");
    for (const slug of ["", "widget", "/widget", "acme/", "acme/widget/extra"]) {
      const error = InvalidRepoRefError.make({ input: slug });
      assertFailure(RepoRef.parseResult(slug), error);
      assertFailure(yield* Effect.result(RepoRef.parse(slug)), error);
      assert.strictEqual(error.message, `not an owner/repo slug: ${(yield* S.encodeEffect(S.fromJsonString(S.String))(slug))}`);
    }
  }));
  it.layer(Repo.layerFromSlug("acme/widget"), { timeout: "30 seconds" })((it) => {
    it.effect("layerFromSlug supplies the parsed value and provide redirects an operation", () => Effect.gen(function* () {
      assert.deepStrictEqual(yield* Repo, ref);
      const other = RepoRef.make({ owner: "other", repo: "docs" });
      assert.strictEqual(yield* Effect.map(Repo, (value) => value.slug).pipe(Repo.provide(other)), "other/docs");
      assert.deepStrictEqual(yield* Repo, ref);
    }));
  });
  const provider = ConfigProvider.layer(ConfigProvider.fromUnknown({ GITHUB_REPOSITORY: "acme/widget", TARGET: "other/docs" }));
  it.layer(Repo.layerFromConfig().pipe(Layer.provide(provider)), { timeout: "30 seconds" })((it) => {
    it.effect("configuration defaults to GITHUB_REPOSITORY", () => Effect.gen(function* () {
      assert.deepStrictEqual(yield* Repo, ref);
    }));
  });
  it.layer(Repo.layerFromConfig({ name: "TARGET" }).pipe(Layer.provide(provider)), { timeout: "30 seconds" })((it) => {
    it.effect("configuration honors a caller-supplied key", () => Effect.gen(function* () {
      assert.strictEqual((yield* Repo).slug, "other/docs");
    }));
  });
});
