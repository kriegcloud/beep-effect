import idna from "@beep/semantic-web/idna";
import * as A from "effect/Array";
import * as Either from "effect/Either";
import * as ParseResult from "effect/ParseResult";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import type * as AST from "effect/SchemaAST";
import * as Str from "effect/String";
import type { URIComponents, URIOptions, URISchemeHandler } from "../uri.ts";
import { pctDecChars, pctEncChar, unescapeComponent } from "../uri.ts";
import { merge, subexp } from "../util.ts";

export interface MailtoHeaders {
  [hfname: string]: string;
}

export interface MailtoComponents extends URIComponents.Type {
  to: Array<string>;
  headers?: undefined | MailtoHeaders;
  subject?: undefined | string;
  body?: undefined | string;
}

const EMPTY_HEADERS: MailtoHeaders = R.empty<string, string>();
const isIRI = true;

const UNRESERVED$$ =
  "[A-Za-z0-9\\-\\.\\_\\~" +
  (isIRI ? "\\xA0-\\u200D\\u2010-\\u2029\\u202F-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF" : Str.empty) +
  "]";
const HEXDIG$$ = "[0-9A-Fa-f]";
const PCT_ENCODED$ = subexp(
  subexp(`%[EFef]${HEXDIG$$}%${HEXDIG$$}${HEXDIG$$}%${HEXDIG$$}${HEXDIG$$}`) +
    "|" +
    subexp(`%[89A-Fa-f]${HEXDIG$$}%${HEXDIG$$}${HEXDIG$$}`) +
    "|" +
    subexp(`%${HEXDIG$$}${HEXDIG$$}`)
);

const ATEXT$$ = "[A-Za-z0-9\\!\\$\\%\\'\\*\\+\\-\\^\\_\\`\\{\\|\\}\\~]";
const QTEXT$$ = "[\\!\\$\\%\\'\\(\\)\\*\\+\\,\\-\\.0-9\\<\\>A-Z\\x5E-\\x7E]";
const VCHAR$$ = merge(QTEXT$$, '[\\"\\\\]');
const SOME_DELIMS$$ = "[\\!\\$\\'\\(\\)\\*\\+\\,\\;\\:\\@]";

const UNRESERVED = new RegExp(UNRESERVED$$, "g");
const PCT_ENCODED = new RegExp(PCT_ENCODED$, "g");
const NOT_LOCAL_PART = new RegExp(merge("[^]", ATEXT$$, "[\\.]", '[\\"]', VCHAR$$), "g");
const NOT_HFNAME = new RegExp(merge("[^]", UNRESERVED$$, SOME_DELIMS$$), "g");

function decodeUnreserved(str: string): string {
  const decStr = pctDecChars(str);
  return !decStr.match(UNRESERVED) ? str : decStr;
}

const typeIssue = (ast: AST.AST | undefined, actual: unknown, message: string): ParseResult.ParseIssue =>
  new ParseResult.Type(ast ?? S.String.ast, actual, message);

const handler: URISchemeHandler<MailtoComponents> = {
  scheme: "mailto",

  parse(
    components: URIComponents.Type,
    options: URIOptions,
    ast
  ): Either.Either<MailtoComponents, ParseResult.ParseIssue> {
    const to: Array<string> = components.path ? [...Str.split(components.path, ",")] : [];
    const mailtoComponents: MailtoComponents = {
      ...components,
      to,
      path: "",
    };

    if (mailtoComponents.query) {
      let unknownHeaders = false;
      const headers: MailtoHeaders = {};
      const hfields = Str.split(mailtoComponents.query, "&");

      for (let x = 0, xl = hfields.length; x < xl; ++x) {
        const hfieldRaw = hfields[x];
        if (!hfieldRaw) continue;
        const hfield = Str.split(hfieldRaw, "=");
        const hfName = hfield[0] || Str.empty;
        const hfValue = hfield[1] || Str.empty;

        if (hfName === "to") {
          const toAddrs = Str.split(hfValue, ",");
          for (let i = 0, il = toAddrs.length; i < il; ++i) {
            const addr = toAddrs[i];
            if (addr) to.push(addr);
          }
        } else if (hfName === "subject") {
          mailtoComponents.subject = unescapeComponent(hfValue, options);
        } else if (hfName === "body") {
          mailtoComponents.body = unescapeComponent(hfValue, options);
        } else {
          unknownHeaders = true;
          headers[unescapeComponent(hfName, options)] = unescapeComponent(hfValue, options);
        }
      }

      if (unknownHeaders) mailtoComponents.headers = headers;
    }

    mailtoComponents.query = undefined;

    for (let x = 0, xl = to.length; x < xl; ++x) {
      const toEntry = to[x];
      if (!toEntry) continue;
      const addr = [...Str.split(toEntry, "@")];
      const localPart = addr[0] || Str.empty;
      const domainPart = addr[1] || Str.empty;

      addr[0] = unescapeComponent(localPart);

      if (!options.unicodeSupport) {
        const r = idna.toASCIIResult(Str.toLowerCase(unescapeComponent(domainPart, options)));
        if (Either.isLeft(r)) {
          return Either.left(
            typeIssue(
              ast,
              domainPart,
              `Email address's domain name can not be converted to ASCII via punycode: ${ParseResult.TreeFormatter.formatIssueSync(
                r.left
              )}`
            )
          );
        }
        addr[1] = r.right;
      } else {
        addr[1] = Str.toLowerCase(unescapeComponent(domainPart, options));
      }

      to[x] = A.join(addr, "@");
    }

    return Either.right(mailtoComponents);
  },

  serialize(
    mailtoComponents: MailtoComponents,
    options: URIOptions,
    ast
  ): Either.Either<URIComponents.Type, ParseResult.ParseIssue> {
    const components: URIComponents.Type = mailtoComponents;
    const to = mailtoComponents.to;

    if (to) {
      for (let x = 0, xl = to.length; x < xl; ++x) {
        const toAddr = String(to[x]);
        const atIdx = toAddr.lastIndexOf("@");
        const localPart = Str.slice(
          0,
          atIdx
        )(toAddr)
          .replace(PCT_ENCODED, decodeUnreserved)
          .replace(PCT_ENCODED, Str.toUpperCase)
          .replace(NOT_LOCAL_PART, pctEncChar);
        let domain = Str.slice(atIdx + 1)(toAddr);

        const r = !options.iri
          ? idna.toASCIIResult(Str.toLowerCase(unescapeComponent(domain, options)))
          : idna.toUnicodeResult(domain);
        if (Either.isLeft(r)) {
          return Either.left(
            typeIssue(
              ast,
              domain,
              "Email address's domain name can not be converted to " +
                (!options.iri ? "ASCII" : "Unicode") +
                " via punycode: " +
                ParseResult.TreeFormatter.formatIssueSync(r.left)
            )
          );
        }
        domain = r.right;

        to[x] = `${localPart}@${domain}`;
      }

      components.path = A.join(to, ",");
    }

    const headers = (mailtoComponents.headers = mailtoComponents.headers || {});

    if (mailtoComponents.subject) headers.subject = mailtoComponents.subject;
    if (mailtoComponents.body) headers.body = mailtoComponents.body;

    const fields = A.empty<string>();
    for (const name in headers) {
      const headerValue = headers[name];
      if (headerValue !== undefined && headerValue !== EMPTY_HEADERS[name]) {
        fields.push(
          name
            .replace(PCT_ENCODED, decodeUnreserved)
            .replace(PCT_ENCODED, Str.toUpperCase)
            .replace(NOT_HFNAME, pctEncChar) +
            "=" +
            headerValue
              .replace(PCT_ENCODED, decodeUnreserved)
              .replace(PCT_ENCODED, Str.toUpperCase)
              .replace(NOT_HFNAME, pctEncChar)
        );
      }
    }
    if (fields.length) {
      components.query = A.join(fields, "&");
    }

    return Either.right(components);
  },
};

export default handler;
