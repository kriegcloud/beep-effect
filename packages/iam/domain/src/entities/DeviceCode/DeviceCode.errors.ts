import { $IamDomainId } from "@beep/identity/packages";
import { IamEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("entities/DeviceCode/DeviceCode.errors");

export class DeviceCodeNotFoundError extends S.TaggedError<DeviceCodeNotFoundError>()(
  $I`DeviceCodeNotFoundError`,
  {
    id: IamEntityIds.DeviceCodeId,
  },
  $I.annotationsHttp("DeviceCodeNotFoundError", {
    status: 404,
    description: "Error when a device code with the specified ID cannot be found.",
  })
) {}

export class DeviceCodePermissionDeniedError extends S.TaggedError<DeviceCodePermissionDeniedError>()(
  $I`DeviceCodePermissionDeniedError`,
  {
    id: IamEntityIds.DeviceCodeId,
  },
  $I.annotationsHttp("DeviceCodePermissionDeniedError", {
    status: 403,
    description: "Thrown when the user lacks permission to perform the requested action on the device code.",
  })
) {}

export const Errors = S.Union(DeviceCodeNotFoundError, DeviceCodePermissionDeniedError);
export type Errors = typeof Errors.Type;
