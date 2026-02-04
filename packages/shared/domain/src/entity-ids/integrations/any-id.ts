import { $SharedDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import * as Ids from "./ids";

const $I = $SharedDomainId.create("entity-ids/integrations/any-id");

export class AnyId extends S.Union(Ids.IntegrationTokenId).annotations(
  $I.annotations("AnyIntegrationsId", {
    description: "Any entity id within the integrations domain context",
  })
) {}

export declare namespace AnyId {
  export type Type = S.Schema.Type<typeof AnyId>;
  export type Encoded = S.Schema.Encoded<typeof AnyId>;
}
