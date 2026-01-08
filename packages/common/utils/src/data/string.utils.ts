/**
 * String transformation helpers that surface as `Utils.StrUtils`, powering
 * deterministic formatting, template interpolation, and normalization flows.
 *
 * @example
 * import type * as FooTypes from "@beep/types/common.types";
 * import * as Utils from "@beep/utils";
 *
 * const strUtilsName: FooTypes.Prettify<{ fullName: string }> = { fullName: "Ada Lovelace" };
 * const strUtilsInitials = Utils.StrUtils.getNameInitials(strUtilsName.fullName);
 * void strUtilsInitials;
 *
 * @category Documentation
 * @since 0.1.0
 */
import type { StringTypes } from "@beep/types";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as Record from "effect/Record";
import * as Str from "effect/String";
import * as ArrayUtils from "./array.utils";

/**
 * Produces up to two initials for a given person name, falling back to `"?"` when
 * there are no usable characters.
 *
 * Handles multi‑word names, ignores repeated whitespace, and gracefully handles
 * nullish inputs so UI components can show a consistent placeholder.
 *
 * @example
 * import { StrUtils } from "@beep/utils";
 *
 * const initials = StrUtils.getNameInitials("Jane Q Doe");
 * // "JQ"
 *
 * @category Data
 * @since 0.1.0
 */
export const getNameInitials = (name: string | null | undefined): string => {
  return F.pipe(
    name === "" ? null : name,
    O.fromNullable,
    O.map(
      F.flow(
        Str.split(" "),
        A.filter((word) => word.length > 0),
        A.take(2),
        A.map((word) => F.pipe(word[0] ?? "", Str.toUpperCase)),
        A.join("")
      )
    ),
    O.getOrElse(() => "?")
  );
};

/**
 * Normalizes a string by removing diacritics, converting to lowercase, and performing additional normalization.
 * This function is useful for creating searchable or comparable versions of strings,
 * especially when dealing with text that may contain special characters or accents.
 *
 * @param {string} str - The input string to be normalized.
 * @returns {string} The normalized string.
 *
 * @example
 * normalizeString("Año") // Returns "ano"
 * normalizeString("Café") // Returns "cafe"
 * normalizeString("Größe") // Returns "grosse"
 */
/**
 * Signature for utilities that turn arbitrary user input into normalized search
 * strings (lowercase, stripped diacritics, sane replacements).
 *
 * @example
 * import type { NormalizeString } from "@beep/utils/data/string.utils";
 *
 * const normalize: NormalizeString = (value) => value;
 *
 * @category Data
 * @since 0.1.0
 */
export type NormalizeString = (str: string) => string;
/**
 * Normalizes user provided text by removing diacritics, folding ligatures, and
 * lower‑casing so lookups or comparisons stay deterministic.
 *
 * @example
 * import { StrUtils } from "@beep/utils";
 *
 * const normalized = StrUtils.normalizeString("Größe");
 * // "grosse"
 *
 * @category Data
 * @since 0.1.0
 */
export const normalizeString: NormalizeString = F.flow(
  Str.normalize("NFKD"),
  Str.replace(/[\u0300-\u036f]/g, ""), // Remove combining diacritical marks
  Str.toLowerCase,
  Str.replace(/[æœ]/g, "ae"),
  Str.replace(/ø/g, "o"),
  Str.replace(/ß/g, "ss")
);

/**
 * Converts any identifier style (camelCase, PascalCase, snake_case, spaced)
 * into kebab‑case.
 *
 * @example
 * import { StrUtils } from "@beep/utils";
 *
 * StrUtils.kebabCase("PrimaryButton");
 * // "primary-button"
 *
 * @category Data
 * @since 0.1.0
 */
export const kebabCase = (value: string): string =>
  F.pipe(value, Str.trim, (trimmed) =>
    Str.isEmpty(trimmed)
      ? ""
      : F.pipe(
          trimmed,
          Str.replace(/([a-z\d])([A-Z])/g, "$1-$2"),
          Str.replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2"),
          normalizeString,
          Str.replace(/[^a-z0-9]+/g, "-"),
          Str.replace(/-+/g, "-"),
          Str.replace(/^-+/, ""),
          Str.replace(/-+$/, "")
        )
  );

/**
 * Function signature for helpers that remove lightweight markdown cues from a
 * message body.
 *
 * @example
 * import type { StripMessageFormatting } from "@beep/utils/data/string.utils";
 *
 * const formatter: StripMessageFormatting = (text) => text;
 *
 * @category Data
 * @since 0.1.0
 */
export type StripMessageFormatting = (message: string) => string;
/**
 * Removes double newlines and simple asterisk emphasis cues so notifications
 * can be rendered as plain text.
 *
 * @example
 * import { StrUtils } from "@beep/utils";
 *
 * const cleaned = StrUtils.stripMessageFormatting("*Hello*\n\nWorld");
 * // "Hello World"
 *
 * @category Data
 * @since 0.1.0
 */
export const stripMessageFormatting: StripMessageFormatting = F.flow(
  Str.replace(/\\n\\n/g, " "),
  Str.replace(/\*(.*?)\*/g, "$1")
);

/**
 * Replaces `{{path.to.value}}` placeholders in a template string using data
 * pulled via `getNestedValue`, including array access like `items.[0].name`.
 *
 * Useful for email/snackbar copy where runtime data must be woven into
 * pre-authored text.
 *
 * @example
 * import { StrUtils } from "@beep/utils";
 *
 * const body = StrUtils.interpolateTemplate(
 *   "Hello {{user.name}}, your {{items.[0].product.name}} costs ${{total}}",
 *   { user: { name: "Ari" }, items: [{ product: { name: "Widget" } }], total: 42 }
 * );
 * // "Hello Ari, your Widget costs $42"
 *
 * @category Data
 * @since 0.1.0
 */
export const interpolateTemplate = (template: string, data: Record<string, unknown>): string => {
  // Use native .replace() for regex with callback function - Effect's Str.replace doesn't support callbacks
  return template.replace(/\{\{([^}]+)}}/g, (_match: string, variablePath: string): string => {
    const trimmedPath = Str.trim(variablePath);
    const value = getNestedValue(data, trimmedPath);
    return value !== undefined ? String(value) : _match;
  });
};

/**
 * Safely extracts nested values from complex objects or arrays using dot/bracket
 * notation such as `items.[0].product.name`, returning `undefined` instead of
 * throwing when any segment is missing.
 *
 * @example
 * import { StrUtils } from "@beep/utils";
 *
 * const name = StrUtils.getNestedValue(
 *   { user: { profile: { name: "Grey" } }, items: [{ id: 1 }] },
 *   "user.profile.name"
 * );
 * // "Grey"
 *
 * @category Data
 * @since 0.1.0
 */
export const getNestedValue = (obj: Record<string, unknown>, path: string): unknown => {
  const parts = F.pipe(path, Str.split("."));
  let current: unknown = obj;

  for (const part of parts) {
    // Handle array notation like [0], [1], etc.
    if (Str.startsWith("[")(part) && Str.endsWith("]")(part)) {
      // Extract index between brackets: "[0]" -> "0"
      const partLen = Str.length(part);
      const index = Number.parseInt(Str.slice(1, partLen - 1)(part), 10);
      if (A.isArray(current) && index >= 0 && index < current.length) {
        current = current[index];
      } else {
        return undefined;
      }
    } else if (current && P.isObject(current) && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }

  return current;
};

/**
 * Nominal helper representing string literal unions constrained to non-empty
 * values, allowing template literal helpers to infer strongly typed suffixes
 * and prefixes.
 *
 * @example
 * import type { LiteralValue } from "@beep/utils/data/string.utils";
 *
 * const status: LiteralValue = "active";
 *
 * @category Data
 * @since 0.1.0
 */
export type LiteralValue = StringTypes.NonEmptyString;

/**
 * Curried type describing helpers that append a compile-time suffix to literal
 * strings, keeping template literal inference intact.
 *
 * @example
 * import type { ApplySuffix } from "@beep/utils/data/string.utils";
 *
 * const appendId: ApplySuffix = (suffix) => (value) => `${value}${suffix}`;
 *
 * @category Data
 * @since 0.1.0
 */
export type ApplySuffix = <const Suffix extends LiteralValue, const Prefix extends LiteralValue>(
  suffix: Suffix
) => (prefix: Prefix) => `${Prefix}${Suffix}`;

/**
 * Builds a strongly typed suffixing function so literal unions keep their
 * template literal information.
 *
 * @example
 * import { StrUtils } from "@beep/utils";
 *
 * const withId = StrUtils.applySuffix("Id");
 * const result = withId("organization");
 * // "organizationId"
 *
 * @category Data
 * @since 0.1.0
 */
export const applySuffix: ApplySuffix =
  <const Suffix extends LiteralValue, const Prefix extends LiteralValue>(suffix: Suffix) =>
  (prefix: Prefix) =>
    `${prefix}${suffix}`;

/**
 * Signature for helpers that prepend compile-time prefixes to literal strings
 * while preserving template literal inference.
 *
 * @example
 * import type { ApplyPrefix } from "@beep/utils/data/string.utils";
 *
 * const makePrefix: ApplyPrefix = (prefix) => (value) => `${prefix}${value}`;
 *
 * @category Data
 * @since 0.1.0
 */
export type ApplyPrefix = <const Prefix extends LiteralValue, const Suffix extends LiteralValue>(
  prefix: Prefix
) => (suffix: Suffix) => `${Prefix}${Suffix}`;

/**
 * Builds a typed prefixing function used anywhere entity/table helpers need to
 * add namespaces or property tags.
 *
 * @example
 * import { StrUtils } from "@beep/utils";
 *
 * const addBeep = StrUtils.applyPrefix("beep_");
 * const key = addBeep("tenant");
 * // "beep_tenant"
 *
 * @category Data
 * @since 0.1.0
 */
export const applyPrefix: ApplyPrefix =
  <const Prefix extends LiteralValue, const Suffix extends LiteralValue>(prefix: Prefix) =>
  (suffix: Suffix) =>
    `${prefix}${suffix}`;

/**
 * Produces helpers that map a prefix across a non-empty array (or variadic
 * tuple) of literal strings, preserving the literal union type of each entry.
 *
 * @example
 * import { StrUtils } from "@beep/utils";
 *
 * const addScope = StrUtils.mapApplyPrefix("beep.");
 * const result = addScope("users", "tenants");
 * // ["beep.users", "beep.tenants"]
 *
 * @category Data
 * @since 0.1.0
 */
export function mapApplyPrefix<const Prefix extends LiteralValue>(
  prefix: Prefix
): {
  <const Literal extends LiteralValue>(
    literals: A.NonEmptyReadonlyArray<Literal>
  ): A.NonEmptyReadonlyArray<`${Prefix}${Literal}`>;
  <const Literals extends readonly [LiteralValue, ...LiteralValue[]]>(
    ...literals: Literals
  ): A.NonEmptyReadonlyArray<`${Prefix}${Literals[number]}`>;
} {
  const mapArray = <const Literals extends A.NonEmptyReadonlyArray<StringTypes.NonEmptyString>>(
    literals: Literals
  ): A.NonEmptyReadonlyArray<`${Prefix}${Literals[number]}`> => {
    const applyFn = applyPrefix(prefix);
    return ArrayUtils.NonEmptyReadonly.mapWith(applyFn)(literals);
  };

  const mapFn = <const Literal extends StringTypes.NonEmptyString>(
    first: A.NonEmptyReadonlyArray<Literal> | Literal,
    ...rest: Literal[]
  ): A.NonEmptyReadonlyArray<`${Prefix}${Literal}`> => {
    if (Array.isArray(first)) {
      if (first.length === 0) {
        throw new TypeError("Expected a non-empty readonly array of literals");
      }
      return mapArray(first as A.NonEmptyReadonlyArray<Literal>);
    }

    const tuple = [first, ...rest] as readonly [Literal, ...Literal[]];
    return mapArray(tuple as A.NonEmptyReadonlyArray<Literal>);
  };

  return mapFn as {
    <const Literal extends LiteralValue>(
      literals: A.NonEmptyReadonlyArray<Literal>
    ): A.NonEmptyReadonlyArray<`${Prefix}${Literal}`>;
    <const Literals extends readonly [StringTypes.NonEmptyString, ...StringTypes.NonEmptyString[]]>(
      ...literals: Literals
    ): A.NonEmptyReadonlyArray<`${Prefix}${Literals[number]}`>;
  };
}

/**
 * Maps a suffix across non-empty literal arrays or tuples, maintaining precise
 * template literal output types for each entry.
 *
 * @example
 * import { StrUtils } from "@beep/utils";
 *
 * const addId = StrUtils.mapApplySuffix("Id");
 * const keys = addId("organization", "team");
 * // ["organizationId", "teamId"]
 *
 * @category Data
 * @since 0.1.0
 */
export function mapApplySuffix<const Suffix extends StringTypes.NonEmptyString>(
  suffix: Suffix
): {
  <const Literals extends A.NonEmptyReadonlyArray<StringTypes.NonEmptyString>>(
    literals: Literals
  ): A.NonEmptyReadonlyArray<`${Literals[number]}${Suffix}`>;
  <const Literals extends readonly [StringTypes.NonEmptyString, ...StringTypes.NonEmptyString[]]>(
    ...literals: Literals
  ): A.NonEmptyReadonlyArray<`${Literals[number]}${Suffix}`>;
} {
  const mapArray = <Literals extends A.NonEmptyReadonlyArray<StringTypes.NonEmptyString>>(
    literals: Literals
  ): A.NonEmptyReadonlyArray<`${Literals[number]}${Suffix}`> => {
    const applyFn = applySuffix(suffix);
    return ArrayUtils.NonEmptyReadonly.mapWith(applyFn)(literals);
  };

  const mapFn = <const Literal extends StringTypes.NonEmptyString>(
    first: A.NonEmptyReadonlyArray<Literal> | Literal,
    ...rest: Literal[]
  ): A.NonEmptyReadonlyArray<`${Literal}${Suffix}`> => {
    if (Array.isArray(first)) {
      if (first.length === 0) {
        throw new TypeError("Expected a non-empty readonly array of literals");
      }
      return mapArray(first as A.NonEmptyReadonlyArray<Literal>);
    }

    const tuple = [first, ...rest] as readonly [Literal, ...Literal[]];
    return mapArray(tuple as A.NonEmptyReadonlyArray<Literal>);
  };

  return mapFn as {
    <const Literal extends StringTypes.NonEmptyString>(
      literals: A.NonEmptyReadonlyArray<Literal>
    ): A.NonEmptyReadonlyArray<`${Literal}${Suffix}`>;
    <const Literals extends readonly [StringTypes.NonEmptyString, ...StringTypes.NonEmptyString[]]>(
      ...literals: Literals
    ): A.NonEmptyReadonlyArray<`${Literals[number]}${Suffix}`>;
  };
}

/**
 * Type for helpers that convert numeric literals into string literal types so
 * template literal operations can stay narrow.
 *
 * @example
 * import type { StrLiteralFromNum } from "@beep/utils/data/string.utils";
 *
 * const toLiteral: StrLiteralFromNum = (value) => `${value}`;
 *
 * @category Data
 * @since 0.1.0
 */
export type StrLiteralFromNum = <T extends number>(value: T) => `${T}`;

/**
 * Converts numeric literals to string literal types so downstream template
 * literal helpers keep precise unions.
 *
 * @example
 * import { StrUtils } from "@beep/utils";
 *
 * const literal = StrUtils.strLiteralFromNum(42);
 * // "42"
 *
 * @category Data
 * @since 0.1.0
 */
export const strLiteralFromNum: StrLiteralFromNum = <T extends number>(value: T) => `${value}` as const;

const irregularPlurals: Record<string, string> = {
  address: "addresses",
  campus: "campuses",
  child: "children",
  person: "people",
};

const irregularSingulars = F.pipe(
  irregularPlurals,
  Record.toEntries,
  A.map(([a, b]) => [b, a] as const),
  Record.fromEntries
);

/**
 * Converts English singular nouns into plural form, covering irregular cases
 * (person -> people) plus consonant + `y`, `f`/`fe`, and consonant + `o`
 * endings.
 *
 * @example
 * import { StrUtils } from "@beep/utils";
 *
 * StrUtils.pluralize("address");
 * // "addresses"
 *
 * @category Data
 * @since 0.1.0
 */
export function pluralize(word: string): string {
  // Handle empty strings
  if (Str.isEmpty(word)) return word;

  const lower = Str.toLowerCase(word);

  // Check for irregular plurals (case-insensitive)
  if (irregularPlurals[lower]) {
    return preserveCase(word, irregularPlurals[lower]);
  }

  // Words ending in 'y' preceded by consonant
  if (word.length > 1 && Str.endsWith("y")(word)) {
    const beforeY = word[word.length - 2] || "";
    // Check if beforeY is NOT a vowel (i.e., is a consonant)
    if (!Str.includes(Str.toLowerCase(beforeY))("aeiou")) {
      const wordLen = Str.length(word);
      return `${Str.slice(0, wordLen - 1)(word)}ies`;
    }
  }

  // Words ending in s, x, z, ch, sh
  if (/[sxz]$|[cs]h$/.test(word)) {
    return `${word}es`;
  }

  // Words ending in 'f' or 'fe'
  if (Str.endsWith("f")(word)) {
    const wordLen = Str.length(word);
    return `${Str.slice(0, wordLen - 1)(word)}ves`;
  }
  if (Str.endsWith("fe")(word)) {
    const wordLen = Str.length(word);
    return `${Str.slice(0, wordLen - 2)(word)}ves`;
  }

  // Words ending in 'o' preceded by consonant
  if (word.length > 1 && Str.endsWith("o")(word)) {
    const beforeO = word[word.length - 2] || "";
    // Check if beforeO is NOT a vowel (i.e., is a consonant)
    if (!Str.includes(Str.toLowerCase(beforeO))("aeiou")) {
      // Common exceptions that just add 's'
      const oExceptions: readonly string[] = ["photo", "piano", "halo", "solo", "pro", "auto"];
      if (
        !F.pipe(
          oExceptions,
          A.some((x) => x === lower)
        )
      ) {
        return `${word}es`;
      }
    }
  }

  // Default: add 's'
  return `${word}s`;
}

/**
 * Converts plural nouns back to their singular form using the inverse logic of
 * `pluralize`, handling irregular dictionaries along with `ies`, `ves`, and
 * `es` endings.
 *
 * @example
 * import { StrUtils } from "@beep/utils";
 *
 * StrUtils.singularize("companies");
 * // "company"
 *
 * @category Data
 * @since 0.1.0
 */
export function singularize(word: string): string {
  // Handle empty strings
  if (!word) return word;

  const lower = Str.toLowerCase(word);

  // Check for irregular singulars (case-insensitive)
  if (irregularSingulars[lower]) {
    return preserveCase(word, irregularSingulars[lower]);
  }

  // Check if word is already a singular form from our irregular plurals
  // This prevents singularizing words that are already singular
  const singularValues: readonly string[] = F.pipe(irregularPlurals, Record.values);
  if (
    F.pipe(
      singularValues,
      A.some((x) => x === lower)
    )
  ) {
    return word;
  }

  // Words ending in 'us' are typically already singular (Latin origin)
  // Common examples: campus, status, virus, focus, bonus, genus, etc.
  if (Str.endsWith("us")(word)) {
    return word;
  }

  // Words ending in 'ies'
  if (Str.endsWith("ies")(word)) {
    const wordLen = Str.length(word);
    return `${Str.slice(0, wordLen - 3)(word)}y`;
  }

  // Words ending in 'ves'
  if (Str.endsWith("ves")(word)) {
    const wordLen = Str.length(word);
    return `${Str.slice(0, wordLen - 3)(word)}f`;
  }

  // Words ending in 'es'
  if (Str.endsWith("es")(word)) {
    const wordLen = Str.length(word);
    const base = Str.slice(0, wordLen - 2)(word);
    // Check if base ends in s, x, z, ch, sh
    if (/[sxz]$|[cs]h$/.test(base)) {
      return base;
    }
    // Check if base ends in 'o' preceded by consonant
    if (base.length > 1 && Str.endsWith("o")(base)) {
      const beforeO = base[base.length - 2] || "";
      // Check if beforeO is NOT a vowel (i.e., is a consonant)
      if (!Str.includes(Str.toLowerCase(beforeO))("aeiou")) {
        return base;
      }
    }
    // Otherwise, it might be a regular 'e' ending
    return `${base}e`;
  }

  // Words ending in 's' (but not 'ss')
  if (Str.endsWith("s")(word) && !Str.endsWith("ss")(word)) {
    const wordLen = Str.length(word);
    return Str.slice(0, wordLen - 1)(word);
  }

  // If no plural pattern found, return as is
  return word;
}

// Helper function to preserve the case pattern of the original word
function preserveCase(original: string, transformed: string): string {
  if (F.pipe(original, Str.length) === 0) {
    return transformed;
  }

  // If original is all uppercase
  if (original === F.pipe(original, Str.toUpperCase)) {
    return F.pipe(transformed, Str.toUpperCase);
  }

  // If original starts with uppercase
  const firstChar = F.pipe(
    original,
    Str.charAt(0),
    O.getOrElse(() => "")
  );
  if (firstChar === F.pipe(firstChar, Str.toUpperCase)) {
    return F.pipe(transformed, Str.capitalize, Str.toLowerCase, Str.capitalize);
  }

  // Otherwise, return lowercase
  return F.pipe(transformed, Str.toLowerCase);
}

/**
 * Function signature for helpers that convert plural table names into
 * singularized PascalCase entity names (e.g., `people` -> `Person`).
 *
 * @example
 * import type { MkEntityName } from "@beep/utils/data/string.utils";
 *
 * const fn: MkEntityName = (table) => table;
 *
 * @category Data
 * @since 0.1.0
 */
export type MkEntityName = (tableName: string) => string;
/**
 * Converts table names into singularized PascalCase entity names.
 *
 * @example
 * import { StrUtils } from "@beep/utils";
 *
 * StrUtils.mkEntityName("phone_numbers");
 * // "PhoneNumber"
 *
 * @category Data
 * @since 0.1.0
 */
export const mkEntityName: MkEntityName = F.flow(Str.snakeToPascal, singularize);

/**
 * Signature describing helpers that turn singular PascalCase entity names into
 * plural snake_case table names.
 *
 * @example
 * import type { MkTableName } from "@beep/utils/data/string.utils";
 *
 * const fn: MkTableName = (name) => name;
 *
 * @category Data
 * @since 0.1.0
 */
export type MkTableName = (entityName: string) => string;
/**
 * Converts entity names into pluralized snake_case table names.
 *
 * @example
 * import { StrUtils } from "@beep/utils";
 *
 * StrUtils.mkTableName("PhoneNumber");
 * // "phone_numbers"
 *
 * @category Data
 * @since 0.1.0
 */
export const mkTableName: MkTableName = F.flow(Str.pascalToSnake, pluralize);

/**
 * Function signature for helpers that build camelCase plural table names used
 * by Zero schema conventions.
 *
 * @example
 * import type { MkZeroTableName } from "@beep/utils/data/string.utils";
 *
 * const fn: MkZeroTableName = (entity) => entity;
 *
 * @category Data
 * @since 0.1.0
 */
export type MkZeroTableName = (entityName: string) => string;
/**
 * Converts PascalCase entities into camelCase plural table names for Zero
 * schema compatibility.
 *
 * @example
 * import { StrUtils } from "@beep/utils";
 *
 * StrUtils.mkZeroTableName("PhoneNumber");
 * // "phoneNumbers"
 *
 * @category Data
 * @since 0.1.0
 */
export const mkZeroTableName: MkZeroTableName = F.flow(Str.uncapitalize, pluralize);

/**
 * Signature for helpers that create lowercase entity identifiers suitable for
 * ID suffixes (e.g., `people` -> `person`).
 *
 * @example
 * import type { MkEntityType } from "@beep/utils/data/string.utils";
 *
 * const fn: MkEntityType = (table) => table;
 *
 * @category Data
 * @since 0.1.0
 */
export type MkEntityType = (tableName: string) => string;
/**
 * Converts plural table names into lowercase entity types used when composing
 * ID labels.
 *
 * @example
 * import { StrUtils } from "@beep/utils";
 *
 * StrUtils.mkEntityType("phone_numbers");
 * // "phonenumber"
 *
 * @category Data
 * @since 0.1.0
 */
export const mkEntityType: MkEntityType = F.flow(Str.snakeToPascal, Str.toLowerCase, singularize);

/**
 * Signature for helpers that generate camelCase URL parameter names from
 * entity names (e.g., `Organization` -> `organizationId`).
 *
 * @example
 * import type { MkUrlParamName } from "@beep/utils/data/string.utils";
 *
 * const fn: MkUrlParamName = (entity) => entity;
 *
 * @category Data
 * @since 0.1.0
 */
export type MkUrlParamName = (entityName: string) => string;
/**
 * Converts entity names into canonical camelCase URL parameter keys.
 *
 * @example
 * import { StrUtils } from "@beep/utils";
 *
 * StrUtils.mkUrlParamName("Organization");
 * // "organizationId"
 *
 * @category Data
 * @since 0.1.0
 */
export const mkUrlParamName: MkUrlParamName = F.flow(Str.uncapitalize, Str.concat("Id"));

/**
 * Converts identifiers in camel, Pascal, snake, kebab, or spaced casing into
 * a human readable label with whitespace and capitalization preserved.
 *
 * @example
 * import { StrUtils } from "@beep/utils";
 *
 * StrUtils.formatLabel("phoneNumber2");
 * // "Phone Number 2"
 *
 * @category Data
 * @since 0.1.0
 */
export const formatLabel = (fieldName: string): string =>
  F.pipe(
    fieldName,
    Match.value,
    Match.when(Str.isEmpty, () => ""),
    Match.when(Str.includes(" "), (name) => F.pipe(name, Str.split(" "), A.map(Str.capitalize), A.join(" "))),
    Match.when(Str.includes("_"), (name) => F.pipe(name, Str.split("_"), A.map(Str.capitalize), A.join(" "))),
    Match.when(Str.includes("-"), (name) => F.pipe(name, Str.split("-"), A.map(Str.capitalize), A.join(" "))),
    Match.orElse((name) =>
      F.pipe(
        name,
        // Convert camelCase/PascalCase to kebab-case with regex for numbers
        Str.replace(/([a-z])([A-Z])/g, "$1-$2"),
        Str.replace(/([a-z])(\d)/g, "$1-$2"),
        Str.replace(/(\d)([A-Z])/g, "$1-$2"),
        Str.toLowerCase,
        Str.split("-"),
        A.map(Str.capitalize),
        A.join(" ")
      )
    )
  );
