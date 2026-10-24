import { CatalogSet } from "@beep/repo-workspaces/WorkspaceCatalogs";
import { WorkspaceStateSnapshot } from "@beep/repo-workspaces/WorkspaceStateSnapshot";
import { assert, it } from "@effect/vitest";
import { assertNone } from "@effect/vitest/utils";
import * as Effect from "effect/Effect";

it.effect("missing importer records abstain and resolver layers are memoized", () =>
  Effect.sync(() => {
    const state = WorkspaceStateSnapshot.make({ packages: [], catalogs: CatalogSet.empty() });
    assertNone(state.resolveIn(".", "missing", "catalog:"));
    assert.strictEqual(state.catalogResolver, state.catalogResolver);
    assert.strictEqual(state.workspaceResolver, state.workspaceResolver);
    assert.strictEqual(state.resolvers, state.resolvers);
    assert.deepStrictEqual(state.versionNames, []);
  })
);
