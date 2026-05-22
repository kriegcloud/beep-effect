/**
 * Tagged errors for the Lint command suite.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $RepoCliId } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $RepoCliId.create("commands/Lint/Lint.errors");
export class LintCircularAnalysisError extends TaggedErrorClass<LintCircularAnalysisError>(
  $I`LintCircularAnalysisError`
)(
  "LintCircularAnalysisError",
  {
    message: S.String,
  },
  $I.annote("LintCircularAnalysisError", {
    description: "Circular dependency analysis failed for a target directory.",
  })
) {}

export class LintFileDiscoveryError extends TaggedErrorClass<LintFileDiscoveryError>($I`LintFileDiscoveryError`)(
  "LintFileDiscoveryError",
  {
    message: S.String,
    root: S.String,
    path: S.String,
  },
  $I.annote("LintFileDiscoveryError", {
    description: "TypeScript file discovery failed for a lint root.",
  })
) {}
