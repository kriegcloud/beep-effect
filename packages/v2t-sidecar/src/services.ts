import { $I as $RootId } from "@beep/identity/packages";
import { LiteralKit, NonEmptyTrimmedStr, StatusCauseFields, TaggedErrorClass } from "@beep/schema";
import { Context, Effect, Layer } from "effect";
import * as O from "effect/Option";
import {
  type Vt2CompositionPacket,
  type Vt2CompositionProfile,
  type Vt2CompositionRun,
  type Vt2DesktopPreferences,
  type Vt2ExportArtifact,
  type Vt2ExportRequest,
  type Vt2MemoryContextPacket,
  type Vt2SessionResource,
  type Vt2Transcript,
  Vt2TranscriptRuntime,
} from "./domain.js";

const $I = $RootId.create("V2T/services");

/**
 * Canonical provider error reasons for the V2T workflow.
 *
 * @since 0.0.0
 * @category DomainModel
 */
// cspell:ignore unconfigured
export const Vt2ProviderErrorReason = LiteralKit(["unconfigured", "unsupported", "unavailable", "rejected"]).annotate(
  $I.annote("Vt2ProviderErrorReason", {
    description: "Canonical provider error reasons for the V2T service seams.",
  })
);
/**
 * @since 0.0.0
 * @category DomainModel
 */
export type Vt2ProviderErrorReason = typeof Vt2ProviderErrorReason.Type;

/**
 * Typed provider error surfaced by transcript, memory, composition, and export adapters.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class Vt2ProviderError extends TaggedErrorClass<Vt2ProviderError>($I`Vt2ProviderError`)(
  "Vt2ProviderError",
  {
    ...StatusCauseFields,
    reason: Vt2ProviderErrorReason,
  },
  $I.annote("Vt2ProviderError", {
    description: "Typed provider error for V2T adapter seams.",
  })
) {}

const makeUnsupportedProviderError = (providerName: string): Vt2ProviderError =>
  new Vt2ProviderError({
    message: `${providerName} is not configured in the first scaffolding slice.`,
    status: 501,
    cause: O.none(),
    reason: "unsupported",
  });

const unsupportedTranscriptProvider = Effect.fn("Vt2TranscriptProvider.transcribe")(() =>
  Effect.fail(makeUnsupportedProviderError("Transcript provider"))
);
const unsupportedTranscriptRuntime = Effect.succeed(
  new Vt2TranscriptRuntime({
    status: "degraded",
    providerMode: "stub",
    commandSource: "system",
    resolvedCommand: NonEmptyTrimmedStr.make("python3"),
    whisperModel: NonEmptyTrimmedStr.make("unconfigured"),
    detail: NonEmptyTrimmedStr.make("Transcript provider is not configured in the first scaffolding slice."),
  })
);

const unsupportedMemoryContextProvider = Effect.fn("Vt2MemoryContextProvider.fetchContext")(() =>
  Effect.fail(makeUnsupportedProviderError("Memory context provider"))
);

const unsupportedCompositionProvider = Effect.fn("Vt2CompositionProvider.prepareRun")(() =>
  Effect.fail(makeUnsupportedProviderError("Composition provider"))
);

const unsupportedExportProvider = Effect.fn("Vt2ExportProvider.exportSession")(() =>
  Effect.fail(makeUnsupportedProviderError("Export provider"))
);

/**
 * Transcript provider seam.
 *
 * @since 0.0.0
 * @category PortContract
 */
export interface Vt2TranscriptProviderShape {
  readonly inspectRuntime: Effect.Effect<Vt2TranscriptRuntime>;
  readonly transcribe: (session: Vt2SessionResource) => Effect.Effect<Vt2Transcript, Vt2ProviderError>;
}

/**
 * Transcript provider tag.
 *
 * @since 0.0.0
 * @category PortContract
 */
export class Vt2TranscriptProvider extends Context.Service<Vt2TranscriptProvider, Vt2TranscriptProviderShape>()(
  $I`Vt2TranscriptProvider`
) {}

/**
 * Memory context provider seam.
 *
 * @since 0.0.0
 * @category PortContract
 */
export interface Vt2MemoryContextProviderShape {
  readonly fetchContext: (
    session: Vt2SessionResource,
    packet: Vt2CompositionPacket
  ) => Effect.Effect<Vt2MemoryContextPacket, Vt2ProviderError>;
}

/**
 * Memory context provider tag.
 *
 * @since 0.0.0
 * @category PortContract
 */
export class Vt2MemoryContextProvider extends Context.Service<
  Vt2MemoryContextProvider,
  Vt2MemoryContextProviderShape
>()($I`Vt2MemoryContextProvider`) {}

/**
 * Composition provider seam.
 *
 * @since 0.0.0
 * @category PortContract
 */
export interface Vt2CompositionProviderShape {
  readonly prepareRun: (
    session: Vt2SessionResource,
    profile: Vt2CompositionProfile,
    preferences: Vt2DesktopPreferences,
    packet: Vt2CompositionPacket,
    memoryContextPacket: O.Option<Vt2MemoryContextPacket>
  ) => Effect.Effect<Vt2CompositionRun, Vt2ProviderError>;
}

/**
 * Composition provider tag.
 *
 * @since 0.0.0
 * @category PortContract
 */
export class Vt2CompositionProvider extends Context.Service<Vt2CompositionProvider, Vt2CompositionProviderShape>()(
  $I`Vt2CompositionProvider`
) {}

/**
 * Export provider seam.
 *
 * @since 0.0.0
 * @category PortContract
 */
export interface Vt2ExportProviderShape {
  readonly exportSession: (request: Vt2ExportRequest) => Effect.Effect<Vt2ExportArtifact, Vt2ProviderError>;
}

/**
 * Export provider tag.
 *
 * @since 0.0.0
 * @category PortContract
 */
export class Vt2ExportProvider extends Context.Service<Vt2ExportProvider, Vt2ExportProviderShape>()(
  $I`Vt2ExportProvider`
) {}

/**
 * Unsupported transcript provider layer used while the first slice is still on stubs.
 *
 * @since 0.0.0
 * @category Layers
 */
export const Vt2TranscriptProviderUnsupported = Layer.succeed(
  Vt2TranscriptProvider,
  Vt2TranscriptProvider.of({
    inspectRuntime: unsupportedTranscriptRuntime,
    transcribe: unsupportedTranscriptProvider,
  })
);

/**
 * Unsupported memory context provider layer used while the first slice is still on stubs.
 *
 * @since 0.0.0
 * @category Layers
 */
export const Vt2MemoryContextProviderUnsupported = Layer.succeed(
  Vt2MemoryContextProvider,
  Vt2MemoryContextProvider.of({
    fetchContext: unsupportedMemoryContextProvider,
  })
);

/**
 * Unsupported composition provider layer used while the first slice is still on stubs.
 *
 * @since 0.0.0
 * @category Layers
 */
export const Vt2CompositionProviderUnsupported = Layer.succeed(
  Vt2CompositionProvider,
  Vt2CompositionProvider.of({
    prepareRun: unsupportedCompositionProvider,
  })
);

/**
 * Unsupported export provider layer used while the first slice is still on stubs.
 *
 * @since 0.0.0
 * @category Layers
 */
export const Vt2ExportProviderUnsupported = Layer.succeed(
  Vt2ExportProvider,
  Vt2ExportProvider.of({
    exportSession: unsupportedExportProvider,
  })
);
