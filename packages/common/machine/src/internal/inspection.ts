import { Clock, Effect } from "effect";

import type { InspectionEvent, Inspector } from "../inspection";

/**
 * Emit an inspection event with timestamp from Clock.
 * @internal
 */
export const emitWithTimestamp = Effect.fn("effect-machine.emitWithTimestamp")(function* <S, E>(
  inspector: Inspector<S, E> | undefined,
  makeEvent: (timestamp: number) => InspectionEvent<S, E>
) {
  if (inspector === undefined) {
    return;
  }
  const timestamp = yield* Clock.currentTimeMillis;
  yield* Effect.try(() => inspector.onInspect(makeEvent(timestamp))).pipe(Effect.ignore);
});
