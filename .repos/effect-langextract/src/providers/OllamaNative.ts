import * as AiError from "@effect/ai/AiError"
import * as NativeLanguageModel from "@effect/ai/LanguageModel"
import * as Prompt from "@effect/ai/Prompt"
import * as Response from "@effect/ai/Response"
import * as HttpClient from "@effect/platform/HttpClient"
import * as HttpClientRequest from "@effect/platform/HttpClientRequest"
import * as HttpClientResponse from "@effect/platform/HttpClientResponse"
import { Effect, Schema, Stream } from "effect"

import { errorMessage } from "../internal/errorMessage.js"

export interface OllamaNativeConfig {
  readonly modelId: string
  readonly baseUrl: string
  readonly temperature?: number | undefined
}

const JsonString = Schema.parseJson()

const OllamaGenerateResponse = Schema.Struct({
  response: Schema.String,
  done: Schema.optionalWith(Schema.Boolean, { exact: true })
})

const OllamaGenerateStreamResponse = Schema.Struct({
  response: Schema.optionalWith(Schema.String, { exact: true }),
  done: Schema.optionalWith(Schema.Boolean, { exact: true })
})

const stripTrailingSlash = (value: string): string => value.replace(/\/+$/, "")

const toAiError = (
  method: string,
  error: unknown
): AiError.AiError =>
  new AiError.UnknownError({
    module: "OllamaNative",
    method,
    description: errorMessage(error),
    cause: error
  })

const promptToText = (prompt: Prompt.RawInput): string =>
  typeof prompt === "string"
    ? prompt
    : JSON.stringify(Prompt.make(prompt).content)

const invokeOllama = (
  config: OllamaNativeConfig,
  client: HttpClient.HttpClient,
  prompt: string
): Effect.Effect<string, AiError.AiError> =>
  Effect.gen(function* () {
    const requestBody = {
      model: config.modelId,
      prompt,
      stream: false,
      ...(config.temperature !== undefined
        ? { options: { temperature: config.temperature } }
        : {})
    }

    const request = HttpClientRequest.bodyUnsafeJson(
      HttpClientRequest.post(`${stripTrailingSlash(config.baseUrl)}/api/generate`),
      requestBody
    )

    const parsedResponse = yield* client.execute(request).pipe(
      Effect.flatMap(HttpClientResponse.filterStatusOk),
      Effect.flatMap(HttpClientResponse.schemaBodyJson(OllamaGenerateResponse)),
      Effect.mapError((error) => toAiError("invokeOllama", error))
    )

    return parsedResponse.response
  })

const invokeOllamaStream = (
  config: OllamaNativeConfig,
  client: HttpClient.HttpClient,
  prompt: string
): Stream.Stream<string, AiError.AiError> => {
  const requestBody = {
    model: config.modelId,
    prompt,
    stream: true,
    ...(config.temperature !== undefined
      ? { options: { temperature: config.temperature } }
      : {})
  }

  const request = HttpClientRequest.bodyUnsafeJson(
    HttpClientRequest.post(`${stripTrailingSlash(config.baseUrl)}/api/generate`),
    requestBody
  )

  return HttpClientResponse.stream(
    client.execute(request).pipe(
      Effect.flatMap(HttpClientResponse.filterStatusOk),
      Effect.mapError((error) => toAiError("invokeOllamaStream", error))
    )
  ).pipe(
    Stream.decodeText(),
    Stream.splitLines,
    Stream.filter((line) => line.trim().length > 0),
    Stream.mapEffect((line) =>
      Schema.decodeUnknown(JsonString)(line).pipe(
        Effect.flatMap((decoded) =>
          Schema.decodeUnknown(OllamaGenerateStreamResponse)(decoded)
        ),
        Effect.mapError((error) => toAiError("decodeStreamChunk", error))
      )
    ),
    Stream.map((chunk) => chunk.response ?? ""),
    Stream.filter((delta) => delta.length > 0),
    Stream.mapError((error) => toAiError("invokeOllamaStreamDecode", error))
  )
}

export const makeOllamaNativeLanguageModel = (
  config: OllamaNativeConfig,
  client: HttpClient.HttpClient
): Effect.Effect<NativeLanguageModel.Service> =>
  NativeLanguageModel.make({
    generateText: ({ prompt }) =>
      invokeOllama(config, client, promptToText(prompt)).pipe(
        Effect.map(
          (text): Array<Response.PartEncoded> => [
            {
              type: "text",
              text
            }
          ]
        )
      ),
    streamText: ({ prompt }) => {
      const streamId = "ollama-text"
      const startPart: Response.StreamPartEncoded = {
        type: "text-start",
        id: streamId
      }
      const endPart: Response.StreamPartEncoded = {
        type: "text-end",
        id: streamId
      }

      return Stream.fromIterable([startPart]).pipe(
        Stream.concat(
          invokeOllamaStream(config, client, promptToText(prompt)).pipe(
            Stream.map(
              (delta): Response.StreamPartEncoded => ({
                type: "text-delta",
                id: streamId,
                delta
              })
            )
          )
        ),
        Stream.concat(Stream.fromIterable([endPart]))
      )
    }
  })
