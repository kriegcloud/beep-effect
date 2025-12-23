/**
 * Effect-based MD5 worker implementation using @effect/platform-browser
 *
 * This module provides the worker-side implementation for parallel MD5 hashing.
 * Uses Effect Platform's WorkerRunner for typed, serialized communication.
 *
 * @module
 */

import * as Runner from "@effect/platform/WorkerRunner";
import * as BrowserRunner from "@effect/platform-browser/BrowserWorkerRunner";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { hashBlobSync } from "./md5-file-hasher";

/**
 * Worker error schema for serialization
 * Combines all possible MD5 hashing errors
 * @since 1.0.0
 * @category Schemas
 */
const WorkerErrorSchema = S.Union(
  S.TaggedStruct("FileReadError", {
    message: S.String,
    cause: S.Unknown,
  }),
  S.TaggedStruct("BlobSliceError", {
    message: S.String,
    cause: S.Unknown,
  }),
  S.TaggedStruct("UnicodeEncodingError", {
    message: S.String,
    codePoint: S.Number,
  }),
  S.TaggedStruct("Md5ComputationError", {
    message: S.String,
    cause: S.Unknown,
  })
);

/**
 * Hash request schema - uses ArrayBuffer instead of Blob for serializability
 * The main thread converts Blob to ArrayBuffer before sending
 * @since 1.0.0
 * @category Schemas
 */
export class HashRequest extends S.TaggedRequest<HashRequest>()("HashRequest", {
  failure: WorkerErrorSchema,
  success: S.String,
  payload: {
    buffer: S.Uint8ArrayFromSelf,
    size: S.Number,
    chunkSize: S.optional(S.Number),
  },
}) {}

/**
 * Request union type for the worker
 * @since 1.0.0
 * @category Schemas
 */
export type WorkerRequest = HashRequest;

/**
 * Worker request schema union
 * @since 1.0.0
 * @category Schemas
 */
export const WorkerRequestSchema = S.Union(HashRequest);

/**
 * Launch the worker with Effect Platform runner
 *
 * This should be called in the worker context (worker.ts file).
 * Handles HashRequest messages and returns MD5 hash strings.
 *
 * @since 1.0.0
 * @category Launching
 */
export const launchWorker = Runner.makeSerialized(WorkerRequestSchema, {
  HashRequest: (req) =>
    Effect.gen(function* () {
      const arrayBuffer = req.buffer.buffer as ArrayBuffer;
      const blob = new Blob([arrayBuffer], { type: "application/octet-stream" });
      const config = req.chunkSize ? { chunkSize: req.chunkSize } : undefined;
      return yield* hashBlobSync(blob, config);
    }),
}).pipe(Effect.provide(BrowserRunner.layer));
