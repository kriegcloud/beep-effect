/**
 * CSP header schema & constructor's
 * @since 0.0.0
 * @module @beep/schema/http/headers/SecureHeaderError
 */
import { $SchemaId } from "@beep/identity";
import { Tuple } from "effect";
import * as S from "effect/Schema";
import { TaggedErrorClass } from "../../TaggedErrorClass.ts";
import { SecureHeader } from "./SecureHeader.ts";

const $I = $SchemaId.create("http/headers/SecureHeaderError");
const commonFields = {
  message: S.String,
  cause: S.OptionFromOptionalKey(S.DefectWithStack),
};

export class CspError extends TaggedErrorClass<CspError>($I`CspError`)(
  SecureHeader.Enum.CONTENT_SECURITY_POLICY,
  commonFields,
  $I.annote("CspError", {
    description: "A CSP error.",
  })
) {}

export class ForceHttpsRedirectError extends TaggedErrorClass<ForceHttpsRedirectError>($I`ForceHttpsRedirectError`)(
  SecureHeader.Enum.FORCE_HTTPS_REDIRECT,
  commonFields,
  $I.annote("ForceHttpsRedirectError", {
    description: "A force HTTPS redirect error.",
  })
) {}

export class XssProtectionError extends TaggedErrorClass<XssProtectionError>($I`XssProtectionError`)(
  SecureHeader.Enum.XSS_PROTECTION,
  commonFields,
  $I.annote("XssProtectionError", {
    description: "An XSS protection error.",
  })
) {}

export class ReferrerPolicyError extends TaggedErrorClass<ReferrerPolicyError>($I`ReferrerPolicyError`)(
  SecureHeader.Enum.REFERRER_POLICY,
  commonFields,
  $I.annote("ReferrerPolicyError", {
    description: "A referrer policy error.",
  })
) {}

export class NoSniffError extends TaggedErrorClass<NoSniffError>($I`NoSniffError`)(
  SecureHeader.Enum.NO_SNIFF,
  commonFields,
  $I.annote("NoSniffError", {
    description: "A no sniff error.",
  })
) {}

export class NoOpenError extends TaggedErrorClass<NoOpenError>($I`NoOpenError`)(
  SecureHeader.Enum.NO_OPEN,
  commonFields,
  $I.annote("NoOpenError", {
    description: "A no open error.",
  })
) {}

export class FrameGuardError extends TaggedErrorClass<FrameGuardError>($I`FrameGuardError`)(
  SecureHeader.Enum.FRAME_GUARD,
  commonFields,
  $I.annote("FrameGuardError", {
    description: "A frame guard error.",
  })
) {}

export class ExpectCtError extends TaggedErrorClass<ExpectCtError>($I`ExpectCtError`)(
  SecureHeader.Enum.EXPECT_CT,
  commonFields,
  $I.annote("ExpectCtError", {
    description: "An Expect-CT error.",
  })
) {}

export class PermissionsPolicyError extends TaggedErrorClass<PermissionsPolicyError>($I`PermissionsPolicyError`)(
  SecureHeader.Enum.PERMISSIONS_POLICY,
  commonFields,
  $I.annote("PermissionsPolicyError", {
    description: "A permissions policy error.",
  })
) {}

export class CrossOriginOpenerPolicyError extends TaggedErrorClass<CrossOriginOpenerPolicyError>(
  $I`CrossOriginOpenerPolicyError`
)(
  SecureHeader.Enum.CROSS_ORIGIN_OPENER_POLICY,
  commonFields,
  $I.annote("CrossOriginOpenerPolicyError", {
    description: "A cross-origin opener policy error.",
  })
) {}

export class CrossOriginEmbedderPolicyError extends TaggedErrorClass<CrossOriginEmbedderPolicyError>(
  $I`CrossOriginEmbedderPolicyError`
)(
  SecureHeader.Enum.CROSS_ORIGIN_EMBEDDER_POLICY,
  commonFields,
  $I.annote("CrossOriginEmbedderPolicyError", {
    description: "A cross-origin embedder policy error.",
  })
) {}

export class CrossOriginResourcePolicyError extends TaggedErrorClass<CrossOriginResourcePolicyError>(
  $I`CrossOriginResourcePolicyError`
)(
  SecureHeader.Enum.CROSS_ORIGIN_RESOURCE_POLICY,
  commonFields,
  $I.annote("CrossOriginResourcePolicyError", {
    description: "A cross-origin resource policy error.",
  })
) {}

export class PermittedCrossDomainPoliciesError extends TaggedErrorClass<PermittedCrossDomainPoliciesError>(
  $I`PermittedCrossDomainPoliciesError`
)(
  SecureHeader.Enum.PERMITTED_CROSS_DOMAIN_POLICIES,
  commonFields,
  $I.annote("PermittedCrossDomainPoliciesError", {
    description: "A permitted cross-domain policies error.",
  })
) {}

export class CoreError extends TaggedErrorClass<CoreError>($I`CoreError`)(
  SecureHeader.Enum.CORE,
  commonFields,
  $I.annote("CoreError", {
    description: "A core error.",
  })
) {}

export const SecureHeaderError = SecureHeader.mapMembers(
  Tuple.evolve([
    () => CspError,
    () => ForceHttpsRedirectError,
    () => XssProtectionError,
    () => ReferrerPolicyError,
    () => NoSniffError,
    () => NoOpenError,
    () => FrameGuardError,
    () => ExpectCtError,
    () => PermissionsPolicyError,
    () => CrossOriginOpenerPolicyError,
    () => CrossOriginEmbedderPolicyError,
    () => CrossOriginResourcePolicyError,
    () => PermittedCrossDomainPoliciesError,
    () => CoreError,
  ])
).pipe(
  S.toTaggedUnion("_tag"),
  $I.annoteSchema("SecureHeaderError", {
    description: "A secure header error.",
  })
);

export type SecureHeaderError = typeof SecureHeaderError.Type;
