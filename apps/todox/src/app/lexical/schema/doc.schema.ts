/**
 * Document serialization schemas for Lexical editor.
 *
 * @since 0.1.0
 */
import { $TodoxId } from "@beep/identity/packages";
import * as S from "effect/Schema";

import { SerializedEditorState } from "./schemas";

const $I = $TodoxId.create("lexical/schema/doc");

/**
 * Schema representing a serialized Lexical document.
 * Matches the SerializedDocument interface from @lexical/file.
 *
 * @since 0.1.0
 */
export class SerializedDocument extends S.Class<SerializedDocument>($I`SerializedDocument`)(
  {
    /**
     * The serialized editorState produced by editorState.toJSON()
     */
    editorState: SerializedEditorState,
    /**
     * The time this document was created in epoch milliseconds (Date.now())
     */
    lastSaved: S.Number.annotations({
      description: "Timestamp in epoch milliseconds when the document was last saved",
    }),
    /**
     * The source of the document, defaults to "Lexical"
     */
    source: S.String.annotations({
      description: 'The source of the document, defaults to "Lexical"',
    }),
  },
  $I.annotations("SerializedDocument", {
    description: "A serialized Lexical document with metadata",
  })
) {}

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
