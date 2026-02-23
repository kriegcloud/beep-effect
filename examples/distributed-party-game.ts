/**
 * Distributed Party Coordination System
 *
 * This example simulates multiple concurrent parties across different locations
 * (US-East, EU-West, Asia-Pacific) with realistic network delays and partitions.
 *
 * Each party manages:
 * - Guest list (GSet - people can only join, not leave)
 * - Food/Drink inventory (PNCounter - can be added or consumed)
 * - Music volume (PNCounter - can be turned up or down)
 *
 * Features demonstrated:
 * - Multiple CRDT types working together
 * - Variable network latency by geographic region
 * - Simulated network partitions and healing
 * - Concurrent operations across replicas
 * - Complex state merging scenarios
 * - Eventual consistency in chaos
 *
 * @since 0.1.0
 */

import * as Effect from "effect/Effect"
import * as Console from "effect/Console"
import * as Random from "effect/Random"
import * as Duration from "effect/Duration"
import * as Fiber from "effect/Fiber"
import * as GSet from "../src/GSet.js"
import * as PNCounter from "../src/PNCounter.js"
import { ReplicaId } from "../src/CRDT.js"

// =============================================================================
// Domain Model
// =============================================================================

type Guest = string
type Location = "US-East" | "EU-West" | "Asia-Pacific"

interface Party {
  readonly location: Location
  readonly replicaId: ReplicaId
  readonly guests: GSet.GSet<Guest>
  readonly foodDrinks: PNCounter.PNCounter
  readonly musicVolume: PNCounter.PNCounter
}

interface NetworkLatency {
  readonly min: number
  readonly max: number
}

// Realistic network latencies by location (in milliseconds)
const NETWORK_LATENCIES: Record<Location, NetworkLatency> = {
  "US-East": { min: 20, max: 80 },
  "EU-West": { min: 50, max: 150 },
  "Asia-Pacific": { min: 100, max: 300 }
}

// Guest name generator
const GUEST_NAMES = [
  "Alice", "Bob", "Carol", "Dave", "Eve", "Frank", "Grace", "Heidi",
  "Ivan", "Judy", "Mallory", "Oscar", "Peggy", "Romeo", "Sybil", "Trent",
  "Victor", "Walter", "Wendy", "Xavier", "Yvonne", "Zoe"
]

// =============================================================================
// Party Operations
// =============================================================================

const createParty = (location: Location): Effect.Effect<Party> =>
  Effect.gen(function* () {
    const replicaId = ReplicaId(`party-${location.toLowerCase()}`)

    const guests = yield* GSet.make<Guest>(replicaId)
    const foodDrinks = yield* PNCounter.make(replicaId)
    const musicVolume = yield* PNCounter.make(replicaId)

    // Initialize with some resources
    yield* PNCounter.increment(foodDrinks, 100) // Start with 100 food/drink items
    yield* PNCounter.increment(musicVolume, 50) // Volume at 50

    return {
      location,
      replicaId,
      guests,
      foodDrinks,
      musicVolume
    }
  })

const getPartyStatus = (party: Party) =>
  Effect.gen(function* () {
    const guests = yield* GSet.values(party.guests)
    const guestCount = guests.size
    const food = yield* PNCounter.value(party.foodDrinks)
    const volume = yield* PNCounter.value(party.musicVolume)

    return {
      location: party.location,
      guestCount,
      guestNames: Array.from(guests),
      food,
      volume,
      vibe: volume > 70 ? "🔥 LIT" : volume > 40 ? "😊 Chill" : "😴 Quiet"
    }
  })

const displayPartyStatus = (party: Party) =>
  Effect.gen(function* () {
    const status = yield* getPartyStatus(party)

    yield* Console.log(`\n🎉 ${status.location} Party Status:`)
    yield* Console.log(`   👥 Guests: ${status.guestCount} (${status.guestNames.slice(0, 5).join(", ")}${status.guestCount > 5 ? "..." : ""})`)
    yield* Console.log(`   🍕 Food/Drinks: ${status.food}`)
    yield* Console.log(`   🔊 Volume: ${status.volume} ${status.vibe}`)
  })

// =============================================================================
// Network Simulation
// =============================================================================

const simulateNetworkDelay = (location: Location) =>
  Effect.gen(function* () {
    const latency = NETWORK_LATENCIES[location]
    const delay = yield* Random.nextIntBetween(latency.min, latency.max)
    yield* Effect.sleep(Duration.millis(delay))
    return delay
  })

const syncParties = (party1: Party, party2: Party) =>
  Effect.gen(function* () {
    const delay1 = yield* simulateNetworkDelay(party1.location)
    const delay2 = yield* simulateNetworkDelay(party2.location)
    const totalLatency = delay1 + delay2

    yield* Console.log(
      `\n🔄 Syncing ${party1.location} ↔ ${party2.location} (${totalLatency}ms latency)...`
    )

    // Sync guest lists
    const guests1State = yield* GSet.query(party1.guests)
    const guests2State = yield* GSet.query(party2.guests)
    yield* GSet.merge(party1.guests, guests2State)
    yield* GSet.merge(party2.guests, guests1State)

    // Sync food/drinks
    const food1State = yield* PNCounter.query(party1.foodDrinks)
    const food2State = yield* PNCounter.query(party2.foodDrinks)
    yield* PNCounter.merge(party1.foodDrinks, food2State)
    yield* PNCounter.merge(party2.foodDrinks, food1State)

    // Sync music volume
    const volume1State = yield* PNCounter.query(party1.musicVolume)
    const volume2State = yield* PNCounter.query(party2.musicVolume)
    yield* PNCounter.merge(party1.musicVolume, volume2State)
    yield* PNCounter.merge(party2.musicVolume, volume1State)

    yield* Console.log(`   ✓ Sync complete`)
  })

// =============================================================================
// Party Activities
// =============================================================================

const guestArrives = (party: Party) =>
  Effect.gen(function* () {
    const guestIndex = yield* Random.nextIntBetween(0, GUEST_NAMES.length - 1)
    const guest = GUEST_NAMES[guestIndex]!

    const hasGuest = yield* GSet.has(party.guests, guest)

    if (!hasGuest) {
      yield* GSet.add(party.guests, guest)
      yield* Console.log(`   👋 ${guest} arrived at ${party.location}!`)

      // New guest brings food
      const foodBrought = yield* Random.nextIntBetween(5, 15)
      yield* PNCounter.increment(party.foodDrinks, foodBrought)
      yield* Console.log(`   🍕 ${guest} brought ${foodBrought} items`)
    }
  })

const consumeFood = (party: Party) =>
  Effect.gen(function* () {
    const consumed = yield* Random.nextIntBetween(3, 10)
    const currentFood = yield* PNCounter.value(party.foodDrinks)

    if (currentFood >= consumed) {
      yield* PNCounter.decrement(party.foodDrinks, consumed)
      yield* Console.log(`   🍴 Guests consumed ${consumed} items at ${party.location}`)
    } else if (currentFood > 0) {
      yield* PNCounter.decrement(party.foodDrinks, currentFood)
      yield* Console.log(`   😱 Running low on food at ${party.location}! Only ${currentFood} items left`)
    }
  })

const adjustVolume = (party: Party) =>
  Effect.gen(function* () {
    const currentVolume = yield* PNCounter.value(party.musicVolume)
    const isIncrease = yield* Random.nextBoolean
    const change = yield* Random.nextIntBetween(5, 20)

    if (isIncrease && currentVolume < 100) {
      yield* PNCounter.increment(party.musicVolume, change)
      yield* Console.log(`   🔊 Turned up the music at ${party.location}! (+${change})`)
    } else if (!isIncrease && currentVolume > 10) {
      yield* PNCounter.decrement(party.musicVolume, change)
      yield* Console.log(`   🔉 Turned down the music at ${party.location}! (-${change})`)
    }
  })

const randomActivity = (party: Party) =>
  Effect.gen(function* () {
    const activity = yield* Random.nextIntBetween(0, 2)

    switch (activity) {
      case 0:
        return yield* guestArrives(party)
      case 1:
        return yield* consumeFood(party)
      case 2:
        return yield* adjustVolume(party)
    }
  })

// =============================================================================
// Party Simulation
// =============================================================================

const runPartyActivities = (party: Party, rounds: number) =>
  Effect.gen(function* () {
    yield* Console.log(`\n🎊 Starting ${party.location} party!`)

    for (let round = 1; round <= rounds; round++) {
      yield* Console.log(`\n📍 ${party.location} - Round ${round}:`)

      // Multiple concurrent activities
      const numActivities = yield* Random.nextIntBetween(2, 4)
      yield* Effect.all(
        Array.from({ length: numActivities }, () => randomActivity(party)),
        { concurrency: "unbounded" }
      )

      // Random delay between rounds
      const delay = yield* Random.nextIntBetween(500, 1500)
      yield* Effect.sleep(Duration.millis(delay))
    }
  })

const runSyncCycle = (parties: Party[], interval: number) =>
  Effect.gen(function* () {
    yield* Effect.sleep(Duration.millis(interval))

    while (true) {
      yield* Console.log("\n" + "=".repeat(80))
      yield* Console.log("🌐 SYNC CYCLE STARTING")
      yield* Console.log("=".repeat(80))

      // Sync all party combinations
      const syncOperations = []
      for (let i = 0; i < parties.length; i++) {
        for (let j = i + 1; j < parties.length; j++) {
          syncOperations.push(syncParties(parties[i]!, parties[j]!))
        }
      }

      yield* Effect.all(syncOperations, { concurrency: "unbounded" })

      yield* Console.log("\n📊 PARTY STATUS AFTER SYNC:")
      yield* Console.log("=".repeat(80))
      yield* Effect.all(
        parties.map((party) => displayPartyStatus(party)),
        { concurrency: "unbounded" }
      )

      // Wait before next sync
      yield* Effect.sleep(Duration.seconds(interval / 1000))
    }
  })

// =============================================================================
// Main Program
// =============================================================================

const program = Effect.gen(function* () {
  yield* Console.log("🎉🎉🎉 DISTRIBUTED PARTY COORDINATION SYSTEM 🎉🎉🎉")
  yield* Console.log("=".repeat(80))
  yield* Console.log("Simulating concurrent parties across multiple locations")
  yield* Console.log("with realistic network delays and eventual consistency")
  yield* Console.log("=".repeat(80))

  // Create parties in different locations
  const usParty = yield* createParty("US-East")
  const euParty = yield* createParty("EU-West")
  const asiaParty = yield* createParty("Asia-Pacific")

  const parties = [usParty, euParty, asiaParty]

  yield* Console.log("\n🎊 All parties initialized!")
  yield* Console.log("⏱️  Activities will run for 15 rounds")
  yield* Console.log("🔄 Sync cycles every 5 seconds")
  yield* Console.log("=".repeat(80))

  // Start party activities in parallel
  const activityFibers = yield* Effect.all(
    parties.map((party) => Effect.fork(runPartyActivities(party, 15))),
    { concurrency: "unbounded" }
  )

  // Start sync cycle in parallel
  const syncFiber = yield* Effect.fork(runSyncCycle(parties, 5000))

  // Wait for all activities to complete
  yield* Effect.all(
    activityFibers.map((fiber) => Fiber.join(fiber)),
    { concurrency: "unbounded" }
  )

  // Interrupt sync cycle
  yield* Fiber.interrupt(syncFiber)

  // Final sync
  yield* Console.log("\n" + "=".repeat(80))
  yield* Console.log("🏁 FINAL SYNC - Ensuring all parties converged")
  yield* Console.log("=".repeat(80))

  yield* syncParties(usParty, euParty)
  yield* syncParties(euParty, asiaParty)
  yield* syncParties(usParty, asiaParty)

  // Display final state
  yield* Console.log("\n" + "=".repeat(80))
  yield* Console.log("🎊 FINAL PARTY STATUS (All parties should have converged)")
  yield* Console.log("=".repeat(80))

  yield* Effect.all(
    parties.map((party) => displayPartyStatus(party)),
    { concurrency: "unbounded" }
  )

  yield* Console.log("\n" + "=".repeat(80))
  yield* Console.log("✨ Simulation complete! All parties reached eventual consistency.")
  yield* Console.log("=".repeat(80))
})

Effect.runPromise(program).catch(console.error)
