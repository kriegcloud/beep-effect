import { BS } from "@beep/schema";

export class ProgressGranularity extends BS.StringLiteralKit("all", "fine", "coarse") {}

export declare namespace ProgressGranularity {
  export type Type = typeof ProgressGranularity.Type;
  export type Encoded = typeof ProgressGranularity.Encoded;
}
