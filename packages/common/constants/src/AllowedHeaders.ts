import { $ConstantsId } from "@beep/identity/packages";
import { BS } from "@beep/schema";

const $I = $ConstantsId.create("AllowedHeaders");

export class AllowedHeaders extends BS.StringLiteralKit(
  "Content-Type",
  "Authorization",
  "B3",
  "traceparent",
  "x-captcha-response",
  "x-captcha-user-remote-ip"
).annotations(
  $I.annotations("AllowedHeaders", {
    description: "Allowed headers for API routes",
  })
) {}

export declare namespace AllowedHeaders {
  export type Type = typeof AllowedHeaders.Type;
  export type Encoded = typeof AllowedHeaders.Encoded;
}
