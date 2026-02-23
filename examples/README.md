# Effect-CRDTs Examples

This directory contains real-world usage examples demonstrating different CRDT patterns and use cases.

## Running Examples

```bash
# Collaborative counter (multi-region analytics)
bun examples/collaborative-counter.ts

# Distributed shopping cart (offline-first e-commerce)
bun examples/distributed-shopping-cart.ts

# Persistent analytics (crash-resistant metrics)
bun examples/persistent-analytics.ts
```

## Examples Overview

### 1. Collaborative Counter (`collaborative-counter.ts`)

**Use Case:** Distributed analytics/metrics system

**Demonstrates:**
- PN-Counter for increment/decrement operations
- Multiple replicas (simulating different regions/servers)
- Periodic synchronization between replicas
- Eventual consistency without coordination

**Real-world applications:**
- Page view counters across CDN edge nodes
- Like/vote counting in social platforms
- Real-time analytics dashboards
- Distributed rate limiting

**Key CRDT Properties:**
- ✅ Commutative: Merge order doesn't matter
- ✅ Associative: Grouping of merges doesn't matter
- ✅ Idempotent: Merging same state multiple times is safe
- ✅ Convergent: All replicas eventually reach same value

### 2. Distributed Shopping Cart (`distributed-shopping-cart.ts`)

**Use Case:** Offline-first e-commerce application

**Demonstrates:**
- G-Set (grow-only set) for cart items
- Multiple devices working offline independently
- Automatic deduplication of items
- Conflict-free merging when devices sync

**Real-world applications:**
- Shopping carts across mobile/web/desktop
- Bookmark sync across browsers
- Collaborative wishlists
- Inventory tracking across warehouses

**Key Features:**
- 📱 Works offline on any device
- 🔄 Automatic sync when reconnected
- 🎯 No duplicate items (set semantics)
- ✅ No conflicts - items always merge correctly

### 3. Persistent Analytics (`persistent-analytics.ts`)

**Use Case:** Crash-resistant analytics system

**Demonstrates:**
- CRDT persistence layer
- State survival across process restarts
- Multiple counters per replica
- Layer-based dependency injection

**Real-world applications:**
- Analytics platforms that need durability
- Distributed counters with backup/restore
- Multi-datacenter metrics aggregation
- Event counting with guaranteed delivery

**Key Features:**
- 💾 State persists across restarts
- 🔄 Replicas can sync after recovery
- 📊 Multiple metrics per server
- ✅ No data loss on crashes

## Code Patterns

### Basic CRDT Creation

```typescript
import * as PNCounter from "../src/PNCounter.js"
import { ReplicaId } from "../src/CRDT.js"

// Create a counter
const counter = yield* PNCounter.make(ReplicaId("my-replica"))

// Increment/Decrement
yield* STM.commit(counter.increment(5))
yield* STM.commit(counter.decrement(2))

// Get value
const value = yield* STM.commit(counter.value)
```

### Merging Replicas

```typescript
// Get state from other replica
const otherState = yield* STM.commit(otherReplica.query)

// Merge into current replica
yield* STM.commit(myReplica.merge(otherState))
```

### Using Persistence

```typescript
import * as Persistence from "../src/Persistence.js"

// With memory persistence
const program = Effect.gen(function* () {
  const counter = yield* Effect.provide(
    PNCounter.PNCounter,
    PNCounter.PNCounter.withPersistence(ReplicaId("my-id"))
  )
  // ... use counter
}).pipe(
  Effect.provide(Persistence.layerMemoryPersistence())
)
```

## CRDT Types Available

- **GCounter**: Grow-only counter (increment only)
- **PNCounter**: Positive-Negative counter (increment/decrement)
- **GSet**: Grow-only set (add only, no remove)

## Next Steps

1. **Try the examples:**
   ```bash
   bun examples/collaborative-counter.ts
   ```

2. **Modify the demos:**
   - Change number of replicas
   - Adjust sync intervals
   - Add more operations

3. **Build your own:**
   - Use these as templates
   - Combine different CRDT types
   - Add custom business logic

4. **Production considerations:**
   - Use file system or database persistence
   - Implement network sync protocol
   - Add monitoring and metrics
   - Handle network partitions

## Learn More

- [Effect Documentation](https://effect.website)
- [CRDT Research Papers](https://crdt.tech)
- [Project README](../README.md)
