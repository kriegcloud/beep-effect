import { BS } from "@beep/schema";
/**
 * Valid options for the `uploadthing-hook` header
 * for requests coming from UT server
 */
export class UploadHook extends BS.StringLiteralKit("callback", "error") {}

export declare namespace UploadHook {
  export type Type = typeof UploadHook.Type;
  export type Encoded = typeof UploadHook.Encoded;
}
