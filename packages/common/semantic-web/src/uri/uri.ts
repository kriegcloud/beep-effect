/**
 * URI.js
 *
 * @fileoverview An RFC 3986 compliant, scheme extendable URI parsing/normalizing/resolving/serializing library for JavaScript.
 * @author <a href="mailto:gary.court@gmail.com">Gary Court</a>
 * @see http://github.com/garycourt/uri-js
 */

/**
 * Copyright 2011 Gary Court. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are
 * permitted provided that the following conditions are met:
 *
 *    1. Redistributions of source code must retain the above copyright notice, this list of
 *       conditions and the following disclaimer.
 *
 *    2. Redistributions in binary form must reproduce the above copyright notice, this list
 *       of conditions and the following disclaimer in the documentation and/or other materials
 *       provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY GARY COURT ``AS IS'' AND ANY EXPRESS OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 * FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL GARY COURT OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
 * ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * The views and conclusions contained in the software and documentation are those of the
 * authors and should not be interpreted as representing official policies, either expressed
 * or implied, of Gary Court.
 */

import { $SemanticWebId } from "@beep/identity/packages";
import idna from "@beep/semantic-web/idna";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import { pipe } from "effect/Function";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as ParseResult from "effect/ParseResult";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import type * as AST from "effect/SchemaAST";
import * as Str from "effect/String";
import type { URIRegExps } from "./model.ts";

import IRI_PROTOCOL from "./regex-iri";
import URI_PROTOCOL from "./regex-uri";

const $I = $SemanticWebId.create("uri/uri");

const URISchemeString = S.String.pipe(
  S.pattern(/^[A-Za-z][A-Za-z0-9+.-]*$/, {
    identifier: "URISchemeString",
    message: () => "Scheme must match RFC 3986: ALPHA *( ALPHA / DIGIT / '+' / '-' / '.' ).",
  })
);

// WHATWG constrains ports to a 16-bit unsigned integer (0-65535). RFC 3986 only says *DIGIT
// but in practice higher values are unusable and should be rejected.
const URIPort = S.NonNegativeInt.pipe(
  S.lessThanOrEqualTo(65535, {
    identifier: "URIPort",
    message: () => "Port must be an integer between 0 and 65535.",
  })
);

const URIPath = S.String.annotations({ identifier: "URIPath" });

const URIQuery = S.String.annotations({ identifier: "URIQuery" });

const URIReference = S.Literal("same-document", "relative", "absolute", "uri").annotations({
  identifier: "URIReference",
});

export class URIComponents extends S.Struct({
  scheme: S.optional(URISchemeString),
  userinfo: S.optional(S.String),
  host: S.optional(S.String),
  port: S.optional(URIPort),
  // RFC 3986: path is never undefined (but it can be empty).
  path: URIPath,
  query: S.optional(URIQuery),
  fragment: S.optional(S.String),
  reference: S.optional(URIReference),
})
  .pipe(S.mutable)
  .annotations(
    $I.annotations("URIComponents.Type", {
      description: "URI components",
    })
  ) {}

export declare namespace URIComponents {
  export type Type = typeof URIComponents.Type;
}

export class URIOptions extends S.Class<URIOptions>($I`URIOptions`)({
  scheme: S.optional(S.String),
  reference: S.optional(S.String),
  tolerant: S.optional(S.Boolean),
  absolutePath: S.optional(S.Boolean),
  iri: S.optional(S.Boolean),
  unicodeSupport: S.optional(S.Boolean),
  domainHost: S.optional(S.Boolean),
}) {}

export interface URISchemeHandler<
  Components extends URIComponents.Type = URIComponents.Type,
  Options extends URIOptions = URIOptions,
  ParentComponents extends URIComponents.Type = URIComponents.Type,
> {
  scheme: string;

  parse(
    components: ParentComponents,
    options: Options,
    ast?: AST.AST
  ): Either.Either<Components, ParseResult.ParseIssue>;

  serialize(
    components: Components,
    options: Options,
    ast?: AST.AST
  ): Either.Either<ParentComponents, ParseResult.ParseIssue>;

  unicodeSupport?: undefined | boolean;
  domainHost?: undefined | boolean;
  absolutePath?: undefined | boolean;
}

export const SCHEMES: { [scheme: string]: URISchemeHandler } = {};

const DEFAULT_ISSUE_AST = S.String.ast;

const typeIssue = (ast: AST.AST | undefined, actual: unknown, message: string): ParseResult.ParseIssue =>
  new ParseResult.Type(ast ?? DEFAULT_ISSUE_AST, actual, message);

const effectFromEitherIssue = <A>(
  either: Either.Either<A, ParseResult.ParseIssue>
): Effect.Effect<A, ParseResult.ParseIssue> =>
  Either.isLeft(either) ? Effect.fail(either.left) : Effect.succeed(either.right);

const effectFromEitherParseError = <A>(
  either: Either.Either<A, ParseResult.ParseIssue>
): Effect.Effect<A, ParseResult.ParseError> =>
  Either.isLeft(either) ? Effect.fail(ParseResult.parseError(either.left)) : Effect.succeed(either.right);

export function pctEncChar(chr: string): string {
  const c = chr.charCodeAt(0);
  let e: string;

  if (c < 16) e = `%0${c.toString(16).toUpperCase()}`;
  else if (c < 128) e = `%${c.toString(16).toUpperCase()}`;
  else if (c < 2048)
    e = `%${((c >> 6) | 192).toString(16).toUpperCase()}%${((c & 63) | 128).toString(16).toUpperCase()}`;
  else
    e = `%${((c >> 12) | 224).toString(16).toUpperCase()}%${(((c >> 6) & 63) | 128).toString(16).toUpperCase()}%${((c & 63) | 128).toString(16).toUpperCase()}`;

  return e;
}

export function pctDecChars(str: string): string {
  let newStr = "";
  let i = 0;
  const il = Str.length(str);

  while (i < il) {
    const c = Number.parseInt(Str.slice(i + 1, i + 3)(str), 16);

    if (c < 128) {
      newStr += String.fromCharCode(c);
      i += 3;
    } else if (c >= 194 && c < 224) {
      if (il - i >= 6) {
        const c2 = Number.parseInt(Str.slice(i + 4, i + 6)(str), 16);
        newStr += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
      } else {
        newStr += Str.slice(i, i + 6)(str);
      }
      i += 6;
    } else if (c >= 224) {
      if (il - i >= 9) {
        const c2 = Number.parseInt(Str.slice(i + 4, i + 6)(str), 16);
        const c3 = Number.parseInt(Str.slice(i + 7, i + 9)(str), 16);
        newStr += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
      } else {
        newStr += Str.slice(i, i + 9)(str);
      }
      i += 9;
    } else {
      newStr += Str.slice(i, i + 3)(str);
      i += 3;
    }
  }

  return newStr;
}

function _normalizeComponentEncoding(components: URIComponents.Type, protocol: URIRegExps) {
  function decodeUnreserved(str: string): string {
    const decStr = pctDecChars(str);
    return !decStr.match(protocol.UNRESERVED) ? str : decStr;
  }

  if (components.scheme)
    components.scheme = String(components.scheme)
      .replace(protocol.PCT_ENCODED, decodeUnreserved)
      .toLowerCase()
      .replace(protocol.NOT_SCHEME, "");
  if (components.userinfo !== undefined)
    components.userinfo = String(components.userinfo)
      .replace(protocol.PCT_ENCODED, decodeUnreserved)
      .replace(protocol.NOT_USERINFO, pctEncChar)
      .replace(protocol.PCT_ENCODED, Str.toUpperCase);
  if (components.host !== undefined)
    components.host = String(components.host)
      .replace(protocol.PCT_ENCODED, decodeUnreserved)
      .toLowerCase()
      .replace(protocol.NOT_HOST, pctEncChar)
      .replace(protocol.PCT_ENCODED, Str.toUpperCase);
  if (components.path !== undefined)
    components.path = String(components.path)
      .replace(protocol.PCT_ENCODED, decodeUnreserved)
      .replace(components.scheme ? protocol.NOT_PATH : protocol.NOT_PATH_NOSCHEME, pctEncChar)
      .replace(protocol.PCT_ENCODED, Str.toUpperCase);
  if (components.query !== undefined)
    components.query = String(components.query)
      .replace(protocol.PCT_ENCODED, decodeUnreserved)
      .replace(protocol.NOT_QUERY, pctEncChar)
      .replace(protocol.PCT_ENCODED, Str.toUpperCase);
  if (components.fragment !== undefined)
    components.fragment = String(components.fragment)
      .replace(protocol.PCT_ENCODED, decodeUnreserved)
      .replace(protocol.NOT_FRAGMENT, pctEncChar)
      .replace(protocol.PCT_ENCODED, Str.toUpperCase);

  return components;
}

function _stripLeadingZeros(str: string): string {
  return Str.replace(/^0*(.*)/, "$1")(str) || "0";
}

function _normalizeIPv4(host: string, protocol: URIRegExps): string {
  return pipe(
    host,
    Str.match(protocol.IPV4ADDRESS),
    O.flatMap((matches) => pipe(A.get(1)(matches), O.filter(Str.isNonEmpty))),
    O.match({
      onNone: () => host,
      onSome: (address) => pipe(Str.split(address, "."), A.map(_stripLeadingZeros), A.join(".")),
    })
  );
}

function _normalizeIPv6(host: string, protocol: URIRegExps): string {
  const matchesOpt = Str.match(protocol.IPV6ADDRESS)(host);
  if (O.isNone(matchesOpt)) return host;
  const matches = matchesOpt.value;
  const address = pipe(A.get(1)(matches), O.getOrUndefined);
  const zone = pipe(A.get(2)(matches), O.getOrUndefined);

  if (address) {
    const [last, first] = pipe(address, Str.toLowerCase, Str.split("::"), A.reverse);
    const firstFields = first ? pipe(first, Str.split(":"), A.map(_stripLeadingZeros)) : [];
    const lastFields = pipe(last, Str.split(":"), A.map(_stripLeadingZeros));
    const isLastFieldIPv4Address = A.get(A.length(lastFields) - 1)(lastFields).pipe(
      O.flatMap(O.liftPredicate((s: string) => protocol.IPV4ADDRESS.test(s))),
      O.isSome
    );
    const fieldCount = isLastFieldIPv4Address ? 7 : 8;
    const lastFieldsStart = A.length(lastFields) - fieldCount;
    const fields = Array<string>(fieldCount);

    for (let x = 0; x < fieldCount; ++x) {
      fields[x] = firstFields[x] || lastFields[lastFieldsStart + x] || "";
    }

    if (isLastFieldIPv4Address) {
      fields[fieldCount - 1] = _normalizeIPv4(fields[fieldCount - 1]!, protocol);
    }

    const allZeroFields = A.reduce(
      fields,
      A.empty<{ readonly index: number; length: number }>(),
      (acc, field, index) => {
        if (!field || field === "0") {
          const lastLongest = pipe(A.last(acc), O.getOrUndefined);
          if (lastLongest && lastLongest.index + lastLongest.length === index) {
            lastLongest.length++;
          } else {
            acc.push({ index, length: 1 });
          }
        }
        return acc;
      }
    );

    const longestZeroFields = pipe(
      allZeroFields,
      A.sort(
        Order.mapInput(
          Order.reverse(Order.number),
          (f: { readonly index: number; readonly length: number }) => f.length
        )
      ),
      A.head,
      O.getOrUndefined
    );

    let newHost: string;
    if (longestZeroFields && longestZeroFields.length > 1) {
      const newFirst = A.take(fields, longestZeroFields.index);
      const newLast = A.drop(fields, longestZeroFields.index + longestZeroFields.length);
      newHost = `${A.join(newFirst, ":")}::${A.join(newLast, ":")}`;
    } else {
      newHost = A.join(fields, ":");
    }

    if (zone) {
      newHost += `%${zone}`;
    }

    return newHost;
  }
  return host;
}

const URI_PARSE =
  /^(?:([^:/?#]+):)?(?:\/\/((?:([^/?#@]*)@)?(\[[^/?#\]]+]|[^/?#:]*)(?::(\d*))?))?([^?#]*)(?:\?([^#]*))?(?:#([\s\S]*))?/i;
const NO_MATCH_IS_UNDEFINED = "".match(/(){0}/)?.[1] === undefined;

const parseEither = (
  uriString: string,
  options: URIOptions = {},
  ast?: AST.AST
): Either.Either<URIComponents.Type, ParseResult.ParseIssue> => {
  const components: URIComponents.Type = { path: "" };
  const protocol = options.iri !== false ? IRI_PROTOCOL : URI_PROTOCOL;
  const issue = (actual: unknown, message: string) => typeIssue(ast, actual, message);

  let input = uriString;
  if (options.reference === "suffix") input = `${options.scheme ? `${options.scheme}:` : ""}//${input}`;

  const matchesOpt = Str.match(URI_PARSE)(input);
  if (O.isNone(matchesOpt)) {
    return Either.left(issue(uriString, "URI can not be parsed."));
  }

  const matches = matchesOpt.value;
  if (NO_MATCH_IS_UNDEFINED) {
    components.scheme = pipe(A.get(1)(matches), O.getOrUndefined);
    components.userinfo = pipe(A.get(3)(matches), O.getOrUndefined);
    components.host = pipe(A.get(4)(matches), O.getOrUndefined);
    const portRaw = pipe(A.get(5)(matches), O.getOrUndefined);
    if (portRaw !== undefined && portRaw.length > 0) {
      const n = Number.parseInt(portRaw, 10);
      if (!Number.isSafeInteger(n) || n < 0 || n > 65535) {
        return Either.left(issue(portRaw, "Port must be an integer between 0 and 65535."));
      }
      components.port = n;
    }
    components.path = pipe(
      A.get(6)(matches),
      O.getOrElse(() => Str.empty)
    );
    components.query = pipe(A.get(7)(matches), O.getOrUndefined);
    components.fragment = pipe(A.get(8)(matches), O.getOrUndefined);
  } else {
    components.scheme = matches[1] || undefined;
    components.userinfo = Str.includes("@")(input) ? matches[3] : undefined;
    components.host = Str.includes("//")(input) ? matches[4] : undefined;
    const portRaw = matches[5] || undefined;
    if (portRaw !== undefined && portRaw.length > 0) {
      const n = Number.parseInt(portRaw, 10);
      if (!Number.isSafeInteger(n) || n < 0 || n > 65535) {
        return Either.left(issue(portRaw, "Port must be an integer between 0 and 65535."));
      }
      components.port = n;
    }
    components.path = matches[6] || "";
    components.query = Str.includes("?")(input) ? matches[7] : undefined;
    components.fragment = Str.includes("#")(input) ? matches[8] : undefined;
  }

  if (components.host) {
    components.host = _normalizeIPv6(_normalizeIPv4(components.host, protocol), protocol);
  }

  if (
    components.scheme === undefined &&
    components.userinfo === undefined &&
    components.host === undefined &&
    components.port === undefined &&
    !components.path &&
    components.query === undefined
  ) {
    components.reference = "same-document";
  } else if (components.scheme === undefined) {
    components.reference = "relative";
  } else if (components.fragment === undefined) {
    components.reference = "absolute";
  } else {
    components.reference = "uri";
  }

  if (options.reference && options.reference !== "suffix" && options.reference !== components.reference) {
    return Either.left(issue(uriString, `URI is not a ${options.reference} reference.`));
  }

  if (components.scheme !== undefined && !/^[A-Za-z][A-Za-z0-9+.-]*$/.test(components.scheme)) {
    return Either.left(
      issue(components.scheme, "Scheme must match RFC 3986: ALPHA *( ALPHA / DIGIT / '+' / '-' / '.' ).")
    );
  }

  const schemeHandler = SCHEMES[pipe(options.scheme || components.scheme || "", Str.toLowerCase)];

  if (!options.unicodeSupport && (!schemeHandler || !schemeHandler.unicodeSupport)) {
    if (components.host && (options.domainHost || schemeHandler?.domainHost)) {
      const r = idna.toASCIIResult(components.host.replace(protocol.PCT_ENCODED, pctDecChars).toLowerCase());
      if (Either.isLeft(r)) {
        return Either.left(
          issue(
            uriString,
            `Host's domain name can not be converted to ASCII via idna: ${ParseResult.TreeFormatter.formatIssueSync(r.left)}`
          )
        );
      }
      components.host = r.right;
    }
    _normalizeComponentEncoding(components, URI_PROTOCOL);
  } else {
    _normalizeComponentEncoding(components, protocol);
  }

  if (schemeHandler?.parse) {
    return schemeHandler.parse(components, options, ast);
  }

  return Either.right(components);
};

export function parse(
  uriString: string,
  options?: URIOptions
): Effect.Effect<URIComponents.Type, ParseResult.ParseError> {
  return effectFromEitherParseError(parseEither(uriString, options));
}

function _recomposeAuthority(components: URIComponents.Type, options: URIOptions): string | undefined {
  const protocol = options.iri !== false ? IRI_PROTOCOL : URI_PROTOCOL;
  const uriTokens = A.empty<string>();

  if (components.userinfo !== undefined) {
    uriTokens.push(components.userinfo);
    uriTokens.push("@");
  }

  if (components.host !== undefined) {
    uriTokens.push(
      _normalizeIPv6(_normalizeIPv4(String(components.host), protocol), protocol).replace(
        protocol.IPV6ADDRESS,
        (_, $1, $2) => `[${$1}${$2 ? `%25${$2}` : ""}]`
      )
    );
  }

  if (components.port !== undefined) {
    uriTokens.push(":");
    uriTokens.push(String(components.port));
  }

  return A.isNonEmptyReadonlyArray(uriTokens) ? A.join(uriTokens, "") : undefined;
}

const RDS1 = /^\.\.?\//;
const RDS2 = /^\/\.(\/|$)/;
const RDS3 = /^\/\.\.(\/|$)/;
const RDS5 = /^\/?[\s\S]*?(?=\/|$)/;

export function removeDotSegments(input: string): string {
  const output: Array<string> = [];
  let rest = input;

  while (Str.isNonEmpty(rest)) {
    if (O.isSome(Str.match(RDS1)(rest))) {
      rest = Str.replace(RDS1, "")(rest);
    } else if (O.isSome(Str.match(RDS2)(rest))) {
      rest = Str.replace(RDS2, "/")(rest);
    } else if (O.isSome(Str.match(RDS3)(rest))) {
      rest = Str.replace(RDS3, "/")(rest);
      output.pop();
    } else if (rest === "." || rest === "..") {
      rest = "";
    } else {
      const im = Str.match(RDS5)(rest);
      if (O.isNone(im)) break;
      const s = im.value[0] ?? "";
      rest = Str.slice(Str.length(s))(rest);
      output.push(s);
    }
  }

  return A.join(output, "");
}

const serializeEither = (
  components: URIComponents.Type,
  options: URIOptions = {},
  ast?: AST.AST
): Either.Either<string, ParseResult.ParseIssue> => {
  const protocol = options.iri ? IRI_PROTOCOL : URI_PROTOCOL;
  const issue = (actual: unknown, message: string) => typeIssue(ast, actual, message);
  const uriTokens = A.empty<string>();

  const schemeHandler = SCHEMES[pipe(options.scheme || components.scheme || "", Str.toLowerCase)];

  let mutable: URIComponents.Type = { ...components };

  if (schemeHandler?.serialize) {
    const r = schemeHandler.serialize(mutable, options, ast);
    if (Either.isLeft(r)) return Either.left(r.left);
    mutable = r.right;
  }

  if (mutable.host) {
    if (protocol.IPV6ADDRESS.test(mutable.host)) {
      // TODO: normalize IPv6 address as per RFC 5952
    } else if (options.domainHost || schemeHandler?.domainHost) {
      const r = !options.iri
        ? idna.toASCIIResult(mutable.host.replace(protocol.PCT_ENCODED, pctDecChars).toLowerCase())
        : idna.toUnicodeResult(mutable.host);
      if (Either.isLeft(r)) {
        return Either.left(
          issue(
            mutable.host,
            `Host's domain name can not be converted to ${!options.iri ? "ASCII" : "Unicode"} via idna: ${ParseResult.TreeFormatter.formatIssueSync(
              r.left
            )}`
          )
        );
      }
      mutable.host = r.right;
    }
  }

  _normalizeComponentEncoding(mutable, protocol);

  if (mutable.scheme !== undefined && !/^[A-Za-z][A-Za-z0-9+.-]*$/.test(mutable.scheme)) {
    return Either.left(
      issue(mutable.scheme, "Scheme must match RFC 3986: ALPHA *( ALPHA / DIGIT / '+' / '-' / '.' ).")
    );
  }

  if (mutable.port !== undefined) {
    if (!Number.isSafeInteger(mutable.port) || mutable.port < 0 || mutable.port > 65535) {
      return Either.left(issue(mutable.port, "Port must be an integer between 0 and 65535."));
    }
  }

  if (options.reference !== "suffix" && mutable.scheme) {
    uriTokens.push(mutable.scheme);
    uriTokens.push(":");
  }

  const authority = _recomposeAuthority(mutable, options);
  if (authority !== undefined) {
    if (options.reference !== "suffix") {
      uriTokens.push("//");
    }

    uriTokens.push(authority);

    if (mutable.path && mutable.path.charAt(0) !== "/") {
      uriTokens.push("/");
    }
  }

  {
    let s = mutable.path;

    if (!options.absolutePath && (!schemeHandler || !schemeHandler.absolutePath)) {
      s = removeDotSegments(s);
    }

    if (authority === undefined) {
      s = Str.replace(/^\/\//, "/%2F")(s);
    }

    uriTokens.push(s);
  }

  if (mutable.query !== undefined) {
    uriTokens.push("?");
    uriTokens.push(mutable.query);
  }

  if (mutable.fragment !== undefined) {
    uriTokens.push("#");
    uriTokens.push(mutable.fragment);
  }

  return Either.right(A.join(uriTokens, ""));
};

export function serialize(
  components: URIComponents.Type,
  options?: URIOptions
): Effect.Effect<string, ParseResult.ParseError> {
  return effectFromEitherParseError(serializeEither(components, options));
}

const resolveComponentsEither = (
  base: URIComponents.Type,
  relative: URIComponents.Type,
  options: URIOptions = {},
  skipNormalization?: undefined | boolean
): Either.Either<URIComponents.Type, ParseResult.ParseIssue> => {
  const target: URIComponents.Type = { path: "" };

  if (!skipNormalization) {
    const baseNormalized = pipe(
      serializeEither(base, options),
      Either.flatMap((s) => parseEither(s, options))
    );
    if (Either.isLeft(baseNormalized)) return baseNormalized;
    base = baseNormalized.right;

    const relativeNormalized = pipe(
      serializeEither(relative, options),
      Either.flatMap((s) => parseEither(s, options))
    );
    if (Either.isLeft(relativeNormalized)) return relativeNormalized;
    relative = relativeNormalized.right;
  }

  if (!options.tolerant && relative.scheme) {
    target.scheme = relative.scheme;
    target.userinfo = relative.userinfo;
    target.host = relative.host;
    target.port = relative.port;
    target.path = removeDotSegments(relative.path);
    target.query = relative.query;
  } else {
    if (relative.userinfo !== undefined || relative.host !== undefined || relative.port !== undefined) {
      target.userinfo = relative.userinfo;
      target.host = relative.host;
      target.port = relative.port;
      target.path = removeDotSegments(relative.path);
      target.query = relative.query;
    } else {
      if (!relative.path) {
        target.path = base.path;
        if (relative.query !== undefined) {
          target.query = relative.query;
        } else {
          target.query = base.query;
        }
      } else {
        if (relative.path.charAt(0) === "/") {
          target.path = removeDotSegments(relative.path);
        } else {
          if ((base.userinfo !== undefined || base.host !== undefined || base.port !== undefined) && !base.path) {
            target.path = `/${relative.path}`;
          } else if (!base.path) {
            target.path = relative.path;
          } else {
            target.path = base.path.slice(0, base.path.lastIndexOf("/") + 1) + relative.path;
          }
          target.path = removeDotSegments(target.path);
        }
        target.query = relative.query;
      }
      target.userinfo = base.userinfo;
      target.host = base.host;
      target.port = base.port;
    }
    target.scheme = base.scheme;
  }

  target.fragment = relative.fragment;

  return Either.right(target);
};

export function resolveComponents(
  base: URIComponents.Type,
  relative: URIComponents.Type,
  options?: URIOptions,
  skipNormalization?: boolean
): Effect.Effect<URIComponents.Type, ParseResult.ParseError> {
  return effectFromEitherParseError(resolveComponentsEither(base, relative, options, skipNormalization));
}

export function resolve(
  baseURI: string,
  relativeURI: string,
  options?: URIOptions
): Effect.Effect<string, ParseResult.ParseError> {
  const schemelessOptions: URIOptions = { scheme: "null" as const, ...options };

  return effectFromEitherParseError(
    pipe(
      parseEither(baseURI, schemelessOptions),
      Either.flatMap((baseComponents) =>
        pipe(
          parseEither(relativeURI, schemelessOptions),
          Either.flatMap((relativeComponents) =>
            pipe(
              resolveComponentsEither(baseComponents, relativeComponents, schemelessOptions, true),
              Either.flatMap((resolved) => serializeEither(resolved, schemelessOptions))
            )
          )
        )
      )
    )
  );
}

export function normalize(uri: string, options?: URIOptions): Effect.Effect<string, ParseResult.ParseError>;
export function normalize(
  uri: URIComponents.Type,
  options?: URIOptions
): Effect.Effect<URIComponents.Type, ParseResult.ParseError>;
export function normalize(
  uri: string | URIComponents.Type,
  options?: URIOptions
): Effect.Effect<string | URIComponents.Type, ParseResult.ParseError> {
  if (P.isString(uri)) {
    return effectFromEitherParseError(
      pipe(
        parseEither(uri, options),
        Either.flatMap((components) => serializeEither(components, options))
      )
    );
  }

  return effectFromEitherParseError(
    pipe(
      serializeEither(uri, options),
      Either.flatMap((s) => parseEither(s, options))
    )
  );
}

export function equal(uriA: string, uriB: string, options?: URIOptions): Effect.Effect<boolean, ParseResult.ParseError>;
export function equal(
  uriA: URIComponents.Type,
  uriB: URIComponents.Type,
  options?: URIOptions
): Effect.Effect<boolean, ParseResult.ParseError>;
export function equal(
  uriA: string | URIComponents.Type,
  uriB: string | URIComponents.Type,
  options?: URIOptions
): Effect.Effect<boolean, ParseResult.ParseError> {
  const serializedA = P.isString(uriA)
    ? pipe(
        parseEither(uriA, options),
        Either.flatMap((components) => serializeEither(components, options))
      )
    : serializeEither(uriA, options);

  const serializedB = P.isString(uriB)
    ? pipe(
        parseEither(uriB, options),
        Either.flatMap((components) => serializeEither(components, options))
      )
    : serializeEither(uriB, options);

  return effectFromEitherParseError(
    pipe(
      serializedA,
      Either.flatMap((a) =>
        pipe(
          serializedB,
          Either.map((b) => a === b)
        )
      )
    )
  );
}

export function escapeComponent(str: string, options?: URIOptions): string {
  return str?.toString().replace(!options || !options.iri ? URI_PROTOCOL.ESCAPE : IRI_PROTOCOL.ESCAPE, pctEncChar);
}

export function unescapeComponent(str: string, options?: URIOptions): string {
  return str
    ?.toString()
    .replace(!options || !options.iri ? URI_PROTOCOL.PCT_ENCODED : IRI_PROTOCOL.PCT_ENCODED, pctDecChars);
}

const URI_SCHEMA_OPTIONS: URIOptions = { iri: false, unicodeSupport: false };
const IRI_SCHEMA_OPTIONS: URIOptions = { iri: true, unicodeSupport: true };

const normalizeStringEither = (
  uriString: string,
  options: URIOptions,
  ast?: AST.AST
): Either.Either<string, ParseResult.ParseIssue> =>
  pipe(
    parseEither(uriString, options, ast),
    Either.flatMap((components) => serializeEither(components, options, ast))
  );

/**
 * Canonical, normalized URI string (e.g. result of `normalize(...)` under the URI schema defaults).
 *
 * This is a brand used to preserve the "already normalized" invariant in the type system while
 * remaining JSON-friendly (runtime representation is still a `string`).
 */
export class URIString extends S.String.pipe(S.brand("URIString")).annotations(
  $I.annotations("URIString", {
    description: "Canonical, normalized URI string",
  })
) {}

export declare namespace URIString {
  export type Type = typeof URIString.Type;
  export type Encoded = typeof URIString.Encoded;
}

/**
 * Canonical, normalized IRI string (e.g. result of `normalize(...)` under the IRI schema defaults).
 */
export class IRIString extends S.String.pipe(S.brand("IRIString")).annotations(
  $I.annotations("IRIString", {
    description: "Canonical, normalized IRI string",
  })
) {}

export declare namespace IRIString {
  export type Type = typeof IRIString.Type;
  export type Encoded = typeof IRIString.Encoded;
}

export class URI extends S.Class<URI>($I`URI`)(
  { value: URIString },
  $I.annotations("URI", {
    description: "URI value model (canonical normalized serialization stored in `.value`)",
  })
) {
  static parse(uriString: string, options?: URIOptions) {
    return parse(uriString, options);
  }

  static serialize(components: URIComponents.Type, options?: URIOptions) {
    return serialize(components, options);
  }

  static resolveComponents(
    base: URIComponents.Type,
    relative: URIComponents.Type,
    options?: URIOptions,
    skipNormalization?: boolean
  ) {
    return resolveComponents(base, relative, options, skipNormalization);
  }

  static resolve(baseURI: string, relativeURI: string, options?: URIOptions) {
    return resolve(baseURI, relativeURI, options);
  }

  static normalize(uri: string, options?: URIOptions): Effect.Effect<string, ParseResult.ParseError>;
  static normalize(
    uri: URIComponents.Type,
    options?: URIOptions
  ): Effect.Effect<URIComponents.Type, ParseResult.ParseError>;
  static normalize(uri: string | URIComponents.Type, options?: URIOptions) {
    return P.isString(uri) ? normalize(uri, options) : normalize(uri, options);
  }

  static equal(uriA: string, uriB: string, options?: URIOptions): Effect.Effect<boolean, ParseResult.ParseError>;
  static equal(
    uriA: URIComponents.Type,
    uriB: URIComponents.Type,
    options?: URIOptions
  ): Effect.Effect<boolean, ParseResult.ParseError>;
  static equal(uriA: string | URIComponents.Type, uriB: string | URIComponents.Type, options?: URIOptions) {
    if (P.isString(uriA)) {
      if (P.isString(uriB)) {
        return equal(uriA, uriB, options);
      }
      return Effect.zipWith(
        Effect.flatMap(parse(uriA, options), (components) => serialize(components, options)),
        serialize(uriB, options),
        (a, b) => a === b
      );
    }

    if (P.isString(uriB)) {
      return Effect.zipWith(
        serialize(uriA, options),
        Effect.flatMap(parse(uriB, options), (components) => serialize(components, options)),
        (a, b) => a === b
      );
    }

    return equal(uriA, uriB, options);
  }

  static escapeComponent(str: string, options?: URIOptions) {
    return escapeComponent(str, options);
  }

  static unescapeComponent(str: string, options?: URIOptions) {
    return unescapeComponent(str, options);
  }

  override toString(): string {
    return this.value;
  }
}

export class IRI extends S.Class<IRI>($I`IRI`)(
  { value: IRIString },
  $I.annotations("IRI", {
    description: "IRI value model (canonical normalized serialization stored in `.value`)",
  })
) {
  override toString(): string {
    return this.value;
  }
}

export const URIStringFromString = S.transformOrFail(S.String, URIString, {
  strict: true,
  decode: (s, _options, ast) => pipe(normalizeStringEither(s, URI_SCHEMA_OPTIONS, ast), effectFromEitherIssue),
  encode: (uri) => Effect.succeed(uri),
}).annotations(
  $I.annotations("URIStringFromString", {
    description: "Strict transform from string into canonical normalized URI string",
  })
);

export const IRIStringFromString = S.transformOrFail(S.String, IRIString, {
  strict: true,
  decode: (s, _options, ast) => pipe(normalizeStringEither(s, IRI_SCHEMA_OPTIONS, ast), effectFromEitherIssue),
  encode: (iri) => Effect.succeed(iri),
}).annotations(
  $I.annotations("IRIStringFromString", {
    description: "Strict transform from string into canonical normalized IRI string",
  })
);

export const URIFromString = S.transformOrFail(S.String, URI, {
  strict: true,
  decode: (s, _options, ast) =>
    pipe(
      normalizeStringEither(s, URI_SCHEMA_OPTIONS, ast),
      effectFromEitherIssue,
      Effect.map((value) => ({ value }))
    ),
  encode: (uri) => Effect.succeed(uri.value),
});

export const IRIFromString = S.transformOrFail(S.String, IRI, {
  strict: true,
  decode: (s, _options, ast) =>
    pipe(
      normalizeStringEither(s, IRI_SCHEMA_OPTIONS, ast),
      effectFromEitherIssue,
      Effect.map((value) => ({ value }))
    ),
  encode: (iri) => Effect.succeed(iri.value),
});
