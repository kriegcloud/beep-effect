import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { wrapGmailCall } from "../../common/wrap-gmail-call.ts";
import { Models } from "../../models";
import { Success, ThreadMessage, Wrapper } from "./contract";

export const Handler = Wrapper.implement(
  Effect.fn(
    function* (payload) {
      const response = yield* wrapGmailCall({
        operation: (client) => client.users.threads.get(payload),
        failureMessage: "Failed to get thread",
      });

      const thread = response.data;
      const rawMessages = thread.messages || [];
      const includeBody = payload.format === "full";

      const messages = A.map(rawMessages, (msg) => Models.parseMessageToEmail(msg, includeBody));

      return yield* S.decode(Success)({
        id: thread.id || "",
        historyId: thread.historyId ?? undefined,
        messages: yield* S.decode(S.Array(ThreadMessage))(messages),
      });
    },
    Effect.catchTag("ParseError", Effect.die)
  )
);
