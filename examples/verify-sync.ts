/**
 * Verification script to check if all replicas have converged to the same state.
 *
 * Usage:
 *   bun examples/verify-sync.ts alice bob carol
 *   bun examples/verify-sync.ts replica-1 replica-2 replica-3
 */

import * as Effect from "effect/Effect"
import * as Console from "effect/Console"
import * as HttpClient from "@effect/platform/HttpClient"
import * as FetchHttpClient from "@effect/platform/FetchHttpClient"
import { PNCounterState } from "../src/CRDTCounter.js"

// Parse arguments: all args are replica IDs except ones starting with "http"
const args = process.argv.slice(2)
const serverUrlArg = args.find((arg) => arg.startsWith("http"))
const serverUrl = serverUrlArg || "http://localhost:3001"
const replicaIds = args.filter((arg) => !arg.startsWith("http"))

if (replicaIds.length < 2) {
  console.error("Usage: bun examples/verify-sync.ts <replica1> <replica2> [replica3...] [serverUrl]")
  console.error("Example: bun examples/verify-sync.ts alice bob carol")
  console.error("Example: bun examples/verify-sync.ts alice bob http://localhost:3002")
  process.exit(1)
}

const fetchReplicaState = (replicaId: string) =>
  Effect.gen(function* () {
    const client = yield* HttpClient.HttpClient

    const response = yield* client.get(`${serverUrl}/counter/${replicaId}`)

    const json = (yield* response.json) as { state: PNCounterState }

    return {
      replicaId,
      state: json.state
    }
  })

const calculateCounterValue = (state: PNCounterState): number => {
  let total = 0

  // Sum all counts
  for (const count of state.counts.values()) {
    total += count
  }

  // Subtract all decrements
  for (const decrement of state.decrements.values()) {
    total -= decrement
  }

  return total
}

const program = Effect.gen(function* () {
  yield* Console.log("🔍 Verifying CRDT State Synchronization")
  yield* Console.log("=".repeat(60))
  yield* Console.log(`Server: ${serverUrl}`)
  yield* Console.log(`Replicas: ${replicaIds.join(", ")}`)
  yield* Console.log("")

  // Fetch all replica states
  yield* Console.log("📥 Fetching replica states...")
  const states = yield* Effect.all(
    replicaIds.map(fetchReplicaState),
    { concurrency: "unbounded" }
  )

  yield* Console.log("")
  yield* Console.log("📊 Replica States:")
  yield* Console.log("-".repeat(60))

  // Calculate and display values for each replica
  const values = states.map(({ replicaId, state }) => {
    const value = calculateCounterValue(state)
    const countsSize = state.counts.size
    const decrementsSize = state.decrements.size

    console.log(`\n${replicaId}:`)
    console.log(`  Value: ${value}`)
    console.log(`  Counts map size: ${countsSize}`)
    console.log(`  Decrements map size: ${decrementsSize}`)

    return { replicaId, value, state }
  })

  yield* Console.log("")
  yield* Console.log("-".repeat(60))

  // Check if all values match
  const allValues = values.map((v) => v.value)
  const allMatch = allValues.every((v) => v === allValues[0])

  if (allMatch) {
    yield* Console.log(`✅ SUCCESS: All replicas converged to value: ${allValues[0]}`)
  } else {
    yield* Console.log("❌ MISMATCH: Replicas have different values:")
    for (const { replicaId, value } of values) {
      yield* Console.log(`   ${replicaId}: ${value}`)
    }
  }

  yield* Console.log("")

  // Detailed state comparison
  yield* Console.log("🔬 Detailed State Comparison:")
  yield* Console.log("-".repeat(60))

  // Show counts for each replica in each replica's state
  for (const { replicaId, state } of values) {
    yield* Console.log(`\n${replicaId}'s counts map:`)
    for (const [repId, count] of state.counts.entries()) {
      yield* Console.log(`  ${repId}: ${count}`)
    }
    yield* Console.log(`${replicaId}'s decrements map:`)
    for (const [repId, dec] of state.decrements.entries()) {
      yield* Console.log(`  ${repId}: ${dec}`)
    }
  }

  yield* Console.log("")
  yield* Console.log("=".repeat(60))

  return allMatch
}).pipe(
  Effect.provide(FetchHttpClient.layer),
  Effect.catchAll((error) =>
    Console.log(`❌ Error: ${error.message}`).pipe(Effect.as(false))
  )
)

Effect.runPromise(program).then(
  (success) => {
    process.exit(success ? 0 : 1)
  },
  () => {
    process.exit(1)
  }
)
