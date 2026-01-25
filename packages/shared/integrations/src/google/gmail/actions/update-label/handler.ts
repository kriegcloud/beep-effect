import * as Effect from "effect/Effect";
import type { GmailLabel } from "../../common/gmail.schemas.ts";
import { wrapGmailCall } from "../../common/wrap-gmail-call.ts";
import { Models } from "../../models";
import { Success, Wrapper } from "./contract";

export const Handler = Wrapper.implement(
  Effect.fn(function* (payload) {
    const response = yield* wrapGmailCall({
      operation: (client) => client.users.labels.update(payload),
      failureMessage: "Failed to update label",
    });
    return new Success(Models.Label.fromRaw(response.data as GmailLabel));
  })
);
