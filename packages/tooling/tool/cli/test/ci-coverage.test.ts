import { CiLanePartitionProof, CiLanePartitionShard, CiLaneRunOptions } from "@beep/repo-cli/commands/Ci";
import {
  ciCoveragePlan,
  runCiCoverageComparison,
  runCiCoveragePartition,
  runCiLabsCoverage,
} from "@beep/repo-cli/commands/Ci/CiCoverage";
import * as Tasks from "@beep/repo-cli/commands/Quality/Tasks";
import { CiCoverageArtifactPlan, QualityTaskStep } from "@beep/repo-cli/commands/Quality/Tasks";
import { StepExec } from "@beep/repo-cli/test/PackageScripts";
import { CoverageArtifacts, CoverageProducerIdentity, CoverageScopeOwner } from "@beep/repo-cli/test/Quality";
import { FsUtilsLive } from "@beep/repo-utils";
import * as NodeServices from "@effect/platform-node/NodeServices";
import { beforeEach, expect, it } from "@effect/vitest";
import { assertDefined } from "@effect/vitest/utils";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as Path from "effect/Path";
import * as S from "effect/Schema";
import { vi } from "vitest";

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
          scripts: { "beep:test": script, ...(hasTest === true ? { test: "bun run beep:test" } : {}) },
        })
      );
    }
    mocks.discover.mockImplementation(({ cwd }: { readonly cwd: string }) =>
      encode([
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
            "--json",
            "--passWithNoTests",
            "--exclude=test/integration/**",
          ],
        })
      );
      expect(mocks.run).toHaveBeenCalledWith("unit", [
        expect.objectContaining({ env: expect.objectContaining({ CUSTOM: "kept", VITEST_COVERAGE_RATCHET: "1" }) }),
      ]);
      expect(mocks.write).toHaveBeenCalledWith(
        root,
        expect.objectContaining({
          partitionId: "repo-cli-1",
          identity,
          packages: [
            expect.objectContaining({
              expectedTestFiles: ["packages/tool/test/a.test.ts", "packages/tool/test/b.test.ts"],
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
      expect(error.message).toContain("canonical Bun/Vitest");
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

  it.effect("refuses a noncanonical command rather than guessing its test inventory", () =>
    Effect.gen(function* () {
      const { root } = yield* fixture([owner()], "custom-test-command");
      const error = yield* Effect.flip(runCiCoverageComparison(root, options()));
      expect(error.message).toContain("canonical Bun/Vitest test script");
      expect(mocks.discover).not.toHaveBeenCalled();
    })
  );
});
