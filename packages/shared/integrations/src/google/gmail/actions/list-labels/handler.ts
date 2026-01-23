import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { wrapGmailCall } from "../../common/wrap-gmail-call.ts";
import { Success, Wrapper } from "./contract";

export const Handler = Wrapper.implement(
  Effect.fn(
    function* () {
      const response = yield* wrapGmailCall({
        operation: (client) =>
          client.users.labels.list({
            userId: "me",
          }),
        failureMessage: "Failed to list label",
      });

      return yield* S.decodeUnknown(Success)({
        data: response,
      });
    },
    Effect.catchTag("ParseError", Effect.die)
  )
);
