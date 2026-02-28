import * as Schema from "effect/Schema";

/**
 * @since 0.0.0
 */
export type AbortControllerLike = {
  signal: unknown;
};

/**
 * @since 0.0.0
 */
export const AbortController = Schema.declare(
  (_: unknown): _ is AbortControllerLike => typeof _ === "object" && _ !== null && "signal" in _
).pipe(Schema.annotate({ identifier: "AbortController", jsonSchema: {} }));

/**
 * @since 0.0.0
 */
export type AbortController = typeof AbortController.Type;
/**
 * @since 0.0.0
 */
export type AbortControllerEncoded = typeof AbortController.Encoded;

/**
 * @since 0.0.0
 */
export const StderrCallback = Schema.declare((_: unknown): _ is (data: string) => void => true).pipe(
  Schema.annotate({ identifier: "StderrCallback", jsonSchema: {} })
);

/**
 * @since 0.0.0
 */
export type StderrCallback = typeof StderrCallback.Type;
/**
 * @since 0.0.0
 */
export type StderrCallbackEncoded = typeof StderrCallback.Encoded;

/**
 * @since 0.0.0
 */
export const SpawnedProcess = Schema.declare((_: unknown): _ is unknown => true).pipe(
  Schema.annotate({ identifier: "SpawnedProcess", jsonSchema: {} })
);

/**
 * @since 0.0.0
 */
export type SpawnedProcess = typeof SpawnedProcess.Type;
/**
 * @since 0.0.0
 */
export type SpawnedProcessEncoded = typeof SpawnedProcess.Encoded;

/**
 * @since 0.0.0
 */
export const SpawnClaudeCodeProcess = Schema.declare(
  (_: unknown): _ is (options: unknown) => SpawnedProcess => true
).pipe(Schema.annotate({ identifier: "SpawnClaudeCodeProcess", jsonSchema: {} }));

/**
 * @since 0.0.0
 */
export type SpawnClaudeCodeProcess = typeof SpawnClaudeCodeProcess.Type;
/**
 * @since 0.0.0
 */
export type SpawnClaudeCodeProcessEncoded = typeof SpawnClaudeCodeProcess.Encoded;
