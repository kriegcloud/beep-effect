import { createHandler } from "@beep/iam-client/_common/handler.factory";

import { client } from "@beep/iam-client/adapters/better-auth/client";
import * as Contract from "./create.contract.ts";

export const Handler = createHandler({
  domain: "organization",
  feature: "create",
  execute: (encoded) => client.organization.create(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: false,
});
