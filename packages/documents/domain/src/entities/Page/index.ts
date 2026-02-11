/**
 * Page entity module.
 *
 * Defines the complete domain surface for Page: model, errors, repository contract,
 * RPC group, HTTP API group, AI toolkit, value objects, and per-operation contracts.
 *
 * ## Export Contract
 * - `Model` — SQL model + derived schemas (`select`, `insert`, `update`, `json`).
 * - `PageErrors` — Namespaced tagged error schemas that cross RPC/HTTP boundaries.
 * - `Rpcs` — `RpcGroup` wiring all Page operations for server handlers.
 * - `Contracts` — Per-operation contracts (`Get`, `Create`, `Update`, `Delete`, `List`, etc.).
 *   Each contract exports: `Payload`, `Success`, `Failure`, `Contract`.
 * - `Http` — `HttpApiGroup` exposing Page endpoints for OpenAPI/Scalar.
 * - `Toolkit` — `@effect/ai` toolkit exposing Page tools for agent runtimes.
 * - `Entity` — Cluster entity for distributed runtime hosting.
 * - `Repo` — `Context.Tag` for the Page repository service.
 *
 * @module documents-domain/entities/Page
 * @since 1.0.0
 * @category entities
 */
export * from "./Page.entity";
export * from "./Page.http";
export * from "./Page.model";
export * from "./Page.repo";
export * from "./Page.tool";
export * from "./Page.values";
export * as PageErrors from "./Page.errors";
export * as Rpcs from "./Page.rpc";
export * as Contracts from "./contracts";
