/**
 * Architecture command wiring.
 *
 * @packageDocumentation
 * @category cli-commands
 * @since 0.0.0
 */

import { DomainError, findRepoRoot } from "@beep/repo-utils";
import { Text } from "@beep/utils";
import { Console, Effect, FileSystem } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { Argument, Command, Flag } from "effect/unstable/cli";
import {
  ArchitectureDomainKind,
  ArchitecturePackageRole,
  ArchitecturePlanStage,
  ArchitectureSliceRole,
  applyCanonicalSliceOperationPlan,
  type CanonicalSliceOperationPlan,
  checkCanonicalSliceOperationPlan,
  decodeCanonicalSliceOperationPlanJson,
  encodeCanonicalSliceOperationPlanJson,
  makeArchitectureOperationPlan,
  makeArchitecturePackageOperationPlan,
  type OperationPlanApplyResult,
  type OperationPlanCheckResult,
} from "./OperationPlan.js";

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
  Flag.withDefault("architecture-lab")
);

const planConceptFlag = Flag.string("concept").pipe(Flag.withDescription("Concept name"), Flag.withDefault("WorkItem"));

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

const decodePackageRole = (value: string): Effect.Effect<ArchitecturePackageRole, DomainError> =>
  S.decodeUnknownEffect(ArchitecturePackageRole)(value).pipe(
    Effect.mapError((cause) =>
      DomainError.newCause(
        cause,
        `Invalid architecture package role "${value}". Supported package roles: domain, use-cases, config, server, tables, client, ui`
      )
    )
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

const makePackagePlanFromCommand = Effect.fn(function* (slice: string, roleValue: string) {
  const role = yield* decodePackageRole(roleValue);
  return yield* makeArchitecturePackageOperationPlan({ boundedContext: slice, role });
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

const createPackageCommand = Command.make(
  "package",
  {
    slice: Argument.string("slice").pipe(Argument.withDescription("Slice or bounded-context name")),
    role: Argument.string("role").pipe(Argument.withDescription("Slice package role to create")),
    dryRun: dryRunFlag,
  },
  Effect.fn(function* ({ slice, role, dryRun }) {
    const plan = yield* makePackagePlanFromCommand(slice, role);
    yield* runWriteCommand(plan, dryRun);
  })
).pipe(Command.withDescription("Create a shell-only canonical slice role package"));

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
  yield* Console.log("architecture create commands: slice, package");
});

const printAddIndex = Effect.fn(function* () {
  yield* Console.log("architecture add commands: concept, role");
});

const architectureCreateCommand = Command.make("create", {}, printCreateIndex).pipe(
  Command.withDescription("Create canonical architecture parts"),
  Command.withSubcommands([createSliceCommand, createPackageCommand])
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
