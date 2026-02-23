import { describe, it, expect } from "vitest";
import { assert } from "chai";
import * as Atom from "@effect-atom/atom/Atom";
import * as Registry from "@effect-atom/atom/Registry";
import * as Result from "@effect-atom/atom/Result";
import { HistoryVM, HistoryVMLayer } from "./HistoryVM";
import { Context, Effect, Layer } from "effect";

describe("HistoryVM", () => {
  const makeVM = () => {
    const r = Registry.make();
    const vm = Layer.build(HistoryVMLayer).pipe(
      Effect.map((ctx) => Context.get(ctx, HistoryVM)),
      Effect.scoped,
      Effect.provideService(Registry.AtomRegistry, r),
      Effect.runSync
    );
    // Mount the fn atoms so they can run effects
    r.mount(vm.recordEvent$);
    r.mount(vm.clearHistory$);
    return { r, vm };
  };

  it("should start with empty events", () => {
    const { r, vm } = makeVM();
    expect(r.get(vm.events$)).toEqual([]);
  });

  it("should start with zero eventCount", () => {
    const { r, vm } = makeVM();
    expect(r.get(vm.eventCount$)).toBe(0);
  });

  it("should record an event with generated id and timestamp", async () => {
    const { r, vm } = makeVM();

    r.set(vm.recordEvent$, {
      type: "created",
      todoId: "todo-1",
      todoText: "Test todo",
    });

    const result = r.get(vm.recordEvent$);
    assert(Result.isSuccess(result));

    const events = r.get(vm.events$);
    expect(events.length).toBe(1);
    expect(events[0].type).toBe("created");
    expect(events[0].todoId).toBe("todo-1");
    expect(events[0].todoText).toBe("Test todo");
    expect(typeof events[0].id).toBe("string");
    expect(events[0].id.length).toBeGreaterThan(0);
    expect(typeof events[0].timestamp).toBe("number");
  });

  it("should record multiple events", () => {
    const { r, vm } = makeVM();

    r.set(vm.recordEvent$, { type: "created", todoId: "todo-1", todoText: "First" });
    r.set(vm.recordEvent$, { type: "completed", todoId: "todo-1", todoText: "First" });
    r.set(vm.recordEvent$, { type: "deleted", todoId: "todo-2", todoText: "Second" });

    const events = r.get(vm.events$);
    expect(events.length).toBe(3);
    expect(events[0].type).toBe("created");
    expect(events[1].type).toBe("completed");
    expect(events[2].type).toBe("deleted");
  });

  it("should update eventCount when recording events", () => {
    const { r, vm } = makeVM();

    expect(r.get(vm.eventCount$)).toBe(0);

    r.set(vm.recordEvent$, { type: "created", todoId: "todo-1", todoText: "Test" });
    expect(r.get(vm.eventCount$)).toBe(1);

    r.set(vm.recordEvent$, { type: "completed", todoId: "todo-1", todoText: "Test" });
    expect(r.get(vm.eventCount$)).toBe(2);
  });

  it("should return only last 10 events in recentEvents$", () => {
    const { r, vm } = makeVM();

    for (let i = 0; i < 15; i++) {
      r.set(vm.recordEvent$, { type: "created", todoId: `todo-${i}`, todoText: `Todo ${i}` });
    }

    const allEvents = r.get(vm.events$);
    const recentEvents = r.get(vm.recentEvents$);

    expect(allEvents.length).toBe(15);
    expect(recentEvents.length).toBe(10);
    expect(recentEvents[0].todoId).toBe("todo-5");
    expect(recentEvents[9].todoId).toBe("todo-14");
  });

  it("should clear all history", () => {
    const { r, vm } = makeVM();

    r.set(vm.recordEvent$, { type: "created", todoId: "todo-1", todoText: "Test" });
    r.set(vm.recordEvent$, { type: "created", todoId: "todo-2", todoText: "Test 2" });

    expect(r.get(vm.eventCount$)).toBe(2);

    r.set(vm.clearHistory$, undefined);

    expect(r.get(vm.events$)).toEqual([]);
    expect(r.get(vm.eventCount$)).toBe(0);
  });

  it("should record event with optional details", () => {
    const { r, vm } = makeVM();

    r.set(vm.recordEvent$, {
      type: "edited",
      todoId: "todo-1",
      todoText: "Updated",
      details: "Changed from 'Old' to 'Updated'",
    });

    const events = r.get(vm.events$);
    expect(events[0].details).toBe("Changed from 'Old' to 'Updated'");
  });

  it("should generate unique ids for each event", () => {
    const { r, vm } = makeVM();

    r.set(vm.recordEvent$, { type: "created", todoId: "todo-1", todoText: "First" });
    r.set(vm.recordEvent$, { type: "created", todoId: "todo-2", todoText: "Second" });
    r.set(vm.recordEvent$, { type: "created", todoId: "todo-3", todoText: "Third" });

    const events = r.get(vm.events$);
    const ids = events.map((e) => e.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(3);
  });

  it("should record all event types", () => {
    const { r, vm } = makeVM();

    const eventTypes = ["created", "completed", "uncompleted", "deleted", "edited"] as const;

    for (const type of eventTypes) {
      r.set(vm.recordEvent$, { type, todoId: "todo-1", todoText: "Test" });
    }

    const events = r.get(vm.events$);
    expect(events.length).toBe(5);
    expect(events.map((e) => e.type)).toEqual(eventTypes);
  });
});
