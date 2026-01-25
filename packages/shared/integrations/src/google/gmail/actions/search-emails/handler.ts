import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import type * as GmailSchemas from "../../common/gmail.schemas.ts";
import { wrapGmailCall } from "../../common/wrap-gmail-call.ts";
import { Models } from "../../models";
import { Success, Wrapper } from "./contract";

export const Handler = Wrapper.implement(
  Effect.fn(
    function* (payload) {
      const listResp = yield* wrapGmailCall({
        operation: (client) => client.users.messages.list(payload),
        failureMessage: "Failed to search emails",
      });

      const messages = listResp.data.messages || [];
      if (A.isEmptyArray(messages)) {
        return Success.make({
          data: A.empty<Models.Email>(),
        });
      }

      const emails = A.empty<GmailSchemas.GmailMessage>();
      for (const msg of messages) {
        const msgId = msg.id;
        if (!msgId) continue;

        const full = yield* wrapGmailCall({
          operation: (client) =>
            client.users.messages.get({
              userId: "me",
              id: msgId,
              format: "metadata",
              metadataHeaders: ["Subject", "From", "To", "Date", "Cc", "Bcc"],
            }),
          failureMessage: "Failed to get email",
        });

        const email = Models.parseMessageToEmail(full.data);
        emails.push(email);
      }

      return yield* S.decodeUnknown(Success)({
        data: emails,
      });
    },
    Effect.catchTag("ParseError", Effect.die)
  )
);
