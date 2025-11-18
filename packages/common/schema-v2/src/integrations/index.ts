/**
 * HTTP integration namespace (headers, methods, request metadata, etc.).
 *
 * @example
 * import * as Http from "@beep/schema-v2/integrations/http";
 *
 * const Headers = Http.HttpHeaders;
 *
 * @category Surface/Integrations
 * @since 0.1.0
 */

/**
 * Configuration integration schemas (e.g., CSP helpers).
 *
 * @example
 * import * as Config from "@beep/schema-v2/integrations/config";
 *
 * const header = Config.Csp.toHeader(Config.Csp.fromString("default-src 'self';"));
 *
 * @category Surface/Integrations
 * @since 0.1.0
 */
export * as Config from "./config";
export * as Http from "./http";
