import { ValidationPolicyError } from "@beep/knowledge-domain/errors";
import {
  type ShaclPolicy,
  type ValidationFinding,
  ValidationReport,
  ValidationSummary,
} from "@beep/knowledge-domain/value-objects";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Match from "effect/Match";

const summarizeFindings = (findings: ReadonlyArray<ValidationFinding>): ValidationSummary =>
  A.reduce(findings, new ValidationSummary({ infoCount: 0, warningCount: 0, violationCount: 0 }), (acc, finding) =>
    Match.value(finding.severity).pipe(
      Match.when("Info", () => new ValidationSummary({ ...acc, infoCount: acc.infoCount + 1 })),
      Match.when("Warning", () => new ValidationSummary({ ...acc, warningCount: acc.warningCount + 1 })),
      Match.when("Violation", () => new ValidationSummary({ ...acc, violationCount: acc.violationCount + 1 })),
      Match.exhaustive
    )
  );

export const makeValidationReport = (findings: ReadonlyArray<ValidationFinding>): ValidationReport => {
  const summary = summarizeFindings(findings);
  return new ValidationReport({
    conforms: summary.violationCount === 0,
    findings: [...findings],
    summary,
  });
};

export const enforceValidationPolicy = (
  report: ValidationReport,
  policy: ShaclPolicy
): Effect.Effect<void, ValidationPolicyError> =>
  Effect.gen(function* () {
    if (policy.violation === "reject" && report.summary.violationCount > 0) {
      return yield* new ValidationPolicyError({
        message: `Validation rejected: ${report.summary.violationCount} violations`,
        violationCount: report.summary.violationCount,
        warningCount: report.summary.warningCount,
        severity: "Violation",
      });
    }

    if (policy.warning === "reject" && report.summary.warningCount > 0) {
      return yield* new ValidationPolicyError({
        message: `Validation rejected: ${report.summary.warningCount} warnings`,
        violationCount: report.summary.violationCount,
        warningCount: report.summary.warningCount,
        severity: "Warning",
      });
    }
  });
