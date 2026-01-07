# @beep/comms-client — Agent Guide

## Purpose & Fit
- Provides the client-side SDK layer for the communications slice, enabling frontend applications to interact with messaging, notifications, and communication features.
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
- Always import Effect modules with namespaces (`Effect`, `A`, `F`, `O`, `Str`, `S`) and rely on Effect collections/utilities instead of native helpers (see global repo guardrails).
- Define contracts using `@beep/contract` patterns — each contract should specify request/response schemas and error types.
- Maintain typed error channels using `S.TaggedError` for predictable client-side error handling.
- Keep contracts thin — business logic belongs in domain or server layers.
- Use `"use client"` directive for React-specific exports that need client-side bundling.
- Consider real-time contract patterns for WebSocket-based features.

## Verifications
- `bun run check --filter @beep/comms-client`
- `bun run lint --filter @beep/comms-client`
- `bun run test --filter @beep/comms-client`

## Contributor Checklist
- [ ] Define contracts with proper request/response schemas following `@beep/contract` patterns.
- [ ] Ensure all contracts have corresponding server-side implementations in `@beep/comms-server`.
- [ ] Add proper TypeScript doc comments for contract exports.
- [ ] Use Effect Schema for all data validation — no bare type assertions.
- [ ] Consider WebSocket contracts for real-time notification features.
- [ ] Re-run verification commands above before handing work off.
