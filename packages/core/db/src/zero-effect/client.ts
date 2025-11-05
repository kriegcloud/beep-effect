import type { UnsafeTypes } from "@beep/types";
import type { SchemaQuery, Transaction, Schema as ZeroSchema } from "@rocicorp/zero";
import * as Effect from "effect/Effect";
import * as Runtime from "effect/Runtime";
import * as Struct from "effect/Struct";
import {
  ZeroMutationProcessingError,
  ZeroMutatorAuthError,
  ZeroMutatorDatabaseError,
  ZeroMutatorValidationError,
} from "./shared/errors";

export type CustomMutatorEfDefs<TSchema extends ZeroSchema, R = unknown> = {
  [TableName in keyof TSchema["tables"]]?:
    | {
        [MutatorName: string]: (
          tx: EffectTransaction<TSchema>,
          ...args: ReadonlyArray<UnsafeTypes.UnsafeAny>
        ) => Effect.Effect<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny, R>;
      }
    | undefined;
};

type SchemaCRUD<S extends ZeroSchema> = {
  [Table in keyof S["tables"]]: {
    insert: (value: UnsafeTypes.UnsafeAny) => Promise<void>;
    upsert: (value: UnsafeTypes.UnsafeAny) => Promise<void>;
    update: (value: UnsafeTypes.UnsafeAny) => Promise<void>;
    delete: (id: UnsafeTypes.UnsafeAny) => Promise<void>;
  };
};

type EffectSchemaCRUD<TSchema extends ZeroSchema> = {
  [K in keyof TSchema["tables"]]: {
    [Method in keyof SchemaCRUD<TSchema>[K]]: SchemaCRUD<TSchema>[K][Method] extends (
      ...args: infer Args
    ) => Promise<infer R>
      ? (...args: Args) => Effect.Effect<R, ZeroMutatorDatabaseError>
      : never;
  };
};

type EffectSchemaQuery<TSchema extends ZeroSchema> = SchemaQuery<TSchema>;

/**
 * @example
 * ```ts
 * const updatePerson = (tx: EffectTransaction<Schema>, input: UpdateInput) =>
 *   Effect.gen(function* () {
 *     // Mutations return Effects that can fail with ZeroMutatorDatabaseError
 *     yield* tx.mutate.people.update({ id: input.id, name: input.name })
 *
 *     // Queries also return Effects
 *     const person = yield* tx.query.people.where('id', input.id).first()
 *
 *     return person
 *   })
 * ```
 */
export class EffectTransaction<TSchema extends ZeroSchema> {
  readonly tx: Transaction<TSchema>;

  constructor(tx: Transaction<TSchema>) {
    this.tx = tx;
  }

  // Add missing properties required by ClientTransaction
  get location() {
    return this.tx.location;
  }

  get reason() {
    return this.tx.reason;
  }

  get clientID() {
    return this.tx.clientID;
  }

  get mutationID() {
    return this.tx.mutationID;
  }

  get mutate(): EffectSchemaCRUD<TSchema> {
    return this.createMutateProxy(this.tx.mutate) as EffectSchemaCRUD<TSchema>;
  }

  get query(): EffectSchemaQuery<TSchema> {
    return this.createQueryProxy(this.tx.query) as EffectSchemaQuery<TSchema>;
  }

  private createMutateProxy(mutate: UnsafeTypes.UnsafeAny): UnsafeTypes.UnsafeAny {
    return new Proxy(mutate, {
      get: (target, prop) => {
        const value = target[prop];
        if (typeof value === "object" && value !== null) {
          return this.createMutateProxy(value);
        }
        if (typeof value === "function") {
          return (...args: Array<UnsafeTypes.UnsafeAny>) =>
            Effect.tryPromise({
              catch: (error) =>
                new ZeroMutatorDatabaseError({
                  cause: error,
                  message: `Database mutation failed: ${String(error)}`,
                }),
              try: () => value.apply(target, args),
            });
        }
        return value;
      },
    });
  }

  private createQueryProxy(query: UnsafeTypes.UnsafeAny): UnsafeTypes.UnsafeAny {
    return new Proxy(query, {
      get: (target, prop) => {
        const value = target[prop];
        if (typeof value === "object" && value !== null) {
          return this.createQueryProxy(value);
        }
        if (typeof value === "function") {
          return (...args: Array<UnsafeTypes.UnsafeAny>) =>
            Effect.tryPromise({
              catch: (error) =>
                new ZeroMutatorDatabaseError({
                  cause: error,
                  message: `Database query failed: ${String(error)}`,
                }),
              try: () => value.apply(target, args),
            });
        }
        return value;
      },
    });
  }
}

export const createEffectTransaction = <TSchema extends ZeroSchema>(tx: Transaction<TSchema>) =>
  new EffectTransaction(tx);

/**
 */
type EffectMutators<_TSchema extends ZeroSchema, R = unknown> = Record<
  string,
  | Record<
      string,
      (
        tx: UnsafeTypes.UnsafeAny,
        ...args: Array<UnsafeTypes.UnsafeAny>
      ) => Effect.Effect<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny, R>
    >
  | undefined
>;

/**
 * @example
 * ```ts
 * // Client usage
 * const clientMutators = convertEffectMutatorsToPromise(
 *   effectMutators,
 *   Runtime.defaultRuntime
 * )
 *
 * // Server usage with custom runtime
 * const serverRuntime = Runtime.defaultRuntime.pipe(
 *   Runtime.provideService(MyService, myServiceImpl)
 * )
 * const serverMutators = convertEffectMutatorsToPromise(
 *   effectMutators,
 *   serverRuntime
 * )
 * ``` */
export function convertEffectMutatorsToPromise<TSchema extends ZeroSchema, R>(
  effectMutators: EffectMutators<TSchema, R>,
  runtime: Runtime.Runtime<R>
) {
  const promiseMutators: Record<string, Record<string, UnsafeTypes.UnsafeAny>> = {};

  for (const [tableName, tableMutators] of Struct.entries(effectMutators)) {
    if (tableMutators) {
      promiseMutators[tableName] = {};

      for (const [mutatorName, mutatorFn] of Struct.entries(tableMutators)) {
        if (typeof mutatorFn === "function") {
          promiseMutators[tableName][mutatorName] = async (
            tx: Transaction<TSchema>,
            ...args: ReadonlyArray<UnsafeTypes.UnsafeAny>
          ) => {
            const effectTx = createEffectTransaction(tx);
            const effect = mutatorFn(effectTx, ...args);
            return await Runtime.runPromise(runtime)(effect);
          };
        }
      }
    }
  }

  return promiseMutators;
}

export { ZeroMutatorDatabaseError, ZeroMutatorAuthError, ZeroMutatorValidationError, ZeroMutationProcessingError };
