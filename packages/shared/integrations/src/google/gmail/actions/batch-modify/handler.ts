import { wrapGmailCall } from "../../common/wrap-gmail-call.ts";
import { Wrapper } from "./contract";

export const Handler = Wrapper.implement((payload) =>
  wrapGmailCall({
    operation: (client) => client.users.messages.batchModify(payload),
    failureMessage: "Failed to batch modify emails",
  })
);
