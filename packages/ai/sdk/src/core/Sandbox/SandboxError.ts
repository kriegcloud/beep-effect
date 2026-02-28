import { $AiSdkId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $AiSdkId.create("core/Sandbox/SandboxError");

export class SandboxError extends S.TaggedErrorClass<SandboxError>($I`SandboxError`)(
  "SandboxError",
  {
    message: S.String,
    operation: S.String,
    provider: S.Literals(["local", "cloudflare"]),
    cause: S.optionalKey(S.DefectWithStack),
  },
  $I.annote("SandboxError", {
    description: "Error that occurs during sandbox operations",
  })
) {
  static readonly make = (params: Pick<SandboxError, "message" | "operation" | "provider" | "cause">) =>
    new SandboxError(params);
}
