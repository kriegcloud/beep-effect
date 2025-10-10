import { describe, expect } from "bun:test";
import { layer } from "@beep/testkit";
import { FsUtilsLive } from "@beep/tooling-utils/FsUtils";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as BunFileSystem from "@effect/platform-bun/BunFileSystem";
import * as BunPath from "@effect/platform-bun/BunPath";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";
import * as Str from "effect/String";
import { type PackageTarget, processPackage, type ScriptOptions } from "../src/utils/enforce-js-import-suffix/engine";

const TestLayer = Layer.mergeAll(FsUtilsLive, BunFileSystem.layer, BunPath.layerPosix);

const mkTempRepo = (files: ReadonlyArray<{ readonly path: string; readonly content: string }>) =>
  Effect.gen(function* () {
    const fileSystem = yield* FileSystem.FileSystem;
    const path_ = yield* Path.Path;

    const repoRoot = yield* fileSystem.makeTempDirectory({
      prefix: "enforce-js-import-suffix",
    });

    const tsconfig = {
      compilerOptions: {
        module: "NodeNext",
        moduleResolution: "NodeNext",
        target: "ES2024",
        lib: ["ES2024"],
        allowJs: true,
        resolveJsonModule: true,
      },
    };

    const tsconfigContent = JSON.stringify(tsconfig, null, 2);
    const tsconfigPath = path_.join(repoRoot, "tsconfig.json");

    yield* fileSystem.writeFileString(tsconfigPath, Str.concat(tsconfigContent, "\n"));

    yield* Effect.forEach(
      files,
      ({ path: filePath, content }) =>
        Effect.gen(function* () {
          const absolutePath = path_.join(repoRoot, filePath);
          const directory = path_.dirname(absolutePath);
          yield* fileSystem.makeDirectory(directory, { recursive: true });
          yield* fileSystem.writeFileString(absolutePath, content);
        }),
      { discard: true }
    );

    return repoRoot;
  });

describe("enforce-js-import-suffix engine", () => {
  layer(TestLayer, { excludeTestServices: true })("processPackage", (it) => {
    const makePackageTarget = (repoRoot: string, relativeDir: string, path_: Path.Path): PackageTarget => {
      const sanitizedRelativeDir = F.pipe(relativeDir, Str.replace(/\//g, "-"));
      return {
        name: Str.concat("@temp/", sanitizedRelativeDir),
        dir: path_.join(repoRoot, relativeDir),
        relativeDir,
      };
    };

    it.effect(
      "rewrites directory imports to index.js",
      Effect.fnUntraced(function* () {
        const repoRoot = yield* mkTempRepo([
          {
            path: "packages/foo/main.ts",
            content: `import { fn } from "./beep";

export const run = () => fn();
`,
          },
          {
            path: "packages/foo/beep/index.ts",
            content: `export const fn = () => "ok";
`,
          },
        ]);

        const path_ = yield* Path.Path;
        const fileSystem = yield* FileSystem.FileSystem;
        const pkg = makePackageTarget(repoRoot, "packages/foo", path_);
        const options: ScriptOptions = { checkMode: false };

        const result = yield* processPackage(pkg, options, repoRoot);
        expect(result.specifiersUpdated).toBe(1);
        expect(result.fallbackNotices.length).toBe(0);

        const mainContent = yield* fileSystem.readFileString(path_.join(pkg.dir, "main.ts"));
        expect(mainContent).toContain(`"./beep/index.js"`);
      })
    );

    it.effect(
      "rewrites .tsx imports to .js files",
      Effect.fnUntraced(function* () {
        const repoRoot = yield* mkTempRepo([
          {
            path: "packages/bar/component.tsx",
            content: `import Foo from "./Foo";

export const Component = () => <Foo />;
`,
          },
          {
            path: "packages/bar/Foo.tsx",
            content: `const Foo = () => <div>foo</div>;
export default Foo;
`,
          },
        ]);

        const path_ = yield* Path.Path;
        const fileSystem = yield* FileSystem.FileSystem;
        const pkg = makePackageTarget(repoRoot, "packages/bar", path_);
        const options: ScriptOptions = { checkMode: false };

        const result = yield* processPackage(pkg, options, repoRoot);
        expect(result.specifiersUpdated).toBe(1);
        expect(result.fallbackNotices.length).toBe(0);

        const componentContent = yield* fileSystem.readFileString(path_.join(pkg.dir, "component.tsx"));
        expect(componentContent).toContain(`"./Foo.js"`);
      })
    );
  });
});
