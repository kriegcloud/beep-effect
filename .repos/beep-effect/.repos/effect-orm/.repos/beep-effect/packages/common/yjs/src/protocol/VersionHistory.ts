import { $YjsId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $YjsId.create("protocol/VersionHistory");

export class VersionHistory extends S.Class<VersionHistory>($I`VersionHistory`)(
  {
    type: S.Literal("historyVersion"),
    kind: S.Literal("yjs"),
    createdAt: BS.DateTimeUtcFromAllAcceptable,
    id: S.String,
    authors: S.Array(S.Struct({ id: S.String })),
  },
  $I.annotations("VersionHistory", {
    description: "Version history for Yjs protocol",
  })
) {}
