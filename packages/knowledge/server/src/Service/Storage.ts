import { $KnowledgeServerId } from "@beep/identity/packages";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Ref from "effect/Ref";
import * as S from "effect/Schema";

const $I = $KnowledgeServerId.create("Service/Storage");

export class StorageGenerationConflictError extends S.TaggedError<StorageGenerationConflictError>()(
  "StorageGenerationConflictError",
  {
    key: S.String,
    expectedGeneration: S.Number,
    actualGeneration: S.NullOr(S.Number),
  }
) {}

export type StorageError = StorageGenerationConflictError;

export interface StoredValue {
  readonly key: string;
  readonly value: string;
  readonly generation: number;
  readonly updatedAt: number;
}

export interface PutOptions {
  readonly expectedGeneration?: number;
}

export interface DeleteOptions {
  readonly expectedGeneration?: number;
}

export interface StorageShape {
  readonly get: (key: string) => Effect.Effect<O.Option<StoredValue>>;
  readonly put: (key: string, value: string, options?: PutOptions) => Effect.Effect<StoredValue, StorageError>;
  readonly delete: (key: string, options?: DeleteOptions) => Effect.Effect<boolean, StorageError>;
  readonly list: (prefix?: string) => Effect.Effect<ReadonlyArray<StoredValue>>;
}

export class Storage extends Context.Tag($I`Storage`)<Storage, StorageShape>() {}

const serviceEffect: Effect.Effect<StorageShape> = Effect.gen(function* () {
  const stateRef = yield* Ref.make(new Map<string, StoredValue>());

  const get: StorageShape["get"] = Effect.fn("Storage.get")(function* (key) {
    const state = yield* Ref.get(stateRef);
    return O.fromNullable(state.get(key));
  });

  const put: StorageShape["put"] = Effect.fn("Storage.put")(function* (key, value, options) {
    const result = yield* Ref.modify(stateRef, (state): readonly [PutOutcome, Map<string, StoredValue>] => {
      const current = state.get(key);
      const actualGeneration = current?.generation ?? null;

      if (
        typeof options?.expectedGeneration === "number" &&
        options.expectedGeneration !== (current?.generation ?? null)
      ) {
        return [
          {
            _tag: "conflict",
            error: new StorageGenerationConflictError({
              key,
              expectedGeneration: options.expectedGeneration,
              actualGeneration,
            }),
          },
          state,
        ];
      }

      const nextGeneration = (current?.generation ?? 0) + 1;
      const nextValue: StoredValue = {
        key,
        value,
        generation: nextGeneration,
        updatedAt: Date.now(),
      };

      const nextState = new Map(state);
      nextState.set(key, nextValue);

      return [{ _tag: "ok", value: nextValue }, nextState];
    });

    if (result._tag === "conflict") {
      return yield* result.error;
    }

    return result.value;
  });

  const deleteValue: StorageShape["delete"] = Effect.fn("Storage.delete")(function* (key, options) {
    const result = yield* Ref.modify(stateRef, (state): readonly [DeleteOutcome, Map<string, StoredValue>] => {
      const current = state.get(key);
      const actualGeneration = current?.generation ?? null;

      if (
        typeof options?.expectedGeneration === "number" &&
        options.expectedGeneration !== (current?.generation ?? null)
      ) {
        return [
          {
            _tag: "conflict",
            error: new StorageGenerationConflictError({
              key,
              expectedGeneration: options.expectedGeneration,
              actualGeneration,
            }),
          },
          state,
        ];
      }

      if (!current) {
        return [{ _tag: "ok", value: false }, state];
      }

      const nextState = new Map(state);
      nextState.delete(key);

      return [{ _tag: "ok", value: true }, nextState];
    });

    if (result._tag === "conflict") {
      return yield* result.error;
    }

    return result.value;
  });

  const list: StorageShape["list"] = Effect.fn("Storage.list")(function* (prefix) {
    const state = yield* Ref.get(stateRef);
    return Array.from(state.values())
      .filter((entry) => (typeof prefix === "string" ? entry.key.startsWith(prefix) : true))
      .sort((a, b) => a.key.localeCompare(b.key));
  });

  return Storage.of({
    get,
    put,
    delete: deleteValue,
    list,
  });
});

export const StorageMemoryLive = Layer.effect(Storage, serviceEffect);

type PutOutcome =
  | {
      readonly _tag: "ok";
      readonly value: StoredValue;
    }
  | {
      readonly _tag: "conflict";
      readonly error: StorageGenerationConflictError;
    };

type DeleteOutcome =
  | {
      readonly _tag: "ok";
      readonly value: boolean;
    }
  | {
      readonly _tag: "conflict";
      readonly error: StorageGenerationConflictError;
    };
