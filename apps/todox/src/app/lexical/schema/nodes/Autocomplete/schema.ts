import { $TodoxId } from "@beep/identity/packages";
import { SerializedLexicalNode } from "@beep/todox/app/lexical/schema/schemas";
import * as S from "effect/Schema";
import { Text } from "../Text";

const $I = $TodoxId.create("app/lexical/schema/nodes/Autocomplete/schema");

export const makeAutocompleteNodeVariant = Text.ModeType.toTagged("mode").composer({
  uuid: S.UUID,
});

export class Node extends S.Union(
  makeAutocompleteNodeVariant.normal(SerializedLexicalNode.fields),
  makeAutocompleteNodeVariant.token(SerializedLexicalNode.fields),
  makeAutocompleteNodeVariant.segmented(SerializedLexicalNode.fields)
).annotations(
  $I.annotations("Node", {
    description: "Serialized autocomplete node",
  })
) {}

export declare namespace Node {
  export type Type = typeof Node.Type;
  export type Encoded = typeof Node.Encoded;
}
