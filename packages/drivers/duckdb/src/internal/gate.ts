/**
 * Per-connection native-operation lock with settle-aware cancellation.
 *
 * A DuckDB native connection runs one operation at a time, and
 * `connection.interrupt()` cancels whatever is running on the connection at
 * that moment. The gate serializes native calls behind a one-permit lock and,
 * when a caller is interrupted, keeps that lock until the interrupted native
 * promise has settled, so an interrupt can never land on the next queued
 * operation.
 *
 * @packageDocumentation
 * @internal
 * @since 0.0.0
 */

import * as Effect from "effect/Effect";
import * as Result from "effect/Result";
import * as Scope from "effect/Scope";
import * as Semaphore from "effect/Semaphore";
import { toSqlError } from "./classify.ts";
import { ignoreNative } from "./native.ts";
import type { SqlError } from "effect/sql/SqlError";

type InterruptibleNative = {
  readonly interrupt?: (() => void) | undefined;
};

/**
 * Serializes native operations on one DuckDB connection and cancels them
 * without releasing the connection before the native call settles.
 *
 * **Details**
 *
 * `run` takes the op lock for one native call. `runUnlocked` is for callers
 * that already hold the lock through `withLock` or `holdLock` (statements,
 * incremental streams, prepared-statement cache lookups). On interruption the
 * canceller calls the connection's `interrupt()` once (ignoring failures and
 * fakes without `interrupt`) and then waits for the native promise to settle.
 * A result that resolves after cancellation goes to `onLateSuccess`, which
 * disposes it while the caller still holds the lock.
 *
 * **Gotchas**
 *
 * Never call `withLock`, `run` or `holdLock` while already holding the lock of
 * the same gate: the lock has one permit and is not re-entrant.
 *
 * **Example** (Running one native call under the op lock)
 *
 * ```ts
 * import * as Effect from "effect/Effect"
 * import { NativeGate } from "./gate.ts"
 *
 * const gate = new NativeGate({ interrupt: () => undefined })
 * const program = gate.run("execute", () => Promise.resolve(42))
 * const value = Effect.runPromise(program) // resolves to 42
 * ```
 *
 * @internal
 * @category utilities
 * @since 0.0.0
 */
export class NativeGate {
  readonly #native: InterruptibleNative;
  readonly #lock: Semaphore.Semaphore;

  /**
   * Runs one native call under the op lock.
   *
   * @since 0.0.0
   */
  readonly run: <A>(operation: string, f: () => Promise<A>) => Effect.Effect<A, SqlError>;

  /**
   * Runs one native call settle-aware, for callers that already hold the op
   * lock; `onLateSuccess` disposes a result that settles after cancellation.
   *
   * @since 0.0.0
   */
  readonly runUnlocked: <A>(
    operation: string,
    f: () => Promise<A>,
    onLateSuccess?: ((a: A) => void) | undefined
  ) => Effect.Effect<A, SqlError>;

  /**
   * Takes the op lock until the surrounding scope closes.
   *
   * @since 0.0.0
   */
  readonly holdLock: Effect.Effect<void, never, Scope.Scope>;

  /**
   * Runs an effect while holding the op lock.
   *
   * @since 0.0.0
   */
  readonly withLock: <A, E, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;

  constructor(native: InterruptibleNative) {
    this.#native = native;
    this.#lock = Semaphore.makeUnsafe(1);
    const lock = this.#lock;

    this.withLock = <A, E, R>(self: Effect.Effect<A, E, R>): Effect.Effect<A, E, R> => lock.withPermit(self);

    this.runUnlocked = <A>(
      operation: string,
      f: () => Promise<A>,
      onLateSuccess?: ((a: A) => void) | undefined
    ): Effect.Effect<A, SqlError> =>
      Effect.callback<A, SqlError>((resume) => {
        let settled = false;
        let cancelled = false;
        const started = Result.try(f);
        if (Result.isFailure(started)) {
          resume(Effect.fail(toSqlError(started.failure, operation)));
          return;
        }
        const done = started.success.then(
          (a) => {
            settled = true;
            if (!cancelled) {
              resume(Effect.succeed(a));
            } else if (onLateSuccess !== undefined) {
              ignoreNative(() => onLateSuccess(a));
            }
          },
          (cause: unknown) => {
            settled = true;
            if (!cancelled) {
              resume(Effect.fail(toSqlError(cause, operation)));
            }
          }
        );
        return Effect.suspend(() => {
          cancelled = true;
          if (!settled) {
            ignoreNative(() => this.#native.interrupt?.());
          }
          return Effect.promise(() => done);
        });
      });

    this.run = <A>(operation: string, f: () => Promise<A>): Effect.Effect<A, SqlError> =>
      this.withLock(this.runUnlocked(operation, f));

    this.holdLock = Effect.uninterruptibleMask((restore) =>
      Effect.flatMap(Effect.scope, (scope) =>
        restore(lock.take(1)).pipe(Effect.andThen(Scope.addFinalizer(scope, lock.release(1))))
      )
    );
  }
}
