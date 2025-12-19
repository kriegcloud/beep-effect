import { Contract, ContractKit } from "@beep/contract";

import * as S from "effect/Schema";
import { IamError } from "../../errors";
// =====================================================================================================================
// Sign Out Contract
// =====================================================================================================================
export const SignOutContract = Contract.make("SignOut", {
  description: "Signs the current user out of their active session.",
  payload: {
    onSuccess: S.Any,
  },
  failure: IamError,
  success: S.Void,
})
  .annotate(Contract.Title, "Sign Out Contract")
  .annotate(Contract.Domain, "Sign Out")
  .annotate(Contract.Method, "signOut");
// =====================================================================================================================
// Sign Out Contract Set
// =====================================================================================================================
export const SignOutContractKit = ContractKit.make(SignOutContract);
