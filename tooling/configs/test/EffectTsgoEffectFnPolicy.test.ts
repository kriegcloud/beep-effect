import { fileURLToPath } from "node:url";
import { NodeChildProcessSpawner } from "@effect/platform-node";
import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem";
import * as NodePath from "@effect/platform-node/NodePath";
import { Effect, FileSystem, Layer, Path, Stream } from "effect";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { ChildProcess } from "effect/unstable/process";
import * as jsonc from "jsonc-parser";
import { describe, expect, it } from "vitest";

const repoRoot = fileURLToPath(new URL("../../..", import.meta.url));
const tsgoBinPath = fileURLToPath(new URL("../../../node_modules/.bin/tsgo", import.meta.url));

const PlatformLayer = Layer.mergeAll(NodeFileSystem.layer, NodePath.layer);
const TestLayer = Layer.mergeAll(PlatformLayer, NodeChildProcessSpawner.layer.pipe(Layer.provideMerge(PlatformLayer)));
const encodeJson = S.encodeUnknownSync(S.UnknownFromJsonString);

const collectText = <E>(stream: Stream.Stream<Uint8Array, E>) =>
  stream.pipe(
    Stream.decodeText(),
    Stream.runFold(
      () => "",
      (text, chunk) => `${text}${chunk}`
    )
  );

const withTempProject = <A, E, R>(use: (projectDir: string) => Effect.Effect<A, E, R>) =>
  Effect.scoped(
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const projectDir = yield* fs.makeTempDirectoryScoped({ prefix: "effect-tsgo-effect-fn-" });
      return yield* use(projectDir);
    })
  );

const writeJsonFile = Effect.fn(function* (filePath: string, value: unknown) {
  const fs = yield* FileSystem.FileSystem;
  const encoded = encodeJson(value);
  const edits = jsonc.format(encoded, undefined, {
    tabSize: 2,
    insertSpaces: true,
  });

  yield* fs.writeFileString(filePath, `${jsonc.applyEdits(encoded, edits)}\n`);
});

const writeProjectFile = Effect.fn(function* (projectDir: string, relativePath: string, content: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const filePath = path.join(projectDir, relativePath);

  yield* fs.makeDirectory(path.dirname(filePath), { recursive: true });
  yield* fs.writeFileString(filePath, content);
});

const bootstrapTsgoProject = Effect.fn(function* (projectDir: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  yield* fs.symlink(path.join(repoRoot, "node_modules"), path.join(projectDir, "node_modules"));
  yield* writeJsonFile(path.join(projectDir, "package.json"), {
    name: "@beep/effect-tsgo-effect-fn-test",
    private: true,
    type: "module",
  });
  yield* writeJsonFile(path.join(projectDir, "tsconfig.json"), {
    extends: path.join(repoRoot, "tsconfig.base.json"),
    include: ["src"],
    compilerOptions: {
      rootDir: "src",
      outDir: "dist",
      noEmit: true,
    },
  });
  yield* writeProjectFile(
    projectDir,
    "src/index.ts",
    [
      'import { Effect } from "effect";',
      "",
      "export const shouldError = (value: string) => {",
      "  return Effect.gen(function* () {",
      "    yield* Effect.succeed(value);",
      "    return value.toUpperCase();",
      "  });",
      "};",
      "",
      "export const shortPlain = () => {",
      "  return Effect.succeed(1);",
      "};",
      "",
    ].join("\n")
  );
});

const runTsgoOnProject = Effect.fn(function* (projectDir: string) {
  const path = yield* Path.Path;
  const command = ChildProcess.make(
    process.execPath,
    [tsgoBinPath, "--noEmit", "--pretty", "false", "-p", path.join(projectDir, "tsconfig.json")],
    {
      cwd: projectDir,
      stdout: "pipe",
      stderr: "pipe",
    }
  );

  return yield* Effect.scoped(
    Effect.gen(function* () {
      const handle = yield* command;
      const result = yield* Effect.all({
        stdout: collectText(handle.stdout),
        stderr: collectText(handle.stderr),
        exitCode: handle.exitCode,
      });

      return {
        stdout: Str.trim(result.stdout),
        stderr: Str.trim(result.stderr),
        exitCode: result.exitCode,
      };
    })
  );
});

describe("Effect tsgo effectFn policy", () => {
  it("fails reusable Effect.gen wrappers with a named Effect.fn suggestion", async () => {
    await Effect.runPromise(
      withTempProject((projectDir) =>
        Effect.gen(function* () {
          yield* bootstrapTsgoProject(projectDir);
          const result = yield* runTsgoOnProject(projectDir);
          const output = Str.trim(`${result.stdout}\n${result.stderr}`);
          const effectFnOpportunityMatches = output.match(/effect\(effectFnOpportunity\)/g) ?? [];

          expect(result.exitCode).not.toBe(0);
          expect(effectFnOpportunityMatches).toHaveLength(1);
          expect(output).toContain("error TS");
          expect(output).toContain('Effect.fn("shouldError")(function*(value) { ... })');
          expect(output).not.toContain("shortPlain");
        })
      ).pipe(Effect.provide(TestLayer))
    );
  }, 15_000);
});
