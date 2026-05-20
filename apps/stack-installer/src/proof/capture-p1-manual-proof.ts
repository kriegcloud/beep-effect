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
import { Console, Duration, Effect, Exit, FileSystem, Layer, Order, Path, pipe, RegExp as Rx, Stream } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { ChildProcess, ChildProcessSpawner } from "effect/unstable/process";
import { P1ManualProofSliceLayer, runP1ManualProof } from "./P1ManualProof.js";
import {
  CHECKSUMS_FILE_NAME,
  COMMANDS_FILE_NAME,
  isP1ProofArtifactStatusFileName,
  isP1ProofEvidenceFileName,
  P1_REQUIRED_PLATFORMS,
  type P1RequiredPlatform,
  PROOF_FILE_NAME,
  p1ProofBundleExtractionCommand,
  p1ProofBundleExtractionProcess,
  p1ProofBundleFileNameForPlatform,
  p1ProofBundleListingProcess,
  p1ProofMissingRequiredArtifactFiles,
} from "./P1ProofArtifacts.js";
import { buildP1ProofCommandsText, p1ProofCommandsTextMatchesPlatform } from "./P1ProofCommands.js";

const DISCORD_TOKEN_PATTERNS = [
  Rx.RegExp("mfa\\.[A-Za-z0-9_-]{80,}"),
  Rx.RegExp("[A-Za-z0-9_-]{23,28}\\.[A-Za-z0-9_-]{6,10}\\.[A-Za-z0-9_-]{27,}"),
] as const;

const decodeRequestJson = S.decodeUnknownEffect(S.fromJsonString(P1ManualProofRequest));
const decodeProofJson = S.decodeUnknownEffect(S.fromJsonString(P1ManualProofResult));
const encodeProofResult = S.encodeUnknownEffect(S.fromJsonString(P1ManualProofResult));
const decodeSha256HexFromBytes = S.decodeUnknownEffect(Sha256HexFromBytes);

const BaseLayer = Layer.mergeAll(BunServices.layer, BunHttpClient.layer);
const DriverLayer = Layer.mergeAll(OnePasswordCli.makeLayer(), AiProviderCli.makeLayer(), Discord.layer).pipe(
  Layer.provideMerge(BunChildProcessSpawner.layer),
  Layer.provideMerge(BaseLayer)
);
const ProcessLayer = BunChildProcessSpawner.layer.pipe(Layer.provideMerge(BaseLayer));
const SliceRuntimeLayer = P1ManualProofSliceLayer.pipe(Layer.provideMerge(DriverLayer), Layer.provideMerge(BaseLayer));
const RuntimeLayer = Layer.mergeAll(ProcessLayer, SliceRuntimeLayer);
const provideScopedLayer =
  <ROut, E2, RIn>(layer: Layer.Layer<ROut, E2, RIn>) =>
  <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E | E2, RIn | Exclude<R, ROut>> =>
    Effect.scoped(Layer.build(layer).pipe(Effect.flatMap((context) => effect.pipe(Effect.provide(context)))));

const collectText = <E>(stream: Stream.Stream<Uint8Array, E>): Effect.Effect<string, E> =>
  stream.pipe(
    Stream.decodeText(),
    Stream.runFold(
      () => "",
      (acc, chunk) => `${acc}${chunk}`
    )
  );

const runNativeProcess = Effect.fn("StackInstaller.runNativeProcess")(function* (process: {
  readonly args: ReadonlyArray<string>;
  readonly command: string;
}) {
  return yield* Effect.scoped(
    Effect.gen(function* () {
      const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
      const handle = yield* spawner.spawn(
        ChildProcess.make(process.command, A.fromIterable(process.args), {
          stderr: "pipe",
          stdin: "ignore",
          stdout: "pipe",
        })
      );

      return yield* Effect.all([collectText(handle.stdout), collectText(handle.stderr), handle.exitCode], {
        concurrency: "unbounded",
      });
    })
  );
});

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

const positiveIntegerArg = (name: string, fallback: number): number =>
  pipe(
    argAfter(name),
    O.flatMap((value) => {
      const parsed = Number.parseInt(value, 10);

      return Number.isInteger(parsed) && parsed > 0 ? O.some(parsed) : O.none();
    }),
    O.getOrElse(() => fallback)
  );

const resolveDefaultOutputDir = Effect.fn("StackInstaller.resolveDefaultOutputDir")(function* (
  request: P1ManualProofRequest
) {
  return yield* resolvePlatformOutputDir(request.targetPlatform);
});

const resolveDefaultOutputRoot = Effect.gen(function* () {
  const path = yield* Path.Path;

  return path.resolve(import.meta.dirname, "..", "..", "..", "..", "output", "stack-installer", "p1-live");
});

const resolvePlatformOutputDir = Effect.fn("StackInstaller.resolvePlatformOutputDir")(function* (platform: string) {
  const path = yield* Path.Path;
  const outputRoot = yield* resolveDefaultOutputRoot;

  return path.join(outputRoot, platform);
});

const requiredPlatformFromArg = (rawPlatform: string): O.Option<P1RequiredPlatform> =>
  pipe(
    P1_REQUIRED_PLATFORMS,
    A.findFirst((platform) => platform === rawPlatform)
  );

const resolveArtifactModeTarget = Effect.fn("StackInstaller.resolveArtifactModeTarget")(function* (modeName: string) {
  const outputDir = argAfter("--output-dir");
  const platform = argAfter("--platform");

  if (O.isSome(outputDir)) {
    return {
      expectedPlatform: O.none<P1RequiredPlatform>(),
      outputDir: outputDir.value,
    };
  }

  const rawPlatform = yield* O.match(platform, {
    onNone: () => Effect.die(`Missing --output-dir or --platform for ${modeName}`),
    onSome: Effect.succeed,
  });
  const requiredPlatform = yield* O.match(requiredPlatformFromArg(rawPlatform), {
    onNone: () => Effect.die(`Invalid --platform for ${modeName}: ${rawPlatform}`),
    onSome: Effect.succeed,
  });
  const resolvedOutputDir = yield* resolvePlatformOutputDir(requiredPlatform);

  return {
    expectedPlatform: O.some(requiredPlatform),
    outputDir: resolvedOutputDir,
  };
});

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

const containsLikelyDiscordToken = (value: string): boolean =>
  pipe(
    DISCORD_TOKEN_PATTERNS,
    A.some((pattern) => pattern.test(value))
  );

const artifactFileNames = Effect.fn("StackInstaller.artifactFileNames")(function* (outputDir: string) {
  const fs = yield* FileSystem.FileSystem;
  const outputDirExists = yield* fs.exists(outputDir).pipe(Effect.orElseSucceed(() => false));

  yield* requireAudit(outputDirExists, `Missing P1 proof artifact directory: ${outputDir}`);

  return pipe(yield* fs.readDirectory(outputDir), A.sort(Order.String));
});

const evidenceFileNames = Effect.fn("StackInstaller.evidenceFileNames")(function* (outputDir: string) {
  return pipe(yield* artifactFileNames(outputDir), A.filter(isP1ProofEvidenceFileName));
});

const missingRequiredPlatformDirectories = Effect.fn("StackInstaller.missingRequiredPlatformDirectories")(function* (
  outputRoot: string
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const missing = yield* Effect.forEach(
    P1_REQUIRED_PLATFORMS,
    (platform) => {
      const outputDir = path.join(outputRoot, platform);

      return pipe(
        fs.exists(outputDir),
        Effect.orElseSucceed(() => false),
        Effect.map((exists) => (exists ? O.none<string>() : O.some(outputDir)))
      );
    },
    { concurrency: A.length(P1_REQUIRED_PLATFORMS) }
  );

  return A.getSomes(missing);
});

const platformArtifactStatus = Effect.fn("StackInstaller.platformArtifactStatus")(function* (
  outputRoot: string,
  platform: P1RequiredPlatform
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const outputDir = path.join(outputRoot, platform);
  const bundlePath = path.join(outputRoot, p1ProofBundleFileNameForPlatform(platform));
  const outputDirExists = yield* fs.exists(outputDir).pipe(Effect.orElseSucceed(() => false));
  const bundleExists = yield* fs.exists(bundlePath).pipe(Effect.orElseSucceed(() => false));
  const bundleMessage = bundleExists
    ? `\n  bundle: ${bundlePath}\n  extract: ${p1ProofBundleExtractionCommand(platform, { bundlePath, outputRoot })}`
    : "";

  if (!outputDirExists) {
    return `- ${platform}: missing directory\n  dir: ${outputDir}${bundleMessage}`;
  }

  const fileNames = pipe(yield* fs.readDirectory(outputDir), A.sort(Order.String));
  const missingFileNames = p1ProofMissingRequiredArtifactFiles(fileNames);
  const status = A.isReadonlyArrayNonEmpty(missingFileNames)
    ? `incomplete; missing ${A.join(", ")(missingFileNames)}`
    : "required files present";
  const statusFileNames = pipe(fileNames, A.filter(isP1ProofArtifactStatusFileName));
  const visibleFiles = A.isReadonlyArrayNonEmpty(statusFileNames) ? A.join(", ")(statusFileNames) : "none";

  return `- ${platform}: ${status}\n  dir: ${outputDir}\n  files: ${visibleFiles}${bundleMessage}`;
});

const proofArtifactStatus = Effect.fn("StackInstaller.proofArtifactStatus")(function* (outputRoot: string) {
  const platformMessages = yield* Effect.forEach(
    P1_REQUIRED_PLATFORMS,
    (platform) => platformArtifactStatus(outputRoot, platform),
    { concurrency: A.length(P1_REQUIRED_PLATFORMS) }
  );

  return A.join("\n")([
    `P1 proof artifact status for ${outputRoot}`,
    ...platformMessages,
    "Next required gate: bun run p1:proof:audit-all after both platform directories contain proof.json, commands.txt, sha256sums.txt, and screencast.*.",
  ]);
});

const normalizeBundleEntry = (entry: string): string => {
  const trimmed = pipe(entry, Str.trim, Str.replaceAll("\\", "/"));

  return Str.endsWith("/")(trimmed) ? Str.slice(0, -1)(trimmed) : trimmed;
};

const isSafeBundleEntry = (platform: P1RequiredPlatform, entry: string): boolean => {
  const normalized = normalizeBundleEntry(entry);
  const segments = Str.split("/")(normalized);
  const firstSegment = A.head(segments);

  return (
    Str.isNonEmpty(normalized) &&
    !Str.includes("\u0000")(normalized) &&
    !Str.startsWith("/")(normalized) &&
    O.isSome(firstSegment) &&
    firstSegment.value === platform &&
    A.every(segments, (segment) => Str.isNonEmpty(segment) && segment !== "." && segment !== "..")
  );
};

const validateBundleEntries = Effect.fn("StackInstaller.validateBundleEntries")(function* (
  platform: P1RequiredPlatform,
  bundlePath: string
) {
  const process = p1ProofBundleListingProcess(platform, { bundlePath, outputRoot: "" });
  const [stdout, stderr, exitCode] = yield* runNativeProcess(process);

  yield* requireAudit(
    exitCode === 0,
    `Failed to list ${bundlePath} with ${process.command}; exitCode=${exitCode}; stderr=${stderr}; stdout=${stdout}`
  );

  const entries = pipe(Str.split("\n")(stdout), A.map(Str.trim), A.filter(Str.isNonEmpty));
  const unsafeEntries = pipe(
    entries,
    A.filter((entry) => !isSafeBundleEntry(platform, entry))
  );

  yield* requireAudit(
    A.isReadonlyArrayEmpty(unsafeEntries),
    `Refusing to extract ${bundlePath}; archive entries must stay under ${platform}/ and avoid traversal segments: ${pipe(
      unsafeEntries,
      A.take(10),
      A.join(", ")
    )}`
  );
});

const runExtractionProcess = Effect.fn("StackInstaller.runExtractionProcess")(function* (
  platform: P1RequiredPlatform,
  bundlePath: string,
  outputRoot: string
) {
  const process = p1ProofBundleExtractionProcess(platform, { bundlePath, outputRoot });
  yield* validateBundleEntries(platform, bundlePath);
  const [stdout, stderr, exitCode] = yield* runNativeProcess(process);

  yield* requireAudit(
    exitCode === 0,
    `Failed to extract ${bundlePath} with ${process.command}; exitCode=${exitCode}; stderr=${stderr}; stdout=${stdout}`
  );
});

const intakePlatformBundle = Effect.fn("StackInstaller.intakePlatformBundle")(function* (
  outputRoot: string,
  platform: P1RequiredPlatform
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const outputDir = path.join(outputRoot, platform);
  const bundlePath = path.join(outputRoot, p1ProofBundleFileNameForPlatform(platform));
  const bundleExists = yield* fs.exists(bundlePath).pipe(Effect.orElseSucceed(() => false));

  if (!bundleExists) {
    return O.none<string>();
  }

  const outputDirExists = yield* fs.exists(outputDir).pipe(Effect.orElseSucceed(() => false));

  if (outputDirExists) {
    return O.some(
      `- ${platform}: skipped; proof directory already exists\n  dir: ${outputDir}\n  bundle: ${bundlePath}`
    );
  }

  yield* runExtractionProcess(platform, bundlePath, outputRoot);

  const extractedDirExists = yield* fs.exists(outputDir).pipe(Effect.orElseSucceed(() => false));

  yield* requireAudit(extractedDirExists, `Extracted bundle did not create expected proof directory: ${outputDir}`);

  return O.some(`- ${platform}: extracted returned proof bundle\n  dir: ${outputDir}\n  bundle: ${bundlePath}`);
});

const intakeReturnedBundles = Effect.fn("StackInstaller.intakeReturnedBundles")(function* (outputRoot: string) {
  const fs = yield* FileSystem.FileSystem;

  yield* fs.makeDirectory(outputRoot, { recursive: true });

  const intakeMessages = yield* Effect.forEach(
    P1_REQUIRED_PLATFORMS,
    (platform) => intakePlatformBundle(outputRoot, platform),
    { concurrency: 1 }
  );
  const status = yield* proofArtifactStatus(outputRoot);
  const summary = pipe(
    A.getSomes(intakeMessages),
    O.liftPredicate(A.isReadonlyArrayNonEmpty),
    O.map(A.join("\n")),
    O.getOrElse(() => `No returned P1 proof bundles found in ${outputRoot}.`)
  );

  return `${summary}\n\n${status}`;
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
  const allFileNames = yield* artifactFileNames(outputDir);
  const missingFileNames = p1ProofMissingRequiredArtifactFiles(allFileNames);
  const fileNames = pipe(allFileNames, A.filter(isP1ProofEvidenceFileName));

  yield* requireAudit(
    !A.isReadonlyArrayNonEmpty(missingFileNames),
    `Missing P1 proof artifact files in ${outputDir}: ${A.join(", ")(missingFileNames)}`
  );

  const proofJson = yield* fs.readFileString(path.join(outputDir, PROOF_FILE_NAME));
  const commandsText = yield* fs.readFileString(path.join(outputDir, COMMANDS_FILE_NAME));

  yield* requireAudit(!containsLikelyDiscordToken(proofJson), "proof.json contains a likely plaintext Discord token");
  yield* requireAudit(
    !containsLikelyDiscordToken(commandsText),
    "commands.txt contains a likely plaintext Discord token"
  );

  const proof = yield* decodeProofJson(proofJson);
  const recordedChecksums = yield* fs.readFileString(path.join(outputDir, CHECKSUMS_FILE_NAME));
  const expectedChecksums = yield* buildSha256SumsText(outputDir);
  const expectedPlatformMessage = pipe(
    expectedPlatform,
    O.map((platform) => `Proof target platform must be ${platform}`),
    O.getOrElse(() => "Proof target platform must match requested platform")
  );

  yield* requireAudit(recordedChecksums === expectedChecksums, "sha256sums.txt is stale or incomplete");
  yield* requireAudit(
    p1ProofCommandsTextMatchesPlatform(commandsText, proof.snapshot.manifest.targetPlatform),
    `commands.txt must contain platform-specific proof commands for ${proof.snapshot.manifest.targetPlatform}`
  );
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
  const missingDirectories = yield* missingRequiredPlatformDirectories(outputRoot);

  yield* requireAudit(
    !A.isReadonlyArrayNonEmpty(missingDirectories),
    `Missing P1 proof artifact directories: ${A.join(", ")(missingDirectories)}`
  );

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
  const commandsText = buildP1ProofCommandsText(request, { outputDir, requestJson });

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
  const target = yield* resolveArtifactModeTarget("--checksums-only");

  yield* refreshChecksums(target.outputDir);

  return `P1 proof checksums refreshed in ${target.outputDir}`;
});

const auditOnlyMode = Effect.gen(function* () {
  const target = yield* resolveArtifactModeTarget("--audit-only");

  return yield* auditProofArtifacts(target.outputDir, target.expectedPlatform);
});

const auditAllMode = Effect.gen(function* () {
  const defaultOutputRoot = yield* resolveDefaultOutputRoot;
  const outputRoot = pipe(
    argAfter("--output-root"),
    O.getOrElse(() => defaultOutputRoot)
  );

  return yield* auditAllProofArtifacts(outputRoot);
});

const statusMode = Effect.gen(function* () {
  const defaultOutputRoot = yield* resolveDefaultOutputRoot;
  const outputRoot = pipe(
    argAfter("--output-root"),
    O.getOrElse(() => defaultOutputRoot)
  );

  return yield* proofArtifactStatus(outputRoot);
});

const intakeMode = Effect.gen(function* () {
  const defaultOutputRoot = yield* resolveDefaultOutputRoot;
  const outputRoot = pipe(
    argAfter("--output-root"),
    O.getOrElse(() => defaultOutputRoot)
  );

  return yield* intakeReturnedBundles(outputRoot);
});

const watchProofArtifacts = Effect.fn("StackInstaller.watchProofArtifacts")(function* (
  outputRoot: string,
  attempts: number,
  intervalMs: number
) {
  let lastStatus = "";

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    lastStatus = yield* intakeReturnedBundles(outputRoot);

    const auditExit = yield* Effect.exit(auditAllProofArtifacts(outputRoot));

    if (Exit.isSuccess(auditExit)) {
      return `${lastStatus}\n\n${auditExit.value}\nP1 proof watch passed on attempt ${attempt}/${attempts}.`;
    }

    if (attempt < attempts) {
      yield* Console.log(`P1 proof watch attempt ${attempt}/${attempts} pending; sleeping ${intervalMs}ms.`);
      yield* Effect.sleep(Duration.millis(intervalMs));
    }
  }

  return yield* Effect.die(`P1 proof watch exhausted ${attempts} attempts without passing audit-all.\n\n${lastStatus}`);
});

const watchMode = Effect.gen(function* () {
  const defaultOutputRoot = yield* resolveDefaultOutputRoot;
  const outputRoot = pipe(
    argAfter("--output-root"),
    O.getOrElse(() => defaultOutputRoot)
  );
  const attempts = positiveIntegerArg("--watch-attempts", 120);
  const intervalMs = positiveIntegerArg("--watch-interval-ms", 5_000);

  return yield* watchProofArtifacts(outputRoot, attempts, intervalMs);
});

const selectedMode = Effect.gen(function* () {
  if (hasArg("--audit-all")) {
    return yield* auditAllMode;
  }
  if (hasArg("--watch")) {
    return yield* watchMode;
  }
  if (hasArg("--intake")) {
    return yield* intakeMode;
  }
  if (hasArg("--status")) {
    return yield* statusMode;
  }
  if (hasArg("--audit-only")) {
    return yield* auditOnlyMode;
  }
  if (hasArg("--checksums-only")) {
    return yield* checksumOnlyMode;
  }

  return yield* captureMode;
});

const program = pipe(
  selectedMode,
  Effect.tap((message) => Console.log(message)),
  provideScopedLayer(RuntimeLayer)
);

BunRuntime.runMain(program);
