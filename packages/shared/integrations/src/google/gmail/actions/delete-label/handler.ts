import { wrapGmailCall } from "../../common/wrap-gmail-call.ts";
import { Wrapper } from "./contract";

export const Handler = Wrapper.implement((payload) =>
  wrapGmailCall({
    operation: (client) =>
      client.users.labels.delete({
        userId: "me",
        id: payload.labelId,
      }),
    failureMessage: "Failed to delete label",
  })
);
