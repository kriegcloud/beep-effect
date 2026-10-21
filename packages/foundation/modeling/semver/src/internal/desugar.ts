// Desugaring of range sugar (caret, tilde, X-ranges, hyphen ranges) into
// primitive comparator sets, matching node-semver semantics. Operates on
// structural parts; the `Range` schema materializes classes from the result.

import { $SemverId } from "@beep/identity/packages";
import { dual } from "effect/Function";
import * as S from "effect/Schema";
import { ComparatorParts, VersionParts, versionConstructor } from "./order.ts";
import type { ComparatorOperator } from "./order.ts";

const $I = $SemverId.create("internal/desugar");

/**
 * A partially specified version as written in range sugar (`1.x`, `1.2`,
 * `*`). `null` in `major`/`minor`/`patch` marks an unspecified (wildcard)
 * component; `prerelease`/`build` are only populated when the fully
 * specified suffix of a partial version carries them.
 *
 * **Example** (Recognize a wildcard component)
 *
 * ```ts
 * import * as S from "effect/Schema";
 * import { PartialParts } from "@beep/semver/internal/desugar";
 *
 * S.is(PartialParts)({ major: 1, minor: null, patch: null, prerelease: [], build: [] }); // true
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const PartialParts = S.Struct({
  ...VersionParts.fields,
  major: S.NullOr(S.Finite).pipe(
    $I.annoteKey("PartialParts.major", {
      description: "The numeric major component, or null for a wildcard or omission.",
    })
  ),
  minor: S.NullOr(S.Finite).pipe(
    $I.annoteKey("PartialParts.minor", {
      description: "The numeric minor component, or null for a wildcard or omission.",
    })
  ),
  patch: S.NullOr(S.Finite).pipe(
    $I.annoteKey("PartialParts.patch", {
      description: "The numeric patch component, or null for a wildcard or omission.",
    })
  ),
}).pipe(
  $I.annoteSchema("PartialParts", {
    description:
      "Plain partial version parts preserving numeric and null intermediate components for range desugaring.",
  })
);

/**
 * The partial version data described by {@link PartialParts}.
 *
 * @category type-level
 * @since 0.0.0
 */
export type PartialParts = typeof PartialParts.Type;

const sv = versionConstructor((fields): VersionParts => VersionParts.make(fields));

const comp: {
  (operator: ComparatorOperator, version: VersionParts): ComparatorParts;
  (version: VersionParts): (operator: ComparatorOperator) => ComparatorParts;
} = dual(
  2,
  (operator: ComparatorOperator, version: VersionParts): ComparatorParts => ComparatorParts.make({ operator, version })
);

// `>=0.0.0`: every stable version, the expansion of a wildcard major.
const anyStable = (): ReadonlyArray<ComparatorParts> => [comp(">=", sv(0, 0, 0))];

/**
 * Desugar a tilde range (`~1.2.3`, `~1.2`, `~1`) into a `>=`/`<` comparator
 * pair that allows patch-level changes when a minor version is specified,
 * and minor-level changes when it is not.
 *
 * **Example** (Expand a patch-compatible tilde range)
 *
 * ```ts
 * import { desugarTilde } from "@beep/semver/internal/desugar";
 *
 * const comparators = desugarTilde({ major: 1, minor: 2, patch: 3, prerelease: [], build: [] });
 * const bounds = comparators.map(({ operator, version }) =>
 *   `${operator}${version.major}.${version.minor}.${version.patch}`
 * ).join(" ");
 * console.log(bounds); // >=1.2.3 <1.3.0
 * ```
 *
 * @category parsing
 * @since 0.0.0
 */
export const desugarTilde = (p: PartialParts): ReadonlyArray<ComparatorParts> => {
  if (p.major === null) return anyStable();
  const major = p.major;
  const minor = p.minor;
  const patch = p.patch ?? 0;

  if (minor === null) {
    // ~1 -> >=1.0.0 <2.0.0-0
    return [comp(">=", sv(major, 0, 0)), comp("<", sv(major + 1, 0, 0, [0]))];
  }

  // ~1.2.3 -> >=1.2.3 <1.3.0-0
  // ~1.2 -> >=1.2.0 <1.3.0-0
  return [comp(">=", sv(major, minor, patch, p.prerelease)), comp("<", sv(major, minor + 1, 0, [0]))];
};

/**
 * Desugar a caret range (`^1.2.3`) into a `>=`/`<` comparator pair per npm's
 * compatibility rules: changes are allowed in the rightmost of
 * major/minor/patch that is non-zero (so `^0.2.3` allows patch bumps only,
 * `^0.0.3` allows none).
 *
 * **Example** (Expand a caret range below version one)
 *
 * ```ts
 * import { desugarCaret } from "@beep/semver/internal/desugar";
 *
 * const comparators = desugarCaret({ major: 0, minor: 2, patch: 3, prerelease: [], build: [] });
 * const bounds = comparators.map(({ operator, version }) =>
 *   `${operator}${version.major}.${version.minor}.${version.patch}`
 * ).join(" ");
 * console.log(bounds); // >=0.2.3 <0.3.0
 * ```
 *
 * @category parsing
 * @since 0.0.0
 */
export const desugarCaret = (p: PartialParts): ReadonlyArray<ComparatorParts> => {
  if (p.major === null) return anyStable();
  const major = p.major;
  const minor = p.minor;
  const patch = p.patch;

  const lower = minor === null ? sv(major, 0, 0) : sv(major, minor, patch ?? 0, p.prerelease);

  if (major !== 0) {
    // ^1.2.3 -> >=1.2.3 <2.0.0-0
    return [comp(">=", lower), comp("<", sv(major + 1, 0, 0, [0]))];
  }

  // major is 0
  if (minor === null) {
    // ^0.x -> >=0.0.0 <1.0.0-0
    return [comp(">=", lower), comp("<", sv(1, 0, 0, [0]))];
  }

  if (minor !== 0) {
    // ^0.2.3 -> >=0.2.3 <0.3.0-0
    return [comp(">=", lower), comp("<", sv(0, minor + 1, 0, [0]))];
  }

  // major is 0, minor is 0
  if (patch === null) {
    // ^0.0.x or ^0.0 -> >=0.0.0 <0.1.0-0
    return [comp(">=", lower), comp("<", sv(0, 1, 0, [0]))];
  }

  if (patch !== 0) {
    // ^0.0.3 -> >=0.0.3 <0.0.4-0
    return [comp(">=", lower), comp("<", sv(0, 0, patch + 1, [0]))];
  }

  // ^0.0.0 -> >=0.0.0 <0.0.1-0
  return [comp(">=", lower), comp("<", sv(0, 0, 1, [0]))];
};

// `*` under an operator: strict comparisons against * admit no version;
// every other operator admits every stable version.
const desugarAnyMajor = (operator: ComparatorOperator | null): ReadonlyArray<ComparatorParts> =>
  operator === "<" || operator === ">" ? [comp("<", sv(0, 0, 0, [0]))] : anyStable();

// The `-0` prerelease of a core version: the lowest version of that core.
const lowest = (v: VersionParts): VersionParts => sv(v.major, v.minor, v.patch, [0]);

// Expansion of a partial wildcard (`1.x`, `1.2.x`) per operator, given the
// wildcard's floor (`1.0.0`, `1.2.0`) and the next core above it (`2.0.0`,
// `1.3.0`).
const wildcardExpansions: Readonly<
  Record<ComparatorOperator, (floor: VersionParts, ceiling: VersionParts) => ReadonlyArray<ComparatorParts>>
> = {
  // 1.x -> >=1.0.0 <2.0.0-0
  "=": (floor, ceiling) => [comp(">=", floor), comp("<", lowest(ceiling))],
  // >1.x -> >=2.0.0
  ">": (_floor, ceiling) => [comp(">=", ceiling)],
  // >=1.x -> >=1.0.0
  ">=": (floor) => [comp(">=", floor)],
  // <1.x -> <1.0.0-0
  "<": (floor) => [comp("<", lowest(floor))],
  // <=1.x -> <2.0.0-0
  "<=": (_floor, ceiling) => [comp("<", lowest(ceiling))],
};

/**
 * Desugar an X-range (`1.x`, `1.2.x`, `*`) or a fully-specified
 * operator-prefixed version into its equivalent comparator set. A fully
 * specified version with no operator (or `=`) desugars to a single `=`
 * comparator; wildcards expand to the bounding `>=`/`<` pair implied by the
 * given `operator`.
 *
 * **Example** (Expand a wildcard minor version)
 *
 * ```ts
 * import { desugarXRange } from "@beep/semver/internal/desugar";
 *
 * const comparators = desugarXRange(null, { major: 1, minor: null, patch: null, prerelease: [], build: [] });
 * const bounds = comparators.map(({ operator, version }) =>
 *   `${operator}${version.major}.${version.minor}.${version.patch}`
 * ).join(" ");
 * console.log(bounds); // >=1.0.0 <2.0.0
 * ```
 *
 * @category parsing
 * @since 0.0.0
 */
export const desugarXRange: {
  (p: PartialParts): (operator: ComparatorOperator | null) => ReadonlyArray<ComparatorParts>;
  (operator: ComparatorOperator | null, p: PartialParts): ReadonlyArray<ComparatorParts>;
} = dual(2, (operator: ComparatorOperator | null, p: PartialParts): ReadonlyArray<ComparatorParts> => {
  const { major, minor, patch } = p;

  // Fully specified (no wildcards): a bare version is an exact match.
  if (major !== null && minor !== null && patch !== null) {
    return [comp(operator ?? "=", sv(major, minor, patch, p.prerelease, p.build))];
  }

  if (major === null) return desugarAnyMajor(operator);

  // 1.x or 1.*: floor 1.0.0, ceiling 2.0.0; 1.2.x: floor 1.2.0, ceiling 1.3.0.
  const expand = wildcardExpansions[operator ?? "="];
  return minor === null
    ? expand(sv(major, 0, 0), sv(major + 1, 0, 0))
    : expand(sv(major, minor, 0), sv(major, minor + 1, 0));
});

// Lower bound of a hyphen range: `>=` the partial version with unspecified
// components zeroed; none when the lower side is `*`.
const hyphenFloor = (lower: PartialParts): ReadonlyArray<ComparatorParts> => {
  const { major, minor, patch } = lower;
  if (major === null) return [];
  if (minor === null) return [comp(">=", sv(major, 0, 0))];
  return [comp(">=", patch === null ? sv(major, minor, 0) : sv(major, minor, patch, lower.prerelease))];
};

// Upper bound of a hyphen range: `<=` a fully specified version, or `<` the
// next unspecified component (`2.3` -> `<2.4.0-0`); none when it is `*`.
const hyphenCeiling = (upper: PartialParts): ReadonlyArray<ComparatorParts> => {
  const { major, minor, patch } = upper;
  if (major === null) return [];
  if (minor === null) return [comp("<", sv(major + 1, 0, 0, [0]))];
  return [
    patch === null ? comp("<", sv(major, minor + 1, 0, [0])) : comp("<=", sv(major, minor, patch, upper.prerelease)),
  ];
};

/**
 * Desugar a hyphen range (`1.2.3 - 2.3.4`) into a comparator pair: `>=` the
 * lower bound and, for the upper bound, `<=` when it is fully specified or
 * `<` the next unspecified component when it is partial (`1.2.3 - 2.3` →
 * `>=1.2.3 <2.4.0-0`).
 *
 * **Example** (Expand a hyphen range with a partial upper bound)
 *
 * ```ts
 * import { desugarHyphen } from "@beep/semver/internal/desugar";
 *
 * const comparators = desugarHyphen(
 *   { major: 1, minor: 2, patch: 3, prerelease: [], build: [] },
 *   { major: 2, minor: 3, patch: null, prerelease: [], build: [] }
 * );
 * const bounds = comparators.map(({ operator, version }) =>
 *   `${operator}${version.major}.${version.minor}.${version.patch}`
 * ).join(" ");
 * console.log(bounds); // >=1.2.3 <2.4.0
 * ```
 *
 * @category parsing
 * @since 0.0.0
 */
export const desugarHyphen: {
  (upper: PartialParts): (lower: PartialParts) => ReadonlyArray<ComparatorParts>;
  (lower: PartialParts, upper: PartialParts): ReadonlyArray<ComparatorParts>;
} = dual(2, (lower: PartialParts, upper: PartialParts): ReadonlyArray<ComparatorParts> => {
  const comparators = [...hyphenFloor(lower), ...hyphenCeiling(upper)];
  // `* - *` bounds nothing: every stable version.
  return comparators.length === 0 ? anyStable() : comparators;
});
