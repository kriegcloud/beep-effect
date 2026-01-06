import { $RuntimeClientId } from "@beep/identity/packages";
import * as Chunk from "effect/Chunk";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import * as SubscriptionRef from "effect/SubscriptionRef";

const $I = $RuntimeClientId.create("services/network-monitor");

export class NetworkMonitor extends Effect.Service<NetworkMonitor>()($I`NetworkMonitor`, {
  scoped: Effect.gen(function* () {
    const latch = yield* Effect.makeLatch(true);

    const ref = yield* SubscriptionRef.make<boolean>(window.navigator.onLine);
    yield* Stream.async<boolean>((emit) => {
      const onlineHandler = () => emit(Effect.succeed(Chunk.of(true)));
      const offlineHandler = () => emit(Effect.succeed(Chunk.of(false)));
      window.addEventListener("online", onlineHandler);
      window.addEventListener("offline", offlineHandler);
    }).pipe(
      Stream.tap((isOnline) =>
        (isOnline ? latch.open : latch.close).pipe(Effect.zipRight(SubscriptionRef.update(ref, () => isOnline)))
      ),
      Stream.runDrain,
      Effect.forkScoped
    );

    return { latch, ref };
  }),
  accessors: true,
}) {}
