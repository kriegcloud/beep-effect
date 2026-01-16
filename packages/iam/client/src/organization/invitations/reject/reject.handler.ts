import { createHandler } from "@beep/iam-client/_common/handler.factory";

import { client } from "@beep/iam-client/adapters/better-auth/client";
import * as Contract from "./reject.contract.ts";

export const Handler = createHandler({
  domain: "organization/invitations",
  feature: "reject",
  execute: (encoded) => client.organization.rejectInvitation(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: false,
});
