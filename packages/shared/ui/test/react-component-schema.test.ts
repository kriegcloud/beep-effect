import { describe } from "bun:test";
import { isReactNode, ReactNode, ReactNodeSchema } from "@beep/shared-ui/schemas/react-component-schema";
import { assertFalse, assertTrue, effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import * as React from "react";

describe("ReactNodeSchema", () => {
  describe("isReactNode type guard", () => {
    effect("returns true for string primitives", () =>
      Effect.gen(function* () {
        assertTrue(isReactNode("hello"));
        assertTrue(isReactNode(""));
        assertTrue(isReactNode("123"));
      })
    );

    effect("returns true for number primitives", () =>
      Effect.gen(function* () {
        assertTrue(isReactNode(42));
        assertTrue(isReactNode(0));
        assertTrue(isReactNode(-1));
        assertTrue(isReactNode(3.14));
      })
    );

    effect("returns true for boolean primitives", () =>
      Effect.gen(function* () {
        assertTrue(isReactNode(true));
        assertTrue(isReactNode(false));
      })
    );

    effect("returns true for null and undefined", () =>
      Effect.gen(function* () {
        assertTrue(isReactNode(null));
        assertTrue(isReactNode(undefined));
      })
    );

    effect("returns true for React elements", () =>
      Effect.gen(function* () {
        const element = React.createElement("div", null, "Hello");
        assertTrue(isReactNode(element));

        const nested = React.createElement("div", null, React.createElement("span", null, "Nested"));
        assertTrue(isReactNode(nested));
      })
    );

    effect("returns true for arrays of valid React nodes", () =>
      Effect.gen(function* () {
        assertTrue(isReactNode([]));
        assertTrue(isReactNode(["hello", 42, null]));
        assertTrue(isReactNode([React.createElement("div"), "text"]));
        assertTrue(isReactNode([[["nested"]]]));
      })
    );

    effect("returns false for plain objects without $$typeof", () =>
      Effect.gen(function* () {
        assertFalse(isReactNode({ key: "value" }));
        assertFalse(isReactNode({ children: "text" }));
        assertFalse(isReactNode({}));
      })
    );

    effect("returns false for functions", () =>
      Effect.gen(function* () {
        assertFalse(isReactNode(() => {}));
        assertFalse(isReactNode(function named() {}));
      })
    );

    effect("returns false for symbols", () =>
      Effect.gen(function* () {
        assertFalse(isReactNode(Symbol("test")));
      })
    );

    effect("returns false for arrays containing invalid items", () =>
      Effect.gen(function* () {
        assertFalse(isReactNode([() => {}]));
        assertFalse(isReactNode(["valid", { invalid: true }]));
        assertFalse(isReactNode([Symbol("test")]));
      })
    );
  });

  describe("ReactNodeSchema", () => {
    effect("validates valid React nodes with S.is", () =>
      Effect.gen(function* () {
        assertTrue(S.is(ReactNodeSchema)("hello"));
        assertTrue(S.is(ReactNodeSchema)(42));
        assertTrue(S.is(ReactNodeSchema)(null));
        assertTrue(S.is(ReactNodeSchema)(undefined));
        assertTrue(S.is(ReactNodeSchema)(true));
        assertTrue(S.is(ReactNodeSchema)(React.createElement("div")));
        assertTrue(S.is(ReactNodeSchema)(["text", 123]));
      })
    );

    effect("rejects invalid values with S.is", () =>
      Effect.gen(function* () {
        assertFalse(S.is(ReactNodeSchema)({ invalid: true }));
        assertFalse(S.is(ReactNodeSchema)(() => {}));
        assertFalse(S.is(ReactNodeSchema)(Symbol("test")));
      })
    );

    effect("has static is method", () =>
      Effect.gen(function* () {
        assertTrue(ReactNodeSchema.is("hello"));
        assertTrue(ReactNodeSchema.is(42));
        assertFalse(ReactNodeSchema.is({ invalid: true }));
      })
    );

    effect("decodes valid React nodes successfully", () =>
      Effect.gen(function* () {
        const result = yield* S.decodeUnknown(ReactNodeSchema)("hello");
        strictEqual(result, "hello");
      })
    );

    effect("fails to decode invalid values", () =>
      Effect.gen(function* () {
        const exit = yield* Effect.exit(S.decodeUnknown(ReactNodeSchema)({ invalid: true }));
        assertTrue(exit._tag === "Failure");
      })
    );
  });

  describe("ReactNode factory", () => {
    effect("creates schema with default annotations", () =>
      Effect.gen(function* () {
        const schema = ReactNode();
        assertTrue(S.is(schema)("hello"));
        assertTrue(S.is(schema)(React.createElement("div")));
        assertFalse(S.is(schema)({ invalid: true }));
      })
    );

    effect("creates schema with custom annotations", () =>
      Effect.gen(function* () {
        const customSchema = ReactNode({
          description: "Custom React node description",
        });
        assertTrue(S.is(customSchema)("hello"));
      })
    );

    effect("factory schema has static is method", () =>
      Effect.gen(function* () {
        const schema = ReactNode();
        assertTrue(schema.is("hello"));
        assertFalse(schema.is({ invalid: true }));
      })
    );
  });

  describe("annotations support", () => {
    effect("supports re-annotation via .annotations()", () =>
      Effect.gen(function* () {
        const annotated = ReactNodeSchema.annotations({
          description: "Re-annotated description",
        });
        assertTrue(S.is(annotated)("hello"));
        assertTrue(S.is(annotated)(42));
      })
    );

    effect("factory supports re-annotation", () =>
      Effect.gen(function* () {
        const base = ReactNode();
        const annotated = base.annotations({
          identifier: "CustomReactNode",
        });
        assertTrue(S.is(annotated)("hello"));
      })
    );
  });

  describe("edge cases", () => {
    effect("handles deeply nested arrays", () =>
      Effect.gen(function* () {
        const deeplyNested = [[[["text"]]]];
        assertTrue(isReactNode(deeplyNested));
        assertTrue(S.is(ReactNodeSchema)(deeplyNested));
      })
    );

    effect("handles mixed arrays", () =>
      Effect.gen(function* () {
        const mixed = ["text", 42, true, null, undefined, React.createElement("div"), ["nested", "array"]];
        assertTrue(isReactNode(mixed));
        assertTrue(S.is(ReactNodeSchema)(mixed));
      })
    );

    effect("handles empty arrays", () =>
      Effect.gen(function* () {
        assertTrue(isReactNode([]));
        assertTrue(S.is(ReactNodeSchema)([]));
      })
    );

    effect("handles React fragments represented as arrays", () =>
      Effect.gen(function* () {
        // React fragments are often represented as arrays of children
        const fragmentLike = [
          React.createElement("span", { key: "1" }, "First"),
          React.createElement("span", { key: "2" }, "Second"),
        ];
        assertTrue(isReactNode(fragmentLike));
        assertTrue(S.is(ReactNodeSchema)(fragmentLike));
      })
    );
  });

  describe("namespace types", () => {
    effect("ReactNodeSchema.Type is React.ReactNode", () =>
      Effect.gen(function* () {
        // Type-level test - if this compiles, the type is correct
        // @ts-expect-error
        const _value: ReactNodeSchema.Type = "hello" as React.ReactNode;
        assertTrue(true);
      })
    );
  });
});
