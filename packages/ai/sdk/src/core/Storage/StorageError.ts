import * as S from "effect/Schema";

export class StorageError extends S.TaggedErrorClass<StorageError>()("StorageError", {
  store: S.String,
  operation: S.String,
  message: S.String,
  cause: S.optional(S.DefectWithStack),
}) {
  static readonly make = (params: Pick<StorageError, "store" | "operation" | "message" | "cause">) =>
    new StorageError(params);
}

export type StorageErrorEncoded = typeof StorageError.Encoded;

export const toStorageError = (store: string, operation: string, cause: unknown, message?: undefined | string) =>
  StorageError.make({
    store,
    operation,
    message: message ?? `${store} ${operation} failed`,
    cause,
  });
