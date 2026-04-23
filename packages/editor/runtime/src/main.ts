/**
 * Bun executable entrypoint for the editor sidecar runtime.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { BunRuntime } from "@effect/platform-bun";
import * as BunFileSystem from "@effect/platform-bun/BunFileSystem";
import * as BunPath from "@effect/platform-bun/BunPath";
import { Effect, Layer } from "effect";
import { loadEditorRuntimeConfig, runEditorRuntime } from "./index.js";

const loadConfig = Effect.scoped(
  Layer.build(Layer.mergeAll(BunFileSystem.layer, BunPath.layer)).pipe(
    Effect.flatMap(
      Effect.fnUntraced(function* (context) {
        return yield* loadEditorRuntimeConfig().pipe(Effect.provide(context));
      })
    )
  )
);

const main = loadConfig.pipe(
  Effect.flatMap(
    Effect.fnUntraced(function* (config) {
      return yield* runEditorRuntime(config);
    })
  ),
  Effect.scoped
);

BunRuntime.runMain(main);
