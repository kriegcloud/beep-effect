import { EFFECT_ATOM_DOCS } from "@beep/repo-scripts/effect-atom-docs";
import { FsUtils, FsUtilsLive } from "@beep/tooling-utils/FsUtils";
import { RepoUtils, RepoUtilsLive } from "@beep/tooling-utils/RepoUtils";
import { DomainError } from "@beep/tooling-utils/repo";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunFileSystem from "@effect/platform-bun/BunFileSystem";
import * as BunPath from "@effect/platform-bun/BunPath";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as A from "effect/Array";
import * as Cause from "effect/Cause";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";

const program = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const fsUtils = yield* FsUtils;
  const repo = yield* RepoUtils;

  const outputDir = path.join(repo.REPOSITORY_ROOT, "docs", "effect-atom");

  yield* fsUtils.mkdirCached(outputDir);

  const effects = F.pipe(
    EFFECT_ATOM_DOCS,
    A.map((doc) => {
      const filePath = path.join(outputDir, doc.name);
      return fs.writeFileString(filePath, doc.content).pipe(DomainError.mapError);
    })
  );

  yield* Effect.all(effects, { concurrency: effects.length });
}).pipe(
  Effect.provide([
    Layer.provideMerge(FsUtilsLive)(RepoUtilsLive),
    BunFileSystem.layer,
    BunPath.layerPosix,
    BunContext.layer,
  ]),
  Effect.catchAll((error) =>
    Effect.gen(function* () {
      yield* Console.log("\n💥 Program failed:", String(error));
      const cause = Cause.fail(error);
      yield* Console.log("\n🔍 Error details:", Cause.pretty(cause));
      return yield* Effect.fail(error);
    })
  )
);

BunRuntime.runMain(program);
