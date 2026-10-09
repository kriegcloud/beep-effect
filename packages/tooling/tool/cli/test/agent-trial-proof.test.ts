import { hashPublicTextSha256 } from "@beep/repo-ai-metrics/privacy";
import {
  buildTrialSandbox,
  collectTrial,
  executeTrial,
  executeTrialCheck,
  finalizeTrial,
  hashTrialInput,
  inspectTrialGit,
  parseTrialUsage,
  reconstructTrialSource,
  retainTrialCandidate,
  startTrialBroker,
  TrialAcceptance,
  TrialAcceptanceJson,
  TrialAttempt,
  TrialAttemptJson,
  TrialBrokerControl,
  TrialCollectRequest,
  TrialCollectRequestJson,
  TrialEvaluatorCheck,
  TrialFinalizationJson,
  TrialInputInventory,
  TrialIsolationAttestation,
  TrialIsolationAttestationJson,
  TrialNativeChildPolicy,
  TrialPlan,
  TrialPlanJson,
  TrialProductiveProfile,
  TrialProof,
  TrialProofJson,
  trialArtifact,
  trialCheckContractDigest,
  trialControlsDigest,
  trialGitSandbox,
} from "@beep/repo-cli/test/AgentEffectiveness";
import { runCaptured, runSpooledStreams } from "@beep/repo-cli/test/Process";
import { YeetVerdict, YeetVerdictJson, YeetVerdictLane } from "@beep/repo-cli/test/Yeet";
import { Sha256Hex } from "@beep/schema/Sha256";
import * as BunCrypto from "@effect/platform-bun/BunCrypto";
import { NodeServices } from "@effect/platform-node";
import { expect, layer } from "@effect/vitest";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Path from "effect/Path";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const zero = Sha256Hex.make(Str.repeat(64)("0"));
const setup = Effect.fn(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const home = yield* Config.String("HOME");
  const cache = path.join(home, ".cache/beep/runner-tests");
  yield* fs.makeDirectory(cache, { recursive: true });
  const root = yield* fs.makeTempDirectoryScoped({ directory: cache });
  const workspace = path.join(root, "source");
  yield* fs.makeDirectory(workspace);
  const git = Effect.fn(function* (args: ReadonlyArray<string>) {
    const result = yield* runCaptured({
      command: "/usr/bin/git",
      args: [
        "-c",
        "core.hooksPath=/dev/null",
        "-c",
        "user.name=Fixture",
        "-c",
        "user.email=fixture@localhost",
        ...args,
      ],
      cwd: workspace,
      env: { PATH: "/usr/bin:/bin", HOME: "/nonexistent", GIT_CONFIG_NOSYSTEM: "1" },
      extendEnv: false,
      source: "stdout",
      timeout: "10 seconds",
    });
    expect(result.exitCode).toBe(0);
    return Str.trim(result.output);
  });
  yield* git(["init"]);
  yield* fs.writeFileString(path.join(workspace, "answer.ts"), "export const answer = 42\n");
  yield* git(["add", "."]);
  yield* git(["commit", "-m", "fixture"]);
  const commit = yield* git(["rev-parse", "HEAD"]);
  const plan = TrialPlan.make({
    schemaVersion: "agent-trial-plan/v1",
    runId: "fixture",
    attemptId: "one",
    provider: "codex",
    model: "gpt-6.1-sol",
    effort: "medium",
    baseCommit: commit,
    sourceDigest: zero,
    taskDigest: zero,
    acceptanceDigest: zero,
    configDigest: zero,
    toolId: "none",
    selectedToolNames: [],
    requiredYeetLaneIds: ["quality:check"],
    requiredTaskCheckIds: ["exports", "behavior"],
    requiredCheckSpecs: ["exports", "behavior"].map((id) => ({
      id,
      commandTemplate: ["fixture", "CANDIDATE"],
      inputBundleDigest: zero,
      contractDigest: zero,
    })),
    sourceRepository: workspace,
    workspaceRoot: path.join(root, "arms"),
    receiptRoot: path.join(root, "receipts"),
    command: "/runtime/cli",
    commandDigest: zero,
    delegation: "disabled",
    networkAdmission: "blocked-until-broker",
    args: [],
    environment: {},
    mounts: [],
    promptPath: path.join(root, "prompt"),
    timeoutMs: 1000,
    isolationAttestationPath: path.join(root, "canaries"),
    isolationAttestationDigest: zero,
  });
  return { fs, path, root, workspace, commit, plan };
});

layer(Layer.merge(NodeServices.layer, BunCrypto.layer), { excludeTestServices: true })(
  "trial exact-proof gates",
  (it) => {
    it.effect("rejects a frozen synthetic Yeet script before reconstruction", () =>
      Effect.scoped(
        Effect.gen(function* () {
          const { fs, path, root, plan, commit } = yield* setup();
          const check = TrialEvaluatorCheck.make({
            id: "full-yeet",
            kind: "yeet",
            commandTemplate: ["/bin/sh", "SEALED/yeet.sh"],
            environmentTemplate: {},
            input: { root: path.join(root, "sealed"), digest: zero, files: {}, symlinks: {} },
            expectedCases: plan.requiredYeetLaneIds,
            expectedPackage: O.none(),
            reportRelativePath: O.none(),
            writableCacheTargets: [],
            compilerOverlay: O.none(),
            timeoutMs: 1000,
          });
          const frozenPlan = TrialPlan.make({
            ...plan,
            fullYeetCheckSpec: {
              id: check.id,
              commandTemplate: check.commandTemplate,
              inputBundleDigest: check.input.digest,
              contractDigest: yield* trialCheckContractDigest(check),
            },
          });
          const planPath = path.join(root, "plan.json");
          yield* fs.writeFileString(planPath, yield* TrialPlanJson.encode(frozenPlan));
          const attemptPath = yield* executeTrial(planPath);
          const aborted = yield* TrialAttemptJson.decode(yield* fs.readFileString(attemptPath));
          const attempt = TrialAttempt.make({
            ...aborted,
            bundle: O.some(aborted.stdout),
            terminal: { status: "awaiting-proof", finalCommit: commit },
          });
          const retainedPath = path.join(path.dirname(attemptPath), "synthetic-attempt.json");
          yield* fs.writeFileString(retainedPath, yield* TrialAttemptJson.encode(attempt));
          const request = TrialCollectRequest.make({
            schemaVersion: "agent-trial-collect-request/v1",
            attempt: yield* trialArtifact(retainedPath),
            reconstructionRoot: path.join(root, "must-not-reconstruct"),
            outputRoot: path.join(root, "must-not-collect"),
            checks: [check],
            yeet: check,
            runtime: [],
            projectedRuntime: [],
          });
          const requestPath = path.join(root, "request.json");
          yield* fs.writeFileString(requestPath, yield* TrialCollectRequestJson.encode(request));
          const result = yield* collectTrial(requestPath).pipe(Effect.result);
          expect(result._tag).toBe("Failure");
          if (result._tag === "Failure")
            expect(result.failure.message).toBe("Full Yeet contract differs from frozen plan");
          expect(yield* fs.exists(request.reconstructionRoot)).toBe(false);
        })
      )
    );
    it.effect(
      "retains a failed exact-source start as an immutable denominator attempt",
      () =>
        Effect.scoped(
          Effect.gen(function* () {
            const { fs, path, root, plan } = yield* setup();
            const planPath = path.join(root, "plan.json");
            yield* fs.writeFileString(planPath, yield* TrialPlanJson.encode(plan));
            const receipt = yield* executeTrial(planPath);
            const attempt = yield* TrialAttemptJson.decode(yield* fs.readFileString(receipt));
            expect(attempt.terminal.status).toBe("aborted");
            expect(yield* fs.exists(path.join(path.dirname(receipt), "failure.log"))).toBe(true);
            expect(attempt.usage.coverage).toBe("missing-terminal");
            expect(O.isNone(attempt.exitCode)).toBe(true);
            const replay = yield* executeTrial(planPath).pipe(Effect.result);
            expect(replay._tag).toBe("Failure");
            const refs = yield* runCaptured({
              command: "/usr/bin/git",
              args: [
                "--git-dir",
                path.join(plan.workspaceRoot, "fixture-one/repository.git"),
                "for-each-ref",
                "--format=%(refname)",
              ],
              source: "stdout",
              timeout: "10 seconds",
            });
            expect(refs.output).toBe("");
          })
        ),
      { timeout: 20000 }
    );
    it.effect(
      "cannot admit inference from attestation booleans without a network broker",
      () =>
        Effect.scoped(
          Effect.gen(function* () {
            const { fs, path, root, workspace, commit, plan } = yield* setup();
            const archivePath = path.join(root, "base.tar");
            yield* runSpooledStreams({
              command: "/usr/bin/git",
              args: ["-C", workspace, "archive", "--format=tar", commit],
              stdoutPath: archivePath,
              stderrPath: path.join(root, "archive.err"),
              timeout: "10 seconds",
            });
            const archive = yield* trialArtifact(archivePath);
            const prompt = path.join(root, "prompt");
            const binary = path.join(root, "native-cli");
            yield* fs.writeFileString(prompt, "synthetic local fixture");
            yield* fs.writeFileString(binary, "#!/bin/sh\ntouch /workspace/forbidden-launch\n", { mode: 0o700 });
            const native = yield* trialArtifact(binary);
            const attestation = TrialIsolationAttestation.make({
              schemaVersion: "agent-trial-isolation/v1",
              configDigest: zero,
              deniedPrivatePaths: true,
              deniedOtherArmQueries: true,
              deniedPush: true,
              indexReset: true,
              interruptedCleanup: true,
              delegationDisabled: true,
              readWorkspace: true,
              writeWorkspace: true,
              localCommit: true,
              compiler: true,
              dependencyLinksContained: true,
              canonicalIndexRoot: "/workspace",
              exactDiscoveredToolNames: [],
            });
            const attestationPath = path.join(root, "canaries");
            yield* fs.writeFileString(attestationPath, yield* TrialIsolationAttestationJson.encode(attestation));
            let admittedPlan = TrialPlan.make({
              ...plan,
              sourceDigest: archive.digest,
              taskDigest: yield* hashTrialInput(prompt),
              promptPath: prompt,
              commandDigest: native.digest,
              isolationAttestationDigest: (yield* trialArtifact(attestationPath)).digest,
              mounts: [{ source: binary, target: plan.command, digest: native.digest, access: "readonly" }],
            });
            const controls = yield* trialControlsDigest(admittedPlan);
            yield* fs.writeFileString(
              attestationPath,
              yield* TrialIsolationAttestationJson.encode(
                TrialIsolationAttestation.make({ ...attestation, configDigest: controls })
              )
            );
            admittedPlan = TrialPlan.make({
              ...admittedPlan,
              configDigest: controls,
              isolationAttestationDigest: (yield* trialArtifact(attestationPath)).digest,
            });
            const planPath = path.join(root, "plan.json");
            yield* fs.writeFileString(planPath, yield* TrialPlanJson.encode(admittedPlan));
            const receipt = yield* executeTrial(planPath);
            const attempt = yield* TrialAttemptJson.decode(yield* fs.readFileString(receipt));
            expect(attempt.terminal.status).toBe("aborted");
            expect(yield* fs.readFileString(path.join(path.dirname(receipt), "failure.log"))).toContain(
              "network broker"
            );
            expect(yield* fs.exists(path.join(attempt.workspace, "forbidden-launch"))).toBe(false);
            expect(O.isNone(attempt.codingElapsedMs)).toBe(true);
            const stale = yield* buildTrialSandbox(
              TrialPlan.make({ ...admittedPlan, args: ["--changed-control"] }),
              attempt.workspace
            ).pipe(Effect.result);
            expect(stale._tag).toBe("Failure");
            yield* fs.makeDirectory(path.join(root, "alias-parent"));
            for (const source of [
              path.join(admittedPlan.sourceRepository, ".git"),
              path.dirname(receipt),
              `${root}/alias-parent/../source/.git`,
              `${root}//source/.git`,
              `${root}/alias-parent/..`,
            ]) {
              let privatePlan = TrialPlan.make({
                ...admittedPlan,
                mounts: [
                  ...admittedPlan.mounts,
                  { source, target: "/inputs/private", digest: zero, access: "readonly" },
                ],
              });
              const privateControls = yield* trialControlsDigest(privatePlan);
              yield* fs.writeFileString(
                attestationPath,
                yield* TrialIsolationAttestationJson.encode(
                  TrialIsolationAttestation.make({ ...attestation, configDigest: privateControls })
                )
              );
              privatePlan = TrialPlan.make({
                ...privatePlan,
                configDigest: privateControls,
                isolationAttestationDigest: (yield* trialArtifact(attestationPath)).digest,
              });
              const rejected = yield* buildTrialSandbox(privatePlan, attempt.workspace).pipe(Effect.result);
              expect(rejected._tag).toBe("Failure");
              if (rejected._tag === "Failure") expect(String(rejected.failure)).toMatch(/private state|canonical path/);
            }
          })
        ),
      { timeout: 20000 }
    );
    it.effect(
      "rejects missing task checks, cheap proof and unbound legacy full labels",
      () =>
        Effect.scoped(
          Effect.gen(function* () {
            const { fs, path, root, workspace, commit, plan } = yield* setup();
            const artifact = Effect.fn(function* (name: string, text: string) {
              const file = path.join(root, name);
              yield* fs.writeFileString(file, text, { mode: 0o600 });
              return yield* trialArtifact(file);
            });
            const archivePath = path.join(root, "base.tar");
            yield* runSpooledStreams({
              command: "/usr/bin/git",
              args: ["-C", workspace, "archive", "--format=tar", commit],
              stdoutPath: archivePath,
              stderrPath: path.join(root, "archive.stderr"),
              timeout: "10 seconds",
            });
            const archive = yield* trialArtifact(archivePath);
            const bundlePath = path.join(root, "candidate.bundle");
            const bundleResult = yield* runCaptured({
              command: "/usr/bin/git",
              args: ["-C", workspace, "bundle", "create", bundlePath, "HEAD"],
              timeout: "10 seconds",
            });
            expect(bundleResult.exitCode).toBe(0);
            const bundle = yield* trialArtifact(bundlePath);
            const inputBundle = yield* artifact("oracle-bundle", "frozen-fixture-command");
            const frozenPlan = yield* artifact(
              "plan.json",
              yield* TrialPlanJson.encode(
                TrialPlan.make({
                  ...plan,
                  sourceDigest: archive.digest,
                  requiredCheckSpecs: plan.requiredCheckSpecs.map((spec) => ({
                    ...spec,
                    inputBundleDigest: inputBundle.digest,
                  })),
                })
              )
            );
            const stdout = yield* artifact(
              "out.jsonl",
              '{"type":"turn.completed","usage":{"input_tokens":10,"cached_input_tokens":2,"output_tokens":4}}\n'
            );
            const stderr = yield* artifact("err.log", "");
            const diff = yield* artifact("diff", "");
            const usage = yield* parseTrialUsage("codex", yield* fs.readFileString(stdout.path), []);
            const attempt = TrialAttempt.make({
              schemaVersion: "agent-trial-attempt/v1",
              plan: frozenPlan,
              sourceArchive: O.some(archive),
              nativeInvocation: O.none(),
              runId: plan.runId,
              attemptId: plan.attemptId,
              baseCommit: commit,
              workspace,
              elapsedMs: 10,
              setupElapsedMs: O.some(0),
              codingElapsedMs: O.some(10),
              retentionElapsedMs: O.some(0),
              exitCode: O.some(0),
              stdout,
              stderr,
              diff,
              bundle: O.some(bundle),
              indexStates: [],
              usage,
              terminal: { status: "awaiting-proof", finalCommit: commit },
            });
            const retained = yield* artifact("attempt.json", yield* TrialAttemptJson.encode(attempt));
            const runFinalization = Effect.fn(function* (
              name: string,
              tier: "full" | "cheap-gates",
              taskPassed: boolean,
              fingerprint = "96a296d224f285c67bee93c30f8a309157f0daa35dc5b87e410b78630a09cfc7"
            ) {
              const verdict = YeetVerdict.make({
                schemaVersion: "yeet-verdict/v2",
                base: commit,
                branch: "detached",
                committed: false,
                createdAt: "2026-10-09T00:00:00.000Z",
                head: commit,
                lanes: [
                  YeetVerdictLane.make({
                    id: "quality:check",
                    label: "check",
                    phase: "full",
                    status: "passed",
                    exitCode: 0,
                  }),
                ],
                message: "synthetic proof",
                mode: "verify",
                outcome: "success",
                packetPaths: [],
                pushed: false,
                runId: "fixture",
                resolvedHeadSha: O.some(commit),
                proofTier: O.some(tier),
                diffFingerprint: O.some(fingerprint),
              });
              const verdictArtifact = yield* artifact(`${name}-verdict.json`, yield* YeetVerdictJson.encode(verdict));
              const acceptance = TrialAcceptance.make({
                schemaVersion: "agent-trial-acceptance/v1",
                taskDigest: zero,
                acceptanceDigest: zero,
                finalCommit: commit,
                requiredChecks: yield* Effect.forEach(["exports", "behavior"], (id) =>
                  Effect.gen(function* () {
                    const parsedOutcome = yield* artifact(
                      `${name}-${id}-outcome.json`,
                      `{"id":"${id}","passed":${taskPassed},"collected":1,"passedCount":${taskPassed ? 1 : 0},"failedCount":${taskPassed ? 0 : 1},"collectionFailures":0}`
                    );
                    const invocationDigest = yield* hashPublicTextSha256(
                      yield* S.encodeEffect(S.fromJsonString(S.Unknown))({
                        argv: ["fixture", workspace],
                        cwd: workspace,
                        environment: {},
                      })
                    );
                    return {
                      id,
                      passed: taskPassed,
                      inputBundleDigest: inputBundle.digest,
                      inputBundle,
                      bindings: { candidate: workspace, sealed: inputBundle.path, output: path.join(root, "checks") },
                      commandTemplate: ["fixture", "CANDIDATE"],
                      resolvedArgv: ["fixture", workspace],
                      cwd: workspace,
                      filteredEnvironment: {},
                      invocationDigest,
                      headBefore: commit,
                      headAfter: commit,
                      fingerprintBefore: Sha256Hex.make(
                        "96a296d224f285c67bee93c30f8a309157f0daa35dc5b87e410b78630a09cfc7"
                      ),
                      fingerprintAfter: Sha256Hex.make(
                        "96a296d224f285c67bee93c30f8a309157f0daa35dc5b87e410b78630a09cfc7"
                      ),
                      exitCode: taskPassed ? 0 : 1,
                      stdout,
                      stderr,
                      parsedOutcome,
                      collected: 1,
                      passedCount: taskPassed ? 1 : 0,
                      failedCount: taskPassed ? 0 : 1,
                      collectionFailures: 0,
                    };
                  })
                ),
              });
              const acceptanceArtifact = yield* artifact(
                `${name}-acceptance.json`,
                yield* TrialAcceptanceJson.encode(acceptance)
              );
              const proof = TrialProof.make({
                schemaVersion: "agent-trial-proof/v1",
                attempt: retained,
                finalCommit: commit,
                verdict: verdictArtifact,
                acceptance: acceptanceArtifact,
                requiredLaneIds: ["quality:check"],
                yeetExitCode: 0,
              });
              const proofArtifact = yield* artifact(`${name}-proof.json`, yield* TrialProofJson.encode(proof));
              const output = yield* finalizeTrial(retained.path, proofArtifact.path);
              const report = yield* TrialFinalizationJson.decode(yield* fs.readFileString(output));
              // Preserve all failed outcomes under their own immutable test evidence name.
              yield* fs.rename(output, path.join(root, `${name}-finalization.json`));
              return report;
            });
            const incomplete = yield* runFinalization("missing-api", "full", false);
            expect(incomplete.status).toBe("failed");
            expect(O.isNone(incomplete.benchmark)).toBe(true);
            const cheap = yield* runFinalization("cheap", "cheap-gates", true);
            expect(cheap.status).toBe("failed");
            expect(O.isNone(cheap.benchmark)).toBe(true);
            const dirtyProof = yield* runFinalization("dirty-proof", "full", true, zero);
            expect(dirtyProof.status).toBe("failed");
            expect(O.isNone(dirtyProof.benchmark)).toBe(true);
            expect(
              S.is(TrialAcceptance)({
                schemaVersion: "agent-trial-acceptance/v1",
                taskDigest: zero,
                acceptanceDigest: zero,
                finalCommit: commit,
                requiredChecks: [{ id: "exports", passed: true }],
              })
            ).toBe(false);
            const complete = yield* runFinalization("full", "full", true);
            expect(complete.status).toBe("failed");
            expect(complete.failures).toContain("Full Yeet invocation and contract collection are missing or differ");
            expect(complete.protocolCompliance).toBe("unknown");
            expect(O.isNone(complete.benchmark)).toBe(true);
            yield* fs.writeFileString(stdout.path, "tampered");
            const changed = yield* finalizeTrial(retained.path, path.join(root, "full-proof.json")).pipe(Effect.result);
            expect(changed._tag).toBe("Failure");
          })
        ),
      { timeout: 20000 }
    );
    it.effect(
      "runs the pinned local compiler inside the empty-root evaluator view",
      () =>
        Effect.scoped(
          Effect.gen(function* () {
            const { fs, path, root, workspace } = yield* setup();
            const compiler = yield* fs.realPath(
              path.resolve("../../../../node_modules/@effect/tsgo-linux-x64/lib/tsc")
            );
            const libraries = yield* fs.realPath(path.resolve("../../../../node_modules/typescript/lib"));
            const sandbox = yield* trialGitSandbox(workspace, []);
            const divider = sandbox.indexOf("--");
            const command = [
              ...sandbox.slice(0, divider),
              "--ro-bind",
              compiler,
              "/runtime/tsgo",
              "--ro-bind",
              libraries,
              "/runtime/tslib",
              "--",
              "/runtime/tsgo",
              "--ignoreConfig",
              "--noEmit",
              "--noLib",
              "/runtime/tslib/lib.es5.d.ts",
              "/workspace/answer.ts",
            ];
            const code = yield* runSpooledStreams({
              command: "/usr/bin/bwrap",
              args: command,
              env: {},
              extendEnv: false,
              stdoutPath: path.join(root, "compiler.stdout"),
              stderrPath: path.join(root, "compiler.stderr"),
              timeout: "10 seconds",
            });
            expect(code).toBe(0);
            yield* fs.writeFileString(path.join(workspace, "answer.ts"), "export const answer: number = 'wrong'\n");
            const red = yield* runSpooledStreams({
              command: "/usr/bin/bwrap",
              args: command,
              env: {},
              extendEnv: false,
              stdoutPath: path.join(root, "compiler-red.stdout"),
              stderrPath: path.join(root, "compiler-red.stderr"),
              timeout: "10 seconds",
            });
            expect(red).not.toBe(0);
            expect(yield* fs.readFileString(path.join(root, "compiler-red.stdout"))).toContain("TS2322");
          })
        ),
      { timeout: 20000 }
    );
    it.effect(
      "retains a partial candidate after a synthetic process timeout",
      () =>
        Effect.scoped(
          Effect.gen(function* () {
            const { fs, path, root, workspace, commit } = yield* setup();
            const shell = yield* trialGitSandbox(workspace, []);
            const divider = shell.indexOf("--");
            const args = [
              ...shell.slice(0, divider + 1),
              "/bin/sh",
              "-c",
              "printf 'export const partial = 1\\n' > /workspace/partial.ts; trap '' TERM; sleep 5",
            ];
            const interrupted = yield* runSpooledStreams({
              command: "/usr/bin/bwrap",
              args,
              extendEnv: false,
              env: {},
              stdoutPath: path.join(root, "partial.stdout"),
              stderrPath: path.join(root, "partial.stderr"),
              timeout: "150 millis",
              forceKillAfter: "100 millis",
            }).pipe(Effect.result);
            expect(interrupted._tag).toBe("Failure");
            const receipts = path.join(root, "partial-receipts");
            yield* fs.makeDirectory(receipts);
            const retained = yield* retainTrialCandidate(workspace, commit, receipts);
            expect(O.isSome(retained)).toBe(true);
            expect(yield* fs.readFileString(path.join(receipts, "candidate.diff"))).toContain("partial.ts");
            expect(yield* fs.exists(path.join(receipts, "candidate.bundle"))).toBe(true);
            const clean = yield* inspectTrialGit(workspace, ["status", "--porcelain"]);
            expect(clean.exitCode).toBe(0);
            expect(clean.output).toBe("");
          })
        ),
      { timeout: 20000 }
    );
    it.effect(
      "contains poisoned Git pointers in an offline evaluator namespace",
      () =>
        Effect.scoped(
          Effect.gen(function* () {
            const { fs, path, workspace, root, commit } = yield* setup();
            const victim = yield* fs.makeTempDirectoryScoped({ directory: path.dirname(root) });
            yield* fs.makeDirectory(path.join(victim, "objects"));
            yield* fs.rename(path.join(workspace, ".git/objects"), path.join(workspace, ".git/objects-original"));
            yield* fs.symlink(path.join(victim, "objects"), path.join(workspace, ".git/objects"));
            const poisoned = yield* inspectTrialGit(workspace, ["cat-file", "-p", commit]);
            expect(poisoned.exitCode).not.toBe(0);
            yield* fs.remove(path.join(workspace, ".git/objects"));
            yield* fs.rename(path.join(workspace, ".git/objects-original"), path.join(workspace, ".git/objects"));
            yield* fs.writeFileString(path.join(workspace, ".git/commondir"), `${victim}\n`);
            const common = yield* inspectTrialGit(workspace, ["rev-parse", "HEAD"]);
            expect(common.exitCode).not.toBe(0);
            expect(yield* fs.readDirectory(path.join(victim, "objects"))).toEqual([]);
          })
        ),
      { timeout: 20000 }
    );
    it.effect("reconstructs the committed tree without ignored model-only implementation", () =>
      Effect.scoped(
        Effect.gen(function* () {
          const { fs, path, root, workspace, commit } = yield* setup();
          const ignored = path.join(workspace, "ignored-module.ts");
          yield* fs.writeFileString(path.join(workspace, ".gitignore"), "ignored-module.ts\n");
          yield* fs.writeFileString(ignored, "export const hidden = 42\n");
          const retained = yield* retainTrialCandidate(workspace, commit, root);
          expect(O.isSome(retained)).toBe(true);
          if (O.isNone(retained)) return;
          const fresh = yield* reconstructTrialSource(
            path.join(root, "evaluation"),
            retained.value.bundle,
            O.none(),
            retained.value.finalCommit,
            commit
          );
          expect(yield* fs.exists(path.join(fresh.workspace, "ignored-module.ts"))).toBe(false);
          expect(yield* fs.readFileString(path.join(fresh.workspace, "answer.ts"))).toContain("42");
          expect(fresh.finalCommit).toBe(retained.value.finalCommit);
          const sealed = path.join(root, "sealed");
          yield* fs.makeDirectory(sealed);
          const script = path.join(sealed, "check.py");
          yield* fs.writeFileString(
            script,
            "import json,pathlib,sys\nassert not pathlib.Path('/workspace/ignored-module.ts').exists()\nr={'schemaVersion':'public-export-gate/v1','collected':1,'passed':1,'failed':0,'collectionFailures':0,'outcome':'passed'}\npathlib.Path(sys.argv[1]).write_text(json.dumps(r))\nprint('collected from fresh source')\n"
          );
          const files = { "check.py": yield* hashTrialInput(script) };
          const digest = yield* hashPublicTextSha256(
            yield* S.encodeEffect(S.fromJsonString(S.Unknown))({ files, symlinks: {} })
          );
          const check = TrialEvaluatorCheck.make({
            id: "exports",
            kind: "public-exports",
            commandTemplate: ["/usr/bin/python3", "SEALED/check.py", "OUTPUT/report.json"],
            environmentTemplate: {},
            input: TrialInputInventory.make({ root: sealed, digest, files, symlinks: {} }),
            expectedCases: [],
            expectedPackage: O.none(),
            reportRelativePath: O.some("report.json"),
            writableCacheTargets: [],
            compilerOverlay: O.none(),
            timeoutMs: 10000,
          });
          const collected = yield* executeTrialCheck(fresh.source, check, [], path.join(root, "check-output"));
          expect(collected.passed).toBe(true);
          expect(collected.resolvedArgv).toEqual(["/usr/bin/python3", "/sealed/check.py", "/output/report.json"]);
          expect(yield* fs.readFileString(collected.stdout.path)).toContain("collected from fresh source");

          const replay = yield* reconstructTrialSource(
            path.join(root, "evaluation"),
            retained.value.bundle,
            O.none(),
            retained.value.finalCommit,
            commit
          ).pipe(Effect.result);
          expect(replay._tag).toBe("Failure");
        })
      )
    );
    it.effect("scopes the broker process and socket without persisting a native bridge", () =>
      Effect.scoped(
        Effect.gen(function* () {
          const { fs, path, root } = yield* setup();
          const broker = path.join(root, "broker.py");
          yield* fs.writeFileString(
            broker,
            "import argparse,socket,time\np=argparse.ArgumentParser()\np.add_argument('--socket');p.add_argument('--policy');p.add_argument('--events');p.add_argument('--max-seconds');a=p.parse_args()\ns=socket.socket(socket.AF_UNIX);s.bind(a.socket);s.listen()\nprint('ready',flush=True)\nwhile True:\n c,_=s.accept();c.recv(4096);c.sendall(b'HTTP/1.1 403 Forbidden\\r\\n\\r\\n');c.close()\n"
          );
          const policy = path.join(root, "policy.json");
          yield* fs.writeFileString(policy, '{"example.com:443":{}}');
          const artifact = yield* trialArtifact(broker);
          const profile = TrialProductiveProfile.make({
            schemaVersion: "agent-trial-productive-profile/v1",
            broker: TrialBrokerControl.make({
              program: artifact,
              interpreter: yield* trialArtifact(yield* fs.realPath("/usr/bin/python3")),
              relay: yield* trialArtifact(yield* fs.realPath("/usr/bin/socat")),
              policy: yield* trialArtifact(policy),
              canaries: artifact,
              authorities: ["example.com:443"],
              maxSeconds: 10,
            }),
            childPolicy: TrialNativeChildPolicy.make({
              capability: "native-common",
              expectedModel: "gpt-6.1-sol",
              expectedEffort: "medium",
              enforcement: "instructed-observed",
              usageCoverage: "host-only-children-unknown",
              inheritedScope: "same-arm-filesystem-network-tools-budget",
              shellReinvocationCoverage: "unknown",
            }),
            nativeSurface: artifact,
            profileCanaries: artifact,
            allowedNativeToolNames: ["command_execution"],
            commonGuidance: [artifact],
            referenceInputs: [artifact],
            assignedHooks: "none",
            authentication: "readonly-owned-subscription",
            authLauncher: O.none(),
            authSource: O.none(),
          });
          const receipts = path.join(root, "broker-receipts");
          yield* fs.makeDirectory(receipts);
          const socket = yield* Effect.scoped(
            Effect.gen(function* () {
              const owned = yield* startTrialBroker(profile, receipts);
              const response = yield* runCaptured({
                command: "/usr/bin/python3",
                args: [
                  "-c",
                  "import socket,sys;s=socket.socket(socket.AF_UNIX);s.connect(sys.argv[1]);s.sendall(b'CONNECT denied.invalid:443 HTTP/1.1\\r\\n\\r\\n');print(s.recv(4096).decode())",
                  owned,
                ],
                env: {},
                extendEnv: false,
                timeout: "5 seconds",
              });
              expect(response.exitCode).toBe(0);
              expect(response.output).toContain("403 Forbidden");
              return owned;
            })
          );
          expect(yield* fs.exists(socket)).toBe(false);
          expect(yield* fs.readFileString(path.join(receipts, "broker/stdout.log"))).toContain("ready");
          yield* fs.writeFileString(policy, '{"example.com:443":{"fixture":true,"fixturePort":1}}');
          const rejected = yield* startTrialBroker(profile, path.join(root, "other-receipts")).pipe(Effect.result);
          expect(rejected._tag).toBe("Failure");
        })
      )
    );
    it.effect("detects changed frozen trees and rejects escaping dependency symlinks", () =>
      Effect.scoped(
        Effect.gen(function* () {
          const { fs, path, root } = yield* setup();
          const directory = path.join(root, "runtime");
          yield* fs.makeDirectory(directory);
          yield* fs.writeFileString(path.join(directory, "binary"), "one");
          const before = yield* hashTrialInput(directory);
          yield* fs.writeFileString(path.join(directory, "binary"), "two");
          expect(yield* hashTrialInput(directory)).not.toBe(before);
          yield* fs.symlink(path.join(root, "source/answer.ts"), path.join(directory, "escape"));
          const escaped = yield* hashTrialInput(directory).pipe(Effect.result);
          expect(escaped._tag).toBe("Failure");
        })
      )
    );
  }
);
