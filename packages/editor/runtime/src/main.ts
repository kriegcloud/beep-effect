import { BunRuntime } from "@effect/platform-bun";
import * as BunFileSystem from "@effect/platform-bun/BunFileSystem";
import * as BunPath from "@effect/platform-bun/BunPath";
import { Effect, Layer } from "effect";
import { loadEditorRuntimeConfig, runEditorRuntime } from "./index.js";

const main = Layer.effectDiscard(
  Effect.gen(function* () {
    const config = yield* loadEditorRuntimeConfig();
    yield* runEditorRuntime(config);
  })
).pipe(Layer.provide(Layer.mergeAll(BunFileSystem.layer, BunPath.layer)));

BunRuntime.runMain(Layer.launch(main));
