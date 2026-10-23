// The node-sync preset driving the sync entry points against the repository
// it lives in — the real filesystem, no virtual tree.
//
// `self.int.test.ts` pins the preset against the Effect surface from this
// package's own directory; this one does the same from a `packages/`
// subdirectory of a real Bun workspace, the shape a consumer calls it from.

import { findWorkspaceRootSync, getWorkspacePackagesSync, WorkspaceDiscovery, Workspaces } from "@beep/repo-workspaces";
import { nodeFileSystem, nodePath, nodeSyncOps } from "@beep/repo-workspaces/node-sync";
import { resolve } from "@beep/utils/Path";
import * as NodeServices from "@effect/platform-node/NodeServices";
import { assert, describe, it, layer } from "@effect/vitest";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Str from "effect/String";

/** A sibling package's directory — the repo root is somewhere above it. */
const cwd = resolve(import.meta.dirname, "..", "..", "..", "..", "..", "packages", "foundation", "modeling", "utils");

describe("the node-sync preset against the real repository", () => {
  it("findWorkspaceRootSync finds the workspace root from a packages/ subdir", () => {
    const root = findWorkspaceRootSync(cwd, nodeSyncOps);
    assert.isNotNull(root);
    if (root === null) return assert.fail("expected a workspace root");
    assert.isTrue(nodeFileSystem.exists(nodePath.join(root, "bun.lock")));
  });

  it("getWorkspacePackagesSync enumerates this package and its siblings", () => {
    const root = findWorkspaceRootSync(cwd, nodeSyncOps);
    assert.isNotNull(root);
    if (root === null) return assert.fail("expected a workspace root");
    const names = A.map(getWorkspacePackagesSync(root, nodeSyncOps), (pkg) => pkg.name);
    assert.include(names, "@beep/repo-workspaces");
    assert.include(names, "@beep/utils");
    assert.include(names, "@beep/identity");
  });
});

layer(Workspaces.layer({ cwd }).pipe(Layer.provideMerge(NodeServices.layer)), { timeout: "30 seconds" })((it) => {
  it.effect("the preset agrees exactly with the Effect discovery surface", () =>
    Effect.gen(function* () {
      const discovery = yield* WorkspaceDiscovery;
      const info = yield* discovery.info;
      const root = findWorkspaceRootSync(cwd, nodeSyncOps);
      assert.strictEqual(root, info.root);
      const sync = A.sort(
        A.map(getWorkspacePackagesSync(info.root, nodeSyncOps), (pkg) => pkg.name),
        Str.Order
      );
      const async = A.sort(
        A.map(yield* discovery.listPackages, (pkg) => pkg.name),
        Str.Order
      );
      assert.deepStrictEqual(sync, async);
    })
  );
});
