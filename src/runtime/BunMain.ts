import * as FetchHttpClient from "@effect/platform/FetchHttpClient"
import * as BunContext from "@effect/platform-bun/BunContext"
import { Effect, Layer } from "effect"

import { runCli } from "../Cli.js"
import { makeBunAlignmentExecutorLayer } from "./BunAlignmentWorker.js"
import { makeBunKeyValueStoreLayer } from "./BunRuntime.js"

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

const parseInteger = (value: string | undefined): number | undefined => {
  if (value === undefined) {
    return undefined
  }
  const parsed = Number(value)
  return Number.isFinite(parsed) ? Math.trunc(parsed) : undefined
}

const parseOptionInteger = (
  argv: ReadonlyArray<string>,
  optionName: string
): number | undefined => {
  const index = argv.indexOf(optionName)
  if (index < 0) {
    return undefined
  }

  const value = argv[index + 1]
  if (value === undefined || value.startsWith("--")) {
    return undefined
  }

  return parseInteger(value)
}

const clampWorkerPoolSize = (value: number): number =>
  Math.max(1, Math.min(16, Math.trunc(value)))

const resolveWorkerPoolSize = (
  argv: ReadonlyArray<string>,
  env: Readonly<Record<string, string | undefined>>
): number => {
  const fromEnv = parseInteger(env.LANGEXTRACT_BUN_WORKER_POOL_SIZE)
  if (fromEnv !== undefined) {
    return clampWorkerPoolSize(fromEnv)
  }

  const batchConcurrency =
    parseOptionInteger(argv, "--batch-concurrency") ??
    parseInteger(env.BATCH_CONCURRENCY) ??
    1

  return clampWorkerPoolSize(batchConcurrency)
}

export const runCliMain = (
  argv: ReadonlyArray<string> = process.argv
): void => {
  const keyValueStoreLayer = makeBunKeyValueStoreLayer(
    resolveCacheDir(argv, process.env)
  )
  const enableWorkers =
    (process.env.LANGEXTRACT_ENABLE_BUN_WORKERS ?? "").toLowerCase() === "true"
  const runtimeBaseLayer = Layer.mergeAll(
    BunContext.layer,
    FetchHttpClient.layer,
    keyValueStoreLayer
  )
  const workerPoolSize = resolveWorkerPoolSize(argv, process.env)
  const alignmentExecutorLayer = enableWorkers
    ? makeBunAlignmentExecutorLayer({
        poolSize: workerPoolSize
      })
    : undefined

  const program = runCli(argv, {
    env: process.env,
    primedCacheStoreLayer: keyValueStoreLayer,
    ...(alignmentExecutorLayer !== undefined
      ? { alignmentExecutorLayer }
      : {})
  }).pipe(Effect.provide(runtimeBaseLayer))

  Effect.runPromise(program).catch((error: unknown) => {
    console.error(
      error instanceof Error ? error.message : `CLI execution failed: ${String(error)}`
    )
    process.exitCode = 1
  })
}
