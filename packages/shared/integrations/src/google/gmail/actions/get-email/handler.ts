import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { wrapGmailCall } from "../../common/wrap-gmail-call.ts";
import { Models } from "../../models";
import { Success, Wrapper } from "./contract";
export const Handler = Wrapper.implement(
  Effect.fn(
    function* (payload) {
      const paramsGet = {
        userId: "me",
        id: payload.emailId,
        format: "full",
      };
      const full = yield* wrapGmailCall({
        operation: (client) => client.users.messages.get(paramsGet),
        failureMessage: "Failed to trash email",
      });

      const email = Models.parseMessageToEmail(full.data, true);

      return yield* S.decode(Success)(email);
    },
    Effect.catchTag("ParseError", Effect.die)
  )
);
