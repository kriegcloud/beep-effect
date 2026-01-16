import { createHandler } from "@beep/iam-client/_common";
import { client } from "@beep/iam-client/adapters/better-auth/client";
import * as Contract from "./list.contract.ts";

export const Handler = createHandler({
  domain: "organization/members",
  feature: "list",
  execute: (encoded) => client.organization.listMembers(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: false,
});
