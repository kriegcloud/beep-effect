import {
  parseQualityTaskInvocation,
  type QualityTaskInvocation,
  rootQualityStepsForTesting,
  runQualityTask,
} from "@beep/repo-cli/commands/Quality/Tasks";
import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem";
import * as NodePath from "@effect/platform-node/NodePath";
import { Effect, FileSystem, Layer, Path } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as TestConsole from "effect/testing/TestConsole";
import { describe, expect, it } from "vitest";

const PlatformLayer = Layer.mergeAll(NodeFileSystem.layer, NodePath.layer, TestConsole.layer);
const encodeJson = S.encodeUnknownSync(S.UnknownFromJsonString);

const withTempRepo = <A, E, R>(use: Effect.Effect<A, E, R>) =>
  Effect.acquireUseRelease(
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const tmpDir = yield* fs.makeTempDirectory();
      const previousCwd = process.cwd();
      const previousExitCode = process.exitCode;

      process.chdir(tmpDir);
      process.exitCode = undefined;
      yield* fs.makeDirectory(path.join(tmpDir, ".git"), { recursive: true });

      return { fs, previousCwd, previousExitCode, tmpDir } as const;
    }),
    () => use,
    ({ fs, previousCwd, previousExitCode, tmpDir }) =>
      Effect.gen(function* () {
        process.chdir(previousCwd);
        process.exitCode = previousExitCode ?? 0;
        yield* fs.remove(tmpDir, { recursive: true });
      })
  ).pipe(Effect.provide(PlatformLayer));

const getInvocation = (argv: ReadonlyArray<string>): QualityTaskInvocation => {
  const invocation = parseQualityTaskInvocation(argv);
  if (O.isNone(invocation)) {
    throw new Error(`Expected ${argv.join(" ")} to parse as a quality task.`);
  }
  return invocation.value;
};

describe("quality task adapter", () => {
  it("parses canonical task invocations and preserves passthrough args", () => {
    expect(getInvocation(["build", "--affected", "--summarize"])).toMatchObject({
      task: "build",
      fix: false,
      args: ["--affected", "--summarize"],
    });
    expect(getInvocation(["lint", "--fix", "--filter=@beep/schema"])).toMatchObject({
      task: "lint",
      fix: true,
      args: ["--filter=@beep/schema"],
    });
    expect(getInvocation(["lint", "--fix", "--dry=json"])).toMatchObject({
      task: "lint",
      fix: true,
      args: ["--dry=json"],
    });
    expect(getInvocation(["audit", "packages", "--filter=@beep/schema"])).toMatchObject({
      task: "audit",
      fix: false,
      args: ["packages", "--filter=@beep/schema"],
    });
  });

  it("builds package-only audit steps by default and keeps turbo filters", () => {
    const steps = rootQualityStepsForTesting("/repo", getInvocation(["audit", "--filter=@beep/schema", "--summarize"]));

    expect(steps).toHaveLength(1);
    expect(steps[0]).toMatchObject({
      label: "audit:packages",
      command: "bunx",
      args: ["turbo", "run", "audit", "--cache=local:rw", "--filter=@beep/schema", "--summarize"],
      cwd: "/repo",
    });
  });

  it("routes explicit and legacy github audit modes to script checks", () => {
    const explicitSteps = rootQualityStepsForTesting("/repo", getInvocation(["audit", "github", "repo-sanity"]));
    const legacySteps = rootQualityStepsForTesting("/repo", getInvocation(["audit", "repo-sanity"]));

    expect(explicitSteps).toHaveLength(1);
    expect(legacySteps).toHaveLength(1);
    expect(explicitSteps[0]).toMatchObject({
      label: "audit:repo-sanity",
      command: "bash",
      args: ["scripts/run-github-checks.sh", "repo-sanity"],
      cwd: "/repo",
    });
    expect(legacySteps[0]).toMatchObject({
      label: "audit:repo-sanity",
      command: "bash",
      args: ["scripts/run-github-checks.sh", "repo-sanity"],
      cwd: "/repo",
    });
  });

  it("keeps scope args in both lint --fix steps", () => {
    const steps = rootQualityStepsForTesting(
      "/repo",
      getInvocation(["lint", "--fix", "--filter=@beep/schema", "--affected", "--dry=json"])
    );

    expect(steps).toHaveLength(2);
    expect(steps[0]).toMatchObject({
      label: "lint:effect-imports:fix",
      command: "bunx",
      args: [
        "turbo",
        "run",
        "lint:effect-imports:fix",
        "--cache=local:rw",
        "--filter=@beep/schema",
        "--affected",
        "--dry=json",
      ],
    });
    expect(steps[1]).toMatchObject({
      label: "lint:fix",
      command: "bunx",
      args: ["turbo", "run", "lint:fix", "--cache=local:rw", "--filter=@beep/schema", "--affected", "--dry=json"],
    });
  });

  it("runs unit and types as separate turbo invocations", () => {
    const steps = rootQualityStepsForTesting(
      "/repo",
      getInvocation(["test", "--unit", "--types", "--filter=@beep/schema", "--summarize"])
    );

    expect(steps).toHaveLength(2);
    expect(steps[0]).toMatchObject({
      label: "test:unit",
      command: "bunx",
      args: [
        "turbo",
        "run",
        "test",
        "--cache=local:rw",
        "--filter=!@beep/repo-memory-runtime",
        "--filter=!@beep/repo-memory-sqlite",
        "--filter=!@beep/shared-server",
        "--filter=@beep/schema",
        "--summarize",
      ],
    });
    expect(steps[1]).toMatchObject({
      label: "test:types",
      command: "bunx",
      args: ["turbo", "run", "check:types", "--cache=local:rw", "--filter=@beep/schema", "--summarize"],
    });
  });

  it("leaves lint policy subcommands on the existing command tree", () => {
    expect(O.isNone(parseQualityTaskInvocation(["lint", "circular"]))).toBe(true);
    expect(O.isNone(parseQualityTaskInvocation(["lint", "schema-first"]))).toBe(true);
  });

  it("treats unsupported package tasks as explicit no-ops", async () => {
    await Effect.runPromise(
      withTempRepo(
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const tmpDir = process.cwd();
          const packageDir = path.join(tmpDir, "packages", "empty");

          yield* fs.writeFileString(
            path.join(tmpDir, "package.json"),
            encodeJson({
              name: "@beep/test-root",
              private: true,
              workspaces: ["packages/*"],
            })
          );
          yield* fs.makeDirectory(packageDir, { recursive: true });
          yield* fs.writeFileString(
            path.join(packageDir, "package.json"),
            encodeJson({
              name: "@beep/empty",
              private: true,
              scripts: {
                lint: "beep-cli lint",
              },
            })
          );

          process.chdir(packageDir);
          yield* runQualityTask(getInvocation(["lint"]));

          const lines = yield* TestConsole.logLines;
          expect(lines).toEqual(["[beep-cli] @beep/empty lint: no-op"]);
          expect(process.exitCode ?? 0).toBe(0);
        })
      )
    );
  });
});
