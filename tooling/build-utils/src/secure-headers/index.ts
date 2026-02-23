import {
  ContentSecurityPolicyHeaderSchema,
  ContentSecurityPolicyOptionSchema,
  createContentSecurityPolicyHeader,
} from "./content-security-policy.js";
import {
  CrossOriginEmbedderPolicyHeaderSchema,
  CrossOriginEmbedderPolicyOptionSchema,
  createCrossOriginEmbedderPolicyHeader,
} from "./cross-origin-embedder-policy.js";
import {
  CrossOriginOpenerPolicyHeaderSchema,
  CrossOriginOpenerPolicyOptionSchema,
  createCrossOriginOpenerPolicyHeader,
} from "./cross-origin-opener-policy.js";
import {
  CrossOriginResourcePolicyHeaderSchema,
  CrossOriginResourcePolicyOptionSchema,
  createCrossOriginResourcePolicyHeader,
} from "./cross-origin-resource-policy.js";
import { createExpectCTHeader, ExpectCTHeaderSchema, ExpectCTOptionSchema } from "./expect-ct.js";
import {
  createForceHTTPSRedirectHeader,
  ForceHTTPSRedirectHeaderSchema,
  ForceHTTPSRedirectOptionSchema,
} from "./force-https-redirect.js";
import { createFrameGuardHeader, FrameGuardHeaderSchema, FrameGuardOptionSchema } from "./frame-guard.js";
import { createNoopenHeader, NoopenHeaderSchema, NoopenOptionSchema } from "./no-open.js";
import { createNosniffHeader, NosniffHeaderSchema, NosniffOptionSchema } from "./no-sniff.js";
import {
  createPermissionsPolicyHeader,
  PermissionsPolicyHeaderSchema,
  PermissionsPolicyOptionSchema,
} from "./permissions-policy.js";
import {
  createPermittedCrossDomainPoliciesHeader,
  PermittedCrossDomainPoliciesHeaderSchema,
  PermittedCrossDomainPoliciesOptionSchema,
} from "./permitted-cross-domain-policies.js";
import {
  createReferrerPolicyHeader,
  ReferrerPolicyHeaderSchema,
  ReferrerPolicyOptionSchema,
} from "./referrer-policy.js";
import { createXSSProtectionHeader, XSSProtectionHeaderSchema, XSSProtectionOptionSchema } from "./xss-protection.js";

export type { ContentSecurityPolicyHeader, ContentSecurityPolicyOption } from "./content-security-policy.js";
export type {
  CrossOriginEmbedderPolicyHeader,
  CrossOriginEmbedderPolicyOption,
} from "./cross-origin-embedder-policy.js";
export type { CrossOriginOpenerPolicyHeader, CrossOriginOpenerPolicyOption } from "./cross-origin-opener-policy.js";
export type {
  CrossOriginResourcePolicyHeader,
  CrossOriginResourcePolicyOption,
} from "./cross-origin-resource-policy.js";
export type { ExpectCTHeader, ExpectCTOption } from "./expect-ct.js";
export type { ForceHTTPSRedirectHeader, ForceHTTPSRedirectOption } from "./force-https-redirect.js";
export type { FrameGuardHeader, FrameGuardOption } from "./frame-guard.js";
export type { NoopenHeader, NoopenOption } from "./no-open.js";
export type { NosniffHeader, NosniffOption } from "./no-sniff.js";
export type { PermissionsPolicyHeader, PermissionsPolicyOption } from "./permissions-policy.js";
export type {
  PermittedCrossDomainPoliciesHeader,
  PermittedCrossDomainPoliciesOption,
} from "./permitted-cross-domain-policies.js";
export type { ReferrerPolicyHeader, ReferrerPolicyOption } from "./referrer-policy.js";
export type { XSSProtectionHeader, XSSProtectionOption } from "./xss-protection.js";

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
