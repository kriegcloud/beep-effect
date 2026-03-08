import * as FetchHttpClient from "@effect/platform/FetchHttpClient"
import * as FileSystem from "@effect/platform/FileSystem"
import * as HttpClient from "@effect/platform/HttpClient"
import * as KeyValueStore from "@effect/platform/KeyValueStore"
import * as BunContext from "@effect/platform-bun/BunContext"
import * as BunKeyValueStore from "@effect/platform-bun/BunKeyValueStore"
import * as BunWorkerRunner from "@effect/platform-bun/BunWorkerRunner"
import { Layer } from "effect"

export const makeBunKeyValueStoreLayer = (
  cacheDir: string
): Layer.Layer<KeyValueStore.KeyValueStore> =>
  BunKeyValueStore.layerFileSystem(cacheDir).pipe(Layer.orDie)

export const makeBunRuntimeLayer = (
  cacheDir: string,
  options?: {
    readonly includeWorkers?: boolean | undefined
  }
): Layer.Layer<
  FileSystem.FileSystem | HttpClient.HttpClient | KeyValueStore.KeyValueStore
> =>
  options?.includeWorkers
    ? Layer.mergeAll(
        BunContext.layer,
        FetchHttpClient.layer,
        makeBunKeyValueStoreLayer(cacheDir),
        BunWorkerRunner.layer
      )
    : Layer.mergeAll(
        BunContext.layer,
        FetchHttpClient.layer,
        makeBunKeyValueStoreLayer(cacheDir)
      )
