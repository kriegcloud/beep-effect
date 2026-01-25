import type { gmail_v1 } from "@googleapis/gmail";
import * as Effect from "effect/Effect";

import { Common } from "../../common";
import { Wrapper } from "./contract";

export const Handler = Wrapper.implement(
  Effect.fn(function* (payload) {
    yield* Common.wrapGmailCall({
      // Type assertion needed due to deep structural differences between Effect Schema types
      // and Gmail API types (readonly arrays, optional vs undefined properties).
      // We only use userId and requestBody.raw for sending emails.
      operation: (client) => client.users.messages.send(payload as gmail_v1.Params$Resource$Users$Messages$Send),
      failureMessage: "Failed to send email",
    });
  })
);
