/**
 * Unofficial HTTP status schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import * as S from "effect/Schema";
import { $I } from "./HttpStatus.shared.ts";

// =============================================================================
// Unofficial HTTP Status Codes
// =============================================================================

/**
 * 430 “Request Header Fields Too Large” – This code is used by Shopify when
 * too many URLs are requested at the same time. It is similar to the HTTP code
 * 429 “Too many requests”.
 *
 * @since 0.0.0
 * @category validation
 */
export const RequestHeaderFieldsTooLargeShopify = S.Literal(430).pipe(
  $I.annoteSchema("RequestHeaderFieldsTooLargeShopify", {
    description:
      "430 “Request Header Fields Too Large” – This code is used by Shopify when\ntoo many URLs are requested at the same time. It is similar to the HTTP code\n429 “Too many requests”.",
    emoji: "🧱",
  })
);

/**
 * {@inheritDoc RequestHeaderFieldsTooLargeShopify}
 *
 * @since 0.0.0
 * @category validation
 */
export type RequestHeaderFieldsTooLargeShopify = typeof RequestHeaderFieldsTooLargeShopify.Type;

/**
 * 440 “Login Time-out” – This code is used by Microsoft’s ISS (Internet
 * Information Services). The client’s login session has expired and they must
 * log in again.
 *
 * @since 0.0.0
 * @category validation
 */
export const LoginTimeout = S.Literal(440).pipe(
  $I.annoteSchema("LoginTimeout", {
    description:
      "440 “Login Time-out” – This code is used by Microsoft’s ISS (Internet\nInformation Services). The client’s login session has expired and they must\nlog in again.",
    emoji: "🪫",
  })
);

/**
 * {@inheritDoc LoginTimeout}
 *
 * @since 0.0.0
 * @category validation
 */
export type LoginTimeout = typeof LoginTimeout.Type;

/**
 * 494 “Request header too large” – used by NGINX. The client has sent too
 * large of a request or too long of a header line.
 *
 * @since 0.0.0
 * @category validation
 */
export const RequestHeaderTooLarge = S.Literal(494).pipe(
  $I.annoteSchema("RequestHeaderTooLarge", {
    description:
      "494 “Request header too large” – used by NGINX. The client has sent too\nlarge of a request or too long of a header line.",
    emoji: "🧾",
  })
);

/**
 * {@inheritDoc RequestHeaderTooLarge}
 *
 * @since 0.0.0
 * @category validation
 */
export type RequestHeaderTooLarge = typeof RequestHeaderTooLarge.Type;

/**
 * 495 “SSL Certificate Error” – This is also a status code used by NGINX
 * signaling that the client has provided an invalid SSL certificate.
 *
 * @since 0.0.0
 * @category validation
 */
export const SslCertificateError = S.Literal(495).pipe(
  $I.annoteSchema("SslCertificateError", {
    description:
      "495 “SSL Certificate Error” – This is also a status code used by NGINX\nsignaling that the client has provided an invalid SSL certificate.",
    emoji: "🏅",
  })
);

/**
 * {@inheritDoc SslCertificateError}
 *
 * @since 0.0.0
 * @category validation
 */
export type SslCertificateError = typeof SslCertificateError.Type;

/**
 * 496 “SSL Certificate Required” – used by NGINX. A client certificate is
 * required but is not provided.
 *
 * @since 0.0.0
 * @category validation
 */
export const SslCertificateRequired = S.Literal(496).pipe(
  $I.annoteSchema("SslCertificateRequired", {
    description:
      "496 “SSL Certificate Required” – used by NGINX. A client certificate is\nrequired but is not provided.",
    emoji: "🏷",
  })
);

/**
 * {@inheritDoc SslCertificateRequired}
 *
 * @since 0.0.0
 * @category validation
 */
export type SslCertificateRequired = typeof SslCertificateRequired.Type;

/**
 * 499 “Client Closed Request” – The client terminated the request before the
 * server could send a response. Another code used by NGINX.
 *
 * @since 0.0.0
 * @category validation
 */
export const ClientClosedRequest = S.Literal(499).pipe(
  $I.annoteSchema("ClientClosedRequest", {
    description:
      "499 “Client Closed Request” – The client terminated the request before the\nserver could send a response. Another code used by NGINX.",
    emoji: "🚶🏽",
  })
);

/**
 * {@inheritDoc ClientClosedRequest}
 *
 * @since 0.0.0
 * @category validation
 */
export type ClientClosedRequest = typeof ClientClosedRequest.Type;

/**
 * 520 “Web Server Returned an Unknown Error” – This is a code used by
 * Cloudflare. It specifies that the origin server returned an unexpected or
 * unknown response to Cloudflare.
 *
 * @since 0.0.0
 * @category validation
 */
export const WebServerReturnedAnUnknownError = S.Literal(520).pipe(
  $I.annoteSchema("WebServerReturnedAnUnknownError", {
    description:
      "520 “Web Server Returned an Unknown Error” – This is a code used by\nCloudflare. It specifies that the origin server returned an unexpected or\nunknown response to Cloudflare.",
    emoji: "👻",
  })
);

/**
 * {@inheritDoc WebServerReturnedAnUnknownError}
 *
 * @since 0.0.0
 * @category validation
 */
export type WebServerReturnedAnUnknownError = typeof WebServerReturnedAnUnknownError.Type;

/**
 * 521 “Web Server is Down” – Another Cloudflare-specific error code. The
 * origin server refused the connection to Cloudflare. This error could be
 * caused by the origin’s firewall blocking Cloudflare’s IPs.
 *
 * @since 0.0.0
 * @category validation
 */
export const WebServerIsDown = S.Literal(521).pipe(
  $I.annoteSchema("WebServerIsDown", {
    description:
      "521 “Web Server is Down” – Another Cloudflare-specific error code. The\norigin server refused the connection to Cloudflare. This error could be\ncaused by the origin’s firewall blocking Cloudflare’s IPs.",
    emoji: "📉",
  })
);

/**
 * {@inheritDoc WebServerIsDown}
 *
 * @since 0.0.0
 * @category validation
 */
export type WebServerIsDown = typeof WebServerIsDown.Type;

/**
 * 525 “SSL Handshake Failed” – Used by Cloudflare. Cloudflare is unable to
 * establish an SSL/TLS handshake with the origin server.
 *
 * @since 0.0.0
 * @category validation
 */
export const SslHandshakeFailed = S.Literal(525).pipe(
  $I.annoteSchema("SslHandshakeFailed", {
    description:
      "525 “SSL Handshake Failed” – Used by Cloudflare. Cloudflare is unable to\nestablish an SSL/TLS handshake with the origin server.",
    emoji: "🤝",
  })
);

/**
 * {@inheritDoc SslHandshakeFailed}
 *
 * @since 0.0.0
 * @category validation
 */
export type SslHandshakeFailed = typeof SslHandshakeFailed.Type;

/**
 * 526 “Invalid SSL Certificate” – Another code mostly used by Cloudflare.
 * Cloudflare could not validate the SSL installed on the origin server.
 * Usually, caused by invalid or missing SSL on the origin server. Read this
 * guide on how to install Let’s Encrypt for your SiteGround-hosted website.
 *
 * @since 0.0.0
 * @category validation
 */
export const InvalidSslCertificate = S.Literal(526).pipe(
  $I.annoteSchema("InvalidSslCertificate", {
    description:
      "526 “Invalid SSL Certificate” – Another code mostly used by Cloudflare.\nCloudflare could not validate the SSL installed on the origin server.\nUsually, caused by invalid or missing SSL on the origin server. Read this\nguide on how to install Let’s Encrypt for your SiteGround-hosted website.",
    emoji: "📛",
  })
);

/**
 * {@inheritDoc InvalidSslCertificate}
 *
 * @since 0.0.0
 * @category validation
 */
export type InvalidSslCertificate = typeof InvalidSslCertificate.Type;
