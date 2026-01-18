/**
 * Effect Service Template
 *
 * Use this template when defining new services in @beep/knowledge-server.
 * Replace {{ServiceName}} with your actual service name.
 *
 * @template
 */
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as S from "effect/Schema";
import * as A from "effect/Array";
import * as O from "effect/Option";

// =============================================================================
// Service Interface
// =============================================================================

/**
 * {{ServiceName}} service interface.
 *
 * Define the public API surface here.
 * Use Effect return types for all async operations.
 */
export interface {{ServiceName}}Api {
  /**
   * Example method with typed input and output.
   *
   * @param input - Validated input
   * @returns Effect with result or typed error
   */
  readonly exampleMethod: (
    input: ExampleInput
  ) => Effect.Effect<ExampleOutput, {{ServiceName}}Error>;

  /**
   * Example method returning Option for nullable results.
   */
  readonly findById: (
    id: string
  ) => Effect.Effect<O.Option<ExampleOutput>, {{ServiceName}}Error>;

  /**
   * Example batch operation with bounded concurrency.
   */
  readonly processBatch: (
    items: ReadonlyArray<ExampleInput>
  ) => Effect.Effect<ReadonlyArray<ExampleOutput>, {{ServiceName}}Error>;
}

// =============================================================================
// Input/Output Schemas
// =============================================================================

export class ExampleInput extends S.Class<ExampleInput>("ExampleInput")({
  field1: S.String,
  field2: S.optional(S.Number),
}) {}

export class ExampleOutput extends S.Class<ExampleOutput>("ExampleOutput")({
  id: S.String,
  result: S.String,
  processedAt: S.Date,
}) {}

// =============================================================================
// Error Types
// =============================================================================

/**
 * Service-specific error type.
 *
 * Use S.TaggedError for typed error handling.
 */
export class {{ServiceName}}Error extends S.TaggedError<{{ServiceName}}Error>()(
  "{{ServiceName}}Error",
  {
    message: S.String,
    cause: S.optional(S.Unknown),
  }
) {}

// =============================================================================
// Service Definition
// =============================================================================

/**
 * {{ServiceName}} service implementation.
 *
 * Key patterns:
 * - Use Effect.Service for consistent service definition
 * - ALWAYS set accessors: true for static method access
 * - Declare dependencies explicitly
 * - Use Effect.gen with yield* for all async operations
 */
export class {{ServiceName}} extends Effect.Service<{{ServiceName}}>()(
  "@beep/knowledge-server/{{ServiceName}}",
  {
    // -------------------------------------------------------------------------
    // Dependencies
    // -------------------------------------------------------------------------
    dependencies: [
      // Add your dependencies here, e.g.:
      // DependencyService.Default,
      // KnowledgeDb.Default,
    ],

    // -------------------------------------------------------------------------
    // CRITICAL: Always enable accessors
    // -------------------------------------------------------------------------
    accessors: true,

    // -------------------------------------------------------------------------
    // Implementation
    // -------------------------------------------------------------------------
    effect: Effect.gen(function* () {
      // Acquire dependencies
      // const db = yield* KnowledgeDb;
      // const otherService = yield* OtherService;

      return {
        // -----------------------------------------------------------------------
        // Method implementations
        // -----------------------------------------------------------------------

        exampleMethod: (input: ExampleInput) =>
          Effect.gen(function* () {
            // Validate input (already validated by schema, but can add business rules)
            if (!input.field1) {
              return yield* Effect.fail(
                new {{ServiceName}}Error({ message: "field1 is required" })
              );
            }

            // Perform operation
            const result = yield* Effect.succeed({
              id: "generated-id",
              result: `Processed: ${input.field1}`,
              processedAt: new Date(),
            });

            // Log with structured data
            yield* Effect.logInfo("{{ServiceName}}: exampleMethod completed", {
              inputField1: input.field1,
              outputId: result.id,
            });

            return result;
          }),

        findById: (id: string) =>
          Effect.gen(function* () {
            // Example: Query database
            // const record = yield* db.query(...)

            // Return Option for nullable results
            if (id === "not-found") {
              return O.none();
            }

            return O.some({
              id,
              result: "Found",
              processedAt: new Date(),
            });
          }),

        processBatch: (items: ReadonlyArray<ExampleInput>) =>
          Effect.gen(function* () {
            // Process with bounded concurrency
            const results = yield* Effect.forEach(
              items,
              (item) =>
                Effect.gen(function* () {
                  // Process each item
                  return {
                    id: `batch-${item.field1}`,
                    result: `Processed: ${item.field1}`,
                    processedAt: new Date(),
                  };
                }),
              { concurrency: 10 } // Bounded concurrency
            );

            return results;
          }),
      } satisfies {{ServiceName}}Api;
    }),
  }
) {}

// =============================================================================
// Layer Composition (for testing or custom configurations)
// =============================================================================

/**
 * Create a custom layer with injected dependencies.
 *
 * @example
 * ```typescript
 * const TestLayer = {{ServiceName}}.layer.pipe(
 *   Layer.provide(MockDb.layer)
 * );
 * ```
 */
export const {{ServiceName}}Layer = {{ServiceName}}.Default;

// =============================================================================
// Usage Examples
// =============================================================================

/**
 * @example Direct service access (with accessors: true)
 * ```typescript
 * const program = Effect.gen(function* () {
 *   const result = yield* {{ServiceName}}.exampleMethod({ field1: "test" });
 *   return result;
 * });
 *
 * // Run with layer
 * Effect.runPromise(program.pipe(Effect.provide({{ServiceName}}.Default)));
 * ```
 *
 * @example With dependency injection
 * ```typescript
 * const program = Effect.gen(function* () {
 *   const service = yield* {{ServiceName}};
 *   const result = yield* service.exampleMethod({ field1: "test" });
 *   return result;
 * });
 * ```
 */
