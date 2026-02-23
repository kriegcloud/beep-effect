import { $IamDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("entities/SsoProvider/SsoProvider.model");

/**
 * SSO Provider model representing Single Sign-On provider configurations.
 * Maps to the `ssoProvider` table in the database.
 */
export class Model extends M.Class<Model>($I`SsoProviderModel`)(
  makeFields(IamEntityIds.SsoProviderId, {
    issuer: S.String,
    domain: S.String,
    oidcConfig: BS.FieldOptionOmittable(S.String),
    samlConfig: BS.FieldOptionOmittable(S.String),
    userId: BS.FieldOptionOmittable(SharedEntityIds.UserId),
    providerId: S.String,

    organizationId: BS.FieldOptionOmittable(SharedEntityIds.OrganizationId),
  }),
  $I.annotations("SsoProviderModel", {
    title: "SSO Provider Model",
    description: "SSO Provider model representing Single Sign-On provider configurations.",
  })
) {
  static readonly utils = modelKit(Model);
}
