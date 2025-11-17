import * as regexes from "@beep/schema/regexes";
import type * as B from "effect/Brand";
import * as S from "effect/Schema";
import { CustomId } from "./_id";

const Id = CustomId.compose("ip");
/**
 * @spec Non-empty, trimmed, branded `"IP"` string that matches IPv4/IPv6.
 * IP address schema (IPv4 or IPv6) and helpers.
 *
 * - Accepts canonical textual IPv4 or IPv6 forms via a pragmatic regex.
 * - Does not normalize or compress addresses—this is a *validator*, not a formatter.
 *
 * ## Example
 * ```ts
 * import * as Effect from "effect/Effect";
 *
 * const decode = S.decodeUnknown(IP.Schema);
 * const ok4 = decode("192.168.1.1");
 * const ok6 = decode("2001:0db8:85a3:0000:0000:8a2e:0370:7334");
 * const bad = decode("999.999.999.999"); // ParseIssue
 * ```
 *
 * @since 0.1.0
 * @category Networking
 */
export const IPv4 = S.NonEmptyString.pipe(
  S.pattern(regexes.ipv4, { message: () => "Must be a valid IPv4 address" }),
  S.brand("IPv4")
).annotations(
  Id.annotations("IPv4", {
    description: "A valid IP address IPv4",
    arbitrary: () => (fc) => fc.oneof(fc.ipV4(), fc.ipV4Extended()).map((_) => _ as B.Branded<string, "IPv4">),
  })
);

export declare namespace IPv4 {
  export type Type = S.Schema.Type<typeof IPv4>;
  export type Encoded = S.Schema.Encoded<typeof IPv4>;
}

export const IPv6 = S.NonEmptyString.pipe(
  S.pattern(regexes.ipv6, { message: () => "Must be a valid IPv6 address" }),
  S.brand("IPv6")
).annotations(
  Id.annotations("IPv6", {
    description: "A valid IP address IPv6",
    arbitrary: () => (fc) => fc.ipV6().map((_) => _ as B.Branded<string, "IPv6">),
  })
);

export declare namespace IPv6 {
  export type Type = S.Schema.Type<typeof IPv6>;
  export type Encoded = S.Schema.Encoded<typeof IPv6>;
}

export const IP = S.Union(IPv4, IPv6).annotations(
  Id.annotations("IP", {
    description: "A valid IP address (IPv4 or IPv6)",
    arbitrary: () => (fc) => fc.oneof(fc.ipV4(), fc.ipV6()).map((_) => (S.is(IPv4)(_) ? IPv4.make(_) : IPv6.make(_))),
  })
);

export declare namespace IP {
  /** IP value type. */
  export type Type = typeof IP.Type;
  /** IP encoded value type. */
  export type Encoded = typeof IP.Encoded;
}
