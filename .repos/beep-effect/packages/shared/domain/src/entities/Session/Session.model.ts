import { $SharedDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { makeFields } from "@beep/shared-domain/common";
import { SharedEntityIds } from "@beep/shared-domain/entity-ids";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as Arbitrary from "effect/Arbitrary";
import * as FC from "effect/FastCheck";
import * as S from "effect/Schema";

const $I = $SharedDomainId.create("entities/Session/Session.model");

export class Model extends M.Class<Model>($I`SessionModel`)(
  makeFields(SharedEntityIds.SessionId, {
    expiresAt: BS.DateTimeUtcFromAllAcceptable.annotations({
      description: "When this session expires",
    }),
    token: M.Sensitive(
      S.NonEmptyString.annotations({
        description: "Unique session token for authentication",
      })
    ),
    ipAddress: BS.FieldSensitiveOptionOmittable(S.String),
    userAgent: BS.FieldSensitiveOptionOmittable(
      S.String.annotations({
        description: "User agent string from the client",
      })
    ),
    userId: SharedEntityIds.UserId.annotations({
      description: "ID of the user this session belongs to",
    }),
    activeOrganizationId: SharedEntityIds.OrganizationId.annotations({
      description: "ID of the currently active organization",
    }),
    activeTeamId: BS.FieldOptionOmittable(
      SharedEntityIds.TeamId.annotations({
        description: "ID of the currently active team",
      })
    ),
    impersonatedBy: BS.FieldOptionOmittable(
      SharedEntityIds.UserId.annotations({
        description: "ID of the user performing impersonation (if applicable)",
      })
    ),
  }),
  $I.annotations("SessionModel", {
    description: "Session model representing user authentication sessions.",
  })
) {
  static readonly utils = modelKit(Model);
  static readonly decodeUnknown = S.decodeUnknown(Model);
  static readonly Arb = Arbitrary.make(Model);
  static readonly MockOne = () => this.Mock(1)[0]!;
  static readonly Mock = (qty = 1) => FC.sample(this.Arb, qty);
}
