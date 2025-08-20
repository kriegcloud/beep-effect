import {Common, IamEntityIds, SharedEntityIds} from "@beep/shared-domain";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

/**
 * Session model representing user authentication sessions.
 * Maps to the `session` table in the database.
 */
export class Model extends M.Class<Model>(`Session.Model`)({
  /** Primary key identifier for the session */
  id: M.Generated(IamEntityIds.SessionId),

  /** When this session expires */
  expiresAt: Common.DateTimeFromDate({
    description: "When this session expires",
  }),

  /** Unique session token */
  token: S.NonEmptyString.annotations({
    description: "Unique session token for authentication",
  }),

  /** IP address where session was created */
  ipAddress: M.FieldOption(
    S.String.pipe(
      S.pattern(
        /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$|^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/,
      ),
    ).annotations({
      description: "IP address where the session was created",
      examples: ["192.168.1.1", "2001:db8::1"],
    }),
  ),

  /** User agent string */
  userAgent: M.FieldOption(
    S.String.annotations({
      description: "User agent string from the client",
    }),
  ),

  /** User this session belongs to */
  userId: IamEntityIds.UserId.annotations({
    description: "ID of the user this session belongs to",
  }),

  /** Currently active organization for this session */
  activeOrganizationId: M.FieldOption(
    SharedEntityIds.OrganizationId.annotations({
      description: "ID of the currently active organization",
    }),
  ),

  /** Currently active team for this session */
  activeTeamId: M.FieldOption(
    SharedEntityIds.TeamId.annotations({
      description: "ID of the currently active team",
    }),
  ),

  /** User being impersonated (if any) */
  impersonatedBy: M.FieldOption(
    IamEntityIds.UserId.annotations({
      description: "ID of the user performing impersonation (if applicable)",
    }),
  ),

  // Audit and tracking columns
  ...Common.globalColumns,
}) {

}