import { runProfessionalRuntimeScenario, toPlain, VERSION } from "@beep/professional-runtime-proof";
import { describe, expect, it } from "tstyche";
import type { CandidateOutputSet } from "@beep/agent-capability-use-cases/public";
import type { ScenarioId } from "@beep/professional-runtime-proof";

type ScenarioResult = Awaited<ReturnType<typeof runProfessionalRuntimeScenario>>;

describe("@beep/professional-runtime-proof", () => {
  it("preserves exported proof harness types", () => {
    expect(VERSION).type.toBe<"0.0.0">();
    expect<ScenarioId>().type.toBe<"law-patent-intake" | "wealth-cash-request">();
    expect(toPlain({ ok: true })).type.toBe<unknown>();
    expect(runProfessionalRuntimeScenario("law-patent-intake")).type.toBe<Promise<ScenarioResult>>();
    expect<ScenarioResult["output"]>().type.toBe<CandidateOutputSet>();
  });
});
