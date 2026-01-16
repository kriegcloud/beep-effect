import { createHandler } from "@beep/iam-client/_common/handler.factory";

import { client } from "@beep/iam-client/adapters/better-auth/client";
import * as Contract from "./list.contract.ts";

export const Handler = createHandler({
  domain: "organization/invitations",
  feature: "list",
  execute: (encoded) => client.organization.listInvitations(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: false,
});
