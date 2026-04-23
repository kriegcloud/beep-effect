import type { QueryStage, QueryStageTrace } from "@beep/runtime-protocol";
import { flow, Match } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";

export const queryStageEntries = (trace: QueryStageTrace): ReadonlyArray<QueryStage> =>
  A.make(trace.grounding, trace.retrieval, trace.packet, trace.answer);

export const formatQueryStageLabel = Match.type<QueryStage["phase"]>().pipe(
  Match.when("grounding", () => "Grounding"),
  Match.when("retrieval", () => "Retrieval"),
  Match.when("packet", () => "Packet"),
  Match.when("answer", () => "Answer"),
  Match.exhaustive
);

export const formatQueryStageStatusTone = Match.type<QueryStage["status"]>().pipe(
  Match.when("pending", () => "status-pill-neutral"),
  Match.when("running", () => "status-running"),
  Match.when("completed", () => "status-completed"),
  Match.exhaustive
);

export const formatOptionalPercent: (value: O.Option<number>) => string = flow(
  O.map((percent: number) => `${percent}%`),
  O.getOrElse(() => "Not yet")
);
