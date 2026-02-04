import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { wrapGmailCall } from "../../common/wrap-gmail-call.ts";
import { Success, Wrapper } from "./contract";

export const Handler = Wrapper.implement(
  Effect.fn(
    function* (payload) {
      yield* wrapGmailCall({
        operation: (client) => client.users.messages.batchModify(payload),
        failureMessage: "Failed to mark messages as read",
      });

      const messageIds = payload.requestBody?.ids || [];
      const modifiedCount = A.length(messageIds);

      return yield* S.decode(Success)({
        modifiedCount,
      });
    },
    Effect.catchTag("ParseError", Effect.die)
  )
);
