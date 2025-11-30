import type { UnsafeTypes } from "@beep/types";
import type * as S from "effect/Schema";
import type * as Sizes from "../FileSize";

/* ============================================================================
 * Unit types inferred from your Schemas (kept in one place for clarity)
 * ========================================================================== */
type SiByteUnit = S.Schema.Type<typeof Sizes.ByteUnit>; // 'B' | 'kB' | ... | 'YB'
type IecByteUnit = S.Schema.Type<typeof Sizes.BiByteUnit>; // 'B' | 'KiB' | ... | 'YiB'
type SiBitUnit = S.Schema.Type<typeof Sizes.BitUnit>; // 'b' | 'kbit' | ... | 'Ybit'
type IecBitUnit = S.Schema.Type<typeof Sizes.BiBitUnit>; // 'b' | 'kibit' | ... | 'Yibit'

/* ============================================================================
 * Runtime unit tables (type-checked against the schemas)
 * ========================================================================== */
const BYTE_UNITS = ["B", "kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"] as const satisfies readonly SiByteUnit[];

const BIBYTE_UNITS = [
  "B",
  "KiB",
  "MiB",
  "GiB",
  "TiB",
  "PiB",
  "EiB",
  "ZiB",
  "YiB",
] as const satisfies readonly IecByteUnit[];

const BIT_UNITS = [
  "b",
  "kbit",
  "Mbit",
  "Gbit",
  "Tbit",
  "Pbit",
  "Ebit",
  "Zbit",
  "Ybit",
] as const satisfies readonly SiBitUnit[];

const BIBIT_UNITS = [
  "b",
  "kibit",
  "Mibit",
  "Gibit",
  "Tibit",
  "Pibit",
  "Eibit",
  "Zibit",
  "Yibit",
] as const satisfies readonly IecBitUnit[];

export interface PrettyBytesOptions {
  /**
   * Include plus sign for positive numbers. If the difference is exactly zero a
   * space character will be prepended instead for better alignment.
   * @default false
   */
  readonly signed?: undefined | boolean;

  /**
   * - If `false`: Output won't be localized.
   * - If `true`: Localize using the system/browser locale.
   * - If `string`: BCP 47 language tag (e.g., 'en', 'de').
   * - If `string[]`: List of BCP 47 language tags (e.g., ['en', 'de']).
   * @default false
   */
  readonly locale?: undefined | boolean | string | readonly string[];

  /**
   * Format the number as bits instead of bytes (useful for bit-rates).
   * @default false
   */
  readonly bits?: undefined | boolean;

  /**
   * Use IEC binary prefixes (KiB, MiB, ...) instead of SI decimal (kB, MB, ...).
   * Common for memory amounts; avoid for file sizes shown to end users.
   * @default false
   */
  readonly binary?: boolean | undefined;

  /**
   * Minimum fraction digits to display. If neither `minimumFractionDigits` nor
   * `maximumFractionDigits` are set, the default is rounding to 3 significant digits.
   */
  readonly minimumFractionDigits?: number | undefined;

  /**
   * Maximum fraction digits to display. If neither `minimumFractionDigits` nor
   * `maximumFractionDigits` are set, the default is rounding to 3 significant digits.
   */
  readonly maximumFractionDigits?: number | undefined;

  /**
   * Put a space between the number and unit.
   * @default true
   */
  readonly space?: boolean | undefined;
}

/** Resolve `bits` with default `false`. */
type ResolveBits<O> = O extends { bits?: infer B | undefined } ? (B extends boolean ? B : false) : false;

/** Resolve `binary` with default `false`. */
type ResolveBinary<O> = O extends { binary?: infer B | undefined } ? (B extends boolean ? B : false) : false;

/** Resolve `space` with default `true`. */
type ResolveSpace<O> = O extends { space?: infer S | undefined } ? (S extends boolean ? S : true) : true;

/** Pick the unit family based on options. */
type UnitFor<Bits extends boolean, Binary extends boolean> = Bits extends true
  ? Binary extends true
    ? IecBitUnit
    : SiBitUnit
  : Binary extends true
    ? IecByteUnit
    : SiByteUnit;

/** Unit family for a concrete options type. */
type UnitForOptions<O> = UnitFor<ResolveBits<O>, ResolveBinary<O>>;

/** Separator based on options.space ('' | ' '). */
type SpaceForOptions<O> = ResolveSpace<O> extends false ? "" : " ";

/**
 * Template literal string type that ensures the unit part is always one of
 * the valid units for the provided options.
 */
export type PrettyBytesString<O extends PrettyBytesOptions | undefined> =
  `${string}${SpaceForOptions<O>}${UnitForOptions<O>}`;

/* ============================================================================
 * Internal helpers (locale/BigInt-safe log/divide)
 * ========================================================================== */

/**
 * Formats the given number using `Number#toLocaleString`.
 * - If locale is a string (or array), it's a BCP 47 tag (or list of tags).
 * - If locale is true, the system default locale is used.
 * - If no locale specified, returns the number formatted with default JS rules.
 */
const toLocaleStr = (
  value: number,
  locale: PrettyBytesOptions["locale"],
  options?: Intl.NumberFormatOptions | undefined
): string => {
  if (typeof locale === "string" || Array.isArray(locale)) {
    return value.toLocaleString(locale as UnsafeTypes.UnsafeAny, options);
  }
  if (locale === true || options !== undefined) {
    return value.toLocaleString(undefined, options);
  }
  return String(value);
};

const log10 = (n: number | bigint): number => {
  if (typeof n === "number") {
    return Math.log10(n);
  }
  // BigInt: approximate log10 using length + first digits
  const s = n.toString(10);
  return s.length + Math.log10(Number.parseFloat(`0.${s.slice(0, 15)}`));
};

const ln = (n: number | bigint): number => {
  if (typeof n === "number") {
    return Math.log(n);
  }
  return log10(n) * Math.log(10);
};

const divide = (n: number | bigint, divisor: number): number => {
  if (typeof n === "number") {
    return n / divisor;
  }
  const i = n / BigInt(divisor);
  const r = n % BigInt(divisor);
  return Number(i) + Number(r) / divisor;
};

/* ============================================================================
 * Implementation
 * ========================================================================== */

/**
 * Convert bytes (or bits) to a human‑readable string: `1337` → `'1.34 kB'`.
 *
 * Returns a template-literal string whose **unit is type‑safe** given the
 * provided options:
 *
 * - `{ bits: false, binary: false }` → SI **bytes** (B, kB, MB, …)
 * - `{ bits: false, binary: true }`  → IEC **bytes** (B, KiB, MiB, …)
 * - `{ bits: true,  binary: false }` → SI **bits** (b, kbit, Mbit, …)
 * - `{ bits: true,  binary: true }`  → IEC **bits** (b, kibit, Mibit, …)
 *
 * Defaults: `bits=false`, `binary=false`, `space=true`.
 *
 * @example
 * prettyBytes(1337)                      // '1.34 kB'
 * prettyBytes(100)                       // '100 B'
 * prettyBytes(42, { signed: true })      // '+42 B'
 * prettyBytes(1337, { locale: 'de' })    // '1,34 kB'
 * prettyBytes(1337, { bits: true })      // '1.34 kbit'
 * prettyBytes(1024, { binary: true })    // '1 KiB'
 * prettyBytes(1920, { space: false })    // '1.92kB'
 */
export function formatSize<O extends PrettyBytesOptions | undefined = undefined>(
  value: number | bigint,
  options?: O | undefined
): PrettyBytesString<O> {
  if (typeof value !== "bigint" && !Number.isFinite(value)) {
    // Keep the original error semantics
    throw new TypeError(`Expected a finite number, got ${typeof value}: ${value}`);
  }

  const opts: Required<Pick<PrettyBytesOptions, "bits" | "binary" | "space">> &
    Omit<PrettyBytesOptions, "bits" | "binary" | "space"> = {
    bits: false,
    binary: false,
    space: true,
    ...options,
  };

  const UNITS = opts.bits ? (opts.binary ? BIBIT_UNITS : BIT_UNITS) : opts.binary ? BIBYTE_UNITS : BYTE_UNITS;

  const separator = opts.space ? " " : "";

  // Special aligned zero when signed is true
  if (opts.signed && (typeof value === "number" ? value === 0 : value === 0n)) {
    return ` 0${separator}${UNITS[0]}` as PrettyBytesString<O>;
    // ^ leading space matches original library behavior
  }

  const isNegative = value < 0;
  const prefix = isNegative ? "-" : opts.signed ? "+" : "";

  if (isNegative) {
    value = typeof value === "number" ? -value : -value;
  }

  let localeOptions: Intl.NumberFormatOptions | undefined;
  if (opts.minimumFractionDigits !== undefined) {
    localeOptions = { minimumFractionDigits: opts.minimumFractionDigits };
  }
  if (opts.maximumFractionDigits !== undefined) {
    localeOptions = {
      maximumFractionDigits: opts.maximumFractionDigits,
      ...localeOptions,
    };
  }

  // For magnitudes < 1, don't scale — just attach the base unit.
  if (typeof value === "number" ? value < 1 : value < 1n) {
    const numberString = toLocaleStr(typeof value === "number" ? value : Number(value), opts.locale, localeOptions);
    return (prefix + numberString + separator + UNITS[0]) as PrettyBytesString<O>;
  }

  // Compute exponent for either base 1000 (SI) or 1024 (IEC)
  const base = opts.binary ? 1024 : 1000;
  const exp = Math.min(Math.floor(opts.binary ? ln(value) / Math.log(1024) : log10(value) / 3), UNITS.length - 1);

  let scaled = divide(value, base ** exp);

  // Default behavior: round to 3 significant digits if no explicit fraction-digit policy
  if (!localeOptions) {
    const intLen = Number.parseInt(String(scaled), 10).toString().length;
    const minPrecision = Math.max(3, intLen);
    scaled = Number(scaled.toPrecision(minPrecision));
  }

  const numberString = toLocaleStr(Number(scaled), opts.locale, localeOptions);

  const unit = UNITS[exp];
  return (prefix + numberString + separator + unit) as PrettyBytesString<O>;
}

/* ============================================================================
 * Handy re-exports (optional)
 * ========================================================================== */

export type { SiByteUnit, IecByteUnit, SiBitUnit, IecBitUnit };
