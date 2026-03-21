import type { TickEvent } from "@repo/domain/Rpc";
import { Effect, Stream } from "effect";
import { runtime } from "../atom";
import { RpcClient } from "../rpc-client";

export const tickAtom = runtime.fn(
  ({ abort = false }: { readonly abort?: boolean }) =>
    Stream.unwrap(
      Effect.gen(function* () {
        yield* Effect.log("Starting Tick Atom Stream");
        const rpc = yield* RpcClient;
        return rpc.client.tick({ ticks: 10 });
      }).pipe((self) => (abort ? Effect.interrupt : self)),
    ).pipe(
      Stream.catchTags({
        RpcClientError: (e) => Stream.die(e),
      }),
      Stream.mapAccum(
        () => ({ acc: "" }),
        (
          state,
          event: typeof TickEvent.Type,
        ): readonly [
          { acc: string },
          ReadonlyArray<{ text: string; event: typeof TickEvent.Type }>,
        ] => {
          switch (event._tag) {
            case "starting": {
              const startAcc = "Start";
              return [{ acc: startAcc }, [{ text: startAcc, event }]] as const;
            }
            case "tick": {
              const tickAcc = `${state.acc}.`;
              return [{ acc: tickAcc }, [{ text: tickAcc, event }]] as const;
            }
            case "end": {
              const endAcc = `${state.acc} End`;
              return [{ acc: endAcc }, [{ text: endAcc, event }]] as const;
            }
            default:
              return [state, [{ text: state.acc, event }]] as const;
          }
        },
      ),
    ),
);
