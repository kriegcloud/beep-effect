/**
 * Collaborative Counter Demo
 *
 * This demo simulates a distributed like/view counter system where multiple
 * replicas (servers/clients) can increment counters independently and sync
 * their state periodically.
 *
 * Real-world use case: Analytics dashboard with multiple data collection points
 * that need to aggregate counts without coordination.
 */

import * as Effect from "effect/Effect"
import * as Console from "effect/Console"
import * as Random from "effect/Random"
import * as Duration from "effect/Duration"
import * as PNCounter from "../src/PNCounter.js"
import { ReplicaId } from "../src/CRDT.js"

// Network latencies for each replica (in milliseconds)
type ReplicaLatencies = ReadonlyMap<string, number>

// Simulates a network sync between replicas with latency
const syncReplicas = (
  replica1: PNCounter.PNCounter,
  replica2: PNCounter.PNCounter,
  name1: string,
  name2: string,
  latencies: ReplicaLatencies
) =>
  Effect.gen(function* () {
    // Calculate network latency (average of both replicas)
    const latency1 = latencies.get(name1) ?? 0
    const latency2 = latencies.get(name2) ?? 0
    const networkLatency = Math.floor((latency1 + latency2) / 2)

    yield* Console.log(`🔄 Syncing ${name1} ↔ ${name2} (latency: ${networkLatency}ms)...`)

    // Simulate network latency
    yield* Effect.sleep(Duration.millis(networkLatency))

    // Get state from both replicas
    const state1 = yield* PNCounter.query(replica1)
    const state2 = yield* PNCounter.query(replica2)

    // Merge states (simulating network sync)
    yield* PNCounter.merge(replica1, state2)
    yield* PNCounter.merge(replica2, state1)

    yield* Console.log(`  ✓ Sync complete`)
  })

// Simulates user activity on a replica
const simulateActivity = (
  replica: PNCounter.PNCounter,
  replicaName: string,
  color: string
) =>
  Effect.gen(function* () {
    // Random increment/decrement
    const value = yield* Random.nextIntBetween(1, 5)
    const isIncrement = yield* Random.nextBoolean

    if (isIncrement) {
      yield* PNCounter.increment(replica, value)
      yield* Console.log(`${color}📈 ${replicaName}: +${value}`)
    } else {
      yield* PNCounter.decrement(replica, value)
      yield* Console.log(`${color}📉 ${replicaName}: -${value}`)
    }
  })

// Main demo program
const program = Effect.gen(function* () {
  yield* Console.log("🚀 Starting Collaborative Counter Demo")
  yield* Console.log("=".repeat(50))
  yield* Console.log("")

  // Assign random network latencies to each replica (50-200ms)
  const latencies: ReplicaLatencies = new Map([
    ["US-EAST", yield* Random.nextIntBetween(50, 150)],
    ["EU-WEST", yield* Random.nextIntBetween(50, 150)],
    ["ASIA-PAC", yield* Random.nextIntBetween(100, 200)]
  ])

  yield* Console.log("🌐 Network Latencies:")
  yield* Console.log(`   US-EAST:      ${latencies.get("US-EAST")}ms`)
  yield* Console.log(`   EU-WEST:      ${latencies.get("EU-WEST")}ms`)
  yield* Console.log(`   ASIA-PACIFIC: ${latencies.get("ASIA-PAC")}ms`)
  yield* Console.log("")

  // Create three replicas (simulating different servers/regions)
  const replica1 = yield* PNCounter.make(ReplicaId("us-east"))
  const replica2 = yield* PNCounter.make(ReplicaId("eu-west"))
  const replica3 = yield* PNCounter.make(ReplicaId("asia-pacific"))

  yield* Console.log("✅ Created 3 replicas: us-east, eu-west, asia-pacific")
  yield* Console.log("")

  // Set initial values
  yield* PNCounter.increment(replica1, 100)
  yield* PNCounter.increment(replica2, 100)
  yield* PNCounter.increment(replica3, 100)

  yield* Console.log("🎯 Initial state: Each replica starts with 100")
  yield* Console.log("")

  // Simulate 10 rounds of activity
  for (let round = 1; round <= 10; round++) {
    yield* Console.log(`\n📍 Round ${round}:`)

    // Simulate random activity on each replica
    yield* simulateActivity(replica1, "US-EAST", "\x1b[36m")
    yield* simulateActivity(replica2, "EU-WEST", "\x1b[33m")
    yield* simulateActivity(replica3, "ASIA-PAC", "\x1b[35m")

    // Show values before sync
    const val1 = yield* PNCounter.value(replica1)
    const val2 = yield* PNCounter.value(replica2)
    const val3 = yield* PNCounter.value(replica3)

    yield* Console.log(`\x1b[0m  Before sync: US=${val1}, EU=${val2}, ASIA=${val3}`)

    // Sync replicas (simulating periodic network sync)
    if (round % 3 === 0) {
      yield* syncReplicas(replica1, replica2, "US-EAST", "EU-WEST", latencies)
      yield* syncReplicas(replica2, replica3, "EU-WEST", "ASIA-PAC", latencies)
      yield* syncReplicas(replica1, replica3, "US-EAST", "ASIA-PAC", latencies)

      // Show values after sync
      const syncedVal1 = yield* PNCounter.value(replica1)
      const syncedVal2 = yield* PNCounter.value(replica2)
      const syncedVal3 = yield* PNCounter.value(replica3)

      yield* Console.log(`  After sync:  US=${syncedVal1}, EU=${syncedVal2}, ASIA=${syncedVal3}`)
      yield* Console.log("  ✨ All replicas converged!")
    }
  }

  // Final sync to ensure convergence
  yield* Console.log("\n🔄 Final synchronization...")
  yield* syncReplicas(replica1, replica2, "US-EAST", "EU-WEST", latencies)
  yield* syncReplicas(replica2, replica3, "EU-WEST", "ASIA-PAC", latencies)
  yield* syncReplicas(replica1, replica3, "US-EAST", "ASIA-PAC", latencies)

  // Show final state
  const finalVal1 = yield* PNCounter.value(replica1)
  const finalVal2 = yield* PNCounter.value(replica2)
  const finalVal3 = yield* PNCounter.value(replica3)

  yield* Console.log("")
  yield* Console.log("=".repeat(50))
  yield* Console.log("🎉 Final State (All Replicas Converged):")
  yield* Console.log(`   US-EAST:      ${finalVal1}`)
  yield* Console.log(`   EU-WEST:      ${finalVal2}`)
  yield* Console.log(`   ASIA-PACIFIC: ${finalVal3}`)
  yield* Console.log("=".repeat(50))
  yield* Console.log("")
  yield* Console.log(finalVal1 === finalVal2 && finalVal2 === finalVal3 ? "✅ Demo complete! All replicas have the same value." : "❌ Demo failed! Replicas diverged.")
  yield* Console.log("💡 This demonstrates eventual consistency without coordination!")
})

// Run the demo
Effect.runPromise(program)
