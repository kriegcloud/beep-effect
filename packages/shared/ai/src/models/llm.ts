import { $SharedAiId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";
import { AiProviderName } from "../constants.ts";

const $I = $SharedAiId.create("models/llm");

export class ModelInfo extends S.Class<ModelInfo>($I`ModelInfo`)(
  {
    id: S.String,
    displayName: S.optionalWith(S.String, { as: "Option" }),
    isReasoningModel: S.Boolean,
  },
  $I.annotations("ModelInfo", {
    description: "ModelInfo",
  })
) {}

export class LLMAuthenticationError extends S.TaggedError<LLMAuthenticationError>($I`LLMAuthenticationError`)(
  "LLMAuthenticationError",
  {
    provider: S.String,
    message: S.String,
    suggestion: S.optionalWith(S.String, { as: "Option" }),
  },
  $I.annotations("LLMAuthenticationError", {
    description: "LLMAuthenticationError",
  })
) {}

export class LLMProvider extends S.Class<LLMProvider>($I`LLMProvider`)(
  {
    name: AiProviderName,
    supportedModels: ModelInfo,
    defaultModel: S.String,
    authenticate: BS.Fn({
      output: S.Either({
        left: LLMAuthenticationError,
        right: S.Void,
      }),
    }),
  },
  $I.annotations("LLMProvider", {
    description: "LLMProvider",
  })
) {}

export class LLMProviderListItem extends S.Class<LLMProviderListItem>($I`LLMProviderListItem`)(
  {
    name: AiProviderName,
    displayName: S.optionalWith(S.String, { as: "Option" }),
    configured: S.Boolean,
  },
  $I.annotations("LLMProviderListItem", {
    description: "LLMProviderListItem",
  })
) {}
