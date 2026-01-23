import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { wrapGmailCall } from "../../common/wrap-gmail-call.ts";
import { Success, Wrapper } from "./contract";

export const Handler = Wrapper.implement(
  Effect.fn(
    function* (payload) {
      const response = yield* wrapGmailCall({
        operation: (client) =>
          client.users.messages.modify({
            userId: "me",
            id: payload.emailId,
            requestBody: F.pipe(
              O.all({
                addLabelIds: payload.options.addLabelIds,
                removeLabelIds: payload.options.removeLabelIds,
              }),
              O.getOrElse(() => ({ addLabelIds: [], removeLabelIds: [] }))
            ),
          }),
        failureMessage: "Failed to trash email",
      });

      return yield* S.decodeUnknown(Success)(response);
    },
    Effect.catchTag("ParseError", Effect.die)
  )
);
