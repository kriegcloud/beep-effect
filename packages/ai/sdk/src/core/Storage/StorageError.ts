import * as Schema from "effect/Schema"

export class StorageError extends Schema.TaggedError<StorageError>()("StorageError", {
  store: Schema.String,
  operation: Schema.String,
  message: Schema.String,
  cause: Schema.optional(Schema.Defect)
}) {}

export type StorageErrorEncoded = typeof StorageError.Encoded

export const toStorageError = (
  store: string,
  operation: string,
  cause: unknown,
  message?: string
) =>
  StorageError.make({
    store,
    operation,
    message: message ?? `${store} ${operation} failed`,
    cause
  })
