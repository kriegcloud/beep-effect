import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $IamClientId.create("core/sign-out");

export class Success extends S.Class<Success>($I`Success`)({
  success: S.Boolean,
}) {}
