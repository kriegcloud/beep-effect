import type { StringTypes } from "@beep/types";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Str from "effect/String";
import * as ArrayUtils from "./array.utils";
/**
 * Generates initials from a given name.
 *
 * @param {string | null | undefined} name - The name to generate initials from.
 * @returns {string} The initials (up to 2 characters) derived from the name, or "?" if the input is null, undefined, or empty.
 * @example
 * getNameInitials("John Doe") // Returns "JD"
 * getNameInitials("Alice") // Returns "A"
 * getNameInitials(null) // Returns "?"
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
        A.map((word) => word[0]?.toUpperCase() ?? ""),
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
export const normalizeString = F.flow(
  Str.normalize("NFKD"),
  Str.replace(/[\u0300-\u036f]/g, ""), // Remove combining diacritical marks
  Str.toLowerCase,
  Str.replace(/[æœ]/g, "ae"),
  Str.replace(/ø/g, "o"),
  Str.replace(/ß/g, "ss")
);

/**
 * Formats the message by replacing double newlines with a space and removing asterisks around words.
 *
 * @param {string} message - The message to format.
 * @returns {string} The formatted message.
 * @example
 * stripMessageFormatting("Hello\\n\\nWorld") // Returns "Hello World"
 * stripMessageFormatting("*Hello* World") // Returns "Hello World"
 */
export const stripMessageFormatting = F.flow(Str.replace(/\\n\\n/g, " "), Str.replace(/\*(.*?)\*/g, "$1"));

/**
 * Interpolates variables in a template string using handlebars-style syntax.
 * Replaces patterns like {{variable.path}} with actual values from the provided data object.
 * Supports nested object access and array indexing with bracket notation (e.g., {{items.[0].name}}).
 *
 * @param {string} template - The template string containing variable placeholders in {{variable}} format.
 * @param {Record<string, unknown>} data - The data object containing values to interpolate.
 * @returns {string} The template string with variables replaced by their corresponding values.
 *
 * @example
 * const data = {
 *   user: { name: "John" },
 *   items: [{ product: { name: "Widget" } }],
 *   total: 99.99
 * };
 * interpolateTemplate("Hello {{user.name}}, your {{items.[0].product.name}} costs ${{total}}", data)
 * // Returns "Hello John, your Widget costs $99.99"
 *
 * @example
 * interpolateTemplate("Welcome {{user.firstName}}!", { user: { firstName: "Alice" } })
 * // Returns "Welcome Alice!"
 *
 * @example
 * // Variables not found in data are left unchanged
 * interpolateTemplate("Hello {{unknown.var}}", {})
 * // Returns "Hello {{unknown.var}}"
 */
export const interpolateTemplate = (template: string, data: Record<string, unknown>): string => {
  return template.replace(/\{\{([^}]+)}}/g, (match, variablePath: string) => {
    const trimmedPath = variablePath.trim();
    const value = getNestedValue(data, trimmedPath);
    return value !== undefined ? String(value) : match;
  });
};

/**
 * Safely extracts a nested value from an object using a dot-notation path.
 * Supports array indexing with bracket notation (e.g., "items.[0].name").
 *
 * @param {Record<string, unknown>} obj - The object to extract the value from.
 * @param {string} path - The dot-notation path to the desired value (e.g., "user.profile.name" or "items.[0].id").
 * @returns {unknown} The value at the specified path, or undefined if not found.
 *
 * @example
 * const data = { user: { profile: { name: "John" } }, items: [{ id: 1 }] };
 * getNestedValue(data, "user.profile.name") // Returns "John"
 * getNestedValue(data, "items.[0].id") // Returns 1
 * getNestedValue(data, "nonexistent.path") // Returns undefined
 */
export const getNestedValue = (obj: Record<string, unknown>, path: string): unknown => {
  const parts = path.split(".");
  let current: unknown = obj;

  for (const part of parts) {
    // Handle array notation like [0], [1], etc.
    if (part.startsWith("[") && part.endsWith("]")) {
      const index = Number.parseInt(part.slice(1, -1), 10);
      if (A.isArray(current) && index >= 0 && index < current.length) {
        current = current[index];
      } else {
        return undefined;
      }
    } else if (current && typeof current === "object" && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }

  return current;
};

export type LiteralValue = StringTypes.NonEmptyString;

export const applySuffix =
  <const Suffix extends LiteralValue, const Prefix extends LiteralValue>(suffix: Suffix) =>
  (prefix: Prefix) =>
    `${prefix}${suffix}` as const;

export const applyPrefix =
  <const Prefix extends LiteralValue, const Suffix extends LiteralValue>(prefix: Prefix) =>
  (suffix: Suffix) =>
    `${prefix}${suffix}` as const;

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

export const strLiteralFromNum = <T extends number>(value: T) => `${value}` as const;
