/**
 * Domain Model: Image
 *
 * Types for image extraction, storage, and LLM multimodal access.
 * Supports the image pipeline from Jina extraction through to prompt generation.
 *
 * @since 2.0.0
 * @module Domain/Model/Image
 */

import { Schema } from "effect"

// =============================================================================
// Image Role
// =============================================================================

/**
 * Role of an image in the source document
 *
 * - hero: Featured/main image (e.g., from Jina's `image` field)
 * - inline: Embedded in markdown content
 * - thumbnail: Small preview image
 *
 * @since 2.0.0
 * @category Types
 */
export const ImageRole = Schema.Literal("hero", "inline", "thumbnail")
export type ImageRole = typeof ImageRole.Type

// =============================================================================
// Image Candidate
// =============================================================================

/**
 * ImageCandidate - Raw extraction output from Jina/markdown parsing
 *
 * Represents an image discovered during content ingestion before
 * it has been fetched, hashed, or stored.
 *
 * @example
 * ```typescript
 * const candidate: ImageCandidate = {
 *   sourceUrl: "https://example.com/image.jpg",
 *   alt: "A photo of Seattle skyline",
 *   role: "hero",
 *   order: 0,
 *   referrerUrl: "https://example.com/article"
 * }
 * ```
 *
 * @since 2.0.0
 * @category Types
 */
export const ImageCandidateSchema = Schema.Struct({
  /**
   * Original URL of the image
   */
  sourceUrl: Schema.String.annotations({
    title: "Source URL",
    description: "Original URL where the image was found"
  }),

  /**
   * Alt text from the image tag or markdown
   */
  alt: Schema.optional(Schema.String).annotations({
    title: "Alt Text",
    description: "Alternative text for accessibility"
  }),

  /**
   * Caption or surrounding context
   */
  caption: Schema.optional(Schema.String).annotations({
    title: "Caption",
    description: "Image caption or figure text"
  }),

  /**
   * Role of the image in the document
   */
  role: ImageRole.annotations({
    title: "Role",
    description: "Image role: hero, inline, or thumbnail"
  }),

  /**
   * Order in which the image appears (0-indexed)
   */
  order: Schema.Number.pipe(
    Schema.int(),
    Schema.nonNegative()
  ).annotations({
    title: "Order",
    description: "Position in document (0-indexed)"
  }),

  /**
   * URL of the page where this image was found
   */
  referrerUrl: Schema.String.annotations({
    title: "Referrer URL",
    description: "Page URL where image was discovered"
  })
}).annotations({
  title: "ImageCandidate",
  description: "Raw image extraction output before fetch/storage"
})

export type ImageCandidate = Schema.Schema.Type<typeof ImageCandidateSchema>

// =============================================================================
// Image Asset
// =============================================================================

/**
 * ImageAsset - Deduplicated blob metadata
 *
 * Represents a stored image after fetching and hashing.
 * Content-addressed by SHA-256 hash for deduplication.
 *
 * @example
 * ```typescript
 * const asset: ImageAsset = {
 *   hash: "a1b2c3d4e5f6...",
 *   contentType: "image/jpeg",
 *   sizeBytes: 102400,
 *   width: 1200,
 *   height: 800,
 *   storagePath: "assets/images/a1b2c3d4e5f6.../original"
 * }
 * ```
 *
 * @since 2.0.0
 * @category Types
 */
export const ImageAssetSchema = Schema.Struct({
  /**
   * Content hash (SHA-256, hex-encoded)
   */
  hash: Schema.String.annotations({
    title: "Hash",
    description: "SHA-256 content hash for deduplication"
  }),

  /**
   * MIME type of the image
   */
  contentType: Schema.String.annotations({
    title: "Content Type",
    description: "MIME type (e.g., image/jpeg, image/png)"
  }),

  /**
   * Size in bytes
   */
  sizeBytes: Schema.Number.pipe(
    Schema.int(),
    Schema.positive()
  ).annotations({
    title: "Size",
    description: "File size in bytes"
  }),

  /**
   * Image width in pixels (if known)
   */
  width: Schema.optional(
    Schema.Number.pipe(Schema.int(), Schema.positive())
  ).annotations({
    title: "Width",
    description: "Width in pixels"
  }),

  /**
   * Image height in pixels (if known)
   */
  height: Schema.optional(
    Schema.Number.pipe(Schema.int(), Schema.positive())
  ).annotations({
    title: "Height",
    description: "Height in pixels"
  }),

  /**
   * Storage path where the original is stored
   */
  storagePath: Schema.String.annotations({
    title: "Storage Path",
    description: "Path to original bytes in storage"
  }),

  /**
   * Original source URL (for provenance)
   */
  sourceUrl: Schema.optional(Schema.String).annotations({
    title: "Source URL",
    description: "Original URL for provenance tracking"
  }),

  /**
   * When the asset was first stored
   */
  createdAt: Schema.optional(Schema.DateTimeUtc).annotations({
    title: "Created At",
    description: "Timestamp when asset was stored"
  })
}).annotations({
  title: "ImageAsset",
  description: "Deduplicated image blob metadata"
})

export type ImageAsset = Schema.Schema.Type<typeof ImageAssetSchema>

// =============================================================================
// Image Owner Type
// =============================================================================

/**
 * Type of entity that owns/references an image
 *
 * @since 2.0.0
 * @category Types
 */
export const ImageOwnerType = Schema.Literal("link", "document")
export type ImageOwnerType = typeof ImageOwnerType.Type

// =============================================================================
// Image Reference
// =============================================================================

/**
 * ImageRef - Owner-scoped reference to an image asset
 *
 * Links an owner (link or document) to an image asset with
 * context-specific metadata like position and surrounding text.
 *
 * @example
 * ```typescript
 * const ref: ImageRef = {
 *   ownerType: "link",
 *   ownerId: "link-123",
 *   assetHash: "a1b2c3d4e5f6...",
 *   alt: "Seattle skyline",
 *   position: 0,
 *   context: "The image shows the downtown area..."
 * }
 * ```
 *
 * @since 2.0.0
 * @category Types
 */
export const ImageRefSchema = Schema.Struct({
  /**
   * Type of owner entity
   */
  ownerType: ImageOwnerType.annotations({
    title: "Owner Type",
    description: "Type of entity that owns this reference"
  }),

  /**
   * ID of the owner entity
   */
  ownerId: Schema.String.annotations({
    title: "Owner ID",
    description: "ID of the owning link or document"
  }),

  /**
   * Hash of the referenced image asset
   */
  assetHash: Schema.String.annotations({
    title: "Asset Hash",
    description: "SHA-256 hash of the image asset"
  }),

  /**
   * Alt text (may differ from asset's original)
   */
  alt: Schema.optional(Schema.String).annotations({
    title: "Alt Text",
    description: "Alt text in this context"
  }),

  /**
   * Caption in this context
   */
  caption: Schema.optional(Schema.String).annotations({
    title: "Caption",
    description: "Caption in this context"
  }),

  /**
   * Position in the owner's content (0-indexed)
   */
  position: Schema.Number.pipe(
    Schema.int(),
    Schema.nonNegative()
  ).annotations({
    title: "Position",
    description: "Order within owner content"
  }),

  /**
   * Surrounding text for LLM context
   */
  context: Schema.optional(Schema.String).annotations({
    title: "Context",
    description: "Surrounding text for LLM prompts"
  }),

  /**
   * Role of the image in this context
   */
  role: Schema.optional(ImageRole).annotations({
    title: "Role",
    description: "Image role in this context"
  })
}).annotations({
  title: "ImageRef",
  description: "Owner-scoped reference to an image asset"
})

export type ImageRef = Schema.Schema.Type<typeof ImageRefSchema>

// =============================================================================
// Image Manifest
// =============================================================================

/**
 * ImageManifest - Ordered list of image references for an owner
 *
 * Stored at assets/owners/{type}/{id}/images/manifest.json
 *
 * @since 2.0.0
 * @category Types
 */
export const ImageManifestSchema = Schema.Struct({
  /**
   * Owner type
   */
  ownerType: ImageOwnerType,

  /**
   * Owner ID
   */
  ownerId: Schema.String,

  /**
   * Ordered list of image references
   */
  images: Schema.Array(ImageRefSchema),

  /**
   * Total count (for convenience)
   */
  totalCount: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),

  /**
   * When the manifest was last updated
   */
  updatedAt: Schema.DateTimeUtc
}).annotations({
  title: "ImageManifest",
  description: "Ordered list of image references for an owner"
})

export type ImageManifest = Schema.Schema.Type<typeof ImageManifestSchema>

// =============================================================================
// Image For Prompt (LLM Multimodal)
// =============================================================================

/**
 * ImageForPrompt - Image data prepared for LLM multimodal input
 *
 * Contains the base64-encoded image data and metadata needed
 * to construct a Prompt.FilePart for @effect/ai.
 *
 * @example
 * ```typescript
 * const forPrompt: ImageForPrompt = {
 *   base64: "/9j/4AAQSkZJRgABAQAAAQ...",
 *   mediaType: "image/jpeg",
 *   alt: "Seattle skyline at sunset",
 *   context: "This image shows the downtown area..."
 * }
 * ```
 *
 * @since 2.0.0
 * @category Types
 */
export const ImageForPromptSchema = Schema.Struct({
  /**
   * Base64-encoded image data
   */
  base64: Schema.String.annotations({
    title: "Base64",
    description: "Base64-encoded image bytes"
  }),

  /**
   * MIME type for the FilePart
   */
  mediaType: Schema.String.annotations({
    title: "Media Type",
    description: "MIME type (e.g., image/jpeg)"
  }),

  /**
   * Alt text for the image
   */
  alt: Schema.optional(Schema.String).annotations({
    title: "Alt Text",
    description: "Alternative text description"
  }),

  /**
   * Caption if available
   */
  caption: Schema.optional(Schema.String).annotations({
    title: "Caption",
    description: "Image caption"
  }),

  /**
   * Surrounding text context
   */
  context: Schema.optional(Schema.String).annotations({
    title: "Context",
    description: "Surrounding text for LLM understanding"
  }),

  /**
   * Position in the document
   */
  position: Schema.optional(
    Schema.Number.pipe(Schema.int(), Schema.nonNegative())
  ).annotations({
    title: "Position",
    description: "Order in document"
  }),

  /**
   * Asset hash for reference
   */
  assetHash: Schema.optional(Schema.String).annotations({
    title: "Asset Hash",
    description: "Hash of the source asset"
  })
}).annotations({
  title: "ImageForPrompt",
  description: "Image data prepared for LLM multimodal input"
})

export type ImageForPrompt = Schema.Schema.Type<typeof ImageForPromptSchema>

// =============================================================================
// Image Fetch Result
// =============================================================================

/**
 * ImageFetchResult - Result of fetching an image
 *
 * Contains the bytes, computed hash, and detected content type.
 *
 * @since 2.0.0
 * @category Types
 */
export const ImageFetchResultSchema = Schema.Struct({
  /**
   * The fetched bytes
   */
  bytes: Schema.Uint8ArrayFromSelf,

  /**
   * Computed SHA-256 hash
   */
  hash: Schema.String,

  /**
   * Detected or declared content type
   */
  contentType: Schema.String,

  /**
   * Original candidate that was fetched
   */
  candidate: ImageCandidateSchema
}).annotations({
  title: "ImageFetchResult",
  description: "Result of fetching an image candidate"
})

export type ImageFetchResult = Schema.Schema.Type<typeof ImageFetchResultSchema>
