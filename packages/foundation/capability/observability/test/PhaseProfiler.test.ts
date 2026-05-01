import { profilePhase } from "@beep/observability";
import { TaggedErrorClass } from "@beep/schema";
import { Effect, Metric } from "effect";
import * as S from "effect/Schema";
import { describe, expect, it } from "vitest";

class TestPhaseError extends TaggedErrorClass<TestPhaseError>()("TestPhaseError", {
  message: S.String,
}) {}

describe("PhaseProfiler", () => {
  it("tracks phase metrics on success", async () => {
    const started = Metric.counter("test_phase_started_total");
    const completed = Metric.counter("test_phase_completed_total");
    const failed = Metric.counter("test_phase_failed_total");

    await Effect.runPromise(
      profilePhase(
        {
          phase: "retrieve",
          attributes: { run_kind: "query" },
          started,
          completed,
          failed,
        },
        Effect.succeed("ok")
      )
    );

    const startedState = await Effect.runPromise(
      Metric.value(Metric.withAttributes(started, { phase: "retrieve", run_kind: "query" }))
    );
    const completedState = await Effect.runPromise(
      Metric.value(Metric.withAttributes(completed, { phase: "retrieve", run_kind: "query", outcome: "completed" }))
    );

    expect(startedState.count).toBe(1);
    expect(completedState.count).toBe(1);
  });

  it("tracks failures with outcome attributes", async () => {
    const failed = Metric.counter("test_phase_failed_outcomes_total");

    await Effect.runPromiseExit(
      profilePhase(
        {
          phase: "indexing",
          attributes: { run_kind: "index" },
          failed,
        },
        Effect.fail(new TestPhaseError({ message: "boom" }))
      )
    );

    const failedState = await Effect.runPromise(
      Metric.value(Metric.withAttributes(failed, { phase: "indexing", run_kind: "index", outcome: "failed" }))
    );

    expect(failedState.count).toBe(1);
  });
});
