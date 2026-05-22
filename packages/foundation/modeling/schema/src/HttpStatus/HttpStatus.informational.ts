/**
 * Informational HTTP status schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import * as S from "effect/Schema";
import { MappedLiteralKit } from "../MappedLiteralKit/index.ts";
import { $I } from "./HttpStatus.shared.ts";

// =============================================================================
// 1XX Status Codes - Informational
// =============================================================================

/**
 * 100 “Continue” – The server has received the headers of the request.
 * It now tells your browser to proceed with sending the body of the request.
 *
 * @since 0.0.0
 * @category validation
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
 * @category validation
 */
export type Continue = typeof Continue.Type;

/**
 * 101 “Switching Protocols” – The requesting client (browser) asked the server to
 * change the protocols, and the server fulfilled the request.
 *
 * @since 0.0.0
 * @category validation
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
 * @category validation
 */
export type SwitchingProtocols = typeof SwitchingProtocols.Type;

/**
 * 102 “Processing” – This is a response mainly associated with WebDAV
 * requests, which may take a longer time to be completed. It indicates that
 * the server has received the request and is currently processing it.
 *
 * @since 0.0.0
 * @category validation
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
 * @category validation
 */
export type Processing = typeof Processing.Type;

/**
 * 103 “Early Hints” – The server returns some response headers before the
 * final HTTP response is sent.
 *
 * @since 0.0.0
 * @category validation
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
 * @category validation
 */
export type EarlyHints = typeof EarlyHints.Type;

/**
 * 1XX codes are informational responses from the website’s server. They do not
 * generate content and only update clients on the progress of their requests.
 * This information is sent in the headers of the HTTP response.
 *
 * @since 0.0.0
 * @category validation
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
 * @category validation
 * @since 0.0.0
 */
export declare namespace HttpStatus1XX {
  /**
   * The encoded type of {@link HttpStatus1XX}
   *
   * @category validation
   * @since 0.0.0
   */
  export type Encoded = typeof HttpStatus1XX.Encoded;
}

/**
 * {@inheritDoc HttpStatus1XX}
 *
 * @category validation
 * @since 0.0.0
 */
export type HttpStatus1XX = typeof HttpStatus1XX.Type;
