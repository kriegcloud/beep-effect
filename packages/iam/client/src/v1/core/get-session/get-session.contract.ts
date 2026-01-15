import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import * as Common from "../../_common";

const $I = $IamClientId.create("core/get-session");

export const SessionData = S.Struct({
  session: Common.DomainSessionFromBetterAuthSession,
  user: Common.DomainUserFromBetterAuthUser,
});

export type SessionData = typeof SessionData.Type;

export class Response extends S.Class<Response>($I`Response`)({
  data: S.NullOr(SessionData),
}) {}

export class Success extends S.Class<Success>($I`Success`)({
  data: S.OptionFromNullOr(SessionData),
}) {}