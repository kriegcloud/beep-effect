/**
 * CSP header schema & constructor's
 * @since 0.0.0
 * @module @beep/schema/http/headers/SecureHeaderError
 */
import { $SchemaId } from "@beep/identity";
import { Tuple } from "effect";
import * as S from "effect/Schema";
import { TaggedErrorClass, type TaggedErrorClassFromFields } from "../../TaggedErrorClass.ts";
import { SecureHeader } from "./SecureHeader.ts";

const $I = $SchemaId.create("http/headers/SecureHeaderError");
const commonFields = {
  message: S.String,
  cause: S.OptionFromOptionalKey(S.DefectWithStack),
} satisfies S.Struct.Fields;
const makeSecureHeaderErrorBase = <Self, Tag extends string>(
  name: string,
  tag: Tag,
  description: string
): TaggedErrorClassFromFields<Self, Tag, typeof commonFields> =>
  TaggedErrorClass<Self>($I.make(name))(
    tag,
    commonFields,
    $I.annote(name, {
      description,
    })
  );
const CspErrorBase = makeSecureHeaderErrorBase<CspError, typeof SecureHeader.Enum.CONTENT_SECURITY_POLICY>(
  "CspError",
  SecureHeader.Enum.CONTENT_SECURITY_POLICY,
  "A CSP error."
);
const ForceHttpsRedirectErrorBase = makeSecureHeaderErrorBase<
  ForceHttpsRedirectError,
  typeof SecureHeader.Enum.FORCE_HTTPS_REDIRECT
>("ForceHttpsRedirectError", SecureHeader.Enum.FORCE_HTTPS_REDIRECT, "A force HTTPS redirect error.");
const XssProtectionErrorBase = makeSecureHeaderErrorBase<XssProtectionError, typeof SecureHeader.Enum.XSS_PROTECTION>(
  "XssProtectionError",
  SecureHeader.Enum.XSS_PROTECTION,
  "An XSS protection error."
);
const ReferrerPolicyErrorBase = makeSecureHeaderErrorBase<
  ReferrerPolicyError,
  typeof SecureHeader.Enum.REFERRER_POLICY
>("ReferrerPolicyError", SecureHeader.Enum.REFERRER_POLICY, "A referrer policy error.");
const NoSniffErrorBase = makeSecureHeaderErrorBase<NoSniffError, typeof SecureHeader.Enum.NO_SNIFF>(
  "NoSniffError",
  SecureHeader.Enum.NO_SNIFF,
  "A no sniff error."
);
const NoOpenErrorBase = makeSecureHeaderErrorBase<NoOpenError, typeof SecureHeader.Enum.NO_OPEN>(
  "NoOpenError",
  SecureHeader.Enum.NO_OPEN,
  "A no open error."
);
const FrameGuardErrorBase = makeSecureHeaderErrorBase<FrameGuardError, typeof SecureHeader.Enum.FRAME_GUARD>(
  "FrameGuardError",
  SecureHeader.Enum.FRAME_GUARD,
  "A frame guard error."
);
const ExpectCtErrorBase = makeSecureHeaderErrorBase<ExpectCtError, typeof SecureHeader.Enum.EXPECT_CT>(
  "ExpectCtError",
  SecureHeader.Enum.EXPECT_CT,
  "An Expect-CT error."
);
const PermissionsPolicyErrorBase = makeSecureHeaderErrorBase<
  PermissionsPolicyError,
  typeof SecureHeader.Enum.PERMISSIONS_POLICY
>("PermissionsPolicyError", SecureHeader.Enum.PERMISSIONS_POLICY, "A permissions policy error.");
const CrossOriginOpenerPolicyErrorBase = makeSecureHeaderErrorBase<
  CrossOriginOpenerPolicyError,
  typeof SecureHeader.Enum.CROSS_ORIGIN_OPENER_POLICY
>("CrossOriginOpenerPolicyError", SecureHeader.Enum.CROSS_ORIGIN_OPENER_POLICY, "A cross-origin opener policy error.");
const CrossOriginEmbedderPolicyErrorBase = makeSecureHeaderErrorBase<
  CrossOriginEmbedderPolicyError,
  typeof SecureHeader.Enum.CROSS_ORIGIN_EMBEDDER_POLICY
>(
  "CrossOriginEmbedderPolicyError",
  SecureHeader.Enum.CROSS_ORIGIN_EMBEDDER_POLICY,
  "A cross-origin embedder policy error."
);
const CrossOriginResourcePolicyErrorBase = makeSecureHeaderErrorBase<
  CrossOriginResourcePolicyError,
  typeof SecureHeader.Enum.CROSS_ORIGIN_RESOURCE_POLICY
>(
  "CrossOriginResourcePolicyError",
  SecureHeader.Enum.CROSS_ORIGIN_RESOURCE_POLICY,
  "A cross-origin resource policy error."
);
const PermittedCrossDomainPoliciesErrorBase = makeSecureHeaderErrorBase<
  PermittedCrossDomainPoliciesError,
  typeof SecureHeader.Enum.PERMITTED_CROSS_DOMAIN_POLICIES
>(
  "PermittedCrossDomainPoliciesError",
  SecureHeader.Enum.PERMITTED_CROSS_DOMAIN_POLICIES,
  "A permitted cross-domain policies error."
);
const CoreErrorBase = makeSecureHeaderErrorBase<CoreError, typeof SecureHeader.Enum.CORE>(
  "CoreError",
  SecureHeader.Enum.CORE,
  "A core error."
);

/**
 * @since 0.0.0
 */
export class CspError extends CspErrorBase {}

/**
 * @since 0.0.0
 */
export class ForceHttpsRedirectError extends ForceHttpsRedirectErrorBase {}

/**
 * @since 0.0.0
 */
export class XssProtectionError extends XssProtectionErrorBase {}

/**
 * @since 0.0.0
 */
export class ReferrerPolicyError extends ReferrerPolicyErrorBase {}

/**
 * @since 0.0.0
 */
export class NoSniffError extends NoSniffErrorBase {}

/**
 * @since 0.0.0
 */
export class NoOpenError extends NoOpenErrorBase {}

/**
 * @since 0.0.0
 */
export class FrameGuardError extends FrameGuardErrorBase {}

/**
 * @since 0.0.0
 */
export class ExpectCtError extends ExpectCtErrorBase {}

/**
 * @since 0.0.0
 */
export class PermissionsPolicyError extends PermissionsPolicyErrorBase {}

/**
 * @since 0.0.0
 */
export class CrossOriginOpenerPolicyError extends CrossOriginOpenerPolicyErrorBase {}

/**
 * @since 0.0.0
 */
export class CrossOriginEmbedderPolicyError extends CrossOriginEmbedderPolicyErrorBase {}

/**
 * @since 0.0.0
 */
export class CrossOriginResourcePolicyError extends CrossOriginResourcePolicyErrorBase {}

/**
 * @since 0.0.0
 */
export class PermittedCrossDomainPoliciesError extends PermittedCrossDomainPoliciesErrorBase {}

/**
 * @since 0.0.0
 */
export class CoreError extends CoreErrorBase {}

/**
 * @since 0.0.0
 */
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

/**
 * @since 0.0.0
 */
export type SecureHeaderError = typeof SecureHeaderError.Type;
