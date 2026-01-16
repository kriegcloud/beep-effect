import { createHandler } from "@beep/iam-client/_common/handler.factory";

import { client } from "@beep/iam-client/adapters/better-auth/client";
import * as Contract from "./list.contract.ts";

export const Handler = createHandler({
  domain: "organization",
  feature: "list",
  execute: () => client.organization.list(),
  successSchema: Contract.Success,
  // No payloadSchema - this is a no-payload handler
  mutatesSession: false,
});
