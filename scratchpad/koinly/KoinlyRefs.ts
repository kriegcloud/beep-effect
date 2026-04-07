/**
 * Scratchpad-local Koinly wallet and currency reference schemas.
 *
 * @module scratchpad/koinly/KoinlyRefs
 * @since 0.0.0
 */

import { $ScratchId } from "@beep/identity";
import { NonEmptyTrimmedStr } from "@beep/schema/String";
import { PosInt } from "@beep/schema/Int";
import { Effect, SchemaGetter, SchemaIssue, pipe } from "effect";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const $I = $ScratchId.create("koinly/KoinlyRefs");

const compoundTextPattern = /^([^;]+);([^;]+)$/;

const invalidValueIssue = (input: string, message: string): SchemaIssue.Issue =>
  new SchemaIssue.InvalidValue(O.some(input), {
    message,
  });

const decodeCompoundText = (
  input: string
): O.Option<readonly [left: string, right: string]> => {
  const match = compoundTextPattern.exec(input);

  if (P.isNull(match)) {
    return O.none();
  }

  const left = match[1];
  const right = match[2];

  if (!P.isString(left) || !P.isString(right)) {
    return O.none();
  }

  const normalizedLeft = Str.trim(left);
  const normalizedRight = Str.trim(right);

  return Str.isNonEmpty(normalizedLeft) && Str.isNonEmpty(normalizedRight)
    ? O.some([normalizedLeft, normalizedRight] as const)
    : O.none();
};

/**
 * Wallet display name extracted from a Koinly wallet reference.
 *
 * @category Validation
 * @since 0.0.0
 */
export const KoinlyWalletName = NonEmptyTrimmedStr.check(
  S.makeFilter((value: string) => !Str.includes(";")(value), {
    identifier: $I`KoinlyWalletNameNoSemicolonCheck`,
    title: "KoinlyWalletName No Semicolon",
    description: "A Koinly wallet display name without the semicolon separator.",
    message: "KoinlyWalletName must not contain ';'",
  })
).pipe(
  S.brand("KoinlyWalletName"),
  $I.annoteSchema("KoinlyWalletName", {
    description: "Koinly wallet display name without the semicolon separator.",
  })
);

/**
 * Runtime type for {@link KoinlyWalletName}.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type KoinlyWalletName = typeof KoinlyWalletName.Type;

/**
 * Wallet slug extracted from a Koinly wallet reference.
 *
 * @category Validation
 * @since 0.0.0
 */
export const KoinlyWalletSlug = NonEmptyTrimmedStr.check(
  S.makeFilter((value: string) => !Str.includes(";")(value), {
    identifier: $I`KoinlyWalletSlugNoSemicolonCheck`,
    title: "KoinlyWalletSlug No Semicolon",
    description: "A Koinly wallet slug without the semicolon separator.",
    message: "KoinlyWalletSlug must not contain ';'",
  })
).pipe(
  S.brand("KoinlyWalletSlug"),
  $I.annoteSchema("KoinlyWalletSlug", {
    description: "Koinly wallet slug without the semicolon separator.",
  })
);

/**
 * Runtime type for {@link KoinlyWalletSlug}.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type KoinlyWalletSlug = typeof KoinlyWalletSlug.Type;

/**
 * Currency symbol extracted from a Koinly currency reference.
 *
 * This intentionally allows non-ISO symbols and spam-like labels because the
 * export contains both.
 *
 * @category Validation
 * @since 0.0.0
 */
export const KoinlyCurrencySymbol = NonEmptyTrimmedStr.check(
  S.makeFilter((value: string) => !Str.includes(";")(value), {
    identifier: $I`KoinlyCurrencySymbolNoSemicolonCheck`,
    title: "KoinlyCurrencySymbol No Semicolon",
    description: "A Koinly currency symbol or label without the semicolon separator.",
    message: "KoinlyCurrencySymbol must not contain ';'",
  })
).pipe(
  S.brand("KoinlyCurrencySymbol"),
  $I.annoteSchema("KoinlyCurrencySymbol", {
    description: "Koinly currency symbol or label without the semicolon separator.",
  })
);

/**
 * Runtime type for {@link KoinlyCurrencySymbol}.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type KoinlyCurrencySymbol = typeof KoinlyCurrencySymbol.Type;

/**
 * Positive numeric Koinly currency identifier.
 *
 * @category Validation
 * @since 0.0.0
 */
export const KoinlyCurrencyId = S.String.pipe(
  S.decodeTo(PosInt, {
    decode: SchemaGetter.transformOrFail((input) => {
      const numeric = Number(input);

      return Number.isSafeInteger(numeric) && numeric > 0
        ? Effect.succeed(numeric)
        : Effect.fail(
          invalidValueIssue(input, "KoinlyCurrencyId must be a positive safe integer encoded as text")
        );
    }),
    encode: SchemaGetter.transform((input) => `${input}`),
  }),
  $I.annoteSchema("KoinlyCurrencyId", {
    description: "Positive numeric Koinly currency identifier transported as text.",
  })
);

/**
 * Runtime type for {@link KoinlyCurrencyId}.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type KoinlyCurrencyId = typeof KoinlyCurrencyId.Type;

/**
 * Raw wallet reference text from the Koinly export.
 *
 * Example: `Crypto.com;crypto_com`
 *
 * @category Validation
 * @since 0.0.0
 */
export const KoinlyWalletRefText = NonEmptyTrimmedStr.check(
  S.makeFilter((value: string) => O.isSome(decodeCompoundText(value)), {
    identifier: $I`KoinlyWalletRefTextFormatCheck`,
    title: "KoinlyWalletRefText Format",
    description: "A Koinly wallet reference encoded as `name;slug`.",
    message: "KoinlyWalletRefText must match `name;slug`",
  })
).pipe(
  S.brand("KoinlyWalletRefText"),
  $I.annoteSchema("KoinlyWalletRefText", {
    description: "Raw Koinly wallet reference encoded as `name;slug`.",
  })
);

/**
 * Runtime type for {@link KoinlyWalletRefText}.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type KoinlyWalletRefText = typeof KoinlyWalletRefText.Type;

/**
 * Raw currency reference text from the Koinly export.
 *
 * Example: `USDC;3054`
 *
 * @category Validation
 * @since 0.0.0
 */
export const KoinlyCurrencyRefText = NonEmptyTrimmedStr.check(
  S.makeFilter((value: string) => O.isSome(decodeCompoundText(value)), {
    identifier: $I`KoinlyCurrencyRefTextFormatCheck`,
    title: "KoinlyCurrencyRefText Format",
    description: "A Koinly currency reference encoded as `symbol;numericId`.",
    message: "KoinlyCurrencyRefText must match `symbol;numericId`",
  })
).pipe(
  S.brand("KoinlyCurrencyRefText"),
  $I.annoteSchema("KoinlyCurrencyRefText", {
    description: "Raw Koinly currency reference encoded as `symbol;numericId`.",
  })
);

/**
 * Runtime type for {@link KoinlyCurrencyRefText}.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type KoinlyCurrencyRefText = typeof KoinlyCurrencyRefText.Type;

/**
 * Structured wallet reference extracted from Koinly text.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class KoinlyWalletRef extends S.Class<KoinlyWalletRef>($I`KoinlyWalletRef`)(
  {
    name: KoinlyWalletName,
    slug: KoinlyWalletSlug,
  },
  $I.annote("KoinlyWalletRef", {
    description: "Structured wallet reference extracted from Koinly text.",
  })
) {}

/**
 * Structured currency reference extracted from Koinly text.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class KoinlyCurrencyRef extends S.Class<KoinlyCurrencyRef>($I`KoinlyCurrencyRef`)(
  {
    symbol: KoinlyCurrencySymbol,
    koinlyId: KoinlyCurrencyId,
  },
  $I.annote("KoinlyCurrencyRef", {
    description: "Structured currency reference extracted from Koinly text.",
  })
) {}

/**
 * Transformation from wallet reference text to a structured wallet object.
 *
 * @category Validation
 * @since 0.0.0
 */
export const KoinlyWalletRefFromText = KoinlyWalletRefText.pipe(
  S.decodeTo(KoinlyWalletRef, {
    decode: SchemaGetter.transformOrFail((input) =>
      pipe(
        decodeCompoundText(input),
        O.match({
          onNone: () =>
            Effect.fail(invalidValueIssue(input, "KoinlyWalletRefFromText must match `name;slug`")),
          onSome: ([name, slug]) =>
            Effect.succeed({
              name,
              slug,
            }),
        })
      )
    ),
    encode: SchemaGetter.transform(({ name, slug }) =>
      S.decodeUnknownSync(KoinlyWalletRefText)(`${name};${slug}`)
    ),
  }),
  $I.annoteSchema("KoinlyWalletRefFromText", {
    description: "Transforms Koinly wallet reference text into a structured wallet reference.",
  })
);

/**
 * Runtime type for {@link KoinlyWalletRefFromText}.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type KoinlyWalletRefFromText = typeof KoinlyWalletRefFromText.Type;

/**
 * Transformation from currency reference text to a structured currency object.
 *
 * @category Validation
 * @since 0.0.0
 */
export const KoinlyCurrencyRefFromText = KoinlyCurrencyRefText.pipe(
  S.decodeTo(KoinlyCurrencyRef, {
    decode: SchemaGetter.transformOrFail((input) =>
      pipe(
        decodeCompoundText(input),
        O.match({
          onNone: () =>
            Effect.fail(invalidValueIssue(input, "KoinlyCurrencyRefFromText must match `symbol;numericId`")),
          onSome: ([symbol, koinlyId]) =>
            Effect.succeed({
              symbol,
              koinlyId,
            }),
        })
      )
    ),
    encode: SchemaGetter.transform(({ symbol, koinlyId }) =>
      S.decodeUnknownSync(KoinlyCurrencyRefText)(`${symbol};${koinlyId}`)
    ),
  }),
  $I.annoteSchema("KoinlyCurrencyRefFromText", {
    description: "Transforms Koinly currency reference text into a structured currency reference.",
  })
);

/**
 * Runtime type for {@link KoinlyCurrencyRefFromText}.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type KoinlyCurrencyRefFromText = typeof KoinlyCurrencyRefFromText.Type;

/**
 * Decoder for structured wallet references from raw Koinly text.
 *
 * @category Validation
 * @since 0.0.0
 */
export const decodeKoinlyWalletRef = S.decodeUnknownEffect(KoinlyWalletRefFromText);

/**
 * Decoder for structured currency references from raw Koinly text.
 *
 * @category Validation
 * @since 0.0.0
 */
export const decodeKoinlyCurrencyRef = S.decodeUnknownEffect(KoinlyCurrencyRefFromText);
