/**
 * context graph field value object.
 *
 * @since 0.0.0
 * @packageDocumentationq
 */
import { $ScratchpadId } from "@beep/identity";
import {Triple} from "../Term/index.ts";
import * as S from "effect/Schema";



const $I = $ScratchpadId.create("values/DocumentMetadata/DocumentMetadata.model");

export class DocumentMetadata extends S.Class<DocumentMetadata>($I`DocumentMetadata`)(
  {
    id: S.String,
    time: S.DateTimeUtcFromMillis,
    kind: S.String,
    title: S.String,
    comments: S.String,
    user: S.String,
    tags: S.Array(S.String),
    parentId: S.OptionFromOptionalKey(S.String),
    documentType: S.String, //"source" | "page" | "chunk" | "extracted"
    metadata: Triple.pipe(S.Array, S.OptionFromOptionalKey)
  },
  $I.annote(
    "DocumentMetadata",
    {
      description: ""
    }
  )
) {}
