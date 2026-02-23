/**
 * HTTP header helpers used across integration builders.
 *
 * @example
 * import { HttpHeaders } from "@beep/schema/integrations/http";
 *
 * const headers = HttpHeaders.Type;
 *
 * @category Integrations/Http
 * @since 0.1.0
 */
export * from "./http-headers";
/**
 * HTTP method literal schemas and kit helpers.
 *
 * @example
 * import { HttpMethod } from "@beep/schema/integrations/http";
 *
 * const decode = HttpMethod.make;
 *
 * @category Integrations/Http
 * @since 0.1.0
 */
export * from "./http-method";
/**
 * HTTP request metadata schema for telemetry surfaces.
 *
 * @example
 * import { HttpRequestDetails } from "@beep/schema/integrations/http";
 *
 * type Details = HttpRequestDetails.Type;
 *
 * @category Integrations/Http
 * @since 0.1.0
 */
export * from "./http-request-details";

/**
 * HTTP request metadata schema for telemetry surfaces.
 *
 * @example
 * import { HttpStatusCode } from "@beep/schema/integrations/http";
 *
 * type HttpStatusCode = HttpStatusCode.Type; // "OK"
 * type HttpStatusCodeEncoded = HttpStatusCode.Encoded; // 200
 *
 * @category Integrations/Http
 * @since 0.1.0
 */
export * from "./http-status-code";
