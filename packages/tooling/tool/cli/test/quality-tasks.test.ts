import {
  parseQualityTaskInvocation,
  QualityTaskFailed,
  type QualityTaskInvocation,
  rootQualityStepsForTesting,
  runQualityTask,
  runSqlIntegrationTestLaneForTesting,
  sqlIntegrationConnectionUriFromEnvForTesting,
  sqlIntegrationStepForTesting,
} from "@beep/repo-cli/commands/Quality/Tasks";
import { NodeChildProcessSpawner } from "@effect/platform-node";
import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem";
import * as NodePath from "@effect/platform-node/NodePath";
import { Cause, Effect, Exit, FileSystem, Layer, Path } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as TestConsole from "effect/testing/TestConsole";
import { describe, expect, it } from "vitest";

const FileSystemLayer = Layer.mergeAll(NodeFileSystem.layer, NodePath.layer);
const PlatformLayer = Layer.mergeAll(
  FileSystemLayer,
  NodeChildProcessSpawner.layer.pipe(Layer.provideMerge(FileSystemLayer)),
  TestConsole.layer
);
const encodeJson = S.encodeUnknownSync(S.UnknownFromJsonString);
const isQualityTaskFailed = S.is(QualityTaskFailed);

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
const expectedTurboArgs = (task: string, args: ReadonlyArray<string>): ReadonlyArray<string> => [
  "turbo",
  "run",
  task,
  ...(process.env.CI === "true" || args.some((arg) => arg.startsWith("--cache=")) ? [] : ["--cache=local:rw"]),
  ...args,
];

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
      args: expectedTurboArgs("audit", ["--filter=@beep/schema", "--summarize"]),
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
      command: "bun",
      args: ["run", "beep", "quality", "github-checks", "repo-sanity"],
      cwd: "/repo",
    });
    expect(legacySteps[0]).toMatchObject({
      label: "audit:repo-sanity",
      command: "bun",
      args: ["run", "beep", "quality", "github-checks", "repo-sanity"],
      cwd: "/repo",
    });
  });

  it("includes repo-level tsgo diagnostics for affected root check lanes", () => {
    const steps = rootQualityStepsForTesting("/repo", getInvocation(["check", "--affected", "--summarize"]));

    expect(steps).toHaveLength(4);
    expect(steps[0]).toMatchObject({
      label: "check",
      command: "bunx",
      cwd: "/repo",
    });
    expect(steps[0]?.args).toEqual([
      "turbo",
      "run",
      "check",
      ...(process.env.CI === "true" ? [] : ["--cache=local:rw"]),
      "--affected",
      "--summarize",
    ]);
    expect(steps.slice(1)).toEqual([
      expect.objectContaining({
        label: "check:dtslint:tsgo",
        command: "bun",
        args: ["run", "beep", "quality", "dtslint-tsgo"],
      }),
      expect.objectContaining({
        label: "check:tsgo:tests",
        command: "bun",
        args: ["run", "beep", "quality", "test-tsgo"],
      }),
      expect.objectContaining({
        label: "check:tsgo:smoke",
        command: "bun",
        args: ["run", "beep", "quality", "tsgo-smoke"],
      }),
    ]);
  });

  it("skips repo-level tsgo diagnostics only for explicit package filters", () => {
    const steps = rootQualityStepsForTesting("/repo", getInvocation(["check", "--filter=@beep/schema"]));

    expect(steps).toHaveLength(1);
    expect(steps[0]?.args).toEqual(expectedTurboArgs("check", ["--filter=@beep/schema"]));
  });

  it("keeps scope args in the aggregate lint --fix step", () => {
    const steps = rootQualityStepsForTesting(
      "/repo",
      getInvocation(["lint", "--fix", "--filter=@beep/schema", "--affected", "--dry=json"])
    );

    expect(steps).toHaveLength(1);
    expect(steps[0]).toMatchObject({
      label: "lint:fix",
      command: "bunx",
      args: expectedTurboArgs("lint:fix", ["--filter=@beep/schema", "--affected", "--dry=json"]),
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
      args: expectedTurboArgs("test", ["--filter=@beep/schema", "--summarize"]),
    });
    expect(steps[1]).toMatchObject({
      label: "test:types",
      command: "bunx",
      args: expectedTurboArgs("type-test", ["--filter=@beep/schema", "--summarize"]),
    });
  });

  it("builds the integration lane command with shared SQL environment", () => {
    const step = sqlIntegrationStepForTesting("/repo", ["--filter=@beep/test-utils", "--summarize"], {
      connectionUri: "postgres://postgres:postgres@127.0.0.1:5432/postgres",
    });

    expect(step).toMatchObject({
      label: "test:integration",
      command: "bunx",
      args: expectedTurboArgs("test:integration", ["--concurrency=1", "--filter=@beep/test-utils", "--summarize"]),
      cwd: "/repo",
      env: {
        BEEP_TEST_DATABASE_DRIVER: "pg-external",
        BEEP_TEST_DATABASE_ISOLATION: "schema",
        BEEP_TEST_DATABASE_URL: "postgres://postgres:postgres@127.0.0.1:5432/postgres",
      },
    });
  });

  it("prefers resolved external SQL URLs over Testcontainers-only defaults", () => {
    expect(
      sqlIntegrationConnectionUriFromEnvForTesting({
        BEEP_TEST_DATABASE_URL: "postgres://test:secret@127.0.0.1:5432/test",
        DATABASE_URL: "postgres://other:secret@127.0.0.1:5432/other",
      })
    ).toEqual(O.some("postgres://test:secret@127.0.0.1:5432/test"));

    expect(
      sqlIntegrationConnectionUriFromEnvForTesting({
        DATABASE_URL: "postgres://test:secret@127.0.0.1:5432/test",
      })
    ).toEqual(O.some("postgres://test:secret@127.0.0.1:5432/test"));

    expect(
      sqlIntegrationConnectionUriFromEnvForTesting({
        DATABASE_URL: "op://beep-dev-secrets/DATABASE_URL",
      })
    ).toEqual(O.none());
  });

  it("forwards shared SQL env vars to the integration child process", async () => {
    await Effect.runPromise(
      withTempRepo(
        runSqlIntegrationTestLaneForTesting({
          acquireResource: Effect.acquireRelease(
            Effect.succeed({
              connectionUri: "postgres://postgres:postgres@127.0.0.1:5432/postgres",
            }),
            () => Effect.void
          ),
          args: [],
          childCommand: {
            command: "bun",
            args: [
              "-e",
              "process.exit(process.env.BEEP_TEST_DATABASE_URL === 'postgres://postgres:postgres@127.0.0.1:5432/postgres' && process.env.BEEP_TEST_DATABASE_DRIVER === 'pg-external' ? 0 : 42)",
            ],
          },
          repoRoot: process.cwd(),
        })
      )
    );
  });

  it("fails nonzero integration children and releases the shared SQL resource", async () => {
    await Effect.runPromise(
      withTempRepo(
        Effect.gen(function* () {
          let released = false;
          const exit = yield* Effect.exit(
            runSqlIntegrationTestLaneForTesting({
              acquireResource: Effect.acquireRelease(
                Effect.succeed({
                  connectionUri: "postgres://postgres:postgres@127.0.0.1:5432/postgres",
                }),
                () =>
                  Effect.sync(() => {
                    released = true;
                  })
              ),
              args: [],
              childCommand: {
                command: "bun",
                args: ["-e", "process.exit(7)"],
              },
              repoRoot: process.cwd(),
            })
          );

          expect(released).toBe(true);
          expect(Exit.isFailure(exit)).toBe(true);
          if (Exit.isFailure(exit)) {
            const failure = Cause.squash(exit.cause);
            expect(failure).toBeInstanceOf(QualityTaskFailed);
            if (isQualityTaskFailed(failure)) {
              expect(failure.exitCode).toBe(7);
            }
          }
        })
      )
    );
  });

  it("leaves lint policy subcommands on the existing command tree", () => {
    expect(O.isNone(parseQualityTaskInvocation(["lint", "circular"]))).toBe(true);
    expect(O.isNone(parseQualityTaskInvocation(["lint", "package-test-imports"]))).toBe(true);
    expect(O.isNone(parseQualityTaskInvocation(["lint", "schema-first"]))).toBe(true);
  });

  it("delegates affected root lint to the aggregate repo lint lane and repo-wide policy checks", () => {
    const steps = rootQualityStepsForTesting("/repo", getInvocation(["lint", "--affected", "--summarize"]));

    expect(steps).toHaveLength(16);
    expect(steps[0]?.args).toEqual(expectedTurboArgs("lint", ["--affected", "--summarize"]));
    expect(steps.slice(1).map((step) => step.label)).toEqual([
      "lint:effect-imports",
      "lint:terse-effect",
      "lint:native-runtime",
      "lint:dual-arity",
      "lint:allowlist",
      "lint:package-test-imports",
      "lint:schema-first",
      "lint:jsdoc",
      "lint:jsdoc-module-tags",
      "lint:docgen",
      "lint:spell",
      "lint:markdown",
      "lint:circular",
      "lint:tooling-tagged-errors",
      "lint:typos",
    ]);
  });

  it("skips repo-wide lint policy checks only for explicit package filters", () => {
    const steps = rootQualityStepsForTesting("/repo", getInvocation(["lint", "--filter=@beep/schema"]));

    expect(steps).toHaveLength(1);
    expect(steps[0]?.args).toEqual(expectedTurboArgs("lint", ["--filter=@beep/schema"]));
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
