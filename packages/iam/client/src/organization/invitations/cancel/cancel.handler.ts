import { createHandler } from "@beep/iam-client/_common/handler.factory";

import { client } from "@beep/iam-client/adapters/better-auth/client";
import * as Contract from "./cancel.contract.ts";

export const Handler = createHandler({
  domain: "organization/invitations",
  feature: "cancel",
  execute: (encoded) => client.organization.cancelInvitation(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: false,
});
