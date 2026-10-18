import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Equal from "effect/Equal";
import * as Hash from "effect/Hash";
import * as Layer from "effect/Layer";
import * as S from "effect/Schema";

class DeployFailed extends S.TaggedError<DeployFailed, { readonly brand: unique symbol }>()("DeployFailed", {
  release: S.String,
}) {}
class ParseFailed extends S.TaggedError<ParseFailed, { readonly brand: unique symbol }>()("ParseFailed", {
  line: S.Finite,
  column: S.Finite,
}) {}

// A plain Error that assigns its own `line`, the shape native and third-party errors take.
const locatedFailure = (line: number): Error => Object.assign(new Error("located failure"), { line });

// JavaScriptCore defines a non-enumerable own `line` on every Error, so a plain Error
// that assigns its own `line` inherits that descriptor, and the patch erases it with the location.
const runtimeOwnsErrorLocation = Object.getOwnPropertyDescriptor(new Error("probe"), "line")?.enumerable === false;

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

    // `.make` constructs every instance at one site inside the class, so Schema tagged errors stay
    // equal even without the patch; this case pins that equality, hash and payload inequality.
    it.effect("treats Schema tagged errors built through make as structurally equal", () =>
      Effect.sync(() => {
        const first = DeployFailed.make({ release: "v1" });
        const second = DeployFailed.make({ release: "v1" });

        assert.isTrue(Equal.equals(first, second));
        assert.strictEqual(Hash.hash(first), Hash.hash(second));
        assert.isFalse(Equal.equals(first, DeployFailed.make({ release: "v2" })));
      })
    );

    it.effect("keeps payload fields named like location metadata in equality", () =>
      Effect.sync(() => {
        const first = ParseFailed.make({ line: 3, column: 7 });

        assert.isTrue(Equal.equals(first, ParseFailed.make({ line: 3, column: 7 })));
        assert.isFalse(Equal.equals(first, ParseFailed.make({ line: 4, column: 7 })));
        // Known limitation, recorded in patch-proofs-record.md: a plain Error that assigns
        // its own `line` loses it from equality on JavaScriptCore only.
        assert.strictEqual(Equal.equals(locatedFailure(3), locatedFailure(4)), runtimeOwnsErrorLocation);
      })
    );
  });
});
