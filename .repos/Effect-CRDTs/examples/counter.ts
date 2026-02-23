/**
 * Example: Basic counter usage with G-Counter and PN-Counter.
 *
 * This example demonstrates how to use counter CRDTs for distributed counting.
 *
 * @since 0.1.0
 */

import * as Effect from "effect/Effect"
import * as GCounter from "../src/GCounter.js"
import * as PNCounter from "../src/PNCounter.js"
import { ReplicaId } from "../src/CRDT.js"

// Example 1: Simple G-Counter usage
const simpleGCounter = Effect.gen(function* () {
  console.log("=== Simple G-Counter Example ===")

  const counter = yield* GCounter.Tag

  yield* GCounter.increment(counter, 5)
  yield* GCounter.increment(counter, 3)

  const value = yield* GCounter.value(counter)
  console.log("Counter value:", value) // 8
})

// Example 2: Multi-replica G-Counter with synchronization
const multiReplicaGCounter = Effect.gen(function* () {
  console.log("\n=== Multi-Replica G-Counter Example ===")

  // Create two replicas
  const replica1 = yield* GCounter.make(ReplicaId("replica-1"))
  const replica2 = yield* GCounter.make(ReplicaId("replica-2"))

  // Each replica increments independently
  console.log("Replica 1 increments by 10")
  yield* GCounter.increment(replica1, 10)

  console.log("Replica 2 increments by 20")
  yield* GCounter.increment(replica2, 20)

  // Before sync
  const value1Before = yield* GCounter.value(replica1)
  const value2Before = yield* GCounter.value(replica2)
  console.log("Before sync - Replica 1:", value1Before, "Replica 2:", value2Before)

  // Synchronize replicas
  const state2 = yield* GCounter.query(replica2)
  yield* GCounter.merge(replica1, state2)

  const state1 = yield* GCounter.query(replica1)
  yield* GCounter.merge(replica2, state1)

  // After sync - both should have same value
  const value1After = yield* GCounter.value(replica1)
  const value2After = yield* GCounter.value(replica2)
  console.log("After sync - Replica 1:", value1After, "Replica 2:", value2After)
})

// Example 3: PN-Counter with increments and decrements
const pnCounterExample = Effect.gen(function* () {
  console.log("\n=== PN-Counter Example ===")

  const counter = yield* PNCounter.Tag

  console.log("Incrementing by 10")
  yield* PNCounter.increment(counter, 10)

  console.log("Decrementing by 3")
  yield* PNCounter.decrement(counter, 3)

  console.log("Incrementing by 5")
  yield* PNCounter.increment(counter, 5)

  const value = yield* PNCounter.value(counter)
  console.log("Final value:", value) // 12
})

// Example 4: Multi-replica PN-Counter
const multiReplicaPNCounter = Effect.gen(function* () {
  console.log("\n=== Multi-Replica PN-Counter Example ===")

  const replica1 = yield* PNCounter.make(ReplicaId("replica-1"))
  const replica2 = yield* PNCounter.make(ReplicaId("replica-2"))

  // Replica 1: +10, -3 = 7
  yield* PNCounter.increment(replica1, 10)
  yield* PNCounter.decrement(replica1, 3)

  // Replica 2: +20, -5 = 15
  yield* PNCounter.increment(replica2, 20)
  yield* PNCounter.decrement(replica2, 5)

  console.log("Replica 1 value:", yield* PNCounter.value(replica1))
  console.log("Replica 2 value:", yield* PNCounter.value(replica2))

  // Merge replicas
  const state2 = yield* PNCounter.query(replica2)
  yield* PNCounter.merge(replica1, state2)

  const mergedValue = yield* PNCounter.value(replica1)
  console.log("Merged value:", mergedValue) // 22
})

// Run all examples
const program = Effect.gen(function* () {
  yield* simpleGCounter.pipe(Effect.provide(GCounter.Live(ReplicaId("simple-replica"))))

  yield* multiReplicaGCounter

  yield* pnCounterExample.pipe(Effect.provide(PNCounter.Live(ReplicaId("pn-replica"))))

  yield* multiReplicaPNCounter
})

Effect.runPromise(program).catch(console.error)
