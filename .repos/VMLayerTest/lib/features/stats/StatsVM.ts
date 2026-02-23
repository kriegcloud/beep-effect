import { Clock, Context, Effect, Layer, pipe } from "effect";
import * as Atom from "@effect-atom/atom/Atom";
import * as Stream from "effect/Stream"
import * as Result from "@effect-atom/atom/Result";
import { TodoVM } from "../todos/TodoVM";
import { HistoryVM } from "../history/HistoryVM";
import { Registry } from "@effect-atom/atom";

export interface StatsVM {
  readonly totalTodos$: Atom.Atom<number>;
  readonly completedTodos$: Atom.Atom<number>;
  readonly activeTodos$: Atom.Atom<number>;
  readonly completionRate$: Atom.Atom<number>;
  readonly todosCreatedToday$: Atom.Atom<number>;
  readonly todosCompletedToday$: Atom.Atom<number>;
}

export const StatsVM = Context.GenericTag<StatsVM>("StatsVM");

const getTodayStart = Effect.gen(function* () {
  const now = yield* Clock.currentTimeMillis;
  const date = new Date(now);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
});

export const StatsVMLayer = Layer.effect(
  StatsVM,
  Effect.gen(function* () {
    const todoVM = yield* TodoVM;
    const historyVM = yield* HistoryVM;



    const todayStart$ = Atom.make(getTodayStart);

    const completionRate$ = Atom.make((get) => {
      const total = get(todoVM.totalCount$);
      const completed = get(todoVM.completedCount$);
      return total === 0 ? 0 : completed / total;
    });

    const todosCreatedToday$ = Atom.make((get) => {
      const events = get(historyVM.events$);
      const todayStart = Result.getOrElse(get(todayStart$), () => 0);
      return events.filter(
        (e) => e.type === "created" && e.timestamp >= todayStart
      ).length;
    });

    const todosCompletedToday$ = Atom.make((get) => {
      const events = get(historyVM.events$);
      const todayStart = Result.getOrElse(get(todayStart$), () => 0);
      return events.filter(
        (e) => e.type === "completed" && e.timestamp >= todayStart
      ).length;
    });

    return {
      totalTodos$: todoVM.totalCount$,
      completedTodos$: todoVM.completedCount$,
      activeTodos$: todoVM.activeCount$,
      completionRate$,
      todosCreatedToday$,
      todosCompletedToday$,
    };
  })
);
