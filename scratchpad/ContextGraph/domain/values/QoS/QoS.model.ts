/**
 * RDF Term type value object for the context graph.
 *
 * @since 0.0.0
 * @packageDocumentationq
 */
import {$ScratchpadId} from "@beep/identity";
import {LiteralKit} from "@beep/schema";

const $I = $ScratchpadId.create(
  "values/QoS/QoS.model");

export const QoS = LiteralKit([
  "q0",
  "q1",
  "q2"
]).pipe($I.annoteSchema("QoS", {
  description: "",
}));

export type QoS = typeof QoS.Type;
