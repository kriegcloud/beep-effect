import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("value-objects/shacl-policy");

export class ValidationSeverity extends BS.StringLiteralKit("Info", "Warning", "Violation").annotations(
  $I.annotations("ValidationSeverity", {
    description: "SHACL validation severity.",
  })
) {}

export class PolicyAction extends BS.StringLiteralKit("ignore", "warn", "reject").annotations(
  $I.annotations("PolicyAction", {
    description: "Policy action taken for a validation finding at a given severity.",
  })
) {}

export class ShaclPolicy extends S.Class<ShaclPolicy>($I`ShaclPolicy`)(
  {
    info: S.propertySignature(PolicyAction).pipe(S.withConstructorDefault(() => "ignore")),
    warning: S.propertySignature(PolicyAction).pipe(S.withConstructorDefault(() => "warn")),
    violation: S.propertySignature(PolicyAction).pipe(S.withConstructorDefault(() => "reject")),
  },
  $I.annotations("ShaclPolicy", {
    description: "Policy for applying SHACL validation findings",
  })
) {}
