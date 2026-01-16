import { createHandler } from "@beep/iam-client/_common";
import { client } from "@beep/iam-client/adapters/better-auth/client";
import * as Contract from "./remove.contract.ts";

export const Handler = createHandler({
  domain: "organization/members",
  feature: "remove",
  execute: (encoded) => client.organization.removeMember(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: false,
});
