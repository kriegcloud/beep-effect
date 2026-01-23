import { $SharedAiId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $SharedAiId.create("models/agent-prompt");

export class AgentPromptTemplate extends S.Class<AgentPromptTemplate>($I`AgentPromptTemplate`)(
  {
    name: S.String,
    description: S.String,
    systemPrompt: S.String,
    userPromptTemplate: S.String,
  },
  $I.annotations("AgentPromptTemplate", {
    description: "Agent Prompt Template",
  })
) {}

export class KnownSkill extends S.Class<KnownSkill>($I`KnownSkill`)(
  {
    name: S.String,
    description: S.String,
    path: S.String,
  },
  $I.annotations("KnownSkill", {
    description: "Agent Prompt Template",
  })
) {}
