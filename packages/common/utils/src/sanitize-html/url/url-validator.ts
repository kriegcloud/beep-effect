/**
 * URL validation for sanitize-html
 *
 * Validates URLs against allowed schemes and detects malicious patterns.
 *
 * @since 0.1.0
 * @module
 */

import * as A from "effect/Array";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as Str from "effect/String";

import { prepareForUrlValidation } from "../parser/entities.js";

/**
 * URL validation options.
 *
 * @since 0.1.0
 * @category types
 */
export interface UrlValidationOptions {
  readonly allowedSchemes: readonly string[];
  readonly allowProtocolRelative: boolean;
}

/**
 * Result of URL parsing.
 *
 * @since 0.1.0
 * @category types
 */
export interface ParsedUrl {
  readonly scheme: O.Option<string>;
  readonly hostname: O.Option<string>;
  readonly isRelative: boolean;
  readonly isProtocolRelative: boolean;
}

/**
 * Pattern to match URL schemes.
 * Matches the scheme before the colon (e.g., "http" in "http://...").
 */
const SCHEME_PATTERN = /^([a-zA-Z][a-zA-Z0-9.+-]*):$/;

/**
 * Pattern to detect protocol-relative URLs.
 * Matches URLs starting with // or variations with backslashes.
 */
const PROTOCOL_RELATIVE_PATTERN = /^[\\/]{2}/;

/**
 * Pattern to normalize backslashes in URLs.
 */
const BACKSLASH_NORMALIZE_PATTERN = /^(\w+:)?\s*[\\/]\s*[\\/]/;

/**
 * Normalize a URL for validation.
 * This prepares the URL by decoding entities and removing control characters.
 */
const normalizeUrl = (url: string): string =>
  F.pipe(
    url,
    prepareForUrlValidation,
    // Normalize backslashes to forward slashes for protocol-relative detection
    (s) => {
      const match = BACKSLASH_NORMALIZE_PATTERN.exec(s);
      return P.isNotNull(match) ? Str.replace(match[0], `${match[1] ?? ""}//`)(s) : s;
    },
    Str.trim
  );

/**
 * Find colon index in a string, returning Option.none() if not found.
 */
const findColonIndex = (url: string): O.Option<number> => Str.indexOf(":")(url);

/**
 * Extract the scheme from a URL.
 */
const extractScheme = (url: string): O.Option<string> =>
  F.pipe(
    findColonIndex(url),
    O.flatMap((colonIndex) => {
      const potentialScheme = Str.slice(0, colonIndex + 1)(url);
      const match = SCHEME_PATTERN.exec(potentialScheme);
      return F.pipe(
        O.fromNullable(match),
        O.flatMap((m) => O.fromNullable(m[1])),
        O.map(Str.toLowerCase)
      );
    })
  );

/**
 * Check if a URL is protocol-relative (starts with //).
 */
const isProtocolRelativeUrl = (url: string): boolean => PROTOCOL_RELATIVE_PATTERN.test(url);

/**
 * Check if a URL is a relative URL (no scheme, not protocol-relative).
 */
const isRelativeUrl = (url: string): boolean =>
  F.pipe(
    extractScheme(url),
    O.match({
      onNone: () => !isProtocolRelativeUrl(url),
      onSome: () => false,
    })
  );

/**
 * Build a full URL for parsing based on the URL type.
 */
const buildFullUrlForParsing = (url: string): string => {
  const baseUrl = "http://relative-base";

  return F.pipe(
    Match.value({ url, isProtocolRelative: isProtocolRelativeUrl(url), isRelative: isRelativeUrl(url) }),
    Match.when({ isProtocolRelative: true }, () => `http:${url}`),
    Match.when({ isRelative: true }, ({ url: u }) =>
      F.pipe(
        u,
        (s) => (Str.startsWith("/")(s) ? s : `/${s}`),
        (path) => `${baseUrl}${path}`
      )
    ),
    Match.orElse(({ url: u }) => u)
  );
};

/**
 * Safely parse a URL, returning Option.none() on failure.
 */
const safeParseUrl = (fullUrl: string): O.Option<URL> => {
  try {
    return O.some(new URL(fullUrl));
  } catch {
    return O.none();
  }
};

/**
 * Parse hostname from a URL.
 */
const extractHostname = (url: string): O.Option<string> => {
  const fullUrl = buildFullUrlForParsing(url);

  return F.pipe(
    safeParseUrl(fullUrl),
    O.flatMap((parsed) => (parsed.hostname === "relative-base" ? O.none() : O.some(parsed.hostname)))
  );
};

/**
 * Parse a URL into its components.
 *
 * @example
 * ```typescript
 * import { parseUrl } from "@beep/utils/sanitize-html/url/url-validator"
 *
 * parseUrl("https://example.com/path")
 * // { scheme: Some("https"), hostname: Some("example.com"), isRelative: false, isProtocolRelative: false }
 *
 * parseUrl("//cdn.example.com/file.js")
 * // { scheme: None, hostname: Some("cdn.example.com"), isRelative: false, isProtocolRelative: true }
 *
 * parseUrl("/path/to/file")
 * // { scheme: None, hostname: None, isRelative: true, isProtocolRelative: false }
 * ```
 *
 * @since 0.1.0
 * @category parsing
 */
export const parseUrl = (url: string): ParsedUrl => {
  const normalized = normalizeUrl(url);

  return {
    scheme: extractScheme(normalized),
    hostname: extractHostname(normalized),
    isRelative: isRelativeUrl(normalized),
    isProtocolRelative: isProtocolRelativeUrl(normalized),
  };
};

/**
 * Check if a URL scheme is allowed.
 */
const isSchemeAllowed = (scheme: string, allowedSchemes: readonly string[]): boolean =>
  A.some(allowedSchemes, (allowed) => Str.toLowerCase(allowed) === Str.toLowerCase(scheme));

/**
 * Check if a hostname matches an allowed hostname exactly.
 */
const matchesHostname = (hostname: string, allowedHostnames: readonly string[]): boolean =>
  A.some(allowedHostnames, (allowed) => Str.toLowerCase(hostname) === Str.toLowerCase(allowed));

/**
 * Check if a hostname matches a domain exactly.
 */
const isExactDomainMatch = (lowerHostname: string, lowerDomain: string): boolean => lowerHostname === lowerDomain;

/**
 * Check if a hostname is a subdomain of a domain.
 */
const isSubdomainMatch = (lowerHostname: string, lowerDomain: string): boolean =>
  Str.endsWith(`.${lowerDomain}`)(lowerHostname);

/**
 * Check if a hostname belongs to an allowed domain.
 * For example, "sub.example.com" matches domain "example.com".
 */
const matchesDomain = (hostname: string, allowedDomains: readonly string[]): boolean =>
  A.some(allowedDomains, (domain) => {
    const lowerHostname = Str.toLowerCase(hostname);
    const lowerDomain = Str.toLowerCase(domain);

    return isExactDomainMatch(lowerHostname, lowerDomain) || isSubdomainMatch(lowerHostname, lowerDomain);
  });

/**
 * Determine if a parsed URL is naughty (disallowed).
 */
const determineNaughtyStatus = (parsed: ParsedUrl, options: UrlValidationOptions): boolean =>
  F.pipe(
    Match.value(parsed),
    Match.when({ isProtocolRelative: true }, () => !options.allowProtocolRelative),
    Match.when({ isRelative: true }, () => false),
    Match.orElse(({ scheme }) =>
      F.pipe(
        scheme,
        O.map((s) => !isSchemeAllowed(s, options.allowedSchemes)),
        O.getOrElse(() => false)
      )
    )
  );

/**
 * Check if a URL is "naughty" (potentially dangerous).
 * This includes javascript:, data:, and other dangerous schemes.
 *
 * @example
 * ```typescript
 * import { isNaughtyHref } from "@beep/utils/sanitize-html/url/url-validator"
 *
 * isNaughtyHref("javascript:alert(1)", { allowedSchemes: ["http", "https"], allowProtocolRelative: true })
 * // true
 *
 * isNaughtyHref("https://example.com", { allowedSchemes: ["http", "https"], allowProtocolRelative: true })
 * // false
 * ```
 *
 * @since 0.1.0
 * @category validation
 */
export const isNaughtyHref = (url: string, options: UrlValidationOptions): boolean => {
  const normalized = normalizeUrl(url);
  const parsed = parseUrl(normalized);

  return determineNaughtyStatus(parsed, options);
};

/**
 * IFrame validation options.
 */
interface IframeValidationOptions {
  readonly allowedIframeHostnames?: undefined | readonly string[];
  readonly allowedIframeDomains?: undefined | readonly string[];
  readonly allowIframeRelativeUrls?: undefined | boolean;
  readonly allowProtocolRelative?: undefined | boolean;
}

/**
 * Script validation options.
 */
interface ScriptValidationOptions {
  readonly allowedScriptHostnames?: undefined | readonly string[];
  readonly allowedScriptDomains?: undefined | readonly string[];
  readonly allowProtocolRelative?: undefined | boolean;
}

/**
 * Check if hostname restrictions are present.
 */
const hasHostnameRestrictions = (
  hostnames: readonly string[] | undefined,
  domains: readonly string[] | undefined
): boolean => P.isNotUndefined(hostnames) || P.isNotUndefined(domains);

/**
 * Check if protocol-relative URLs are allowed (default true).
 */
const isProtocolRelativeAllowed = (allowProtocolRelative: boolean | undefined): boolean =>
  allowProtocolRelative ?? true;

/**
 * Validate hostname against allowed hostnames and domains.
 */
const validateHostnameAgainstAllowlist = (
  hostname: string,
  allowedHostnames: readonly string[] | undefined,
  allowedDomains: readonly string[] | undefined
): boolean => {
  const matchesAllowedHostname = F.pipe(
    O.fromNullable(allowedHostnames),
    O.map((hostnames) => matchesHostname(hostname, hostnames)),
    O.getOrElse(() => false)
  );

  const matchesAllowedDomain = F.pipe(
    O.fromNullable(allowedDomains),
    O.map((domains) => matchesDomain(hostname, domains)),
    O.getOrElse(() => false)
  );

  return matchesAllowedHostname || matchesAllowedDomain;
};

/**
 * Validate hostname option against allowlist.
 */
const validateHostnameOption = (
  hostnameOpt: O.Option<string>,
  allowedHostnames: readonly string[] | undefined,
  allowedDomains: readonly string[] | undefined
): boolean =>
  F.pipe(
    hostnameOpt,
    O.map((h) => validateHostnameAgainstAllowlist(h, allowedHostnames, allowedDomains)),
    O.getOrElse(() => false)
  );

/**
 * Validate an iframe src URL.
 *
 * @since 0.1.0
 * @category validation
 */
export const validateIframeSrc = (url: string, options: IframeValidationOptions): boolean => {
  const normalized = normalizeUrl(url);
  const parsed = parseUrl(normalized);
  const hasRestrictions = hasHostnameRestrictions(options.allowedIframeHostnames, options.allowedIframeDomains);

  return F.pipe(
    Match.value(parsed),
    Match.when({ isRelative: true }, () => options.allowIframeRelativeUrls ?? !hasRestrictions),
    Match.when({ isProtocolRelative: true }, () => {
      const protocolAllowed = isProtocolRelativeAllowed(options.allowProtocolRelative);
      const hostnameValid =
        !hasRestrictions ||
        validateHostnameOption(parsed.hostname, options.allowedIframeHostnames, options.allowedIframeDomains);
      return protocolAllowed && hostnameValid;
    }),
    Match.orElse(() => {
      const noRestrictions = !hasRestrictions;
      const hostnameValid = validateHostnameOption(
        parsed.hostname,
        options.allowedIframeHostnames,
        options.allowedIframeDomains
      );
      return noRestrictions || hostnameValid;
    })
  );
};

/**
 * Validate a script src URL.
 *
 * @since 0.1.0
 * @category validation
 */
export const validateScriptSrc = (url: string, options: ScriptValidationOptions): boolean => {
  const normalized = normalizeUrl(url);
  const parsed = parseUrl(normalized);
  const hasRestrictions = hasHostnameRestrictions(options.allowedScriptHostnames, options.allowedScriptDomains);

  return F.pipe(
    Match.value(parsed),
    Match.when({ isRelative: true }, () => !hasRestrictions),
    Match.when({ isProtocolRelative: true }, () => {
      const protocolAllowed = isProtocolRelativeAllowed(options.allowProtocolRelative);
      const hostnameValid =
        !hasRestrictions ||
        validateHostnameOption(parsed.hostname, options.allowedScriptHostnames, options.allowedScriptDomains);
      return protocolAllowed && hostnameValid;
    }),
    Match.orElse(() => {
      const noRestrictions = !hasRestrictions;
      const hostnameValid = validateHostnameOption(
        parsed.hostname,
        options.allowedScriptHostnames,
        options.allowedScriptDomains
      );
      return noRestrictions || hostnameValid;
    })
  );
};
