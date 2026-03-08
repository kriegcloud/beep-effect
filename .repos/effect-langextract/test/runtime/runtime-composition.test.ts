import * as KeyValueStore from "@effect/platform/KeyValueStore"
import * as NodeCommandExecutor from "@effect/platform-node-shared/NodeCommandExecutor"
import * as NodeFileSystem from "@effect/platform-node-shared/NodeFileSystem"
import * as NodePath from "@effect/platform-node-shared/NodePath"
import * as NodeTerminal from "@effect/platform-node-shared/NodeTerminal"
import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer } from "effect"

import { runCli } from "../../src/Cli.js"
import { makeBunRuntimeLayer } from "../../src/runtime/BunRuntime.js"
import { makeNodeRuntimeLayer } from "../../src/runtime/NodeRuntime.js"

const tempCacheDir = (): string =>
  `/tmp/effect-langextract-runtime-${Date.now()}-${Math.random()}`

describe("Runtime composition", () => {
  it.effect("executes CLI with Bun runtime composition", () =>
    runCli(["bun", "src/main.ts", "--help"], {
      env: process.env,
      emitResultToStdout: false
    }).pipe(
      Effect.provide(
        makeBunRuntimeLayer(tempCacheDir(), { includeWorkers: true })
      ),
      Effect.tap(() => Effect.sync(() => expect(true).toBe(true)))
    )
  )

  it.effect("executes CLI with Node runtime composition helper", () =>
    runCli(["node", "dist/src/runtime/NodeMain.js", "--help"], {
      env: process.env,
      emitResultToStdout: false
    }).pipe(
      Effect.provide(
        Layer.mergeAll(
          makeNodeRuntimeLayer(NodeFileSystem.layer, KeyValueStore.layerMemory),
          NodePath.layer,
          NodeTerminal.layer,
          Layer.provide(NodeCommandExecutor.layer, NodeFileSystem.layer)
        )
      ),
      Effect.tap(() => Effect.sync(() => expect(true).toBe(true)))
    )
  )
})
