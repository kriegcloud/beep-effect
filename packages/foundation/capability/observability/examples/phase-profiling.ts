import { profilePhase } from "@beep/observability";
import { Effect, Metric } from "effect";

const started = Metric.counter("example_phase_started_total");
const completed = Metric.counter("example_phase_completed_total");
const failed = Metric.counter("example_phase_failed_total");

void profilePhase(
  {
    phase: "retrieve",
    attributes: { run_kind: "query" },
    started,
    completed,
    failed,
  },
  Effect.succeed("ok")
);
