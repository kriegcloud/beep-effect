import {
  ContentSecurityPolicyHeaderSchema,
  ContentSecurityPolicyOptionSchema,
  createContentSecurityPolicyHeader,
} from "./content-security-policy.ts";
import {
  CrossOriginEmbedderPolicyHeaderSchema,
  CrossOriginEmbedderPolicyOptionSchema,
  createCrossOriginEmbedderPolicyHeader,
} from "./cross-origin-embedder-policy.ts";
import {
  CrossOriginOpenerPolicyHeaderSchema,
  CrossOriginOpenerPolicyOptionSchema,
  createCrossOriginOpenerPolicyHeader,
} from "./cross-origin-opener-policy.ts";
import {
  CrossOriginResourcePolicyHeaderSchema,
  CrossOriginResourcePolicyOptionSchema,
  createCrossOriginResourcePolicyHeader,
} from "./cross-origin-resource-policy.ts";
import { createExpectCTHeader, ExpectCTHeaderSchema, ExpectCTOptionSchema } from "./expect-ct.ts";
import {
  createForceHTTPSRedirectHeader,
  ForceHTTPSRedirectHeaderSchema,
  ForceHTTPSRedirectOptionSchema,
} from "./force-https-redirect.ts";
import { createFrameGuardHeader, FrameGuardHeaderSchema, FrameGuardOptionSchema } from "./frame-guard.ts";
import { createNoopenHeader, NoopenHeaderSchema, NoopenOptionSchema } from "./no-open.ts";
import { createNosniffHeader, NosniffHeaderSchema, NosniffOptionSchema } from "./no-sniff.ts";
import {
  createPermissionsPolicyHeader,
  PermissionsPolicyHeaderSchema,
  PermissionsPolicyOptionSchema,
} from "./permissions-policy.ts";
import {
  createPermittedCrossDomainPoliciesHeader,
  PermittedCrossDomainPoliciesHeaderSchema,
  PermittedCrossDomainPoliciesOptionSchema,
} from "./permitted-cross-domain-policies.ts";
import {
  createReferrerPolicyHeader,
  ReferrerPolicyHeaderSchema,
  ReferrerPolicyOptionSchema,
} from "./referrer-policy.ts";
import { createXSSProtectionHeader, XSSProtectionHeaderSchema, XSSProtectionOptionSchema } from "./xss-protection.ts";

export type { ContentSecurityPolicyHeader, ContentSecurityPolicyOption } from "./content-security-policy.ts";
export type {
  CrossOriginEmbedderPolicyHeader,
  CrossOriginEmbedderPolicyOption,
} from "./cross-origin-embedder-policy.ts";
export type { CrossOriginOpenerPolicyHeader, CrossOriginOpenerPolicyOption } from "./cross-origin-opener-policy.ts";
export type {
  CrossOriginResourcePolicyHeader,
  CrossOriginResourcePolicyOption,
} from "./cross-origin-resource-policy.ts";
export type { ExpectCTHeader, ExpectCTOption } from "./expect-ct.ts";
export type { ForceHTTPSRedirectHeader, ForceHTTPSRedirectOption } from "./force-https-redirect.ts";
export type { FrameGuardHeader, FrameGuardOption } from "./frame-guard.ts";
export type { NoopenHeader, NoopenOption } from "./no-open.ts";
export type { NosniffHeader, NosniffOption } from "./no-sniff.ts";
export type { PermissionsPolicyHeader, PermissionsPolicyOption } from "./permissions-policy.ts";
export type {
  PermittedCrossDomainPoliciesHeader,
  PermittedCrossDomainPoliciesOption,
} from "./permitted-cross-domain-policies.ts";
export type { ReferrerPolicyHeader, ReferrerPolicyOption } from "./referrer-policy.ts";
export type { XSSProtectionHeader, XSSProtectionOption } from "./xss-protection.ts";

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
