import { $I as $RootId } from "@beep/identity/packages";
import {
  SidecarBadRequestPayload,
  SidecarBootstrap,
  SidecarBootstrapStdoutEvent,
  type SidecarHealthStatus,
  SidecarInternalErrorPayload,
  SidecarNotFoundPayload,
} from "@beep/runtime-protocol";
import { FilePath, NonEmptyTrimmedStr, NonNegativeInt, StatusCauseTaggedErrorClass, UUID } from "@beep/schema";
import * as BunHttpServer from "@effect/platform-bun/BunHttpServer";
import * as BunServices from "@effect/platform-bun/BunServices";
import * as SqliteClient from "@effect/sql-sqlite-bun/SqliteClient";
import { Cause, Config, DateTime, Deferred, Effect, Fiber, FileSystem, Layer, Match, Path, pipe, Ref } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as HttpRouter from "effect/unstable/http/HttpRouter";
import { HttpApiBuilder } from "effect/unstable/httpapi";
import * as SqlClient from "effect/unstable/sql/SqlClient";
import {
  type CompleteVt2CaptureInput,
  type CreateVt2SessionInput,
  defaultVt2DesktopPreferences,
  defaultVt2WorkspaceSeams,
  type ResolveVt2RecoveryCandidateInput,
  type RunVt2CompositionInput,
  type UpdateVt2DesktopPreferencesInput,
  Vt2CaptureSegment,
  Vt2CompositionPacket,
  Vt2CompositionProfile,
  Vt2CompositionRun,
  Vt2DesktopPreferences,
  Vt2ExportArtifact,
  Vt2ExportRequest,
  Vt2MemoryContextPacket,
  Vt2RecoveryCandidate,
  Vt2Session,
  Vt2SessionResource,
  Vt2SessionSource,
  Vt2SessionStatus,
  Vt2Transcript,
  Vt2TranscriptRuntime,
  Vt2WorkspaceSnapshot,
} from "../domain.js";
import { Vt2ControlPlaneApi } from "../protocol.js";
import {
  Vt2CompositionProvider,
  Vt2ExportProvider,
  Vt2MemoryContextProvider,
  Vt2ProviderError,
  Vt2TranscriptProvider,
} from "../services.js";

const $I = $RootId.create("V2T/Server/index");
const defaultHost = "127.0.0.1";
const defaultPort = 8790;
const defaultTranscriptWhisperModel = NonEmptyTrimmedStr.make("tiny.en");
const transcriptExcerptCharacterLimit = 220;
const repoRootMarkers: ReadonlyArray<string> = [".git", "bun.lock"];
const bootstrapStdoutJson = S.fromJsonString(SidecarBootstrapStdoutEvent);
const encodeBootstrapStdoutJson = S.encodeUnknownEffect(bootstrapStdoutJson);
const transcriptJson = S.fromJsonString(Vt2Transcript);
const captureSegmentsJson = Vt2CaptureSegment.pipe(S.Array, S.fromJsonString);
const recoveryCandidatesJson = Vt2RecoveryCandidate.pipe(S.Array, S.fromJsonString);
const memoryContextPacketsJson = Vt2MemoryContextPacket.pipe(S.Array, S.fromJsonString);
const compositionProfilesJson = Vt2CompositionProfile.pipe(S.Array, S.fromJsonString);
const compositionRunsJson = Vt2CompositionRun.pipe(S.Array, S.fromJsonString);
const exportArtifactsJson = Vt2ExportArtifact.pipe(S.Array, S.fromJsonString);
const preferencesJson = S.fromJsonString(Vt2DesktopPreferences);

const encodeTranscriptJson = S.encodeUnknownEffect(transcriptJson);
const decodeTranscriptJson = S.decodeUnknownEffect(transcriptJson);
const encodeCaptureSegmentsJson = S.encodeUnknownEffect(captureSegmentsJson);
const decodeCaptureSegmentsJson = S.decodeUnknownEffect(captureSegmentsJson);
const encodeRecoveryCandidatesJson = S.encodeUnknownEffect(recoveryCandidatesJson);
const decodeRecoveryCandidatesJson = S.decodeUnknownEffect(recoveryCandidatesJson);
const encodeMemoryContextPacketsJson = S.encodeUnknownEffect(memoryContextPacketsJson);
const decodeMemoryContextPacketsJson = S.decodeUnknownEffect(memoryContextPacketsJson);
const encodeCompositionProfilesJson = S.encodeUnknownEffect(compositionProfilesJson);
const decodeCompositionProfilesJson = S.decodeUnknownEffect(compositionProfilesJson);
const encodeCompositionRunsJson = S.encodeUnknownEffect(compositionRunsJson);
const decodeCompositionRunsJson = S.decodeUnknownEffect(compositionRunsJson);
const encodeExportArtifactsJson = S.encodeUnknownEffect(exportArtifactsJson);
const decodeExportArtifactsJson = S.decodeUnknownEffect(exportArtifactsJson);
const encodePreferencesJson = S.encodeUnknownEffect(preferencesJson);
const decodePreferencesJson = S.decodeUnknownEffect(preferencesJson);
// cspell:ignore nargs isinstance
const localWhisperPythonSource = [
  "import argparse",
  "import json",
  "import sys",
  "",
  "try:",
  "    import whisper",
  "except Exception as error:",
  "    sys.stderr.write(f'Failed to import openai-whisper: {error}\\n')",
  "    raise",
  "",
  "parser = argparse.ArgumentParser()",
  "parser.add_argument('--model', required=True)",
  "parser.add_argument('paths', nargs='+')",
  "args = parser.parse_args()",
  "",
  "model = whisper.load_model(args.model)",
  "transcripts = []",
  "language = None",
  "",
  "for audio_path in args.paths:",
  "    result = model.transcribe(audio_path, fp16=False)",
  "    text = (result.get('text') or '').strip()",
  "    if text:",
  "        transcripts.append(text)",
  "    if language is None:",
  "        detected_language = result.get('language')",
  "        if isinstance(detected_language, str) and detected_language.strip():",
  "            language = detected_language.strip()",
  "",
  "print(json.dumps({'text': ' '.join(transcripts), 'language': language}, ensure_ascii=True))",
].join("\n");

const SidecarPort = NonNegativeInt.pipe(
  S.check(S.isGreaterThan(0)),
  S.annotate(
    $I.annote("SidecarPort", {
      description: "Configured TCP port for the V2T sidecar runtime.",
    })
  )
);

/**
 * V2T runtime configuration.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class Vt2RuntimeConfig extends S.Class<Vt2RuntimeConfig>($I`Vt2RuntimeConfig`)(
  {
    host: S.String,
    port: SidecarPort,
    appDataDir: FilePath,
    sessionId: S.String,
    transcriptPythonBin: S.OptionFromOptionalKey(NonEmptyTrimmedStr),
    transcriptWhisperModel: NonEmptyTrimmedStr,
    version: S.String,
  },
  $I.annote("Vt2RuntimeConfig", {
    description: "Startup configuration for the V2T sqlite-backed sidecar runtime.",
  })
) {}

class LocalWhisperTranscriptEnvelope extends S.Class<LocalWhisperTranscriptEnvelope>(
  $I`LocalWhisperTranscriptEnvelope`
)(
  {
    text: S.String,
    language: S.OptionFromOptionalKey(S.String),
  },
  $I.annote("LocalWhisperTranscriptEnvelope", {
    description: "JSON payload returned by the local Whisper transcription helper.",
  })
) {}

const localWhisperTranscriptEnvelopeJson = S.fromJsonString(LocalWhisperTranscriptEnvelope);
const decodeLocalWhisperTranscriptEnvelopeJson = S.decodeUnknownEffect(localWhisperTranscriptEnvelopeJson);

/**
 * Typed runtime error emitted during V2T bootstrap and request handling.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class Vt2RuntimeError extends StatusCauseTaggedErrorClass<Vt2RuntimeError>($I`Vt2RuntimeError`)(
  "Vt2RuntimeError",
  $I.annote("Vt2RuntimeError", {
    description: "Typed error for V2T runtime bootstrap and control-plane boundaries.",
  })
) {}

class PackageJsonVersion extends S.Class<PackageJsonVersion>($I`PackageJsonVersion`)({
  version: S.String,
}) {}

class Vt2SessionRow extends S.Class<Vt2SessionRow>($I`Vt2SessionRow`)(
  {
    id: UUID,
    project_id: S.NullOr(UUID),
    source: Vt2SessionSource,
    status: Vt2SessionStatus,
    title: NonEmptyTrimmedStr,
    working_directory: S.NullOr(S.String),
    created_at: S.DateTimeUtcFromMillis,
    updated_at: S.DateTimeUtcFromMillis,
    transcript_json: S.String,
    capture_segments_json: S.String,
    recovery_candidates_json: S.String,
    memory_context_packets_json: S.String,
    composition_profiles_json: S.String,
    composition_runs_json: S.String,
    export_artifacts_json: S.String,
  },
  $I.annote("Vt2SessionRow", {
    description: "SQLite row shape for persisted V2T session resources.",
  })
) {}

class Vt2DesktopPreferencesRow extends S.Class<Vt2DesktopPreferencesRow>($I`Vt2DesktopPreferencesRow`)(
  {
    id: S.Number,
    preferences_json: S.String,
    updated_at: S.DateTimeUtcFromMillis,
  },
  $I.annote("Vt2DesktopPreferencesRow", {
    description: "SQLite row shape for persisted user-level V2T desktop preferences.",
  })
) {}

const decodeSessionRow = S.decodeUnknownEffect(Vt2SessionRow);
const decodePreferencesRow = S.decodeUnknownEffect(Vt2DesktopPreferencesRow);

/**
 * Bun runtime services used by V2T.
 *
 * @since 0.0.0
 * @category Layers
 */
export const bunLayer = BunServices.layer;

/**
 * SQLite client layer for V2T.
 *
 * @since 0.0.0
 * @category Layers
 */
export const sqliteLayer = (config: Vt2RuntimeConfig) =>
  SqliteClient.layer({
    filename: `${config.appDataDir}/vt2.sqlite`,
  });

type Vt2Store = {
  readonly bootstrap: Effect.Effect<SidecarBootstrap, Vt2RuntimeError>;
  readonly completeCapture: (
    sessionId: string,
    input: CompleteVt2CaptureInput
  ) => Effect.Effect<Vt2SessionResource, Vt2RuntimeError>;
  readonly createSession: (input: CreateVt2SessionInput) => Effect.Effect<Vt2SessionResource, Vt2RuntimeError>;
  readonly getPreferences: Effect.Effect<Vt2DesktopPreferences, Vt2RuntimeError>;
  readonly getSession: (sessionId: string) => Effect.Effect<Vt2SessionResource, Vt2RuntimeError>;
  readonly getWorkspace: Effect.Effect<Vt2WorkspaceSnapshot, Vt2RuntimeError>;
  readonly listSessions: Effect.Effect<ReadonlyArray<Vt2Session>, Vt2RuntimeError>;
  readonly resolveRecoveryCandidate: (
    sessionId: string,
    candidateId: string,
    input: ResolveVt2RecoveryCandidateInput
  ) => Effect.Effect<Vt2SessionResource, Vt2RuntimeError>;
  readonly retryTranscript: (sessionId: string) => Effect.Effect<Vt2SessionResource, Vt2RuntimeError>;
  readonly runComposition: (
    sessionId: string,
    input: RunVt2CompositionInput
  ) => Effect.Effect<Vt2SessionResource, Vt2RuntimeError>;
  readonly savePreferences: (
    input: UpdateVt2DesktopPreferencesInput
  ) => Effect.Effect<Vt2DesktopPreferences, Vt2RuntimeError>;
  readonly startCapture: (sessionId: string) => Effect.Effect<Vt2SessionResource, Vt2RuntimeError>;
};

const supportedSessionSources: ReadonlyArray<Vt2Session["source"]> = ["record", "import"];

const normalizeOptionalText = (value: O.Option<string>) =>
  value.pipe(O.map(Str.trim), O.flatMap(O.liftPredicate(Str.isNonEmpty)));

const internalRunnerHost = (host: string): string =>
  Match.value(host).pipe(
    Match.when("0.0.0.0", () => "127.0.0.1"),
    Match.when("::", () => "::1"),
    Match.orElse(() => host)
  );

const makeBootstrap = (config: Vt2RuntimeConfig, startedAt: DateTime.Utc, status: typeof SidecarHealthStatus.Type) =>
  new SidecarBootstrap({
    sessionId: config.sessionId,
    host: config.host,
    port: config.port,
    baseUrl: `http://${internalRunnerHost(config.host)}:${config.port}`,
    pid: NonNegativeInt.make(process.pid),
    version: config.version,
    status,
    startedAt,
  });

const findRepoRootOrStart = Effect.fn("Vt2Runtime.findRepoRootOrStart")(function* (startDirectory: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const resolvedStartDirectory = path.resolve(startDirectory);

  const search = Effect.fn("Vt2Runtime.searchRepoRoot")(function* (currentDirectory: string): Effect.fn.Return<string> {
    const markerExists = yield* Effect.forEach(repoRootMarkers, (marker) =>
      fs.exists(path.join(currentDirectory, marker)).pipe(Effect.orElseSucceed(() => false))
    ).pipe(Effect.map(A.some((exists) => exists)));

    if (markerExists) {
      return currentDirectory;
    }

    const parentDirectory = path.dirname(currentDirectory);

    if (parentDirectory === currentDirectory) {
      return resolvedStartDirectory;
    }

    return yield* search(parentDirectory);
  });

  return yield* search(resolvedStartDirectory);
});

const resolveVt2AppDataDir = Effect.fn("Vt2Runtime.resolveAppDataDir")(function* (appDataDir: O.Option<string>) {
  const path = yield* Path.Path;

  return yield* O.match(appDataDir, {
    onNone: () =>
      findRepoRootOrStart(process.cwd()).pipe(Effect.map((repoRoot) => path.resolve(repoRoot, ".beep/vt2"))),
    onSome: (configuredAppDataDir) => Effect.succeed(path.resolve(configuredAppDataDir)),
  });
});

const resolveVt2Version = Effect.fn("Vt2Runtime.resolveVersion")(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const packageJsonVersionJson = S.fromJsonString(PackageJsonVersion);
  const packageJsonPath = path.resolve(process.cwd(), "package.json");

  return yield* fs.readFileString(packageJsonPath).pipe(
    Effect.flatMap(S.decodeUnknownEffect(packageJsonVersionJson)),
    Effect.map((pkg) => pkg.version),
    Effect.orElseSucceed(() => "0.0.0")
  );
});

const hasMessage = (input: unknown): input is { readonly message: string } =>
  P.isObject(input) && P.hasProperty(input, "message") && P.isString(input.message);

const matchUnknownMessage = (input: unknown): string => {
  if (P.isError(input)) {
    return input.message;
  }

  if (hasMessage(input)) {
    return input.message;
  }

  return "V2T request failed.";
};

const toControlPlanePayload = (
  cause: Cause.Cause<unknown>
): SidecarBadRequestPayload | SidecarNotFoundPayload | SidecarInternalErrorPayload => {
  const error = Cause.squash(cause);

  if (P.isTagged("SchemaError")(error) || P.isTagged("HttpBodyError")(error) || P.isTagged("HttpServerError")(error)) {
    return new SidecarBadRequestPayload({
      message: matchUnknownMessage(error),
      status: 400,
    });
  }

  if (S.is(Vt2RuntimeError)(error)) {
    if (error.status === 400) {
      return new SidecarBadRequestPayload({
        message: error.message,
        status: 400,
      });
    }

    if (error.status === 404) {
      return new SidecarNotFoundPayload({
        message: error.message,
        status: 404,
      });
    }

    return new SidecarInternalErrorPayload({
      message: error.message,
      status: 500,
    });
  }

  return new SidecarInternalErrorPayload({
    message: matchUnknownMessage(error),
    status: 500,
  });
};

const makeDefaultTranscript = (sessionId: UUID): Vt2Transcript =>
  new Vt2Transcript({
    sessionId,
    status: "pending",
    text: O.none(),
    excerpt: O.none(),
    language: O.none(),
    wordCount: NonNegativeInt.make(0),
    failureReason: O.none(),
  });

const makeDefaultCompositionProfiles = (): ReadonlyArray<Vt2CompositionProfile> =>
  A.make(
    new Vt2CompositionProfile({
      id: UUID.make(crypto.randomUUID()),
      label: NonEmptyTrimmedStr.make("Default local-first profile"),
      includeMemoryContext: true,
      preferredProviderMode: "local",
      aspectRatio: NonEmptyTrimmedStr.make("16:9"),
      outputTone: NonEmptyTrimmedStr.make("clear and grounded"),
    })
  );

const isPendingRecoveryCandidate = (candidate: Vt2RecoveryCandidate): boolean => candidate.disposition === "pending";

const hasRecoveryCandidateId =
  (candidateId: string) =>
  (candidate: Vt2RecoveryCandidate): boolean =>
    candidate.id === candidateId;

const hasCaptureSegmentId =
  (segmentId: string) =>
  (segment: Vt2CaptureSegment): boolean =>
    segment.id === segmentId;

const isIngestedCaptureSegment = (segment: Vt2CaptureSegment): boolean => segment.status === "ingested";

const isDiscardedCaptureSegment = (segment: Vt2CaptureSegment): boolean => segment.status === "discarded";

const captureSegmentStatusForRecovery = (
  disposition: ResolveVt2RecoveryCandidateInput["disposition"]
): Vt2CaptureSegment["status"] =>
  Match.value(disposition).pipe(
    Match.when("recover", () => "ingested" as const),
    Match.when("discard", () => "discarded" as const),
    Match.exhaustive
  );

const buildTranscriptProjection = (
  sessionId: UUID,
  captureSegments: ReadonlyArray<Vt2CaptureSegment>,
  recoveryCandidates: ReadonlyArray<Vt2RecoveryCandidate>
): Vt2Transcript => {
  const pendingRecoveryCount = A.filter(recoveryCandidates, isPendingRecoveryCandidate).length;
  const ingestedCount = A.filter(captureSegments, isIngestedCaptureSegment).length;
  const discardedCount = A.filter(captureSegments, isDiscardedCaptureSegment).length;

  if (pendingRecoveryCount > 0) {
    return new Vt2Transcript({
      sessionId,
      status: "pending",
      text: O.none(),
      excerpt: O.none(),
      language: O.none(),
      wordCount: NonNegativeInt.make(0),
      failureReason: O.none(),
    });
  }

  if (ingestedCount > 0) {
    return new Vt2Transcript({
      sessionId,
      status: "pending",
      text: O.none(),
      excerpt: O.none(),
      language: O.none(),
      wordCount: NonNegativeInt.make(0),
      failureReason: O.none(),
    });
  }

  if (discardedCount > 0) {
    const failureReason = NonEmptyTrimmedStr.make("Captured media was discarded before downstream intake.");

    return new Vt2Transcript({
      sessionId,
      status: "failed",
      text: O.none(),
      excerpt: O.some(failureReason),
      language: O.none(),
      wordCount: NonNegativeInt.make(0),
      failureReason: O.some(failureReason),
    });
  }

  return makeDefaultTranscript(sessionId);
};

const resolveSessionStatusFromArtifacts = (
  captureSegments: ReadonlyArray<Vt2CaptureSegment>,
  recoveryCandidates: ReadonlyArray<Vt2RecoveryCandidate>,
  transcript: Vt2Transcript,
  isCapturing = false
): Vt2SessionStatus => {
  if (isCapturing) {
    return "capturing";
  }

  if (A.some(recoveryCandidates, isPendingRecoveryCandidate)) {
    return "recoverable";
  }

  if (A.some(captureSegments, isIngestedCaptureSegment)) {
    if (transcript.status === "ready") {
      return "review-ready";
    }

    if (transcript.status === "failed") {
      return "failed";
    }

    return "transcribing";
  }

  if (A.some(captureSegments, isDiscardedCaptureSegment)) {
    return "failed";
  }

  return "draft";
};

const toNullableString = <A extends string>(value: O.Option<A>): string | null => O.getOrNull(value);

const toProviderRuntimeError =
  (fallback: string) =>
  (cause: Vt2ProviderError): Vt2RuntimeError =>
    Vt2RuntimeError.noCause(cause.message.length > 0 ? cause.message : fallback, cause.status);

const makeLocalProviderError = (message: string): Vt2ProviderError =>
  Vt2ProviderError.noCause(message, 500, {
    reason: "unavailable",
  });

const exportExtension = (format: Vt2ExportArtifact["format"]): string =>
  Match.value(format).pipe(
    Match.when("markdown", () => "md"),
    Match.when("json", () => "json"),
    Match.when("srt", () => "srt"),
    Match.when("txt", () => "txt"),
    Match.exhaustive
  );

const normalizeExportSlug = (value: string): string => {
  const normalized = pipe(
    value,
    Str.trim,
    Str.toLowerCase,
    Str.replace(/[^a-z0-9]+/g, "-"),
    Str.replace(/^-+/g, ""),
    Str.replace(/-+$/g, "")
  );

  return Str.isNonEmpty(normalized) ? normalized : "v2t-export";
};

const renderLocalExportContent = (request: Vt2ExportRequest): string => {
  const transcriptExcerpt = O.getOrElse(request.transcriptExcerpt, () =>
    NonEmptyTrimmedStr.make("Transcript excerpt was not ready when this local-first export was prepared.")
  );
  const targetFormats = request.packet.targetFormats.join(", ");

  return Match.value(request.format).pipe(
    Match.when("json", () =>
      JSON.stringify(
        {
          sessionId: request.sessionId,
          runId: request.runId,
          title: request.sessionTitle,
          format: request.format,
          transcriptExcerpt,
          includeMemoryContext: request.packet.includeMemoryContext,
          memoryContextPacketId: O.getOrNull(request.memoryContextPacketId),
          targetFormats: request.packet.targetFormats,
        },
        null,
        2
      )
    ),
    Match.when("markdown", () =>
      [
        `# ${request.sessionTitle}`,
        "",
        `- Session: ${request.sessionId}`,
        `- Run: ${request.runId}`,
        `- Formats: ${targetFormats}`,
        `- Memory context: ${request.packet.includeMemoryContext ? "included" : "not included"}`,
        "",
        "## Transcript Excerpt",
        "",
        transcriptExcerpt,
        "",
      ].join("\n")
    ),
    Match.when("txt", () =>
      [
        `${request.sessionTitle}`,
        `Session ${request.sessionId}`,
        `Run ${request.runId}`,
        `Formats ${targetFormats}`,
        "",
        transcriptExcerpt,
        "",
      ].join("\n")
    ),
    Match.when("srt", () => ["1", "00:00:00,000 --> 00:00:05,000", transcriptExcerpt, ""].join("\n")),
    Match.exhaustive
  );
};

const localMemoryContextFetch = Effect.fn("Vt2MemoryContextProvider.fetchContext")(function* (
  session: Vt2SessionResource,
  packet: Vt2CompositionPacket
) {
  const createdAt = yield* DateTime.now;
  const transcriptReference = O.getOrElse(packet.transcriptExcerpt, () =>
    NonEmptyTrimmedStr.make("No transcript excerpt was available when memory retrieval was requested.")
  );

  return new Vt2MemoryContextPacket({
    id: UUID.make(crypto.randomUUID()),
    sessionId: session.session.id,
    providerLabel: NonEmptyTrimmedStr.make("local-graphiti-seam"),
    query: NonEmptyTrimmedStr.make(`Memory context for ${session.session.title}`),
    references: [
      NonEmptyTrimmedStr.make(`Session source: ${session.session.source}`),
      NonEmptyTrimmedStr.make(`Transcript status: ${session.transcript.status}`),
      transcriptReference,
    ],
    createdAt,
  });
});

const localCompositionPrepareRun = Effect.fn("Vt2CompositionProvider.prepareRun")(function* (
  session: Vt2SessionResource,
  profile: Vt2CompositionProfile,
  _preferences: Vt2DesktopPreferences,
  packet: Vt2CompositionPacket,
  memoryContextPacket: O.Option<Vt2MemoryContextPacket>
) {
  const createdAt = yield* DateTime.now;

  return new Vt2CompositionRun({
    id: UUID.make(crypto.randomUUID()),
    sessionId: session.session.id,
    profileId: profile.id,
    status: "prepared",
    packet,
    memoryContextPacketId: O.map(memoryContextPacket, (context) => context.id),
    exportArtifactIds: A.empty(),
    createdAt,
  });
});

const normalizeTranscriptText = (value: string): string => pipe(value, Str.trim, Str.replace(/\s+/g, " "));

const buildTranscriptExcerpt = (value: string): NonEmptyTrimmedStr => {
  const normalized = normalizeTranscriptText(value);

  return NonEmptyTrimmedStr.make(
    Str.length(normalized) <= transcriptExcerptCharacterLimit
      ? normalized
      : `${pipe(normalized, Str.slice(0, transcriptExcerptCharacterLimit - 3))}...`
  );
};

const countTranscriptWords = (value: string): NonNegativeInt =>
  pipe(value, normalizeTranscriptText, Str.split(/\s+/), A.filter(Str.isNonEmpty), A.length, NonNegativeInt.make);

const normalizeTranscriptLanguage = (value: O.Option<string>): O.Option<NonEmptyTrimmedStr> =>
  value.pipe(O.map(Str.trim), O.flatMap(O.liftPredicate(Str.isNonEmpty)), O.map(NonEmptyTrimmedStr.make));

const buildTranscriptFailureProjection = (sessionId: UUID, message: string): Vt2Transcript =>
  pipe(
    message,
    normalizeTranscriptText,
    NonEmptyTrimmedStr.make,
    (failureReason) =>
      new Vt2Transcript({
        sessionId,
        status: "failed",
        text: O.none(),
        excerpt: O.some(failureReason),
        language: O.none(),
        wordCount: NonNegativeInt.make(0),
        failureReason: O.some(failureReason),
      })
  );

const buildReadyTranscriptProjection = (sessionId: UUID, text: string, language: O.Option<string>): Vt2Transcript => {
  const normalizedText = normalizeTranscriptText(text);
  const normalizedBody = NonEmptyTrimmedStr.make(normalizedText);

  return new Vt2Transcript({
    sessionId,
    status: "ready",
    text: O.some(normalizedBody),
    excerpt: O.some(buildTranscriptExcerpt(normalizedText)),
    language: normalizeTranscriptLanguage(language),
    wordCount: countTranscriptWords(normalizedText),
    failureReason: O.none(),
  });
};

const defaultTranscriptPythonPath = (config: Vt2RuntimeConfig, path: Path.Path): string =>
  process.platform === "win32"
    ? path.resolve(config.appDataDir, "providers", "whisper", "Scripts", "python.exe")
    : path.resolve(config.appDataDir, "providers", "whisper", "bin", "python3");

type TranscriptRuntimeCommand = {
  readonly commandSource: Vt2TranscriptRuntime["commandSource"];
  readonly resolvedCommand: string;
};

const configuredTranscriptRuntimeCommand = (resolvedCommand: string): TranscriptRuntimeCommand => ({
  commandSource: "configured",
  resolvedCommand,
});

const bundledTranscriptRuntimeCommand = (resolvedCommand: string): TranscriptRuntimeCommand => ({
  commandSource: "bundled",
  resolvedCommand,
});

const systemTranscriptRuntimeCommand: TranscriptRuntimeCommand = {
  commandSource: "system",
  resolvedCommand: "python3",
};

const resolveTranscriptRuntimeCommand = (input: {
  readonly configuredCommand: O.Option<string>;
  readonly bundledPython: string;
  readonly bundledPythonExists: boolean;
}): TranscriptRuntimeCommand =>
  pipe(
    input.configuredCommand,
    O.map(configuredTranscriptRuntimeCommand),
    O.orElse(() =>
      pipe(
        input.bundledPython,
        O.liftPredicate(() => input.bundledPythonExists),
        O.map(bundledTranscriptRuntimeCommand)
      )
    ),
    O.getOrElse(() => systemTranscriptRuntimeCommand)
  );

const localTranscriptProviderLayer = (config: Vt2RuntimeConfig) =>
  Layer.effect(
    Vt2TranscriptProvider,
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const commandHasPathShape = (command: string): boolean =>
        path.isAbsolute(command) || Str.includes("/")(command) || Str.includes("\\")(command);
      const commandAvailable = Effect.fn("Vt2TranscriptProvider.commandAvailable")(function* (command: string) {
        return yield* commandHasPathShape(command)
          ? fs.exists(command).pipe(Effect.orElseSucceed(() => false))
          : Effect.sync(() => P.isString(Bun.which(command)));
      });
      const resolveTranscriptRuntime = Effect.fn("Vt2TranscriptProvider.resolveTranscriptRuntime")(function* () {
        const bundledPython = defaultTranscriptPythonPath(config, path);
        const bundledPythonExists = yield* fs.exists(bundledPython).pipe(Effect.orElseSucceed(() => false));
        const runtime = resolveTranscriptRuntimeCommand({
          configuredCommand: config.transcriptPythonBin,
          bundledPython,
          bundledPythonExists,
        });
        const available = yield* commandAvailable(runtime.resolvedCommand);
        const detail = Match.value(runtime.commandSource).pipe(
          Match.when("configured", () =>
            available
              ? `Configured Whisper runtime is ready via ${runtime.resolvedCommand}.`
              : `Configured Whisper runtime could not find ${runtime.resolvedCommand}.`
          ),
          Match.when("bundled", () =>
            available
              ? `Bundled Whisper runtime is ready via ${runtime.resolvedCommand}.`
              : `Bundled Whisper runtime expected ${runtime.resolvedCommand}, but it is not available.`
          ),
          Match.when("system", () =>
            available
              ? `System Whisper runtime will use ${runtime.resolvedCommand} from PATH.`
              : `System Whisper runtime expected ${runtime.resolvedCommand} on PATH, but it was not available.`
          ),
          Match.exhaustive
        );

        return new Vt2TranscriptRuntime({
          status: available ? "ready" : "degraded",
          providerMode: "local",
          commandSource: runtime.commandSource,
          resolvedCommand: NonEmptyTrimmedStr.make(runtime.resolvedCommand),
          whisperModel: config.transcriptWhisperModel,
          detail: NonEmptyTrimmedStr.make(detail),
        });
      });
      const inspectRuntime = resolveTranscriptRuntime();
      const transcribe = Effect.fn("Vt2TranscriptProvider.transcribe")(function* (session: Vt2SessionResource) {
        const ingestedSegments = A.filter(session.captureSegments, isIngestedCaptureSegment);

        if (ingestedSegments.length === 0) {
          return yield* makeLocalProviderError(
            "No ingested capture artifacts were available for local Whisper transcription."
          );
        }

        const artifactPaths = pipe(
          ingestedSegments,
          A.reduce(A.empty<string>(), (paths, segment) =>
            O.match(segment.artifactPath, {
              onNone: () => paths,
              onSome: (artifactPath) => A.append(paths, artifactPath),
            })
          )
        );

        if (artifactPaths.length !== ingestedSegments.length) {
          return yield* makeLocalProviderError(
            "One or more ingested capture segments were missing artifact paths required for transcription."
          );
        }

        const missingArtifact = yield* Effect.forEach(artifactPaths, (artifactPath) =>
          fs.exists(artifactPath).pipe(
            Effect.orElseSucceed(() => false),
            Effect.map((exists) => ({ artifactPath, exists }))
          )
        ).pipe(Effect.map(A.findFirst((candidate) => !candidate.exists)));

        if (O.isSome(missingArtifact)) {
          return yield* makeLocalProviderError(
            `The local Whisper transcript provider could not read "${missingArtifact.value.artifactPath}".`
          );
        }

        const runtime = yield* resolveTranscriptRuntime();

        if (runtime.status !== "ready") {
          return yield* makeLocalProviderError(runtime.detail);
        }

        const pythonCommand = runtime.resolvedCommand;
        const commandResult = yield* Effect.tryPromise({
          try: async () => {
            const processHandle = Bun.spawn(
              [
                pythonCommand,
                "-c",
                localWhisperPythonSource,
                "--model",
                config.transcriptWhisperModel,
                ...artifactPaths,
              ],
              {
                stdout: "pipe",
                stderr: "pipe",
              }
            );
            const [exitCode, stdout, stderr] = await Promise.all([
              processHandle.exited,
              new Response(processHandle.stdout).text(),
              new Response(processHandle.stderr).text(),
            ]);

            return { exitCode, stdout, stderr };
          },
          catch: () => makeLocalProviderError("Failed to launch the local Whisper transcript provider."),
        });

        if (commandResult.exitCode !== 0) {
          const stderr = pipe(commandResult.stderr, Str.trim);

          return yield* makeLocalProviderError(
            Str.isNonEmpty(stderr)
              ? stderr
              : "The local Whisper transcript provider exited before returning a transcript."
          );
        }

        const decoded = yield* decodeLocalWhisperTranscriptEnvelopeJson(commandResult.stdout).pipe(
          Effect.mapError(() =>
            makeLocalProviderError("The local Whisper transcript provider returned an invalid JSON payload.")
          )
        );
        const normalizedText = normalizeTranscriptText(decoded.text);

        if (!Str.isNonEmpty(normalizedText)) {
          return yield* makeLocalProviderError(
            "The local Whisper transcript provider returned an empty transcript. Try a longer spoken clip."
          );
        }

        return buildReadyTranscriptProjection(session.session.id, normalizedText, decoded.language);
      });

      return Vt2TranscriptProvider.of({ inspectRuntime, transcribe });
    })
  );

const localMemoryContextProviderLayer = Layer.succeed(
  Vt2MemoryContextProvider,
  Vt2MemoryContextProvider.of({
    fetchContext: localMemoryContextFetch,
  })
);

const localCompositionProviderLayer = Layer.succeed(
  Vt2CompositionProvider,
  Vt2CompositionProvider.of({
    prepareRun: localCompositionPrepareRun,
  })
);

const localExportProviderLayer = (config: Vt2RuntimeConfig) =>
  Layer.effect(
    Vt2ExportProvider,
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const exportSession = Effect.fn("Vt2ExportProvider.exportSession")(function* (request: Vt2ExportRequest) {
        const createdAt = yield* DateTime.now;
        const defaultDirectory = path.resolve(config.appDataDir, "exports", request.sessionId, request.runId);
        const resolvedDestinationPath = O.getOrElse(request.destinationPath, () =>
          FilePath.make(
            path.resolve(
              defaultDirectory,
              `${normalizeExportSlug(request.sessionTitle)}.${exportExtension(request.format)}`
            )
          )
        );
        const destinationDirectory = path.dirname(resolvedDestinationPath);

        yield* fs
          .makeDirectory(destinationDirectory, { recursive: true })
          .pipe(Effect.mapError(() => makeLocalProviderError("Failed to create the V2T export directory.")));
        yield* fs
          .writeFileString(resolvedDestinationPath, renderLocalExportContent(request))
          .pipe(Effect.mapError(() => makeLocalProviderError("Failed to write the V2T export artifact.")));

        return new Vt2ExportArtifact({
          id: UUID.make(crypto.randomUUID()),
          sessionId: request.sessionId,
          format: request.format,
          status: "ready",
          filePath: O.some(resolvedDestinationPath),
          createdAt,
        });
      });

      return Vt2ExportProvider.of({
        exportSession,
      });
    })
  );

const makeSessionSummary = (
  row: Vt2SessionRow,
  transcript: Vt2Transcript,
  captureSegments: ReadonlyArray<Vt2CaptureSegment>,
  recoveryCandidates: ReadonlyArray<Vt2RecoveryCandidate>,
  exportArtifacts: ReadonlyArray<Vt2ExportArtifact>
): Vt2Session =>
  new Vt2Session({
    id: row.id,
    projectId: O.fromNullishOr(row.project_id),
    source: row.source,
    status: row.status,
    title: row.title,
    workingDirectory: O.fromNullishOr(row.working_directory).pipe(O.map(FilePath.make)),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    transcriptStatus: transcript.status,
    captureSegmentCount: NonNegativeInt.make(captureSegments.length),
    recoveryCandidateCount: NonNegativeInt.make(recoveryCandidates.length),
    exportArtifactCount: NonNegativeInt.make(exportArtifacts.length),
  });

const decodeSessionResource = Effect.fn("Vt2Runtime.decodeSessionResource")(function* (
  row: Vt2SessionRow
): Effect.fn.Return<Vt2SessionResource, Vt2RuntimeError> {
  const transcript = yield* decodeTranscriptJson(row.transcript_json).pipe(
    Vt2RuntimeError.mapError("Failed to decode the persisted V2T transcript.", 500)
  );
  const captureSegments = yield* decodeCaptureSegmentsJson(row.capture_segments_json).pipe(
    Vt2RuntimeError.mapError("Failed to decode the persisted V2T capture segments.", 500)
  );
  const recoveryCandidates = yield* decodeRecoveryCandidatesJson(row.recovery_candidates_json).pipe(
    Vt2RuntimeError.mapError("Failed to decode the persisted V2T recovery candidates.", 500)
  );
  const memoryContextPackets = yield* decodeMemoryContextPacketsJson(row.memory_context_packets_json).pipe(
    Vt2RuntimeError.mapError("Failed to decode the persisted V2T memory context packets.", 500)
  );
  const compositionProfiles = yield* decodeCompositionProfilesJson(row.composition_profiles_json).pipe(
    Vt2RuntimeError.mapError("Failed to decode the persisted V2T composition profiles.", 500)
  );
  const compositionRuns = yield* decodeCompositionRunsJson(row.composition_runs_json).pipe(
    Vt2RuntimeError.mapError("Failed to decode the persisted V2T composition runs.", 500)
  );
  const exportArtifacts = yield* decodeExportArtifactsJson(row.export_artifacts_json).pipe(
    Vt2RuntimeError.mapError("Failed to decode the persisted V2T export artifacts.", 500)
  );

  return new Vt2SessionResource({
    session: makeSessionSummary(row, transcript, captureSegments, recoveryCandidates, exportArtifacts),
    transcript,
    captureSegments,
    recoveryCandidates,
    memoryContextPackets,
    compositionProfiles,
    compositionRuns,
    exportArtifacts,
  });
});

const makeVt2Store = Effect.fn("Vt2Store.make")(function* (config: Vt2RuntimeConfig, startedAt: DateTime.Utc) {
  const sql = yield* SqlClient.SqlClient;
  const path = yield* Path.Path;
  const transcriptProvider = yield* Vt2TranscriptProvider;
  const memoryContextProvider = yield* Vt2MemoryContextProvider;
  const compositionProvider = yield* Vt2CompositionProvider;
  const exportProvider = yield* Vt2ExportProvider;
  const sessionsTable = sql("vt2_sessions");
  const preferencesTable = sql("vt2_desktop_preferences");

  const initializeTables = Effect.fn("Vt2Store.initializeTables")(function* (): Effect.fn.Return<
    void,
    Vt2RuntimeError
  > {
    yield* sql`PRAGMA busy_timeout = 5000`.pipe(
      Vt2RuntimeError.mapError("Failed to configure the V2T sqlite busy timeout.", 500)
    );

    yield* sql`
      CREATE TABLE IF NOT EXISTS ${sessionsTable} (
        id TEXT PRIMARY KEY,
        project_id TEXT,
        source TEXT NOT NULL,
        status TEXT NOT NULL,
        title TEXT NOT NULL,
        working_directory TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        transcript_json TEXT NOT NULL,
        capture_segments_json TEXT NOT NULL,
        recovery_candidates_json TEXT NOT NULL,
        memory_context_packets_json TEXT NOT NULL,
        composition_profiles_json TEXT NOT NULL,
        composition_runs_json TEXT NOT NULL,
        export_artifacts_json TEXT NOT NULL
      )
    `.pipe(Vt2RuntimeError.mapError("Failed to create the V2T sessions table.", 500));

    const sessionColumns = yield* sql<{ readonly name: string }>`PRAGMA table_info(${sessionsTable})`.pipe(
      Vt2RuntimeError.mapError("Failed to inspect the V2T sessions table columns.", 500)
    );
    const sessionColumnNames = pipe(
      sessionColumns,
      A.map((column) => column.name)
    );

    if (!pipe(sessionColumnNames, A.contains("memory_context_packets_json"))) {
      yield* sql`ALTER TABLE ${sessionsTable} ADD COLUMN memory_context_packets_json TEXT NOT NULL DEFAULT '[]'`.pipe(
        Vt2RuntimeError.mapError("Failed to migrate the V2T memory context packets column.", 500)
      );
    }

    if (!pipe(sessionColumnNames, A.contains("composition_runs_json"))) {
      yield* sql`ALTER TABLE ${sessionsTable} ADD COLUMN composition_runs_json TEXT NOT NULL DEFAULT '[]'`.pipe(
        Vt2RuntimeError.mapError("Failed to migrate the V2T composition runs column.", 500)
      );
    }

    yield* sql`
      CREATE TABLE IF NOT EXISTS ${preferencesTable} (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        preferences_json TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `.pipe(Vt2RuntimeError.mapError("Failed to create the V2T desktop preferences table.", 500));

    const encodedPreferences = yield* encodePreferencesJson(defaultVt2DesktopPreferences()).pipe(
      Vt2RuntimeError.mapError("Failed to encode the default V2T desktop preferences.", 500)
    );
    const now = yield* DateTime.now;

    yield* sql`
      INSERT OR IGNORE INTO ${preferencesTable} (id, preferences_json, updated_at)
      VALUES (1, ${encodedPreferences}, ${DateTime.toEpochMillis(now)})
    `.pipe(Vt2RuntimeError.mapError("Failed to seed the V2T desktop preferences row.", 500));
  });

  const getSessionRow = Effect.fn("Vt2Store.getSessionRow")(function* (
    sessionId: string
  ): Effect.fn.Return<Vt2SessionRow, Vt2RuntimeError> {
    const rows = yield* sql<Vt2SessionRow>`
      SELECT id,
        project_id,
        source,
        status,
        title,
        working_directory,
        created_at,
        updated_at,
        transcript_json,
        capture_segments_json,
        recovery_candidates_json,
        memory_context_packets_json,
        composition_profiles_json,
        composition_runs_json,
        export_artifacts_json
      FROM ${sessionsTable}
      WHERE id = ${sessionId}
      LIMIT 1
    `.pipe(Vt2RuntimeError.mapError(`Failed to load the V2T session "${sessionId}".`, 500));

    return yield* O.match(A.head(rows), {
      onNone: () => Effect.fail(Vt2RuntimeError.noCause(`Session "${sessionId}" was not found.`, 404)),
      onSome: (found) =>
        decodeSessionRow(found).pipe(
          Vt2RuntimeError.mapError(`Failed to decode the persisted V2T session "${sessionId}".`, 500)
        ),
    });
  });

  const listSessionRows = Effect.gen(function* () {
    const rows = yield* sql<Vt2SessionRow>`
      SELECT id,
        project_id,
        source,
        status,
        title,
        working_directory,
        created_at,
        updated_at,
        transcript_json,
        capture_segments_json,
        recovery_candidates_json,
        memory_context_packets_json,
        composition_profiles_json,
        composition_runs_json,
        export_artifacts_json
      FROM ${sessionsTable}
      ORDER BY updated_at DESC
    `.pipe(Vt2RuntimeError.mapError("Failed to list V2T sessions.", 500));

    return yield* Effect.forEach(rows, (row) =>
      decodeSessionRow(row).pipe(Vt2RuntimeError.mapError("Failed to decode a persisted V2T session row.", 500))
    );
  });

  const loadPreferences = Effect.gen(function* () {
    const rows = yield* sql<Vt2DesktopPreferencesRow>`
      SELECT id, preferences_json, updated_at
      FROM ${preferencesTable}
      WHERE id = 1
      LIMIT 1
    `.pipe(Vt2RuntimeError.mapError("Failed to load the V2T desktop preferences.", 500));

    const row = yield* O.match(A.head(rows), {
      onNone: () => Effect.fail(Vt2RuntimeError.noCause("V2T desktop preferences were not found.", 404)),
      onSome: (found) =>
        decodePreferencesRow(found).pipe(
          Vt2RuntimeError.mapError("Failed to decode the persisted V2T desktop preferences row.", 500)
        ),
    });

    return yield* decodePreferencesJson(row.preferences_json).pipe(
      Vt2RuntimeError.mapError("Failed to decode the persisted V2T desktop preferences.", 500)
    );
  });

  const bootstrap: Effect.Effect<SidecarBootstrap, Vt2RuntimeError> = Effect.succeed(
    makeBootstrap(config, startedAt, "healthy")
  );

  const getPreferences: Effect.Effect<Vt2DesktopPreferences, Vt2RuntimeError> = loadPreferences;

  const listSessions: Effect.Effect<ReadonlyArray<Vt2Session>, Vt2RuntimeError> = listSessionRows.pipe(
    Effect.flatMap((rows) => Effect.forEach(rows, decodeSessionResource)),
    Effect.map((resources) => A.map(resources, (resource) => resource.session))
  );

  const getSession = Effect.fn("Vt2Store.getSession")(function* (
    sessionId: string
  ): Effect.fn.Return<Vt2SessionResource, Vt2RuntimeError> {
    const row = yield* getSessionRow(sessionId);

    return yield* decodeSessionResource(row);
  });

  const persistSessionResource = Effect.fn("Vt2Store.persistSessionResource")(function* (
    resource: Vt2SessionResource
  ): Effect.fn.Return<Vt2SessionResource, Vt2RuntimeError> {
    const encodedTranscript = yield* encodeTranscriptJson(resource.transcript).pipe(
      Vt2RuntimeError.mapError(`Failed to encode the V2T transcript for session "${resource.session.id}".`, 500)
    );
    const encodedCaptureSegments = yield* encodeCaptureSegmentsJson(resource.captureSegments).pipe(
      Vt2RuntimeError.mapError(`Failed to encode the V2T capture segments for session "${resource.session.id}".`, 500)
    );
    const encodedRecoveryCandidates = yield* encodeRecoveryCandidatesJson(resource.recoveryCandidates).pipe(
      Vt2RuntimeError.mapError(
        `Failed to encode the V2T recovery candidates for session "${resource.session.id}".`,
        500
      )
    );
    const encodedMemoryContextPackets = yield* encodeMemoryContextPacketsJson(resource.memoryContextPackets).pipe(
      Vt2RuntimeError.mapError(
        `Failed to encode the V2T memory context packets for session "${resource.session.id}".`,
        500
      )
    );
    const encodedCompositionProfiles = yield* encodeCompositionProfilesJson(resource.compositionProfiles).pipe(
      Vt2RuntimeError.mapError(
        `Failed to encode the V2T composition profiles for session "${resource.session.id}".`,
        500
      )
    );
    const encodedCompositionRuns = yield* encodeCompositionRunsJson(resource.compositionRuns).pipe(
      Vt2RuntimeError.mapError(`Failed to encode the V2T composition runs for session "${resource.session.id}".`, 500)
    );
    const encodedExportArtifacts = yield* encodeExportArtifactsJson(resource.exportArtifacts).pipe(
      Vt2RuntimeError.mapError(`Failed to encode the V2T export artifacts for session "${resource.session.id}".`, 500)
    );

    yield* sql`
      UPDATE ${sessionsTable}
      SET status = ${resource.session.status},
        title = ${resource.session.title},
        working_directory = ${toNullableString(resource.session.workingDirectory)},
        updated_at = ${DateTime.toEpochMillis(resource.session.updatedAt)},
        transcript_json = ${encodedTranscript},
        capture_segments_json = ${encodedCaptureSegments},
        recovery_candidates_json = ${encodedRecoveryCandidates},
        memory_context_packets_json = ${encodedMemoryContextPackets},
        composition_profiles_json = ${encodedCompositionProfiles},
        composition_runs_json = ${encodedCompositionRuns},
        export_artifacts_json = ${encodedExportArtifacts}
      WHERE id = ${resource.session.id}
    `.pipe(Vt2RuntimeError.mapError(`Failed to persist the V2T session "${resource.session.id}".`, 500));

    return resource;
  });

  const rebuildSessionResource = (
    resource: Vt2SessionResource,
    updatedAt: DateTime.Utc,
    overrides: {
      readonly status: Vt2SessionStatus;
      readonly transcript: Vt2Transcript;
      readonly captureSegments: ReadonlyArray<Vt2CaptureSegment>;
      readonly recoveryCandidates: ReadonlyArray<Vt2RecoveryCandidate>;
      readonly memoryContextPackets?: undefined | ReadonlyArray<Vt2MemoryContextPacket>;
      readonly compositionProfiles?: undefined | ReadonlyArray<Vt2CompositionProfile>;
      readonly compositionRuns?: undefined | ReadonlyArray<Vt2CompositionRun>;
      readonly exportArtifacts?: undefined | ReadonlyArray<Vt2ExportArtifact>;
    }
  ): Vt2SessionResource =>
    new Vt2SessionResource({
      session: new Vt2Session({
        id: resource.session.id,
        projectId: resource.session.projectId,
        source: resource.session.source,
        status: overrides.status,
        title: resource.session.title,
        workingDirectory: resource.session.workingDirectory,
        createdAt: resource.session.createdAt,
        updatedAt,
        transcriptStatus: overrides.transcript.status,
        captureSegmentCount: NonNegativeInt.make(overrides.captureSegments.length),
        recoveryCandidateCount: NonNegativeInt.make(overrides.recoveryCandidates.length),
        exportArtifactCount: NonNegativeInt.make((overrides.exportArtifacts ?? resource.exportArtifacts).length),
      }),
      transcript: overrides.transcript,
      captureSegments: overrides.captureSegments,
      recoveryCandidates: overrides.recoveryCandidates,
      memoryContextPackets: overrides.memoryContextPackets ?? resource.memoryContextPackets,
      compositionProfiles: overrides.compositionProfiles ?? resource.compositionProfiles,
      compositionRuns: overrides.compositionRuns ?? resource.compositionRuns,
      exportArtifacts: overrides.exportArtifacts ?? resource.exportArtifacts,
    });

  const transcribeSessionResource = Effect.fn("Vt2Store.transcribeSessionResource")(function* (
    resource: Vt2SessionResource
  ): Effect.fn.Return<Vt2SessionResource, Vt2RuntimeError> {
    if (A.some(resource.recoveryCandidates, isPendingRecoveryCandidate)) {
      return resource;
    }

    if (!A.some(resource.captureSegments, isIngestedCaptureSegment)) {
      return resource;
    }

    const transcribingAt = yield* DateTime.now;
    const transcribingTranscript = new Vt2Transcript({
      sessionId: resource.session.id,
      status: "processing",
      text: O.none(),
      excerpt: O.none(),
      language: O.none(),
      wordCount: NonNegativeInt.make(0),
      failureReason: O.none(),
    });
    const transcribingResource = rebuildSessionResource(resource, transcribingAt, {
      status: "transcribing",
      transcript: transcribingTranscript,
      captureSegments: resource.captureSegments,
      recoveryCandidates: resource.recoveryCandidates,
    });

    yield* persistSessionResource(transcribingResource);

    return yield* transcriptProvider.transcribe(transcribingResource).pipe(
      Effect.matchEffect({
        onFailure: (error) =>
          DateTime.now.pipe(
            Effect.flatMap((updatedAt) =>
              persistSessionResource(
                rebuildSessionResource(transcribingResource, updatedAt, {
                  status: "failed",
                  transcript: buildTranscriptFailureProjection(
                    resource.session.id,
                    error.message.length > 0
                      ? error.message
                      : "The local Whisper transcript provider could not produce a transcript."
                  ),
                  captureSegments: resource.captureSegments,
                  recoveryCandidates: resource.recoveryCandidates,
                })
              )
            )
          ),
        onSuccess: (nextTranscript) =>
          DateTime.now.pipe(
            Effect.flatMap((updatedAt) =>
              persistSessionResource(
                rebuildSessionResource(transcribingResource, updatedAt, {
                  status: resolveSessionStatusFromArtifacts(
                    resource.captureSegments,
                    resource.recoveryCandidates,
                    nextTranscript
                  ),
                  transcript: nextTranscript,
                  captureSegments: resource.captureSegments,
                  recoveryCandidates: resource.recoveryCandidates,
                })
              )
            )
          ),
      })
    );
  });

  const getWorkspace: Effect.Effect<Vt2WorkspaceSnapshot, Vt2RuntimeError> = Effect.gen(function* () {
    const preferences = yield* loadPreferences;
    const rows = yield* listSessionRows;
    const resources = yield* Effect.forEach(rows, decodeSessionResource);
    const recoveryCandidates = A.flatMap(resources, (resource) => resource.recoveryCandidates);
    const transcriptRuntime = yield* transcriptProvider.inspectRuntime;

    return new Vt2WorkspaceSnapshot({
      projects: A.empty(),
      sessions: A.map(resources, (resource) => resource.session),
      recoveryCandidates,
      preferences,
      seams: defaultVt2WorkspaceSeams(),
      transcriptRuntime,
      supportedSessionSources,
    });
  });

  const savePreferences = Effect.fn("Vt2Store.savePreferences")(function* (
    input: UpdateVt2DesktopPreferencesInput
  ): Effect.fn.Return<Vt2DesktopPreferences, Vt2RuntimeError> {
    const updatedAt = yield* DateTime.now;
    const nextPreferences = new Vt2DesktopPreferences({
      preferredSessionSource: input.preferredSessionSource,
      workspaceDirectory: input.workspaceDirectory,
      captureSurface: input.captureSurface,
      autoRecoverInterruptions: input.autoRecoverInterruptions,
      includeMemoryByDefault: input.includeMemoryByDefault,
      lastOpenedAt: input.lastOpenedAt,
    });
    const encodedPreferences = yield* encodePreferencesJson(nextPreferences).pipe(
      Vt2RuntimeError.mapError("Failed to encode the updated V2T desktop preferences.", 500)
    );

    yield* sql`
      UPDATE ${preferencesTable}
      SET preferences_json = ${encodedPreferences},
        updated_at = ${DateTime.toEpochMillis(updatedAt)}
      WHERE id = 1
    `.pipe(Vt2RuntimeError.mapError("Failed to persist the V2T desktop preferences.", 500));

    return nextPreferences;
  });

  const createSession = Effect.fn("Vt2Store.createSession")(function* (
    input: CreateVt2SessionInput
  ): Effect.fn.Return<Vt2SessionResource, Vt2RuntimeError> {
    const sessionId = UUID.make(crypto.randomUUID());
    const now = yield* DateTime.now;
    const transcript = makeDefaultTranscript(sessionId);
    const captureSegments = A.empty<Vt2CaptureSegment>();
    const recoveryCandidates = A.empty<Vt2RecoveryCandidate>();
    const memoryContextPackets = A.empty<Vt2MemoryContextPacket>();
    const compositionProfiles = makeDefaultCompositionProfiles();
    const compositionRuns = A.empty<Vt2CompositionRun>();
    const exportArtifacts = A.empty<Vt2ExportArtifact>();

    const encodedTranscript = yield* encodeTranscriptJson(transcript).pipe(
      Vt2RuntimeError.mapError("Failed to encode the new V2T transcript scaffold.", 500)
    );
    const encodedCaptureSegments = yield* encodeCaptureSegmentsJson(captureSegments).pipe(
      Vt2RuntimeError.mapError("Failed to encode the new V2T capture segment scaffold.", 500)
    );
    const encodedRecoveryCandidates = yield* encodeRecoveryCandidatesJson(recoveryCandidates).pipe(
      Vt2RuntimeError.mapError("Failed to encode the new V2T recovery scaffold.", 500)
    );
    const encodedMemoryContextPackets = yield* encodeMemoryContextPacketsJson(memoryContextPackets).pipe(
      Vt2RuntimeError.mapError("Failed to encode the new V2T memory context scaffold.", 500)
    );
    const encodedCompositionProfiles = yield* encodeCompositionProfilesJson(compositionProfiles).pipe(
      Vt2RuntimeError.mapError("Failed to encode the new V2T composition scaffold.", 500)
    );
    const encodedCompositionRuns = yield* encodeCompositionRunsJson(compositionRuns).pipe(
      Vt2RuntimeError.mapError("Failed to encode the new V2T composition run scaffold.", 500)
    );
    const encodedExportArtifacts = yield* encodeExportArtifactsJson(exportArtifacts).pipe(
      Vt2RuntimeError.mapError("Failed to encode the new V2T export scaffold.", 500)
    );

    yield* sql`
      INSERT INTO ${sessionsTable} (
        id,
        project_id,
        source,
        status,
        title,
        working_directory,
        created_at,
        updated_at,
        transcript_json,
        capture_segments_json,
        recovery_candidates_json,
        memory_context_packets_json,
        composition_profiles_json,
        composition_runs_json,
        export_artifacts_json
      )
      VALUES (
        ${sessionId},
        ${toNullableString(input.projectId)},
        ${input.source},
        ${"draft"},
        ${input.title},
        ${toNullableString(input.workingDirectory)},
        ${DateTime.toEpochMillis(now)},
        ${DateTime.toEpochMillis(now)},
        ${encodedTranscript},
        ${encodedCaptureSegments},
        ${encodedRecoveryCandidates},
        ${encodedMemoryContextPackets},
        ${encodedCompositionProfiles},
        ${encodedCompositionRuns},
        ${encodedExportArtifacts}
      )
    `.pipe(Vt2RuntimeError.mapError("Failed to create a V2T session scaffold.", 500));

    return new Vt2SessionResource({
      session: new Vt2Session({
        id: sessionId,
        projectId: input.projectId,
        source: input.source,
        status: "draft",
        title: input.title,
        workingDirectory: input.workingDirectory,
        createdAt: now,
        updatedAt: now,
        transcriptStatus: transcript.status,
        captureSegmentCount: NonNegativeInt.make(0),
        recoveryCandidateCount: NonNegativeInt.make(0),
        exportArtifactCount: NonNegativeInt.make(0),
      }),
      transcript,
      captureSegments,
      recoveryCandidates,
      memoryContextPackets,
      compositionProfiles,
      compositionRuns,
      exportArtifacts,
    });
  });

  const startCapture = Effect.fn("Vt2Store.startCapture")(function* (
    sessionId: string
  ): Effect.fn.Return<Vt2SessionResource, Vt2RuntimeError> {
    const resource = yield* getSession(sessionId);

    if (resource.session.source !== "record") {
      return yield* Vt2RuntimeError.noCause(
        `Session "${sessionId}" does not support native capture because it is an import session.`,
        400
      );
    }

    if (resource.session.status === "capturing") {
      return yield* Vt2RuntimeError.noCause(`Session "${sessionId}" is already capturing.`, 400);
    }

    if (A.some(resource.recoveryCandidates, isPendingRecoveryCandidate)) {
      return yield* Vt2RuntimeError.noCause(
        `Session "${sessionId}" has pending recovery work that must be resolved before starting another capture.`,
        400
      );
    }

    const updatedAt = yield* DateTime.now;
    const nextResource = rebuildSessionResource(resource, updatedAt, {
      status: "capturing",
      transcript: resource.transcript,
      captureSegments: resource.captureSegments,
      recoveryCandidates: resource.recoveryCandidates,
    });

    return yield* persistSessionResource(nextResource);
  });

  const completeCapture = Effect.fn("Vt2Store.completeCapture")(function* (
    sessionId: string,
    input: CompleteVt2CaptureInput
  ): Effect.fn.Return<Vt2SessionResource, Vt2RuntimeError> {
    const resource = yield* getSession(sessionId);

    if (resource.session.source !== "record") {
      return yield* Vt2RuntimeError.noCause(
        `Session "${sessionId}" does not support native capture because it is an import session.`,
        400
      );
    }

    if (resource.session.status !== "capturing") {
      return yield* Vt2RuntimeError.noCause(`Session "${sessionId}" is not currently capturing.`, 400);
    }

    const updatedAt = yield* DateTime.now;
    const segmentId = UUID.make(crypto.randomUUID());
    const nextSegment = new Vt2CaptureSegment({
      id: segmentId,
      sessionId: resource.session.id,
      status: input.interrupted ? "recoverable" : "ingested",
      sequence: NonNegativeInt.make(resource.captureSegments.length),
      durationMs: input.durationMs,
      artifactPath: O.some(input.artifactPath),
      persistedAt: O.some(updatedAt),
    });
    const nextCaptureSegments = A.append(resource.captureSegments, nextSegment);
    const nextRecoveryCandidates = input.interrupted
      ? A.append(
          resource.recoveryCandidates,
          new Vt2RecoveryCandidate({
            id: UUID.make(crypto.randomUUID()),
            sessionId: resource.session.id,
            segmentId,
            reason: O.getOrElse(input.interruptionReason, () =>
              NonEmptyTrimmedStr.make("Native capture was interrupted before downstream intake.")
            ),
            disposition: "pending",
            discoveredAt: updatedAt,
          })
        )
      : resource.recoveryCandidates;
    const nextTranscript = buildTranscriptProjection(resource.session.id, nextCaptureSegments, nextRecoveryCandidates);
    const nextStatus = resolveSessionStatusFromArtifacts(
      nextCaptureSegments,
      nextRecoveryCandidates,
      nextTranscript,
      false
    );
    const nextResource = rebuildSessionResource(resource, updatedAt, {
      status: nextStatus,
      transcript: nextTranscript,
      captureSegments: nextCaptureSegments,
      recoveryCandidates: nextRecoveryCandidates,
    });

    const persistedResource = yield* persistSessionResource(nextResource);

    return yield* transcribeSessionResource(persistedResource);
  });

  const retryTranscript = Effect.fn("Vt2Store.retryTranscript")(function* (
    sessionId: string
  ): Effect.fn.Return<Vt2SessionResource, Vt2RuntimeError> {
    const resource = yield* getSession(sessionId);

    if (resource.transcript.status === "processing") {
      return yield* Vt2RuntimeError.noCause(`Session "${sessionId}" is already transcribing.`, 400);
    }

    if (A.some(resource.recoveryCandidates, isPendingRecoveryCandidate)) {
      return yield* Vt2RuntimeError.noCause(
        `Session "${sessionId}" still has pending recovery work and cannot retry transcription yet.`,
        400
      );
    }

    if (!A.some(resource.captureSegments, isIngestedCaptureSegment)) {
      return yield* Vt2RuntimeError.noCause(
        `Session "${sessionId}" does not have ingested capture media ready for transcription.`,
        400
      );
    }

    return yield* transcribeSessionResource(resource);
  });

  const resolveRecoveryCandidate = Effect.fn("Vt2Store.resolveRecoveryCandidate")(function* (
    sessionId: string,
    candidateId: string,
    input: ResolveVt2RecoveryCandidateInput
  ): Effect.fn.Return<Vt2SessionResource, Vt2RuntimeError> {
    const resource = yield* getSession(sessionId);
    const existingCandidate = yield* pipe(
      resource.recoveryCandidates,
      A.findFirst(hasRecoveryCandidateId(candidateId)),
      Effect.fromOption,
      Effect.mapError(() =>
        Vt2RuntimeError.noCause(`Recovery candidate "${candidateId}" was not found for session "${sessionId}".`, 404)
      )
    );

    if (!isPendingRecoveryCandidate(existingCandidate)) {
      return yield* Vt2RuntimeError.noCause(`Recovery candidate "${candidateId}" has already been resolved.`, 400);
    }

    const existingSegment = yield* pipe(
      resource.captureSegments,
      A.findFirst(hasCaptureSegmentId(existingCandidate.segmentId)),
      Effect.fromOption,
      Effect.mapError(() =>
        Vt2RuntimeError.noCause(`Recovery candidate "${candidateId}" referenced a missing capture segment.`, 404)
      )
    );

    const updatedAt = yield* DateTime.now;
    const nextRecoveryCandidates = A.map(resource.recoveryCandidates, (item) =>
      item.id === existingCandidate.id
        ? new Vt2RecoveryCandidate({
            id: item.id,
            sessionId: item.sessionId,
            segmentId: item.segmentId,
            reason: item.reason,
            disposition: input.disposition,
            discoveredAt: item.discoveredAt,
          })
        : item
    );
    const nextCaptureSegments = A.map(resource.captureSegments, (item) =>
      item.id === existingSegment.id
        ? new Vt2CaptureSegment({
            id: item.id,
            sessionId: item.sessionId,
            status: captureSegmentStatusForRecovery(input.disposition),
            sequence: item.sequence,
            durationMs: item.durationMs,
            artifactPath: item.artifactPath,
            persistedAt: item.persistedAt,
          })
        : item
    );
    const nextTranscript = buildTranscriptProjection(resource.session.id, nextCaptureSegments, nextRecoveryCandidates);
    const nextStatus = resolveSessionStatusFromArtifacts(
      nextCaptureSegments,
      nextRecoveryCandidates,
      nextTranscript,
      false
    );
    const nextResource = rebuildSessionResource(resource, updatedAt, {
      status: nextStatus,
      transcript: nextTranscript,
      captureSegments: nextCaptureSegments,
      recoveryCandidates: nextRecoveryCandidates,
    });

    const persistedResource = yield* persistSessionResource(nextResource);

    return yield* transcribeSessionResource(persistedResource);
  });

  const runComposition = Effect.fn("Vt2Store.runComposition")(function* (
    sessionId: string,
    input: RunVt2CompositionInput
  ): Effect.fn.Return<Vt2SessionResource, Vt2RuntimeError> {
    const resource = yield* getSession(sessionId);
    const preferences = yield* loadPreferences;

    if (A.some(resource.recoveryCandidates, isPendingRecoveryCandidate)) {
      return yield* Vt2RuntimeError.noCause(
        `Session "${sessionId}" still has pending recovery work and cannot compose yet.`,
        400
      );
    }

    const transcriptExcerpt = yield* O.match(resource.transcript.excerpt, {
      onNone: () =>
        Effect.fail(
          Vt2RuntimeError.noCause(
            `Session "${sessionId}" does not have a transcript excerpt ready for composition yet.`,
            400
          )
        ),
      onSome: Effect.succeed,
    });
    const profile = A.findFirst(resource.compositionProfiles, (item) => item.id === input.profileId);
    const selectedProfile = yield* O.match(profile, {
      onNone: () =>
        Effect.fail(
          Vt2RuntimeError.noCause(
            `Composition profile "${input.profileId}" was not found for session "${sessionId}".`,
            404
          )
        ),
      onSome: Effect.succeed,
    });
    const includeMemoryContext = selectedProfile.includeMemoryContext && preferences.includeMemoryByDefault;
    const packet = new Vt2CompositionPacket({
      sessionId: resource.session.id,
      source: resource.session.source,
      transcriptExcerpt: O.some(transcriptExcerpt),
      includeMemoryContext,
      targetFormats: input.targetFormats,
    });
    const memoryContextPacket = yield* includeMemoryContext
      ? memoryContextProvider
          .fetchContext(resource, packet)
          .pipe(Effect.map(O.some), Effect.mapError(toProviderRuntimeError("Failed to retrieve V2T memory context.")))
      : Effect.succeed(O.none<Vt2MemoryContextPacket>());

    const preparedRun = yield* compositionProvider
      .prepareRun(resource, selectedProfile, preferences, packet, memoryContextPacket)
      .pipe(Effect.mapError(toProviderRuntimeError("Failed to prepare the V2T composition run.")));
    const destinationDirectory = pipe(
      input.destinationDirectory,
      O.orElse(() => resource.session.workingDirectory)
    );
    const exportRequests = A.map(
      packet.targetFormats,
      (format) =>
        new Vt2ExportRequest({
          runId: preparedRun.id,
          sessionId: resource.session.id,
          sessionTitle: resource.session.title,
          format,
          packet,
          transcriptExcerpt: O.some(transcriptExcerpt),
          memoryContextPacketId: O.map(memoryContextPacket, (context) => context.id),
          destinationPath: O.map(destinationDirectory, (directory) =>
            FilePath.make(
              path.resolve(directory, `${normalizeExportSlug(resource.session.title)}.${exportExtension(format)}`)
            )
          ),
        })
    );
    const exportArtifacts = yield* Effect.forEach(exportRequests, exportProvider.exportSession).pipe(
      Effect.mapError(toProviderRuntimeError("Failed to materialize the V2T export artifacts."))
    );
    const finalizedRun = new Vt2CompositionRun({
      id: preparedRun.id,
      sessionId: preparedRun.sessionId,
      profileId: preparedRun.profileId,
      status: "exported",
      packet: preparedRun.packet,
      memoryContextPacketId: preparedRun.memoryContextPacketId,
      exportArtifactIds: A.map(exportArtifacts, (artifact) => artifact.id),
      createdAt: preparedRun.createdAt,
    });
    const updatedAt = yield* DateTime.now;
    const nextResource = rebuildSessionResource(resource, updatedAt, {
      status: "completed",
      transcript: resource.transcript,
      captureSegments: resource.captureSegments,
      recoveryCandidates: resource.recoveryCandidates,
      memoryContextPackets: O.match(memoryContextPacket, {
        onNone: () => resource.memoryContextPackets,
        onSome: (context) => A.append(resource.memoryContextPackets, context),
      }),
      compositionRuns: A.append(resource.compositionRuns, finalizedRun),
      exportArtifacts: A.appendAll(resource.exportArtifacts, exportArtifacts),
    });

    return yield* persistSessionResource(nextResource);
  });

  yield* initializeTables();

  return {
    bootstrap,
    completeCapture,
    createSession,
    getPreferences,
    getSession,
    getWorkspace,
    listSessions,
    resolveRecoveryCandidate,
    retryTranscript,
    runComposition,
    savePreferences,
    startCapture,
  } satisfies Vt2Store;
});

const handleInternalControlPlane = <A>(effect: Effect.Effect<A, Vt2RuntimeError>) =>
  effect.pipe(
    Effect.catchCause((cause) =>
      Effect.fail(
        new SidecarInternalErrorPayload({
          message: matchUnknownMessage(Cause.squash(cause)),
          status: 500,
        })
      )
    )
  );

const handleResourceControlPlane = <A>(effect: Effect.Effect<A, Vt2RuntimeError>) =>
  effect.pipe(Effect.catchCause((cause) => Effect.fail(toControlPlanePayload(cause))));

const emitBootstrapStdoutLine = Effect.fn("Vt2Runtime.emitBootstrapStdoutLine")(function* (
  config: Vt2RuntimeConfig,
  startedAt: DateTime.Utc
) {
  const bootstrap = makeBootstrap(config, startedAt, "healthy");
  const encoded = yield* encodeBootstrapStdoutJson(
    new SidecarBootstrapStdoutEvent({
      type: "bootstrap",
      sessionId: bootstrap.sessionId,
      host: bootstrap.host,
      port: bootstrap.port,
      baseUrl: bootstrap.baseUrl,
      pid: bootstrap.pid,
      version: bootstrap.version,
      status: bootstrap.status,
      startedAt: DateTime.toEpochMillis(bootstrap.startedAt),
    })
  ).pipe(Vt2RuntimeError.mapError("Failed to encode the V2T bootstrap line.", 500));

  yield* Effect.sync(() => {
    process.stdout.write(`${encoded}\n`);
  });
});

const controlPlaneHandlersLayer = (config: Vt2RuntimeConfig, startedAt: DateTime.Utc) =>
  Layer.unwrap(
    Effect.gen(function* () {
      const store = yield* makeVt2Store(config, startedAt);

      return Layer.mergeAll(
        HttpApiBuilder.group(Vt2ControlPlaneApi, "system", (handlers) =>
          handlers.handle("health", () => handleInternalControlPlane(store.bootstrap))
        ),
        HttpApiBuilder.group(Vt2ControlPlaneApi, "workspace", (handlers) =>
          handlers
            .handle("getWorkspace", () => handleInternalControlPlane(store.getWorkspace))
            .handle("getPreferences", () => handleInternalControlPlane(store.getPreferences))
            .handle("savePreferences", ({ payload }) => handleInternalControlPlane(store.savePreferences(payload)))
        ),
        HttpApiBuilder.group(Vt2ControlPlaneApi, "sessions", (handlers) =>
          handlers
            .handle("listSessions", () => handleInternalControlPlane(store.listSessions))
            .handle("getSession", ({ params }) => handleResourceControlPlane(store.getSession(params.sessionId)))
            .handle("createSession", ({ payload }) => handleInternalControlPlane(store.createSession(payload)))
            .handle("startCapture", ({ params }) => handleResourceControlPlane(store.startCapture(params.sessionId)))
            .handle("completeCapture", ({ params, payload }) =>
              handleResourceControlPlane(store.completeCapture(params.sessionId, payload))
            )
            .handle("retryTranscript", ({ params }) =>
              handleResourceControlPlane(store.retryTranscript(params.sessionId))
            )
            .handle("resolveRecoveryCandidate", ({ params, payload }) =>
              handleResourceControlPlane(store.resolveRecoveryCandidate(params.sessionId, params.candidateId, payload))
            )
            .handle("runComposition", ({ params, payload }) =>
              handleResourceControlPlane(store.runComposition(params.sessionId, payload))
            )
        )
      );
    })
  ).pipe(
    Layer.provide(sqliteLayer(config).pipe(Layer.provide(bunLayer))),
    Layer.provide(localTranscriptProviderLayer(config)),
    Layer.provide(localExportProviderLayer(config)),
    Layer.provide(localCompositionProviderLayer),
    Layer.provide(localMemoryContextProviderLayer)
  );

const sidecarLayer = (config: Vt2RuntimeConfig, startedAt: DateTime.Utc) => {
  const apiLayer = HttpApiBuilder.layer(Vt2ControlPlaneApi).pipe(
    Layer.provide(controlPlaneHandlersLayer(config, startedAt))
  );

  return HttpRouter.serve(apiLayer, {
    disableListenLog: true,
    disableLogger: true,
  }).pipe(
    Layer.provideMerge(
      Layer.fresh(
        BunHttpServer.layer({
          hostname: config.host,
          port: config.port,
        })
      )
    )
  );
};

const launchVt2Sidecar = (config: Vt2RuntimeConfig, startedAt: DateTime.Utc) =>
  Layer.launch(Layer.fresh(sidecarLayer(config, startedAt))).pipe(
    Vt2RuntimeError.mapError("Failed to launch the V2T sidecar.", 500)
  );

/**
 * Run the V2T sidecar until shutdown is requested.
 *
 * @param config - V2T runtime configuration.
 * @returns Long-lived sidecar process effect.
 *
 * @since 0.0.0
 * @category DomainLogic
 */
export const runVt2Runtime = Effect.fn("Vt2Runtime.run")(function* (config: Vt2RuntimeConfig) {
  const startedAt = yield* DateTime.now;
  const shutdownRequested = yield* Ref.make(false);
  const shutdownDeferred = yield* Deferred.make<void>();

  const requestShutdown = Effect.fn("Vt2Runtime.requestShutdown")(function* () {
    const alreadyRequested = yield* Ref.getAndSet(shutdownRequested, true);

    if (alreadyRequested) {
      return;
    }

    yield* Deferred.succeed(shutdownDeferred, void 0).pipe(Effect.ignore);
  });
  const services = yield* Effect.context<never>();
  const runRequestShutdown = Effect.runForkWith(services);

  yield* Effect.acquireRelease(
    Effect.sync(() => {
      const handleSignal = () => {
        void runRequestShutdown(requestShutdown());
      };

      process.on("SIGINT", handleSignal);
      process.on("SIGTERM", handleSignal);

      return handleSignal;
    }),
    (handleSignal) =>
      Effect.sync(() => {
        process.off("SIGINT", handleSignal);
        process.off("SIGTERM", handleSignal);
      })
  );

  const serverFiber = yield* launchVt2Sidecar(config, startedAt).pipe(Effect.forkScoped);

  yield* emitBootstrapStdoutLine(config, startedAt);
  yield* Effect.raceFirst(Deferred.await(shutdownDeferred), Fiber.await(serverFiber).pipe(Effect.asVoid));
  yield* Fiber.interrupt(serverFiber);
});

/**
 * Load V2T runtime configuration from the process environment.
 *
 * @returns Resolved V2T runtime configuration.
 *
 * @since 0.0.0
 * @category Configuration
 */
export const loadVt2RuntimeConfig = Effect.fn("Vt2Runtime.loadConfig")(function* () {
  const host = yield* Config.string("BEEP_VT2_HOST").pipe(
    Config.orElse(() => Config.string("BEEP_EDITOR_HOST")),
    Config.withDefault(defaultHost)
  );
  const port = yield* Config.number("BEEP_VT2_PORT").pipe(
    Config.orElse(() => Config.number("BEEP_EDITOR_PORT")),
    Config.orElse(() => Config.number("PORT")),
    Config.withDefault(defaultPort)
  );
  const appDataDirInput = yield* Config.option(
    Config.string("BEEP_VT2_APP_DATA_DIR").pipe(Config.orElse(() => Config.string("BEEP_EDITOR_APP_DATA_DIR")))
  );
  const sessionIdOption = yield* Config.option(
    Config.string("BEEP_VT2_SESSION_ID").pipe(Config.orElse(() => Config.string("BEEP_EDITOR_SESSION_ID")))
  );
  const versionOption = yield* Config.option(
    Config.string("BEEP_VT2_VERSION").pipe(Config.orElse(() => Config.string("BEEP_EDITOR_VERSION")))
  );
  const transcriptPythonBinOption = yield* Config.option(Config.string("BEEP_VT2_TRANSCRIPT_PYTHON_BIN"));
  const transcriptWhisperModel = yield* Config.string("BEEP_VT2_TRANSCRIPT_WHISPER_MODEL").pipe(
    Config.withDefault(defaultTranscriptWhisperModel)
  );
  const normalizedVersion = normalizeOptionalText(versionOption);
  const normalizedTranscriptPythonBin = normalizeOptionalText(transcriptPythonBinOption).pipe(
    O.map(NonEmptyTrimmedStr.make)
  );
  const sessionId = yield* O.match(sessionIdOption, {
    onNone: () => DateTime.now.pipe(Effect.map((now) => `vt2-${DateTime.toEpochMillis(now)}`)),
    onSome: Effect.succeed,
  });
  const version = yield* O.match(normalizedVersion, {
    onNone: () => resolveVt2Version(),
    onSome: Effect.succeed,
  });
  const appDataDir = yield* resolveVt2AppDataDir(appDataDirInput);

  return new Vt2RuntimeConfig({
    host,
    port: SidecarPort.make(port),
    appDataDir: FilePath.make(appDataDir),
    sessionId,
    transcriptPythonBin: normalizedTranscriptPythonBin,
    transcriptWhisperModel: NonEmptyTrimmedStr.make(transcriptWhisperModel),
    version,
  });
});
