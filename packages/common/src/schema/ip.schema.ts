import { sid } from "@beep/common/schema/id";
import { faker } from "@faker-js/faker";
import * as S from "effect/Schema";
import { annotate, makeMocker } from "./utils";

/**
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
export namespace IP {
  /** Combined IPv4/IPv6 validation pattern. */
  export const REGEX =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]+|::(ffff(:0{1,4})?:)?((25[0-5]|(2[0-4]|1?[0-9])?[0-9])\.){3}(25[0-5]|(2[0-4]|1?[0-9])?[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1?[0-9])?[0-9])\.){3}(25[0-5]|(2[0-4]|1?[0-9])?[0-9]))$/;

  /**
   * Non-empty, trimmed, branded `"IP"` string that matches IPv4/IPv6.
   */
  const Base = S.NonEmptyTrimmedString.pipe(
    S.pattern(REGEX),
    S.brand("IP"),
  );

  /**
   * Full IP schema with docs, identity, and generator.
   */
  export const Schema = annotate(Base, {
    identifier: sid.common.schema("IP.Schema"),
    title: "IP",
    description: "A valid IP address (IPv4 or IPv6)",
    arbitrary: () => (fc) => fc.constant(null).map(() => Base.make(faker.internet.ip())),
  });

  /** IP value type. */
  export type Type = typeof Schema.Type;

  /** Curried mock factory. */
  export const Mock = makeMocker(Schema);

  /** Trusted constructor (no validation). Prefer decoding for user inputs. */
  export const make = Schema.make;
}
