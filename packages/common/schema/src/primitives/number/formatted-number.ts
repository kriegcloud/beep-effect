import { MappedLiteralKit } from "@beep/schema/derived";
import * as S from "effect/Schema";

// ============================================================================
// SI Symbol Mapping
// ============================================================================

export class BigIntToSiSymbol extends MappedLiteralKit(
  [1, "_"],
  [1e3, "K"],
  [1e6, "M"],
  [1e9, "G"],
  [1e12, "T"],
  [1e15, "P"],
  [1e18, "E"]
) {}

export declare namespace BigIntToSiSymbol {
  export type Type = typeof BigIntToSiSymbol.Type;
  export type Encoded = typeof BigIntToSiSymbol.Encoded;
}

// ============================================================================
// SI Symbol Lookup
// ============================================================================

const SI_LOOKUP = [
  { symbol: "", value: 1 },
  { symbol: "K", value: 1e3 },
  { symbol: "M", value: 1e6 },
  { symbol: "G", value: 1e9 },
  { symbol: "T", value: 1e12 },
  { symbol: "P", value: 1e15 },
  { symbol: "E", value: 1e18 },
] as const;

type SiSymbol = (typeof SI_LOOKUP)[number]["symbol"];

// ============================================================================
// FormattedNumber Type
// ============================================================================

/**
 * Represents a formatted number with SI symbol.
 * Stores both the original value and the formatted display string.
 */
export interface FormattedNumber {
  /** The original numeric value */
  readonly value: number;
  /** The formatted display string (e.g., "1.5K", "2.3M") */
  readonly formatted: string;
  /** The SI symbol used (e.g., "", "K", "M", "G", "T", "P", "E") */
  readonly symbol: SiSymbol;
  /** The divisor used for formatting */
  readonly divisor: number;
}

// ============================================================================
// Formatting Logic
// ============================================================================

const TRAILING_ZEROS_RX = /\.0+$|(\.\d*[1-9])0+$/;

/**
 * Formats a number using SI symbols.
 * @param num - The number to format
 * @param digits - Number of decimal places (default: 1)
 * @returns FormattedNumber object with original value and formatted string
 */
function formatNumber(num: number, digits = 1): FormattedNumber {
  if (!num || num === 0) {
    return { value: num, formatted: "0", symbol: "", divisor: 1 };
  }

  const absNum = Math.abs(num);
  const item = [...SI_LOOKUP].reverse().find((item) => absNum >= item.value);

  if (!item) {
    return { value: num, formatted: "0", symbol: "", divisor: 1 };
  }

  const formatted = (num / item.value).toFixed(digits).replace(TRAILING_ZEROS_RX, "$1") + item.symbol;

  return {
    value: num,
    formatted,
    symbol: item.symbol,
    divisor: item.value,
  };
}

/**
 * Parses a formatted SI string back to the original number.
 * @param formatted - The formatted string (e.g., "1.5K")
 * @returns The parsed number
 */
function parseFormattedNumber(formatted: string): number {
  if (formatted === "0") return 0;

  // Find matching SI symbol at end of string
  const item = [...SI_LOOKUP].reverse().find((item) => item.symbol && formatted.endsWith(item.symbol));

  if (item) {
    const numPart = formatted.slice(0, -item.symbol.length);
    return Number.parseFloat(numPart) * item.value;
  }

  // No SI symbol, just parse as number
  return Number.parseFloat(formatted);
}

// ============================================================================
// Schema Definitions
// ============================================================================

/**
 * Schema for the decoded FormattedNumber object
 */
const FormattedNumberStruct = S.Struct({
  value: S.Number,
  formatted: S.String,
  symbol: S.Literal("", "K", "M", "G", "T", "P", "E"),
  divisor: S.Number,
});

/**
 * FormatNumber schema that transforms a number into a FormattedNumber object.
 *
 * - **Decoding**: number → FormattedNumber (formats the number with SI symbol)
 * - **Encoding**: FormattedNumber → number (extracts the original value)
 *
 * @example
 * ```ts
 * import { Schema } from "effect";
 * import { FormatNumber } from "@beep/schema/primitives/number/formatted-number";
 *
 * // Decode a number to FormattedNumber
 * const result = Schema.decodeSync(FormatNumber)(1500);
 * // => { value: 1500, formatted: "1.5K", symbol: "K", divisor: 1000 }
 *
 * // Encode back to number
 * const num = Schema.encodeSync(FormatNumber)(result);
 * // => 1500
 * ```
 *
 * @since 0.1.0
 * @category Primitives/Number
 */
export const FormatNumber: S.Schema<FormattedNumber, number> = S.transform(S.Number, FormattedNumberStruct, {
  strict: true,
  decode: (num) => formatNumber(num),
  encode: (formatted) => formatted.value,
}).annotations({
  identifier: "FormatNumber",
  title: "Formatted Number",
  description: "A number formatted with SI symbols (K, M, G, T, P, E)",
});

/**
 * FormatNumberFromString schema that transforms a formatted SI string into a FormattedNumber object.
 *
 * - **Decoding**: string → FormattedNumber (parses "1.5K" → { value: 1500, ... })
 * - **Encoding**: FormattedNumber → string (returns the formatted string)
 *
 * @example
 * ```ts
 * import { Schema } from "effect";
 * import { FormatNumberFromString } from "@beep/schema/primitives/number/formatted-number";
 *
 * // Decode a formatted string to FormattedNumber
 * const result = Schema.decodeSync(FormatNumberFromString)("1.5K");
 * // => { value: 1500, formatted: "1.5K", symbol: "K", divisor: 1000 }
 *
 * // Encode back to string
 * const str = Schema.encodeSync(FormatNumberFromString)(result);
 * // => "1.5K"
 * ```
 *
 * @since 0.1.0
 * @category Primitives/Number
 */
export const FormatNumberFromString: S.Schema<FormattedNumber, string> = S.transform(S.String, FormattedNumberStruct, {
  strict: true,
  decode: (str) => {
    const value = parseFormattedNumber(str);
    return formatNumber(value);
  },
  encode: (formatted) => formatted.formatted,
}).annotations({
  identifier: "FormatNumberFromString",
  title: "Formatted Number From String",
  description: "A formatted SI string (e.g., '1.5K') decoded to a FormattedNumber object",
});

export declare namespace FormatNumber {
  export type Type = FormattedNumber;
  export type Encoded = number;
}

export declare namespace FormatNumberFromString {
  export type Type = FormattedNumber;
  export type Encoded = string;
}
