import * as FileSystem from "@effect/platform/FileSystem"
import * as HttpClient from "@effect/platform/HttpClient"
import * as HttpClientResponse from "@effect/platform/HttpClientResponse"
import * as HttpIncomingMessage from "@effect/platform/HttpIncomingMessage"
import { Effect, Option, Stream } from "effect"

import { IngestionSourceError } from "../Errors.js"

export type ByteSourceTag = "file" | "url" | "stdin"

export interface ByteSource<R = never> {
  readonly sourceTag: ByteSourceTag
  readonly sourceRef: string
  readonly stream: Stream.Stream<Uint8Array, IngestionSourceError, R>
}

const toSourceError = (
  message: string,
  sourceTag: "text" | ByteSourceTag,
  sourceRef: string
) =>
(error: unknown): IngestionSourceError =>
  new IngestionSourceError({
    message: `${message}: ${String(error)}`,
    sourceTag,
    sourceRef
  })

export const isHttpUrl = (value: string): boolean => {
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

export const stdinPath = "/dev/stdin"

export const streamFileSource = (
  path: string
): ByteSource<FileSystem.FileSystem> => ({
  sourceTag: "file",
  sourceRef: path,
  stream: Stream.unwrap(
    Effect.gen(function* () {
      const fileSystem = yield* FileSystem.FileSystem
      return fileSystem.stream(path)
    }).pipe(Effect.mapError(toSourceError("Failed to read file", "file", path)))
  ).pipe(Stream.mapError(toSourceError("Failed to read file", "file", path)))
})

export const streamStdinSource = (): ByteSource<FileSystem.FileSystem> => ({
  sourceTag: "stdin",
  sourceRef: stdinPath,
  stream: Stream.unwrap(
    Effect.gen(function* () {
      const fileSystem = yield* FileSystem.FileSystem
      return fileSystem.stream(stdinPath)
    }).pipe(
      Effect.mapError(toSourceError("Failed to read stdin", "stdin", stdinPath))
    )
  ).pipe(
    Stream.mapError(toSourceError("Failed to read stdin", "stdin", stdinPath))
  )
})

export const streamUrlSource = (
  url: string,
  maxBodyBytes?: number | undefined
): ByteSource<HttpClient.HttpClient> => ({
  sourceTag: "url",
  sourceRef: url,
  stream: HttpClientResponse.stream(
    HttpClient.get(url).pipe(
      Effect.flatMap(HttpClientResponse.filterStatusOk),
      HttpIncomingMessage.withMaxBodySize(
        maxBodyBytes !== undefined ? Option.some(maxBodyBytes) : Option.none<number>()
      ),
      Effect.mapError(toSourceError("Failed to fetch URL", "url", url))
    )
  ).pipe(Stream.mapError(toSourceError("Failed to read URL body", "url", url)))
})
