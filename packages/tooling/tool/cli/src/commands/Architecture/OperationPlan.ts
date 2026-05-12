/**
 * Architecture operation-plan command implementation.
 *
 * @packageDocumentation
 * @category cli-commands
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { DomainError, findRepoRoot } from "@beep/repo-utils";
import { LiteralKit, SchemaUtils } from "@beep/schema";
import { Str as CommonStr, Text, thunkFalse } from "@beep/utils";
import { Console, Effect, FileSystem, Path, pipe } from "effect";
import * as A from "effect/Array";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { Argument, Command, Flag } from "effect/unstable/cli";

const $I = $RepoCliId.create("commands/Architecture/OperationPlan");

/**
 * Canonical architecture domain-kind folders.
 *
 * @category models
 * @since 0.0.0
 */
export const ArchitectureDomainKind = LiteralKit(["aggregates", "entities", "values"] as const).pipe(
  $I.annoteSchema("ArchitectureDomainKind", {
    description: "Domain-kind folder used by canonical architecture operation plans.",
  })
);

/**
 * Canonical architecture domain-kind folder.
 *
 * @category models
 * @since 0.0.0
 */
export type ArchitectureDomainKind = typeof ArchitectureDomainKind.Type;

/**
 * Staged architecture proof targets.
 *
 * @category models
 * @since 0.0.0
 */
export const ArchitecturePlanStage = LiteralKit(["core", "persistence", "protocol", "client", "full"] as const).pipe(
  $I.annoteSchema("ArchitecturePlanStage", {
    description: "Stage selector for canonical slice operation-plan generation.",
  })
);

/**
 * Staged architecture proof target.
 *
 * @category models
 * @since 0.0.0
 */
export type ArchitecturePlanStage = typeof ArchitecturePlanStage.Type;

/**
 * Canonical architecture slice roles.
 *
 * @category models
 * @since 0.0.0
 */
export const ArchitectureSliceRole = LiteralKit([
  "domain",
  "use-cases",
  "config",
  "server",
  "tables",
  "client",
  "ui",
  "proof-app",
  "db-admin",
] as const).pipe(
  $I.annoteSchema("ArchitectureSliceRole", {
    description: "Role package, proof app, or internal admin target represented in an architecture operation plan.",
  })
);

/**
 * Canonical architecture slice role.
 *
 * @category models
 * @since 0.0.0
 */
export type ArchitectureSliceRole = typeof ArchitectureSliceRole.Type;

/**
 * Writer families selected from normalized architecture operations.
 *
 * @category models
 * @since 0.0.0
 */
export const ArchitectureWriterKind = LiteralKit([
  "template",
  "json",
  "jsonc",
  "package-json",
  "ts-morph",
] as const).pipe(
  $I.annoteSchema("ArchitectureWriterKind", {
    description: "Writer family selected for an architecture operation-plan file operation.",
  })
);

/**
 * Writer family selected from normalized architecture operations.
 *
 * @category models
 * @since 0.0.0
 */
export type ArchitectureWriterKind = typeof ArchitectureWriterKind.Type;

/**
 * Role package entry in a canonical architecture slice operation plan.
 *
 * @category models
 * @since 0.0.0
 */
export class ArchitectureSliceRolePlan extends S.Class<ArchitectureSliceRolePlan>($I`ArchitectureSliceRolePlan`)(
  {
    role: ArchitectureSliceRole,
    packageName: S.String,
    path: S.String,
    exports: S.Array(S.String),
  },
  $I.annote("ArchitectureSliceRolePlan", {
    description: "Package-level role metadata emitted by the architecture operation-plan factory.",
  })
) {}

/**
 * Normalized architecture creation target.
 *
 * @category models
 * @since 0.0.0
 */
export class ArchitecturePlanTarget extends S.Class<ArchitecturePlanTarget>($I`ArchitecturePlanTarget`)(
  {
    boundedContext: S.String,
    concept: S.String,
    domainKind: ArchitectureDomainKind,
    conceptPath: S.String,
    stage: ArchitecturePlanStage,
  },
  $I.annote("ArchitecturePlanTarget", {
    description: "Normalized slice, concept, domain-kind, and stage selected by architecture commands.",
  })
) {}

/**
 * Operation that writes a repo-relative file when absent.
 *
 * @category models
 * @since 0.0.0
 */
export class WriteFileOperation extends S.Class<WriteFileOperation>($I`WriteFileOperation`)(
  {
    kind: S.Literal("write-file"),
    role: ArchitectureSliceRole,
    path: S.String,
    writer: ArchitectureWriterKind,
    content: S.String,
    description: S.String,
  },
  $I.annote("WriteFileOperation", {
    description: "Operation that materializes a canonical architecture file with failsafe conflict behavior.",
  })
) {}

/**
 * Operation that proves a repo-relative file must exist.
 *
 * @category models
 * @since 0.0.0
 */
export class EnsureFileOperation extends S.Class<EnsureFileOperation>($I`EnsureFileOperation`)(
  {
    kind: S.Literal("ensure-file"),
    role: ArchitectureSliceRole,
    path: S.String,
    description: S.String,
  },
  $I.annote("EnsureFileOperation", {
    description: "Operation asserting that a canonical slice file is materialized.",
  })
) {}

/**
 * Operation that proves a legacy repo-relative path must not exist.
 *
 * @category models
 * @since 0.0.0
 */
export class EnsureAbsentPathOperation extends S.Class<EnsureAbsentPathOperation>($I`EnsureAbsentPathOperation`)(
  {
    kind: S.Literal("ensure-absent-path"),
    path: S.String,
    description: S.String,
  },
  $I.annote("EnsureAbsentPathOperation", {
    description: "Operation asserting that a legacy architecture fixture path is absent.",
  })
) {}

/**
 * Canonical operation-plan operation.
 *
 * @category models
 * @since 0.0.0
 */
export const ArchitectureOperation = S.Union([WriteFileOperation, EnsureFileOperation, EnsureAbsentPathOperation]);

/**
 * Canonical operation-plan operation.
 *
 * @category models
 * @since 0.0.0
 */
export type ArchitectureOperation = typeof ArchitectureOperation.Type;

/**
 * Schema-versioned canonical architecture slice operation plan.
 *
 * @category models
 * @since 0.0.0
 */
export class CanonicalSliceOperationPlan extends S.Class<CanonicalSliceOperationPlan>($I`CanonicalSliceOperationPlan`)(
  {
    schemaVersion: S.Literal("architecture-operation-plan/v1"),
    target: ArchitecturePlanTarget,
    roles: S.Array(ArchitectureSliceRolePlan),
    operations: S.Array(ArchitectureOperation),
  },
  $I.annote("CanonicalSliceOperationPlan", {
    description: "Decoded JSON plan used by beep architecture commands before any filesystem write.",
  })
) {
  /**
   * Backwards-compatible slice metadata for existing operation-plan callers.
   *
   * @returns Legacy aggregate-oriented slice metadata derived from the plan target.
   * @category models
   * @since 0.0.0
   */
  get slice(): {
    readonly aggregate: string;
    readonly aggregatePath: string;
    readonly boundedContext: string;
  } {
    return {
      boundedContext: this.target.boundedContext,
      aggregate: this.target.concept,
      aggregatePath: this.target.conceptPath,
    };
  }
}

/**
 * Result of validating a canonical operation plan against a checkout.
 *
 * @category models
 * @since 0.0.0
 */
export class OperationPlanCheckResult extends S.Class<OperationPlanCheckResult>($I`OperationPlanCheckResult`)(
  {
    idempotent: S.Boolean,
    missingPaths: S.Array(S.String),
    differingPaths: S.Array(S.String).pipe(SchemaUtils.withEmptyArrayDefaults<string>()),
    unexpectedPaths: S.Array(S.String),
  },
  $I.annote("OperationPlanCheckResult", {
    description: "Filesystem validation result for a decoded architecture operation plan.",
  })
) {}

/**
 * Result of applying a canonical operation plan.
 *
 * @category models
 * @since 0.0.0
 */
export class OperationPlanApplyResult extends S.Class<OperationPlanApplyResult>($I`OperationPlanApplyResult`)(
  {
    writtenPaths: S.Array(S.String),
    skippedPaths: S.Array(S.String),
    removedPaths: S.Array(S.String),
  },
  $I.annote("OperationPlanApplyResult", {
    description: "Filesystem write summary for a decoded architecture operation plan.",
  })
) {}

type AcceptedProofFile = {
  readonly role: ArchitectureSliceRole;
  readonly stage: ArchitecturePlanStage;
  readonly path: string;
  readonly writer: ArchitectureWriterKind;
};

const defaultPlanTarget = new ArchitecturePlanTarget({
  boundedContext: "architecture-lab",
  concept: "WorkItem",
  conceptPath: "aggregates/WorkItem",
  domainKind: "aggregates",
  stage: "full",
});

const stageOrder: ReadonlyArray<ArchitecturePlanStage> = ["core", "persistence", "protocol", "client", "full"];
const stringEquivalence = S.toEquivalence(S.String);
const stageRank = (stage: ArchitecturePlanStage): number =>
  pipe(
    stageOrder,
    A.findFirstIndex((candidate) => stringEquivalence(candidate, stage)),
    O.getOrElse(() => 0)
  );
const isStageIncluded = (requested: ArchitecturePlanStage, fileStage: ArchitecturePlanStage): boolean =>
  stringEquivalence(requested, "full") || stageRank(fileStage) <= stageRank(requested);

const aggregateRoles: ReadonlyArray<ArchitectureSliceRole> = [
  "domain",
  "use-cases",
  "config",
  "server",
  "tables",
  "client",
  "ui",
  "proof-app",
  "db-admin",
] as const;
const entityRoles: ReadonlyArray<ArchitectureSliceRole> = ["domain", "use-cases", "server", "tables", "db-admin"];
const valueRoles: ReadonlyArray<ArchitectureSliceRole> = ["domain"];

const rolesForDomainKind = (domainKind: ArchitectureDomainKind): ReadonlyArray<ArchitectureSliceRole> => {
  if (domainKind === "entities") return entityRoles;
  if (domainKind === "values") return valueRoles;
  return aggregateRoles;
};

const roleAllowedForDomainKind = (domainKind: ArchitectureDomainKind, role: ArchitectureSliceRole): boolean =>
  pipe(rolesForDomainKind(domainKind), A.contains(role));

const dbAdminProofTargetAllowed = (target: ArchitecturePlanTarget): boolean =>
  stringEquivalence(target.boundedContext, defaultPlanTarget.boundedContext) &&
  ((stringEquivalence(target.domainKind, "aggregates") && stringEquivalence(target.concept, "WorkItem")) ||
    (stringEquivalence(target.domainKind, "entities") && stringEquivalence(target.concept, "Worker")));

const roleAllowedForTarget = (target: ArchitecturePlanTarget, role: ArchitectureSliceRole): boolean =>
  roleAllowedForDomainKind(target.domainKind, role) && (role !== "db-admin" || dbAdminProofTargetAllowed(target));

const roleBasePath = (role: ArchitectureSliceRole): O.Option<string> => {
  if (role === "proof-app") return O.some("apps/architecture-lab-proof");
  if (role === "db-admin") return O.some("packages/_internal/db-admin");
  return O.some(`packages/architecture-lab/${role}`);
};

const rolePackageFiles = (
  role: ArchitectureSliceRole,
  stage: ArchitecturePlanStage
): ReadonlyArray<AcceptedProofFile> =>
  pipe(
    roleBasePath(role),
    O.map(
      (basePath) =>
        [
          { role, stage, path: `${basePath}/AGENTS.md`, writer: "template" },
          { role, stage, path: `${basePath}/LICENSE`, writer: "template" },
          { role, stage, path: `${basePath}/README.md`, writer: "template" },
          { role, stage, path: `${basePath}/docgen.json`, writer: "json" },
          { role, stage, path: `${basePath}/package.json`, writer: "package-json" },
          { role, stage, path: `${basePath}/tsconfig.json`, writer: "jsonc" },
          { role, stage, path: `${basePath}/vitest.config.ts`, writer: "template" },
          { role, stage, path: `${basePath}/dtslint/.gitkeep`, writer: "template" },
          { role, stage, path: `${basePath}/test/.gitkeep`, writer: "template" },
        ] satisfies ReadonlyArray<AcceptedProofFile>
    ),
    O.getOrElse(A.empty<AcceptedProofFile>)
  );

const acceptedProofFiles: ReadonlyArray<AcceptedProofFile> = [
  ...rolePackageFiles("domain", "core"),
  { role: "domain", stage: "core", path: "packages/architecture-lab/domain/src/index.ts", writer: "ts-morph" },
  {
    role: "domain",
    stage: "core",
    path: "packages/architecture-lab/domain/src/aggregates/index.ts",
    writer: "ts-morph",
  },
  {
    role: "domain",
    stage: "core",
    path: "packages/architecture-lab/domain/src/aggregates/WorkItem/index.ts",
    writer: "ts-morph",
  },
  {
    role: "domain",
    stage: "core",
    path: "packages/architecture-lab/domain/src/aggregates/WorkItem/WorkItem.errors.ts",
    writer: "template",
  },
  {
    role: "domain",
    stage: "core",
    path: "packages/architecture-lab/domain/src/aggregates/WorkItem/WorkItem.model.ts",
    writer: "template",
  },
  {
    role: "domain",
    stage: "core",
    path: "packages/architecture-lab/domain/src/aggregates/WorkItem/WorkItem.values.ts",
    writer: "template",
  },
  { role: "domain", stage: "core", path: "packages/architecture-lab/domain/test/WorkItem.test.ts", writer: "template" },
  {
    role: "domain",
    stage: "core",
    path: "packages/architecture-lab/domain/dtslint/WorkItem.tst.ts",
    writer: "template",
  },
  {
    role: "domain",
    stage: "core",
    path: "packages/architecture-lab/domain/src/identity/index.ts",
    writer: "ts-morph",
  },
  {
    role: "domain",
    stage: "core",
    path: "packages/architecture-lab/domain/src/identity/ArchitectureLab.ts",
    writer: "template",
  },
  {
    role: "domain",
    stage: "core",
    path: "packages/architecture-lab/domain/src/entities/index.ts",
    writer: "ts-morph",
  },
  {
    role: "domain",
    stage: "core",
    path: "packages/architecture-lab/domain/src/entities/Worker/index.ts",
    writer: "ts-morph",
  },
  {
    role: "domain",
    stage: "core",
    path: "packages/architecture-lab/domain/src/entities/Worker/Worker.model.ts",
    writer: "template",
  },
  { role: "domain", stage: "core", path: "packages/architecture-lab/domain/test/Worker.test.ts", writer: "template" },
  {
    role: "domain",
    stage: "core",
    path: "packages/architecture-lab/domain/dtslint/Worker.tst.ts",
    writer: "template",
  },
  {
    role: "domain",
    stage: "core",
    path: "packages/architecture-lab/domain/src/values/index.ts",
    writer: "ts-morph",
  },
  {
    role: "domain",
    stage: "core",
    path: "packages/architecture-lab/domain/src/values/WorkPriority/index.ts",
    writer: "ts-morph",
  },
  {
    role: "domain",
    stage: "core",
    path: "packages/architecture-lab/domain/src/values/WorkPriority/WorkPriority.model.ts",
    writer: "template",
  },
  {
    role: "domain",
    stage: "core",
    path: "packages/architecture-lab/domain/src/values/WorkPriority/WorkPriority.behavior.ts",
    writer: "template",
  },
  {
    role: "domain",
    stage: "core",
    path: "packages/architecture-lab/domain/test/WorkPriority.test.ts",
    writer: "template",
  },
  {
    role: "domain",
    stage: "core",
    path: "packages/architecture-lab/domain/dtslint/WorkPriority.tst.ts",
    writer: "template",
  },

  ...rolePackageFiles("use-cases", "core"),
  { role: "use-cases", stage: "core", path: "packages/architecture-lab/use-cases/src/index.ts", writer: "ts-morph" },
  { role: "use-cases", stage: "core", path: "packages/architecture-lab/use-cases/src/public.ts", writer: "ts-morph" },
  { role: "use-cases", stage: "core", path: "packages/architecture-lab/use-cases/src/server.ts", writer: "ts-morph" },
  {
    role: "use-cases",
    stage: "core",
    path: "packages/architecture-lab/use-cases/src/aggregates/WorkItem/index.ts",
    writer: "ts-morph",
  },
  {
    role: "use-cases",
    stage: "core",
    path: "packages/architecture-lab/use-cases/src/aggregates/WorkItem/server.ts",
    writer: "ts-morph",
  },
  {
    role: "use-cases",
    stage: "core",
    path: "packages/architecture-lab/use-cases/src/aggregates/WorkItem/WorkItem.commands.ts",
    writer: "template",
  },
  {
    role: "use-cases",
    stage: "core",
    path: "packages/architecture-lab/use-cases/src/aggregates/WorkItem/WorkItem.errors.ts",
    writer: "template",
  },
  {
    role: "use-cases",
    stage: "core",
    path: "packages/architecture-lab/use-cases/src/aggregates/WorkItem/WorkItem.repository.ts",
    writer: "template",
  },
  {
    role: "use-cases",
    stage: "core",
    path: "packages/architecture-lab/use-cases/src/aggregates/WorkItem/WorkItem.use-cases.ts",
    writer: "template",
  },
  {
    role: "use-cases",
    stage: "core",
    path: "packages/architecture-lab/use-cases/src/aggregates/WorkItem/WorkItem.service.ts",
    writer: "template",
  },
  {
    role: "use-cases",
    stage: "core",
    path: "packages/architecture-lab/use-cases/test/WorkItem.test.ts",
    writer: "template",
  },
  {
    role: "use-cases",
    stage: "core",
    path: "packages/architecture-lab/use-cases/dtslint/WorkItem.tst.ts",
    writer: "template",
  },
  {
    role: "use-cases",
    stage: "core",
    path: "packages/architecture-lab/use-cases/src/entities/index.ts",
    writer: "ts-morph",
  },
  {
    role: "use-cases",
    stage: "core",
    path: "packages/architecture-lab/use-cases/src/entities/Worker/index.ts",
    writer: "ts-morph",
  },
  {
    role: "use-cases",
    stage: "core",
    path: "packages/architecture-lab/use-cases/src/entities/Worker/server.ts",
    writer: "ts-morph",
  },
  {
    role: "use-cases",
    stage: "core",
    path: "packages/architecture-lab/use-cases/src/entities/Worker/Worker.commands.ts",
    writer: "template",
  },
  {
    role: "use-cases",
    stage: "core",
    path: "packages/architecture-lab/use-cases/src/entities/Worker/Worker.errors.ts",
    writer: "template",
  },
  {
    role: "use-cases",
    stage: "core",
    path: "packages/architecture-lab/use-cases/src/entities/Worker/Worker.repository.ts",
    writer: "template",
  },
  {
    role: "use-cases",
    stage: "core",
    path: "packages/architecture-lab/use-cases/src/entities/Worker/Worker.use-cases.ts",
    writer: "template",
  },
  {
    role: "use-cases",
    stage: "core",
    path: "packages/architecture-lab/use-cases/src/entities/Worker/Worker.service.ts",
    writer: "template",
  },
  {
    role: "use-cases",
    stage: "core",
    path: "packages/architecture-lab/use-cases/test/Worker.test.ts",
    writer: "template",
  },
  {
    role: "use-cases",
    stage: "core",
    path: "packages/architecture-lab/use-cases/dtslint/Worker.tst.ts",
    writer: "template",
  },

  ...rolePackageFiles("server", "core"),
  { role: "server", stage: "core", path: "packages/architecture-lab/server/src/index.ts", writer: "ts-morph" },
  { role: "server", stage: "core", path: "packages/architecture-lab/server/src/Layer.ts", writer: "template" },
  { role: "server", stage: "core", path: "packages/architecture-lab/server/src/test.ts", writer: "template" },
  {
    role: "server",
    stage: "core",
    path: "packages/architecture-lab/server/src/aggregates/WorkItem/index.ts",
    writer: "ts-morph",
  },
  {
    role: "server",
    stage: "core",
    path: "packages/architecture-lab/server/src/aggregates/WorkItem/WorkItem.layer.ts",
    writer: "template",
  },
  {
    role: "server",
    stage: "core",
    path: "packages/architecture-lab/server/src/aggregates/WorkItem/WorkItem.repo.ts",
    writer: "template",
  },
  {
    role: "server",
    stage: "core",
    path: "packages/architecture-lab/server/test/WorkItemServer.test.ts",
    writer: "template",
  },
  {
    role: "server",
    stage: "core",
    path: "packages/architecture-lab/server/dtslint/WorkItemServer.tst.ts",
    writer: "template",
  },
  {
    role: "server",
    stage: "persistence",
    path: "packages/architecture-lab/server/test/integration/WorkItemDrizzleRepository.pglite.test.ts",
    writer: "template",
  },
  {
    role: "server",
    stage: "protocol",
    path: "packages/architecture-lab/server/src/aggregates/WorkItem/WorkItem.http.ts",
    writer: "template",
  },
  {
    role: "server",
    stage: "protocol",
    path: "packages/architecture-lab/server/src/aggregates/WorkItem/WorkItem.rpc.ts",
    writer: "template",
  },
  {
    role: "server",
    stage: "protocol",
    path: "packages/architecture-lab/server/src/aggregates/WorkItem/WorkItem.tools.ts",
    writer: "template",
  },
  {
    role: "server",
    stage: "core",
    path: "packages/architecture-lab/server/src/entities/index.ts",
    writer: "ts-morph",
  },
  {
    role: "server",
    stage: "core",
    path: "packages/architecture-lab/server/src/entities/Worker/index.ts",
    writer: "ts-morph",
  },
  {
    role: "server",
    stage: "core",
    path: "packages/architecture-lab/server/src/entities/Worker/Worker.layer.ts",
    writer: "template",
  },
  {
    role: "server",
    stage: "core",
    path: "packages/architecture-lab/server/src/entities/Worker/Worker.repo.ts",
    writer: "template",
  },
  {
    role: "server",
    stage: "core",
    path: "packages/architecture-lab/server/test/WorkerServer.test.ts",
    writer: "template",
  },
  {
    role: "server",
    stage: "core",
    path: "packages/architecture-lab/server/dtslint/WorkerServer.tst.ts",
    writer: "template",
  },

  ...rolePackageFiles("config", "persistence"),
  { role: "config", stage: "persistence", path: "packages/architecture-lab/config/src/index.ts", writer: "ts-morph" },
  { role: "config", stage: "persistence", path: "packages/architecture-lab/config/src/public.ts", writer: "ts-morph" },
  { role: "config", stage: "persistence", path: "packages/architecture-lab/config/src/server.ts", writer: "ts-morph" },
  { role: "config", stage: "persistence", path: "packages/architecture-lab/config/src/secrets.ts", writer: "ts-morph" },
  { role: "config", stage: "persistence", path: "packages/architecture-lab/config/src/layer.ts", writer: "ts-morph" },
  { role: "config", stage: "persistence", path: "packages/architecture-lab/config/src/test.ts", writer: "ts-morph" },
  {
    role: "config",
    stage: "persistence",
    path: "packages/architecture-lab/config/src/aggregates/WorkItem/index.ts",
    writer: "ts-morph",
  },
  {
    role: "config",
    stage: "persistence",
    path: "packages/architecture-lab/config/src/aggregates/WorkItem/WorkItem.config.ts",
    writer: "template",
  },
  {
    role: "config",
    stage: "persistence",
    path: "packages/architecture-lab/config/src/aggregates/WorkItem/WorkItem.layer.ts",
    writer: "template",
  },
  {
    role: "config",
    stage: "persistence",
    path: "packages/architecture-lab/config/test/WorkItemConfig.test.ts",
    writer: "template",
  },
  {
    role: "config",
    stage: "persistence",
    path: "packages/architecture-lab/config/dtslint/WorkItemConfig.tst.ts",
    writer: "template",
  },

  ...rolePackageFiles("tables", "persistence"),
  { role: "tables", stage: "persistence", path: "packages/architecture-lab/tables/src/index.ts", writer: "ts-morph" },
  { role: "tables", stage: "persistence", path: "packages/architecture-lab/tables/src/tables.ts", writer: "template" },
  {
    role: "tables",
    stage: "persistence",
    path: "packages/architecture-lab/tables/src/aggregates/WorkItem/index.ts",
    writer: "ts-morph",
  },
  {
    role: "tables",
    stage: "persistence",
    path: "packages/architecture-lab/tables/src/aggregates/WorkItem/WorkItem.table.ts",
    writer: "template",
  },
  {
    role: "tables",
    stage: "persistence",
    path: "packages/architecture-lab/tables/test/WorkItemTable.test.ts",
    writer: "template",
  },
  {
    role: "tables",
    stage: "persistence",
    path: "packages/architecture-lab/tables/dtslint/WorkItemTable.tst.ts",
    writer: "template",
  },
  {
    role: "tables",
    stage: "persistence",
    path: "packages/architecture-lab/tables/src/entities/index.ts",
    writer: "ts-morph",
  },
  {
    role: "tables",
    stage: "persistence",
    path: "packages/architecture-lab/tables/src/entities/Worker/index.ts",
    writer: "ts-morph",
  },
  {
    role: "tables",
    stage: "persistence",
    path: "packages/architecture-lab/tables/src/entities/Worker/Worker.table.ts",
    writer: "template",
  },
  {
    role: "tables",
    stage: "persistence",
    path: "packages/architecture-lab/tables/test/WorkerTable.test.ts",
    writer: "template",
  },
  {
    role: "tables",
    stage: "persistence",
    path: "packages/architecture-lab/tables/dtslint/WorkerTable.tst.ts",
    writer: "template",
  },

  ...rolePackageFiles("client", "client"),
  { role: "client", stage: "client", path: "packages/architecture-lab/client/src/index.ts", writer: "ts-morph" },
  {
    role: "client",
    stage: "client",
    path: "packages/architecture-lab/client/src/aggregates/WorkItem/index.ts",
    writer: "ts-morph",
  },
  {
    role: "client",
    stage: "client",
    path: "packages/architecture-lab/client/src/aggregates/WorkItem/WorkItem.client.ts",
    writer: "template",
  },
  {
    role: "client",
    stage: "client",
    path: "packages/architecture-lab/client/test/WorkItemClient.test.ts",
    writer: "template",
  },
  {
    role: "client",
    stage: "client",
    path: "packages/architecture-lab/client/dtslint/WorkItemClient.tst.ts",
    writer: "template",
  },

  ...rolePackageFiles("ui", "client"),
  { role: "ui", stage: "client", path: "packages/architecture-lab/ui/src/index.ts", writer: "ts-morph" },
  {
    role: "ui",
    stage: "client",
    path: "packages/architecture-lab/ui/src/aggregates/WorkItem/index.ts",
    writer: "ts-morph",
  },
  {
    role: "ui",
    stage: "client",
    path: "packages/architecture-lab/ui/src/aggregates/WorkItem/WorkItem.view-model.ts",
    writer: "template",
  },
  {
    role: "ui",
    stage: "client",
    path: "packages/architecture-lab/ui/test/WorkItemViewModel.test.ts",
    writer: "template",
  },
  {
    role: "ui",
    stage: "client",
    path: "packages/architecture-lab/ui/dtslint/WorkItemViewModel.tst.ts",
    writer: "template",
  },

  ...rolePackageFiles("proof-app", "client"),
  { role: "proof-app", stage: "client", path: "apps/architecture-lab-proof/src/index.ts", writer: "template" },
  {
    role: "proof-app",
    stage: "client",
    path: "apps/architecture-lab-proof/test/ArchitectureLabProof.test.ts",
    writer: "template",
  },
  {
    role: "proof-app",
    stage: "client",
    path: "apps/architecture-lab-proof/dtslint/ArchitectureLabProof.tst.ts",
    writer: "template",
  },

  ...rolePackageFiles("db-admin", "persistence"),
  { role: "db-admin", stage: "persistence", path: "packages/_internal/db-admin/drizzle.config.ts", writer: "template" },
  { role: "db-admin", stage: "persistence", path: "packages/_internal/db-admin/src/index.ts", writer: "ts-morph" },
  { role: "db-admin", stage: "persistence", path: "packages/_internal/db-admin/src/schema.ts", writer: "ts-morph" },
  { role: "db-admin", stage: "persistence", path: "packages/_internal/db-admin/src/targets.ts", writer: "template" },
  {
    role: "db-admin",
    stage: "persistence",
    path: "packages/_internal/db-admin/src/migrations/ArchitectureLab.ts",
    writer: "template",
  },
  {
    role: "db-admin",
    stage: "persistence",
    path: "packages/_internal/db-admin/drizzle/20260512000000_architecture_lab_work_item/migration.sql",
    writer: "template",
  },
  {
    role: "db-admin",
    stage: "persistence",
    path: "packages/_internal/db-admin/drizzle/20260512001000_architecture_lab_worker_archetype/migration.sql",
    writer: "template",
  },
  {
    role: "db-admin",
    stage: "persistence",
    path: "packages/_internal/db-admin/test/ArchitectureLabMigrationTarget.test.ts",
    writer: "template",
  },
  {
    role: "db-admin",
    stage: "persistence",
    path: "packages/_internal/db-admin/test/integration/ArchitectureLabMigration.pglite.test.ts",
    writer: "template",
  },
  {
    role: "db-admin",
    stage: "persistence",
    path: "packages/_internal/db-admin/dtslint/ArchitectureLabMigrationTarget.tst.ts",
    writer: "template",
  },
];

const legacyFixturePaths = [
  "packages/fixture-lab/specimen",
  "packages/tooling/tool/cli/test/fixtures/repo-architecture-automation",
  "packages/tooling/tool/cli/test/repo-architecture-automation-fixture.test.ts",
] as const;

const normalizeInput = (input: Partial<typeof ArchitecturePlanTarget.Type> = {}): ArchitecturePlanTarget => {
  const boundedContext = input.boundedContext ?? defaultPlanTarget.boundedContext;
  const concept = input.concept ?? defaultPlanTarget.concept;
  const domainKind = input.domainKind ?? defaultPlanTarget.domainKind;
  return new ArchitecturePlanTarget({
    boundedContext,
    concept,
    domainKind,
    conceptPath: `${domainKind}/${CommonStr.pascalCase(concept)}`,
    stage: input.stage ?? defaultPlanTarget.stage,
  });
};

const packageNameForRole = (target: ArchitecturePlanTarget, role: ArchitectureSliceRole): string => {
  if (role === "proof-app") return `@beep/${target.boundedContext}-proof`;
  if (role === "db-admin") return "@beep/db-admin";
  return `@beep/${target.boundedContext}-${role}`;
};

const pathForRole = (target: ArchitecturePlanTarget, role: ArchitectureSliceRole): string => {
  if (role === "proof-app") return `apps/${target.boundedContext}-proof`;
  if (role === "db-admin") return "packages/_internal/db-admin";
  return `packages/${target.boundedContext}/${role}`;
};

const exportsForRole = (target: ArchitecturePlanTarget, role: ArchitectureSliceRole): ReadonlyArray<string> => {
  const conceptExport = `./${target.conceptPath}`;
  if (role === "domain") return [".", `./${target.domainKind}`, conceptExport];
  if (role === "use-cases") return [".", "./public", "./server", conceptExport, `${conceptExport}/server`];
  if (role === "config") return [".", "./public", "./server", "./secrets", "./layer", "./test", conceptExport];
  if (role === "server") return [".", "./layer", "./test", conceptExport];
  if (role === "tables") return [".", "./tables", conceptExport];
  if (role === "client" || role === "ui") return [".", conceptExport];
  return ["."];
};

const rolePlanFor = (target: ArchitecturePlanTarget, role: ArchitectureSliceRole): ArchitectureSliceRolePlan =>
  new ArchitectureSliceRolePlan({
    role,
    packageName: packageNameForRole(target, role),
    path: pathForRole(target, role),
    exports: exportsForRole(target, role),
  });

const isDefaultPlanTarget = (target: ArchitecturePlanTarget): boolean =>
  stringEquivalence(target.boundedContext, defaultPlanTarget.boundedContext) &&
  stringEquivalence(target.concept, defaultPlanTarget.concept) &&
  stringEquivalence(target.domainKind, defaultPlanTarget.domainKind);

const sourceConceptForPath = (sourcePath: string): string => {
  const lowerPath = Str.toLowerCase(sourcePath);
  if (Str.includes("WorkPriority")(sourcePath) || Str.includes("work_priority")(lowerPath)) return "WorkPriority";
  if (Str.includes("WorkItem")(sourcePath) || Str.includes("work_item")(lowerPath)) return "WorkItem";
  if (Str.includes("Worker")(sourcePath) || Str.includes("worker")(lowerPath)) return "Worker";
  return "WorkItem";
};

const sourceDomainKindForPath = (sourcePath: string): O.Option<ArchitectureDomainKind> => {
  const sourceConcept = sourceConceptForPath(sourcePath);
  if (Str.includes("/values/")(sourcePath) || stringEquivalence(sourceConcept, "WorkPriority")) return O.some("values");
  if (Str.includes("/entities/")(sourcePath) || stringEquivalence(sourceConcept, "Worker")) return O.some("entities");
  if (Str.includes("/aggregates/")(sourcePath) || stringEquivalence(sourceConcept, "WorkItem"))
    return O.some("aggregates");
  return O.none();
};

const isPackageScaffoldFile = (sourcePath: string): boolean =>
  pipe(
    [
      "AGENTS.md",
      "LICENSE",
      "README.md",
      "docgen.json",
      "package.json",
      "tsconfig.json",
      "vitest.config.ts",
      "dtslint/.gitkeep",
      "test/.gitkeep",
    ] as const,
    A.some((suffix) => Str.endsWith(suffix)(sourcePath))
  );

const isPackageIndexFile = (sourcePath: string): boolean =>
  pipe(
    [
      "/src/index.ts",
      "/src/public.ts",
      "/src/server.ts",
      "/src/Layer.ts",
      "/src/test.ts",
      "/src/tables.ts",
      "/src/schema.ts",
      "/src/targets.ts",
      "/src/migrations/ArchitectureLab.ts",
      "/drizzle.config.ts",
    ] as const,
    A.some((suffix) => Str.endsWith(suffix)(sourcePath))
  );

const isPackageLevelFile = (sourcePath: string): boolean =>
  isPackageScaffoldFile(sourcePath) || isPackageIndexFile(sourcePath);

const proofFileMatchesDomainKind = (target: ArchitecturePlanTarget, file: AcceptedProofFile): boolean => {
  if (isDefaultPlanTarget(target)) return true;
  if (isPackageLevelFile(file.path)) return true;
  return pipe(
    sourceDomainKindForPath(file.path),
    O.map((domainKind) => stringEquivalence(domainKind, target.domainKind)),
    O.getOrElse(thunkFalse)
  );
};

const sourceConceptPathFor = (sourcePath: string): string =>
  pipe(
    sourceDomainKindForPath(sourcePath),
    O.map((domainKind) => `${domainKind}/${sourceConceptForPath(sourcePath)}`),
    O.getOrElse(() => "aggregates/WorkItem")
  );

const targetPathFor = (sourcePath: string, target: ArchitecturePlanTarget): string => {
  if (isDefaultPlanTarget(target)) return sourcePath;
  const sourceConcept = sourceConceptForPath(sourcePath);
  const sourceConceptPath = sourceConceptPathFor(sourcePath);
  const conceptPascal = CommonStr.pascalCase(target.concept);
  const conceptKebab = CommonStr.kebabCase(target.concept);
  const conceptSnake = CommonStr.snakeCase(target.concept);
  const sourceConceptKebab = CommonStr.kebabCase(sourceConcept);
  const sourceConceptSnake = CommonStr.snakeCase(sourceConcept);
  const contextKebab = CommonStr.kebabCase(target.boundedContext);
  const contextSnake = CommonStr.snakeCase(target.boundedContext);
  if (Str.startsWith("packages/architecture-lab/")(sourcePath)) {
    return pipe(
      sourcePath,
      Str.replace("packages/architecture-lab/", `packages/${target.boundedContext}/`),
      Str.replaceAll("ArchitectureLab", CommonStr.pascalCase(target.boundedContext)),
      Str.replaceAll("architecture_lab", contextSnake),
      Str.replaceAll(sourceConceptPath, target.conceptPath),
      Str.replaceAll(sourceConcept, conceptPascal),
      Str.replaceAll(sourceConceptKebab, conceptKebab),
      Str.replaceAll(sourceConceptSnake, conceptSnake)
    );
  }
  if (Str.startsWith("apps/architecture-lab-proof/")(sourcePath)) {
    return pipe(
      sourcePath,
      Str.replace("apps/architecture-lab-proof/", `apps/${target.boundedContext}-proof/`),
      Str.replaceAll("ArchitectureLab", CommonStr.pascalCase(target.boundedContext)),
      Str.replaceAll(sourceConcept, conceptPascal),
      Str.replaceAll(sourceConceptKebab, conceptKebab),
      Str.replaceAll(sourceConceptSnake, conceptSnake)
    );
  }
  return pipe(
    sourcePath,
    Str.replaceAll("ArchitectureLab", CommonStr.pascalCase(target.boundedContext)),
    Str.replaceAll("architecture-lab", contextKebab),
    Str.replaceAll("architecture_lab", contextSnake),
    Str.replaceAll(sourceConcept, conceptPascal),
    Str.replaceAll(sourceConceptKebab, conceptKebab),
    Str.replaceAll(sourceConceptSnake, conceptSnake)
  );
};

const replacementPairs = (
  target: ArchitecturePlanTarget,
  sourcePath: string
): ReadonlyArray<readonly [string, string]> => {
  const sourceConcept = sourceConceptForPath(sourcePath);
  const sourceConceptPascal = CommonStr.pascalCase(sourceConcept);
  const sourceConceptCamel = CommonStr.camelCase(sourceConcept);
  const sourceConceptKebab = CommonStr.kebabCase(sourceConcept);
  const sourceConceptSnake = CommonStr.snakeCase(sourceConcept);
  const conceptPascal = CommonStr.pascalCase(target.concept);
  const conceptCamel = CommonStr.camelCase(target.concept);
  const conceptKebab = CommonStr.kebabCase(target.concept);
  const conceptSnake = CommonStr.snakeCase(target.concept);
  const contextPascal = CommonStr.pascalCase(target.boundedContext);
  const contextKebab = CommonStr.kebabCase(target.boundedContext);
  const contextSnake = CommonStr.snakeCase(target.boundedContext);

  return [
    ["ARCHITECTURE_LAB", CommonStr.toUpperCase(contextSnake)],
    [CommonStr.toUpperCase(sourceConceptSnake), CommonStr.toUpperCase(conceptSnake)],
    ["ArchitectureLab", contextPascal],
    ["architecture-lab", contextKebab],
    ["architecture_lab", contextSnake],
    ["architecture lab", Str.replaceAll("-", " ")(contextKebab)],
    [sourceConceptPascal, conceptPascal],
    [sourceConceptCamel, conceptCamel],
    [sourceConceptKebab, conceptKebab],
    [sourceConceptSnake, conceptSnake],
  ];
};

const renderAcceptedTemplate = (content: string, target: ArchitecturePlanTarget, sourcePath: string): string =>
  isDefaultPlanTarget(target)
    ? content
    : pipe(
        replacementPairs(target, sourcePath),
        A.reduce(content, (rendered, [from, to]) => Str.replaceAll(from, to)(rendered))
      );

const selectFiles = (
  target: ArchitecturePlanTarget,
  roles: O.Option<ReadonlyArray<ArchitectureSliceRole>> = O.none()
): ReadonlyArray<AcceptedProofFile> =>
  pipe(
    acceptedProofFiles,
    A.filter((file) => roleAllowedForTarget(target, file.role)),
    A.filter((file) => isStageIncluded(target.stage, file.stage)),
    A.filter((file) => proofFileMatchesDomainKind(target, file)),
    A.filter((file) =>
      pipe(
        roles,
        O.map(A.contains(file.role)),
        O.getOrElse(() => true)
      )
    )
  );

const rolePlansForFiles = (
  target: ArchitecturePlanTarget,
  files: ReadonlyArray<AcceptedProofFile>
): ReadonlyArray<ArchitectureSliceRolePlan> =>
  pipe(
    files,
    A.map((file) => file.role),
    A.dedupe,
    A.map((role) => rolePlanFor(target, role))
  );

const validateRequestedRoles = Effect.fn(function* (
  target: ArchitecturePlanTarget,
  roles: O.Option<ReadonlyArray<ArchitectureSliceRole>>
) {
  if (O.isNone(roles)) return;
  const disallowedRoles = pipe(
    roles.value,
    A.filter((role) => !roleAllowedForTarget(target, role))
  );
  if (disallowedRoles.length > 0) {
    return yield* DomainError.newMessage(
      `Architecture ${target.domainKind} concepts do not support role(s): ${disallowedRoles.join(", ")}`
    );
  }
});

const encodeOperationPlanJson = S.encodeUnknownEffect(S.fromJsonString(CanonicalSliceOperationPlan));
const decodeOperationPlanJson = S.decodeUnknownEffect(S.fromJsonString(CanonicalSliceOperationPlan));

/**
 * Build the canonical architecture lab WorkItem operation plan.
 *
 * @returns Schema-versioned operations for the canonical WorkItem proof slice.
 * @category constructors
 * @since 0.0.0
 */
export const makeCanonicalSliceOperationPlan = (): CanonicalSliceOperationPlan =>
  new CanonicalSliceOperationPlan({
    schemaVersion: "architecture-operation-plan/v1",
    target: defaultPlanTarget,
    roles: pipe(
      ["domain", "use-cases", "config", "server", "tables", "client", "ui", "proof-app", "db-admin"] as const,
      A.map((role) => rolePlanFor(defaultPlanTarget, role))
    ),
    operations: [
      ...pipe(
        acceptedProofFiles,
        A.map(
          (file) =>
            new EnsureFileOperation({
              kind: "ensure-file",
              role: file.role,
              path: file.path,
              description: `Ensure ${file.role} ${defaultPlanTarget.concept} topology file exists.`,
            })
        )
      ),
      ...legacyFixturePaths.map(
        (path) =>
          new EnsureAbsentPathOperation({
            kind: "ensure-absent-path",
            path,
            description: "Remove the legacy fixture-lab Specimen proof surface.",
          })
      ),
    ],
  });

/**
 * Build a write-capable operation plan from the accepted WorkItem proof files.
 *
 * @category constructors
 * @since 0.0.0
 */
export const makeArchitectureOperationPlan = Effect.fn(function* (
  repoRoot: string,
  input: Partial<typeof ArchitecturePlanTarget.Type> = {},
  roles: O.Option<ReadonlyArray<ArchitectureSliceRole>> = O.none()
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const target = normalizeInput(input);
  yield* validateRequestedRoles(target, roles);
  const selectedFiles = selectFiles(target, roles);

  const writeOperations = yield* Effect.forEach(selectedFiles, (file) =>
    Effect.gen(function* () {
      const operationPath = targetPathFor(file.path, target);
      const targetFileExists = isPackageLevelFile(file.path)
        ? yield* fs.exists(path.join(repoRoot, operationPath)).pipe(Effect.orElseSucceed(thunkFalse))
        : false;
      const contentPath = targetFileExists ? operationPath : file.path;
      const content = yield* fs
        .readFileString(path.join(repoRoot, contentPath))
        .pipe(
          Effect.mapError((cause) => DomainError.newCause(cause, `Failed to read architecture file "${contentPath}"`))
        );

      return new WriteFileOperation({
        kind: "write-file",
        role: file.role,
        path: operationPath,
        writer: file.writer,
        content: targetFileExists ? content : renderAcceptedTemplate(content, target, file.path),
        description: targetFileExists
          ? `Preserve existing ${file.role} package-level file while planning ${target.concept}.`
          : `Write ${file.role} ${target.concept} file from the accepted architecture proof.`,
      });
    })
  );

  return new CanonicalSliceOperationPlan({
    schemaVersion: "architecture-operation-plan/v1",
    target,
    roles: rolePlansForFiles(target, selectedFiles),
    operations: [
      ...writeOperations,
      ...legacyFixturePaths.map(
        (path) =>
          new EnsureAbsentPathOperation({
            kind: "ensure-absent-path",
            path,
            description: "Remove the legacy fixture-lab Specimen proof surface.",
          })
      ),
    ],
  });
});

/**
 * Encode an operation plan as JSON text.
 *
 * @category codecs
 * @since 0.0.0
 */
export const encodeCanonicalSliceOperationPlanJson = encodeOperationPlanJson;

/**
 * Decode operation-plan JSON text.
 *
 * @category codecs
 * @since 0.0.0
 */
export const decodeCanonicalSliceOperationPlanJson = decodeOperationPlanJson;

const pathExists = Effect.fn(function* (absolutePath: string) {
  const fs = yield* FileSystem.FileSystem;
  return yield* fs.exists(absolutePath).pipe(Effect.orElseSucceed(thunkFalse));
});

/**
 * Validate a decoded operation plan against a repository root.
 *
 * @category utilities
 * @since 0.0.0
 */
export const checkCanonicalSliceOperationPlan: {
  (
    plan: CanonicalSliceOperationPlan
  ): (rootDir: string) => Effect.Effect<OperationPlanCheckResult, DomainError, FileSystem.FileSystem | Path.Path>;
  (
    rootDir: string,
    plan: CanonicalSliceOperationPlan
  ): Effect.Effect<OperationPlanCheckResult, DomainError, FileSystem.FileSystem | Path.Path>;
} = dual(
  2,
  Effect.fn(function* (rootDir: string, plan: CanonicalSliceOperationPlan) {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const missingPaths: Array<string> = [];
    const differingPaths: Array<string> = [];
    const unexpectedPaths: Array<string> = [];

    for (const operation of plan.operations) {
      const operationPath = path.join(rootDir, operation.path);
      const exists = yield* pathExists(operationPath);
      if (operation.kind === "ensure-file" && !exists) {
        missingPaths.push(operation.path);
      }
      if (operation.kind === "ensure-absent-path" && exists) {
        unexpectedPaths.push(operation.path);
      }
      if (operation.kind === "write-file") {
        if (!exists) {
          missingPaths.push(operation.path);
        } else {
          const current = yield* fs
            .readFileString(operationPath)
            .pipe(Effect.mapError((cause) => DomainError.newCause(cause, `Failed to read "${operation.path}"`)));
          if (!stringEquivalence(current, operation.content)) {
            differingPaths.push(operation.path);
          }
        }
      }
    }

    return new OperationPlanCheckResult({
      idempotent: missingPaths.length === 0 && differingPaths.length === 0 && unexpectedPaths.length === 0,
      missingPaths,
      differingPaths,
      unexpectedPaths,
    });
  })
);

/**
 * Apply a decoded operation plan with failsafe conflict behavior.
 *
 * @category utilities
 * @since 0.0.0
 */
export const applyCanonicalSliceOperationPlan: {
  (
    plan: CanonicalSliceOperationPlan
  ): (rootDir: string) => Effect.Effect<OperationPlanApplyResult, DomainError, FileSystem.FileSystem | Path.Path>;
  (
    rootDir: string,
    plan: CanonicalSliceOperationPlan
  ): Effect.Effect<OperationPlanApplyResult, DomainError, FileSystem.FileSystem | Path.Path>;
} = dual(
  2,
  Effect.fn(function* (rootDir: string, plan: CanonicalSliceOperationPlan) {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const writtenPaths: Array<string> = [];
    const skippedPaths: Array<string> = [];
    const removedPaths: Array<string> = [];

    for (const operation of plan.operations) {
      const operationPath = path.join(rootDir, operation.path);
      if (operation.kind === "ensure-file") {
        if (yield* pathExists(operationPath)) {
          skippedPaths.push(operation.path);
        } else {
          return yield* DomainError.newMessage(`Required architecture file is missing: ${operation.path}`);
        }
      }
      if (operation.kind === "ensure-absent-path") {
        if (yield* pathExists(operationPath)) {
          yield* fs
            .remove(operationPath, { force: true, recursive: true })
            .pipe(Effect.mapError((cause) => DomainError.newCause(cause, `Failed to remove "${operation.path}"`)));
          removedPaths.push(operation.path);
        } else {
          skippedPaths.push(operation.path);
        }
      }
      if (operation.kind === "write-file") {
        if (yield* pathExists(operationPath)) {
          const current = yield* fs
            .readFileString(operationPath)
            .pipe(Effect.mapError((cause) => DomainError.newCause(cause, `Failed to read "${operation.path}"`)));
          if (stringEquivalence(current, operation.content)) {
            skippedPaths.push(operation.path);
          } else {
            return yield* DomainError.newMessage(
              `Architecture operation would overwrite a differing file: ${operation.path}`
            );
          }
        } else {
          yield* fs
            .makeDirectory(path.dirname(operationPath), { recursive: true })
            .pipe(
              Effect.mapError((cause) =>
                DomainError.newCause(cause, `Failed to create parent directory for "${operation.path}"`)
              )
            );
          yield* fs
            .writeFileString(operationPath, operation.content)
            .pipe(Effect.mapError((cause) => DomainError.newCause(cause, `Failed to write "${operation.path}"`)));
          writtenPaths.push(operation.path);
        }
      }
    }

    return new OperationPlanApplyResult({ writtenPaths, skippedPaths, removedPaths });
  })
);

const planFileFlag = Flag.string("file").pipe(
  Flag.withAlias("f"),
  Flag.withDescription("Path to a JSON operation plan emitted by `beep architecture plan`")
);

const stageFlag = (defaultValue: ArchitecturePlanStage) =>
  Flag.string("stage").pipe(
    Flag.withDescription("Architecture proof stage: core, persistence, protocol, client, or full"),
    Flag.withDefault(defaultValue)
  );

const domainKindFlag = Flag.string("domain-kind").pipe(
  Flag.withDescription("Domain-kind archetype for the concept: aggregates, entities, or values"),
  Flag.withDefault("aggregates")
);

const dryRunFlag = Flag.boolean("dry-run").pipe(
  Flag.withDescription("Emit the schema-versioned JSON operation plan without writing files")
);

const planSliceFlag = Flag.string("slice").pipe(
  Flag.withDescription("Slice or bounded-context name"),
  Flag.withDefault(defaultPlanTarget.boundedContext)
);

const planConceptFlag = Flag.string("concept").pipe(
  Flag.withDescription("Concept name"),
  Flag.withDefault(defaultPlanTarget.concept)
);

const decodeStage = (value: string): Effect.Effect<ArchitecturePlanStage, DomainError> =>
  S.decodeUnknownEffect(ArchitecturePlanStage)(value).pipe(
    Effect.mapError((cause) => DomainError.newCause(cause, `Invalid architecture stage "${value}"`))
  );

const decodeDomainKind = (value: string): Effect.Effect<ArchitectureDomainKind, DomainError> =>
  S.decodeUnknownEffect(ArchitectureDomainKind)(value).pipe(
    Effect.mapError((cause) => DomainError.newCause(cause, `Invalid architecture domain kind "${value}"`))
  );

const decodeRole = (value: string): Effect.Effect<ArchitectureSliceRole, DomainError> =>
  S.decodeUnknownEffect(ArchitectureSliceRole)(value).pipe(
    Effect.mapError((cause) => DomainError.newCause(cause, `Invalid architecture role "${value}"`))
  );

const makePlanFromCommand = Effect.fn(function* (
  slice: string,
  concept: string,
  domainKindValue: string,
  stageValue: string,
  roles: O.Option<ReadonlyArray<ArchitectureSliceRole>> = O.none()
) {
  const repoRoot = yield* findRepoRoot();
  const domainKind = yield* decodeDomainKind(domainKindValue);
  const stage = yield* decodeStage(stageValue);
  return yield* makeArchitectureOperationPlan(repoRoot, { boundedContext: slice, concept, domainKind, stage }, roles);
});

const printPlanJson = Effect.fn(function* (plan: CanonicalSliceOperationPlan) {
  const json = yield* encodeCanonicalSliceOperationPlanJson(plan);
  yield* Console.log(json);
});

const readOperationPlanFile = Effect.fn(function* (filePath: string) {
  const fs = yield* FileSystem.FileSystem;
  const content = yield* fs.readFileString(filePath);
  return yield* decodeCanonicalSliceOperationPlanJson(content);
});

const reportCheckResult = Effect.fn(function* (result: OperationPlanCheckResult) {
  yield* Console.log(
    `architecture operation-plan idempotent=${result.idempotent} missing=${result.missingPaths.length} differing=${result.differingPaths.length} unexpected=${
      result.unexpectedPaths.length
    }`
  );
});

const reportApplyResult = Effect.fn(function* (result: OperationPlanApplyResult) {
  yield* Console.log(
    `architecture operation-plan apply written=${result.writtenPaths.length} skipped=${result.skippedPaths.length} removed=${result.removedPaths.length}`
  );
});

const ensureIdempotent = Effect.fn(function* (result: OperationPlanCheckResult) {
  if (!result.idempotent) {
    return yield* new DomainError({
      message: Text.joinLines([
        "Architecture operation plan is not idempotent.",
        `missing=${result.missingPaths.join(",")}`,
        `differing=${result.differingPaths.join(",")}`,
        `unexpected=${result.unexpectedPaths.join(",")}`,
      ]),
    });
  }
});

const runWriteCommand = Effect.fn(function* (plan: CanonicalSliceOperationPlan, dryRun: boolean) {
  if (dryRun) {
    yield* printPlanJson(plan);
    return;
  }
  const rootDir = yield* findRepoRoot();
  const result = yield* applyCanonicalSliceOperationPlan(rootDir, plan);
  yield* reportApplyResult(result);
});

const architecturePlanCommand = Command.make(
  "plan",
  {
    slice: planSliceFlag,
    concept: planConceptFlag,
    domainKind: domainKindFlag,
    stage: stageFlag("full"),
  },
  Effect.fn(function* ({ slice, concept, domainKind, stage }) {
    const plan = yield* makePlanFromCommand(slice, concept, domainKind, stage);
    yield* printPlanJson(plan);
  })
).pipe(Command.withDescription("Emit a schema-versioned architecture operation plan as JSON"));

const architectureApplyCommand = Command.make(
  "apply",
  {
    file: planFileFlag,
  },
  Effect.fn(function* ({ file }) {
    const rootDir = yield* findRepoRoot();
    const plan = yield* readOperationPlanFile(file);
    const result = yield* applyCanonicalSliceOperationPlan(rootDir, plan);
    yield* reportApplyResult(result);
  })
).pipe(Command.withDescription("Consume and apply a canonical architecture operation-plan JSON document"));

const architectureCheckCommand = Command.make(
  "check",
  {
    file: planFileFlag,
  },
  Effect.fn(function* ({ file }) {
    const rootDir = yield* findRepoRoot();
    const plan = yield* readOperationPlanFile(file);
    const result = yield* checkCanonicalSliceOperationPlan(rootDir, plan);
    yield* reportCheckResult(result);
    yield* ensureIdempotent(result);
  })
).pipe(Command.withDescription("Validate that a canonical architecture operation plan is idempotent"));

const createSliceCommand = Command.make(
  "slice",
  {
    slice: Argument.string("slice").pipe(Argument.withDescription("Slice or bounded-context name")),
    concept: Argument.string("concept").pipe(Argument.withDescription("Concept name")),
    domainKind: domainKindFlag,
    stage: stageFlag("core"),
    dryRun: dryRunFlag,
  },
  Effect.fn(function* ({ slice, concept, domainKind, stage, dryRun }) {
    const plan = yield* makePlanFromCommand(slice, concept, domainKind, stage);
    yield* runWriteCommand(plan, dryRun);
  })
).pipe(Command.withDescription("Create a canonical slice from the architecture operation-plan factory"));

const addConceptCommand = Command.make(
  "concept",
  {
    slice: Argument.string("slice").pipe(Argument.withDescription("Slice or bounded-context name")),
    concept: Argument.string("concept").pipe(Argument.withDescription("Concept name")),
    domainKind: domainKindFlag,
    stage: stageFlag("core"),
    dryRun: dryRunFlag,
  },
  Effect.fn(function* ({ slice, concept, domainKind, stage, dryRun }) {
    const plan = yield* makePlanFromCommand(slice, concept, domainKind, stage);
    yield* runWriteCommand(plan, dryRun);
  })
).pipe(Command.withDescription("Add a concept through the architecture operation-plan factory"));

const addRoleCommand = Command.make(
  "role",
  {
    slice: Argument.string("slice").pipe(Argument.withDescription("Slice or bounded-context name")),
    concept: Argument.string("concept").pipe(Argument.withDescription("Concept name")),
    role: Argument.string("role").pipe(Argument.withDescription("Architecture role to add")),
    domainKind: domainKindFlag,
    stage: stageFlag("full"),
    dryRun: dryRunFlag,
  },
  Effect.fn(function* ({ slice, concept, role, domainKind, stage, dryRun }) {
    const decodedRole = yield* decodeRole(role);
    const plan = yield* makePlanFromCommand(slice, concept, domainKind, stage, O.some([decodedRole]));
    yield* runWriteCommand(plan, dryRun);
  })
).pipe(Command.withDescription("Add a role through the architecture operation-plan factory"));

const printCreateIndex = Effect.fn(function* () {
  yield* Console.log("architecture create commands: slice");
});

const printAddIndex = Effect.fn(function* () {
  yield* Console.log("architecture add commands: concept, role");
});

const architectureCreateCommand = Command.make("create", {}, printCreateIndex).pipe(
  Command.withDescription("Create canonical architecture parts"),
  Command.withSubcommands([createSliceCommand])
);

const architectureAddCommand = Command.make("add", {}, printAddIndex).pipe(
  Command.withDescription("Add canonical architecture parts"),
  Command.withSubcommands([addConceptCommand, addRoleCommand])
);

const printArchitectureIndex = Effect.fn(function* () {
  yield* Console.log("architecture commands: create, add, plan, apply, check");
});

/**
 * Architecture automation command group.
 *
 * @category commands
 * @since 0.0.0
 */
export const architectureCommand = Command.make("architecture", {}, printArchitectureIndex).pipe(
  Command.withDescription("Schema-versioned architecture operation-plan utilities"),
  Command.withSubcommands([
    architectureCreateCommand,
    architectureAddCommand,
    architecturePlanCommand,
    architectureApplyCommand,
    architectureCheckCommand,
  ])
);
