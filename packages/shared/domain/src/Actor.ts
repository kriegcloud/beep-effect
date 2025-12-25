import { $SharedDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { AgentId, UserId } from "./entity-ids/shared";

const $I = $SharedDomainId.create("Actor");

export class ActorId extends S.Union(UserId, AgentId).annotations(
  $I.annotations("ActorId", {
    description: "An actor id",
  })
) {}

export declare namespace ActorId {
  export type Type = typeof ActorId.Type;
  export type Encoded = typeof ActorId.Encoded;
}
