/**
 * installer-dependencies public use-case exports.
 *
 * @packageDocumentation
 * @category use-cases
 * @since 0.0.0
 */

import { $InstallerDependenciesUseCasesId } from "@beep/identity/packages";
import { HostDependency } from "@beep/installer-dependencies-domain/aggregates/HostDependency";
import * as S from "effect/Schema";

const $I = $InstallerDependenciesUseCasesId.create("public");

/**
 * Dry-run verb owned by the installer-dependencies slice.
 *
 * @category use-cases
 * @since 0.0.0
 */
export class HostDependencyVerb extends S.Class<HostDependencyVerb>($I`HostDependencyVerb`)(
  {
    id: S.NonEmptyString,
    label: S.NonEmptyString,
    summary: S.NonEmptyString,
    requiresApproval: S.Boolean,
    dryRunOnly: S.Boolean,
  },
  $I.annote("HostDependencyVerb", {
    title: "Host dependency verb",
    description: "Slice-owned dry-run verb contract for host dependency validation.",
  })
) {}

/**
 * Dry-run dependency preview plan.
 *
 * @category use-cases
 * @since 0.0.0
 */
export class HostDependencyPlan extends S.Class<HostDependencyPlan>($I`HostDependencyPlan`)(
  {
    dependencies: S.Array(HostDependency),
    verbs: S.Array(HostDependencyVerb),
    notes: S.Array(S.NonEmptyString),
  },
  $I.annote("HostDependencyPlan", {
    title: "Host dependency plan",
    description: "Deterministic preview of host dependencies; it never runs installers.",
  })
) {}

/**
 * Live host dependency validation result.
 *
 * @category use-cases
 * @since 0.0.0
 */
export class HostDependencyValidationResult extends S.Class<HostDependencyValidationResult>(
  $I`HostDependencyValidationResult`
)(
  {
    dependency: HostDependency,
    message: S.NonEmptyString,
  },
  $I.annote("HostDependencyValidationResult", {
    title: "Host dependency validation result",
    description: "Sanitized live command-existence and version probe result.",
  })
) {}

/**
 * Static P1A verb contracts owned by the dependency slice.
 *
 * @category use-cases
 * @since 0.0.0
 */
export const P1A_HOST_DEPENDENCY_VERB_INPUTS = [
  {
    dryRunOnly: true,
    id: "installer.dependencies.detect-host",
    label: "Detect Host Dependencies",
    requiresApproval: false,
    summary: "Check whether required tools appear to exist without installing or upgrading anything.",
  },
  {
    dryRunOnly: true,
    id: "installer.dependencies.preview-install-plan",
    label: "Preview Dependency Plan",
    requiresApproval: true,
    summary: "Render the package/app plan a human would approve before live installation is enabled.",
  },
] as const;
