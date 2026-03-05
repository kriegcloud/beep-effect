import { pipe, SchemaTransformation } from "effect";
import * as S from "effect/Schema";

/**
 * Regular expression pattern for validating IPv4 addresses.
 *
 * Matches standard IPv4 addresses in dotted decimal notation (e.g., "192.168.1.1").
 * Each octet must be between 0 and 255.
 *
 * @since 0.0.0
 */
export const ipv4RegExp: RegExp =
  /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;

/**
 * Regular expression pattern for validating IPv6 addresses.
 *
 * Matches standard IPv6 addresses including compressed notation (e.g., "2001:db8::1").
 * Supports all valid IPv6 formats including zero compression.
 *
 * @since 0.0.0
 * @category Validation
 */
export const ipv6RegExp: RegExp =
  /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;

/**
 * Filter group for validating IPv4 addresses.
 *
 * Validates:
 * - Non-empty string
 * - Matches IPv4 pattern
 * - No leading or trailing whitespace
 *
 * @internal
 * @category Validation
 */
const IpV4Check = S.makeFilterGroup([
  S.isNonEmpty({
    message: "IPv4 address must not be empty",
  }),
  S.isPattern(ipv4RegExp, {
    description: "IPv4 address",
    message: "Invalid IPv4 address",
  }),
  S.isTrimmed({
    message: "IPv4 address must not contain leading or trailing whitespace",
  }),
]);

/**
 * Filter group for validating IPv6 addresses.
 *
 * Validates:
 * - Non-empty string
 * - Matches IPv6 pattern
 * - No leading or trailing whitespace
 *
 * @internal
 * @category Validation
 */
const IpV6Check = S.makeFilterGroup([
  S.isNonEmpty({
    message: "IPv6 address must not be empty",
  }),
  S.isPattern(ipv6RegExp, {
    message: "Invalid IPv6 address",
  }),
  S.isTrimmed({
    message: "IPv6 address must not contain leading or trailing whitespace",
  }),
]);

/**
 * Helper function to trim whitespace from a string schema.
 *
 * @internal
 */
const trim = (self: S.String) => pipe(self, S.decode(SchemaTransformation.trim()));

/**
 * Encoded schema for IPv4 addresses (trimmed non-empty string).
 *
 * @since 0.0.0
 * @category Validation
 */
export const IpV4Encoded = S.NonEmptyString.pipe(trim);

/**
 * Decoded schema for validated IPv4 addresses with brand.
 *
 * @since 0.0.0
 * @category Validation
 */
export const IpV4Decoded = IpV4Encoded.check(IpV4Check).pipe(S.brand("IpV4"));

/**
 * Redacted schema for IPv4 addresses.
 *
 * Wraps IPv4 addresses in a `Redacted` container to prevent accidental logging
 * or exposure of sensitive network information.
 *
 * @since 0.0.0
 * @category Validation
 */
export const IpV4 = S.RedactedFromValue(IpV4Decoded);

/**
 * Type for {@link IpV4}.
 *
 * @since 0.0.0
 * @category Validation
 */
export type IpV4 = typeof IpV4.Type;

/**
 * Encoded schema for IPv6 addresses (trimmed non-empty string).
 *
 * @since 0.0.0
 * @category Validation
 */
export const IpV6Encoded = S.NonEmptyString.pipe(trim);

/**
 * Decoded schema for validated IPv6 addresses with brand.
 *
 * @since 0.0.0
 * @category Validation
 */
export const IpV6Decoded = IpV6Encoded.check(IpV6Check).pipe(S.brand("IpV6"));

/**
 * Redacted schema for IPv6 addresses.
 *
 * Wraps IPv6 addresses in a `Redacted` container to prevent accidental logging
 * or exposure of sensitive network information.
 *
 * @since 0.0.0
 * @category Validation
 */
export const IpV6 = S.RedactedFromValue(IpV6Decoded);

/**
 * Type for {@link IpV6}.
 *
 * @since 0.0.0
 * @category Validation
 */
export type IpV6 = typeof IpV6.Type;
