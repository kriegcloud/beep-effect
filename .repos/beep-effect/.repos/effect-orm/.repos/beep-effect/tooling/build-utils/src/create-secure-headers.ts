import { pipe, Struct } from "effect";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import type {
  ContentSecurityPolicyOption,
  CrossOriginEmbedderPolicyOption,
  CrossOriginOpenerPolicyOption,
  CrossOriginResourcePolicyOption,
  ExpectCTOption,
  ForceHTTPSRedirectOption,
  FrameGuardOption,
  NoopenOption,
  NosniffOption,
  PermissionsPolicyOption,
  PermittedCrossDomainPoliciesOption,
  ReferrerPolicyOption,
  XSSProtectionOption,
} from "./secure-headers/index.js";
import { rules } from "./secure-headers/index.js";
import type { ResponseHeader } from "./secure-headers/types.js";

export type CreateSecureHeadersOptions = Partial<{
  /**
   * This is to set "Content-Security-Policy" or "Content-Security-Policy-Report-Only" header and it's to prevent to load and
   * execute non-allowed resources.
   * If you give true to `reportOnly` , this sets "Content-Security-Policy-Report-Only" to value instead of
   * "Content-Security-Policy".
   */
  readonly contentSecurityPolicy: ContentSecurityPolicyOption;
  /**
   * This is to set "Cross-Origin-Embedder-Policy" header to prevent loading cross-origin resources
   * that don't grant permission. Required for SharedArrayBuffer and high-resolution timers.
   */
  readonly crossOriginEmbedderPolicy: CrossOriginEmbedderPolicyOption;
  /**
   * This is to set "Cross-Origin-Opener-Policy" header to prevent cross-origin documents
   * from opening in the same browsing context group.
   */
  readonly crossOriginOpenerPolicy: CrossOriginOpenerPolicyOption;
  /**
   * This is to set "Cross-Origin-Resource-Policy" header to prevent other origins
   * from loading your resources.
   */
  readonly crossOriginResourcePolicy: CrossOriginResourcePolicyOption;
  /**
   * This is to set "Expect-CT" header and it's to tell browsers to expect Certificate Transparency.
   */
  readonly expectCT: ExpectCTOption;
  /**
   * This is to set "Strict-Transport-Security (HSTS)" header and it's to prevent man-in-the-middle attacks during redirects from HTTP to HTTPS.
   * To enable this is highly recommended if you use HTTPS (SSL) on your servers.
   * By default, this sets `max-age` to two years (63,072,000 seconds).
   * @default [true, { maxAge: 63072000 }]
   */
  readonly forceHTTPSRedirect: ForceHTTPSRedirectOption;
  /**
   * This is to set "X-Frame-Options" header and it's to prevent clickjacking attacks.
   * `"deny"` is highly recommended if you don't use frame elements such as `iframe` .
   * @default "deny"
   */
  readonly frameGuard: FrameGuardOption;
  /**
   * This is to set "X-Download-Options" header and it's to prevent to open downloaded files automatically for IE8+ (MIME Handling attacks).
   * @default "noopen"
   */
  readonly noopen: NoopenOption;
  /**
   * This is to set "X-Content-Type-Options" header and it's to prevent MIME Sniffing attacks.
   * @default "nosniff"
   */
  readonly nosniff: NosniffOption;
  /**
   * This is to set "Permissions-Policy" header to control which browser features can be used
   * (camera, microphone, geolocation, etc.).
   */
  readonly permissionsPolicy: PermissionsPolicyOption;
  /**
   * This is to set "X-Permitted-Cross-Domain-Policies" header to control Adobe Flash/Acrobat
   * cross-domain data loading.
   * @default "none"
   */
  readonly permittedCrossDomainPolicies: PermittedCrossDomainPoliciesOption;
  /**
   * This is to set "Referrer-Policy" header and it's to prevent to be got referrer by other servers.
   * You can specify one or more values for legacy browsers which does not support a specific value.
   */
  readonly referrerPolicy: ReferrerPolicyOption;
  /**
   * This is to set "X-XSS-Protection" header and it's to prevent XSS attacks.
   * If you specify `"sanitize"` , this sets the header to `"1"` and browsers will sanitize unsafe area.
   * If you specify `"block-rendering"` , this sets the header to `"1; mode=block"` and browsers will block rendering a page.
   * "X-XSS-Protection" blocks many XSS attacks, but Content Security Policy is recommended to use compared to this.
   * @default "sanitize"
   */
  readonly xssProtection: XSSProtectionOption;
}>;

export const createHeadersObject = (options: CreateSecureHeadersOptions = {}) =>
  Effect.gen(function* () {
    const newHeaders: Record<string, string> = {};

    const fns = A.make(
      rules.createContentSecurityPolicyHeader(options.contentSecurityPolicy),
      rules.createCrossOriginEmbedderPolicyHeader(options.crossOriginEmbedderPolicy),
      rules.createCrossOriginOpenerPolicyHeader(options.crossOriginOpenerPolicy),
      rules.createCrossOriginResourcePolicyHeader(options.crossOriginResourcePolicy),
      rules.createExpectCTHeader(options.expectCT),
      rules.createForceHTTPSRedirectHeader(options.forceHTTPSRedirect),
      rules.createFrameGuardHeader(options.frameGuard),
      rules.createNoopenHeader(options.noopen),
      rules.createNosniffHeader(options.nosniff),
      rules.createPermissionsPolicyHeader(options.permissionsPolicy),
      rules.createPermittedCrossDomainPoliciesHeader(options.permittedCrossDomainPolicies),
      rules.createReferrerPolicyHeader(options.referrerPolicy),
      rules.createXSSProtectionHeader(options.xssProtection)
    );

    const heads = yield* Effect.all(fns, { concurrency: fns.length });

    pipe(
      heads,
      A.forEach((headerOption: O.Option<ResponseHeader>) => {
        if (O.isNone(headerOption)) return;
        const header = headerOption.value;
        if (header.value == undefined) return;

        newHeaders[header.name] = header.value;
      })
    );

    return newHeaders;
  }).pipe(Effect.withSpan("createHeadersObject"));

export const createSecureHeaders = (options: CreateSecureHeadersOptions = {}) =>
  Effect.gen(function* () {
    const headersObject = yield* createHeadersObject(options);

    const headers: { readonly key: string; readonly value: string }[] = [];
    pipe(
      headersObject,
      Struct.entries,
      A.forEach(([key, value]) => headers.push({ key, value }))
    );

    return headers;
  }).pipe(Effect.withSpan("createSecureHeaders"));
