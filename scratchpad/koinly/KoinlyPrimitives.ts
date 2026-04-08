/**
 * Scratchpad-local Koinly primitive schemas used by CSV and SQLite boundaries.
 *
 * These schemas stay local because they model Koinly export conventions rather
 * than cross-repository standards.
 *
 * @module scratchpad/koinly/KoinlyPrimitives
 * @since 0.0.0
 */

import { $ScratchId } from "@beep/identity";
import { SchemaUtils } from "@beep/schema";
import { NonEmptyTrimmedStr } from "@beep/schema/String";
import { CryptoTxnHash } from "@beep/schema/blockchain/CryptoTxnHash";
import { BigDecimal, Boolean as Bool, DateTime, Effect, Option, Redacted, SchemaGetter, SchemaIssue, flow, pipe } from "effect";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const $I = $ScratchId.create("koinly/KoinlyPrimitives");

const invalidValueIssue = (input: string, message: string): SchemaIssue.Issue =>
  new SchemaIssue.InvalidValue(O.some(input), {
    message,
  });

const formatPart = (value: number, width: number): string => pipe(`${value}`, Str.padStart(width, "0"));

const koinlyUtcTimestampPattern = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/;
const koinlySyntheticTransactionIdPattern = /^[0-9]+_[A-Za-z0-9_]+$/;

/**
 * Branded Koinly identifier used for transaction and wallet IDs.
 *
 * @category Validation
 * @since 0.0.0
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { KoinlyId } from "./KoinlyPrimitives.ts"
 *
 * const decode = S.decodeUnknownSync(KoinlyId)
 * const id = decode("770AF28689FFAB912F2353F051CE04DA")
 *
 * void id
 * ```
 */
export const KoinlyId = NonEmptyTrimmedStr.check(
  S.isPattern(/^[A-F0-9]{32}$/, {
    identifier: $I`KoinlyIdFormatCheck`,
    title: "Koinly Identifier Format",
    description: "A 32-character uppercase hexadecimal Koinly identifier.",
    message: "KoinlyId must be a 32-character uppercase hexadecimal identifier",
  })
).pipe(
  S.brand("KoinlyId"),
  $I.annoteSchema("KoinlyId", {
    description: "A 32-character uppercase hexadecimal Koinly identifier.",
  })
);

/**
 * Runtime type for {@link KoinlyId}.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type KoinlyId = typeof KoinlyId.Type;

/**
 * Branded Koinly wallet identifier.
 *
 * @category Validation
 * @since 0.0.0
 */
export const KoinlyWalletId = KoinlyId.pipe(
  S.brand("KoinlyWalletId"),
  $I.annoteSchema("KoinlyWalletId", {
    description: "A 32-character uppercase hexadecimal Koinly wallet identifier.",
  })
);

/**
 * Runtime type for {@link KoinlyWalletId}.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type KoinlyWalletId = typeof KoinlyWalletId.Type;

/**
 * UTC timestamp used in Koinly CSV exports.
 *
 * Parses `YYYY-MM-DD HH:mm:ss` into `DateTime.Utc`.
 *
 * @category Validation
 * @since 0.0.0
 * @example
 * ```ts
 * import { DateTime } from "effect"
 * import * as S from "effect/Schema"
 * import { KoinlyUtcTimestamp } from "./KoinlyPrimitives.ts"
 *
 * const value = S.decodeUnknownSync(KoinlyUtcTimestamp)("2022-01-11 04:36:39")
 *
 * console.log(DateTime.formatIso(value))
 * ```
 */
export const KoinlyUtcTimestamp = S.String.pipe(
  S.decodeTo(S.DateTimeUtcFromString, {
    decode: SchemaGetter.transformOrFail((input) => {
      const match = koinlyUtcTimestampPattern.exec(input);

      if (P.isNull(match)) {
        return Effect.fail(
          invalidValueIssue(input, "KoinlyUtcTimestamp must match YYYY-MM-DD HH:mm:ss in UTC")
        );
      }

      const year = match[1];
      const month = match[2];
      const day = match[3];
      const hour = match[4];
      const minute = match[5];
      const second = match[6];

      if (
        !P.isString(year) ||
        !P.isString(month) ||
        !P.isString(day) ||
        !P.isString(hour) ||
        !P.isString(minute) ||
        !P.isString(second)
      ) {
        return Effect.fail(
          invalidValueIssue(input, "KoinlyUtcTimestamp must match YYYY-MM-DD HH:mm:ss in UTC")
        );
      }

      const iso = `${year}-${month}-${day}T${hour}:${minute}:${second}.000Z`;
      const dateTime = DateTime.make(iso);

      if (O.isNone(dateTime)) {
        return Effect.fail(
          invalidValueIssue(input, "KoinlyUtcTimestamp must be a valid UTC date/time value")
        );
      }

      return Effect.succeed(iso);
    }),
    encode: SchemaGetter.transformOrFail((input) => {
      const dateTime = DateTime.make(input);

      if (O.isNone(dateTime)) {
        return Effect.fail(
          invalidValueIssue(input, "KoinlyUtcTimestamp must encode from a valid UTC date/time value")
        );
      }

      const parts = DateTime.toPartsUtc(DateTime.toUtc(dateTime.value));

      return Effect.succeed(
        `${formatPart(parts.year, 4)}-${formatPart(parts.month, 2)}-${formatPart(parts.day, 2)} ${formatPart(parts.hour, 2)}:${formatPart(parts.minute, 2)}:${formatPart(parts.second, 2)}`
      );
    }),
  }),
  $I.annoteSchema("KoinlyUtcTimestamp", {
    description: "Koinly UTC timestamp parsed from YYYY-MM-DD HH:mm:ss.",
  })
);

/**
 * Runtime type for {@link KoinlyUtcTimestamp}.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type KoinlyUtcTimestamp = typeof KoinlyUtcTimestamp.Type;

/**
 * Decimal quantity transported as text in Koinly exports and SQLite storage.
 *
 * @category Validation
 * @since 0.0.0
 * @example
 * ```ts
 * import { BigDecimal } from "effect"
 * import * as S from "effect/Schema"
 * import { KoinlyDecimal } from "./KoinlyPrimitives.ts"
 *
 * const value = S.decodeUnknownSync(KoinlyDecimal)("302.9229")
 *
 * console.log(BigDecimal.format(value))
 * ```
 */
export const KoinlyDecimal = S.String.pipe(
  S.decodeTo(S.BigDecimal, {
    decode: SchemaGetter.transformOrFail((input) =>
      pipe(
        BigDecimal.fromString(input),
        O.match({
          onNone: () =>
            Effect.fail(invalidValueIssue(input, "KoinlyDecimal must be a valid decimal string")),
          onSome: Effect.succeed,
        })
      )
    ),
    encode: SchemaGetter.transform(BigDecimal.format),
  }),
  $I.annoteSchema("KoinlyDecimal", {
    description: "Koinly decimal quantity decoded from text into Effect BigDecimal.",
  })
);

/**
 * Runtime type for {@link KoinlyDecimal}.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type KoinlyDecimal = typeof KoinlyDecimal.Type;

/**
 * Boolean transported as the text literals `true` and `false`.
 *
 * @category Validation
 * @since 0.0.0
 */
export const KoinlyBooleanText = S.String.pipe(
  S.decodeTo(S.Boolean, {
    decode: SchemaGetter.transformOrFail((input) =>
      input === "true"
        ? Effect.succeed(true)
        : input === "false"
          ? Effect.succeed(false)
          : Effect.fail(invalidValueIssue(input, "KoinlyBooleanText must be `true` or `false`"))
    ),
    encode: SchemaGetter.transform(Bool.match({
      onFalse: () => "false",
      onTrue: () => "true",
    })),
  }),
  $I.annoteSchema("KoinlyBooleanText", {
    description: "Boolean transported as the text literals `true` and `false`.",
  })
);

/**
 * Runtime type for {@link KoinlyBooleanText}.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type KoinlyBooleanText = typeof KoinlyBooleanText.Type;

/**
 * Closed false-only Koinly deletion marker used by the current export.
 *
 * @category Validation
 * @since 0.0.0
 */
export const KoinlyDeletedText = S.String.pipe(
  S.decodeTo(S.Literal(false), {
    decode: SchemaGetter.transformOrFail((input) =>
      input === "false"
        ? Effect.succeed(false as const)
        : Effect.fail(invalidValueIssue(input, "KoinlyDeletedText must be `false` for this export"))
    ),
    encode: SchemaGetter.transform(() => "false"),
  }),
  $I.annoteSchema("KoinlyDeletedText", {
    description: "False-only deletion marker for the current Koinly export.",
  })
);

/**
 * Runtime type for {@link KoinlyDeletedText}.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type KoinlyDeletedText = typeof KoinlyDeletedText.Type;

/**
 * Generic helper for Koinly CSV cells where empty text means missing.
 *
 * @category Validation
 * @since 0.0.0
 */
export const OptionFromEmptyText = <Self extends S.Top & { readonly Encoded: string }>(schema: Self) =>
  S.String.pipe(
    S.decodeTo(S.OptionFromNullOr(schema), {
      decode: SchemaGetter.transform((input) => (input === "" ? null : input)),
      encode: SchemaGetter.transform((input) => (P.isNull(input) ? "" : input)),
    }),
    $I.annoteSchema("OptionFromEmptyText", {
      description: "Maps empty Koinly CSV text to Option.none and non-empty text through the provided schema.",
    })
  );

/**
 * Koinly synthetic transaction identifier used for some exchange trades.
 *
 * @category Validation
 * @since 0.0.0
 */
export const KoinlySyntheticTransactionId = NonEmptyTrimmedStr.check(
  S.isPattern(koinlySyntheticTransactionIdPattern, {
    identifier: $I`KoinlySyntheticTransactionIdFormatCheck`,
    title: "Koinly Synthetic Transaction Identifier Format",
    description: "A Koinly synthetic transaction identifier such as `78341818_bnb`.",
    message: "KoinlySyntheticTransactionId must match the Koinly synthetic transaction identifier format",
  })
).pipe(
  S.brand("KoinlySyntheticTransactionId"),
  $I.annoteSchema("KoinlySyntheticTransactionId", {
    description: "Koinly synthetic transaction identifier such as `78341818_bnb`.",
  })
);

/**
 * Runtime type for {@link KoinlySyntheticTransactionId}.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type KoinlySyntheticTransactionId = typeof KoinlySyntheticTransactionId.Type;

/**
 * Mixed transaction reference used by Koinly rows.
 *
 * This accepts canonical chain hashes via `CryptoTxnHash` and synthetic
 * Koinly identifiers for internal exchange transactions.
 *
 * @category Validation
 * @since 0.0.0
 */
export const KoinlyTransactionReference = S.Union([CryptoTxnHash, KoinlySyntheticTransactionId]).pipe(
  $I.annoteSchema("KoinlyTransactionReference", {
    description: "Mixed Koinly transaction reference accepting canonical chain hashes and Koinly synthetic IDs.",
  })
);

/**
 * Runtime type for {@link KoinlyTransactionReference}.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type KoinlyTransactionReference = typeof KoinlyTransactionReference.Type;

/**
 * Redacted mixed transaction reference used by Koinly rows.
 *
 * @category Validation
 * @since 0.0.0
 */
export const KoinlyTransactionReferenceRedacted = KoinlyTransactionReference.pipe(
  S.RedactedFromValue,
  SchemaUtils.withStatics(() => ({
    makeRedacted: flow(KoinlyTransactionReference.makeUnsafe, Redacted.make),
  })),
  $I.annoteSchema("KoinlyTransactionReferenceRedacted", {
    description: "Redacted Koinly transaction reference accepting canonical chain hashes and Koinly synthetic IDs.",
  })
);

/**
 * Runtime type for {@link KoinlyTransactionReferenceRedacted}.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type KoinlyTransactionReferenceRedacted = typeof KoinlyTransactionReferenceRedacted.Type;
