import { noOp } from "@beep/utils";
import * as F from "effect/Function";
import * as O from "effect/Option";
import { wrapGmailCall } from "../../common/wrap-gmail-call.ts";
import { Wrapper } from "./contract";

export const Handler = Wrapper.implement((payload) =>
  wrapGmailCall({
    operation: (client) =>
      client.users.messages.batchModify({
        userId: "me",
        requestBody: {
          ids: payload.emailIds,
          ...F.pipe(
            O.Do,
            O.bind("addLabelIds", () => payload.options.addLabelIds),
            O.bind("removeLabelIds", () => payload.options.removeLabelIds),
            O.map(({ addLabelIds, removeLabelIds }) => ({
              addLabelIds,
              removeLabelIds,
            })),
            O.getOrElse(noOp)
          ),
        },
      }),
    failureMessage: "Failed to trash email",
  })
);
