/**
 * RDF Term type value object for the context graph.
 *
 * @since 0.0.0
 * @packageDocumentationq
 */
import {$ScratchpadId} from "@beep/identity";
import {LiteralKit} from "@beep/schema";

const $I = $ScratchpadId.create(
  "values/KnowledgeOperation/KnowledgeOperation.model");

export const KnowledgeOperation = LiteralKit([
  "LIST_KG_CORES",
  "GET_KG_CORE",
  "DELETE_KG_CORE",
  "PUT_KG_CORE",
  "LOAD_KG_CORE",
]).pipe($I.annoteSchema("KnowledgeOperation", {
  description: "",
}));

export type LibrarianOperation = typeof KnowledgeOperation.Type;
