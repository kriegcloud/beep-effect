import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { wrapGmailCall } from "../../common/wrap-gmail-call.ts";
import { Models } from "../../models";
import { Success, Wrapper } from "./contract";

export const Handler = Wrapper.implement(
  Effect.fn(
    function* (payload) {
      const response = yield* wrapGmailCall({
        operation: (client) => client.users.messages.get(payload),
        failureMessage: "Failed to get email",
      });

      const email = Models.parseMessageToEmail(response.data, true);

      return yield* S.decode(Success)(email);
    },
    Effect.catchTag("ParseError", Effect.die)
  )
);
