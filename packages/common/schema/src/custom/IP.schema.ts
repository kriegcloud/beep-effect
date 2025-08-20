import type * as B from "effect/Brand";
import * as F from "effect/Function";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";
/** Combined IPv4/IPv6 validation pattern. */
export const IP_REGEX =
  /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]+|::(ffff(:0{1,4})?:)?((25[0-5]|(2[0-4]|1?[0-9])?[0-9])\.){3}(25[0-5]|(2[0-4]|1?[0-9])?[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1?[0-9])?[0-9])\.){3}(25[0-5]|(2[0-4]|1?[0-9])?[0-9]))$/;
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
export const UnsafeIP = S.NonEmptyTrimmedString.pipe(
  S.pattern(IP_REGEX),
  S.brand("IP"),
).annotations({
  identifier: "UnsafeIP",
  title: "IP",
  description: "A valid IP address (IPv4 or IPv6)",
  arbitrary: () => (fc) =>
    fc
      .oneof(fc.ipV4(), fc.ipV6(), fc.ipV4Extended())
      .map((_) => _ as B.Branded<string, "IP">),
});

export class IP extends S.Redacted(UnsafeIP) {
  static readonly make = F.flow((i: string) => UnsafeIP.make(i), Redacted.make);
}

export namespace IP {
  /** IP value type. */
  export type Type = typeof IP.Type;
  /** IP encoded value type. */
  export type Encoded = typeof IP.Encoded;
}
