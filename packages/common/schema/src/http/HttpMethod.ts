import { stringLiteralKit } from "@beep/schema/kits";

//----------------------------------------------------------------------------------------------------------------------
// HTTP Method
//----------------------------------------------------------------------------------------------------------------------
export const HttpMethodKit = stringLiteralKit("GET", "POST", "PATCH", "PUT", "DELETE", "HEAD", "OPTIONS");

export class HttpMethod extends HttpMethodKit.Schema.annotations({
  schemaId: Symbol.for("@beep/schema/http/HttpMethod"),
  identifier: "HttpMethod",
  title: "Http Method",
  description: "The value of an http requests method.",
  examples: HttpMethodKit.Options,
}) {
  static readonly Options = HttpMethodKit.Options;
  static readonly Enum = HttpMethodKit.Enum;
}

export declare namespace HttpMethod {
  export type Type = typeof HttpMethod.Type;
  export type Encoded = typeof HttpMethod.Encoded;
}
