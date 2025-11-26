import { BS } from "@beep/schema";

export const AllowedHttpMethodsKit = BS.HttpMethod.derive("GET", "POST", "PUT", "DELETE", "PATCH");

export class AllowedHttpMethods extends AllowedHttpMethodsKit.Schema.annotations({
  description: "Allowed HTTP methods for API routes",
}) {
  static Enum = AllowedHttpMethodsKit.Enum;
  static Options = AllowedHttpMethodsKit.Options;
}

export declare namespace AllowedHttpMethods {
  export type Type = typeof AllowedHttpMethods.Type;
  export type Encoded = typeof AllowedHttpMethods.Encoded;
}
