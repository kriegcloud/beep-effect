import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $IamClientId.create("multi-session/list-sessions");

/**
 * Session schema based on Better Auth response.
 *
 * Note: Better Auth client SDK returns Date objects, not ISO strings.
 */
export class Session extends S.Class<Session>($I`Session`)(
  {
    id: S.String,
    userId: S.String,
    token: S.String,
    expiresAt: S.Date,
    ipAddress: S.optionalWith(S.String, { nullable: true }),
    userAgent: S.optionalWith(S.String, { nullable: true }),
    createdAt: S.Date,
    updatedAt: S.Date,
  },
  $I.annotations("Session", {
    description: "A user session from the multi-session plugin.",
  })
) {}

/**
 * Success response - array of sessions.
 */
export const Success = S.Array(Session);
export type Success = S.Schema.Type<typeof Success>;
