import { QaCaptureError } from "@beep/qa-capture";
import { it } from "@beep/test-runner";
import { expect } from "@effect/vitest";
import { assertNone, assertSome } from "@effect/vitest/utils";

it("preserves an existing pipeline error and its original operation", () => {
  const original = QaCaptureError.make({ operation: "extract", message: "unreadable video" });
  expect(QaCaptureError.fromUnknown("capture", "capture failed", { cause: original })).toBe(original);
});

it("retains inspectable failures and path context through both call forms", () => {
  const cause = new Error("read failed");
  const error = QaCaptureError.fromUnknown("cannot read session", { cause, path: "round/session.json" })("read");
  expect(error.operation).toBe("read");
  expect(error.message).toBe("cannot read session");
  assertSome(error.cause, cause);
  assertSome(error.path, "round/session.json");
});

it("drops an uninspectable proxy while retaining the boundary message", () => {
  const cause = new Proxy(
    {},
    {
      ownKeys: () => {
        throw new Error("uninspectable");
      },
    }
  );
  const error = QaCaptureError.fromUnknown("read", "cannot read session", { cause });
  assertNone(error.cause);
  assertNone(error.path);
});
