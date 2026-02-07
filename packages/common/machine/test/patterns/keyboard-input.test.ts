import { assertPath, Event, Machine, State, simulate } from "@beep/machine";
import { describe, expect, test } from "@beep/testkit";
import { Effect } from "effect";
import * as S from "effect/Schema";

/**
 * Keyboard input pattern tests based on bite keyboard.machine.ts
 * Tests: mode switching, value accumulation, clear/backspace behavior
 */
describe("Keyboard Input Pattern", () => {
  type InputMode = "insert" | "append" | "replace";
  const InputMode = S.Literal("insert", "append", "replace");

  const KeyboardState = State({
    Idle: { value: S.String, mode: InputMode },
    Typing: { value: S.String, mode: InputMode },
    Confirming: { value: S.String },
  });
  type KeyboardState = typeof KeyboardState.Type;

  const KeyboardEvent = Event({
    Focus: {},
    KeyPress: { key: S.String },
    Backspace: {},
    Clear: {},
    SwitchMode: { mode: InputMode },
    Submit: {},
    Cancel: {},
  });
  type KeyboardEvent = typeof KeyboardEvent.Type;

  const keyboardMachine = Machine.make({
    state: KeyboardState,
    event: KeyboardEvent,
    initial: KeyboardState.Idle({ value: "", mode: "insert" }),
  })
    // Focus activates keyboard
    .on(KeyboardState.Idle, KeyboardEvent.Focus, ({ state }) =>
      KeyboardState.Typing({ value: state.value, mode: state.mode })
    )
    // Typing state handlers
    // Key input - different modes (same state, no lifecycle by default)
    .on(KeyboardState.Typing, KeyboardEvent.KeyPress, ({ state, event }) => {
      let newValue: string;
      switch (state.mode) {
        case "insert":
          newValue = state.value + event.key;
          break;
        case "append":
          newValue = state.value + event.key;
          break;
        case "replace":
          newValue = event.key;
          break;
      }
      return KeyboardState.Typing({ value: newValue, mode: state.mode });
    })
    // Backspace
    .on(KeyboardState.Typing, KeyboardEvent.Backspace, ({ state }) =>
      KeyboardState.Typing({ value: state.value.slice(0, -1), mode: state.mode })
    )
    // Clear all input
    .on(KeyboardState.Typing, KeyboardEvent.Clear, ({ state }) => KeyboardState.Typing({ value: "", mode: state.mode }))
    // Mode switching
    .on(KeyboardState.Typing, KeyboardEvent.SwitchMode, ({ state, event }) =>
      KeyboardState.Typing({ value: state.value, mode: event.mode })
    )
    // Submit
    .on(KeyboardState.Typing, KeyboardEvent.Submit, ({ state }) => KeyboardState.Confirming({ value: state.value }))
    // Cancel
    .on(KeyboardState.Typing, KeyboardEvent.Cancel, () => KeyboardState.Idle({ value: "", mode: "insert" }))
    // Confirming state - cancel returns to typing
    .on(KeyboardState.Confirming, KeyboardEvent.Cancel, ({ state }) =>
      KeyboardState.Typing({ value: state.value, mode: "insert" })
    );

  test("basic value accumulation", async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        const result = yield* simulate(keyboardMachine, [
          KeyboardEvent.Focus,
          KeyboardEvent.KeyPress({ key: "1" }),
          KeyboardEvent.KeyPress({ key: "2" }),
          KeyboardEvent.KeyPress({ key: "3" }),
        ]);

        expect(result.finalState._tag).toBe("Typing");
        expect((result.finalState as KeyboardState & { _tag: "Typing" }).value).toBe("123");
      })
    );
  });

  test("backspace removes last character", async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        const result = yield* simulate(keyboardMachine, [
          KeyboardEvent.Focus,
          KeyboardEvent.KeyPress({ key: "1" }),
          KeyboardEvent.KeyPress({ key: "2" }),
          KeyboardEvent.KeyPress({ key: "3" }),
          KeyboardEvent.Backspace,
        ]);

        expect((result.finalState as KeyboardState & { _tag: "Typing" }).value).toBe("12");
      })
    );
  });

  test("multiple backspaces", async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        const result = yield* simulate(keyboardMachine, [
          KeyboardEvent.Focus,
          KeyboardEvent.KeyPress({ key: "a" }),
          KeyboardEvent.KeyPress({ key: "b" }),
          KeyboardEvent.Backspace,
          KeyboardEvent.Backspace,
          KeyboardEvent.Backspace, // Extra backspace on empty string
        ]);

        expect((result.finalState as KeyboardState & { _tag: "Typing" }).value).toBe("");
      })
    );
  });

  test("clear resets value", async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        const result = yield* simulate(keyboardMachine, [
          KeyboardEvent.Focus,
          KeyboardEvent.KeyPress({ key: "1" }),
          KeyboardEvent.KeyPress({ key: "2" }),
          KeyboardEvent.KeyPress({ key: "3" }),
          KeyboardEvent.Clear,
        ]);

        expect((result.finalState as KeyboardState & { _tag: "Typing" }).value).toBe("");
      })
    );
  });

  test("mode switching - replace mode", async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        const result = yield* simulate(keyboardMachine, [
          KeyboardEvent.Focus,
          KeyboardEvent.KeyPress({ key: "a" }),
          KeyboardEvent.KeyPress({ key: "b" }),
          KeyboardEvent.SwitchMode({ mode: "replace" }),
          KeyboardEvent.KeyPress({ key: "X" }), // Should replace entire value
        ]);

        expect((result.finalState as KeyboardState & { _tag: "Typing" }).value).toBe("X");
        expect((result.finalState as KeyboardState & { _tag: "Typing" }).mode).toBe("replace");
      })
    );
  });

  test("submit flow", async () => {
    await Effect.runPromise(
      assertPath(
        keyboardMachine,
        [
          KeyboardEvent.Focus,
          KeyboardEvent.KeyPress({ key: "1" }),
          KeyboardEvent.KeyPress({ key: "0" }),
          KeyboardEvent.KeyPress({ key: "0" }),
          KeyboardEvent.Submit,
        ],
        ["Idle", "Typing", "Typing", "Typing", "Typing", "Confirming"]
      )
    );
  });

  test("cancel from typing returns to idle", async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        const result = yield* simulate(keyboardMachine, [
          KeyboardEvent.Focus,
          KeyboardEvent.KeyPress({ key: "x" }),
          KeyboardEvent.Cancel,
        ]);

        expect(result.finalState._tag).toBe("Idle");
        // Value is cleared on cancel
        expect((result.finalState as KeyboardState & { _tag: "Idle" }).value).toBe("");
      })
    );
  });

  test("cancel from confirming returns to typing", async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        const result = yield* simulate(keyboardMachine, [
          KeyboardEvent.Focus,
          KeyboardEvent.KeyPress({ key: "1" }),
          KeyboardEvent.Submit,
          KeyboardEvent.Cancel,
        ]);

        expect(result.finalState._tag).toBe("Typing");
        expect((result.finalState as KeyboardState & { _tag: "Typing" }).value).toBe("1");
      })
    );
  });

  test("preserves mode through operations", async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        const result = yield* simulate(keyboardMachine, [
          KeyboardEvent.Focus,
          KeyboardEvent.SwitchMode({ mode: "append" }),
          KeyboardEvent.KeyPress({ key: "a" }),
          KeyboardEvent.Clear,
          KeyboardEvent.KeyPress({ key: "b" }),
        ]);

        expect((result.finalState as KeyboardState & { _tag: "Typing" }).mode).toBe("append");
      })
    );
  });
});
