import { $CustomizationDomainId } from "@beep/identity/packages";
import { CustomizationEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $CustomizationDomainId.create("entities/UserHotkey/UserHotkey.errors");

export class UserHotkeyNotFoundError extends S.TaggedError<UserHotkeyNotFoundError>()(
  $I`UserHotkeyNotFoundError`,
  { id: CustomizationEntityIds.UserHotkeyId },
  $I.annotationsHttp("UserHotkeyNotFoundError", {
    status: 404,
    description: "Error when a user hotkey with the specified ID cannot be found.",
  })
) {}

export class UserHotkeyPermissionDeniedError extends S.TaggedError<UserHotkeyPermissionDeniedError>()(
  $I`UserHotkeyPermissionDeniedError`,
  { id: CustomizationEntityIds.UserHotkeyId },
  $I.annotationsHttp("UserHotkeyPermissionDeniedError", {
    status: 403,
    description: "Thrown when the user lacks permission to perform the requested action on the user hotkey.",
  })
) {}

export const Errors = S.Union(UserHotkeyNotFoundError, UserHotkeyPermissionDeniedError);
export type Errors = typeof Errors.Type;
