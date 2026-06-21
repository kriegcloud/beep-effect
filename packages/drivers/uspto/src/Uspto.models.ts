/**
 * Schema models for USPTO Open Data Portal responses and identifiers.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $UsptoId } from "@beep/identity";
import { Str } from "@beep/utils";
import { flow, pipe } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const $I = $UsptoId.create("Uspto.models");

const applicationNumberPattern = /^\d{8}$/;
const patentNumberPattern = /^(?:RE|PP|D|H|T)?\d{5,8}$/;

/**
 * Normalized eight-digit USPTO application number.
 *
 * @example
 * ```ts
 * import { UsptoApplicationNumber } from "@beep/uspto"
 *
 * console.log(UsptoApplicationNumber)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const UsptoApplicationNumber = S.String.check(
  S.isPattern(applicationNumberPattern, {
    identifier: $I`UsptoApplicationNumberPatternCheck`,
    title: "USPTO Application Number",
    description: "A normalized USPTO application number is exactly eight digits.",
    message: "Expected an eight-digit USPTO application number",
  })
).pipe(
  S.brand("UsptoApplicationNumber"),
  $I.annoteSchema("UsptoApplicationNumber", {
    description: "Normalized eight-digit USPTO application number (series code plus serial number).",
  })
);

/**
 * Type for {@link UsptoApplicationNumber}.
 *
 * @category models
 * @since 0.0.0
 */
export type UsptoApplicationNumber = typeof UsptoApplicationNumber.Type;

/**
 * Normalized USPTO patent number with optional kind prefix.
 *
 * @example
 * ```ts
 * import { UsptoPatentNumber } from "@beep/uspto"
 *
 * console.log(UsptoPatentNumber)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const UsptoPatentNumber = S.String.check(
  S.isPattern(patentNumberPattern, {
    identifier: $I`UsptoPatentNumberPatternCheck`,
    title: "USPTO Patent Number",
    description: "A normalized USPTO patent number is five to eight digits with an optional RE/PP/D/H/T prefix.",
    message: "Expected a normalized USPTO patent number",
  })
).pipe(
  S.brand("UsptoPatentNumber"),
  $I.annoteSchema("UsptoPatentNumber", {
    description: "Normalized USPTO patent number without commas or kind codes.",
  })
);

/**
 * Type for {@link UsptoPatentNumber}.
 *
 * @category models
 * @since 0.0.0
 */
export type UsptoPatentNumber = typeof UsptoPatentNumber.Type;

/**
 * Normalize free-text into a USPTO application number candidate.
 *
 * Strips separators such as `/`, `,`, `.`, and spaces (for example
 * `16/123,456` becomes `16123456`).
 *
 * @param text - Free-text application number candidate.
 * @returns The normalized eight-digit form, or none.
 * @example
 * ```ts
 * import { normalizeUsptoApplicationNumber } from "@beep/uspto"
 * import * as O from "effect/Option"
 *
 * console.log(O.isSome(normalizeUsptoApplicationNumber("16/123,456"))) // true
 * console.log(O.isNone(normalizeUsptoApplicationNumber("not a number"))) // true
 * ```
 *
 * @category parsers
 * @since 0.0.0
 */
export const normalizeUsptoApplicationNumber = (text: string): O.Option<string> =>
  pipe(text.replaceAll(/[\s/,.-]/gu, ""), (candidate) =>
    applicationNumberPattern.test(candidate) ? O.some(candidate) : O.none()
  );

/**
 * Normalize free-text into a USPTO patent number candidate.
 *
 * Strips `US` prefixes, kind codes (for example `B2`), commas, and spaces
 * (for example `US 10,772,255 B2` becomes `10772255`).
 *
 * @param text - Free-text patent number candidate.
 * @returns The normalized form, or none.
 * @example
 * ```ts
 * import { normalizeUsptoPatentNumber } from "@beep/uspto"
 * import * as O from "effect/Option"
 *
 * console.log(O.isSome(normalizeUsptoPatentNumber("US 10,772,255 B2"))) // true
 * ```
 *
 * @category parsers
 * @since 0.0.0
 */
export const normalizeUsptoPatentNumber: (text: string) => O.Option<string> = flow(
  Str.toUpperCase,
  Str.replaceAll(/[\s,]/gu, ""),
  Str.replace(/^US/u, ""),
  Str.replace(/[A-Z]\d?$/u, ""),
  (candidate) => (patentNumberPattern.test(candidate) ? O.some(candidate) : O.none())
);

/**
 * Official application metadata resolved from the Open Data Portal.
 *
 * @example
 * ```ts
 * import { UsptoApplicationMetadata } from "@beep/uspto"
 *
 * console.log(UsptoApplicationMetadata)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class UsptoApplicationMetadata extends S.Class<UsptoApplicationMetadata>($I`UsptoApplicationMetadata`)(
  {
    applicationNumberText: S.NonEmptyString,
    applicationStatusDescriptionText: S.optionalKey(S.String),
    applicationTypeLabelName: S.optionalKey(S.String),
    docketNumber: S.optionalKey(S.String),
    earliestPublicationNumber: S.optionalKey(S.String),
    filingDate: S.optionalKey(S.String),
    firstApplicantName: S.optionalKey(S.String),
    firstInventorName: S.optionalKey(S.String),
    grantDate: S.optionalKey(S.String),
    inventionTitle: S.optionalKey(S.String),
    patentNumber: S.optionalKey(S.String),
  },
  $I.annote("UsptoApplicationMetadata", {
    description: "Official USPTO application metadata projected from a patent file wrapper response.",
  })
) {}

/**
 * Parent and child continuity application numbers for one application.
 *
 * @example
 * ```ts
 * import { UsptoContinuity } from "@beep/uspto"
 *
 * const continuity = UsptoContinuity.make({ childApplicationNumbers: [], parentApplicationNumbers: [] })
 * console.log(continuity)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class UsptoContinuity extends S.Class<UsptoContinuity>($I`UsptoContinuity`)(
  {
    childApplicationNumbers: S.Array(S.String),
    parentApplicationNumbers: S.Array(S.String),
  },
  $I.annote("UsptoContinuity", {
    description: "Parent and child continuity application numbers anchoring an application to its patent family.",
  })
) {}

/**
 * Reference to one document in an application file wrapper.
 *
 * @example
 * ```ts
 * import { UsptoDocumentReference } from "@beep/uspto"
 *
 * console.log(UsptoDocumentReference)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class UsptoDocumentReference extends S.Class<UsptoDocumentReference>($I`UsptoDocumentReference`)(
  {
    documentCode: S.optionalKey(S.String),
    documentCodeDescriptionText: S.optionalKey(S.String),
    documentIdentifier: S.NonEmptyString,
    downloadUrl: S.optionalKey(S.String),
    officialDate: S.optionalKey(S.String),
  },
  $I.annote("UsptoDocumentReference", {
    description: "Reference to one file-wrapper document, including its download URL when published.",
  })
) {}
