import { makeInMemoryProfessionalRuntimeSdk, runRuntimeFixture } from "@beep/agents-use-cases/proof";
import {
  CandidateOutputSet,
  GetContextPacket,
  ProposeCandidateOutputSet,
  RuntimeScope,
} from "@beep/agents-use-cases/public";
import * as S from "effect/Schema";
import { describe, expect, it } from "tstyche";
import type { RuntimeFixtureInput } from "@beep/agents-use-cases/proof";
import type {
  ProfessionalRuntimeSdk,
  ProfessionalRuntimeValidationError,
  SdkContextPacket,
} from "@beep/agents-use-cases/public";
import type { Effect } from "effect";

declare const fixture: RuntimeFixtureInput;
declare const query: GetContextPacket;
declare const command: ProposeCandidateOutputSet;

describe("@beep/agents-use-cases", () => {
  it("preserves public contract constructor and decode types", () => {
    expect(
      RuntimeScope.make({ organizationId: "org", threadId: "thread", workspaceId: "workspace" })
    ).type.toBe<RuntimeScope>();
    expect(S.decodeUnknownEffect(CandidateOutputSet)({})).type.toBe<Effect.Effect<CandidateOutputSet, S.SchemaError>>();
    expect(GetContextPacket.make(query)).type.toBe<GetContextPacket>();
    expect(ProposeCandidateOutputSet.make(command)).type.toBe<ProposeCandidateOutputSet>();
  });

  it("preserves fixture runner types", () => {
    expect(runRuntimeFixture(fixture)).type.toBe<
      Effect.Effect<CandidateOutputSet, ProfessionalRuntimeValidationError>
    >();
  });

  it("preserves SDK facade types", () => {
    const sdk = makeInMemoryProfessionalRuntimeSdk([fixture]);

    expect(sdk).type.toBe<ProfessionalRuntimeSdk>();
    expect(sdk.getContextPacket(query)).type.toBe<
      Effect.Effect<SdkContextPacket, ProfessionalRuntimeValidationError>
    >();
    expect(sdk.proposeCandidateOutputSet(command)).type.toBe<
      Effect.Effect<CandidateOutputSet, ProfessionalRuntimeValidationError>
    >();
  });
});
