/**
 * RDF Term type value object for the context graph.
 *
 * @since 0.0.0
 * @packageDocumentationq
 */
import { $ScratchpadId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";

const $I = $ScratchpadId.create("values/LibrarianOperation/LibrarianOperation.model");

export const LibrarianOperation = LiteralKit(
  [
    "ADD_DOCUMENT",
    "REMOVE_DOCUMENT",
    "LIST_DOCUMENTS",
    "GET_DOCUMENT_METADATA",
    "GET_DOCUMENT_CONTENT",
    "ADD_CHILD_DOCUMENT",
    "LIST_CHILDREN",
    "ADD_PROCESSING",
    "REMOVE_PROCESSING",
    "LIST_PROCESSINGS",
  ]
).pipe(
  $I.annoteSchema("LibrarianOperation", {
    description: "",
  })
);

export type LibrarianOperation = typeof LibrarianOperation.Type;
