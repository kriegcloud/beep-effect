import * as A from "effect/Array";
import * as F from "effect/Function";

import { Regex, RegexFromString } from "./regex";

/**
 * Validates canonical CUID identifiers (case-insensitive `c` prefix with at least 8 characters).
 *
 * @example
 * import { cuid } from "@beep/schema/internal/regex/regexes";
 *
 * cuid.test("ck3a0f1a0000000000000000");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const cuid = Regex.make(/^[cC][^\s-]{8,}$/);

/**
 * Validates lowercase alphanumeric Cuid2 identifiers.
 *
 * @example
 * import { cuid2 } from "@beep/schema/internal/regex/regexes";
 *
 * cuid2.test("j2x1h3d5");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const cuid2 = Regex.make(/^[0-9a-z]+$/);

/**
 * Validates ULID identifiers (26 Crockford base32 characters).
 *
 * @example
 * import { ulid } from "@beep/schema/internal/regex/regexes";
 *
 * ulid.test("01HZXAP0Y51Q2E2R9A5D1ZJ8KX");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const ulid = Regex.make(/^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/);

/**
 * Validates XID identifiers (20 base32 characters, uppercase or lowercase).
 *
 * @example
 * import { xid } from "@beep/schema/internal/regex/regexes";
 *
 * xid.test("01ab23cd45ef67gh89ij");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const xid = Regex.make(/^[0-9a-vA-V]{20}$/);

/**
 * Validates KSUID identifiers (27 base62 characters).
 *
 * @example
 * import { ksuid } from "@beep/schema/internal/regex/regexes";
 *
 * ksuid.test("0ujsswThIGTUYm2K8FjOOfXtY1K");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const ksuid = Regex.make(/^[A-Za-z0-9]{27}$/);

/**
 * Validates Nano ID strings (default length 21, URL-safe alphabet).
 *
 * @example
 * import { nanoid } from "@beep/schema/internal/regex/regexes";
 *
 * nanoid.test("V1StGXR8_Z5jdHi6B-myT");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const nanoid = Regex.make(/^[a-zA-Z0-9_-]{21}$/);

/**
 * Matches ISO 8601-1 durations (no fractional or negative components).
 *
 * @example
 * import { duration } from "@beep/schema/internal/regex/regexes";
 *
 * duration.test("P2DT3H");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const duration = Regex.make(
  /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/
);

/**
 * Matches ISO 8601-2 extended durations with explicit signs and fractional components.
 *
 * @example
 * import { extendedDuration } from "@beep/schema/internal/regex/regexes";
 *
 * extendedDuration.test("+P1Y-2M3DT-4H5M+6.5S");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const extendedDuration = Regex.make(
  /^[-+]?P(?!$)(?:[-+]?\d+Y|[-+]?\d+[.,]\d+Y$)?(?:[-+]?\d+M|[-+]?\d+[.,]\d+M$)?(?:[-+]?\d+W|[-+]?\d+[.,]\d+W$)?(?:[-+]?\d+D|[-+]?\d+[.,]\d+D$)?(?:T(?=[\d+-])(?:[-+]?\d+H|[-+]?\d+[.,]\d+H$)?(?:[-+]?\d+M|[-+]?\d+[.,]\d+M$)?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/
);

/**
 * Matches GUID-style identifiers (8-4-4-4-12 hexadecimal segments).
 *
 * @example
 * import { guid } from "@beep/schema/internal/regex/regexes";
 *
 * guid.test("123e4567-e89b-12d3-a456-426614174000");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const guid = Regex.make(/^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/);

/**
 * Builds an RFC 9562/4122 UUID regex with optional version pinning.
 *
 * @param version UUID version (1-8). When omitted, any version plus nil/broadcast UUIDs pass.
 * @example
 * import { uuid } from "@beep/schema/internal/regex/regexes";
 *
 * uuid().test("123e4567-e89b-12d3-a456-426614174000");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const uuid = (version?: number | undefined) => {
  if (!version)
    return /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/;
  return new RegExp(
    `^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${version}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`
  );
};

/**
 * Matches RFC-compliant UUID v4 values.
 *
 * @example
 * import { uuid4 } from "@beep/schema/internal/regex/regexes";
 *
 * uuid4.test("123e4567-e89b-42d3-a456-426614174000");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const uuid4 = /*@__PURE__*/ uuid(4);

/**
 * Matches time-ordered UUID v6 values.
 *
 * @example
 * import { uuid6 } from "@beep/schema/internal/regex/regexes";
 *
 * uuid6.test("a987fbc9-4bed-6b5c-af10-1f6b90a1e2dc");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const uuid6 = /*@__PURE__*/ uuid(6);

/**
 * Matches Unix epoch-based UUID v7 values.
 *
 * @example
 * import { uuid7 } from "@beep/schema/internal/regex/regexes";
 *
 * uuid7.test("01890fdd-6240-7cc2-b9c6-fb8b6e4c2d0c");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const uuid7 = /*@__PURE__*/ uuid(7);

/**
 * Practical email validation balancing readability and RFC coverage.
 *
 * @example
 * import { email } from "@beep/schema/internal/regex/regexes";
 *
 * email.test("ops@example.com");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const email = Regex.make(
  /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9-]*\.)+[A-Za-z]{2,}$/
);

/**
 * Equivalent to the HTML `input[type=email]` browser validation logic.
 *
 * @example
 * import { html5Email } from "@beep/schema/internal/regex/regexes";
 *
 * html5Email.test("user.name+demo@example.dev");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const html5Email = Regex.make(
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
);

/**
 * RFC 5322-compliant email regex popularized by emailregex.com.
 *
 * @example
 * import { rfc5322Email } from "@beep/schema/internal/regex/regexes";
 *
 * rfc5322Email.test("\"display\"@example.io");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const rfc5322Email = Regex.make(
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
);

/**
 * Simple Unicode-aware email validation (length bounds only).
 *
 * @example
 * import { unicodeEmail } from "@beep/schema/internal/regex/regexes";
 *
 * unicodeEmail.test("jöhn@example.de");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const unicodeEmail = Regex.make(/^[^\s@"]{1,64}@[^\s@]{1,255}$/u);

/**
 * IDN email validation equivalent to `unicodeEmail`.
 *
 * @example
 * import { idnEmail } from "@beep/schema/internal/regex/regexes";
 *
 * idnEmail.test("oki@example.東京");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const idnEmail = Regex.make(/^[^\s@"]{1,64}@[^\s@]{1,255}$/u);
/**
 * Browser-compatible email regex matching HTML input behavior.
 *
 * @example
 * import { browserEmail } from "@beep/schema/internal/regex/regexes";
 *
 * browserEmail.test("crew@example.ai");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const browserEmail = Regex.make(
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
);

const _emoji: string = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;

/**
 * Builds a Unicode-aware emoji regex (Extended Pictographic blocks).
 *
 * @example
 * import { emoji } from "@beep/schema/internal/regex/regexes";
 *
 * emoji().test("😀");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export function emoji() {
  return new RegExp(_emoji, "u");
}

/**
 * Validates IPv4 strings (four dotted decimal octets).
 *
 * @example
 * import { ipv4 } from "@beep/schema/internal/regex/regexes";
 *
 * ipv4.test("192.168.0.1");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const ipv4 = Regex.make(
  /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/
);

/**
 * Validates canonical IPv6 strings (full, short, or compressed).
 *
 * @example
 * import { ipv6 } from "@beep/schema/internal/regex/regexes";
 *
 * ipv6.test("2001:0db8::1");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const ipv6 = Regex.make(
  /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})$/
);

/**
 * Validates IPv4 CIDR blocks (address plus /mask).
 *
 * @example
 * import { cidrv4 } from "@beep/schema/internal/regex/regexes";
 *
 * cidrv4.test("10.0.0.0/8");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const cidrv4 = Regex.make(
  /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/
);

/**
 * Validates IPv6 CIDR blocks (address plus /mask).
 *
 * @example
 * import { cidrv6 } from "@beep/schema/internal/regex/regexes";
 *
 * cidrv6.test("2001:db8::/32");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const cidrv6 = Regex.make(
  /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/
);

/**
 * Validates padded base64 content (including empty strings).
 *
 * @example
 * import { base64 } from "@beep/schema/internal/regex/regexes";
 *
 * base64.test("Zg==");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const base64 = Regex.make(/^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/);

/**
 * Validates URL-safe base64 strings without padding.
 *
 * @example
 * import { base64url } from "@beep/schema/internal/regex/regexes";
 *
 * base64url.test("Zg");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const base64url = Regex.make(/^[A-Za-z0-9_-]*$/);

/**
 * Validates DNS hostnames (with optional trailing dot).
 *
 * @example
 * import { hostname } from "@beep/schema/internal/regex/regexes";
 *
 * hostname.test("api.example.io");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const hostname = Regex.make(
  /^(?=.{1,253}\.?$)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[-0-9a-zA-Z]{0,61}[0-9a-zA-Z])?)*\.?$/
);

/**
 * Validates hostnames ending with a top-level domain.
 *
 * @example
 * import { domain } from "@beep/schema/internal/regex/regexes";
 *
 * domain.test("example.com");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const domain = Regex.make(/^([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/);

/**
 * Validates individual domain labels (63-character max, no leading/trailing hyphen).
 *
 * @example
 * import { domain_label } from "@beep/schema/internal/regex/regexes";
 *
 * domain_label.test("sub-domain");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const domain_label = Regex.make(/^(?!-)[A-Za-z0-9-]{1,63}(?<!-)$/);

/**
 * Validates alpha top-level domain names.
 *
 * @example
 * import { top_level_domain } from "@beep/schema/internal/regex/regexes";
 *
 * top_level_domain.test("io");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const top_level_domain = Regex.make(/^[A-Za-z]{2,63}$/);

/**
 * Validates international E.164 phone numbers.
 *
 * @example
 * import { e164 } from "@beep/schema/internal/regex/regexes";
 *
 * e164.test("+12025550123");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const e164 = Regex.make(/^\+(?:[0-9]){6,14}[0-9]$/);
const dateSource = `(?:(?:dd[2468][048]|dd[13579][26]|dd0[48]|[02468][048]00|[13579][26]00)-02-29|d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]d|30)|(?:02)-(?:0[1-9]|1d|2[0-8])))`;

/**
 * Validates ISO-8601 calendar dates with leap-year awareness.
 *
 * @example
 * import { date } from "@beep/schema/internal/regex/regexes";
 *
 * date.test("2024-12-31");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const date = /*@__PURE__*/ new RegExp(`^${dateSource}$`);

function timeSource(args: { precision?: number | null | undefined }) {
  const hhmm = `(?:[01]d|2[0-3]):[0-5]d`;

  return typeof args.precision === "number"
    ? args.precision === -1
      ? `${hhmm}`
      : args.precision === 0
        ? `${hhmm}:[0-5]d`
        : `${hhmm}:[0-5]d.d{${args.precision}}`
    : `${hhmm}(?::[0-5]d(?:.d+)?)?`;
}

/**
 * Builds a time regex with optional fractional-second precision.
 *
 * @example
 * import { time } from "@beep/schema/internal/regex/regexes";
 *
 * time({ precision: 0 }).test("23:59:59");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export function time(args: { precision?: number | null | undefined }) {
  return new RegExp(`^${timeSource(args)}$`);
}

/**
 * Builds an RFC3339/ISO 8601 datetime regex with optional local/offset tolerance.
 *
 * @example
 * import { datetime } from "@beep/schema/internal/regex/regexes";
 *
 * datetime({ precision: 3, offset: true }).test("2024-06-20T12:34:56.789+02:00");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export function datetime(args: {
  readonly precision?: number | null | undefined;
  readonly offset?: boolean | undefined;
  readonly local?: boolean | undefined;
}) {
  const time = timeSource({ precision: args.precision });
  let variants = ["Z"];
  if (args.local) {
    variants = F.pipe(variants, A.append(""));
  }
  if (args.offset) {
    variants = F.pipe(variants, A.append(`([+-](?:[01]d|2[0-3]):[0-5]d)`));
  }
  const timeRegex = `${time}(?:${F.pipe(variants, A.join("|"))})`;

  return new RegExp(`^${dateSource}T(?:${timeRegex})$`);
}

/**
 * Builds a catch-all string length regex with optional min/max.
 *
 * @example
 * import { string } from "@beep/schema/internal/regex/regexes";
 *
 * string({ minimum: 3, maximum: 5 }).test("team");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const string = (
  params?: { readonly minimum?: number | undefined; readonly maximum?: number | undefined } | undefined
) => {
  const regex = params ? `[sS]{${params?.minimum ?? 0},${params?.maximum ?? ""}}` : `[sS]*`;
  return new RegExp(`^${regex}$`);
};

/**
 * Validates bigint literal strings (optionally ending with `n`).
 *
 * @example
 * import { bigint } from "@beep/schema/internal/regex/regexes";
 *
 * bigint.test("42n");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const bigint = Regex.make(/^\d+n?$/);

/**
 * Validates unsigned integer strings.
 *
 * @example
 * import { integer } from "@beep/schema/internal/regex/regexes";
 *
 * integer.test("9001");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const integer = Regex.make(/^\d+$/);

/**
 * Validates signed decimal number strings.
 *
 * @example
 * import { number } from "@beep/schema/internal/regex/regexes";
 *
 * number.test("-3.14");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const number = Regex.make(/^-?\d+(?:\.\d+)?/i);

/**
 * Validates boolean string literals (`true`/`false`, case-insensitive).
 *
 * @example
 * import { boolean } from "@beep/schema/internal/regex/regexes";
 *
 * boolean.test("TRUE");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const boolean = Regex.make(/true|false/i);

const _null = /null/i;
/**
 * Validates the literal string `null` (case-insensitive).
 *
 * @example
 * import { null as nullRegex } from "@beep/schema/internal/regex/regexes";
 *
 * nullRegex.test("NULL");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export { _null as null };
const _undefined = /undefined/i;
/**
 * Validates the literal string `undefined` (case-insensitive).
 *
 * @example
 * import { undefined as undefinedRegex } from "@beep/schema/internal/regex/regexes";
 *
 * undefinedRegex.test("undefined");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export { _undefined as undefined };

/**
 * Validates lowercase-only strings (no uppercase letters).
 *
 * @example
 * import { lowercase } from "@beep/schema/internal/regex/regexes";
 *
 * lowercase.test("effect-only");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const lowercase = Regex.make(/^[^A-Z]*$/);

/**
 * Validates uppercase-only strings (no lowercase letters).
 *
 * @example
 * import { uppercase } from "@beep/schema/internal/regex/regexes";
 *
 * uppercase.test("LOUD");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const uppercase = Regex.make(/^[^a-z]*$/);

/**
 * Validates hexadecimal strings of any length.
 *
 * @example
 * import { hex } from "@beep/schema/internal/regex/regexes";
 *
 * hex.test("deadBEEF");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const hex = Regex.make(/^[0-9a-fA-F]*$/);

function fixedBase64(bodyLength: number, padding: "" | "=" | "==") {
  return new RegExp(`^[A-Za-z0-9+/]{${bodyLength}}${padding}$`);
}

function fixedBase64url(length: number) {
  return new RegExp(`^[A-Za-z0-9-_]{${length}}$`);
}

/**
 * Validates MD5 digests rendered as 32-character hex.
 *
 * @example
 * import { md5_hex } from "@beep/schema/internal/regex/regexes";
 *
 * md5_hex.test("5eb63bbbe01eeed093cb22bb8f5acdc3");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const md5_hex = Regex.make(/^[0-9a-fA-F]{32}$/);

/**
 * Validates MD5 digests rendered as padded base64.
 *
 * @example
 * import { md5_base64 } from "@beep/schema/internal/regex/regexes";
 *
 * md5_base64.test("XrY7u+Ae7tCTyyK7j1rNww==");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const md5_base64 = /*@__PURE__*/ fixedBase64(22, "==");

/**
 * Validates MD5 digests rendered as base64url (unpadded).
 *
 * @example
 * import { md5_base64url } from "@beep/schema/internal/regex/regexes";
 *
 * md5_base64url.test("XrY7u-Ae7tCTyyK7j1rNww");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const md5_base64url = /*@__PURE__*/ fixedBase64url(22);

/**
 * Validates SHA1 digests rendered as 40-character hex.
 *
 * @example
 * import { sha1_hex } from "@beep/schema/internal/regex/regexes";
 *
 * sha1_hex.test("2aae6c35c94fcfb415dbe95f408b9ce91ee846ed");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const sha1_hex = Regex.make(/^[0-9a-fA-F]{40}$/);

/**
 * Validates SHA1 digests rendered as padded base64.
 *
 * @example
 * import { sha1_base64 } from "@beep/schema/internal/regex/regexes";
 *
 * sha1_base64.test("Kq5sNclPz7QV2+lfQIuc6R7oRu0=");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const sha1_base64 = /*@__PURE__*/ fixedBase64(27, "=");

/**
 * Validates SHA1 digests rendered as base64url (unpadded).
 *
 * @example
 * import { sha1_base64url } from "@beep/schema/internal/regex/regexes";
 *
 * sha1_base64url.test("Kq5sNclPz7QV2-lfQIuc6R7oRu0");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const sha1_base64url = /*@__PURE__*/ fixedBase64url(27);

/**
 * Validates SHA256 digests rendered as 64-character hex.
 *
 * @example
 * import { sha256_hex } from "@beep/schema/internal/regex/regexes";
 *
 * sha256_hex.test("b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const sha256_hex = Regex.make(/^[0-9a-fA-F]{64}$/);

/**
 * Validates SHA256 digests rendered as padded base64.
 *
 * @example
 * import { sha256_base64 } from "@beep/schema/internal/regex/regexes";
 *
 * sha256_base64.test("uU0nuZNNPgilLlLX2n2r+sSE7+N6U4DukIj3rOLvzek=");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const sha256_base64 = /*@__PURE__*/ fixedBase64(43, "=");

/**
 * Validates SHA256 digests rendered as base64url (unpadded).
 *
 * @example
 * import { sha256_base64url } from "@beep/schema/internal/regex/regexes";
 *
 * sha256_base64url.test("uU0nuZNNPgilLlLX2n2r-sSE7-N6U4DukIj3rOLvzek");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const sha256_base64url = /*@__PURE__*/ fixedBase64url(43);

/**
 * Validates SHA384 digests rendered as 96-character hex.
 *
 * @example
 * import { sha384_hex } from "@beep/schema/internal/regex/regexes";
 *
 * sha384_hex.test("fdbd8e75a67f29f701a4e040385e2e23986303ea10239211af907fcbb83578b3e417cb71ce646efd0819dd8c088de1bd");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const sha384_hex = Regex.make(/^[0-9a-fA-F]{96}$/);

/**
 * Validates SHA384 digests rendered as base64 without padding.
 *
 * @example
 * import { sha384_base64 } from "@beep/schema/internal/regex/regexes";
 *
 * sha384_base64.test("/b2OdaZ/KfcBpOBAOF4uI5hjA+oQI5IRr5B/y7g1eLPkF8txzmRu/QgZ3YwIjeG9");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const sha384_base64 = /*@__PURE__*/ fixedBase64(64, "");

/**
 * Validates SHA384 digests rendered as base64url.
 *
 * @example
 * import { sha384_base64url } from "@beep/schema/internal/regex/regexes";
 *
 * sha384_base64url.test("_b2OdaZ_KfcBpOBAOF4uI5hjA-oQI5IRr5B_y7g1eLPkF8txzmRu_QgZ3YwIjeG9");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const sha384_base64url = /*@__PURE__*/ fixedBase64url(64);

/**
 * Validates SHA512 digests rendered as 128-character hex.
 *
 * @example
 * import { sha512_hex } from "@beep/schema/internal/regex/regexes";
 *
 * sha512_hex.test("309ecc489c12d6eb4cc40f50c902f2b4d0ed77ee511a7c7a9bcd3ca86d4cd86f989dd35bc5ff499670da34255b45b0cfd830e81f605dcf7dc5542e93ae9cd76f");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const sha512_hex = Regex.make(/^[0-9a-fA-F]{128}$/);

/**
 * Validates SHA512 digests rendered as padded base64.
 *
 * @example
 * import { sha512_base64 } from "@beep/schema/internal/regex/regexes";
 *
 * sha512_base64.test("MJ7MSJwS1utMxA9QyQLytNDtd+5RGnx6m808qG1M2G+YndNbxf9JlnDaNCVbRbDP2DDoH2Bdz33FVC6TrpzXbw==");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const sha512_base64 = /*@__PURE__*/ fixedBase64(86, "==");

/**
 * Validates SHA512 digests rendered as base64url (unpadded).
 *
 * @example
 * import { sha512_base64url } from "@beep/schema/internal/regex/regexes";
 *
 * sha512_base64url.test("MJ7MSJwS1utMxA9QyQLytNDtd-5RGnx6m808qG1M2G-YndNbxf9JlnDaNCVbRbDP2DDoH2Bdz33FVC6TrpzXbw");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const sha512_base64url = /*@__PURE__*/ fixedBase64url(86);
/**
 * Validates dot/bracket path expressions used by JSON pointer helpers.
 *
 * @example
 * import { path_regex } from "@beep/schema/internal/regex/regexes";
 *
 * path_regex.test("payload.items[0].value");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const path_regex = Regex.make(/^($|[a-zA-Z_$][\w$]*(?:\.[a-zA-Z_$][\w$]*|\[\d+].?)*$)/);

/**
 * Validates single-segment property names (word characters only).
 *
 * @example
 * import { prop_regex } from "@beep/schema/internal/regex/regexes";
 *
 * prop_regex.test("username");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const prop_regex = Regex.make(/^\w+$/);

/**
 * Validates slug strings (`a-z0-9` plus hyphen separators).
 *
 * @example
 * import { slug } from "@beep/schema/internal/regex/regexes";
 *
 * slug.test("schema-roadmap");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const slug = Regex.make(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

/**
 * Validates snake_case tag identifiers (lowercase letters plus underscores).
 *
 * @example
 * import { snakeCaseTagRegex } from "@beep/schema/internal/regex/regexes";
 *
 * snakeCaseTagRegex.test("core_foundations");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const snakeCaseTagRegex = Regex.make(/^[a-z]+(?:_[a-z]+)*$/);

/**
 * Validates RFC 3987 IRIs (URL schema, authority, and path forms).
 *
 * @example
 * import { rfc_3987_url_regex } from "@beep/schema/internal/regex/regexes";
 *
 * rfc_3987_url_regex.test("https://example.com/path?query=1#hash");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const rfc_3987_url_regex = Regex.make(
  /^[a-z](?:[-a-z0-9+.])*:(?:\/\/(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9._~!$&'()*+,;=:\xA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[\uD800-\uD83E\uD840-\uD87E\uD880-\uD8BE\uD8C0-\uD8FE\uD900-\uD93E\uD940-\uD97E\uD980-\uD9BE\uD9C0-\uD9FE\uDA00-\uDA3E\uDA40-\uDA7E\uDA80-\uDABE\uDAC0-\uDAFE\uDB00-\uDB3E\uDB44-\uDB7E][\uDC00-\uDFFF]|[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F][\uDC00-\uDFFD])*@)?(?:\[(?:(?:(?:[0-9a-f]{1,4}:){6}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|::(?:[0-9a-f]{1,4}:){5}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:[0-9a-f]{1,4}:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|v[0-9a-f]+[-a-z0-9._~!$&'()*+,;=:]+)\]|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3}|(?:%[0-9a-f][0-9a-f]|[-a-z0-9._~!$&'()*+,;=@\xA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[\uD800-\uD83E\uD840-\uD87E\uD880-\uD8BE\uD8C0-\uD8FE\uD900-\uD93E\uD940-\uD97E\uD980-\uD9BE\uD9C0-\uD9FE\uDA00-\uDA3E\uDA40-\uDA7E\uDA80-\uDABE\uDAC0-\uDAFE\uDB00-\uDB3E\uDB44-\uDB7E][\uDC00-\uDFFF]|[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F][\uDC00-\uDFFD])*)(?::[0-9]*)?(?:\/(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9._~!$&'()*+,;=:@\xA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[\uD800-\uD83E\uD840-\uD87E\uD880-\uD8BE\uD8C0-\uD8FE\uD900-\uD93E\uD940-\uD97E\uD980-\uD9BE\uD9C0-\uD9FE\uDA00-\uDA3E\uDA40-\uDA7E\uDA80-\uDABE\uDAC0-\uDAFE\uDB00-\uDB3E\uDB44-\uDB7E][\uDC00-\uDFFF]|[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F][\uDC00-\uDFFD]))*)*|\/(?:(?:(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9._~!$&'()*+,;=:@\xA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[\uD800-\uD83E\uD840-\uD87E\uD880-\uD8BE\uD8C0-\uD8FE\uD900-\uD93E\uD940-\uD97E\uD980-\uD9BE\uD9C0-\uD9FE\uDA00-\uDA3E\uDA40-\uDA7E\uDA80-\uDABE\uDAC0-\uDAFE\uDB00-\uDB3E\uDB44-\uDB7E][\uDC00-\uDFFF]|[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F][\uDC00-\uDFFD]))+)(?:\/(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9._~!$&'()*+,;=:@\xA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[\uD800-\uD83E\uD840-\uD87E\uD880-\uD8BE\uD8C0-\uD8FE\uD900-\uD93E\uD940-\uD97E\uD980-\uD9BE\uD9C0-\uD9FE\uDA00-\uDA3E\uDA40-\uDA7E\uDA80-\uDABE\uDAC0-\uDAFE\uDB00-\uDB3E\uDB44-\uDB7E][\uDC00-\uDFFF]|[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F][\uDC00-\uDFFD]))*)*)?|(?:(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9._~!$&'()*+,;=:@\xA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[\uD800-\uD83E\uD840-\uD87E\uD880-\uD8BE\uD8C0-\uD8FE\uD900-\uD93E\uD940-\uD97E\uD980-\uD9BE\uD9C0-\uD9FE\uDA00-\uDA3E\uDA40-\uDA7E\uDA80-\uDABE\uDAC0-\uDAFE\uDB00-\uDB3E\uDB44-\uDB7E][\uDC00-\uDFFF]|[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F][\uDC00-\uDFFD]))+)(?:\/(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9._~!$&'()*+,;=:@\xA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[\uD800-\uD83E\uD840-\uD87E\uD880-\uD8BE\uD8C0-\uD8FE\uD900-\uD93E\uD940-\uD97E\uD980-\uD9BE\uD9C0-\uD9FE\uDA00-\uDA3E\uDA40-\uDA7E\uDA80-\uDABE\uDAC0-\uDAFE\uDB00-\uDB3E\uDB44-\uDB7E][\uDC00-\uDFFF]|[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F][\uDC00-\uDFFD]))*)*|(?!(?:%[0-9a-f][0-9a-f]|[-a-z0-9._~!$&'()*+,;=:@\xA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[\uD800-\uD83E\uD840-\uD87E\uD880-\uD8BE\uD8C0-\uD8FE\uD900-\uD93E\uD940-\uD97E\uD980-\uD9BE\uD9C0-\uD9FE\uDA00-\uDA3E\uDA40-\uDA7E\uDA80-\uDABE\uDAC0-\uDAFE\uDB00-\uDB3E\uDB44-\uDB7E][\uDC00-\uDFFF]|[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F][\uDC00-\uDFFD])))(?:\?(?:%[0-9a-f][0-9a-f]|[-a-z0-9._~!$&'()*+,;=:@/?\xA0-\uD7FF\uE000-\uFDCF\uFDF0-\uFFEF]|[\uD800-\uD83E\uD840-\uD87E\uD880-\uD8BE\uD8C0-\uD8FE\uD900-\uD93E\uD940-\uD97E\uD980-\uD9BE\uD9C0-\uD9FE\uDA00-\uDA3E\uDA40-\uDA7E\uDA80-\uDABE\uDAC0-\uDAFE\uDB00-\uDB3E\uDB44-\uDB7E\uDB80-\uDBBE\uDBC0-\uDBFE][\uDC00-\uDFFF]|[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F\uDBBF\uDBFF][\uDC00-\uDFFD])*)?(?:#(?:%[0-9a-f][0-9a-f]|[-a-z0-9._~!$&'()*+,;=:@/?\xA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[\uD800-\uD83E\uD840-\uD87E\uD880-\uD8BE\uD8C0-\uD8FE\uD900-\uD93E\uD940-\uD97E\uD980-\uD9BE\uD9C0-\uD9FE\uDA00-\uDA3E\uDA40-\uDA7E\uDA80-\uDABE\uDAC0-\uDAFE\uDB00-\uDB3E\uDB44-\uDB7E][\uDC00-\uDFFF]|[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F][\uDC00-\uDFFD])*)?$/
);
/**
 * Validates RFC3339 datetimes including leap seconds.
 *
 * @example
 * import { rfc3339DateTime } from "@beep/schema/internal/regex/regexes";
 *
 * rfc3339DateTime.test("2023-08-15T23:59:60Z");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const rfc3339DateTime =
  /^(?<date>(?!0000)\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01]))T(?<time>(?:[01]\d|2[0-3]):[0-5]\d:(?:[0-5]\d|60))(?:\.(?<frac>\d{1,9}))?(?<zone>Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/;

/**
 * Validates CSS hexadecimal color strings (`#RGB`, `#RRGGBB`, or alpha variants).
 *
 * @example
 * import { css_hex_color_regex } from "@beep/schema/internal/regex/regexes";
 *
 * css_hex_color_regex.test("#ff00ff");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const css_hex_color_regex = Regex.make(/^#(?:[A-F0-9]{3,4}|[A-F0-9]{6}(?:[A-F0-9]{2})?)$/i);

/**
 * Validates a numeric component for CSS rgb()/rgba() syntax.
 *
 * @example
 * import { rgb_number_part_regex } from "@beep/schema/internal/regex/regexes";
 *
 * rgb_number_part_regex.test("-12.5");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const rgb_number_part_regex = Regex.make(/^[+-]?(?:\d+\.?\d*|\.\d+)$/);

/**
 * Validates strings with no ASCII control characters.
 *
 * @example
 * import { NO_ASCII_CTRL } from "@beep/schema/internal/regex/regexes";
 *
 * NO_ASCII_CTRL.test("Printable text only");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const NO_ASCII_CTRL = Regex.make(/^[^\x00-\x1F\x7F]+$/);

/**
 * Validates US ZIP codes (`12345` or `12345-6789`).
 *
 * @example
 * import { US_POSTAL_CODE_REGEX } from "@beep/schema/internal/regex/regexes";
 *
 * US_POSTAL_CODE_REGEX.test("94105-1234");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const US_POSTAL_CODE_REGEX = Regex.make(/^\d{5}(-\d{4})?$/);

/**
 * Validates Canadian postal codes (`A1A 1A1`).
 *
 * @example
 * import { CANADA_POSTAL_CODE_REGEX } from "@beep/schema/internal/regex/regexes";
 *
 * CANADA_POSTAL_CODE_REGEX.test("K1A 0B1");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const CANADA_POSTAL_CODE_REGEX = Regex.make(/^[A-Z]\d[A-Z][ ]?\d[A-Z]\d$/);

/**
 * Validates UK postal codes (including GIR 0AA).
 *
 * @example
 * import { GREAT_BRITAIN_POSTAL_CODE_REGEX } from "@beep/schema/internal/regex/regexes";
 *
 * GREAT_BRITAIN_POSTAL_CODE_REGEX.test("SW1A 1AA");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const GREAT_BRITAIN_POSTAL_CODE_REGEX = Regex.make(/^(GIR 0AA|[A-Z]{1,2}\d[A-Z\d]?[ ]?\d[A-Z]{2})$/);

/**
 * Validates German postal codes (`12345`).
 *
 * @example
 * import { GERMANY_POSTAL_CODE_REGEX } from "@beep/schema/internal/regex/regexes";
 *
 * GERMANY_POSTAL_CODE_REGEX.test("10115");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const GERMANY_POSTAL_CODE_REGEX = Regex.make(/^\d{5}$/);

/**
 * Validates French postal codes (`75008`).
 *
 * @example
 * import { FRANCE_POSTAL_CODE_REGEX } from "@beep/schema/internal/regex/regexes";
 *
 * FRANCE_POSTAL_CODE_REGEX.test("75008");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const FRANCE_POSTAL_CODE_REGEX = Regex.make(/^\d{5}$/);

/**
 * Validates Dutch postal codes (`1234 AB`).
 *
 * @example
 * import { NETHERLANDS_POSTAL_CODE_REGEX } from "@beep/schema/internal/regex/regexes";
 *
 * NETHERLANDS_POSTAL_CODE_REGEX.test("1234 AB");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const NETHERLANDS_POSTAL_CODE_REGEX = Regex.make(/^\d{4}[ ]?[A-Z]{2}$/);

/**
 * Validates Australian postal codes (`1234`).
 *
 * @example
 * import { AUSTRALIA_POSTAL_CODE_REGEX } from "@beep/schema/internal/regex/regexes";
 *
 * AUSTRALIA_POSTAL_CODE_REGEX.test("3000");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const AUSTRALIA_POSTAL_CODE_REGEX = Regex.make(/^\d{4}$/);

/**
 * Validates Brazilian CEP codes (`12345-678`).
 *
 * @example
 * import { BRAZIL_POSTAL_CODE_REGEX } from "@beep/schema/internal/regex/regexes";
 *
 * BRAZIL_POSTAL_CODE_REGEX.test("01001-000");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const BRAZIL_POSTAL_CODE_REGEX = Regex.make(/^\d{5}-?\d{3}$/);

/**
 * Validates Irish Eircode values (`A65 F4E2`).
 *
 * @example
 * import { IRELAND_POSTAL_CODE_REGEX } from "@beep/schema/internal/regex/regexes";
 *
 * IRELAND_POSTAL_CODE_REGEX.test("D02 X285");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const IRELAND_POSTAL_CODE_REGEX = Regex.make(/^[A-Z0-9]{3}[ ]?[A-Z0-9]{4}$/);

/**
 * Country-specific postal-code regex catalog.
 *
 * @example
 * import { POSTAL_CODE_REGEX } from "@beep/schema/internal/regex/regexes";
 *
 * POSTAL_CODE_REGEX.CANADA.test("K1A 0B1");
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const POSTAL_CODE_REGEX = {
  US: US_POSTAL_CODE_REGEX,
  CANADA: CANADA_POSTAL_CODE_REGEX,
  GREAT_BRITAIN: GREAT_BRITAIN_POSTAL_CODE_REGEX,
  GERMANY: GERMANY_POSTAL_CODE_REGEX,
  FRANCE: FRANCE_POSTAL_CODE_REGEX,
  NETHERLANDS: NETHERLANDS_POSTAL_CODE_REGEX,
  AUSTRALIA: AUSTRALIA_POSTAL_CODE_REGEX,
  BRAZIL: BRAZIL_POSTAL_CODE_REGEX,
  IRELAND: IRELAND_POSTAL_CODE_REGEX,
} as const;

/**
 * @description
 * Matches a complete Next.js-style pathname beginning with `/`, followed by zero or
 * more path segments, an optional final segment, and an optional query string.
 *
 * This pattern enforces:
 * - A leading `/`
 * - Segments composed only of `[\w\-.]` (letters, digits, underscore, hyphen, dot)
 * - Optional trailing filename or empty segment
 * - Optional query beginning with `?` whose characters comply with RFC3986 "safe" sets,
 *   including unreserved characters, sub-delimiters, `:`, `@`, `/`, `?`, and `%`.
 *
 * This is the primary validation rule for the {@link URLPath} schema and mirrors
 * the constraints applied by Next.js routing, static file serving, and API routes.
 *
 * @example
 * import { URL_PATH_WITH_OPTIONAL_RFC3986_QUERY_REGEXP } from "@beep/schema/internal/regex/regexes";
 * console.log(URL_PATH_WITH_OPTIONAL_RFC3986_QUERY_REGEXP.test("/_next/static/chunks/app.js?version=1.2.3&debug=true"))
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const URL_PATH_WITH_OPTIONAL_RFC3986_QUERY_REGEXP = Regex.make(
  /^\/(?:[\w\-.]+\/)*(?:[\w\-.]*)?(?:\?[A-Za-z0-9\-._~!$&'()*+,;=:@/?%]*)?$/
);

/**
 * @description
 * Matches a single path segment composed of characters typically allowed within
 * URL pathname components — alphanumerics, underscore, hyphen, and dot.
 *
 * This pattern intentionally excludes `/` to ensure it only validates one segment.
 *
 * Used by the URLPath arbitrary generator to fabricate realistic and safe path
 * components that align with Next.js conventions for folder names, route groups,
 * and static asset directories.
 *
 * @example
 * import { URL_PATH_SEGMENT_SAFE_CHARS_REGEXP } from "@beep/schema/internal/regex/regexes";
 * console.log(URL_PATH_SEGMENT_SAFE_CHARS_REGEXP.test("dashboard-v1_alpha.file"))
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const URL_PATH_SEGMENT_SAFE_CHARS_REGEXP = Regex.make(/^[\w\-.]+$/);

/**
 * @description
 * Matches a simple filename where the base name is composed of alphanumerics,
 * underscore, and hyphen, followed by a dot and a word-character file extension.
 *
 * Examples include: `page.tsx`, `index.js`, `ic-lock.svg`, `favicon.ico`.
 *
 * This is used during arbitrary generation to produce realistic static assets
 * and route files that commonly occur in Next.js applications.
 *
 * @example
 * import {URL_PATH_FILENAME_WITH_EXTENSION_REGEXP } from "@beep/schema/internal/regex/regexes";
 * console.log(URL_PATH_FILENAME_WITH_EXTENSION_REGEXP.test("index.js"))
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const URL_PATH_FILENAME_WITH_EXTENSION_REGEXP = Regex.make(/^[\w-]+\.\w+$/);

/**
 * @description
 * Matches a query parameter key token using only alphanumerics, underscore, or
 * hyphen. These characters are universally safe for query keys and help avoid
 * characters requiring URL-encoding or reserved syntax issues.
 *
 * Examples: `token`, `user_id`, `page-idx`.
 *
 * Used in arbitrary generation when synthesizing query parameter objects for
 * the {@link URLPath} schema.
 *
 * @example
 * import {URL_QUERY_PARAM_KEY_TOKEN_REGEXP } from "@beep/schema/internal/regex/regexes";
 * console.log(URL_QUERY_PARAM_KEY_TOKEN_REGEXP.test("user_id"))
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const URL_QUERY_PARAM_KEY_TOKEN_REGEXP = Regex.make(/^[A-Za-z0-9_-]+$/);

/**
 * @description
 * Matches a query parameter value made from RFC3986 "safe" characters: unreserved
 * characters (letters, digits, `-._~`), sub-delimiters (`!$&'()*+,;=`), plus `:`,
 * `@`, `/`, `?`, and `%` for percent-encoded sequences.
 *
 * This character class corresponds closely to what browsers and Next.js accept
 * without requiring additional percent-encoding, making it suitable for generating
 * realistic and robust query parameter values.
 *
 * Examples: `abc123`, `user%40example.com`, `file-path/data?debug=true`.
 *
 * @example
 * import {URL_QUERY_PARAM_VALUE_RFC3986_SAFE_REGEXP } from "@beep/schema/internal/regex/regexes";
 * console.log(URL_QUERY_PARAM_VALUE_RFC3986_SAFE_REGEXP.test("user%40example.com"))
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const URL_QUERY_PARAM_VALUE_RFC3986_SAFE_REGEXP = Regex.make(/^[A-Za-z0-9\-._~!$&'()*+,;=:@/?%]+$/);

/**
 * @description
 * Matches a string of one or more whitespace characters.
 *
 * @example
 * import {ASCII_WHITESPACE_CHARS } from "@beep/schema/internal/regex/regexes";
 * Regexp(`[${ASCII_WHITESPACE_CHARS}]+`)
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const ASCII_WHITESPACE_CHARS = "\t\n\f\r " as const;

/**
 * @description
 * Matches a string of one or more whitespace characters.
 *
 * @example
 * import {ASCII_WHITESPACE } from "@beep/schema/internal/regex/regexes";
 * console.log(ASCII_WHITESPACE.test("\n\t\r\f"))
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const ASCII_WHITESPACE = RegexFromString.make(`[${ASCII_WHITESPACE_CHARS}]+`);

/**
 * @description
 * Matches a string of one or more whitespace characters.
 *
 * @example
 * import {ASCII_WHITESPACE_AT_START } from "@beep/schema/internal/regex/regexes";
 * console.log(ASCII_WHITESPACE_AT_START.test("\n\t\r\f"))
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const ASCII_WHITESPACE_AT_START = RegexFromString.make(`^[${ASCII_WHITESPACE_CHARS}]+`);

/**
 * @description
 * Matches a string of one or more whitespace characters.
 *
 * @example
 * import {ASCII_WHITESPACE_AT_END } from "@beep/schema/internal/regex/regexes";
 * console.log(ASCII_WHITESPACE_AT_END.test("\n\t\r\f"))
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const ASCII_WHITESPACE_AT_END = RegexFromString.make(`[${ASCII_WHITESPACE_CHARS}]+$`);

/**
 * An ASCII code point is a code point in the range U+0000 NULL to
 * U+007F DELETE, inclusive." See <https://server.spec.whatwg.org/#ascii-string>.
 * deno-lint-ignore no-control-regex
 *
 * @example
 * import {ASCII } from "@beep/schema/internal/regex/regexes";
 * console.log(ASCII.test("\x00\x7f"))
 *
 * @category Regex
 * @since 0.1.0
 *
 */
export const ASCII = Regex.make(/^[\x00-\x7f]*$/);
