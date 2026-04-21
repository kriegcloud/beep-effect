/**
 * Beep Graph message schema definitions.
 *
 * Effect Schema types for all service communication — RDF primitives,
 * request/response pairs, pipeline stages, and management operations.
 *
 * @module
 * @since 0.1.0
 */

/**
 * Agent request and response schemas.
 *
 * @example
 * ```ts
 * import { Agent } from "@beep/graph-schema";
 *
 * const module = Agent;
 * console.log(module);
 * ```
 *
 * @since 0.1.0
 * @category modules
 */
export * as Agent from "./Agent.ts";
/**
 * Collection management schemas and result models.
 *
 * @example
 * ```ts
 * import { Collection } from "@beep/graph-schema";
 *
 * const module = Collection;
 * console.log(module);
 * ```
 *
 * @since 0.1.0
 * @category modules
 */
export * as Collection from "./Collection.ts";
/**
 * Runtime configuration schemas for graph services.
 *
 * @example
 * ```ts
 * import { Config } from "@beep/graph-schema";
 *
 * const module = Config;
 * console.log(module);
 * ```
 *
 * @since 0.1.0
 * @category modules
 */
export * as Config from "./Config.ts";
/**
 * Document embedding request and response schemas.
 *
 * @example
 * ```ts
 * import { DocumentEmbeddings } from "@beep/graph-schema";
 *
 * const module = DocumentEmbeddings;
 * console.log(module);
 * ```
 *
 * @since 0.1.0
 * @category modules
 */
export * as DocumentEmbeddings from "./DocumentEmbeddings.ts";
/**
 * Document RAG pipeline schemas.
 *
 * @example
 * ```ts
 * import { DocumentRag } from "@beep/graph-schema";
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
 * Generic embedding model schemas.
 *
 * @example
 * ```ts
 * import { Embeddings } from "@beep/graph-schema";
 *
 * const module = Embeddings;
 * console.log(module);
 * ```
 *
 * @since 0.1.0
 * @category modules
 */
export * as Embeddings from "./Embeddings.ts";
/**
 * Flow orchestration schemas for graph pipelines.
 *
 * @example
 * ```ts
 * import { Flow } from "@beep/graph-schema";
 *
 * const module = Flow;
 * console.log(module);
 * ```
 *
 * @since 0.1.0
 * @category modules
 */
export * as Flow from "./Flow.ts";
/**
 * Graph embedding request and response schemas.
 *
 * @example
 * ```ts
 * import { GraphEmbeddings } from "@beep/graph-schema";
 *
 * const module = GraphEmbeddings;
 * console.log(module);
 * ```
 *
 * @since 0.1.0
 * @category modules
 */
export * as GraphEmbeddings from "./GraphEmbeddings.ts";
/**
 * Graph RAG pipeline schemas.
 *
 * @example
 * ```ts
 * import { GraphRag } from "@beep/graph-schema";
 *
 * const module = GraphRag;
 * console.log(module);
 * ```
 *
 * @since 0.1.0
 * @category modules
 */
export * as GraphRag from "./GraphRag.ts";
/**
 * Knowledge graph query and mutation schemas.
 *
 * @example
 * ```ts
 * import { Knowledge } from "@beep/graph-schema";
 *
 * const module = Knowledge;
 * console.log(module);
 * ```
 *
 * @since 0.1.0
 * @category modules
 */
export * as Knowledge from "./Knowledge.ts";
/**
 * Librarian request and response schemas.
 *
 * @example
 * ```ts
 * import { Librarian } from "@beep/graph-schema";
 *
 * const module = Librarian;
 * console.log(module);
 * ```
 *
 * @since 0.1.0
 * @category modules
 */
export * as Librarian from "./Librarian.ts";
/**
 * Pipeline metadata and execution schemas.
 *
 * @example
 * ```ts
 * import { Pipeline } from "@beep/graph-schema";
 *
 * const module = Pipeline;
 * console.log(module);
 * ```
 *
 * @since 0.1.0
 * @category modules
 */
export * as Pipeline from "./Pipeline.ts";
/**
 * Core RDF primitives and shared graph payload types.
 *
 * @example
 * ```ts
 * import { Primitives } from "@beep/graph-schema";
 *
 * const module = Primitives;
 * console.log(module);
 * ```
 *
 * @since 0.1.0
 * @category modules
 */
export * as Primitives from "./Primitives.ts";
/**
 * Prompt schemas used by graph generation flows.
 *
 * @example
 * ```ts
 * import { Prompt } from "@beep/graph-schema";
 *
 * const module = Prompt;
 * console.log(module);
 * ```
 *
 * @since 0.1.0
 * @category modules
 */
export * as Prompt from "./Prompt.ts";
/**
 * Text completion request and response schemas.
 *
 * @example
 * ```ts
 * import { TextCompletion } from "@beep/graph-schema";
 *
 * const module = TextCompletion;
 * console.log(module);
 * ```
 *
 * @since 0.1.0
 * @category modules
 */
export * as TextCompletion from "./TextCompletion.ts";
/**
 * Tool invocation and tool registry schemas.
 *
 * @example
 * ```ts
 * import { Tool } from "@beep/graph-schema";
 *
 * const module = Tool;
 * console.log(module);
 * ```
 *
 * @since 0.1.0
 * @category modules
 */
export * as Tool from "./Tool.ts";
/**
 * Triple query request and response schemas.
 *
 * @example
 * ```ts
 * import { TriplesQuery } from "@beep/graph-schema";
 *
 * const module = TriplesQuery;
 * console.log(module);
 * ```
 *
 * @since 0.1.0
 * @category modules
 */
export * as TriplesQuery from "./TriplesQuery.ts";
