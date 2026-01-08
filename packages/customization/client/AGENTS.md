# @beep/customization-client — Agent Guide

## Purpose & Fit
- Provides the client-side CLIENT layer for the customization slice, enabling frontend applications to interact with customization features.
- Contains API contracts, client-side services, and type definitions for client-server communication.
- Acts as the bridge between the customization domain and UI layers, exposing typed contracts for TanStack Query and Effect-based client runtimes.
- Currently a minimal scaffold awaiting contract definitions as the customization feature matures.

## Surface Map
- **beep** — Placeholder export indicating package initialization (awaiting contract implementations).

## Usage Snapshots
- Frontend apps import contracts from this package to invoke customization-related RPC calls.
- TanStack Query hooks wrap contracts for React component consumption.
- Effect client runtime uses contracts to execute type-safe requests against the server.

## Authoring Guardrails
- Always import Effect modules with namespaces (`Effect`, `A`, `F`, `O`, `Str`, `S`) and rely on Effect collections/utilities instead of native helpers (see global repo guardrails).
- Define contracts using `@beep/contract` patterns — each contract should specify request/response schemas and error types.
- Maintain typed error channels using `S.TaggedError` for predictable client-side error handling.
- Keep contracts thin — business logic belongs in domain or server layers.
- Use `"use client"` directive for React-specific exports that need client-side bundling.

## Verifications
- `bun run check --filter @beep/customization-client`
- `bun run lint --filter @beep/customization-client`
- `bun run test --filter @beep/customization-client`

## Contributor Checklist
- [ ] Define contracts with proper request/response schemas following `@beep/contract` patterns.
- [ ] Ensure all contracts have corresponding server-side implementations in `@beep/customization-server`.
- [ ] Add proper TypeScript doc comments for contract exports.
- [ ] Use Effect Schema for all data validation — no bare type assertions.
- [ ] Re-run verification commands above before handing work off.
