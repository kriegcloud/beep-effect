/**
 * Real tika-app-backed text and metadata extraction engine.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { ExtractionResult } from "@beep/file-processing/Extraction";
import { DetectionResult, FileProcessingOperationError } from "@beep/file-processing/Operation";
import { $TikaId } from "@beep/identity";
import { A, Str, thunkEmptyStr } from "@beep/utils";
import { Effect, Match, Stream } from "effect";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import { ChildProcess, ChildProcessSpawner } from "effect/unstable/process";
import { makeTikaError } from "./Tika.errors.js";
import { TikaFileProcessingEngineDescriptor } from "./Tika.service.js";
import type { ExportArchiveOperation, ExtractFileOperation } from "@beep/file-processing/Operation";
import type { FileProcessingEngineShape } from "@beep/file-processing/Service";
import type { TikaError } from "./Tika.errors.js";

const $I = $TikaId.create("Tika.tikaapp");

const defaultJavaPath = "java";
const defaultTimeoutMillis = 120_000;
const defaultForceKillAfterMillis = 10_000;
const tikaContentKey = "X-TIKA:content";

/**
 * Configuration for the tika-app subprocess engine.
 *
 * @example
 * ```ts
 * import { TikaAppEngineConfig } from "@beep/tika"
 *
 * const config = TikaAppEngineConfig.make({ jarPath: "/opt/tika/tika-app.jar" })
 * console.log(config.jarPath)
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export class TikaAppEngineConfig extends S.Class<TikaAppEngineConfig>($I`TikaAppEngineConfig`)(
  {
    jarPath: S.String,
    javaPath: S.optionalKey(S.String),
    timeoutMillis: S.optionalKey(S.Finite),
  },
  $I.annote("TikaAppEngineConfig", {
    description: "Configuration for the real tika-app subprocess engine: jar path, java binary, and per-file timeout.",
  })
) {}

const classifyExtension = Match.type<string | undefined>().pipe(
  Match.when("doc", () => "doc" as const),
  Match.when("docx", () => "docx" as const),
  Match.when("docm", () => "docm" as const),
  Match.when("rtf", () => "rtf" as const),
  Match.whenOr("htm", "html", () => "html" as const),
  Match.when("xhtml", () => "xhtml" as const),
  Match.when("pdf", () => "pdf-text-layer" as const),
  Match.whenOr("txt", "text", () => "plain-text" as const),
  Match.whenOr("md", "markdown", () => "markdown" as const),
  Match.whenOr("bmp", "gif", "jpeg", "jpg", "png", "tif", "tiff", "webp", () => "image-metadata" as const),
  Match.when("xls", () => "xls" as const),
  Match.when("xlsx", () => "xlsx" as const),
  Match.orElse(() => "unknown" as const)
);

const operationFailure = (operation: ExtractFileOperation, error: TikaError): FileProcessingOperationError =>
  Match.value(error.reason).pipe(
    Match.when("engine-unavailable", () =>
      FileProcessingOperationError.fromReason("engine-unavailable", {
        artifactId: operation.source.id,
        engine: TikaFileProcessingEngineDescriptor.name,
        format: operation.format,
        message: "The Tika runtime is not available on this host.",
        operationId: operation.operationId,
      })
    ),
    Match.when("timeout", () =>
      FileProcessingOperationError.fromReason("operation-timed-out", {
        artifactId: operation.source.id,
        engine: TikaFileProcessingEngineDescriptor.name,
        format: operation.format,
        message: "Tika extraction timed out.",
        operationId: operation.operationId,
      })
    ),
    Match.orElse(() =>
      FileProcessingOperationError.fromReason("file-extraction-failed", {
        artifactId: operation.source.id,
        engine: TikaFileProcessingEngineDescriptor.name,
        format: operation.format,
        message: "Tika extraction failed inside the driver boundary.",
        operationId: operation.operationId,
        ...R.getSomes({ details: O.map(O.fromUndefinedOr(error.cause), (cause) => ({ cause })) }),
      })
    )
  );

const metadataValueToString = (value: unknown): O.Option<string> => {
  if (P.isString(value)) {
    return O.some(value);
  }
  if (Array.isArray(value)) {
    const strings = A.filter(value, P.isString);
    return A.length(strings) === 0 ? O.none() : O.some(A.join(strings, "; "));
  }
  if (P.isNumber(value) || P.isBoolean(value)) {
    return O.some(`${value}`);
  }
  return O.none();
};

const decodeTikaJsonRows = S.decodeUnknownEffect(S.fromJsonString(S.Array(S.Record(S.String, S.Unknown))));

const parseTikaJson = (stdout: string): Effect.Effect<Readonly<Record<string, unknown>>, TikaError> =>
  decodeTikaJsonRows(stdout).pipe(
    Effect.mapError(() => makeTikaError("response-decoding")),
    Effect.flatMap((rows) =>
      A.head(rows).pipe(
        O.match({
          onNone: () => Effect.fail(makeTikaError("response-decoding", { cause: "empty tika -J array" })),
          onSome: Effect.succeed,
        })
      )
    )
  );

/**
 * Create the real tika-app-backed file-processing engine.
 *
 * Captures the process-spawner service at construction so the returned
 * engine satisfies the requirement-free {@link FileProcessingEngineShape}
 * contract. `extract` runs `java -jar tika-app.jar -J -t` against the
 * source file and returns trimmed text plus stringified metadata; the
 * `image-metadata` format returns metadata only.
 *
 * @example
 * ```ts
 * import { makeTikaAppFileProcessingEngine, TikaAppEngineConfig } from "@beep/tika"
 * import { Effect } from "effect"
 *
 * const program = Effect.gen(function* () {
 *   const engine = yield* makeTikaAppFileProcessingEngine(
 *     TikaAppEngineConfig.make({ jarPath: "/opt/tika/tika-app.jar" })
 *   )
 *   return engine.descriptor.engine
 * })
 *
 * console.log(program)
 * ```
 *
 * @effects Requires {@link ChildProcessSpawner.ChildProcessSpawner}; the returned engine fails through the operation error channel only.
 * @category constructors
 * @since 0.0.0
 */
export const makeTikaAppFileProcessingEngine = Effect.fn("Tika.makeTikaAppFileProcessingEngine")(function* (
  config: TikaAppEngineConfig
): Effect.fn.Return<FileProcessingEngineShape, never, ChildProcessSpawner.ChildProcessSpawner> {
  const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
  const javaPath = config.javaPath ?? defaultJavaPath;
  const timeoutMillis = config.timeoutMillis ?? defaultTimeoutMillis;

  const collectText = <E>(stream: Stream.Stream<Uint8Array, E>): Effect.Effect<string, E> =>
    stream.pipe(
      Stream.decodeText(),
      Stream.runFold(thunkEmptyStr, (acc, chunk) => `${acc}${chunk}`)
    );

  const runTika = Effect.fn("Tika.tikaapp.run")(function* (sourcePath: string): Effect.fn.Return<string, TikaError> {
    const command = ChildProcess.make(javaPath, ["-jar", config.jarPath, "-J", "-t", sourcePath], {
      forceKillAfter: `${defaultForceKillAfterMillis} millis`,
      stdin: "ignore",
      stderr: "pipe",
      stdout: "pipe",
    });

    const result = yield* Effect.scoped(
      Effect.gen(function* () {
        const handle = yield* spawner.spawn(command);
        const [stdout, exitCode] = yield* Effect.all([collectText(handle.stdout), handle.exitCode], {
          concurrency: "unbounded",
        });
        return { exitCode, stdout };
      })
    ).pipe(Effect.mapError(() => makeTikaError("engine-unavailable", { cause: "tika spawn failed" })));

    if (result.exitCode !== 0) {
      return yield* makeTikaError("response-status", { cause: `exit ${result.exitCode}` });
    }

    return result.stdout;
  });

  const extractImpl = Effect.fn("TikaAppEngine.extractImpl")(function* (
    operation: ExtractFileOperation
  ): Effect.fn.Return<ExtractionResult, TikaError> {
    const stdout = yield* runTika(operation.source.locator.value).pipe(
      Effect.timeoutOrElse({
        duration: `${timeoutMillis} millis`,
        orElse: () => Effect.fail(makeTikaError("timeout")),
      })
    );
    const record = yield* parseTikaJson(stdout);
    const metadata = R.getSomes(R.map(R.remove(record, tikaContentKey), (value) => metadataValueToString(value)));
    const text = O.fromUndefinedOr(record[tikaContentKey]).pipe(
      O.flatMap((value) => (P.isString(value) ? O.some(Str.trim(value)) : O.none()))
    );

    return ExtractionResult.make({
      engine: TikaFileProcessingEngineDescriptor.name,
      format: operation.format,
      metadata,
      operationId: operation.operationId,
      sourceArtifactId: operation.source.id,
      warnings: [],
      ...(operation.format === "image-metadata" || O.isNone(text) ? {} : { text: text.value }),
    });
  });

  const engine: FileProcessingEngineShape = {
    descriptor: TikaFileProcessingEngineDescriptor,
    detect: Effect.fn("TikaAppEngine.detect")(function* (operation) {
      return DetectionResult.make({
        confidence: 0.95,
        engine: TikaFileProcessingEngineDescriptor.name,
        format: classifyExtension(operation.source.extension),
        operationId: operation.operationId,
        sourceArtifactId: operation.source.id,
        ...R.getSomes({
          mediaType: O.fromUndefinedOr(operation.source.mediaType),
        }),
      });
    }),
    exportArchive: Effect.fn("TikaAppEngine.exportArchive")(function* (operation: ExportArchiveOperation) {
      return yield* FileProcessingOperationError.fromReason("unsupported-file-format", {
        artifactId: operation.source.id,
        engine: TikaFileProcessingEngineDescriptor.name,
        format: operation.format,
        message: "tika-app does not export archive children.",
        operationId: operation.operationId,
      });
    }),
    extract: Effect.fn("TikaAppEngine.extract")(function* (operation: ExtractFileOperation) {
      if (operation.source.locator.kind !== "file") {
        return yield* FileProcessingOperationError.fromReason("file-extraction-failed", {
          artifactId: operation.source.id,
          engine: TikaFileProcessingEngineDescriptor.name,
          format: operation.format,
          message: "tika-app extraction requires a file locator for the source artifact.",
          operationId: operation.operationId,
        });
      }

      return yield* extractImpl(operation).pipe(Effect.mapError((error) => operationFailure(operation, error)));
    }),
  };

  return engine;
});
