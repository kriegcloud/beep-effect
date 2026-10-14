/**
 * Shared validated namespace construction for trial admission and finite qualification.
 * @packageDocumentation
 * @since 0.0.0
 */
import { $RepoCliId } from "@beep/identity/packages";
import { hashPublicTextSha256 } from "@beep/repo-ai-metrics/privacy";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as Path from "effect/Path";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { hashFileSha256 } from "../../../internal/cli/FsGuards.ts";
import { CapturedProcessTerminal, CapturedStreams } from "../../../internal/process/StepExec.ts";
import { AgentTrialError } from "../AgentEffectiveness.errors.ts";
import {
  TrialCandidateControls,
  TrialIsolationAttestation,
  TrialIsolationProbeId,
  TrialIsolationQualificationReport,
  TrialIsolationQualificationRequest,
  TrialNoIndexIsolationAttestation,
  TrialQualificationResourceEnvelope,
} from "../AgentEffectiveness.trials.schemas.ts";
import {
  hashTrialInput,
  trialControlsDigest,
  trialPlanSystem,
  trialSystemBindings,
  validateTrialInventory,
} from "./TrialIsolation.ts";
import type { TrialPlan } from "../AgentEffectiveness.trials.schemas.ts";

const $I = $RepoCliId.create("commands/AgentEffectiveness/internal/TrialSandbox");
const CompilerNegativeDiagnostic = S.Literal(
  "answer.ts(1,14): error TS2322: Type 'string' is not assignable to type 'number'."
).pipe(
  $I.annoteSchema("CompilerNegativeDiagnostic", {
    description: "Exact single diagnostic from the frozen negative assignment fixture.",
  })
);

/**
 * Recognize only the fixed compiler type-error observation from either captured stream.
 * **Details**
 * Normal compiler diagnostic statuses1/2 are accepted. Success, signal/setup
 * statuses, truncation, missing diagnostics and every additional output line fail.
 * **Example** (Validate a captured compiler diagnostic)
 * ```ts
 * import { isTrialCompilerNegative } from "@beep/repo-cli/test/AgentEffectiveness"
 * import { CapturedStreams } from "@beep/repo-cli/test/Process"
 * const observation = CapturedStreams.make({ exitCode: 1, truncated: false, stderr: "",
 *   stdout: "answer.ts(1,14): error TS2322: Type 'string' is not assignable to type 'number'.\n" })
 * console.log(isTrialCompilerNegative(observation)) // true
 * ```
 * @category predicates
 * @since 0.0.0
 */
export const isTrialCompilerNegative = (observation: CapturedStreams): boolean => {
  const lines = A.filter(A.flatMap([observation.stdout, observation.stderr], Str.split(/\r?\n/u)), Str.isNonEmpty);
  return (
    !observation.truncated &&
    A.contains([1, 2], observation.exitCode) &&
    A.length(lines) === 1 &&
    A.every(lines, S.is(CompilerNegativeDiagnostic))
  );
};

const fail = (message: string) => Effect.fail(AgentTrialError.make({ stage: "isolation", message }));

/**
 * Reject control profiles outside the finite no-tool qualification boundary.
 * **Example** (Inspect the no-index guard)
 * ```ts
 * import { validateNoIndexQualificationControls } from "./TrialSandbox.ts"
 * console.log(validateNoIndexQualificationControls)
 * ```
 * @internal
 * @category validation
 * @since 0.0.0
 */
export const validateNoIndexQualificationControls = Effect.fn(
  "AgentEffectiveness.validateNoIndexQualificationControls"
)(function* (plan: TrialCandidateControls) {
  if (
    plan.isolationQualificationVersion !== "no-assigned-index/v2" ||
    plan.toolId !== "none" ||
    A.isReadonlyArrayNonEmpty(plan.selectedToolNames) ||
    plan.assignedIndexTargets === undefined ||
    A.isReadonlyArrayNonEmpty(plan.assignedIndexTargets) ||
    plan.networkAdmission !== "blocked-until-broker" ||
    plan.productiveProfile !== undefined ||
    A.some(plan.mounts, (mount) => mount.access !== "readonly" || Str.startsWith("/tools/")(mount.target))
  )
    return yield* fail(
      "Unsupported qualification: require explicit no-tool/no-assigned-index blocked-network controls"
    );
});

/**
 * Validate and derive the shared namespace prefix without launching a native command.
 * **Details**
 * Command-internal only. Qualification requires the sealed system; this helper is
 * deliberately absent from command and test facades.
 * **Example** (Inspect shared derivation)
 * ```ts
 * import { deriveTrialNamespace } from "./TrialSandbox.ts"
 * console.log(deriveTrialNamespace)
 * ```
 * @internal
 * @category execution
 * @since 0.0.0
 */
export const deriveTrialNamespace = Effect.fn("AgentEffectiveness.deriveTrialNamespace")(function* (
  plan: TrialCandidateControls,
  workspace: string,
  productiveRuntime?: { readonly socket: string; readonly home: string },
  strictSystem?: boolean
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  if (!path.isAbsolute(plan.command) || !path.isAbsolute(workspace))
    return yield* fail("Trial command and workspace must be absolute");
  const system = O.getOrUndefined(yield* trialPlanSystem(plan));
  const requireSystem = strictSystem === true || plan.networkAdmission === "exact-authority-broker";
  for (const closure of plan.runtimeClosures ?? []) {
    if (
      closure.target !== "/workspace/node_modules" &&
      !/^\/workspace\/(?:packages|apps)\/[^.]+\/node_modules$/.test(closure.target) &&
      !Str.startsWith("/runtime/")(closure.target)
    )
      return yield* fail("Runtime projection target is not an approved dependency root");
    yield* validateTrialInventory(
      closure.inventory,
      closure.target,
      requireSystem && closure.target === "/runtime/system"
    );
    const source = closure.inventory.root;
    for (const protectedRoot of [plan.receiptRoot, plan.workspaceRoot, plan.sourceRepository]) {
      const root = yield* fs.realPath(protectedRoot);
      if (source === root || Str.startsWith(`${root}/`)(source) || Str.startsWith(`${source}/`)(root))
        return yield* fail("Runtime projection would expose private receipts or a shared source checkout");
    }
  }
  const forbiddenEnvironment = A.filter(R.keys(plan.environment), (key) =>
    A.contains(
      [
        "OPENAI_API_KEY",
        "ANTHROPIC_API_KEY",
        "XAI_API_KEY",
        "GOOGLE_API_KEY",
        "GH_TOKEN",
        "GITHUB_TOKEN",
        "SSH_AUTH_SOCK",
        "OP_SERVICE_ACCOUNT_TOKEN",
        "OP_CONNECT_TOKEN",
        "HOME",
        "CODEX_HOME",
        "HTTP_PROXY",
        "HTTPS_PROXY",
        "ALL_PROXY",
        "NO_PROXY",
        "http_proxy",
        "https_proxy",
        "all_proxy",
        "no_proxy",
      ],
      key
    )
  );
  if (A.isReadonlyArrayNonEmpty(forbiddenEnvironment))
    return yield* fail("Paid fallback, Git/secret credentials or ambient home overrides are forbidden");
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
    "--dir",
    "/work",
    "--dir",
    "/home",
    "--dir",
    "/home/trial",
    "--dir",
    "/state",
    "--bind",
    path.join(path.dirname(workspace), "repository.git"),
    "/state/repository.git",
    "--bind",
    workspace,
    "/workspace",
  ];
  args.push(...(yield* trialSystemBindings(system, requireSystem)));
  if (!requireSystem) {
    for (const file of ["/etc/ssl", "/etc/ca-certificates"]) {
      if (yield* fs.exists(file)) args.push("--ro-bind", file, file);
    }
  }
  for (const closure of plan.runtimeClosures ?? []) args.push("--ro-bind", closure.inventory.root, closure.target);
  if (productiveRuntime !== undefined) args.push("--bind", productiveRuntime.home, "/home/trial");
  const privateRoots = yield* Effect.forEach(
    [plan.receiptRoot, plan.workspaceRoot, plan.sourceRepository],
    fs.realPath
  );
  for (const [index, mount] of A.map(plan.mounts, (mount, index) => [index, mount] as const)) {
    const target = path.normalize(mount.target);
    const blocked = A.some(
      ["/", "/work", "/workspace", "/usr", "/bin", "/lib", "/lib64", "/proc", "/dev", "/etc", "/tmp"],
      (root) => target === root || (Str.startsWith(`${root}/`)(target) && A.contains(["/state", "/proc", "/dev"], root))
    );
    const allowedTarget = A.some(["/runtime/", "/tools/", "/inputs/", "/references/", "/home/trial/"], (prefix) =>
      Str.startsWith(prefix)(target)
    );
    if (
      !allowedTarget ||
      !path.isAbsolute(mount.source) ||
      !path.isAbsolute(mount.target) ||
      target !== mount.target ||
      blocked ||
      Str.startsWith("/workspace/")(target) ||
      Str.startsWith("/work/")(target) ||
      Str.startsWith("/proc/")(target) ||
      Str.startsWith("/dev/")(target)
    )
      return yield* fail("Mount is not a narrow declared input");
    const canonicalSource = yield* fs.realPath(mount.source);
    if (canonicalSource !== mount.source) return yield* fail("Mount source must be an exact canonical path");
    if (
      A.some(
        privateRoots,
        (privateRoot) =>
          privateRoot === mount.source ||
          Str.startsWith(`${mount.source}/`)(privateRoot) ||
          Str.startsWith(`${privateRoot}/`)(mount.source)
      )
    )
      return yield* fail("Mount exposes private state or a shared source ancestor");
    const digest = yield* hashTrialInput(mount.source);
    if (digest !== mount.digest) return yield* fail("Declared mount content changed after freeze");
    if (mount.access === "resettable") {
      const copy = path.join(path.dirname(workspace), "inputs", `${index}`);
      yield* fs.makeDirectory(path.dirname(copy), { recursive: true, mode: 0o700 });
      yield* fs.copy(mount.source, copy);
      if ((yield* hashTrialInput(copy)) !== mount.digest)
        return yield* fail("Reset index copy differs from frozen input");
      args.push("--bind", copy, mount.target);
    } else args.push("--ro-bind", mount.source, mount.target);
  }
  const commandMount = A.findFirst(
    plan.mounts,
    (mount) => plan.command === mount.target || Str.startsWith(`${mount.target}/`)(plan.command)
  );
  if (O.isNone(commandMount)) return yield* fail("Command must come from an explicit frozen mount");
  if (commandMount.value.access !== "readonly") return yield* fail("Native CLI binary must be immutable");
  const binary = path.join(commandMount.value.source, path.relative(commandMount.value.target, plan.command));
  if (
    (yield* hashFileSha256(binary, (cause) =>
      AgentTrialError.make({ stage: "isolation", message: "Cannot hash command", cause })
    )) !== plan.commandDigest
  )
    return yield* fail("Command binary changed");
  if ((yield* hashTrialInput(plan.promptPath)) !== plan.taskDigest) return yield* fail("Task prompt changed");
  args.push("--ro-bind", plan.promptPath, "/input/prompt");
  if (productiveRuntime !== undefined) {
    const profile = plan.productiveProfile;
    if (
      profile === undefined ||
      plan.networkAdmission !== "exact-authority-broker" ||
      (yield* fs.realPath(productiveRuntime.home)) !== productiveRuntime.home ||
      (yield* fs.realPath(productiveRuntime.socket)) !== productiveRuntime.socket ||
      (yield* hashTrialInput(profile.broker.relay.path)) !== profile.broker.relay.digest
    )
      return yield* fail("Productive runtime socket, home or relay is not the owned frozen bridge");
    args.push(
      "--ro-bind",
      productiveRuntime.socket,
      "/broker/egress.sock",
      "--ro-bind",
      profile.broker.relay.path,
      "/runtime/egress-relay"
    );
  } else if (plan.networkAdmission === "exact-authority-broker")
    return yield* fail("Productive network bridge is missing");

  args.push(
    "--clearenv",
    "--setenv",
    "HOME",
    "/home/trial",
    "--setenv",
    "PATH",
    "/usr/bin:/bin",
    "--setenv",
    "GIT_CONFIG_NOSYSTEM",
    "1",
    "--chdir",
    "/workspace"
  );
  for (const [key, value] of R.toEntries(plan.environment)) args.push("--setenv", key, value);
  if (productiveRuntime !== undefined) {
    for (const key of ["HTTP_PROXY", "HTTPS_PROXY", "ALL_PROXY", "http_proxy", "https_proxy", "all_proxy"])
      args.push("--setenv", key, "http://127.0.0.1:18080");
    args.push("--setenv", "NO_PROXY", "", "--setenv", "no_proxy", "");
    if (plan.provider === "codex") args.push("--setenv", "CODEX_HOME", "/home/trial/.codex");
  }
  return args;
});

/**
 * Build an empty-root filesystem view only after digest-bound canary admission.
 * **Details**
 * Mounts never fall back to a host-root bind. Attestations are evaluator-owned
 * prerequisites, not self-reported model observations. No global config, Git
 * credentials, other-arm state or receipt directory is mounted implicitly.
 * **Example** (Construct a fail-closed invocation)
 * ```ts
 * import { buildTrialSandbox } from "@beep/repo-cli/test/AgentEffectiveness"
 * console.log(buildTrialSandbox)
 * ```
 * @category execution
 * @since 0.0.0
 */
export const buildTrialSandbox = Effect.fn("AgentEffectiveness.buildTrialSandbox")(function* (
  plan: TrialPlan,
  workspace: string,
  productiveRuntime?: { readonly socket: string; readonly home: string }
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const attestationDigest = yield* hashFileSha256(plan.isolationAttestationPath, (cause) =>
    AgentTrialError.make({ stage: "isolation", message: "Cannot hash isolation attestation", cause })
  );
  if (attestationDigest !== plan.isolationAttestationDigest)
    return yield* fail("Isolation attestation digest mismatch");
  const attestation = yield* fs.readFileString(plan.isolationAttestationPath).pipe(
    Effect.flatMap(
      S.decodeUnknownEffect(S.fromJsonString(S.Union([TrialIsolationAttestation, TrialNoIndexIsolationAttestation])))
    ),
    Effect.mapError((cause) =>
      AgentTrialError.make({ stage: "isolation", message: "Missing or invalid isolation canaries", cause })
    )
  );
  if (
    (attestation.schemaVersion === "agent-trial-isolation/v1" && plan.isolationQualificationVersion !== undefined) ||
    attestation.configDigest !== plan.configDigest ||
    plan.configDigest !== (yield* trialControlsDigest(plan)) ||
    !A.makeEquivalence(Str.Equivalence)(attestation.exactDiscoveredToolNames, plan.selectedToolNames) ||
    attestation.delegationDisabled !== (plan.delegation === "disabled")
  )
    return yield* fail("Isolation canaries belong to different controls or tools");
  if (attestation.schemaVersion === "agent-trial-isolation/v2") {
    yield* validateNoIndexQualificationControls(plan);
    if ((yield* hashTrialInput(attestation.qualificationReportPath)) !== attestation.qualificationReportDigest)
      return yield* fail("Isolation qualification report digest mismatch");
    const report = yield* fs.readFileString(attestation.qualificationReportPath).pipe(
      Effect.flatMap(S.decodeUnknownEffect(S.fromJsonString(TrialIsolationQualificationReport))),
      Effect.mapError(() => AgentTrialError.make({ stage: "isolation", message: "Invalid qualification report" }))
    );
    if (
      report.status !== "qualified" ||
      report.configDigest !== plan.configDigest ||
      report.workspace !== workspace ||
      !O.contains(report.attestationPath, plan.isolationAttestationPath)
    )
      return yield* fail("Qualification report is not qualified for this exact workspace and receipt");
    yield* Effect.gen(function* () {
      if ((yield* hashTrialInput(report.request.path)) !== report.request.digest)
        return yield* fail("Qualification request artifact changed");
      const request = yield* fs
        .readFileString(report.request.path)
        .pipe(Effect.flatMap(S.decodeUnknownEffect(S.fromJsonString(TrialIsolationQualificationRequest))));
      if (
        !S.toEquivalence(TrialQualificationResourceEnvelope)(request.resourceEnvelope, report.resourceEnvelope) ||
        request.candidate.digest !== report.candidate.digest ||
        path.join(request.ownedRoot, "state", "worktree") !== workspace ||
        path.join(request.ownedRoot, "report.json") !== attestation.qualificationReportPath ||
        path.join(request.ownedRoot, "attestation.json") !== plan.isolationAttestationPath ||
        path.join(request.ownedRoot, "request.json") !== report.request.path ||
        path.join(request.ownedRoot, "candidate.json") !== report.candidate.path ||
        A.length(request.protectedSentinels) > 32 ||
        A.some(
          request.protectedSentinels,
          (sentinel) => path.dirname(sentinel) !== path.join(request.ownedRoot, "private")
        ) ||
        (yield* hashTrialInput(request.candidate.path)) !== request.candidate.digest
      )
        return yield* fail("Qualification request differs from its candidate or owned namespace paths");
    }).pipe(
      Effect.mapError((cause) =>
        S.is(AgentTrialError)(cause)
          ? cause
          : AgentTrialError.make({ stage: "isolation", message: "Missing or invalid qualification request", cause })
      )
    );
    if ((yield* hashTrialInput(report.candidate.path)) !== report.candidate.digest)
      return yield* fail("Qualification candidate artifact changed");
    const candidate = yield* fs
      .readFileString(report.candidate.path)
      .pipe(Effect.flatMap(S.decodeUnknownEffect(S.fromJsonString(TrialCandidateControls))));
    if ((yield* trialControlsDigest(candidate)) !== plan.configDigest)
      return yield* fail("Qualification candidate differs from requested native controls");
    if (
      !A.makeEquivalence(Str.Equivalence)(
        A.sort(
          A.map(report.observations, (observation) => observation.id),
          Str.Order
        ),
        A.sort(TrialIsolationProbeId.literals, Str.Order)
      )
    )
      return yield* fail("Qualification report omits or duplicates a fixed probe");
    for (const observation of report.observations) {
      const expected = Match.value(observation.id).pipe(
        Match.when("push-denied", () => 128),
        Match.orElse(() => 0)
      );
      if (
        (observation.id !== "compiler-negative" &&
          observation.id !== "interruption" &&
          !O.contains(observation.exitCode, expected)) ||
        observation.interrupted !== (observation.id === "interruption")
      )
        return yield* fail("Qualification report contains an unsuccessful probe");
      if (
        observation.id === "interruption" &&
        (O.isSome(observation.exitCode) ||
          observation.terminal === undefined ||
          !CapturedProcessTerminal.guards.Signalled(observation.terminal))
      )
        return yield* fail("Qualification interruption lacks an actual SIGTERM terminal event");
      for (const stream of [observation.stdout, observation.stderr])
        if ((yield* hashTrialInput(stream.path)) !== stream.digest)
          return yield* fail("Qualification probe capture changed");
      if (observation.id === "compiler-negative") {
        if (
          O.isNone(observation.exitCode) ||
          !isTrialCompilerNegative(
            CapturedStreams.make({
              exitCode: observation.exitCode.value,
              stdout: yield* fs.readFileString(observation.stdout.path),
              stderr: yield* fs.readFileString(observation.stderr.path),
              truncated: false,
            })
          )
        )
          return yield* fail("Qualification compiler negative is not the frozen diagnostic");
      }
    }
    const prefix = yield* deriveTrialNamespace(plan, workspace, productiveRuntime, true);
    if (
      (yield* hashPublicTextSha256(yield* S.String.pipe(S.Array, S.fromJsonString, S.encodeEffect)(prefix))) !==
      report.namespaceDigest
    )
      return yield* fail("Qualified namespace prefix differs from native consumer");
  }
  const args = yield* deriveTrialNamespace(
    plan,
    workspace,
    productiveRuntime,
    attestation.schemaVersion === "agent-trial-isolation/v2"
  );
  if (productiveRuntime !== undefined) {
    args.push(
      "--",
      "/bin/sh",
      "-c",
      `/runtime/egress-relay TCP4-LISTEN:18080,bind=127.0.0.1,reuseaddr,fork UNIX-CONNECT:/broker/egress.sock >/dev/null 2>&1 & relay=$!; trap 'kill "$relay" 2>/dev/null || true' EXIT TERM INT; "$@" < /input/prompt; status=$?; exit "$status"`,
      "agent-trial",
      plan.command,
      ...plan.args
    );
  } else args.push("--", "/bin/sh", "-c", 'exec "$@" < /input/prompt', "agent-trial", plan.command, ...plan.args);
  return args;
});
