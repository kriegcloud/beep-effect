/**
 * installer-dependencies server use-case exports.
 *
 * @packageDocumentation
 * @category repositories
 * @since 0.0.0
 */

import { $InstallerDependenciesUseCasesId } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import type { Effect } from "effect";
import { Context } from "effect";
import * as S from "effect/Schema";
import type { ChildProcessSpawner } from "effect/unstable/process";
import type {
  BunRuntimeAlreadyHealthy,
  BunRuntimeHealthResult,
  BunRuntimeInspectionFailed,
  BunRuntimeRepairApprovalRequired,
  BunRuntimeRepairFailed,
  BunRuntimeRepairRequest,
  BunRuntimeRepairResult,
  HostDependencyPlan,
  HostDependencyValidationResult,
} from "./public.js";

const $I = $InstallerDependenciesUseCasesId.create("server");

/**
 * Server-only failure emitted by the Bun runtime command port.
 *
 * @category errors
 * @since 0.0.0
 */
export class BunRuntimeCommandPortError extends TaggedErrorClass<BunRuntimeCommandPortError>(
  $I`BunRuntimeCommandPortError`
)(
  "BunRuntimeCommandPortError",
  {
    message: S.NonEmptyString,
    operation: S.NonEmptyString,
  },
  $I.annote("BunRuntimeCommandPortError", {
    description: "Server-only failure emitted while adapting the Bun runtime command port.",
  })
) {}

/**
 * Server-side Bun runtime probe shape.
 *
 * @category repositories
 * @since 0.0.0
 */
export type BunRuntimeProbe = {
  readonly status: "present" | "missing";
  readonly version: import("effect/Option").Option<string>;
};

interface BunRuntimeCommandPortShape {
  readonly probe: () => Effect.Effect<BunRuntimeProbe, BunRuntimeCommandPortError>;
  readonly upgrade: () => Effect.Effect<void, BunRuntimeCommandPortError>;
}

/**
 * Server-side Bun runtime command port.
 *
 * @category repositories
 * @since 0.0.0
 */
export class BunRuntimeCommandPort extends Context.Service<BunRuntimeCommandPort, BunRuntimeCommandPortShape>()(
  $I`BunRuntimeCommandPort`
) {}

/**
 * Dependency use-case service shape.
 *
 * @category repositories
 * @since 0.0.0
 */
interface InstallerDependenciesUseCasesShape {
  readonly inspectBunRuntime: () => Effect.Effect<BunRuntimeHealthResult, BunRuntimeInspectionFailed>;
  readonly previewHostDependencies: () => Effect.Effect<HostDependencyPlan, S.SchemaError>;
  readonly repairBunRuntime: (
    request: BunRuntimeRepairRequest
  ) => Effect.Effect<
    BunRuntimeRepairResult,
    BunRuntimeAlreadyHealthy | BunRuntimeRepairApprovalRequired | BunRuntimeRepairFailed
  >;
  readonly validateRequiredCommands: () => Effect.Effect<
    ReadonlyArray<HostDependencyValidationResult>,
    S.SchemaError,
    ChildProcessSpawner.ChildProcessSpawner
  >;
}

/**
 * Dependency use-case service key.
 *
 * @category repositories
 * @since 0.0.0
 */
export class InstallerDependenciesUseCases extends Context.Service<
  InstallerDependenciesUseCases,
  InstallerDependenciesUseCasesShape
>()($I`InstallerDependenciesUseCases`) {}
