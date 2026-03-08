import * as WorkerRunner from "@effect/platform/WorkerRunner"
import * as BunWorkerRunner from "@effect/platform-bun/BunWorkerRunner"
import { Effect, Layer } from "effect"

import { Resolver } from "../../Resolver.js"
import {
  AlignChunkRequest,
  AlignmentWorkerMessage
} from "./AlignmentWorkerProtocol.js"

const WorkerLive = WorkerRunner.layerSerialized(AlignmentWorkerMessage, {
  AlignChunkRequest: (request: AlignChunkRequest) =>
    Effect.gen(function* () {
      const resolver = yield* Resolver

      return yield* resolver
        .align(
          request.extractions,
          request.sourceText,
          request.tokenOffset,
          request.charOffset,
          {
            ...(request.enableFuzzyAlignment !== undefined
              ? { enableFuzzyAlignment: request.enableFuzzyAlignment }
              : {}),
            ...(request.fuzzyAlignmentThreshold !== undefined
              ? {
                  fuzzyAlignmentThreshold: request.fuzzyAlignmentThreshold
                }
              : {}),
            ...(request.acceptMatchLesser !== undefined
              ? { acceptMatchLesser: request.acceptMatchLesser }
              : {})
          }
        )
        .pipe(Effect.orDie)
    })
}).pipe(Layer.provide(Resolver.Default), Layer.provide(BunWorkerRunner.layer))

Effect.runFork(WorkerRunner.launch(WorkerLive))
