/**
 * Finite owned-fixture qualification of the shared denied-network namespace.
 * @packageDocumentation
 * @since 0.0.0
 */
import { hashPublicTextSha256 } from "@beep/repo-ai-metrics/privacy";
import * as A from "effect/Array";
import * as Cause from "effect/Cause";
import * as Clock from "effect/Clock";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as Fiber from "effect/Fiber";
import * as FileSystem from "effect/FileSystem";
import * as MutableList from "effect/MutableList";
import * as Num from "effect/Number";
import * as O from "effect/Option";
import * as Path from "effect/Path";
import * as Schedule from "effect/Schedule";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import {
  CapturedProcessTerminal,
  OutputBound,
  runCapturedStreams,
  runObservedSpooledStreams,
} from "../../../internal/process/StepExec.ts";
import { AgentTrialError } from "../AgentEffectiveness.errors.ts";
import {
  TrialArtifact,
  TrialCandidateControls,
  TrialIsolationObservation,
  TrialIsolationQualificationReport,
  TrialIsolationQualificationRequest,
  TrialNoIndexIsolationAttestation,
  TrialQualificationResourceEnvelope,
} from "../AgentEffectiveness.trials.schemas.ts";
import { hashTrialInput, trialControlsDigest } from "./TrialIsolation.ts";
import { deriveTrialNamespace, isTrialCompilerNegative, validateNoIndexQualificationControls } from "./TrialSandbox.ts";
import type { TrialIsolationProbeId } from "../AgentEffectiveness.trials.schemas.ts";

const privateFile = { flag: "wx", mode: 0o600 } satisfies Parameters<FileSystem.FileSystem["writeFileString"]>[2];
const captureBound = OutputBound.make({ maxChars: 1_048_576, truncatedNotice: "\n[qualification truncated]" });
const fail = (message: string) => AgentTrialError.make({ stage: "isolation", message });
const disjoint = (left: string, right: string) =>
  left !== right && !Str.startsWith(`${left}/`)(right) && !Str.startsWith(`${right}/`)(left);
const compilerArgs = ["--ignoreConfig", "--noEmit", "--noLib", "/runtime/tslib/lib.es5.d.ts", "/workspace/answer.ts"];
const gitControls = [
  "-c",
  "core.hooksPath=/dev/null",
  "-c",
  "core.fsmonitor=false",
  "-c",
  "credential.helper=",
  "-c",
  "user.name=Isolation Fixture",
  "-c",
  "user.email=isolation@localhost",
];

// These scripts are closed runner fixtures, never candidate-supplied programs.
const listenerScript = `const fs=require('node:fs'),net=require('node:net');
const [ready,nonce]=process.argv.slice(1);
const server=net.createServer(socket=>socket.once('data',data=>{
 if(data.toString()===nonce){socket.end(nonce)}
 else if(data.toString()===nonce+' stop'){socket.end(nonce);server.close()}
 else {fs.writeFileSync(ready+'.unexpected',data);socket.destroy()}
}));
server.listen(0,'127.0.0.1',()=>fs.writeFileSync(ready,''+server.address().port,{flag:'wx',mode:0o600}));`;
const clientScript = `const net=require('node:net');const [port,nonce,mode]=process.argv.slice(1);
const socket=net.connect({host:'127.0.0.1',port:Number(port)});let data='';
socket.setTimeout(2000,()=>process.exit(3));
socket.on('connect',()=>socket.write(nonce+(mode==='stop'?' stop':'')));
socket.on('data',chunk=>data+=chunk);
socket.on('end',()=>{if(mode==='denied'||data!==nonce)process.exit(4);console.log(nonce)});
socket.on('error',error=>{if(mode==='denied'&&error.code==='ECONNREFUSED'){console.log('denied '+nonce)}else process.exit(5)});`;
const sleepScript = `const fs=require('node:fs');const nonce=process.argv[1];
fs.writeFileSync('/workspace/interrupted.txt',nonce,{flag:'wx'});console.log('started '+nonce);
process.on('SIGTERM',()=>{console.log('interrupted '+nonce);process.exit(143)});
setInterval(()=>{},1000);`;

const resourceEnvelopesEqual = S.toEquivalence(TrialQualificationResourceEnvelope);

const observeResourceEnvelope = Effect.fn("Qualification.observeResourceEnvelope")(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const current = A.findFirst(Str.split("\n")(yield* fs.readFileString("/proc/self/cgroup")), (line) =>
    Str.startsWith("0::/")(line)
  );
  if (O.isNone(current)) return yield* fail("Qualification requires an owned cgroup v2 resource envelope");
  const cgroup = path.join("/sys/fs/cgroup", Str.slice(3)(current.value));
  const memory = Num.parse(Str.trim(yield* fs.readFileString(path.join(cgroup, "memory.max"))));
  const swap = Num.parse(Str.trim(yield* fs.readFileString(path.join(cgroup, "memory.swap.max"))));
  const cpu = Str.split(/\s+/)(Str.trim(yield* fs.readFileString(path.join(cgroup, "cpu.max"))));
  const quota = O.flatMap(A.get(cpu, 0), Num.parse);
  const period = O.flatMap(A.get(cpu, 1), Num.parse);
  if (O.isNone(memory) || O.isNone(swap) || O.isNone(quota) || O.isNone(period) || A.length(cpu) !== 2)
    return yield* fail("Qualification requires finite memory and CPU limits with swap disabled");
  return yield* S.decodeUnknownEffect(TrialQualificationResourceEnvelope)({
    cgroup,
    memoryMaxBytes: memory.value,
    memorySwapMaxBytes: swap.value,
    cpuQuotaMicros: quota.value,
    cpuPeriodMicros: period.value,
  });
});

/**
 * Run only fixed namespace probes, retaining evidence before publishing a v2 receipt.
 * **Details**
 * The candidate native binary is hashed and declared but never executed. This
 * qualifies filesystem and network isolation, not native model or child behavior.
 * The request root must be fresh and disjoint from every frozen input. Probe
 * failures retain an immutable report and never publish an attestation.
 * Linux cgroup v2 and bwrap are required. The request declares the actual finite
 * owner envelope; qualification does not set limits or support unbounded owners.
 * **Example** (Compose a qualification without executing it)
 * ```ts
 * import { qualifyTrialIsolation } from "@beep/repo-cli/test/AgentEffectiveness"
 * import * as Effect from "effect/Effect"
 * console.log(Effect.isEffect(qualifyTrialIsolation("/owned/request.json"))) // true
 * ```
 * @category execution
 * @since 0.0.0
 */
export const qualifyTrialIsolation = Effect.fn("AgentEffectiveness.qualifyTrialIsolation")(
  function* (requestPath: string) {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const requestText = yield* fs.readFileString(requestPath);
    const request = yield* S.decodeEffect(S.fromJsonString(TrialIsolationQualificationRequest))(requestText);
    const candidateText = yield* fs.readFileString(request.candidate.path);
    const candidate = yield* S.decodeEffect(S.fromJsonString(TrialCandidateControls))(candidateText);
    yield* validateNoIndexQualificationControls(candidate);
    if ((yield* hashTrialInput(request.candidate.path)) !== request.candidate.digest)
      return yield* fail("Qualification candidate artifact changed");
    const resourceEnvelope = yield* observeResourceEnvelope();
    if (!resourceEnvelopesEqual(request.resourceEnvelope, resourceEnvelope))
      return yield* fail("Qualification resource envelope differs from its declared owner and limits");
    const root = request.ownedRoot;
    const parent = path.dirname(root);
    const sourceOwner = (yield* fs.stat(candidate.sourceRepository)).uid;
    const parentInfo = yield* fs.stat(parent);
    if (
      !path.isAbsolute(root) ||
      path.normalize(root) !== root ||
      Str.startsWith("/tmp/")(root) ||
      (yield* fs.realPath(parent)) !== parent ||
      parentInfo.type !== "Directory" ||
      O.isNone(sourceOwner) ||
      !O.contains(parentInfo.uid, sourceOwner.value) ||
      (parentInfo.mode & 0o022) !== 0 ||
      (yield* fs.exists(root))
    )
      return yield* fail("Qualification requires a fresh canonical owned root outside tmpfs");
    for (const input of [
      requestPath,
      request.candidate.path,
      candidate.promptPath,
      candidate.sourceRepository,
      candidate.workspaceRoot,
      candidate.receiptRoot,
      ...A.map(candidate.mounts, (mount) => mount.source),
      ...A.map(candidate.runtimeClosures ?? [], (closure) => closure.inventory.root),
    ]) {
      if (!path.isAbsolute(input) || !disjoint(root, input))
        return yield* fail("Qualification root overlaps a frozen input or private root");
    }
    const privateRoot = path.join(root, "private");
    if (
      A.length(request.protectedSentinels) > 32 ||
      A.some(
        request.protectedSentinels,
        (sentinel) => path.dirname(sentinel) !== privateRoot || path.normalize(sentinel) !== sentinel
      )
    )
      return yield* fail("Sentinels must name at most 32 fresh files in the owned private directory");
    yield* fs.makeDirectory(root, { mode: 0o700 });
    const state = path.join(root, "state");
    const workspace = path.join(state, "worktree");
    const streams = path.join(root, "streams");
    for (const directory of [state, workspace, privateRoot, streams])
      yield* fs.makeDirectory(directory, { mode: 0o700 });
    yield* fs.writeFileString(path.join(root, "request.json"), requestText, privateFile);
    yield* fs.writeFileString(path.join(root, "candidate.json"), candidateText, privateFile);
    const artifact = Effect.fn("Qualification.artifact")(function* (file: string) {
      return TrialArtifact.make({ path: file, digest: yield* hashTrialInput(file) });
    });
    const nonce = yield* hashPublicTextSha256(`${root}:${yield* Clock.currentTimeMillis}:${request.candidate.digest}`);
    const observations = MutableList.make<TrialIsolationObservation>();
    const digest = yield* trialControlsDigest(candidate);
    let namespaceDigest = yield* hashPublicTextSha256("");
    const record = Effect.fn("Qualification.record")(function* (
      id: TrialIsolationProbeId,
      argv: readonly [string, ...Array<string>],
      elapsed: Duration.Duration,
      terminal: CapturedProcessTerminal,
      stdoutPath: string,
      stderrPath: string,
      interrupted = false
    ) {
      const total = (yield* fs.stat(stdoutPath)).size + (yield* fs.stat(stderrPath)).size;
      if (total > BigInt(2_097_152)) return yield* fail("Qualification stream capture exceeded its finite byte limit");
      MutableList.append(
        observations,
        TrialIsolationObservation.make({
          id,
          argv,
          elapsedMs: Num.round(Duration.toMillis(elapsed), 0),
          exitCode: CapturedProcessTerminal.guards.Exited(terminal) ? O.some(terminal.exitCode) : O.none(),
          terminal,
          stdout: yield* artifact(stdoutPath),
          stderr: yield* artifact(stderrPath),
          interrupted,
        })
      );
    });
    const capture = Effect.fn("Qualification.capture")(function* (
      id: TrialIsolationProbeId,
      command: string,
      args: ReadonlyArray<string>
    ) {
      const [elapsed, result] = yield* runCapturedStreams({
        command,
        args,
        cwd: workspace,
        extendEnv: false,
        env: { PATH: "/usr/bin:/bin", HOME: "/nonexistent", GIT_CONFIG_NOSYSTEM: "1", LC_ALL: "C" },
        bound: captureBound,
        forceKillAfter: "1 second",
      }).pipe(
        Effect.timeoutOrElse({
          duration: "20 seconds",
          orElse: () => Effect.fail(fail(`Qualification probe ${id} did not settle`)),
        }),
        Effect.timed
      );
      const stdoutPath = path.join(streams, `${id}.stdout`);
      const stderrPath = path.join(streams, `${id}.stderr`);
      yield* fs.writeFileString(stdoutPath, result.stdout, privateFile);
      yield* fs.writeFileString(stderrPath, result.stderr, privateFile);
      yield* record(
        id,
        [command, ...args],
        elapsed,
        CapturedProcessTerminal.cases.Exited.make({ exitCode: result.exitCode }),
        stdoutPath,
        stderrPath
      );
      if (result.truncated) return yield* fail(`Qualification probe ${id} capture was truncated`);
      return result;
    });
    const requireZero = Effect.fn("Qualification.requireZero")(function* (
      id: TrialIsolationProbeId,
      command: string,
      args: ReadonlyArray<string>
    ) {
      const result = yield* capture(id, command, args);
      if (result.exitCode !== 0) return yield* fail(`Qualification probe ${id} failed`);
      return result;
    });
    const result = yield* Effect.gen(function* () {
      for (const sentinel of request.protectedSentinels) yield* fs.writeFileString(sentinel, nonce, privateFile);
      yield* requireZero("fixture-init", "/usr/bin/git", [
        ...gitControls,
        "init",
        "--bare",
        path.join(state, "repository.git"),
      ]);
      yield* requireZero("fixture-worktree", "/usr/bin/git", [
        ...gitControls,
        "--git-dir",
        path.join(state, "repository.git"),
        "--work-tree",
        workspace,
        "config",
        "core.bare",
        "false",
      ]);
      yield* fs.writeFileString(path.join(workspace, ".git"), "gitdir: /state/repository.git\n", privateFile);
      yield* fs.writeFileString(path.join(workspace, "answer.ts"), "export const answer: number = 42\n", privateFile);
      const trace = O.fromUndefinedOr(candidate.environment.CODEX_ROLLOUT_TRACE_ROOT);
      if (O.isSome(trace)) {
        if (!Str.startsWith("/workspace/")(trace.value) || path.normalize(trace.value) !== trace.value)
          return yield* fail("Qualification trace must use a retained owned directory below /workspace");
        yield* fs.makeDirectory(path.join(workspace, path.relative("/workspace", trace.value)), {
          mode: 0o700,
          recursive: true,
        });
      }
      const prefix = yield* deriveTrialNamespace(candidate, workspace, undefined, true);
      namespaceDigest = yield* hashPublicTextSha256(
        yield* S.String.pipe(S.Array, S.fromJsonString, S.encodeEffect)(prefix)
      );
      const probe = (id: TrialIsolationProbeId, args: ReadonlyArray<string>) =>
        capture(id, "/usr/bin/bwrap", [...prefix, "--", ...args]);
      const ok = Effect.fn("Qualification.namespaceProbe")(function* (
        id: TrialIsolationProbeId,
        args: ReadonlyArray<string>
      ) {
        const observed = yield* probe(id, args);
        if (observed.exitCode !== 0) return yield* fail(`Qualification namespace probe ${id} failed`);
        return observed;
      });
      const read = yield* ok("read-write", [
        "/runtime/node",
        "-e",
        `const fs=require('node:fs');if(fs.realpathSync('.')!=='/workspace'||fs.readFileSync('answer.ts','utf8')!=='export const answer: number = 42\\n')process.exit(2);fs.writeFileSync('nonce.txt',process.argv[1],{flag:'wx'});if(process.argv[2]){if((fs.statSync(process.argv[2]).mode&0o777)!==0o700)process.exit(3);fs.writeFileSync(process.argv[2]+'/probe',process.argv[1],{flag:'wx'})}console.log(process.argv[1])`,
        nonce,
        O.getOrElse(trace, () => ""),
      ]);
      if (Str.trim(read.stdout) !== nonce || (yield* fs.readFileString(path.join(workspace, "nonce.txt"))) !== nonce)
        return yield* fail("Namespace read/write nonce differs");
      if (
        O.isSome(trace) &&
        (yield* fs.readFileString(path.join(workspace, path.relative("/workspace", trace.value), "probe"))) !== nonce
      )
        return yield* fail("Owned trace write was not retained");
      yield* ok("git-add", ["/usr/bin/git", ...gitControls, "add", "answer.ts", "nonce.txt"]);
      yield* ok("local-commit", ["/usr/bin/git", ...gitControls, "commit", "-m", "qualification fixture"]);
      const commit = yield* requireZero("inspect-commit", "/usr/bin/git", [
        ...gitControls,
        "--git-dir",
        path.join(state, "repository.git"),
        "show",
        "HEAD:nonce.txt",
      ]);
      if (Str.trim(commit.stdout) !== nonce) return yield* fail("Local commit does not retain namespace write");
      yield* ok("compiler-positive", ["/runtime/tsgo", ...compilerArgs]);
      yield* fs.writeFileString(path.join(workspace, "answer.ts"), "export const answer: number = 'wrong'\n");
      const negative = yield* probe("compiler-negative", ["/runtime/tsgo", ...compilerArgs]);
      if (!isTrialCompilerNegative(negative))
        return yield* fail("Compiler negative did not establish the expected TS2322 diagnostic");
      for (const sentinel of request.protectedSentinels) {
        if ((yield* fs.readFileString(sentinel)) !== nonce) return yield* fail("Protected sentinel changed");
      }
      yield* ok("private-paths", [
        "/runtime/node",
        "-e",
        `const fs=require('node:fs');for(const p of process.argv.slice(1)){try{fs.readFileSync(p);process.exit(2)}catch(e){if(e.code!=='ENOENT'&&e.code!=='EACCES')process.exit(3)}}console.log('private paths denied')`,
        ...request.protectedSentinels,
      ]);
      const hostNetwork = yield* fs.readLink("/proc/self/ns/net");
      const network = yield* ok("network-identity", [
        "/runtime/node",
        "-e",
        `console.log(require('node:fs').readlinkSync('/proc/self/ns/net'))`,
      ]);
      if (Str.trim(network.stdout) === hostNetwork || !Str.startsWith("net:[")(Str.trim(network.stdout)))
        return yield* fail("Namespace did not establish a distinct network identity");
      const nodeMount = A.findFirst(candidate.mounts, (mount) => mount.target === "/runtime/node");
      if (O.isNone(nodeMount)) return yield* fail("Pinned node fixture runtime mount is missing");
      const ready = path.join(privateRoot, "listener.port");
      const listener = yield* capture("owned-listener", nodeMount.value.source, [
        "-e",
        listenerScript,
        ready,
        nonce,
      ]).pipe(Effect.forkChild);
      yield* fs.exists(ready).pipe(
        Effect.repeat({ until: (value) => value, schedule: Schedule.spaced("20 millis") }),
        Effect.timeoutOrElse({
          duration: "3 seconds",
          orElse: () => Effect.fail(fail("Owned listener did not become ready")),
        })
      );
      const port = Str.trim(yield* fs.readFileString(ready));
      const baseline = yield* requireZero("listener-before", nodeMount.value.source, [
        "-e",
        clientScript,
        port,
        nonce,
        "allow",
      ]);
      if (Str.trim(baseline.stdout) !== nonce) return yield* fail("Outside listener positive control differs");
      const denied = yield* ok("owned-endpoint-denied", ["/runtime/node", "-e", clientScript, port, nonce, "denied"]);
      if (Str.trim(denied.stdout) !== `denied ${nonce}`) return yield* fail("Endpoint denial is inconclusive");
      const push = yield* probe("push-denied", [
        "/usr/bin/git",
        ...gitControls,
        "-c",
        "http.proxy=",
        "push",
        `http://127.0.0.1:${port}/owned.git`,
        "HEAD:refs/heads/probe",
      ]);
      if (push.exitCode !== 128 || !Str.includes("Failed to connect")(push.stderr))
        return yield* fail("Push denial was not the expected owned endpoint connection failure");
      const after = yield* requireZero("listener-after", nodeMount.value.source, [
        "-e",
        clientScript,
        port,
        nonce,
        "allow",
      ]);
      if (Str.trim(after.stdout) !== nonce || (yield* fs.exists(`${ready}.unexpected`)))
        return yield* fail("Outside listener changed or received a forbidden namespace request");
      yield* requireZero("listener-stop", nodeMount.value.source, ["-e", clientScript, port, nonce, "stop"]);
      const listenerExit = yield* Fiber.join(listener);
      if (listenerExit.exitCode !== 0) return yield* fail("Owned listener did not settle");
      yield* ok("dependency-links", [
        "/runtime/node",
        "-e",
        `const fs=require('node:fs');for(const p of process.argv.slice(1)){if(!fs.existsSync(p))process.exit(2)}console.log(fs.realpathSync('.'))`,
        ...A.map(candidate.runtimeClosures ?? [], (closure) => closure.target),
      ]);
      const stdoutPath = path.join(streams, "interruption.stdout");
      const stderrPath = path.join(streams, "interruption.stderr");
      const args = [
        ...prefix,
        "--",
        "/usr/bin/flock",
        "--no-fork",
        "/workspace/owned.lock",
        "/runtime/node",
        "-e",
        sleepScript,
        nonce,
      ];
      const [elapsed, terminal] = yield* runObservedSpooledStreams({
        command: "/usr/bin/bwrap",
        args,
        env: {},
        extendEnv: false,
        stdoutPath,
        stderrPath,
        maxOutputBytes: BigInt(2_097_152),
        interruptAfter: "1 second",
        timeout: "10 seconds",
        forceKillAfter: "1 second",
      }).pipe(Effect.timed);
      yield* record("interruption", ["/usr/bin/bwrap", ...args], elapsed, terminal, stdoutPath, stderrPath, true);
      const interrupted = yield* fs.readFileString(stdoutPath);
      if (
        !CapturedProcessTerminal.guards.Signalled(terminal) ||
        !Str.includes(`started ${nonce}`)(interrupted) ||
        (yield* fs.readFileString(path.join(workspace, "interrupted.txt"))) !== nonce
      )
        return yield* fail(
          "Forced namespace interruption did not retain its startup/write and actual SIGTERM terminal evidence"
        );
      yield* requireZero("interruption-lock-released", "/usr/bin/flock", [
        "--nonblock",
        path.join(workspace, "owned.lock"),
        "/usr/bin/true",
      ]);
      if (
        (yield* hashTrialInput(request.candidate.path)) !== request.candidate.digest ||
        (yield* trialControlsDigest(candidate)) !== digest
      )
        return yield* fail("Candidate controls or boundary source changed during qualification");
      if (!resourceEnvelopesEqual(resourceEnvelope, yield* observeResourceEnvelope()))
        return yield* fail("Qualification resource owner or limits changed during probes");
      const revalidated = yield* deriveTrialNamespace(candidate, workspace, undefined, true);
      if (!A.makeEquivalence(Str.Equivalence)(prefix, revalidated))
        return yield* fail("Namespace prefix changed during qualification");
    }).pipe(
      Effect.scoped,
      Effect.timeoutOrElse({
        duration: "120 seconds",
        orElse: () => Effect.fail(fail("Qualification exceeded its total budget")),
      }),
      Effect.exit
    );
    const reportPath = path.join(root, "report.json");
    const attestationPath = path.join(root, "attestation.json");
    const report = TrialIsolationQualificationReport.make({
      schemaVersion: "trial-isolation-qualification-report/v2",
      request: yield* artifact(path.join(root, "request.json")),
      candidate: yield* artifact(path.join(root, "candidate.json")),
      configDigest: digest,
      namespaceDigest,
      workspace,
      resourceEnvelope,
      observations: MutableList.toArray(observations),
      status: Exit.isSuccess(result) ? "qualified" : "unknown",
      detail: Exit.isSuccess(result)
        ? "Closed namespace probes passed; native child and model canaries remain required."
        : Cause.pretty(result.cause),
      indexReset: "not-applicable-no-assigned-index",
      childPolicy: "declared-only-native-canaries-required",
      attestationPath: Exit.isSuccess(result) ? O.some(attestationPath) : O.none(),
    });
    yield* fs.writeFileString(
      reportPath,
      yield* S.encodeEffect(S.fromJsonString(TrialIsolationQualificationReport))(report),
      privateFile
    );
    if (Exit.isFailure(result))
      return yield* fail(`Isolation qualification is unknown; retained report: ${reportPath}`);
    const reportArtifact = yield* artifact(reportPath);
    const attestation = TrialNoIndexIsolationAttestation.make({
      schemaVersion: "agent-trial-isolation/v2",
      configDigest: digest,
      deniedPrivatePaths: true,
      deniedOtherArmQueries: true,
      deniedPush: true,
      indexReset: "not-applicable-no-assigned-index",
      interruptedCleanup: true,
      delegationDisabled: candidate.delegation === "disabled",
      readWorkspace: true,
      writeWorkspace: true,
      localCommit: true,
      compiler: true,
      dependencyLinksContained: true,
      canonicalIndexRoot: "/workspace",
      exactDiscoveredToolNames: [],
      childPolicy: "declared-only-native-canaries-required",
      qualificationReportPath: reportPath,
      qualificationReportDigest: reportArtifact.digest,
    });
    // The admissible receipt is always last; report/capture failure cannot leave one.
    const pending = path.join(root, "attestation.pending");
    yield* fs.writeFileString(
      pending,
      yield* S.encodeEffect(S.fromJsonString(TrialNoIndexIsolationAttestation))(attestation),
      privateFile
    );
    const pendingArtifact = yield* artifact(pending);
    const published = {
      report: reportArtifact,
      attestation: TrialArtifact.make({ path: attestationPath, digest: pendingArtifact.digest }),
    };
    if (!resourceEnvelopesEqual(resourceEnvelope, yield* observeResourceEnvelope()))
      return yield* fail("Qualification resource owner or limits changed before publication");
    return yield* fs.rename(pending, attestationPath).pipe(Effect.as(published), Effect.uninterruptible);
  },
  Effect.mapError((cause) =>
    S.is(AgentTrialError)(cause) ? cause : fail("Isolation qualification I/O or decoding failed")
  )
);
