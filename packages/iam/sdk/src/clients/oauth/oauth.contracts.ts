import { BS } from "@beep/schema";
import * as S from "effect/Schema";

export class OAuthRegisterContract extends S.Class<OAuthRegisterContract>("OAuthRegisterContract")({
  client_name: S.NonEmptyTrimmedString,
  redirect_uris: S.mutable(S.Array(BS.URLString)),
}) {}

export namespace OAuthRegisterContract {
  export type Type = typeof OAuthRegisterContract.Type;
  export type Encoded = typeof OAuthRegisterContract.Encoded;
}
