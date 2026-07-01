/**
 * The pure attachment model for the chat composer: the {@link ComposerAttachment}
 * schema class plus its capture-time validation and object-URL helpers. Kept
 * free of any `@effect/atom` or React dependency so the per-editor atom layer
 * (`atoms.ts`) can depend on it without a circular import back through the
 * attachment plugins/UI in `attachments.tsx`.
 *
 * Per the repo schema-first law the captured value is modeled as the
 * {@link ComposerAttachment} `S.Class`: its `mimeType` is validated against
 * `@beep/schema`'s {@link MimeType}, its `size` is bounded by
 * {@link DEFAULT_MAX_ATTACHMENT_BYTES}, its `objectUrl` is a string (never
 * base64), and its `file` is a real `File` instance. Capture-time validation is
 * a static method on the class returning `Result.Result` — a {@link Success}
 * attachment or a tagged {@link AttachmentRejection} carrying *why* the file was
 * dropped (over budget vs unrecognized MIME type).
 *
 * @packageDocumentation \@beep/editor/chat/attachment-model
 * @since 0.0.0
 */

import { $EditorId } from "@beep/identity";
import { ImageMimeType, MimeType } from "@beep/schema/MimeType";
import { Data, Result } from "effect";
import * as S from "effect/Schema";

const $I = $EditorId.create("chat/attachment-model");

// Non-throwing MIME decode: an empty or unrecognized `file.type` becomes a
// `Result.Failure` (mapped to {@link AttachmentInvalidMimeType}) instead of a
// thrown `ParseError` escaping the capture pipeline.
const decodeMimeType = S.decodeUnknownResult(MimeType);

/**
 * Image MIME types eligible for vision (the rest are captured as generic files).
 * Derived from `@beep/schema`'s {@link ImageMimeType} so the literal subset stays
 * in lockstep with the canonical MIME vocabulary.
 *
 * @example
 * ```ts
 * import { IMAGE_MIME_TYPES } from "@beep/editor/chat"
 *
 * console.log(IMAGE_MIME_TYPES.includes("image/png")) // true
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export const IMAGE_MIME_TYPES = ImageMimeType.pickOptions(["image/png", "image/jpeg", "image/webp", "image/gif"]);

/**
 * Schema for the vision-eligible image MIME subset, used to guard whether a
 * captured attachment is an image via {@link isImageAttachment}.
 *
 * @category schemas
 * @since 0.0.0
 */
const ImageAttachmentMimeType = S.Literals(IMAGE_MIME_TYPES).pipe(
  $I.annoteSchema("ImageAttachmentMimeType", {
    description: "The vision-eligible image MIME subset captured as thumbnailed attachments.",
  })
);

const isImageMimeType = S.is(ImageAttachmentMimeType);

/**
 * Default maximum captured attachment size (10 MB).
 *
 * @example
 * ```ts
 * import { DEFAULT_MAX_ATTACHMENT_BYTES } from "@beep/editor/chat"
 *
 * const defaultMegabytes = DEFAULT_MAX_ATTACHMENT_BYTES / 1024 / 1024
 * console.log(defaultMegabytes) // 10
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export const DEFAULT_MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

/**
 * Schema for a real DOM `File` instance.
 *
 * @category schemas
 * @since 0.0.0
 */
const FileFromSelf = S.declare<File>((u): u is File => "File" in globalThis && u instanceof File).pipe(
  $I.annoteSchema("FileFromSelf", {
    description: "A captured DOM File instance.",
  })
);

const AttachmentSizeBytes = S.Int.pipe(
  S.check(
    S.isBetween(
      { minimum: 0, maximum: DEFAULT_MAX_ATTACHMENT_BYTES },
      {
        identifier: $I`AttachmentSizeBytes`,
        title: "Attachment Size Bytes",
        description: `A captured attachment size in bytes, bounded by the ${DEFAULT_MAX_ATTACHMENT_BYTES}-byte default.`,
      }
    )
  )
);

/**
 * A captured file rejected because it exceeds the (clamped) byte budget.
 *
 * @example
 * ```ts
 * import { AttachmentTooLarge } from "@beep/editor/chat"
 *
 * const rejection = new AttachmentTooLarge({
 *   filename: "recording.mov",
 *   size: 15_000_000,
 *   maxBytes: 10_485_760,
 * })
 *
 * console.log(rejection._tag) // "AttachmentTooLarge"
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class AttachmentTooLarge extends Data.TaggedError("AttachmentTooLarge")<{
  readonly filename: string;
  readonly size: number;
  readonly maxBytes: number;
}> {}

/**
 * A captured file rejected because its `file.type` is empty or not a recognized
 * {@link MimeType}.
 *
 * @example
 * ```ts
 * import { AttachmentInvalidMimeType } from "@beep/editor/chat"
 *
 * const rejection = new AttachmentInvalidMimeType({
 *   filename: "payload.bin",
 *   mimeType: "",
 * })
 *
 * console.log(rejection._tag) // "AttachmentInvalidMimeType"
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class AttachmentInvalidMimeType extends Data.TaggedError("AttachmentInvalidMimeType")<{
  readonly filename: string;
  readonly mimeType: string;
}> {}

/**
 * Why {@link ComposerAttachment.fromFile} declined to capture a file. A tagged
 * union so the capture pipeline can distinguish — and surface — an over-budget
 * file from one with an unrecognized MIME type, rather than collapsing both into
 * an opaque `O.none()`.
 *
 * @example
 * ```ts
 * import { AttachmentInvalidMimeType, type AttachmentRejection } from "@beep/editor/chat"
 *
 * const rejection: AttachmentRejection = new AttachmentInvalidMimeType({
 *   filename: "payload.bin",
 *   mimeType: "",
 * })
 *
 * console.log(rejection._tag) // "AttachmentInvalidMimeType"
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export type AttachmentRejection = AttachmentTooLarge | AttachmentInvalidMimeType;

// Monotonic id source for captured attachments — ephemeral UI identity only, so
// a simple counter suffices (no persistence, no cross-session stability needed).
let attachmentSequence = 0;

/**
 * The in-memory attachment value (app-local UI shape for v1): a captured file
 * plus an object-URL ref used for thumbnails. Not a wire/persisted payload. The
 * `objectUrl` must be released with {@link revokeAttachment} once the chip is
 * removed.
 *
 * Validation lives on the schema: `mimeType` is a {@link MimeType}, `size` is
 * bounded by {@link DEFAULT_MAX_ATTACHMENT_BYTES}, and capture-time size policy
 * is configurable via the {@link ComposerAttachment.fromFile} static.
 *
 * @example
 * ```ts
 * import { ComposerAttachment } from "@beep/editor/chat"
 *
 * const a = ComposerAttachment.make({
 *   id: "1",
 *   filename: "x.png",
 *   mimeType: "image/png",
 *   size: 1,
 *   objectUrl: "blob:x",
 *   file: new File([], "x.png"),
 * })
 * console.log(a.filename) // "x.png"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ComposerAttachment extends S.Class<ComposerAttachment>($I`ComposerAttachment`)(
  {
    /** Ephemeral UI identity used as the chip key. */
    id: S.String,
    /** The original file name. */
    filename: S.String,
    /** Validated MIME type of the captured file. */
    mimeType: MimeType,
    /** Captured file size in bytes, bounded by the default max. */
    size: AttachmentSizeBytes,
    /** In-memory object-URL reference (used for the thumbnail; not transported). */
    objectUrl: S.String,
    /** The captured file, kept for the app's upload-port to transport later. */
    file: FileFromSelf,
  },
  $I.annote("ComposerAttachment", {
    description:
      "An in-memory captured attachment: file, validated MIME type, bounded size, and a thumbnail object URL.",
  })
) {
  /**
   * Whether a file's size is within the given byte budget. Configurable size
   * policy lives here rather than on the field check so the per-composer
   * `maxAttachmentBytes` prop can tighten the bound.
   *
   * @example
   * ```ts
   * import { ComposerAttachment } from "@beep/editor/chat"
   *
   * console.log(ComposerAttachment.isWithinSize(new File([], "x"), 10)) // true
   * ```
   *
   * @category utilities
   * @since 0.0.0
   */
  static readonly isWithinSize = (file: File, maxBytes: number = DEFAULT_MAX_ATTACHMENT_BYTES): boolean =>
    file.size <= maxBytes;

  /**
   * Read a captured `File` into a {@link ComposerAttachment} synchronously (via
   * an object URL for the thumbnail), or a tagged {@link AttachmentRejection}
   * describing why it was declined. Never throws: both reachable
   * `ComposerAttachment.make` failure modes are pre-validated into the failure
   * channel — an over-budget file ({@link AttachmentTooLarge}, with `maxBytes`
   * clamped to the schema's hard {@link DEFAULT_MAX_ATTACHMENT_BYTES} so an
   * oversized budget can never admit a file the `size` field check would reject)
   * and an empty/unrecognized `file.type` ({@link AttachmentInvalidMimeType}).
   * Release the `objectUrl` of a {@link Success} with {@link revokeAttachment}
   * once removed.
   *
   * @example
   * ```ts
   * import { ComposerAttachment } from "@beep/editor/chat"
   * import { Result } from "effect"
   *
   * const result = ComposerAttachment.fromFile(
   *   new File(["avatar"], "avatar.png", { type: "image/png" })
   * )
   *
   * console.log(Result.isSuccess(result)) // true
   * ```
   *
   * @effects Creates an object URL for successfully captured files; release it
   * with {@link revokeAttachment} once the attachment is removed.
   *
   * @category utilities
   * @since 0.0.0
   */
  static readonly fromFile = (
    file: File,
    maxBytes: number = DEFAULT_MAX_ATTACHMENT_BYTES
  ): Result.Result<ComposerAttachment, AttachmentRejection> => {
    const effectiveMaxBytes = Math.min(maxBytes, DEFAULT_MAX_ATTACHMENT_BYTES);
    if (!ComposerAttachment.isWithinSize(file, effectiveMaxBytes)) {
      return Result.fail(new AttachmentTooLarge({ filename: file.name, size: file.size, maxBytes: effectiveMaxBytes }));
    }
    return Result.match(decodeMimeType(file.type), {
      onFailure: () => Result.fail(new AttachmentInvalidMimeType({ filename: file.name, mimeType: file.type })),
      onSuccess: (mimeType) => {
        attachmentSequence += 1;
        return Result.succeed(
          ComposerAttachment.make({
            id: `attachment-${attachmentSequence}-${file.name}`,
            filename: file.name,
            mimeType,
            size: file.size,
            objectUrl: URL.createObjectURL(file),
            file,
          })
        );
      },
    });
  };
}

/**
 * Whether an attachment is a vision-eligible image, guarded by the
 * {@link ImageAttachmentMimeType} schema.
 *
 * @example
 * ```ts
 * import { ComposerAttachment, isImageAttachment } from "@beep/editor/chat"
 *
 * const a = ComposerAttachment.make({
 *   id: "1",
 *   filename: "a.png",
 *   mimeType: "image/png",
 *   size: 1,
 *   objectUrl: "blob:a",
 *   file: new File([], "a.png"),
 * })
 * console.log(isImageAttachment(a)) // true
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const isImageAttachment = (attachment: ComposerAttachment): boolean => isImageMimeType(attachment.mimeType);

/**
 * Read a captured `File` into a {@link ComposerAttachment} synchronously, or a
 * tagged {@link AttachmentRejection} describing why it was declined. Internal
 * helper (not a boundary) that delegates to {@link ComposerAttachment.fromFile};
 * release the `objectUrl` of a {@link Success} with {@link revokeAttachment} once
 * it is removed.
 *
 * @example
 * ```ts
 * import { fileToAttachment } from "@beep/editor/chat"
 * import { Result } from "effect"
 *
 * const result = fileToAttachment(new File(["hi"], "note.txt", { type: "text/plain" }))
 *
 * console.log(Result.isSuccess(result)) // true
 * ```
 *
 * @effects Creates an object URL for successfully captured files; release it
 * with {@link revokeAttachment} once the attachment is removed.
 *
 * @category utilities
 * @since 0.0.0
 */
export const fileToAttachment = (
  file: File,
  maxBytes: number = DEFAULT_MAX_ATTACHMENT_BYTES
): Result.Result<ComposerAttachment, AttachmentRejection> => ComposerAttachment.fromFile(file, maxBytes);

/**
 * Release the object URL backing an attachment thumbnail.
 *
 * @example
 * ```ts
 * import { ComposerAttachment, revokeAttachment } from "@beep/editor/chat"
 *
 * const attachment = ComposerAttachment.make({
 *   id: "1",
 *   filename: "preview.png",
 *   mimeType: "image/png",
 *   size: 1,
 *   objectUrl: "blob:preview",
 *   file: new File([], "preview.png", { type: "image/png" }),
 * })
 *
 * function removeChip(attachment: ComposerAttachment): string {
 *   revokeAttachment(attachment)
 *   return attachment.id
 * }
 *
 * console.log(removeChip(attachment)) // "1"
 * ```
 *
 * @effects Calls `URL.revokeObjectURL` for the attachment thumbnail URL.
 *
 * @category utilities
 * @since 0.0.0
 */
export const revokeAttachment = (attachment: ComposerAttachment): void => URL.revokeObjectURL(attachment.objectUrl);
