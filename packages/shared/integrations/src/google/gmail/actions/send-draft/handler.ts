import type { gmail_v1 } from "@googleapis/gmail";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { wrapGmailCall } from "../../common/wrap-gmail-call.ts";
import { Success, Wrapper } from "./contract";

export const Handler = Wrapper.implement(
  Effect.fn(
    function* (payload) {
      const response = yield* wrapGmailCall({
        operation: (client) =>
          client.users.drafts.send(payload as gmail_v1.Params$Resource$Users$Drafts$Send),
        failureMessage: "Failed to send draft",
      });

      return yield* S.decode(Success)({
        id: response.data.id || "",
        threadId: response.data.threadId || "",
      });
    },
    Effect.catchTag("ParseError", Effect.die)
  )
);
