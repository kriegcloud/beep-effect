import type { gmail_v1 } from "@googleapis/gmail";
import * as Effect from "effect/Effect";
import type * as GmailSchemas from "../../common/gmail.schemas.ts";
import { wrapGmailCall } from "../../common/wrap-gmail-call.ts";
import { Models } from "../../models";
import { Success, Wrapper } from "./contract";

/**
 * Converts Schema$Label (null-based) to GmailLabel (undefined-based)
 */
const toGmailLabel = (label: gmail_v1.Schema$Label): GmailSchemas.GmailLabel => ({
  id: label.id ?? undefined,
  name: label.name ?? undefined,
  type: label.type ?? undefined,
  color: label.color
    ? {
        textColor: label.color.textColor ?? undefined,
        backgroundColor: label.color.backgroundColor ?? undefined,
      }
    : undefined,
  labelListVisibility: label.labelListVisibility ?? undefined,
  messageListVisibility: label.messageListVisibility ?? undefined,
  messagesTotal: label.messagesTotal ?? undefined,
  messagesUnread: label.messagesUnread ?? undefined,
  threadsTotal: label.threadsTotal ?? undefined,
  threadsUnread: label.threadsUnread ?? undefined,
});

export const Handler = Wrapper.implement(
  Effect.fn(function* (payload) {
    const response = yield* wrapGmailCall({
      operation: (client) =>
        client.users.labels.update({
          userId: "me",
          id: payload.labelId,
          requestBody: payload.toRequestBody() as gmail_v1.Schema$Label,
        }),
      failureMessage: "Failed to update label",
    });
    return new Success(Models.Label.fromRaw(toGmailLabel(response.data)));
  })
);
