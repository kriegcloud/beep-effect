import { $ConstantsId } from "@beep/identity/packages";
import { BS } from "@beep/schema";

const $I = $ConstantsId.create("AllowedHttpMethods");

export const AllowedHttpMethodsKit = BS.HttpMethod.derive("GET", "POST", "PUT", "DELETE", "PATCH");

export class AllowedHttpMethods extends AllowedHttpMethodsKit.annotations(
  $I.annotations("AllowedHttpMethods", {
    description: "Allowed HTTP methods for API routes",
  })
) {}

export declare namespace AllowedHttpMethods {
  export type Type = typeof AllowedHttpMethods.Type;
  export type Encoded = typeof AllowedHttpMethods.Encoded;
}
