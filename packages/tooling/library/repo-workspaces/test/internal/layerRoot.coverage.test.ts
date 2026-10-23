import { findLayerRoot } from "@beep/repo-workspaces/internal/layerRoot";
import { assert, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { dual } from "effect/Function";
import * as P from "effect/Predicate";
import type { FindWorkspaceRootOptions, WorkspaceRootShape } from "@beep/repo-workspaces/WorkspaceRoot";

it.effect("defers root lookup and forwards ambient cwd, explicit cwd and the optional ceiling", () =>
  Effect.gen(function* () {
    const calls: Array<readonly [string, FindWorkspaceRootOptions | undefined]> = [];
    const roots: WorkspaceRootShape = {
      find: dual(
        (args) => P.isString(args[0]),
        (cwd: string, options?: FindWorkspaceRootOptions) => {
          calls.push([cwd, options]);
          return Effect.succeed(cwd);
        }
      ),
    };
    const ambient = findLayerRoot(roots, undefined);
    assert.deepStrictEqual(calls, []);
    assert.strictEqual(yield* ambient, process.cwd());
    assert.strictEqual(yield* findLayerRoot({})(roots), process.cwd());
    assert.strictEqual(yield* findLayerRoot(roots, { cwd: "/repo/child" }), "/repo/child");
    assert.strictEqual(yield* findLayerRoot(roots, { cwd: "/repo/child", stopAt: "/repo" }), "/repo/child");
    assert.deepStrictEqual(calls, [
      [process.cwd(), undefined],
      [process.cwd(), undefined],
      ["/repo/child", undefined],
      ["/repo/child", { stopAt: "/repo" }],
    ]);
  })
);
