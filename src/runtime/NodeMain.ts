import * as KeyValueStore from "@effect/platform/KeyValueStore"
import * as NodeCommandExecutor from "@effect/platform-node-shared/NodeCommandExecutor"
import * as NodeFileSystem from "@effect/platform-node-shared/NodeFileSystem"
import * as NodeKeyValueStore from "@effect/platform-node-shared/NodeKeyValueStore"
import * as NodePath from "@effect/platform-node-shared/NodePath"
import * as NodeRuntime from "@effect/platform-node-shared/NodeRuntime"
import * as NodeTerminal from "@effect/platform-node-shared/NodeTerminal"
import { Effect, Layer } from "effect"

import { runCli } from "../Cli.js"
import { makeNodeRuntimeLayer } from "./NodeRuntime.js"

const resolveCacheDir = (
  argv: ReadonlyArray<string>,
  env: Readonly<Record<string, string | undefined>>
): string => {
  const index = argv.indexOf("--primed-cache-dir")
  if (index >= 0) {
    const value = argv[index + 1]
    if (value !== undefined && value.startsWith("--") === false) {
      return value
    }
  }
  return env.PRIMED_CACHE_DIR ?? ".cache/langextract/primed"
}

export const runNodeCliMain = (
  argv: ReadonlyArray<string> = process.argv
): void => {
  const keyValueStoreLayer: Layer.Layer<KeyValueStore.KeyValueStore> =
    NodeKeyValueStore.layerFileSystem(resolveCacheDir(argv, process.env)).pipe(
      Layer.orDie
    )

  const nodeRuntimeBase = makeNodeRuntimeLayer(
    NodeFileSystem.layer,
    keyValueStoreLayer
  )
  const runtimeLayer = Layer.mergeAll(
    nodeRuntimeBase,
    NodePath.layer,
    NodeTerminal.layer,
    Layer.provide(NodeCommandExecutor.layer, NodeFileSystem.layer)
  )

  const program = runCli(argv, {
    env: process.env,
    primedCacheStoreLayer: keyValueStoreLayer
  }).pipe(Effect.provide(runtimeLayer))

  NodeRuntime.runMain(program)
}

runNodeCliMain()
