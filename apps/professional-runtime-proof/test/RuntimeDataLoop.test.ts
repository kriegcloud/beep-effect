import { runProfessionalRuntimeScenario, toPlain } from "@beep/professional-runtime-proof";
import { describe, expect, it } from "@effect/vitest";

describe("Agentic Professional Runtime data loop", () => {
  it("turns the law patent-intake email into evidenced candidate work", () =>
    runProfessionalRuntimeScenario("law-patent-intake").then(
      ({ expectedApprovalGates, expectedClaims, expectedContextPacket, expectedDrafts, expectedTasks, output }) => {
        expect(toPlain(output.claims)).toEqual(expectedClaims.claims);
        expect(toPlain(output.candidateProject)).toEqual(expectedTasks.candidateProject);
        expect(toPlain(output.tasks)).toEqual(expectedTasks.tasks);
        expect(toPlain(output.drafts)).toEqual(expectedDrafts.drafts);
        expect(toPlain(output.approvalGates)).toEqual(expectedApprovalGates.approvalGates);
        expect(toPlain(output.contextPacket)).toEqual(expectedContextPacket);
      }
    ));

  it("turns the wealth cash-request email into evidenced candidate work", () =>
    runProfessionalRuntimeScenario("wealth-cash-request").then(
      ({ expectedApprovalGates, expectedClaims, expectedContextPacket, expectedDrafts, expectedTasks, output }) => {
        expect(toPlain(output.claims)).toEqual(expectedClaims.claims);
        expect(toPlain(output.candidateProject)).toEqual(expectedTasks.candidateProject);
        expect(toPlain(output.tasks)).toEqual(expectedTasks.tasks);
        expect(toPlain(output.drafts)).toEqual(expectedDrafts.drafts);
        expect(toPlain(output.approvalGates)).toEqual(expectedApprovalGates.approvalGates);
        expect(toPlain(output.contextPacket)).toEqual(expectedContextPacket);
      }
    ));
});
