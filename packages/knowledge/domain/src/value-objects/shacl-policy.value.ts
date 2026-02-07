import { $KnowledgeDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("value-objects/shacl-policy");

export const ValidationSeverity = S.Literal("Info", "Warning", "Violation").annotations(
  $I.annotations("ValidationSeverity", {
    description: "SHACL validation severity",
  })
);

export const PolicyAction = S.Literal("ignore", "warn", "reject").annotations(
  $I.annotations("PolicyAction", {
    description: "How to handle findings at a given severity",
  })
);

export class ShaclPolicy extends S.Class<ShaclPolicy>($I`ShaclPolicy`)(
  {
    info: S.propertySignature(PolicyAction).pipe(S.withConstructorDefault(() => "ignore" as const)),
    warning: S.propertySignature(PolicyAction).pipe(S.withConstructorDefault(() => "warn" as const)),
    violation: S.propertySignature(PolicyAction).pipe(S.withConstructorDefault(() => "reject" as const)),
  },
  $I.annotations("ShaclPolicy", {
    description: "Policy for applying SHACL validation findings",
  })
) {}
