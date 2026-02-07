// @effect-diagnostics strictEffectProvide:off - tests are entry points
/**
 * State/Event Schema Tests
 *
 * Verifies schema-first State/Event definitions work correctly:
 * - Schema validation/encoding/decoding
 * - Variant constructors
 * - Pattern matching ($is, $match)
 * - Integration with Machine
 */

import { Event, Machine, State, simulate } from "@beep/machine";
import { describe, expect, test } from "@beep/testkit";
import { Effect } from "effect";
import * as S from "effect/Schema";

describe("State (schema-first)", () => {
  test("creates variant constructors", () => {
    const OrderState = State({
      Pending: { orderId: S.String },
      Shipped: { trackingId: S.String },
    });

    const pending = OrderState.Pending({ orderId: "order-123" });
    expect(pending._tag).toBe("Pending");
    expect(pending.orderId).toBe("order-123");

    const shipped = OrderState.Shipped({ trackingId: "track-456" });
    expect(shipped._tag).toBe("Shipped");
    expect(shipped.trackingId).toBe("track-456");
  });

  test("$is type guard works", () => {
    const OrderState = State({
      Pending: { orderId: S.String },
      Shipped: { trackingId: S.String },
    });

    const pending = OrderState.Pending({ orderId: "123" });
    const shipped = OrderState.Shipped({ trackingId: "456" });

    expect(OrderState.$is("Pending")(pending)).toBe(true);
    expect(OrderState.$is("Shipped")(pending)).toBe(false);
    expect(OrderState.$is("Pending")(shipped)).toBe(false);
    expect(OrderState.$is("Shipped")(shipped)).toBe(true);

    // Invalid values
    expect(OrderState.$is("Pending")(null)).toBe(false);
    expect(OrderState.$is("Pending")(undefined)).toBe(false);
    expect(OrderState.$is("Pending")({ _tag: "Other" })).toBe(false);
  });

  test("$match works (uncurried)", () => {
    const OrderState = State({
      Pending: { orderId: S.String },
      Shipped: { trackingId: S.String },
    });

    const pending = OrderState.Pending({ orderId: "123" });
    const shipped = OrderState.Shipped({ trackingId: "456" });

    const pendingResult = OrderState.$match(pending, {
      Pending: (s) => `Order ${s.orderId} pending`,
      Shipped: (s) => `Shipped: ${s.trackingId}`,
    });
    expect(pendingResult).toBe("Order 123 pending");

    const shippedResult = OrderState.$match(shipped, {
      Pending: (s) => `Order ${s.orderId} pending`,
      Shipped: (s) => `Shipped: ${s.trackingId}`,
    });
    expect(shippedResult).toBe("Shipped: 456");
  });

  test("$match works (curried)", () => {
    const OrderState = State({
      Pending: { orderId: S.String },
      Shipped: { trackingId: S.String },
    });

    const matcher = OrderState.$match({
      Pending: (s) => `pending:${s.orderId}`,
      Shipped: (s) => `shipped:${s.trackingId}`,
    });

    expect(matcher(OrderState.Pending({ orderId: "a" }))).toBe("pending:a");
    expect(matcher(OrderState.Shipped({ trackingId: "b" }))).toBe("shipped:b");
  });

  test("works as Schema for decode", () => {
    const OrderState = State({
      Pending: { orderId: S.String },
      Shipped: { trackingId: S.String },
    });

    // Decode valid data
    const decoded = S.decodeUnknownSync(OrderState)({
      _tag: "Pending",
      orderId: "test-order",
    });
    expect(decoded._tag).toBe("Pending");
    expect((decoded as { orderId: string }).orderId).toBe("test-order");

    // Decode another variant
    const decoded2 = S.decodeUnknownSync(OrderState)({
      _tag: "Shipped",
      trackingId: "abc",
    });
    expect(decoded2._tag).toBe("Shipped");
  });

  test("works as Schema for encode", () => {
    const OrderState = State({
      Pending: { orderId: S.String },
      Shipped: { trackingId: S.String },
    });

    const pending = OrderState.Pending({ orderId: "123" });
    const encoded = S.encodeSync(OrderState)(pending);

    expect(encoded).toEqual({ _tag: "Pending", orderId: "123" });
  });

  test("validation rejects invalid data", () => {
    const OrderState = State({
      Pending: { orderId: S.String },
      Shipped: { trackingId: S.String },
    });

    // Invalid _tag
    expect(() => S.decodeUnknownSync(OrderState)({ _tag: "Invalid" })).toThrow();

    // Missing required field
    expect(() => S.decodeUnknownSync(OrderState)({ _tag: "Pending" })).toThrow();

    // Wrong field type
    expect(() => S.decodeUnknownSync(OrderState)({ _tag: "Pending", orderId: 123 })).toThrow();
  });

  test("variants property provides per-variant schemas", () => {
    const OrderState = State({
      Pending: { orderId: S.String },
      Shipped: { trackingId: S.String },
    });

    // Access individual variant schemas
    expect(OrderState.variants.Pending).toBeDefined();
    expect(OrderState.variants.Shipped).toBeDefined();

    // Can decode individual variant
    const pending = S.decodeUnknownSync(OrderState.variants.Pending)({
      _tag: "Pending",
      orderId: "test",
    });
    expect(pending.orderId).toBe("test");
  });

  test("handles empty fields variant", () => {
    const ToggleState = State({
      On: {},
      Off: {},
    });

    // Empty variants are values, not constructors
    const on = ToggleState.On;
    expect(on._tag).toBe("On");

    const off = ToggleState.Off;
    expect(off._tag).toBe("Off");
  });
});

describe("State.derive()", () => {
  test("same-state: preserves other fields, overrides specified", () => {
    const TS = State({
      Editor: { text: S.String, cursor: S.Number },
    });

    const s = TS.Editor({ text: "hello", cursor: 0 });
    const s2 = TS.Editor.derive(s, { cursor: 5 });

    expect(s2._tag).toBe("Editor");
    expect(s2.text).toBe("hello");
    expect(s2.cursor).toBe(5);
  });

  test("same-state: no partial returns copy", () => {
    const TS = State({
      A: { x: S.Number, y: S.String },
    });

    const s = TS.A({ x: 10, y: "hi" });
    const s2 = TS.A.derive(s);

    expect(s2._tag).toBe("A");
    expect(s2.x).toBe(10);
    expect(s2.y).toBe("hi");
  });

  test("cross-state: picks only target fields from source", () => {
    const TS = State({
      A: { x: S.Number, y: S.String },
      B: { x: S.Number },
    });

    const a = TS.A({ x: 42, y: "hello" });
    const b = TS.B.derive(a);

    expect(b._tag).toBe("B");
    expect(b.x).toBe(42);
    expect((b as unknown as Record<string, unknown>).y).toBeUndefined();
  });

  test("cross-state: picks + overrides", () => {
    const TS = State({
      A: { x: S.Number, y: S.String },
      B: { x: S.Number, z: S.Boolean },
    });

    const a = TS.A({ x: 1, y: "test" });
    const b = TS.B.derive(a, { z: true });

    expect(b._tag).toBe("B");
    expect(b.x).toBe(1);
    expect(b.z).toBe(true);
  });

  test("empty variant: derive returns tagged value", () => {
    const TS = State({
      Idle: {},
      Active: { value: S.Number },
    });

    const active = TS.Active({ value: 5 });
    const idle = TS.Idle.derive(active);

    expect(idle._tag).toBe("Idle");
    expect(Object.keys(idle)).toEqual(["_tag"]);
  });

  test("partial overrides win over source fields", () => {
    const TS = State({
      A: { x: S.Number, y: S.Number },
    });

    const s = TS.A({ x: 1, y: 2 });
    const s2 = TS.A.derive(s, { x: 99 });

    expect(s2.x).toBe(99);
    expect(s2.y).toBe(2);
  });

  test("fields not in target are dropped", () => {
    const TS = State({
      A: { x: S.Number, extra: S.String },
      B: { x: S.Number },
    });

    const a = TS.A({ x: 1, extra: "nope" });
    const b = TS.B.derive(a);

    expect(b.x).toBe(1);
    expect((b as unknown as Record<string, unknown>).extra).toBeUndefined();
  });
});

describe("Event (schema-first)", () => {
  test("creates event constructors", () => {
    const OrderEvent = Event({
      Ship: { trackingId: S.String },
      Cancel: { reason: S.String },
    });

    const ship = OrderEvent.Ship({ trackingId: "track-123" });
    expect(ship._tag).toBe("Ship");
    expect(ship.trackingId).toBe("track-123");
  });

  test("$is and $match work for events", () => {
    const OrderEvent = Event({
      Ship: { trackingId: S.String },
      Cancel: { reason: S.String },
    });

    const ship = OrderEvent.Ship({ trackingId: "abc" });

    expect(OrderEvent.$is("Ship")(ship)).toBe(true);
    expect(OrderEvent.$is("Cancel")(ship)).toBe(false);

    const result = OrderEvent.$match(ship, {
      Ship: (e) => `Shipping: ${e.trackingId}`,
      Cancel: (e) => `Cancelled: ${e.reason}`,
    });
    expect(result).toBe("Shipping: abc");
  });
});

describe("State/Event with Machine", () => {
  test("schema-first types work with Machine.make (using derive)", async () => {
    const OrderState = State({
      Pending: { orderId: S.String },
      Processing: { orderId: S.String },
      Shipped: { orderId: S.String, trackingId: S.String },
    });
    type OrderState = typeof OrderState.Type;

    const OrderEvent = Event({
      Process: {},
      Ship: { trackingId: S.String },
    });
    type OrderEvent = typeof OrderEvent.Type;

    // Machine uses derive to carry orderId across states
    const machine = Machine.make({
      state: OrderState,
      event: OrderEvent,
      initial: OrderState.Pending({ orderId: "test-order" }),
    })
      .on(OrderState.Pending, OrderEvent.Process, ({ state }) => OrderState.Processing.derive(state))
      .on(OrderState.Processing, OrderEvent.Ship, ({ state, event }) =>
        OrderState.Shipped.derive(state, { trackingId: event.trackingId })
      )
      .final(OrderState.Shipped);

    const result = await Effect.runPromise(
      simulate(machine, [OrderEvent.Process, OrderEvent.Ship({ trackingId: "TRACK-123" })])
    );

    expect(result.finalState._tag).toBe("Shipped");
    expect((result.finalState as { trackingId: string }).trackingId).toBe("TRACK-123");
    expect((result.finalState as { orderId: string }).orderId).toBe("test-order");
  });

  test("state constructors are compatible with Machine.on", () => {
    const TestState = State({
      A: { value: S.Number },
      B: { value: S.Number },
    });
    type TestState = typeof TestState.Type;

    const TestEvent = Event({
      Next: {},
    });
    type TestEvent = typeof TestEvent.Type;

    // This should compile - state constructors produce branded types
    const machine = Machine.make({
      state: TestState,
      event: TestEvent,
      initial: TestState.A({ value: 0 }),
    }).on(TestState.A, TestEvent.Next, ({ state }) => TestState.B({ value: state.value + 1 }));

    expect(machine.transitions.length).toBe(1);
  });

  test("fluent from() scopes transitions to a state", async () => {
    const EditorState = State({
      Idle: {},
      Typing: { text: S.String },
      Submitted: { text: S.String },
    });

    const EditorEvent = Event({
      Focus: {},
      KeyPress: { key: S.String },
      Submit: {},
    });

    const machine = Machine.make({
      state: EditorState,
      event: EditorEvent,
      initial: EditorState.Idle,
    })
      .on(EditorState.Idle, EditorEvent.Focus, () => EditorState.Typing({ text: "" }))
      .on(EditorState.Typing, EditorEvent.KeyPress, ({ state, event }) =>
        EditorState.Typing({ text: state.text + event.key })
      )
      .on(EditorState.Typing, EditorEvent.Submit, ({ state }) => EditorState.Submitted({ text: state.text }))
      .final(EditorState.Submitted);

    // 3 transitions: Idle->Focus, Typing->KeyPress, Typing->Submit
    expect(machine.transitions.length).toBe(3);

    const result = await Effect.runPromise(
      simulate(machine, [
        EditorEvent.Focus,
        EditorEvent.KeyPress({ key: "h" }),
        EditorEvent.KeyPress({ key: "i" }),
        EditorEvent.Submit,
      ])
    );

    expect(result.finalState._tag).toBe("Submitted");
    expect((result.finalState as { text: string }).text).toBe("hi");
  });

  test("multiple state transitions with multi-state .on()", async () => {
    const WorkflowState = State({
      Draft: {},
      Review: {},
      Approved: {},
      Cancelled: {},
    });

    const WorkflowEvent = Event({
      Submit: {},
      Approve: {},
      Cancel: {},
    });

    const machine = Machine.make({
      state: WorkflowState,
      event: WorkflowEvent,
      initial: WorkflowState.Draft,
    })
      .on(WorkflowState.Draft, WorkflowEvent.Submit, () => WorkflowState.Review)
      .on(WorkflowState.Review, WorkflowEvent.Approve, () => WorkflowState.Approved)
      // Cancel from Draft or Review → Cancelled (multi-state .on)
      .on([WorkflowState.Draft, WorkflowState.Review], WorkflowEvent.Cancel, () => WorkflowState.Cancelled)
      .final(WorkflowState.Approved)
      .final(WorkflowState.Cancelled);

    // Cancel from Draft
    const result1 = await Effect.runPromise(simulate(machine, [WorkflowEvent.Cancel]));
    expect(result1.finalState._tag).toBe("Cancelled");

    // Cancel from Review
    const result2 = await Effect.runPromise(simulate(machine, [WorkflowEvent.Submit, WorkflowEvent.Cancel]));
    expect(result2.finalState._tag).toBe("Cancelled");

    // Normal flow
    const result3 = await Effect.runPromise(simulate(machine, [WorkflowEvent.Submit, WorkflowEvent.Approve]));
    expect(result3.finalState._tag).toBe("Approved");
  });
});
