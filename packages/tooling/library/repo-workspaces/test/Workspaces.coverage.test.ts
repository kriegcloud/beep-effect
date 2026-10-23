import { LocalExec } from "@beep/commands";
import { PackageManagerDetector } from "@beep/repo-workspaces/PackageManagerName";
import { WorkspaceRoot, WorkspaceRootNotFoundError } from "@beep/repo-workspaces/WorkspaceRoot";
import { Workspaces } from "@beep/repo-workspaces/Workspaces";
import { assert, it, vi } from "@effect/vitest";
import { assertNone } from "@effect/vitest/utils";
import * as Effect from "effect/Effect";
import { dual } from "effect/Function";
import * as Layer from "effect/Layer";
import * as P from "effect/Predicate";

const calls: Array<string> = [];
it.layer(
  Workspaces.localExecLayer().pipe(
    Layer.provide(
      Layer.succeed(WorkspaceRoot, {
        find: dual(
          (args) => P.isString(args[0]),
          Effect.fn("WorkspaceRoot.find")((cwd: string) => {
            calls.push(cwd);
            return Effect.fail(WorkspaceRootNotFoundError.make({ searchPath: cwd, markers: [] }));
          })
        ),
      })
    ),
    Layer.provide(PackageManagerDetector.layerTest())
  ),
  { timeout: "30 seconds" }
)((it) => {
  it.effect("ambient cwd and absent process use the documented fallback", () =>
    Effect.gen(function* () {
      const exec = yield* LocalExec;
      const process = globalThis.process;
      const cwd = process.cwd();
      assertNone(yield* exec.context);
      // The ambient process boundary has no injected service seam.
      yield* Effect.gen(function* () {
        vi.stubGlobal("process", {});
        assertNone(yield* exec.context);
        vi.stubGlobal("process", undefined);
        assertNone(yield* exec.context);
      }).pipe(Effect.ensuring(Effect.sync(() => vi.stubGlobal("process", process))));
      assert.deepStrictEqual(calls, [cwd, "/", "/"]);
    })
  );
});
it.effect("JavaScript construction keeps the static facade available", () =>
  Effect.sync(() => {
    assert.isTrue(Reflect.construct(Workspaces, []) instanceof Workspaces);
  })
);
