import { createHandler } from "@beep/iam-client/_common";
import { client } from "@beep/iam-client/adapters/better-auth/client";
import * as Contract from "./update-role.contract.ts";

export const Handler = createHandler({
  domain: "organization/members",
  feature: "update-role",
  execute: (encoded) => client.organization.updateMemberRole(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: false,
});
