import { $SharedIntegrationsId } from "@beep/identity/packages";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import type * as GmailSchemas from "../common/gmail.schemas.ts";
import { LabelColor } from "./label-color.ts";
import { LabelListVisibility } from "./label-list-visibility.ts";
import { LabelType } from "./label-type.ts";
import { MessageListVisibility } from "./message-list-visibility.ts";

const $I = $SharedIntegrationsId.create("google/gmail/models/label");

export class Label extends S.Class<Label>($I`Label`)(
  {
    id: S.String,
    name: S.String,
    type: LabelType,
    messagesTotal: S.optionalWith(S.Number, { as: "Option" }),
    messagesUnread: S.optionalWith(S.Number, { as: "Option" }),
    threadsTotal: S.optionalWith(S.Number, { as: "Option" }),
    threadsUnread: S.optionalWith(S.Number, { as: "Option" }),
    color: S.optionalWith(LabelColor, { as: "Option" }),
    labelListVisibility: S.optionalWith(LabelListVisibility, { as: "Option" }),
    messageListVisibility: S.optionalWith(MessageListVisibility, { as: "Option" }),
  },
  $I.annotations("Label", {
    description: "Label",
  })
) {
  static readonly fromRaw = (raw: GmailSchemas.GmailLabel) => {
    return new Label({
      id: raw.id || "",
      name: raw.name || "",
      type: LabelType.is.system(raw.type) ? LabelType.Enum.system : LabelType.Enum.user,
      messagesTotal: O.fromNullable(raw.messagesTotal),
      messagesUnread: O.fromNullable(raw.messagesUnread),
      threadsTotal: O.fromNullable(raw.threadsTotal),
      threadsUnread: O.fromNullable(raw.threadsUnread),
      color: O.fromNullable(raw.color).pipe(
        O.map((color) => ({
          textColor: color.textColor || "#000000",
          backgroundColor: color.backgroundColor || "#ffffff",
        }))
      ),
      labelListVisibility: S.decodeUnknownOption(LabelListVisibility)(raw.labelListVisibility),
      messageListVisibility: S.decodeUnknownOption(MessageListVisibility)(raw.messageListVisibility),
    });
  };
}
