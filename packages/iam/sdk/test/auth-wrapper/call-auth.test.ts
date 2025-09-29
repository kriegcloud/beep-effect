import { callAuth } from "@beep/iam-sdk/auth-wrapper/handler";
import { IamError } from "@beep/iam-sdk/errors";
import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Fiber from "effect/Fiber";
import * as Metric from "effect/Metric";
import * as MetricBoundaries from "effect/MetricBoundaries";
import * as Schedule from "effect/Schedule";

describe("callAuth", () => {
  it("returns response data when executor succeeds", () =>
    Effect.gen(function* () {
      const effect = callAuth({ plugin: "test", method: "demo" }, async (_signal) => ({ data: "ok" }));

      const result = yield* effect;
      assert.strictEqual(result, "ok");
    }));

  it("normalizes Better Auth error payloads", () =>
    Effect.gen(function* () {
      const effect = callAuth({ plugin: "test", method: "demo", defaultErrorMessage: "failed" }, async (_signal) => ({
        error: {
          message: "nope",
          code: "BAD",
          status: 400,
          statusText: "Bad Request",
        },
      }));

      const error = yield* effect.pipe(Effect.flip);
      assert.instanceOf(error, IamError);
      assert.strictEqual(error.message, "nope");
      assert.strictEqual(error.code, "BAD");
      assert.strictEqual(error.status, 400);
    }));

  it("records metrics when configured", () =>
    Effect.gen(function* () {
      const successCounter = Metric.counter("callAuth_success");
      const errorCounter = Metric.counter("callAuth_error");
      const latencyHistogram = Metric.histogram(
        "callAuth_latency",
        MetricBoundaries.exponential({ start: 1, factor: 2, count: 10 })
      );

      const effect = callAuth(
        {
          plugin: "test",
          method: "metrics",
          metrics: {
            successCounter,
            errorCounter,
            latencyHistogram,
          },
        },
        async (_signal) => ({ data: "ok" })
      );

      const result = yield* effect;
      assert.strictEqual(result, "ok");

      const successState = yield* Metric.value(successCounter);
      const errorState = yield* Metric.value(errorCounter);
      const latencyState = yield* Metric.value(latencyHistogram);

      assert.strictEqual(successState.count, 1);
      assert.strictEqual(errorState.count, 0);
      assert.strictEqual(latencyState.count, 1);
    }));

  it("wraps thrown executor errors", () =>
    Effect.gen(function* () {
      const effect = callAuth({ plugin: "test", method: "throws" }, async (_signal) => {
        throw new Error("boom");
      });

      const error = yield* Effect.flip(effect);
      assert.instanceOf(error, IamError);
      assert.strictEqual(error.message, "boom");
    }));

  it("fails fast when a timeout is configured", () =>
    Effect.gen(function* () {
      const effect = callAuth(
        {
          plugin: "test",
          method: "timeout",
          timeout: { duration: "5 millis", message: "request timed out" },
        },
        async (signal) =>
          new Promise<{ readonly data: string }>((resolve) => {
            const timer = setTimeout(() => resolve({ data: "late" }), 30);
            signal.addEventListener("abort", () => {
              clearTimeout(timer);
            });
          })
      );

      const error = yield* Effect.flip(effect);
      assert.instanceOf(error, IamError);
      assert.strictEqual(error.message, "request timed out");
    }));

  it("retries transient errors according to the provided policy", () =>
    Effect.gen(function* () {
      let attempts = 0;

      const effect = callAuth(
        {
          plugin: "test",
          method: "retry",
          retry: {
            schedule: Schedule.recurs(1),
            while: (error) => error.code === "TRANSIENT",
          },
        },
        async (_signal) => {
          attempts += 1;
          if (attempts === 1) {
            return {
              error: {
                message: "please retry",
                code: "TRANSIENT",
                status: 503,
              },
            } as const;
          }

          return { data: "ok" } as const;
        }
      );

      const result = yield* effect;
      assert.strictEqual(result, "ok");
      assert.strictEqual(attempts, 2);
    }));

  it("guards concurrent submissions when semaphoreKey is provided", () =>
    Effect.gen(function* () {
      let running = 0;
      let maxRunning = 0;

      const guarded = callAuth({ plugin: "test", method: "guarded", semaphoreKey: "same" }, async (_signal) => {
        running++;
        if (running > maxRunning) {
          maxRunning = running;
        }
        await new Promise((resolve) => setTimeout(resolve, 5));
        running--;
        return { data: undefined };
      });

      const fiberA = yield* Effect.fork(guarded);
      const fiberB = yield* Effect.fork(guarded);

      yield* Fiber.join(fiberA);
      yield* Fiber.join(fiberB);

      assert.strictEqual(maxRunning, 1);
    }));

  it("allows concurrent submissions for different semaphore keys", () =>
    Effect.gen(function* () {
      let running = 0;
      let maxRunning = 0;

      const makeEffect = (key: string) =>
        callAuth({ plugin: "test", method: key, semaphoreKey: key }, async (_signal) => {
          running++;
          if (running > maxRunning) {
            maxRunning = running;
          }
          await new Promise((resolve) => setTimeout(resolve, 5));
          running--;
          return { data: undefined };
        });

      const fiberA = yield* Effect.fork(makeEffect("a"));
      const fiberB = yield* Effect.fork(makeEffect("b"));

      yield* Fiber.join(fiberA);
      yield* Fiber.join(fiberB);

      assert.strictEqual(maxRunning, 2);
    }));
});
