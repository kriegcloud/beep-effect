import { hashPublicTextSha256 } from "@beep/repo-ai-metrics/privacy";
import {
  acquireTrialRetentionLease,
  captureTrialInventory,
  hashTrialInput,
  initializeTrialRetentionOwnership,
  parseTrialUsage,
  reconstructTrialSource,
  recordTrialRetentionCapture,
  rehydrateTrial,
  retainTrial,
  retainTrialCandidate,
  TrialAcceptance,
  TrialAcceptanceJson,
  TrialArtifact,
  TrialAttempt,
  TrialAttemptJson,
  TrialBootstrapFile,
  TrialBrokerControl,
  TrialCollectedRetentionSource,
  TrialCollectRequest,
  TrialCollectRequestJson,
  TrialEvaluatorCheck,
  TrialFinalization,
  TrialFinalizationJson,
  TrialInputInventory,
  TrialNativeRuntimeEvidence,
  TrialNativeYeetRuntime,
  TrialPlan,
  TrialPlanJson,
  TrialProof,
  TrialProofJson,
  TrialRehydrateRequest,
  TrialRehydrateRequestJson,
  TrialRetainRequest,
  TrialRetainRequestJson,
  TrialRetentionCapture,
  TrialRetentionCaptureJson,
  TrialRetentionClassification,
  TrialRetentionClassificationJson,
  TrialRetentionJson,
  TrialUnscoredRetentionSource,
  trialArtifact,
  validateTrialInventory,
} from "@beep/repo-cli/test/AgentEffectiveness";
import { runCaptured, runSpooledStreams } from "@beep/repo-cli/test/Process";
import { YeetVerdict, YeetVerdictJson, YeetVerdictLane } from "@beep/repo-cli/test/Yeet";
import { Sha256Hex } from "@beep/schema/Sha256";
import * as BunCrypto from "@effect/platform-bun/BunCrypto";
import { NodeServices } from "@effect/platform-node";
import { expect, layer } from "@effect/vitest";
import * as A from "effect/Array";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Path from "effect/Path";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as Tuple from "effect/Tuple";

const zero = Sha256Hex.make(Str.repeat(64)("0"));
const setup = Effect.fn("TrialRetentionTest.setup")(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const home = yield* Config.String("HOME");
  const cache = path.join(home, ".cache/beep/retention-tests");
  yield* fs.makeDirectory(cache, { recursive: true });
  const root = yield* fs.makeTempDirectoryScoped({ directory: cache });
  const ownerRoot = path.join(root, "arms/run-one");
  const workspace = path.join(ownerRoot, "worktree");
  const receipts = path.join(root, "receipts/run-one");
  const systemRoot = path.join(root, "system");
  yield* fs.makeDirectory(workspace, { recursive: true });
  yield* fs.makeDirectory(receipts, { recursive: true });
  yield* fs.makeDirectory(systemRoot);
  const command = Effect.fn("TrialRetentionTest.command")(function* (
    binary: string,
    args: ReadonlyArray<string>,
    cwd = workspace
  ) {
    const result = yield* runCaptured({
      command: binary,
      args,
      cwd,
      env: { PATH: "/usr/bin:/bin", HOME: "/nonexistent", GIT_CONFIG_NOSYSTEM: "1" },
      extendEnv: false,
      source: "stdout",
      timeout: "10 seconds",
    });
    expect(result.exitCode).toBe(0);
    return Str.trim(result.output);
  });
  const git = (args: ReadonlyArray<string>) =>
    command("/usr/bin/git", [
      "-c",
      "user.name=Fixture",
      "-c",
      "user.email=fixture@localhost",
      "-c",
      "core.hooksPath=/dev/null",
      ...args,
    ]);
  yield* git(["init"]);
  yield* fs.writeFileString(path.join(workspace, "answer.ts"), "export const answer = 42\n");
  yield* git(["add", "."]);
  yield* git(["commit", "-m", "fixture"]);
  const base = yield* git(["rev-parse", "HEAD"]);
  const baseBundle = path.join(receipts, "base.bundle");
  yield* git(["bundle", "create", baseBundle, "HEAD"]);
  yield* fs.writeFileString(
    path.join(workspace, "answer.ts"),
    "export const answer = 42\n// retained clean candidate\n"
  );
  yield* git(["add", "."]);
  yield* git(["commit", "-m", "candidate"]);
  const head = yield* git(["rev-parse", "HEAD"]);
  const candidate = path.join(receipts, "candidate.bundle");
  yield* git(["bundle", "create", candidate, "HEAD", `^${base}`]);

  const binaries = [
    "/usr/bin/git",
    "/usr/lib/git-core/git-pack-objects",
    "/usr/lib/git-core/git-index-pack",
    "/usr/lib/git-core/git-unpack-objects",
  ];
  const libraries = yield* Effect.forEach(binaries, (binary) => command("/usr/bin/ldd", [binary]));
  const paths = A.dedupe([
    ...binaries,
    ...A.flatMap(libraries, (output) =>
      A.flatMap(Str.split("\n")(output), (line) => O.toArray(O.map(Str.match(/\/[^\s]+/)(line), (match) => match[0])))
    ),
  ]);
  for (const original of paths) {
    const projected = Str.startsWith("/lib")(original) ? yield* fs.realPath(original) : original;
    const destination = path.join(systemRoot, path.relative("/", projected));
    yield* fs.makeDirectory(path.dirname(destination), { recursive: true });
    yield* fs.copyFile(original, destination);
  }
  for (const name of ["bin", "lib", "lib64"]) yield* fs.makeDirectory(path.join(systemRoot, name));
  yield* fs.copyFile("/usr/lib/ld-linux-x86-64.so.2", path.join(systemRoot, "lib64/ld-linux-x86-64.so.2"));
  const names = A.sort(yield* fs.readDirectory(systemRoot, { recursive: true }), Str.Order);
  const files = R.fromEntries(
    yield* Effect.forEach(names, (name) =>
      Effect.gen(function* () {
        const full = path.join(systemRoot, name);
        return (yield* fs.stat(full)).type === "File"
          ? O.some(Tuple.make(name, yield* hashTrialInput(full)))
          : O.none();
      })
    ).pipe(Effect.map(A.getSomes))
  );
  const symlinks = {};
  const directories = ["bin", "lib"];
  const system = TrialInputInventory.make({
    root: systemRoot,
    files,
    symlinks,
    directories,
    digest: yield* hashPublicTextSha256(
      yield* S.encodeEffect(S.fromJsonString(S.Unknown))({ files, symlinks, directories })
    ),
  });
  const empty = path.join(root, "sealed");
  yield* fs.makeDirectory(empty);
  const input = TrialInputInventory.make({
    root: empty,
    files: {},
    symlinks: {},
    digest: yield* hashPublicTextSha256('{"files":{},"symlinks":{}}'),
  });
  const check = TrialEvaluatorCheck.make({
    id: "task",
    kind: "vitest",
    commandTemplate: ["fixture"],
    environmentTemplate: {},
    input,
    expectedCases: ["case"],
    expectedPackage: O.none(),
    reportRelativePath: O.none(),
    writableCacheTargets: [],
    compilerOverlay: O.none(),
    timeoutMs: 1000,
  });
  const plan = TrialPlan.make({
    schemaVersion: "agent-trial-plan/v1",
    runId: "run",
    attemptId: "one",
    provider: "codex",
    model: "gpt-6.1-sol",
    effort: "medium",
    baseCommit: base,
    sourceDigest: zero,
    taskDigest: zero,
    acceptanceDigest: zero,
    configDigest: zero,
    toolId: "none",
    selectedToolNames: [],
    requiredYeetLaneIds: ["test"],
    requiredTaskCheckIds: ["task"],
    requiredCheckSpecs: [{ id: "task", commandTemplate: ["fixture"], inputBundleDigest: zero, contractDigest: zero }],
    baseBundle: yield* trialArtifact(baseBundle),
    sourceRepository: workspace,
    workspaceRoot: path.join(root, "arms"),
    receiptRoot: path.join(root, "receipts"),
    command: "/runtime/fixture",
    commandDigest: zero,
    delegation: "disabled",
    networkAdmission: "blocked-until-broker",
    args: [],
    environment: {},
    mounts: [],
    promptPath: path.join(root, "prompt"),
    timeoutMs: 1000,
    isolationAttestationPath: path.join(root, "canary"),
    isolationAttestationDigest: zero,
  });
  const planPath = path.join(receipts, "plan.json");
  yield* fs.writeFileString(planPath, yield* TrialPlanJson.encode(plan));
  const ownership = yield* initializeTrialRetentionOwnership(planPath);
  const raw = '{"type":"turn.completed","usage":{"input_tokens":1,"output_tokens":1,"cached_input_tokens":0}}\n';
  const stdout = path.join(receipts, "stdout.jsonl");
  const stderr = path.join(receipts, "stderr.log");
  const diff = path.join(receipts, "candidate.diff");
  yield* fs.writeFileString(stdout, raw);
  yield* fs.writeFileString(stderr, "complete native stderr\n");
  yield* fs.writeFileString(diff, "retained diff\n");
  const attempt = TrialAttempt.make({
    schemaVersion: "agent-trial-attempt/v1",
    plan: yield* trialArtifact(planPath),
    sourceArchive: O.none(),
    nativeInvocation: O.none(),
    runId: "run",
    attemptId: "one",
    baseCommit: base,
    workspace,
    elapsedMs: 1,
    setupElapsedMs: O.none(),
    codingElapsedMs: O.none(),
    retentionElapsedMs: O.none(),
    exitCode: O.some(0),
    stdout: yield* trialArtifact(stdout),
    stderr: yield* trialArtifact(stderr),
    diff: yield* trialArtifact(diff),
    bundle: O.some(yield* trialArtifact(candidate)),
    indexStates: [],
    usage: yield* parseTrialUsage("codex", raw, []),
    terminal: { status: "awaiting-proof", finalCommit: head },
  });
  const attemptPath = path.join(receipts, "attempt.json");
  yield* fs.writeFileString(attemptPath, yield* TrialAttemptJson.encode(attempt));
  const collectionPath = path.join(root, "collect.json");
  const collection = TrialCollectRequest.make({
    schemaVersion: "agent-trial-collect-request/v1",
    attempt: yield* trialArtifact(attemptPath),
    reconstructionRoot: path.join(root, "collector"),
    outputRoot: path.join(root, "checks"),
    checks: [check],
    yeet: check,
    runtime: [],
    projectedRuntime: [],
  });
  yield* fs.writeFileString(collectionPath, yield* TrialCollectRequestJson.encode(collection));
  const source = yield* reconstructTrialSource(
    collection.reconstructionRoot,
    yield* trialArtifact(candidate),
    O.some(yield* trialArtifact(baseBundle)),
    head,
    base,
    system
  );
  const terminalPath = path.join(root, "acceptance.json");
  const checkOutput = path.join(collection.outputRoot, "check-0");
  const terminal = TrialAcceptance.make({
    schemaVersion: "agent-trial-acceptance/v1",
    taskDigest: zero,
    acceptanceDigest: zero,
    finalCommit: head,
    requiredChecks: [
      {
        id: "task",
        passed: false,
        inputBundleDigest: zero,
        commandTemplate: ["fixture"],
        inputBundle: TrialArtifact.make({ path: empty, digest: yield* hashTrialInput(empty) }),
        bindings: { candidate: source.workspace, sealed: empty, output: checkOutput },
        resolvedArgv: ["fixture"],
        cwd: source.workspace,
        filteredEnvironment: {},
        invocationDigest: zero,
        headBefore: head,
        headAfter: head,
        fingerprintBefore: zero,
        fingerprintAfter: zero,
        exitCode: 1,
        stdout: attempt.stderr,
        stderr: attempt.stderr,
        parsedOutcome: attempt.stderr,
        collected: 1,
        passedCount: 0,
        failedCount: 1,
        collectionFailures: 0,
      },
    ],
  });
  yield* fs.writeFileString(terminalPath, yield* TrialAcceptanceJson.encode(terminal));
  const classificationPath = path.join(root, "classification.json");
  const classification = TrialRetentionClassification.make({
    schemaVersion: "agent-trial-retention-classification/v1",
    attempt: yield* trialArtifact(attemptPath),
    outcome: "failed",
    completeness: "complete",
    evidence: [yield* trialArtifact(terminalPath)],
    terminalEvidence: yield* trialArtifact(terminalPath),
    reasons: ["task assertion failed"],
  });
  yield* fs.writeFileString(classificationPath, yield* TrialRetentionClassificationJson.encode(classification));
  const capture = yield* recordTrialRetentionCapture(planPath);
  const requestPath = path.join(root, "retain-request.json");
  const request = TrialRetainRequest.make({
    schemaVersion: "agent-trial-retain-request/v1",
    attempt: yield* trialArtifact(attemptPath),
    classification: yield* trialArtifact(classificationPath),
    source: TrialCollectedRetentionSource.make({
      kind: "collected",
      committedSource: source.source,
      collection: yield* trialArtifact(collectionPath),
    }),
    receiptInventory: TrialArtifact.make({ path: receipts, digest: yield* hashTrialInput(receipts) }),
    ownerRoot,
    ownership,
    capture,
    outputRoot: path.join(root, "retained"),
    system,
  });
  yield* fs.writeFileString(requestPath, yield* TrialRetainRequestJson.encode(request));
  return {
    fs,
    path,
    root,
    planPath,
    request,
    requestPath,
    source,
    attempt,
    receipts,
    classification,
    collectionPath,
    classificationPath,
    stdout,
    ownership,
  };
});

const nativeFailed = Effect.fn("TrialRetentionTest.nativeFailed")(function* (
  f: Effect.Success<ReturnType<typeof setup>>
) {
  for (const artifact of [f.attempt.stdout, f.attempt.stderr, f.request.capture])
    yield* f.fs.rename(artifact.path, f.path.join(f.root, `${f.path.basename(artifact.path)}-pre-native-recovery`));
  const code = yield* runSpooledStreams({
    command: "/bin/sh",
    args: [
      "-c",
      'printf \'%s\\n\' \'{"type":"turn.completed","usage":{"input_tokens":1,"output_tokens":1,"cached_input_tokens":0}}\'; printf \'native failure\\n\' >&2; exit 7',
    ],
    env: {},
    extendEnv: false,
    stdoutPath: f.attempt.stdout.path,
    stderrPath: f.attempt.stderr.path,
  });
  expect(code).toBe(7);
  const attempt = TrialAttempt.make({
    ...f.attempt,
    stdout: yield* trialArtifact(f.attempt.stdout.path),
    stderr: yield* trialArtifact(f.attempt.stderr.path),
    exitCode: O.some(code),
    terminal: { status: "failed", reason: "native child exit7 after committed candidate" },
  });
  yield* f.fs.writeFileString(f.request.attempt.path, yield* TrialAttemptJson.encode(attempt));
  const artifact = yield* trialArtifact(f.request.attempt.path);
  const capture = yield* recordTrialRetentionCapture(f.planPath);
  yield* f.fs.writeFileString(
    f.classificationPath,
    yield* TrialRetentionClassificationJson.encode(
      TrialRetentionClassification.make({
        ...f.classification,
        attempt: artifact,
        terminalEvidence: artifact,
        evidence: [artifact],
        outcome: "failed",
      })
    )
  );
  const request = TrialRetainRequest.make({
    ...f.request,
    attempt: artifact,
    classification: yield* trialArtifact(f.classificationPath),
    capture,
    receiptInventory: TrialArtifact.make({ path: f.receipts, digest: yield* hashTrialInput(f.receipts) }),
    source: TrialUnscoredRetentionSource.make({ kind: "source-only", finalCommit: f.source.finalCommit }),
  });
  yield* f.fs.writeFileString(f.requestPath, yield* TrialRetainRequestJson.encode(request));
  return request;
});

const finalized = Effect.fn("TrialRetentionTest.finalized")(function* (
  f: Effect.Success<ReturnType<typeof setup>>,
  status: "passed" | "failed"
) {
  const acceptancePath = f.path.join(f.root, "native-acceptance.json");
  const original = yield* TrialAcceptanceJson.decode(
    yield* f.fs.readFileString(f.classification.terminalEvidence.path)
  );
  const runtimeEvidencePath = f.path.join(f.root, "native-runtime-evidence.json");
  yield* f.fs.writeFileString(
    runtimeEvidencePath,
    yield* S.encodeEffect(S.fromJsonString(TrialNativeRuntimeEvidence))(
      TrialNativeRuntimeEvidence.make({
        schemaVersion: "agent-trial-native-runtime-evidence/v1",
        runtimeDigest: zero,
        manifestBefore: zero,
        manifestAfter: zero,
        preserved: true,
        systemDigest: zero,
        nixDigest: zero,
        ociDigest: zero,
        image: "synthetic-storage-guard",
      })
    )
  );
  const runtimeEvidence = yield* trialArtifact(runtimeEvidencePath);
  const acceptance = TrialAcceptance.make({
    ...original,
    requiredChecks: A.map(original.requiredChecks, (check) => ({
      ...check,
      nativeRuntimeEvidence: runtimeEvidence,
      passed: status === "passed",
      exitCode: status === "passed" ? 0 : 1,
      passedCount: status === "passed" ? 1 : 0,
      failedCount: status === "passed" ? 0 : 1,
    })),
  });
  yield* f.fs.writeFileString(acceptancePath, yield* TrialAcceptanceJson.encode(acceptance));
  const fullPath = f.path.join(f.root, "full-yeet-collection.json");
  yield* f.fs.writeFileString(fullPath, yield* TrialAcceptanceJson.encode(acceptance));
  const verdictPath = f.path.join(f.root, "native-verdict.json");
  yield* f.fs.writeFileString(
    verdictPath,
    yield* YeetVerdictJson.encode(
      YeetVerdict.make({
        schemaVersion: "yeet-verdict/v2",
        base: f.attempt.baseCommit,
        branch: "detached",
        committed: false,
        createdAt: "2026-10-10T00:00:00.000Z",
        head: f.source.finalCommit,
        lanes: [
          YeetVerdictLane.make({
            id: "test",
            label: "test",
            phase: "full",
            status: status === "passed" ? "passed" : "failed",
            exitCode: status === "passed" ? 0 : 1,
          }),
        ],
        message: "storage codec fixture only",
        mode: "verify",
        outcome: status === "passed" ? "success" : "failure",
        packetPaths: [],
        pushed: false,
        runId: "fixture",
        resolvedHeadSha: O.some(f.source.finalCommit),
        proofTier: O.some("full"),
      })
    )
  );
  const proofPath = f.path.join(f.root, "proof.json");
  yield* f.fs.writeFileString(
    proofPath,
    yield* TrialProofJson.encode(
      TrialProof.make({
        schemaVersion: "agent-trial-proof/v1",
        attempt: f.request.attempt,
        finalCommit: f.source.finalCommit,
        verdict: yield* trialArtifact(verdictPath),
        acceptance: yield* trialArtifact(acceptancePath),
        requiredLaneIds: ["test"],
        yeetExitCode: status === "passed" ? 0 : 1,
        reconstruction: f.source.source,
        fullYeetCollection: yield* trialArtifact(fullPath),
      })
    )
  );
  const finalPath = f.path.join(f.root, "finalization.json");
  yield* f.fs.writeFileString(
    finalPath,
    yield* TrialFinalizationJson.encode(
      TrialFinalization.make({
        schemaVersion: "agent-trial-finalization/v1",
        attempt: f.request.attempt,
        proof: yield* trialArtifact(proofPath),
        status,
        protocolCompliance: "invocation-pins-verified",
        failures: status === "failed" ? ["fixture check failed"] : [],
        benchmark: O.none(),
      })
    )
  );
  yield* f.fs.writeFileString(
    f.classificationPath,
    yield* TrialRetentionClassificationJson.encode(
      TrialRetentionClassification.make({
        ...f.classification,
        outcome: status,
        terminalEvidence: yield* trialArtifact(finalPath),
        evidence: [yield* trialArtifact(finalPath)],
      })
    )
  );
  yield* f.fs.writeFileString(
    f.requestPath,
    yield* TrialRetainRequestJson.encode(
      TrialRetainRequest.make({ ...f.request, classification: yield* trialArtifact(f.classificationPath) })
    )
  );
  return { verdictPath, acceptancePath, fullPath, proofPath, finalPath, runtimeEvidencePath };
});

layer(Layer.merge(NodeServices.layer, BunCrypto.layer), { excludeTestServices: true })("trial retention", (it) => {
  it.effect("retains a real candidate through the supplied sealed Git system", () =>
    Effect.scoped(
      Effect.gen(function* () {
        const f = yield* setup();
        const gitOnlySystem = yield* captureTrialInventory(f.request.system.root);
        const output = f.path.join(f.root, "strict-candidate-retention");
        yield* f.fs.makeDirectory(output);
        const missingAccounts = yield* retainTrialCandidate(
          f.attempt.workspace,
          f.attempt.baseCommit,
          output,
          O.none(),
          gitOnlySystem,
          true
        ).pipe(Effect.result);
        expect(missingAccounts._tag).toBe("Failure");
        if (missingAccounts._tag === "Failure") {
          expect(missingAccounts.failure._tag).toBe("AgentTrialError");
          if (missingAccounts.failure._tag === "AgentTrialError")
            expect(missingAccounts.failure.message).toBe("Sealed account inputs require the exact three-file census");
        }
        expect(yield* f.fs.readDirectory(output)).toEqual([]);
        // Declare synthetic account files with candidate Git HOME /nonexistent.
        // These owned fixture inputs never read or project host /etc.
        const accountRoot = f.path.join(gitOnlySystem.root, "etc");
        yield* f.fs.makeDirectory(accountRoot);
        for (const [name, contents] of A.make(
          Tuple.make("passwd", "fixture:x:0:0:Fixture:/nonexistent:/bin/sh\n"),
          Tuple.make("group", "fixture:x:0:\n"),
          Tuple.make("nsswitch.conf", "passwd: files\ngroup: files\n")
        ))
          yield* f.fs.writeFileString(f.path.join(accountRoot, name), contents);
        const system = yield* captureTrialInventory(gitOnlySystem.root);
        const result = yield* retainTrialCandidate(
          f.attempt.workspace,
          f.attempt.baseCommit,
          output,
          O.none(),
          system,
          true
        );
        expect(O.isSome(result)).toBe(true);
        if (O.isSome(result)) expect(result.value.finalCommit).toBe(f.source.finalCommit);
        yield* validateTrialInventory(system, "/runtime/system", true);
      })
    )
  );
  it.effect(
    "qualifies a failed clean candidate without deleting evidence and restores its original Collector path",
    () =>
      Effect.scoped(
        Effect.gen(function* () {
          const f = yield* setup();
          const retainedPath = yield* retainTrial(f.requestPath);
          const retained = yield* TrialRetentionJson.decode(yield* f.fs.readFileString(retainedPath));
          expect(retained.outcome).toBe("failed");
          expect(yield* f.fs.exists(f.attempt.workspace)).toBe(true);
          const sourceBefore = yield* f.fs.readFileString(f.source.source.path);
          yield* f.fs.rename(f.source.workspace, f.path.join(f.root, "original-recovery"));
          const restorePath = f.path.join(f.root, "restore-request.json");
          yield* f.fs.writeFileString(
            restorePath,
            yield* TrialRehydrateRequestJson.encode(
              TrialRehydrateRequest.make({
                schemaVersion: "agent-trial-rehydrate-request/v1",
                retention: yield* trialArtifact(retainedPath),
                outputRoot: f.path.join(f.root, "rehydrate"),
                system: f.request.system,
              })
            )
          );
          yield* rehydrateTrial(restorePath);
          yield* rehydrateTrial(restorePath);
          expect(yield* f.fs.readFileString(f.source.source.path)).toBe(sourceBefore);
          expect(yield* f.fs.exists(f.path.join(f.root, "original-recovery"))).toBe(true);
        })
      ),
    30000
  );
  it.effect(
    "refuses live or abandoned lease state and releases a scoped evaluator lease",
    () =>
      Effect.scoped(
        Effect.gen(function* () {
          const f = yield* setup();
          yield* Effect.scoped(
            Effect.gen(function* () {
              yield* acquireTrialRetentionLease(f.planPath);
              expect(O.isNone(yield* retainTrial(f.requestPath).pipe(Effect.option))).toBe(true);
            })
          );
          yield* retainTrial(f.requestPath);
        })
      ),
    30000
  );
  it.effect(
    "refuses corrupted dependencies, marker replacement and foreign owner roots",
    () =>
      Effect.scoped(
        Effect.gen(function* () {
          const f = yield* setup();
          yield* f.fs.writeFileString(f.ownership.path, "malicious replacement");
          expect(O.isNone(yield* retainTrial(f.requestPath).pipe(Effect.option))).toBe(true);
          const foreign = TrialRetainRequest.make({ ...f.request, ownerRoot: f.root });
          yield* f.fs.writeFileString(f.requestPath, yield* TrialRetainRequestJson.encode(foreign));
          expect(O.isNone(yield* retainTrial(f.requestPath).pipe(Effect.option))).toBe(true);
        })
      ),
    30000
  );
  it.effect(
    "rejects dirty source, incomplete streams and traversal before eligibility",
    () =>
      Effect.scoped(
        Effect.gen(function* () {
          const f = yield* setup();
          yield* f.fs.writeFileString(f.path.join(f.attempt.workspace, "untracked.txt"), "not retained");
          expect(O.isNone(yield* retainTrial(f.requestPath).pipe(Effect.option))).toBe(true);
          yield* f.fs.remove(f.path.join(f.attempt.workspace, "untracked.txt"));
          const traversal = TrialRetainRequest.make({
            ...f.request,
            outputRoot: `${f.path.join(f.root, "child")}/../escape`,
          });
          yield* f.fs.writeFileString(f.requestPath, yield* TrialRetainRequestJson.encode(traversal));
          expect(O.isNone(yield* retainTrial(f.requestPath).pipe(Effect.option))).toBe(true);
        })
      ),
    30000
  );
  it.effect(
    "recovers an actual SIGKILL after publishing the original workspace and before verified checkpoint",
    () =>
      Effect.scoped(
        Effect.gen(function* () {
          const f = yield* setup();
          const retainedPath = yield* retainTrial(f.requestPath);
          yield* f.fs.rename(f.source.workspace, f.path.join(f.root, "before-kill-recovery"));
          const restorePath = f.path.join(f.root, "kill-restore-request.json");
          const outputRoot = f.path.join(f.root, "kill-rehydrate");
          yield* f.fs.writeFileString(
            restorePath,
            yield* TrialRehydrateRequestJson.encode(
              TrialRehydrateRequest.make({
                schemaVersion: "agent-trial-rehydrate-request/v1",
                retention: yield* trialArtifact(retainedPath),
                outputRoot,
                system: f.request.system,
              })
            )
          );
          const requestLiteral = yield* S.encodeEffect(S.fromJsonString(S.String))(restorePath);
          const workspaceLiteral = yield* S.encodeEffect(S.fromJsonString(S.String))(f.source.workspace);
          const code = `import {rehydrateTrial} from '@beep/repo-cli/test/AgentEffectiveness';
import {NodeServices} from '@effect/platform-node';
import * as BunCrypto from '@effect/platform-bun/BunCrypto';
import * as Effect from 'effect/Effect';
import * as FileSystem from 'effect/FileSystem';
import * as Layer from 'effect/Layer';
await Effect.runPromise(Effect.gen(function*(){
 const fs=yield* FileSystem.FileSystem;
 const patched={...fs,rename:(a,b)=>fs.rename(a,b).pipe(Effect.tap(()=>b===${workspaceLiteral}?Effect.sync(()=>process.kill(process.pid,'SIGKILL')):Effect.void))};
 return yield* rehydrateTrial(${requestLiteral}).pipe(Effect.provideService(FileSystem.FileSystem,patched));
}).pipe(Effect.provide(Layer.merge(NodeServices.layer,BunCrypto.layer))));`;
          const child = yield* runSpooledStreams({
            command: "bun",
            args: ["-e", code],
            cwd: f.path.join(import.meta.dirname, ".."),
            env: { PATH: yield* Config.String("PATH"), HOME: "/nonexistent" },
            extendEnv: false,
            stdoutPath: f.path.join(f.root, "kill-child.stdout"),
            stderrPath: f.path.join(f.root, "kill-child.stderr"),
            timeout: "15 seconds",
          }).pipe(Effect.option);
          expect(O.getOrElse(child, () => -1)).not.toBe(0);
          expect(yield* f.fs.exists(f.source.workspace)).toBe(true);
          yield* rehydrateTrial(restorePath);
          expect(yield* f.fs.readFileString(f.path.join(outputRoot, "rehydration.json"))).toContain(
            '"phase":"verified"'
          );
        })
      ),
    30000
  );
  it.effect(
    "rejects symlink ownership and special or missing evidence dependencies",
    () =>
      Effect.scoped(
        Effect.gen(function* () {
          const f = yield* setup();
          const markerCopy = f.path.join(f.root, "marker-original");
          yield* f.fs.rename(f.ownership.path, markerCopy);
          yield* f.fs.symlink(markerCopy, f.ownership.path);
          expect(O.isNone(yield* retainTrial(f.requestPath).pipe(Effect.option))).toBe(true);
          yield* f.fs.remove(f.ownership.path);
          yield* f.fs.rename(markerCopy, f.ownership.path);
          const specialRoot = f.path.join(f.root, "special-evidence");
          yield* f.fs.makeDirectory(specialRoot);
          const fifo = yield* runCaptured({
            command: "/usr/bin/mkfifo",
            args: [f.path.join(specialRoot, "fifo")],
            env: {},
            extendEnv: false,
          });
          expect(fifo.exitCode).toBe(0);
          yield* f.fs.writeFileString(
            f.classificationPath,
            yield* TrialRetentionClassificationJson.encode(
              TrialRetentionClassification.make({
                ...f.classification,
                evidence: [{ path: specialRoot, digest: zero }],
              })
            )
          );
          yield* f.fs.writeFileString(
            f.requestPath,
            yield* TrialRetainRequestJson.encode(
              TrialRetainRequest.make({ ...f.request, classification: yield* trialArtifact(f.classificationPath) })
            )
          );
          expect(O.isNone(yield* retainTrial(f.requestPath).pipe(Effect.option))).toBe(true);
          yield* f.fs.rename(f.attempt.stderr.path, f.path.join(f.root, "stderr-recovery"));
          expect(O.isNone(yield* retainTrial(f.requestPath).pipe(Effect.option))).toBe(true);
        })
      ),
    30000
  );
  it.effect(
    "preserves unknown stream provenance while qualifying completely captured failed bytes",
    () =>
      Effect.scoped(
        Effect.gen(function* () {
          const f = yield* setup();
          yield* f.fs.writeFileString(f.stdout, '{"type":"thread.started"}\n');
          const attempt = TrialAttempt.make({
            ...f.attempt,
            stdout: yield* trialArtifact(f.stdout),
            usage: yield* parseTrialUsage("codex", '{"type":"thread.started"}\n', []),
          });
          yield* f.fs.writeFileString(f.request.attempt.path, yield* TrialAttemptJson.encode(attempt));
          const artifact = yield* trialArtifact(f.request.attempt.path);
          yield* f.fs.rename(f.request.capture.path, f.path.join(f.root, "capture-original-recovery"));
          const capture = yield* recordTrialRetentionCapture(f.planPath);
          const collection = yield* TrialCollectRequestJson.decode(yield* f.fs.readFileString(f.collectionPath));
          yield* f.fs.writeFileString(
            f.collectionPath,
            yield* TrialCollectRequestJson.encode(TrialCollectRequest.make({ ...collection, attempt: artifact }))
          );
          yield* f.fs.writeFileString(
            f.classificationPath,
            yield* TrialRetentionClassificationJson.encode(
              TrialRetentionClassification.make({ ...f.classification, attempt: artifact })
            )
          );
          yield* f.fs.writeFileString(
            f.requestPath,
            yield* TrialRetainRequestJson.encode(
              TrialRetainRequest.make({
                ...f.request,
                attempt: artifact,
                capture,
                source: TrialCollectedRetentionSource.make({
                  kind: "collected",
                  committedSource: f.source.source,
                  collection: yield* trialArtifact(f.collectionPath),
                }),
                classification: yield* trialArtifact(f.classificationPath),
                receiptInventory: TrialArtifact.make({ path: f.receipts, digest: yield* hashTrialInput(f.receipts) }),
              })
            )
          );
          const resultPath = yield* retainTrial(f.requestPath);
          const result = yield* TrialRetentionJson.decode(yield* f.fs.readFileString(resultPath));
          expect(result.outcome).toBe("failed");
          expect(result.usageCoverage).toBe("missing-terminal");
        })
      ),
    30000
  );
  it.effect(
    "refuses a capture explicitly marked truncated even when all current bytes exist",
    () =>
      Effect.scoped(
        Effect.gen(function* () {
          const f = yield* setup();
          const capture = yield* TrialRetentionCaptureJson.decode(yield* f.fs.readFileString(f.request.capture.path));
          yield* f.fs.writeFileString(
            f.request.capture.path,
            yield* TrialRetentionCaptureJson.encode(TrialRetentionCapture.make({ ...capture, state: "truncated" }))
          );
          yield* f.fs.writeFileString(
            f.requestPath,
            yield* TrialRetainRequestJson.encode(
              TrialRetainRequest.make({
                ...f.request,
                capture: yield* trialArtifact(f.request.capture.path),
                receiptInventory: TrialArtifact.make({ path: f.receipts, digest: yield* hashTrialInput(f.receipts) }),
              })
            )
          );
          expect(O.isNone(yield* retainTrial(f.requestPath).pipe(Effect.option))).toBe(true);
        })
      ),
    30000
  );
  it.effect(
    "serializes two original-path restoration callers without moving another live witness",
    () =>
      Effect.scoped(
        Effect.gen(function* () {
          const f = yield* setup();
          const retained = yield* retainTrial(f.requestPath);
          yield* f.fs.rename(f.source.workspace, f.path.join(f.root, "concurrent-original-recovery"));
          const requestPath = f.path.join(f.root, "concurrent-request.json");
          const outputRoot = f.path.join(f.root, "concurrent-restore");
          yield* f.fs.writeFileString(
            requestPath,
            yield* TrialRehydrateRequestJson.encode(
              TrialRehydrateRequest.make({
                schemaVersion: "agent-trial-rehydrate-request/v1",
                retention: yield* trialArtifact(retained),
                outputRoot,
                system: f.request.system,
              })
            )
          );
          const results = yield* Effect.all(
            [rehydrateTrial(requestPath).pipe(Effect.option), rehydrateTrial(requestPath).pipe(Effect.option)],
            { concurrency: 2 }
          );
          expect(A.length(A.filter(results, O.isSome))).toBeGreaterThan(0);
          expect(yield* f.fs.exists(f.source.workspace)).toBe(true);
          expect(yield* f.fs.exists(f.path.join(outputRoot, "recovery-0"))).toBe(false);
        })
      ),
    30000
  );
  it.effect(
    "retains an actual nonzero coding terminal through an unscored bundle-HEAD reconstruction",
    () =>
      Effect.scoped(
        Effect.gen(function* () {
          const f = yield* setup();
          yield* nativeFailed(f);
          const result = yield* TrialRetentionJson.decode(
            yield* f.fs.readFileString(yield* retainTrial(f.requestPath))
          );
          expect(result.outcome).toBe("failed");
          expect(result.source.kind).toBe("source-only");
          expect(yield* f.fs.exists(f.attempt.workspace)).toBe(true);
        })
      ),
    30000
  );
  it.effect(
    "refuses an arbitrary historical commit and a missing drain marker for an aborted terminal",
    () =>
      Effect.scoped(
        Effect.gen(function* () {
          const f = yield* setup();
          const request = yield* nativeFailed(f);
          yield* f.fs.writeFileString(
            f.requestPath,
            yield* TrialRetainRequestJson.encode(
              TrialRetainRequest.make({
                ...request,
                source: TrialUnscoredRetentionSource.make({ kind: "source-only", finalCommit: f.attempt.baseCommit }),
              })
            )
          );
          expect(O.isNone(yield* retainTrial(f.requestPath).pipe(Effect.option))).toBe(true);
          yield* f.fs.rename(request.capture.path, f.path.join(f.root, "drain-marker-recovery"));
          const attempt = yield* TrialAttemptJson.decode(yield* f.fs.readFileString(request.attempt.path));
          yield* f.fs.writeFileString(
            request.attempt.path,
            yield* TrialAttemptJson.encode(
              TrialAttempt.make({ ...attempt, terminal: { status: "aborted", reason: "timeout before drain" } })
            )
          );
          expect(O.isNone(yield* retainTrial(f.requestPath).pipe(Effect.option))).toBe(true);
          expect(yield* f.fs.exists(f.attempt.workspace)).toBe(true);
        })
      ),
    30000
  );
  it.effect(
    "rejects output nested in coding source or immutable receipt inventory without creating it",
    () =>
      Effect.scoped(
        Effect.gen(function* () {
          const f = yield* setup();
          const original = yield* hashTrialInput(f.receipts);
          for (const outputRoot of [
            f.path.join(f.attempt.workspace, "retained"),
            f.path.join(f.request.ownerRoot, "repository.git/retained"),
            f.path.join(f.receipts, "retained"),
          ]) {
            yield* f.fs.writeFileString(
              f.requestPath,
              yield* TrialRetainRequestJson.encode(TrialRetainRequest.make({ ...f.request, outputRoot }))
            );
            expect(O.isNone(yield* retainTrial(f.requestPath).pipe(Effect.option))).toBe(true);
            expect(yield* f.fs.exists(outputRoot)).toBe(false);
          }
          expect(yield* hashTrialInput(f.receipts)).toBe(original);
        })
      ),
    30000
  );
  it.effect(
    "refuses modified tracked bytes hidden by skip-worktree or assume-unchanged index flags",
    () =>
      Effect.scoped(
        Effect.gen(function* () {
          const f = yield* setup();
          for (const flag of ["--skip-worktree", "--assume-unchanged"]) {
            const set = yield* runCaptured({
              command: "/usr/bin/git",
              args: ["-C", f.attempt.workspace, "update-index", flag, "answer.ts"],
              env: {},
              extendEnv: false,
            });
            expect(set.exitCode).toBe(0);
            yield* f.fs.writeFileString(
              f.path.join(f.attempt.workspace, "answer.ts"),
              "unretained bytes hidden from git status\n"
            );
            expect(O.isNone(yield* retainTrial(f.requestPath).pipe(Effect.option))).toBe(true);
          }
          expect(yield* f.fs.exists(f.attempt.workspace)).toBe(true);
        })
      ),
    30000
  );
  it.effect(
    "retains passed and failed finalization formats with the entire nested proof closure",
    () =>
      Effect.scoped(
        Effect.gen(function* () {
          for (const status of A.filter(["passed", "failed"], S.is(S.Literals(["passed", "failed"])))) {
            const f = yield* setup();
            const nested = yield* finalized(f, status);
            const resultPath = yield* retainTrial(f.requestPath);
            const result = yield* TrialRetentionJson.decode(yield* f.fs.readFileString(resultPath));
            expect(result.outcome).toBe(status);
            for (const dependency of [
              nested.verdictPath,
              nested.acceptancePath,
              nested.fullPath,
              nested.proofPath,
              f.source.source.path,
              result.witness.path,
              result.trackedBytes.path,
            ])
              expect(A.some(result.dependencies, (artifact) => artifact.path === dependency)).toBe(true);
          }
        })
      ),
    30000
  );
  it.effect(
    "refuses missing nested proof or qualification witness bytes before original-path restoration",
    () =>
      Effect.scoped(
        Effect.gen(function* () {
          const f = yield* setup();
          const nested = yield* finalized(f, "failed");
          const resultPath = yield* retainTrial(f.requestPath);
          const result = yield* TrialRetentionJson.decode(yield* f.fs.readFileString(resultPath));
          yield* f.fs.rename(f.source.workspace, f.path.join(f.root, "nested-original-recovery"));
          const requestPath = f.path.join(f.root, "nested-restore.json");
          const outputRoot = f.path.join(f.root, "nested-restoration");
          yield* f.fs.writeFileString(
            requestPath,
            yield* TrialRehydrateRequestJson.encode(
              TrialRehydrateRequest.make({
                schemaVersion: "agent-trial-rehydrate-request/v1",
                retention: yield* trialArtifact(resultPath),
                outputRoot,
                system: f.request.system,
              })
            )
          );
          let index = 0;
          for (const dependency of [
            nested.verdictPath,
            nested.acceptancePath,
            nested.fullPath,
            f.source.source.path,
            result.witness.path,
            result.trackedBytes.path,
          ]) {
            const recovery = f.path.join(f.root, `missing-dependency-${index++}`);
            yield* f.fs.rename(dependency, recovery);
            expect(O.isNone(yield* rehydrateTrial(requestPath).pipe(Effect.option))).toBe(true);
            expect(yield* f.fs.exists(outputRoot)).toBe(false);
            yield* f.fs.rename(recovery, dependency);
          }
          yield* rehydrateTrial(requestPath);
          expect(yield* f.fs.exists(f.source.workspace)).toBe(true);
        })
      ),
    30000
  );
  it.effect(
    "refuses restoration output collisions and executable-mode changes hidden from Git",
    () =>
      Effect.scoped(
        Effect.gen(function* () {
          const f = yield* setup();
          const chmod = yield* runCaptured({
            command: "/usr/bin/git",
            args: ["-C", f.attempt.workspace, "config", "core.filemode", "false"],
            env: {},
            extendEnv: false,
          });
          expect(chmod.exitCode).toBe(0);
          yield* f.fs.chmod(f.path.join(f.attempt.workspace, "answer.ts"), 0o755);
          expect(O.isNone(yield* retainTrial(f.requestPath).pipe(Effect.option))).toBe(true);
          yield* f.fs.chmod(f.path.join(f.attempt.workspace, "answer.ts"), 0o644);
          yield* f.fs.writeFileString(
            f.requestPath,
            yield* TrialRetainRequestJson.encode(
              TrialRetainRequest.make({ ...f.request, outputRoot: f.path.join(f.root, "mode-retained") })
            )
          );
          const retained = yield* retainTrial(f.requestPath);
          yield* f.fs.rename(f.source.workspace, f.path.join(f.root, "mode-original-recovery"));
          const requestPath = f.path.join(f.root, "overlap-restore.json");
          yield* f.fs.writeFileString(
            requestPath,
            yield* TrialRehydrateRequestJson.encode(
              TrialRehydrateRequest.make({
                schemaVersion: "agent-trial-rehydrate-request/v1",
                retention: yield* trialArtifact(retained),
                outputRoot: f.source.workspace,
                system: f.request.system,
              })
            )
          );
          expect(O.isNone(yield* rehydrateTrial(requestPath).pipe(Effect.option))).toBe(true);
          expect(yield* f.fs.exists(f.source.workspace)).toBe(false);
        })
      ),
    30000
  );
  it.effect(
    "rejects missing or corrupt native runtime guard evidence for qualification and restore",
    () =>
      Effect.scoped(
        Effect.gen(function* () {
          const f = yield* setup();
          const nested = yield* finalized(f, "failed");
          const original = yield* f.fs.readFileString(nested.runtimeEvidencePath);
          yield* f.fs.writeFileString(nested.runtimeEvidencePath, "corrupt runtime guard bytes");
          expect(O.isNone(yield* retainTrial(f.requestPath).pipe(Effect.option))).toBe(true);
          expect(yield* f.fs.exists(f.request.outputRoot)).toBe(false);
          yield* f.fs.writeFileString(nested.runtimeEvidencePath, original);
          const recovery = f.path.join(f.root, "runtime-guard-recovery");
          yield* f.fs.rename(nested.runtimeEvidencePath, recovery);
          expect(O.isNone(yield* retainTrial(f.requestPath).pipe(Effect.option))).toBe(true);
          yield* f.fs.rename(recovery, nested.runtimeEvidencePath);
          const retainedPath = yield* retainTrial(f.requestPath);
          const retained = yield* TrialRetentionJson.decode(yield* f.fs.readFileString(retainedPath));
          expect(A.some(retained.dependencies, (artifact) => artifact.path === nested.runtimeEvidencePath)).toBe(true);
          yield* f.fs.rename(f.source.workspace, f.path.join(f.root, "runtime-guard-original-recovery"));
          const requestPath = f.path.join(f.root, "runtime-guard-restore.json");
          const outputRoot = f.path.join(f.root, "runtime-guard-restoration");
          yield* f.fs.writeFileString(
            requestPath,
            yield* TrialRehydrateRequestJson.encode(
              TrialRehydrateRequest.make({
                schemaVersion: "agent-trial-rehydrate-request/v1",
                retention: yield* trialArtifact(retainedPath),
                outputRoot,
                system: f.request.system,
              })
            )
          );
          yield* f.fs.writeFileString(nested.runtimeEvidencePath, "corrupt runtime guard bytes");
          expect(O.isNone(yield* rehydrateTrial(requestPath).pipe(Effect.option))).toBe(true);
          expect(yield* f.fs.exists(outputRoot)).toBe(false);
          yield* f.fs.writeFileString(nested.runtimeEvidencePath, original);
          yield* f.fs.rename(nested.runtimeEvidencePath, recovery);
          expect(O.isNone(yield* rehydrateTrial(requestPath).pipe(Effect.option))).toBe(true);
          yield* f.fs.rename(recovery, nested.runtimeEvidencePath);
          yield* rehydrateTrial(requestPath);
          expect(yield* f.fs.readFileString(nested.runtimeEvidencePath)).toBe(original);
        })
      ),
    30000
  );
  it.effect(
    "preserves native namespace links while rejecting seed-child outputs and escaping targets",
    () =>
      Effect.scoped(
        Effect.gen(function* () {
          const f = yield* setup();
          const seedRoot = f.path.join(f.root, "native-nix-seed");
          yield* f.fs.makeDirectory(seedRoot, { mode: 0o755 });
          const seedFile = f.path.join(seedRoot, "database-seed");
          yield* f.fs.writeFileString(seedFile, "immutable owned native seed\n");
          yield* f.fs.symlink("/nix/store/fixture", f.path.join(seedRoot, "store-link"));
          const files = { "database-seed": yield* hashTrialInput(seedFile) };
          const symlinks = { "store-link": "/nix/store/fixture" };
          const seed = TrialInputInventory.make({
            root: seedRoot,
            files,
            symlinks,
            digest: yield* hashPublicTextSha256(
              yield* S.encodeEffect(S.fromJsonString(S.Unknown))({ files, symlinks })
            ),
          });
          const ociRoot = f.path.join(f.root, "native-oci-seed");
          yield* f.fs.makeDirectory(ociRoot, { mode: 0o755 });
          yield* f.fs.symlink("/bin/busybox", f.path.join(ociRoot, "busybox"));
          const ociLinks = { busybox: "/bin/busybox" };
          const oci = TrialInputInventory.make({
            root: ociRoot,
            files: {},
            symlinks: ociLinks,
            digest: yield* hashPublicTextSha256(
              yield* S.encodeEffect(S.fromJsonString(S.Unknown))({ files: {}, symlinks: ociLinks })
            ),
          });
          const collection = yield* TrialCollectRequestJson.decode(yield* f.fs.readFileString(f.collectionPath));
          const assetPath = f.path.join(f.root, "native-standalone-asset");
          yield* f.fs.writeFileString(assetPath, "immutable native asset\n");
          const asset = yield* trialArtifact(assetPath);
          const info = yield* f.fs.stat(assetPath);
          const native = TrialNativeYeetRuntime.make({
            schemaVersion: "agent-trial-native-yeet-runtime/v1",
            system: f.request.system,
            nix: seed,
            nixStorePaths: ["/nix/store/fixture"],
            oci,
            crun: collection.checks[0].input,
            image: `ghcr.io/google/osv-scanner-action@sha256:${Str.repeat(64)("0")}`,
            certificateBundle: asset,
            bootstrap: [
              TrialBootstrapFile.make({
                artifact: asset,
                metadata: { mode: info.mode, uid: O.getOrElse(info.uid, () => 0), gid: O.getOrElse(info.gid, () => 0) },
              }),
            ],
            broker: TrialBrokerControl.make({
              program: asset,
              interpreter: asset,
              relay: asset,
              policy: asset,
              canaries: asset,
              authorities: ["fixture.invalid:443"],
              maxSeconds: 1,
            }),
          });
          const check = TrialEvaluatorCheck.make({ ...collection.yeet, nativeRuntime: native });
          yield* f.fs.writeFileString(
            f.collectionPath,
            yield* TrialCollectRequestJson.encode(TrialCollectRequest.make({ ...collection, yeet: check }))
          );
          const source = TrialCollectedRetentionSource.make({
            kind: "collected",
            committedSource: f.source.source,
            collection: yield* trialArtifact(f.collectionPath),
          });
          const before = seed.digest;
          yield* validateTrialInventory(seed, "/nix");
          yield* validateTrialInventory(oci, "/runtime/oci");
          expect(O.isNone(yield* validateTrialInventory(seed).pipe(Effect.option))).toBe(true);
          expect(O.isNone(yield* validateTrialInventory(seed, "/runtime/oci").pipe(Effect.option))).toBe(true);
          const escapeRoot = f.path.join(f.root, "native-oci-escape-negative");
          yield* f.fs.makeDirectory(escapeRoot);
          yield* f.fs.symlink("/home/not-permitted", f.path.join(escapeRoot, "escape"));
          const escapingLinks = { escape: "/home/not-permitted" };
          const escaping = TrialInputInventory.make({
            root: escapeRoot,
            files: {},
            symlinks: escapingLinks,
            digest: yield* hashPublicTextSha256(
              yield* S.encodeEffect(S.fromJsonString(S.Unknown))({ files: {}, symlinks: escapingLinks })
            ),
          });
          expect(O.isNone(yield* validateTrialInventory(escaping, "/runtime/oci").pipe(Effect.option))).toBe(true);
          const child = f.path.join(seedRoot, "retention-output");
          yield* f.fs.writeFileString(
            f.requestPath,
            yield* TrialRetainRequestJson.encode(TrialRetainRequest.make({ ...f.request, source, outputRoot: child }))
          );
          expect(O.isNone(yield* retainTrial(f.requestPath).pipe(Effect.option))).toBe(true);
          expect(yield* f.fs.exists(child)).toBe(false);
          yield* validateTrialInventory(seed, "/nix");
          yield* validateTrialInventory(oci, "/runtime/oci");
          expect(seed.digest).toBe(before);
          yield* f.fs.writeFileString(
            f.requestPath,
            yield* TrialRetainRequestJson.encode(TrialRetainRequest.make({ ...f.request, source }))
          );
          const resultPath = yield* retainTrial(f.requestPath);
          const result = yield* TrialRetentionJson.decode(yield* f.fs.readFileString(resultPath));
          expect(A.some(result.declaredInputs.inventories, (inventory) => inventory.inventory.root === seedRoot)).toBe(
            true
          );
          expect(A.some(result.declaredInputs.artifacts, (artifact) => artifact.path === assetPath)).toBe(true);
          yield* f.fs.rename(f.source.workspace, f.path.join(f.root, "declared-seed-original-recovery"));
          const restorePath = f.path.join(f.root, "declared-seed-restore.json");
          const restoreRoot = f.path.join(f.root, "declared-seed-restoration");
          yield* f.fs.writeFileString(
            restorePath,
            yield* TrialRehydrateRequestJson.encode(
              TrialRehydrateRequest.make({
                schemaVersion: "agent-trial-rehydrate-request/v1",
                retention: yield* trialArtifact(resultPath),
                outputRoot: child,
                system: f.request.system,
              })
            )
          );
          expect(O.isNone(yield* rehydrateTrial(restorePath).pipe(Effect.option))).toBe(true);
          expect(yield* f.fs.exists(child)).toBe(false);
          yield* validateTrialInventory(seed, "/nix");
          yield* validateTrialInventory(oci, "/runtime/oci");
          expect(seed.digest).toBe(before);
          yield* f.fs.writeFileString(
            restorePath,
            yield* TrialRehydrateRequestJson.encode(
              TrialRehydrateRequest.make({
                schemaVersion: "agent-trial-rehydrate-request/v1",
                retention: yield* trialArtifact(resultPath),
                outputRoot: restoreRoot,
                system: f.request.system,
              })
            )
          );
          const originalAsset = yield* f.fs.readFileString(assetPath);
          yield* f.fs.writeFileString(assetPath, "changed native asset");
          expect(O.isNone(yield* rehydrateTrial(restorePath).pipe(Effect.option))).toBe(true);
          expect(yield* f.fs.exists(restoreRoot)).toBe(false);
          yield* f.fs.writeFileString(assetPath, originalAsset);
          yield* rehydrateTrial(restorePath);
          yield* validateTrialInventory(seed, "/nix");
          yield* validateTrialInventory(oci, "/runtime/oci");
          expect(seed.digest).toBe(before);
        })
      ),
    30000
  );
});
