/**
 * Host dependency aggregate model.
 *
 * @packageDocumentation
 * @category aggregates
 * @since 0.0.0
 */

import { $InstallerDependenciesDomainId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $InstallerDependenciesDomainId.create("aggregates/HostDependency/HostDependency.model");

/**
 * Host dependency family recognized by the dry-run installer.
 *
 * @category aggregates
 * @since 0.0.0
 */
export const HostDependencyKind = LiteralKit(["system-package", "desktop-app", "cli-tool", "runtime"] as const).pipe(
  $I.annoteSchema("HostDependencyKind", {
    description: "Dependency families the stack installer can validate before live installation exists.",
  })
);

/**
 * Runtime type for {@link HostDependencyKind}.
 *
 * @category aggregates
 * @since 0.0.0
 */
export type HostDependencyKind = typeof HostDependencyKind.Type;

/**
 * Validation status for a host dependency.
 *
 * @category aggregates
 * @since 0.0.0
 */
export const HostDependencyStatus = LiteralKit(["present", "missing", "unknown"] as const).pipe(
  $I.annoteSchema("HostDependencyStatus", {
    description: "Dry-run validation status for a host dependency.",
  })
);

/**
 * Runtime type for {@link HostDependencyStatus}.
 *
 * @category aggregates
 * @since 0.0.0
 */
export type HostDependencyStatus = typeof HostDependencyStatus.Type;

/**
 * Host dependency required by the AI stack installer.
 *
 * @category aggregates
 * @since 0.0.0
 */
export class HostDependency extends S.Class<HostDependency>($I`HostDependency`)(
  {
    id: S.NonEmptyString,
    name: S.NonEmptyString,
    kind: HostDependencyKind,
    status: HostDependencyStatus,
    requiredVersion: S.OptionFromOptionalKey(S.NonEmptyString),
    detectedVersion: S.OptionFromOptionalKey(S.NonEmptyString),
    installHint: S.NonEmptyString,
  },
  $I.annote("HostDependency", {
    title: "Host dependency",
    description: "A dry-run description of one host-level dependency needed by the stack installer.",
  })
) {}
