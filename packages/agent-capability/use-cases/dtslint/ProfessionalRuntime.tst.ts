import {
  makeInMemoryProfessionalRuntimeSdk,
  type RuntimeFixtureInput,
  runRuntimeFixture,
} from "@beep/agent-capability-use-cases/proof";
import {
  CandidateOutputSet,
  GetContextPacket,
  type ProfessionalRuntimeSdk,
  type ProfessionalRuntimeValidationError,
  ProposeCandidateOutputSet,
  RuntimeScope,
  type SdkContextPacket,
} from "@beep/agent-capability-use-cases/public";
import type { Effect } from "effect";
import * as S from "effect/Schema";
import { describe, expect, it } from "tstyche";

declare const fixture: RuntimeFixtureInput;
declare const outputSet: CandidateOutputSet;
declare const query: GetContextPacket;
declare const command: ProposeCandidateOutputSet;

describe("@beep/agent-capability-use-cases", () => {
  it("preserves public contract constructor and decode types", () => {
    expect(
      new RuntimeScope({ organizationId: "org", threadId: "thread", workspaceId: "workspace" })
    ).type.toBe<RuntimeScope>();
    expect(S.decodeUnknownEffect(CandidateOutputSet)({})).type.toBe<
      Effect.Effect<CandidateOutputSet, S.SchemaError, never>
    >();
    expect(new GetContextPacket(query)).type.toBe<GetContextPacket>();
    expect(new ProposeCandidateOutputSet(command)).type.toBe<ProposeCandidateOutputSet>();
  });

  it("preserves fixture runner types", () => {
    expect(runRuntimeFixture(fixture)).type.toBe<
      Effect.Effect<CandidateOutputSet, ProfessionalRuntimeValidationError, never>
    >();
  });

  it("preserves SDK facade types", () => {
    const sdk = makeInMemoryProfessionalRuntimeSdk([fixture]);

    expect(sdk).type.toBe<ProfessionalRuntimeSdk>();
    expect(sdk.getContextPacket(query)).type.toBe<
      Effect.Effect<SdkContextPacket, ProfessionalRuntimeValidationError, never>
    >();
    expect(sdk.proposeCandidateOutputSet(command)).type.toBe<
      Effect.Effect<CandidateOutputSet, ProfessionalRuntimeValidationError, never>
    >();
  });
});
