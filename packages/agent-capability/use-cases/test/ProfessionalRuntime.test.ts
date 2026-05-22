import {
  CandidateOutputSet,
  GetContextPacket,
  ProposeCandidateOutputSet,
  RuntimeScope,
} from "@beep/agent-capability-use-cases/public";
import {
  makeInMemoryProfessionalRuntimeSdk,
  type RuntimeFixtureInput,
  runRuntimeFixture,
} from "@beep/agent-capability-use-cases/test";
import { A } from "@beep/utils";
import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";

const lawFixture: RuntimeFixtureInput = {
  body: A.join(
    [
      "[span:law-email-001-s2] We need help preparing a provisional patent application.",
      "[span:law-email-001-s3] The public prototype demonstration is planned for June 12, 2026.",
      "[span:law-email-001-s4] Avery Chen and Priya Raman are the main contributors.",
      "[span:law-email-001-s5] Please schedule an intake call next week.",
    ],
    "\n"
  ),
  email: {
    artifactId: "email-artifact-law-001",
    scenarioId: "law-patent-intake",
    sourceSpans: ["law-email-001-s2", "law-email-001-s3", "law-email-001-s4", "law-email-001-s5"],
    subject: "Provisional patent help",
    threadId: "thread-law-001",
  },
  seed: {
    organization: {
      organizationId: "org-law-fixture",
    },
    scenarioId: "law-patent-intake",
    workspace: {
      workspaceId: "workspace-law-fixture",
    },
  },
};

const lawScope = RuntimeScope.make({
  organizationId: lawFixture.seed.organization.organizationId,
  threadId: lawFixture.email.threadId,
  workspaceId: lawFixture.seed.workspace.workspaceId,
});

describe("@beep/agent-capability-use-cases", () => {
  it("runs deterministic fixtures into structured candidate output sets", () =>
    Effect.gen(function* () {
      const outputSet = yield* runRuntimeFixture(lawFixture);

      expect(outputSet).toBeInstanceOf(CandidateOutputSet);
      expect(outputSet.scenarioId).toBe("law-patent-intake");
      expect(outputSet.claims).toHaveLength(3);
      expect(outputSet.contextPacket.scope.workspaceId).toBe("workspace-law-fixture");
    }));

  it("serves context packets through the in-memory SDK facade", () =>
    Effect.gen(function* () {
      const sdk = makeInMemoryProfessionalRuntimeSdk([lawFixture]);
      const packet = yield* sdk.getContextPacket(
        GetContextPacket.make({
          artifactId: lawFixture.email.artifactId,
          scenarioId: lawFixture.email.scenarioId,
          scope: lawScope,
        })
      );

      expect(packet.scope).toEqual(lawScope);
      expect(packet.request.artifactId).toBe(lawFixture.email.artifactId);
    }));

  it("accepts matching candidate output proposals", () =>
    Effect.gen(function* () {
      const sdk = makeInMemoryProfessionalRuntimeSdk([lawFixture]);
      const outputSet = yield* runRuntimeFixture(lawFixture);
      const accepted = yield* sdk.proposeCandidateOutputSet(
        ProposeCandidateOutputSet.make({
          outputSet,
          producedByPrincipalId: "principal-agent-runtime-fixture",
          scope: lawScope,
        })
      );

      expect(accepted).toStrictEqual(outputSet);
    }));
});
