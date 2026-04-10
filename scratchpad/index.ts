import {Config, Effect, Layer, pipe, Context} from "effect";
import * as S from "effect/Schema";
import {$V2TId} from "@beep/identity";
import { SchemaUtils, TaggedErrorClass } from "@beep/schema";
import * as O from "effect/Option";

const $I = $V2TId.create("Project");

export class DomainError extends S.Class<DomainError>($I`DomainError`)({
  cause: S.Option(S.Unknown).pipe(
    SchemaUtils.withKeyDefaults(O.none())
  ),
  message: S.OptionFromOptionalKey(S.String),
}, $I.annote("DomainError", {
  description: "The base domain error."
})) {
}



/**
 * The Project Domain model for housing the data for a V2T dataset
 *
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class Project extends S.Class<Project>($I`Project`)(
  {
    name: S.NonEmptyString,
    description: S.OptionFromOptionalKey(S.String),
  },
  $I.annote(
    "Project",
    {
      description: "The Project Domain model for housing the data for a V2T dataset",
    }
  )
) {
}

/**
 * The DomainModel for a V2T Generation Run
 *
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class Run extends S.Class<Run>($I`Run`)(
  {},
  $I.annote(
    "Run",
    {
      description: "The DomainModel for a V2T Generation Run ",
    }
  )
) {
}

/**
 * AudioFile - the AudioFile DomainModel for storing the reference to recorded audio files on disk
 *
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class AudioFile extends S.Class<AudioFile>($I`AudioFile`)(
  {},
  $I.annote(
    "AudioFile",
    {
      description: "AudioFile - the AudioFile DomainModel for storing the reference to recorded audio files on disk",
    }
  )
) {
}

/**
 * AudioTranscript - The DomainModel for storing the Ref to the Generated Audio
 * Transcript of an AudioFile
 *
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class AudioTranscript extends S.Class<AudioTranscript>($I`AudioTranscript`)(
  {},
  $I.annote(
    "AudioTranscript",
    {
      description: "AudioTranscript - The DomainModel for the Generated Audio Transcript of an AudioFile",
    }
  )
) {
}


export class V2TConfigShape extends S.Class<V2TConfigShape>($I`V2TConfigShape`)(
  {
    graphitiMcpUrl: S.URLFromString,
    serverUrl: S.URLFromString,
    elevanLabsApiKey: S.Redacted(S.String),
    xAiApiKey: S.Redacted(S.String),
    apiPath: S.Literal("/api/v1/v2t").pipe(SchemaUtils.withKeyDefaults("/api/v1/v2t"))
  }
) {
}

export class V2TConfig extends Context.Service<V2TConfig, V2TConfigShape>()($I`V2TConfigShape`) {
  static readonly layer = Effect.gen(function* () {
    const config = yield* Config.all({
      graphitiMcpUrl: Config.url(""),
      serverUrl: Config.url("localhost:8080"),
      elevanLabsApiKey: Config.redacted("AI_ELEVENLABS_API_KEY"),
      xAiApiKey: Config.redacted("AI_XAI_API_KEY").pipe(Config.withDefault("/api/v1/v2t")),
    })
    const parsed = yield* S.decodeUnknownEffect(V2TConfigShape)(config)

    return V2TConfig.of(parsed)
  }).pipe(Layer.effect(V2TConfig))
}


export interface XAiApiServiceShape {
  startGeneration: () => Effect.Effect<unknown>,
  stopGeneration: () => Effect.Effect<unknown>
}
