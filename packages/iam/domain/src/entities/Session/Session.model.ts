import { BS } from "@beep/schema";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

export const SessionModelSchemaId = Symbol.for("@beep/iam-domain/SessionModel");

/**
 * Session model representing user authentication sessions.
 * Maps to the `session` table in the database.
 */
export class Model extends M.Class<Model>(`SessionModel`)(
  makeFields(IamEntityIds.SessionId, {
    /** When this session expires */
    expiresAt: BS.DateTimeFromDate({
      description: "When this session expires",
    }),

    /** Unique session token */
    token: M.Sensitive(
      S.NonEmptyString.annotations({
        description: "Unique session token for authentication",
      })
    ),

    /** IP address where session was created */
    ipAddress: BS.FieldSensitiveOptionOmittable(
      S.String.pipe(
        S.pattern(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$|^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/)
      ).annotations({
        description: "IP address where the session was created",
        examples: ["192.168.1.1", "2001:db8::1"],
      })
    ),

    /** User agent string */
    userAgent: BS.FieldSensitiveOptionOmittable(
      S.String.annotations({
        description: "User agent string from the client",
      })
    ),

    /** User this session belongs to */
    userId: SharedEntityIds.UserId.annotations({
      description: "ID of the user this session belongs to",
    }),

    /** Currently active organization for this session */
    activeOrganizationId: SharedEntityIds.OrganizationId.annotations({
      description: "ID of the currently active organization",
    }),

    /** Currently active team for this session */
    activeTeamId: BS.FieldOptionOmittable(
      SharedEntityIds.TeamId.annotations({
        description: "ID of the currently active team",
      })
    ),

    /** User being impersonated (if any) */
    impersonatedBy: BS.FieldOptionOmittable(
      SharedEntityIds.UserId.annotations({
        description: "ID of the user performing impersonation (if applicable)",
      })
    ),
  }),
  {
    title: "Session Model",
    description: "Session model representing user authentication sessions.",
    schemaId: SessionModelSchemaId,
  }
) {
  static readonly utils = modelKit(Model);
}
