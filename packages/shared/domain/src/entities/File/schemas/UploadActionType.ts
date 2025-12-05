import { BS } from "@beep/schema";

export class UploadActionType extends BS.StringLiteralKit("upload") {}

export declare namespace UploadActionType {
  export type Type = typeof UploadActionType.Type;
  export type Encoded = typeof UploadActionType.Encoded;
}
