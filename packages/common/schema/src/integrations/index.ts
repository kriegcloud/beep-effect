/**
 * HTTP integration namespace (headers, methods, request metadata, etc.).
 *
 * @example
 * import * as Http from "@beep/schema/integrations/http";
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
 * import * as Config from "@beep/schema/integrations/config";
 *
 * const header = Config.Csp.toHeader(Config.Csp.fromString("default-src 'self';"));
 *
 * @category Surface/Integrations
 * @since 0.1.0
 */
export * from "./config";
export * from "./http";
export * from "./sql";
