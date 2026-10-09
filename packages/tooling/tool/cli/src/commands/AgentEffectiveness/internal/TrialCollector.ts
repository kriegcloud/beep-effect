/**
 * Native evaluator report normalization for protected trial collection.
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { hashPublicTextSha256 } from "@beep/repo-ai-metrics/privacy";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as O from "effect/Option";
import * as Path from "effect/Path";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { repoRunOutputBound, runCaptured, runSpooledStreams } from "../../../internal/process/StepExec.ts";
import { YeetVerdictJson } from "../../Yeet/internal/Verdict.ts";
import { AgentTrialError } from "../AgentEffectiveness.errors.ts";
import {
  TrialAcceptance,
  TrialAcceptanceJson,
  TrialAttemptJson,
  TrialCollectRequestJson,
  TrialPlanJson,
  TrialProof,
  TrialProofJson,
} from "../AgentEffectiveness.trials.schemas.ts";
import { trialArtifact } from "./TrialExecutor.ts";
import {
  hashTrialInput,
  inspectTrialGit,
  trialCheckContractDigest,
  trialGitSandbox,
  validateTrialInventory,
} from "./TrialIsolation.ts";
import { TrialCommittedSource, TrialCommittedSourceJson, TrialEvaluatorCheck } from "./TrialProfile.schemas.ts";
import type { Sha256Hex } from "@beep/schema/Sha256";
import type { TrialPlan } from "../AgentEffectiveness.trials.schemas.ts";
import type { TrialArtifact, TrialMount, TrialRuntimeClosure } from "./TrialProfile.schemas.ts";

/**
 * Locate the single canonical verdict announcement from the native Yeet stream.
 * **Example** (Reject ambiguity)
 * ```ts
 * import { trialYeetVerdictLocation } from "@beep/repo-cli/test/AgentEffectiveness"
 * console.log(trialYeetVerdictLocation("")) // None
 * ```
 * @category parsing
 * @since 0.0.0
 */
export const trialYeetVerdictLocation = (stdout: string): O.Option<string> => {
  const locations = A.flatMap(Str.split("\n")(stdout), (line) => {
    const match = /^\[yeet\] verdict written to (.+)$/.exec(line);
    return match !== null ? [match[1]!] : [];
  });
  const location = locations[0];
  return locations.length === 1 &&
    location !== undefined &&
    /^\/workspace\/\.beep\/yeet\/runs\/[A-Za-z0-9_-]+\/verdict\.json$/.test(location)
    ? O.some(location)
    : O.none();
};

const equal = A.makeEquivalence(Str.Equivalence);
const $I = $RepoCliId.create("commands/AgentEffectiveness/internal/TrialCollector");
const Assertion = S.Struct({ fullName: S.NonEmptyString, status: S.String });
const VitestReport = S.Struct({
  numTotalTests: S.Natural,
  numPassedTests: S.Natural,
  numFailedTests: S.Natural,
  numPendingTests: S.Natural,
  numTodoTests: S.optional(S.Natural),
  success: S.Boolean,
  testResults: S.Array(
    S.Struct({
      status: S.String,
      message: S.optional(S.String),
      assertionResults: S.Array(Assertion),
    })
  ),
  unhandledErrors: S.Unknown.pipe(S.Array, S.optional),
});

/**
 * Counts parsed from an executed native evaluator report.
 * **Example** (Require collection evidence)
 * ```ts
 * import { TrialCollectedOutcome } from "@beep/repo-cli/test/AgentEffectiveness"
 * import * as S from "effect/Schema"
 * console.log(S.is(TrialCollectedOutcome)({})) // false
 * ```
 * @category models
 * @since 0.0.0
 */
export class TrialCollectedOutcome extends S.Class<TrialCollectedOutcome>($I`TrialCollectedOutcome`)(
  {
    id: S.NonEmptyString,
    passed: S.Boolean,
    collected: S.Natural,
    passedCount: S.Natural,
    failedCount: S.Natural,
    collectionFailures: S.Natural,
    classification: S.Literals([
      "passed",
      "semantic-failure",
      "collection-failure",
      "implementation-incomplete",
      "protocol-violation",
    ]),
  },
  $I.annote("TrialCollectedOutcome", {
    description: "Observed reporter counts, separate from exit status and source provenance.",
  })
) {}

const outcome = (
  id: string,
  collected: number,
  passedCount: number,
  failedCount: number,
  collectionFailures: number,
  incomplete = false
) =>
  TrialCollectedOutcome.make({
    id,
    collected,
    passedCount,
    failedCount,
    collectionFailures,
    passed: collected > 0 && passedCount === collected && failedCount === 0 && collectionFailures === 0 && !incomplete,
    classification: incomplete
      ? "implementation-incomplete"
      : collectionFailures > 0
        ? "collection-failure"
        : collected > 0 && passedCount === collected && failedCount === 0
          ? "passed"
          : "semantic-failure",
  });

/**
 * Parse Vitest assertions against the exact frozen case inventory.
 * **Details**
 * Describe-suite counts are intentionally ignored. Missing, duplicate or unknown
 * cases, empty failed files, inconsistent counters, pending tests and unhandled
 * errors are collection failures even when the process exits zero.
 * **Example** (Inspect the reporter boundary)
 * ```ts
 * import { collectVitestOutcome } from "@beep/repo-cli/test/AgentEffectiveness"
 * console.log(collectVitestOutcome)
 * ```
 * @category execution
 * @since 0.0.0
 */
export const collectVitestOutcome = Effect.fn("AgentEffectiveness.collectVitestOutcome")(function* (
  id: string,
  raw: string,
  exitCode: number,
  expectedCases: ReadonlyArray<string>
) {
  const decoded = yield* S.decodeEffect(S.fromJsonString(VitestReport))(raw).pipe(Effect.option);
  if (O.isNone(decoded)) return outcome(id, 0, 0, 0, 1);
  const report = decoded.value;
  const assertions = A.flatMap(report.testResults, (file) => file.assertionResults);
  const names = A.map(assertions, (assertion) => assertion.fullName);
  const passed = A.filter(assertions, (assertion) => assertion.status === "passed").length;
  const failed = A.filter(assertions, (assertion) => assertion.status === "failed").length;
  const sameCases = A.makeEquivalence(Str.Equivalence)(A.sort(names, Str.Order), A.sort(expectedCases, Str.Order));
  const badFiles = A.filter(
    report.testResults,
    (file) => file.status === "failed" && file.assertionResults.length === 0
  ).length;
  const gaps = [
    assertions.length === 0,
    !sameCases || A.dedupe(names).length !== names.length || A.dedupe(expectedCases).length !== expectedCases.length,
    report.numTotalTests !== assertions.length || report.numPassedTests !== passed || report.numFailedTests !== failed,
    report.numPendingTests > 0 || (report.numTodoTests ?? 0) > 0 || passed + failed !== assertions.length,
    (report.unhandledErrors?.length ?? 0) > 0,
    exitCode !== 0 && failed === 0,
    report.success !== (failed === 0 && passed === assertions.length && assertions.length > 0),
  ];
  return outcome(id, assertions.length, passed, failed, badFiles + A.filter(gaps, Boolean).length);
});

/**
 * Require the default package audit and docgen stages in their native summary.
 * **Example** (Inspect package verification parsing)
 * ```ts
 * import { collectPackageVerifyOutcome } from "@beep/repo-cli/test/AgentEffectiveness"
 * console.log(collectPackageVerifyOutcome)
 * ```
 * @category execution
 * @since 0.0.0
 */
export const collectPackageVerifyOutcome = Effect.fn("AgentEffectiveness.collectPackageVerifyOutcome")(function* (
  id: string,
  raw: string,
  exitCode: number,
  expectedPackage: string
) {
  // Native CLI output is a boundary: remove terminal color only, preserving lines.
  const plain = raw.replace(/\u001b\[[0-9;]*m/g, "");
  const headers = [...plain.matchAll(/^pkg-verify (\S+) \([^\n]*\)(.*)$/gm)];
  const stages = [...plain.matchAll(/\b(ok|fail|skip) (audit|docgen) [0-9]+(?:\.[0-9]+)?s\b/g)];
  const valid =
    headers.length === 1 &&
    headers[0]?.[1] === expectedPackage &&
    Str.trim(headers[0]?.[2] ?? "") === "" &&
    stages.length === 2 &&
    stages[0]?.[2] === "audit" &&
    stages[1]?.[2] === "docgen";
  const passed = A.filter(stages, (stage) => stage[1] === "ok").length;
  const failed = A.filter(stages, (stage) => stage[1] === "fail").length;
  return outcome(id, stages.length, passed, failed, valid && exitCode === 0 && passed === 2 ? 0 : 1);
});

const NativeGate = S.Struct({
  schemaVersion: S.String,
  outcome: S.String,
  collected: S.Natural,
  passed: S.Natural,
  failed: S.Natural,
  collectionFailures: S.Natural,
});

/**
 * Normalize a trusted export/framework gate report without treating exit zero as proof.
 * **Example** (Inspect native gate parsing)
 * ```ts
 * import { collectNativeGateOutcome } from "@beep/repo-cli/test/AgentEffectiveness"
 * console.log(collectNativeGateOutcome)
 * ```
 * @category execution
 * @since 0.0.0
 */
export const collectNativeGateOutcome = Effect.fn("AgentEffectiveness.collectNativeGateOutcome")(function* (
  id: string,
  raw: string,
  exitCode: number,
  schemaVersion: string
) {
  const decoded = yield* S.decodeEffect(S.fromJsonString(NativeGate))(raw).pipe(Effect.option);
  if (O.isNone(decoded)) return outcome(id, 0, 0, 0, 1);
  const gate = decoded.value;
  if (gate.schemaVersion !== schemaVersion)
    return yield* AgentTrialError.make({
      stage: "proof",
      message: "Native gate reporter version differs from frozen contract",
    });
  const incomplete = gate.outcome === "implementation_incomplete";
  const invalid =
    gate.passed + gate.failed !== gate.collected ||
    gate.collected === 0 ||
    (exitCode !== 0 && gate.failed === 0) ||
    !A.contains(["passed", "implementation_incomplete", "protocol_violation", "failed"], gate.outcome);
  const parsed = outcome(
    id,
    gate.collected,
    gate.passed,
    gate.failed,
    gate.collectionFailures + (invalid ? 1 : 0),
    incomplete
  );
  return gate.outcome === "protocol_violation"
    ? TrialCollectedOutcome.make({ ...parsed, passed: false, classification: "protocol-violation" })
    : parsed;
});

/**
 * Reconstruct only committed source from retained bundles in an offline namespace.
 * **Details**
 * The destination is newly created and has evaluator-owned Git metadata. Neither
 * the coding worktree nor its ignored files are mounted. An ancestor-only base
 * bundle may satisfy prerequisites of an incremental candidate bundle. No refs,
 * configuration, alternates or remotes are imported from the coding repository.
 * **Example** (Inspect the source reconstruction boundary)
 * ```ts
 * import { reconstructTrialSource } from "@beep/repo-cli/test/AgentEffectiveness"
 * console.log(reconstructTrialSource)
 * ```
 * @category execution
 * @since 0.0.0
 */
export const reconstructTrialSource = Effect.fn("AgentEffectiveness.reconstructTrialSource")(function* (
  destination: string,
  candidate: TrialArtifact,
  base: O.Option<TrialArtifact>,
  finalCommit: string,
  baseCommit: string
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const commit = S.String.check(S.isPattern(/^[a-f0-9]{40}$/));
  yield* S.decodeEffect(commit)(finalCommit);
  yield* S.decodeEffect(commit)(baseCommit);
  for (const bundle of [candidate, ...O.toArray(base)]) {
    if ((yield* hashTrialInput(bundle.path)) !== bundle.digest)
      return yield* AgentTrialError.make({ stage: "proof", message: "Reconstruction bundle bytes changed" });
  }
  if (!path.isAbsolute(destination) || path.normalize(destination) !== destination || (yield* fs.exists(destination)))
    return yield* AgentTrialError.make({
      stage: "proof",
      message: "Reconstruction destination must be a fresh absolute canonical root",
    });
  if ((yield* fs.realPath(path.dirname(destination))) !== path.dirname(destination))
    return yield* AgentTrialError.make({ stage: "proof", message: "Reconstruction parent must be canonical" });
  yield* fs.makeDirectory(destination, { mode: 0o700 });
  const workspace = path.join(destination, "worktree");
  yield* fs.makeDirectory(workspace, { mode: 0o700 });
  const git = Effect.fn(function* (gitArgs: ReadonlyArray<string>) {
    const args = [
      "--die-with-parent",
      "--new-session",
      "--unshare-all",
      "--tmpfs",
      "/",
      "--proc",
      "/proc",
      "--dev",
      "/dev",
      "--tmpfs",
      "/tmp",
      "--bind",
      workspace,
      "/workspace",
      "--ro-bind",
      candidate.path,
      "/inputs/candidate.bundle",
    ];
    if (O.isSome(base)) args.push("--ro-bind", base.value.path, "/inputs/base.bundle");
    for (const root of ["/usr", "/bin", "/lib", "/lib64"]) args.push("--ro-bind", root, root);
    args.push(
      "--clearenv",
      "--setenv",
      "HOME",
      "/nonexistent",
      "--setenv",
      "PATH",
      "/usr/bin:/bin",
      "--setenv",
      "GIT_CONFIG_NOSYSTEM",
      "1",
      "--setenv",
      "GIT_CONFIG_GLOBAL",
      "/dev/null",
      "--chdir",
      "/workspace",
      "--",
      "/usr/bin/git",
      "-c",
      "core.hooksPath=/dev/null",
      "-c",
      "core.fsmonitor=false",
      "-c",
      "credential.helper=",
      ...gitArgs
    );
    const result = yield* runCaptured({
      command: "/usr/bin/bwrap",
      args,
      cwd: destination,
      env: {},
      extendEnv: false,
      timeout: "30 seconds",
      forceKillAfter: "1 second",
      bound: repoRunOutputBound,
    });
    if (result.exitCode !== 0 || result.truncated)
      return yield* AgentTrialError.make({ stage: "proof", message: "Offline committed source reconstruction failed" });
    return Str.trim(result.output);
  });
  yield* git(["init", "--initial-branch=reconstruction"]);
  if (O.isSome(base)) yield* git(["bundle", "unbundle", "/inputs/base.bundle"]);
  yield* git(["bundle", "unbundle", "/inputs/candidate.bundle"]);
  yield* git(["checkout", "--detach", finalCommit]);
  yield* git(["merge-base", "--is-ancestor", baseCommit, finalCommit]);
  const inspect = Effect.fn(function* (args: ReadonlyArray<string>) {
    const result = yield* inspectTrialGit(workspace, args);
    if (result.exitCode !== 0 || result.truncated)
      return yield* AgentTrialError.make({ stage: "proof", message: "Reconstruction inspection failed" });
    return Str.trim(result.output);
  });
  const head = yield* inspect(["rev-parse", "HEAD"]);
  const tree = yield* inspect(["rev-parse", "HEAD^{tree}"]);
  const dirty = yield* inspect(["status", "--porcelain", "--untracked-files=all"]);
  const ignored = yield* inspect(["ls-files", "--others", "--ignored", "--exclude-standard"]);
  if (head !== finalCommit || dirty !== "" || ignored !== "")
    return yield* AgentTrialError.make({
      stage: "proof",
      message: "Reconstructed source is not the clean exact retained commit",
    });
  const archive = path.join(destination, "source.tar");
  const archiveResult = yield* runSpooledStreams({
    command: "/usr/bin/bwrap",
    args: yield* trialGitSandbox(workspace, ["archive", "--format=tar", finalCommit]),
    cwd: destination,
    env: {},
    extendEnv: false,
    timeout: "30 seconds",
    forceKillAfter: "1 second",
    stdoutPath: archive,
    stderrPath: path.join(destination, "archive.stderr"),
  });
  if (archiveResult !== 0)
    return yield* AgentTrialError.make({ stage: "proof", message: "Reconstructed source archive failed" });
  const evidence = TrialCommittedSource.make({
    schemaVersion: "agent-trial-committed-source/v1",
    workspace,
    finalCommit,
    tree,
    bundle: candidate,
    baseBundle: base,
    sourceArchive: yield* trialArtifact(archive),
  });
  const receipt = path.join(destination, "reconstruction.json");
  yield* fs.writeFileString(receipt, yield* TrialCommittedSourceJson.encode(evidence), { flag: "wx", mode: 0o600 });
  return { workspace, finalCommit, tree, source: yield* trialArtifact(receipt) };
});

/**
 * Execute one frozen native check in an offline evaluator-only namespace.
 * **Details**
 * Complete output is retained before native reporter parsing. This collector
 * never mounts the coding worktree, auth, broker, model home or other task inputs.
 * Every check uses the same evaluator-owned committed reconstruction.
 * **Example** (Inspect protected collection)
 * ```ts
 * import { executeTrialCheck } from "@beep/repo-cli/test/AgentEffectiveness"
 * console.log(executeTrialCheck)
 * ```
 * @category execution
 * @since 0.0.0
 */
export const executeTrialCheck = Effect.fn("AgentEffectiveness.executeTrialCheck")(function* (
  committedSource: TrialArtifact,
  check: TrialEvaluatorCheck,
  runtime: ReadonlyArray<TrialMount>,
  outputRoot: string,
  projectedRuntime: ReadonlyArray<TrialRuntimeClosure> = []
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  if ((yield* hashTrialInput(committedSource.path)) !== committedSource.digest)
    return yield* AgentTrialError.make({ stage: "proof", message: "Committed source receipt changed" });
  const source = yield* TrialCommittedSourceJson.decode(yield* fs.readFileString(committedSource.path));
  yield* validateTrialInventory(check.input);
  if (
    !path.isAbsolute(outputRoot) ||
    path.normalize(outputRoot) !== outputRoot ||
    (yield* fs.exists(outputRoot)) ||
    (yield* fs.realPath(path.dirname(outputRoot))) !== path.dirname(outputRoot)
  )
    return yield* AgentTrialError.make({
      stage: "proof",
      message: "Check output must be a fresh canonical owned root",
    });
  yield* fs.makeDirectory(outputRoot, { mode: 0o700 });
  const bindings = { candidate: source.workspace, sealed: check.input.root, output: outputRoot };
  const namespaceBindings = { candidate: "/workspace", sealed: "/sealed", output: "/output" };
  const resolve = (arg: string) =>
    Str.replaceAll(
      "OUTPUT",
      "/output"
    )(Str.replaceAll("SEALED", "/sealed")(Str.replaceAll("CANDIDATE", "/workspace")(arg)));
  const argv = A.map(check.commandTemplate, resolve);
  const environment = Object.fromEntries(
    Object.entries(check.environmentTemplate).map(([key, value]) => [key, resolve(value)])
  );
  const args = [
    "--die-with-parent",
    "--new-session",
    "--unshare-all",
    "--tmpfs",
    "/",
    "--proc",
    "/proc",
    "--dev",
    "/dev",
    "--tmpfs",
    "/tmp",
    check.rootWritePolicy === "native-temp-only" ? "--bind" : "--ro-bind",
    source.workspace,
    "/workspace",
    "--ro-bind",
    check.input.root,
    "/sealed",
    "--bind",
    outputRoot,
    "/output",
  ];
  for (const root of ["/usr", "/bin", "/lib", "/lib64"]) args.push("--ro-bind", root, root);
  if (check.rootWritePolicy === "native-temp-only") {
    if (check.kind !== "yeet")
      return yield* AgentTrialError.make({
        stage: "proof",
        message: "Native root temporary creation is permitted only for trusted Yeet",
      });
    const tracked = yield* inspectTrialGit(source.workspace, ["ls-files", "-z"]);
    if (tracked.exitCode !== 0 || tracked.truncated)
      return yield* AgentTrialError.make({
        stage: "proof",
        message: "Tracked root protection inventory is unavailable",
      });
    const roots = A.dedupe(
      A.map(
        Str.split("\u0000")(tracked.output).filter((name) => name !== ""),
        (name) => name.split("/")[0]!
      )
    );
    for (const root of roots) {
      const input = path.join(source.workspace, root);
      const canonical = yield* fs.realPath(input);
      if (canonical !== input && !Str.startsWith(`${source.workspace}/`)(canonical))
        return yield* AgentTrialError.make({
          stage: "proof",
          message: "Tracked root link escapes committed evaluator source",
        });
      args.push("--ro-bind", canonical, `/workspace/${path.relative(source.workspace, canonical)}`);
    }
  }

  for (const mount of runtime) {
    if (
      !A.some(["/runtime/", "/workspace/node_modules/"], (root) => Str.startsWith(root)(mount.target)) &&
      mount.target !== "/workspace/node_modules" &&
      !(check.kind === "yeet" && mount.target === "/inputs/base-origin")
    )
      return yield* AgentTrialError.make({
        stage: "proof",
        message: "Evaluator runtime mount has an unauthorized target",
      });
    if ((yield* hashTrialInput(mount.source)) !== mount.digest || mount.access !== "readonly")
      return yield* AgentTrialError.make({
        stage: "proof",
        message: "Evaluator runtime closure changed or permits shared writes",
      });
    args.push("--ro-bind", mount.source, mount.target);
  }
  for (const closure of projectedRuntime) {
    if (
      closure.target !== "/workspace/node_modules" &&
      !/^\/workspace\/(?:packages|apps)\/[^.]+\/node_modules$/.test(closure.target) &&
      !Str.startsWith("/runtime/")(closure.target)
    )
      return yield* AgentTrialError.make({
        stage: "proof",
        message: "Runtime projection target is not a vendor dependency root",
      });
    yield* validateTrialInventory(closure.inventory, closure.target);
    args.push("--ro-bind", closure.inventory.root, closure.target);
  }
  let gitMetadataBefore = O.none<Sha256Hex>();
  if (check.kind === "yeet") {
    const metadata = path.join(source.workspace, ".git");
    const common = yield* inspectTrialGit(source.workspace, [
      "rev-parse",
      "--path-format=absolute",
      "--git-common-dir",
    ]);
    if (
      (yield* fs.realPath(metadata)) !== metadata ||
      common.exitCode !== 0 ||
      common.truncated ||
      Str.trim(common.output) !== "/workspace/.git"
    )
      return yield* AgentTrialError.make({
        stage: "proof",
        message: "Yeet requires evaluator-owned standalone Git metadata",
      });
    gitMetadataBefore = O.some(yield* hashTrialInput(metadata));
    args.push("--bind", metadata, "/workspace/.git");
  }
  const allowedCaches = [
    "/workspace/node_modules/.vite",
    "/workspace/node_modules/.vite-temp",
    "/workspace/node_modules/.vitest-cache",
    "/workspace/node_modules/.cache",
    "/workspace/.beep",
    "/workspace/.turbo",
    "/workspace/.cache",
  ];
  const outputOverlays: Record<string, string> = {};
  for (const [index, target] of check.writableCacheTargets.entries()) {
    const ignoredBuildTarget =
      /^\/workspace\/(?:packages|apps)\/[^.]+\/(?:dist|dist-test|dist-scripts|build|docs|coverage|node_modules\/(?:\.tmp|\.vite|\.vite-temp|\.vitest-cache|\.cache)|\.turbo|\.beep)$/.test(
        target
      ) || target === "/workspace/node_modules/.tmp";
    if (!A.contains(allowedCaches, target) && !ignoredBuildTarget)
      return yield* AgentTrialError.make({
        stage: "proof",
        message: "Evaluator writable output target is not approved",
      });
    const relative = path.relative("/workspace", target);
    const tracked = yield* inspectTrialGit(source.workspace, ["ls-files", "--", relative]);
    const ignored = yield* inspectTrialGit(source.workspace, [
      "check-ignore",
      "--quiet",
      "--no-index",
      `${relative}/.runner-output-probe`,
    ]);
    if (
      tracked.exitCode !== 0 ||
      tracked.truncated ||
      Str.trim(tracked.output) !== "" ||
      ignored.exitCode !== 0 ||
      ignored.truncated
    )
      return yield* AgentTrialError.make({
        stage: "proof",
        message: "Writable evaluator output would cover tracked or unignored source",
      });
    yield* fs.makeDirectory(path.join(source.workspace, relative), { recursive: true, mode: 0o700 });
    const owned = path.join(outputRoot, `cache-${index}`);
    yield* fs.makeDirectory(owned, { mode: 0o700 });
    outputOverlays[target] = owned;
    args.push("--bind", owned, target);
  }
  let compilerCopy = O.none<string>();
  if (O.isSome(check.compilerOverlay)) {
    const frozen = check.compilerOverlay.value;
    if ((yield* hashTrialInput(frozen.path)) !== frozen.digest)
      return yield* AgentTrialError.make({ stage: "proof", message: "Pinned compiler artifact changed" });
    const owned = path.join(outputRoot, "compiler-owned");
    yield* fs.copyFile(frozen.path, owned);
    yield* fs.chmod(owned, 0o700);
    args.push("--bind", owned, "/workspace/node_modules/@effect/tsgo-linux-x64/artifacts/typescript/7.0.2/tsc");
    compilerCopy = O.some(owned);
  }
  args.push("--clearenv", "--setenv", "HOME", "/nonexistent");
  for (const [key, value] of Object.entries(environment)) args.push("--setenv", key, value);
  args.push("--chdir", "/workspace", "--", ...argv);
  const before = yield* inspectTrialGit(source.workspace, ["rev-parse", "HEAD"]);
  const status = yield* inspectTrialGit(source.workspace, ["status", "--porcelain"]);
  if (
    before.exitCode !== 0 ||
    before.truncated ||
    Str.trim(before.output) !== source.finalCommit ||
    status.exitCode !== 0 ||
    status.truncated ||
    Str.trim(status.output) !== ""
  )
    return yield* AgentTrialError.make({ stage: "proof", message: "Evaluator committed source changed before check" });
  const literalRootLinks = Effect.fn(function* () {
    const links: Record<string, string> = {};
    for (const name of yield* fs.readDirectory(source.workspace)) {
      const link = yield* fs.readLink(path.join(source.workspace, name)).pipe(Effect.option);
      if (O.isSome(link)) links[name] = link.value;
    }
    return links;
  });
  const rootLinksBefore = yield* literalRootLinks();
  const rootInventoryBefore = (yield* fs.readDirectory(source.workspace)).sort();
  const rootModeBefore = (yield* fs.stat(source.workspace)).mode;
  const stdoutPath = path.join(outputRoot, "stdout.log");
  const stderrPath = path.join(outputRoot, "stderr.log");
  const exitCode = yield* runSpooledStreams({
    command: "/usr/bin/bwrap",
    args,
    cwd: outputRoot,
    env: {},
    extendEnv: false,
    timeout: check.timeoutMs,
    forceKillAfter: "1 second",
    stdoutPath,
    stderrPath,
  });
  let nativeReport = O.none<TrialArtifact>();
  let reportPath = O.map(check.reportRelativePath, (relative) => path.join(outputRoot, relative));
  if (check.kind === "yeet" && O.isNone(check.reportRelativePath)) {
    const stdout = yield* fs.readFileString(stdoutPath);
    const location = trialYeetVerdictLocation(stdout);
    const overlay = outputOverlays["/workspace/.beep"];
    if (O.isNone(location) || overlay === undefined)
      return yield* AgentTrialError.make({
        stage: "proof",
        message: "Native Yeet verdict location is absent, ambiguous or outside owned overlay",
      });
    reportPath = O.some(path.join(overlay, path.relative("/workspace/.beep", location.value)));
  }
  if (O.isSome(reportPath)) {
    const report = reportPath.value;
    if (O.isSome(check.reportRelativePath)) {
      const relative = check.reportRelativePath.value;
      if (path.isAbsolute(relative) || path.normalize(relative) !== relative || Str.startsWith("../")(relative))
        return yield* AgentTrialError.make({ stage: "proof", message: "Native report path escapes owned output" });
    }
    if (yield* fs.exists(report)) {
      if ((yield* fs.realPath(report)) !== report || !Str.startsWith(`${outputRoot}/`)(report))
        return yield* AgentTrialError.make({
          stage: "proof",
          message: "Native report resolves outside its owned output",
        });
      nativeReport = O.some(yield* trialArtifact(report));
    }
  }
  let parsed: TrialCollectedOutcome;
  if (check.kind === "package-verify" && O.isSome(check.expectedPackage))
    parsed = yield* collectPackageVerifyOutcome(
      check.id,
      yield* fs.readFileString(stdoutPath),
      exitCode,
      check.expectedPackage.value
    );
  else if (check.kind === "typecheck") parsed = outcome(check.id, 1, exitCode === 0 ? 1 : 0, exitCode === 0 ? 0 : 1, 0);
  else if (O.isSome(reportPath)) {
    const raw = yield* fs.readFileString(reportPath.value).pipe(Effect.orElseSucceed(() => ""));
    if (check.kind === "vitest") parsed = yield* collectVitestOutcome(check.id, raw, exitCode, check.expectedCases);
    else if (check.kind === "yeet") {
      const verdict = yield* YeetVerdictJson.decode(raw).pipe(Effect.option);
      const clean = yield* hashPublicTextSha256("\u0000\u0000");
      if (O.isNone(verdict)) parsed = outcome(check.id, 0, 0, 0, 1);
      else {
        const full = verdict.value;
        const passedLanes = A.filter(
          check.expectedCases,
          (id) =>
            A.filter(full.lanes, (lane) => lane.id === id && lane.status === "passed" && lane.exitCode === 0).length ===
            1
        ).length;
        const valid =
          full.mode === "verify" &&
          full.outcome === "success" &&
          O.contains(full.proofTier, "full") &&
          O.contains(full.resolvedHeadSha, source.finalCommit) &&
          O.contains(full.diffFingerprint, clean) &&
          exitCode === 0;
        parsed = outcome(
          check.id,
          check.expectedCases.length,
          passedLanes,
          check.expectedCases.length - passedLanes,
          valid ? 0 : 1
        );
      }
    } else if (check.kind === "framework" || check.kind === "public-exports")
      parsed = yield* collectNativeGateOutcome(
        check.id,
        raw,
        exitCode,
        check.kind === "framework" ? "evaluator-framework-integrity-result/v1" : "public-export-gate/v1"
      );
    else return yield* AgentTrialError.make({ stage: "proof", message: "Unsupported native check collector" });
  } else return yield* AgentTrialError.make({ stage: "proof", message: "Required native report contract is absent" });
  if (
    O.isSome(check.compilerOverlay) &&
    O.isSome(compilerCopy) &&
    (yield* hashTrialInput(compilerCopy.value)) !== check.compilerOverlay.value.digest
  )
    return yield* AgentTrialError.make({ stage: "proof", message: "Evaluator compiler bytes changed during check" });
  const after = yield* inspectTrialGit(source.workspace, ["rev-parse", "HEAD"]);
  const dirty = yield* inspectTrialGit(source.workspace, ["status", "--porcelain"]);
  const rootInventoryAfter = (yield* fs.readDirectory(source.workspace)).sort();
  const rootModeAfter = (yield* fs.stat(source.workspace)).mode;
  const rootLinksAfter = yield* literalRootLinks();
  const rootUnchanged =
    equal(rootInventoryBefore, rootInventoryAfter) &&
    rootModeBefore === rootModeAfter &&
    equal(Object.keys(rootLinksBefore).sort(), Object.keys(rootLinksAfter).sort()) &&
    A.every(Object.entries(rootLinksBefore), ([name, target]) => rootLinksAfter[name] === target);
  if (!rootUnchanged)
    parsed = TrialCollectedOutcome.make({
      ...parsed,
      passed: false,
      classification: "protocol-violation",
      collectionFailures: parsed.collectionFailures + 1,
    });
  const rootInventoryPath = path.join(outputRoot, "root-inventory.json");
  yield* fs.writeFileString(
    rootInventoryPath,
    yield* S.encodeEffect(S.fromJsonString(S.Unknown))({
      policy: check.rootWritePolicy ?? "readonly",
      before: rootInventoryBefore,
      after: rootInventoryAfter,
      linksBefore: rootLinksBefore,
      linksAfter: rootLinksAfter,
      linkProtection: "canonical targets readonly; literal root links validated after execution",
      modeBefore: rootModeBefore,
      modeAfter: rootModeAfter,
      unchanged: rootUnchanged,
    }),
    { flag: "wx", mode: 0o600 }
  );
  const parsedPath = path.join(outputRoot, "parsed-outcome.json");
  yield* fs.writeFileString(parsedPath, yield* S.encodeEffect(S.fromJsonString(TrialCollectedOutcome))(parsed), {
    flag: "wx",
    mode: 0o600,
  });
  const inputPath = path.join(outputRoot, "input-inventory.json");
  yield* fs.writeFileString(inputPath, yield* S.encodeEffect(S.fromJsonString(S.Unknown))(check.input), {
    flag: "wx",
    mode: 0o600,
  });
  const contractPath = path.join(outputRoot, "evaluator-contract.json");
  yield* fs.writeFileString(contractPath, yield* S.encodeEffect(S.fromJsonString(TrialEvaluatorCheck))(check), {
    flag: "wx",
    mode: 0o600,
  });
  return {
    id: check.id,
    ...(O.isSome(nativeReport) ? { nativeReport: nativeReport.value } : {}),
    evaluatorContract: yield* trialArtifact(contractPath),
    rootInventory: yield* trialArtifact(rootInventoryPath),
    ...(O.isSome(gitMetadataBefore)
      ? {
          gitMetadata: {
            beforeDigest: gitMetadataBefore.value,
            afterDigest: yield* hashTrialInput(path.join(source.workspace, ".git")),
          },
        }
      : {}),
    passed: parsed.passed,
    inputBundleDigest: check.input.digest,
    inputBundle: yield* trialArtifact(inputPath),
    commandTemplate: check.commandTemplate,
    bindings,
    namespaceBindings,
    resolvedArgv: argv,
    cwd: "/workspace",
    filteredEnvironment: environment,
    invocationDigest: yield* hashPublicTextSha256(
      yield* S.encodeEffect(S.fromJsonString(S.Unknown))({ argv, cwd: "/workspace", environment })
    ),
    headBefore: Str.trim(before.output),
    headAfter: Str.trim(after.output),
    fingerprintBefore: yield* hashPublicTextSha256("\u0000\u0000"),
    fingerprintAfter: yield* hashPublicTextSha256(
      after.exitCode === 0 &&
        !after.truncated &&
        dirty.exitCode === 0 &&
        !dirty.truncated &&
        Str.trim(dirty.output) === ""
        ? "\u0000\u0000"
        : "changed"
    ),
    exitCode,
    stdout: yield* trialArtifact(stdoutPath),
    stderr: yield* trialArtifact(stderrPath),
    parsedOutcome: yield* trialArtifact(parsedPath),
    collected: parsed.collected,
    passedCount: parsed.passedCount,
    failedCount: parsed.failedCount,
    collectionFailures: parsed.collectionFailures,
  };
});

/**
 * Execute a frozen ordered acceptance inventory with implementation fail-fast.
 * **Details**
 * Framework integrity and public exports precede semantic tests. A failed gate
 * retains its native output and stops subsequent checks; absent required results
 * remain incomplete in the finalizer rather than removing an arm from scoring.
 * **Example** (Inspect frozen acceptance collection)
 * ```ts
 * import { collectTrialAcceptance } from "@beep/repo-cli/test/AgentEffectiveness"
 * console.log(collectTrialAcceptance)
 * ```
 * @category execution
 * @since 0.0.0
 */
export const collectTrialAcceptance = Effect.fn("AgentEffectiveness.collectTrialAcceptance")(function* (
  plan: TrialPlan,
  committedSource: TrialArtifact,
  checks: ReadonlyArray<TrialEvaluatorCheck>,
  runtime: ReadonlyArray<TrialMount>,
  outputRoot: string,
  projectedRuntime: ReadonlyArray<TrialRuntimeClosure> = []
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  if (
    !equal(
      A.map(checks, (check) => check.id),
      plan.requiredTaskCheckIds
    ) ||
    checks[0]?.kind !== "framework" ||
    A.some(A.drop(checks, 1), (check) => check.kind === "framework") ||
    A.some(
      checks,
      (check, index) =>
        check.kind === "public-exports" &&
        A.some(A.take(checks, index), (previous) => previous.kind !== "framework" && previous.kind !== "public-exports")
    )
  )
    return yield* AgentTrialError.make({
      stage: "proof",
      message: "Frozen evaluator checks differ or prerequisite order is invalid",
    });
  for (const check of checks) {
    const spec = A.findFirst(plan.requiredCheckSpecs, (spec) => spec.id === check.id);
    if (
      O.isNone(spec) ||
      spec.value.inputBundleDigest !== check.input.digest ||
      spec.value.contractDigest !== (yield* trialCheckContractDigest(check)) ||
      !equal(spec.value.commandTemplate, check.commandTemplate)
    )
      return yield* AgentTrialError.make({
        stage: "proof",
        message: "Evaluator command or input digest differs from frozen plan",
      });
  }
  if (
    (yield* fs.exists(outputRoot)) ||
    !path.isAbsolute(outputRoot) ||
    (yield* fs.realPath(path.dirname(outputRoot))) !== path.dirname(outputRoot)
  )
    return yield* AgentTrialError.make({ stage: "proof", message: "Acceptance output must be a fresh canonical root" });
  yield* fs.makeDirectory(outputRoot, { mode: 0o700 });
  const requiredChecks = [];
  for (const [index, check] of checks.entries()) {
    const result = yield* executeTrialCheck(
      committedSource,
      check,
      runtime,
      path.join(outputRoot, `check-${index}`),
      projectedRuntime
    );
    requiredChecks.push(result);
    if (!result.passed) break;
  }
  if (requiredChecks.length === 0)
    return yield* AgentTrialError.make({ stage: "proof", message: "No frozen evaluator checks executed" });
  const source = yield* TrialCommittedSourceJson.decode(yield* fs.readFileString(committedSource.path));
  const acceptance = yield* S.decodeUnknownEffect(TrialAcceptance)({
    schemaVersion: "agent-trial-acceptance/v1",
    taskDigest: plan.taskDigest,
    acceptanceDigest: plan.acceptanceDigest,
    finalCommit: source.finalCommit,
    requiredChecks,
  });
  const receipt = path.join(outputRoot, "acceptance.json");
  yield* fs.writeFileString(receipt, yield* TrialAcceptanceJson.encode(acceptance), { flag: "wx", mode: 0o600 });
  return yield* trialArtifact(receipt);
});

/**
 * Collect protected checks and emit an exact-commit proof request for finalization.
 * **Example** (Use one private request)
 * ```ts
 * import { collectTrial } from "@beep/repo-cli/test/AgentEffectiveness"
 * console.log(collectTrial)
 * ```
 * @category execution
 * @since 0.0.0
 */
export const collectTrial = Effect.fn("AgentEffectiveness.collectTrial")(function* (requestPath: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const request = yield* TrialCollectRequestJson.decode(yield* fs.readFileString(requestPath));
  if ((yield* hashTrialInput(request.attempt.path)) !== request.attempt.digest)
    return yield* AgentTrialError.make({ stage: "proof", message: "Retained attempt changed before collection" });
  const attempt = yield* TrialAttemptJson.decode(yield* fs.readFileString(request.attempt.path));
  if ((yield* hashTrialInput(attempt.plan.path)) !== attempt.plan.digest)
    return yield* AgentTrialError.make({ stage: "proof", message: "Frozen plan changed before collection" });
  const plan = yield* TrialPlanJson.decode(yield* fs.readFileString(attempt.plan.path));
  if (attempt.terminal.status !== "awaiting-proof" || O.isNone(attempt.bundle) || request.yeet.kind !== "yeet")
    return yield* AgentTrialError.make({
      stage: "proof",
      message: "Collection requires a retained committed attempt and full Yeet contract",
    });
  const fullSpec = plan.fullYeetCheckSpec;
  if (
    fullSpec === undefined ||
    !equal(request.yeet.commandTemplate, [
      "/runtime/bin/bun",
      "run",
      "beep",
      "yeet",
      "verify",
      "--tier",
      "full",
      "--base",
      plan.baseCommit,
      "--head",
      "HEAD",
    ]) ||
    O.isSome(request.yeet.reportRelativePath) ||
    fullSpec.id !== request.yeet.id ||
    fullSpec.inputBundleDigest !== request.yeet.input.digest ||
    fullSpec.contractDigest !== (yield* trialCheckContractDigest(request.yeet)) ||
    !equal(fullSpec.commandTemplate, request.yeet.commandTemplate) ||
    !equal(plan.requiredYeetLaneIds, request.yeet.expectedCases)
  )
    return yield* AgentTrialError.make({ stage: "proof", message: "Full Yeet contract differs from frozen plan" });
  const source = yield* reconstructTrialSource(
    request.reconstructionRoot,
    attempt.bundle.value,
    O.fromUndefinedOr(plan.baseBundle),
    attempt.terminal.finalCommit,
    attempt.baseCommit
  );
  const acceptance = yield* collectTrialAcceptance(
    plan,
    source.source,
    request.checks,
    request.runtime,
    request.outputRoot,
    request.projectedRuntime
  );
  const taskOutcome = yield* TrialAcceptanceJson.decode(yield* fs.readFileString(acceptance.path));
  if (
    taskOutcome.requiredChecks.length !== request.checks.length ||
    A.some(taskOutcome.requiredChecks, (check) => !check.passed)
  )
    return yield* AgentTrialError.make({
      stage: "proof",
      message: `Task acceptance failed; retained at ${acceptance.path}`,
    });
  const yeet = yield* executeTrialCheck(
    source.source,
    request.yeet,
    request.runtime,
    path.join(request.outputRoot, "full-yeet"),
    request.projectedRuntime
  );
  if (yeet.nativeReport === undefined)
    return yield* AgentTrialError.make({ stage: "proof", message: "Full Yeet did not retain its native verdict" });
  const fullYeetCollectionPath = path.join(request.outputRoot, "full-yeet-collection.json");
  const fullYeetCollection = yield* S.decodeUnknownEffect(TrialAcceptance)({
    schemaVersion: "agent-trial-acceptance/v1",
    taskDigest: plan.taskDigest,
    acceptanceDigest: plan.acceptanceDigest,
    finalCommit: source.finalCommit,
    requiredChecks: [yeet],
  });
  yield* fs.writeFileString(fullYeetCollectionPath, yield* TrialAcceptanceJson.encode(fullYeetCollection), {
    flag: "wx",
    mode: 0o600,
  });
  const proof = yield* S.decodeUnknownEffect(TrialProof)({
    schemaVersion: "agent-trial-proof/v1",
    attempt: request.attempt,
    finalCommit: source.finalCommit,
    verdict: yeet.nativeReport,
    acceptance,
    requiredLaneIds: request.yeet.expectedCases,
    yeetExitCode: yeet.exitCode,
    reconstruction: source.source,
    fullYeetCollection: yield* trialArtifact(fullYeetCollectionPath),
  });
  const proofPath = path.join(request.outputRoot, "proof.json");
  yield* fs.writeFileString(proofPath, yield* TrialProofJson.encode(proof), { flag: "wx", mode: 0o600 });
  return proofPath;
});
