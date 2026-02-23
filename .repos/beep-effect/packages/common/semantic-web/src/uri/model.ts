import { $SemanticWebId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $SemanticWebId.create("uri/model");

export class URIRegExps extends S.Class<URIRegExps>($I`URIRegExps`)(
  {
    NOT_SCHEME: BS.Regex,
    NOT_USERINFO: BS.Regex,
    NOT_HOST: BS.Regex,
    NOT_PATH: BS.Regex,
    NOT_PATH_NOSCHEME: BS.Regex,
    NOT_QUERY: BS.Regex,
    NOT_FRAGMENT: BS.Regex,
    ESCAPE: BS.Regex,
    UNRESERVED: BS.Regex,
    OTHER_CHARS: BS.Regex,
    PCT_ENCODED: BS.Regex,
    IPV4ADDRESS: BS.Regex,
    IPV6ADDRESS: BS.Regex,
  },
  $I.annotations("URIRegExps", {
    description: "Collection of regular expressions used for URI parsing and validation according to RFC 3986",
  })
) {}
