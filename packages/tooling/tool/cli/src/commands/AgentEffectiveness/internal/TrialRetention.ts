/**
 * No-delete trial retention qualification and explicit original-path rehydration.
 * @packageDocumentation
 * @since 0.0.0
 */

import { hashPublicTextSha256 } from "@beep/repo-ai-metrics/privacy";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as O from "effect/Option";
import * as Path from "effect/Path";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as Tuple from "effect/Tuple";
import { runCaptured, runSpooledStreams } from "../../../internal/process/StepExec.ts";
import {
  AdmissionJournalLockGeneration,
  acquireJournalFileLock,
  releaseJournalFileLock,
} from "../../../internal/repo-run/AdmissionJournal.ts";
import { isProcessIdentityAlive, processStartIdentityForPid } from "../../../internal/repo-run/ProcessIdentity.ts";
import { procProcessTable } from "../../../internal/repo-run/ProcessTable.ts";
import { YeetVerdictJson } from "../../Yeet/internal/Verdict.ts";
import { AgentTrialError } from "../AgentEffectiveness.errors.ts";
import {
  TrialRehydrateRequestJson,
  TrialRehydration,
  TrialRehydrationJson,
  TrialRetainRequestJson,
  TrialRetention,
  TrialRetentionCapture,
  TrialRetentionCaptureJson,
  TrialRetentionClassificationJson,
  TrialRetentionInputs,
  TrialRetentionJson,
  TrialRetentionOwnership,
  TrialRetentionOwnershipJson,
  TrialTrackedBytes,
  TrialTrackedBytesJson,
} from "../AgentEffectiveness.TrialRetention.schemas.ts";
import {
  TrialAcceptanceJson,
  TrialAttemptJson,
  TrialCollectRequestJson,
  TrialFinalizationJson,
  TrialPlanJson,
  TrialProofJson,
} from "../AgentEffectiveness.trials.schemas.ts";
import { reconstructTrialSource, trialEvaluatorInputRoots, trialEvaluatorInventoryBindings } from "./TrialCollector.ts";
import { trialArtifact } from "./TrialExecutor.ts";
import { hashTrialInput, inspectTrialGit, trialGitSandbox, validateTrialInventory } from "./TrialIsolation.ts";
import {
  TrialArtifact,
  TrialCommittedSourceJson,
  TrialEvaluatorCheck,
  TrialInputInventory,
  TrialMount,
  TrialNativeInvocation,
  TrialNativeRuntimeEvidence,
  TrialRuntimeClosure,
} from "./TrialProfile.schemas.ts";
import { parseTrialUsage } from "./TrialUsage.ts";
import type * as Crypto from "effect/Crypto";
import type * as PlatformError from "effect/PlatformError";
import type { TrialCommittedSource } from "./TrialProfile.schemas.ts";

const fail = (message: string) => Effect.fail(AgentTrialError.make({ stage: "retention", message }));
const boundary = (cause: unknown) =>
  AgentTrialError.make({ stage: "retention", message: "Retention boundary failed", cause });
const equalArtifact = S.toEquivalence(TrialArtifact);

const acquireOperation = Effect.fn("TrialRetention.acquireOperation")(function* (root: string, token: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  yield* canonical(root);
  const lock = path.join(root, ".retention-operation.lock");
  let attempts = 1;
  if (yield* fs.exists(lock)) {
    yield* canonical(lock);
    const observed = yield* fs.readFileString(lock);
    const generation = yield* S.decodeEffect(S.fromJsonString(AdmissionJournalLockGeneration))(observed).pipe(
      Effect.option
    );
    const expectedSuffix = Str.slice(O.getOrElse(Str.lastIndexOf(":")(token), () => 0))(token);
    if (
      O.isNone(generation) ||
      !Str.startsWith("retention:")(generation.value.ownerToken) ||
      !Str.endsWith(expectedSuffix)(generation.value.ownerToken)
    )
      return yield* fail("Foreign or unknown operation lock cannot be reaped by this request");
    if (yield* isProcessIdentityAlive(generation.value))
      return yield* fail("Live or inconclusive operation owner cannot be reaped by this request");
    const recoveryReceipt = path.join(root, `.retention-recovered-lock-${yield* hashPublicTextSha256(observed)}.json`);
    if (!(yield* fs.exists(recoveryReceipt)))
      yield* fs.writeFileString(recoveryReceipt, observed, { flag: "wx", mode: 0o600 });
    else if ((yield* fs.readFileString(recoveryReceipt)) !== observed)
      return yield* fail("Stale lock recovery evidence changed");
    attempts = 2;
  }
  return yield* Effect.acquireRelease(
    acquireJournalFileLock(lock, token, attempts).pipe(
      Effect.flatMap((acquired) =>
        acquired
          ? Effect.succeed(lock)
          : fail("Another evaluator operation owns this source; live or unknown lock refuses")
      )
    ),
    () => releaseJournalFileLock(lock, token)
  );
});

const canonical = Effect.fn("TrialRetention.canonical")(function* (root: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  if (!path.isAbsolute(root) || path.normalize(root) !== root || (yield* fs.realPath(root)) !== root)
    return yield* fail("Retention path is not absolute, canonical and owned");
});

const validateArtifact = Effect.fn("TrialRetention.validateArtifact")(function* (artifact: TrialArtifact) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  yield* canonical(artifact.path);
  const root = yield* fs.stat(artifact.path);
  const entries = root.type === "Directory" ? yield* fs.readDirectory(artifact.path, { recursive: true }) : [];
  for (const full of [artifact.path, ...A.map(entries, (entry) => path.join(artifact.path, entry))]) {
    if (O.isSome(yield* fs.readLink(full).pipe(Effect.option)))
      return yield* fail("Retention evidence contains a symlink");
    const stat = yield* fs.stat(full);
    if (stat.type !== "File" && stat.type !== "Directory")
      return yield* fail("Retention evidence contains a special file");
  }
  if ((yield* hashTrialInput(artifact.path)) !== artifact.digest)
    return yield* fail("Retention dependency digest changed");
});

const sourceDependencies = (source: TrialCommittedSource) => [
  source.bundle,
  source.sourceArchive,
  ...O.toArray(source.baseBundle),
];

const declaredCheckInputs = (
  check: TrialEvaluatorCheck,
  runtime: ReadonlyArray<TrialMount>,
  projectedRuntime: ReadonlyArray<TrialRuntimeClosure>
) => {
  const roots = trialEvaluatorInputRoots(check, runtime, projectedRuntime);
  const inventories = trialEvaluatorInventoryBindings(check, projectedRuntime);
  let artifacts: ReadonlyArray<TrialArtifact> = [];
  // Traverse decoded schema models, but accept only roots selected by the shared Collector census.
  const visit = (value: unknown): void => {
    if (S.is(TrialInputInventory)(value)) {
      return;
    }
    if (S.is(TrialArtifact)(value)) {
      if (A.contains(roots, value.path)) artifacts = A.append(artifacts, value);
    } else if (S.is(TrialMount)(value)) {
      if (A.contains(roots, value.source))
        artifacts = A.append(artifacts, TrialArtifact.make({ path: value.source, digest: value.digest }));
    } else if (A.isArray(value)) {
      for (const entry of value) visit(entry);
    } else if (P.isObject(value)) {
      for (const entry of R.values(value)) visit(entry);
    }
  };
  visit(check);
  visit(runtime);
  visit(projectedRuntime);
  return TrialRetentionInputs.make({ roots, inventories, artifacts });
};

const mergeDeclaredInputs = (left: TrialRetentionInputs, right: TrialRetentionInputs) =>
  TrialRetentionInputs.make({
    roots: A.dedupe([...left.roots, ...right.roots]),
    inventories: [...left.inventories, ...right.inventories],
    artifacts: [...left.artifacts, ...right.artifacts],
  });
const validateDeclaredInputs = Effect.fn("TrialRetention.validateDeclaredInputs")(function* (
  inputs: TrialRetentionInputs
) {
  yield* Effect.forEach(inputs.inventories, (binding) => validateTrialInventory(binding.inventory, binding.target), {
    concurrency: 1,
  });
  yield* Effect.forEach(
    inputs.artifacts,
    (artifact) =>
      Effect.gen(function* () {
        yield* canonical(artifact.path);
        if ((yield* hashTrialInput(artifact.path)) !== artifact.digest)
          return yield* fail("Declared immutable asset digest changed");
      }),
    { concurrency: 1 }
  );
});

const acceptanceInputs = Effect.fn("TrialRetention.acceptanceInputs")(function* (artifact: TrialArtifact) {
  const fs = yield* FileSystem.FileSystem;
  const acceptance = yield* TrialAcceptanceJson.decode(yield* fs.readFileString(artifact.path));
  let inputs = TrialRetentionInputs.make({ roots: [], inventories: [], artifacts: [] });
  for (const check of acceptance.requiredChecks) {
    for (const reference of O.toArray(O.fromUndefinedOr(check.evaluatorContract))) {
      yield* validateArtifact(reference);
      const contract = yield* S.decodeEffect(S.fromJsonString(TrialEvaluatorCheck))(
        yield* fs.readFileString(reference.path)
      );
      inputs = mergeDeclaredInputs(inputs, declaredCheckInputs(contract, [], []));
    }
  }
  return inputs;
});

const disjoint = (left: string, right: string) =>
  left !== right && !Str.startsWith(`${left}/`)(right) && !Str.startsWith(`${right}/`)(left);
const validateOutput = Effect.fn("TrialRetention.validateOutput")(function* (
  output: string,
  protectedPaths: ReadonlyArray<string>
) {
  const path = yield* Path.Path;
  if (
    !path.isAbsolute(output) ||
    path.normalize(output) !== output ||
    A.some(protectedPaths, (input) => !disjoint(output, input))
  )
    return yield* fail("Generated output overlaps source or immutable evidence");
  yield* canonical(path.dirname(output));
});

const acceptanceDependencies = Effect.fn("TrialRetention.acceptanceDependencies")(function* (
  artifact: TrialArtifact,
  finalCommit: string
) {
  const fs = yield* FileSystem.FileSystem;
  yield* validateArtifact(artifact);
  const record = yield* TrialAcceptanceJson.decode(yield* fs.readFileString(artifact.path));
  if (record.finalCommit !== finalCommit) return yield* fail("Nested acceptance has a different candidate commit");
  let cacheDependencies: ReadonlyArray<TrialArtifact> = [];
  for (const check of record.requiredChecks) {
    for (const evidence of O.toArray(O.fromUndefinedOr(check.nativeRuntimeEvidence))) {
      yield* validateArtifact(evidence);
      const native = yield* S.decodeEffect(S.fromJsonString(TrialNativeRuntimeEvidence))(
        yield* fs.readFileString(evidence.path)
      );
      for (const cache of [
        ...O.toArray(O.fromUndefinedOr(native.bunCacheBefore)),
        ...O.toArray(O.fromUndefinedOr(native.bunCacheAfter)),
      ]) {
        yield* validateArtifact(cache);
        cacheDependencies = A.append(cacheDependencies, cache);
      }
    }
  }
  return [
    artifact,
    ...cacheDependencies,
    ...A.flatMap(record.requiredChecks, (check) => [
      check.inputBundle,
      check.stdout,
      check.stderr,
      check.parsedOutcome,
      ...O.toArray(O.fromUndefinedOr(check.evaluatorContract)),
      ...O.toArray(O.fromUndefinedOr(check.nativeReport)),
      ...O.toArray(O.fromUndefinedOr(check.rootInventory)),
      ...O.toArray(O.fromUndefinedOr(check.nativeRuntimeEvidence)),
    ]),
  ];
});

const proofDependencies = Effect.fn("TrialRetention.proofDependencies")(function* (
  artifact: TrialArtifact,
  attempt: TrialArtifact,
  finalCommit: string
) {
  const fs = yield* FileSystem.FileSystem;
  yield* validateArtifact(artifact);
  const proof = yield* TrialProofJson.decode(yield* fs.readFileString(artifact.path));
  if (!equalArtifact(proof.attempt, attempt) || proof.finalCommit !== finalCommit)
    return yield* fail("Nested proof differs from exact attempt/commit");
  yield* validateArtifact(proof.verdict);
  const verdict = yield* YeetVerdictJson.decode(yield* fs.readFileString(proof.verdict.path));
  if (!O.contains(verdict.resolvedHeadSha, finalCommit))
    return yield* fail("Native verdict differs from candidate commit");
  let dependencies = [artifact, proof.verdict, ...(yield* acceptanceDependencies(proof.acceptance, finalCommit))];
  for (const reconstruction of O.toArray(O.fromUndefinedOr(proof.reconstruction))) {
    yield* validateArtifact(reconstruction);
    const source = yield* TrialCommittedSourceJson.decode(yield* fs.readFileString(reconstruction.path));
    if (source.finalCommit !== finalCommit) return yield* fail("Nested reconstruction differs from candidate commit");
    dependencies = A.appendAll(dependencies, [reconstruction, ...sourceDependencies(source)]);
  }
  for (const collection of O.toArray(O.fromUndefinedOr(proof.fullYeetCollection)))
    dependencies = A.appendAll(dependencies, yield* acceptanceDependencies(collection, finalCommit));
  return dependencies;
});

const verifyBundleHead = Effect.fn("TrialRetention.verifyBundleHead")(function* (
  workspace: string,
  bundle: TrialArtifact,
  finalCommit: string,
  system: TrialInputInventory
) {
  const args = yield* trialGitSandbox(workspace, ["bundle", "list-heads", "/inputs/retained.bundle"], system);
  const delimiter = A.findFirstIndex(args, (arg) => arg === "--");
  if (O.isNone(delimiter)) return yield* fail("Git namespace command delimiter is missing");
  const result = yield* runCaptured({
    command: "/usr/bin/bwrap",
    args: [
      ...A.take(args, delimiter.value),
      "--ro-bind",
      bundle.path,
      "/inputs/retained.bundle",
      ...A.drop(args, delimiter.value),
    ],
    env: {},
    extendEnv: false,
    timeout: "30 seconds",
  });
  if (result.exitCode !== 0 || result.truncated || !A.contains(Str.split(result.output, "\n"), `${finalCommit} HEAD`))
    return yield* fail("Source-only commit is not the exact retained bundle HEAD");
});

const verifyTrackedBytes = Effect.fn("TrialRetention.verifyTrackedBytes")(function* (
  workspace: string,
  artifact: TrialArtifact
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  yield* validateArtifact(artifact);
  const tree = yield* TrialTrackedBytesJson.decode(yield* fs.readFileString(artifact.path));
  const names = [...R.keys(tree.files), ...R.keys(tree.symlinks)];
  for (const name of names)
    if (path.isAbsolute(name) || path.normalize(name) !== name || name === ".." || Str.startsWith("../")(name))
      return yield* fail("Committed byte inventory contains an escaping path");
  const walk = Effect.fn("TrialRetention.verifyActualDirectory")(function* (
    directory: string
  ): Effect.fn.Return<
    void,
    AgentTrialError | PlatformError.PlatformError,
    FileSystem.FileSystem | Path.Path | Crypto.Crypto
  > {
    for (const entry of yield* fs.readDirectory(directory)) {
      const full = path.join(directory, entry);
      const relative = path.relative(workspace, full);
      if (relative === ".git") continue;
      const link = yield* fs.readLink(full).pipe(Effect.option);
      if (O.isSome(link)) {
        if (!O.contains(R.get(tree.symlinks, relative), link.value))
          return yield* fail("Actual source symlink is untracked or changed");
      } else {
        const stat = yield* fs.stat(full);
        if (stat.type === "Directory") {
          if (!A.some(names, (name) => Str.startsWith(`${relative}/`)(name)))
            return yield* fail("Actual source has an untracked directory");
          yield* walk(full);
        } else if (
          stat.type !== "File" ||
          !O.contains(R.get(tree.files, relative), yield* hashTrialInput(full).pipe(Effect.mapError(boundary))) ||
          !O.contains(R.get(tree.executable, relative), (stat.mode & 0o111) !== 0)
        )
          return yield* fail("Actual tracked bytes, executable mode or file type changed");
      }
    }
  });
  for (const name of names) {
    const expectedLink = R.get(tree.symlinks, name);
    if (O.isSome(expectedLink)) {
      if (!O.contains(yield* fs.readLink(path.join(workspace, name)).pipe(Effect.option), expectedLink.value))
        return yield* fail("Actual source is missing a committed symlink");
    } else if (!(yield* fs.exists(path.join(workspace, name))))
      return yield* fail("Actual source is missing a committed file");
  }
  yield* walk(workspace);
});

const compareTrackedBytes = Effect.fn("TrialRetention.compareTrackedBytes")(function* (
  workspace: string,
  witness: string,
  system: TrialInputInventory,
  auditRoot: string
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  yield* fs.makeDirectory(auditRoot, { recursive: true, mode: 0o700 });
  const audit = yield* fs.makeTempDirectory({ directory: auditRoot });
  const list = path.join(audit, "tracked.nul");
  const flags = path.join(audit, "index-flags.txt");
  for (const [directory, args, stdout] of [
    Tuple.make(witness, ["ls-tree", "-r", "-z", "--name-only", "HEAD"], list),
    Tuple.make(workspace, ["ls-files", "-v"], flags),
  ]) {
    const code = yield* runSpooledStreams({
      command: "/usr/bin/bwrap",
      args: yield* trialGitSandbox(directory, args, system),
      env: {},
      extendEnv: false,
      stdoutPath: stdout,
      stderrPath: `${stdout}.stderr`,
      timeout: "30 seconds",
    });
    if (code !== 0) return yield* fail("Committed path or index-flag inventory failed");
  }
  if (
    A.some(
      Str.split(yield* fs.readFileString(flags), "\n"),
      (line) => Str.startsWith("S ")(line) || Str.startsWith("h ")(line)
    )
  )
    return yield* fail("Noncanonical skip-worktree or assume-unchanged index flags");
  let files: TrialTrackedBytes["files"] = {};
  let symlinks: TrialTrackedBytes["symlinks"] = {};
  let executable: TrialTrackedBytes["executable"] = {};
  for (const name of A.filter(Str.split(yield* fs.readFileString(list), "\u0000"), Str.isNonEmpty)) {
    const restored = path.join(witness, name);
    const link = yield* fs.readLink(restored).pipe(Effect.option);
    if (O.isSome(link)) symlinks = R.set(symlinks, name, link.value);
    else {
      files = R.set(files, name, yield* hashTrialInput(restored));
      executable = R.set(executable, name, ((yield* fs.stat(restored)).mode & 0o111) !== 0);
    }
  }
  const inventory = path.join(audit, "tracked-bytes.json");
  yield* fs.writeFileString(
    inventory,
    yield* TrialTrackedBytesJson.encode(TrialTrackedBytes.make({ files, symlinks, executable })),
    { flag: "wx", mode: 0o600 }
  );
  const artifact = yield* trialArtifact(inventory);
  yield* verifyTrackedBytes(workspace, artifact);
  return artifact;
});

const writeCheckpoint = Effect.fn("TrialRetention.writeCheckpoint")(function* (
  destination: string,
  checkpoint: TrialRehydration
) {
  const fs = yield* FileSystem.FileSystem;
  const temporary = `${destination}.pending`;
  if (yield* fs.exists(temporary)) yield* canonical(temporary);
  yield* fs.writeFileString(temporary, yield* TrialRehydrationJson.encode(checkpoint), { mode: 0o600 });
  yield* fs.rename(temporary, destination);
});

const verifySource = Effect.fn("TrialRetention.verifySource")(function* (
  workspace: string,
  source: TrialCommittedSource,
  system: TrialInputInventory
) {
  const inspect = Effect.fn("TrialRetention.inspect")(function* (args: ReadonlyArray<string>) {
    const result = yield* inspectTrialGit(workspace, args, system);
    if (result.exitCode !== 0 || result.truncated) return yield* fail("Retained source inspection failed");
    return Str.trim(result.output);
  });
  if (
    (yield* inspect(["rev-parse", "HEAD"])) !== source.finalCommit ||
    (yield* inspect(["rev-parse", "HEAD^{tree}"])) !== source.tree ||
    (yield* inspect(["status", "--porcelain", "--untracked-files=all"])) !== "" ||
    (yield* inspect(["ls-files", "--others", "--ignored", "--exclude-standard"])) !== ""
  )
    return yield* fail("Retained source is dirty, untracked, ignored or not the exact commit/tree");
});

const checkOwnership = Effect.fn("TrialRetention.checkOwnership")(function* (root: string, ownership: TrialArtifact) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  yield* canonical(root);
  if (ownership.path !== path.join(root, ".retention-owner"))
    return yield* fail("Ownership marker does not bind the owned root");
  yield* validateArtifact(ownership);
  const binding = yield* TrialRetentionOwnershipJson.decode(yield* fs.readFileString(ownership.path));
  if (binding.ownerRoot !== root) return yield* fail("Ownership marker binds a foreign root");
  if (yield* fs.exists(path.join(root, ".retention-lease")))
    return yield* fail("Owned source has an active or unreaped lease");
  return binding;
});

/** Initialize evaluator-only ownership before native execution; the marker must never be mounted into coding.
 * **Example** (Initialize from a frozen plan)
 * ```ts
 * import { initializeTrialRetentionOwnership } from "@beep/repo-cli/test/AgentEffectiveness"
 * console.log(initializeTrialRetentionOwnership)
 * ```
 * @category execution
 * @since 0.0.0
 */
export const initializeTrialRetentionOwnership = Effect.fn("AgentEffectiveness.initializeTrialRetentionOwnership")(
  function* (planPath: string) {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const plan = yield* TrialPlanJson.decode(yield* fs.readFileString(planPath));
    const ownerRoot = path.join(plan.workspaceRoot, `${plan.runId}-${plan.attemptId}`);
    yield* canonical(ownerRoot);
    const marker = path.join(ownerRoot, ".retention-owner");
    const ownership = TrialRetentionOwnership.make({
      schemaVersion: "agent-trial-retention-ownership/v1",
      plan: yield* trialArtifact(planPath),
      ownerRoot,
      runId: plan.runId,
      attemptId: plan.attemptId,
    });
    yield* fs.writeFileString(marker, yield* TrialRetentionOwnershipJson.encode(ownership), {
      flag: "wx",
      mode: 0o600,
    });
    return yield* trialArtifact(marker);
  },
  Effect.mapError(boundary)
);

/** Hold an evaluator-only fail-closed lease throughout coding or collection.
 * **Details**
 * Scope completion releases the exact owned lease. OS termination leaves it present;
 * an abandoned lease must be explicitly recovered rather than assumed inactive.
 * **Example** (Acquire inside an execution scope)
 * ```ts
 * import { acquireTrialRetentionLease } from "@beep/repo-cli/test/AgentEffectiveness"
 * console.log(acquireTrialRetentionLease)
 * ```
 * @category execution
 * @since 0.0.0
 */
export const acquireTrialRetentionLease = Effect.fn("AgentEffectiveness.acquireTrialRetentionLease")(function* (
  planPath: string
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const plan = yield* TrialPlanJson.decode(yield* fs.readFileString(planPath));
  const root = path.join(plan.workspaceRoot, `${plan.runId}-${plan.attemptId}`);
  const owner = yield* trialArtifact(path.join(root, ".retention-owner"));
  const binding = yield* checkOwnership(root, owner);
  if (!equalArtifact(binding.plan, yield* trialArtifact(planPath)))
    return yield* fail("Lease plan differs from initialized ownership");
  yield* acquireOperation(root, `retention:execution:${procProcessTable.self}:${binding.plan.digest}`);
  const leaseRoot = path.join(root, ".retention-lease");
  const leaseText = yield* TrialRetentionOwnershipJson.encode(binding);
  const lease = { path: leaseRoot, digest: yield* hashPublicTextSha256(leaseText) };
  return yield* Effect.acquireRelease(
    fs.writeFileString(leaseRoot, leaseText, { flag: "wx", mode: 0o600 }).pipe(Effect.as(leaseRoot)),
    () =>
      validateArtifact(lease).pipe(
        Effect.andThen(validateArtifact(owner)),
        Effect.andThen(fs.remove(leaseRoot)),
        Effect.orDie
      )
  );
}, Effect.mapError(boundary));

/** Record exact raw-byte evidence after evaluator process capture has completely drained.
 * **Details**
 * The executor calls this after its scoped spool closes, including failed native
 * executions. It is not a model self-attestation or a successful trial verdict.
 * **Example** (Inspect the evaluator lifecycle hook)
 * ```ts
 * import { recordTrialRetentionCapture } from "@beep/repo-cli/test/AgentEffectiveness"
 * console.log(recordTrialRetentionCapture)
 * ```
 * @category execution
 * @since 0.0.0
 */
export const recordTrialRetentionCapture = Effect.fn("AgentEffectiveness.recordTrialRetentionCapture")(function* (
  planPath: string
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const plan = yield* TrialPlanJson.decode(yield* fs.readFileString(planPath));
  const receipts = path.join(plan.receiptRoot, `${plan.runId}-${plan.attemptId}`);
  yield* canonical(receipts);
  const stdout = yield* trialArtifact(path.join(receipts, "stdout.jsonl"));
  const stderr = yield* trialArtifact(path.join(receipts, "stderr.log"));
  const capture = TrialRetentionCapture.make({
    schemaVersion: "agent-trial-retention-capture/v1",
    plan: yield* trialArtifact(planPath),
    stdout,
    stderr,
    stdoutBytes: Number((yield* fs.stat(stdout.path)).size),
    stderrBytes: Number((yield* fs.stat(stderr.path)).size),
    state: "drained",
  });
  const destination = path.join(receipts, "capture-completion.json");
  yield* fs.writeFileString(destination, yield* TrialRetentionCaptureJson.encode(capture), { flag: "wx", mode: 0o600 });
  return yield* trialArtifact(destination);
}, Effect.mapError(boundary));

/** Qualify complete terminal source retention and return an eligible plan without deleting directories.
 * **Example** (Inspect a protected evaluator request)
 * ```ts
 * import { retainTrial } from "@beep/repo-cli/test/AgentEffectiveness"
 * import * as Effect from "effect/Effect"
 * console.log(Effect.isEffect(retainTrial("/private/retain-request.json"))) // true: no file is read until execution
 * ```
 * @category execution
 * @since 0.0.0
 */
export const retainTrial = Effect.fn("AgentEffectiveness.retainTrial")(
  function* (requestPath: string) {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const request = yield* TrialRetainRequestJson.decode(yield* fs.readFileString(requestPath));
    yield* validateTrialInventory(request.system);
    yield* checkOwnership(request.ownerRoot, request.ownership);
    yield* acquireOperation(
      request.ownerRoot,
      `retention:retain:${procProcessTable.self}:${(yield* trialArtifact(requestPath)).digest}`
    );
    const ownership = yield* checkOwnership(request.ownerRoot, request.ownership);
    yield* Effect.forEach(
      [request.attempt, request.classification, request.capture, request.receiptInventory],
      validateArtifact,
      { concurrency: 1 }
    );
    const attempt = yield* TrialAttemptJson.decode(yield* fs.readFileString(request.attempt.path));
    yield* validateArtifact(attempt.plan);
    const plan = yield* TrialPlanJson.decode(yield* fs.readFileString(attempt.plan.path));
    const classification = yield* TrialRetentionClassificationJson.decode(
      yield* fs.readFileString(request.classification.path)
    );
    if (
      classification.completeness !== "complete" ||
      !equalArtifact(classification.attempt, request.attempt) ||
      !equalArtifact(ownership.plan, attempt.plan) ||
      ownership.runId !== attempt.runId ||
      ownership.attemptId !== attempt.attemptId ||
      request.ownerRoot !== path.join(plan.workspaceRoot, `${attempt.runId}-${attempt.attemptId}`) ||
      attempt.workspace !== path.join(request.ownerRoot, "worktree") ||
      request.receiptInventory.path !== path.dirname(request.attempt.path) ||
      O.isNone(attempt.bundle)
    )
      return yield* fail("Incomplete classification, foreign ownership or absent retained candidate bundle");
    const capture = yield* TrialRetentionCaptureJson.decode(yield* fs.readFileString(request.capture.path));
    if (
      capture.state !== "drained" ||
      !equalArtifact(capture.plan, attempt.plan) ||
      !equalArtifact(capture.stdout, attempt.stdout) ||
      !equalArtifact(capture.stderr, attempt.stderr) ||
      capture.stdoutBytes !== Number((yield* fs.stat(attempt.stdout.path)).size) ||
      capture.stderrBytes !== Number((yield* fs.stat(attempt.stderr.path)).size) ||
      request.capture.path !== path.join(request.receiptInventory.path, "capture-completion.json")
    )
      return yield* fail("Raw capture is truncated, missing or does not bind the exact retained streams");
    let dependencies = [
      request.attempt,
      request.classification,
      request.ownership,
      request.receiptInventory,
      request.capture,
      classification.terminalEvidence,
      attempt.plan,
      attempt.stdout,
      attempt.stderr,
      attempt.diff,
      attempt.bundle.value,
      ...attempt.indexStates,
      ...O.toArray(attempt.sourceArchive),
      ...O.toArray(attempt.nativeInvocation),
      ...A.flatMap(O.toArray(O.fromUndefinedOr(attempt.nativeSessionIdentity)), (identity) => identity.artifacts),
      ...classification.evidence,
    ];
    let declaredInputs = TrialRetentionInputs.make({
      roots: [request.system.root],
      inventories: [TrialRuntimeClosure.make({ target: "/runtime/system", inventory: request.system })],
      artifacts: [],
    });
    let committed: O.Option<TrialCommittedSource> = O.none();
    let sourceArtifact: O.Option<TrialArtifact> = O.none();
    let finalCommit = request.source.kind === "source-only" ? request.source.finalCommit : "";
    if (request.source.kind === "collected") {
      yield* Effect.forEach([request.source.committedSource, request.source.collection], validateArtifact, {
        concurrency: 1,
      });
      const source = yield* TrialCommittedSourceJson.decode(
        yield* fs.readFileString(request.source.committedSource.path)
      );
      const collection = yield* TrialCollectRequestJson.decode(
        yield* fs.readFileString(request.source.collection.path)
      );
      if (
        !equalArtifact(collection.attempt, request.attempt) ||
        source.workspace !== path.join(collection.reconstructionRoot, "worktree") ||
        path.dirname(request.source.committedSource.path) !== collection.reconstructionRoot ||
        !equalArtifact(attempt.bundle.value, source.bundle)
      )
        return yield* fail("Collected source root does not bind this exact attempt");
      for (const check of [...collection.checks, collection.yeet])
        declaredInputs = mergeDeclaredInputs(
          declaredInputs,
          declaredCheckInputs(check, collection.runtime, collection.projectedRuntime)
        );
      finalCommit = source.finalCommit;
      committed = O.some(source);
      sourceArtifact = O.some(request.source.committedSource);
      dependencies = A.appendAll(dependencies, [
        request.source.committedSource,
        request.source.collection,
        ...sourceDependencies(source),
      ]);
    } else {
      if (
        attempt.terminal.status === "awaiting-proof" ||
        attempt.terminal.status !== classification.outcome ||
        !equalArtifact(classification.terminalEvidence, request.attempt)
      )
        return yield* fail(
          "Source-only retention requires the actual failed or aborted coding terminal, not a scoring verdict"
        );
      dependencies = A.appendAll(dependencies, O.toArray(O.fromUndefinedOr(plan.baseBundle)));
    }
    if (attempt.terminal.status === "awaiting-proof" && attempt.terminal.finalCommit !== finalCommit)
      return yield* fail("Candidate commit differs from immutable attempt");
    if (request.source.kind === "collected") {
      yield* validateArtifact(classification.terminalEvidence);
      const text = yield* fs.readFileString(classification.terminalEvidence.path);
      const finalization = TrialFinalizationJson.decodeOption(text);
      const acceptance = TrialAcceptanceJson.decodeOption(text);
      if (
        !O.exists(
          finalization,
          (record) => equalArtifact(record.attempt, request.attempt) && record.status === classification.outcome
        ) &&
        !O.exists(
          acceptance,
          (record) =>
            record.finalCommit === finalCommit &&
            record.taskDigest === plan.taskDigest &&
            record.acceptanceDigest === plan.acceptanceDigest &&
            classification.outcome === "failed" &&
            A.some(record.requiredChecks, (check) => !check.passed)
        )
      )
        return yield* fail("Terminal outcome differs from collected evidence");
      for (const record of O.toArray(finalization)) {
        dependencies = A.appendAll(dependencies, yield* proofDependencies(record.proof, request.attempt, finalCommit));
        const proof = yield* TrialProofJson.decode(yield* fs.readFileString(record.proof.path));
        declaredInputs = mergeDeclaredInputs(declaredInputs, yield* acceptanceInputs(proof.acceptance));
        for (const collection of O.toArray(O.fromUndefinedOr(proof.fullYeetCollection)))
          declaredInputs = mergeDeclaredInputs(declaredInputs, yield* acceptanceInputs(collection));
      }
      if (O.isSome(acceptance)) {
        dependencies = A.appendAll(
          dependencies,
          yield* acceptanceDependencies(classification.terminalEvidence, finalCommit)
        );
        declaredInputs = mergeDeclaredInputs(declaredInputs, yield* acceptanceInputs(classification.terminalEvidence));
      }
    }
    for (const artifact of O.toArray(attempt.nativeInvocation)) {
      const invocation = yield* S.decodeEffect(S.fromJsonString(TrialNativeInvocation))(
        yield* fs.readFileString(artifact.path)
      );
      dependencies = A.appendAll(dependencies, invocation.configuration);
    }
    yield* Effect.forEach(dependencies, validateArtifact, { concurrency: 1 });
    yield* validateDeclaredInputs(declaredInputs);
    const eligible = [attempt.workspace, path.join(request.ownerRoot, "repository.git")];
    const protectedPaths = [
      requestPath,
      request.system.root,
      ...declaredInputs.roots,
      ...eligible,
      ...A.map(dependencies, (artifact) => artifact.path),
      ...A.map(O.toArray(committed), (source) => source.workspace),
    ];
    yield* validateOutput(request.outputRoot, protectedPaths);
    if (yield* fs.exists(request.outputRoot)) return yield* fail("Qualification output must be fresh");
    yield* verifyBundleHead(attempt.workspace, attempt.bundle.value, finalCommit, request.system);
    yield* fs.makeDirectory(request.outputRoot, { mode: 0o700 });
    const witness = yield* reconstructTrialSource(
      path.join(request.outputRoot, request.source.kind === "source-only" ? "source" : "witness"),
      attempt.bundle.value,
      request.source.kind === "source-only"
        ? O.fromUndefinedOr(plan.baseBundle)
        : O.flatMap(committed, (source) => source.baseBundle),
      finalCommit,
      attempt.baseCommit,
      request.system
    );
    const restored = yield* TrialCommittedSourceJson.decode(yield* fs.readFileString(witness.source.path));
    if (
      O.exists(
        committed,
        (source) => source.tree !== restored.tree || source.sourceArchive.digest !== restored.sourceArchive.digest
      )
    )
      return yield* fail("Fresh witness differs from immutable source");
    yield* verifySource(attempt.workspace, restored, request.system);
    const trackedBytes = yield* compareTrackedBytes(
      attempt.workspace,
      witness.workspace,
      request.system,
      path.join(request.outputRoot, "byte-audit")
    );
    dependencies = A.appendAll(dependencies, [witness.source, trackedBytes, ...sourceDependencies(restored)]);
    const committedSource = O.getOrElse(sourceArtifact, () => witness.source);
    const usage = yield* parseTrialUsage(
      plan.provider,
      yield* fs.readFileString(attempt.stdout.path),
      plan.selectedToolNames
    );
    const result = TrialRetention.make({
      schemaVersion: "agent-trial-retention/v1",
      request: yield* trialArtifact(requestPath),
      attempt: request.attempt,
      classification: request.classification,
      committedSource,
      source: request.source,
      ownerRoot: request.ownerRoot,
      ownership: request.ownership,
      outcome: classification.outcome,
      usageCoverage: usage.coverage,
      dependencies: [yield* trialArtifact(requestPath), ...dependencies],
      witness: witness.source,
      trackedBytes,
      declaredInputs,
      codingEligibleDirectories: [attempt.workspace, ...eligible],
      collectorWorkspace: O.getOrElse(committed, () => restored).workspace,
    });
    const resultPath = path.join(request.outputRoot, "retention.json");
    yield* fs.writeFileString(resultPath, yield* TrialRetentionJson.encode(result), { flag: "wx", mode: 0o600 });
    return resultPath;
  },
  Effect.scoped,
  Effect.mapError(boundary)
);

/** Reconstruct an absent original Collector workspace while preserving immutable evidence and interrupted witnesses.
 * **Example** (Use a digest-bound explicit restoration request)
 * ```ts
 * import { rehydrateTrial } from "@beep/repo-cli/test/AgentEffectiveness"
 * import * as Effect from "effect/Effect"
 * console.log(Effect.isEffect(rehydrateTrial("/private/restore-request.json"))) // true: deferred workflow
 * ```
 * @category execution
 * @since 0.0.0
 */
export const rehydrateTrial = Effect.fn("AgentEffectiveness.rehydrateTrial")(
  function* (requestPath: string) {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const request = yield* TrialRehydrateRequestJson.decode(yield* fs.readFileString(requestPath));
    yield* validateTrialInventory(request.system);
    yield* validateArtifact(request.retention);
    const retained = yield* TrialRetentionJson.decode(yield* fs.readFileString(request.retention.path));
    yield* checkOwnership(retained.ownerRoot, retained.ownership);
    yield* acquireOperation(
      retained.ownerRoot,
      `retention:rehydrate:${procProcessTable.self}:${(yield* trialArtifact(requestPath)).digest}`
    );
    yield* checkOwnership(retained.ownerRoot, retained.ownership);
    yield* Effect.forEach(retained.dependencies, validateArtifact, { concurrency: 1 });
    yield* validateDeclaredInputs(retained.declaredInputs);
    const source = yield* TrialCommittedSourceJson.decode(yield* fs.readFileString(retained.committedSource.path));
    const attempt = yield* TrialAttemptJson.decode(yield* fs.readFileString(retained.attempt.path));
    yield* validateArtifact(retained.request);
    const originalRequest = yield* TrialRetainRequestJson.decode(yield* fs.readFileString(retained.request.path));
    if (retained.source.kind === "collected") {
      const collection = yield* TrialCollectRequestJson.decode(
        yield* fs.readFileString(retained.source.collection.path)
      );
      if (
        !equalArtifact(collection.attempt, retained.attempt) ||
        collection.reconstructionRoot !== path.dirname(source.workspace) ||
        path.dirname(retained.committedSource.path) !== collection.reconstructionRoot
      )
        return yield* fail("Collected workspace does not bind immutable attempt/root");
    } else if (
      originalRequest.source.kind !== "source-only" ||
      source.finalCommit !== originalRequest.source.finalCommit ||
      source.workspace !== path.join(originalRequest.outputRoot, "source/worktree") ||
      retained.committedSource.path !== path.join(originalRequest.outputRoot, "source/reconstruction.json")
    )
      return yield* fail("Source-only workspace does not bind the exact owned qualification root");
    yield* validateOutput(request.outputRoot, [
      requestPath,
      request.retention.path,
      request.system.root,
      source.workspace,
      ...retained.declaredInputs.roots,
      ...retained.codingEligibleDirectories,
      ...A.map(retained.dependencies, (artifact) => artifact.path),
    ]);
    yield* canonical(path.dirname(source.workspace));
    yield* canonical(path.dirname(request.outputRoot));
    if (!path.isAbsolute(request.outputRoot) || path.normalize(request.outputRoot) !== request.outputRoot)
      return yield* fail("Restore output path is noncanonical");
    const requestArtifact = yield* trialArtifact(requestPath);
    const checkpointPath = path.join(request.outputRoot, "rehydration.json");
    const witnessRoot = path.join(request.outputRoot, "witness");
    let recoveryRoots: ReadonlyArray<string> = [];
    const operationStart = yield* processStartIdentityForPid(procProcessTable.self);
    if (O.isNone(operationStart))
      return yield* fail("Evaluator process start identity is unknown; restoration refuses");
    if ((yield* fs.exists(source.workspace)) && !(yield* fs.exists(request.outputRoot)))
      return yield* fail("Original workspace exists; no matching recovery operation authorizes inspection");
    if (yield* fs.exists(request.outputRoot)) {
      yield* canonical(request.outputRoot);
      if (!(yield* fs.exists(checkpointPath))) return yield* fail("Foreign restore output has no operation checkpoint");
      const prior = yield* TrialRehydrationJson.decode(yield* fs.readFileString(checkpointPath));
      if (
        !equalArtifact(prior.request, requestArtifact) ||
        !equalArtifact(prior.retention, request.retention) ||
        prior.originalWorkspace !== source.workspace
      )
        return yield* fail("Interrupted restore does not belong to this immutable request");
      if (
        (prior.operationPid !== procProcessTable.self || prior.operationStart !== operationStart.value) &&
        (yield* isProcessIdentityAlive({ pid: prior.operationPid, procStart: prior.operationStart }))
      )
        return yield* fail("Interrupted operation owner is live or unknown; retain its witness and refuse");
      if (prior.phase === "verified") {
        yield* verifySource(source.workspace, source, request.system);
        yield* verifyTrackedBytes(source.workspace, retained.trackedBytes);
        return checkpointPath;
      }
      if (yield* fs.exists(source.workspace)) {
        const witnessPath = path.join(witnessRoot, "reconstruction.json");
        if (!(yield* fs.exists(witnessPath)))
          return yield* fail("Published workspace has no bound interrupted witness");
        const published = yield* TrialCommittedSourceJson.decode(yield* fs.readFileString(witnessPath));
        if (
          published.workspace !== path.join(witnessRoot, "worktree") ||
          published.finalCommit !== source.finalCommit ||
          published.tree !== source.tree ||
          !equalArtifact(published.bundle, source.bundle) ||
          published.sourceArchive.digest !== source.sourceArchive.digest
        )
          return yield* fail("Published interrupted witness does not bind the immutable source");
        yield* verifySource(source.workspace, source, request.system);
        yield* verifyTrackedBytes(source.workspace, retained.trackedBytes);
        yield* writeCheckpoint(checkpointPath, TrialRehydration.make({ ...prior, phase: "verified" }));
        return checkpointPath;
      }
      recoveryRoots = prior.recoveryRoots;
      if (yield* fs.exists(witnessRoot)) {
        const recovery = path.join(request.outputRoot, `recovery-${A.length(recoveryRoots)}`);
        yield* fs.rename(witnessRoot, recovery);
        recoveryRoots = A.append(recoveryRoots, recovery);
      }
    } else yield* fs.makeDirectory(request.outputRoot, { mode: 0o700 });
    const checkpoint = TrialRehydration.make({
      schemaVersion: "agent-trial-rehydration/v1",
      request: requestArtifact,
      retention: request.retention,
      committedSource: retained.committedSource,
      originalWorkspace: source.workspace,
      witnessRoot,
      phase: "started",
      outcome: retained.outcome,
      recoveryRoots,
      operationPid: procProcessTable.self,
      operationStart: operationStart.value,
    });
    yield* writeCheckpoint(checkpointPath, checkpoint);
    if (yield* fs.exists(source.workspace))
      return yield* fail("Original workspace exists; explicit restoration refuses to overwrite it");
    const witness = yield* reconstructTrialSource(
      witnessRoot,
      source.bundle,
      source.baseBundle,
      source.finalCommit,
      attempt.baseCommit,
      request.system
    );
    const restored = yield* TrialCommittedSourceJson.decode(yield* fs.readFileString(witness.source.path));
    if (restored.tree !== source.tree || restored.sourceArchive.digest !== source.sourceArchive.digest)
      return yield* fail("Restoration changed exact source tree or source archive");
    yield* fs.rename(witness.workspace, source.workspace);
    yield* verifySource(source.workspace, source, request.system);
    yield* verifyTrackedBytes(source.workspace, retained.trackedBytes);
    yield* Effect.forEach(retained.dependencies, validateArtifact, { concurrency: 1 });
    yield* validateDeclaredInputs(retained.declaredInputs);
    yield* writeCheckpoint(checkpointPath, TrialRehydration.make({ ...checkpoint, phase: "verified" }));
    return checkpointPath;
  },
  Effect.scoped,
  Effect.mapError(boundary)
);
