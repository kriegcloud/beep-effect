import * as FetchHttpClient from "@effect/platform/FetchHttpClient"
import * as FileSystem from "@effect/platform/FileSystem"
import * as HttpClient from "@effect/platform/HttpClient"
import * as KeyValueStore from "@effect/platform/KeyValueStore"
import { Layer } from "effect"

export const makeNodeRuntimeLayer = <R>(
  fileSystemLayer: Layer.Layer<FileSystem.FileSystem, never, R>,
  keyValueStoreLayer?: Layer.Layer<KeyValueStore.KeyValueStore, never, R>
): Layer.Layer<
  FileSystem.FileSystem | HttpClient.HttpClient | KeyValueStore.KeyValueStore,
  never,
  R
> =>
  Layer.mergeAll(
    fileSystemLayer,
    FetchHttpClient.layer,
    keyValueStoreLayer ?? KeyValueStore.layerMemory
  )
