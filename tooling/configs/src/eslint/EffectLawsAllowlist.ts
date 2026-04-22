/**
 * Effect laws allowlist helpers used by repository ESLint rules.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { thunkFalse } from "@beep/utils";
import { identity, pipe, Result } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import {
  ALLOWLIST_PATH,
  areLookupKeysEquivalent,
  decodeAllowlistCheckInput,
  decodeAllowlistSnapshot,
  EffectLawsAllowlistLookupKey,
  EffectLawsAllowlistSnapshot,
  toSnapshotDecodeDiagnostics,
} from "../internal/eslint/EffectLawsAllowlistSchemas.ts";
import { ALLOWLIST_SNAPSHOT } from "../internal/eslint/generated/EffectLawsAllowlistSnapshot.ts";
import { normalizePath } from "./Shared.ts";

const fallbackAllowlistPath = normalizePath(`${process.cwd()}/${ALLOWLIST_PATH}`);

const decodedAllowlistSnapshot = pipe(
  Result.try({
    try: () => decodeAllowlistSnapshot(ALLOWLIST_SNAPSHOT),
    catch: toSnapshotDecodeDiagnostics,
  }),
  Result.match({
    onFailure: (diagnostics) =>
      new EffectLawsAllowlistSnapshot({
        path: fallbackAllowlistPath,
        diagnostics,
      }),
    onSuccess: identity,
  })
);

/**
 * Reset memoized allowlist state.
 *
 * Snapshot-backed runtime has no mutable cache, so this is a compatibility no-op.
 *
 * @returns `undefined` because snapshot-backed runtime has no mutable cache.
 * @example
 * ```ts
 * import { resetAllowlistCache } from "@beep/repo-configs/eslint/EffectLawsAllowlist"
 * resetAllowlistCache()
 * ```
 * @category utilities
 * @since 0.0.0
 */
export const resetAllowlistCache = (): void => undefined;

/**
 * Retrieve allowlist decode diagnostics.
 *
 * @returns Read-only diagnostic messages produced while loading/decoding the allowlist document.
 * @example
 * ```ts
 * import { getAllowlistDiagnostics } from "@beep/repo-configs/eslint/EffectLawsAllowlist"
 * const diagnostics = getAllowlistDiagnostics()
 * void diagnostics
 * ```
 * @category utilities
 * @since 0.0.0
 */
export const getAllowlistDiagnostics = (): ReadonlyArray<string> => decodedAllowlistSnapshot.diagnostics;

/**
 * Check whether a normalized violation key appears in the effect-laws allowlist.
 *
 * @param input - Candidate violation identity payload.
 * @returns `true` when an allowlist entry exactly matches the normalized lookup key.
 * @example
 * ```ts
 * import { isViolationAllowlisted } from "@beep/repo-configs/eslint/EffectLawsAllowlist"
 * const allowlisted = isViolationAllowlisted({
 *   ruleId: "effect/no-native-runtime",
 *   filePath: "tooling/cli/src/commands/Lint/index.ts",
 *   kind: "error",
 * })
 * void allowlisted
 * ```
 * @category utilities
 * @since 0.0.0
 */
export const isViolationAllowlisted = (input: unknown): boolean =>
  pipe(
    decodeAllowlistCheckInput(input),
    O.match({
      onNone: thunkFalse,
      onSome: (normalizedInput) => {
        const normalizedLookupKey = new EffectLawsAllowlistLookupKey({
          rule: normalizedInput.ruleId,
          file: normalizePath(normalizedInput.filePath),
          kind: normalizedInput.kind,
        });

        return A.some(decodedAllowlistSnapshot.entries, (entry) =>
          areLookupKeysEquivalent(
            normalizedLookupKey,
            new EffectLawsAllowlistLookupKey({
              rule: entry.rule,
              file: normalizePath(entry.file),
              kind: entry.kind,
            })
          )
        );
      },
    })
  );
