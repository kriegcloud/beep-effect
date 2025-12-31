import { BS } from "@beep/schema";

export class AllowedHeaders extends BS.StringLiteralKit(
  "Content-Type",
  "Authorization",
  "B3",
  "traceparent",
  "x-captcha-response"
).annotations({
  description: "Allowed headers for API routes",
}) {}

export declare namespace AllowedHeaders {
  export type Type = typeof AllowedHeaders.Type;
  export type Encoded = typeof AllowedHeaders.Encoded;
}
