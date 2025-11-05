import { BS } from "@beep/schema";
import type * as S from "effect/Schema";

const DeviceCodeStatusKit = BS.stringLiteralKit("pending", "approved", "denied");

export const makeDeviceCodeStatusPgEnum = DeviceCodeStatusKit.toPgEnum;

export class DeviceCodeStatus extends DeviceCodeStatusKit.Schema {
  static readonly Options = DeviceCodeStatusKit.Options;
  static readonly Enum = DeviceCodeStatusKit.Enum;
}

export declare namespace DeviceCodeStatus {
  export type Type = S.Schema.Type<typeof DeviceCodeStatus>;
  export type Encoded = S.Schema.Encoded<typeof DeviceCodeStatus>;
}
