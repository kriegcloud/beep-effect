import { Effect, Metric } from "effect";
import { describe, expect, it } from "vitest";
import { measureElapsedMillis, observeHttpRequest, observeWorkflow, statusClass } from "../src/index.ts";

describe("Metric", () => {
  it("normalizes status codes to their class labels", () => {
    expect(statusClass(204)).toBe("2xx");
    expect(statusClass(404)).toBe("4xx");
    expect(statusClass(999)).toBe("unknown");
  });

  it("measures elapsed milliseconds without changing the value", async () => {
    const [value, elapsedMs] = await Effect.runPromise(measureElapsedMillis(Effect.succeed("ok")));

    expect(value).toBe("ok");
    expect(elapsedMs).toBeGreaterThanOrEqual(0);
  });

  it("tracks workflow counters on success", async () => {
    const started = Metric.counter("test_workflow_started_total");
    const completed = Metric.counter("test_workflow_completed_total");
    const failed = Metric.counter("test_workflow_failed_total");

    await Effect.runPromise(
      observeWorkflow(
        {
          name: "test-workflow",
          started,
          completed,
          failed,
        },
        Effect.succeed("done")
      )
    );

    const startedState = await Effect.runPromise(Metric.value(started));
    const completedState = await Effect.runPromise(Metric.value(completed));
    const failedState = await Effect.runPromise(Metric.value(failed));

    expect(startedState.count).toBe(1);
    expect(completedState.count).toBe(1);
    expect(failedState.count).toBe(0);
  });

  it("tracks request counters with success labels", async () => {
    const requestsTotal = Metric.counter("test_http_requests_total");
    const requestDuration = Metric.timer("test_http_request_duration_ms");

    await Effect.runPromise(
      observeHttpRequest(
        {
          method: "GET",
          route: "/health",
          successStatus: 200,
          requestsTotal,
          requestDuration,
        },
        Effect.succeed("ok")
      )
    );

    const state = await Effect.runPromise(
      Metric.value(
        Metric.withAttributes(requestsTotal, {
          method: "GET",
          route: "/health",
          status_class: "2xx",
        })
      )
    );

    expect(state.count).toBe(1);
  });
});
