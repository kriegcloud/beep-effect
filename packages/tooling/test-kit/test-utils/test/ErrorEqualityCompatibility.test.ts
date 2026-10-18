import { assert, describe, it } from "@effect/vitest";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Equal from "effect/Equal";
import * as Hash from "effect/Hash";
import * as Layer from "effect/Layer";

class DeployFailed extends Data.TaggedError("DeployFailed")<{ readonly release: string }> {}

// JavaScriptCore (Bun) exposes each construction site as own `line`, `column` and `sourceURL`
// keys, resolved on first read, and resolves them to 0 while Vitest's `Error.prepareStackTrace`
// hook is installed. Production Bun has no hook, so the cases construct and compare without it.
const WithoutStackHook = Layer.effectDiscard(
  Effect.acquireRelease(
    Effect.sync(() => {
      const hook = Error.prepareStackTrace;
      Reflect.set(Error, "prepareStackTrace", undefined);
      return hook;
    }),
    (hook) => Effect.sync(() => Reflect.set(Error, "prepareStackTrace", hook))
  )
);

describe("Error equality compatibility", () => {
  it.layer(WithoutStackHook, { timeout: "5 seconds" })("without a stack trace hook", (it) => {
    it.effect("treats errors constructed at different sites as structurally equal", () =>
      Effect.sync(() => {
        const first = new Error("deploy failed");
        const second = new Error("deploy failed");

        assert.isTrue(Equal.equals(first, second));
        assert.strictEqual(Hash.hash(first), Hash.hash(second));
        assert.isFalse(Equal.equals(first, new Error("rollback failed")));
      })
    );

    it.effect("treats tagged errors constructed at different sites as structurally equal", () =>
      Effect.sync(() => {
        const first = new DeployFailed({ release: "v1" });
        const second = new DeployFailed({ release: "v1" });

        assert.isTrue(Equal.equals(first, second));
        assert.strictEqual(Hash.hash(first), Hash.hash(second));
        assert.isFalse(Equal.equals(first, new DeployFailed({ release: "v2" })));
      })
    );
  });
});
