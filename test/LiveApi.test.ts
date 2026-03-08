/**
 * Live API integration tests.
 *
 * These tests make real API calls and cost real tokens.
 * They are skipped unless ANTHROPIC_API_KEY is set AND
 * the `LIVE_API_TESTS=1` flag is provided.
 *
 * Usage:
 *   LIVE_API_TESTS=1 bun test test/LiveApi.test.ts
 */
import { describe, expect, test } from "bun:test"
import { Effect, Schema } from "effect"
import { Rlm } from "../src/Rlm"
import { buildCliLayer, type CliArgs } from "../src/CliLayer"

const SKIP = !process.env.LIVE_API_TESTS || !process.env.ANTHROPIC_API_KEY

const makeArgs = (overrides?: Partial<CliArgs>): CliArgs => ({
  query: "",
  context: "",
  provider: "anthropic",
  model: "claude-haiku-4-5-20251001",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY!,
  quiet: true,
  noColor: true,
  nlpTools: false,
  noTrace: false,
  traceDir: ".rlm/traces/live-test",
  maxIterations: 10,
  maxDepth: 0,
  maxLlmCalls: 15,
  ...overrides
})

const run = <A>(
  args: CliArgs,
  options: Parameters<Rlm["Type"]["complete"]>[0]
) =>
  Effect.gen(function*() {
    const rlm = yield* Rlm
    return yield* (rlm.complete as any)(options)
  }).pipe(Effect.provide(buildCliLayer(args)))

describe.skipIf(SKIP)("Live API — Anthropic", () => {
  // -------------------------------------------------------
  // 1. Sanity: simple question, no FS/shell needed
  // -------------------------------------------------------
  test("simple arithmetic — single iteration", async () => {
    const args = makeArgs({
      query: "What is 17 * 23? Return ONLY the number.",
      context: "Compute the product of 17 and 23.",
      maxIterations: 10,
      maxLlmCalls: 10
    })

    const answer = await Effect.runPromise(run(args, {
      query: args.query,
      context: args.context
    }))

    expect(answer).toContain("391")
  }, 60_000)

  // -------------------------------------------------------
  // 2. FS round-trip: write + read + process in sandbox
  // -------------------------------------------------------
  test("FS workflow — write data, filter with code, submit result", async () => {
    const context = JSON.stringify([
      { city: "Tokyo", pop: 13960000, continent: "Asia" },
      { city: "London", pop: 8982000, continent: "Europe" },
      { city: "Mumbai", pop: 12478000, continent: "Asia" },
      { city: "Paris", pop: 2161000, continent: "Europe" },
      { city: "Seoul", pop: 9776000, continent: "Asia" }
    ])

    const args = makeArgs({
      query: "List the Asian cities from the dataset, sorted by population descending. Return a comma-separated list of city names.",
      context,
      maxIterations: 8,
      maxLlmCalls: 10
    })

    const answer = await Effect.runPromise(run(args, {
      query: args.query,
      context: args.context
    }))

    // Should contain all three Asian cities
    expect(answer).toContain("Tokyo")
    expect(answer).toContain("Mumbai")
    expect(answer).toContain("Seoul")
    // Should NOT contain European cities
    expect(answer).not.toContain("London")
    expect(answer).not.toContain("Paris")
  }, 120_000)

  // -------------------------------------------------------
  // 3. Shell + grep flow: write files, grep, aggregate
  // -------------------------------------------------------
  test("grep workflow — write log files, search with shell, count results", async () => {
    const logData = [
      "2025-01-01 10:00 INFO  server started on port 8080",
      "2025-01-01 10:05 ERROR connection refused to database",
      "2025-01-01 10:10 WARN  disk usage at 85%",
      "2025-01-01 10:15 ERROR timeout waiting for response from auth service",
      "2025-01-01 10:20 INFO  request processed in 150ms",
      "2025-01-01 10:25 ERROR out of memory exception in worker pool",
      "2025-01-01 10:30 INFO  backup completed successfully",
      "2025-01-01 10:35 WARN  certificate expires in 7 days",
      "2025-01-01 10:40 INFO  cache hit ratio: 94%",
      "2025-01-01 10:45 ERROR failed to write to /var/log/app.log"
    ].join("\n")

    const args = makeArgs({
      query: "How many ERROR lines are in the log? Also list the error messages (just the message part after ERROR, one per line). Return the count first, then the messages.",
      context: logData,
      maxIterations: 12,
      maxLlmCalls: 15
    })

    const answer = await Effect.runPromise(run(args, {
      query: args.query,
      context: args.context
    }))

    // 4 ERROR lines
    expect(answer).toContain("4")
    expect(answer).toContain("connection refused")
    expect(answer).toContain("timeout")
    expect(answer).toContain("out of memory")
  }, 120_000)

  // -------------------------------------------------------
  // 4. Multi-iteration: explore → filter → aggregate
  // -------------------------------------------------------
  test("multi-step data processing — structured output", async () => {
    const dataset = Array.from({ length: 30 }, (_, i) => ({
      id: i + 1,
      product: ["Widget", "Gadget", "Doohickey"][i % 3],
      quantity: (i % 7) + 1,
      price: ((i % 5) + 1) * 10,
      region: ["North", "South", "East", "West"][i % 4]
    }))

    const ResultSchema = Schema.Struct({
      totalRevenue: Schema.Number,
      topProduct: Schema.String,
      topRegion: Schema.String
    })

    const args = makeArgs({
      query: "Calculate total revenue (quantity * price) for each product and each region. Return the overall total revenue, the product with highest revenue, and the region with highest revenue.",
      context: JSON.stringify(dataset),
      maxIterations: 10,
      maxLlmCalls: 12
    })

    const result = await Effect.runPromise(run(args, {
      query: args.query,
      context: args.context,
      outputSchema: ResultSchema
    }))

    // Verify the LLM computed correct values
    // Manual calculation:
    const expectedTotal = dataset.reduce((sum, r) => sum + r.quantity * r.price, 0)
    expect(result.totalRevenue).toBe(expectedTotal)
    expect(typeof result.topProduct).toBe("string")
    expect(["Widget", "Gadget", "Doohickey"]).toContain(result.topProduct)
    expect(typeof result.topRegion).toBe("string")
    expect(["North", "South", "East", "West"]).toContain(result.topRegion)
  }, 180_000)

  // -------------------------------------------------------
  // 5. Shell pipeline: CSV processing with unix tools
  // -------------------------------------------------------
  test("shell pipeline — CSV data, awk/grep/sort processing", async () => {
    const csv = [
      "name,department,salary",
      "Alice,Engineering,120000",
      "Bob,Marketing,85000",
      "Carol,Engineering,130000",
      "Dave,Marketing,90000",
      "Eve,Engineering,115000",
      "Frank,Sales,95000",
      "Grace,Engineering,125000",
      "Hank,Sales,88000"
    ].join("\n")

    const args = makeArgs({
      query: "Using the CSV data, find: (1) How many people are in Engineering? (2) What is the average salary in Engineering (round to nearest integer)? Return as 'count: N, avg: M'.",
      context: csv,
      maxIterations: 8,
      maxLlmCalls: 10
    })

    const answer = await Effect.runPromise(run(args, {
      query: args.query,
      context: args.context
    }))

    // 4 engineers: Alice, Carol, Eve, Grace
    expect(answer).toContain("4")
    // Average: (120000+130000+115000+125000)/4 = 122500
    expect(answer).toContain("122500")
  }, 120_000)
})
