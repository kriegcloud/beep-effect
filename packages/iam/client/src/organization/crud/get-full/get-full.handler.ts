import { createHandler } from "@beep/iam-client/_common/handler.factory";

import { client } from "@beep/iam-client/adapters/better-auth/client";
import * as Contract from "./get-full.contract.ts";

export const Handler = createHandler({
  domain: "organization",
  feature: "get-full",
  execute: (encoded) => client.organization.getFullOrganization(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: false,
});
