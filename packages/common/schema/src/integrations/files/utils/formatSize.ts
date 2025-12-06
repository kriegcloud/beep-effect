import type { UnsafeTypes } from "@beep/types";
import * as A from "effect/Array";
import * as BI from "effect/BigInt";
import * as F from "effect/Function";
import * as Num from "effect/Number";
import * as O from "effect/Option";
import * as Pred from "effect/Predicate";
import * as Str from "effect/String";
import type * as Sizes from "../FileSize";
import { BiBitUnit, BiByteUnit, BitUnit, ByteUnit } from "../FileSize";
/* ============================================================================
 * Unit types inferred from your Schemas (kept in one place for clarity)
 * ========================================================================== */
// type SiByteUnit = S.Schema.Type<typeof Sizes.ByteUnit>; // 'B' | 'kB' | ... | 'YB'
// type IecByteUnit = S.Schema.Type<typeof Sizes.BiByteUnit>; // 'B' | 'KiB' | ... | 'YiB'
// type SiBitUnit = S.Schema.Type<typeof Sizes.BitUnit>; // 'b' | 'kbit' | ... | 'Ybit'
// type IecBitUnit = S.Schema.Type<typeof Sizes.BiBitUnit>; // 'b' | 'kibit' | ... | 'Yibit'

/* ============================================================================
 * Runtime unit tables (type-checked against the schemas)
 * ========================================================================== */

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
type ResolveBits<O> = O extends { readonly bits?: infer B | undefined } ? (B extends boolean ? B : false) : false;

/** Resolve `binary` with default `false`. */
type ResolveBinary<O> = O extends { readonly binary?: infer B | undefined } ? (B extends boolean ? B : false) : false;

/** Resolve `space` with default `true`. */
type ResolveSpace<O> = O extends { readonly space?: infer S | undefined } ? (S extends boolean ? S : true) : true;

/** Pick the unit family based on options. */
type UnitFor<Bits extends boolean, Binary extends boolean> = Bits extends true
  ? Binary extends true
    ? Sizes.BiBitUnit.Type
    : Sizes.BitUnit.Type
  : Binary extends true
    ? Sizes.BiByteUnit.Type
    : Sizes.ByteUnit.Type;

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

/** Natural logarithm of 10, cached for performance */
const LN_10 = Math.log(10);

/** Natural logarithm of 1024, cached for IEC calculations */
const LN_1024 = Math.log(1024);

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
  if (Str.isString(locale) || A.isArray(locale)) {
    return value.toLocaleString(locale as UnsafeTypes.UnsafeAny, options);
  }
  if (locale === true || options !== undefined) {
    return value.toLocaleString(undefined, options);
  }
  // Convert number to string without locale formatting
  return F.pipe(value, (n) => `${n}`);
};

/**
 * Computes log base 10 of a number or BigInt.
 * For BigInt: approximates using string length + first digits precision.
 * Note: Math.log10 has no Effect equivalent, so we use native.
 */
const log10 = (n: number | bigint): number => {
  if (Pred.isNumber(n)) {
    return Math.log10(n);
  }
  // BigInt: approximate log10 using string length + first digits
  const s = n.toString(10);
  const firstDigits = F.pipe(s, Str.slice(0, 15));
  // Parse the fractional approximation using Num.parse with Option handling
  const fractionalValue = F.pipe(
    Num.parse(`0.${firstDigits}`),
    O.getOrElse(() => 0)
  );
  return F.pipe(Str.length(s), Num.sum(Math.log10(fractionalValue)));
};

/**
 * Computes natural logarithm of a number or BigInt.
 * Note: Math.log has no Effect equivalent, so we use native.
 */
const ln = (n: number | bigint): number => (Pred.isNumber(n) ? Math.log(n) : F.pipe(log10(n), Num.multiply(LN_10)));

/**
 * Computes Math.floor for a number.
 * Note: Effect Number module does not provide floor, only round with precision.
 * We use native Math.floor as there's no Effect equivalent.
 */
const floor = (n: number): number => Math.floor(n);

/* ============================================================================
 * Implementation
 * ========================================================================== */

/**
 * Convert bytes (or bits) to a human-readable string: `1337` -> `'1.34 kB'`.
 *
 * Returns a template-literal string whose **unit is type-safe** given the
 * provided options:
 *
 * - `{ bits: false, binary: false }` -> SI **bytes** (B, kB, MB, ...)
 * - `{ bits: false, binary: true }`  -> IEC **bytes** (B, KiB, MiB, ...)
 * - `{ bits: true,  binary: false }` -> SI **bits** (b, kbit, Mbit, ...)
 * - `{ bits: true,  binary: true }`  -> IEC **bits** (b, kibit, Mibit, ...)
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
  // Validate input: must be finite number or BigInt
  // Note: Number.isFinite has no Effect equivalent
  if (F.pipe(value, Pred.not(BI.isBigInt)) && !Number.isFinite(value)) {
    throw new TypeError(`Expected a finite number, got ${typeof value}: ${value}`);
  }

  const opts: Required<Pick<PrettyBytesOptions, "bits" | "binary" | "space">> &
    Omit<PrettyBytesOptions, "bits" | "binary" | "space"> = {
    bits: false,
    binary: false,
    space: true,
    ...options,
  };

  const UNITS = opts.bits
    ? opts.binary
      ? BiBitUnit.Options
      : BitUnit.Options
    : opts.binary
      ? BiByteUnit.Options
      : ByteUnit.Options;

  const separator = opts.space ? " " : Str.empty;
  const unitsLastIndex = F.pipe(A.length(UNITS), Num.subtract(1));

  // Special aligned zero when signed is true
  if (opts.signed && (Pred.isNumber(value) ? value === 0 : value === 0n)) {
    return ` 0${separator}${UNITS[0]}` as PrettyBytesString<O>;
    // ^ leading space matches original library behavior
  }

  const isNegative = Pred.isNumber(value) ? Num.lessThan(value, 0) : BI.lessThan(value, 0n);
  const prefix = isNegative ? "-" : opts.signed ? "+" : Str.empty;

  const absValue = isNegative ? (Pred.isNumber(value) ? Num.negate(value) : BI.abs(value)) : value;

  const localeOptions: Intl.NumberFormatOptions | undefined =
    opts.minimumFractionDigits !== undefined || opts.maximumFractionDigits !== undefined
      ? {
          ...(opts.minimumFractionDigits !== undefined && { minimumFractionDigits: opts.minimumFractionDigits }),
          ...(opts.maximumFractionDigits !== undefined && { maximumFractionDigits: opts.maximumFractionDigits }),
        }
      : undefined;

  // For magnitudes < 1, don't scale - just attach the base unit.
  if (Pred.isNumber(absValue) ? Num.lessThan(absValue, 1) : BI.lessThan(absValue, 1n)) {
    const numberString = toLocaleStr(Pred.isNumber(absValue) ? absValue : Number(absValue), opts.locale, localeOptions);
    return (prefix + numberString + separator + UNITS[0]) as PrettyBytesString<O>;
  }

  // Compute exponent for either base 1000 (SI) or 1024 (IEC)
  const base = opts.binary ? 1024 : 1000;
  const rawExp = opts.binary
    ? F.pipe(ln(absValue), Num.unsafeDivide(LN_1024))
    : F.pipe(log10(absValue), Num.unsafeDivide(3));
  const exp = F.pipe(rawExp, floor, (n) => Num.min(n, unitsLastIndex));

  const divisor = base ** exp;
  const scaledRaw = Pred.isNumber(absValue)
    ? Num.unsafeDivide(absValue, divisor)
    : (() => {
        const bigDivisor = BigInt(base) ** BigInt(exp);
        const intPart = BI.unsafeDivide(absValue, bigDivisor);
        const remainder = absValue % bigDivisor;
        return F.pipe(Number(intPart), Num.sum(Num.unsafeDivide(Number(remainder), divisor)));
      })();

  // Default behavior: round to 3 significant digits if no explicit fraction-digit policy
  const scaled = localeOptions
    ? scaledRaw
    : (() => {
        const intPartStr = F.pipe(
          Num.parse(F.pipe(scaledRaw, floor, (n) => `${n}`)),
          O.getOrElse(() => 0),
          (n) => `${n}`
        );
        const intLen = Str.length(intPartStr);
        const minPrecision = Num.max(3, intLen);
        return Number(scaledRaw.toPrecision(minPrecision));
      })();

  const numberString = toLocaleStr(Number(scaled), opts.locale, localeOptions);

  const unit = UNITS[exp];
  return (prefix + numberString + separator + unit) as PrettyBytesString<O>;
}

/* ============================================================================
 * Handy re-exports (optional)
 * ========================================================================== */
