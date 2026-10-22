// Ported from std-osc8 v0.2.0 (MIT, C. Spencer Beggs), src/semver.ts. Pure: no process reads.
/**
 * Permissive version comparison and the packed terminal version decoders.
 *
 * **Details**
 *
 * `compareSemver` compares `MAJOR[.MINOR[.PATCH]]` prefixes and treats malformed input as equal; the VTE and Konsole
 * decoders unpack the integer each terminal exports into a dotted version.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import * as A from "effect/Array";
import { dual } from "effect/Function";
import * as O from "effect/Option";

const SEMVER_RE = /^(\d+)(?:\.(\d+))?(?:\.(\d+))?/;

/** The numeric `[major, minor, patch]` prefix of a version, or `None` when it does not start with a number. */
const components = (version: string): O.Option<ReadonlyArray<number>> =>
  O.map(O.fromNullishOr(SEMVER_RE.exec(version)), (match) =>
    A.map([match[1], match[2], match[3]], (part) => Number(part ?? 0))
  );

/**
 * Compare semver-like strings (`MAJOR[.MINOR[.PATCH]]`) by their numeric components.
 *
 * **Details**
 *
 * Prerelease tags (e.g. `-beta`, `-rc.1`) are stripped and ignored.
 *
 * **Gotchas**
 *
 * Malformed inputs are treated as equal — this is a permissive helper, not a strict parser.
 *
 * **Example** (Compare releases and malformed input)
 *
 * ```ts
 * import { compareSemver } from "@beep/runtime-env/internal/osc8/semver"
 *
 * console.log(compareSemver("3.1.0", "3.0.0")) // 1
 * console.log(compareSemver("3.1.0-beta", "3.1.0")) // 0
 * console.log(compareSemver("unknown", "3.1.0")) // 0
 * ```
 *
 * @returns Negative if `a` is less than `b`, positive if `a` is greater than `b`, 0 if equal or malformed.
 * @category utilities
 * @since 0.0.0
 */
export const compareSemver: {
  (b: string): (a: string) => number;
  (a: string, b: string): number;
} = dual(2, (a: string, b: string): number =>
  O.getOrElse(
    O.flatMap(O.all([components(a), components(b)]), ([aa, bb]) =>
      A.findFirst(
        A.zipWith(aa, bb, (x, y) => x - y),
        (diff) => diff !== 0
      )
    ),
    () => 0
  )
);

/**
 * Decode a packed `VTE_VERSION` environment value into a dotted version.
 *
 * **Details**
 *
 * VTE encodes versions as `MAJOR * 10000 + MINOR * 100 + PATCH`. So `5202` means `0.52.2`.
 * Missing, empty, non-numeric or negative values are `None`; a numeric prefix is accepted.
 *
 * **Example** (Decode a VTE version)
 *
 * ```ts
 * import { parseVteVersion } from "@beep/runtime-env/internal/osc8/semver"
 * import * as O from "effect/Option"
 *
 * console.log(O.getOrNull(parseVteVersion("5202"))) // 0.52.2
 * console.log(O.isNone(parseVteVersion(undefined))) // true
 * ```
 *
 * @category parsing
 * @since 0.0.0
 */
export const parseVteVersion = (raw: string | undefined): O.Option<string> =>
  O.map(
    O.filter(
      O.map(
        O.filter(O.fromUndefinedOr(raw), (value) => value !== ""),
        (value) => Number.parseInt(value, 10)
      ),
      (n) => Number.isFinite(n) && n >= 0
    ),
    (n) => `${Math.floor(n / 10000)}.${Math.floor((n % 10000) / 100)}.${n % 100}`
  );

/**
 * Decode a packed `KONSOLE_VERSION` environment value into a dotted calendar version.
 *
 * **Details**
 *
 * Konsole uses calendar versioning packed identically to VTE: `YY * 10000 + MM * 100 + PATCH`.
 *
 * **Example** (Decode a Konsole calendar version)
 *
 * ```ts
 * import { parseKonsoleVersion } from "@beep/runtime-env/internal/osc8/semver"
 * import * as O from "effect/Option"
 *
 * console.log(O.getOrNull(parseKonsoleVersion("220400"))) // 22.4.0
 * ```
 *
 * @see {@link parseVteVersion} for the shared parser and its permissive input handling.
 * @category parsing
 * @since 0.0.0
 */
export const parseKonsoleVersion = parseVteVersion;
