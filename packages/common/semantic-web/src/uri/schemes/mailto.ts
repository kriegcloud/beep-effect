import * as Str from "effect/String";
import type { URIComponents, URIOptions, URISchemeHandler } from "../uri.ts";
import { pctDecChars, pctEncChar, unescapeComponent } from "../uri.ts";
import idna from "@beep/semantic-web/idna";
import { merge, subexp } from "../util.ts";

export interface MailtoHeaders {
  [hfname: string]: string;
}

export interface MailtoComponents extends URIComponents {
  to: Array<string>;
  headers?: undefined | MailtoHeaders;
  subject?: undefined | string;
  body?: undefined | string;
}

const EMPTY_HEADERS: MailtoHeaders = {};
const isIRI = true;

const UNRESERVED$$ =
  "[A-Za-z0-9\\-\\.\\_\\~" +
  (isIRI ? "\\xA0-\\u200D\\u2010-\\u2029\\u202F-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF" : "") +
  "]";
const HEXDIG$$ = "[0-9A-Fa-f]";
const PCT_ENCODED$ = subexp(
  subexp("%[EFef]" + HEXDIG$$ + "%" + HEXDIG$$ + HEXDIG$$ + "%" + HEXDIG$$ + HEXDIG$$) +
    "|" +
    subexp("%[89A-Fa-f]" + HEXDIG$$ + "%" + HEXDIG$$ + HEXDIG$$) +
    "|" +
    subexp("%" + HEXDIG$$ + HEXDIG$$),
);

const ATEXT$$ = "[A-Za-z0-9\\!\\$\\%\\'\\*\\+\\-\\^\\_\\`\\{\\|\\}\\~]";
const QTEXT$$ = "[\\!\\$\\%\\'\\(\\)\\*\\+\\,\\-\\.0-9\\<\\>A-Z\\x5E-\\x7E]";
const VCHAR$$ = merge(QTEXT$$, "[\\\"\\\\]");
const SOME_DELIMS$$ = "[\\!\\$\\'\\(\\)\\*\\+\\,\\;\\:\\@]";

const UNRESERVED = new RegExp(UNRESERVED$$, "g");
const PCT_ENCODED = new RegExp(PCT_ENCODED$, "g");
const NOT_LOCAL_PART = new RegExp(merge("[^]", ATEXT$$, "[\\.]", '[\\"]', VCHAR$$), "g");
const NOT_HFNAME = new RegExp(merge("[^]", UNRESERVED$$, SOME_DELIMS$$), "g");
const NOT_HFVALUE = NOT_HFNAME;

function decodeUnreserved(str: string): string {
  const decStr = pctDecChars(str);
  return !decStr.match(UNRESERVED) ? str : decStr;
}

const handler: URISchemeHandler<MailtoComponents> = {
  scheme: "mailto",

  parse(components: URIComponents, options: URIOptions): MailtoComponents {
    const mailtoComponents = components as MailtoComponents;
    const to = (mailtoComponents.to = mailtoComponents.path
      ? mailtoComponents.path.split(",")
      : []);
    mailtoComponents.path = undefined;

    if (mailtoComponents.query) {
      let unknownHeaders = false;
      const headers: MailtoHeaders = {};
      const hfields = mailtoComponents.query.split("&");

      for (let x = 0, xl = hfields.length; x < xl; ++x) {
        const hfieldRaw = hfields[x];
        if (!hfieldRaw) continue;
        const hfield = hfieldRaw.split("=");
        const hfName = hfield[0] || "";
        const hfValue = hfield[1] || "";

        if (hfName === "to") {
          const toAddrs = hfValue.split(",");
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
      const addr = toEntry.split("@");
      const localPart = addr[0] || "";
      const domainPart = addr[1] || "";

      addr[0] = unescapeComponent(localPart);

      if (!options.unicodeSupport) {
        try {
          addr[1] = idna.toASCII(
            Str.toLowerCase(unescapeComponent(domainPart, options)),
          );
        } catch (e) {
          mailtoComponents.error =
            mailtoComponents.error ||
            "Email address's domain name can not be converted to ASCII via punycode: " + e;
        }
      } else {
        addr[1] = Str.toLowerCase(unescapeComponent(domainPart, options));
      }

      to[x] = addr.join("@");
    }

    return mailtoComponents;
  },

  serialize(mailtoComponents: MailtoComponents, options: URIOptions): URIComponents {
    const components = mailtoComponents as URIComponents;
    const to = mailtoComponents.to;

    if (to) {
      for (let x = 0, xl = to.length; x < xl; ++x) {
        const toAddr = String(to[x]);
        const atIdx = toAddr.lastIndexOf("@");
        const localPart = toAddr
          .slice(0, atIdx)
          .replace(PCT_ENCODED, decodeUnreserved)
          .replace(PCT_ENCODED, Str.toUpperCase)
          .replace(NOT_LOCAL_PART, pctEncChar);
        let domain = toAddr.slice(atIdx + 1);

        try {
          domain = !options.iri
            ? idna.toASCII(
                Str.toLowerCase(unescapeComponent(domain, options)),
              )
            : idna.toUnicode(domain);
        } catch (e) {
          components.error =
            components.error ||
            "Email address's domain name can not be converted to " +
              (!options.iri ? "ASCII" : "Unicode") +
              " via punycode: " +
              e;
        }

        to[x] = localPart + "@" + domain;
      }

      components.path = to.join(",");
    }

    const headers = (mailtoComponents.headers = mailtoComponents.headers || {});

    if (mailtoComponents.subject) headers["subject"] = mailtoComponents.subject;
    if (mailtoComponents.body) headers["body"] = mailtoComponents.body;

    const fields: Array<string> = [];
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
              .replace(NOT_HFVALUE, pctEncChar),
        );
      }
    }
    if (fields.length) {
      components.query = fields.join("&");
    }

    return components;
  },
};

export default handler;
