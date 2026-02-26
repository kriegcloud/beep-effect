/**
 * Media-related schemas and runtime interfaces for ontology object properties.
 *
 * @since 0.0.0
 * @module @beep/ontology/object/Media
 */
import { $OntologyId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $OntologyId.create("object/Media");

/**
 * Runtime media accessor methods for a media reference property.
 *
 * @since 0.0.0
 * @category models
 */
export interface Media {
  /** Fetch metadata for a media reference property. */
  readonly fetchMetadata: () => Promise<MediaMetadata>;
  /** Fetch binary content for a media reference property. */
  readonly fetchContents: () => Promise<Response>;
  /** Return the underlying media reference identifier payload. */
  readonly getMediaReference: () => MediaReference;
}

/**
 * Unique identifier payload for a media item.
 *
 * @since 0.0.0
 * @category models
 */
export class MediaReference extends S.Class<MediaReference>($I`MediaReference`)(
  {
    mimeType: S.String,
    reference: S.Struct({
      type: S.tag("mediaSetViewItem"),
      mediaSetViewItem: S.Struct({
        mediaItemRid: S.String,
        mediaSetRid: S.String,
        mediaSetViewRid: S.String,
        token: S.optionalKey(S.String),
        readToken: S.optionalKey(S.String),
      }),
    }),
  },
  $I.annote("MediaReference", {
    description: "Identifier payload for a media item stored in a media set view.",
  })
) {}

/**
 * Payload used when uploading media content.
 *
 * @since 0.0.0
 * @category models
 */
export class MediaUpload extends S.Class<MediaUpload>($I`MediaUpload`)(
  {
    fileName: S.String,
    data: S.instanceOf(Blob),
  },
  $I.annote("MediaUpload", {
    description: "Input payload for uploading media, including filename and blob data.",
  })
) {}

/**
 * Metadata returned for a media item.
 *
 * @since 0.0.0
 * @category models
 */
export class MediaMetadata extends S.Class<MediaMetadata>($I`MediaMetadata`)(
  {
    path: S.optionalKey(S.String),
    sizeBytes: S.Number,
    mediaType: S.String,
  },
  $I.annote("MediaMetadata", {
    description: "Metadata for a media item, including media type, size, and optional path.",
  })
) {}
