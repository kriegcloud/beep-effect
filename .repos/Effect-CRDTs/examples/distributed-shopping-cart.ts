/**
 * Distributed Shopping Cart Demo
 *
 * This demo shows how CRDTs can power a distributed shopping cart where
 * multiple devices/tabs can add items simultaneously and sync later.
 *
 * Real-world use case: E-commerce app where users can add items offline
 * on multiple devices and have them merge when reconnected.
 */

import * as Effect from "effect/Effect"
import * as Console from "effect/Console"
import * as GSet from "../src/GSet.js"
import { ReplicaId } from "../src/CRDT.js"

// Simulate a shopping cart with GSet for items
const program = Effect.gen(function* () {
  yield* Console.log("🛒 Distributed Shopping Cart Demo")
  yield* Console.log("=" .repeat(60))
  yield* Console.log("")

  // Create replicas for different devices
  const mobileCart = yield* GSet.make<string>(ReplicaId("mobile-app"))
  const webCart = yield* GSet.make<string>(ReplicaId("web-browser"))
  const desktopCart = yield* GSet.make<string>(ReplicaId("desktop-app"))

  yield* Console.log("📱 Devices: Mobile App, Web Browser, Desktop App")
  yield* Console.log("🔌 All devices currently offline (working independently)")
  yield* Console.log("")

  // Mobile: User adds items while commuting (offline)
  yield* Console.log("📍 Mobile App (Offline):")
  yield* GSet.add(mobileCart, "product-001:laptop")
  yield* GSet.add(mobileCart, "product-002:mouse")
  yield* GSet.add(mobileCart, "product-003:keyboard")

  const mobileItems = yield* GSet.values(mobileCart)
  yield* Console.log(`   Added ${mobileItems.size} items`)
  for (const item of mobileItems) {
    yield* Console.log(`   - ${item}`)
  }
  yield* Console.log("")

  // Web: User browsing at work (offline)
  yield* Console.log("📍 Web Browser (Offline):")
  yield* GSet.add(webCart, "product-004:monitor")
  yield* GSet.add(webCart, "product-005:webcam")
  yield* GSet.add(webCart, "product-002:mouse") // Same item!

  const webItems = yield* GSet.values(webCart)
  yield* Console.log(`   Added ${webItems.size} items`)
  for (const item of webItems) {
    yield* Console.log(`   - ${item}`)
  }
  yield* Console.log("")

  // Desktop: User shopping at home
  yield* Console.log("📍 Desktop App (Offline):")
  yield* GSet.add(desktopCart, "product-006:headphones")
  yield* GSet.add(desktopCart, "product-001:laptop") // Same laptop!
  yield* GSet.add(desktopCart, "product-007:usb-hub")

  const desktopItems = yield* GSet.values(desktopCart)
  yield* Console.log(`   Added ${desktopItems.size} items`)
  for (const item of desktopItems) {
    yield* Console.log(`   - ${item}`)
  }
  yield* Console.log("")

  // Now sync all devices
  yield* Console.log("🌐 Devices come online and sync...")
  yield* Console.log("")

  // Get states from all devices
  const mobileState = yield* GSet.query(mobileCart)
  const webState = yield* GSet.query(webCart)
  const desktopState = yield* GSet.query(desktopCart)

  // Merge all states (each device gets all items)
  yield* GSet.merge(mobileCart, webState)
  yield* GSet.merge(mobileCart, desktopState)

  yield* GSet.merge(webCart, mobileState)
  yield* GSet.merge(webCart, desktopState)

  yield* GSet.merge(desktopCart, mobileState)
  yield* GSet.merge(desktopCart, webState)

  // Show merged cart on each device
  const finalMobile = yield* GSet.values(mobileCart)
  const finalWeb = yield* GSet.values(webCart)
  const finalDesktop = yield* GSet.values(desktopCart)

  yield* Console.log("✅ Sync Complete!")
  yield* Console.log("")
  yield* Console.log("=" .repeat(60))
  yield* Console.log("🎉 Unified Shopping Cart (All Devices):")
  yield* Console.log("=" .repeat(60))

  const allItems = Array.from(finalMobile).sort()
  yield* Console.log(`\n📦 Total Unique Items: ${allItems.length}`)
  yield* Console.log("")

  for (const item of allItems) {
    const [productId, name] = item.split(":")
    yield* Console.log(`   ✓ ${(name || "").toUpperCase().padEnd(15)} (${productId})`)
  }

  yield* Console.log("")
  yield* Console.log("💡 Key Points:")
  yield* Console.log("   • Duplicate items (laptop, mouse) were automatically deduplicated")
  yield* Console.log("   • No conflicts - all items from all devices merged successfully")
  yield* Console.log("   • No coordination needed - each device worked independently")
  yield* Console.log("   • All devices now have identical cart state")
  yield* Console.log("")

  // Verify all devices have same state
  const mobile = Array.from(finalMobile).sort().join(",")
  const web = Array.from(finalWeb).sort().join(",")
  const desktop = Array.from(finalDesktop).sort().join(",")

  if (mobile === web && web === desktop) {
    yield* Console.log("✅ VERIFICATION PASSED: All replicas converged to identical state")
  } else {
    yield* Console.log("❌ VERIFICATION FAILED: Replicas diverged!")
  }

  yield* Console.log("")
})

// Run the demo
Effect.runPromise(program)
