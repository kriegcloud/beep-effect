/**
 * RDF Term type value object for the context graph.
 *
 * @since 0.0.0
 * @packageDocumentationq
 */
import { $ScratchpadId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";

const $I = $ScratchpadId.create("values/InitialPosition/InitialPosition.model");

export const InitialPosition = LiteralKit(
  [
    "LATEST",
    "EARLIEST"
  ]
).pipe(
  $I.annoteSchema("InitialPosition", {
    description: "",
  })
);

export type InitialPosition = typeof InitialPosition.Type;
