/**
 * @module AllowedClasses
 * @description Discriminated union for allowed CSS classes configuration
 * @since 1.0.0
 */
import { $SchemaId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { RegExpPattern } from "./regexp-pattern";

const $I = $SchemaId.create("integrations/html/sanitize/allowed-classes");

// ============================================================================
// Class Pattern (String or RegExp)
// ============================================================================

/**
 * A class pattern - either an exact class name or a regex pattern
 *
 * @since 1.0.0
 * @category Schema
 * @example
 * ```typescript
 * // Exact match
 * "btn-primary"
 *
 * // Pattern match
 * { source: "^bg-", flags: "" }
 * ```
 */
export const ClassPattern = S.Union(
  S.String.annotations({ description: "Exact class name match" }),
  RegExpPattern.pipe(S.annotations({ description: "Class name pattern match" }))
).annotations(
  $I.annotations("ClassPattern", {
    description: "A class pattern - exact string or regex",
  })
);

export type ClassPattern = S.Schema.Type<typeof ClassPattern>;

// ============================================================================
// AllowedClassesForTag Discriminated Union
// ============================================================================

/**
 * Allow all classes on this tag
 * @since 1.0.0
 * @category Variants
 */
const AllClasses = S.TaggedStruct("AllClasses", {}).annotations({
  identifier: "AllowedClassesForTag.AllClasses",
  description: "Allow all classes on this tag",
});

/**
 * Allow specific classes (exact or pattern)
 * @since 1.0.0
 * @category Variants
 */
const SpecificClasses = S.TaggedStruct("SpecificClasses", {
  classes: S.Array(ClassPattern).annotations({
    description: "Array of allowed class patterns (exact strings or regex)",
  }),
}).annotations({
  identifier: "AllowedClassesForTag.SpecificClasses",
  description: "Allow only specific classes (exact or pattern)",
});

// ============================================================================
// Type Aliases
// ============================================================================

export type AllClassesType = {
  readonly _tag: "AllClasses";
};

export type SpecificClassesType = {
  readonly _tag: "SpecificClasses";
  readonly classes: ReadonlyArray<ClassPattern>;
};

// ============================================================================
// Union Schema with Factory Functions
// ============================================================================

const _AllowedClassesForTag = S.Union(AllClasses, SpecificClasses).annotations(
  $I.annotations("AllowedClassesForTag", {
    title: "Allowed Classes for Tag Configuration",
    description: "Specifies which CSS classes are permitted on a single tag",
  })
);

/**
 * AllowedClassesForTag configuration
 *
 * - AllClasses: Allow all classes on this tag
 * - SpecificClasses: Allow only specific classes (exact or pattern)
 *
 * @since 1.0.0
 * @category Schema
 * @example
 * ```typescript
 * import { AllowedClassesForTag } from "@beep/schema/integrations/html";
 *
 * AllowedClassesForTag.all();
 * AllowedClassesForTag.specific(["btn", "btn-primary", { source: "^bg-" }]);
 * ```
 */
export const AllowedClassesForTag: typeof _AllowedClassesForTag & {
  readonly all: () => AllClassesType;
  readonly specific: (classes: ReadonlyArray<ClassPattern>) => SpecificClassesType;
} = Object.assign(_AllowedClassesForTag, {
  all: (): AllClassesType => ({ _tag: "AllClasses" }),
  specific: (classes: ReadonlyArray<ClassPattern>): SpecificClassesType => ({
    _tag: "SpecificClasses",
    classes,
  }),
});

export type AllowedClassesForTag = S.Schema.Type<typeof _AllowedClassesForTag>;
export type AllowedClassesForTagEncoded = S.Schema.Encoded<typeof _AllowedClassesForTag>;

// ============================================================================
// AllowedClasses Record Schema
// ============================================================================

/**
 * AllowedClasses configuration
 *
 * A record mapping tag names to their allowed classes configuration.
 * Use "*" as key for global classes.
 *
 * @since 1.0.0
 * @category Schema
 * @example
 * ```typescript
 * import { AllowedClasses } from "@beep/schema/integrations/html";
 *
 * const config: AllowedClasses = {
 *   "div": AllowedClassesForTag.all(),
 *   "p": AllowedClassesForTag.specific(["text-center", { source: "^text-" }]),
 *   "*": AllowedClassesForTag.specific(["sr-only"])
 * };
 * ```
 */
export const AllowedClasses = S.Record({
  key: S.String,
  value: _AllowedClassesForTag,
}).annotations(
  $I.annotations("AllowedClasses", {
    title: "Allowed Classes Configuration",
    description: "Map of tag names to their allowed classes configuration",
  })
);

export type AllowedClasses = S.Schema.Type<typeof AllowedClasses>;
export type AllowedClassesEncoded = S.Schema.Encoded<typeof AllowedClasses>;
