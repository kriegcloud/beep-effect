/**
 * Beep Graph RAG pipelines.
 *
 * Effect-based Graph RAG and Document RAG pipelines with typed
 * client dependencies, automatic tracing, and domain-specific errors.
 *
 * @module
 * @since 0.1.0
 */

/**
 * Shared client dependency contracts used by graph pipelines.
 *
 * @example
 * ```ts
 * import { Clients } from "@beep/graph-pipeline";
 *
 * const module = Clients;
 * console.log(module);
 * ```
 *
 * @since 0.1.0
 * @category modules
 */
export * as Clients from "./Clients.ts";
/**
 * Document retrieval-augmented generation pipeline helpers.
 *
 * @example
 * ```ts
 * import { DocumentRag } from "@beep/graph-pipeline";
 *
 * const module = DocumentRag;
 * console.log(module);
 * ```
 *
 * @since 0.1.0
 * @category modules
 */
export * as DocumentRag from "./DocumentRag.ts";
/**
 * Error models surfaced by graph pipeline execution.
 *
 * @example
 * ```ts
 * import { Errors } from "@beep/graph-pipeline";
 *
 * const module = Errors;
 * console.log(module);
 * ```
 *
 * @since 0.1.0
 * @category modules
 */
export * as Errors from "./Errors.ts";
/**
 * Graph retrieval-augmented generation pipeline helpers.
 *
 * @example
 * ```ts
 * import { GraphRag } from "@beep/graph-pipeline";
 *
 * const module = GraphRag;
 * console.log(module);
 * ```
 *
 * @since 0.1.0
 * @category modules
 */
export * as GraphRag from "./GraphRag.ts";
