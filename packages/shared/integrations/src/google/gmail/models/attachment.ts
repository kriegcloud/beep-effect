import { $SharedIntegrationsId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $SharedIntegrationsId.create("google/gmail/models/attachment");

export class EmailAttachment extends S.Class<EmailAttachment>($I`EmailAttachment`)(
  {
    filename: S.String,
    mimeType: BS.MimeType,
    size: S.NonNegativeInt,
  },
  $I.annotations("EmailAttachment", {
    description: "Email attachment",
  })
) {}
