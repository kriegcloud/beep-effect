import { fcRuns } from "@beep/fc-runs/FastCheckRuns";
import { Git, LsTreeEntry } from "@beep/git";
import { ConfigDependencyHooks } from "@beep/repo-workspaces/ConfigDependencyHooks";
import { WorkspaceCatalogs } from "@beep/repo-workspaces/WorkspaceCatalogs";
import { WorkspaceDiscovery } from "@beep/repo-workspaces/WorkspaceDiscovery";
import { WorkspaceRoot } from "@beep/repo-workspaces/WorkspaceRoot";
import { WorkspaceSnapshots, WorkspaceSnapshotsOptions } from "@beep/repo-workspaces/WorkspaceSnapshots";
import { PackageStateSnapshot } from "@beep/repo-workspaces/WorkspaceStateSnapshot";
import { assert, it } from "@effect/vitest";
import * as Arbitrary from "effect/Arbitrary";
import * as Effect from "effect/Effect";
import { dual } from "effect/Function";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";

const runs = { arbitrary: fcRuns(100) };
const PackageText = S.fromJsonString(PackageStateSnapshot);
const platform = Layer.mergeAll(
  Layer.succeed(WorkspaceRoot, {
    find: dual(
      (args) => P.isString(args[0]),
      Effect.fn("WorkspaceRoot.find")(() => Effect.succeed("/repo"))
    ),
  }),
  WorkspaceDiscovery.layerTest(),
  WorkspaceCatalogs.layerTest(),
  ConfigDependencyHooks.layerNoop
);

it.layer(platform, { timeout: "30 seconds" })((it) => {
  it.effect.prop(
    "historical manifest parse/stringify fidelity preserves every dependency kind",
    [Arbitrary.schema(PackageStateSnapshot)],
    ([value]) =>
      Effect.gen(function* () {
        let text = yield* S.encodeEffect(PackageText)(value);
        const git = Git.makeTest({
          show: (_cwd, _ref, path) =>
            Effect.succeed(
              path === "./package.json"
                ? O.some('{"workspaces":["packages/*"]}')
                : path === "./packages/member/package.json"
                  ? O.some(text)
                  : O.none()
            ),
          lsTree: () =>
            Effect.succeed(
              ["package.json", "packages/member/package.json"].map((path) =>
                LsTreeEntry.make({ path, type: "blob", mode: "100644", oid: "0".repeat(40) })
              )
            ),
        });
        const service = yield* WorkspaceSnapshots.make({ cwd: "/repo" }).pipe(Effect.provideService(Git, git));
        const first = O.getOrThrow((yield* service.at("original")).package(value.name));
        assert.isTrue(
          S.toEquivalence(PackageStateSnapshot)(
            first,
            PackageStateSnapshot.make({ ...value, relativePath: "packages/member" })
          )
        );
        text = yield* S.encodeEffect(PackageText)(first);
        const second = O.getOrThrow((yield* service.at("serialized")).package(value.name));
        assert.isTrue(S.toEquivalence(PackageStateSnapshot)(first, second));
        assert.strictEqual(yield* S.encodeEffect(PackageText)(second), text);
      }),
    runs
  );
});

it.effect.prop(
  "snapshot options round-trip without materializing lazy defaults",
  [Arbitrary.schema(WorkspaceSnapshotsOptions)],
  ([value]) =>
    Effect.gen(function* () {
      const encoded = yield* S.encodeEffect(WorkspaceSnapshotsOptions)(value);
      const decoded = yield* S.decodeEffect(WorkspaceSnapshotsOptions)(encoded);
      assert.isTrue(S.toEquivalence(WorkspaceSnapshotsOptions)(decoded, value));
      assert.deepStrictEqual(yield* S.encodeEffect(WorkspaceSnapshotsOptions)(decoded), encoded);
    }),
  runs
);

it.effect("snapshot options keep absent keys distinct from explicit undefined", () =>
  Effect.gen(function* () {
    assert.deepStrictEqual(yield* S.decodeEffect(WorkspaceSnapshotsOptions)({}), WorkspaceSnapshotsOptions.make({}));
    assert.deepStrictEqual(
      yield* S.decodeEffect(WorkspaceSnapshotsOptions)({ stopAt: undefined }),
      WorkspaceSnapshotsOptions.make({ stopAt: undefined })
    );
  })
);
