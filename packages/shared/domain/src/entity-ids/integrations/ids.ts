import { $SharedDomainId } from "@beep/identity/packages";
import { EntityId } from "@beep/schema/identity";
import type * as S from "effect/Schema";

const $I = $SharedDomainId.create("entity-ids/integrations/ids");

const make = EntityId.builder("integrations");

export const IntegrationTokenId = make("integration_token", {
  brand: "IntegrationTokenId",
  actions: ["create", "read", "update", "delete", "refresh", "*"],
}).annotations(
  $I.annotations("IntegrationTokenId", {
    description: "A unique identifier for an integration token",
  })
);

export declare namespace IntegrationTokenId {
  export type Type = S.Schema.Type<typeof IntegrationTokenId>;
  export type Encoded = S.Schema.Encoded<typeof IntegrationTokenId>;

  export namespace RowId {
    export type Type = typeof IntegrationTokenId.privateSchema.Type;
    export type Encoded = typeof IntegrationTokenId.privateSchema.Encoded;
  }
}

export const Ids = {
  IntegrationTokenId,
} as const;
