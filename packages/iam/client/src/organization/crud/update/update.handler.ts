import { createHandler } from "@beep/iam-client/_common/handler.factory";

import { client } from "@beep/iam-client/adapters/better-auth/client";
import * as Contract from "./update.contract.ts";

export const Handler = createHandler({
  domain: "organization",
  feature: "update",
  execute: (encoded) => client.organization.update(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: false,
});
