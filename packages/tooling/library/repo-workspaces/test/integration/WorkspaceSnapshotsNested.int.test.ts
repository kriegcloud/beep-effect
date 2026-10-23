// `WorkspaceSnapshots.at(ref)` against a workspace root NESTED inside a larger
// git repo — the case a scripted `Git` mock cannot discriminate, because it
// needs real git's two path-base conventions to diverge.
//
// `git ls-tree` (run with cwd == the workspace root) emits paths relative to
// cwd, but `git show <ref>:<path>` resolves <path> relative to the git repo
// TOP-LEVEL, not cwd. When the workspace root is nested inside a larger repo
// (`.git` is not a workspace marker — nesting is a supported shape), a bare
// `git show <ref>:package.json` reads the OUTER repo's manifest, and member
// `git show <ref>:<dir>/package.json` reads outer paths that do not exist. The
// reader `./`-prefixes every path so git resolves it relative to cwd, aligning
// with ls-tree.
//
// This suite builds a git repo whose ROOT is one workspace (catalog `^3.0.0`,
// member `@outer/a`) and whose NESTED `inner/` subdirectory is its OWN workspace
// (catalog `^4.0.0`, members `@inner/a` / `@inner/b`), resolves the workspace
// root to `inner/`, and asserts the snapshot reflects the INNER workspace. Under
// the un-prefixed reader the snapshot reads the outer manifest instead — root
// `outer-root` alone, catalog `^3.0.0` — so every assertion below fails.

import { WorkspaceSnapshots, Workspaces } from "@beep/repo-workspaces";
import { dirname, join } from "@beep/utils/Path";
import * as NodeServices from "@effect/platform-node/NodeServices";
import { afterAll, assert, beforeAll, describe, it } from "@effect/vitest";
import { assertSome } from "@effect/vitest/utils";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as HashMap from "effect/HashMap";
import * as Layer from "effect/Layer";
import { gitIn, makeNodeFixture } from "./utils/nodeFixture.ts";

let root: string;
let inner: string;

/** Writes `content` at `path`, creating parent directories as needed. */
const write = Effect.fnUntraced(function* (path: string, content: string) {
  const fs = yield* FileSystem.FileSystem;
  yield* fs.makeDirectory(dirname(path), { recursive: true });
  yield* fs.writeFileString(path, content);
});

const fixture = makeNodeFixture();

beforeAll(() =>
  fixture.runtime.runPromise(
    Effect.gen(function* () {
      root = yield* fixture.tempDirectory("effected-nested-snapshot-");
      inner = join(root, "inner");

      // ── OUTER workspace (the whole temp dir is the git repo) ─────────────────
      yield* write(
        join(root, "pnpm-workspace.yaml"),
        ["packages:", "  - packages/*", "catalog:", "  effect: ^3.0.0", ""].join("\n")
      );
      yield* write(join(root, "package.json"), '{"name":"outer-root","version":"0.0.0","private":true}');
      yield* write(join(root, "packages", "outer-a", "package.json"), '{"name":"@outer/a","version":"9.9.9"}');

      // ── INNER workspace (nested, its OWN pnpm-workspace.yaml and catalog) ─────
      yield* write(
        join(inner, "pnpm-workspace.yaml"),
        ["packages:", "  - packages/*", "catalog:", "  effect: ^4.0.0", ""].join("\n")
      );
      yield* write(join(inner, "package.json"), '{"name":"inner-root","version":"1.0.0","private":true}');
      yield* write(
        join(inner, "packages", "inner-a", "package.json"),
        '{"name":"@inner/a","version":"1.1.0","dependencies":{"effect":"catalog:"}}'
      );
      yield* write(
        join(inner, "packages", "inner-b", "package.json"),
        '{"name":"@inner/b","version":"1.2.0","dependencies":{"@inner/a":"workspace:*"}}'
      );

      const git = gitIn(root);
      yield* git("init", "-q");
      yield* git("config", "user.email", "test@example.com");
      yield* git("config", "user.name", "Test");
      yield* git("add", "-A");
      yield* git("commit", "-q", "-m", "fixture");
    })
  )
);

afterAll(() => fixture.close());

const Live = Layer.unwrap(
  Effect.sync(() => Workspaces.layerWithGit({ cwd: inner }).pipe(Layer.provideMerge(NodeServices.layer)))
);

describe("WorkspaceSnapshots.at — a workspace root nested inside a larger git repo", () => {
  it.layer(Live, { timeout: "30 seconds" })((it) => {
    // The layer resolves the workspace root from `inner/`; `Git` runs against
    // the outer repo's `.git`, so `at(ref)` must `./`-anchor every read to
    // `inner/` rather than the repo top-level.
    it.effect("reads the INNER workspace's manifest, members and catalog — not the outer root's", () =>
      Effect.gen(function* () {
        const snapshots = yield* WorkspaceSnapshots;
        const snapshot = yield* snapshots.at("HEAD");

        // The inner root plus both inner members — NOT `outer-root`/`@outer/a`.
        // The un-prefixed reader collapses to just ["outer-root"].
        const names = [...HashMap.keys(snapshot.versions)].sort();
        assert.deepStrictEqual(names, ["@inner/a", "@inner/b", "inner-root"]);

        // The inner catalog. The un-prefixed reader carries the OUTER `^3.0.0`.
        assertSome(snapshot.resolve("effect", "catalog:"), "^4.0.0");

        // The inner workspace: specifier resolves against the inner member's version.
        assertSome(snapshot.resolve("@inner/a", "workspace:*"), "1.1.0");
      })
    );
  });
});
