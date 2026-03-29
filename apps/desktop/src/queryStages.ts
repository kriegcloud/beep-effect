import type { QueryStage, QueryStageTrace } from "@beep/runtime-protocol";
import * as A from "effect/Array";
import * as O from "effect/Option";

export const queryStageEntries = (trace: QueryStageTrace): ReadonlyArray<QueryStage> =>
  A.make(trace.grounding, trace.retrieval, trace.packet, trace.answer);

export const formatQueryStageLabel = (phase: QueryStage["phase"]): string => {
  if (phase === "grounding") {
    return "Grounding";
  }

  if (phase === "retrieval") {
    return "Retrieval";
  }

  if (phase === "packet") {
    return "Packet";
  }

  return "Answer";
};

export const formatQueryStageStatusTone = (status: QueryStage["status"]): string => {
  if (status === "running") {
    return "status-running";
  }

  if (status === "completed") {
    return "status-completed";
  }

  return "status-pill-neutral";
};

export const formatOptionalPercent = (value: O.Option<number>): string =>
  O.match(value, {
    onNone: () => "Not yet",
    onSome: (percent) => `${percent}%`,
  });
