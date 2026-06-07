import {
  biomeFixChangedFilesForTesting,
  collectEffectTsgoDiagnosticLines,
  lintFixChangedStepForTesting,
  parseQualityTaskInvocation,
  QualityTaskFailed,
  QualityTaskGroupFailed,
  QualityTaskStep,
  rootQualityStepsForTesting,
  runQualityTask,
  runQualityTaskStepGroupForTesting,
  runSqlIntegrationTestLaneForTesting,
  sqlIntegrationConnectionUriFromEnvForTesting,
  sqlIntegrationStepForTesting,
  workspaceTaskFiltersForTesting,
} from "@beep/repo-cli/test/Quality";
import { provideScopedLayer } from "@beep/test-utils";
import { A, Str } from "@beep/utils";
import { NodeChildProcessSpawner } from "@effect/platform-node";
import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem";
import * as NodePath from "@effect/platform-node/NodePath";
import { Cause, Effect, Exit, FileSystem, Layer, Path } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as TestConsole from "effect/testing/TestConsole";
import { describe, expect, it } from "vitest";
import type { QualityTaskInvocation } from "@beep/repo-cli/test/Quality";

const FileSystemLayer = Layer.mergeAll(NodeFileSystem.layer, NodePath.layer);
const PlatformLayer = Layer.mergeAll(
  FileSystemLayer,
  NodeChildProcessSpawner.layer.pipe(Layer.provideMerge(FileSystemLayer)),
  TestConsole.layer
);
const encodeJson = S.encodeUnknownSync(S.UnknownFromJsonString);
const isQualityTaskFailed = S.is(QualityTaskFailed);
const isQualityTaskGroupFailed = S.is(QualityTaskGroupFailed);
const isString = (value: unknown): value is string => typeof value === "string";

const withTempRepo = <A, E, R>(use: Effect.Effect<A, E, R>) =>
  Effect.acquireUseRelease(
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const tmpDir = yield* fs.makeTempDirectory();
      const previousCwd = process.cwd();

      process.chdir(tmpDir);
      yield* fs.makeDirectory(path.join(tmpDir, ".git"), { recursive: true });

      return { fs, previousCwd, tmpDir } as const;
    }),
    () => use,
    ({ fs, previousCwd, tmpDir }) =>
      Effect.gen(function* () {
        process.chdir(previousCwd);
        yield* fs.remove(tmpDir, { recursive: true });
      })
  ).pipe(provideScopedLayer(PlatformLayer));

const getInvocation = (argv: ReadonlyArray<string>): QualityTaskInvocation => {
  const invocation = parseQualityTaskInvocation(argv);
  if (O.isNone(invocation)) {
    throw new Error(`Expected ${A.join(argv, " ")} to parse as a quality task.`);
  }
  return invocation.value;
};

const withEnvVar = <A>(name: string, value: string | undefined, use: () => A): A => {
  const previousValue = Bun.env[name];
  if (value === undefined) {
    delete Bun.env[name];
  } else {
    Bun.env[name] = value;
  }

  try {
    return use();
  } finally {
    if (previousValue === undefined) {
      delete Bun.env[name];
    } else {
      Bun.env[name] = previousValue;
    }
  }
};

const isTurboCacheControlArg = (arg: string): boolean =>
  arg === "--no-cache" ||
  arg === "--force" ||
  Str.startsWith("--force=")(arg) ||
  arg === "--remote-only" ||
  Str.startsWith("--remote-only=")(arg) ||
  arg === "--remote-cache-read-only" ||
  Str.startsWith("--remote-cache-read-only=")(arg) ||
  Str.startsWith("--cache=")(arg);

const isTurboConcurrencyArg = (arg: string): boolean =>
  arg === "--concurrency" || Str.startsWith("--concurrency=")(arg);

const expectedTurboArgs = (task: string, args: ReadonlyArray<string>): ReadonlyArray<string> => [
  "turbo",
  "run",
  task,
  ...(Bun.env.CI === "true" || A.some(args, isTurboCacheControlArg) ? [] : ["--cache=local:rw"]),
  ...args,
];
const expectedRootTurboArgs = (task: string, args: ReadonlyArray<string>): ReadonlyArray<string> =>
  expectedTurboArgs(
    task,
    Bun.env.CI === "true" || A.some(args, isTurboConcurrencyArg) ? args : ["--concurrency=3", ...args]
  );
const bunScriptStep = (label: string, source: string) =>
  QualityTaskStep.make({
    label,
    command: "bun",
    args: ["-e", source],
    cwd: process.cwd(),
  });

const expectSubstringBefore = (text: string, before: string, after: string): void => {
  const beforeIndex = Str.indexOf(before)(text);
  const afterIndex = Str.indexOf(after)(text);

  expect(O.isSome(beforeIndex)).toBe(true);
  expect(O.isSome(afterIndex)).toBe(true);

  if (O.isSome(beforeIndex) && O.isSome(afterIndex)) {
    expect(beforeIndex.value).toBeLessThan(afterIndex.value);
  }
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

  it("builds package-only audit steps by default and keeps turbo filters", () =>
    withEnvVar("CI", undefined, () => {
      const steps = rootQualityStepsForTesting(
        "/repo",
        getInvocation(["audit", "--filter=@beep/schema", "--summarize"])
      );

      expect(steps).toHaveLength(1);
      expect(steps[0]).toMatchObject({
        label: "audit:packages",
        command: "bunx",
        args: expectedRootTurboArgs("audit", ["--filter=@beep/schema", "--summarize"]),
        cwd: "/repo",
      });
    }));

  it("keeps package audit cacheable by default for local runs", () =>
    withEnvVar("CI", undefined, () => {
      const steps = rootQualityStepsForTesting("/repo", getInvocation(["audit", "--filter=@beep/schema"]));

      expect(steps).toHaveLength(1);
      expect(steps[0]?.args).toEqual(expectedRootTurboArgs("audit", ["--filter=@beep/schema"]));
    }));

  it("forces package audit execution in CI unless cache behavior is explicit", () =>
    withEnvVar("CI", "true", () => {
      const steps = rootQualityStepsForTesting(
        "/repo",
        getInvocation(["audit", "--filter=@beep/schema", "--dry=json"])
      );

      expect(steps).toHaveLength(1);
      expect(steps[0]?.args).toEqual(["turbo", "run", "audit", "--force", "--filter=@beep/schema", "--dry=json"]);
    }));

  it("honors explicit audit cache-control args in CI", () =>
    withEnvVar("CI", "true", () => {
      const steps = rootQualityStepsForTesting(
        "/repo",
        getInvocation(["audit", "--cache=local:rw", "--filter=@beep/schema"])
      );

      expect(steps).toHaveLength(1);
      expect(steps[0]?.args).toEqual(["turbo", "run", "audit", "--cache=local:rw", "--filter=@beep/schema"]);
    }));

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
      ...(Bun.env.CI === "true" ? [] : ["--cache=local:rw", "--concurrency=3"]),
      "--affected",
      "--summarize",
    ]);
    expect(A.slice(steps, 1)).toEqual([
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

  it("collects Effect tsgo warnings from successful package results", () => {
    const diagnostics = collectEffectTsgoDiagnosticLines([
      {
        output: [
          "src/example.test.ts:1:1 - warning TS90001: unsafe effect(service) usage",
          "src/example.test.ts:2:1 - warning TS99999: unrelated diagnostic",
        ].join("\n"),
      },
    ]);

    expect(diagnostics).toEqual(["src/example.test.ts:1:1 - warning TS90001: unsafe effect(service) usage"]);
  });

  it("skips repo-level tsgo diagnostics only for explicit package filters", () => {
    const steps = rootQualityStepsForTesting("/repo", getInvocation(["check", "--filter=@beep/schema"]));

    expect(steps).toHaveLength(1);
    expect(steps[0]?.args).toEqual(expectedRootTurboArgs("check", ["--filter=@beep/schema"]));
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
      args: expectedRootTurboArgs("lint:fix", ["--filter=@beep/schema", "--affected", "--dry=json"]),
    });
  });

  it("strips lint --fix aggregate aliases before delegating to Turbo", () => {
    const steps = rootQualityStepsForTesting("/repo", getInvocation(["lint", "--fix", "--full", "--repo"]));

    expect(steps).toHaveLength(1);
    expect(steps[0]).toMatchObject({
      label: "lint:fix",
      command: "bunx",
      args: expectedRootTurboArgs("lint:fix", []),
    });
  });

  it("preserves explicit lint Turbo concurrency", () => {
    const steps = rootQualityStepsForTesting("/repo", getInvocation(["lint", "--fix", "--full", "--concurrency=1"]));

    expect(steps[0]?.args).toEqual(expectedTurboArgs("lint:fix", ["--concurrency=1"]));
  });

  it("applies Biome lint fixes in the changed-file lint fix fast path", () => {
    const step = lintFixChangedStepForTesting("/repo", ["packages/example/src/index.ts"]);

    expect(step).toMatchObject({
      label: "lint:fix:changed",
      command: "./node_modules/.bin/biome",
      args: ["check", "--write", "--files-ignore-unknown=true", "packages/example/src/index.ts"],
      cwd: "/repo",
    });
  });

  it("drops non-Biome files from the changed-file lint fix fast path", () => {
    expect(
      biomeFixChangedFilesForTesting([
        ".claude/skills/yeet/SKILL.md",
        "AGENTS.md",
        "CLAUDE.md",
        "package.json",
        "packages/example/src/index.ts",
        "packages/example/src/worker.mts",
        "packages/tooling/tool/cli/README.md",
      ])
    ).toEqual(["package.json", "packages/example/src/index.ts", "packages/example/src/worker.mts"]);
  });

  it("runs combined root coverage tasks in report-only mode", () => {
    const passthroughTasks = ["build", "check", "test", "coverage", "audit", "lint", "docgen"] as const;
    const steps = rootQualityStepsForTesting("/repo", getInvocation(["lint", "--fix", ...passthroughTasks]));

    expect(steps[0]).toMatchObject({
      label: "lint:fix",
      command: "bunx",
      args: expectedRootTurboArgs("lint:fix", passthroughTasks),
      env: {
        VITEST_COVERAGE_REPORT_ONLY: "1",
      },
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
      args: expectedRootTurboArgs("test", ["--filter=@beep/schema", "--summarize"]),
    });
    expect(steps[1]).toMatchObject({
      label: "test:types",
      command: "bunx",
      args: expectedRootTurboArgs("type-test", ["--filter=@beep/schema", "--summarize"]),
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

  it("requires explicit test SQL URLs over generic application defaults", () => {
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
    ).toEqual(O.none());

    expect(
      sqlIntegrationConnectionUriFromEnvForTesting({
        BEEP_TEST_DATABASE_URL: "op://beep-dev-secrets/DATABASE_URL",
        DATABASE_URL: "postgres://test:secret@127.0.0.1:5432/test",
        DATABASE_URL_UNPOOLED: "postgres://test:secret@127.0.0.1:5432/test",
      })
    ).toEqual(O.none());
  });

  it("forwards shared SQL env vars to the integration child process", () =>
    Effect.runPromise(
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
              "process.exit(Bun.env.BEEP_TEST_DATABASE_URL === 'postgres://postgres:postgres@127.0.0.1:5432/postgres' && Bun.env.BEEP_TEST_DATABASE_DRIVER === 'pg-external' ? 0 : 42)",
            ],
          },
          repoRoot: process.cwd(),
        })
      )
    ));

  it("fails nonzero integration children and releases the shared SQL resource", () =>
    Effect.runPromise(
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
    ));

  it("runs grouped quality steps with bounded concurrency and deterministic output", () =>
    Effect.runPromise(
      withTempRepo(
        Effect.gen(function* () {
          yield* runQualityTaskStepGroupForTesting(
            "test:group",
            [
              bunScriptStep("test:slow", "await Bun.sleep(20); console.log('slow')"),
              bunScriptStep("test:fast", "console.log('fast')"),
            ],
            2
          );

          const logText = A.join(A.filter(yield* TestConsole.logLines, isString), "\n");
          expect(logText).toContain("[beep-cli] test:group: running 2 step(s) with concurrency 2");
          expect(logText).toContain("[beep-cli] test:slow: bun -e await Bun.sleep(20); console.log('slow')");
          expect(logText).toContain("[beep-cli] test:fast: bun -e console.log('fast')");
          expectSubstringBefore(logText, "[beep-cli] test:slow output:\nslow", "[beep-cli] test:fast output:\nfast");
        })
      )
    ));

  it("truncates retained grouped quality step output", () =>
    Effect.runPromise(
      withTempRepo(
        Effect.gen(function* () {
          yield* runQualityTaskStepGroupForTesting(
            "test:group",
            [
              bunScriptStep(
                "test:large-output",
                "process.stdout.write('x'.repeat(300000)); console.log('tail-marker')"
              ),
            ],
            1
          );

          const logText = A.join(A.filter(yield* TestConsole.logLines, isString), "\n");
          expect(logText).toContain("[beep-cli] output truncated after 262144 characters");
          expect(Str.length(logText)).toBeLessThan(270_000);
        })
      )
    ));

  it("aggregates grouped quality step failures in configured step order", () =>
    Effect.runPromise(
      withTempRepo(
        Effect.gen(function* () {
          const exit = yield* Effect.exit(
            runQualityTaskStepGroupForTesting(
              "test:group",
              [
                bunScriptStep("test:first", "console.log('first failed'); process.exit(7)"),
                bunScriptStep("test:second", "console.log('second failed'); process.exit(3)"),
              ],
              2
            )
          );

          expect(Exit.isFailure(exit)).toBe(true);
          if (Exit.isFailure(exit)) {
            const failure = Cause.squash(exit.cause);
            expect(failure).toBeInstanceOf(QualityTaskGroupFailed);
            if (isQualityTaskGroupFailed(failure)) {
              expect(failure.exitCode).toBe(7);
              expect(A.map(failure.failures, (step) => step.label)).toEqual(["test:first", "test:second"]);
            }
          }

          const logText = A.join(A.filter(yield* TestConsole.logLines, isString), "\n");
          expectSubstringBefore(
            logText,
            "[beep-cli] test:first output:\nfirst failed",
            "[beep-cli] test:second output:\nsecond failed"
          );
        })
      )
    ));

  it("leaves lint policy subcommands on the existing command tree", () => {
    expect(O.isNone(parseQualityTaskInvocation(["lint", "circular"]))).toBe(true);
    expect(O.isNone(parseQualityTaskInvocation(["lint", "deprecated-apis"]))).toBe(true);
    expect(O.isNone(parseQualityTaskInvocation(["lint", "package-test-imports"]))).toBe(true);
    expect(O.isNone(parseQualityTaskInvocation(["lint", "schema-first"]))).toBe(true);
  });

  it("leaves root CLI help and metadata flags on the existing command tree", () => {
    expect(O.isNone(parseQualityTaskInvocation(["lint", "--help"]))).toBe(true);
    expect(O.isNone(parseQualityTaskInvocation(["check", "-h"]))).toBe(true);
    expect(O.isNone(parseQualityTaskInvocation(["build", "--version"]))).toBe(true);
    expect(O.isNone(parseQualityTaskInvocation(["test", "--log-level=debug"]))).toBe(true);
  });

  it("delegates affected root lint only to the affected aggregate repo lint lane", () => {
    const steps = rootQualityStepsForTesting("/repo", getInvocation(["lint", "--affected", "--summarize"]));

    expect(steps).toHaveLength(1);
    expect(steps[0]?.args).toEqual(expectedRootTurboArgs("lint", ["--affected", "--summarize"]));
  });

  it("skips repo-wide lint policy checks for explicit package filters", () => {
    const steps = rootQualityStepsForTesting("/repo", getInvocation(["lint", "--filter=@beep/schema"]));

    expect(steps).toHaveLength(1);
    expect(steps[0]?.args).toEqual(expectedRootTurboArgs("lint", ["--filter=@beep/schema"]));
  });

  it("limits root type and integration test filters to script-owning workspaces", () =>
    Effect.runPromise(
      withTempRepo(
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const tmpDir = process.cwd();
          const plainPackageDir = path.join(tmpDir, "packages", "plain");
          const typePackageDir = path.join(tmpDir, "packages", "typed");
          const integrationPackageDir = path.join(tmpDir, "apps", "integration");

          yield* fs.writeFileString(
            path.join(tmpDir, "package.json"),
            encodeJson({
              name: "@beep/test-root",
              private: true,
              workspaces: {
                packages: ["packages/*", "apps/*"],
              },
            })
          );
          yield* fs.makeDirectory(plainPackageDir, { recursive: true });
          yield* fs.writeFileString(
            path.join(plainPackageDir, "package.json"),
            encodeJson({
              name: "@beep/plain",
              private: true,
              scripts: {
                test: "vitest",
              },
            })
          );
          yield* fs.makeDirectory(typePackageDir, { recursive: true });
          yield* fs.writeFileString(
            path.join(typePackageDir, "package.json"),
            encodeJson({
              name: "@beep/typed",
              private: true,
              scripts: {
                "type-test": "tstyche",
              },
            })
          );
          yield* fs.makeDirectory(integrationPackageDir, { recursive: true });
          yield* fs.writeFileString(
            path.join(integrationPackageDir, "package.json"),
            encodeJson({
              name: "@beep/integration",
              private: true,
              scripts: {
                "test:integration": "vitest run test/integration",
              },
            })
          );

          const typeFilters = yield* workspaceTaskFiltersForTesting(tmpDir, "type-test");
          const integrationFilters = yield* workspaceTaskFiltersForTesting(tmpDir, "test:integration");

          expect(typeFilters).toEqual(["--filter=@beep/typed"]);
          expect(integrationFilters).toEqual(["--filter=@beep/integration"]);
        })
      )
    ));

  it("treats unsupported package tasks as explicit no-ops", () =>
    Effect.runPromise(
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
    ));
});
