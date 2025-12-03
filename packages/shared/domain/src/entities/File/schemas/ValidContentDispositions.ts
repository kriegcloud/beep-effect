import { BS } from "@beep/schema";

export class ValidContentDispositions extends BS.StringLiteralKit("inline", "attachment") {}

export declare namespace ValidContentDispositions {
  export type Type = typeof ValidContentDispositions.Type;
  export type Encoded = typeof ValidContentDispositions.Encoded;
}
