import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { wrapGmailCall } from "../../common/wrap-gmail-call.ts";
import { Success, Wrapper } from "./contract";

export const Handler = Wrapper.implement(
  Effect.fn(
    function* (payload) {
      const response = yield* wrapGmailCall({
        operation: (client) => client.users.messages.attachments.get(payload),
        failureMessage: "Failed to get attachment",
      });

      const attachment = response.data;

      return yield* S.decode(Success)({
        attachmentId: payload.id || "",
        size: attachment.size ?? undefined,
        data: attachment.data || "",
      });
    },
    Effect.catchTag("ParseError", Effect.die)
  )
);
