import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { wrapGmailCall } from "../../common/wrap-gmail-call.ts";
import { Success, Wrapper } from "./contract";

export const Handler = Wrapper.implement(
  Effect.fn(
    function* (payload) {
      const response = yield* wrapGmailCall({
        operation: (client) => client.users.labels.create(payload),
        failureMessage: "Failed to create label",
      });

      return yield* S.decodeUnknown(Success)(response);
    },
    Effect.catchTag("ParseError", Effect.die)
  )
);
