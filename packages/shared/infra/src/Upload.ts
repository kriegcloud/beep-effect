/**
 * File upload service exports for S3 storage integration.
 *
 * @since 0.1.0
 */

/**
 * Re-exports upload service for handling file uploads to cloud storage.
 *
 * @example
 * ```typescript
 * import { UploadService } from "@beep/shared-infra"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const upload = yield* UploadService
 *   const result = yield* upload.uploadFile({ key: "file.pdf", buffer })
 * })
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export * from "./internal/upload";
