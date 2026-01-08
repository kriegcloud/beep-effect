# @beep/comms-client — Agent Guide

## Purpose & Fit
- Provides the client-side CLIENT layer for the communications slice, enabling frontend applications to interact with messaging, notifications, and communication features.
- Contains API contracts, client-side services, and type definitions for client-server communication.
- Acts as the bridge between the comms domain and UI layers, exposing typed contracts for TanStack Query and Effect-based client runtimes.
- Currently a minimal scaffold awaiting contract definitions as the comms feature matures.

## Surface Map
- **(Scaffold)** — Package is initialized but awaiting contract implementations. Future exports will include:
  - Notification contracts for push/in-app notifications
  - Messaging contracts for real-time communication
  - Email template contracts for transactional emails

## Usage Snapshots
- Frontend apps import contracts from this package to invoke comms-related RPC calls.
- TanStack Query hooks wrap contracts for React component consumption.
- Effect client runtime uses contracts to execute type-safe requests against the server.
- Real-time features may use WebSocket contracts for live updates.

## Authoring Guardrails
- ALWAYS import Effect modules with namespaces (`Effect`, `A`, `F`, `O`, `Str`, `S`) and rely on Effect collections/utilities instead of native helpers (see global repo guardrails).
- Define contracts using `@beep/contract` patterns — each contract should specify request/response schemas and error types.
- Maintain typed error channels using `S.TaggedError` for predictable client-side error handling.
- Keep contracts thin — business logic belongs in domain or server layers.
- Use `"use client"` directive for React-specific exports that need client-side bundling.
- Consider real-time contract patterns for WebSocket-based features.

## Verifications
- `bun run check --filter @beep/comms-client`
- `bun run lint --filter @beep/comms-client`
- `bun run test --filter @beep/comms-client`

## Security

### Request Validation
- ALWAYS validate all contract inputs using Effect Schema — never trust client-side data.
- NEVER include sensitive data (passwords, tokens) in contract request payloads — use secure transport mechanisms.
- Contract error responses MUST NOT leak internal implementation details — use typed error channels with safe messages.

### WebSocket Security
- ALWAYS require authentication tokens for WebSocket connection establishment.
- NEVER store authentication tokens in localStorage for WebSocket reconnection — prefer httpOnly cookies or secure session references.
- WebSocket contracts MUST validate message schemas before processing — reject malformed payloads.
- ALWAYS implement exponential backoff for WebSocket reconnection attempts to prevent server overload.

### Data Exposure
- NEVER expose user IDs or internal identifiers in client-facing error messages.
- Contract responses MUST filter sensitive fields — use schema projections to limit exposed data.
- PREFER server-side pagination for notification lists — never fetch unbounded datasets.

## Gotchas

### WebSocket Connection Lifecycle in React
- **Symptom**: Multiple WebSocket connections open; memory leaks; missed messages after component remount.
- **Root Cause**: React's strict mode double-mounts components, and cleanup functions don't properly close WebSocket connections.
- **Solution**: Use Effect's resource management (`Effect.acquireRelease`) for WebSocket lifecycle. Store connection in a singleton layer, not component state. Implement connection pooling for multiple subscribers.

### Real-Time vs Request-Response Contract Patterns
- **Symptom**: Type errors or runtime failures when treating WebSocket message contracts like HTTP contracts.
- **Root Cause**: WebSocket contracts are bidirectional streams, not request-response pairs.
- **Solution**: Define separate contract types for WebSocket messages. Use `S.Union` for message discriminators. Real-time contracts should model the full message envelope, not just payloads.

### Notification Payload Schema Versioning
- **Symptom**: Client crashes or shows broken notifications after server deploys new notification types.
- **Root Cause**: Server adds new notification types that client doesn't recognize.
- **Solution**: Notification schemas MUST use `S.Union` with a catch-all variant for unknown types. Client should gracefully degrade for unrecognized notifications rather than crash.

### Push Notification Token Refresh
- **Symptom**: Push notifications stop arriving after app restart or token expiry.
- **Root Cause**: Device push tokens expire and must be re-registered with the server.
- **Solution**: Implement token refresh logic that re-registers with server on app launch. Contract for token registration should be idempotent (safe to call multiple times with same token).

### Email Template Contract Response Latency
- **Symptom**: UI freezes or timeouts when previewing email templates.
- **Root Cause**: Email template rendering may involve server-side processing that takes longer than typical RPC calls.
- **Solution**: Email preview contracts should use longer timeout configurations. Consider streaming responses for large templates. Provide loading states in UI.

### Message Deduplication
- **Symptom**: Same notification or message appears multiple times in UI.
- **Root Cause**: Network retries or reconnection delivers duplicate messages; client doesn't deduplicate.
- **Solution**: All message contracts MUST include unique `messageId` field. Client implementations should maintain a seen-message set (bounded, e.g., last 1000 IDs) and skip duplicates.

## Contributor Checklist
- [ ] Define contracts with proper request/response schemas following `@beep/contract` patterns.
- [ ] Ensure all contracts have corresponding server-side implementations in `@beep/comms-server`.
- [ ] Add proper TypeScript doc comments for contract exports.
- [ ] Use Effect Schema for all data validation — no bare type assertions.
- [ ] Consider WebSocket contracts for real-time notification features.
- [ ] Verify error responses do not leak sensitive information.
- [ ] Re-run verification commands above before handing work off.
