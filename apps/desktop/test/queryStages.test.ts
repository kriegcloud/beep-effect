import {
  AnswerQueryStage,
  GroundingQueryStage,
  PacketQueryStage,
  QueryStageTrace,
  RetrievalQueryStage,
} from "@beep/runtime-protocol";
import { NonNegativeInt } from "@beep/schema";
import { describe, expect, it } from "@effect/vitest";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import {
  formatOptionalPercent,
  formatQueryStageLabel,
  formatQueryStageStatusTone,
  queryStageEntries,
} from "../src/queryStages.ts";

const decodeNonNegativeInt = S.decodeUnknownSync(NonNegativeInt);

const makeQueryStageTrace = () =>
  new QueryStageTrace({
    grounding: new GroundingQueryStage({
      status: "pending",
      startedAt: O.none(),
      completedAt: O.none(),
      latestMessage: O.none(),
      percent: O.none(),
      artifactAvailable: O.none(),
    }),
    retrieval: new RetrievalQueryStage({
      status: "running",
      startedAt: O.none(),
      completedAt: O.none(),
      latestMessage: O.some("Retrieving evidence."),
      percent: O.some(decodeNonNegativeInt(60)),
      artifactAvailable: O.none(),
    }),
    packet: new PacketQueryStage({
      status: "completed",
      startedAt: O.none(),
      completedAt: O.none(),
      latestMessage: O.some("Packet frozen."),
      percent: O.some(decodeNonNegativeInt(100)),
      artifactAvailable: O.some(true),
    }),
    answer: new AnswerQueryStage({
      status: "completed",
      startedAt: O.none(),
      completedAt: O.none(),
      latestMessage: O.some("Answer rendered."),
      percent: O.some(decodeNonNegativeInt(100)),
      artifactAvailable: O.some(true),
    }),
  });

describe("queryStages helpers", () => {
  it("preserves the canonical fixed stage order", () => {
    const phases = queryStageEntries(makeQueryStageTrace()).map((stage) => stage.phase);

    expect(phases).toEqual(["grounding", "retrieval", "packet", "answer"]);
  });

  it("formats stage labels and tones for pending running and completed states", () => {
    expect(formatQueryStageLabel("grounding")).toBe("Grounding");
    expect(formatQueryStageLabel("retrieval")).toBe("Retrieval");
    expect(formatQueryStageLabel("packet")).toBe("Packet");
    expect(formatQueryStageLabel("answer")).toBe("Answer");

    expect(formatQueryStageStatusTone("pending")).toBe("status-pill-neutral");
    expect(formatQueryStageStatusTone("running")).toBe("status-running");
    expect(formatQueryStageStatusTone("completed")).toBe("status-completed");
  });

  it("formats optional percent values for empty and populated stages", () => {
    expect(formatOptionalPercent(O.none())).toBe("Not yet");
    expect(formatOptionalPercent(O.some(42))).toBe("42%");
  });
});
