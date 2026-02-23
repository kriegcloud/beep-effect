import { $YjsId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $YjsId.create("protocol/UrlMetadata");

export class UrlMetadata extends S.Class<UrlMetadata>($I`UrlMetadata`)(
  {
    title: S.optional(BS.NameAttribute),
    description: S.optional(S.String),
    image: S.optional(BS.URLString),
    icon: S.optional(S.String),
  },
  $I.annotations("UrlMetadata", {
    description: "URL metadata for Yjs protocol",
  })
) {}
