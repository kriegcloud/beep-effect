import { BS } from "@beep/schema";
import type * as S from "effect/Schema";




export class DeviceCodeStatus extends BS.StringLiteralKit("pending", "approved", "denied") {

}
export const makeDeviceCodeStatusPgEnum = BS.toPgEnum(DeviceCodeStatus);

export declare namespace DeviceCodeStatus {
  export type Type = S.Schema.Type<typeof DeviceCodeStatus>;
  export type Encoded = S.Schema.Encoded<typeof DeviceCodeStatus>;
}
