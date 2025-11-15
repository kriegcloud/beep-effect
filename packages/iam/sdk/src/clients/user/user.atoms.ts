import { UserService } from "@beep/iam-sdk/clients/user/user.service";
import { makeAtomRuntime } from "@beep/runtime-client/services/runtime/make-atom-runtime";
import { withToast } from "@beep/ui/common/with-toast";
import { useAtomSet } from "@effect-atom/atom-react";
import * as F from "effect/Function";
import * as O from "effect/Option";

export const userRuntime = makeAtomRuntime(UserService.Live);

export const changePasswordAtom = userRuntime.fn(
  F.flow(
    UserService.ChangePassword,
    withToast({
      onWaiting: "Changing password...",
      onSuccess: "Password changed successfully",
      onFailure: O.match({
        onNone: () => "An unknown error occurred!",
        onSome: (error) => error.message,
      }),
    })
  ),
  {
    reactivityKeys: ["session"],
  }
);

export const useChangePassword = () => {
  const changePassword = useAtomSet(changePasswordAtom, {
    mode: "promise" as const,
  });

  return {
    changePassword,
  };
};

const updateUserIdentityAtom = userRuntime.fn(
  F.flow(
    UserService.UpdateUserIdentity,
    withToast({
      onWaiting: "Updating user...",
      onSuccess: "User updated successfully",
      onFailure: O.match({
        onNone: () => "An unknown error occurred!",
        onSome: (error) => error.message,
      }),
    })
  ),
  {
    reactivityKeys: ["session"],
  }
);

export const useUpdateUserIdentity = () => {
  const updateUser = useAtomSet(updateUserIdentityAtom, {
    mode: "promise" as const,
  });

  return {
    updateUser,
  };
};

const updateUsernameAtom = userRuntime.fn(
  F.flow(
    UserService.UpdateUsername,
    withToast({
      onWaiting: "Updating username...",
      onSuccess: "User updated successfully",
      onFailure: O.match({
        onNone: () => "An unknown error occurred!",
        onSome: (error) => error.message,
      }),
    })
  ),
  {
    reactivityKeys: ["session"],
  }
);

export const useUpdateUsername = () => {
  const updateUsername = useAtomSet(updateUsernameAtom, {
    mode: "promise" as const,
  });

  return {
    updateUsername,
  };
};

const updatePhoneNumberAtom = userRuntime.fn(
  F.flow(
    UserService.UpdatePhoneNumber,
    withToast({
      onWaiting: "Updating phone number...",
      onSuccess: "Phone number updated successfully",
      onFailure: O.match({
        onNone: () => "An unknown error occurred!",
        onSome: (error) => error.message,
      }),
    })
  ),
  {
    reactivityKeys: ["session"],
  }
);

export const useUpdatePhoneNumber = () => {
  const updatePhoneNumber = useAtomSet(updatePhoneNumberAtom, {
    mode: "promise" as const,
  });

  return {
    updatePhoneNumber,
  };
};
