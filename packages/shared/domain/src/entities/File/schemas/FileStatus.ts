import { BS } from "@beep/schema";

export class FileStatus extends BS.StringLiteralKit(
  "PENDING",
  "PROCESSING",
  "FAILED",
  "READY",
  "PENDING_DELETION",
  "DELETED"
) {}

export declare namespace FileStatus {
  export type Type = typeof FileStatus.Type;
  export type Encoded = typeof FileStatus.Encoded;
}
