import { $SharedAiId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $SharedAiId.create("errors");

export class NetworkError extends S.TaggedError<NetworkError>($I`NetworkError`)(
  "NetworkError",
  {
    message: S.String,
    cause: S.Defect,
  },
  $I.annotations("NetworkError", {
    description: "Network error",
  })
) {
  static readonly new = (message: string, cause: unknown) =>
    new NetworkError({
      message,
      cause,
    });
}

export class ProviderOutage extends S.TaggedError<ProviderOutage>($I`ProviderOutage`)(
  "ProviderOutage",
  {
    message: S.String,
    cause: S.Defect,
  },
  $I.annotations("ProviderOutage", {
    description: "Provider outage",
  })
) {
  static readonly new = (message: string, cause: unknown) =>
    new ProviderOutage({
      message,
      cause,
    });
}

export class AiError extends S.Union(ProviderOutage, NetworkError).annotations(
  $I.annotations("AiError", {
    description: "AI error",
  })
) {}

export declare namespace AiError {
  export type Type = typeof AiError.Type;
}
