/**
 * RDF Term type value object for the context graph.
 *
 * @since 0.0.0
 * @packageDocumentationq
 */
import { $ScratchpadId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";

const $I = $ScratchpadId.create("values/ConsumerType/ConsumerType.model");

export const ConsumerType = LiteralKit(
  [
    "SHARED",
    "EXCLUSIVE",
    "FAILOVER"
  ]
).pipe(
  $I.annoteSchema("ConsumerType", {
    description: "",
  })
);

export type ConsumerType = typeof ConsumerType.Type;
