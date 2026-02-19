#!/usr/bin/env node

/**
 * @since 1.0.0
 */

import * as NodeContext from "@effect/platform-node/NodeContext"
import * as NodeRuntime from "@effect/platform-node/NodeRuntime"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Logger from "effect/Logger"
import * as LogLevel from "effect/LogLevel"
import { cli } from "./CLI.js"
import * as Configuration from "./Configuration.js"
import * as Process from "./Process.js"

/** @internal */
export const MainLive = Configuration.configProviderLayer.pipe(
  Layer.provideMerge(Layer.mergeAll(
    Logger.minimumLogLevel(LogLevel.Info),
    Process.layer,
    NodeContext.layer
  ))
)

Effect.sync(() => process.argv.slice(2)).pipe(
  Effect.flatMap((args) => cli(args)),
  Effect.provide(MainLive),
  NodeRuntime.runMain
)
