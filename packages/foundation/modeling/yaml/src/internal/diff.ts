// Character-level text diffing shared by the formatter and modifier: turns
// (original, modified) into minimal raw edit records. The facade
// materializes public `YamlEdit` instances from these.

import { $YamlId } from "@beep/identity/packages";
import * as A from "effect/Array";
import * as S from "effect/Schema";

const $I = $YamlId.create("internal/diff");

/**
 * A raw text-edit record: replace `[offset, offset + length)` with `content`.
 *
 * **Example** (Validate a source replacement)
 *
 * ```ts
 * import * as S from "effect/Schema"
 * import { RawEdit } from "@beep/yaml/internal/diff"
 *
 * console.log(S.is(RawEdit)({ offset: 0, length: 3, content: "new" })) // true
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class RawEdit extends S.Opaque<RawEdit, { readonly brand: unique symbol }>()(
  S.Struct({
    offset: S.Finite.pipe(
      $I.annoteKey("RawEdit.offset", { description: "The source offset where replacement begins." })
    ),
    length: S.Finite.pipe(
      $I.annoteKey("RawEdit.length", { description: "The number of source characters to replace." })
    ),
    content: S.String.pipe($I.annoteKey("RawEdit.content", { description: "The replacement text." })),
  }).pipe(
    $I.annoteSchema("RawEdit", {
      description: "A plain text edit replacing a source span before facade materialization.",
    })
  )
) {}

/**
 * Compute edits by diffing two strings character by character.
 *
 * **Details**
 *
 * Walks both strings from each end inward to find the common prefix and
 * suffix, then emits a single edit covering the changed region in the
 * middle. This is sufficient because both strings derive from the same AST
 * and share structural skeleton — typically only whitespace and values differ.
 *
 * For more granular edits (multiple disjoint changes), a line-level pass
 * splits the middle region into per-line edits when possible.
 *
 * This relies on the assumption that both strings share an identical
 * structural skeleton (they were produced from the same AST); a simple
 * prefix/suffix match is sufficient and a full Myers diff is unnecessary.
 *
 * **Example** (Inspect a changed scalar and unchanged text)
 *
 * ```ts
 * import { computeEdits } from "@beep/yaml/internal/diff"
 *
 * console.log(JSON.stringify(computeEdits("name: Ada", "name: Eva"))) // [{"offset":6,"length":2,"content":"Ev"}]
 * console.log(computeEdits("name: Ada", "name: Ada").length) // 0
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export function computeEdits(original: string, ...[modified]: [modified: string]): ReadonlyArray<RawEdit> {
  if (original === modified) return [];

  const minLen = Math.min(original.length, modified.length);
  const prefixLen = commonPrefixLength(original, modified, minLen);
  // Common suffix, not overlapping with the prefix.
  const suffixLen = commonSuffixLength(original, modified, minLen - prefixLen);

  const origStart = prefixLen;
  const origEnd = original.length - suffixLen;
  const modStart = prefixLen;
  const modEnd = modified.length - suffixLen;

  // Try to split into line-level edits for better granularity
  const origLines = original.substring(origStart, origEnd).split("\n");
  const modLines = modified.substring(modStart, modEnd).split("\n");

  if (origLines.length === modLines.length && origLines.length > 1) {
    return lineEdits(origLines, modLines, origStart);
  }

  // Fallback: single edit covering the entire changed region
  return [
    RawEdit.make({
      offset: origStart,
      length: origEnd - origStart,
      content: modified.substring(modStart, modEnd),
    }),
  ];
}

/** Length of the common prefix, up to `limit`. */
const commonPrefixLength = (original: string, modified: string, limit: number): number => {
  let prefixLen = 0;
  while (prefixLen < limit && original[prefixLen] === modified[prefixLen]) prefixLen++;
  return prefixLen;
};

/** Length of the common suffix, up to `limit`. */
const commonSuffixLength = (original: string, modified: string, limit: number): number => {
  let suffixLen = 0;
  while (suffixLen < limit && original[original.length - 1 - suffixLen] === modified[modified.length - 1 - suffixLen]) {
    suffixLen++;
  }
  return suffixLen;
};

/** Same number of lines — emit per-line edits for changed lines only. */
const lineEdits = (
  origLines: ReadonlyArray<string>,
  modLines: ReadonlyArray<string>,
  origStart: number
): ReadonlyArray<RawEdit> => {
  const edits: RawEdit[] = [];
  let offset = origStart;
  for (const [origLine, modLine] of A.zip(origLines, modLines)) {
    if (origLine !== modLine) {
      edits.push(
        RawEdit.make({
          offset,
          length: origLine.length,
          content: modLine,
        })
      );
    }
    // +1 for the \n delimiter. For CRLF input, split("\n") leaves \r in each
    // element so origLine.length already includes it; the +1 accounts for
    // the \n only. This is correct because computeEdits operates on text
    // produced by the stringifier which always uses LF endings.
    offset += origLine.length + 1;
  }
  return edits;
};
