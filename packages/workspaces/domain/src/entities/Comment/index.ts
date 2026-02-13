/**
 * Comment entity module.
 *
 * Defines the complete domain surface for Comment: model, errors, repository contract,
 * RPC group, HTTP API group, AI toolkit, and per-operation contracts.
 *
 * ## Export Contract
 * - `Model` — SQL model + derived schemas (`select`, `insert`, `update`, `json`).
 * - `CommentErrors` — Namespaced tagged error schemas that cross RPC/HTTP boundaries.
 * - `Rpcs` — `RpcGroup` wiring all Comment operations for server handlers.
 * - `Contracts` — Per-operation contracts (`Get`, `Create`, `Update`, `Delete`, `ListByDiscussion`).
 *   Each contract exports: `Payload`, `Success`, `Failure`, `Contract`.
 * - `Http` — `HttpApiGroup` exposing Comment endpoints for OpenAPI/Scalar.
 * - `Toolkit` — `@effect/ai` toolkit exposing Comment tools for agent runtimes.
 * - `Entity` — Cluster entity for distributed runtime hosting.
 * - `Repo` — `Context.Tag` for the Comment repository service.
 *
 * @module documents-domain/entities/Comment
 * @since 1.0.0
 * @category entities
 */
export * from "./Comment.entity";
export * as CommentErrors from "./Comment.errors";
export * from "./Comment.http";
export * from "./Comment.model";
export * from "./Comment.repo";
export * as Rpcs from "./Comment.rpc";
export * from "./Comment.tool";
export * as Contracts from "./contracts";
