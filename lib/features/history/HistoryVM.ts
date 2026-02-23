import { Context, Effect, Layer, Clock, Stream, pipe } from "effect";
import * as Atom from "@effect-atom/atom/Atom";
import * as Registry from "@effect-atom/atom/Registry";
import { TodoEventPubSub } from "../TodoEvent";

export type HistoryEventType = "created" | "completed" | "uncompleted" | "deleted" | "edited";

export interface HistoryEvent {
  readonly id: string;
  readonly timestamp: number;
  readonly type: HistoryEventType;
  readonly todoId: string;
  readonly todoText: string;
  readonly details?: string;
}

export interface HistoryVM {
  readonly events$: Atom.Atom<HistoryEvent[]>;
  readonly recentEvents$: Atom.Atom<HistoryEvent[]>;
  readonly eventCount$: Atom.Atom<number>;
  readonly recordEvent$: Atom.AtomResultFn<Omit<HistoryEvent, "id" | "timestamp">, void, never>;
  readonly clearHistory$: Atom.AtomResultFn<void, void, never>;
}

export const HistoryVM = Context.GenericTag<HistoryVM>("HistoryVM");

export const HistoryVMLayer = Layer.scoped(
  HistoryVM,
  Effect.gen(function* () {
    const registry = yield* Registry.AtomRegistry;
    const eventPubSub = yield* TodoEventPubSub;

    const events$ = Atom.make<HistoryEvent[]>([]);
    const recentEvents$ = Atom.map(events$, (events) => events.slice(-10));
    const eventCount$ = Atom.map(events$, (events) => events.length);

    const recordEvent$ = Atom.fn((eventData: Omit<HistoryEvent, "id" | "timestamp">) =>
      Effect.gen(function* () {
        const timestamp = yield* Clock.currentTimeMillis;
        const id = yield* Effect.sync(() => crypto.randomUUID());
        const newEvent: HistoryEvent = { ...eventData, id, timestamp };
        yield* Atom.update(events$, (events) => [...events, newEvent]);
      })
    );

    const clearHistory$ = Atom.fn(() =>
      Effect.gen(function* () {
        yield* Atom.set(events$, []);
      })
    );

    yield* Effect.forkScoped(
      pipe(
        Stream.fromPubSub(eventPubSub),
        Stream.tap((event) =>
          Effect.gen(function* () {
            registry.mount(recordEvent$);
            registry.set(recordEvent$, event);
          })
        ),
        Stream.runDrain
      )
    );

    return HistoryVM.of({
      events$,
      recentEvents$,
      eventCount$,
      recordEvent$,
      clearHistory$,
    });
  })
);
