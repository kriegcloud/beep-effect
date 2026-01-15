/**
 * Tests for Fn schema factory including thunks (no-input functions).
 *
 * Verifies implement/implementEffect/implementSync behavior for both variants.
 */

import { Fn } from "@beep/schema/primitives/function";
import { assertTrue, deepStrictEqual, describe, effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as E from "effect/Either";
import * as S from "effect/Schema";

// -----------------------------------------------------------------------------
// Thunk Tests (No Input)
// -----------------------------------------------------------------------------

describe("Fn (thunk - no input)", () => {
  const ThunkSchema = Fn({ output: S.String });

  describe("implement", () => {
    effect("creates a function that returns an Effect", () =>
      Effect.gen(function* () {
        const impl = ThunkSchema.implement(() => "hello");
        const result = yield* impl();

        strictEqual(result, "hello");
      })
    );

    effect("validates output", () =>
      Effect.gen(function* () {
        const impl = ThunkSchema.implement(() => 42 as unknown as string);
        const result = yield* Effect.either(impl());

        assertTrue(E.isLeft(result));
      })
    );
  });

  describe("implementEffect", () => {
    effect("creates a function that wraps an effectful handler", () =>
      Effect.gen(function* () {
        const impl = ThunkSchema.implementEffect(() => Effect.succeed("async hello"));
        const result = yield* impl();

        strictEqual(result, "async hello");
      })
    );

    effect("propagates errors from handler", () =>
      Effect.gen(function* () {
        const impl = ThunkSchema.implementEffect(() => Effect.fail("handler error" as const));
        const result = yield* Effect.either(impl());

        assertTrue(E.isLeft(result));
        if (E.isLeft(result)) {
          strictEqual(result.left, "handler error");
        }
      })
    );

    effect("validates output", () =>
      Effect.gen(function* () {
        const impl = ThunkSchema.implementEffect(() => Effect.succeed(123 as unknown as string));
        const result = yield* Effect.either(impl());

        assertTrue(E.isLeft(result));
      })
    );
  });

  describe("implementSync", () => {
    effect("creates a synchronous function", () =>
      Effect.sync(() => {
        const impl = ThunkSchema.implementSync(() => "sync hello");
        const result = impl();

        strictEqual(result, "sync hello");
      })
    );
  });

  describe("schema properties", () => {
    effect("inputSchema is S.Never for thunks", () =>
      Effect.sync(() => {
        // Thunks have no input, so inputSchema is S.Never (not S.Undefined)
        // S.Never represents "no valid input" while S.Undefined represents "undefined as input"
        assertTrue(ThunkSchema.inputSchema === S.Never);
      })
    );

    effect("outputSchema matches provided schema", () =>
      Effect.sync(() => {
        assertTrue(ThunkSchema.outputSchema === S.String);
      })
    );
  });
});

// -----------------------------------------------------------------------------
// Function with Input Tests
// -----------------------------------------------------------------------------

describe("Fn (with input)", () => {
  const FnWithInput = Fn({
    input: S.Number,
    output: S.String,
  });

  describe("implement", () => {
    effect("creates a function that takes input and returns an Effect", () =>
      Effect.gen(function* () {
        const impl = FnWithInput.implement((n) => n.toString());
        const result = yield* impl(42);

        strictEqual(result, "42");
      })
    );

    effect("validates input", () =>
      Effect.gen(function* () {
        const impl = FnWithInput.implement((n) => n.toString());
        const result = yield* Effect.either(impl("not a number" as unknown as number));

        assertTrue(E.isLeft(result));
      })
    );

    effect("validates output", () =>
      Effect.gen(function* () {
        const impl = FnWithInput.implement(() => 42 as unknown as string);
        const result = yield* Effect.either(impl(1));

        assertTrue(E.isLeft(result));
      })
    );
  });

  describe("implementEffect", () => {
    effect("creates a function that wraps an effectful handler", () =>
      Effect.gen(function* () {
        const impl = FnWithInput.implementEffect((n) => Effect.succeed(`value: ${n}`));
        const result = yield* impl(100);

        strictEqual(result, "value: 100");
      })
    );

    effect("validates input before calling handler", () =>
      Effect.gen(function* () {
        const impl = FnWithInput.implementEffect((n) => Effect.succeed(n.toString()));
        const result = yield* Effect.either(impl("bad" as unknown as number));

        assertTrue(E.isLeft(result));
      })
    );

    effect("propagates errors from handler", () =>
      Effect.gen(function* () {
        const impl = FnWithInput.implementEffect(() => Effect.fail("handler error" as const));
        const result = yield* Effect.either(impl(1));

        assertTrue(E.isLeft(result));
        if (E.isLeft(result)) {
          strictEqual(result.left, "handler error");
        }
      })
    );
  });

  describe("implementSync", () => {
    effect("creates a synchronous function", () =>
      Effect.sync(() => {
        const impl = FnWithInput.implementSync((n) => `sync: ${n}`);
        const result = impl(5);

        strictEqual(result, "sync: 5");
      })
    );
  });

  describe("schema properties", () => {
    effect("inputSchema matches provided schema", () =>
      Effect.sync(() => {
        assertTrue(FnWithInput.inputSchema === S.Number);
      })
    );

    effect("outputSchema matches provided schema", () =>
      Effect.sync(() => {
        assertTrue(FnWithInput.outputSchema === S.String);
      })
    );
  });
});

// -----------------------------------------------------------------------------
// Complex Types Tests
// -----------------------------------------------------------------------------

describe("Fn with complex types", () => {
  const UserInput = S.Struct({
    name: S.String,
    age: S.Number,
  });

  const UserOutput = S.Struct({
    id: S.String,
    displayName: S.String,
  });

  const CreateUser = Fn({
    input: UserInput,
    output: UserOutput,
  });

  effect("handles struct input/output",
    Effect.fn(function* () {
      const impl = CreateUser.implement((user) => ({
        id: "user-123",
        displayName: `${user.name} (${user.age})`,
      }));

      const result = yield* impl({ name: "Alice", age: 30 });

      deepStrictEqual(result, {
        id: "user-123",
        displayName: "Alice (30)",
      });
    })
  );

  effect("validates complex input",
    Effect.fn(function* () {
      const impl = CreateUser.implement((user) => ({
        id: "user-123",
        displayName: user.name,
      }));

      const result = yield* Effect.either(impl({ name: "Alice" } as unknown as { name: string; age: number }));

      assertTrue(E.isLeft(result));
    })
  );

  effect("validates complex output",
    Effect.fn(function* () {
      const impl = CreateUser.implement(
        () =>
          ({
            id: "user-123",
            // Missing displayName
          }) as unknown as { id: string; displayName: string }
      );

      const result = yield* Effect.either(impl({ name: "Alice", age: 30 }));

      assertTrue(E.isLeft(result));
    })
  );
});

// -----------------------------------------------------------------------------
// Void Output Tests
// -----------------------------------------------------------------------------

describe("Fn with void output", () => {
  const VoidThunk = Fn({ output: S.Void });
  const VoidFn = Fn({ input: S.String, output: S.Void });

  effect("thunk with void output",
    Effect.fn(function* () {
      let called = false;
      const impl = VoidThunk.implement(() => {
        called = true;
      });

      yield* impl();
      assertTrue(called);
    })
  );

  effect("function with void output",
    Effect.fn(function* () {
      let lastArg = "";
      const impl = VoidFn.implement((s) => {
        lastArg = s;
      });

      yield* impl("test");
      strictEqual(lastArg, "test");
    })
  );
});

// -----------------------------------------------------------------------------
// Explicit S.Undefined Input Tests
// -----------------------------------------------------------------------------

describe("Fn with explicit S.Undefined input", () => {
  // When input is explicitly S.Undefined, it should behave like a thunk
  const ExplicitUndefinedFn = Fn({ input: S.Undefined, output: S.String });

  effect("behaves like a thunk when input is S.Undefined",
    Effect.fn(function* () {
      const impl = ExplicitUndefinedFn.implement(() => "explicit undefined");
      const result = yield* impl();

      strictEqual(result, "explicit undefined");
    })
  );

  effect("inputSchema is S.Undefined", () =>
    Effect.sync(() => {
      assertTrue(ExplicitUndefinedFn.inputSchema === S.Undefined);
    })
  );

  effect("outputSchema matches provided schema", () =>
    Effect.sync(() => {
      assertTrue(ExplicitUndefinedFn.outputSchema === S.String);
    })
  );
});
