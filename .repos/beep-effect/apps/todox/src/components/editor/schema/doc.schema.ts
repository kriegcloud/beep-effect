/**
 * Document serialization schemas for Lexical editor.
 *
 * @since 0.1.0
 */
import { $TodoxId } from "@beep/identity/packages";
import type { SerializedDocument as SerializedDocument_ } from "@lexical/file";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import { hasProperties } from "../commenting";

const $I = $TodoxId.create("lexical/schema/doc");

export const SerializedDocument = S.declare((u: unknown): u is SerializedDocument_ => {
  return P.isObject(u) && hasProperties("source", "description", "lastSaved", "editorState")(u);
});

export type SerializedDocument = typeof SerializedDocument.Type;

/**
 * Schema for document hash strings.
 * Format: #doc=<base64-encoded-gzip-compressed-json>
 *
 * @since 0.1.0
 */
export const DocumentHashString = S.String.pipe(
  S.pattern(/^#doc=.*$/),
  S.annotations(
    $I.annotations("DocumentHashString", {
      description: "A document hash string in the format #doc=<encoded-data>",
    })
  )
);

export declare namespace DocumentHashString {
  export type Type = typeof DocumentHashString.Type;
}

/**
 * Configuration options for creating a SerializedDocument.
 *
 * @since 0.1.0
 */
export class SerializedDocumentConfig extends S.Class<SerializedDocumentConfig>($I`SerializedDocumentConfig`)(
  {
    /**
     * Custom source identifier for the document
     */
    source: S.optional(S.String).annotations({
      description: 'Custom source identifier, defaults to "Lexical"',
    }),
    /**
     * Custom timestamp for the document
     */
    lastSaved: S.optional(S.Number).annotations({
      description: "Custom timestamp in epoch milliseconds",
    }),
  },
  $I.annotations("SerializedDocumentConfig", {
    description: "Configuration options for creating a SerializedDocument",
  })
) {}
