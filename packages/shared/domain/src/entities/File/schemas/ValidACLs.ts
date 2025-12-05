import { BS } from "@beep/schema";
export class ValidACLs extends BS.StringLiteralKit("public-read", "private", {
  enumMapping: [
    ["public-read", "PUBLIC_READ"],
    ["private", "PRIVATE"],
  ],
}) {}
// export type ACL = (typeof ValidACLs)[number];

export declare namespace ValidACLs {
  export type Type = typeof ValidACLs.Type;
  export type Encoded = typeof ValidACLs.Encoded;
}
