import { $SchemaId } from "@beep/identity/packages";
import type { UnsafeTypes } from "@beep/types";
import * as A from "effect/Array";
import * as BI from "effect/BigInt";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Num from "effect/Number";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { destructiveTransform } from "../../../core/extended/extended-schemas";
import type * as Sizes from "../FileSize";
import { BiBitUnit, BiByteUnit, BitUnit, ByteUnit } from "../FileSize";

const $I = $SchemaId.create("integrations/files/utils/formatSize");
/* ============================================================================
 * Unit types inferred from your Schemas (kept in one place for clarity)
 * ========================================================================== */
// type SiByteUnit = S.Schema.Type<typeof Sizes.ByteUnit>; // 'B' | 'kB' | ... | 'YB'
// type IecByteUnit = S.Schema.Type<typeof Sizes.BiByteUnit>; // 'B' | 'KiB' | ... | 'YiB'
// type SiBitUnit = S.Schema.Type<typeof Sizes.BitUnit>; // 'b' | 'kbit' | ... | 'Ybit'
// type IecBitUnit = S.Schema.Type<typeof Sizes.BiBitUnit>; // 'b' | 'kibit' | ... | 'Yibit'

/* ============================================================================
 * Error Definitions
 * ========================================================================== */

/**
 * Error thrown when file size input is invalid (non-finite number).
 *
 * @example
 * formatSizeEffect(NaN).pipe(
 *   Effect.catchTag("InvalidFileSizeInput", (err) =>
 *     Effect.succeed("Invalid input")
 *   )
 * );
 *
 * @category Errors
 * @since 0.1.0
 */
export class InvalidFileSizeInput extends S.TaggedError<InvalidFileSizeInput>()(
  "InvalidFileSizeInput",
  {
    value: S.Unknown,
    message: S.String,
  },
  $I.annotations("InvalidFileSizeInput", {
    description: "Error thrown when file size input is invalid (non-finite number)",
  })
) {}

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
  if (P.isString(locale) || A.isArray(locale)) {
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
  if (P.isNumber(n)) {
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
const ln = (n: number | bigint): number => (P.isNumber(n) ? Math.log(n) : F.pipe(log10(n), Num.multiply(LN_10)));

/**
 * Computes Math.floor for a number.
 * Note: Effect Number module does not provide floor, only round with precision.
 * We use native Math.floor as there's no Effect equivalent.
 */
const floor = (n: number): number => Math.floor(n);

/* ============================================================================
 * Implementation - Effect-based
 * ========================================================================== */

/**
 * Convert bytes (or bits) to a human-readable string using Effect patterns.
 *
 * Returns an Effect that resolves to a template-literal string whose **unit is type-safe**
 * given the provided options:
 *
 * - `{ bits: false, binary: false }` -> SI **bytes** (B, kB, MB, ...)
 * - `{ bits: false, binary: true }`  -> IEC **bytes** (B, KiB, MiB, ...)
 * - `{ bits: true,  binary: false }` -> SI **bits** (b, kbit, Mbit, ...)
 * - `{ bits: true,  binary: true }`  -> IEC **bits** (b, kibit, Mibit, ...)
 *
 * Defaults: `bits=false`, `binary=false`, `space=true`.
 *
 * @example
 * const program = formatSizeEffect(1337);
 * Effect.runSync(program); // '1.34 kB'
 *
 * @example
 * const program = formatSizeEffect(1024, { binary: true });
 * Effect.runSync(program); // '1 KiB'
 *
 * @example
 * // Error handling
 * formatSizeEffect(NaN).pipe(
 *   Effect.catchTag("InvalidFileSizeInput", (err) =>
 *     Effect.succeed("Invalid input")
 *   )
 * );
 *
 * @category Utils
 * @since 0.1.0
 */
export function formatSizeEffect<O extends PrettyBytesOptions | undefined = undefined>(
  value: number | bigint,
  options?: O | undefined
): Effect.Effect<PrettyBytesString<O>, InvalidFileSizeInput> {
  return Effect.gen(function* () {
    // Validate input: must be finite number or BigInt
    if (F.pipe(value, P.not(BI.isBigInt)) && !Number.isFinite(value)) {
      return yield* Effect.fail(
        new InvalidFileSizeInput({
          value,
          message: `Expected a finite number, got ${typeof value}: ${value}`,
        })
      );
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
    if (opts.signed && (P.isNumber(value) ? value === 0 : value === 0n)) {
      return ` 0${separator}${UNITS[0]}` as PrettyBytesString<O>;
    }

    const isNegative = P.isNumber(value) ? Num.lessThan(value, 0) : BI.lessThan(value, 0n);
    const prefix = isNegative ? "-" : opts.signed ? "+" : Str.empty;

    const absValue = isNegative ? (P.isNumber(value) ? Num.negate(value) : BI.abs(value)) : value;

    const localeOptions: Intl.NumberFormatOptions | undefined =
      opts.minimumFractionDigits !== undefined || opts.maximumFractionDigits !== undefined
        ? {
            ...(opts.minimumFractionDigits !== undefined && { minimumFractionDigits: opts.minimumFractionDigits }),
            ...(opts.maximumFractionDigits !== undefined && { maximumFractionDigits: opts.maximumFractionDigits }),
          }
        : undefined;

    // For magnitudes < 1, don't scale - just attach the base unit.
    if (P.isNumber(absValue) ? Num.lessThan(absValue, 1) : BI.lessThan(absValue, 1n)) {
      const numberString = toLocaleStr(P.isNumber(absValue) ? absValue : Number(absValue), opts.locale, localeOptions);
      return (prefix + numberString + separator + UNITS[0]) as PrettyBytesString<O>;
    }

    // Compute exponent for either base 1000 (SI) or 1024 (IEC)
    const base = opts.binary ? 1024 : 1000;
    const rawExp = opts.binary
      ? F.pipe(ln(absValue), Num.unsafeDivide(LN_1024))
      : F.pipe(log10(absValue), Num.unsafeDivide(3));
    const exp = F.pipe(rawExp, floor, (n) => Num.min(n, unitsLastIndex));

    const divisor = base ** exp;
    const scaledRaw = P.isNumber(absValue)
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
  });
}

/**
 * Synchronous version that throws on error (for compatibility with legacy code).
 *
 *
 * @example
 * formatSize(1337);                      // '1.34 kB'
 * formatSize(100);                       // '100 B'
 * formatSize(42, { signed: true });      // '+42 B'
 * formatSize(1337, { locale: 'de' });    // '1,34 kB'
 * formatSize(1337, { bits: true });      // '1.34 kbit'
 * formatSize(1024, { binary: true });    // '1 KiB'
 * formatSize(1920, { space: false });    // '1.92kB'
 *
 * @category Utils
 * @since 0.1.0
 */
export function formatSize<O extends PrettyBytesOptions | undefined = undefined>(
  value: number | bigint,
  options?: O | undefined
): PrettyBytesString<O> {
  return Effect.runSync(formatSizeEffect(value, options));
}

/* ============================================================================
 * Schema Transformations
 * ========================================================================== */

/**
 * Schema that transforms a number or bigint into a formatted file size string.
 *
 * This is a ONE-WAY transformation - encoding is forbidden as formatting
 * is inherently lossy (cannot reverse "1.34 kB" back to exact bytes).
 *
 * @example
 * const schema = FileSizeFormatted({ binary: true });
 * S.decodeSync(schema)(1024); // "1 KiB"
 *
 * @example
 * const schema = FileSizeFormatted({ bits: true });
 * S.decodeSync(schema)(1337); // "1.34 kbit"
 *
 * @example
 * const schema = FileSizeFormatted({ locale: "de", space: false });
 * S.decodeSync(schema)(1337); // "1,34kB"
 *
 * @category Schemas
 * @since 0.1.0
 */
export const FileSizeFormatted = <O extends PrettyBytesOptions | undefined = undefined>(options?: O) =>
  F.pipe(
    S.Union(S.Number, S.BigInt),
    destructiveTransform((value: number | bigint) => Effect.runSync(formatSizeEffect(value, options)))
  ) as S.Schema<PrettyBytesString<O>, number | bigint, never>;

/**
 * Pre-configured schema for SI decimal byte units (kB, MB, GB).
 *
 * @example
 * S.decodeSync(FileSizeSI)(1337); // "1.34 kB"
 *
 * @category Schemas
 * @since 0.1.0
 */
export const FileSizeSI = FileSizeFormatted({ binary: false });

/**
 * Pre-configured schema for IEC binary byte units (KiB, MiB, GiB).
 *
 * @example
 * S.decodeSync(FileSizeIEC)(1024); // "1 KiB"
 *
 * @category Schemas
 * @since 0.1.0
 */
export const FileSizeIEC = FileSizeFormatted({ binary: true });

/**
 * Pre-configured schema for SI decimal bit units (kbit, Mbit, Gbit).
 *
 * @example
 * S.decodeSync(FileSizeBitsSI)(1337); // "1.34 kbit"
 *
 * @category Schemas
 * @since 0.1.0
 */
export const FileSizeBitsSI = FileSizeFormatted({ bits: true, binary: false });

/**
 * Pre-configured schema for IEC binary bit units (kibit, Mibit, Gibit).
 *
 * @example
 * S.decodeSync(FileSizeBitsIEC)(1024); // "1 kibit"
 *
 * @category Schemas
 * @since 0.1.0
 */
export const FileSizeBitsIEC = FileSizeFormatted({ bits: true, binary: true });

/* ============================================================================
 * Re-exports
 * ========================================================================== */
