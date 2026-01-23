import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import type * as GmailSchemas from "../../common/gmail.schemas.ts";
import { wrapGmailCall } from "../../common/wrap-gmail-call.ts";
import { Models } from "../../models";
import { Success, Wrapper } from "./contract";

export const Handler = Wrapper.implement(
  Effect.fn(
    function* (payload) {
      const paramsList = {
        ...(P.isNotNullable(payload.query) && Str.isNonEmpty(payload.query)
          ? {
              userId: "me",
              maxResults: payload.maxResults,
              q: payload.query,
            }
          : { userId: "me", maxResults: payload.maxResults }),
      };
      const listResp = yield* wrapGmailCall({
        operation: (client) => client.users.messages.list(paramsList),
        failureMessage: "Failed to list emails",
      });

      const messages = listResp.data.messages || [];
      if (A.isEmptyArray(messages))
        return Success.make({
          data: A.empty<Models.Email>(),
        });

      const emails = A.empty<GmailSchemas.GmailMessage>();
      for (const msg of messages) {
        if (!msg.id) continue;
        const paramsGet = {
          userId: "me",
          id: msg.id,
          format: "metadata",
          metadataHeaders: ["Subject", "From", "To", "Date", "Cc", "Bcc"],
        };

        const full = yield* wrapGmailCall({
          operation: (client) => client.users.messages.get(paramsGet),
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
