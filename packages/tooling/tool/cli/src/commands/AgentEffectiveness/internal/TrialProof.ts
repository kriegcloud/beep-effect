/**
 * Protected disposable trial TrialProof operations.
 * @packageDocumentation
 * @since 0.0.0
 */

import { hashPublicTextSha256 } from "@beep/repo-ai-metrics/privacy";
import { AiMetricsBenchmarkRunInput } from "@beep/repo-ai-metrics/scorecard";
import * as A from "effect/Array";
import * as Clock from "effect/Clock";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as O from "effect/Option";
import * as Path from "effect/Path";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { YeetVerdictJson } from "../../Yeet/internal/Verdict.ts";
import { AgentTrialError } from "../AgentEffectiveness.errors.ts";
import {
  TrialAcceptanceJson,
  TrialAttemptJson,
  TrialCollectRequestJson,
  TrialFinalization,
  TrialFinalizationJson,
  TrialPlanJson,
  TrialProofJson,
} from "../AgentEffectiveness.trials.schemas.ts";
import {
  inspectTrialControlRefs,
  parseTrialTrackedRoots,
  trialMountGuardPaths,
  validateTrialIgnoreCensus,
} from "./TrialCollector.ts";
import { trialArtifact } from "./TrialExecutor.ts";
import {
  deriveTrialInvocation,
  deriveTrialRuntimeControlsDigest,
  hashTrialInput,
  inspectTrialGit,
  trialCheckContractDigest,
  trialInventoryDigest,
  validateTrialInventory,
  validateTrialNativeRuntime,
  validateTrialRequestChecks,
} from "./TrialIsolation.ts";
import {
  TrialBootstrapFile,
  TrialCommittedSourceJson,
  TrialEvaluatorCheck,
  TrialGitRefGuard,
  TrialGitRefState,
  TrialInputInventory,
  TrialMountGuardEvidence,
  TrialNativeInvocationJson,
  TrialNativeRuntimeEvidence,
  TrialNativeYeetRuntime,
} from "./TrialProfile.schemas.ts";
import type { Sha256Hex } from "@beep/schema/Sha256";
import type { TrialArtifact } from "../AgentEffectiveness.trials.schemas.ts";
import type { TrialMountGuardPhase } from "./TrialProfile.schemas.ts";

const equalNames = A.makeEquivalence(Str.Equivalence);
const fail = (message: string) => Effect.fail(AgentTrialError.make({ stage: "proof", message }));

/**
 * Validate retained Bun cache lifecycle without requiring the mutable cache tree.
 * **Details**
 * Snapshot file hashes, canonical inventory digests and exact output paths are
 * required independently. The seed remains a separate immutable runtime input.
 * **Example** (Compose evidence validation after decoding)
 * ```ts
 * import { TrialInputInventory, TrialNativeRuntimeEvidence, validateTrialBunCacheEvidence } from "@beep/repo-cli/test/AgentEffectiveness"
 * import * as Effect from "effect/Effect"
 * import * as S from "effect/Schema"
 * const valid = Effect.gen(function* () {
 *   const seed = yield* S.decodeUnknownEffect(TrialInputInventory)({})
 *   const evidence = yield* S.decodeUnknownEffect(TrialNativeRuntimeEvidence)({})
 *   return yield* validateTrialBunCacheEvidence(seed, evidence, "/owned/output", {})
 * })
 * console.log(Effect.isEffect(valid)) // true: incomplete evidence remains a failing computation.
 * ```
 * @category validation
 * @since 0.0.0
 */
export const validateTrialBunCacheEvidence = Effect.fn("AgentEffectiveness.validateTrialBunCacheEvidence")(function* (
  seed: TrialInputInventory,
  evidence: TrialNativeRuntimeEvidence,
  output: string,
  environment: Readonly<Record<string, string>>
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  if (
    evidence.bunCacheSeedDigest !== seed.digest ||
    evidence.bunCacheBefore === undefined ||
    evidence.bunCacheAfter === undefined ||
    evidence.bunCacheTarget !== "/output/bun-cache" ||
    evidence.bunCacheBefore.path !== path.join(output, "bun-cache-before.json") ||
    evidence.bunCacheAfter.path !== path.join(output, "bun-cache-after.json") ||
    environment.BUN_INSTALL_CACHE_DIR !== "/output/bun-cache" ||
    environment.BUN_TMPDIR !== "/tmp"
  )
    return false;
  for (const artifact of [evidence.bunCacheBefore, evidence.bunCacheAfter])
    if ((yield* hashTrialInput(artifact.path)) !== artifact.digest) return false;
  const before = yield* S.decodeEffect(S.fromJsonString(TrialInputInventory))(
    yield* fs.readFileString(evidence.bunCacheBefore.path)
  );
  const after = yield* S.decodeEffect(S.fromJsonString(TrialInputInventory))(
    yield* fs.readFileString(evidence.bunCacheAfter.path)
  );
  return (
    before.root === path.join(output, "bun-cache") &&
    after.root === before.root &&
    before.digest === seed.digest &&
    (yield* trialInventoryDigest(before)) === before.digest &&
    (yield* trialInventoryDigest(after)) === after.digest
  );
});

/**
 * Validate complete batch-query coverage and every retained raw artifact.
 * **Example** (Keep malformed evidence in the error channel)
 * ```ts
 * import { TrialArtifact, validateTrialMountGuardEvidence } from "@beep/repo-cli/test/AgentEffectiveness"
 * import * as Effect from "effect/Effect"
 * import * as S from "effect/Schema"
 * const valid = S.decodeUnknownEffect(TrialArtifact)({}).pipe(Effect.flatMap((artifact) => validateTrialMountGuardEvidence(artifact, "vendor", [], "/owned/output")))
 * console.log(Effect.isEffect(valid)) // true
 * ```
 * @category validation
 * @since 0.0.0
 */
export const validateTrialMountGuardEvidence = Effect.fn("AgentEffectiveness.validateTrialMountGuardEvidence")(
  function* (
    artifact: TrialArtifact,
    phase: TrialMountGuardPhase,
    targets: ReadonlyArray<string>,
    outputRoot: string,
    system?: TrialInputInventory
  ) {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const stem = path.join(outputRoot, `mount-guard-${phase}`);
    if (artifact.path !== stem + ".json" || (yield* hashTrialInput(artifact.path)) !== artifact.digest) return false;
    const data = yield* S.decodeEffect(S.fromJsonString(TrialMountGuardEvidence))(
      yield* fs.readFileString(artifact.path)
    );
    const relative = yield* trialMountGuardPaths(phase, targets);
    const suffix = phase === "vendor" ? ".runner-input-probe" : ".runner-output-probe";
    const probes = A.map(relative, (name) => `${name}/${suffix}`);
    if (
      data.phase !== phase ||
      !data.passed ||
      !equalNames(data.targets, targets) ||
      !equalNames(data.probePaths, probes) ||
      data.queriesIssued !== (A.isReadonlyArrayEmpty(targets) ? 0 : 2) ||
      data.trackedExitCode !== 0 ||
      data.ignoredExitCode !== 0 ||
      data.systemDigest !== system?.digest ||
      data.systemRoot !== system?.root
    )
      return false;
    for (const [file, name] of [
      [data.input, ".input.nul"],
      [data.trackedStdout, ".tracked.nul"],
      [data.trackedStderr, ".tracked.stderr"],
      [data.ignoredStdout, ".ignored.nul"],
      [data.ignoredStderr, ".ignored.stderr"],
    ] satisfies ReadonlyArray<readonly [TrialArtifact, string]>)
      if (file.path !== stem + name || (yield* hashTrialInput(file.path)) !== file.digest) return false;
    return (
      (yield* fs.readFileString(data.input.path)) ===
        (A.isReadonlyArrayEmpty(probes) ? "" : A.join(probes, "\0") + "\0") &&
      (yield* fs.readFileString(data.trackedStdout.path)) === "" &&
      (yield* validateTrialIgnoreCensus(yield* fs.readFileString(data.ignoredStdout.path), probes))
    );
  }
);

/**
 * Finalize only an intact exact-commit, full-Yeet and task-oracle proof.
 * **Details**
 * The evaluator creates the proof outside the coding namespace. A gate failure
 * produces a failed finalization without a BenchmarkRun success projection;
 * the original attempt and raw artifacts remain in the denominator. No model
 * call, publication, acceptance command or Yeet run is initiated here.
 * **Example** (Inspect the deterministic proof entry point)
 * ```ts
 * import { finalizeTrial } from "@beep/repo-cli/test/AgentEffectiveness"
 * console.log(finalizeTrial)
 * ```
 * @category execution
 * @since 0.0.0
 */
export const finalizeTrial = Effect.fn("AgentEffectiveness.finalizeTrial")(function* (
  attemptPath: string,
  proofPath: string
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const attempt = yield* TrialAttemptJson.decode(yield* fs.readFileString(attemptPath));
  const proof = yield* TrialProofJson.decode(yield* fs.readFileString(proofPath));
  const attemptArtifact = yield* trialArtifact(attemptPath);
  const checkArtifact = Effect.fn(function* (artifact: TrialArtifact) {
    if ((yield* hashTrialInput(artifact.path)) !== artifact.digest)
      return yield* fail("Retained artifact digest changed");
  });
  if (proof.attempt.path !== attemptPath || proof.attempt.digest !== attemptArtifact.digest)
    return yield* fail("Proof is not bound to this immutable attempt");
  yield* Effect.forEach(
    [
      attempt.plan,
      attempt.stdout,
      attempt.stderr,
      attempt.diff,
      ...O.toArray(attempt.bundle),
      ...O.toArray(attempt.sourceArchive),
      ...O.toArray(attempt.nativeInvocation),
      ...attempt.indexStates,
      proof.verdict,
      proof.acceptance,
    ],
    checkArtifact
  );
  const plan = yield* TrialPlanJson.decode(yield* fs.readFileString(attempt.plan.path));
  const verdict = yield* YeetVerdictJson.decode(yield* fs.readFileString(proof.verdict.path));
  const acceptance = yield* TrialAcceptanceJson.decode(yield* fs.readFileString(proof.acceptance.path));
  let proofSystem = O.none<TrialInputInventory>();
  if (proof.fullYeetCollection !== undefined) {
    yield* checkArtifact(proof.fullYeetCollection);
    const collection = yield* TrialAcceptanceJson.decode(yield* fs.readFileString(proof.fullYeetCollection.path));
    const first = A.head(collection.requiredChecks);
    if (O.isSome(first) && first.value.evaluatorContract !== undefined) {
      yield* checkArtifact(first.value.evaluatorContract);
      const contract = yield* S.decodeEffect(S.fromJsonString(TrialEvaluatorCheck))(
        yield* fs.readFileString(first.value.evaluatorContract.path)
      );
      proofSystem = O.fromUndefinedOr(contract.nativeRuntime?.system);
    }
  }
  let evidenceWorkspace = attempt.workspace;
  let reconstructed = false;
  if (proof.reconstruction !== undefined) {
    yield* checkArtifact(proof.reconstruction);
    const source = yield* TrialCommittedSourceJson.decode(yield* fs.readFileString(proof.reconstruction.path));
    yield* Effect.forEach([source.bundle, source.sourceArchive, ...O.toArray(source.baseBundle)], checkArtifact);
    if (
      source.baseCommit !== plan.baseCommit ||
      source.finalCommit !== proof.finalCommit ||
      O.isNone(attempt.bundle) ||
      source.bundle.digest !== attempt.bundle.value.digest ||
      source.workspace === attempt.workspace ||
      !Str.startsWith(path.dirname(attemptPath) + "/")(source.workspace) ||
      (yield* fs.realPath(source.workspace)) !== source.workspace
    )
      return yield* fail("Reconstruction is not an owned fresh tree bound to the retained candidate bundle");
    const tree = yield* inspectTrialGit(source.workspace, ["rev-parse", "HEAD^{tree}"], O.getOrUndefined(proofSystem));
    if (tree.exitCode !== 0 || tree.truncated || Str.trim(tree.output) !== source.tree)
      return yield* fail("Reconstructed Git tree differs from retained source evidence");
    yield* inspectTrialControlRefs(source.workspace, plan.baseCommit, O.getOrUndefined(proofSystem));
    evidenceWorkspace = source.workspace;
    reconstructed = true;
  }
  const head = yield* inspectTrialGit(evidenceWorkspace, ["rev-parse", "HEAD"], O.getOrUndefined(proofSystem));
  const dirty = yield* inspectTrialGit(evidenceWorkspace, ["status", "--porcelain"], O.getOrUndefined(proofSystem));
  // ProofState.collectDiffFingerprint frames status, unstaged and staged bytes
  // with two NUL separators. A clean exact commit therefore has this digest.
  const cleanFingerprint = yield* hashPublicTextSha256("\u0000\u0000");
  let fullYeetChecks: ReadonlyArray<(typeof acceptance.requiredChecks)[number]> = [];
  if (proof.fullYeetCollection !== undefined) {
    yield* checkArtifact(proof.fullYeetCollection);
    const collection = yield* TrialAcceptanceJson.decode(yield* fs.readFileString(proof.fullYeetCollection.path));
    if (
      collection.finalCommit !== proof.finalCommit ||
      collection.taskDigest !== plan.taskDigest ||
      collection.acceptanceDigest !== plan.acceptanceDigest
    )
      return yield* fail("Full Yeet collection identity differs from the frozen attempt");
    fullYeetChecks = collection.requiredChecks;
  }
  let requestVendorTargets = O.none<ReadonlyArray<string>>();
  let requestCheckControls = O.none<ReadonlyArray<TrialEvaluatorCheck>>();
  let requestRuntimeDigest = O.none<Sha256Hex>();
  if (proof.collectRequest !== undefined) {
    yield* checkArtifact(proof.collectRequest);
    const collectedRequest = yield* TrialCollectRequestJson.decode(yield* fs.readFileString(proof.collectRequest.path));
    if (
      collectedRequest.attempt.path !== proof.attempt.path ||
      collectedRequest.attempt.digest !== proof.attempt.digest
    )
      return yield* fail("Collection request binds a different attempt");
    if (!(yield* validateTrialRequestChecks(plan, collectedRequest.checks, collectedRequest.yeet)))
      return yield* fail("Collection request controls or slots differ from frozen plan");
    requestVendorTargets = O.some(
      A.filter(
        A.map(collectedRequest.projectedRuntime, (closure) => closure.target),
        Str.startsWith("/workspace/")
      )
    );
    requestCheckControls = O.some([...collectedRequest.checks, collectedRequest.yeet]);
    const census = yield* deriveTrialRuntimeControlsDigest(collectedRequest.runtime, collectedRequest.projectedRuntime);
    if (
      !A.every([...collectedRequest.checks, collectedRequest.yeet], (check) => check.runtimeControlsDigest === census)
    )
      return yield* fail("Collection runtime census differs from frozen check controls");
    requestRuntimeDigest = O.some(census);
  }
  const fullYeetBinding =
    proof.collectRequest !== undefined &&
    plan.fullYeetCheckSpec !== undefined &&
    equalNames(plan.fullYeetCheckSpec.commandTemplate, [
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
    ]) &&
    fullYeetChecks.length === 1 &&
    fullYeetChecks[0]?.namespaceBindings !== undefined &&
    fullYeetChecks[0]?.evaluatorContract !== undefined &&
    fullYeetChecks[0]?.nativeRuntimeEvidence !== undefined &&
    fullYeetChecks[0]?.gitRefGuard !== undefined &&
    fullYeetChecks[0]?.mountGuardEvidence?.length === 2 &&
    fullYeetChecks[0]?.trackedRootInventory !== undefined &&
    fullYeetChecks[0]?.trackedRootStderr !== undefined &&
    fullYeetChecks[0]?.id === plan.fullYeetCheckSpec.id &&
    fullYeetChecks[0]?.nativeReport?.digest === proof.verdict.digest &&
    fullYeetChecks[0]?.nativeReport?.path === proof.verdict.path;
  const acceptanceEvidence = yield* Effect.forEach([...acceptance.requiredChecks, ...fullYeetChecks], (check) =>
    Effect.gen(function* () {
      yield* Effect.forEach([check.stdout, check.stderr, check.parsedOutcome, check.inputBundle], checkArtifact);
      const outcome = yield* S.decodeEffect(
        S.fromJsonString(
          S.Struct({
            id: S.NonEmptyString,
            passed: S.Boolean,
            collected: S.Natural,
            passedCount: S.Natural,
            failedCount: S.Natural,
            collectionFailures: S.Natural,
          })
        )
      )(yield* fs.readFileString(check.parsedOutcome.path));
      const spec = A.findFirst(
        [...plan.requiredCheckSpecs, ...O.toArray(O.fromUndefinedOr(plan.fullYeetCheckSpec))],
        (spec) => spec.id === check.id
      );
      let gitRefsValid = check.id !== plan.fullYeetCheckSpec?.id;
      if (check.gitRefGuard !== undefined) {
        yield* checkArtifact(check.gitRefGuard);
        const guard = yield* S.decodeEffect(S.fromJsonString(TrialGitRefGuard))(
          yield* fs.readFileString(check.gitRefGuard.path)
        );
        const current = yield* inspectTrialControlRefs(
          evidenceWorkspace,
          plan.baseCommit,
          O.getOrUndefined(proofSystem)
        );
        const same = S.toEquivalence(TrialGitRefState);
        gitRefsValid =
          check.gitRefGuard.path === path.join(check.bindings.output, "git-ref-guard.json") &&
          guard.before.baseCommit === plan.baseCommit &&
          same(guard.before, guard.after) &&
          same(guard.after, current);
      }
      const templateBindings = check.namespaceBindings ?? check.bindings;
      const resolveArgument = (arg: string) =>
        Str.replaceAll(
          "OUTPUT",
          templateBindings.output
        )(
          Str.replaceAll(
            "SEALED",
            templateBindings.sealed
          )(Str.replaceAll("CANDIDATE", templateBindings.candidate)(arg))
        );
      let rootValid = check.namespaceBindings === undefined;
      if (check.rootInventory !== undefined) {
        yield* checkArtifact(check.rootInventory);
        const inventory = yield* S.decodeEffect(
          S.fromJsonString(
            S.Struct({
              protectionRoots: S.String.pipe(S.Array, S.optional),
              before: S.Array(S.String),
              after: S.Array(S.String),
              linksBefore: S.optional(S.Record(S.String, S.String)),
              linksAfter: S.optional(S.Record(S.String, S.String)),
              modeBefore: S.Int,
              modeAfter: S.Int,
              unchanged: S.Boolean,
            })
          )
        )(yield* fs.readFileString(check.rootInventory.path));
        let trackedValid = check.id !== plan.fullYeetCheckSpec?.id;
        if (check.trackedRootInventory !== undefined && check.trackedRootStderr !== undefined) {
          yield* checkArtifact(check.trackedRootInventory);
          yield* checkArtifact(check.trackedRootStderr);
          const roots = yield* parseTrialTrackedRoots(yield* fs.readFileString(check.trackedRootInventory.path));
          const output = path.dirname(check.stdout.path);
          trackedValid =
            check.trackedRootInventory.path === path.join(output, "tracked-roots.nul") &&
            check.trackedRootStderr.path === path.join(output, "tracked-roots.stderr") &&
            inventory.protectionRoots !== undefined &&
            equalNames(roots, inventory.protectionRoots);
        }
        rootValid =
          trackedValid &&
          inventory.unchanged &&
          equalNames(inventory.before, inventory.after) &&
          inventory.modeBefore === inventory.modeAfter &&
          inventory.linksBefore !== undefined &&
          inventory.linksAfter !== undefined &&
          equalNames(Object.keys(inventory.linksBefore).sort(), Object.keys(inventory.linksAfter).sort()) &&
          Object.entries(inventory.linksBefore).every(([name, target]) => inventory.linksAfter?.[name] === target);
      }
      let contractValid = check.namespaceBindings === undefined;
      if (check.evaluatorContract !== undefined) {
        yield* checkArtifact(check.evaluatorContract);
        const contract = yield* S.decodeEffect(S.fromJsonString(TrialEvaluatorCheck))(
          yield* fs.readFileString(check.evaluatorContract.path)
        );
        let nativeValid = check.id !== plan.fullYeetCheckSpec?.id;
        const declaredSystem = contract.nativeRuntime?.system ?? contract.sparseSystem;
        if (declaredSystem !== undefined) yield* validateTrialInventory(declaredSystem, "/runtime/system");
        const systemValid =
          declaredSystem !== undefined &&
          declaredSystem.digest === O.getOrUndefined(proofSystem)?.digest &&
          declaredSystem.root === O.getOrUndefined(proofSystem)?.root;

        if (contract.nativeRuntime !== undefined && check.nativeRuntimeEvidence !== undefined) {
          yield* checkArtifact(check.nativeRuntimeEvidence);
          const evidence = yield* S.decodeEffect(S.fromJsonString(TrialNativeRuntimeEvidence))(
            yield* fs.readFileString(check.nativeRuntimeEvidence.path)
          );
          const runtime = contract.nativeRuntime;
          const capabilities = yield* validateTrialNativeRuntime(runtime);
          const equalCapabilities = S.toEquivalence(TrialBootstrapFile.Capabilities);
          const capabilitiesValid =
            evidence.bootstrapCapabilitiesBefore !== undefined &&
            evidence.bootstrapCapabilitiesAfter !== undefined &&
            equalCapabilities(capabilities, evidence.bootstrapCapabilitiesBefore) &&
            equalCapabilities(capabilities, evidence.bootstrapCapabilitiesAfter);
          const cacheValid =
            runtime.bunInstallCache !== undefined &&
            (yield* validateTrialBunCacheEvidence(
              runtime.bunInstallCache,
              evidence,
              path.dirname(check.stdout.path),
              contract.environmentTemplate
            ));
          nativeValid =
            evidence.preserved &&
            capabilitiesValid &&
            cacheValid &&
            evidence.manifestBefore === evidence.manifestAfter &&
            evidence.runtimeDigest ===
              (yield* hashPublicTextSha256(yield* S.encodeEffect(S.fromJsonString(TrialNativeYeetRuntime))(runtime))) &&
            evidence.systemDigest === runtime.system.digest &&
            evidence.nixDigest === runtime.nix.digest &&
            evidence.ociDigest === runtime.oci.digest &&
            evidence.image === runtime.image;
        }
        let requestContractValid = false;
        const requested = O.flatMap(requestCheckControls, (controls) =>
          A.findFirst(controls, (control) => control.id === check.id)
        );
        if (O.isSome(requested) && O.isSome(spec))
          requestContractValid = (yield* trialCheckContractDigest(requested.value)) === spec.value.contractDigest;
        let mountValid = false;
        if (
          check.mountGuardEvidence !== undefined &&
          check.mountGuardEvidence.length === 2 &&
          check.projectedGuardTargets !== undefined &&
          O.isSome(requestVendorTargets) &&
          equalNames(check.projectedGuardTargets, requestVendorTargets.value) &&
          O.exists(requestCheckControls, (controls) => A.some(controls, (control) => control.id === check.id)) &&
          declaredSystem !== undefined
        ) {
          const vendor = A.get(check.mountGuardEvidence, 0);
          const writable = A.get(check.mountGuardEvidence, 1);
          if (O.isSome(vendor) && O.isSome(writable))
            mountValid =
              (yield* validateTrialMountGuardEvidence(
                vendor.value,
                "vendor",
                check.projectedGuardTargets,
                path.dirname(check.stdout.path),
                declaredSystem
              )) &&
              (yield* validateTrialMountGuardEvidence(
                writable.value,
                "writable",
                contract.writableCacheTargets,
                path.dirname(check.stdout.path),
                declaredSystem
              ));
        }
        contractValid =
          O.isSome(spec) &&
          requestContractValid &&
          mountValid &&
          nativeValid &&
          systemValid &&
          (check.id !== plan.fullYeetCheckSpec?.id ||
            (contract.kind === "yeet" && O.isNone(contract.reportRelativePath))) &&
          spec.value.contractDigest === (yield* trialCheckContractDigest(contract)) &&
          contract.id === check.id &&
          contract.input.digest === check.inputBundleDigest &&
          equalNames(A.map(contract.commandTemplate, resolveArgument), check.resolvedArgv) &&
          Object.keys(contract.environmentTemplate).length === Object.keys(check.filteredEnvironment).length &&
          Object.entries(contract.environmentTemplate).every(
            ([key, value]) => check.filteredEnvironment[key] === resolveArgument(value)
          );
      }
      const invocationDigest = yield* hashPublicTextSha256(
        yield* S.encodeEffect(S.fromJsonString(S.Unknown))({
          argv: check.resolvedArgv,
          cwd: check.cwd,
          environment: check.filteredEnvironment,
        })
      );
      let inputValid =
        check.inputBundle.digest === check.inputBundleDigest && check.bindings.sealed === check.inputBundle.path;
      if (check.namespaceBindings !== undefined) {
        const inventory = yield* S.decodeEffect(S.fromJsonString(TrialInputInventory))(
          yield* fs.readFileString(check.inputBundle.path)
        );
        yield* validateTrialInventory(inventory);
        inputValid = inventory.digest === check.inputBundleDigest && inventory.root === check.bindings.sealed;
      }
      const resolvedTemplate = A.map(check.commandTemplate, (arg) =>
        Str.replaceAll(
          "OUTPUT",
          templateBindings.output
        )(
          Str.replaceAll(
            "SEALED",
            templateBindings.sealed
          )(Str.replaceAll("CANDIDATE", templateBindings.candidate)(arg))
        )
      );
      return (
        check.bindings.candidate === evidenceWorkspace &&
        inputValid &&
        contractValid &&
        gitRefsValid &&
        rootValid &&
        Str.startsWith(`${path.dirname(attemptPath)}/`)(check.bindings.output) &&
        equalNames(resolvedTemplate, check.resolvedArgv) &&
        O.isSome(spec) &&
        spec.value.inputBundleDigest === check.inputBundleDigest &&
        equalNames(spec.value.commandTemplate, check.commandTemplate) &&
        check.invocationDigest === invocationDigest &&
        check.cwd === (check.namespaceBindings === undefined ? evidenceWorkspace : "/workspace") &&
        check.headBefore === proof.finalCommit &&
        check.headAfter === proof.finalCommit &&
        check.fingerprintBefore === cleanFingerprint &&
        check.fingerprintAfter === cleanFingerprint &&
        check.exitCode === 0 &&
        outcome.id === check.id &&
        outcome.passed &&
        check.passed &&
        outcome.collected > 0 &&
        outcome.collected === check.collected &&
        outcome.passedCount === check.passedCount &&
        outcome.failedCount === check.failedCount &&
        outcome.collectionFailures === check.collectionFailures &&
        check.failedCount === 0 &&
        check.collectionFailures === 0 &&
        check.passedCount === check.collected
      );
    })
  );
  let invocationVerified = false;
  if (O.isSome(attempt.nativeInvocation)) {
    const actual = yield* TrialNativeInvocationJson.decode(
      yield* fs.readFileString(attempt.nativeInvocation.value.path)
    );
    yield* Effect.forEach(actual.configuration, checkArtifact);
    const expected = yield* deriveTrialInvocation(plan);
    invocationVerified =
      (yield* TrialNativeInvocationJson.encode(actual)) === (yield* TrialNativeInvocationJson.encode(expected));
  }
  const expectedObservedModel = plan.provider === "grok" && plan.model === "grok-4.7" ? "grok-4.7-build" : plan.model;
  const modelViolation = A.some(
    attempt.usage.hostModels,
    (observed) =>
      observed.model !==
      (plan.provider === "grok" && observed.source !== "end.modelUsage" ? plan.model : expectedObservedModel)
  );
  if (attempt.nativeSessionIdentity !== undefined)
    yield* Effect.forEach(attempt.nativeSessionIdentity.artifacts, checkArtifact);
  const sessionViolation = A.some(
    attempt.nativeSessionIdentity?.observations ?? [],
    (observed) =>
      (O.isSome(observed.model) && observed.model.value !== plan.model) ||
      (O.isSome(observed.effort) && observed.effort.value !== plan.effort)
  );
  const effortViolation = A.some(attempt.usage.hostEfforts, (observed) => observed.effort !== plan.effort);
  const protocolCompliance =
    modelViolation || effortViolation || sessionViolation
      ? ("violation" as const)
      : invocationVerified
        ? ("invocation-pins-verified" as const)
        : ("unknown" as const);
  const checks = [
    [
      O.isSome(attempt.bundle) &&
        O.isSome(attempt.sourceArchive) &&
        attempt.sourceArchive.value.digest === plan.sourceDigest,
      "Exact source archive or candidate bundle is missing or changed",
    ],
    [
      attempt.terminal.status === "awaiting-proof" && attempt.terminal.finalCommit === proof.finalCommit,
      "Attempt did not complete at the proof commit",
    ],
    [
      attempt.runId === plan.runId && attempt.attemptId === plan.attemptId && attempt.baseCommit === plan.baseCommit,
      "Attempt identity differs from frozen plan",
    ],
    [
      head.exitCode === 0 &&
        !head.truncated &&
        Str.trim(head.output) === proof.finalCommit &&
        dirty.exitCode === 0 &&
        !dirty.truncated &&
        Str.trim(dirty.output) === "",
      "Final worktree changed or is not clean",
    ],
    [fullYeetBinding, "Full Yeet invocation and contract collection are missing or differ"],
    [
      proof.yeetExitCode === 0 &&
        verdict.mode === "verify" &&
        verdict.outcome === "success" &&
        O.contains(verdict.proofTier, "full") &&
        O.contains(verdict.resolvedHeadSha, proof.finalCommit) &&
        O.contains(verdict.diffFingerprint, cleanFingerprint),
      "Full Yeet did not pass on the exact final commit",
    ],
    [
      equalNames(proof.requiredLaneIds, plan.requiredYeetLaneIds) &&
        A.every(
          plan.requiredYeetLaneIds,
          (id) =>
            A.length(
              A.filter(verdict.lanes, (lane) => lane.id === id && lane.status === "passed" && lane.exitCode === 0)
            ) === 1
        ),
      "Required full-proof lanes are missing, duplicated, reused or failed",
    ],
    [
      acceptance.finalCommit === proof.finalCommit &&
        acceptance.taskDigest === plan.taskDigest &&
        acceptance.acceptanceDigest === plan.acceptanceDigest &&
        equalNames(
          A.map(acceptance.requiredChecks, (check) => check.id),
          plan.requiredTaskCheckIds
        ) &&
        A.every(acceptanceEvidence, (passed) => passed) &&
        equalNames(
          A.map(plan.requiredCheckSpecs, (spec) => spec.id),
          plan.requiredTaskCheckIds
        ),
      "Task acceptance is missing, incomplete or failed",
    ],
    [
      O.isSome(attempt.codingElapsedMs) && attempt.usage.coverage === "complete" && O.contains(attempt.exitCode, 0),
      "Native stream or process did not complete",
    ],
  ] satisfies ReadonlyArray<readonly [boolean, string]>;
  const failures = A.map(
    A.filter(checks, ([passed]) => !passed),
    ([, reason]) => reason
  );
  const mechanicalPassed = A.isReadonlyArrayEmpty(failures);
  const passed = mechanicalPassed && reconstructed && protocolCompliance === "invocation-pins-verified";
  const allFailures =
    protocolCompliance === "invocation-pins-verified"
      ? failures
      : [
          ...failures,
          protocolCompliance === "violation"
            ? "Observed native model or effort violates frozen coding pin"
            : "Trusted native invocation/config pin evidence is missing or inconsistent",
        ];
  const benchmark = passed
    ? O.some(
        AiMetricsBenchmarkRunInput.make({
          benchmarkCaseId: plan.taskDigest,
          configSnapshotId: plan.configDigest,
          elapsedMs: O.getOrElse(attempt.codingElapsedMs, () => attempt.elapsedMs),
          note: O.some(
            "Exact local commit, full Yeet and required task acceptance passed; usage remains observed host scope with unknown child coverage."
          ),
          passed: true,
          qualityGate: "passed",
          recordedAtEpochMillis: yield* Clock.currentTimeMillis,
        })
      )
    : O.none();
  if (!reconstructed) allFailures.push("Fresh retained-commit reconstruction evidence is missing");
  const result = TrialFinalization.make({
    schemaVersion: "agent-trial-finalization/v1",
    attempt: attemptArtifact,
    proof: yield* trialArtifact(proofPath),
    status: passed
      ? "passed"
      : mechanicalPassed && (!reconstructed || protocolCompliance === "unknown")
        ? "incomplete"
        : "failed",
    protocolCompliance,
    failures: allFailures,
    benchmark,
  });
  const destination = path.join(path.dirname(attemptPath), "finalization.json");
  yield* fs.writeFileString(destination, yield* TrialFinalizationJson.encode(result), { flag: "wx", mode: 0o600 });
  return destination;
});
