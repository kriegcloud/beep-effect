import { measureElapsedMillis, observeHttpRequest, observeWorkflow, statusClass } from "@beep/observability";
import { Effect, Metric } from "effect";
import { describe, expect, it } from "vitest";

describe("Metric", () => {
  it("normalizes status codes to their class labels", () => {
    expect(statusClass(204)).toBe("2xx");
    expect(statusClass(404)).toBe("4xx");
    expect(statusClass(999)).toBe("unknown");
  });

  it("measures elapsed milliseconds without changing the value", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const [value, elapsedMs] = yield* measureElapsedMillis(Effect.succeed("ok"));

        expect(value).toBe("ok");
        expect(elapsedMs).toBeGreaterThanOrEqual(0);
      })
    ));

  it("tracks workflow counters on success", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const started = Metric.counter("test_workflow_started_total");
        const completed = Metric.counter("test_workflow_completed_total");
        const failed = Metric.counter("test_workflow_failed_total");

        yield* observeWorkflow(
          {
            name: "test-workflow",
            started,
            completed,
            failed,
          },
          Effect.succeed("done")
        );

        const startedState = yield* Metric.value(started);
        const completedState = yield* Metric.value(completed);
        const failedState = yield* Metric.value(failed);

        expect(startedState.count).toBe(1);
        expect(completedState.count).toBe(1);
        expect(failedState.count).toBe(0);
      })
    ));

  it("tracks request counters with success labels", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const requestsTotal = Metric.counter("test_http_requests_total");
        const requestDuration = Metric.timer("test_http_request_duration_ms");

        yield* observeHttpRequest(
          {
            method: "GET",
            route: "/health",
            successStatus: 200,
            requestsTotal,
            requestDuration,
          },
          Effect.succeed("ok")
        );

        const state = yield* Metric.value(
          Metric.withAttributes(requestsTotal, {
            method: "GET",
            route: "/health",
            status_class: "2xx",
          })
        );

        expect(state.count).toBe(1);
      })
    ));
});
