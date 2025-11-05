/**
 * Zero Push Processor with Effect-SQL Drizzle Integration
 *
 * This module implements a custom database adapter for Zero's real-time sync system
 * using Effect's official Drizzle integration (@effect/sql-drizzle).
 *
 * ## What is Zero's Push Processor?
 *
 * Zero's Push Processor is the server-side component that:
 * - Receives mutation requests from Zero clients
 * - Validates and executes mutations against your database
 * - Generates change events for real-time synchronization
 * - Handles conflict resolution and maintains consistency
 *
 * ## Zero's Database Connection Requirements
 *
 * Zero requires a `DBConnection` implementation that provides:
 * 1. **Raw SQL execution**: `query(sql, params)` for schema introspection and sync queries
 * 2. **Transaction management**: `transaction(fn)` for atomic mutation processing
 * 3. **Connection pooling**: Efficient resource management for concurrent operations
 *
 * Zero does NOT require any specific database library - you can adapt any Postgres
 * client by implementing the `DBConnection` interface. This adapter uses Drizzle.
 *
 * ## Architecture: Custom Database Connection Adapter
 *
 * ```
 * Zero Client ──► PushProcessor ──► ZQLDatabase ──► EffectDrizzleConnection
 *                      │                │                    │
 *                      │                │                    ├─► PgRemoteDatabase (for app mutations)
 *                      │                │                    └─► SqlClient (for Zero's SQL needs)
 *                      │                │
 *                      │                └─► Uses DBConnection interface
 *                      │
 *                      └─► Processes mutations & generates sync events
 * ```
 *
 * ## Why This Dual-Client Approach?
 *
 * - **PgRemoteDatabase**: Provides Drizzle's type-safe query builder for application mutations
 * - **SqlClient**: Provides raw SQL execution that Zero requires for internal operations
 * - **Shared Connection Pool**: Both clients use the same underlying Postgres connection
 * - **Transaction Consistency**: Both operate within the same transaction context
 *
 * This follows Zero's design principle: "You can implement an adapter to a different
 * Postgres library, or even a different database entirely" by providing a custom
 * `DBConnection` implementation.
 *
 * ## Compatibility with Zero's Interface
 *
 * This implementation follows the exact same patterns as Zero's built-in postgres adapter:
 * - Same `ZeroStore` and `ZeroSchemaStore` interfaces
 * - Same `processMutations` logic for mutation handling
 * - Same service architecture for dependency injection
 * - Same error handling patterns
 *
 * The only difference is using Drizzle instead of the raw `pg` library for database operations.
 *
 * @since 1.0.0
 * @see https://github.com/rocicorp/mono/blob/main/packages/zero-pg/src/postgres-connection.ts
 */
import type { UnsafeTypes } from "@beep/types";
import * as SqlClient from "@effect/sql/SqlClient";
import type { PrimitiveKind } from "@effect/sql/Statement";
import * as Pg from "@effect/sql-drizzle/Pg";
import type { CustomMutatorDefs, ReadonlyJSONObject, Schema } from "@rocicorp/zero";
import type { DBConnection, DBTransaction, Row } from "@rocicorp/zero/pg";
import { PushProcessor, ZQLDatabase } from "@rocicorp/zero/pg";
import type { PgRemoteDatabase } from "drizzle-orm/pg-proxy";
import { Context, Effect, Layer, Runtime } from "effect";
import type { CustomMutatorEfDefs } from "../client";
import { convertEffectMutatorsToPromise } from "../client";
import { ZeroMutationProcessingError } from "../shared/errors";

/**
 * Custom Database Connection Adapter for Zero using Drizzle
 *
 * This class implements Zero's `DBConnection` interface to provide a custom database
 * adapter using Effect's Drizzle integration. Zero's architecture allows you to use
 * any database library by implementing this interface.
 *
 * ## Zero's DBConnection Interface Requirements
 *
 * Zero requires any database adapter to implement:
 * 1. **`query(sql, params)`** - Execute raw SQL queries with parameters
 * 2. **`transaction(fn)`** - Execute a function within a database transaction
 *
 * Zero uses these methods for:
 * - **Schema introspection**: Analyzing your database structure for sync
 * - **Change tracking**: Querying for data changes to generate sync events
 * - **Mutation execution**: Running your custom mutators within transactions
 * - **Conflict resolution**: Handling concurrent updates safely
 *
 * ## Why Dual Database Clients?
 *
 * This adapter uses two complementary clients:
 * - **`drizzle`**: Provides Drizzle's type-safe query builder for application mutations
 * - **`sqlClient`**: Provides raw SQL execution that Zero's internals require
 *
 * Both clients operate on the same connection pool and transaction context, ensuring
 * data consistency and efficient resource usage.
 *
 * ## Custom Adapter Pattern
 *
 * This follows Zero's documented pattern for custom database adapters:
 * "You can implement an adapter to a different Postgres library, or even a
 * different database entirely. To do so, provide a connectionProvider to
 * PushProcessor that returns a different DBConnection implementation."
 *
 * @since 1.0.0
 * @category adapters
 * @see https://github.com/rocicorp/mono/blob/main/packages/zero-pg/src/postgres-connection.ts
 */
export class EffectDrizzleConnection<R = never> implements DBConnection<PgRemoteDatabase> {
  readonly #drizzle: PgRemoteDatabase;
  readonly #sqlClient: SqlClient.SqlClient;
  readonly #runtime: Runtime.Runtime<R>;

  /**
   * @param drizzle - Drizzle database instance for type-safe queries
   * @param sqlClient - Underlying SQL client for raw queries (required by Zero)
   * @param runtime - Effect runtime for executing database operations
   */
  constructor(drizzle: PgRemoteDatabase, sqlClient: SqlClient.SqlClient, runtime: Runtime.Runtime<R>) {
    this.#drizzle = drizzle;
    this.#sqlClient = sqlClient;
    this.#runtime = runtime;
  }

  /**
   * Execute raw SQL query with parameters (required by Zero)
   *
   * Zero's Push Processor calls this method for:
   * - **Schema introspection**: Analyzing table structures, constraints, and indexes
   * - **Change detection**: Querying for data modifications to generate sync events
   * - **Internal operations**: Various sync-related database queries
   *
   * This method must support parameterized queries to prevent SQL injection.
   * Uses the underlying SqlClient to provide the raw SQL access Zero requires.
   *
   * @param sql - Raw SQL query string with parameter placeholders ($1, $2, etc.)
   * @param params - Array of parameter values to bind to the query
   * @returns Promise resolving to iterable query results
   */
  async query(sql: string, params: Array<unknown>): Promise<Iterable<Row>> {
    const queryEffect = this.#sqlClient.unsafe(sql, params as Array<PrimitiveKind>);
    return Runtime.runPromise(this.#runtime)(queryEffect) as Promise<Iterable<Row>>;
  }

  /**
   * Execute function within a database transaction (required by Zero)
   *
   * Zero's Push Processor calls this method to:
   * - **Execute mutations atomically**: Ensure all changes succeed or fail together
   * - **Maintain consistency**: Prevent partial updates during concurrent operations
   * - **Handle conflicts**: Safely resolve concurrent modifications
   * - **Generate change events**: Track what changed within the transaction
   *
   * The provided function receives a `DBTransaction` that provides the same
   * `query(sql, params)` interface but within the transaction context.
   *
   * @param fn - Function to execute within the transaction context
   * @returns Promise resolving to the function's return value
   */
  async transaction<TRet>(fn: (tx: DBTransaction<PgRemoteDatabase>) => Promise<TRet>): Promise<TRet> {
    const transactionAdapter = new EffectDrizzleTransaction<R>(this.#drizzle, this.#sqlClient, this.#runtime);

    const effectToRun = Effect.promise(() => fn(transactionAdapter));
    const transactionalEffect = this.#sqlClient.withTransaction(effectToRun);

    return Runtime.runPromise(this.#runtime)(transactionalEffect);
  }
}

/**
 * Database Transaction Adapter for Zero using Drizzle
 *
 * This class implements Zero's `DBTransaction` interface to provide transactional
 * database operations within Zero's Push Processor. Zero requires this interface
 * for atomic mutation processing and change tracking.
 *
 * ## Zero's DBTransaction Interface Requirements
 *
 * Zero requires transaction objects to provide:
 * 1. **`wrappedTransaction`** - Access to the underlying database client for mutations
 * 2. **`query(sql, params)`** - Execute raw SQL within the transaction context
 *
 * ## Transaction Guarantees
 *
 * This transaction adapter ensures:
 * - **Atomicity**: All operations succeed or fail together
 * - **Consistency**: Database constraints are maintained throughout
 * - **Isolation**: Concurrent transactions don't interfere with each other
 * - **Durability**: Committed changes are permanently stored
 *
 * Both the Drizzle instance and SqlClient operate within the same transaction
 * context, ensuring that application mutations and Zero's internal operations
 * are part of the same atomic unit.
 *
 * ## Usage by Zero's Push Processor
 *
 * Zero passes this transaction object to your custom mutators, allowing them to:
 * - Execute type-safe Drizzle queries via `wrappedTransaction`
 * - Perform raw SQL operations if needed via `query()`
 * - Know that all operations are automatically rolled back on error
 *
 * @since 1.0.0
 * @category adapters
 */
class EffectDrizzleTransaction<R = never> implements DBTransaction<PgRemoteDatabase> {
  /**
   * The underlying Drizzle database instance (required by Zero)
   *
   * Zero's Push Processor provides this to your custom mutators via the
   * `wrappedTransaction` property. Your mutators can use this for:
   * - Type-safe database queries using Drizzle's query builder
   * - Insert, update, delete operations with full type checking
   * - Complex queries with joins, aggregations, etc.
   *
   * All operations automatically execute within the current transaction context.
   */
  readonly wrappedTransaction: PgRemoteDatabase;

  readonly #sqlClient: SqlClient.SqlClient;
  readonly #runtime: Runtime.Runtime<R>;

  /**
   * @param drizzle - Drizzle database instance (operates within transaction)
   * @param sqlClient - SQL client for raw queries (same transaction context)
   * @param runtime - Effect runtime for executing operations
   */
  constructor(drizzle: PgRemoteDatabase, sqlClient: SqlClient.SqlClient, runtime: Runtime.Runtime<R>) {
    this.wrappedTransaction = drizzle;
    this.#sqlClient = sqlClient;
    this.#runtime = runtime;
  }

  /**
   * Execute raw SQL query within the current transaction (required by Zero)
   *
   * Zero's Push Processor may call this method during mutation processing for:
   * - **Change tracking**: Recording what data was modified
   * - **Constraint checking**: Validating business rules
   * - **Sync operations**: Internal bookkeeping for real-time updates
   *
   * Your custom mutators can also use this for operations that require
   * raw SQL beyond what Drizzle's query builder provides.
   *
   * @param sql - Raw SQL query string with parameter placeholders ($1, $2, etc.)
   * @param params - Array of parameter values to bind to the query
   * @returns Promise resolving to iterable query results
   */
  async query(sql: string, params: Array<unknown>): Promise<Iterable<Row>> {
    const queryEffect = this.#sqlClient.unsafe(sql, params as Array<PrimitiveKind>);
    return Runtime.runPromise(this.#runtime)(queryEffect) as Promise<Iterable<Row>>;
  }
}

/**
 * Create a Zero ZQL Database using Effect-SQL Drizzle
 *
 * This function creates Zero's core database abstraction (`ZQLDatabase`) using
 * a custom Drizzle connection adapter. The ZQLDatabase handles all of Zero's
 * real-time synchronization logic.
 *
 * ## What is Zero's ZQLDatabase?
 *
 * ZQLDatabase (Zero Query Language Database) is Zero's internal database abstraction that:
 * - **Analyzes your schema**: Understands tables, relationships, and constraints
 * - **Tracks changes**: Monitors data modifications for real-time sync
 * - **Processes queries**: Handles client queries and subscriptions
 * - **Manages mutations**: Executes your custom mutators safely
 * - **Resolves conflicts**: Handles concurrent updates intelligently
 *
 * ## Custom Connection Provider Pattern
 *
 * This follows Zero's documented approach: "provide a connectionProvider to
 * PushProcessor that returns a different DBConnection implementation."
 *
 * The ZQLDatabase doesn't care what database library you use - it only requires
 * a `DBConnection` that can execute SQL and manage transactions.
 *
 * @param schema - Zero schema definition describing your database structure
 * @param drizzle - Drizzle database instance for type-safe mutation operations
 * @param sqlClient - SQL client for raw queries (required by Zero's internals)
 * @param runtime - Effect runtime for executing database operations
 * @returns ZQLDatabase instance that uses Drizzle for database operations
 *
 * @since 1.0.0
 * @category constructors
 */
export function zeroEffectDrizzle<TSchema extends Schema, R = never>(
  schema: TSchema,
  drizzle: PgRemoteDatabase,
  sqlClient: SqlClient.SqlClient,
  runtime: Runtime.Runtime<R>
): ZQLDatabase<TSchema, PgRemoteDatabase> {
  const connection = new EffectDrizzleConnection<R>(drizzle, sqlClient, runtime);
  return new ZQLDatabase(connection, schema);
}

/**
 * Create a Zero Push Processor using Effect-SQL Drizzle
 *
 * This function creates Zero's server-side mutation processing engine using
 * a custom Drizzle database adapter. The Push Processor is the core component
 * that enables Zero's real-time synchronization capabilities.
 *
 * ## What is Zero's Push Processor?
 *
 * The Push Processor is Zero's server-side engine that:
 * - **Receives mutations**: Accepts mutation requests from Zero clients
 * - **Validates requests**: Ensures mutations conform to your schema
 * - **Executes atomically**: Runs mutations within database transactions
 * - **Tracks changes**: Records what data was modified for sync
 * - **Generates events**: Creates real-time update events for connected clients
 * - **Handles conflicts**: Resolves concurrent modifications intelligently
 * - **Manages errors**: Provides detailed error information to clients
 *
 * ## Custom Database Integration
 *
 * This Push Processor uses your custom Drizzle connection adapter, allowing
 * Zero to work with Drizzle while maintaining all real-time sync capabilities.
 * Zero's architecture is database-agnostic - it only requires the `DBConnection`
 * interface to be implemented.
 *
 * ## Effect Mutator Integration
 *
 * This processor automatically converts your Effect-based mutators to the
 * Promise-based interface that Zero's Push Processor expects, enabling
 * seamless integration with Effect's ecosystem.
 *
 * @param schema - Zero schema definition describing your database structure
 * @param drizzle - Drizzle database instance for executing mutations
 * @param sqlClient - SQL client for Zero's internal sync operations
 * @param runtime - Effect runtime for executing database operations
 * @returns PushProcessor configured to use Drizzle for all database operations
 *
 * @since 1.0.0
 * @category constructors
 */
export function zeroEffectDrizzleProcessor<TSchema extends Schema, MD extends CustomMutatorDefs, R = never>(
  schema: TSchema,
  drizzle: PgRemoteDatabase,
  sqlClient: SqlClient.SqlClient,
  runtime: Runtime.Runtime<R>
): PushProcessor<ZQLDatabase<TSchema, PgRemoteDatabase<TSchema>>, MD> {
  const zqlDatabase = zeroEffectDrizzle<TSchema, R>(schema, drizzle, sqlClient, runtime);
  return new PushProcessor(zqlDatabase);
}

// -----------------------------------------------------------------------------
// Effect Service Implementation -----------------------------------------------
// -----------------------------------------------------------------------------

/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId: unique symbol = Symbol.for("@zero-effect/DrizzleZeroStore");

/**
 * @since 1.0.0
 * @category symbols
 */
export type TypeId = typeof TypeId;

/**
 * Core Zero Store Interface for Drizzle Integration
 *
 * This interface defines the main entry point for Zero's real-time synchronization
 * system when using Drizzle as the database adapter. It provides a factory method
 * to create schema-specific stores that handle mutation processing and real-time sync.
 *
 * ## Purpose and Design
 *
 * The `ZeroStore` serves as:
 * - **Schema Factory**: Creates `ZeroSchemaStore` instances for specific database schemas
 * - **Service Interface**: Provides a clean API for dependency injection systems
 * - **Type Safety**: Ensures schema-specific operations are properly typed
 * - **Resource Management**: Manages underlying database connections and processors
 *
 * ## Integration with Zero's Architecture
 *
 * This interface mirrors Zero's built-in store interfaces but is specifically designed
 * for Drizzle integration. It maintains the same API surface while using Drizzle's
 * `PgRemoteDatabase` instead of raw `pg` client types.
 *
 * ## Usage Pattern
 *
 * ```typescript
 * const zeroStore = yield* EffectDrizzleZeroStore
 * const schemaStore = zeroStore.forSchema(mySchema)
 * const result = yield* schemaStore.processMutations(mutators, params, payload)
 * ```
 *
 * @since 1.0.0
 * @category interfaces
 */
export interface EffectDrizzleZeroStore {
  readonly [TypeId]: TypeId;
  readonly forSchema: <TSchema extends Schema, MD extends CustomMutatorDefs>(
    schema: TSchema
  ) => EffectDrizzleZeroSchemaStore<TSchema, MD>;
}

/**
 * @since 1.0.0
 * @category models
 */
export declare namespace EffectDrizzleZeroStore {
  export type AnyStore =
    | EffectDrizzleZeroStore
    | EffectDrizzleZeroSchemaStore<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny>;
}

/**
 * @since 1.0.0
 * @category symbols
 */
export const DrizzleZeroStoreTypeId: unique symbol = Symbol.for("@zero-effect/EffectDrizzleZeroStore");

/**
 * @since 1.0.0
 * @category symbols
 */
export type DrizzleZeroStoreTypeId = typeof DrizzleZeroStoreTypeId;

/**
 * Schema-Specific Zero Store for Drizzle Integration
 *
 * This interface represents a Zero store configured for a specific database schema
 * using Drizzle as the database adapter. It provides direct access to Zero's core
 * components and the main mutation processing pipeline.
 *
 * ## Core Components
 *
 * - **`database`**: Zero's `ZQLDatabase` instance that handles schema analysis,
 *   change tracking, and query processing for real-time synchronization
 * - **`processor`**: Zero's `PushProcessor` that manages the complete mutation
 *   lifecycle including validation, execution, and event generation
 * - **`processMutations`**: Main entry point for processing client mutations
 *   with full real-time sync capabilities
 *
 * ## Drizzle-Specific Design
 *
 * This interface is specifically designed for Drizzle integration:
 * - Uses `PgRemoteDatabase` type instead of raw `pg` client types
 * - Maintains compatibility with Zero's mutation processing pipeline
 * - Supports Effect-based mutators with automatic Promise conversion
 * - Provides the same functionality as Zero's built-in postgres adapter
 *
 * ## Mutation Processing Pipeline
 *
 * The `processMutations` method handles the complete mutation lifecycle:
 * 1. **Effect → Promise Conversion**: Adapts Effect mutators to Zero's API
 * 2. **Schema Validation**: Ensures mutations conform to your database schema
 * 3. **Atomic Execution**: Runs mutations within database transactions
 * 4. **Change Tracking**: Records modifications for real-time synchronization
 * 5. **Event Generation**: Creates update events for connected clients
 * 6. **Error Handling**: Provides detailed error information and rollback
 *
 * ## Usage in Request Handlers
 *
 * ```typescript
 * const schemaStore = zeroStore.forSchema(mySchema)
 *
 * // Process mutations from Zero clients
 * const result = yield* schemaStore.processMutations(
 *   myEffectMutators,
 *   requestUrlParams,
 *   mutationPayload
 * )
 * ```
 *
 * @template TSchema - The Zero schema type this store is configured for
 * @since 1.0.0
 * @category interfaces
 */
export interface EffectDrizzleZeroSchemaStore<TSchema extends Schema, MD extends CustomMutatorDefs> {
  readonly [DrizzleZeroStoreTypeId]: DrizzleZeroStoreTypeId;
  readonly database: ZQLDatabase<TSchema, PgRemoteDatabase>;
  readonly processor: PushProcessor<ZQLDatabase<TSchema, PgRemoteDatabase<TSchema>>, MD>;
  readonly processMutations: <R>(
    effectMutators: CustomMutatorEfDefs<TSchema, R>,
    urlParams: Record<string, string>,
    payload: ReadonlyJSONObject
  ) => Effect.Effect<UnsafeTypes.UnsafeAny, ZeroMutationProcessingError, R>;
}

/**
 * @since 1.0.0
 * @category tags
 */
export const EffectDrizzleZeroStore: Context.Tag<EffectDrizzleZeroStore, EffectDrizzleZeroStore> =
  Context.GenericTag<EffectDrizzleZeroStore>("@zero-effect/EffectDrizzleZeroStore");

/**
 * Effect Service for Zero's Real-Time Sync with Drizzle Integration
 *
 * This service provides the main entry point for integrating Zero's real-time
 * synchronization system with Effect's Drizzle integration. It creates and
 * manages Zero's Push Processor using a custom Drizzle database adapter.
 *
 * ## What This Service Provides
 *
 * This service creates a `ZeroStore` that:
 * - **Manages Zero's Push Processor**: Handles real-time mutation processing
 * - **Provides schema-specific stores**: Creates `ZeroSchemaStore` instances for your schemas
 * - **Integrates with Effect**: Uses Effect's service system for dependency injection
 * - **Uses Drizzle for database operations**: Leverages your existing Drizzle setup
 *
 * ## Service Dependencies
 *
 * This service requires two Effect services to be available:
 * - **`Pg.PgDrizzle`**: Your Drizzle database instance for type-safe operations
 * - **`SqlClient.SqlClient`**: Raw SQL client for Zero's internal operations
 *
 * Both services should share the same connection pool for consistency and efficiency.
 *
 * ## Integration with Zero's Architecture
 *
 * This service implements Zero's documented pattern for custom database adapters:
 * "You can implement an adapter to a different Postgres library, or even a
 * different database entirely. To do so, provide a connectionProvider to
 * PushProcessor that returns a different DBConnection implementation."
 *
 * ## Usage in Your Application
 *
 * ```typescript
 * const handler = Effect.gen(function* () {
 *   // Get the Zero store service
 *   const zeroStore = yield* EffectDrizzleZeroStore
 *   const schemaStore = zeroStore.forSchema(mySchema)
 *
 *   // Process mutations from Zero clients with real-time sync
 *   const result = yield* schemaStore.processMutations(
 *     myMutators,
 *     urlParams,
 *     mutationPayload
 *   )
 *
 *   return result
 * })
 * ```
 *
 * @since 1.0.0
 * @category services
 */
// export class EffectDrizzleZeroStore extends Effect.Service<EffectDrizzleZeroStore>()(
// 	"@zero-effect/DrizzleZeroStore",
// 	{
// 		effect: Effect.gen(function* () {
// 			const drizzle = yield* Pg.PgDrizzle
// 			const sqlClient = yield* SqlClient.SqlClient
// 			const runtime = yield* Effect.runtime<never>()

// 			return make(drizzle, sqlClient, runtime)
// 		}),
// 	},
// ) {
// 	static readonly _tag = "@zero-effect/DrizzleZeroStore" as const
// }

/**
 * Factory function to create a Zero store with Drizzle database adapter
 *
 * This function creates a `ZeroStore` that integrates Zero's real-time sync
 * system with Drizzle database operations. It implements Zero's custom
 * database adapter pattern using the provided Drizzle and SQL clients.
 *
 * ## Zero Store Architecture
 *
 * The created `ZeroStore`:
 * - **Manages Push Processors**: Creates schema-specific processors for real-time sync
 * - **Handles mutations**: Processes client mutations through your custom mutators
 * - **Tracks changes**: Monitors data modifications for real-time updates
 * - **Manages transactions**: Ensures atomic operations across all mutations
 *
 * ## Custom Database Adapter Implementation
 *
 * This follows Zero's documented approach for custom database adapters:
 * 1. **Creates custom DBConnection**: Uses Drizzle + SqlClient for database operations
 * 2. **Integrates with ZQLDatabase**: Provides Zero's core sync functionality
 * 3. **Configures Push Processor**: Sets up real-time mutation processing
 * 4. **Maintains compatibility**: Uses the same interface as Zero's built-in adapters
 *
 * ## Mutation Processing Pipeline
 *
 * The `processMutations` method implements Zero's standard pipeline:
 * 1. **Convert Effect → Promise**: Adapts Effect mutators to Zero's Promise-based API
 * 2. **Process through Push Processor**: Executes mutations with real-time sync
 * 3. **Handle errors consistently**: Wraps errors in `ZeroMutationProcessingError`
 *
 * @param drizzle - Drizzle database instance for type-safe mutation operations
 * @param sqlClient - SQL client for raw queries (required by Zero's internals)
 * @param runtime - Effect runtime for executing database operations
 * @returns ZeroStore instance that uses Drizzle for all database operations
 *
 * @since 1.0.0
 * @category constructors
 */
const make = (
  drizzle: PgRemoteDatabase,
  sqlClient: SqlClient.SqlClient,
  runtime: Runtime.Runtime<never>
): EffectDrizzleZeroStore => ({
  [TypeId]: TypeId,
  forSchema: <TSchema extends Schema, MD extends CustomMutatorDefs>(
    schema: TSchema
  ): EffectDrizzleZeroSchemaStore<TSchema, MD> => {
    const database = zeroEffectDrizzle(schema, drizzle, sqlClient, runtime);
    const processor = zeroEffectDrizzleProcessor(schema, drizzle, sqlClient, runtime);

    return {
      [DrizzleZeroStoreTypeId]: DrizzleZeroStoreTypeId,
      database,
      processor,
      /**
       * Process mutations through Zero's real-time sync system
       *
       * This method is the main entry point for processing mutations from Zero clients.
       * It handles the complete mutation lifecycle:
       *
       * 1. **Runtime Context**: Gets the current Effect runtime for executing mutators
       * 2. **Adapter Conversion**: Converts Effect mutators to Promise-based mutators (required by Zero)
       * 3. **Push Processing**: Executes mutations through Zero's Push Processor which:
       *    - Validates mutations against your schema
       *    - Executes mutations within database transactions
       *    - Tracks changes for real-time synchronization
       *    - Generates events for connected clients
       *    - Handles conflicts and errors
       * 4. **Error Handling**: Wraps any errors in `ZeroMutationProcessingError`
       *
       * This implementation is identical to Zero's built-in postgres adapter,
       * ensuring consistent behavior and compatibility with Zero's ecosystem.
       */
      processMutations: <R>(
        effectMutators: CustomMutatorEfDefs<TSchema, R>,
        urlParams: Record<string, string>,
        payload: ReadonlyJSONObject
      ): Effect.Effect<UnsafeTypes.UnsafeAny, ZeroMutationProcessingError, R> => {
        return Effect.gen(function* () {
          const currentRuntime = yield* Effect.runtime<R>();
          const promiseMutators = convertEffectMutatorsToPromise<TSchema, R>(effectMutators, currentRuntime);

          return yield* Effect.tryPromise({
            catch: (error) =>
              new ZeroMutationProcessingError({
                cause: error,
                message: `Zero mutation processing failed: ${String(error)}`,
              }),
            try: () => processor.process(promiseMutators, urlParams, payload),
          });
        });
      },
    };
  },
});

/**
 * Convenience function to create a Drizzle-based Zero store without Effect services
 *
 * This function allows creating a ZeroStore directly from Drizzle and SqlClient
 * instances, useful for testing or when not using Effect's service system.
 *
 * For production use, prefer the `EffectDrizzleZeroStore` service which handles
 * dependency injection and resource management automatically.
 *
 * @param drizzle - Drizzle database instance
 * @param sqlClient - SQL client for raw queries
 * @param runtime - Effect runtime for operations
 * @returns ZeroStore instance configured for Drizzle
 *
 * @since 1.0.0
 * @category constructors
 */
export const makeEffectDrizzleStore = (
  drizzle: PgRemoteDatabase,
  sqlClient: SqlClient.SqlClient,
  runtime: Runtime.Runtime<never>
): EffectDrizzleZeroStore => make(drizzle, sqlClient, runtime);

/**
 * Layer that provides the Effect-SQL Drizzle Zero store
 *
 * This layer automatically resolves the required dependencies and provides
 * a ready-to-use ZeroStore service. It requires both `Pg.PgDrizzle` and
 * `SqlClient.SqlClient` services to be available in the environment.
 *
 * ## Usage in Application:
 *
 * ```typescript
 * const ServerLive = Layer.mergeAll(
 *   EffectDrizzleZeroStoreLive,
 *   Drizzle.Client,  // Provides both PgDrizzle and SqlClient
 *   // other services...
 * )
 * ```
 *
 * ## Dependencies:
 *
 * - `Pg.PgDrizzle` - For type-safe database operations
 * - `SqlClient.SqlClient` - For raw SQL operations required by Zero
 *
 * Both services typically share the same connection pool when properly
 * configured, ensuring efficient resource usage.
 *
 * @since 1.0.0
 * @category layers
 * @example
 * ```typescript
 * const ServerLive = Layer.mergeAll(
 *   EffectDrizzleZeroStoreLive,
 *   Drizzle.Client,  // Provides both PgDrizzle and SqlClient
 *   // other services...
 * )
 * ```
 */
// export const DrizzleZeroStoreLive: Layer.Layer<
// 	EffectDrizzleZeroStore,
// 	never,
// 	Pg.PgDrizzle | SqlClient.SqlClient
// > = EffectDrizzleZeroStore.Default

export const EffectDrizzleZeroStoreLive = Layer.effect(
  EffectDrizzleZeroStore,
  Effect.gen(function* () {
    const drizzle = yield* Pg.PgDrizzle;
    const sqlClient = yield* SqlClient.SqlClient;
    const runtime = yield* Effect.runtime<never>();
    return make(drizzle, sqlClient, runtime);
  })
);
