import { $AiSdkId } from "@beep/identity/packages";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";

const $I = $AiSdkId.create("core/Schema/Runtime");

/**
 * @since 0.0.0
 */
export type AbortControllerLike = {
  signal: unknown;
} & {};

/**
 * @since 0.0.0
 */
export const AbortController = S.declare((_: unknown): _ is AbortControllerLike => P.isObject(_) && "signal" in _).pipe(
  S.annotate(
    $I.annote("AbortController", {
      description: "Schema for AbortController.",
      jsonSchema: {},
    })
  )
);

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
export const StderrCallback = S.declare((_: unknown): _ is (data: string) => void => true).pipe(
  S.annotate(
    $I.annote("StderrCallback", {
      description: "Schema for StderrCallback.",
      jsonSchema: {},
    })
  )
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
export const SpawnedProcess = S.declare((_: unknown): _ is unknown => true).pipe(
  S.annotate(
    $I.annote("SpawnedProcess", {
      description: "Schema for SpawnedProcess.",
      jsonSchema: {},
    })
  )
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
export const SpawnClaudeCodeProcess = S.declare((_: unknown): _ is (options: unknown) => SpawnedProcess => true).pipe(
  S.annotate(
    $I.annote("SpawnClaudeCodeProcess", {
      description: "Schema for SpawnClaudeCodeProcess.",
      jsonSchema: {},
    })
  )
);

/**
 * @since 0.0.0
 */
export type SpawnClaudeCodeProcess = typeof SpawnClaudeCodeProcess.Type;
/**
 * @since 0.0.0
 */
export type SpawnClaudeCodeProcessEncoded = typeof SpawnClaudeCodeProcess.Encoded;
