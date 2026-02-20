# @palantir/pack.state.demo

Offline demo implementation of `DocumentService` for local development and testing.

## Purpose

This package provides a browser-based, offline-capable document service implementation that:

- Persists documents locally using IndexedDB (via y-indexeddb)
- Synchronizes document changes across browser tabs using BroadcastChannel API
- Implements presence and activity tracking across tabs
- Requires no backend server or network connectivity

This is intended for:

- Local development without Foundry backend
- Testing React components and pack layers in isolation
- Demos and prototypes
- Unit and integration testing

## Architecture

### Two-tier Persistence

1. **Metadata Store**: Single Y.Doc containing metadata for all documents
2. **Document Store**: Individual Y.Docs per document, each with its own IndexedDB persistence

### Cross-Tab Synchronization

- **Data Channels**: Y.js updates broadcast via BroadcastChannel for real-time sync
- **Presence Channels**: Heartbeat mechanism tracks active clients across tabs
- **Activity Broadcasting**: Custom presence data shared across all document subscribers

### Status Management

Documents transition through standard load and live states:

- Load: `UNLOADED` → `LOADING` → `LOADED`
- Live: `DISCONNECTED` → `CONNECTING` → `CONNECTED`

## Usage

```typescript
import { createPackApp } from "@palantir/pack.core";
import { createDemoDocumentServiceConfig } from "@palantir/pack.state.demo";

const app = createPackApp({
  modules: [
    createDemoDocumentServiceConfig({
      dbPrefix: "my-app", // Optional, defaults to "pack-demo"
    }),
  ],
});
```

## Implementation Details

### BaseYjsDocumentService Extension

Extends `BaseYjsDocumentService` which handles:

- Y.Doc lifecycle and initialization
- Record CRUD operations
- Subscription management
- Change notifications

Demo implementation adds:

- IndexedDB persistence layer
- BroadcastChannel synchronization
- Presence heartbeat management

### Presence Heartbeat Protocol

Clients broadcast heartbeats every 5 seconds. The PresenceManager:

- Tracks all active clients by clientId
- Emits "arrive" events when new heartbeats appear
- Emits "depart" events when heartbeats go stale (>15s)

This provides automatic presence detection without explicit arrive/depart messages.

## Testing

Run tests with:

```bash
pnpm test
```

Tests cover:

- Document creation and persistence across service instances
- Cross-tab synchronization (simulated with multiple service instances)
- Presence arrive/depart events
- Activity event broadcasting
- Status transition lifecycle
- Search functionality

## Limitations

- **Browser-only**: Requires IndexedDB and BroadcastChannel APIs
- **No conflict resolution**: Relies on Y.js CRDT for concurrent edits
- **No server sync**: Changes persist only in browser storage
- **No auth/security**: All documents accessible locally
- **Storage limits**: Subject to browser IndexedDB quotas

## Private Package

This package is marked as private and not published to npm. It's intended for internal development and testing workflows only.
