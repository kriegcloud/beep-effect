import {$ScratchpadId} from "@beep/identity";
import {Context, Effect, FileSystem, HashMap, Layer, Path} from "effect";
import * as S from "effect/Schema";
import * as NodeUrl from "@beep/utils/NodeUrl";
import * as FsUtils from "@beep/repo-utils/FsUtils";
import {BunRuntime, BunServices} from "@effect/platform-bun";
import {CauseTaggedError, FilePath, LiteralKit} from "@beep/schema";
import * as NodeModule from "node:module";

import {PackageJson, TSConfig} from "@beep/tooling-utils/schemas";


const $I = $ScratchpadId.create("index");


export const ProgramErrorReason = LiteralKit([
  "Unknown",
]).pipe(
  $I.annoteSchema("ProgramErrorReason", {
    description: "Reason for a ProgramError"
  })
)

export class ProgramError extends CauseTaggedError<ProgramError>($I`ProgramError`)("ProgramError", {
  reason: ProgramErrorReason,
}, $I.annote("ProgramError", {
  description: "A ProgramError is an error that occurred during the execution of a program."
})) {}

export interface BeepYeetShape {
  readonly yeet: (args: any) => Effect.Effect<string, never, void>;
}

const buildBeepYeetService = Effect.gen(function* () {
  const yeet = Effect.fn("BeepYeet.yeet")(function* (_args: any) {
    return yield* Effect.succeed("temporary yeet")
  });

  return BeepYeet.of({
    yeet
  })
})

export class BeepYeet extends Context.Service<BeepYeet, BeepYeetShape>()($I`BeepYeet`) {
  static readonly layer = Layer.effect(
    BeepYeet,
    buildBeepYeetService
  )
}



const getProgramDependencies = Effect.gen(function* () {

  const require = NodeModule.createRequire(import.meta.url);

  const requireResolve = Effect.fn("ProgramDependencies.requireResolve")(function* (depString: string)  {
    return yield* Effect.try({
      try: () => require.resolve(depString),
      catch: ProgramError.new(
        `failed resolve dependency string: ${depString}`,
        {
          reason: ProgramErrorReason.Enum.Unknown,
        }
      )
    });
  })

  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const fsUtils = yield* FsUtils.FsUtils;
  const repoRoot = yield* findRepoRoot;


  return {
    fs,
    path,
    fsUtils,
    process: process,
    requireResolve,
    require,
  };
});

const ProgramDependenciesLive = Layer.mergeAll(
  Layer.provideMerge(
    FsUtils.FsUtilsLive,
    BunServices.layer,
  ),
);


const provideScopedLayer =
  <ROut, E2, RIn>(layer: Layer.Layer<ROut, E2, RIn>) =>
    <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E | E2, RIn | Exclude<R, ROut>> =>
      Effect.scoped(Layer.build(layer).pipe(Effect.flatMap((context) => effect.pipe(Effect.provide(context)))));

export class Pkg extends S.Class<Pkg>($I`Pkg`)({
  name: S.TemplateLiteral(["@beep/", S.NonEmptyString]),
  path: FilePath,
  packageJson: PackageJson,
  tsConfig: TSConfig,
}) {}



interface RepositoryDataStructures {
  pkgMap: HashMap.HashMap<string, any>,
}

// const resolveRepoDataStructures = Effect.gen(function* () {
//   const { fs, path, fsUtils } = yield* getProgramDependencies;
//
//
//
// })

const program = Effect.gen(function* () {
  const { fs, path, fsUtils, process } = yield* getProgramDependencies;

}).pipe(
  provideScopedLayer(ProgramDependenciesLive),
)


BunRuntime.runMain(program);
