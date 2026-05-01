/**
 * Tenancy user entity model.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $TenancyDomainId } from "@beep/identity/packages";
import * as EntitySchema from "@beep/schema/EntitySchema";
import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity";
import * as Tenancy from "@beep/shared-domain/identity/Tenancy";
import * as S from "effect/Schema";
import { UserRole } from "./User.values.js";

const $I = $TenancyDomainId.create("entities/User/User.model");

/**
 * Human account inside an organization.
 *
 * @example
 * ```ts
 * import { User } from "@beep/tenancy-domain"
 *
 * console.log(User.definition.entityId.resource)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class User extends BaseEntity.Class<User>($I`User`)(
  Tenancy.UserId,
  {
    fields: {
      displayName: S.String,
      fixtureKey: S.String,
      role: UserRole,
    },
    persisted: {
      displayName: EntitySchema.persist.text({
        columnName: "display_name",
      }),
      fixtureKey: EntitySchema.persist.text({
        columnName: "fixture_key",
      }),
      role: EntitySchema.persist.literal({
        columnName: "role",
      }),
    },
  },
  $I.annote("User", {
    description: "Human account inside a tenant organization.",
  })
) {}
