/**
 * CSP header schema & constructor's
 * @since 0.0.0
 * @module @beep/schema/http/headers/SecureHeader
 */
import { $SchemaId } from "@beep/identity";
import { LiteralKit } from "../../LiteralKit.ts";
import * as SchemaUtils from "../../SchemaUtils/index.ts";

const $I = $SchemaId.create("http/headers/SecureHeader");

const SecureHeaderBase = LiteralKit([
  "CONTENT_SECURITY_POLICY",
  "FORCE_HTTPS_REDIRECT",
  "XSS_PROTECTION",
  "REFERRER_POLICY",
  "NO_SNIFF",
  "NO_OPEN",
  "FRAME_GUARD",
  "EXPECT_CT",
  "PERMISSIONS_POLICY",
  "CROSS_ORIGIN_OPENER_POLICY",
  "CROSS_ORIGIN_EMBEDDER_POLICY",
  "CROSS_ORIGIN_RESOURCE_POLICY",
  "PERMITTED_CROSS_DOMAIN_POLICIES",
  "CORE",
]);

export const SecureHeader = SecureHeaderBase.pipe(
  $I.annoteSchema("SecureHeader", {
    description: "A secure header.",
  }),
  SchemaUtils.withLiteralKitStatics(SecureHeaderBase)
);

export type SecureHeader = typeof SecureHeader.Type;
