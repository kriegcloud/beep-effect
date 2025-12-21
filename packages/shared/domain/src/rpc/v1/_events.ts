import { $SharedDomainId } from "@beep/identity/packages";
import { File } from "@beep/shared-domain/entities";
import * as S from "effect/Schema";

const $I = $SharedDomainId.create("rpc/_events");

export class Event extends S.Union(
  S.TaggedStruct("Files.Uploaded", {
    file: File.Model,
  })
).annotations(
  $I.annotations("SharedEvent", {
    description: "Event for rpc",
  })
) {}

export declare namespace Event {
  export type Type = typeof Event.Type;
  export type Encoded = typeof Event.Encoded;
}
