/**
 * Complete Http Status Codes
 *
 * There are over 50 official HTTP status codes recognized by the
 * {@link https://www.iana.org/ | Internet Assigned Numbers Authority (IANA)},
 * which is responsible for maintaining and governing Internet standards,
 * including the HTTP codes’ registry.
 *
 * This module includes all official codes and some of the most popular
 * unofficial codes used in specific platforms and services.
 *
 * @module \@beep/schema/http/HttpStatus
 * @since 0.0.0
 */
import { $SchemaId } from "@beep/identity";
import { MappedLiteralKit } from "@beep/schema/MappedLiteralKit";
import { pipe } from "effect";
import * as A from "effect/Array";
import * as S from "effect/Schema";

const $I = $SchemaId.create("HttpStatus");

declare module "effect/Schema" {
  namespace Annotations {
    interface Augment {
      readonly emoji?: undefined | string;
    }
  }
}

/**
 * HttpStatusCategory - HTTP status code category
 *
 * @since 0.0.0
 * @category Validation
 */
export const HttpStatusCategory = MappedLiteralKit([
  ["INFO", "1XX"],
  ["SUCCESS", "2XX"],
  ["REDIRECTION", "3XX"],
  ["CLIENT_ERROR", "4XX"],
  ["SERVER_ERROR", "5XX"],
]).pipe(
  $I.annoteSchema("HttpStatusCategory", {
    description: "HTTP status code category",
    documentation: pipe(
      A.make(
        "1XX - Informational codes that the server returns to tell the client that the request is in progress.",
        "2XX – Successful codes indicating that the request is recognized and is being handled.",
        "3XX – Codes specifying that there will be a redirection.",
        "4XX – These are error codes signaling a problem with the request sent from the client (browser).",
        "5XX – Errors originating from the website’s server that prevent it from sending a valid response."
      ),
      A.join("\n")
    ),
  })
);

/**
 * {@inheritDoc HttpStatusCategory}
 *
 * @category Validation
 * @since 0.0.0
 */
export type HttpStatusCategory = typeof HttpStatusCategory.Type;

// =============================================================================
// 1XX Status Codes - Informational
// =============================================================================

/**
 * 100 “Continue” – The server has received the headers of the request.
 * It now tells your browser to proceed with sending the body of the request.
 *
 * @since 0.0.0
 * @category Validation
 */
export const Continue = S.Literal(100).pipe(
  $I.annoteSchema("Continue", {
    description:
      "100 “Continue” – The server has received the headers of the request.\nIt now tells your browser to proceed with sending the body of the request.",
    emoji: "🏁",
  })
);

/**
 * {@inheritDoc Continue}
 *
 * @since 0.0.0
 * @category Validation
 */
export type Continue = typeof Continue.Type;

/**
 * 101 “Switching Protocols” – The requesting client (browser) asked the server to
 * change the protocols, and the server fulfilled the request.
 *
 * @since 0.0.0
 * @category Validation
 */
export const SwitchingProtocols = S.Literal(101).pipe(
  $I.annoteSchema("SwitchingProtocols", {
    description:
      "101 “Switching Protocols” – The requesting client (browser) asked the server\nto change the protocols, and the server fulfilled the request.",
    emoji: "🔌",
  })
);

/**
 * {@inheritDoc SwitchingProtocols}
 *
 * @since 0.0.0
 * @category Validation
 */
export type SwitchingProtocols = typeof SwitchingProtocols.Type;

/**
 * 102 “Processing” – This is a response mainly associated with WebDAV
 * requests, which may take a longer time to be completed. It indicates that
 * the server has received the request and is currently processing it.
 *
 * @since 0.0.0
 * @category Validation
 */
export const Processing = S.Literal(102).pipe(
  $I.annoteSchema("Processing", {
    description:
      "102 “Processing” – This is a response mainly associated with WebDAV\nrequests, which may take a longer time to be completed. It indicates that\nthe server has received the request and is currently processing it.",
    emoji: "⚙️",
  })
);

/**
 * {@inheritDoc Processing}
 *
 * @since 0.0.0
 * @category Validation
 */
export type Processing = typeof Processing.Type;

/**
 * 103 “Early Hints” – The server returns some response headers before the
 * final HTTP response is sent.
 *
 * @since 0.0.0
 * @category Validation
 */
export const EarlyHints = S.Literal(103).pipe(
  $I.annoteSchema("EarlyHints", {
    description:
      "103 “Early Hints” – The server returns some response headers before the\nfinal HTTP response is sent.",
    emoji: "💡",
  })
);

/**
 * {@inheritDoc EarlyHints}
 *
 * @since 0.0.0
 * @category Validation
 */
export type EarlyHints = typeof EarlyHints.Type;

/**
 * 1XX codes are informational responses from the website’s server. They do not
 * generate content and only update clients on the progress of their requests.
 * This information is sent in the headers of the HTTP response.
 *
 * @since 0.0.0
 * @category Validation
 */
export const HttpStatus1XX = MappedLiteralKit([
  ["Continue", Continue.literal],
  ["SwitchingProtocols", SwitchingProtocols.literal],
  ["Processing", Processing.literal],
  ["EarlyHints", EarlyHints.literal],
]).pipe(
  $I.annoteSchema("HttpStatus1XX", {
    description:
      "1XX codes are informational responses from the website’s server. They do not\ngenerate content and only update clients on the progress of their requests.\nThis information is sent in the headers of the HTTP response.",
  })
);

/**
 * A namespace for {@link HttpStatus1XX} to contain the Encoded type
 *
 * @category Validation
 * @since 0.0.0
 */
export declare namespace HttpStatus1XX {
  /**
   * The encoded type of {@link HttpStatus1XX}
   *
   * @category Validation
   * @since 0.0.0
   */
  export type Encoded = typeof HttpStatus1XX.Encoded;
}

/**
 * {@inheritDoc HttpStatus1XX}
 *
 * @category Validation
 * @since 0.0.0
 */
export type HttpStatus1XX = typeof HttpStatus1XX.Type;

// =============================================================================
// 2XX Status Codes - Success
// =============================================================================

/**
 * 200 “OK” – The response for a successful HTTP request. The result will depend on the type of request.
 *
 * @since 0.0.0
 * @category Validation
 */
export const Ok = S.Literal(200).pipe(
  $I.annoteSchema("Ok", {
    description:
      "200 “OK” – The response for a successful HTTP request. The result will depend on the type of request.",
    emoji: "✅",
  })
);

/**
 * {@inheritDoc Ok}
 *
 * @since 0.0.0
 * @category Validation
 */
export type Ok = typeof Ok.Type;

/**
 * 201 “Created” – The request was fulfilled, and the server created a new resource.
 *
 * @since 0.0.0
 * @category Validation
 */
export const Created = S.Literal(201).pipe(
  $I.annoteSchema("Created", {
    description: "201 “Created” – The request was fulfilled, and the server created a new resource.",
    emoji: "📝",
  })
);

/**
 * {@inheritDoc Created}
 *
 * @since 0.0.0
 * @category Validation
 */
export type Created = typeof Created.Type;

/**
 * 202 “Accepted” – The server accepted the request but has not yet finished
 * processing it. The request might be fulfilled or rejected, but the outcome
 * is still undetermined.
 *
 * @since 0.0.0
 * @category Validation
 */
export const Accepted = S.Literal(202).pipe(
  $I.annoteSchema("Accepted", {
    description:
      "202 “Accepted” – The server accepted the request but has not yet finished\nprocessing it. The request might be fulfilled or rejected, but the outcome\nis still undetermined.",
    emoji: "🔄",
  })
);

/**
 * {@inheritDoc Accepted}
 *
 * @since 0.0.0
 * @category Validation
 */
export type Accepted = typeof Accepted.Type;

/**
 * 203 “Non-Authoritative Information” – A code that usually appears when a
 * proxy service is used. The proxy server received a 200 “OK” status code
 * from the origin server and returns a modified version of the origin’s
 * response.
 *
 * @since 0.0.0
 * @category Validation
 */
export const NonAuthoritativeInformation = S.Literal(203).pipe(
  $I.annoteSchema("NonAuthoritativeInformation", {
    description:
      "203 “Non-Authoritative Information” – A code that usually appears when a\nproxy service is used. The proxy server received a 200 “OK” status code\nfrom the origin server and returns a modified version of the origin’s\nresponse.",
    emoji: "📋",
  })
);

/**
 * {@inheritDoc NonAuthoritativeInformation}
 *
 * @since 0.0.0
 * @category Validation
 */
export type NonAuthoritativeInformation = typeof NonAuthoritativeInformation.Type;

/**
 * 204 “No Content” – The server fulfilled the request but won’t return any
 * content.
 *
 * @since 0.0.0
 * @category Validation
 */
export const NoContent = S.Literal(204).pipe(
  $I.annoteSchema("NoContent", {
    description: "204 “No Content” – The server fulfilled the request but won’t return any content.",
    emoji: "💭",
  })
);

/**
 * {@inheritDoc NoContent}
 *
 * @since 0.0.0
 * @category Validation
 */
export type NoContent = typeof NoContent.Type;

/**
 * 205 “Reset Content” – The server fulfilled the request, and it won’t return
 * any content but asks the client (browser) to reset the document view.
 *
 * @since 0.0.0
 * @category Validation
 */
export const ResetContent = S.Literal(205).pipe(
  $I.annoteSchema("ResetContent", {
    description:
      "205 “Reset Content” – The server fulfilled the request, and it won’t return\nany content but asks the client (browser) to reset the document view.",
    emoji: "♻️",
  })
);

/**
 * {@inheritDoc ResetContent}
 *
 * @since 0.0.0
 * @category Validation
 */
export type ResetContent = typeof ResetContent.Type;

/**
 * 206 “Partial Content” – The server returns only a portion of the requested
 * resources because your browser uses “range headers”. These headers allow
 * browsers to resume downloads or split downloads into multiple simultaneous
 * streams.
 *
 * @since 0.0.0
 * @category Validation
 */
export const PartialContent = S.Literal(206).pipe(
  $I.annoteSchema("PartialContent", {
    description:
      "206 “Partial Content” – The server returns only a portion of the requested\nresources because your browser uses “range headers”. These headers allow\nbrowsers to resume downloads or split downloads into multiple simultaneous\nstreams.",
    emoji: "✂️",
  })
);

/**
 * {@inheritDoc PartialContent}
 *
 * @since 0.0.0
 * @category Validation
 */
export type PartialContent = typeof PartialContent.Type;

/**
 * 207 “Multi-Status” – A code associated with WebDav when a compound request
 * is made. The server returns a message containing an array of response codes
 * for all sub-requests.
 *
 * @since 0.0.0
 * @category Validation
 */
export const MultiStatus = S.Literal(207).pipe(
  $I.annoteSchema("MultiStatus", {
    description:
      "207 “Multi-Status” – A code associated with WebDav when a compound request\nis made. The server returns a message containing an array of response codes\nfor all sub-requests.",
    emoji: "🗂️",
  })
);

/**
 * {@inheritDoc MultiStatus}
 *
 * @since 0.0.0
 * @category Validation
 */
export type MultiStatus = typeof MultiStatus.Type;

/**
 * 208 “Already Reported” (WebDav) – This code indicates that the internal
 * members of a DAV binding were already enumerated in a previous part of the
 * response and will not be enumerated again.
 *
 * @since 0.0.0
 * @category Validation
 */
export const AlreadyReported = S.Literal(208).pipe(
  $I.annoteSchema("AlreadyReported", {
    description:
      "208 “Already Reported” (WebDav) – This code indicates that the internal\nmembers of a DAV binding were already enumerated in a previous part of the\nresponse and will not be enumerated again.",
    emoji: "☑️",
  })
);

/**
 * {@inheritDoc AlreadyReported}
 *
 * @since 0.0.0
 * @category Validation
 */
export type AlreadyReported = typeof AlreadyReported.Type;

/**
 * 226 “IM Used” – The server fulfilled the request, and the response is a
 * representation of the result of one or more instance manipulations applied
 * to the current instance.
 *
 * @since 0.0.0
 * @category Validation
 */
export const ImUsed = S.Literal(226).pipe(
  $I.annoteSchema("ImUsed", {
    description:
      "226 “IM Used” – The server fulfilled the request, and the response is a\nrepresentation of the result of one or more instance manipulations applied\nto the current instance.",
    emoji: "🪄",
  })
);

/**
 * {@inheritDoc ImUsed}
 *
 * @since 0.0.0
 * @category Validation
 */
export type ImUsed = typeof ImUsed.Type;

/**
 * The 2XX codes are the best responses you can receive. They indicate that the
 * request was recognized by the server, was accepted, and is being processed.
 *
 * @since 0.0.0
 * @category Validation
 */
export const HttpStatus2XX = MappedLiteralKit([
  ["Ok", Ok.literal],
  ["Created", Created.literal],
  ["Accepted", Accepted.literal],
  ["NonAuthoritativeInformation", NonAuthoritativeInformation.literal],
  ["NoContent", NoContent.literal],
  ["ResetContent", ResetContent.literal],
  ["PartialContent", PartialContent.literal],
  ["MultiStatus", MultiStatus.literal],
  ["AlreadyReported", AlreadyReported.literal],
  ["ImUsed", ImUsed.literal],
]).pipe(
  $I.annoteSchema("HttpStatus2XX", {
    description:
      "The 2XX codes are the best responses you can receive. They indicate that the\nrequest was recognized by the server, was accepted, and is being processed.",
  })
);

/**
 * A namespace for {@link HttpStatus2XX} to contain the Encoded type
 *
 * @category Validation
 * @since 0.0.0
 */
export declare namespace HttpStatus2XX {
  /**
   * The encoded type of {@link HttpStatus2XX}
   *
   * @category Validation
   * @since 0.0.0
   */
  export type Encoded = typeof HttpStatus2XX.Encoded;
}

/**
 * {@inheritDoc HttpStatus2XX}
 *
 * @since 0.0.0
 * @category Validation
 */
export type HttpStatus2XX = typeof HttpStatus2XX.Type;

// =============================================================================
// 3XX Status Codes - Redirection
// =============================================================================

/**
 * 300 “Multiple Choices” – The server presents the client with a choice of
 * multiple resources to choose from. The status code is applied when you use
 * your browser to download files and you are given a choice of file extension,
 * or when you are presented with options for word-sense disambiguation.
 *
 * @since 0.0.0
 * @category Validation
 */
export const MultipleChoices = S.Literal(300).pipe(
  $I.annoteSchema("MultipleChoices", {
    description:
      "300 “Multiple Choices” – The server presents the client with a choice " +
      "of\nmultiple resources to choose from. The status code is applied when " +
      "you use\nyour browser to download files and you are given a choice of " +
      "file extension,\nor when you are presented with options for word-sense " +
      "disambiguation.",
    emoji: "🔀",
  })
);

/**
 * {@inheritDoc MultipleChoices}
 *
 * @since 0.0.0
 * @category Validation
 */
export type MultipleChoices = typeof MultipleChoices.Type;

/**
 * 301 “Moved Permanently” – This is the code for a permanent redirect. It means that the URL of the requested resource is permanently replaced with a new address, and search engines should update the URL in their databases.
 * You learn more about it from our article on 301 redirects.
 *
 * @since 0.0.0
 * @category Validation
 */
export const MovedPermanently = S.Literal(301).pipe(
  $I.annoteSchema("MovedPermanently", {
    description:
      "301 “Moved Permanently” – This is the code for a permanent redirect. It means that the URL of the requested resource is permanently replaced with a new address, and search engines should update the URL in their databases.\nYou learn more about it from our article on 301 redirects.",
    emoji: "🚚",
  })
);

/**
 * {@inheritDoc MovedPermanently}
 *
 * @since 0.0.0
 * @category Validation
 */
export type MovedPermanently = typeof MovedPermanently.Type;

/**
 * 302 “Found” – Previously, this code was known as “Moved temporarily”. It
 * instructs browsers that the requested resource is moved temporarily to a new
 * URL, but the new address may be changed again in the future. Thus, the
 * original URL should still be used by the client. The code is used for
 * temporary redirects.
 *
 * @since 0.0.0
 * @category Validation
 */
export const Found = S.Literal(302).pipe(
  $I.annoteSchema("Found", {
    description:
      "302 “Found” – Previously, this code was known as “Moved temporarily”. It\ninstructs browsers that the requested resource is moved temporarily to a new\nURL, but the new address may be changed again in the future. Thus, the\noriginal URL should still be used by the client. The code is used for\ntemporary redirects.",
    emoji: "🔎",
  })
);

/**
 * {@inheritDoc Found}
 *
 * @since 0.0.0
 * @category Validation
 */
export type Found = typeof Found.Type;

/**
 * 303 “See Other” – The server instructs the client that it found the
 * resource, but it has to be retrieved on another URL with a GET request.
 *
 * @since 0.0.0
 * @category Validation
 */
export const SeeOther = S.Literal(303).pipe(
  $I.annoteSchema("SeeOther", {
    description:
      "303 “See Other” – The server instructs the client that it found the\nresource, but it has to be retrieved on another URL with a GET request.",
    emoji: "📨",
  })
);

/**
 * {@inheritDoc SeeOther}
 *
 * @since 0.0.0
 * @category Validation
 */
export type SeeOther = typeof SeeOther.Type;

/**
 * 304 “Not Modified” – The server informs your browser that the resource
 * hasn’t been altered since the last time you requested it. Your browser can
 * keep using the cached version it already stores locally. Clearing the
 * browser cache usually solves this error.
 *
 * @since 0.0.0
 * @category Validation
 */
export const NotModified = S.Literal(304).pipe(
  $I.annoteSchema("NotModified", {
    description:
      "304 “Not Modified” – The server informs your browser that the resource\nhasn’t been altered since the last time you requested it. Your browser can\nkeep using the cached version it already stores locally. Clearing the\nbrowser cache usually solves this error.",
    emoji: "💠",
  })
);

/**
 * {@inheritDoc NotModified}
 *
 * @since 0.0.0
 * @category Validation
 */
export type NotModified = typeof NotModified.Type;

/**
 * 305 “Use Proxy” – The requested resource is available only through a proxy.
 * This code is now deprecated and browsers disregard it.
 *
 * @since 0.0.0
 * @category Validation
 */
export const UseProxy = S.Literal(305).pipe(
  $I.annoteSchema("UseProxy", {
    description:
      "305 “Use Proxy” – The requested resource is available only through a proxy.\nThis code is now deprecated and browsers disregard it.",
    emoji: "🔁",
  })
);

/**
 * {@inheritDoc UseProxy}
 *
 * @since 0.0.0
 * @category Validation
 */
export type UseProxy = typeof UseProxy.Type;

/**
 * 306 “Switch Proxy” – This code is no longer in use. It means that the
 * following requests should use the specified proxy.
 *
 * @since 0.0.0
 * @category Validation
 */
export const SwitchProxy = S.Literal(306).pipe(
  $I.annoteSchema("SwitchProxy", {
    description:
      "306 “Switch Proxy” – This code is no longer in use. It means that the\nfollowing requests should use the specified proxy.",
    emoji: "🔃",
  })
);

/**
 * {@inheritDoc SwitchProxy}
 *
 * @since 0.0.0
 * @category Validation
 */
export type SwitchProxy = typeof SwitchProxy.Type;

/**
 * 307 “Temporary redirect” – This is the new code for temporary redirects that
 * replaced the HTTP 302 code. It specifies that the requested resource has
 * moved to another URL. Unlike the HTTP 302 code, the HTTP 307 code doesn’t
 * allow the HTTP method to be changed. For example, if the first request was
 * GET, the second request should be GET as well.
 *
 * @since 0.0.0
 * @category Validation
 */
export const TemporaryRedirect = S.Literal(307).pipe(
  $I.annoteSchema("TemporaryRedirect", {
    description:
      "307 “Temporary redirect” – This is the new code for temporary redirects that\nreplaced the HTTP 302 code. It specifies that the requested resource has\nmoved to another URL. Unlike the HTTP 302 code, the HTTP 307 code doesn’t\nallow the HTTP method to be changed. For example, if the first request was\nGET, the second request should be GET as well.",
    emoji: "ℹ️",
  })
);

/**
 * {@inheritDoc TemporaryRedirect}
 *
 * @since 0.0.0
 * @category Validation
 */
export type TemporaryRedirect = typeof TemporaryRedirect.Type;

/**
 * 308 “Permanent Redirect” – The requested resource is permanently moved to
 * another URL and all future requests must be redirected to the new address.
 * The code is similar to the HTTP 302 code, the only difference being that it
 * doesn’t allow browsers to change the type of HTTP request.
 *
 * @since 0.0.0
 * @category Validation
 */
export const PermanentRedirect = S.Literal(308).pipe(
  $I.annoteSchema("PermanentRedirect", {
    description:
      "308 “Permanent Redirect” – The requested resource is permanently moved to\nanother URL and all future requests must be redirected to the new address.\nThe code is similar to the HTTP 302 code, the only difference being that it\ndoesn’t allow browsers to change the type of HTTP request.",
    emoji: "🆕",
  })
);

/**
 * {@inheritDoc PermanentRedirect}
 *
 * @since 0.0.0
 * @category Validation
 */
export type PermanentRedirect = typeof PermanentRedirect.Type;

/**
 * 3XX codes specify that there will be a redirection. {@link https://www.siteground.com/kb/domain-redirects/ | Redirects} are
 * commonly
 * used when a resource is moved to a new address. The different 3XX codes instruct
 * browsers on how the redirect must be performed.
 *
 * @since 0.0.0
 * @category Validation
 */
export const HttpStatus3XX = MappedLiteralKit([
  ["MultipleChoices", MultipleChoices.literal],
  ["MovedPermanently", MovedPermanently.literal],
  ["Found", Found.literal],
  ["SeeOther", SeeOther.literal],
  ["NotModified", NotModified.literal],
  ["UseProxy", UseProxy.literal],
  ["SwitchProxy", SwitchProxy.literal],
  ["TemporaryRedirect", TemporaryRedirect.literal],
  ["PermanentRedirect", PermanentRedirect.literal],
]).pipe(
  $I.annoteSchema("HttpStatus3XX", {
    description:
      "3XX codes specify that there will be a redirection. {@link https://www.siteground.com/kb/domain-redirects/ | Redirects} are\ncommonly\nused when a resource is moved to a new address. The different 3XX codes instruct\nbrowsers on how the redirect must be performed.",
  })
);

/**
 * {@inheritDoc HttpStatus3XX}
 *
 * @since 0.0.0
 * @category Validation
 */
export type HttpStatus3XX = typeof HttpStatus3XX.Type;

/**
 * A namespace for {@link HttpStatus3XX} to contain the Encoded type
 *
 * @category Validation
 * @since 0.0.0
 */
export declare namespace HttpStatus3XX {
  /**
   * The encoded type of {@link HttpStatus3XX}
   *
   * @category Validation
   * @since 0.0.0
   */
  export type Encoded = typeof HttpStatus3XX.Encoded;
}

// =============================================================================
// 4XX Status Codes - Client Errors
// =============================================================================

/**
 * 400 “Bad Request” – The server can’t return a valid response due to an error
 * from the client’s side. Common causes are URLs with invalid syntax, deceptive
 * request routing, large file size, etc.
 *
 * @since 0.0.0
 * @category Validation
 */
export const BadRequest = S.Literal(400).pipe(
  $I.annoteSchema("BadRequest", {
    description:
      "400 “Bad Request” – The server can’t return a valid response due to an error\nfrom the client’s side. Common causes are URLs with invalid syntax, deceptive\nrequest routing, large file size, etc.",
    emoji: "🚫",
  })
);

/**
 * {@inheritDoc BadRequest}
 *
 * @since 0.0.0
 * @category Validation
 */
export type BadRequest = typeof BadRequest.Type;

/**
 * 401 “Unauthorized” – This error appears when the client fails to provide
 * valid credentials and the response from the server includes a
 * WWW-Authenticate header. You will likely see this error when you try to
 * access password-protected URLs and don’t have the correct login information.
 * If you experience this problem, check this guide for
 * {@link https://www.siteground.com/kb/error-401/
 * | troubleshooting the HTTP 401 error.}
 *
 * @since 0.0.0
 * @category Validation
 */
export const Unauthorized = S.Literal(401).pipe(
  $I.annoteSchema("Unauthorized", {
    description:
      "401 “Unauthorized” – This error appears when the client fails to " +
      "provide\nvalid credentials and the response from the server includes " +
      "a\nWWW-Authenticate header. You will likely see this error when you " +
      "try to\naccess password-protected URLs and don’t have " +
      "the correct login information.\nIf you experience this problem," +
      " check this guide " +
      "for\n{@link https://www.siteground.com/kb/error-401/\n| " +
      "troubleshooting the HTTP 401 error.}",
    emoji: "🔐",
  })
);

/**
 * {@inheritDoc Unauthorized}
 *
 * @since 0.0.0
 * @category Validation
 */
export type Unauthorized = typeof Unauthorized.Type;

/**
 * 402 “Payment Required” – This is not a standard code however it is reserved
 * to be used in the future by payment systems. The purpose of the code is to
 * indicate that the content is not available due to a failed payment.
 *
 * @since 0.0.0
 * @category Validation
 */
export const PaymentRequired = S.Literal(402).pipe(
  $I.annoteSchema("PaymentRequired", {
    description:
      "402 “Payment Required” – This is not a standard code however it is reserved\nto be used in the future by payment systems. The purpose of the code is to\nindicate that the content is not available due to a failed payment.",
    emoji: "💰",
  })
);

/**
 * {@inheritDoc PaymentRequired}
 *
 * @since 0.0.0
 * @category Validation
 */
export type PaymentRequired = typeof PaymentRequired.Type;

/**
 * 403 “Forbidden” – The error indicates that the server denies access to the
 * user agent that doesn’t have permission to access the resources. This error
 * is similar to HTTP code 401, but the difference is that in this case, the
 * identity of the user agent is known.
 * Typical causes of this error are restrictive rules from the website’s
 * server, insufficient permissions for the website’s files and folders, etc.
 * For more information, read this article about the HTTP 403 error and how to
 * fix it.
 *
 * @since 0.0.0
 * @category Validation
 */
export const Forbidden = S.Literal(403).pipe(
  $I.annoteSchema("Forbidden", {
    description:
      "403 “Forbidden” – The error indicates that the server denies access to the\nuser agent that doesn’t have permission to access the resources. This error\nis similar to HTTP code 401, but the difference is that in this case, the\nidentity of the user agent is known.\nTypical causes of this error are restrictive rules from the website’s\nserver, insufficient permissions for the website’s files and folders, etc.\nFor more information, read this article about the HTTP 403 error and how to\nfix it.",
    emoji: "⛔",
  })
);

/**
 * {@inheritDoc Forbidden}
 *
 * @since 0.0.0
 * @category Validation
 */
export type Forbidden = typeof Forbidden.Type;

/**
 * 404 “Not found” – This is the most frequent error users see online. It means
 * that the server can’t find the requested resource. Usually, the cause is
 * that the URL you’re trying to access doesn’t exist.
 * The error could also be caused by a website misconfiguration. Read the
 * following guide for troubleshooting the HTTP error 404.
 *
 * @since 0.0.0
 * @category Validation
 */
export const NotFound = S.Literal(404).pipe(
  $I.annoteSchema("NotFound", {
    description:
      "404 “Not found” – This is the most frequent error users see online. It means\nthat the server can’t find the requested resource. Usually, the cause is\nthat the URL you’re trying to access doesn’t exist.\nThe error could also be caused by a website misconfiguration. Read the\nfollowing guide for troubleshooting the HTTP error 404.",
    emoji: "❓",
  })
);

/**
 * {@inheritDoc NotFound}
 *
 * @since 0.0.0
 * @category Validation
 */
export type NotFound = typeof NotFound.Type;

/**
 * 405 “Method Not Allowed” – The server understands the requested method, but
 * the target resource doesn’t support it.
 *
 * @since 0.0.0
 * @category Validation
 */
export const MethodNotAllowed = S.Literal(405).pipe(
  $I.annoteSchema("MethodNotAllowed", {
    description:
      "405 “Method Not Allowed” – The server understands the requested method, but\nthe target resource doesn’t support it.",
    emoji: "❗",
  })
);

/**
 * {@inheritDoc MethodNotAllowed}
 *
 * @since 0.0.0
 * @category Validation
 */
export type MethodNotAllowed = typeof MethodNotAllowed.Type;

/**
 * 406 “Not Acceptable” – The requested resource generated content that doesn’t
 * meet the criteria of the user-agent who requested it.
 *
 * @since 0.0.0
 * @category Validation
 */
export const NotAcceptable = S.Literal(406).pipe(
  $I.annoteSchema("NotAcceptable", {
    description:
      "406 “Not Acceptable” – The requested resource generated content that doesn’t\nmeet the criteria of the user-agent who requested it.",
    emoji: "🛡",
  })
);

/**
 * {@inheritDoc NotAcceptable}
 *
 * @since 0.0.0
 * @category Validation
 */
export type NotAcceptable = typeof NotAcceptable.Type;

/**
 * 407 “Proxy Authentication Required” – There is a proxy server used in the
 * communication between the browser and the server and it requires
 * authentication.
 *
 * @since 0.0.0
 * @category Validation
 */
export const ProxyAuthenticationRequired = S.Literal(407).pipe(
  $I.annoteSchema("ProxyAuthenticationRequired", {
    description:
      "407 “Proxy Authentication Required” – There is a proxy server used in the\ncommunication between the browser and the server and it requires\nauthentication.",
    emoji: "🔩",
  })
);

/**
 * {@inheritDoc ProxyAuthenticationRequired}
 *
 * @since 0.0.0
 * @category Validation
 */
export type ProxyAuthenticationRequired = typeof ProxyAuthenticationRequired.Type;

/**
 * 408 “Request Timeout” – The server closed due to a time-out while waiting
 * for a request from your browser. In some cases, servers may send this
 * message on an idle connection even without any previous request from the
 * client.
 * It should be noted that servers may close the connection without sending a
 * message.
 *
 * @since 0.0.0
 * @category Validation
 */
export const RequestTimeout = S.Literal(408).pipe(
  $I.annoteSchema("RequestTimeout", {
    description:
      "408 “Request Timeout” – The server closed due to a time-out while waiting\nfor a request from your browser. In some cases, servers may send this\nmessage on an idle connection even without any previous request from the\nclient.\nIt should be noted that servers may close the connection without sending a\nmessage.",
    emoji: "⌛️",
  })
);

/**
 * {@inheritDoc RequestTimeout}
 *
 * @since 0.0.0
 * @category Validation
 */
export type RequestTimeout = typeof RequestTimeout.Type;

/**
 * 409 “Conflict” – This error occurs when a request can not be processed due
 * to a conflict in the current state of the resource on the server. An example
 * of this error is when multiple edits of the same file are submitted to the
 * server and the edits conflict with each other.
 *
 * @since 0.0.0
 * @category Validation
 */
export const Conflict = S.Literal(409).pipe(
  $I.annoteSchema("Conflict", {
    description:
      "409 “Conflict” – This error occurs when a request can not be processed due\nto a conflict in the current state of the resource on the server. An example\nof this error is when multiple edits of the same file are submitted to the\nserver and the edits conflict with each other.",
    emoji: "💥",
  })
);

/**
 * {@inheritDoc Conflict}
 *
 * @since 0.0.0
 * @category Validation
 */
export type Conflict = typeof Conflict.Type;

/**
 * 410 “Gone” – The requested resource is not available and will not be
 * available in the future. It is not replaced with a new resource on a new
 * address so clients are expected to remove any links and cache related to the
 * resource. For example, search engines should remove the resource’s
 * information from their databases.
 *
 * @since 0.0.0
 * @category Validation
 */
export const Gone = S.Literal(410).pipe(
  $I.annoteSchema("Gone", {
    description:
      "410 “Gone” – The requested resource is not available and will not be\navailable in the future. It is not replaced with a new resource on a new\naddress so clients are expected to remove any links and cache related to the\nresource. For example, search engines should remove the resource’s\ninformation from their databases.",
    emoji: "💨",
  })
);

/**
 * {@inheritDoc Gone}
 *
 * @since 0.0.0
 * @category Validation
 */
export type Gone = typeof Gone.Type;

/**
 * 411 “Length Required” – The length of the request’s content is not specified
 * and the resource on the server requires it.
 *
 * @since 0.0.0
 * @category Validation
 */
export const LengthRequired = S.Literal(411).pipe(
  $I.annoteSchema("LengthRequired", {
    description:
      "411 “Length Required” – The length of the request’s content is not specified\nand the resource on the server requires it.",
    emoji: "📏",
  })
);

/**
 * {@inheritDoc LengthRequired}
 *
 * @since 0.0.0
 * @category Validation
 */
export type LengthRequired = typeof LengthRequired.Type;

/**
 * 412 “Precondition failed” – The headers of the request specify certain
 * preconditions that the server fails to meet.
 *
 * @since 0.0.0
 * @category Validation
 */
export const PreconditionFailed = S.Literal(412).pipe(
  $I.annoteSchema("PreconditionFailed", {
    description:
      "412 “Precondition failed” – The headers of the request specify certain\npreconditions that the server fails to meet.",
    emoji: "🛑",
  })
);

/**
 * {@inheritDoc PreconditionFailed}
 *
 * @since 0.0.0
 * @category Validation
 */
export type PreconditionFailed = typeof PreconditionFailed.Type;

/**
 * 413 “Payload too large” – The request is larger than the limits specified on
 * the server, thus the server can not process the request.
 * You may see this error on your WordPress site when you try to upload a file
 * and its size exceeds the upload limit of your website. If you encounter this
 * problem, read this guide about the “413 Entity Too Large” Error in
 * WordPress.
 *
 * @since 0.0.0
 * @category Validation
 */
export const PayloadTooLarge = S.Literal(413).pipe(
  $I.annoteSchema("PayloadTooLarge", {
    description:
      "413 “Payload too large” – The request is larger than the limits specified on\nthe server, thus the server can not process the request.\nYou may see this error on your WordPress site when you try to upload a file\nand its size exceeds the upload limit of your website. If you encounter this\nproblem, read this guide about the “413 Entity Too Large” Error in\nWordPress.",
    emoji: "🗃",
  })
);

/**
 * {@inheritDoc PayloadTooLarge}
 *
 * @since 0.0.0
 * @category Validation
 */
export type PayloadTooLarge = typeof PayloadTooLarge.Type;

/**
 * 414 “URI Too Long” – The length of the URI is too long and the server can’t
 * process it. Usually, this is the result of a GET request containing too much
 * data and therefore must be changed to a POST request.
 *
 * @since 0.0.0
 * @category Validation
 */
export const UriTooLong = S.Literal(414).pipe(
  $I.annoteSchema("UriTooLong", {
    description:
      "414 “URI Too Long” – The length of the URI is too long and the server can’t\nprocess it. Usually, this is the result of a GET request containing too much\ndata and therefore must be changed to a POST request.",
    emoji: "🆖",
  })
);

/**
 * {@inheritDoc UriTooLong}
 *
 * @since 0.0.0
 * @category Validation
 */
export type UriTooLong = typeof UriTooLong.Type;

/**
 * 415 “Unsupported Media Type” – The request contains a media type that the
 * server doesn’t support. For instance, you try to upload an image file in
 * .jpg format, but the server doesn’t support it.
 *
 * @since 0.0.0
 * @category Validation
 */
export const UnsupportedMediaType = S.Literal(415).pipe(
  $I.annoteSchema("UnsupportedMediaType", {
    description:
      "415 “Unsupported Media Type” – The request contains a media type that the\nserver doesn’t support. For instance, you try to upload an image file in\n.jpg format, but the server doesn’t support it.",
    emoji: "📼",
  })
);

/**
 * {@inheritDoc UnsupportedMediaType}
 *
 * @since 0.0.0
 * @category Validation
 */
export type UnsupportedMediaType = typeof UnsupportedMediaType.Type;

/**
 * 416 “Range Not Satisfiable” – The request asked for a portion of the
 * resource that the server can’t provide. This error can occur when your
 * browser asks for a portion of a file that is outside of the end of the file.
 *
 * @since 0.0.0
 * @category Validation
 */
export const RangeNotSatisfiable = S.Literal(416).pipe(
  $I.annoteSchema("RangeNotSatisfiable", {
    description:
      "416 “Range Not Satisfiable” – The request asked for a portion of the\nresource that the server can’t provide. This error can occur when your\nbrowser asks for a portion of a file that is outside of the end of the file.",
    emoji: "📐",
  })
);

/**
 * {@inheritDoc RangeNotSatisfiable}
 *
 * @since 0.0.0
 * @category Validation
 */
export type RangeNotSatisfiable = typeof RangeNotSatisfiable.Type;

/**
 * 417 “Expectation Failed” – The server fails to meet the requirements set in
 * the request’s expected header field.
 *
 * @since 0.0.0
 * @category Validation
 */
export const ExpectationFailed = S.Literal(417).pipe(
  $I.annoteSchema("ExpectationFailed", {
    description:
      "417 “Expectation Failed” – The server fails to meet the requirements set in\nthe request’s expected header field.",
    emoji: "🤔",
  })
);

/**
 * {@inheritDoc ExpectationFailed}
 *
 * @since 0.0.0
 * @category Validation
 */
export type ExpectationFailed = typeof ExpectationFailed.Type;

/**
 * 418 “I’m a teapot.” – This error is returned by teapots requested to brew
 * coffee. It is an April’s Fool joke dating back to 1998.
 *
 * @since 0.0.0
 * @category Validation
 */
export const ImATeapot = S.Literal(418).pipe(
  $I.annoteSchema("ImATeapot", {
    description:
      "418 “I’m a teapot.” – This error is returned by teapots requested to brew\ncoffee. It is an April’s Fool joke dating back to 1998.",
    emoji: "🍵",
  })
);

/**
 * {@inheritDoc ImATeapot}
 *
 * @since 0.0.0
 * @category Validation
 */
export type ImATeapot = typeof ImATeapot.Type;

/**
 * 421 “Misdirected Request” – The request was directed to a server unable to
 * produce a response.
 *
 * @since 0.0.0
 * @category Validation
 */
export const MisdirectedRequest = S.Literal(421).pipe(
  $I.annoteSchema("MisdirectedRequest", {
    description: "421 “Misdirected Request” – The request was directed to a server unable to\nproduce a response.",
    emoji: "🔂",
  })
);

/**
 * {@inheritDoc MisdirectedRequest}
 *
 * @since 0.0.0
 * @category Validation
 */
export type MisdirectedRequest = typeof MisdirectedRequest.Type;

/**
 * 422 “Unprocessable Entity” – The request from the client is well-formed but
 * it contains semantic errors that prevent the server from processing a
 * response. If you stumble upon this error, check out our article about the
 * 422 Error Code.
 *
 * @since 0.0.0
 * @category Validation
 */
export const UnprocessableEntity = S.Literal(422).pipe(
  $I.annoteSchema("UnprocessableEntity", {
    description:
      "422 “Unprocessable Entity” – The request from the client is well-formed but\nit contains semantic errors that prevent the server from processing a\nresponse. If you stumble upon this error, check out our article about the\n422 Error Code.",
    emoji: "💩",
  })
);

/**
 * {@inheritDoc UnprocessableEntity}
 *
 * @since 0.0.0
 * @category Validation
 */
export type UnprocessableEntity = typeof UnprocessableEntity.Type;

/**
 * 423 “Locked” – The resource that is being accessed is locked.
 *
 * @since 0.0.0
 * @category Validation
 */
export const Locked = S.Literal(423).pipe(
  $I.annoteSchema("Locked", {
    description: "423 “Locked” – The resource that is being accessed is locked.",
    emoji: "🔒",
  })
);

/**
 * {@inheritDoc Locked}
 *
 * @since 0.0.0
 * @category Validation
 */
export type Locked = typeof Locked.Type;

/**
 * 424 “Failed Dependency” – The request failed because it depended on another
 * request that failed as well.
 *
 * @since 0.0.0
 * @category Validation
 */
export const FailedDependency = S.Literal(424).pipe(
  $I.annoteSchema("FailedDependency", {
    description:
      "424 “Failed Dependency” – The request failed because it depended on another\nrequest that failed as well.",
    emoji: "🧶",
  })
);

/**
 * {@inheritDoc FailedDependency}
 *
 * @since 0.0.0
 * @category Validation
 */
export type FailedDependency = typeof FailedDependency.Type;

/**
 * 425 “Too Early” – This error indicates that the server is unwilling to risk
 * processing a request that might be replayed.
 *
 * @since 0.0.0
 * @category Validation
 */
export const TooEarly = S.Literal(425).pipe(
  $I.annoteSchema("TooEarly", {
    description:
      "425 “Too Early” – This error indicates that the server is unwilling to risk\nprocessing a request that might be replayed.",
    emoji: "⏱",
  })
);

/**
 * {@inheritDoc TooEarly}
 *
 * @since 0.0.0
 * @category Validation
 */
export type TooEarly = typeof TooEarly.Type;

/**
 * 426 “Upgrade Required” – The server refuses the request using the current
 * protocols as indicated by the upgrade header sent in response. It is willing
 * to accept the request if the client upgrades to another protocol.
 *
 * @since 0.0.0
 * @category Validation
 */
export const UpgradeRequired = S.Literal(426).pipe(
  $I.annoteSchema("UpgradeRequired", {
    description:
      "426 “Upgrade Required” – The server refuses the request using the current\nprotocols as indicated by the upgrade header sent in response. It is willing\nto accept the request if the client upgrades to another protocol.",
    emoji: "📤",
  })
);

/**
 * {@inheritDoc UpgradeRequired}
 *
 * @since 0.0.0
 * @category Validation
 */
export type UpgradeRequired = typeof UpgradeRequired.Type;

/**
 * 428 “Precondition Required” – The server requires the request to be
 * conditional. In most cases, this response is used to prevent conflicts when
 * a client uses the GET method to request a resource, modifies it, and then
 * uses PUT to upload the new version while another party may have also altered
 * the same resource.
 *
 * @since 0.0.0
 * @category Validation
 */
export const PreconditionRequired = S.Literal(428).pipe(
  $I.annoteSchema("PreconditionRequired", {
    description:
      "428 “Precondition Required” – The server requires the request to be\nconditional. In most cases, this response is used to prevent conflicts when\na client uses the GET method to request a resource, modifies it, and then\nuses PUT to upload the new version while another party may have also altered\nthe same resource.",
    emoji: "⛓",
  })
);

/**
 * {@inheritDoc PreconditionRequired}
 *
 * @since 0.0.0
 * @category Validation
 */
export type PreconditionRequired = typeof PreconditionRequired.Type;

/**
 * 429 “Too many requests” – The server responds with this code when the user
 * agent has sent too many requests in the given time and has exceeded the rate
 * limit.
 * You may see this error on your WordPress website if bad bots or scripts
 * attempt to access the dashboard. In that case, changing the login URL is
 * recommended which can be easily done from the Login Security settings of the
 * Security Optimizer plugin.
 * You may also see this error when you try to install a Let’s Encrypt SSL, but
 * you’ve accumulated too many failed requests. For more information, read this
 * guide: Let’s Encrypt errors “429 Too Many Requests”, “No Domains
 * Authorized,” and “Certificate is not for the chosen domain.”
 *
 * @since 0.0.0
 * @category Validation
 */
export const TooManyRequests = S.Literal(429).pipe(
  $I.annoteSchema("TooManyRequests", {
    description:
      "429 “Too many requests” – The server responds with this code when the user\nagent has sent too many requests in the given time and has exceeded the rate\nlimit.\nYou may see this error on your WordPress website if bad bots or scripts\nattempt to access the dashboard. In that case, changing the login URL is\nrecommended which can be easily done from the Login Security settings of the\nSecurity Optimizer plugin.\nYou may also see this error when you try to install a Let’s Encrypt SSL, but\nyou’ve accumulated too many failed requests. For more information, read this\nguide: Let’s Encrypt errors “429 Too Many Requests”, “No Domains\nAuthorized,” and “Certificate is not for the chosen domain.”",
    emoji: "🌋",
  })
);

/**
 * {@inheritDoc TooManyRequests}
 *
 * @since 0.0.0
 * @category Validation
 */
export type TooManyRequests = typeof TooManyRequests.Type;

/**
 * 431 “Request Header Fields Too Large” – The server can’t process the request
 * because its individual header fields or all combined header fields are too
 * large. The client may submit a new request if the size is reduced.
 *
 * @since 0.0.0
 * @category Validation
 */
export const RequestHeaderFieldsTooLarge = S.Literal(431).pipe(
  $I.annoteSchema("RequestHeaderFieldsTooLarge", {
    description:
      "431 “Request Header Fields Too Large” – The server can’t process the request\nbecause its individual header fields or all combined header fields are too\nlarge. The client may submit a new request if the size is reduced.",
    emoji: "🤮",
  })
);

/**
 * {@inheritDoc RequestHeaderFieldsTooLarge}
 *
 * @since 0.0.0
 * @category Validation
 */
export type RequestHeaderFieldsTooLarge = typeof RequestHeaderFieldsTooLarge.Type;

/**
 * 451 “Unavailable for Legal Reasons” – The client requests a resource for
 * which the server is legally bound to deny access, such as a web page
 * censored by the government.
 *
 * @since 0.0.0
 * @category Validation
 */
export const UnavailableForLegalReasons = S.Literal(451).pipe(
  $I.annoteSchema("UnavailableForLegalReasons", {
    description:
      "451 “Unavailable for Legal Reasons” – The client requests a resource for\nwhich the server is legally bound to deny access, such as a web page\ncensored by the government.",
    emoji: "⚖️",
  })
);

/**
 * {@inheritDoc UnavailableForLegalReasons}
 *
 * @since 0.0.0
 * @category Validation
 */
export type UnavailableForLegalReasons = typeof UnavailableForLegalReasons.Type;

/**
 * The 4XX codes are HTTP error status codes. They define errors as invalid
 * requests from your browser that the website’s server can’t process.
 * The problem may be a syntax error in the request, a non-existent URL, wrong
 * credentials, etc. Your browser will usually produce a page with a particular
 * error code.
 *
 * @since 0.0.0
 * @category Validation
 */
export const HttpStatus4XX = MappedLiteralKit([
  ["BadRequest", BadRequest.literal],
  ["Unauthorized", Unauthorized.literal],
  ["PaymentRequired", PaymentRequired.literal],
  ["Forbidden", Forbidden.literal],
  ["NotFound", NotFound.literal],
  ["MethodNotAllowed", MethodNotAllowed.literal],
  ["NotAcceptable", NotAcceptable.literal],
  ["ProxyAuthenticationRequired", ProxyAuthenticationRequired.literal],
  ["RequestTimeout", RequestTimeout.literal],
  ["Conflict", Conflict.literal],
  ["Gone", Gone.literal],
  ["LengthRequired", LengthRequired.literal],
  ["PreconditionFailed", PreconditionFailed.literal],
  ["PayloadTooLarge", PayloadTooLarge.literal],
  ["UriTooLong", UriTooLong.literal],
  ["UnsupportedMediaType", UnsupportedMediaType.literal],
  ["RangeNotSatisfiable", RangeNotSatisfiable.literal],
  ["ExpectationFailed", ExpectationFailed.literal],
  ["ImATeapot", ImATeapot.literal],
  ["MisdirectedRequest", MisdirectedRequest.literal],
  ["UnprocessableEntity", UnprocessableEntity.literal],
  ["Locked", Locked.literal],
  ["FailedDependency", FailedDependency.literal],
  ["TooEarly", TooEarly.literal],
  ["UpgradeRequired", UpgradeRequired.literal],
  ["PreconditionRequired", PreconditionRequired.literal],
  ["TooManyRequests", TooManyRequests.literal],
  ["RequestHeaderFieldsTooLarge", RequestHeaderFieldsTooLarge.literal],
  ["UnavailableForLegalReasons", UnavailableForLegalReasons.literal],
]).pipe(
  $I.annoteSchema("HttpStatus4XX", {
    description:
      "The 4XX codes are HTTP error status codes. " +
      "They define errors as invalid requests from your browser that " +
      "the website’s server can’t process. The problem may be a syntax error " +
      "in the request, a non-existent URL, wrong credentials, etc. Your " +
      "browser will usually produce a page with a particular error code.",
  })
);

/**
 * A namespace for {@link HttpStatus4XX} to contain the Encoded type
 *
 * @category Validation
 * @since 0.0.0
 */
export declare namespace HttpStatus4XX {
  /**
   * The encoded type of {@link HttpStatus4XX}
   *
   * @category Validation
   * @since 0.0.0
   */
  export type Encoded = typeof HttpStatus4XX.Encoded;
}

/**
 * {@inheritDoc HttpStatus4XX}
 *
 * @since 0.0.0
 * @category Validation
 */
export type HttpStatus4XX = typeof HttpStatus4XX.Type;

// =============================================================================
// 5XX Status Codes - Server Errors
// =============================================================================

/**
 * 500 “Internal Server Error” – This is a generic error that indicates the
 * server encountered an unexpected condition and can’t fulfill the request.
 * The server tells you there is something wrong, but it is not sure what the
 * problem is. Usually, the issue stems from the website configuration on
 * the client’s side. Read this tutorial on {@link https://www.siteground.com/kb/internal_server_error_500/ | what an “HTTP Error 500 –
 * Internal Server Error” is and how to fix it} for more information.
 *
 * @since 0.0.0
 * @category Validation
 */
export const InternalServerError = S.Literal(500).pipe(
  $I.annoteSchema("InternalServerError", {
    description:
      "500 “Internal Server Error” – This is a generic error that indicates the\nserver encountered an unexpected condition and can’t fulfill the request.\nThe server tells you there is something wrong, but it is not sure what the\nproblem is. Usually, the issue stems from the website configuration on\nthe client’s side. Read this tutorial on {@link https://www.siteground.com/kb/internal_server_error_500/ | what an “HTTP Error 500 –\nInternal Server Error” is and how to fix it} for more information.",
    emoji: "💣",
  })
);

/**
 * {@inheritDoc InternalServerError}
 *
 * @since 0.0.0
 * @category Validation
 */
export type InternalServerError = typeof InternalServerError.Type;

/**
 * 501 “Not Implemented” – The server doesn’t support the request method or
 * doesn’t have the ability to fulfill the request.
 *
 * @since 0.0.0
 * @category Validation
 */
export const NotImplemented = S.Literal(501).pipe(
  $I.annoteSchema("NotImplemented", {
    description:
      "501 “Not Implemented” – The server doesn’t support the request method or doesn’t have the ability to fulfill the request.",
    emoji: "📭",
  })
);

/**
 * {@inheritDoc NotImplemented}
 *
 * @since 0.0.0
 * @category Validation
 */
export type NotImplemented = typeof NotImplemented.Type;

/**
 * 502 “Bad Gateway” – This error indicates that the server acted as a gateway
 * or a proxy and received an invalid response from the upstream server. This
 * is the official description, but various factors can cause this error. Find
 * out more about the HTTP 502 “Bad Gateway” error and how to fix it here.
 *
 * @since 0.0.0
 * @category Validation
 */
export const BadGateway = S.Literal(502).pipe(
  $I.annoteSchema("BadGateway", {
    description:
      "502 “Bad Gateway” – This error indicates that the server acted as a gateway\nor a proxy and received an invalid response from the upstream server. This\nis the official description, but various factors can cause this error. Find\nout more about the HTTP 502 “Bad Gateway” error and how to fix it here.",
    emoji: "🚧",
  })
);

/**
 * {@inheritDoc BadGateway}
 *
 * @since 0.0.0
 * @category Validation
 */
export type BadGateway = typeof BadGateway.Type;

/**
 * 503 “Service Unavailable” – The server can’t handle the request. This is
 * usually a temporary condition caused by overload or ongoing maintenance on
 * the server. Read this guide on what the HTTP 503 “Service Unavailable” error
 * is and how to fix it.
 *
 * @since 0.0.0
 * @category Validation
 */
export const ServiceUnavailable = S.Literal(503).pipe(
  $I.annoteSchema("ServiceUnavailable", {
    description:
      "503 “Service Unavailable” – The server can’t handle the request. This is\nusually a temporary condition caused by overload or ongoing maintenance on\nthe server. Read this guide on what the HTTP 503 “Service Unavailable” error\nis and how to fix it.",
    emoji: "🚨",
  })
);

/**
 * {@inheritDoc ServiceUnavailable}
 *
 * @since 0.0.0
 * @category Validation
 */
export type ServiceUnavailable = typeof ServiceUnavailable.Type;

/**
 * 504 “Gateway Timeout” – The server acted as a gateway and did not receive a
 * timely response from the upstream server. In most cases, this error is
 * caused by PHP scripts that don’t finish in time and exceed the server’s
 * max_execution_time PHP variable timeout limit, hence the server terminates
 * the connection. See more details in this article about the HTTP 504
 * “Gateway Timeout” and how to fix it.
 *
 * @since 0.0.0
 * @category Validation
 */
export const GatewayTimeout = S.Literal(504).pipe(
  $I.annoteSchema("GatewayTimeout", {
    description:
      "504 “Gateway Timeout” – The server acted as a gateway and did not receive a\ntimely response from the upstream server. In most cases, this error is\ncaused by PHP scripts that don’t finish in time and exceed the server’s\nmax_execution_time PHP variable timeout limit, hence the server terminates\nthe connection. See more details in this article about the HTTP 504\n“Gateway Timeout” and how to fix it.",
    emoji: "⏲",
  })
);

/**
 * {@inheritDoc GatewayTimeout}
 *
 * @since 0.0.0
 * @category Validation
 */
export type GatewayTimeout = typeof GatewayTimeout.Type;

/**
 * 505 “HTTP Version Not Supported” – The server doesn’t support the HTTP
 * protocol version used in the request.
 *
 * @since 0.0.0
 * @category Validation
 */
export const HttpVersionNotSupported = S.Literal(505).pipe(
  $I.annoteSchema("HttpVersionNotSupported", {
    description:
      "505 “HTTP Version Not Supported” – The server doesn’t support the HTTP\nprotocol version used in the request.",
    emoji: "🕯",
  })
);

/**
 * {@inheritDoc HttpVersionNotSupported}
 *
 * @since 0.0.0
 * @category Validation
 */
export type HttpVersionNotSupported = typeof HttpVersionNotSupported.Type;

/**
 * 506 “Variant Also Negotiates” – This error occurs when the client and the
 * server enter into Transparent Content Negotiation, which allows the client
 * to retrieve the best variant of a resource when the server supports multiple
 * versions. However, there is a misconfiguration, and the chosen resource also
 * prompts content negotiation that causes a closed loop.
 *
 * @since 0.0.0
 * @category Validation
 */
export const VariantAlsoNegotiates = S.Literal(506).pipe(
  $I.annoteSchema("VariantAlsoNegotiates", {
    description:
      "506 “Variant Also Negotiates” – This error occurs when the client and the\nserver enter into Transparent Content Negotiation, which allows the client\nto retrieve the best variant of a resource when the server supports multiple\nversions. However, there is a misconfiguration, and the chosen resource also\nprompts content negotiation that causes a closed loop.",
    emoji: "☢️",
  })
);

/**
 * {@inheritDoc VariantAlsoNegotiates}
 *
 * @since 0.0.0
 * @category Validation
 */
export type VariantAlsoNegotiates = typeof VariantAlsoNegotiates.Type;

/**
 * 507 “Insufficient Storage” (WebDAV) – The server is unable to store the
 * representation required to complete the request.
 *
 * @since 0.0.0
 * @category Validation
 */
export const InsufficientStorage = S.Literal(507).pipe(
  $I.annoteSchema("InsufficientStorage", {
    description:
      "507 “Insufficient Storage” (WebDAV) – The server is unable to store the\nrepresentation required to complete the request.",
    emoji: "💯",
  })
);

/**
 * {@inheritDoc InsufficientStorage}
 *
 * @since 0.0.0
 * @category Validation
 */
export type InsufficientStorage = typeof InsufficientStorage.Type;

/**
 * 508 “Loop Detected” (WebDAV) – The server detected an infinite loop while
 * processing the request.
 *
 * @since 0.0.0
 * @category Validation
 */
export const LoopDetected = S.Literal(508).pipe(
  $I.annoteSchema("LoopDetected", {
    description: "508 “Loop Detected” (WebDAV) – The server detected an infinite loop while\nprocessing the request.",
    emoji: "➰",
  })
);

/**
 * {@inheritDoc LoopDetected}
 *
 * @since 0.0.0
 * @category Validation
 */
export type LoopDetected = typeof LoopDetected.Type;

/**
 * 510 “Not Extended” – Further extensions to the request are required for the
 * server to fulfill it. This code is now deprecated.
 *
 * @since 0.0.0
 * @category Validation
 */
export const NotExtended = S.Literal(510).pipe(
  $I.annoteSchema("NotExtended", {
    description:
      "510 “Not Extended” – Further extensions to the request are required for the\nserver to fulfill it. This code is now deprecated.",
    emoji: "🏗",
  })
);

/**
 * {@inheritDoc NotExtended}
 *
 * @since 0.0.0
 * @category Validation
 */
export type NotExtended = typeof NotExtended.Type;

/**
 * 511 “Network Authentication Required” – This response is sent when you need
 * to be authenticated so the network can send your request to a server. Most
 * commonly, it is seen when trying to use a Wi-Fi network, and you need to
 * agree to its Terms of Agreement.
 *
 * @since 0.0.0
 * @category Validation
 */
export const NetworkAuthenticationRequired = S.Literal(511).pipe(
  $I.annoteSchema("NetworkAuthenticationRequired", {
    description:
      "511 “Network Authentication Required” – This response is sent when you need\nto be authenticated so the network can send your request to a server. Most\ncommonly, it is seen when trying to use a Wi-Fi network, and you need to\nagree to its Terms of Agreement.",
    emoji: "🔑",
  })
);

/**
 * {@inheritDoc NetworkAuthenticationRequired}
 *
 * @since 0.0.0
 * @category Validation
 */
export type NetworkAuthenticationRequired = typeof NetworkAuthenticationRequired.Type;

/**
 * The 5XX HTTP codes indicate that there is a problem on the website’s server
 * that prevents it from processing a request. Like the 4XX codes, you
 * will see an error page on your browser when a 5XX error is triggered.
 *
 * @since 0.0.0
 * @category Validation
 */
export const HttpStatus5XX = MappedLiteralKit([
  ["InternalServerError", InternalServerError.literal],
  ["NotImplemented", NotImplemented.literal],
  ["BadGateway", BadGateway.literal],
  ["ServiceUnavailable", ServiceUnavailable.literal],
  ["GatewayTimeout", GatewayTimeout.literal],
  ["HttpVersionNotSupported", HttpVersionNotSupported.literal],
  ["VariantAlsoNegotiates", VariantAlsoNegotiates.literal],
  ["InsufficientStorage", InsufficientStorage.literal],
  ["LoopDetected", LoopDetected.literal],
  ["NotExtended", NotExtended.literal],
  ["NetworkAuthenticationRequired", NetworkAuthenticationRequired.literal],
]).pipe(
  $I.annoteSchema("HttpStatus5XX", {
    description:
      "The 5XX HTTP codes indicate that there is a problem on the website’s server that prevents it from processing a request. Like the 4XX codes, you will see an error page on your browser when a 5XX error is triggered.",
  })
);

/**
 * A namespace for {@link HttpStatus5XX} to contain the Encoded type
 *
 * @category Validation
 * @since 0.0.0
 */
export declare namespace HttpStatus5XX {
  /**
   * The encoded type of {@link HttpStatus5XX}
   *
   * @category Validation
   * @since 0.0.0
   */
  export type Encoded = typeof HttpStatus5XX.Encoded;
}

/**
 * {@inheritDoc HttpStatus5XX}
 *
 * @category Validation
 * @since 0.0.0
 */
export type HttpStatus5XX = typeof HttpStatus5XX.Type;

// =============================================================================
// Unofficial HTTP Status Codes
// =============================================================================

/**
 * 430 “Request Header Fields Too Large” – This code is used by Shopify when
 * too many URLs are requested at the same time. It is similar to the HTTP code
 * 429 “Too many requests”.
 *
 * @since 0.0.0
 * @category Validation
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
 * @category Validation
 */
export type RequestHeaderFieldsTooLargeShopify = typeof RequestHeaderFieldsTooLargeShopify.Type;

/**
 * 440 “Login Time-out” – This code is used by Microsoft’s ISS (Internet
 * Information Services). The client’s login session has expired and they must
 * log in again.
 *
 * @since 0.0.0
 * @category Validation
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
 * @category Validation
 */
export type LoginTimeout = typeof LoginTimeout.Type;

/**
 * 494 “Request header too large” – used by NGINX. The client has sent too
 * large of a request or too long of a header line.
 *
 * @since 0.0.0
 * @category Validation
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
 * @category Validation
 */
export type RequestHeaderTooLarge = typeof RequestHeaderTooLarge.Type;

/**
 * 495 “SSL Certificate Error” – This is also a status code used by NGINX
 * signaling that the client has provided an invalid SSL certificate.
 *
 * @since 0.0.0
 * @category Validation
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
 * @category Validation
 */
export type SslCertificateError = typeof SslCertificateError.Type;

/**
 * 496 “SSL Certificate Required” – used by NGINX. A client certificate is
 * required but is not provided.
 *
 * @since 0.0.0
 * @category Validation
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
 * @category Validation
 */
export type SslCertificateRequired = typeof SslCertificateRequired.Type;

/**
 * 499 “Client Closed Request” – The client terminated the request before the
 * server could send a response. Another code used by NGINX.
 *
 * @since 0.0.0
 * @category Validation
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
 * @category Validation
 */
export type ClientClosedRequest = typeof ClientClosedRequest.Type;

/**
 * 520 “Web Server Returned an Unknown Error” – This is a code used by
 * Cloudflare. It specifies that the origin server returned an unexpected or
 * unknown response to Cloudflare.
 *
 * @since 0.0.0
 * @category Validation
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
 * @category Validation
 */
export type WebServerReturnedAnUnknownError = typeof WebServerReturnedAnUnknownError.Type;

/**
 * 521 “Web Server is Down” – Another Cloudflare-specific error code. The
 * origin server refused the connection to Cloudflare. This error could be
 * caused by the origin’s firewall blocking Cloudflare’s IPs.
 *
 * @since 0.0.0
 * @category Validation
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
 * @category Validation
 */
export type WebServerIsDown = typeof WebServerIsDown.Type;

/**
 * 525 “SSL Handshake Failed” – Used by Cloudflare. Cloudflare is unable to
 * establish an SSL/TLS handshake with the origin server.
 *
 * @since 0.0.0
 * @category Validation
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
 * @category Validation
 */
export type SslHandshakeFailed = typeof SslHandshakeFailed.Type;

/**
 * 526 “Invalid SSL Certificate” – Another code mostly used by Cloudflare.
 * Cloudflare could not validate the SSL installed on the origin server.
 * Usually, caused by invalid or missing SSL on the origin server. Read this
 * guide on how to install Let’s Encrypt for your SiteGround-hosted website.
 *
 * @since 0.0.0
 * @category Validation
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
 * @category Validation
 */
export type InvalidSslCertificate = typeof InvalidSslCertificate.Type;

/**
 * The codes above are officially recognized by IANA, but different platforms
 * use unofficial HTTP codes to indicate specific problems related to their
 * services. The following codes are used in some of the most popular online
 * services.
 *
 * @since 0.0.0
 * @category Validation
 */
export const HttpStatusUnofficial = MappedLiteralKit([
  ["RequestHeaderFieldsTooLargeShopify", RequestHeaderFieldsTooLargeShopify.literal],
  ["LoginTimeout", LoginTimeout.literal],
  ["RequestHeaderTooLarge", RequestHeaderTooLarge.literal],
  ["SslCertificateError", SslCertificateError.literal],
  ["SslCertificateRequired", SslCertificateRequired.literal],
  ["ClientClosedRequest", ClientClosedRequest.literal],
  ["WebServerReturnedAnUnknownError", WebServerReturnedAnUnknownError.literal],
  ["WebServerIsDown", WebServerIsDown.literal],
  ["SslHandshakeFailed", SslHandshakeFailed.literal],
  ["InvalidSslCertificate", InvalidSslCertificate.literal],
]).pipe(
  $I.annoteSchema("HttpStatusUnofficial", {
    description:
      "The codes above are officially recognized by IANA, but different platforms\nuse unofficial HTTP codes to indicate specific problems related to their\nservices. The following codes are used in some of the most popular online\nservices.",
  })
);

/**
 * A namespace for {@link HttpStatusUnofficial} to contain the Encoded type
 *
 * @category Validation
 * @since 0.0.0
 */
export declare namespace HttpStatusUnofficial {
  /**
   * The encoded type of {@link HttpStatusUnofficial}
   *
   * @category Validation
   * @since 0.0.0
   */
  export type Encoded = typeof HttpStatusUnofficial.Encoded;
}

/**
 * {@inheritDoc HttpStatusUnofficial}
 *
 * @category Validation
 * @since 0.0.0
 */
export type HttpStatusUnofficial = typeof HttpStatusUnofficial.Type;

// =============================================================================
// HttpStatus
// =============================================================================

/**
 * A MappedLiteralKit of all HTTP status codes.
 *
 * @category Validation
 * @since 0.0.0
 */
export const HttpStatus = MappedLiteralKit([
  ...HttpStatus1XX.Pairs,
  ...HttpStatus2XX.Pairs,
  ...HttpStatus3XX.Pairs,
  ...HttpStatus4XX.Pairs,
  ...HttpStatus5XX.Pairs,
  ...HttpStatusUnofficial.Pairs,
]).pipe(
  $I.annoteSchema("HttpStatus", {
    description: "A MappedLiteralKit of all HTTP status codes.",
  })
);

/**
 * A namespace for {@link HttpStatus} to contain the Encoded type
 *
 * @category Validation
 * @since 0.0.0
 */
export declare namespace HttpStatus {
  /**
   * The encoded type of {@link HttpStatus}
   *
   * @category Validation
   * @since 0.0.0
   */
  export type Encoded = typeof HttpStatus.Encoded;
}

/**
 * {@inheritDoc HttpStatus}
 *
 * @category Validation
 * @since 0.0.0
 */
export type HttpStatus = typeof HttpStatus.Type;
