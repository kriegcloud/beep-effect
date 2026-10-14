import {
  buildTrialSandbox,
  captureTrialInventory,
  hashTrialInput,
  isTrialCompilerNegative,
  qualifyTrialIsolation,
  TrialArtifact,
  TrialCandidateControls,
  TrialIsolationQualificationReport,
  TrialIsolationQualificationRequest,
  TrialMount,
  TrialNoIndexIsolationAttestation,
  TrialPlan,
  TrialQualificationResourceEnvelope,
  TrialRuntimeClosure,
  trialControlsDigest,
} from "@beep/repo-cli/test/AgentEffectiveness";
import {
  CapturedProcessTerminal,
  CapturedStreams,
  isCapturedSigtermExit,
  runCaptured,
  runObservedSpooledStreams,
  runSpooledStreams,
} from "@beep/repo-cli/test/Process";
import { Sha256Hex } from "@beep/schema/Sha256";
import * as BunCrypto from "@effect/platform-bun/BunCrypto";
import { NodeServices } from "@effect/platform-node";
import { expect, layer } from "@effect/vitest";
import * as A from "effect/Array";
import * as Config from "effect/Config";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as Num from "effect/Number";
import * as O from "effect/Option";
import * as Path from "effect/Path";
import * as PlatformError from "effect/PlatformError";
import * as S from "effect/Schema";
import * as Stream from "effect/Stream";
import * as Str from "effect/String";

const zero = Sha256Hex.make(Str.repeat(64)("0"));
const writeJson = <A, I>(schema: S.Codec<A, I>) => S.encodeEffect(S.fromJsonString(schema));

const printQualificationFailure = Effect.fn("QualificationTest.printQualificationFailure")(function* (
  ownedRoot: string
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const report = yield* fs
    .readFileString(path.join(ownedRoot, "report.json"))
    .pipe(Effect.flatMap(S.decodeUnknownEffect(S.fromJsonString(TrialIsolationQualificationReport))));
  yield* Console.error(`Qualification failure detail: ${report.detail}`);
  const last = A.last(report.observations);
  if (O.isSome(last)) {
    yield* Console.error(`Last actual probe: ${last.value.id}; exit=${O.getOrNull(last.value.exitCode)}`);
    yield* Console.error(`stdout tail: ${Str.slice(-4096)(yield* fs.readFileString(last.value.stdout.path))}`);
    yield* Console.error(`stderr tail: ${Str.slice(-4096)(yield* fs.readFileString(last.value.stderr.path))}`);
  }
}, Effect.ignore);

const fixture = Effect.fn("QualificationTest.fixture")(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const home = yield* Config.String("HOME");
  const cache = path.join(home, ".cache/beep/runner-tests");
  yield* fs.makeDirectory(cache, { recursive: true });
  const root = yield* fs.makeTempDirectory({ directory: cache });
  yield* Effect.addFinalizer((exit) =>
    Exit.isSuccess(exit)
      ? fs.remove(root, { recursive: true }).pipe(Effect.orDie)
      : Console.error(`Retained failed qualification fixture: ${root}`)
  );
  const source = path.join(root, "source");
  const receipts = path.join(root, "receipts");
  const arms = path.join(root, "arms");
  const system = path.join(root, "system");
  for (const directory of [source, receipts, arms, system]) yield* fs.makeDirectory(directory);
  for (const directory of ["usr/bin", "usr/lib/git-core", "bin", "lib", "lib64", "etc"])
    yield* fs.makeDirectory(path.join(system, directory), { recursive: true });
  const node = yield* fs.realPath("/usr/bin/node");
  const compiler = yield* fs.realPath(path.resolve("../../../../node_modules/@effect/tsgo-linux-x64/lib/tsc"));
  const libraries = yield* fs.realPath(path.resolve("../../../../node_modules/typescript/lib"));
  const binaries = ["/usr/bin/git", "/usr/bin/flock", "/usr/bin/bash", "/usr/lib/git-core/git-remote-http", node];
  const dependencies = yield* Effect.forEach(
    binaries,
    (binary) =>
      runCaptured({
        command: "/usr/bin/ldd",
        args: [binary],
        source: "stdout",
        timeout: "10 seconds",
        extendEnv: false,
        env: {},
      }),
    { concurrency: 1 }
  );
  const files = A.dedupe([
    ...binaries,
    ...A.flatMap(dependencies, (result) =>
      A.flatMap(Str.split("\n")(result.output), (line) =>
        O.toArray(O.map(Str.match(/\/[^\s]+/)(line), (match) => match[0]))
      )
    ),
  ]);
  for (const original of files) {
    const canonical = yield* fs.realPath(original);
    const target = path.join(system, path.relative("/", original));
    yield* fs.makeDirectory(path.dirname(target), { recursive: true });
    yield* fs.copyFile(canonical, target);
  }
  // The loader and shell are concrete sealed files rather than host-root fallbacks.
  yield* fs.copyFile("/usr/lib/ld-linux-x86-64.so.2", path.join(system, "lib64/ld-linux-x86-64.so.2"));
  yield* fs.copyFile("/usr/bin/bash", path.join(system, "bin/sh"));
  yield* fs.copyFile("/usr/lib/git-core/git-remote-http", path.join(system, "usr/lib/git-core/git-remote-http"));
  for (const [name, bytes] of [
    ["passwd", "fixture:x:0:0:fixture:/home/trial:/bin/sh\n"],
    ["group", "fixture:x:0:\n"],
    ["nsswitch.conf", "passwd: files\ngroup: files\nhosts: files\n"],
  ])
    yield* fs.writeFileString(path.join(system, "etc", name), bytes);
  const sealed = yield* captureTrialInventory(system);
  const prompt = path.join(root, "prompt.txt");
  yield* fs.writeFileString(prompt, "Inspect this public fixture.\n");
  const mounts = yield* Effect.forEach(
    [
      [node, "/runtime/node"],
      [compiler, "/runtime/tsgo"],
      [libraries, "/runtime/tslib"],
    ],
    ([source, target]) =>
      Effect.gen(function* () {
        if (source === undefined || target === undefined) return yield* Effect.die("Incomplete test mount");
        return TrialMount.make({ source, target, access: "readonly", digest: yield* hashTrialInput(source) });
      })
  );
  const candidate = TrialCandidateControls.make({
    schemaVersion: "agent-trial-plan/v1",
    runId: "qualification",
    attemptId: "fixture",
    provider: "codex",
    model: "gpt-6.1-sol",
    effort: "medium",
    baseCommit: Str.repeat(40)("0"),
    sourceDigest: zero,
    taskDigest: yield* hashTrialInput(prompt),
    acceptanceDigest: zero,
    isolationQualificationVersion: "no-assigned-index/v2",
    assignedIndexTargets: [],
    toolId: "none",
    selectedToolNames: [],
    requiredYeetLaneIds: ["quality:check"],
    requiredTaskCheckIds: ["fixture"],
    requiredCheckSpecs: [
      {
        id: "fixture",
        commandTemplate: ["fixture"],
        inputBundleDigest: zero,
        contractDigest: zero,
      },
    ],
    sourceRepository: source,
    receiptRoot: receipts,
    workspaceRoot: arms,
    command: "/runtime/node",
    commandDigest: yield* hashTrialInput(node),
    delegation: "native-common",
    networkAdmission: "blocked-until-broker",
    args: ["--model", "gpt-6.1-sol", "-c", 'model_reasoning_effort="medium"'],
    environment: { CODEX_ROLLOUT_TRACE_ROOT: "/workspace/.registry-trace" },
    mounts,
    promptPath: prompt,
    timeoutMs: 20_000,
    runtimeClosures: [TrialRuntimeClosure.make({ inventory: sealed, target: "/runtime/system" })],
  });
  const candidatePath = path.join(root, "candidate.json");
  yield* fs.writeFileString(candidatePath, yield* writeJson(TrialCandidateControls)(candidate));
  const ownedRoot = path.join(root, "qualification");
  const current = A.findFirst(Str.split("\n")(yield* fs.readFileString("/proc/self/cgroup")), (line) =>
    Str.startsWith("0::/")(line)
  );
  if (O.isNone(current)) return yield* Effect.die("Integration qualification requires a finite Linux cgroup v2 owner");
  const cgroup = path.join("/sys/fs/cgroup", Str.slice(3)(current.value));
  const cpu = Str.split(/\s+/)(Str.trim(yield* fs.readFileString(path.join(cgroup, "cpu.max"))));
  const limits = O.all({
    memoryMaxBytes: Num.parse(Str.trim(yield* fs.readFileString(path.join(cgroup, "memory.max")))),
    memorySwapMaxBytes: Num.parse(Str.trim(yield* fs.readFileString(path.join(cgroup, "memory.swap.max")))),
    cpuQuotaMicros: O.flatMap(A.get(cpu, 0), Num.parse),
    cpuPeriodMicros: O.flatMap(A.get(cpu, 1), Num.parse),
  });
  if (O.isNone(limits)) return yield* Effect.die("Integration qualification requires finite memory and CPU limits");
  const resourceEnvelope = yield* S.decodeUnknownEffect(TrialQualificationResourceEnvelope)({
    cgroup,
    ...limits.value,
  });
  const request = TrialIsolationQualificationRequest.make({
    schemaVersion: "trial-isolation-qualification-request/v2",
    resourceEnvelope,
    candidate: TrialArtifact.make({ path: candidatePath, digest: yield* hashTrialInput(candidatePath) }),
    ownedRoot,
    protectedSentinels: [path.join(ownedRoot, "private", "sentinel")],
  });
  const requestPath = path.join(root, "request.json");
  yield* fs.writeFileString(requestPath, yield* writeJson(TrialIsolationQualificationRequest)(request));
  return { fs, path, root, candidate, candidatePath, ownedRoot, request, requestPath };
});

layer(Layer.merge(NodeServices.layer, BunCrypto.layer), { excludeTestServices: true })(
  "finite no-index qualification",
  (it) => {
    it.effect("requires the exact single negative diagnostic with a normal compiler failure status", () =>
      Effect.sync(() => {
        const actualLine = "answer.ts(1,14): error TS2322: Type 'string' is not assignable to type 'number'.\n";
        const observed = CapturedStreams.make({ exitCode: 1, stdout: actualLine, stderr: "", truncated: false });
        expect(isTrialCompilerNegative(observed)).toBe(true);
        expect(isTrialCompilerNegative(CapturedStreams.make({ ...observed, stdout: "", stderr: actualLine }))).toBe(
          true
        );
        expect(isTrialCompilerNegative(CapturedStreams.make({ ...observed, exitCode: 2 }))).toBe(true);
        for (const patch of [
          { exitCode: 0 },
          { exitCode: 126 },
          { exitCode: 143 },
          { truncated: true },
          { stdout: "" },
          { stdout: "TS2322\n" },
          { stdout: "unrelated failure\n" },
          { stdout: Str.replace("TS2322", "TS6053")(actualLine) },
          { stdout: Str.replace("Type 'string'", "Type 'String'")(actualLine) },
          { stdout: `${actualLine}error TS6053: File missing.\n` },
          { stderr: actualLine },
        ])
          expect(isTrialCompilerNegative(CapturedStreams.make({ ...observed, ...patch }))).toBe(false);
      })
    );
    it.effect("classifies only the exact owned-command SIGTERM exit error contract", () =>
      Effect.sync(() => {
        const commandLine = "owned-probe --fixed";
        const message = "Process interrupted due to receipt of signal: 'SIGTERM'";
        const reason = {
          _tag: "Unknown",
          module: "ChildProcess",
          method: "exitCode",
          pathOrDescriptor: commandLine,
          cause: { message },
        } satisfies Parameters<typeof PlatformError.systemError>[0];
        expect(isCapturedSigtermExit(PlatformError.systemError(reason), commandLine)).toBe(true);
        expect(isCapturedSigtermExit(commandLine)(PlatformError.systemError(reason))).toBe(true);
        expect(isCapturedSigtermExit({ reason }, commandLine)).toBe(false);
        for (const error of [
          PlatformError.badArgument({ module: "ChildProcess", method: "exitCode" }),
          PlatformError.systemError({ ...reason, _tag: "NotFound" }),
          PlatformError.systemError({ ...reason, module: "FileSystem" }),
          PlatformError.systemError({ ...reason, method: "spawn" }),
          PlatformError.systemError({ ...reason, pathOrDescriptor: "other-probe --fixed" }),
          PlatformError.systemError({ ...reason, cause: { message: `${message} extra` } }),
          PlatformError.systemError({ ...reason, cause: { message: Str.replace("SIGTERM", "SIGKILL")(message) } }),
          PlatformError.systemError({ ...reason, cause: "SIGTERM" }),
        ]) {
          expect(isCapturedSigtermExit(error, commandLine)).toBe(false);
          expect(isCapturedSigtermExit(commandLine)(error)).toBe(false);
        }
      })
    );

    it.effect(
      "publishes actual fixed-probe evidence and admits only its exact namespace",
      () =>
        Effect.scoped(
          Effect.gen(function* () {
            const { fs, path, root, candidate, request, requestPath, ownedRoot } = yield* fixture();
            const qualified = yield* qualifyTrialIsolation(requestPath).pipe(
              Effect.tapError(() => printQualificationFailure(ownedRoot))
            );
            const report = yield* fs
              .readFileString(qualified.report.path)
              .pipe(Effect.flatMap(S.decodeUnknownEffect(S.fromJsonString(TrialIsolationQualificationReport))));
            const attestation = yield* fs
              .readFileString(qualified.attestation.path)
              .pipe(Effect.flatMap(S.decodeUnknownEffect(S.fromJsonString(TrialNoIndexIsolationAttestation))));
            expect(report.status).toBe("qualified");
            expect(report.resourceEnvelope).toEqual(request.resourceEnvelope);
            expect(attestation.indexReset).toBe("not-applicable-no-assigned-index");
            expect(attestation.delegationDisabled).toBe(false);
            const plan = TrialPlan.make({
              ...candidate,
              configDigest: yield* trialControlsDigest(candidate),
              isolationAttestationPath: qualified.attestation.path,
              isolationAttestationDigest: qualified.attestation.digest,
            });
            const args = yield* buildTrialSandbox(plan, report.workspace);
            expect(A.contains(args, "--unshare-all")).toBe(true);
            expect(A.takeRight(args, 1)).toEqual(A.takeRight(candidate.args, 1));
            expect(yield* buildTrialSandbox(plan, `${report.workspace}-other`).pipe(Effect.flip)).toMatchObject({
              _tag: "AgentTrialError",
            });
            const changed = TrialPlan.make({ ...plan, assignedIndexTargets: ["/tools/index"] });
            expect(yield* buildTrialSandbox(changed, report.workspace).pipe(Effect.flip)).toMatchObject({
              _tag: "AgentTrialError",
            });
            const originalRequest = yield* fs.readFileString(report.request.path);
            const originalReport = yield* fs.readFileString(qualified.report.path);
            const originalAttestation = yield* fs.readFileString(qualified.attestation.path);
            yield* fs.writeFileString(report.request.path, "{}");
            expect(yield* buildTrialSandbox(plan, report.workspace).pipe(Effect.flip)).toMatchObject({
              message: "Qualification request artifact changed",
            });
            yield* fs.remove(report.request.path);
            expect(yield* buildTrialSandbox(plan, report.workspace).pipe(Effect.flip)).toMatchObject({
              message: "Missing or invalid qualification request",
            });
            yield* fs.writeFileString(report.request.path, originalRequest);
            const rehashRequest = Effect.fn("QualificationTest.rehashRequest")(function* (
              replacement: TrialIsolationQualificationRequest
            ) {
              yield* fs.writeFileString(
                report.request.path,
                yield* writeJson(TrialIsolationQualificationRequest)(replacement)
              );
              const reboundReport = TrialIsolationQualificationReport.make({
                ...report,
                request: TrialArtifact.make({
                  path: report.request.path,
                  digest: yield* hashTrialInput(report.request.path),
                }),
              });
              yield* fs.writeFileString(
                qualified.report.path,
                yield* writeJson(TrialIsolationQualificationReport)(reboundReport)
              );
              const reboundAttestation = TrialNoIndexIsolationAttestation.make({
                ...attestation,
                qualificationReportDigest: yield* hashTrialInput(qualified.report.path),
              });
              yield* fs.writeFileString(
                qualified.attestation.path,
                yield* writeJson(TrialNoIndexIsolationAttestation)(reboundAttestation)
              );
              return TrialPlan.make({
                ...plan,
                isolationAttestationDigest: yield* hashTrialInput(qualified.attestation.path),
              });
            });
            const otherCandidate = path.join(root, "other-candidate.json");
            yield* fs.writeFileString(
              otherCandidate,
              yield* writeJson(TrialCandidateControls)(
                TrialCandidateControls.make({
                  ...candidate,
                  args: [...candidate.args, "different-controls"],
                })
              )
            );
            const wrongCandidatePlan = yield* rehashRequest(
              TrialIsolationQualificationRequest.make({
                ...request,
                candidate: TrialArtifact.make({ path: otherCandidate, digest: yield* hashTrialInput(otherCandidate) }),
              })
            );
            expect(yield* buildTrialSandbox(wrongCandidatePlan, report.workspace).pipe(Effect.flip)).toMatchObject({
              message: "Qualification request differs from its candidate or owned namespace paths",
            });
            const wrongEnvelopePlan = yield* rehashRequest(
              TrialIsolationQualificationRequest.make({
                ...request,
                resourceEnvelope: TrialQualificationResourceEnvelope.make({
                  ...request.resourceEnvelope,
                  memoryMaxBytes: request.resourceEnvelope.memoryMaxBytes + 1,
                }),
              })
            );
            expect(yield* buildTrialSandbox(wrongEnvelopePlan, report.workspace).pipe(Effect.flip)).toMatchObject({
              message: "Qualification request differs from its candidate or owned namespace paths",
            });
            const wrongRootPlan = yield* rehashRequest(
              TrialIsolationQualificationRequest.make({ ...request, ownedRoot: path.join(root, "other-root") })
            );
            expect(yield* buildTrialSandbox(wrongRootPlan, report.workspace).pipe(Effect.flip)).toMatchObject({
              message: "Qualification request differs from its candidate or owned namespace paths",
            });
            yield* fs.writeFileString(report.request.path, originalRequest);
            yield* fs.writeFileString(qualified.report.path, originalReport);
            yield* fs.writeFileString(qualified.attestation.path, originalAttestation);
            const stream = A.head(report.observations);
            if (O.isNone(stream)) return yield* Effect.die("Qualification omitted observations");
            yield* fs.writeFileString(stream.value.stdout.path, "tampered");
            expect(yield* buildTrialSandbox(plan, report.workspace).pipe(Effect.flip)).toMatchObject({
              message: "Qualification probe capture changed",
            });
          })
        ),
      { timeout: 120_000 }
    );

    it.effect(
      "never publishes attestation when precommit hashing or final publication I/O fails",
      () =>
        Effect.scoped(
          Effect.gen(function* () {
            for (const stage of ["report-read", "pending-read", "rename"]) {
              const { fs, path, requestPath, ownedRoot } = yield* fixture();
              const blockedRead = path.join(ownedRoot, stage === "report-read" ? "report.json" : "attestation.pending");
              const injected = PlatformError.badArgument({
                module: "FileSystem",
                method: stage,
                description: "Injected qualification publication I/O failure",
              });
              let injectedReached = false;
              const refusal = Effect.sync(() => {
                injectedReached = true;
              }).pipe(Effect.andThen(Effect.fail(injected)));
              const failingFs: FileSystem.FileSystem = {
                ...fs,
                stream: (file, options) =>
                  file === blockedRead && stage !== "rename" ? Stream.fromEffect(refusal) : fs.stream(file, options),
                rename: (from, to) =>
                  stage === "rename" && to === path.join(ownedRoot, "attestation.json") ? refusal : fs.rename(from, to),
              };
              expect(
                yield* qualifyTrialIsolation(requestPath).pipe(
                  Effect.provideService(FileSystem.FileSystem, failingFs),
                  Effect.flip
                )
              ).toMatchObject({ _tag: "AgentTrialError" });
              if (!injectedReached) yield* printQualificationFailure(ownedRoot);
              expect(injectedReached).toBe(true);
              expect(yield* fs.exists(path.join(ownedRoot, "report.json"))).toBe(true);
              expect(yield* fs.exists(path.join(ownedRoot, "attestation.json"))).toBe(false);
            }
          })
        ),
      { timeout: 120_000 }
    );

    it.effect(
      "refuses declared resource limits or owner that differ from the actual finite cgroup",
      () =>
        Effect.scoped(
          Effect.gen(function* () {
            const { fs, request, requestPath, ownedRoot } = yield* fixture();
            for (const patch of [
              { memoryMaxBytes: request.resourceEnvelope.memoryMaxBytes + 1 },
              { cpuQuotaMicros: request.resourceEnvelope.cpuQuotaMicros + 1 },
              { cpuPeriodMicros: request.resourceEnvelope.cpuPeriodMicros + 1 },
              { cgroup: `${request.resourceEnvelope.cgroup}-other` },
            ]) {
              yield* fs.writeFileString(
                requestPath,
                yield* writeJson(TrialIsolationQualificationRequest)(
                  TrialIsolationQualificationRequest.make({
                    ...request,
                    resourceEnvelope: TrialQualificationResourceEnvelope.make({
                      ...request.resourceEnvelope,
                      ...patch,
                    }),
                  })
                )
              );
              expect(yield* qualifyTrialIsolation(requestPath).pipe(Effect.flip)).toMatchObject({
                message: "Qualification resource envelope differs from its declared owner and limits",
              });
              expect(yield* fs.exists(ownedRoot)).toBe(false);
            }
            expect(
              S.is(TrialIsolationQualificationRequest)({
                ...request,
                schemaVersion: "trial-isolation-qualification-request/v1",
              })
            ).toBe(false);
            expect(
              S.is(TrialQualificationResourceEnvelope)({
                ...request.resourceEnvelope,
                memoryMaxBytes: Number.POSITIVE_INFINITY,
              })
            ).toBe(false);
            expect(
              S.is(TrialQualificationResourceEnvelope)({ ...request.resourceEnvelope, memorySwapMaxBytes: 1 })
            ).toBe(false);
            expect(S.is(TrialQualificationResourceEnvelope)({ ...request.resourceEnvelope, cpuQuotaMicros: 0 })).toBe(
              false
            );
            for (const cgroup of [
              `${request.resourceEnvelope.cgroup}/../other`,
              `${request.resourceEnvelope.cgroup}//other`,
              `${request.resourceEnvelope.cgroup}/.`,
            ])
              expect(S.is(TrialQualificationResourceEnvelope)({ ...request.resourceEnvelope, cgroup })).toBe(false);
            expect(
              S.is(TrialQualificationResourceEnvelope)({ ...request.resourceEnvelope, cpuPeriodMicros: 0.5 })
            ).toBe(false);
          })
        ),
      { timeout: 30_000 }
    );

    it.effect(
      "retains unknown evidence when independently reobserved owner or limits change during probes",
      () =>
        Effect.scoped(
          Effect.gen(function* () {
            for (const target of ["memory.max", "cpu.max", "owner"]) {
              const { fs, path, request, requestPath, ownedRoot } = yield* fixture();
              const watched =
                target === "owner" ? "/proc/self/cgroup" : path.join(request.resourceEnvelope.cgroup, target);
              let observations = 0;
              let injectedReached = false;
              const changingFs: FileSystem.FileSystem = {
                ...fs,
                readFileString: (file, encoding) =>
                  fs.readFileString(file, encoding).pipe(
                    Effect.map((actual) => {
                      if (file !== watched) return actual;
                      observations += 1;
                      if (observations < 2) return actual;
                      injectedReached = true;
                      if (target === "owner") return Str.replace(/\n?$/u, "-changed\n")(Str.trim(actual));
                      return target === "memory.max"
                        ? `${request.resourceEnvelope.memoryMaxBytes + 1}`
                        : `${request.resourceEnvelope.cpuQuotaMicros + 1} ${request.resourceEnvelope.cpuPeriodMicros}`;
                    })
                  ),
              };
              expect(
                yield* qualifyTrialIsolation(requestPath).pipe(
                  Effect.provideService(FileSystem.FileSystem, changingFs),
                  Effect.flip
                )
              ).toMatchObject({ _tag: "AgentTrialError" });
              expect(injectedReached).toBe(true);
              const report = yield* fs
                .readFileString(path.join(ownedRoot, "report.json"))
                .pipe(Effect.flatMap(S.decodeUnknownEffect(S.fromJsonString(TrialIsolationQualificationReport))));
              expect(report.status).toBe("unknown");
              expect(A.length(report.observations)).toBe(19);
              expect(yield* fs.exists(path.join(ownedRoot, "attestation.json"))).toBe(false);
            }
          })
        ),
      { timeout: 120_000 }
    );

    it.effect(
      "rechecks actual limits after precommit hashing and refuses publication if they changed",
      () =>
        Effect.scoped(
          Effect.gen(function* () {
            const { fs, path, request, requestPath, ownedRoot } = yield* fixture();
            let observations = 0;
            const changingFs: FileSystem.FileSystem = {
              ...fs,
              readFileString: (file, encoding) =>
                fs.readFileString(file, encoding).pipe(
                  Effect.map((actual) => {
                    if (file !== path.join(request.resourceEnvelope.cgroup, "memory.max")) return actual;
                    observations += 1;
                    return observations < 3 ? actual : `${request.resourceEnvelope.memoryMaxBytes + 1}`;
                  })
                ),
            };
            expect(
              yield* qualifyTrialIsolation(requestPath).pipe(
                Effect.provideService(FileSystem.FileSystem, changingFs),
                Effect.flip
              )
            ).toMatchObject({ message: "Qualification resource owner or limits changed before publication" });
            expect(observations).toBe(3);
            expect(yield* fs.exists(path.join(ownedRoot, "attestation.pending"))).toBe(true);
            expect(yield* fs.exists(path.join(ownedRoot, "attestation.json"))).toBe(false);
          })
        ),
      { timeout: 120_000 }
    );

    it.effect(
      "refuses changed candidate bytes without creating the owned root or an attestation",
      () =>
        Effect.scoped(
          Effect.gen(function* () {
            const { fs, candidatePath, requestPath, ownedRoot } = yield* fixture();
            yield* fs.writeFileString(candidatePath, "{}");
            expect(yield* qualifyTrialIsolation(requestPath).pipe(Effect.flip)).toMatchObject({
              _tag: "AgentTrialError",
            });
            expect(yield* fs.exists(ownedRoot)).toBe(false);
          })
        ),
      { timeout: 30_000 }
    );

    it.effect(
      "retains unknown probes and publishes no attestation when the compiler is not usable",
      () =>
        Effect.scoped(
          Effect.gen(function* () {
            const { fs, path, candidate, candidatePath, request, requestPath, ownedRoot } = yield* fixture();
            const trueDigest = yield* hashTrialInput("/usr/bin/true");
            const wrong = TrialCandidateControls.make({
              ...candidate,
              mounts: A.map(candidate.mounts, (mount) =>
                mount.target === "/runtime/tsgo" ? { ...mount, source: "/usr/bin/true", digest: trueDigest } : mount
              ),
            });
            yield* fs.writeFileString(candidatePath, yield* writeJson(TrialCandidateControls)(wrong));
            yield* fs.writeFileString(
              requestPath,
              yield* writeJson(TrialIsolationQualificationRequest)(
                TrialIsolationQualificationRequest.make({
                  ...request,
                  candidate: TrialArtifact.make({ path: candidatePath, digest: yield* hashTrialInput(candidatePath) }),
                })
              )
            );
            expect(yield* qualifyTrialIsolation(requestPath).pipe(Effect.flip)).toMatchObject({
              _tag: "AgentTrialError",
            });
            expect(yield* fs.exists(path.join(ownedRoot, "report.json"))).toBe(true);
            expect(yield* fs.exists(path.join(ownedRoot, "attestation.json"))).toBe(false);
          })
        ),
      { timeout: 30_000 }
    );

    it.effect(
      "aborts an overflowing spool and retains only bounded private files",
      () =>
        Effect.scoped(
          Effect.gen(function* () {
            const fs = yield* FileSystem.FileSystem;
            const home = yield* Config.String("HOME");
            const cache = `${home}/.cache/beep/runner-tests`;
            yield* fs.makeDirectory(cache, { recursive: true });
            const root = yield* fs.makeTempDirectoryScoped({ directory: cache });
            const error = yield* runSpooledStreams({
              command: "/usr/bin/printf",
              args: ["output beyond cap"],
              env: {},
              extendEnv: false,
              stdoutPath: `${root}/stdout`,
              stderrPath: `${root}/stderr`,
              maxOutputBytes: BigInt(3),
              timeout: "3 seconds",
            }).pipe(Effect.flip);
            expect(error).toMatchObject({ _tag: "CaptureOutputLimitExceededError", maxBytes: BigInt(3) });
            expect((yield* fs.stat(`${root}/stdout`)).size).toBeLessThanOrEqual(BigInt(3));
          })
        ),
      { timeout: 10_000 }
    );

    it.effect(
      "observes forced SIGTERM without fabricating a numeric exit and drains actual output",
      () =>
        Effect.scoped(
          Effect.gen(function* () {
            const fs = yield* FileSystem.FileSystem;
            const home = yield* Config.String("HOME");
            const root = yield* fs.makeTempDirectoryScoped({ directory: `${home}/.cache/beep/runner-tests` });
            const script = "console.log('started');setInterval(()=>{},1000)";
            const terminal = yield* runObservedSpooledStreams({
              command: "/usr/bin/node",
              args: ["-e", script],
              env: {},
              extendEnv: false,
              stdoutPath: `${root}/stdout`,
              stderrPath: `${root}/stderr`,
              interruptAfter: "200 millis",
              timeout: "5 seconds",
              forceKillAfter: "1 second",
              maxOutputBytes: BigInt(1024),
            });
            expect(terminal).toMatchObject({ _tag: "Signalled", signal: "SIGTERM" });
            if (!CapturedProcessTerminal.guards.Signalled(terminal))
              return yield* Effect.die("Expected real signal terminal");
            expect(isCapturedSigtermExit(terminal.error, A.join(["/usr/bin/node", "-e", script], " "))).toBe(true);
            expect(yield* fs.readFileString(`${root}/stdout`)).toBe("started\n");
          })
        ),
      { timeout: 10_000 }
    );

    it.effect(
      "keeps actual graceful exit143 distinct from a signal terminal",
      () =>
        Effect.scoped(
          Effect.gen(function* () {
            const fs = yield* FileSystem.FileSystem;
            const home = yield* Config.String("HOME");
            const root = yield* fs.makeTempDirectoryScoped({ directory: `${home}/.cache/beep/runner-tests` });
            const script =
              "console.log('started');process.on('SIGTERM',()=>{console.log('settled');process.exit(143)});setInterval(()=>{},1000)";
            const terminal = yield* runObservedSpooledStreams({
              command: "/usr/bin/node",
              args: ["-e", script],
              env: {},
              extendEnv: false,
              stdoutPath: `${root}/stdout`,
              stderrPath: `${root}/stderr`,
              interruptAfter: "200 millis",
              timeout: "5 seconds",
              forceKillAfter: "1 second",
              maxOutputBytes: BigInt(1024),
            });
            expect(terminal).toMatchObject({ _tag: "Exited", exitCode: 143 });
            expect(yield* fs.readFileString(`${root}/stdout`)).toBe("started\nsettled\n");
          })
        ),
      { timeout: 10_000 }
    );

    it.effect(
      "interrupts an owned process and returns only after terminal output drains",
      () =>
        Effect.scoped(
          Effect.gen(function* () {
            const fs = yield* FileSystem.FileSystem;
            const home = yield* Config.String("HOME");
            const root = yield* fs.makeTempDirectoryScoped({ directory: `${home}/.cache/beep/runner-tests` });
            const stdoutPath = `${root}/stdout`;
            const code = yield* runSpooledStreams({
              command: "/bin/sh",
              args: ["-c", "trap 'echo settled; exit 143' TERM; echo started; while :; do sleep 0.05; done"],
              env: { PATH: "/usr/bin:/bin" },
              extendEnv: false,
              stdoutPath,
              stderrPath: `${root}/stderr`,
              interruptAfter: "200 millis",
              timeout: "5 seconds",
              forceKillAfter: "1 second",
            });
            expect(code).toBe(143);
            expect(yield* fs.readFileString(stdoutPath)).toContain("settled");
          })
        ),
      { timeout: 10_000 }
    );
  }
);
