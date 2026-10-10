/**
 * Protected disposable trial TrialExecutor operations.
 * @packageDocumentation
 * @since 0.0.0
 */
import * as A from "effect/Array";
import * as Cause from "effect/Cause";
import * as Clock from "effect/Clock";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as Fiber from "effect/Fiber";
import * as FileSystem from "effect/FileSystem";
import * as O from "effect/Option";
import * as Path from "effect/Path";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { hashFileSha256 } from "../../../internal/cli/FsGuards.ts";
import { repoRunOutputBound, runCaptured, runSpooledStreams } from "../../../internal/process/StepExec.ts";
import { AgentTrialError } from "../AgentEffectiveness.errors.ts";
import {
  TrialArtifact,
  TrialAttempt,
  TrialAttemptJson,
  TrialPlanJson,
  TrialSessionIdentity,
  TrialStarted,
  TrialStartedJson,
} from "../AgentEffectiveness.trials.schemas.ts";
import {
  buildTrialSandbox,
  deriveTrialInvocation,
  hashTrialInput,
  inspectTrialGit,
  trialGitSandbox,
} from "./TrialIsolation.ts";
import { TrialBrokerControl, TrialNativeInvocationJson, TrialProductiveCanaries } from "./TrialProfile.schemas.ts";
import {
  acquireTrialRetentionLease,
  initializeTrialRetentionOwnership,
  recordTrialRetentionCapture,
} from "./TrialRetention.ts";
import { parseTrialSessionIdentity, parseTrialUsage } from "./TrialUsage.ts";
import type { TrialPlan } from "../AgentEffectiveness.trials.schemas.ts";
import type { TrialProductiveProfile } from "./TrialProfile.schemas.ts";

const privateOptions = { flag: "wx" as const, mode: 0o600 };
const gitEnvironment = { PATH: "/usr/bin:/bin", HOME: "/nonexistent", GIT_CONFIG_NOSYSTEM: "1", LC_ALL: "C" };
const gitControls = [
  "-c",
  "core.hooksPath=/dev/null",
  "-c",
  "core.fsmonitor=false",
  "-c",
  "credential.helper=",
  "-c",
  "core.pager=cat",
];
const git = Effect.fn("AgentEffectiveness.trialGit")(function* (cwd: string, args: ReadonlyArray<string>) {
  const result = yield* runCaptured({
    command: "/usr/bin/git",
    args: [...gitControls, ...args],
    cwd,
    env: gitEnvironment,
    extendEnv: false,
    timeout: "30 seconds",
    forceKillAfter: "1 second",
    bound: repoRunOutputBound,
  });
  if (result.exitCode !== 0 || result.truncated)
    return yield* AgentTrialError.make({
      stage: "git",
      message: "Disposable Git operation failed; retain the attempt for diagnosis",
    });
  return Str.trim(result.output);
});

/**
 * Hash a retained private artifact through the existing streaming hash helper.
 * **Example** (Retain a protected reference)
 * ```ts
 * import { trialArtifact } from "@beep/repo-cli/test/AgentEffectiveness"
 * console.log(trialArtifact)
 * ```
 * @category execution
 * @since 0.0.0
 */
export const trialArtifact = Effect.fn("AgentEffectiveness.trialArtifact")(function* (file: string) {
  const digest = yield* hashFileSha256(file, (cause) =>
    AgentTrialError.make({ stage: "receipt", message: "Cannot hash retained trial artifact", cause })
  );
  return TrialArtifact.make({ path: file, digest });
});

/**
 * Execute a frozen invocation in an independent local repository and namespace.
 * **Details**
 * Receipt and workspace roots must be fresh, disjoint, absolute sibling roots.
 * sourceDigest is SHA-256 of `git archive --format=tar <baseCommit>`. All failed
 * starts remain immutable attempts. Source retrieval is local, exact and never
 * creates an origin remote. The executor makes only local retention commits.
 * Trusted evaluator canaries and pinned inputs are required before launch.
 * **Example** (Inspect the execution entry point)
 * ```ts
 * import { executeTrial } from "@beep/repo-cli/test/AgentEffectiveness"
 * console.log(executeTrial)
 * ```
 * @category execution
 * @since 0.0.0
 */
export const executeTrial = Effect.fn("AgentEffectiveness.executeTrial")(function* (planPath: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const planText = yield* fs.readFileString(planPath);
  const plan = yield* TrialPlanJson.decode(planText);
  const state = path.join(plan.workspaceRoot, `${plan.runId}-${plan.attemptId}`);
  const receipts = path.join(plan.receiptRoot, `${plan.runId}-${plan.attemptId}`);
  const workspace = path.join(state, "worktree");
  const repository = path.join(state, "repository.git");
  const disjoint = (left: string, right: string) =>
    left !== right && !Str.startsWith(`${right}/`)(left) && !Str.startsWith(`${left}/`)(right);
  if (
    !A.every([plan.workspaceRoot, plan.receiptRoot, plan.sourceRepository], path.isAbsolute) ||
    !disjoint(state, receipts) ||
    !disjoint(state, plan.sourceRepository) ||
    !disjoint(receipts, plan.sourceRepository) ||
    Str.startsWith("/tmp/")(state)
  )
    return yield* AgentTrialError.make({
      stage: "plan",
      message: "Trial roots must be absolute, disjoint and outside tmpfs",
    });
  yield* fs.makeDirectory(plan.receiptRoot, { recursive: true, mode: 0o700 });
  yield* fs.makeDirectory(receipts, { mode: 0o700 });
  const frozenPlanPath = path.join(receipts, "plan.json");
  yield* fs.writeFileString(frozenPlanPath, planText, privateOptions);
  const stdoutPath = path.join(receipts, "stdout.jsonl");
  const stderrPath = path.join(receipts, "stderr.log");
  const diffPath = path.join(receipts, "candidate.diff");
  const startedAt = yield* Clock.currentTimeMillis;
  const started = TrialStarted.make({
    schemaVersion: "agent-trial-started/v1",
    plan: yield* trialArtifact(frozenPlanPath),
    runId: plan.runId,
    attemptId: plan.attemptId,
    startedAtEpochMillis: startedAt,
  });
  yield* fs.writeFileString(
    path.join(receipts, "started.json"),
    yield* TrialStartedJson.encode(started),
    privateOptions
  );
  let codingStartedAt: O.Option<number> = O.none();
  let codingElapsedMs: O.Option<number> = O.none();
  let exitCode: O.Option<number> = O.none();
  let finalCommit: O.Option<string> = O.none();
  let bundle: O.Option<TrialArtifact> = O.none();
  let nativeInvocation: O.Option<TrialArtifact> = O.none();
  const outcome = yield* Effect.exit(
    Effect.gen(function* () {
      yield* fs.makeDirectory(plan.workspaceRoot, { recursive: true, mode: 0o700 });
      yield* fs.makeDirectory(state, { mode: 0o700 });
      yield* initializeTrialRetentionOwnership(frozenPlanPath);
      yield* acquireTrialRetentionLease(frozenPlanPath);
      yield* git(state, ["init", "--bare", repository]);
      if (plan.baseBundle !== undefined) {
        if ((yield* hashTrialInput(plan.baseBundle.path)) !== plan.baseBundle.digest)
          return yield* AgentTrialError.make({ stage: "source", message: "Frozen ancestor-only base bundle changed" });
        const heads = yield* git(state, ["bundle", "list-heads", plan.baseBundle.path]);
        if (heads !== `${plan.baseCommit} HEAD`)
          return yield* AgentTrialError.make({ stage: "source", message: "Base bundle exposes non-base refs" });
        yield* git(state, ["--git-dir", repository, "bundle", "unbundle", plan.baseBundle.path]);
      } else {
        yield* git(state, [
          "--git-dir",
          repository,
          "fetch",
          "--no-tags",
          "--depth=1",
          plan.sourceRepository,
          plan.baseCommit,
        ]);
      }
      const sourceArchive = path.join(receipts, "base.tar");
      const archiveError = path.join(receipts, "archive.stderr");
      const archiveExit = yield* runSpooledStreams({
        command: "/usr/bin/git",
        args: [...gitControls, "--git-dir", repository, "archive", "--format=tar", plan.baseCommit],
        env: gitEnvironment,
        extendEnv: false,
        stdoutPath: sourceArchive,
        stderrPath: archiveError,
        timeout: "30 seconds",
        forceKillAfter: "1 second",
      });
      if (archiveExit !== 0 || (yield* trialArtifact(sourceArchive)).digest !== plan.sourceDigest)
        return yield* AgentTrialError.make({
          stage: "source",
          message: "Exact base archive does not match frozen source digest",
        });
      yield* git(state, ["--git-dir", repository, "worktree", "add", "--detach", workspace, plan.baseCommit]);
      yield* fs.remove(path.join(repository, "FETCH_HEAD"), { force: true });
      if (
        (yield* git(workspace, ["remote"])) !== "" ||
        (yield* git(workspace, ["for-each-ref", "--format=%(refname)"])) !== ""
      )
        return yield* AgentTrialError.make({
          stage: "source",
          message: "Disposable repository unexpectedly contains remote or other branch refs",
        });
      let args: Array<string>;
      // No attestation/config shape can substitute for an observed network boundary.
      if (plan.networkAdmission === "blocked-until-broker") {
        yield* buildTrialSandbox(plan, workspace);
        return yield* AgentTrialError.make({
          stage: "network",
          message:
            "Native inference admission is blocked until an observed narrowly forwarded network broker is implemented",
        });
      }
      const profile = yield* admitProductiveTrial(plan);
      const home = path.join(state, "home");
      yield* fs.makeDirectory(home, { mode: 0o700 });
      const socket = yield* startTrialBroker(profile, receipts);
      args = yield* buildTrialSandbox(plan, workspace, { socket, home });
      const invocation = yield* deriveTrialInvocation(plan);
      const invocationPath = path.join(receipts, "native-invocation.json");
      yield* fs.writeFileString(invocationPath, yield* TrialNativeInvocationJson.encode(invocation), privateOptions);
      nativeInvocation = O.some(yield* trialArtifact(invocationPath));
      yield* fs.writeFileString(path.join(workspace, ".git"), "gitdir: /state/repository.git/worktrees/worktree\n", {
        mode: 0o600,
      });
      yield* fs.writeFileString(path.join(repository, "worktrees/worktree/gitdir"), "/workspace/.git\n", {
        mode: 0o600,
      });
      codingStartedAt = O.some(yield* Clock.currentTimeMillis);
      let processCommand = "/usr/bin/bwrap";
      let processArgs = args;
      if (profile.authentication === "memfd-oauth-only") {
        if (plan.provider !== "claude" || O.isNone(profile.authLauncher) || O.isNone(profile.authSource))
          return yield* AgentTrialError.make({
            stage: "network",
            message: "Claude OAuth memfd launcher closure is missing",
          });
        for (const artifact of [profile.authLauncher.value, profile.authSource.value])
          if ((yield* hashTrialInput(artifact.path)) !== artifact.digest)
            return yield* AgentTrialError.make({
              stage: "network",
              message: "Pinned OAuth projection helper or native auth source changed",
            });
        processCommand = profile.broker.interpreter.path;
        processArgs = [
          profile.authLauncher.value.path,
          "--source",
          profile.authSource.value.path,
          "--",
          "/usr/bin/bwrap",
          ...args,
        ];
      } else if (plan.provider === "claude")
        return yield* AgentTrialError.make({
          stage: "network",
          message: "Claude productive auth requires nonpersistent OAuth-only memfd projection",
        });
      yield* fs.writeFileString(
        path.join(receipts, "native-process-invocation.json"),
        yield* S.encodeEffect(S.fromJsonString(S.Unknown))({
          schemaVersion: "agent-trial-native-process/v1",
          controlsDigest: plan.configDigest,
          command: processCommand,
          args: processArgs,
          environment: gitEnvironment,
          nativeCommand: plan.command,
          nativeArgs: plan.args,
        }),
        privateOptions
      );
      const capture = yield* Effect.exit(
        runSpooledStreams({
          command: processCommand,
          args: processArgs,
          env: gitEnvironment,
          extendEnv: false,
          stdoutPath,
          stderrPath,
          timeout: plan.timeoutMs,
          forceKillAfter: "1 second",
        })
      );
      if (Exit.isSuccess(capture)) yield* recordTrialRetentionCapture(frozenPlanPath);
      const code = yield* capture;
      codingElapsedMs = O.some((yield* Clock.currentTimeMillis) - O.getOrElse(codingStartedAt, () => startedAt));
      exitCode = O.some(code);
    }).pipe(Effect.scoped)
  );
  if (O.isSome(codingStartedAt) && O.isNone(codingElapsedMs))
    codingElapsedMs = O.some((yield* Clock.currentTimeMillis) - codingStartedAt.value);
  // Retention is independent of process exit; timeout and spawn failure still
  // preserve a partial candidate. No post-coding Git operation runs on the host.
  const retention = yield* retainTrialCandidate(
    workspace,
    plan.baseCommit,
    receipts,
    O.fromUndefinedOr(plan.baseBundle)
  ).pipe(Effect.exit);
  if (Exit.isSuccess(retention) && O.isSome(retention.value)) {
    finalCommit = O.some(retention.value.value.finalCommit);
    bundle = O.some(retention.value.value.bundle);
  }
  for (const file of [stdoutPath, stderrPath, diffPath])
    if (!(yield* fs.exists(file))) yield* fs.writeFileString(file, "", privateOptions);
  if (Exit.isFailure(retention))
    yield* fs.writeFileString(
      path.join(receipts, "retention-failure.log"),
      Cause.pretty(retention.cause),
      privateOptions
    );
  if (Exit.isFailure(outcome))
    yield* fs.writeFileString(path.join(receipts, "failure.log"), Cause.pretty(outcome.cause), privateOptions);
  const indexStates = yield* Effect.forEach(
    A.filter(
      A.map(plan.mounts, (mount, index) => [index, mount] as const),
      ([, mount]) => mount.access === "resettable"
    ),
    ([index]) =>
      Effect.gen(function* () {
        const retained = path.join(state, "inputs", `${index}`);
        return (yield* fs.exists(retained))
          ? O.some(TrialArtifact.make({ path: retained, digest: yield* hashTrialInput(retained) }))
          : O.none();
      })
  );
  const sessionCollection = yield* Effect.exit(
    Effect.gen(function* () {
      const identitySources = [];
      let retainedBytes = 0;
      const ownedHome = path.join(state, "home");
      if (yield* fs.exists(ownedHome)) {
        const identityRoot = path.join(receipts, "native-sessions");
        yield* fs.makeDirectory(identityRoot, { mode: 0o700 });
        for (const relativePath of yield* fs.readDirectory(ownedHome, { recursive: true })) {
          const selected =
            plan.provider === "codex"
              ? Str.startsWith(".codex/sessions/")(relativePath) && Str.endsWith(".jsonl")(relativePath)
              : plan.provider === "claude"
                ? Str.startsWith(".claude/projects/")(relativePath) && Str.endsWith(".jsonl")(relativePath)
                : Str.startsWith(".grok/sessions/")(relativePath) &&
                  (Str.endsWith("/summary.json")(relativePath) || /\/subagents\/[^/]+\/meta\.json$/.test(relativePath));
          if (!selected) continue;
          const inputPath = path.join(ownedHome, relativePath);
          if ((yield* fs.realPath(inputPath)) !== inputPath)
            return yield* AgentTrialError.make({
              stage: "usage",
              message: "Native session artifact escaped its owned home",
            });
          const bytes = Number((yield* fs.stat(inputPath)).size);
          retainedBytes += bytes;
          if (bytes > 64 * 1024 * 1024 || retainedBytes > 256 * 1024 * 1024 || identitySources.length >= 256)
            return yield* AgentTrialError.make({
              stage: "usage",
              message: "Native session evidence exceeds bounded collection capacity",
            });
          const raw = yield* fs.readFileString(inputPath);
          const retained = path.join(identityRoot, `${identitySources.length}.raw`);
          yield* fs.writeFileString(retained, raw, privateOptions);
          identitySources.push({ artifact: yield* trialArtifact(retained), relativePath, raw });
        }
      }
      return yield* parseTrialSessionIdentity(plan.provider, identitySources);
    })
  );
  if (Exit.isFailure(sessionCollection))
    yield* fs.writeFileString(
      path.join(receipts, "native-session-collection-failure.log"),
      Cause.pretty(sessionCollection.cause),
      privateOptions
    );
  const nativeSessionIdentity = Exit.isSuccess(sessionCollection)
    ? sessionCollection.value
    : TrialSessionIdentity.make({ artifacts: [], observations: [], malformedLines: 1, childCoverage: "unknown" });
  const usage = yield* parseTrialUsage(plan.provider, yield* fs.readFileString(stdoutPath), plan.selectedToolNames);
  const elapsedMs = (yield* Clock.currentTimeMillis) - startedAt;
  const terminal =
    Exit.isFailure(outcome) || Exit.isFailure(retention) || Exit.isFailure(sessionCollection)
      ? {
          status: "aborted" as const,
          reason: "Setup, timeout or execution boundary failed; raw attempt artifacts retained",
        }
      : O.getOrElse(exitCode, () => -1) !== 0 ||
          usage.coverage !== "complete" ||
          nativeSessionIdentity.malformedLines !== 0
        ? { status: "failed" as const, reason: "Native process failed or stream coverage is incomplete" }
        : O.isSome(finalCommit)
          ? { status: "awaiting-proof" as const, finalCommit: finalCommit.value }
          : { status: "failed" as const, reason: "No exact final commit retained" };
  const attempt = TrialAttempt.make({
    schemaVersion: "agent-trial-attempt/v1",
    plan: yield* trialArtifact(frozenPlanPath),
    nativeInvocation,
    nativeSessionIdentity,
    sourceArchive: (yield* fs.exists(path.join(receipts, "base.tar")))
      ? O.some(yield* trialArtifact(path.join(receipts, "base.tar")))
      : O.none(),
    runId: plan.runId,
    attemptId: plan.attemptId,
    baseCommit: plan.baseCommit,
    workspace,
    elapsedMs,
    setupElapsedMs: O.map(codingStartedAt, (at) => at - startedAt),
    codingElapsedMs,
    retentionElapsedMs: O.map(
      O.all([codingStartedAt, codingElapsedMs]),
      ([at, coding]) => elapsedMs - (at - startedAt) - coding
    ),
    exitCode,
    stdout: yield* trialArtifact(stdoutPath),
    stderr: yield* trialArtifact(stderrPath),
    diff: yield* trialArtifact(diffPath),
    bundle,
    indexStates: A.getSomes(indexStates),
    usage,
    terminal,
  });
  const receiptPath = path.join(receipts, "attempt.json");
  yield* fs.writeFileString(receiptPath, yield* TrialAttemptJson.encode(attempt), privateOptions);
  return receiptPath;
});

/**
 * Retain a partial or complete candidate independently of native process exit.
 * **Details**
 * All Git access stays offline inside the owned trial namespace. Exclusive raw
 * spools prevent overwriting a previous retention receipt.
 * **Example** (Inspect the retention operation)
 * ```ts
 * import { retainTrialCandidate } from "@beep/repo-cli/test/AgentEffectiveness"
 * console.log(retainTrialCandidate)
 * ```
 * @category execution
 * @since 0.0.0
 */
export const retainTrialCandidate = Effect.fn("AgentEffectiveness.retainTrialCandidate")(function* (
  workspace: string,
  baseCommit: string,
  receipts: string,
  baseBundle: O.Option<TrialArtifact> = O.none()
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const diffPath = path.join(receipts, "candidate.diff");
  if (!(yield* fs.exists(path.join(workspace, ".git")))) return O.none();
  const isolatedGit = Effect.fn(function* (args: ReadonlyArray<string>) {
    const result = yield* inspectTrialGit(workspace, args);
    if (result.exitCode !== 0 || result.truncated)
      return yield* AgentTrialError.make({ stage: "git", message: "Isolated candidate retention failed" });
    return Str.trim(result.output);
  });
  const ignoredExit = yield* runSpooledStreams({
    command: "/usr/bin/bwrap",
    args: yield* trialGitSandbox(workspace, ["ls-files", "--others", "--ignored", "--exclude-standard", "-z"]),
    env: {},
    extendEnv: false,
    stdoutPath: path.join(receipts, "ignored-files.nul"),
    stderrPath: path.join(receipts, "ignored-files.stderr"),
    timeout: "30 seconds",
    forceKillAfter: "1 second",
  });
  if (ignoredExit !== 0)
    return yield* AgentTrialError.make({ stage: "git", message: "Ignored source inventory could not be retained" });
  yield* isolatedGit(["add", "--all"]);
  const dirty = yield* isolatedGit(["status", "--porcelain"]);
  if (Str.isNonEmpty(dirty))
    yield* isolatedGit([
      "-c",
      "user.name=Trial Retention",
      "-c",
      "user.email=trial@localhost",
      "commit",
      "--no-verify",
      "-m",
      "chore: retain disposable trial candidate",
    ]);
  const head = yield* isolatedGit(["rev-parse", "HEAD"]);
  if ((yield* isolatedGit(["status", "--porcelain"])) !== "")
    return yield* AgentTrialError.make({ stage: "git", message: "Candidate is not clean at retention commit" });
  yield* isolatedGit(["merge-base", "--is-ancestor", baseCommit, head]);
  let bundleArtifact: TrialArtifact;
  if (head === baseCommit && O.isSome(baseBundle)) {
    if ((yield* hashTrialInput(baseBundle.value.path)) !== baseBundle.value.digest)
      return yield* AgentTrialError.make({ stage: "git", message: "Retained unchanged candidate base bundle differs" });
    bundleArtifact = baseBundle.value;
  } else {
    const bundlePath = path.join(receipts, "candidate.bundle");
    const bundleExit = yield* runSpooledStreams({
      command: "/usr/bin/bwrap",
      args: yield* trialGitSandbox(workspace, [
        "bundle",
        "create",
        "-",
        "--all",
        "HEAD",
        "--reflog",
        ...(O.isSome(baseBundle) ? [`^${baseCommit}`] : []),
      ]),
      env: {},
      extendEnv: false,
      stdoutPath: bundlePath,
      stderrPath: path.join(receipts, "bundle.stderr"),
      timeout: "30 seconds",
      forceKillAfter: "1 second",
    });
    if (bundleExit !== 0)
      return yield* AgentTrialError.make({ stage: "git", message: "Cannot retain isolated candidate bundle" });
    bundleArtifact = yield* trialArtifact(bundlePath);
  }
  const diffError = path.join(receipts, "diff.stderr");
  const diffExit = yield* runSpooledStreams({
    command: "/usr/bin/bwrap",
    args: yield* trialGitSandbox(workspace, ["diff", "--binary", "--no-ext-diff", "--no-textconv", baseCommit, head]),
    env: gitEnvironment,
    extendEnv: false,
    stdoutPath: diffPath,
    stderrPath: diffError,
    timeout: "30 seconds",
    forceKillAfter: "1 second",
  });
  if (diffExit !== 0)
    return yield* AgentTrialError.make({ stage: "git", message: "Cannot retain full candidate diff" });
  return O.some({ finalCommit: head, bundle: bundleArtifact });
});

/**
 * Start and release an evaluator-owned exact-authority broker within one attempt.
 * **Details**
 * The socket is the only network bridge exposed to the native namespace. The
 * broker's process and full private streams are scoped to this attempt. Fixture
 * loopback exceptions are rejected for productive admission.
 * **Example** (Inspect the network lifecycle)
 * ```ts
 * import { startTrialBroker } from "@beep/repo-cli/test/AgentEffectiveness"
 * console.log(startTrialBroker)
 * ```
 * @category execution
 * @since 0.0.0
 */
export const startTrialBroker = Effect.fn("AgentEffectiveness.startTrialBroker")(function* (
  profile: TrialProductiveProfile | TrialBrokerControl,
  receipts: string
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const broker = S.is(TrialBrokerControl)(profile) ? profile : profile.broker;
  for (const artifact of [broker.program, broker.interpreter, broker.relay, broker.policy, broker.canaries])
    if ((yield* hashTrialInput(artifact.path)) !== artifact.digest)
      return yield* AgentTrialError.make({ stage: "network", message: "Broker runtime, policy or evidence changed" });
  const policy = yield* S.decodeEffect(
    S.fromJsonString(S.Record(S.String, S.Struct({ fixture: S.optional(S.Boolean) })))
  )(yield* fs.readFileString(broker.policy.path));
  if (
    !A.makeEquivalence(Str.Equivalence)(
      A.sort(Object.keys(policy), Str.Order),
      A.sort(broker.authorities, Str.Order)
    ) ||
    A.some(Object.values(policy), (entry) => entry.fixture === true)
  )
    return yield* AgentTrialError.make({
      stage: "network",
      message: "Productive broker policy differs or permits fixture loopback",
    });
  const directory = path.join(receipts, "broker");
  yield* fs.makeDirectory(directory, { mode: 0o700 });
  const socketRoot = path.join(yield* Config.String("HOME"), ".cache/beep/trial-egress");
  yield* fs.makeDirectory(socketRoot, { recursive: true, mode: 0o700 });
  if ((yield* fs.realPath(socketRoot)) !== socketRoot)
    return yield* AgentTrialError.make({ stage: "network", message: "Broker socket root is noncanonical" });
  const socketDirectory = yield* fs.makeTempDirectoryScoped({ directory: socketRoot });
  const socket = path.join(socketDirectory, "egress.sock");
  // sockaddr_un limits the full host path even though the model sees /broker.
  if (socket.length > 103)
    return yield* AgentTrialError.make({
      stage: "network",
      message: "Owned broker socket path exceeds UNIX address limit",
    });
  const fiber = yield* runSpooledStreams({
    command: broker.interpreter.path,
    args: [
      broker.program.path,
      "--socket",
      socket,
      "--policy",
      broker.policy.path,
      "--events",
      path.join(directory, "events.jsonl"),
      "--max-seconds",
      String(broker.maxSeconds),
    ],
    cwd: directory,
    env: { PATH: "/usr/bin:/bin", HOME: "/nonexistent" },
    extendEnv: false,
    timeout: `${broker.maxSeconds + 5} seconds`,
    forceKillAfter: "1 second",
    stdoutPath: path.join(directory, "stdout.log"),
    stderrPath: path.join(directory, "stderr.log"),
  }).pipe(Effect.forkScoped);
  yield* Effect.addFinalizer(() =>
    Fiber.interrupt(fiber).pipe(Effect.andThen(fs.remove(socket, { force: true }).pipe(Effect.ignore)))
  );
  let ready = false;
  for (let index = 0; index < 100; index++) {
    if (yield* fs.exists(socket)) {
      ready = true;
      break;
    }
    const state = yield* Effect.sync(fiber.pollUnsafe);
    if (state !== undefined)
      return yield* AgentTrialError.make({ stage: "network", message: "Owned broker exited before socket admission" });
    yield* Effect.sleep("50 millis");
  }
  if (!ready)
    return yield* AgentTrialError.make({ stage: "network", message: "Owned broker socket did not become ready" });
  return socket;
});

/**
 * Validate productive canary evidence against the complete runner controls.
 * **Example** (Inspect complete admission)
 * ```ts
 * import { admitProductiveTrial } from "@beep/repo-cli/test/AgentEffectiveness"
 * console.log(admitProductiveTrial)
 * ```
 * @category execution
 * @since 0.0.0
 */
export const admitProductiveTrial = Effect.fn("AgentEffectiveness.admitProductiveTrial")(function* (plan: TrialPlan) {
  const fs = yield* FileSystem.FileSystem;
  const profile = plan.productiveProfile;
  if (plan.baseBundle === undefined)
    return yield* AgentTrialError.make({
      stage: "source",
      message: "Productive trials require common ancestor-only base history",
    });
  if (
    profile === undefined ||
    plan.networkAdmission !== "exact-authority-broker" ||
    plan.delegation !== "native-common" ||
    profile.childPolicy.capability !== "native-common" ||
    profile.childPolicy.expectedModel !== plan.model ||
    profile.childPolicy.expectedEffort !== plan.effort ||
    profile.childPolicy.enforcement === "transport-disabled"
  )
    return yield* AgentTrialError.make({
      stage: "network",
      message: "Productive profile or common native child policy is incomplete",
    });
  if (
    profile.childPolicy.enforcement === "forced-env" &&
    (plan.provider !== "claude" || plan.environment.CLAUDE_CODE_SUBAGENT_MODEL !== plan.model)
  )
    return yield* AgentTrialError.make({
      stage: "network",
      message: "Forced child pin is not present in actual native environment",
    });
  if (plan.provider === "codex" && A.contains(plan.args, "--ephemeral"))
    return yield* AgentTrialError.make({
      stage: "network",
      message: "Productive Codex requires fresh owned session persistence",
    });
  for (const artifact of [
    profile.nativeSurface,
    profile.profileCanaries,
    ...profile.commonGuidance,
    ...profile.referenceInputs,
  ])
    if ((yield* hashTrialInput(artifact.path)) !== artifact.digest)
      return yield* AgentTrialError.make({ stage: "network", message: "Productive profile input or evidence changed" });
  const canaries = yield* S.decodeEffect(S.fromJsonString(TrialProductiveCanaries))(
    yield* fs.readFileString(profile.profileCanaries.path)
  );
  if (canaries.controlsDigest !== plan.configDigest)
    return yield* AgentTrialError.make({
      stage: "network",
      message: "Fixture profile evidence is not bound to this complete runner invocation",
    });
  const required = [
    "filesystem-read",
    "filesystem-edit",
    "compiler-positive",
    "compiler-negative",
    "local-commit",
    "interruption-retention",
    "private-path-denial",
    "other-arm-endpoint-denial",
    "push-denial",
    "broker-allowed",
    "broker-denied",
    "native-pin-controls",
    "child-scope",
    "assigned-hooks",
  ];
  for (const id of required) {
    const rows = A.filter(canaries.observations, (row) => row.id === id);
    if (rows.length !== 1 || rows[0]?.outcome !== "passed")
      return yield* AgentTrialError.make({
        stage: "network",
        message: "Required observed productive canary is missing, duplicated or failed",
      });
    for (const artifact of [rows[0].invocation, rows[0].stdout, rows[0].stderr])
      if ((yield* hashTrialInput(artifact.path)) !== artifact.digest)
        return yield* AgentTrialError.make({ stage: "network", message: "Productive canary command evidence changed" });
  }
  const surface = yield* S.decodeEffect(
    S.fromJsonString(S.Struct({ advertisedNames: S.Array(S.NonEmptyString).check(S.isUnique()) }))
  )(yield* fs.readFileString(profile.nativeSurface.path));
  if (
    !A.makeEquivalence(Str.Equivalence)(
      A.sort(surface.advertisedNames, Str.Order),
      A.sort(profile.allowedNativeToolNames, Str.Order)
    )
  )
    return yield* AgentTrialError.make({
      stage: "network",
      message: "Native advertised surface differs from approved tool registry",
    });
  return profile;
});
