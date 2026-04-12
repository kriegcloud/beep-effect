import { BunRuntime } from "@effect/platform-bun";
import * as BunFileSystem from "@effect/platform-bun/BunFileSystem";
import * as BunPath from "@effect/platform-bun/BunPath";
import { Effect, FileSystem, Layer } from "effect";
import { loadVt2RuntimeConfig, makeVt2RuntimeError, runVt2Runtime } from "./Server/index.js";

const vt2RuntimeLayer = Layer.mergeAll(BunFileSystem.layer, BunPath.layer);

const ensureAppDataDir = (config: Parameters<typeof runVt2Runtime>[0]) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;

    yield* fs.makeDirectory(config.appDataDir, { recursive: true });
    return config;
  }).pipe(Effect.mapError(() => makeVt2RuntimeError(`Failed to create "${config.appDataDir}".`, 500)));

const main = Effect.scoped(
  Layer.build(vt2RuntimeLayer).pipe(
    Effect.flatMap((context) =>
      loadVt2RuntimeConfig().pipe(
        Effect.flatMap(ensureAppDataDir),
        Effect.flatMap(runVt2Runtime),
        Effect.provide(context)
      )
    )
  )
);

BunRuntime.runMain(main);
