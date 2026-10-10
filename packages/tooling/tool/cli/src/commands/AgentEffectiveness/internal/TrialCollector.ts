/**
 * Native evaluator report normalization for protected trial collection.
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { shellQuote } from "@beep/repo-ai-metrics";
import { hashPublicTextSha256 } from "@beep/repo-ai-metrics/privacy";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as Path from "effect/Path";
import * as R from "effect/Record";
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
import { startTrialBroker, trialArtifact } from "./TrialExecutor.ts";
import {
  captureTrialInventory,
  hashTrialInput,
  inspectTrialGit,
  trialCheckContractDigest,
  trialGitSandbox,
  trialNativeInventoryBindings,
  trialSystemBindings,
  validateTrialInventory,
  validateTrialNativeRuntime,
} from "./TrialIsolation.ts";
import {
  TrialCommittedSource,
  TrialCommittedSourceJson,
  TrialEvaluatorCheck,
  TrialInputInventory,
  TrialNativeRuntimeEvidence,
  TrialNativeYeetRuntime,
  TrialRuntimeClosure,
} from "./TrialProfile.schemas.ts";
import { acquireTrialRetentionLease } from "./TrialRetention.ts";
import type { Sha256Hex } from "@beep/schema/Sha256";
import type { TrialPlan } from "../AgentEffectiveness.trials.schemas.ts";
import type { TrialArtifact, TrialMount } from "./TrialProfile.schemas.ts";

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
  baseCommit: string,
  system?: TrialInputInventory
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
    args.push(...(yield* trialSystemBindings(system)));
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
    const result = yield* inspectTrialGit(workspace, args, system);
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
    args: yield* trialGitSandbox(workspace, ["archive", "--format=tar", finalCommit], system),
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
 * Preserve inventory namespace targets for evaluator collection and retention.
 * **Details**
 * Retained inventories must keep their original projection targets so absolute
 * links receive the same validation as the native evaluator.
 * **Example** (Inspect bindings after boundary decoding)
 * ```ts
 * import { TrialEvaluatorCheck, trialEvaluatorInventoryBindings } from "@beep/repo-cli/test/AgentEffectiveness"
 * import * as Effect from "effect/Effect"
 * import * as S from "effect/Schema"
 * const bindings = S.decodeUnknownEffect(TrialEvaluatorCheck)({}).pipe(Effect.map(trialEvaluatorInventoryBindings([])))
 * console.log(Effect.isEffect(bindings)) // true: malformed controls stay in the error channel.
 * ```
 * @category utilities
 * @since 0.0.0
 */
export const trialEvaluatorInventoryBindings: {
  (
    projectedRuntime: ReadonlyArray<TrialRuntimeClosure>
  ): (check: TrialEvaluatorCheck) => ReadonlyArray<TrialRuntimeClosure>;
  (
    check: TrialEvaluatorCheck,
    projectedRuntime: ReadonlyArray<TrialRuntimeClosure>
  ): ReadonlyArray<TrialRuntimeClosure>;
} = dual(
  2,
  (
    check: TrialEvaluatorCheck,
    projectedRuntime: ReadonlyArray<TrialRuntimeClosure>
  ): ReadonlyArray<TrialRuntimeClosure> =>
    A.dedupeWith(
      [
        TrialRuntimeClosure.make({ inventory: check.input, target: "/sealed" }),
        ...O.fromUndefinedOr(check.sparseSystem).pipe(
          O.map((inventory) => [TrialRuntimeClosure.make({ inventory, target: "/runtime/system" })]),
          O.getOrElse(() => [])
        ),
        ...projectedRuntime,
        ...O.fromUndefinedOr(check.nativeRuntime).pipe(
          O.map(trialNativeInventoryBindings),
          O.getOrElse(() => [])
        ),
      ],
      (left, right) =>
        left.target === right.target &&
        left.inventory.root === right.inventory.root &&
        left.inventory.digest === right.inventory.digest
    )
);

/**
 * Enumerate immutable evaluator input paths for output overlap protection.
 * **Details**
 * Includes sealed bundles, dependency seeds, sparse system inputs and standalone
 * native assets. Per-check output and writable compiler/cache copies are excluded.
 * Collection and retention share this census so an embedded seed cannot become
 * an output destination.
 * **Example** (Inspect inputs after decoding a protected check)
 * ```ts
 * import { TrialEvaluatorCheck, trialEvaluatorInputRoots } from "@beep/repo-cli/test/AgentEffectiveness"
 * import * as Effect from "effect/Effect"
 * import * as S from "effect/Schema"
 * const roots = S.decodeUnknownEffect(TrialEvaluatorCheck)({}).pipe(Effect.map(trialEvaluatorInputRoots([], [])))
 * console.log(Effect.isEffect(roots)) // true: an invalid check stays a failing computation.
 * ```
 * @category utilities
 * @since 0.0.0
 */
export const trialEvaluatorInputRoots: {
  (
    runtime: ReadonlyArray<TrialMount>,
    projectedRuntime: ReadonlyArray<TrialRuntimeClosure>
  ): (check: TrialEvaluatorCheck) => ReadonlyArray<string>;
  (
    check: TrialEvaluatorCheck,
    runtime: ReadonlyArray<TrialMount>,
    projectedRuntime: ReadonlyArray<TrialRuntimeClosure>
  ): ReadonlyArray<string>;
} = dual(
  3,
  (
    check: TrialEvaluatorCheck,
    runtime: ReadonlyArray<TrialMount>,
    projectedRuntime: ReadonlyArray<TrialRuntimeClosure>
  ): ReadonlyArray<string> =>
    A.dedupe([
      ...A.map(trialEvaluatorInventoryBindings(check, projectedRuntime), (binding) => binding.inventory.root),
      ...A.map(O.toArray(check.compilerOverlay), (artifact) => artifact.path),
      ...A.map(runtime, (mount) => mount.source),
      ...O.fromUndefinedOr(check.nativeRuntime).pipe(
        O.map((value) => [
          value.certificateBundle.path,
          ...A.map(value.bootstrap, (file) => file.artifact.path),
          value.broker.program.path,
          value.broker.interpreter.path,
          value.broker.relay.path,
          value.broker.policy.path,
          value.broker.canaries.path,
        ]),
        O.getOrElse(() => [])
      ),
    ])
);

/**
 * Derive complete protection roots from a NUL-terminated tracked Git inventory.
 * **Details**
 * Every pathname must be canonical and relative before first-component mapping.
 * Empty, unterminated, absolute and escaping inventories fail closed.
 * **Example** (Keep tracked pathname validation in the error channel)
 * ```ts
 * import { parseTrialTrackedRoots } from "@beep/repo-cli/test/AgentEffectiveness"
 * import * as Effect from "effect/Effect"
 * console.log(Effect.isEffect(parseTrialTrackedRoots("packages/example.ts\0"))) // true
 * ```
 * @category parsing
 * @since 0.0.0
 */
export const parseTrialTrackedRoots = Effect.fn("AgentEffectiveness.parseTrialTrackedRoots")(function* (raw: string) {
  const path = yield* Path.Path;
  if (raw === "" || !Str.endsWith("\0")(raw))
    return yield* AgentTrialError.make({
      stage: "proof",
      message: "Tracked root inventory is missing or not NUL-terminated",
    });
  const names = A.dropRight(Str.split("\0")(raw), 1);
  if (
    !A.every(
      names,
      (name) =>
        name !== "" &&
        name !== "." &&
        name !== ".." &&
        !path.isAbsolute(name) &&
        path.normalize(name) === name &&
        !Str.startsWith("../")(name)
    )
  )
    return yield* AgentTrialError.make({
      stage: "proof",
      message: "Tracked root inventory contains a noncanonical or escaping path",
    });
  return A.dedupe(A.flatMap(names, (name) => O.toArray(A.head(Str.split("/")(name)))));
});

/**
 * Spool the complete tracked index without applying diagnostic log bounds.
 * **Details**
 * Parsing begins only after successful stream capture and zero exit. Raw private
 * stdout/stderr survive failures; passing evidence is bound into proof custody.
 * **Example** (Keep inventory capture inside declared runtime services)
 * ```ts
 * import { collectTrialTrackedInventory } from "@beep/repo-cli/test/AgentEffectiveness"
 * import * as Effect from "effect/Effect"
 * console.log(Effect.isEffect(collectTrialTrackedInventory("/owned/source", "/owned/output"))) // true
 * ```
 * @category execution
 * @since 0.0.0
 */
export const collectTrialTrackedInventory = Effect.fn("AgentEffectiveness.collectTrialTrackedInventory")(function* (
  workspace: string,
  outputRoot: string,
  system?: TrialInputInventory
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  if (!path.isAbsolute(outputRoot) || (yield* fs.realPath(outputRoot)) !== outputRoot)
    return yield* AgentTrialError.make({ stage: "proof", message: "Tracked inventory output must be canonical" });
  const stdoutPath = path.join(outputRoot, "tracked-roots.nul");
  const stderrPath = path.join(outputRoot, "tracked-roots.stderr");
  const code = yield* runSpooledStreams({
    command: "/usr/bin/bwrap",
    args: yield* trialGitSandbox(workspace, ["ls-files", "-z"], system),
    cwd: outputRoot,
    env: {},
    extendEnv: false,
    timeout: "30 seconds",
    forceKillAfter: "1 second",
    stdoutPath,
    stderrPath,
  });
  if (code !== 0)
    return yield* AgentTrialError.make({
      stage: "proof",
      message: "Tracked root protection inventory is unavailable",
      cause: { exitCode: code },
    });
  yield* parseTrialTrackedRoots(yield* fs.readFileString(stdoutPath));
  return yield* trialArtifact(stdoutPath);
});

/**
 * Restore frozen link literals in a fresh evaluator-owned filesystem copy.
 * **Details**
 * Node's copy API resolves relative targets against the original physical root.
 * Container chroots require the original literals. Common immutable inputs are
 * never written; callers supply the missing-link error for their capability.
 * **Example** (Restore only links declared by a decoded inventory)
 * ```ts
 * import { TrialInputInventory, restoreTrialInventoryLinks } from "@beep/repo-cli/test/AgentEffectiveness"
 * import * as Effect from "effect/Effect"
 * import * as S from "effect/Schema"
 * const restored = S.decodeUnknownEffect(TrialInputInventory)({}).pipe(Effect.flatMap((seed) => restoreTrialInventoryLinks(seed, "/owned/copy", "Copied runtime link is missing")))
 * console.log(Effect.isEffect(restored)) // true: invalid inventory stays in the error channel.
 * ```
 * @category execution
 * @since 0.0.0
 */
export const restoreTrialInventoryLinks = Effect.fn("AgentEffectiveness.restoreTrialInventoryLinks")(function* (
  seed: TrialInputInventory,
  owned: string,
  missingLinkMessage: string
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  if (
    !path.isAbsolute(owned) ||
    (yield* fs.realPath(owned)) !== owned ||
    seed.root === owned ||
    Str.startsWith(`${seed.root}/`)(owned) ||
    Str.startsWith(`${owned}/`)(seed.root)
  )
    return yield* AgentTrialError.make({
      stage: "proof",
      message: "Runtime link restoration requires a canonical copy disjoint from its immutable seed",
    });
  for (const [name, literal] of R.toEntries(seed.symlinks)) {
    if (path.isAbsolute(name) || path.normalize(name) !== name || name === ".." || Str.startsWith("../")(name))
      return yield* AgentTrialError.make({
        stage: "proof",
        message: "Runtime link restoration contains an escaping path",
      });
    const link = path.join(owned, name);
    if ((yield* fs.realPath(path.dirname(link))) !== path.dirname(link))
      return yield* AgentTrialError.make({
        stage: "proof",
        message: "Runtime link restoration parent is not canonical",
      });
    if (O.isNone(yield* fs.readLink(link).pipe(Effect.option)))
      return yield* AgentTrialError.make({ stage: "proof", message: missingLinkMessage });
    yield* fs.remove(link);
    yield* fs.symlink(literal, link);
  }
});

/**
 * Copy and independently verify the native Bun seed before any check command.
 * **Details**
 * The seed remains immutable. Only a fresh evaluator-owned copy is writable;
 * its measured initial snapshot must match the complete frozen seed inventory.
 * **Example** (Keep private cache initialization in a computation)
 * ```ts
 * import { TrialInputInventory, prepareTrialBunCache } from "@beep/repo-cli/test/AgentEffectiveness"
 * import * as Effect from "effect/Effect"
 * import * as S from "effect/Schema"
 * const prepared = S.decodeUnknownEffect(TrialInputInventory)({}).pipe(Effect.flatMap((seed) => prepareTrialBunCache(seed, "/owned/output")))
 * console.log(Effect.isEffect(prepared)) // true: invalid seeds remain failures.
 * ```
 * @category execution
 * @since 0.0.0
 */
export const prepareTrialBunCache = Effect.fn("AgentEffectiveness.prepareTrialBunCache")(function* (
  seed: TrialInputInventory,
  outputRoot: string
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  yield* validateTrialInventory(seed, "/runtime/bun-cache");
  const owned = path.join(outputRoot, "bun-cache");
  if (
    (yield* fs.exists(owned)) ||
    (yield* fs.realPath(outputRoot)) !== outputRoot ||
    seed.root === outputRoot ||
    Str.startsWith(`${seed.root}/`)(outputRoot) ||
    Str.startsWith(`${outputRoot}/`)(seed.root)
  )
    return yield* AgentTrialError.make({
      stage: "proof",
      message: "Bun cache copy must be fresh and disjoint from its immutable seed",
    });
  yield* fs.copy(seed.root, owned);
  yield* restoreTrialInventoryLinks(seed, owned, "Copied Bun cache link is missing");
  const initial = yield* captureTrialInventory(owned);
  if (initial.digest !== seed.digest)
    return yield* AgentTrialError.make({
      stage: "proof",
      message: "Initial owned Bun cache differs from immutable seed",
    });
  yield* validateTrialInventory(initial, "/output/bun-cache");
  const receipt = path.join(outputRoot, "bun-cache-before.json");
  yield* fs.writeFileString(receipt, yield* S.encodeEffect(S.fromJsonString(TrialInputInventory))(initial), {
    flag: "wx",
    mode: 0o600,
  });
  return yield* trialArtifact(receipt);
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
  const native = O.fromUndefinedOr(check.nativeRuntime);
  const system = O.map(native, (runtime) => runtime.system).pipe(O.orElse(() => O.fromUndefinedOr(check.sparseSystem)));
  const inspect = Effect.fn("AgentEffectiveness.inspectNativeSource")((gitArgs: ReadonlyArray<string>) =>
    inspectTrialGit(source.workspace, gitArgs, O.getOrUndefined(system))
  );
  const validateNative = Effect.fn("AgentEffectiveness.validateNativeRuntime")(function* () {
    if (O.isNone(native)) return;
    const runtime = native.value;
    if (check.kind !== "yeet")
      return yield* AgentTrialError.make({
        stage: "proof",
        message: "Native capabilities are evaluator-only Yeet inputs",
      });
    yield* validateTrialNativeRuntime(runtime);
  });
  yield* validateNative();
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
  const immutableRoots = [source.workspace, ...trialEvaluatorInputRoots(check, runtime, projectedRuntime)];
  if (
    A.some(
      immutableRoots,
      (root) => root === outputRoot || Str.startsWith(`${root}/`)(outputRoot) || Str.startsWith(`${outputRoot}/`)(root)
    )
  )
    return yield* AgentTrialError.make({
      stage: "proof",
      message: "Evaluator output overlaps immutable source or runtime inputs",
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
  let args = [
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
  args.push(...(yield* system.pipe(O.getOrUndefined, trialSystemBindings)));
  let trackedRootInventory = O.none<TrialArtifact>();
  let trackedRootStderr = O.none<TrialArtifact>();
  let protectionRoots: ReadonlyArray<string> = [];
  if (check.rootWritePolicy === "native-temp-only") {
    if (check.kind !== "yeet")
      return yield* AgentTrialError.make({
        stage: "proof",
        message: "Native root temporary creation is permitted only for trusted Yeet",
      });
    const tracked = yield* collectTrialTrackedInventory(source.workspace, outputRoot, O.getOrUndefined(system));
    trackedRootInventory = O.some(tracked);
    trackedRootStderr = O.some(yield* trialArtifact(path.join(outputRoot, "tracked-roots.stderr")));
    const roots = yield* parseTrialTrackedRoots(yield* fs.readFileString(tracked.path));
    protectionRoots = roots;
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
      closure.target !== "/workspace/infra/node_modules" &&
      closure.target !== "/workspace/infra/lambda/turbo-cache/node_modules" &&
      !/^\/workspace\/(?:packages|apps)\/[^.]+\/node_modules$/.test(closure.target) &&
      !Str.startsWith("/runtime/")(closure.target)
    )
      return yield* AgentTrialError.make({
        stage: "proof",
        message: "Runtime projection target is not a vendor dependency root",
      });
    yield* validateTrialInventory(closure.inventory, closure.target);
    if (Str.startsWith("/workspace/")(closure.target)) {
      const relative = path.relative("/workspace", closure.target);
      const tracked = yield* inspect(["ls-files", "--", relative]);
      const ignored = yield* inspect(["check-ignore", "--quiet", "--no-index", `${relative}/.runner-input-probe`]);
      if (
        tracked.exitCode !== 0 ||
        tracked.truncated ||
        Str.trim(tracked.output) !== "" ||
        ignored.exitCode !== 0 ||
        ignored.truncated
      )
        return yield* AgentTrialError.make({
          stage: "proof",
          message: "Evaluator runtime projection would cover tracked or unignored source",
        });
      const mountpoint = path.join(source.workspace, relative);
      yield* fs.makeDirectory(mountpoint, { recursive: true, mode: 0o700 });
      if ((yield* fs.realPath(mountpoint)) !== mountpoint)
        return yield* AgentTrialError.make({
          stage: "proof",
          message: "Evaluator runtime mountpoint is not canonical",
        });
    }
    args.push("--ro-bind", closure.inventory.root, closure.target);
  }
  let gitMetadataBefore = O.none<Sha256Hex>();
  if (check.kind === "yeet") {
    const metadata = path.join(source.workspace, ".git");
    const common = yield* inspect(["rev-parse", "--path-format=absolute", "--git-common-dir"]);
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
    const tracked = yield* inspect(["ls-files", "--", relative]);
    const ignored = yield* inspect(["check-ignore", "--quiet", "--no-index", `${relative}/.runner-output-probe`]);
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
  let bunCacheBefore = O.none<TrialArtifact>();
  let manifestCopy = O.none<string>();
  let manifestBefore = O.none<Sha256Hex>();
  let processCommand = "/usr/bin/bwrap";
  let processPrefix: ReadonlyArray<string> = [];
  let nativeWrapper = O.none<string>();
  let outerEnvironment: Record<string, string> = {};
  if (O.isSome(native)) {
    const runtime = native.value;
    if (runtime.bunInstallCache === undefined)
      return yield* AgentTrialError.make({
        stage: "proof",
        message: "Native full runtime requires an immutable Bun install cache",
      });
    bunCacheBefore = O.some(yield* prepareTrialBunCache(runtime.bunInstallCache, outputRoot));
    const manifest = path.join(source.workspace, "package.json");
    manifestBefore = O.some(yield* hashTrialInput(manifest));
    const copy = path.join(outputRoot, "manifest-owned.json");
    yield* fs.copyFile(manifest, copy);
    yield* fs.chmod(copy, 0o600);
    manifestCopy = O.some(copy);
    const nixState = path.join(outputRoot, "nix-state");
    const oci = path.join(outputRoot, "oci-owned");
    const ociRun = path.join(outputRoot, "oci-run");
    yield* fs.copy(path.join(runtime.nix.root, "var/nix"), nixState);
    yield* fs.copy(runtime.oci.root, oci);
    yield* restoreTrialInventoryLinks(runtime.oci, oci, "Copied OCI image link is missing");
    yield* fs.makeDirectory(ociRun, { mode: 0o700 });
    const home = path.join(outputRoot, "native-home");
    yield* fs.makeDirectory(path.join(home, ".docker"), { recursive: true, mode: 0o700 });
    yield* fs.writeFileString(
      path.join(home, ".docker/config.json"),
      yield* S.encodeEffect(S.fromJsonString(S.Unknown))({
        proxies: {
          default: {
            httpProxy: "http://127.0.0.1:18080",
            httpsProxy: "http://127.0.0.1:18080",
            noProxy: "localhost,127.0.0.1",
          },
        },
      }),
      { mode: 0o600 }
    );
    yield* fs.writeFileString(
      path.join(outputRoot, "containers.conf"),
      '[containers]\ncgroups="disabled"\nnetns="host"\n[engine]\nruntime="crun"\ncgroup_manager="cgroupfs"\nevents_logger="file"\n[engine.runtimes]\ncrun=["/runtime/crun/bin/crun"]\n',
      { mode: 0o600 }
    );
    const socket = yield* startTrialBroker(runtime.broker, outputRoot);
    args = A.map(args, (arg) => (arg === "--unshare-all" ? "--unshare-pid" : arg));
    args.push(
      "--unshare-net",
      "--unshare-ipc",
      "--unshare-uts",
      "--unshare-cgroup",
      "--ro-bind",
      runtime.crun.root,
      "/runtime/crun",
      "--overlay-src",
      path.join(runtime.nix.root, "store"),
      "--tmp-overlay",
      "/nix/store",
      "--bind",
      nixState,
      "/nix/var/nix",
      "--bind",
      oci,
      runtime.oci.root,
      "--bind",
      ociRun,
      path.join(path.dirname(runtime.oci.root), "run"),
      "--bind",
      copy,
      "/workspace/package.json",
      "--ro-bind",
      socket,
      "/broker/egress.sock",
      "--ro-bind",
      runtime.broker.relay.path,
      "/relay/inner.py",
      "--ro-bind",
      runtime.certificateBundle.path,
      "/runtime/certificates.pem",
      "--ro-bind",
      "/sys",
      "/sys"
    );
    const imageTag = "ghcr.io/google/osv-scanner-action:v2.3.3";
    const podman = A.join(
      A.map(
        [
          "/usr/bin/podman",
          "--root",
          runtime.oci.root,
          "--runroot",
          path.join(path.dirname(runtime.oci.root), "run"),
          "--storage-driver",
          "vfs",
          "--cgroup-manager",
          "cgroupfs",
          "--events-backend",
          "file",
        ],
        shellQuote
      ),
      " "
    );
    const wrapper = path.join(outputRoot, "native-yeet.sh");
    yield* fs.writeFileString(
      wrapper,
      A.join(
        [
          "set -eu",
          `${podman} tag ${shellQuote(runtime.image)} ${shellQuote(imageTag)}`,
          `${podman} system service --time=0 unix:///output/docker.sock > /output/oci-service.log 2>&1 &`,
          "service_pid=$!",
          'trap \'kill "$service_pid" 2>/dev/null || true; wait "$service_pid" 2>/dev/null || true\' EXIT INT TERM',
          'for attempt in $(seq 1 100); do [ -S /output/docker.sock ] && break; kill -0 "$service_pid"; sleep 0.05; done',
          A.join(A.map(["/usr/bin/python3", "/relay/inner.py", ...argv], shellQuote), " "),
        ],
        "\n"
      ),
      { mode: 0o600 }
    );
    nativeWrapper = O.some(wrapper);
    const bootstrap = path.join(outputRoot, "oci-bootstrap");
    processCommand = "/usr/bin/podman";
    processPrefix = [
      "--root",
      path.join(bootstrap, "storage"),
      "--runroot",
      path.join(bootstrap, "run"),
      "--storage-driver",
      "vfs",
      "--cgroup-manager",
      "cgroupfs",
      "--events-backend",
      "file",
      "unshare",
      "/usr/bin/bwrap",
    ];
    const outerHome = path.join(outputRoot, "bootstrap-home");
    const outerRun = path.join(outputRoot, "bootstrap-run");
    yield* fs.makeDirectory(outerHome, { mode: 0o700 });
    yield* fs.makeDirectory(outerRun, { mode: 0o700 });
    const bootstrapConfig = path.join(outputRoot, "bootstrap-containers.conf");
    yield* fs.writeFileString(
      bootstrapConfig,
      '[engine]\nruntime="runc"\ncgroup_manager="cgroupfs"\nevents_logger="file"\n',
      { mode: 0o600 }
    );
    outerEnvironment = {
      HOME: outerHome,
      PATH: "/usr/bin:/bin",
      XDG_CONFIG_HOME: path.join(outerHome, ".config"),
      XDG_RUNTIME_DIR: outerRun,
      CONTAINERS_CONF: bootstrapConfig,
      CONTAINERS_STORAGE_CONF: path.join(runtime.system.root, "usr/share/containers/storage.conf"),
    };
    const additions = {
      HOME: "/output/native-home",
      BUN_INSTALL_CACHE_DIR: "/output/bun-cache",
      BUN_TMPDIR: "/tmp",
      XDG_RUNTIME_DIR: "/output/native-run",
      DOCKER_HOST: "unix:///output/docker.sock",
      CONTAINERS_CONF: "/output/containers.conf",
      CONTAINERS_STORAGE_CONF: "/usr/share/containers/storage.conf",
      HTTPS_PROXY: "http://127.0.0.1:18080",
      HTTP_PROXY: "http://127.0.0.1:18080",
      NO_PROXY: "localhost,127.0.0.1",
      SSL_CERT_FILE: "/runtime/certificates.pem",
      NIX_REMOTE: "local",
      NIX_CONFIG: "experimental-features = nix-command flakes\nsandbox = false\nsubstitute = false\nmax-jobs = 0\n",
    };
    for (const [key, value] of R.toEntries(additions)) {
      if (environment[key] !== value)
        return yield* AgentTrialError.make({
          stage: "proof",
          message: "Native runtime environment differs from frozen contract",
        });
    }
    yield* fs.makeDirectory(path.join(outputRoot, "native-run"), { mode: 0o700 });
  }
  args.push("--clearenv", "--setenv", "HOME", "/nonexistent");
  for (const [key, value] of Object.entries(environment)) args.push("--setenv", key, value);
  args.push(
    "--chdir",
    "/workspace",
    "--",
    ...O.match(nativeWrapper, { onNone: () => argv, onSome: () => ["/bin/sh", "/output/native-yeet.sh"] })
  );
  const before = yield* inspect(["rev-parse", "HEAD"]);
  const status = yield* inspect(["status", "--porcelain"]);
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
    command: processCommand,
    args: [...processPrefix, ...args],
    cwd: outputRoot,
    env: outerEnvironment,
    extendEnv: false,
    timeout: check.timeoutMs,
    forceKillAfter: "1 second",
    stdoutPath,
    stderrPath,
  });
  yield* validateNative();
  let nativeRuntimeEvidence = O.none<TrialArtifact>();
  if (O.isSome(native) && O.isSome(manifestCopy) && O.isSome(manifestBefore)) {
    const runtime = native.value;
    if (runtime.bunInstallCache === undefined || O.isNone(bunCacheBefore))
      return yield* AgentTrialError.make({
        stage: "proof",
        message: "Native Bun cache initialization evidence is missing",
      });
    const afterCache = yield* captureTrialInventory(path.join(outputRoot, "bun-cache"));
    const cacheAfterPath = path.join(outputRoot, "bun-cache-after.json");
    yield* fs.writeFileString(
      cacheAfterPath,
      yield* S.encodeEffect(S.fromJsonString(TrialInputInventory))(afterCache),
      { flag: "wx", mode: 0o600 }
    );
    const evidence = TrialNativeRuntimeEvidence.make({
      schemaVersion: "agent-trial-native-runtime-evidence/v1",
      runtimeDigest: yield* hashPublicTextSha256(
        yield* S.encodeEffect(S.fromJsonString(TrialNativeYeetRuntime))(runtime)
      ),
      manifestBefore: manifestBefore.value,
      manifestAfter: yield* hashTrialInput(manifestCopy.value),
      preserved: true,
      systemDigest: runtime.system.digest,
      nixDigest: runtime.nix.digest,
      ociDigest: runtime.oci.digest,
      image: runtime.image,
      bunCacheSeedDigest: runtime.bunInstallCache.digest,
      bunCacheBefore: bunCacheBefore.value,
      bunCacheAfter: yield* trialArtifact(cacheAfterPath),
      bunCacheTarget: "/output/bun-cache",
    });
    if (evidence.manifestAfter !== evidence.manifestBefore)
      return yield* AgentTrialError.make({ stage: "proof", message: "Native manifest overlay changed" });
    const file = path.join(outputRoot, "native-runtime-evidence.json");
    yield* fs.writeFileString(file, yield* S.encodeEffect(S.fromJsonString(TrialNativeRuntimeEvidence))(evidence), {
      flag: "wx",
      mode: 0o600,
    });
    nativeRuntimeEvidence = O.some(yield* trialArtifact(file));
  }
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
  const after = yield* inspect(["rev-parse", "HEAD"]);
  const dirty = yield* inspect(["status", "--porcelain"]);
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
      protectionRoots,
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
    ...(O.isSome(trackedRootInventory) ? { trackedRootInventory: trackedRootInventory.value } : {}),
    ...(O.isSome(trackedRootStderr) ? { trackedRootStderr: trackedRootStderr.value } : {}),
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
    ...(O.isSome(nativeRuntimeEvidence) ? { nativeRuntimeEvidence: nativeRuntimeEvidence.value } : {}),
  };
}, Effect.scoped);

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
    request.yeet.nativeRuntime === undefined ||
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
  yield* acquireTrialRetentionLease(attempt.plan.path);
  const source = yield* reconstructTrialSource(
    request.reconstructionRoot,
    attempt.bundle.value,
    O.fromUndefinedOr(plan.baseBundle),
    attempt.terminal.finalCommit,
    attempt.baseCommit,
    request.yeet.nativeRuntime.system
  );
  if (
    !A.every(
      request.checks,
      (check) =>
        check.sparseSystem?.digest === request.yeet.nativeRuntime?.system.digest &&
        check.sparseSystem?.root === request.yeet.nativeRuntime?.system.root
    )
  )
    return yield* AgentTrialError.make({
      stage: "proof",
      message: "Acceptance checks require the same declared native system",
    });
  const acceptance = yield* collectTrialAcceptance(
    plan,
    source.source,
    request.checks,
    A.filter(request.runtime, (mount) => mount.target !== "/inputs/base-origin"),
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
}, Effect.scoped);
