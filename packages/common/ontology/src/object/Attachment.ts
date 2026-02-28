/**
 * Attachment model surfaces for ontology object properties.
 *
 * @since 0.0.0
 * @module @beep/ontology/object/Attachment
 */
import { $OntologyId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $OntologyId.create("object/Attachment");

/**
 * Runtime attachment accessor methods for attachment properties.
 *
 * @since 0.0.0
 * @category models
 */
export interface Attachment {
  readonly rid: string;
  /**
   * Fetches metadata for an attachment.
   */
  readonly fetchMetadata: () => Promise<AttachmentMetadata>;
  /**
   * Fetches attachment binary content.
   */
  readonly fetchContents: () => Promise<Response>;
}

/**
 * Payload used to upload attachment content.
 *
 * @since 0.0.0
 * @category models
 */
export class AttachmentUpload extends S.Class<AttachmentUpload>($I`AttachmentUpload`)(
  {
    name: S.String,
    data: S.instanceOf(Blob),
  },
  $I.annote("AttachmentUpload", {
    description: "Upload payload for attachments including display name and blob content.",
  })
) {}

/**
 * Metadata returned for an attachment.
 *
 * @since 0.0.0
 * @category models
 */
export class AttachmentMetadata extends S.Class<AttachmentMetadata>($I`AttachmentMetadata`)(
  {
    rid: S.String,
    filename: S.String,
    sizeBytes: S.Number,
    mediaType: S.String,
  },
  $I.annote("AttachmentMetadata", {
    description: "Attachment metadata including rid, file name, media type, and size in bytes.",
  })
) {}
