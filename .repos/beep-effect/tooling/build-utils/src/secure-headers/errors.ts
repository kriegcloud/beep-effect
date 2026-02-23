import * as Data from "effect/Data";

const SecureHeadersTypeEnum = {
  CONTENT_SECURITY_POLICY: "CONTENT_SECURITY_POLICY",
  FORCE_HTTPS_REDIRECT: "FORCE_HTTPS_REDIRECT",
  XSS_PROTECTION: "XSS_PROTECTION",
  REFERRER_POLICY: "REFERRER_POLICY",
  NO_SNIFF: "NO_SNIFF",
  NO_OPEN: "NO_OPEN",
  FRAME_GUARD: "FRAME_GUARD",
  EXPECT_CT: "EXPECT_CT",
  PERMISSIONS_POLICY: "PERMISSIONS_POLICY",
  CROSS_ORIGIN_OPENER_POLICY: "CROSS_ORIGIN_OPENER_POLICY",
  CROSS_ORIGIN_EMBEDDER_POLICY: "CROSS_ORIGIN_EMBEDDER_POLICY",
  CROSS_ORIGIN_RESOURCE_POLICY: "CROSS_ORIGIN_RESOURCE_POLICY",
  PERMITTED_CROSS_DOMAIN_POLICIES: "PERMITTED_CROSS_DOMAIN_POLICIES",
  CORE: "CORE",
} as const;

export type SecureHeadersErrorType = (typeof SecureHeadersTypeEnum)[keyof typeof SecureHeadersTypeEnum];

export class SecureHeadersError extends Data.TaggedError("SecureHeadersError")<{
  readonly message: string;
  readonly type: SecureHeadersErrorType;
  readonly cause?: unknown;
}> {}
