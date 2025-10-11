import { Regex } from "@beep/schema/custom/Regex.schema";

export const cuid = Regex.make(/^[cC][^\s-]{8,}$/);

export const cuid2 = Regex.make(/^[0-9a-z]+$/);

export const ulid = Regex.make(/^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/);

export const xid = Regex.make(/^[0-9a-vA-V]{20}$/);

export const ksuid = Regex.make(/^[A-Za-z0-9]{27}$/);

export const nanoid = Regex.make(/^[a-zA-Z0-9_-]{21}$/);

/** ISO 8601-1 duration regex. Does not support the 8601-2 extensions like negative durations or fractional/negative components. */
export const duration = Regex.make(
  /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/
);

/** Implements ISO 8601-2 extensions like explicit +- prefixes, mixing weeks with other units, and fractional/negative components. */
export const extendedDuration = Regex.make(
  /^[-+]?P(?!$)(?:[-+]?\d+Y|[-+]?\d+[.,]\d+Y$)?(?:[-+]?\d+M|[-+]?\d+[.,]\d+M$)?(?:[-+]?\d+W|[-+]?\d+[.,]\d+W$)?(?:[-+]?\d+D|[-+]?\d+[.,]\d+D$)?(?:T(?=[\d+-])(?:[-+]?\d+H|[-+]?\d+[.,]\d+H$)?(?:[-+]?\d+M|[-+]?\d+[.,]\d+M$)?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/
);

/** A regex for any UUID-like identifier: 8-4-4-4-12 hex pattern */
export const guid = Regex.make(/^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/);

/** Returns a regex for validating an RFC 9562/4122 UUID.
 *
 * @param version Optionally specify a version 1-8. If no version is specified, all versions are supported. */
export const uuid = (version?: number | undefined) => {
  if (!version)
    return /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/;
  return new RegExp(
    `^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${version}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`
  );
};
export const uuid4 = /*@__PURE__*/ uuid(4);
export const uuid6 = /*@__PURE__*/ uuid(6);
export const uuid7 = /*@__PURE__*/ uuid(7);

/** Practical email validation */
export const email = Regex.make(
  /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9-]*\.)+[A-Za-z]{2,}$/
);

/** Equivalent to the HTML5 input[type=email] validation implemented by browsers. Source: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/email */
export const html5Email = Regex.make(
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
);

/** The classic emailregex.com regex for RFC 5322-compliant emails */
export const rfc5322Email = Regex.make(
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
);

/** A loose regex that allows Unicode characters, enforces length limits, and that's about it. */
export const unicodeEmail = Regex.make(/^[^\s@"]{1,64}@[^\s@]{1,255}$/u);

export const idnEmail = Regex.make(/^[^\s@"]{1,64}@[^\s@]{1,255}$/u);

export const browserEmail = Regex.make(
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
);

// from https://thekevinscott.com/emojis-in-javascript/#writing-a-regular-expression

const _emoji: string = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
export function emoji() {
  return new RegExp(_emoji, "u");
}

export const ipv4 = Regex.make(
  /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/
);

export const ipv6 = Regex.make(
  /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})$/
);

export const cidrv4 = Regex.make(
  /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/
);

export const cidrv6 = Regex.make(
  /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/
);

// https://stackoverflow.com/questions/7860392/determine-if-string-is-in-base64-using-javascript
export const base64 = Regex.make(/^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/);

export const base64url = Regex.make(/^[A-Za-z0-9_-]*$/);

// based on https://stackoverflow.com/questions/106179/regular-expression-to-match-dns-hostname-or-ip-address
// export const hostname = /^([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+$/;
export const hostname = Regex.make(
  /^(?=.{1,253}\.?$)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[-0-9a-zA-Z]{0,61}[0-9a-zA-Z])?)*\.?$/
);

export const domain = Regex.make(/^([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/);
export const domain_label = Regex.make(/^(?!-)[A-Za-z0-9-]{1,63}(?<!-)$/);
export const top_level_domain = Regex.make(/^[A-Za-z]{2,63}$/);

// https://blog.stevenlevithan.com/archives/validate-phone-number#r4-3 (regex sans spaces)
export const e164 = Regex.make(/^\+(?:[0-9]){6,14}[0-9]$/);

// const dateSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
const dateSource = `(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))`;
export const date = /*@__PURE__*/ new RegExp(`^${dateSource}$`);

function timeSource(args: { precision?: number | null | undefined }) {
  const hhmm = `(?:[01]\\d|2[0-3]):[0-5]\\d`;

  return typeof args.precision === "number"
    ? args.precision === -1
      ? `${hhmm}`
      : args.precision === 0
        ? `${hhmm}:[0-5]\\d`
        : `${hhmm}:[0-5]\\d\\.\\d{${args.precision}}`
    : `${hhmm}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
export function time(args: {
  precision?: number | null;
  // local?: boolean;
}) {
  return new RegExp(`^${timeSource(args)}$`);
}

// Adapted from https://stackoverflow.com/a/3143231
export function datetime(args: { precision?: number | null; offset?: boolean; local?: boolean }) {
  const time = timeSource({ precision: args.precision });
  const opts = ["Z"];
  if (args.local) opts.push("");
  // if (args.offset) opts.push(`([+-]\\d{2}:\\d{2})`);
  if (args.offset) opts.push(`([+-](?:[01]\\d|2[0-3]):[0-5]\\d)`);
  const timeRegex = `${time}(?:${opts.join("|")})`;

  return new RegExp(`^${dateSource}T(?:${timeRegex})$`);
}

export const string = (params?: { minimum?: number | undefined; maximum?: number | undefined }) => {
  const regex = params ? `[\\s\\S]{${params?.minimum ?? 0},${params?.maximum ?? ""}}` : `[\\s\\S]*`;
  return new RegExp(`^${regex}$`);
};

export const bigint = Regex.make(/^\d+n?$/);

export const integer = Regex.make(/^\d+$/);

export const number = Regex.make(/^-?\d+(?:\.\d+)?/i);

export const boolean = Regex.make(/true|false/i);

const _null = /null/i;
export { _null as null };
const _undefined = /undefined/i;
export { _undefined as undefined };

// regex for string with no uppercase letters
export const lowercase = Regex.make(/^[^A-Z]*$/);

// regex for string with no lowercase letters
export const uppercase = Regex.make(/^[^a-z]*$/);

// regex for hexadecimal strings (any length)
export const hex = Regex.make(/^[0-9a-fA-F]*$/);

// Hash regexes for different algorithms and encodings
// Helper function to create base64 regex with exact length and padding
function fixedBase64(bodyLength: number, padding: "" | "=" | "==") {
  return new RegExp(`^[A-Za-z0-9+/]{${bodyLength}}${padding}$`);
}

// Helper function to create base64url regex with exact length (no padding)
function fixedBase64url(length: number) {
  return new RegExp(`^[A-Za-z0-9-_]{${length}}$`);
}

// MD5 (16 bytes): base64 = 24 chars total (22 + "==")
export const md5_hex = Regex.make(/^[0-9a-fA-F]{32}$/);

export const md5_base64 = /*@__PURE__*/ fixedBase64(22, "==");
export const md5_base64url = /*@__PURE__*/ fixedBase64url(22);

// SHA1 (20 bytes): base64 = 28 chars total (27 + "=")
export const sha1_hex = Regex.make(/^[0-9a-fA-F]{40}$/);

export const sha1_base64 = /*@__PURE__*/ fixedBase64(27, "=");
export const sha1_base64url = /*@__PURE__*/ fixedBase64url(27);

// SHA256 (32 bytes): base64 = 44 chars total (43 + "=")
export const sha256_hex = Regex.make(/^[0-9a-fA-F]{64}$/);

export const sha256_base64 = /*@__PURE__*/ fixedBase64(43, "=");
export const sha256_base64url = /*@__PURE__*/ fixedBase64url(43);

// SHA384 (48 bytes): base64 = 64 chars total (no padding)
export const sha384_hex = Regex.make(/^[0-9a-fA-F]{96}$/);

export const sha384_base64 = /*@__PURE__*/ fixedBase64(64, "");
export const sha384_base64url = /*@__PURE__*/ fixedBase64url(64);

// SHA512 (64 bytes): base64 = 88 chars total (86 + "==")
export const sha512_hex = Regex.make(/^[0-9a-fA-F]{128}$/);

export const sha512_base64 = /*@__PURE__*/ fixedBase64(86, "==");
export const sha512_base64url = /*@__PURE__*/ fixedBase64url(86);

export const path_regex = Regex.make(/^($|[a-zA-Z_$][\w$]*(?:\.[a-zA-Z_$][\w$]*|\[\d+]\.?)*$)/);
export const prop_regex = Regex.make(/^\w+$/);

export const slug = Regex.make(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const snakeCaseTagRegex = Regex.make(/^[a-z]+(?:_[a-z]+)*$/);

export const rfc_3987_url_regex = Regex.make(
  /^[a-z](?:[-a-z0-9+.])*:(?:\/\/(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9._~!$&'()*+,;=:\xA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[\uD800-\uD83E\uD840-\uD87E\uD880-\uD8BE\uD8C0-\uD8FE\uD900-\uD93E\uD940-\uD97E\uD980-\uD9BE\uD9C0-\uD9FE\uDA00-\uDA3E\uDA40-\uDA7E\uDA80-\uDABE\uDAC0-\uDAFE\uDB00-\uDB3E\uDB44-\uDB7E][\uDC00-\uDFFF]|[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F][\uDC00-\uDFFD])*@)?(?:\[(?:(?:(?:[0-9a-f]{1,4}:){6}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|::(?:[0-9a-f]{1,4}:){5}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:[0-9a-f]{1,4}:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|v[0-9a-f]+[-a-z0-9._~!$&'()*+,;=:]+)\]|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3}|(?:%[0-9a-f][0-9a-f]|[-a-z0-9._~!$&'()*+,;=@\xA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[\uD800-\uD83E\uD840-\uD87E\uD880-\uD8BE\uD8C0-\uD8FE\uD900-\uD93E\uD940-\uD97E\uD980-\uD9BE\uD9C0-\uD9FE\uDA00-\uDA3E\uDA40-\uDA7E\uDA80-\uDABE\uDAC0-\uDAFE\uDB00-\uDB3E\uDB44-\uDB7E][\uDC00-\uDFFF]|[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F][\uDC00-\uDFFD])*)(?::[0-9]*)?(?:\/(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9._~!$&'()*+,;=:@\xA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[\uD800-\uD83E\uD840-\uD87E\uD880-\uD8BE\uD8C0-\uD8FE\uD900-\uD93E\uD940-\uD97E\uD980-\uD9BE\uD9C0-\uD9FE\uDA00-\uDA3E\uDA40-\uDA7E\uDA80-\uDABE\uDAC0-\uDAFE\uDB00-\uDB3E\uDB44-\uDB7E][\uDC00-\uDFFF]|[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F][\uDC00-\uDFFD]))*)*|\/(?:(?:(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9._~!$&'()*+,;=:@\xA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[\uD800-\uD83E\uD840-\uD87E\uD880-\uD8BE\uD8C0-\uD8FE\uD900-\uD93E\uD940-\uD97E\uD980-\uD9BE\uD9C0-\uD9FE\uDA00-\uDA3E\uDA40-\uDA7E\uDA80-\uDABE\uDAC0-\uDAFE\uDB00-\uDB3E\uDB44-\uDB7E][\uDC00-\uDFFF]|[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F][\uDC00-\uDFFD]))+)(?:\/(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9._~!$&'()*+,;=:@\xA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[\uD800-\uD83E\uD840-\uD87E\uD880-\uD8BE\uD8C0-\uD8FE\uD900-\uD93E\uD940-\uD97E\uD980-\uD9BE\uD9C0-\uD9FE\uDA00-\uDA3E\uDA40-\uDA7E\uDA80-\uDABE\uDAC0-\uDAFE\uDB00-\uDB3E\uDB44-\uDB7E][\uDC00-\uDFFF]|[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F][\uDC00-\uDFFD]))*)*)?|(?:(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9._~!$&'()*+,;=:@\xA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[\uD800-\uD83E\uD840-\uD87E\uD880-\uD8BE\uD8C0-\uD8FE\uD900-\uD93E\uD940-\uD97E\uD980-\uD9BE\uD9C0-\uD9FE\uDA00-\uDA3E\uDA40-\uDA7E\uDA80-\uDABE\uDAC0-\uDAFE\uDB00-\uDB3E\uDB44-\uDB7E][\uDC00-\uDFFF]|[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F][\uDC00-\uDFFD]))+)(?:\/(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9._~!$&'()*+,;=:@\xA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[\uD800-\uD83E\uD840-\uD87E\uD880-\uD8BE\uD8C0-\uD8FE\uD900-\uD93E\uD940-\uD97E\uD980-\uD9BE\uD9C0-\uD9FE\uDA00-\uDA3E\uDA40-\uDA7E\uDA80-\uDABE\uDAC0-\uDAFE\uDB00-\uDB3E\uDB44-\uDB7E][\uDC00-\uDFFF]|[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F][\uDC00-\uDFFD]))*)*|(?!(?:%[0-9a-f][0-9a-f]|[-a-z0-9._~!$&'()*+,;=:@\xA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[\uD800-\uD83E\uD840-\uD87E\uD880-\uD8BE\uD8C0-\uD8FE\uD900-\uD93E\uD940-\uD97E\uD980-\uD9BE\uD9C0-\uD9FE\uDA00-\uDA3E\uDA40-\uDA7E\uDA80-\uDABE\uDAC0-\uDAFE\uDB00-\uDB3E\uDB44-\uDB7E][\uDC00-\uDFFF]|[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F][\uDC00-\uDFFD])))(?:\?(?:%[0-9a-f][0-9a-f]|[-a-z0-9._~!$&'()*+,;=:@/?\xA0-\uD7FF\uE000-\uFDCF\uFDF0-\uFFEF]|[\uD800-\uD83E\uD840-\uD87E\uD880-\uD8BE\uD8C0-\uD8FE\uD900-\uD93E\uD940-\uD97E\uD980-\uD9BE\uD9C0-\uD9FE\uDA00-\uDA3E\uDA40-\uDA7E\uDA80-\uDABE\uDAC0-\uDAFE\uDB00-\uDB3E\uDB44-\uDB7E\uDB80-\uDBBE\uDBC0-\uDBFE][\uDC00-\uDFFF]|[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F\uDBBF\uDBFF][\uDC00-\uDFFD])*)?(?:#(?:%[0-9a-f][0-9a-f]|[-a-z0-9._~!$&'()*+,;=:@/?\xA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[\uD800-\uD83E\uD840-\uD87E\uD880-\uD8BE\uD8C0-\uD8FE\uD900-\uD93E\uD940-\uD97E\uD980-\uD9BE\uD9C0-\uD9FE\uDA00-\uDA3E\uDA40-\uDA7E\uDA80-\uDABE\uDAC0-\uDAFE\uDB00-\uDB3E\uDB44-\uDB7E][\uDC00-\uDFFF]|[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F][\uDC00-\uDFFD])*)?$/
);

/** RFC3339 date-time (ISO 8601 profile), with leap-second support. */
export const rfc3339DateTime =
  /^(?<date>(?!0000)\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01]))T(?<time>(?:[01]\d|2[0-3]):[0-5]\d:(?:[0-5]\d|60))(?:\.(?<frac>\d{1,9}))?(?<zone>Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/;

// Matches ONLY a standalone CSS hex color string
export const css_hex_color_regex = Regex.make(/^#(?:[A-F0-9]{3,4}|[A-F0-9]{6}(?:[A-F0-9]{2})?)$/i);

export const rgb_number_part_regex = Regex.make(/^[+-]?(?:\d+\.?\d*|\.\d+)$/);
