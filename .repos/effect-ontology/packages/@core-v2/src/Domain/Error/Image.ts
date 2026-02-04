/**
 * Domain Errors: Image Operations
 *
 * Typed errors for image fetching, storage, and processing operations.
 *
 * @since 2.0.0
 * @module Domain/Error/Image
 */

import { Duration, Schema } from "effect"

// =============================================================================
// Image Fetch Errors
// =============================================================================

/**
 * ImageFetchError - Failed to download image from URL
 *
 * Returned when an image cannot be fetched due to network issues,
 * HTTP errors, or invalid responses.
 *
 * @since 2.0.0
 * @category Error
 */
export class ImageFetchError extends Schema.TaggedError<ImageFetchError>()(
  "ImageFetchError",
  {
    message: Schema.String.annotations({
      title: "Error Message",
      description: "Human-readable error description"
    }),

    url: Schema.String.annotations({
      title: "URL",
      description: "The image URL that failed to fetch"
    }),

    statusCode: Schema.optional(Schema.Number).annotations({
      title: "Status Code",
      description: "HTTP status code if available"
    }),

    cause: Schema.optional(Schema.Unknown).annotations({
      title: "Cause",
      description: "Underlying error or failure cause"
    })
  }
) {}

/**
 * ImageTimeoutError - Image fetch exceeded timeout
 *
 * Returned when an image download takes too long.
 *
 * @since 2.0.0
 * @category Error
 */
export class ImageTimeoutError extends Schema.TaggedError<ImageTimeoutError>()(
  "ImageTimeoutError",
  {
    url: Schema.String.annotations({
      title: "URL",
      description: "The image URL that timed out"
    }),

    timeoutMs: Schema.Number.annotations({
      title: "Timeout (ms)",
      description: "The timeout value that was exceeded"
    }),

    message: Schema.optionalWith(Schema.String, {
      default: () => "Image fetch timed out"
    }).annotations({
      title: "Message",
      description: "Error message"
    })
  }
) {
  /**
   * Get timeout as Effect Duration
   */
  get timeout(): Duration.Duration {
    return Duration.millis(this.timeoutMs)
  }
}

/**
 * ImageTooLargeError - Image exceeds maximum size
 *
 * Returned when an image is larger than the configured maximum.
 *
 * @since 2.0.0
 * @category Error
 */
export class ImageTooLargeError extends Schema.TaggedError<ImageTooLargeError>()(
  "ImageTooLargeError",
  {
    url: Schema.String.annotations({
      title: "URL",
      description: "The image URL"
    }),

    sizeBytes: Schema.Number.annotations({
      title: "Size (bytes)",
      description: "Actual size of the image"
    }),

    maxBytes: Schema.Number.annotations({
      title: "Max Size (bytes)",
      description: "Maximum allowed size"
    }),

    message: Schema.optionalWith(Schema.String, {
      default: () => "Image exceeds maximum size limit"
    }).annotations({
      title: "Message",
      description: "Error message"
    })
  }
) {}

/**
 * ImageInvalidTypeError - Image has unsupported content type
 *
 * Returned when the image content type is not in the allowed list.
 *
 * @since 2.0.0
 * @category Error
 */
export class ImageInvalidTypeError extends Schema.TaggedError<ImageInvalidTypeError>()(
  "ImageInvalidTypeError",
  {
    url: Schema.String.annotations({
      title: "URL",
      description: "The image URL"
    }),

    contentType: Schema.String.annotations({
      title: "Content Type",
      description: "The rejected content type"
    }),

    allowedTypes: Schema.Array(Schema.String).annotations({
      title: "Allowed Types",
      description: "List of allowed content types"
    }),

    message: Schema.optionalWith(Schema.String, {
      default: () => "Image has unsupported content type"
    }).annotations({
      title: "Message",
      description: "Error message"
    })
  }
) {}

/**
 * Union of all Image errors for convenience typing
 *
 * @since 2.0.0
 * @category Error
 */
export type ImageError =
  | ImageFetchError
  | ImageTimeoutError
  | ImageTooLargeError
  | ImageInvalidTypeError
