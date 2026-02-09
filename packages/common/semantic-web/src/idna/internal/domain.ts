/**
 * Domain and email address mapping for IDNA operations.
 *
 * This keeps parity with the legacy behavior:
 * - Only the domain part of an email address is punycoded.
 * - RFC 3490 / IDNA2003 separator normalization is applied.
 */

import * as A from "effect/Array";
import * as Either from "effect/Either";
import * as ParseResult from "effect/ParseResult";
import type * as AST from "effect/SchemaAST";
import * as Str from "effect/String";
import { decode as punycodeDecode, encode as punycodeEncode } from "./punycode.ts";

/** Regular expressions */
const regexPunycode = /^xn--/;
const regexNonASCII = /[^\0-\x7F]/; // Note: U+007F DEL is excluded too.
const regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g; // RFC 3490 separators

type Result<A> = Either.Either<A, ParseResult.ParseIssue>;

const mapDomain = (
  domain: string,
  callback: (label: string) => Result<string>,
): Result<string> => {
  const parts = Str.split(domain, "@");

  // In email addresses, only the domain name should be punycoded. Leave
  // the local part (i.e. everything up to `@`) intact.
  const localPart = parts[0] ?? "";
  const domainPart = parts[1];

  const prefix = domainPart !== undefined ? `${localPart}@` : "";
  const host = domainPart !== undefined ? domainPart : domain;

  // Avoid `split(regex)` for IE8 compatibility. See legacy punycode.js note.
  const normalized = Str.replace(regexSeparators, "\x2E")(host);

  const labels = Str.split(".")(normalized);
  const out = A.empty<string>()

  for (const label of labels) {
    const r = callback(label);
    if (Either.isLeft(r)) {
      return r;
    }
    out.push(r.right);
  }

  return ParseResult.succeed(prefix + out.join("."));
};

/**
 * Converts a Punycode string representing a domain name or an email address
 * to Unicode. Only the punycoded parts of the input will be converted.
 */
export const toUnicode = (ast: AST.AST, input: string): Result<string> =>
  mapDomain(input, (label) => {
    if (!regexPunycode.test(label)) {
      return ParseResult.succeed(label);
    }
    const body = Str.toLowerCase(Str.slice(4)(label));
    return punycodeDecode(ast, body);
  });

/**
 * Converts a Unicode string representing a domain name or an email address to
 * Punycode. Only the non-ASCII parts of the domain name will be converted.
 */
export const toASCII = (ast: AST.AST, input: string): Result<string> =>
  mapDomain(input, (label) => {
    if (!regexNonASCII.test(label)) {
      return ParseResult.succeed(label);
    }

    const encoded = punycodeEncode(ast, label);
    if (Either.isLeft(encoded)) {
      return encoded;
    }

    return ParseResult.succeed(`xn--${encoded.right}`);
  });
