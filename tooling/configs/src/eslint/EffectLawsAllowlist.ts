import { thunkFalse } from "@beep/utils";
import { pipe, Result } from "effect";
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
    onSuccess: (snapshot) => snapshot,
  })
);

/**
 * Reset memoized allowlist state.
 *
 * Snapshot-backed runtime has no mutable cache, so this is a compatibility no-op.
 *
 * @returns `undefined` because snapshot-backed runtime has no mutable cache.
 * @since 0.0.0
 * @category Utility
 */
export const resetAllowlistCache = (): void => undefined;

/**
 * Retrieve allowlist decode diagnostics.
 *
 * @returns Read-only diagnostic messages produced while loading/decoding the allowlist document.
 * @since 0.0.0
 * @category Utility
 */
export const getAllowlistDiagnostics = (): ReadonlyArray<string> => decodedAllowlistSnapshot.diagnostics;

/**
 * Check whether a normalized violation key appears in the effect-laws allowlist.
 *
 * @param input - Candidate violation identity payload.
 * @returns `true` when an allowlist entry exactly matches the normalized lookup key.
 * @since 0.0.0
 * @category Utility
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
              file: entry.file,
              kind: entry.kind,
            })
          )
        );
      },
    })
  );
