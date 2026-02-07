import { $KnowledgeDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { ValidationSeverity } from "./shacl-policy.value";

const $I = $KnowledgeDomainId.create("value-objects/validation-report");

export class ValidationFinding extends S.Class<ValidationFinding>($I`ValidationFinding`)({
  shapeId: S.String,
  focusNode: S.String,
  path: S.optional(S.String),
  message: S.String,
  severity: ValidationSeverity,
}) {}

export class ValidationSummary extends S.Class<ValidationSummary>($I`ValidationSummary`)({
  infoCount: S.NonNegativeInt,
  warningCount: S.NonNegativeInt,
  violationCount: S.NonNegativeInt,
}) {}

export class ValidationReport extends S.Class<ValidationReport>($I`ValidationReport`)({
  conforms: S.Boolean,
  findings: S.Array(ValidationFinding),
  summary: ValidationSummary,
}) {}
