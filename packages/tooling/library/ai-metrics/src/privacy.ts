/**
 * Privacy and hashing helpers for repo AI metrics.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoAiMetricsId } from "@beep/identity/packages";
import { LiteralKit, TaggedErrorClass } from "@beep/schema";
import { Effect, Encoding, flow, Order, pipe } from "effect";
import * as A from "effect/Array";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { firstString, metricEventName, optionalTimestamp, transcriptLines } from "./internal/transcript-utils.ts";
import { AiMetricsTranscriptSource, type TranscriptIngestSummary } from "./models.ts";

const $I = $RepoAiMetricsId.create("privacy");

/**
 * Local fallback salt used only for smoke-mode private identifier hashes.
 *
 * @category constants
 * @since 0.0.0
 */
export const AI_METRICS_LOCAL_INSECURE_HASH_SALT = "beep-ai-metrics-local-smoke-insecure-salt";

// These global regexes are safe for concurrent use here because matchAll and replace
// start each string operation from index 0 even when the expression has the g flag.
const SECRET_ASSIGNMENT_PATTERN =
  /\b([A-Z][A-Z0-9_]*(?:API[_-]?KEY|KEY|TOKEN|SECRET|PASSWORD|PASS|PWD|AUTH|CREDENTIAL)[A-Z0-9_]*)\s*=\s*("[^"]*"|'[^']*'|[^\s;&|]+)/giu;
const AUTH_HEADER_PATTERN = /\b(authorization|proxy-authorization)\s*:\s*([^\n\r]+)/giu;
const BEARER_PATTERN = /\b(Bearer|Basic)\s+([A-Za-z0-9._~+/=-]{8,})/giu;
const OPENAI_KEY_PATTERN = /\b(sk-[A-Za-z0-9_-]{8,})\b/gu;

const countMatches = (pattern: RegExp, content: string): number =>
  pipe(content, Str.matchAll(pattern), A.fromIterable, A.length);

/**
 * Whether private identifier hashes used an operator-provided salt or a local smoke fallback.
 *
 * @example
 * ```ts
 * import { AiMetricsHashSaltStatus } from "@beep/repo-ai-metrics"
 * console.log(AiMetricsHashSaltStatus.Enum.provided)
 * ```
 * @category models
 * @since 0.0.0
 */
export const AiMetricsHashSaltStatus = LiteralKit(["provided", "insecure_default"] as const).annotate(
  $I.annote("AiMetricsHashSaltStatus", {
    description: "Salt source status for private AI metrics identifier hashes.",
  })
);

/**
 * Runtime type for {@link AiMetricsHashSaltStatus}.
 *
 * @category models
 * @since 0.0.0
 */
export type AiMetricsHashSaltStatus = typeof AiMetricsHashSaltStatus.Type;

/**
 * Redaction proof for text that crossed the raw-transcript boundary.
 *
 * @example
 * ```ts
 * import { AiMetricsRedactionResult } from "@beep/repo-ai-metrics"
 * console.log(AiMetricsRedactionResult)
 * ```
 * @category models
 * @since 0.0.0
 */
export class AiMetricsRedactionResult extends S.Class<AiMetricsRedactionResult>($I`AiMetricsRedactionResult`)(
  {
    authHeaderCount: S.Number,
    bearerTokenCount: S.Number,
    excludedRawTextFieldCount: S.Number,
    openAiKeyCount: S.Number,
    safeForDerivedUi: S.Boolean,
    secretAssignmentCount: S.Number,
  },
  $I.annote("AiMetricsRedactionResult", {
    description: "Counts of private material detected or excluded before producing derived AI metrics payloads.",
  })
) {}

/**
 * Hash-only envelope for a raw transcript event line.
 *
 * @example
 * ```ts
 * import { AiMetricsRawEventEnvelope } from "@beep/repo-ai-metrics"
 * console.log(AiMetricsRawEventEnvelope)
 * ```
 * @category models
 * @since 0.0.0
 */
export class AiMetricsRawEventEnvelope extends S.Class<AiMetricsRawEventEnvelope>($I`AiMetricsRawEventEnvelope`)(
  {
    eventName: S.String,
    lineNumber: S.Number,
    rawEventHash: S.String,
    sourceKind: AiMetricsTranscriptSource,
    sourcePathHash: S.String,
    timestamp: S.optionalKey(S.String),
  },
  $I.annote("AiMetricsRawEventEnvelope", {
    description: "Safe raw-event envelope that retains only hashes, line numbers, event names, and timestamps.",
  })
) {}

/**
 * Redacted transcript summary safe for derived tables, dashboards, and OTLP attributes.
 *
 * @example
 * ```ts
 * import { AiMetricsSanitizedTranscript } from "@beep/repo-ai-metrics"
 * console.log(AiMetricsSanitizedTranscript)
 * ```
 * @category models
 * @since 0.0.0
 */
export class AiMetricsSanitizedTranscript extends S.Class<AiMetricsSanitizedTranscript>(
  $I`AiMetricsSanitizedTranscript`
)(
  {
    acceptedEvents: S.Number,
    eventNames: S.Array(S.String),
    firstTimestamp: S.optionalKey(S.String),
    lastTimestamp: S.optionalKey(S.String),
    rawEventEnvelopes: S.Array(AiMetricsRawEventEnvelope),
    rejectedLines: S.Number,
    sourceKind: AiMetricsTranscriptSource,
    sourcePathHash: S.String,
    totalLines: S.Number,
  },
  $I.annote("AiMetricsSanitizedTranscript", {
    description: "Allowlisted transcript projection that excludes prompt, output, message, and payload text.",
  })
) {}

/**
 * Result produced by the P1 privacy proof command.
 *
 * @example
 * ```ts
 * import { AiMetricsPrivacyCheckResult } from "@beep/repo-ai-metrics"
 * console.log(AiMetricsPrivacyCheckResult)
 * ```
 * @category models
 * @since 0.0.0
 */
export class AiMetricsPrivacyCheckResult extends S.Class<AiMetricsPrivacyCheckResult>($I`AiMetricsPrivacyCheckResult`)(
  {
    hashSaltStatus: AiMetricsHashSaltStatus,
    inputPathHash: S.String,
    redaction: AiMetricsRedactionResult,
    sanitized: AiMetricsSanitizedTranscript,
    sourceKind: AiMetricsTranscriptSource,
  },
  $I.annote("AiMetricsPrivacyCheckResult", {
    description: "Privacy proof output for one transcript source and input path.",
  })
) {}

/**
 * Error raised by AI metrics privacy helpers.
 *
 * @example
 * ```ts
 * import { AiMetricsPrivacyError } from "@beep/repo-ai-metrics"
 * console.log(AiMetricsPrivacyError)
 * ```
 * @category errors
 * @since 0.0.0
 */
export class AiMetricsPrivacyError extends TaggedErrorClass<AiMetricsPrivacyError>($I`AiMetricsPrivacyError`)(
  "AiMetricsPrivacyError",
  {
    cause: S.Unknown,
    message: S.String,
  },
  $I.annote("AiMetricsPrivacyError", {
    description: "Typed failure raised by AI metrics privacy and hashing helpers.",
  })
) {}

class GenericTranscriptLine extends S.Class<GenericTranscriptLine>($I`GenericTranscriptLine`)(
  {
    event: S.optionalKey(S.String),
    sessionId: S.optionalKey(S.String),
    timestamp: S.optionalKey(S.String),
    type: S.optionalKey(S.String),
  },
  $I.annote("GenericTranscriptLine", {
    description: "Minimal event metadata decoded from arbitrary transcript JSONL lines.",
  })
) {}

const decodeGenericTranscriptLine = S.decodeUnknownOption(S.fromJsonString(GenericTranscriptLine));
const encodePrivacyCheckJson = S.encodeUnknownEffect(S.fromJsonString(AiMetricsPrivacyCheckResult));

/**
 * Resolve the effective private hash salt value.
 *
 * @param hashSalt - Operator-provided salt, or an empty value for local smoke mode.
 * @returns The salt value used before hashing private identifiers.
 * @category utilities
 * @since 0.0.0
 */
export const resolveAiMetricsHashSaltValue = (hashSalt: string | undefined): string =>
  hashSalt === undefined || Str.isEmpty(Str.trim(hashSalt)) ? AI_METRICS_LOCAL_INSECURE_HASH_SALT : hashSalt;

/**
 * Resolve the effective private hash salt status.
 *
 * @param hashSalt - Operator-provided salt, or an empty value for local smoke mode.
 * @returns Whether hashing used an operator salt or the local insecure fallback.
 * @category utilities
 * @since 0.0.0
 */
export const resolveAiMetricsHashSaltStatus = (hashSalt: string | undefined): AiMetricsHashSaltStatus =>
  hashSalt === undefined || Str.isEmpty(Str.trim(hashSalt))
    ? AiMetricsHashSaltStatus.Enum.insecure_default
    : AiMetricsHashSaltStatus.Enum.provided;

/**
 * Compute a deterministic public SHA-256 digest for non-private content identity.
 *
 * @category utilities
 * @since 0.0.0
 */
export const hashPublicTextSha256: (value: string) => Effect.Effect<string, AiMetricsPrivacyError> = Effect.fn(
  "AiMetrics.hashPublicTextSha256"
)(function* (value) {
  return yield* Effect.tryPromise({
    try: () => globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)),
    catch: (cause) =>
      new AiMetricsPrivacyError({
        cause,
        message: "Failed to compute public SHA-256 digest.",
      }),
  }).pipe(Effect.map((buffer) => Encoding.encodeHex(new Uint8Array(buffer))));
});

/**
 * Compute a salted SHA-256 digest for private identifiers such as local paths and session ids.
 *
 * @category utilities
 * @since 0.0.0
 */
export const hashPrivateIdentifier: {
  (value: string, hashSalt: string | undefined): Effect.Effect<string, AiMetricsPrivacyError>;
  (hashSalt: string | undefined): (value: string) => Effect.Effect<string, AiMetricsPrivacyError>;
} = dual(
  2,
  Effect.fn("AiMetrics.hashPrivateIdentifier")(function* (value: string, hashSalt: string | undefined) {
    return yield* hashPublicTextSha256(`${resolveAiMetricsHashSaltValue(hashSalt)}\u0000${value}`);
  })
);

/**
 * Redact secret-shaped text before any diagnostic rendering.
 *
 * @param text - Transcript or diagnostic text that may contain secret-shaped values.
 * @returns Text with secret-shaped values replaced by redaction markers.
 * @category utilities
 * @since 0.0.0
 */
export const redactAiMetricsSensitiveText = (text: string): string =>
  Str.replace(
    OPENAI_KEY_PATTERN,
    "[REDACTED_SECRET]"
  )(
    Str.replace(
      BEARER_PATTERN,
      "$1 [REDACTED]"
    )(Str.replace(AUTH_HEADER_PATTERN, "$1: [REDACTED]")(Str.replace(SECRET_ASSIGNMENT_PATTERN, "$1=[REDACTED]")(text)))
  );

const redactionResultFor = (content: string): AiMetricsRedactionResult => {
  const authHeaderCount = countMatches(AUTH_HEADER_PATTERN, content);
  const bearerTokenCount = countMatches(BEARER_PATTERN, content);
  const openAiKeyCount = countMatches(OPENAI_KEY_PATTERN, content);
  const secretAssignmentCount = countMatches(SECRET_ASSIGNMENT_PATTERN, content);

  return new AiMetricsRedactionResult({
    authHeaderCount,
    bearerTokenCount,
    excludedRawTextFieldCount: countMatches(/"message"|"payload"|"prompt"|"content"|"text"|"result"/gu, content),
    openAiKeyCount,
    safeForDerivedUi: authHeaderCount + bearerTokenCount + openAiKeyCount + secretAssignmentCount === 0,
    secretAssignmentCount,
  });
};

const eventNameFor = (sourceKind: AiMetricsTranscriptSource, decoded: GenericTranscriptLine): string =>
  pipe(
    firstString(decoded.type, decoded.event),
    O.map((value) => metricEventName({ fallback: "event", sourceKind, value })),
    O.getOrElse(() => "event")
  );

const eventNameList: (envelopes: ReadonlyArray<AiMetricsRawEventEnvelope>) => ReadonlyArray<string> = flow(
  A.map((event) => event.eventName),
  A.dedupe,
  A.sort(Order.String)
);

const rawEventEnvelopes = Effect.fn("AiMetrics.rawEventEnvelopes")(function* ({
  content,
  hashSalt,
  sourceKind,
  sourcePathHash,
}: {
  readonly content: string;
  readonly hashSalt?: string;
  readonly sourceKind: AiMetricsTranscriptSource;
  readonly sourcePathHash: string;
}) {
  const lines = transcriptLines(content);
  const envelopes = yield* Effect.forEach(
    lines,
    Effect.fnUntraced(function* (line, index) {
      const decoded = decodeGenericTranscriptLine(line);
      if (O.isNone(decoded)) {
        return O.none<AiMetricsRawEventEnvelope>();
      }

      return O.some(
        new AiMetricsRawEventEnvelope({
          eventName: eventNameFor(sourceKind, decoded.value),
          lineNumber: index + 1,
          rawEventHash: yield* hashPrivateIdentifier(line, hashSalt),
          sourceKind,
          sourcePathHash,
          ...optionalTimestamp(decoded.value.timestamp),
        })
      );
    }),
    { concurrency: 16 }
  );

  return A.getSomes(envelopes);
});

/**
 * Build a sanitized transcript projection from an ingest summary and raw JSONL text.
 *
 * @category constructors
 * @since 0.0.0
 */
export const makeSanitizedTranscript = Effect.fn("AiMetrics.makeSanitizedTranscript")(function* ({
  content,
  hashSalt,
  summary,
}: {
  readonly content: string;
  readonly hashSalt?: string;
  readonly summary: TranscriptIngestSummary;
}) {
  const envelopes = yield* rawEventEnvelopes({
    content,
    sourceKind: summary.sourceKind,
    sourcePathHash: summary.sourcePathHash,
    ...(hashSalt === undefined ? {} : { hashSalt }),
  });

  return new AiMetricsSanitizedTranscript({
    acceptedEvents: summary.acceptedEvents,
    eventNames: eventNameList(envelopes),
    rawEventEnvelopes: envelopes,
    rejectedLines: summary.rejectedLines,
    sourceKind: summary.sourceKind,
    sourcePathHash: summary.sourcePathHash,
    totalLines: summary.totalLines,
    ...(summary.firstTimestamp === undefined ? {} : { firstTimestamp: summary.firstTimestamp }),
    ...(summary.lastTimestamp === undefined ? {} : { lastTimestamp: summary.lastTimestamp }),
  });
});

/**
 * Build the P1 privacy proof payload for one transcript.
 *
 * @category constructors
 * @since 0.0.0
 */
export const makeAiMetricsPrivacyCheckResult = Effect.fn("AiMetrics.makeAiMetricsPrivacyCheckResult")(function* ({
  content,
  hashSalt,
  sourcePath,
  summary,
}: {
  readonly content: string;
  readonly hashSalt?: string;
  readonly sourcePath: string;
  readonly summary: TranscriptIngestSummary;
}) {
  return new AiMetricsPrivacyCheckResult({
    hashSaltStatus: resolveAiMetricsHashSaltStatus(hashSalt),
    inputPathHash: yield* hashPrivateIdentifier(sourcePath, hashSalt),
    redaction: redactionResultFor(content),
    sanitized: yield* makeSanitizedTranscript({ content, summary, ...(hashSalt === undefined ? {} : { hashSalt }) }),
    sourceKind: summary.sourceKind,
  });
});

/**
 * Render a privacy check result as JSON.
 *
 * @category utilities
 * @since 0.0.0
 */
export const privacyCheckToJson: (result: AiMetricsPrivacyCheckResult) => Effect.Effect<string, AiMetricsPrivacyError> =
  Effect.fn("AiMetrics.privacyCheckToJson")(function* (result) {
    return yield* encodePrivacyCheckJson(result).pipe(
      Effect.mapError(
        (cause) =>
          new AiMetricsPrivacyError({
            cause,
            message: "Failed to encode AI metrics privacy check as JSON.",
          })
      )
    );
  });
