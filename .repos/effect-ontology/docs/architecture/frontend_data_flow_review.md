# Frontend Data Flow Review & Analysis

## 1. Executive Summary
This review analyzes the end-to-end data flow from the Backend WebSocket Service to the Frontend UI Components. The current implementation establishes a foundation for "Local-First" event synchronization using `@effect/experimental/EventLog` and IndexedDB, but suffers from critical inefficiencies (polling), potential data loss risks (subscription race conditions), and security gaps (missing authentication).

## 2. Architecture Analysis

### 2.1 Backend: EventStreamRouter
*   **Component:** `packages/@core-v2/src/Runtime/EventStreamRouter.ts`
*   **Mechanism:** Uses `EventLogServer` to upgrade HTTP requests to WebSockets.
*   **State:** Functional but lacks an authentication gate. It directly upgrades any connection to `/v1/ontologies/:ontologyId/events/ws`.

### 2.2 Frontend: EventBusClient
*   **Component:** `packages/web/src/services/EventBusClient.ts`
*   **Mechanism:**
    *   **Sync:** Uses `EventLogRemote` to sync local IndexedDB with the server.
    *   **Observation:** Uses a manual **Polling Loop** (`pollForNewEntries`) running every 2 seconds to detect changes in the local `EventLog`.
    *   **Distribution:** Pushes detected changes to a `PubSub`, which consumers subscribe to.

### 2.3 Frontend: State Management (Atoms)
*   **Component:** `packages/web/src/atoms/api.ts` & `AppShell.tsx`
*   **Mechanism:** "Cache Invalidation" pattern.
    1.  `AppShell` subscribes to `EventBusClient`.
    2.  Incoming events trigger `invalidateForEvent` (in `CacheInvalidation.ts`).
    3.  `invalidationTriggerAtom` is updated with a new timestamp.
    4.  Data atoms (e.g., `linksAtom`) depend on this trigger and re-execute their API calls.
*   **Pros:** Simple, consistent, leverages HTTP caching if configured.
*   **Cons:** "Chatty" - an event causes a full re-fetch of the list/resource rather than patching the local state.

## 3. Critical Issues & Architectural Faults

### 3.1 🔴 Inefficient Polling (Performance/Latency)
The `EventBusClient` relies on a `pollForNewEntries` effect that wakes up every 2 seconds to scan the `EventLog` for new entries.
*   **Impact:** Introduces up to 2000ms latency for "real-time" updates. Wastes CPU/battery checking for changes when none exist.
*   **Fix:** `EventLog` (or the underlying storage) should be observed reactively. If `@effect/experimental` doesn't expose a change stream, we must implement a notification mechanism in the storage layer or the `EventLogRemote` integration.

### 3.2 🔴 Subscription Race Condition (Data Integrity)
In `subscribeEvents`, the code fetches `currentEntries` (Snapshot) and then subscribes to `eventPubSub` (Live).
*   **Risk:** Events occurring *between* the snapshot fetch and the subscription start are **lost**.
*   **Fix:** Subscribe *before* fetching the snapshot, or use a `Stream` that guarantees continuity (e.g., buffering events during the initial fetch).

### 3.3 🔴 Missing Authentication (Security)
The WebSocket endpoint is open.
*   **Risk:** Unauthorized access to the event log.
*   **Fix:** Implement the **Ticket-Based Authentication** strategy outlined in `docs/architecture/frontend_websocket_research.md`.

### 3.4 🟠 Manual Layer Wiring (Maintainability)
`EventBusClientLayer` manually constructs the dependency tree.
*   **Risk:** Brittle configuration. If dependencies change, this manual wiring breaks.
*   **Fix:** Utilize `Effect`'s automatic layer construction where possible or group related services (Identity, Journal, Remote) into a cohesive `EventSyncLive` layer.

## 4. Recommendations & Refactoring Plan

### 4.1 "Effect-Native" Refactoring
We can significantly clean up the code by leaning on Effect's built-in streaming and atom capabilities:

1.  **Reactive Event Stream:**
    Instead of polling, wrapping the `EventLog` observation in a `Stream.async` that triggers on storage events or leveraging `EventLog.changes` if available.

    ```typescript
    // Conceptual Pattern
    const eventStream = Stream.async<ClientEventEntry>((emit) => {
      // Hook into storage/remote listener
      const cleanup = eventLog.listen((entry) => emit.single(entry))
      return Effect.void
    })
    ```

2.  **Optimistic Atoms (Advanced):**
    Move from "Invalidate & Refetch" to "Patch Local State".
    *   *Current:* Event -> Invalidate -> Fetch API.
    *   *Proposed:* Event -> Update Atom Map directly.
    *   *Benefit:* Zero-latency UI updates.
    *   *Cost:* Requires implementing reducer logic for each event type in the frontend.

3.  **Simplified Hook:**
    Create a `useLiveQuery` hook pattern that combines the initial fetch with the live stream updates automatically.

    ```typescript
    // Conceptual Usage
    const [data] = useLiveQuery(linksAtom) // Automatically handles initial load + event patches
    ```

### 4.2 Immediate Action Items
1.  **Refactor `EventBusClient.ts`:** Remove polling. Implement proper stream merging.
2.  **Implement Auth:** Add Ticket support.
3.  **Enable Layer:** Uncomment and fix `EventBusClientLayer` in `AppShell.tsx`.
