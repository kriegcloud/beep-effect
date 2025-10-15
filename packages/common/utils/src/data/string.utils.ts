import type { StringTypes } from "@beep/types";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as Record from "effect/Record";
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
export type NormalizeString = (str: string) => string;
export const normalizeString: NormalizeString = F.flow(
  Str.normalize("NFKD"),
  Str.replace(/[\u0300-\u036f]/g, ""), // Remove combining diacritical marks
  Str.toLowerCase,
  Str.replace(/[æœ]/g, "ae"),
  Str.replace(/ø/g, "o"),
  Str.replace(/ß/g, "ss")
);

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
 * Formats the message by replacing double newlines with a space and removing asterisks around words.
 *
 * @param {string} message - The message to format.
 * @returns {string} The formatted message.
 * @example
 * stripMessageFormatting("Hello\\n\\nWorld") // Returns "Hello World"
 * stripMessageFormatting("*Hello* World") // Returns "Hello World"
 */
export type StripMessageFormatting = (message: string) => string;
export const stripMessageFormatting: StripMessageFormatting = F.flow(
  Str.replace(/\\n\\n/g, " "),
  Str.replace(/\*(.*?)\*/g, "$1")
);

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

export type ApplySuffix = <const Suffix extends LiteralValue, const Prefix extends LiteralValue>(
  suffix: Suffix
) => (prefix: Prefix) => `${Prefix}${Suffix}`;

export const applySuffix: ApplySuffix =
  <const Suffix extends LiteralValue, const Prefix extends LiteralValue>(suffix: Suffix) =>
  (prefix: Prefix) =>
    `${prefix}${suffix}`;

export type ApplyPrefix = <const Prefix extends LiteralValue, const Suffix extends LiteralValue>(
  prefix: Prefix
) => (suffix: Suffix) => `${Prefix}${Suffix}`;

export const applyPrefix: ApplyPrefix =
  <const Prefix extends LiteralValue, const Suffix extends LiteralValue>(prefix: Prefix) =>
  (suffix: Suffix) =>
    `${prefix}${suffix}`;

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

export type StrLiteralFromNum = <T extends number>(value: T) => `${T}`;

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

export function pluralize(word: string): string {
  // Handle empty strings
  if (Str.isEmpty(word)) return word;

  const lower = word.toLowerCase();

  // Check for irregular plurals (case-insensitive)
  if (irregularPlurals[lower]) {
    return preserveCase(word, irregularPlurals[lower]);
  }

  // Words ending in 'y' preceded by consonant
  if (word.length > 1 && word.endsWith("y")) {
    const beforeY = word[word.length - 2] || "";
    if (!"aeiou".includes(beforeY.toLowerCase())) {
      return `${word.slice(0, -1)}ies`;
    }
  }

  // Words ending in s, x, z, ch, sh
  if (word.match(/[sxz]$|[cs]h$/)) {
    return `${word}es`;
  }

  // Words ending in 'f' or 'fe'
  if (word.endsWith("f")) {
    return `${word.slice(0, -1)}ves`;
  }
  if (word.endsWith("fe")) {
    return `${word.slice(0, -2)}ves`;
  }

  // Words ending in 'o' preceded by consonant
  if (word.length > 1 && word.endsWith("o")) {
    const beforeO = word[word.length - 2] || "";
    if (!"aeiou".includes(beforeO.toLowerCase())) {
      // Common exceptions that just add 's'
      const oExceptions = ["photo", "piano", "halo", "solo", "pro", "auto"];
      if (!oExceptions.includes(lower)) {
        return `${word}es`;
      }
    }
  }

  // Default: add 's'
  return `${word}s`;
}

export function singularize(word: string): string {
  // Handle empty strings
  if (!word) return word;

  const lower = word.toLowerCase();

  // Check for irregular singulars (case-insensitive)
  if (irregularSingulars[lower]) {
    return preserveCase(word, irregularSingulars[lower]);
  }

  // Check if word is already a singular form from our irregular plurals
  // This prevents singularizing words that are already singular
  const singularValues = F.pipe(irregularPlurals, Record.values);
  if (F.pipe(singularValues, A.contains(lower))) {
    return word;
  }

  // Words ending in 'us' are typically already singular (Latin origin)
  // Common examples: campus, status, virus, focus, bonus, genus, etc.
  if (word.endsWith("us")) {
    return word;
  }

  // Words ending in 'ies'
  if (word.endsWith("ies")) {
    return `${word.slice(0, -3)}y`;
  }

  // Words ending in 'ves'
  if (word.endsWith("ves")) {
    return `${word.slice(0, -3)}f`;
  }

  // Words ending in 'es'
  if (word.endsWith("es")) {
    const base = word.slice(0, -2);
    // Check if base ends in s, x, z, ch, sh
    if (base.match(/[sxz]$|[cs]h$/)) {
      return base;
    }
    // Check if base ends in 'o' preceded by consonant
    if (base.length > 1 && base.endsWith("o")) {
      const beforeO = base[base.length - 2] || "";
      if (!"aeiou".includes(beforeO.toLowerCase())) {
        return base;
      }
    }
    // Otherwise, it might be a regular 'e' ending
    return `${base}e`;
  }

  // Words ending in 's' (but not 'ss')
  if (word.endsWith("s") && !word.endsWith("ss")) {
    return word.slice(0, -1);
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
 * Converts table name to entity name (people -> Person, addresses -> Address)
 */
export type MkEntityName = (tableName: string) => string;
export const mkEntityName: MkEntityName = F.flow(Str.snakeToPascal, singularize);

/**
 * Converts entity name to table name (Person -> people, Address -> addresses)
 */
export type MkTableName = (entityName: string) => string;
export const mkTableName: MkTableName = F.flow(Str.pascalToSnake, pluralize);

/**
 * Converts entity name to Zero schema table name (Person -> people, PhoneNumber -> phoneNumbers)
 */
export type MkZeroTableName = (entityName: string) => string;
export const mkZeroTableName: MkZeroTableName = F.flow(Str.uncapitalize, pluralize);

/**
 * Converts table name to entity type for IDs (people -> person, phone_numbers -> phonenumber)
 */
export type MkEntityType = (tableName: string) => string;
export const mkEntityType: MkEntityType = F.flow(Str.snakeToPascal, Str.toLowerCase, singularize);

/**
 * Converts entity name to standardized URL parameter name (Person -> personId, PhoneNumber -> phoneNumberId)
 */
export type MkUrlParamName = (entityName: string) => string;
export const mkUrlParamName: MkUrlParamName = F.flow(Str.uncapitalize, Str.concat("Id"));

/**
 * Formats a field name into a human-readable label using Effect-TS String utilities
 * Handles snake_case, kebab-case, camelCase, PascalCase, and mixed formats
 * Examples:
 * - "first_name" -> "First Name"
 * - "firstName" -> "First Name"
 * - "FirstName" -> "First Name"
 * - "first-name" -> "First Name"
 * - "phoneNumber2" -> "Phone Number 2"
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
