/**
 * Strict-tier telemetry for the practice KG host: the shape-only stderr
 * logger, the salt that keys exported span ids, the encrypted spool every
 * held-back export goes to, and the layer that puts the strict OTLP gate
 * under the MCP server.
 *
 * **Details**
 *
 * Claude Desktop keeps a server's stderr, so nothing the host writes there may
 * carry a message, a path or a cause. Every stderr line names only a log
 * level, the tool a log came from and the refusal tag `log-record-dropped`.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { InstrumentCatalog, ObservabilityInstruments, TelemetryRefusalTag } from "@beep/observability/catalog";
import {
  layerInMemoryEgressSink,
  layerInMemoryStrictSalt as layerInMemorySaltWith,
  layerStrictOtlp,
  layerStrictSaltFromKey,
  layerStrictSpool,
  layerStrictSpoolSink,
  resolveStrictTier,
  StrictGateConfig,
  StrictSpoolKey,
  StrictSpoolOptions,
} from "@beep/observability/strict";
import { HostProcessPlatform } from "@beep/utils/HostProcess";
import * as A from "effect/Array";
import * as Config from "effect/Config";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import { dual, pipe } from "effect/Function";
import * as Layer from "effect/Layer";
import * as Logger from "effect/Logger";
import * as O from "effect/Option";
import * as Path from "effect/Path";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as Tracer from "effect/Tracer";
import {
  PracticeKgTelemetryInstruments,
  PracticeKgToolId,
  PracticeKgToolKey,
} from "../telemetry/PracticeKgTelemetry.instruments.ts";
import { PRACTICE_KG_EXTENSION_VERSION } from "../Version.ts";
import { layerPracticeKgDpapi, layerPracticeKgSpoolKey, resolvePracticeKgTelemetryDir } from "./TelemetryKey.ts";
import type {
  StrictEgressSink,
  StrictGate,
  StrictSalt,
  StrictSpoolError,
  StrictTierResolution,
} from "@beep/observability/strict";
import type * as FileSystem from "effect/FileSystem";
import type * as OtlpExporter from "effect/observability/OtlpExporter";
import type { ChildProcessSpawner } from "effect/process";

// Span-name prefixes that carry a tool id: the MCP kit dispatch span and the
// practice KG handler span.
const PracticeKgToolSpanPrefixes = ["mcp.tool.call.", "PracticeKgTools."] as const;

// Catalog the gate reads: the kernel declarations plus the practice KG keys.
const PracticeKgTelemetryCatalog = InstrumentCatalog.make({
  attributes: [...ObservabilityInstruments.attributes, ...PracticeKgTelemetryInstruments.attributes],
  instruments: [...ObservabilityInstruments.instruments, ...PracticeKgTelemetryInstruments.instruments],
});

// Strict gate configuration of the practice KG host for one key epoch.
const makePracticeKgStrictGateConfig = (keyEpoch: string): StrictGateConfig =>
  StrictGateConfig.make({
    serviceName: "practice-kg-mcp",
    serviceVersion: PRACTICE_KG_EXTENSION_VERSION,
    keyEpoch,
    toolIds: PracticeKgToolId.literals,
    toolSpanPrefixes: PracticeKgToolSpanPrefixes,
    toolKey: PracticeKgToolKey,
    catalog: PracticeKgTelemetryCatalog,
  });

/**
 * Strict gate configuration of the practice KG host under an in-memory
 * salt.
 *
 * **Details**
 *
 * The key epoch is `memory`: the salt lives only as long as the process, so
 * no two runs share keyed ids.
 *
 * **Example** (Read the exported service name)
 *
 * ```ts
 * import { PracticeKgStrictGateConfig } from "../../src/runtime/Telemetry.ts"
 *
 * console.log(PracticeKgStrictGateConfig.serviceName) // "practice-kg-mcp"
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const PracticeKgStrictGateConfig: StrictGateConfig = makePracticeKgStrictGateConfig("memory");

// Synchronous HMAC-SHA256 through Bun, lowercase hex.
const bunHmacSha256Hex = (key: Uint8Array, value: string): string =>
  new Bun.CryptoHasher("sha256", key).update(value).digest("hex");

/**
 * Salt drawn fresh for each process and held only in memory; ids are keyed
 * with HMAC-SHA256 through `Bun.CryptoHasher`.
 *
 * **Example** (Provide the in-memory salt)
 *
 * ```ts
 * import { layerInMemoryStrictSalt } from "../../src/runtime/Telemetry.ts"
 * import * as Layer from "effect/Layer"
 *
 * console.log(Layer.isLayer(layerInMemoryStrictSalt)) // true
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const layerInMemoryStrictSalt: Layer.Layer<StrictSalt> = layerInMemorySaltWith(bunHmacSha256Hex);

const isPracticeKgToolId = S.is(PracticeKgToolId);

const toolIdOfSpan = (span: Tracer.AnySpan): O.Option<PracticeKgToolId> =>
  pipe(
    O.liftPredicate(span, (candidate): candidate is Tracer.Span => candidate._tag === "Span"),
    O.flatMap((current) =>
      A.findFirst(PracticeKgToolSpanPrefixes, (prefix) => Str.startsWith(prefix)(current.name)).pipe(
        O.map((prefix) => Str.slice(Str.length(prefix))(current.name))
      )
    ),
    O.filter(isPracticeKgToolId)
  );

/**
 * Renders one shape-only stderr line: the level, the tool the log came from
 * (or `none`) and the `log-record-dropped` refusal tag. The message and the
 * cause are never read.
 *
 * **Example** (Render a line outside any span)
 *
 * ```ts
 * import { shapeOnlyLogLine } from "../../src/runtime/Telemetry.ts"
 * import * as O from "effect/Option"
 *
 * console.log(shapeOnlyLogLine("Error", O.none()))
 * // "practice-kg-mcp level=Error tool=none refused=log-record-dropped"
 * ```
 *
 * @category formatting
 * @since 0.0.0
 */
export const shapeOnlyLogLine: {
  (tool: O.Option<PracticeKgToolId>): (level: string) => string;
  (level: string, tool: O.Option<PracticeKgToolId>): string;
} = dual(
  2,
  (level: string, tool: O.Option<PracticeKgToolId>): string =>
    `practice-kg-mcp level=${level} tool=${O.getOrElse(tool, () => "none")} refused=${TelemetryRefusalTag.Enum["log-record-dropped"]}`
);

// Writes `shapeOnlyLogLine` lines to stderr; it never reads the message or cause.
const shapeOnlyStderrLogger: Logger.Logger<unknown, void> = Logger.withConsoleError(
  Logger.make((options) =>
    shapeOnlyLogLine(
      options.logLevel,
      O.flatMap(Context.getOption(options.fiber.context, Tracer.ParentSpan), toolIdOfSpan)
    )
  )
);

/**
 * Process-wide stderr pin: replaces every logger with one that writes
 * {@link shapeOnlyLogLine} lines to stderr and turns `LogToStderr` on, so no
 * log ever reaches stdout, the MCP protocol channel.
 *
 * **Example** (Pin stderr for a program)
 *
 * ```ts
 * import { layerShapeOnlyStderr } from "../../src/runtime/Telemetry.ts"
 * import * as Layer from "effect/Layer"
 *
 * console.log(Layer.isLayer(layerShapeOnlyStderr)) // true
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const layerShapeOnlyStderr: Layer.Layer<never> = Layer.mergeAll(
  Logger.layer([shapeOnlyStderrLogger], { mergeWithExisting: false }),
  Layer.succeed(Logger.LogToStderr, true)
);

const layerTelemetryFor = (
  config: StrictGateConfig
): Layer.Layer<StrictGate | OtlpExporter.Flusher, never, StrictSalt | StrictEgressSink> =>
  Layer.mergeAll(
    Logger.layer([shapeOnlyStderrLogger], { mergeWithExisting: true }),
    Layer.succeed(Logger.LogToStderr, true)
  ).pipe(Layer.provideMerge(layerStrictOtlp(config)));

/**
 * Host telemetry: the strict OTLP export plus the shape-only stderr logger,
 * leaving the salt and the egress sink to the caller.
 *
 * **Details**
 *
 * The strict OTLP layer replaces every existing logger with its gate logger,
 * which drops each record and counts it; the stderr logger is then added
 * beside it. Nothing is sent anywhere: the strict egress client holds every
 * export back.
 *
 * **Example** (Build the host telemetry)
 *
 * ```ts
 * import { layerPracticeKgTelemetry } from "../../src/runtime/Telemetry.ts"
 * import * as Layer from "effect/Layer"
 *
 * console.log(Layer.isLayer(layerPracticeKgTelemetry)) // true
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const layerPracticeKgTelemetry: Layer.Layer<
  StrictGate | OtlpExporter.Flusher,
  never,
  StrictSalt | StrictEgressSink
> = layerTelemetryFor(PracticeKgStrictGateConfig);

// `layerPracticeKgTelemetry` with the in-memory salt and the in-memory
// egress sink. The host falls back to it when it has no telemetry directory
// or its root key cannot be loaded: exports are still gated, and the
// held-back bodies stay in memory and die with the process.
const layerPracticeKgTelemetryInMemory: Layer.Layer<StrictGate | OtlpExporter.Flusher> = layerPracticeKgTelemetry.pipe(
  Layer.provide(Layer.mergeAll(layerInMemoryStrictSalt, layerInMemoryEgressSink()))
);

// The tier the practice KG host runs at, resolved fail-closed.
const practiceKgTelemetryTier: Effect.Effect<StrictTierResolution> = Effect.gen(function* () {
  const requested = yield* Config.option(Config.String("PRACTICE_KG_TELEMETRY_TIER"));
  return resolveStrictTier(O.none(), [requested]);
}).pipe(Effect.orElseSucceed(() => resolveStrictTier(O.none(), [O.some("unreadable")])));

/**
 * {@link layerPracticeKgTelemetry} over the encrypted spool: the salt and the
 * spool key both derive from the {@link StrictSpoolKey}, and the gate
 * exports the key's epoch.
 *
 * **Example** (Build the spooled telemetry)
 *
 * ```ts
 * import { layerPracticeKgTelemetrySpooled } from "../../src/runtime/Telemetry.ts"
 * import { StrictSpoolOptions } from "@beep/observability/strict"
 * import * as Layer from "effect/Layer"
 *
 * const telemetry = layerPracticeKgTelemetrySpooled(
 *   StrictSpoolOptions.make({ directory: "/state/telemetry/spool", tier: "shape-only" })
 * )
 * console.log(Layer.isLayer(telemetry)) // true
 * ```
 *
 * @param options - Directory, tier and byte bound of the spool.
 * @category layers
 * @since 0.0.0
 */
export const layerPracticeKgTelemetrySpooled = (
  options: StrictSpoolOptions
): Layer.Layer<
  StrictGate | OtlpExporter.Flusher,
  StrictSpoolError,
  StrictSpoolKey | FileSystem.FileSystem | Path.Path
> =>
  Layer.unwrap(
    Effect.gen(function* () {
      const key = yield* StrictSpoolKey;
      return layerTelemetryFor(makePracticeKgStrictGateConfig(key.epoch)).pipe(
        Layer.provide(layerStrictSpoolSink),
        Layer.provide(layerStrictSpool(options)),
        Layer.provide(layerStrictSaltFromKey(bunHmacSha256Hex))
      );
    })
  );

/**
 * The host's telemetry: the strict gate over the encrypted spool in
 * `<telemetry dir>/spool`, keyed by the root key in
 * `<telemetry dir>/key.<epoch>.dpapi` (DPAPI on Windows, a dev key file elsewhere),
 * at the fail-closed tier.
 *
 * **Details**
 *
 * When no telemetry directory resolves, or the key or spool cannot be
 * opened, the host keeps serving with `layerPracticeKgTelemetryInMemory`:
 * exports are still gated and nothing is written to disk.
 *
 * **Example** (Reference the production telemetry)
 *
 * ```ts
 * import { layerPracticeKgTelemetryProduction } from "../../src/runtime/Telemetry.ts"
 * import * as Layer from "effect/Layer"
 *
 * console.log(Layer.isLayer(layerPracticeKgTelemetryProduction)) // true
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const layerPracticeKgTelemetryProduction: Layer.Layer<
  StrictGate | OtlpExporter.Flusher,
  never,
  FileSystem.FileSystem | Path.Path | ChildProcessSpawner.ChildProcessSpawner
> = Layer.unwrap(
  Effect.gen(function* () {
    const path = yield* Path.Path;
    const platform = yield* HostProcessPlatform;
    const directory = yield* resolvePracticeKgTelemetryDir(platform);
    const resolution = yield* practiceKgTelemetryTier;
    return O.match(directory, {
      onNone: () => layerPracticeKgTelemetryInMemory,
      onSome: (telemetryDir) =>
        layerPracticeKgTelemetrySpooled(
          StrictSpoolOptions.make({ directory: path.join(telemetryDir, "spool"), tier: resolution.tier })
        ).pipe(
          Layer.provide(layerPracticeKgSpoolKey(telemetryDir)),
          Layer.provide(layerPracticeKgDpapi(platform)),
          Layer.catch(() => layerPracticeKgTelemetryInMemory)
        ),
    });
  })
);
