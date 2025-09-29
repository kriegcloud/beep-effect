import { AuthHandler } from "@beep/iam-sdk/auth-wrapper";
import type { AcceptInvitationContract } from "@beep/iam-sdk/clients";
import { client } from "../../adapters";

const acceptInvitation = AuthHandler.make<AcceptInvitationContract.Type>({
  name: "acceptInvitation",
  plugin: "organization",
  method: "acceptInvitation",
  run: AuthHandler.map(client.organization.acceptInvitation),
  toast: {
    onWaiting: "Accepting invitation...",
    onSuccess: "Invitation accepted successfully",
    onFailure: {
      onNone: () => "Failed accept invitation",
      onSome: (e) => e.message,
    },
  },
  defaultErrorMessage: "Failed accept invitation",
  annotations: { action: "organization", method: "acceptInvitation" },
});

export const organizationClient = {
  acceptInvitation,
} as const;
