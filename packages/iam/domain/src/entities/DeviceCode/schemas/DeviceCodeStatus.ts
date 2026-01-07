import { $IamDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import type * as S from "effect/Schema";

const $I = $IamDomainId.create("entities/DeviceCode/schemas/DeviceCodeStatus");

export class DeviceCodeStatus extends BS.StringLiteralKit("pending", "approved", "denied").annotations(
  $I.annotations("DeviceCodeStatus", {
    description: "Device authorization flow status (pending, approved, or denied)",
  })
) {}
export const makeDeviceCodeStatusPgEnum = BS.toPgEnum(DeviceCodeStatus);

export declare namespace DeviceCodeStatus {
  export type Type = S.Schema.Type<typeof DeviceCodeStatus>;
  export type Encoded = S.Schema.Encoded<typeof DeviceCodeStatus>;
}
