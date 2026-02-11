/**
 * DbRepo type-level contracts.
 *
 * These types define the standard CRUD surface derived from an `@effect/sql/Model`.
 * They intentionally live in `@beep/shared-domain` so **domain packages can reference
 * repository shapes** (e.g. in `entities/<Entity>/<Entity>.repo.ts`) without importing
 * server-only implementations.
 *
 * Runtime implementation lives in `@beep/shared-server` (factory helpers) and in slice
 * server packages (repo Layers).
 *
 * @module shared-domain/factories/db-repo
 * @since 0.1.0
 * @category Repo
 */

import type { DatabaseError } from "@beep/shared-domain/errors";
import type { UnsafeTypes } from "@beep/types";
import type * as M from "@effect/sql/Model";
import type * as SqlClient from "@effect/sql/SqlClient";
import type * as A from "effect/Array";
import type * as Effect from "effect/Effect";
import type * as O from "effect/Option";
import type * as S from "effect/Schema";

/**
 * Return type for the base repository operations.
 *
 * @since 0.1.0
 * @category Repo
 */
export interface BaseRepo<
  Model extends M.Any,
  Id extends keyof Model["Type"] & keyof Model["update"]["Type"] & keyof Model["fields"],
> {
  readonly insert: (
    payload: Model["insert"]["Type"]
  ) => Effect.Effect<{ readonly data: Model["Type"] }, DatabaseError, Model["Context"] | Model["insert"]["Context"]>;

  readonly insertVoid: (
    payload: Model["insert"]["Type"]
  ) => Effect.Effect<void, DatabaseError, Model["Context"] | Model["insert"]["Context"]>;

  readonly update: (
    payload: Model["update"]["Type"]
  ) => Effect.Effect<{ readonly data: Model["Type"] }, DatabaseError, Model["Context"] | Model["update"]["Context"]>;

  readonly updateVoid: (
    payload: Model["update"]["Type"]
  ) => Effect.Effect<void, DatabaseError, Model["Context"] | Model["update"]["Context"]>;

  readonly findById: (payload: {
    readonly id: S.Schema.Type<Model["fields"][Id]>;
  }) => Effect.Effect<
    O.Option<{ readonly data: Model["Type"] }>,
    DatabaseError,
    Model["Context"] | S.Schema.Context<Model["fields"][Id]>
  >;

  readonly delete: (payload: {
    readonly id: S.Schema.Type<Model["fields"][Id]>;
  }) => Effect.Effect<void, DatabaseError, S.Schema.Context<Model["fields"][Id]>>;

  readonly insertManyVoid: (payload: {
    readonly items: A.NonEmptyReadonlyArray<Model["insert"]["Type"]>;
  }) => Effect.Effect<void, DatabaseError, Model["Context"] | Model["insert"]["Context"]>;
}

/**
 * Combined repository type including base operations and optional extensions.
 * Uses `M.Any` constraint instead of `ModelWithId` to preserve variance and
 * avoid type erasure in function parameters.
 *
 * @since 0.1.0
 * @category Repo
 */
export type DbRepoSuccess<
  Model extends M.Any,
  TExtra extends Record<string, UnsafeTypes.UnsafeAny> = NonNullable<unknown>,
> = BaseRepo<Model, "id"> & TExtra;

/**
 * Effect type for creating a repository with standard CRUD operations and optional extensions.
 * Uses `M.Any` constraint instead of `ModelWithId` to preserve variance and
 * avoid type erasure in function parameters.
 *
 * Note: This type includes `SqlClient.SqlClient` in the required environment because the
 * factory implementation (in `@beep/shared-server`) must run SQL schemas to construct the repo.
 *
 * @since 0.1.0
 * @category Repo
 */
export type DbRepo<
  Model extends M.Any,
  SE,
  SR,
  TExtra extends Record<string, UnsafeTypes.UnsafeAny> = NonNullable<unknown>,
> = Effect.Effect<DbRepoSuccess<Model, TExtra>, SE, SqlClient.SqlClient | SR>;

/**
 * Specification object for deriving a repository method signature from schemas.
 *
 * This is designed for *domain* repo contracts (e.g. `entities/<Entity>/<Entity>.repo.ts`),
 * where we want custom methods to be defined in terms of the same schemas used elsewhere
 * (contracts, RPC, HTTP, AI tools).
 *
 * Defaults:
 * - `payload` / `success` are required.
 * - `failure` (or `error`) is optional. When present, it is *added* to `DatabaseError`
 *   because repo methods are expected to touch the database.
 * - `context` is optional extra environment required to run the method.
 *
 * Naming:
 * - Prefer `failure` to match `Schema.TaggedRequest` contracts.
 * - `error` is supported as an alias for ergonomics.
 *
 * @since 0.1.0
 * @category Repo
 */
export interface MethodSpec {
  /**
   * Schema describing the method payload (single-argument object).
   *
   * @since 0.1.0
   * @category Repo
   */
  readonly payload: S.Schema.Any;

  /**
   * Schema describing the method success value.
   *
   * @since 0.1.0
   * @category Repo
   */
  readonly success: S.Schema.Any;

  /**
   * Optional schema describing domain failures (in addition to `DatabaseError`).
   *
   * @since 0.1.0
   * @category Repo
   */
  readonly failure?: S.Schema.All;

  /**
   * Alias for `failure` (optional).
   *
   * @since 0.1.0
   * @category Repo
   */
  readonly error?: S.Schema.All;

  /**
   * Optional extra environment required to run the method effect.
   *
   * @since 0.1.0
   * @category Repo
   */
  readonly context?: unknown;
}

type MethodFailureSchema<Spec extends MethodSpec> = Exclude<
  ("failure" extends keyof Spec ? Spec["failure"] : never) | ("error" extends keyof Spec ? Spec["error"] : never),
  undefined
>;

/**
 * Error channel for `Method<...>`.
 *
 * @since 0.1.0
 * @category Repo
 */
export type MethodError<Spec extends MethodSpec> = DatabaseError | S.Schema.Type<MethodFailureSchema<Spec>>;

type MethodExtraContext<Spec extends MethodSpec> = Exclude<
  "context" extends keyof Spec ? Spec["context"] : never,
  undefined
>;

/**
 * Environment requirements for `Method<...>`.
 *
 * @since 0.1.0
 * @category Repo
 */
export type MethodContext<Spec extends MethodSpec> =
  | S.Schema.Context<Spec["payload"]>
  | S.Schema.Context<Spec["success"]>
  | MethodExtraContext<Spec>;

/**
 * Derives a less-verbose repo method signature from schemas.
 *
 * Example:
 * ```ts
 * readonly listByDiscussion: DbRepo.Method<{
 *   payload: typeof ListByDiscussion.Payload
 *   success: typeof ListByDiscussion.Success
 *   failure: typeof ListByDiscussion.Failure
 * }>
 * ```
 *
 * @since 0.1.0
 * @category Repo
 */
export type Method<Spec extends MethodSpec> = (
  payload: S.Schema.Type<Spec["payload"]>
) => Effect.Effect<S.Schema.Type<Spec["success"]>, MethodError<Spec>, MethodContext<Spec>>;
