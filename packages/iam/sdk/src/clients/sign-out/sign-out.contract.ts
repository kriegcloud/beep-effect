import { BS } from "@beep/schema";
import * as S from "effect/Schema";

export class SignOutContract extends BS.Class<SignOutContract>("SignOutContract")({
  onSuccess: new BS.Fn({
    input: S.Undefined,
    output: S.Void,
  }).Schema,
}) {}

export declare namespace SignOutContract {
  export type Type = typeof SignOutContract.Type;
  export type Encoded = typeof SignOutContract.Encoded;
}
