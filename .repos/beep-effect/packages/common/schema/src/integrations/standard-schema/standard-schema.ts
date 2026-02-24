import { $SchemaId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $SchemaId.create("integrations/standard-schema");

export class Any extends S.standardSchemaV1(S.Any).annotations(
  $I.annotations("Any", {
    description: "Any standard schema",
  })
) {}

export declare namespace Any {
  export type Type = typeof Any.Type;
}
