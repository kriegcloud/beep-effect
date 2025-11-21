import { FsUtilsLive } from "@beep/tooling-utils/FsUtils.js";
import { resolveWorkspaceDirs } from "@beep/tooling-utils/repo/index.js";
import * as Path from "@effect/platform/Path";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as HashMap from "effect/HashMap";
import * as Glob from "glob";
import Jscodeshift from "jscodeshift/src/Runner.js";

const program = Effect.gen(function* () {
  const path = yield* Path.Path;
  const repoMap = yield* resolveWorkspaceDirs;
  const repoScriptsDir = yield* HashMap.get("@beep/repo-scripts")(repoMap);
  const codeModPath = path.join(repoScriptsDir, "src/codemods/jsdoc.ts");
  const pattern = "packages/{*,*/*}/src/**/*.ts";

  const paths = A.map(
    Glob.globSync(pattern, {
      ignore: ["**/internal/**"],
    }),
    (_) => path.resolve(_)
  );

  const transformer = path.resolve(codeModPath);

  Jscodeshift.run(transformer, paths, {
    babel: true,
    parser: "ts",
  });
});

BunRuntime.runMain(program.pipe(Effect.provide([BunContext.layer, FsUtilsLive])));
