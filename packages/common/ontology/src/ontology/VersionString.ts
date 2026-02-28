/**
 * Version string builders and validation schemas for ontology definitions.
 *
 * @since 0.0.0
 * @module @beep/ontology/ontology/VersionString
 */
import { $OntologyId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $OntologyId.create("ontology/VersionString");

/**
 * Error thrown when any version component is invalid.
 *
 * @since 0.0.0
 * @category errors
 */
export class InvalidVersionPartError extends S.TaggedErrorClass<InvalidVersionPartError>($I`InvalidVersionPartError`)(
  "InvalidVersionPartError",
  {
    input: S.Unknown,
    cause: S.optionalKey(S.DefectWithStack),
  },
  $I.annote("InvalidVersionPartError", {
    description: "Raised when major, minor, or patch version parts are invalid for an ontology version string.",
  })
) {}

const VersionPart = S.Int.pipe(S.check(S.isGreaterThanOrEqualTo(0))).annotate(
  $I.annote("VersionPart", {
    description: "A single non-negative integer version component.",
  })
);

interface VersionStringParts<Major extends number, Minor extends number, Patch extends number> {
  readonly major: Major;
  readonly minor: Minor;
  readonly patch: Patch;
}

/**
 * Parsed major/minor/patch components validated as non-negative integers.
 *
 * @since 0.0.0
 * @category models
 */
export class ValidVersionParts extends S.Class<ValidVersionParts>($I`ValidVersionParts`)(
  {
    major: VersionPart,
    minor: VersionPart,
    patch: VersionPart,
  },
  $I.annote("ValidVersionParts", {
    description: "Validated semantic version components for ontology version construction.",
  })
) {}

const isValidVersionParts = S.is(ValidVersionParts);

/**
 * Build a version string schema for fixed major/minor/patch values.
 *
 * @since 0.0.0
 * @category constructors
 */
export function VersionString<const Major extends number, const Minor extends number, const Patch extends number>(
  parts: VersionStringParts<Major, Minor, Patch>
) {
  if (!isValidVersionParts(parts)) {
    throw new InvalidVersionPartError({
      input: parts,
    });
  }

  return S.TemplateLiteral([`${parts.major}`, ".", `${parts.minor}`, ".", `${parts.patch}`]).annotate(
    $I.annote("VersionString", {
      description: "Template-literal schema constrained to an exact major.minor.patch version.",
    })
  );
}

/**
 * Type-level representation for a semantic version string.
 *
 * @since 0.0.0
 * @category models
 */
export type VersionString<
  Major extends number,
  Minor extends number,
  Patch extends number,
> = `${Major}.${Minor}.${Patch}`;
