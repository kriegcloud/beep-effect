/**
 * IP address schemas covering IPv4, IPv6, and their union.
 *
 * These schemas validate textual representations via pragmatic regexes and brand the results for type safety.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { IP } from "@beep/schema/primitives/network/ip";
 *
 * const decoded = S.decodeSync(IP)("192.168.0.1");
 *
 * @category Primitives/Network
 * @since 0.1.0
 */
import * as regexes from "@beep/schema/internal/regex/regexes";
import type * as B from "effect/Brand";
import * as S from "effect/Schema";
import { Id } from "./_id";

/**
 * IPv4 schema that ensures dotted quad notation with valid octets.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { IPv4 } from "@beep/schema/primitives/network/ip";
 *
 * const addr = S.decodeSync(IPv4)("10.0.0.1");
 *
 * @category Primitives/Network
 * @since 0.1.0
 */
export const IPv4 = S.NonEmptyString.pipe(
  S.pattern(regexes.ipv4, { message: () => "Must be a valid IPv4 address." }),
  S.brand("IPv4")
).annotations(
  Id.annotations("ip/IPv4", {
    description: "IPv4 address represented as dotted quad.",
    arbitrary: () => (fc) => fc.oneof(fc.ipV4(), fc.ipV4Extended()).map((value) => value as B.Branded<string, "IPv4">),
  })
);

/**
 * Namespace describing runtime and encoded types for {@link IPv4}.
 *
 * @example
 * import type { IPv4 } from "@beep/schema/primitives/network/ip";
 *
 * type IPv4Value = IPv4.Type;
 *
 * @category Primitives/Network
 * @since 0.1.0
 */
export declare namespace IPv4 {
  /**
   * Runtime type alias for {@link IPv4}.
   *
   * @example
   * import type { IPv4 } from "@beep/schema/primitives/network/ip";
   *
   * let addr: IPv4.Type;
   *
   * @category Primitives/Network
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof IPv4>;
  /**
   * Encoded type alias for {@link IPv4}.
   *
   * @example
   * import type { IPv4 } from "@beep/schema/primitives/network/ip";
   *
   * let encoded: IPv4.Encoded;
   *
   * @category Primitives/Network
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof IPv4>;
}

/**
 * IPv6 schema covering compressed and expanded textual forms.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { IPv6 } from "@beep/schema/primitives/network/ip";
 *
 * const addr = S.decodeSync(IPv6)("2001:0db8:85a3:0000:0000:8a2e:0370:7334");
 *
 * @category Primitives/Network
 * @since 0.1.0
 */
export const IPv6 = S.NonEmptyString.pipe(
  S.pattern(regexes.ipv6, { message: () => "Must be a valid IPv6 address." }),
  S.brand("IPv6")
).annotations(
  Id.annotations("ip/IPv6", {
    description: "IPv6 address supporting compressed and expanded forms.",
    arbitrary: () => (fc) => fc.ipV6().map((value) => value as B.Branded<string, "IPv6">),
  })
);

/**
 * Namespace describing runtime and encoded types for {@link IPv6}.
 *
 * @example
 * import type { IPv6 } from "@beep/schema/primitives/network/ip";
 *
 * type IPv6Value = IPv6.Type;
 *
 * @category Primitives/Network
 * @since 0.1.0
 */
export declare namespace IPv6 {
  /**
   * Runtime type alias for {@link IPv6}.
   *
   * @example
   * import type { IPv6 } from "@beep/schema/primitives/network/ip";
   *
   * let addr: IPv6.Type;
   *
   * @category Primitives/Network
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof IPv6>;
  /**
   * Encoded type alias for {@link IPv6}.
   *
   * @example
   * import type { IPv6 } from "@beep/schema/primitives/network/ip";
   *
   * let encoded: IPv6.Encoded;
   *
   * @category Primitives/Network
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof IPv6>;
}

/**
 * Union schema accepting either IPv4 or IPv6 addresses.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { IP } from "@beep/schema/primitives/network/ip";
 *
 * const addr = S.decodeSync(IP)("fe80::1");
 *
 * @category Primitives/Network
 * @since 0.1.0
 */
export const IP = S.Union(IPv4, IPv6).annotations(
  Id.annotations("ip/IP", {
    description: "Valid IP address (IPv4 or IPv6).",
    arbitrary: () => (fc) =>
      fc.oneof(fc.ipV4(), fc.ipV6()).map((value) => (S.is(IPv4)(value) ? IPv4.make(value) : IPv6.make(value))),
  })
);

/**
 * Namespace describing runtime and encoded types for {@link IP}.
 *
 * @example
 * import type { IP } from "@beep/schema/primitives/network/ip";
 *
 * type IpValue = IP.Type;
 *
 * @category Primitives/Network
 * @since 0.1.0
 */
export declare namespace IP {
  /**
   * Runtime type alias for {@link IP}.
   *
   * @example
   * import type { IP } from "@beep/schema/primitives/network/ip";
   *
   * let addr: IP.Type;
   *
   * @category Primitives/Network
   * @since 0.1.0
   */
  export type Type = typeof IP.Type;
  /**
   * Encoded type alias for {@link IP}.
   *
   * @example
   * import type { IP } from "@beep/schema/primitives/network/ip";
   *
   * let encoded: IP.Encoded;
   *
   * @category Primitives/Network
   * @since 0.1.0
   */
  export type Encoded = typeof IP.Encoded;
}
