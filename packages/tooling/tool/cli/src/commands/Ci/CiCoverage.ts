/**
 * Coverage artifacts produced by the hosted unit and Labs test executions.
 *
 * @internal
 * @packageDocumentation
 * @since 0.0.0
 */
import { $RepoCliId } from "@beep/identity/packages";
import { resolveWorkspacePackages } from "@beep/repo-utils";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as HashMap from "effect/HashMap";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as Path from "effect/Path";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { isLabsWorkspaceDir } from "../../internal/cli/Labs/index.ts";
import { runCaptured } from "../../internal/process/StepExec.ts";
import {
  CoverageProducerCompareOptions,
  CoverageProducerPackage,
  CoverageProducerPartition,
  CoverageProducerWriteOptions,
  compareCoverageProducerArtifacts,
  writeCoverageProducerArtifact,
} from "../Quality/internal/CoverageArtifacts.ts";
import {
  coverageProducerEnvironment,
  QualityTaskStep,
  resolveCiCoverageArtifactPlan,
  runQualityTaskStreamingStepGroup,
} from "../Quality/Tasks.ts";
import { CiCommandError } from "./Ci.errors.ts";
import { CI_LANE_PARTITIONS, withCiLaneDefaultPlacements } from "./CiLanePartitions.ts";
import type { CoverageScopeOwner } from "../Quality/internal/CoverageScope.ts";
import type { CiCoverageArtifactPlan } from "../Quality/Tasks.ts";
import type { CiLanePartitionProof, CiLaneRunOptions } from "./CiLane.ts";
import type { CiLanePartitionShard } from "./CiLanePartitions.ts";

const $I = $RepoCliId.create("commands/Ci/CiCoverage");
const VitestTestFile = S.Struct({ file: S.String }).pipe(
  $I.annoteSchema("VitestTestFile", {
    description: "A configured test file discovered by Vitest without executing it.",
  })
);
const decodeTestFiles = S.decodeUnknownEffect(S.fromJsonString(S.Array(VitestTestFile)));
const normalize = Str.replace(/\\/g, "/");

/** Config-aware test discovery, without importing or executing the test bodies. */
const discoverCoveragePackages = Effect.fn("CiCoverage.discoverCoveragePackages")(function* (
  repoRoot: string,
  owners: ReadonlyArray<CoverageScopeOwner>,
  shard?: CiLanePartitionShard
) {
  const path = yield* Path.Path;
  const workspaces = yield* resolveWorkspacePackages(repoRoot).pipe(
    CiCommandError.mapError("Failed to read coverage test owners.")
  );
  return yield* Effect.forEach(
    owners,
    Effect.fnUntraced(function* (owner) {
      const workspace = yield* O.match(HashMap.get(workspaces, owner.packageName), {
        onNone: () => CiCommandError.make({ message: `Coverage owner ${owner.packageName} is not a workspace.` }),
        onSome: Effect.succeed,
      });
      const script = workspace.scripts["beep:test"] ?? "";
      const prefix = "bunx --bun vitest run";
      if (!Str.startsWith(prefix)(script)) {
        return yield* CiCommandError.make({
          message: `Coverage owner ${owner.packageName} must use the canonical Bun/Vitest test script.`,
        });
      }
      // Generated scripts contain plain Vitest flags. Preserve their integration exclusions in discovery.
      const args = [
        "--bun",
        "vitest",
        "list",
        "--filesOnly",
        "--json",
        ...A.filter(Str.split(/\s+/)(Str.trim(Str.slice(prefix.length)(script))), Str.isNonEmpty),
      ];
      const result = yield* runCaptured({
        command: "bunx",
        args,
        cwd: workspace.dir,
        env: coverageProducerEnvironment(),
        extendEnv: true,
        source: "stdout",
        trim: true,
      }).pipe(CiCommandError.mapError(`Failed to discover tests for ${owner.packageName}.`));
      if (result.exitCode !== 0 || result.truncated) {
        return yield* CiCommandError.make({
          message: `Test discovery for ${owner.packageName} failed or exceeded its capture bound.`,
        });
      }
      const files = yield* decodeTestFiles(result.output).pipe(
        CiCommandError.mapError(`Invalid Vitest test inventory for ${owner.packageName}.`)
      );
      return CoverageProducerPackage.make({
        packageName: owner.packageName,
        packagePath: owner.packagePath,
        expectedTestFiles: A.sort(
          A.dedupe(A.map(files, (file) => normalize(path.relative(repoRoot, path.resolve(workspace.dir, file.file))))),
          Order.String
        ),
        testReportPath: "coverage/unit-results.json",
        ...(shard === undefined ? {} : { shard }),
      });
    }),
    { concurrency: 2 }
  );
});

/**
 * Resolve the same authoritative coverage owner selection for producers and the consumer.
 *
 * **Example** (Inspect coverage planning)
 *
 * ```ts
 * import { ciCoveragePlan } from "@beep/repo-cli/commands/Ci/CiCoverage"
 * console.log(typeof ciCoveragePlan) // function
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const ciCoveragePlan = Effect.fn("CiCoverage.plan")(function* (repoRoot: string, options: CiLaneRunOptions) {
  if (options.filter !== undefined) {
    return yield* CiCommandError.make({
      message: "Artifact coverage uses the authoritative affected owner plan; --filter is not supported.",
    });
  }
  return yield* resolveCiCoverageArtifactPlan(repoRoot, options.affected ? ["--affected"] : [], options.base);
});

/**
 * Freshly execute one unit partition and then seal exactly its selected coverage packages.
 *
 * **Example** (Inspect the unit producer)
 *
 * ```ts
 * import { runCiCoveragePartition } from "@beep/repo-cli/commands/Ci/CiCoverage"
 * console.log(typeof runCiCoveragePartition) // function
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const runCiCoveragePartition = Effect.fn("CiCoverage.runPartition")(function* (
  repoRoot: string,
  options: CiLaneRunOptions,
  plan: CiCoverageArtifactPlan,
  proof: CiLanePartitionProof,
  step: QualityTaskStep | undefined
) {
  const packages = yield* discoverCoveragePackages(
    repoRoot,
    A.filter(plan.owners, (owner) => A.contains(proof.packages, owner.packageName)),
    proof.shard
  );
  yield* runAndWrite(repoRoot, options, plan, proof.partition, packages, step);
});

const runAndWrite = Effect.fn("CiCoverage.runAndWrite")(function* (
  repoRoot: string,
  options: CiLaneRunOptions,
  plan: CiCoverageArtifactPlan,
  partitionId: string,
  packages: ReadonlyArray<CoverageProducerPackage>,
  step: QualityTaskStep | undefined
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  for (const entry of packages) {
    yield* fs
      .remove(path.join(repoRoot, entry.packagePath, "coverage"), { recursive: true, force: true })
      .pipe(CiCommandError.mapError(`Failed to clear stale coverage for ${entry.packageName}.`));
  }
  if (step !== undefined) {
    yield* runQualityTaskStreamingStepGroup(step.label, [
      QualityTaskStep.make({ ...step, env: { ...coverageProducerEnvironment(), ...step.env } }),
    ]);
  }
  yield* writeCoverageProducerArtifact(
    repoRoot,
    CoverageProducerWriteOptions.make({
      artifactRoot: options.coverageOutput ?? ".beep/ci-coverage",
      identity: plan.identity,
      partitionId,
      packages,
    })
  ).pipe(CiCommandError.mapError(`Failed to seal coverage partition ${partitionId}.`));
});

/**
 * Labs retain their own test execution and artifact rather than disappearing from the unit split.
 *
 * **Example** (Inspect the Labs producer)
 *
 * ```ts
 * import { runCiLabsCoverage } from "@beep/repo-cli/commands/Ci/CiCoverage"
 * console.log(typeof runCiLabsCoverage) // function
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const runCiLabsCoverage = Effect.fn("CiCoverage.runLabs")(function* (
  repoRoot: string,
  options: CiLaneRunOptions,
  checks: ReadonlyArray<QualityTaskStep>
) {
  const plan = yield* ciCoveragePlan(repoRoot, options);
  const owners = A.filter(plan.owners, (owner) => isLabsWorkspaceDir(owner.packagePath));
  if (!options.coverageOnly) yield* runQualityTaskStreamingStepGroup("ci:labs:checks", checks);
  const packages = yield* discoverCoveragePackages(repoRoot, owners);
  const step = A.isReadonlyArrayEmpty(packages)
    ? undefined
    : QualityTaskStep.make({
        label: "ci:labs:test",
        command: "bunx",
        cwd: repoRoot,
        args: [
          "turbo",
          "run",
          ...A.map(packages, (entry) => `${entry.packageName}#test`),
          "--only",
          "--force",
          "--concurrency=2",
          ...A.map(packages, (entry) => `--filter=${entry.packageName}`),
          ...ciCoverageTestArgs,
        ],
      });
  yield* runAndWrite(repoRoot, options, plan, "labs", packages, step);
});

/**
 * Artifact comparison only: no test producer or fallback can be reached through this route.
 *
 * **Example** (Inspect artifact comparison)
 *
 * ```ts
 * import { runCiCoverageComparison } from "@beep/repo-cli/commands/Ci/CiCoverage"
 * console.log(typeof runCiCoverageComparison) // function
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const runCiCoverageComparison = Effect.fn("CiCoverage.compare")(function* (
  repoRoot: string,
  options: CiLaneRunOptions
) {
  const plan = yield* ciCoveragePlan(repoRoot, options);
  const workspaces = yield* resolveWorkspacePackages(repoRoot).pipe(
    CiCommandError.mapError("Failed to read coverage partition inventory.")
  );
  const path = yield* Path.Path;
  const testOwners = A.filter(
    workspaces.pipe(HashMap.entries, A.fromIterable),
    ([, entry]) =>
      !isLabsWorkspaceDir(normalize(path.relative(repoRoot, entry.dir))) && entry.scripts.test !== undefined
  );
  const partitions = withCiLaneDefaultPlacements(
    A.filter(CI_LANE_PARTITIONS, (entry) => entry.lane === "test-unit"),
    A.map(testOwners, ([name]) => name)
  );
  const executableNames = A.map(testOwners, ([name]) => name);
  const missing = A.filter(
    plan.owners,
    (owner) => !isLabsWorkspaceDir(owner.packagePath) && !A.contains(executableNames, owner.packageName)
  );
  if (A.isReadonlyArrayNonEmpty(missing)) {
    return yield* CiCommandError.make({
      message: `Coverage owners have no unit test task: ${A.join(
        A.map(missing, (owner) => owner.packageName),
        ", "
      )}.`,
    });
  }
  const discovered = yield* discoverCoveragePackages(repoRoot, plan.owners);
  const expectedPartitions = A.map(partitions, (partition) =>
    CoverageProducerPartition.make({
      partitionId: partition.id,
      packages: A.map(
        A.filter(discovered, (entry) => A.contains(partition.packages, entry.packageName)),
        (entry) =>
          CoverageProducerPackage.make({
            ...entry,
            ...(partition.shard === undefined ? {} : { shard: partition.shard }),
          })
      ),
    })
  );
  const labs = A.filter(discovered, (entry) => isLabsWorkspaceDir(entry.packagePath));
  yield* compareCoverageProducerArtifacts(
    repoRoot,
    CoverageProducerCompareOptions.make({
      artifactRoot: options.coverageInput ?? ".beep/ci-coverage-inputs",
      identity: plan.identity,
      scoped: plan.scoped,
      expectedPartitions: A.append(
        expectedPartitions,
        CoverageProducerPartition.make({ partitionId: "labs", packages: labs })
      ),
    })
  ).pipe(CiCommandError.mapError("Coverage producer artifacts are incomplete or failed regression comparison."));
});

/**
 * Vitest instrumentation and test-file receipt share the original unit invocation.
 *
 * **Example** (Inspect instrumentation flags)
 *
 * ```ts
 * import { ciCoverageTestArgs } from "@beep/repo-cli/commands/Ci/CiCoverage"
 * console.log(ciCoverageTestArgs.includes("--coverage")) // true
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const ciCoverageTestArgs: ReadonlyArray<string> = [
  "--",
  "--coverage",
  "--coverage.provider=istanbul",
  "--coverage.reporter=json",
  "--coverage.reporter=json-summary",
  "--reporter=default",
  "--reporter=json",
  "--outputFile=coverage/unit-results.json",
  "--fileParallelism=true",
  "--maxWorkers=1",
];
