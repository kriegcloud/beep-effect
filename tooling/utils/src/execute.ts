import { buildRepoDependencyIndex, mapWorkspaceToPackageJsonPath } from "@beep/tooling-utils/repo";
import * as FileSystem from "@effect/platform/FileSystem";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import { pipe } from "effect";
import * as A from "effect/Array";
import * as Cause from "effect/Cause";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { FsUtilsLive } from "./FsUtils.js";

const program = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const packagePathMap = yield* mapWorkspaceToPackageJsonPath;
  const map = yield* buildRepoDependencyIndex;

  const beepWeb = yield* HashMap.get("@beep/web")(map);
  const devDeps = HashSet.values(beepWeb.devDependencies.workspace);
  const deps = HashSet.values(beepWeb.dependencies.workspace);

  const candidates = HashSet.fromIterable([...devDeps, ...deps]);

  const shouldTranspile = Effect.fn(function* (path: string) {
    const pkgJsonRaw = yield* fs.readFileString(path, "utf8");
    const pkgJson = yield* S.decodeUnknown(S.parseJson(S.Record({ key: S.String, value: S.Unknown })))(pkgJsonRaw);

    const checkExports = (value: unknown): boolean => {
      if (Str.isString(value)) {
        return P.or(Str.endsWith(".ts"), Str.includes("/src/"))(value);
      }
      if (P.and(P.isNotNullable, P.isObject)(value)) {
        return pipe(value, R.values, A.some(checkExports));
      }
      return false;
    };

    if (P.and(P.hasProperty("exports"), P.isNotNullable)(pkgJson)) {
      if (checkExports(pkgJson.exports)) {
        return true;
      }
    }

    if (P.hasProperty("module")(pkgJson) && Str.isString(pkgJson.module)) {
      return pipe(pkgJson.module, P.or(Str.endsWith(".ts"), Str.includes("/src/")));
    }

    if (P.hasProperty("main")(pkgJson) && Str.isString(pkgJson.main)) {
      return pipe(pkgJson.main, P.or(Str.endsWith(".ts"), Str.includes("/src/")));
    }

    return false;
  });

  const result = yield* Effect.filter(HashSet.toValues(candidates), (c) =>
    pipe(HashMap.get(packagePathMap, c), Effect.flatMap(shouldTranspile))
  );

  yield* Console.log(result);
}).pipe(
  Effect.catchAll((error) =>
    Effect.gen(function* () {
      const message = String(error);
      yield* Console.log(`\nBOOTSTRAP FAILURE :: ${message}`);
      const cause = Cause.fail(error);
      yield* Console.log(`\nTRACE :: ${Cause.pretty(cause)}`);
      return yield* Effect.fail(error);
    })
  )
);

BunRuntime.runMain(program.pipe(Effect.provide([BunContext.layer, FsUtilsLive])));
