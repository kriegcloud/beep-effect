/**
 * Context Packet value schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $WorkspaceDomainId } from "@beep/identity/packages";
import * as EntityMixin from "@beep/shared-domain/entity/EntityMixin";
import * as S from "effect/Schema";

const $I = $WorkspaceDomainId.create("entities/ContextPacket/ContextPacket.values");

const UnknownRecord = S.Record(S.String, S.Unknown);

/**
 * Entity-specific fields contributed to the ContextPacket entity.
 *
 * @example
 * ```ts
 * import { ContextPacketProfileMixin } from "@beep/workspace-domain"
 *
 * console.log(ContextPacketProfileMixin)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const ContextPacketProfileMixin = EntityMixin.make($I`ContextPacketProfileMixin`)(
  {
    fixtureKey: S.String,
    scenarioFixtureKey: S.String,
    snapshot: UnknownRecord,
  },
  {
    description: "Runtime proof fields owned by the ContextPacket entity.",
    fields: {
      fixtureKey: {
        columnName: "fixture_key",
        description: "Stable fixture identifier for the context packet.",
        nullable: false,
        storageKind: "text",
        valueStrategy: "provided",
      },
      scenarioFixtureKey: {
        columnName: "scenario_fixture_key",
        description: "Fixture scenario that produced the context packet.",
        nullable: false,
        storageKind: "text",
        valueStrategy: "provided",
      },
      snapshot: {
        columnName: "snapshot",
        description: "Structured context packet payload retained by the proof.",
        nullable: false,
        storageKind: "json",
        valueStrategy: "provided",
      },
    },
  }
);

/**
 * Packed ContextPacket profile mixin.
 *
 * @example
 * ```ts
 * import { ContextPacketProfilePack } from "@beep/workspace-domain"
 *
 * console.log(ContextPacketProfilePack)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const ContextPacketProfilePack = EntityMixin.pack(ContextPacketProfileMixin);
