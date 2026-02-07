/**
 * Test Suite Template
 *
 * Copy this template and replace:
 * - `Example` with your domain/service name
 * - Test cases with your actual test scenarios
 */

import { describe } from "bun:test";
import { effect, layer, scoped, strictEqual, deepStrictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Duration from "effect/Duration";
import * as O from "effect/Option";

// Import your domain modules
// import { Example, ExampleId } from "@beep/example-domain";
// import { ExampleService } from "@beep/example-server";

// ─────────────────────────────────────────────────────────────────────────────
// Test Layer (for integration tests)
// ─────────────────────────────────────────────────────────────────────────────

// const TestExampleService = Layer.succeed(
//   ExampleService,
//   ExampleService.of({
//     create: (input) => Effect.succeed({ id: ExampleId.make(), ...input }),
//     findById: (id) => Effect.succeed(O.none()),
//   })
// );

// const TestLayer = Layer.mergeAll(
//   TestExampleService,
//   // Add other test dependencies
// );

// ─────────────────────────────────────────────────────────────────────────────
// Unit Tests (no dependencies)
// ─────────────────────────────────────────────────────────────────────────────

describe("Example Domain", () => {
  effect("creates valid EntityId", () =>
    Effect.gen(function* () {
      // const id = ExampleId.make();
      // strictEqual(id.startsWith("example__"), true);
      strictEqual(true, true); // placeholder
    })
  );

  effect("validates input schema", () =>
    Effect.gen(function* () {
      // const result = yield* S.decodeUnknown(CreateExampleInput)({
      //   name: "Test",
      //   description: "A test example",
      // });
      // strictEqual(result.name, "Test");
      strictEqual(true, true); // placeholder
    })
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Integration Tests (with Layer)
// ─────────────────────────────────────────────────────────────────────────────

// Uncomment when you have a real TestLayer:
//
// layer(TestLayer, { timeout: Duration.seconds(30) })("ExampleService", (it) => {
//   it.effect("creates example", () =>
//     Effect.gen(function* () {
//       const service = yield* ExampleService;
//       const result = yield* service.create({
//         name: "Test Example",
//         description: "Created in test",
//       });
//       strictEqual(result.name, "Test Example");
//     })
//   );
//
//   it.effect("returns none for missing example", () =>
//     Effect.gen(function* () {
//       const service = yield* ExampleService;
//       const result = yield* service.findById(ExampleId.make());
//       strictEqual(O.isNone(result), true);
//     })
//   );
// });

// ─────────────────────────────────────────────────────────────────────────────
// Scoped Tests (with resource cleanup)
// ─────────────────────────────────────────────────────────────────────────────

describe("Example with Resources", () => {
  scoped("acquires and releases resource", () =>
    Effect.gen(function* () {
      // const resource = yield* Effect.acquireRelease(
      //   Effect.succeed({ connection: "open" }),
      //   (r) => Effect.sync(() => { r.connection = "closed"; })
      // );
      // strictEqual(resource.connection, "open");
      strictEqual(true, true); // placeholder
    })
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Assertion Helpers Reference
// ─────────────────────────────────────────────────────────────────────────────

// Available from @beep/testkit:
//
// strictEqual(actual, expected)        - Strict equality (===)
// deepStrictEqual(actual, expected)    - Deep object equality
// ok(value)                            - Truthy check
// fail(message)                        - Force test failure
// throws(() => expr, ErrorClass)       - Expect synchronous throw
//
// For Effect failures, use Effect.exit and match on Exit:
//
// it.effect("handles error", () =>
//   Effect.gen(function* () {
//     const exit = yield* Effect.exit(failingEffect);
//     const isFailure = Exit.isFailure(exit);
//     strictEqual(isFailure, true);
//   })
// );
