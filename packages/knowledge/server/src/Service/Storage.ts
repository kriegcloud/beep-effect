import { $KnowledgeServerId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Ref from "effect/Ref";
import * as S from "effect/Schema";

const $I = $KnowledgeServerId.create("Service/Storage");

export class StorageGenerationConflictError extends S.TaggedError<StorageGenerationConflictError>(
  $I`StorageGenerationConflictError`
)(
  "StorageGenerationConflictError",
  {
    key: S.String,
    expectedGeneration: S.Number,
    actualGeneration: S.NullOr(S.Number),
  },
  $I.annotations("StorageGenerationConflictError", {
    description: "Optimistic concurrency conflict: expected generation does not match current stored generation.",
  })
) {}

export type StorageError = StorageGenerationConflictError;

export class StoredValue extends S.Class<StoredValue>($I`StoredValue`)(
  {
    key: S.String,
    value: S.String,
    generation: S.Number,
    updatedAt: S.Number,
  },
  $I.annotations("StoredValue", {
    description: "In-memory storage value with optimistic concurrency generation and last-updated timestamp.",
  })
) {}

export class PutOptions extends S.Class<PutOptions>($I`PutOptions`)(
  {
    expectedGeneration: S.optional(S.Number),
  },
  $I.annotations("PutOptions", {
    description: "Options for Storage.put (expected generation for optimistic concurrency).",
  })
) {}

export class DeleteOptions extends S.Class<DeleteOptions>($I`DeleteOptions`)(
  {
    expectedGeneration: S.optional(S.Number),
  },
  $I.annotations("DeleteOptions", {
    description: "Options for Storage.delete (expected generation for optimistic concurrency).",
  })
) {}

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
    const result = yield* Ref.modify(stateRef, (state): readonly [PutOutcome.Type, Map<string, StoredValue>] => {
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
    const result = yield* Ref.modify(stateRef, (state): readonly [DeleteOutcome.Type, Map<string, StoredValue>] => {
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

export class OutComeTag extends BS.StringLiteralKit("ok", "conflict").annotations(
  $I.annotations("OutComeTag", {
    description: "Outcome tag for storage operations",
  })
) {}

export const makeOutcomeKind = OutComeTag.toTagged("_tag").composer({});

export class OkPutOutcome extends S.Class<OkPutOutcome>($I`OkPutOutcome`)(
  makeOutcomeKind.ok({
    value: StoredValue,
  })
) {}

export class ConflictPutOutcome extends S.Class<ConflictPutOutcome>($I`ConflictPutOutcome`)(
  makeOutcomeKind.conflict({
    error: StorageGenerationConflictError,
  })
) {}

export class PutOutcome extends S.Union(OkPutOutcome, ConflictPutOutcome) {}

export declare namespace PutOutcome {
  export type Type = typeof PutOutcome.Type;
  export type Encoded = typeof PutOutcome.Encoded;
}

export class OkDeleteOutcome extends S.Class<OkDeleteOutcome>($I`OkDeleteOutcome`)(
  makeOutcomeKind.ok({
    value: S.Boolean,
  })
) {}

export class ConflictDeleteOutcome extends S.Class<ConflictDeleteOutcome>($I`ConflictDeleteOutcome`)(
  makeOutcomeKind.conflict({
    error: StorageGenerationConflictError,
  })
) {}

export class DeleteOutcome extends S.Union(OkDeleteOutcome, ConflictDeleteOutcome) {}

export declare namespace DeleteOutcome {
  export type Type = typeof DeleteOutcome.Type;
  export type Encoded = typeof DeleteOutcome.Encoded;
}
