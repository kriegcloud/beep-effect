import { client } from "@beep/iam-sdk/adapters";
import { OrganizationContractKit } from "@beep/iam-sdk/clients/organization/organization.contracts";
import { makeFailureContinuation } from "@beep/iam-sdk/contract-kit";
import * as Effect from "effect/Effect";
import type { AcceptInvitationPayload } from "./organization.contracts";

// =====================================================================================================================
// Accept Invitation Handler
// =====================================================================================================================
const AcceptInvitationHandler = Effect.fn("AcceptInvitationHandler")(function* (payload: AcceptInvitationPayload.Type) {
  const continuation = makeFailureContinuation({
    contract: "AcceptInvitationContract",
    metadata: () => ({
      plugin: "organization",
      method: "acceptInvitation",
    }),
  });

  const result = yield* continuation.run(() => client.organization.acceptInvitation(payload));

  yield* continuation.raiseResult(result);
});

export const OrganizationImplementations = OrganizationContractKit.of({
  AcceptInvitation: AcceptInvitationHandler,
});
