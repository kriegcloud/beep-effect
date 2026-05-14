#!/usr/bin/env bun

/**
 * Operator-facing artifact capture wrapper for the P1 Manual Mode proof.
 *
 * @internal
 * @packageDocumentation
 * @since 0.0.0
 */

import { AiProviderCli } from "@beep/ai-provider-cli";
import { Discord } from "@beep/discord";
import { P1ManualProofRequest, P1ManualProofResult } from "@beep/installer-workspace-use-cases";
import { OnePasswordCli } from "@beep/onepassword-cli";
import { Sha256HexFromBytes } from "@beep/schema/Sha256";
import { BunChildProcessSpawner, BunHttpClient, BunRuntime, BunServices } from "@effect/platform-bun";
import { Effect, FileSystem, Layer, Order, Path, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { P1ManualProofSliceLayer, runP1ManualProof } from "./P1ManualProof.js";

const PROOF_FILE_NAME = "proof.json";
const COMMANDS_FILE_NAME = "commands.txt";
const CHECKSUMS_FILE_NAME = "sha256sums.txt";
const P1_REQUIRED_PLATFORMS = ["macos", "windows"] as const;

type P1RequiredPlatform = (typeof P1_REQUIRED_PLATFORMS)[number];

const decodeRequestJson = S.decodeUnknownEffect(S.fromJsonString(P1ManualProofRequest));
const decodeProofJson = S.decodeUnknownEffect(S.fromJsonString(P1ManualProofResult));
const encodeProofResult = S.encodeUnknownEffect(S.fromJsonString(P1ManualProofResult));
const decodeSha256HexFromBytes = S.decodeUnknownEffect(Sha256HexFromBytes);

const BaseLayer = Layer.mergeAll(BunServices.layer, BunHttpClient.layer);
const DriverLayer = Layer.mergeAll(OnePasswordCli.makeLayer(), AiProviderCli.makeLayer(), Discord.layer).pipe(
  Layer.provideMerge(BunChildProcessSpawner.layer),
  Layer.provideMerge(BaseLayer)
);
const RuntimeLayer = Layer.mergeAll(BaseLayer, P1ManualProofSliceLayer.pipe(Layer.provideMerge(DriverLayer)));

const argAfter = (name: string): O.Option<string> =>
  pipe(
    Bun.argv,
    A.findFirstIndex((value) => value === name),
    O.flatMap((index) => A.get(Bun.argv, index + 1))
  );

const hasArg = (name: string): boolean =>
  pipe(
    Bun.argv,
    A.findFirstIndex((value) => value === name),
    O.isSome
  );

const shellQuote = (value: string): string => `'${Str.replaceAll("'", "'\"'\"'")(value)}'`;

const resolveDefaultOutputDir = Effect.fn("StackInstaller.resolveDefaultOutputDir")(function* (
  request: P1ManualProofRequest
) {
  const path = yield* Path.Path;
  const outputRoot = yield* resolveDefaultOutputRoot;

  return path.join(outputRoot, request.targetPlatform);
});

const resolveDefaultOutputRoot = Effect.gen(function* () {
  const path = yield* Path.Path;

  return path.resolve(import.meta.dirname, "..", "..", "..", "..", "output", "stack-installer", "p1-live");
});

/**
 * Build the operator command transcript stored as `commands.txt`.
 *
 * @internal
 * @category proof
 * @since 0.0.0
 */
export const buildP1ProofCommandsText = (
  request: P1ManualProofRequest,
  requestJson: string,
  outputDir: string
): string =>
  A.join("\n")([
    "# Stack Installer P1 Manual Mode proof commands",
    "# This transcript records the commands required for the fresh-machine proof.",
    "# Inputs must contain only 1Password references, never plaintext secrets.",
    `targetPlatform=${request.targetPlatform}`,
    `operatorLabel=${request.operatorLabel}`,
    `outputDir=${outputDir}`,
    "",
    "git status --short --branch",
    "bun install",
    "bun run config-sync:check",
    "(cd apps/stack-installer && bun run build)",
    "(cd apps/stack-installer/src-tauri && cargo check)",
    "command -v op",
    "command -v claude",
    "command -v codex",
    "op whoami",
    "claude auth status",
    "codex login status",
    `(cd apps/stack-installer && bun run p1:proof:capture -- --request-json ${shellQuote(requestJson)} --output-dir ${shellQuote(outputDir)})`,
    "",
    "# After recording screencast.*, refresh checksums without re-sending the Discord proof message:",
    `(cd apps/stack-installer && bun run p1:proof:checksums -- --output-dir ${shellQuote(outputDir)})`,
    `(cd apps/stack-installer && bun run p1:proof:audit -- --output-dir ${shellQuote(outputDir)})`,
    "",
  ]);

const isEvidenceFileName = (name: string): boolean =>
  name === PROOF_FILE_NAME || name === COMMANDS_FILE_NAME || Str.startsWith("screencast.")(name);

const hasEvidenceFile = (fileNames: ReadonlyArray<string>, fileName: string): boolean =>
  pipe(
    fileNames,
    A.findFirst((name) => name === fileName),
    O.isSome
  );

const hasPassedValidationEvent = (
  events: ReadonlyArray<P1ManualProofResult["snapshot"]["validationEvents"][number]>,
  id: string
): boolean =>
  pipe(
    events,
    A.some((event) => event.id === id && event.status === "passed")
  );

const hasConfiguredProvider = (proof: P1ManualProofResult, providerName: "claude" | "codex"): boolean =>
  pipe(
    proof.snapshot.manifest.providers,
    A.some((provider) => provider.provider === providerName && provider.status === "configured")
  );

const requireAudit = (condition: boolean, message: string): Effect.Effect<void> =>
  condition ? Effect.void : Effect.die(message);

const evidenceFileNames = Effect.fn("StackInstaller.evidenceFileNames")(function* (outputDir: string) {
  const fs = yield* FileSystem.FileSystem;
  const outputDirExists = yield* fs.exists(outputDir).pipe(Effect.orElseSucceed(() => false));

  yield* requireAudit(outputDirExists, `Missing P1 proof artifact directory: ${outputDir}`);

  return pipe(yield* fs.readDirectory(outputDir), A.filter(isEvidenceFileName), A.sort(Order.String));
});

const sha256File = Effect.fn("StackInstaller.sha256File")(function* (filePath: string) {
  const fs = yield* FileSystem.FileSystem;
  const data = yield* fs.readFile(filePath);

  return yield* decodeSha256HexFromBytes(data);
});

const buildSha256SumsText = Effect.fn("StackInstaller.buildSha256SumsText")(function* (outputDir: string) {
  const path = yield* Path.Path;
  const fileNames = yield* evidenceFileNames(outputDir);
  const rows = yield* Effect.forEach(
    fileNames,
    (fileName) =>
      pipe(
        sha256File(path.join(outputDir, fileName)),
        Effect.map((digest) => `${digest}  ${fileName}`)
      ),
    { concurrency: A.length(fileNames) }
  );

  return `${A.join("\n")(rows)}\n`;
});

const refreshChecksums = Effect.fn("StackInstaller.refreshChecksums")(function* (outputDir: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const checksums = yield* buildSha256SumsText(outputDir);

  yield* fs.writeFileString(path.join(outputDir, CHECKSUMS_FILE_NAME), checksums);
});

const auditProofArtifacts = Effect.fn("StackInstaller.auditProofArtifacts")(function* (
  outputDir: string,
  expectedPlatform: O.Option<P1RequiredPlatform>
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const fileNames = yield* evidenceFileNames(outputDir);

  yield* requireAudit(hasEvidenceFile(fileNames, PROOF_FILE_NAME), "Missing proof.json");
  yield* requireAudit(hasEvidenceFile(fileNames, COMMANDS_FILE_NAME), "Missing commands.txt");
  yield* requireAudit(pipe(fileNames, A.some(Str.startsWith("screencast."))), "Missing screencast.* artifact");

  const proofJson = yield* fs.readFileString(path.join(outputDir, PROOF_FILE_NAME));
  const proof = yield* decodeProofJson(proofJson);
  const recordedChecksums = yield* fs.readFileString(path.join(outputDir, CHECKSUMS_FILE_NAME));
  const expectedChecksums = yield* buildSha256SumsText(outputDir);
  const expectedPlatformMessage = pipe(
    expectedPlatform,
    O.map((platform) => `Proof target platform must be ${platform}`),
    O.getOrElse(() => "Proof target platform must match requested platform")
  );

  yield* requireAudit(recordedChecksums === expectedChecksums, "sha256sums.txt is stale or incomplete");
  yield* requireAudit(proof.snapshot.manifest.dryRunOnly === false, "Proof manifest must not be dry-run-only");
  yield* requireAudit(pipe(proof.snapshot.validationEvents, A.length) > 0, "Proof must contain validation events");
  yield* requireAudit(
    pipe(
      proof.snapshot.validationEvents,
      A.every((event) => event.status === "passed")
    ),
    "All proof validation events must pass"
  );
  yield* requireAudit(hasConfiguredProvider(proof, "claude"), "Claude provider must be configured");
  yield* requireAudit(hasConfiguredProvider(proof, "codex"), "Codex provider must be configured");
  yield* requireAudit(
    hasPassedValidationEvent(proof.snapshot.validationEvents, "onepassword-discord-token-reference"),
    "1Password Discord token reference validation must pass"
  );
  yield* pipe(
    expectedPlatform,
    O.match({
      onNone: () => Effect.void,
      onSome: (platform) => requireAudit(proof.snapshot.manifest.targetPlatform === platform, expectedPlatformMessage),
    })
  );
  yield* requireAudit(
    pipe(proof.snapshot.manifest.credentialReferences, A.every(Str.startsWith("op://"))),
    "Proof manifest credential references must all be 1Password references"
  );
  yield* requireAudit(
    pipe(
      proof.snapshot.validationEvents,
      A.some(
        (event) =>
          event.id === "discord-test-message" && event.status === "passed" && Str.includes("Message ID:")(event.message)
      )
    ),
    "Proof must include a passed Discord test-message event with a message ID"
  );

  return `P1 proof artifact audit passed for ${proof.snapshot.manifest.targetPlatform} with ${A.length(fileNames)} evidence files.`;
});

const auditAllProofArtifacts = Effect.fn("StackInstaller.auditAllProofArtifacts")(function* (outputRoot: string) {
  const path = yield* Path.Path;
  const messages = yield* Effect.forEach(
    P1_REQUIRED_PLATFORMS,
    (platform) => auditProofArtifacts(path.join(outputRoot, platform), O.some(platform)),
    { concurrency: A.length(P1_REQUIRED_PLATFORMS) }
  );

  return A.join("\n")([...messages, `P1 proof artifact audit passed for all required platforms in ${outputRoot}.`]);
});

const captureProofArtifacts = Effect.fn("StackInstaller.captureProofArtifacts")(function* (
  request: P1ManualProofRequest,
  requestJson: string,
  outputDir: string
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const result = yield* runP1ManualProof(request);
  const proofJson = yield* encodeProofResult(result);
  const commandsText = buildP1ProofCommandsText(request, requestJson, outputDir);

  yield* fs.makeDirectory(outputDir, { recursive: true });
  yield* fs.writeFileString(path.join(outputDir, PROOF_FILE_NAME), `${proofJson}\n`);
  yield* fs.writeFileString(path.join(outputDir, COMMANDS_FILE_NAME), commandsText);
  yield* refreshChecksums(outputDir);

  return `P1 proof artifacts captured in ${outputDir}`;
});

const captureMode = Effect.gen(function* () {
  const requestJson = yield* O.match(argAfter("--request-json"), {
    onNone: () => Effect.die("Missing --request-json"),
    onSome: Effect.succeed,
  });
  const request = yield* decodeRequestJson(requestJson);
  const defaultOutputDir = yield* resolveDefaultOutputDir(request);
  const outputDir = pipe(
    argAfter("--output-dir"),
    O.getOrElse(() => defaultOutputDir)
  );

  return yield* captureProofArtifacts(request, requestJson, outputDir);
});

const checksumOnlyMode = Effect.gen(function* () {
  const outputDir = yield* O.match(argAfter("--output-dir"), {
    onNone: () => Effect.die("Missing --output-dir for --checksums-only"),
    onSome: Effect.succeed,
  });

  yield* refreshChecksums(outputDir);

  return `P1 proof checksums refreshed in ${outputDir}`;
});

const auditOnlyMode = Effect.gen(function* () {
  const outputDir = yield* O.match(argAfter("--output-dir"), {
    onNone: () => Effect.die("Missing --output-dir for --audit-only"),
    onSome: Effect.succeed,
  });

  return yield* auditProofArtifacts(outputDir, O.none());
});

const auditAllMode = Effect.gen(function* () {
  const defaultOutputRoot = yield* resolveDefaultOutputRoot;
  const outputRoot = pipe(
    argAfter("--output-root"),
    O.getOrElse(() => defaultOutputRoot)
  );

  return yield* auditAllProofArtifacts(outputRoot);
});

const program = pipe(
  hasArg("--audit-all")
    ? auditAllMode
    : hasArg("--audit-only")
      ? auditOnlyMode
      : hasArg("--checksums-only")
        ? checksumOnlyMode
        : captureMode,
  Effect.tap((message) =>
    Effect.sync(() => {
      console.log(message);
    })
  ),
  // @effect-diagnostics-next-line strictEffectProvide:off
  Effect.provide(RuntimeLayer)
);

BunRuntime.runMain(program);
