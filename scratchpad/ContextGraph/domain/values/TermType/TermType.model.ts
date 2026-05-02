/**
 * RDF Term type value object for the context graph.
 *
 * @since 0.0.0
 * @packageDocumentationq
 */
import { $ScratchpadId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";

const $I = $ScratchpadId.create("values/TermType/TermType.model");

export const TermType = LiteralKit(
  [
    "IRI",
    "BLANK",
    "LITERAL",
    "TRIPLE"
  ]
).pipe(
  $I.annoteSchema("TermType", {
    description: "",
  })
);

export type TermType = typeof TermType.Type;
