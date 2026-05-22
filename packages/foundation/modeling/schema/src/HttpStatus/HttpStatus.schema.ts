/**
 * Complete HTTP status schema.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { MappedLiteralKit } from "../MappedLiteralKit/index.ts";
import { HttpStatus4XX } from "./HttpStatus.client-error.ts";
import { HttpStatus1XX } from "./HttpStatus.informational.ts";
import { HttpStatus3XX } from "./HttpStatus.redirection.ts";
import { HttpStatus5XX } from "./HttpStatus.server-error.aggregate.ts";
import { $I } from "./HttpStatus.shared.ts";
import { HttpStatus2XX } from "./HttpStatus.success.ts";
import { HttpStatusUnofficial } from "./HttpStatus.unofficial.aggregate.ts";

// =============================================================================
// HttpStatus
// =============================================================================

/**
 * A MappedLiteralKit of all HTTP status codes.
 *
 * @category validation
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
 * @category validation
 * @since 0.0.0
 */
export declare namespace HttpStatus {
  /**
   * The encoded type of {@link HttpStatus}
   *
   * @category validation
   * @since 0.0.0
   */
  export type Encoded = typeof HttpStatus.Encoded;
}

/**
 * {@inheritDoc HttpStatus}
 *
 * @category validation
 * @since 0.0.0
 */
export type HttpStatus = typeof HttpStatus.Type;

/**
 * Canonical alias for the complete HTTP status schema.
 *
 * @category validation
 * @since 0.0.0
 */
export const Schema = HttpStatus;

/**
 * Runtime type extracted from {@link Schema}.
 *
 * @category models
 * @since 0.0.0
 */
export type Schema = HttpStatus;
