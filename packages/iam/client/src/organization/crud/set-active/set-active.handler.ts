import { createHandler } from "@beep/iam-client/_common/handler.factory";

import { client } from "@beep/iam-client/adapters/better-auth/client";
import * as Contract from "./set-active.contract.ts";

export const Handler = createHandler({
  domain: "organization",
  feature: "set-active",
  execute: (encoded) => client.organization.setActive(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: true, // Changes active organization in session
});
