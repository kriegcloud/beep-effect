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

import { invariant } from "@beep/invariant";
import idna from "@beep/semantic-web/idna";
import * as A from "effect/Array";
import * as F from "effect/Function";
import { pipe } from "effect/Function";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as ParseResult from "effect/ParseResult";
import * as P from "effect/Predicate";
import * as Str from "effect/String";
import type { URIRegExps } from "./model.ts";
import IRI_PROTOCOL from "./regex-iri";
import URI_PROTOCOL from "./regex-uri";
// import * as S from "effect/Schema";
// import { $SemanticWebId } from "@beep/identity/packages";
// import { BS } from "@beep/schema";
// const $I = $SemanticWebId.create("uri/uri");
// export class URIComponents
export interface URIComponents {
  scheme?: undefined | string;
  userinfo?: undefined | string;
  host?: undefined | string;
  port?: undefined | number | string;
  path?: undefined | string;
  query?: undefined | string;
  fragment?: undefined | string;
  reference?: undefined | string;
  error?: undefined | string;
}

export interface URIOptions {
  scheme?: undefined | string;
  reference?: undefined | string;
  tolerant?: undefined | boolean;
  absolutePath?: undefined | boolean;
  iri?: undefined | boolean;
  unicodeSupport?: undefined | boolean;
  domainHost?: undefined | boolean;
}

export interface URISchemeHandler<
  Components extends URIComponents = URIComponents,
  Options extends URIOptions = URIOptions,
  ParentComponents extends URIComponents = URIComponents,
> {
  scheme: string;

  parse(components: ParentComponents, options: Options): Components;

  serialize(components: Components, options: Options): ParentComponents;

  unicodeSupport?: undefined | boolean;
  domainHost?: undefined | boolean;
  absolutePath?: undefined | boolean;
}

export const SCHEMES: { [scheme: string]: URISchemeHandler } = {};

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

function _normalizeComponentEncoding(components: URIComponents, protocol: URIRegExps) {
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

    const allZeroFields = A.reduce(fields, [] as Array<{ index: number; length: number }>, (acc, field, index) => {
      if (!field || field === "0") {
        const lastLongest = pipe(A.last(acc), O.getOrUndefined);
        if (lastLongest && lastLongest.index + lastLongest.length === index) {
          lastLongest.length++;
        } else {
          acc.push({ index, length: 1 });
        }
      }
      return acc;
    });

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

export const parse: {
  (options?: URIOptions): (uriString: string) => URIComponents;
  (uriString: string, options?: URIOptions): URIComponents;
} = F.dual(
  (args: IArguments) => P.isString(args[0]),
  (uriString: string, options: URIOptions = {}): URIComponents => {
    const components: URIComponents = {};
    const protocol = options.iri !== false ? IRI_PROTOCOL : URI_PROTOCOL;

    if (options.reference === "suffix") uriString = `${options.scheme ? `${options.scheme}:` : ""}//${uriString}`;

    const matchesOpt = Str.match(URI_PARSE)(uriString);

    if (O.isSome(matchesOpt)) {
      const matches = matchesOpt.value;
      if (NO_MATCH_IS_UNDEFINED) {
        components.scheme = pipe(A.get(1)(matches), O.getOrUndefined);
        components.userinfo = pipe(A.get(3)(matches), O.getOrUndefined);
        components.host = pipe(A.get(4)(matches), O.getOrUndefined);
        pipe(
          A.get(5)(matches),
          O.map((port) => {
            components.port = Number.parseInt(port, 10);
          })
        );
        components.path = pipe(
          A.get(6)(matches),
          O.getOrElse(() => Str.empty)
        );
        components.query = pipe(A.get(7)(matches), O.getOrUndefined);
        components.fragment = pipe(A.get(8)(matches), O.getOrUndefined);

        if (Number.isNaN(components.port)) {
          components.port = matches[5];
        }
      } else {
        components.scheme = matches[1] || undefined;
        components.userinfo = Str.includes("@")(uriString) ? matches[3] : undefined;
        components.host = Str.includes("//")(uriString) ? matches[4] : undefined;
        pipe(
          A.get(5)(matches),
          O.map((port) => {
            components.port = Number.parseInt(port, 10);
          })
        );
        components.path = matches[6] || "";
        components.query = Str.includes("?")(uriString) ? matches[7] : undefined;
        components.fragment = Str.includes("#")(uriString) ? matches[8] : undefined;

        if (Number.isNaN(components.port)) {
          components.port = Str.match(/\/\/[\s\S]*:(?:\/|\?|#|$)/)(uriString).pipe(O.isSome) ? matches[4] : undefined;
        }
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
        components.error = components.error || `URI is not a ${options.reference} reference.`;
      }

      const schemeHandler = SCHEMES[pipe(options.scheme || components.scheme || "", Str.toLowerCase)];

      if (!options.unicodeSupport && (!schemeHandler || !schemeHandler.unicodeSupport)) {
        if (components.host && (options.domainHost || schemeHandler?.domainHost)) {
          const r = idna.toASCIIResult(components.host.replace(protocol.PCT_ENCODED, pctDecChars).toLowerCase());
          if (r._tag === "Left") {
            components.error =
              components.error ||
              `Host's domain name can not be converted to ASCII via idna: ${ParseResult.TreeFormatter.formatIssueSync(
                r.left
              )}`;
          } else {
            components.host = r.right;
          }
        }
        _normalizeComponentEncoding(components, URI_PROTOCOL);
      } else {
        _normalizeComponentEncoding(components, protocol);
      }

      if (schemeHandler?.parse) {
        schemeHandler.parse(components, options);
      }
    } else {
      components.error = components.error || "URI can not be parsed.";
    }

    return components;
  }
);

function _recomposeAuthority(components: URIComponents, options: URIOptions): string | undefined {
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

  if (P.isNumber(components.port) || P.isString(components.port)) {
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

  while (Str.isNonEmpty(input)) {
    if (O.isSome(Str.match(RDS1)(input))) {
      input = Str.replace(RDS1, "")(input);
    } else if (O.isSome(Str.match(RDS2)(input))) {
      input = Str.replace(RDS2, "/")(input);
    } else if (O.isSome(Str.match(RDS3)(input))) {
      input = Str.replace(RDS3, "/")(input);
      output.pop();
    } else if (input === "." || input === "..") {
      input = "";
    } else {
      const im = Str.match(RDS5)(input);
      invariant(O.isSome(im), "Unexpected dot segment condition", {
        file: "@beep/semantic-web/uri",
        line: 0,
        args: [input],
      });
      const s = im.value[0];
      input = Str.slice(Str.length(s))(input);
      output.push(s);
    }
  }

  return A.join(output, "");
}

export function serialize(components: URIComponents, options: URIOptions = {}): string {
  const protocol = options.iri ? IRI_PROTOCOL : URI_PROTOCOL;
  const uriTokens: Array<string> = [];

  const schemeHandler = SCHEMES[pipe(options.scheme || components.scheme || "", Str.toLowerCase)];

  if (schemeHandler?.serialize) schemeHandler.serialize(components, options);

  if (components.host) {
    if (protocol.IPV6ADDRESS.test(components.host)) {
      //TODO: normalize IPv6 address as per RFC 5952
    } else if (options.domainHost || schemeHandler?.domainHost) {
      const r = !options.iri
        ? idna.toASCIIResult(components.host.replace(protocol.PCT_ENCODED, pctDecChars).toLowerCase())
        : idna.toUnicodeResult(components.host);
      if (r._tag === "Left") {
        components.error =
          components.error ||
          `Host's domain name can not be converted to ${!options.iri ? "ASCII" : "Unicode"} via idna: ${ParseResult.TreeFormatter.formatIssueSync(
            r.left
          )}`;
      } else {
        components.host = r.right;
      }
    }
  }

  _normalizeComponentEncoding(components, protocol);

  if (options.reference !== "suffix" && components.scheme) {
    uriTokens.push(components.scheme);
    uriTokens.push(":");
  }

  const authority = _recomposeAuthority(components, options);
  if (authority !== undefined) {
    if (options.reference !== "suffix") {
      uriTokens.push("//");
    }

    uriTokens.push(authority);

    if (components.path && components.path.charAt(0) !== "/") {
      uriTokens.push("/");
    }
  }

  if (components.path !== undefined) {
    let s = components.path;

    if (!options.absolutePath && (!schemeHandler || !schemeHandler.absolutePath)) {
      s = removeDotSegments(s);
    }

    if (authority === undefined) {
      s = Str.replace(/^\/\//, "/%2F")(s);
    }

    uriTokens.push(s);
  }

  if (components.query !== undefined) {
    uriTokens.push("?");
    uriTokens.push(components.query);
  }

  if (components.fragment !== undefined) {
    uriTokens.push("#");
    uriTokens.push(components.fragment);
  }

  return A.join(uriTokens, "");
}

export function resolveComponents(
  base: URIComponents,
  relative: URIComponents,
  options: URIOptions = {},
  skipNormalization?: boolean
): URIComponents {
  const target: URIComponents = {};

  if (!skipNormalization) {
    base = parse(serialize(base, options), options);
    relative = parse(serialize(relative, options), options);
  }
  options = options || {};

  if (!options.tolerant && relative.scheme) {
    target.scheme = relative.scheme;
    target.userinfo = relative.userinfo;
    target.host = relative.host;
    target.port = relative.port;
    target.path = removeDotSegments(relative.path || "");
    target.query = relative.query;
  } else {
    if (relative.userinfo !== undefined || relative.host !== undefined || relative.port !== undefined) {
      target.userinfo = relative.userinfo;
      target.host = relative.host;
      target.port = relative.port;
      target.path = removeDotSegments(relative.path || "");
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

  return target;
}

export function resolve(baseURI: string, relativeURI: string, options?: URIOptions): string {
  const schemelessOptions: URIOptions = { scheme: "null" as const, ...options };
  return serialize(
    resolveComponents(
      parse(baseURI, schemelessOptions),
      parse(relativeURI, schemelessOptions),
      schemelessOptions,
      true
    ),
    schemelessOptions
  );
}

export function normalize(uri: string, options?: URIOptions): string;
export function normalize(uri: URIComponents, options?: URIOptions): URIComponents;
export function normalize(uri: string | URIComponents, options?: URIOptions): string | URIComponents {
  if (P.isString(uri)) {
    return serialize(parse(uri, options), options);
  }
  return parse(serialize(uri, options), options);
}

export function equal(uriA: string, uriB: string, options?: URIOptions): boolean;
export function equal(uriA: URIComponents, uriB: URIComponents, options?: URIOptions): boolean;
export function equal(uriA: string | URIComponents, uriB: string | URIComponents, options?: URIOptions): boolean {
  const serializedA = P.isString(uriA) ? serialize(parse(uriA, options), options) : serialize(uriA, options);
  const serializedB = P.isString(uriB) ? serialize(parse(uriB, options), options) : serialize(uriB, options);
  return serializedA === serializedB;
}

export const escapeComponent: {
  (options?: URIOptions): (str: string) => string;
  (str: string, options?: URIOptions): string;
} = F.dual(
  (args: IArguments) => P.isString(args[0]),
  (str: string, options?: URIOptions): string =>
    str?.toString().replace(!options || !options.iri ? URI_PROTOCOL.ESCAPE : IRI_PROTOCOL.ESCAPE, pctEncChar)
);

export const unescapeComponent: {
  (options?: URIOptions): (str: string) => string;
  (str: string, options?: URIOptions): string;
} = F.dual(
  (args: IArguments) => P.isString(args[0]),
  (str: string, options?: URIOptions): string =>
    str?.toString().replace(!options || !options.iri ? URI_PROTOCOL.PCT_ENCODED : IRI_PROTOCOL.PCT_ENCODED, pctDecChars)
);
