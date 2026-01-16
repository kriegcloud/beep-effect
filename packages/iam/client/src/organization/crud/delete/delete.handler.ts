import { createHandler } from "@beep/iam-client/_common/handler.factory";

import { client } from "@beep/iam-client/adapters/better-auth/client";
import * as Contract from "./delete.contract.ts";

export const Handler = createHandler({
  domain: "organization",
  feature: "delete",
  execute: (encoded) => client.organization.delete(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: false,
});
