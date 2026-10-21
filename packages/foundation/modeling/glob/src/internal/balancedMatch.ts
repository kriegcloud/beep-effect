// Ported from balanced-match@4.0.4 (https://github.com/juliangruber/balanced-match)
// Copyright (c) 2013 Julian Gruber <julian@juliangruber.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
// of the Software, and to permit persons to whom the Software is furnished to do
// so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
//
// Port notes: adapted to house TypeScript strictness (explicit result typing,
// single-variable declarations). Fully ITERATIVE — this module has NO recursion
// surface and therefore NO depth guard. Do not add one.

import { $GlobId } from "@beep/identity/packages";
import { dual } from "effect/Function";
import * as S from "effect/Schema";

const $I = $GlobId.create("internal/balancedMatch");

/**
 * Describes the balanced section found by {@link balanced}.
 *
 * **Details**
 *
 * Delimiter offsets identify the opening and closing delimiters; `pre`, `body`,
 * and `post` contain the text before, inside, and after the section.
 *
 * **Example** (Read a balanced section)
 *
 * ```ts
 * import { BalancedResult } from "@beep/glob/internal/balancedMatch"
 *
 * const section = BalancedResult.make({ start: 3, end: 9, pre: "pre", body: "a{b}c", post: "post" })
 * console.log(section.body) // a{b}c
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class BalancedResult extends S.Opaque<BalancedResult, { readonly brand: unique symbol }>()(
  S.Struct({
    body: S.String.pipe(
      $I.annoteKey("BalancedResult.body", { description: "The text between the balanced delimiters." })
    ),
    end: S.Finite.check(S.isInt(), S.isGreaterThanOrEqualTo(0)).pipe(
      $I.annoteKey("BalancedResult.end", { description: "The offset of the closing delimiter." })
    ),
    post: S.String.pipe($I.annoteKey("BalancedResult.post", { description: "The text after the closing delimiter." })),
    pre: S.String.pipe($I.annoteKey("BalancedResult.pre", { description: "The text before the opening delimiter." })),
    start: S.Finite.check(S.isInt(), S.isGreaterThanOrEqualTo(0)).pipe(
      $I.annoteKey("BalancedResult.start", { description: "The offset of the opening delimiter." })
    ),
  }).pipe(
    $I.annoteSchema("BalancedResult", {
      description: "The first balanced delimiter section of a string, with the text around and inside it.",
    })
  )
) {}

const maybeMatch: {
  (reg: RegExp, str: string): string | null;
  (str: string): (reg: RegExp) => string | null;
} = dual(2, (reg: RegExp, str: string): string | null => {
  const m = str.match(reg);
  return m !== null ? m[0] : null;
});

/**
 * Finds the first balanced `a ... b` section of `str`, including its delimiter
 * offsets and the text before, inside and after it.
 *
 * **Details**
 *
 * Returns `false` when no balanced pair exists.
 *
 * **Example** (Extract a nested brace body)
 *
 * ```ts
 * import { balanced } from "@beep/glob/internal/balancedMatch"
 *
 * const result = balanced("{", "}", "pre{a{b}c}post")
 * console.log(result === false ? false : result.body) // a{b}c
 * console.log(balanced("{", "}", "plain")) // false
 * ```
 *
 * @category parsing
 * @since 0.0.0
 */
export const balanced: {
  (b: string | RegExp, str: string): (a: string | RegExp) => BalancedResult | false;
  (a: string | RegExp, b: string | RegExp, str: string): BalancedResult | false;
} = dual(3, (a: string | RegExp, b: string | RegExp, str: string): BalancedResult | false => {
  const ma = a instanceof RegExp ? maybeMatch(a, str) : a;
  const mb = b instanceof RegExp ? maybeMatch(b, str) : b;

  if (ma === null || mb === null) return false;
  const r = range(ma, mb, str);
  if (r === undefined) return false;

  return BalancedResult.make({
    start: r[0],
    end: r[1],
    pre: str.slice(0, r[0]),
    body: str.slice(r[0] + ma.length, r[1]),
    post: str.slice(r[1] + mb.length),
  });
});

/**
 * Locates the delimiter offsets of the first balanced `a ... b` pair in `str`.
 *
 * **Details**
 *
 * Returns `undefined` when no balanced pair exists.
 *
 * **Example** (Locate opening and closing braces)
 *
 * ```ts
 * import { range } from "@beep/glob/internal/balancedMatch"
 *
 * console.log(range("{", "}", "a{b}c")?.join(",")) // 1,3
 * console.log(range("{", "}", "plain")) // undefined
 * ```
 *
 * @category parsing
 * @since 0.0.0
 */
export const range: {
  (b: string, str: string): (a: string) => undefined | [number, number];
  (a: string, b: string, str: string): undefined | [number, number];
} = dual(3, (a: string, b: string, str: string): undefined | [number, number] => {
  const ai = str.indexOf(a);
  const bi = str.indexOf(b, ai + 1);
  if (ai < 0 || bi <= 0) return undefined;
  if (a === b) return [ai, bi];
  return scanRange(a, b, str, ai, bi);
});

// Mutable cursor state of one balanced-range scan.
interface RangeScan {
  ai: number;
  readonly begs: Array<number>;
  bi: number;
  i: number;
  left: number;
  result: undefined | [number, number];
  right: number | undefined;
}

const scanRange = (a: string, b: string, str: string, ai: number, bi: number): undefined | [number, number] => {
  const scan: RangeScan = { ai, bi, i: ai, left: str.length, right: undefined, result: undefined, begs: [] };
  while (scan.i >= 0 && scan.result === undefined) rangeStep(scan, a, b, str);
  return scan.begs.length !== 0 && scan.right !== undefined ? [scan.left, scan.right] : scan.result;
};

const rangeStep = (scan: RangeScan, a: string, b: string, str: string): void => {
  if (scan.i === scan.ai) {
    scan.begs.push(scan.i);
    scan.ai = str.indexOf(a, scan.i + 1);
  } else if (scan.begs.length === 1) {
    // This branch has exactly one opening offset.
    for (const r of scan.begs.splice(-1)) scan.result = [r, scan.bi];
  } else {
    closeInnerPair(scan, b, str);
  }
  scan.i = scan.ai < scan.bi && scan.ai >= 0 ? scan.ai : scan.bi;
};

const closeInnerPair = (scan: RangeScan, b: string, str: string): void => {
  const beg = scan.begs.pop();
  if (beg !== undefined && beg < scan.left) {
    scan.left = beg;
    scan.right = scan.bi;
  }
  scan.bi = str.indexOf(b, scan.i + 1);
};
