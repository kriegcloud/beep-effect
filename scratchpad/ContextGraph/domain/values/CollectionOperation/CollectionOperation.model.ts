/**
 * RDF Term type value object for the context graph.
 *
 * @since 0.0.0
 * @packageDocumentationq
 */
import {$ScratchpadId} from "@beep/identity";
import {LiteralKit} from "@beep/schema";

const $I = $ScratchpadId.create(
  "values/CollectionOperation/CollectionOperation.model");

export const CollectionOperation = LiteralKit([
  "LIST_COLLECTIONS",
  "UPDATE_COLLECTION",
  "DELETE_COLLECTION"
]).pipe($I.annoteSchema("CollectionOperation", {
  description: "",
}));

export type CollectionOperation = typeof CollectionOperation.Type;
