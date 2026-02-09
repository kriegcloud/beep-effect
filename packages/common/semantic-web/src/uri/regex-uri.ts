/** biome-ignore-all lint/style/useTemplate: would be a mess */

import { BS } from "@beep/schema";
import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as Struct from "effect/Struct";
import { URIRegExps } from "./model.ts";
import { merge, subexp } from "./util";

export const buildExpressions = (isIRI: boolean): URIRegExps => {
  const ALPHA$$ = "[A-Za-z]";
  const DIGIT$$ = "[0-9]";
  const HEXDIG$$ = merge(DIGIT$$, "[A-Fa-f]"); //case-insensitive

  const PCT_ENCODED$ = subexp(
    subexp("%[EFef]" + HEXDIG$$ + "%" + HEXDIG$$ + HEXDIG$$ + "%" + HEXDIG$$ + HEXDIG$$) +
      "|" +
      subexp("%[89A-Fa-f]" + HEXDIG$$ + "%" + HEXDIG$$ + HEXDIG$$) +
      "|" +
      subexp("%" + HEXDIG$$ + HEXDIG$$)
  ); //expanded
  const GEN_DELIMS$$ = "[\\:\\/\\?\\#\\[\\]\\@]";
  const SUB_DELIMS$$ = "[\\!\\$\\&\\'\\(\\)\\*\\+\\,\\;\\=]";
  const RESERVED$$ = merge(GEN_DELIMS$$, SUB_DELIMS$$);
  const UCSCHAR$$ = isIRI ? "[\\xA0-\\u200D\\u2010-\\u2029\\u202F-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF]" : "[]"; //subset; excludes bidi control characters
  const IPRIVATE$$ = isIRI ? "[\\uE000-\\uF8FF]" : "[]"; //subset
  const UNRESERVED$$ = merge(ALPHA$$, DIGIT$$, "[\\-\\.\\_\\~]", UCSCHAR$$);

  const DEC_OCTET_RELAXED$ = subexp(
    subexp("25[0-5]") +
      "|" +
      subexp("2[0-4]" + DIGIT$$) +
      "|" +
      subexp("1" + DIGIT$$ + DIGIT$$) +
      "|" +
      subexp("0?[1-9]" + DIGIT$$) +
      "|0?0?" +
      DIGIT$$
  ); //relaxed parsing rules
  const IPV4ADDRESS$ = subexp(
    DEC_OCTET_RELAXED$ + "\\." + DEC_OCTET_RELAXED$ + "\\." + DEC_OCTET_RELAXED$ + "\\." + DEC_OCTET_RELAXED$
  );
  const H16$ = subexp(HEXDIG$$ + "{1,4}");
  const LS32$ = subexp(subexp(H16$ + "\\:" + H16$) + "|" + IPV4ADDRESS$);
  const IPV6ADDRESS1$ = subexp(subexp(H16$ + "\\:") + "{6}" + LS32$); //                           6( h16 ":" ) ls32
  const IPV6ADDRESS2$ = subexp("\\:\\:" + subexp(H16$ + "\\:") + "{5}" + LS32$); //                      "::" 5( h16 ":" ) ls32
  const IPV6ADDRESS3$ = subexp(subexp(H16$) + "?\\:\\:" + subexp(H16$ + "\\:") + "{4}" + LS32$); //[               h16 ] "::" 4( h16 ":" ) ls32
  const IPV6ADDRESS4$ = subexp(
    subexp(subexp(H16$ + "\\:") + "{0,1}" + H16$) + "?\\:\\:" + subexp(H16$ + "\\:") + "{3}" + LS32$
  ); //[ *1( h16 ":" ) h16 ] "::" 3( h16 ":" ) ls32
  const IPV6ADDRESS5$ = subexp(
    subexp(subexp(H16$ + "\\:") + "{0,2}" + H16$) + "?\\:\\:" + subexp(H16$ + "\\:") + "{2}" + LS32$
  ); //[ *2( h16 ":" ) h16 ] "::" 2( h16 ":" ) ls32
  const IPV6ADDRESS6$ = subexp(subexp(subexp(H16$ + "\\:") + "{0,3}" + H16$) + "?\\:\\:" + H16$ + "\\:" + LS32$); //[ *3( h16 ":" ) h16 ] "::"    h16 ":"   ls32
  const IPV6ADDRESS7$ = subexp(subexp(subexp(H16$ + "\\:") + "{0,4}" + H16$) + "?\\:\\:" + LS32$); //[ *4( h16 ":" ) h16 ] "::"              ls32
  const IPV6ADDRESS8$ = subexp(subexp(subexp(H16$ + "\\:") + "{0,5}" + H16$) + "?\\:\\:" + H16$); //[ *5( h16 ":" ) h16 ] "::"              h16
  const IPV6ADDRESS9$ = subexp(subexp(subexp(H16$ + "\\:") + "{0,6}" + H16$) + "?\\:\\:"); //[ *6( h16 ":" ) h16 ] "::"
  const IPV6ADDRESS$ = subexp(
    [
      IPV6ADDRESS1$,
      IPV6ADDRESS2$,
      IPV6ADDRESS3$,
      IPV6ADDRESS4$,
      IPV6ADDRESS5$,
      IPV6ADDRESS6$,
      IPV6ADDRESS7$,
      IPV6ADDRESS8$,
      IPV6ADDRESS9$,
    ].join("|")
  );
  const ZONEID$ = subexp(subexp(UNRESERVED$$ + "|" + PCT_ENCODED$) + "+"); //RFC 6874

  const struct = {
    NOT_SCHEME: new RegExp(merge("[^]", ALPHA$$, DIGIT$$, "[\\+\\-\\.]"), "g"),
    NOT_USERINFO: new RegExp(merge("[^\\%\\:]", UNRESERVED$$, SUB_DELIMS$$), "g"),
    NOT_HOST: new RegExp(merge("[^\\%\\[\\]\\:]", UNRESERVED$$, SUB_DELIMS$$), "g"),
    NOT_PATH: new RegExp(merge("[^\\%\\/\\:\\@]", UNRESERVED$$, SUB_DELIMS$$), "g"),
    NOT_PATH_NOSCHEME: new RegExp(merge("[^\\%\\/\\@]", UNRESERVED$$, SUB_DELIMS$$), "g"),
    NOT_QUERY: new RegExp(merge("[^\\%]", UNRESERVED$$, SUB_DELIMS$$, "[\\:\\@\\/\\?]", IPRIVATE$$), "g"),
    NOT_FRAGMENT: new RegExp(merge("[^\\%]", UNRESERVED$$, SUB_DELIMS$$, "[\\:\\@\\/\\?]"), "g"),
    ESCAPE: new RegExp(merge("[^]", UNRESERVED$$, SUB_DELIMS$$), "g"),
    UNRESERVED: new RegExp(UNRESERVED$$, "g"),
    OTHER_CHARS: new RegExp(merge("[^\\%]", UNRESERVED$$, RESERVED$$), "g"),
    PCT_ENCODED: new RegExp(PCT_ENCODED$, "g"),
    IPV4ADDRESS: new RegExp("^(" + IPV4ADDRESS$ + ")$"),
    IPV6ADDRESS: new RegExp(
      "^\\[?(" +
        IPV6ADDRESS$ +
        ")" +
        subexp(subexp("\\%25|\\%(?!" + HEXDIG$$ + "{2})") + "(" + ZONEID$ + ")") +
        "?\\]?$"
    ), //RFC 6874, with relaxed parsing rules
  } as const;

  return new URIRegExps(
    pipe(
      struct,
      Struct.entries,
      A.reduce(
        {} as {
          readonly [K in keyof typeof struct]: BS.Regex.Type;
        },
        (acc, [k, v]) => ({
          ...acc,
          [k]: BS.Regex.make(v),
        })
      )
    )
  );
};

export default buildExpressions(false);
