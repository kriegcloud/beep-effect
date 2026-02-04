import type { gmail_v1 } from "@googleapis/gmail";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { wrapGmailCall } from "../../common/wrap-gmail-call.ts";
import { Models } from "../../models";
import { Success, Wrapper } from "./contract";

export const Handler = Wrapper.implement(
  Effect.fn(
    function* (payload) {
      const response = yield* wrapGmailCall({
        operation: (client) =>
          client.users.drafts.create(payload as gmail_v1.Params$Resource$Users$Drafts$Create),
        failureMessage: "Failed to create draft",
      });

      const draftId = response.data.id || "";
      const message = response.data.message;

      const email = Models.parseMessageToEmail(message || {}, false);

      return yield* S.decode(Success)({
        id: draftId,
        message: email,
      });
    },
    Effect.catchTag("ParseError", Effect.die)
  )
);
