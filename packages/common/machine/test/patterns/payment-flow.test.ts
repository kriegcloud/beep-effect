// @effect-diagnostics strictEffectProvide:off - tests are entry points

import {
  ActorSystemDefault,
  ActorSystemService,
  assertNeverReaches,
  assertPath,
  Event,
  Machine,
  Slot,
  State,
} from "@beep/machine";
import { describe, expect, it, yieldFibers } from "@beep/testkit";
import { Effect, TestClock } from "effect";
import * as S from "effect/Schema";

/**
 * Payment flow pattern tests based on bite checkout-paying.machine.ts
 * Tests: retry after error, bridge vs API routing, mid-flow cancellation
 */
describe("Payment Flow Pattern", () => {
  const PaymentMethod = S.Literal("card", "bridge", "cash");
  type PaymentMethod = typeof PaymentMethod.Type;

  const PaymentState = State({
    Idle: {},
    SelectingMethod: { amount: S.Number },
    ProcessingPayment: { method: PaymentMethod, amount: S.Number, attempts: S.Number },
    AwaitingBridgeConfirm: { transactionId: S.String },
    PaymentError: {
      error: S.String,
      canRetry: S.Boolean,
      attempts: S.Number,
      amount: S.Number,
    },
    PaymentSuccess: { receiptId: S.String },
    PaymentCancelled: {},
  });
  type PaymentState = typeof PaymentState.Type;

  const PaymentEvent = Event({
    StartCheckout: { amount: S.Number },
    SelectMethod: { method: PaymentMethod },
    PaymentSucceeded: { receiptId: S.String },
    PaymentFailed: { error: S.String, canRetry: S.Boolean },
    BridgeConfirmed: { transactionId: S.String },
    BridgeTimeout: {},
    Retry: {},
    Cancel: {},
    AutoDismissError: {},
  });
  type PaymentEvent = typeof PaymentEvent.Type;

  const PaymentGuards = Slot.Guards({
    canRetry: {},
  });

  const PaymentEffects = Slot.Effects({
    scheduleBridgeTimeout: {},
    scheduleAutoDismiss: {},
  });

  const paymentMachine = Machine.make({
    state: PaymentState,
    event: PaymentEvent,
    guards: PaymentGuards,
    effects: PaymentEffects,
    initial: PaymentState.Idle,
  })
    .on(PaymentState.Idle, PaymentEvent.StartCheckout, ({ event }) =>
      PaymentState.SelectingMethod({ amount: event.amount })
    )
    // Selecting method - route to appropriate processing
    .on(PaymentState.SelectingMethod, PaymentEvent.SelectMethod, ({ state, event }) =>
      event.method === "bridge"
        ? PaymentState.AwaitingBridgeConfirm({ transactionId: "pending" })
        : PaymentState.ProcessingPayment({
            method: event.method,
            amount: state.amount,
            attempts: 1,
          })
    )
    // Processing payment results
    .on(PaymentState.ProcessingPayment, PaymentEvent.PaymentSucceeded, ({ event }) =>
      PaymentState.PaymentSuccess({ receiptId: event.receiptId })
    )
    .on(PaymentState.ProcessingPayment, PaymentEvent.PaymentFailed, ({ state, event }) =>
      PaymentState.PaymentError({
        error: event.error,
        canRetry: event.canRetry,
        attempts: state.attempts,
        amount: state.amount,
      })
    )
    // Bridge confirmation
    .on(PaymentState.AwaitingBridgeConfirm, PaymentEvent.BridgeConfirmed, ({ event }) =>
      PaymentState.PaymentSuccess({ receiptId: `bridge-${event.transactionId}` })
    )
    .on(PaymentState.AwaitingBridgeConfirm, PaymentEvent.BridgeTimeout, () =>
      PaymentState.PaymentError({
        error: "Bridge timeout",
        canRetry: true,
        attempts: 1,
        amount: 0,
      })
    )
    // Error handling - retry with guard
    .on(PaymentState.PaymentError, PaymentEvent.Retry, ({ state, guards }) =>
      Effect.gen(function* () {
        if (yield* guards.canRetry()) {
          return PaymentState.ProcessingPayment({
            method: "card",
            amount: state.amount,
            attempts: state.attempts + 1,
          });
        }
        return state;
      })
    )
    // Auto-dismiss goes back to idle (only for non-retryable errors)
    .on(PaymentState.PaymentError, PaymentEvent.AutoDismissError, ({ state }) => {
      // Only auto-dismiss if not retryable
      if (!state.canRetry) {
        return PaymentState.Idle;
      }
      return state; // Stay in error state
    })
    // Timeout tasks
    .task(PaymentState.AwaitingBridgeConfirm, ({ effects }) => effects.scheduleBridgeTimeout(), {
      onSuccess: () => PaymentEvent.BridgeTimeout,
    })
    // Delay timer only fires for non-retryable errors
    // This works because the timer still fires, but the transition handler can check state
    .task(PaymentState.PaymentError, ({ effects }) => effects.scheduleAutoDismiss(), {
      onSuccess: () => PaymentEvent.AutoDismissError,
    })
    // Cancel from multiple states
    .on(PaymentState.SelectingMethod, PaymentEvent.Cancel, () => PaymentState.PaymentCancelled)
    .on(PaymentState.ProcessingPayment, PaymentEvent.Cancel, () => PaymentState.PaymentCancelled)
    .on(PaymentState.AwaitingBridgeConfirm, PaymentEvent.Cancel, () => PaymentState.PaymentCancelled)
    .on(PaymentState.PaymentError, PaymentEvent.Cancel, () => PaymentState.PaymentCancelled)
    .final(PaymentState.PaymentSuccess)
    .final(PaymentState.PaymentCancelled)
    .build({
      canRetry: (_params, { state }) => {
        const s = state as { canRetry: boolean; attempts: number };
        return s.canRetry && s.attempts < 3;
      },
      scheduleBridgeTimeout: () => Effect.sleep("30 seconds"),
      scheduleAutoDismiss: () => Effect.sleep("5 seconds"),
    });

  it.live("card payment happy path", () =>
    assertPath(
      paymentMachine,
      [
        PaymentEvent.StartCheckout({ amount: 100 }),
        PaymentEvent.SelectMethod({ method: "card" }),
        PaymentEvent.PaymentSucceeded({ receiptId: "rcpt-123" }),
      ],
      ["Idle", "SelectingMethod", "ProcessingPayment", "PaymentSuccess"]
    )
  );

  it.live("bridge payment flow", () =>
    assertPath(
      paymentMachine,
      [
        PaymentEvent.StartCheckout({ amount: 200 }),
        PaymentEvent.SelectMethod({ method: "bridge" }),
        PaymentEvent.BridgeConfirmed({ transactionId: "tx-456" }),
      ],
      ["Idle", "SelectingMethod", "AwaitingBridgeConfirm", "PaymentSuccess"]
    )
  );

  it.live("retry after error with guard cascade", () =>
    assertPath(
      paymentMachine,
      [
        PaymentEvent.StartCheckout({ amount: 50 }),
        PaymentEvent.SelectMethod({ method: "card" }),
        PaymentEvent.PaymentFailed({ error: "Network error", canRetry: true }),
        PaymentEvent.Retry,
        PaymentEvent.PaymentSucceeded({ receiptId: "rcpt-retry" }),
      ],
      ["Idle", "SelectingMethod", "ProcessingPayment", "PaymentError", "ProcessingPayment", "PaymentSuccess"]
    )
  );

  it.scopedLive("retry blocked after max attempts", () =>
    Effect.gen(function* () {
      const system = yield* ActorSystemService;
      const actor = yield* system.spawn("payment", paymentMachine);

      yield* actor.send(PaymentEvent.StartCheckout({ amount: 50 }));
      yield* actor.send(PaymentEvent.SelectMethod({ method: "card" }));

      // Fail and retry twice (total 3 attempts)
      yield* actor.send(PaymentEvent.PaymentFailed({ error: "Error 1", canRetry: true }));
      yield* yieldFibers;
      yield* actor.send(PaymentEvent.Retry);
      yield* yieldFibers;
      yield* actor.send(PaymentEvent.PaymentFailed({ error: "Error 2", canRetry: true }));
      yield* yieldFibers;
      yield* actor.send(PaymentEvent.Retry);
      yield* yieldFibers;
      yield* actor.send(PaymentEvent.PaymentFailed({ error: "Error 3", canRetry: true }));
      yield* yieldFibers;

      // Third retry should be blocked (attempts = 3, guard requires < 3)
      yield* actor.send(PaymentEvent.Retry);
      yield* yieldFibers;

      const state = yield* actor.state.get;
      expect(state._tag).toBe("PaymentError");
    }).pipe(Effect.provide(ActorSystemDefault))
  );

  it.live("mid-flow cancellation", () =>
    assertPath(
      paymentMachine,
      [PaymentEvent.StartCheckout({ amount: 100 }), PaymentEvent.SelectMethod({ method: "card" }), PaymentEvent.Cancel],
      ["Idle", "SelectingMethod", "ProcessingPayment", "PaymentCancelled"]
    )
  );

  it.live("cancellation never reaches success", () =>
    assertNeverReaches(
      paymentMachine,
      [PaymentEvent.StartCheckout({ amount: 100 }), PaymentEvent.Cancel],
      "PaymentSuccess"
    )
  );

  it.scoped("bridge timeout triggers error", () =>
    Effect.gen(function* () {
      const system = yield* ActorSystemService;
      const actor = yield* system.spawn("payment", paymentMachine);

      yield* actor.send(PaymentEvent.StartCheckout({ amount: 100 }));
      yield* actor.send(PaymentEvent.SelectMethod({ method: "bridge" }));
      yield* yieldFibers;

      let state = yield* actor.state.get;
      expect(state._tag).toBe("AwaitingBridgeConfirm");

      // Advance past timeout
      yield* TestClock.adjust("30 seconds");
      yield* yieldFibers;

      state = yield* actor.state.get;
      expect(state._tag).toBe("PaymentError");
    }).pipe(Effect.provide(ActorSystemDefault))
  );

  it.scoped("non-retryable error auto-dismisses", () =>
    Effect.gen(function* () {
      const system = yield* ActorSystemService;
      const actor = yield* system.spawn("payment", paymentMachine);

      yield* actor.send(PaymentEvent.StartCheckout({ amount: 100 }));
      yield* actor.send(PaymentEvent.SelectMethod({ method: "card" }));
      yield* actor.send(PaymentEvent.PaymentFailed({ error: "Card declined", canRetry: false }));
      yield* yieldFibers;

      let state = yield* actor.state.get;
      expect(state._tag).toBe("PaymentError");

      // Wait for auto-dismiss
      yield* TestClock.adjust("5 seconds");
      yield* yieldFibers;

      state = yield* actor.state.get;
      expect(state._tag).toBe("Idle");
    }).pipe(Effect.provide(ActorSystemDefault))
  );
});
