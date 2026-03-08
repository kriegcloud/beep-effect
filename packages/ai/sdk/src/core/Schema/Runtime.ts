import { $AiSdkId } from "@beep/identity/packages";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";

const $I = $AiSdkId.create("core/Schema/Runtime");

/**
 * @since 0.0.0
 * @category Validation
 */
export type AbortControllerLike = {
  signal: unknown;
} & {};

/**
 * @since 0.0.0
 * @category Validation
 */
export const AbortController = S.declare((_: unknown): _ is AbortControllerLike => P.isObject(_) && "signal" in _).pipe(
  S.annotate(
    $I.annote("AbortController", {
      description: "Runtime abort controller handle exposed to SDK process integrations.",
      jsonSchema: {},
    })
  )
);

/**
 * @since 0.0.0
 * @category Validation
 */
export type AbortController = typeof AbortController.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type AbortControllerEncoded = typeof AbortController.Encoded;

/**
 * @since 0.0.0
 * @category Validation
 */
export const StderrCallback = S.declare((_: unknown): _ is (data: string) => void => true).pipe(
  S.annotate(
    $I.annote("StderrCallback", {
      description: "Callback invoked with stderr chunks from a spawned Claude Code process.",
      jsonSchema: {},
    })
  )
);

/**
 * @since 0.0.0
 * @category Validation
 */
export type StderrCallback = typeof StderrCallback.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type StderrCallbackEncoded = typeof StderrCallback.Encoded;

/**
 * @since 0.0.0
 * @category Validation
 */
export const SpawnedProcess = S.declare((_: unknown): _ is unknown => true).pipe(
  S.annotate(
    $I.annote("SpawnedProcess", {
      description: "Opaque runtime handle for a spawned Claude Code process.",
      jsonSchema: {},
    })
  )
);

/**
 * @since 0.0.0
 * @category Validation
 */
export type SpawnedProcess = typeof SpawnedProcess.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type SpawnedProcessEncoded = typeof SpawnedProcess.Encoded;

/**
 * @since 0.0.0
 * @category Validation
 */
export const SpawnClaudeCodeProcess = S.declare((_: unknown): _ is (options: unknown) => SpawnedProcess => true).pipe(
  S.annotate(
    $I.annote("SpawnClaudeCodeProcess", {
      description: "Function capable of spawning a Claude Code child process from runtime-specific options.",
      jsonSchema: {},
    })
  )
);

/**
 * @since 0.0.0
 * @category Validation
 */
export type SpawnClaudeCodeProcess = typeof SpawnClaudeCodeProcess.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type SpawnClaudeCodeProcessEncoded = typeof SpawnClaudeCodeProcess.Encoded;
