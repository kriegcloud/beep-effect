import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { wrapGmailCall } from "../../common/wrap-gmail-call.ts";
import { Models } from "../../models";
import { Success, Wrapper } from "./contract";

export const Handler = Wrapper.implement(
  Effect.fn(
    function* (payload) {
      const response = yield* wrapGmailCall({
        operation: (client) => client.users.drafts.get(payload),
        failureMessage: "Failed to get draft",
      });

      const draftId = response.data.id || "";
      const message = response.data.message;

      const email = Models.parseMessageToEmail(message || {}, true);

      return yield* S.decode(Success)({
        ...email,
        draftId,
      });
    },
    Effect.catchTag("ParseError", Effect.die)
  )
);
