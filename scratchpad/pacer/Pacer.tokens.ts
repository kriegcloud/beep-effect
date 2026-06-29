/**
 * Branded value objects and literal enumerations shared across the PACER POC.
 *
 * These are the small, dependency-free schema primitives that the auth and PCL
 * models build on: the opaque `NextGenCSO` auth token, the `loginResult` codes
 * returned by the Authentication API, and the PCL `jurisdictionType` codes.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $ScratchpadId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $ScratchpadId.create("pacer/Pacer.tokens");

/**
 * The opaque 128-character PACER `nextGenCSO` authentication token.
 *
 * Branded so it can never be confused with an ordinary string; the service
 * layer wraps it in {@link effect/Redacted.Redacted} before it is stored or
 * threaded onto downstream PCL requests.
 *
 * @category models
 * @since 0.0.0
 */
export const NextGenCsoToken = S.String.pipe(
  S.brand("NextGenCsoToken"),
  $I.annoteSchema("NextGenCsoToken", {
    description: "Opaque PACER nextGenCSO authentication token (128 characters on success).",
  })
);

/**
 * Type for {@link NextGenCsoToken}.
 *
 * @category models
 * @since 0.0.0
 */
export type NextGenCsoToken = typeof NextGenCsoToken.Type;

/**
 * Documented PACER `loginResult` codes from the Authentication API.
 *
 * `"0"` = a token was issued (note: a non-empty `errorDescription` can still
 * accompany `"0"` as a non-fatal search-privilege warning); `"1"` = a registered
 * filer omitted the redaction flag; `"13"` = invalid username, password, or OTP.
 * Any non-`"0"` value means authentication failed and `nextGenCSO` is empty.
 *
 * @category models
 * @since 0.0.0
 */
export const LoginResult = LiteralKit(["0", "1", "13"]).pipe(
  $I.annoteSchema("LoginResult", {
    description: "Documented PACER cso-auth loginResult codes: 0 ok, 1 redaction-flag missing, 13 invalid creds/OTP.",
  })
);

/**
 * Type for {@link LoginResult}.
 *
 * @category models
 * @since 0.0.0
 */
export type LoginResult = typeof LoginResult.Type;

/**
 * PCL request `jurisdictionType` codes (lowercase): appellate, bankruptcy,
 * criminal, civil, and JPML/multidistrict. Note the PCL *response* spells
 * jurisdiction out (e.g. `"Civil"`), so responses keep a plain string.
 *
 * @category models
 * @since 0.0.0
 */
export const JurisdictionType = LiteralKit(["ap", "bk", "cr", "cv", "mdl"]).pipe(
  $I.annoteSchema("JurisdictionType", {
    description: "PCL request jurisdictionType codes: ap, bk, cr, cv, mdl.",
  })
);

/**
 * Type for {@link JurisdictionType}.
 *
 * @category models
 * @since 0.0.0
 */
export type JurisdictionType = typeof JurisdictionType.Type;

/**
 * A PCL "full" case number, e.g. `1:2002bk20340`.
 *
 * Plain `string` at the type level, but it carries a custom `toArbitrary`
 * annotation so any schema-derived generation (`Schema.toArbitrary` for mock
 * bodies and property tests) produces realistic case numbers instead of random
 * unicode — exercising the real shape rather than hardcoded fixtures.
 *
 * @category models
 * @since 0.0.0
 */
export const CaseNumberFull = S.String.pipe(
  $I.annoteSchema("CaseNumberFull", {
    description: "PCL full case number, e.g. 1:2002bk20340.",
  })
).annotate({
  toArbitrary: () => (fc) =>
    fc.constantFrom("1:2002bk20340", "2:2019cv01234", "0:2001ap00100", "3:2020bk00777", "1:2018cr00045"),
});

/**
 * Type for {@link CaseNumberFull}.
 *
 * @category models
 * @since 0.0.0
 */
export type CaseNumberFull = typeof CaseNumberFull.Type;

/**
 * Which PACER environment the POC targets. QA is non-billable test data; prod
 * is the real, billable service.
 *
 * @category models
 * @since 0.0.0
 */
export const PacerEnvironment = LiteralKit(["qa", "prod"]).pipe(
  $I.annoteSchema("PacerEnvironment", {
    description: "Target PACER environment: qa (non-billable test data) or prod (billable).",
  })
);

/**
 * Type for {@link PacerEnvironment}.
 *
 * @category models
 * @since 0.0.0
 */
export type PacerEnvironment = typeof PacerEnvironment.Type;
