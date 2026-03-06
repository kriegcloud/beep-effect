import { TaggedErrorClass } from "@beep/schema";
import * as S from "effect/Schema";

/**
 * @since 0.0.0
 */
export class StorageError extends TaggedErrorClass<StorageError>()("StorageError", {
  store: S.String,
  operation: S.String,
  message: S.String,
  cause: S.optional(S.DefectWithStack),
}) {
  static readonly make = (params: Pick<StorageError, "store" | "operation" | "message" | "cause">) =>
    new StorageError(params);
}

/**
 * @since 0.0.0
 */
export type StorageErrorEncoded = typeof StorageError.Encoded;

/**
 * @since 0.0.0
 */
export const toStorageError = (store: string, operation: string, cause: unknown, message?: undefined | string) =>
  StorageError.make({
    store,
    operation,
    message: message ?? `${store} ${operation} failed`,
    cause,
  });
