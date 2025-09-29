import * as Effect from "effect/Effect";
import * as STM from "effect/STM";
import * as SynchronizedRef from "effect/SynchronizedRef";
import * as TSemaphore from "effect/TSemaphore";

export type SemaphoreRegistry = Map<string, TSemaphore.TSemaphore>;

const DEFAULT_PERMITS = 1;

const registryRef = Effect.runSync(SynchronizedRef.make<SemaphoreRegistry>(new Map()));

const acquireSemaphore = (key: string): Effect.Effect<TSemaphore.TSemaphore> =>
  SynchronizedRef.modifyEffect(registryRef, (registry) => {
    const existing = registry.get(key);
    if (existing) {
      return Effect.succeed<readonly [TSemaphore.TSemaphore, SemaphoreRegistry]>([existing, registry]);
    }

    return Effect.map(STM.commit(TSemaphore.make(DEFAULT_PERMITS)), (semaphore) => {
      const nextRegistry = new Map(registry);
      nextRegistry.set(key, semaphore);
      return [semaphore, nextRegistry] as const;
    });
  });

export const withSubmissionGuard =
  (key: string) =>
  <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E, R> =>
    Effect.gen(function* () {
      const semaphore = yield* acquireSemaphore(key);
      return yield* TSemaphore.withPermits(semaphore, DEFAULT_PERMITS)(effect);
    });

export const getSemaphore = (key: string): Effect.Effect<TSemaphore.TSemaphore | undefined> =>
  SynchronizedRef.get(registryRef).pipe(Effect.map((registry) => registry.get(key)));
