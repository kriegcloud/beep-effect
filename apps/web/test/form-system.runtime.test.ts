import {describe, expect, it} from "@effect/vitest";
import * as S from "effect/Schema";
import {createActor} from "xstate";
import {
  buildMachine,
  createTypedWorkflow,
  type EvaluationContext,
  evaluateJsonLogic,
  type WorkflowDefinition,
} from "@/features/form-system";

function makeDef(): WorkflowDefinition {
  return (
    createTypedWorkflow({id: "rt", version: "1.0.0", initial: "a"})
      .step("a", S.Struct({x: S.Number}))
      .step("b", S.Struct({}))
      .step("c", S.Struct({}))
      // prefer conditional first via priority
      .when("a", "b", {">": [{var: "current.x"}, 0]}, 1)
      .go("a", "c")
      .build()
  );
}

describe("Form System - XState runtime adapter", () => {
  it("takes default transition when condition is false", () => {
    const def = makeDef();
    const machine = buildMachine(def, evaluateJsonLogic);
    const actor = createActor(machine);
    actor.start();

    // initial state
    expect(actor.getSnapshot().value).toBe("a");

    const ctx: EvaluationContext = {
      answers: {},
      currentStepAnswers: {x: -1},
    };

    actor.send({type: "NEXT", context: ctx});
    expect(actor.getSnapshot().value).toBe("c");
  });

  it("takes conditional transition when condition is true", () => {
    const def = makeDef();
    const machine = buildMachine(def, evaluateJsonLogic);
    const actor = createActor(machine);
    actor.start();

    const ctx: EvaluationContext = {
      answers: {},
      currentStepAnswers: {x: 5},
    };

    actor.send({type: "NEXT", context: ctx});
    expect(actor.getSnapshot().value).toBe("b");
  });
});
