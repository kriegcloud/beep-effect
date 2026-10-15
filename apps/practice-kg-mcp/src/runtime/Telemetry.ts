/**
 * Strict-tier telemetry for the practice KG host: the shape-only stderr
 * logger, the in-memory salt that keys exported span ids, and the layer that
 * puts the strict OTLP gate under the MCP server.
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
  StrictGateConfig,
} from "@beep/observability/strict";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import { dual, pipe } from "effect/Function";
import * as Layer from "effect/Layer";
import * as Logger from "effect/Logger";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as Tracer from "effect/Tracer";
import {
  PracticeKgTelemetryInstruments,
  PracticeKgToolId,
  PracticeKgToolKey,
} from "../telemetry/PracticeKgTelemetry.instruments.ts";
import { PRACTICE_KG_EXTENSION_VERSION } from "../Version.ts";
import type { StrictEgressSink, StrictGate, StrictSalt } from "@beep/observability/strict";
import type * as OtlpExporter from "effect/observability/OtlpExporter";

// Span-name prefixes that carry a tool id: the MCP kit dispatch span and the
// practice KG handler span.
const PracticeKgToolSpanPrefixes = ["mcp.tool.call.", "PracticeKgTools."] as const;

// Catalog the gate reads: the kernel declarations plus the practice KG keys.
const PracticeKgTelemetryCatalog = InstrumentCatalog.make({
  attributes: [...ObservabilityInstruments.attributes, ...PracticeKgTelemetryInstruments.attributes],
  instruments: [...ObservabilityInstruments.instruments, ...PracticeKgTelemetryInstruments.instruments],
});

/**
 * Strict gate configuration of the practice KG host.
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
export const PracticeKgStrictGateConfig = StrictGateConfig.make({
  serviceName: "practice-kg-mcp",
  serviceVersion: PRACTICE_KG_EXTENSION_VERSION,
  keyEpoch: "memory",
  toolIds: PracticeKgToolId.literals,
  toolSpanPrefixes: PracticeKgToolSpanPrefixes,
  toolKey: PracticeKgToolKey,
  catalog: PracticeKgTelemetryCatalog,
});

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
export const layerInMemoryStrictSalt: Layer.Layer<StrictSalt> = layerInMemorySaltWith((key, value) =>
  new Bun.CryptoHasher("sha256", key).update(value).digest("hex")
);

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
> = Layer.mergeAll(
  Logger.layer([shapeOnlyStderrLogger], { mergeWithExisting: true }),
  Layer.succeed(Logger.LogToStderr, true)
).pipe(Layer.provideMerge(layerStrictOtlp(PracticeKgStrictGateConfig)));

/**
 * {@link layerPracticeKgTelemetry} with the in-memory salt and the in-memory
 * egress sink, as the host runs it until the encrypted spool lands.
 *
 * **Example** (Build the self-contained telemetry)
 *
 * ```ts
 * import { layerPracticeKgTelemetryInMemory } from "../../src/runtime/Telemetry.ts"
 * import * as Layer from "effect/Layer"
 *
 * console.log(Layer.isLayer(layerPracticeKgTelemetryInMemory)) // true
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const layerPracticeKgTelemetryInMemory: Layer.Layer<StrictGate | OtlpExporter.Flusher> =
  layerPracticeKgTelemetry.pipe(Layer.provide(Layer.mergeAll(layerInMemoryStrictSalt, layerInMemoryEgressSink())));
