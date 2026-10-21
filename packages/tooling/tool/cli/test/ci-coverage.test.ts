import {
  CiCommandError,
  CiLanePartitionProof,
  CiLanePartitionShard,
  CiLaneRunOptions,
} from "@beep/repo-cli/commands/Ci";
import {
  ciCoveragePlan,
  runCiCoverageComparison,
  runCiCoveragePartition,
  runCiLabsCoverage,
} from "@beep/repo-cli/commands/Ci/CiCoverage";
import * as Tasks from "@beep/repo-cli/commands/Quality/Tasks";
import { CiCoverageArtifactPlan, QualityTaskStep } from "@beep/repo-cli/commands/Quality/Tasks";
import { StepExec } from "@beep/repo-cli/test/PackageScripts";
import {
  CoverageArtifacts,
  CoverageProducerIdentity,
  CoverageScopeOwner,
  QualityTaskConfigurationError,
  workspaceCoverageScopeOwners,
} from "@beep/repo-cli/test/Quality";
import { FsUtilsLive } from "@beep/repo-utils";
import * as NodeServices from "@effect/platform-node/NodeServices";
import { afterEach, beforeEach, expect, it } from "@effect/vitest";
import { assertDefined } from "@effect/vitest/utils";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as Path from "effect/Path";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { vi } from "vitest";
import { parseCLI } from "vitest/node";

const nativeRunCaptured = StepExec.runCaptured;

const mocks = vi.hoisted(() => ({
  plan: vi.fn(),
  run: vi.fn(),
  discover: vi.fn(),
  write: vi.fn(),
  compare: vi.fn<typeof CoverageArtifacts.compareCoverageProducerArtifacts>(),
}));

const encode = S.encodeEffect(S.fromJsonString(S.Unknown));
const layer = Layer.mergeAll(NodeServices.layer, FsUtilsLive.pipe(Layer.provide(NodeServices.layer)));
const identity = CoverageProducerIdentity.make({
  executionSha: "a".repeat(40),
  baseSha: "b".repeat(40),
  runId: "123",
  runAttempt: 1,
  scopeDigest: "c".repeat(64),
});
const owner = (packageName = "@beep/repo-cli", packagePath = "packages/tool") =>
  CoverageScopeOwner.make({ packageName, packagePath, hasCoverage: true });
const plan = (owners: ReadonlyArray<CoverageScopeOwner>) =>
  CiCoverageArtifactPlan.make({ identity, owners, scoped: true });
const options = (values: Partial<CiLaneRunOptions> = {}) =>
  CiLaneRunOptions.make({
    affected: true,
    base: "base-ref",
    head: "HEAD",
    summarize: true,
    mode: "auto",
    to: "HEAD",
    last: false,
    changesetStatus: false,
    validateEnvelopes: false,
    ...values,
  });

afterEach(vi.unstubAllEnvs);

beforeEach(() => {
  vi.restoreAllMocks();
  vi.spyOn(Tasks, "resolveCiCoverageArtifactPlan").mockImplementation(mocks.plan);
  vi.spyOn(Tasks, "runQualityTaskStreamingStepGroup").mockImplementation(mocks.run);
  vi.spyOn(StepExec, "runCaptured").mockImplementation(mocks.discover);
  vi.spyOn(CoverageArtifacts, "writeCoverageProducerArtifact").mockImplementation(mocks.write);
  vi.spyOn(CoverageArtifacts, "compareCoverageProducerArtifacts").mockImplementation(mocks.compare);
  for (const mock of [mocks.plan, mocks.run, mocks.discover, mocks.write, mocks.compare]) mock.mockReset();
  mocks.run.mockReturnValue(Effect.void);
  mocks.write.mockReturnValue(Effect.void);
  mocks.compare.mockReturnValue(Effect.void);
});

it.layer(layer, { timeout: "10 seconds" })("CI coverage artifact orchestration", (it) => {
  const fixture = Effect.fnUntraced(function* (
    entries: ReadonlyArray<CoverageScopeOwner> = [owner()],
    script = "bunx --bun vitest run --passWithNoTests --exclude=test/integration/**",
    hasTest = true
  ) {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const root = yield* fs.makeTempDirectoryScoped({ prefix: "beep-ci-coverage-" });
    yield* fs.writeFileString(
      path.join(root, "package.json"),
      yield* encode({ name: "fixture", private: true, workspaces: A.map(entries, (entry) => entry.packagePath) })
    );
    for (const entry of entries) {
      const directory = path.join(root, entry.packagePath);
      yield* fs.makeDirectory(path.join(directory, "coverage"), { recursive: true });
      yield* fs.writeFileString(path.join(directory, "coverage/stale"), "old");
      yield* fs.writeFileString(
        path.join(directory, "package.json"),
        yield* encode({
          name: entry.packageName,
          version: "0.0.0",
          scripts: {
            coverage: `${Str.replaceAll("--bun ", "")(script)} --coverage`,
            "beep:test": script,
            "test:lambda": "bun --version",
            ...(hasTest === true ? { test: "bun run beep:test" } : {}),
          },
        })
      );
    }
    mocks.discover.mockImplementation(({ cwd, command }: { readonly cwd: string; readonly command: string }) =>
      command !== "bunx"
        ? Effect.succeed({ output: command === "bun" ? "1.4.3" : "22.22.3", exitCode: 0, truncated: false })
        : encode([
            { file: path.join(cwd, "test/b.test.ts") },
            { file: path.join(cwd, "test/a.test.ts") },
            { file: path.join(cwd, "test/a.test.ts") },
          ]).pipe(Effect.map((output) => ({ output, exitCode: 0, truncated: false })))
    );
    mocks.plan.mockReturnValue(Effect.succeed(plan(entries)));
    return { fs, path, root };
  });

  it.effect("seals a fresh instrumented shard with the complete configured census", () =>
    Effect.gen(function* () {
      const { root, fs, path } = yield* fixture();
      vi.stubEnv("VITEST_COVERAGE_RATCHET", "1");
      const selected = plan([owner()]);
      const proof = CiLanePartitionProof.make({
        laneId: "test-unit",
        partition: "repo-cli-1",
        selectedTaskCount: 1,
        partitionTaskCount: 1,
        packages: ["@beep/repo-cli"],
        shard: CiLanePartitionShard.make({ index: 1, total: 2 }),
      });
      const step = QualityTaskStep.make({
        label: "unit",
        command: "bunx",
        args: ["turbo"],
        cwd: root,
        env: { CUSTOM: "kept" },
      });
      yield* runCiCoveragePartition(root, options(), selected, proof, step);
      expect(yield* fs.exists(path.join(root, "packages/tool/coverage/stale"))).toBe(false);
      expect(mocks.discover).toHaveBeenCalledWith(
        expect.objectContaining({
          args: [
            "--bun",
            "vitest",
            "list",
            "--filesOnly",
            "--passWithNoTests",
            "--exclude=test/integration/**",
            "--json",
          ],
        })
      );
      expect(mocks.run).toHaveBeenCalledTimes(2);
      expect(mocks.run).toHaveBeenNthCalledWith(1, "ci:coverage:compound-prerequisites", expect.any(Array));
      expect(mocks.run).toHaveBeenNthCalledWith(2, "ci:test:@beep/repo-cli:0", [
        expect.objectContaining({
          args: expect.arrayContaining(["vitest", "run", "--coverage.provider=v8", "--shard=1/2"]),
          env: expect.objectContaining({ CUSTOM: "kept", VITEST_COVERAGE_RATCHET: undefined }),
        }),
      ]);
      expect(mocks.run).toHaveBeenNthCalledWith(2, "ci:test:@beep/repo-cli:0", [
        expect.objectContaining({ args: expect.not.arrayContaining(["--bun", "--coverage.provider=istanbul"]) }),
      ]);
      expect(mocks.write).toHaveBeenCalledWith(
        root,
        expect.objectContaining({
          partitionId: "repo-cli-1",
          identity,
          packages: [
            expect.objectContaining({
              expectedTestFiles: ["packages/tool/test/a.test.ts", "packages/tool/test/b.test.ts"],
              testRuntime: "node",
              provider: "v8",
              testReportPath: "coverage/unit-results.json",
              shard: { index: 1, total: 2 },
            }),
          ],
        })
      );
      expect(mocks.compare).not.toHaveBeenCalled();
    })
  );

  it.effect("emits an explicit empty partition without executing tests", () =>
    Effect.gen(function* () {
      const { root } = yield* fixture([]);
      const proof = CiLanePartitionProof.make({
        laneId: "test-unit",
        partition: "unit-a",
        selectedTaskCount: 0,
        partitionTaskCount: 0,
        packages: [],
      });
      yield* runCiCoveragePartition(root, options(), plan([]), proof, undefined);
      expect(mocks.run).not.toHaveBeenCalled();
      expect(mocks.write).toHaveBeenCalledWith(
        root,
        expect.objectContaining({ artifactRoot: ".beep/ci-coverage", packages: [] })
      );
    })
  );

  it.effect("compares all four unit partitions and selected Labs without running a producer", () =>
    Effect.gen(function* () {
      const entries = [owner(), owner("@beep/ciops", "apps/labs/ciops")];
      const { root } = yield* fixture(entries);
      yield* runCiCoverageComparison(root, options());
      const input = mocks.compare.mock.calls[0]?.[1];
      assertDefined(input);
      expect(input).toMatchObject({ artifactRoot: ".beep/ci-coverage-inputs", identity, scoped: true });
      expect(A.map(input.expectedPartitions, (partition) => partition.partitionId)).toEqual([
        "repo-cli-1",
        "repo-cli-2",
        "unit-a",
        "unit-b",
        "labs",
      ]);
      const firstHalf = input.expectedPartitions[0]?.packages[0];
      const secondHalf = input.expectedPartitions[1]?.packages[0];
      const lab = input.expectedPartitions[4]?.packages[0];
      assertDefined(firstHalf);
      assertDefined(secondHalf);
      assertDefined(lab);
      expect(firstHalf.shard).toEqual({ index: 1, total: 2 });
      expect(secondHalf.shard).toEqual({ index: 2, total: 2 });
      expect(lab.packageName).toBe("@beep/ciops");
      expect(mocks.run).not.toHaveBeenCalled();
      expect(mocks.write).not.toHaveBeenCalled();
    })
  );

  it.effect("runs Labs checks separately and instruments only selected Labs tests", () =>
    Effect.gen(function* () {
      const entries = [owner(), owner("@beep/ciops", "apps/labs/ciops")];
      const { root } = yield* fixture(entries);
      const check = QualityTaskStep.make({ label: "checks", command: "bunx", args: ["check", "lint"], cwd: root });
      yield* runCiLabsCoverage(root, options(), [check]);
      expect(mocks.run).toHaveBeenNthCalledWith(1, "ci:labs:checks", [check]);
      expect(mocks.run).toHaveBeenNthCalledWith(2, "ci:labs:test", [
        expect.objectContaining({
          args: expect.arrayContaining(["@beep/ciops#test", "--only", "--force", "--coverage"]),
        }),
      ]);
      expect(mocks.write).toHaveBeenCalledWith(
        root,
        expect.objectContaining({
          partitionId: "labs",
          packages: [expect.objectContaining({ packageName: "@beep/ciops" })],
        })
      );
    })
  );

  it.effect("skips Labs checks when separately gated and still emits the empty Labs receipt", () =>
    Effect.gen(function* () {
      const { root } = yield* fixture([]);
      yield* runCiLabsCoverage(root, options({ coverageOnly: true }), []);
      expect(mocks.run).not.toHaveBeenCalled();
      expect(mocks.write).toHaveBeenCalledWith(root, expect.objectContaining({ partitionId: "labs", packages: [] }));
      yield* ciCoveragePlan(root, options({ affected: false }));
      expect(mocks.plan).toHaveBeenLastCalledWith(root, [], "base-ref");
    })
  );

  it.effect("rejects a filter that could bypass the authoritative owner plan", () =>
    Effect.gen(function* () {
      const { root } = yield* fixture([]);
      const error = yield* Effect.flip(ciCoveragePlan(root, options({ filter: "@beep/repo-cli" })));
      expect(error.message).toContain("--filter is not supported");
      expect(mocks.plan).not.toHaveBeenCalled();
    })
  );

  it.effect("refuses owners without a unit test task instead of dropping them from comparison", () =>
    Effect.gen(function* () {
      const { root } = yield* fixture([owner()], undefined, false);
      const error = yield* Effect.flip(runCiCoverageComparison(root, options()));
      expect(error.message).toContain("Coverage owners have no unit test task");
      expect(mocks.compare).not.toHaveBeenCalled();
    })
  );

  for (const [name, result] of [
    ["failed", { output: "[]", exitCode: 1, truncated: false }],
    ["truncated", { output: "[]", exitCode: 0, truncated: true }],
    ["invalid", { output: "not-json", exitCode: 0, truncated: false }],
  ] as const) {
    it.effect(`refuses ${name} discovery before test execution or artifact sealing`, () =>
      Effect.gen(function* () {
        const { root } = yield* fixture();
        mocks.discover.mockReturnValue(Effect.succeed(result));
        const error = yield* Effect.flip(runCiCoverageComparison(root, options()));
        expect(error._tag).toBe("CiCommandError");
        expect(mocks.run).not.toHaveBeenCalled();
        expect(mocks.write).not.toHaveBeenCalled();
        expect(mocks.compare).not.toHaveBeenCalled();
      })
    );
  }

  it.effect("surfaces a typed seal diagnostic and preserves its original cause without rendering its stack", () =>
    Effect.gen(function* () {
      const { root } = yield* fixture([]);
      const original = QualityTaskConfigurationError.new(
        "Coverage artifact: missing executable source packages/tool/src/value.ts."
      );
      original.stack = "DO_NOT_RENDER_SEAL_STACK";
      mocks.write.mockReturnValue(Effect.fail(original));
      const proof = CiLanePartitionProof.make({
        laneId: "test-unit",
        partition: "unit-a",
        selectedTaskCount: 0,
        partitionTaskCount: 0,
        packages: [],
      });
      const error = yield* runCiCoveragePartition(root, options(), plan([]), proof, undefined).pipe(Effect.flip);
      expect(error.message).toBe(
        "Failed to seal coverage partition unit-a.: Coverage artifact: missing executable source packages/tool/src/value.ts."
      );
      expect(error.cause).toBe(original);
      expect(error.message).not.toContain("DO_NOT_RENDER_SEAL_STACK");
      expect(mocks.write).toHaveBeenCalledOnce();
      expect(mocks.run).not.toHaveBeenCalled();
    })
  );

  it.effect("retains opaque seal failures without dumping arbitrary diagnostic or environment fields", () =>
    Effect.gen(function* () {
      const { root } = yield* fixture([]);
      const original = { message: "opaque diagnostic", environment: { fixture: "DO_NOT_RENDER_ENVIRONMENT" } };
      mocks.write.mockReturnValue(Effect.fail(original));
      const proof = CiLanePartitionProof.make({
        laneId: "test-unit",
        partition: "unit-a",
        selectedTaskCount: 0,
        partitionTaskCount: 0,
        packages: [],
      });
      const error = yield* runCiCoveragePartition(root, options(), plan([]), proof, undefined).pipe(Effect.flip);
      expect(error.message).toBe("Failed to seal coverage partition unit-a.");
      expect(error.cause).toBe(original);
      expect(error.message).not.toContain("opaque diagnostic");
      expect(error.message).not.toContain("DO_NOT_RENDER_ENVIRONMENT");
    })
  );

  it.effect("refuses a missing workspace before running the selected shard", () =>
    Effect.gen(function* () {
      const { root } = yield* fixture([]);
      const proof = CiLanePartitionProof.make({
        laneId: "test-unit",
        partition: "unit-b",
        selectedTaskCount: 1,
        partitionTaskCount: 1,
        packages: ["@beep/repo-cli"],
      });
      const error = yield* Effect.flip(runCiCoveragePartition(root, options(), plan([owner()]), proof, undefined));
      expect(error.message).toContain("not a workspace");
      expect(mocks.write).not.toHaveBeenCalled();
    })
  );

  it.effect("refuses an owner without a canonical test implementation", () =>
    Effect.gen(function* () {
      const { root, fs, path } = yield* fixture();
      yield* fs.writeFileString(
        path.join(root, "packages/tool/package.json"),
        yield* encode({ name: "@beep/repo-cli", version: "0.0.0", scripts: { test: "bun run beep:test" } })
      );
      const error = yield* Effect.flip(runCiCoverageComparison(root, options()));
      expect(error.message).toContain("canonical Vitest");
      expect(mocks.compare).not.toHaveBeenCalled();
    })
  );

  it.effect("refuses a missing CLI coverage script before discovering or comparing evidence", () =>
    Effect.gen(function* () {
      const { root, fs, path } = yield* fixture();
      yield* fs.writeFileString(
        path.join(root, "packages/tool/package.json"),
        yield* encode({
          name: "@beep/repo-cli",
          version: "0.0.0",
          scripts: { test: "bun run beep:test", "beep:test": "bunx --bun vitest run" },
        })
      );
      const error = yield* Effect.flip(runCiCoverageComparison(root, options()));
      expect(error.message).toContain("canonical Vitest test script");
      expect(mocks.discover).not.toHaveBeenCalled();
      expect(mocks.run).not.toHaveBeenCalled();
      expect(mocks.write).not.toHaveBeenCalled();
      expect(mocks.compare).not.toHaveBeenCalled();
    })
  );

  it.effect("refuses an undeclared native continuation before discovering or running tests", () =>
    Effect.gen(function* () {
      const entry = owner("@beep/infra", "infra");
      const { root, fs, path } = yield* fixture([entry]);
      yield* fs.writeFileString(
        path.join(root, "infra/package.json"),
        yield* encode({
          name: entry.packageName,
          version: "0.0.0",
          scripts: { test: "bun run beep:test", "beep:test": "bunx --bun vitest run && bun run test:lambda" },
        })
      );
      const error = yield* Effect.flip(runCiCoverageComparison(root, options()));
      expect(error.message).toBe("Coverage owner @beep/infra has no continuation script test:lambda.");
      expect(mocks.discover).not.toHaveBeenCalled();
      expect(mocks.run).not.toHaveBeenCalled();
      expect(mocks.write).not.toHaveBeenCalled();
      expect(mocks.compare).not.toHaveBeenCalled();
    })
  );

  it.effect("keeps an unsharded selected owner in its ordinary unit partition", () =>
    Effect.gen(function* () {
      const entry = owner("@beep/mcpb-kit", "packages/tool");
      const { root } = yield* fixture([entry]);
      yield* runCiCoverageComparison(root, options({ coverageInput: ".beep/downloaded" }));
      expect(mocks.compare).toHaveBeenCalledWith(
        root,
        expect.objectContaining({
          artifactRoot: ".beep/downloaded",
          expectedPartitions: expect.arrayContaining([
            expect.objectContaining({
              partitionId: "unit-b",
              packages: [expect.objectContaining({ packageName: "@beep/mcpb-kit" })],
            }),
          ]),
        })
      );
    })
  );

  it.effect("preserves an infrastructure script continuation once after instrumented Vitest", () =>
    Effect.gen(function* () {
      const entry = owner("@beep/infra", "infra");
      const { root, fs, path } = yield* fixture(
        [entry],
        "bunx --bun vitest run --passWithNoTests && bun run test:lambda"
      );
      const manifestPath = path.join(root, "infra/package.json");
      yield* fs.writeFileString(
        manifestPath,
        yield* encode({
          name: entry.packageName,
          scripts: {
            coverage: "bun run beep:coverage",
            test: "bun run beep:test",
            "beep:test": "bunx --bun vitest run --passWithNoTests && bun run test:lambda",
            "test:lambda": `bun -e 'require("node:fs").appendFileSync("lambda.log", "called\\n")'`,
          },
        })
      );
      mocks.run.mockImplementation((_label: string, steps: ReadonlyArray<QualityTaskStep>) =>
        Effect.forEach(
          steps,
          (step) =>
            step.command === "bun"
              ? nativeRunCaptured({
                  command: step.command,
                  args: step.args,
                  cwd: step.cwd,
                  env: step.env,
                  extendEnv: true,
                }).pipe(Effect.asVoid)
              : Effect.void,
          { discard: true }
        )
      );
      const proof = CiLanePartitionProof.make({
        laneId: "test-unit",
        partition: "unit-b",
        selectedTaskCount: 1,
        partitionTaskCount: 1,
        packages: [entry.packageName],
      });
      const step = QualityTaskStep.make({
        label: "unit",
        command: "bunx",
        cwd: root,
        args: ["turbo", "run", "@beep/infra#test", "--filter=@beep/infra", "--", "--coverage"],
      });
      yield* runCiCoveragePartition(root, options(), plan([entry]), proof, step);
      expect(yield* fs.readFileString(path.join(root, "infra/lambda.log"))).toBe("called\n");
      expect(mocks.run).toHaveBeenCalledTimes(3);
      expect(mocks.run).toHaveBeenNthCalledWith(2, "ci:test:@beep/infra:0", [
        expect.objectContaining({
          command: "bunx",
          args: expect.arrayContaining(["--bun", "vitest", "run", "--coverage"]),
        }),
      ]);
      expect(mocks.run).toHaveBeenNthCalledWith(3, "ci:test:@beep/infra:0:test:lambda", [
        expect.objectContaining({ command: "bun", args: ["run", "test:lambda"] }),
      ]);
      expect(mocks.write).toHaveBeenCalledWith(
        root,
        expect.objectContaining({ packages: [expect.objectContaining({ continuationScripts: ["test:lambda"] })] })
      );
    })
  );

  it.effect("rejects a failing native script continuation before sealing", () =>
    Effect.gen(function* () {
      const entry = owner("@beep/infra", "infra");
      const { root, fs, path } = yield* fixture([entry], "bunx --bun vitest run && bun run test:lambda");
      yield* fs.writeFileString(
        path.join(root, "infra/package.json"),
        yield* encode({
          name: entry.packageName,
          scripts: {
            coverage: "bun run beep:coverage",
            test: "bun run beep:test",
            "beep:test": "bunx --bun vitest run && bun run test:lambda",
            "test:lambda": "bun -e 'process.exit(7)'",
          },
        })
      );
      mocks.run.mockImplementation((_label: string, steps: ReadonlyArray<QualityTaskStep>) =>
        Effect.forEach(
          steps,
          (step) =>
            step.command === "bun"
              ? nativeRunCaptured({
                  command: step.command,
                  args: step.args,
                  cwd: step.cwd,
                  env: step.env,
                  extendEnv: true,
                }).pipe(
                  Effect.flatMap((result) =>
                    result.exitCode === 0
                      ? Effect.void
                      : Effect.fail(CiCommandError.make({ message: `Continuation exited ${result.exitCode}` }))
                  )
                )
              : Effect.void,
          { discard: true }
        )
      );
      const proof = CiLanePartitionProof.make({
        laneId: "test-unit",
        partition: "unit-b",
        selectedTaskCount: 1,
        partitionTaskCount: 1,
        packages: [entry.packageName],
      });
      const failure = yield* runCiCoveragePartition(root, options(), plan([entry]), proof, undefined).pipe(Effect.flip);
      expect(failure.message).toBe("Continuation exited 7");
      expect(mocks.run).toHaveBeenCalledTimes(3);
      expect(mocks.write).not.toHaveBeenCalled();
    })
  );

  it.effect("does not run a script continuation or seal evidence after Vitest failure", () =>
    Effect.gen(function* () {
      const entry = owner("@beep/infra", "infra");
      const { root } = yield* fixture([entry], "bunx --bun vitest run && bun run test:lambda");
      mocks.run.mockImplementation((label: string) =>
        label === "ci:test:@beep/infra:0" ? Effect.fail(CiCommandError.make({ message: "Vitest failed" })) : Effect.void
      );
      const proof = CiLanePartitionProof.make({
        laneId: "test-unit",
        partition: "unit-b",
        selectedTaskCount: 1,
        partitionTaskCount: 1,
        packages: [entry.packageName],
      });
      const failure = yield* runCiCoveragePartition(root, options(), plan([entry]), proof, undefined).pipe(Effect.flip);
      expect(failure.message).toBe("Vitest failed");
      expect(mocks.run).toHaveBeenCalledTimes(2);
      expect(mocks.write).not.toHaveBeenCalled();
    })
  );

  it.effect(
    "passes canonical CLI coverage arguments through the installed Vitest parser without duplicate booleans",
    () =>
      Effect.gen(function* () {
        const { root } = yield* fixture();
        const proof = CiLanePartitionProof.make({
          laneId: "test-unit",
          partition: "repo-cli-1",
          selectedTaskCount: 1,
          partitionTaskCount: 1,
          packages: ["@beep/repo-cli"],
          shard: CiLanePartitionShard.make({ index: 1, total: 2 }),
        });
        yield* runCiCoveragePartition(root, options(), plan([owner()]), proof, undefined);
        const args = mocks.run.mock.calls[1]?.[1][0]?.args;
        assertDefined(args);
        expect(A.filter(args, (arg) => arg === "--coverage")).toHaveLength(1);
        expect(parseCLI(A.fromIterable(args)).options.coverage?.enabled).toBe(true);
      })
  );

  it.effect("accepts every current workspace coverage owner's canonical script without executing tests", () =>
    Effect.gen(function* () {
      const path = yield* Path.Path;
      const repoRoot = path.resolve(import.meta.dirname, "../../../../..");
      const owners = A.filter(yield* workspaceCoverageScopeOwners(repoRoot), (entry) => entry.hasCoverage);
      mocks.plan.mockReturnValue(Effect.succeed(plan(owners)));
      mocks.discover.mockImplementation(({ command, cwd }: { readonly command: string; readonly cwd: string }) =>
        command === "bunx"
          ? encode([{ file: path.join(cwd, "test/census.test.ts") }]).pipe(
              Effect.map((output) => ({ output, exitCode: 0, truncated: false }))
            )
          : Effect.succeed({ output: command === "bun" ? "1.4.3" : "22.22.3", exitCode: 0, truncated: false })
      );
      yield* runCiCoverageComparison(repoRoot, options());
      expect(owners.length).toBeGreaterThan(100);
      expect(mocks.compare).toHaveBeenCalledOnce();
      expect(mocks.run).not.toHaveBeenCalled();
    })
  );

  it.effect("runs compound commands once after dependency builds with isolated reports and runtime declarations", () =>
    Effect.gen(function* () {
      const entry = owner("@beep/repo-utils", "packages/tool");
      const { root } = yield* fixture(
        [entry],
        "TESTCONTAINERS_RYUK_DISABLED=true bunx --bun vitest run --exclude=test/TsNativeApi.test.ts && bunx vitest run test/TsNativeApi.test.ts"
      );
      const proof = CiLanePartitionProof.make({
        laneId: "test-unit",
        partition: "unit-b",
        selectedTaskCount: 2,
        partitionTaskCount: 2,
        packages: [entry.packageName, "@beep/other"],
        shard: CiLanePartitionShard.make({ index: 1, total: 2 }),
      });
      const step = QualityTaskStep.make({
        label: "unit",
        command: "bunx",
        cwd: root,
        args: [
          "turbo",
          "run",
          `${entry.packageName}#test`,
          "@beep/other#test",
          `--filter=${entry.packageName}`,
          "--filter=@beep/other",
          "--",
          "--coverage",
        ],
      });
      yield* runCiCoveragePartition(root, options(), plan([entry]), proof, step);
      expect(mocks.run).toHaveBeenCalledTimes(4);
      expect(mocks.run).toHaveBeenNthCalledWith(1, "unit", [
        expect.objectContaining({ args: expect.arrayContaining(["@beep/other#test", "--filter=@beep/other"]) }),
      ]);
      expect(mocks.run).toHaveBeenNthCalledWith(1, "unit", [
        expect.objectContaining({
          args: expect.not.arrayContaining([`${entry.packageName}#test`, `--filter=${entry.packageName}`]),
        }),
      ]);
      expect(mocks.run).toHaveBeenNthCalledWith(2, "ci:coverage:compound-prerequisites", [
        expect.objectContaining({
          args: ["turbo", "run", "build", `--filter=${entry.packageName}^...`, "--concurrency=2"],
        }),
      ]);
      expect(mocks.run).toHaveBeenNthCalledWith(3, `ci:test:${entry.packageName}:0`, [
        expect.objectContaining({
          args: expect.arrayContaining([
            "--bun",
            "vitest",
            "run",
            "--exclude=test/TsNativeApi.test.ts",
            "--coverage.reportsDirectory=coverage/invocation-0",
            "--outputFile=coverage/invocation-0/unit-results.json",
          ]),
          env: expect.objectContaining({
            TESTCONTAINERS_RYUK_DISABLED: "true",
            BEEP_COVERAGE_INVOCATION_ID: "0",
            BEEP_COVERAGE_RUNTIME_RECEIPT: "coverage/invocation-0/runtime.json",
          }),
        }),
      ]);
      expect(mocks.run).toHaveBeenNthCalledWith(4, `ci:test:${entry.packageName}:1`, [
        expect.objectContaining({
          args: expect.arrayContaining([
            "vitest",
            "run",
            "test/TsNativeApi.test.ts",
            "--coverage.reportsDirectory=coverage/invocation-1",
            "--outputFile=coverage/invocation-1/unit-results.json",
          ]),
          env: expect.objectContaining({
            BEEP_COVERAGE_INVOCATION_ID: "1",
            BEEP_COVERAGE_RUNTIME_RECEIPT: "coverage/invocation-1/runtime.json",
          }),
        }),
      ]);
      expect(mocks.run).toHaveBeenNthCalledWith(4, `ci:test:${entry.packageName}:1`, [
        expect.objectContaining({ args: expect.not.arrayContaining(["--bun", "&&"]) }),
      ]);
      expect(mocks.write).toHaveBeenCalledWith(
        root,
        expect.objectContaining({
          packages: [
            expect.objectContaining({
              invocationId: "0",
              testRuntime: "bun",
              testRuntimeVersion: "1.4.3",
              testEnvironment: { TESTCONTAINERS_RYUK_DISABLED: "true" },
            }),
            expect.objectContaining({
              invocationId: "1",
              testRuntime: "node",
              testRuntimeVersion: "22.22.3",
              testEnvironment: {},
            }),
          ],
        })
      );
    })
  );
  it.effect("stops a compound chain after failure and never seals partial coverage", () =>
    Effect.gen(function* () {
      const entry = owner("@beep/repo-utils", "packages/tool");
      const { root } = yield* fixture(
        [entry],
        "bunx --bun vitest run --exclude=test/TsNativeApi.test.ts && bunx vitest run test/TsNativeApi.test.ts"
      );
      mocks.run.mockImplementation((label: string) =>
        label === `ci:test:${entry.packageName}:0`
          ? Effect.fail(CiCommandError.make({ message: "first invocation failed" }))
          : Effect.void
      );
      const proof = CiLanePartitionProof.make({
        laneId: "test-unit",
        partition: "unit-b",
        selectedTaskCount: 1,
        partitionTaskCount: 1,
        packages: [entry.packageName],
      });
      const step = QualityTaskStep.make({
        label: "unit",
        command: "bunx",
        cwd: root,
        args: ["turbo", "run", `${entry.packageName}#test`],
      });
      const failure = yield* runCiCoveragePartition(root, options(), plan([entry]), proof, step).pipe(Effect.flip);
      expect(failure.message).toBe("first invocation failed");
      expect(mocks.run).toHaveBeenCalledTimes(2);
      expect(mocks.write).not.toHaveBeenCalled();
    })
  );

  it.effect("keeps optional JSON output switch last so a positional test filter cannot become an output path", () =>
    Effect.gen(function* () {
      const { root } = yield* fixture(
        [owner("@beep/mcpb-kit", "packages/tool")],
        "bunx vitest run test/TsNativeApi.test.ts"
      );
      yield* runCiCoverageComparison(root, options());
      expect(mocks.discover).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ args: ["vitest", "list", "--filesOnly", "test/TsNativeApi.test.ts", "--json"] })
      );
      expect(mocks.run).not.toHaveBeenCalled();
    })
  );

  for (const scenario of [
    {
      name: "Bun coverage instead of canonical Node",
      unit: "bunx --bun vitest run",
      coverage: "bunx --bun vitest run --coverage",
    },
    {
      name: "different test arguments",
      unit: "bunx --bun vitest run --exclude=test/a.test.ts",
      coverage: "bunx vitest run --coverage",
    },
    {
      name: "different package environment",
      unit: "MODE=a bunx --bun vitest run",
      coverage: "MODE=b bunx vitest run --coverage",
    },
    {
      name: "multiple coverage commands",
      unit: "bunx --bun vitest run",
      coverage: "bunx vitest run --coverage && bunx vitest run --coverage",
    },
    {
      name: "multiple canonical unit commands",
      unit: "bunx --bun vitest run && bunx --bun vitest run",
      coverage: "bunx vitest run --coverage",
    },
  ])
    it.effect(`refuses CLI provider migration with ${scenario.name}`, () =>
      Effect.gen(function* () {
        const { root, fs, path } = yield* fixture();
        yield* fs.writeFileString(
          path.join(root, "packages/tool/package.json"),
          yield* encode({
            name: "@beep/repo-cli",
            version: "0.0.0",
            scripts: { test: "bun run beep:test", "beep:test": scenario.unit, coverage: scenario.coverage },
          })
        );
        const failure = yield* runCiCoverageComparison(root, options()).pipe(Effect.flip);
        expect(failure.message).toContain("CLI coverage must preserve");
        expect(mocks.discover).not.toHaveBeenCalled();
        expect(mocks.compare).not.toHaveBeenCalled();
      })
    );
  it.effect("refuses runtime-dependent CLI test census differences even with equivalent literal arguments", () =>
    Effect.gen(function* () {
      const { root, path } = yield* fixture();
      mocks.discover.mockImplementationOnce(() =>
        encode([{ file: path.join(root, "packages/tool/test/bun-only.test.ts") }]).pipe(
          Effect.map((output) => ({ output, exitCode: 0, truncated: false }))
        )
      );
      const failure = yield* runCiCoverageComparison(root, options()).pipe(Effect.flip);
      expect(failure.message).toContain("CLI coverage test census differs");
      expect(mocks.run).not.toHaveBeenCalled();
      expect(mocks.compare).not.toHaveBeenCalled();
    })
  );

  const scriptVariants = [
    { name: "identity Node", script: "bunx vitest run", runtimes: [false], env: {} },
    { name: "app Bun", script: "bunx --bun vitest run", runtimes: [true], env: {} },
    { name: "library Bun", script: "bunx --bun vitest run --passWithNoTests", runtimes: [true], env: {} },
    {
      name: "excluded integration",
      script: "bunx --bun vitest run --exclude=test/integration/**",
      runtimes: [true],
      env: {},
    },
    {
      name: "default library",
      script: "bunx --bun vitest run --passWithNoTests --exclude=test/integration/**",
      runtimes: [true],
      env: {},
    },
    {
      name: "drizzle and postgres environment",
      script: "TESTCONTAINERS_RYUK_DISABLED=true bunx --bun vitest run --passWithNoTests --exclude=test/integration/**",
      runtimes: [true],
      env: { TESTCONTAINERS_RYUK_DISABLED: "true" },
    },
    {
      name: "multiple literal assignments",
      script: "FIRST=one SECOND=two bunx --bun vitest run",
      runtimes: [true],
      env: { FIRST: "one", SECOND: "two" },
    },
    {
      name: "repo-utils split runtime",
      script: "bunx --bun vitest run --exclude=test/TsNativeApi.test.ts && bunx vitest run test/TsNativeApi.test.ts",
      runtimes: [true, false],
      env: {},
    },
    {
      name: "effect-drizzle split runtime",
      script:
        "bunx --bun vitest run --passWithNoTests --exclude=test/integration/** --exclude=test/import-boundary.test.ts && bunx vitest run test/import-boundary.test.ts",
      runtimes: [true, false],
      env: {},
    },
  ];
  for (const variant of scriptVariants) {
    it.effect(`discovers ${variant.name} without changing runtime or evaluating a shell`, () =>
      Effect.gen(function* () {
        const { root } = yield* fixture([owner("@beep/mcpb-kit", "packages/tool")], variant.script);
        yield* runCiCoverageComparison(root, options());
        expect(mocks.discover).toHaveBeenCalledTimes(variant.runtimes.length * 2);
        for (const { index, bun } of A.map(variant.runtimes, (bun, index) => ({ bun, index }))) {
          expect(mocks.discover).toHaveBeenNthCalledWith(
            index * 2 + 1,
            expect.objectContaining({
              command: "bunx",
              args: expect.arrayContaining(
                bun ? ["--bun", "vitest", "list", "--filesOnly", "--json"] : ["vitest", "list", "--filesOnly", "--json"]
              ),
              env: expect.objectContaining(variant.env),
              extendEnv: true,
            })
          );
          expect(mocks.discover).toHaveBeenNthCalledWith(
            index * 2 + 1,
            expect.objectContaining({
              args: expect.not.arrayContaining(["run", "&&"]),
            })
          );
          if (bun === false)
            expect(mocks.discover).toHaveBeenNthCalledWith(
              index * 2 + 1,
              expect.objectContaining({
                args: expect.not.arrayContaining(["--bun"]),
              })
            );
        }
        expect(mocks.run).not.toHaveBeenCalled();
      })
    );
  }
  for (const invalidVersion of [
    { output: "", exitCode: 0, truncated: false },
    { output: "1.4.3", exitCode: 1, truncated: false },
    { output: "1.4.3", exitCode: 0, truncated: true },
  ]) {
    it.effect(`refuses invalid runtime provenance ${JSON.stringify(invalidVersion)}`, () =>
      Effect.gen(function* () {
        const { root } = yield* fixture();
        mocks.discover.mockImplementation(({ command }: { readonly command: string }) =>
          Effect.succeed(command === "bunx" ? { output: "[]", exitCode: 0, truncated: false } : invalidVersion)
        );
        const failure = yield* runCiCoverageComparison(root, options()).pipe(Effect.flip);
        expect(failure.message).toContain("Invalid test runtime version");
        expect(mocks.compare).not.toHaveBeenCalled();
        expect(mocks.run).not.toHaveBeenCalled();
      })
    );
  }

  for (const script of [
    "bunx vitest run; echo unsafe",
    "TOKEN=$(echo unsafe) bunx vitest run",
    "bunx vitest run | other",
    "bunx vitest run && custom-test-command",
    "bunx vitest run && bun run --help",
    "bunx vitest run && bun run --",
    "bunx vitest runner",
    "bunx --bun vitest run --flag=$VALUE",
  ]) {
    it.effect(`refuses shell evaluation or noncanonical invocation: ${script}`, () =>
      Effect.gen(function* () {
        const { root } = yield* fixture([owner()], script);
        const failure = yield* runCiCoverageComparison(root, options()).pipe(Effect.flip);
        expect(failure.message).toContain("canonical Vitest test script");
        expect(mocks.discover).not.toHaveBeenCalled();
        expect(mocks.run).not.toHaveBeenCalled();
      })
    );
  }

  it.effect("refuses a noncanonical command rather than guessing its test inventory", () =>
    Effect.gen(function* () {
      const { root } = yield* fixture([owner()], "custom-test-command");
      const error = yield* Effect.flip(runCiCoverageComparison(root, options()));
      expect(error.message).toContain("canonical Vitest test script");
      expect(mocks.discover).not.toHaveBeenCalled();
    })
  );
});
