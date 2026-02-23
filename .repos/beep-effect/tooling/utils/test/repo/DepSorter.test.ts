/**
 * Tests for dependency sorting utilities.
 *
 * @module @beep/tooling-utils/test/repo/DepSorter
 */

import { describe } from "bun:test";
import { effect, strictEqual } from "@beep/testkit";
import { enforceVersionSpecifiers, mergeSortedDeps, sortDependencies } from "@beep/tooling-utils";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import * as R from "effect/Record";

describe("DepSorter", () => {
  describe("sortDependencies", () => {
    effect("sorts workspace deps topologically and external alphabetically", () =>
      Effect.gen(function* () {
        const deps = {
          "@beep/utils": "workspace:^",
          "@beep/schema": "workspace:^",
          zod: "^3.0.0",
          effect: "^3.0.0",
        };

        // schema has no deps, utils depends on schema
        const graph = HashMap.make(
          ["@beep/schema", HashSet.empty<string>()],
          ["@beep/utils", HashSet.make("@beep/schema")]
        );

        const sorted = yield* sortDependencies(deps, graph);

        // Workspace deps should be in topo order
        strictEqual(A.length(sorted.workspace), 2);
        strictEqual(sorted.workspace[0]?.[0], "@beep/schema");
        strictEqual(sorted.workspace[1]?.[0], "@beep/utils");

        // External deps should be alphabetical
        strictEqual(A.length(sorted.external), 2);
        strictEqual(sorted.external[0]?.[0], "effect");
        strictEqual(sorted.external[1]?.[0], "zod");
      })
    );

    effect("handles only workspace deps", () =>
      Effect.gen(function* () {
        const deps = {
          "@beep/utils": "workspace:^",
          "@beep/schema": "workspace:^",
        };

        const graph = HashMap.make(
          ["@beep/schema", HashSet.empty<string>()],
          ["@beep/utils", HashSet.make("@beep/schema")]
        );

        const sorted = yield* sortDependencies(deps, graph);

        strictEqual(A.length(sorted.workspace), 2);
        strictEqual(A.length(sorted.external), 0);
      })
    );

    effect("handles only external deps", () =>
      Effect.gen(function* () {
        const deps = {
          zod: "^3.0.0",
          effect: "^3.0.0",
        };

        const graph = HashMap.empty<string, HashSet.HashSet<string>>();

        const sorted = yield* sortDependencies(deps, graph);

        strictEqual(A.length(sorted.workspace), 0);
        strictEqual(A.length(sorted.external), 2);
        strictEqual(sorted.external[0]?.[0], "effect");
        strictEqual(sorted.external[1]?.[0], "zod");
      })
    );

    effect("handles empty deps", () =>
      Effect.gen(function* () {
        const deps = {};
        const graph = HashMap.empty<string, HashSet.HashSet<string>>();

        const sorted = yield* sortDependencies(deps, graph);

        strictEqual(A.length(sorted.workspace), 0);
        strictEqual(A.length(sorted.external), 0);
      })
    );
  });

  describe("mergeSortedDeps", () => {
    effect("merges workspace and external deps preserving order", () =>
      Effect.gen(function* () {
        const sorted = {
          workspace: [["@beep/schema", "workspace:^"] as const, ["@beep/utils", "workspace:^"] as const],
          external: [["effect", "^3.0.0"] as const, ["zod", "^3.0.0"] as const],
        };

        const merged = mergeSortedDeps(sorted);

        const keys = R.keys(merged);
        strictEqual(A.length(keys), 4);

        // Workspace first, then external
        strictEqual(keys[0], "@beep/schema");
        strictEqual(keys[1], "@beep/utils");
        strictEqual(keys[2], "effect");
        strictEqual(keys[3], "zod");
      })
    );

    effect("handles empty workspace", () =>
      Effect.gen(function* () {
        const sorted = {
          workspace: [] as Array<readonly [string, string]>,
          external: [["effect", "^3.0.0"] as const],
        };

        const merged = mergeSortedDeps(sorted);
        const keys = R.keys(merged);
        strictEqual(A.length(keys), 1);
        strictEqual(keys[0], "effect");
      })
    );
  });

  describe("enforceVersionSpecifiers", () => {
    effect("converts workspace packages to workspace:^", () =>
      Effect.gen(function* () {
        const deps = {
          "@beep/schema": "^1.0.0",
          "@beep/utils": "latest",
          effect: "^3.0.0",
        };

        const workspaces = HashSet.make("@beep/schema", "@beep/utils");

        const enforced = enforceVersionSpecifiers(deps, workspaces);

        strictEqual(enforced["@beep/schema"], "workspace:^");
        strictEqual(enforced["@beep/utils"], "workspace:^");
        strictEqual(enforced["effect" as const], "^3.0.0");
      })
    );

    effect("converts external deps to catalog: when requested", () =>
      Effect.gen(function* () {
        const deps = {
          "@beep/schema": "workspace:^",
          effect: "^3.0.0",
        };

        const workspaces = HashSet.make("@beep/schema");

        const enforced = enforceVersionSpecifiers(deps, workspaces, true);

        strictEqual(enforced["@beep/schema"], "workspace:^");
        strictEqual(enforced["effect" as const], "catalog:");
      })
    );

    effect("preserves existing catalog: specifiers", () =>
      Effect.gen(function* () {
        const deps = {
          effect: "catalog:",
        };

        const workspaces = HashSet.empty<string>();

        const enforced = enforceVersionSpecifiers(deps, workspaces, true);

        strictEqual(enforced["effect" as const], "catalog:");
      })
    );
  });
});
