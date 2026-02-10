/**
 * Comment entity module.
 *
 * This folder is intended to be a copy-pasteable template for entity modules across vertical slices.
 *
 * ## Export Contract (Stability Matters)
 * Keep these exports stable so downstream packages and AI contributors can rely on a consistent surface:
 * - `Model` - SQL model + schemas (`select`, `insert`, `update`, `json`).
 * - `CommentErrors` - namespaced export of tagged error schemas intended to cross RPC/HTTP boundaries.
 * - `CommentRpcs` - `RpcGroup` definitions for server handlers and runtimes.
 * - `Contracts` - namespaced export of per-operation contracts. Each contract module exports the same symbols:
 *   - `Payload`, `Success`, `Failure`, `Contract`
 * - Optional surfaces:
 *   - `Entity` (cluster entity), `Http` (OpenAPI group), `Toolkit` (AI tools)
 *
 * ## Copy/Paste Checklist
 * 1. Update all `$I = $<Slice>DomainId.create("...")` identity paths to match the new entity.
 * 2. Add a new contract in `contracts/*.contract.ts`, export it from `contracts/index.ts`.
 * 3. Add the contract-derived RPC (`X.Contract.Rpc`) to `Comment.rpc.ts` (or equivalent).
 * 4. If the contract should be visible in OpenAPI, add `X.Contract.Endpoint` to `Comment.http.ts`.
 * 5. If the contract should be callable by agents, add `X.Contract.Tool` to `Comment.tool.ts`.
 *
 * @module documents-domain/entities/Comment
 * @since 1.0.0
 * @category entities
 */
export * from "./Comment.entity";
export * from "./Comment.errors";
export * as CommentErrors from "./Comment.errors";
export * from "./Comment.http";
export * from "./Comment.model";
export * from "./Comment.repo";
export * from "./Comment.rpc";
export * as CommentRpcs from "./Comment.rpc";
export * from "./Comment.tool";
export * from "./contracts";
export * as Contracts from "./contracts";
