import * as S from "effect/Schema";
import {File} from "@beep/shared-domain/entities";
import { $SharedDomainId } from "@beep/identity/packages";

const $I = $SharedDomainId.create("api/v1/rpc/files/events");

export class Events extends S.Union(
  S.TaggedStruct("Files.Uploaded", {
    file: File.Model
  })
).annotations($I.annotations("FilesEvents", {
  description: "Events emitted by the files RPC."
})) {}

export declare namespace Events {
  export type Type = typeof Events.Type;
  export type Encoded = typeof Events.Encoded;
}