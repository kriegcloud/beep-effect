import { Effect, Layer } from "effect"
import { BridgeHandler } from "../../src/BridgeHandler"
import { SandboxError } from "../../src/RlmError"
import { SandboxConfig, SandboxFactory } from "../../src/Sandbox"
import { SandboxBunLive } from "../../src/SandboxBun"
import type { CallId } from "../../src/RlmTypes"

type TransportMode = "spawn" | "worker"

interface BenchSummary {
  readonly transport: TransportMode
  readonly iterations: number
  readonly payloadBytes: number
  readonly avgMs: number
  readonly minMs: number
  readonly maxMs: number
  readonly p95Ms: number
}

const DEFAULT_PAYLOAD_BYTES = 19 * 1024 * 1024
const DEFAULT_ITERATIONS = 10
const WARMUP_ITERATIONS = 1

const parsePositiveInt = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback
  const n = Number.parseInt(value, 10)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

const targetPayloadBytes = parsePositiveInt(Bun.env.TRANSPORT_BENCH_BYTES, DEFAULT_PAYLOAD_BYTES)
const iterations = parsePositiveInt(Bun.env.TRANSPORT_BENCH_ITERATIONS, DEFAULT_ITERATIONS)

const makePayload = (targetBytes: number): string => {
  const line = JSON.stringify({
    id: "doc",
    title: "transport-benchmark",
    text: "x".repeat(1024)
  }) + "\n"
  const lineBytes = new TextEncoder().encode(line).byteLength
  const count = Math.max(1, Math.ceil(targetBytes / lineBytes))
  const payload = line.repeat(count)
  // ASCII-only payload, so char count == UTF-8 byte count.
  return payload.slice(0, targetBytes)
}

const payload = makePayload(targetPayloadBytes)
const payloadBytes = new TextEncoder().encode(payload).byteLength

const bridgeLayer = Layer.succeed(
  BridgeHandler,
  BridgeHandler.of({
    handle: () => Effect.fail(new SandboxError({ message: "Bridge calls are not expected in transport benchmark" }))
  })
)

const makeLayer = (transport: TransportMode) => {
  const sandboxLayer = Layer.provide(SandboxBunLive, bridgeLayer)
  return Layer.provide(
    sandboxLayer,
    Layer.succeed(SandboxConfig, {
      sandboxMode: "permissive",
      sandboxTransport: transport,
      executeTimeoutMs: 30_000,
      setVarTimeoutMs: 30_000,
      getVarTimeoutMs: 30_000,
      listVarTimeoutMs: 5_000,
      shutdownGraceMs: 2_000,
      maxFrameBytes: 32 * 1024 * 1024,
      maxBridgeConcurrency: 4,
      incomingFrameQueueCapacity: 2_048,
      workerPath: new URL("../../src/sandbox-worker.ts", import.meta.url).pathname
    })
  )
}

const percentile = (values: ReadonlyArray<number>, p: number): number => {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1))
  return sorted[idx]!
}

const summarize = (transport: TransportMode, timingsMs: ReadonlyArray<number>): BenchSummary => {
  const total = timingsMs.reduce((sum, current) => sum + current, 0)
  return {
    transport,
    iterations: timingsMs.length,
    payloadBytes,
    avgMs: total / Math.max(1, timingsMs.length),
    minMs: Math.min(...timingsMs),
    maxMs: Math.max(...timingsMs),
    p95Ms: percentile(timingsMs, 95)
  }
}

const runSingle = (transport: TransportMode, iteration: number) =>
  Effect.scoped(
    Effect.gen(function*() {
      const factory = yield* SandboxFactory
      const sandbox = yield* factory.create({ callId: `${transport}-${iteration}` as CallId, depth: 0 })

      const startedAt = performance.now()
      yield* sandbox.setVariable("context", payload)
      const roundtrip = yield* sandbox.getVariable("context")
      const elapsedMs = performance.now() - startedAt

      if (typeof roundtrip !== "string" || roundtrip.length !== payload.length) {
        return yield* new SandboxError({ message: "Payload roundtrip mismatch during benchmark" })
      }

      return elapsedMs
    })
  ).pipe(Effect.provide(makeLayer(transport)))

const runBenchmarkForTransport = Effect.fn("runBenchmarkForTransport")(function*(transport: TransportMode) {
  for (let warmup = 0; warmup < WARMUP_ITERATIONS; warmup += 1) {
    yield* runSingle(transport, -1)
  }

  const timings = yield* Effect.forEach(
    Array.from({ length: iterations }, (_, i) => i),
    (iteration) => runSingle(transport, iteration),
    { concurrency: 1 }
  )

  return summarize(transport, timings)
})

const prettyMs = (value: number) => `${value.toFixed(2)}ms`

const printSummary = (summary: BenchSummary): void => {
  console.log(
    [
      `${summary.transport.toUpperCase()} transport`,
      `  iterations: ${summary.iterations}`,
      `  payload: ${summary.payloadBytes.toLocaleString()} bytes`,
      `  avg: ${prettyMs(summary.avgMs)}`,
      `  min: ${prettyMs(summary.minMs)}`,
      `  p95: ${prettyMs(summary.p95Ms)}`,
      `  max: ${prettyMs(summary.maxMs)}`
    ].join("\n")
  )
}

const main = Effect.gen(function*() {
  const targets: ReadonlyArray<TransportMode> = ["spawn", "worker"]
  const summaries = yield* Effect.forEach(targets, (transport) => runBenchmarkForTransport(transport))

  for (const summary of summaries) {
    printSummary(summary)
  }

  const spawn = summaries.find((summary) => summary.transport === "spawn")
  const worker = summaries.find((summary) => summary.transport === "worker")

  if (spawn && worker && worker.avgMs > 0) {
    const speedup = spawn.avgMs / worker.avgMs
    console.log(`\nWorker vs spawn average speedup: ${speedup.toFixed(2)}x`)
  }
})

Effect.runPromise(main).catch((error) => {
  console.error(error)
  process.exitCode = 1
})
