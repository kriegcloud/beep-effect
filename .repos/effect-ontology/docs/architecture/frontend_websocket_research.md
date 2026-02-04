# Frontend Websocket Enablement Research

## 1. Executive Summary
This document outlines the current state of WebSocket integration in the `effect-ontology` project and provides a path forward for enabling secure, real-time event streaming between the frontend and backend.

Currently, the frontend utilizes a memory-based mock implementation (`EventBusClientMemoryLayer`), while the production-ready WebSocket client (`EventBusClientLayer`) is disabled. The backend infrastructure is in place via `EventStreamRouter` using `@effect/experimental/EventLogServer`.

## 2. Current Architecture

### 2.1 Frontend (`packages/web`)
*   **Service:** `EventBusClient` handles event synchronization.
*   **Persistence:** Uses `EventJournalClient` which leverages `@effect/experimental/EventLog` with `IndexedDB` for offline-first capability.
*   **Identity:** `IdentityClient` manages a persistent public/private key pair stored in `localStorage` (`effect-ontology-identity`).
*   **Status:** The `EventBusClientLayer` is currently **commented out** in `AppShell.tsx` due to stated dependency/setup issues, replaced by an in-memory mock.

### 2.2 Backend (`packages/@core-v2`)
*   **Router:** `EventStreamRouter` exposes the endpoint `GET /v1/ontologies/:ontologyId/events/ws`.
*   **Protocol:** Uses `EventLogServer.makeHandlerHttp` to handle the WebSocket upgrade and sync protocol (Hello, Write, Ack, RequestChanges).
*   **Storage:** Supports both Memory and PostgreSQL backends for the event log.

## 3. Findings & Gaps

### 3.1 Authentication & Security
*   **Gap:** The current backend `EventStreamRouter` does not implement explicit authentication (e.g., API Key check).
*   **Challenge:** Standard browser `WebSocket` APIs do not support custom headers (like `x-api-key`), which is the primary auth mechanism for the REST API.
*   **Implication:** Enabling the WebSocket endpoint as-is would expose the event log to unauthenticated access.

### 3.2 Identity Mechanism
*   The `Identity` service generates a cryptographic keypair.
*   `@effect/experimental/EventLog` likely uses this for signing entries (provenance), but it does not inherently replace "Authorization" (permission to access the stream).

### 3.3 Implementation Status
*   The code for WebSocket connection exists (`EventBusClient.ts`) but is untested in the current "integrated" state.
*   Dependency injection for the frontend needs verification to ensure `EventBusClientLayer` has all required services (e.g., `EventLog`, `Socket`).

## 4. Recommendations & Strategy

### 4.1 Authentication Strategy: Ticket-Based Handshake
To resolve the WebSocket header limitation, we recommend a "Ticket" system:
1.  **Request Ticket:** Frontend calls a secured HTTP endpoint (e.g., `POST /v1/auth/ticket`) using its existing `x-api-key` or session.
2.  **Issue Ticket:** Backend validates the request and issues a short-lived, signed "ticket" (JWT or random token).
3.  **Connect:** Frontend connects to WebSocket with `?ticket=<token>`.
4.  **Validate:** `EventStreamRouter` validates the ticket before upgrading the connection.

### 4.2 Encryption
*   **Transport:** WSS (TLS) handles transport encryption.
*   **Application:** `EventLog` provides signed entries. If payload confidentiality is required beyond TLS, payload encryption using the shared ontology key or recipient public keys would be needed (out of scope for initial enablement).

### 4.3 Enablement Plan
1.  **Backend:** Implement `TicketService` and update `EventStreamRouter` to validate tickets.
2.  **Frontend:** Update `EventBusClient` to fetch a ticket before connecting.
3.  **Integration:** Swap `EventBusClientMemoryLayer` for `EventBusClientLayer` in `AppShell.tsx`.
4.  **Verification:** Test offline capability (IndexedDB) and online sync (WebSocket) coherence.
