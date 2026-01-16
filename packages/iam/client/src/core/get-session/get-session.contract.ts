import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import * as Common from "../../_common";

const $I = $IamClientId.create("core/get-session");

export const SessionData = S.Struct({
  session: Common.DomainSessionFromBetterAuthSession,
  user: Common.DomainUserFromBetterAuthUser,
});

export type SessionData = typeof SessionData.Type;

/**
 * Success schema for get-session.
 *
 * Decodes `{ data: { session, user } | null }` response from Better Auth
 * and transforms to `{ data: Option<SessionData> }`.
 */
export class Success extends S.Class<Success>($I`Success`)({
  data: S.OptionFromNullOr(SessionData),
}) {}
