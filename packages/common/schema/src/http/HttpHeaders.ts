import * as S from "effect/Schema";

export class HttpHeaders extends S.Record({
  key: S.String,
  value: S.String,
}).annotations({
  schemaId: Symbol.for("@beep/schema/http/HttpHeaders"),
  identifier: "HttpHeaders",
  title: "Http Headers",
  description: "A value representing an http requests headers.",
}) {}

export declare namespace HttpHeaders {
  export type Type = typeof HttpHeaders.Type;
  export type Encoded = typeof HttpHeaders.Encoded;
}
