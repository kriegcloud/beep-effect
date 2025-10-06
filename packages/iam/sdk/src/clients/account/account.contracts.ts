import { BS } from "@beep/schema";
import * as S from "effect/Schema";

//----------------------------------------------------------------------------------------------------------------------
// Passkey's
//----------------------------------------------------------------------------------------------------------------------
export class RegisterPasskeyContract extends BS.Class<RegisterPasskeyContract>("RegisterPasskeyContract")({
  name: S.NonEmptyTrimmedString,
}) {}
