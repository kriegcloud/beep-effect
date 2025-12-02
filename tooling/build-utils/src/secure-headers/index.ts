import { createContentSecurityPolicyHeader, ContentSecurityPolicyHeaderSchema, ContentSecurityPolicyOptionSchema } from "./content-security-policy.ts";
import { createCrossOriginEmbedderPolicyHeader, CrossOriginEmbedderPolicyHeaderSchema, CrossOriginEmbedderPolicyOptionSchema } from "./cross-origin-embedder-policy.ts";
import { createCrossOriginOpenerPolicyHeader, CrossOriginOpenerPolicyHeaderSchema, CrossOriginOpenerPolicyOptionSchema } from "./cross-origin-opener-policy.ts";
import { createCrossOriginResourcePolicyHeader, CrossOriginResourcePolicyHeaderSchema, CrossOriginResourcePolicyOptionSchema } from "./cross-origin-resource-policy.ts";
import { createExpectCTHeader, ExpectCTHeaderSchema, ExpectCTOptionSchema } from "./expect-ct.ts";
import { createForceHTTPSRedirectHeader, ForceHTTPSRedirectHeaderSchema, ForceHTTPSRedirectOptionSchema } from "./force-https-redirect.ts";
import { createFrameGuardHeader, FrameGuardHeaderSchema, FrameGuardOptionSchema } from "./frame-guard.ts";
import { createNoopenHeader, NoopenHeaderSchema, NoopenOptionSchema } from "./no-open.ts";
import { createNosniffHeader, NosniffHeaderSchema, NosniffOptionSchema } from "./no-sniff.ts";
import { createPermissionsPolicyHeader, PermissionsPolicyHeaderSchema, PermissionsPolicyOptionSchema } from "./permissions-policy.ts";
import { createPermittedCrossDomainPoliciesHeader, PermittedCrossDomainPoliciesHeaderSchema, PermittedCrossDomainPoliciesOptionSchema } from "./permitted-cross-domain-policies.ts";
import { createReferrerPolicyHeader, ReferrerPolicyHeaderSchema, ReferrerPolicyOptionSchema } from "./referrer-policy.ts";
import { createXSSProtectionHeader, XSSProtectionHeaderSchema, XSSProtectionOptionSchema } from "./xss-protection.ts";

export type { ContentSecurityPolicyOption, ContentSecurityPolicyHeader } from "./content-security-policy.ts";
export type { CrossOriginEmbedderPolicyOption, CrossOriginEmbedderPolicyHeader } from "./cross-origin-embedder-policy.ts";
export type { CrossOriginOpenerPolicyOption, CrossOriginOpenerPolicyHeader } from "./cross-origin-opener-policy.ts";
export type { CrossOriginResourcePolicyOption, CrossOriginResourcePolicyHeader } from "./cross-origin-resource-policy.ts";
export type { ExpectCTOption, ExpectCTHeader } from "./expect-ct.ts";
export type { ForceHTTPSRedirectOption, ForceHTTPSRedirectHeader } from "./force-https-redirect.ts";
export type { FrameGuardOption, FrameGuardHeader } from "./frame-guard.ts";
export type { NoopenOption, NoopenHeader } from "./no-open.ts";
export type { NosniffOption, NosniffHeader } from "./no-sniff.ts";
export type { PermissionsPolicyOption, PermissionsPolicyHeader } from "./permissions-policy.ts";
export type { PermittedCrossDomainPoliciesOption, PermittedCrossDomainPoliciesHeader } from "./permitted-cross-domain-policies.ts";
export type { ReferrerPolicyOption, ReferrerPolicyHeader } from "./referrer-policy.ts";
export type { XSSProtectionOption, XSSProtectionHeader } from "./xss-protection.ts";

// From TypeScript 3.9 has been set `enumerable: false` so we cannot `import * as rules` and `jest.spyOn(rules, "xxx")` ,
// so exports manually.
export const rules = {
  createContentSecurityPolicyHeader,
  createCrossOriginEmbedderPolicyHeader,
  createCrossOriginOpenerPolicyHeader,
  createCrossOriginResourcePolicyHeader,
  createExpectCTHeader,
  createForceHTTPSRedirectHeader,
  createFrameGuardHeader,
  createNoopenHeader,
  createNosniffHeader,
  createPermissionsPolicyHeader,
  createPermittedCrossDomainPoliciesHeader,
  createReferrerPolicyHeader,
  createXSSProtectionHeader,
};

/**
 * Schema exports for Schema.transformOrFail-based header generation.
 * These schemas transform input options directly to ResponseHeader outputs.
 */
export const schemas = {
  ContentSecurityPolicyHeaderSchema,
  ContentSecurityPolicyOptionSchema,
  CrossOriginEmbedderPolicyHeaderSchema,
  CrossOriginEmbedderPolicyOptionSchema,
  CrossOriginOpenerPolicyHeaderSchema,
  CrossOriginOpenerPolicyOptionSchema,
  CrossOriginResourcePolicyHeaderSchema,
  CrossOriginResourcePolicyOptionSchema,
  ExpectCTHeaderSchema,
  ExpectCTOptionSchema,
  ForceHTTPSRedirectHeaderSchema,
  ForceHTTPSRedirectOptionSchema,
  FrameGuardHeaderSchema,
  FrameGuardOptionSchema,
  NoopenHeaderSchema,
  NoopenOptionSchema,
  NosniffHeaderSchema,
  NosniffOptionSchema,
  PermissionsPolicyHeaderSchema,
  PermissionsPolicyOptionSchema,
  PermittedCrossDomainPoliciesHeaderSchema,
  PermittedCrossDomainPoliciesOptionSchema,
  ReferrerPolicyHeaderSchema,
  ReferrerPolicyOptionSchema,
  XSSProtectionHeaderSchema,
  XSSProtectionOptionSchema,
};
