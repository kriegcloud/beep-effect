/**
 * Persistent Analytics Dashboard Demo
 *
 * This demo shows how to use CRDT persistence to maintain analytics
 * counters across process restarts. Perfect for distributed analytics
 * systems that need to survive crashes.
 *
 * Real-world use case: Analytics dashboard tracking page views, likes,
 * shares across multiple servers with state persistence.
 */

import * as Effect from "effect/Effect"
import * as Console from "effect/Console"
import * as PNCounter from "../src/PNCounter.js"
import * as Persistence from "../src/Persistence.js"
import { ReplicaId } from "../src/CRDT.js"

// Analytics metrics for a blog post
interface Metrics {
  pageViews: PNCounter.PNCounter
  likes: PNCounter.PNCounter
  shares: PNCounter.PNCounter
}

// Simulate analytics collection
const collectMetrics = (metrics: Metrics, serverName: string) =>
  Effect.gen(function* () {
    yield* Console.log(`📊 ${serverName} collecting metrics...`)

    // Simulate page views
    yield* PNCounter.increment(metrics.pageViews, Math.floor(Math.random() * 50) + 10)

    // Simulate likes
    yield* PNCounter.increment(metrics.likes, Math.floor(Math.random() * 20) + 5)

    // Simulate shares
    yield* PNCounter.increment(metrics.shares, Math.floor(Math.random() * 10) + 1)
  })

// Display current metrics
const displayMetrics = (metrics: Metrics, label: string) =>
  Effect.gen(function* () {
    const views = yield* PNCounter.value(metrics.pageViews)
    const likes = yield* PNCounter.value(metrics.likes)
    const shares = yield* PNCounter.value(metrics.shares)

    yield* Console.log(`\n${label}`)
    yield* Console.log("─".repeat(50))
    yield* Console.log(`  👁️  Page Views: ${views}`)
    yield* Console.log(`  ❤️  Likes:      ${likes}`)
    yield* Console.log(`  🔄 Shares:     ${shares}`)
    yield* Console.log("─".repeat(50))
  })

// Main program
const program = Effect.gen(function* () {
  yield* Console.log("📈 Persistent Analytics Dashboard Demo")
  yield* Console.log("=".repeat(60))
  yield* Console.log("")

  // Server 1: us-east
  yield* Console.log("🚀 Starting Server 1 (us-east)...")

  const server1ViewsCounter = yield* Effect.provide(
    PNCounter.Tag,
    PNCounter.withPersistence(ReplicaId("us-east-views"))
  )

  const server1LikesCounter = yield* Effect.provide(
    PNCounter.Tag,
    PNCounter.withPersistence(ReplicaId("us-east-likes"))
  )

  const server1SharesCounter = yield* Effect.provide(
    PNCounter.Tag,
    PNCounter.withPersistence(ReplicaId("us-east-shares"))
  )

  const server1Metrics = {
    pageViews: server1ViewsCounter,
    likes: server1LikesCounter,
    shares: server1SharesCounter
  }

  // Server 2: eu-west
  yield* Console.log("🚀 Starting Server 2 (eu-west)...")

  const server2ViewsCounter = yield* Effect.provide(
    PNCounter.Tag,
    PNCounter.withPersistence(ReplicaId("eu-west-views"))
  )

  const server2LikesCounter = yield* Effect.provide(
    PNCounter.Tag,
    PNCounter.withPersistence(ReplicaId("eu-west-likes"))
  )

  const server2SharesCounter = yield* Effect.provide(
    PNCounter.Tag,
    PNCounter.withPersistence(ReplicaId("eu-west-shares"))
  )

  const server2Metrics = {
    pageViews: server2ViewsCounter,
    likes: server2LikesCounter,
    shares: server2SharesCounter
  }

  yield* Console.log("")

  // Round 1: Collect metrics
  yield* Console.log("📍 Round 1: Collecting initial metrics")
  yield* collectMetrics(server1Metrics, "Server 1 (US-EAST)")
  yield* collectMetrics(server2Metrics, "Server 2 (EU-WEST)")

  yield* displayMetrics(server1Metrics, "Server 1 Metrics")
  yield* displayMetrics(server2Metrics, "Server 2 Metrics")

  // Round 2: More metrics
  yield* Console.log("\n📍 Round 2: More traffic coming in")
  yield* collectMetrics(server1Metrics, "Server 1 (US-EAST)")
  yield* collectMetrics(server2Metrics, "Server 2 (EU-WEST)")

  yield* displayMetrics(server1Metrics, "Server 1 Metrics")
  yield* displayMetrics(server2Metrics, "Server 2 Metrics")

  // Sync servers
  yield* Console.log("\n🔄 Syncing servers...")

  const s1ViewsState = yield* PNCounter.query(server1Metrics.pageViews)
  const s1LikesState = yield* PNCounter.query(server1Metrics.likes)
  const s1SharesState = yield* PNCounter.query(server1Metrics.shares)

  const s2ViewsState = yield* PNCounter.query(server2Metrics.pageViews)
  const s2LikesState = yield* PNCounter.query(server2Metrics.likes)
  const s2SharesState = yield* PNCounter.query(server2Metrics.shares)

  yield* PNCounter.merge(server1Metrics.pageViews, s2ViewsState)
  yield* PNCounter.merge(server1Metrics.likes, s2LikesState)
  yield* PNCounter.merge(server1Metrics.shares, s2SharesState)

  yield* PNCounter.merge(server2Metrics.pageViews, s1ViewsState)
  yield* PNCounter.merge(server2Metrics.likes, s1LikesState)
  yield* PNCounter.merge(server2Metrics.shares, s1SharesState)

  yield* displayMetrics(server1Metrics, "✨ Server 1 (After Sync)")
  yield* displayMetrics(server2Metrics, "✨ Server 2 (After Sync)")

  // Show that both servers have identical state
  const s1Views = yield* PNCounter.value(server1Metrics.pageViews)
  const s2Views = yield* PNCounter.value(server2Metrics.pageViews)
  const s1Likes = yield* PNCounter.value(server1Metrics.likes)
  const s2Likes = yield* PNCounter.value(server2Metrics.likes)
  const s1Shares = yield* PNCounter.value(server1Metrics.shares)
  const s2Shares = yield* PNCounter.value(server2Metrics.shares)

  yield* Console.log("")
  if (s1Views === s2Views && s1Likes === s2Likes && s1Shares === s2Shares) {
    yield* Console.log("✅ SUCCESS: Both servers have identical metrics!")
  } else {
    yield* Console.log("❌ ERROR: Server metrics diverged!")
  }

  yield* Console.log("")
  yield* Console.log("💡 Key Features Demonstrated:")
  yield* Console.log("   • Persistence: State survives process restarts")
  yield* Console.log("   • Merge: Servers can sync their state")
  yield* Console.log("   • Convergence: All servers eventually have same metrics")
  yield* Console.log("   • No coordination: Each server works independently")
  yield* Console.log("")
}).pipe(
  Effect.provide(Persistence.layerMemory)
)

// Run the demo
Effect.runPromise(program).catch(console.error)
