/**
 * Tenancy principal entity model.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $TenancyDomainId } from "@beep/identity/packages";
import * as EntitySchema from "@beep/schema/EntitySchema";
import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity";
import * as Tenancy from "@beep/shared-domain/identity/Tenancy";
import * as S from "effect/Schema";
import { PrincipalKind } from "./Principal.values.js";

const $I = $TenancyDomainId.create("entities/Principal/Principal.model");

/**
 * Actor reference used by the fixture proof before authoritative writes exist.
 *
 * @example
 * ```ts
 * import { Principal } from "@beep/tenancy-domain"
 *
 * console.log(Principal.definition.entityId.tableName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class Principal extends BaseEntity.Class<Principal>($I`Principal`)(
  Tenancy.PrincipalId,
  {
    fields: {
      agentFixtureKey: S.String.pipe(S.OptionFromNullOr),
      fixtureKey: S.String,
      kind: PrincipalKind,
      userFixtureKey: S.String.pipe(S.OptionFromNullOr),
    },
    persisted: {
      agentFixtureKey: EntitySchema.persist.text({
        columnName: "agent_fixture_key",
      }),
      fixtureKey: EntitySchema.persist.text({
        columnName: "fixture_key",
      }),
      kind: EntitySchema.persist.literal({
        columnName: "kind",
      }),
      userFixtureKey: EntitySchema.persist.text({
        columnName: "user_fixture_key",
      }),
    },
  },
  $I.annote("Principal", {
    description: "Tenant-scoped actor reference used by the runtime proof.",
  })
) {}
