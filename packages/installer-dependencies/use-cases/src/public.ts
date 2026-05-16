/**
 * installer-dependencies public use-case exports.
 *
 * @packageDocumentation
 * @category use-cases
 * @since 0.0.0
 */

import { $InstallerDependenciesUseCasesId } from "@beep/identity/packages";
import { HostDependency } from "@beep/installer-dependencies-domain/aggregates/HostDependency";
import { LiteralKit, TaggedErrorClass } from "@beep/schema";
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
 * Bun runtime health states visible to the app.
 *
 * @category use-cases
 * @since 0.0.0
 */
export const BunRuntimeHealthState = LiteralKit(["healthy", "repair-required", "missing"] as const).pipe(
  $I.annoteSchema("BunRuntimeHealthState", {
    description: "App-facing Bun runtime health state for the focused repair flow.",
  })
);

/**
 * Runtime type for {@link BunRuntimeHealthState}.
 *
 * @category use-cases
 * @since 0.0.0
 */
export type BunRuntimeHealthState = typeof BunRuntimeHealthState.Type;

/**
 * App-facing Bun runtime health result.
 *
 * @category use-cases
 * @since 0.0.0
 */
export class BunRuntimeHealthResult extends S.Class<BunRuntimeHealthResult>($I`BunRuntimeHealthResult`)(
  {
    dependency: HostDependency,
    state: BunRuntimeHealthState,
    summary: S.NonEmptyString,
  },
  $I.annote("BunRuntimeHealthResult", {
    description: "Current Bun runtime health as presented by the Stack Installer app.",
  })
) {}

/**
 * App-facing Bun repair request.
 *
 * @category use-cases
 * @since 0.0.0
 */
export class BunRuntimeRepairRequest extends S.Class<BunRuntimeRepairRequest>($I`BunRuntimeRepairRequest`)(
  {
    approved: S.Boolean,
  },
  $I.annote("BunRuntimeRepairRequest", {
    description: "Approval-first request to repair the Bun runtime for the focused app flow.",
  })
) {}

/**
 * App-facing Bun repair result.
 *
 * @category use-cases
 * @since 0.0.0
 */
export class BunRuntimeRepairResult extends S.Class<BunRuntimeRepairResult>($I`BunRuntimeRepairResult`)(
  {
    after: BunRuntimeHealthResult,
    before: BunRuntimeHealthResult,
    changed: S.Boolean,
    command: S.NonEmptyString,
    summary: S.NonEmptyString,
  },
  $I.annote("BunRuntimeRepairResult", {
    description: "Before and after evidence for the app-driven Bun repair flow.",
  })
) {}

/**
 * Public failure when Bun health cannot be inspected.
 *
 * @category errors
 * @since 0.0.0
 */
export class BunRuntimeInspectionFailed extends TaggedErrorClass<BunRuntimeInspectionFailed>(
  $I`BunRuntimeInspectionFailed`
)(
  "BunRuntimeInspectionFailed",
  {
    reason: S.NonEmptyString,
  },
  $I.annote("BunRuntimeInspectionFailed", {
    description: "The app could not inspect the Bun runtime health.",
  })
) {}

/**
 * Public failure when the repair action is invoked without approval.
 *
 * @category errors
 * @since 0.0.0
 */
export class BunRuntimeRepairApprovalRequired extends TaggedErrorClass<BunRuntimeRepairApprovalRequired>(
  $I`BunRuntimeRepairApprovalRequired`
)(
  "BunRuntimeRepairApprovalRequired",
  {
    reason: S.NonEmptyString,
  },
  $I.annote("BunRuntimeRepairApprovalRequired", {
    description: "The app requires explicit user approval before mutating the Bun runtime.",
  })
) {}

/**
 * Public failure when the Bun runtime is already healthy.
 *
 * @category errors
 * @since 0.0.0
 */
export class BunRuntimeAlreadyHealthy extends TaggedErrorClass<BunRuntimeAlreadyHealthy>($I`BunRuntimeAlreadyHealthy`)(
  "BunRuntimeAlreadyHealthy",
  {
    reason: S.NonEmptyString,
  },
  $I.annote("BunRuntimeAlreadyHealthy", {
    description: "The Bun runtime already satisfies the current requirement.",
  })
) {}

/**
 * Public failure when Bun repair cannot complete successfully.
 *
 * @category errors
 * @since 0.0.0
 */
export class BunRuntimeRepairFailed extends TaggedErrorClass<BunRuntimeRepairFailed>($I`BunRuntimeRepairFailed`)(
  "BunRuntimeRepairFailed",
  {
    reason: S.NonEmptyString,
  },
  $I.annote("BunRuntimeRepairFailed", {
    description: "The Bun repair flow failed or did not reach a healthy state.",
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
