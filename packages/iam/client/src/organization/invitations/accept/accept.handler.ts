import { createHandler } from "@beep/iam-client/_common/handler.factory";

import { client } from "@beep/iam-client/adapters/better-auth/client";
import * as Contract from "./accept.contract.ts";

export const Handler = createHandler({
  domain: "organization/invitations",
  feature: "accept",
  execute: (encoded) => client.organization.acceptInvitation(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: true, // User joins organization, affects session
});
