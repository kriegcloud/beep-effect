import {
  Effect,
  Match,
  Result,
  FileSystem,
  Path,
  Layer,
  pipe,
  flow,
  HashMap,
  identity,
} from "effect";
import {BunRuntime, BunServices} from "@effect/platform-bun";
import {
  findRepoRoot,
  FsUtils,
  FsUtilsLive,
  resolveWorkspaceDirs,
  TSMorphService,
  TSMorphServiceLive,
} from "@beep/repo-utils";

const baseLayer = Layer.provideMerge(FsUtilsLive, BunServices.layer);

const layer = TSMorphServiceLive.pipe(Layer.provideMerge(baseLayer))

const program = Effect.gen(function* () {
  const repoRoot = yield* findRepoRoot();
  const workspaceDirs = yield* resolveWorkspaceDirs(repoRoot)


  const SharedDomainDir = yield* HashMap.get("@beep/shared-domain")(workspaceDirs)

  yield* Effect.log(SharedDomainDir)
  return yield* Effect.void
});

const main = Effect.scoped(Layer.build(layer)
  .pipe(Effect.flatMap((context) => program.pipe(Effect.provide(context)))))


BunRuntime.runMain(main)
