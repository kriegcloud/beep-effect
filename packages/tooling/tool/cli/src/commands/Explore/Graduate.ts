/**
 * `beep explore graduate`: compile one reviewed graduation plan.
 *
 * **Details**
 *
 * Workstream E-3b ships the plan half of graduation. A read-only
 * {@link readExplorationSnapshot} captures the exploration manifest and the
 * goal fleet; {@link compileGraduationPlan} is a pure function of that
 * snapshot and the requested children. Each child is compiled by the existing
 * bootstrap compiler with exploration provenance, so there is one bootstrap
 * compiler. Publishing (`--write --expect`) is E-3c.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import { Argument, Command, Flag } from "effect/cli";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import { dual, pipe } from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import * as O from "effect/Option";
import * as Path from "effect/Path";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { failWithReportedExit } from "../../internal/cli/ExitCodeError.ts";
import { optionalProp } from "../../internal/cli/OptionRecord.ts";
import { BootstrapInput } from "../Goals/Bootstrap.schemas.ts";
import { compileMaterializationPlan, planTodayFlag, reportCompiledPlan, resolveToday } from "../Goals/Bootstrap.ts";
import { GoalPlanInputError, GoalPlanOperationalError } from "../Goals/Goals.errors.ts";
import { listGoalPackets, parseGoalManifestText } from "../Goals/Inventory.ts";
import { PacketSlug } from "../Goals/PacketCore/PacketCore.schemas.ts";
import {
  canonicalJsonText,
  canonicalJsonTextPretty,
  sha256Hex,
  sha256HexBytes,
} from "../Goals/PacketCore/PacketDigest.ts";
import { ExplorationManifest, ExplorationStage, ExplorationStatus } from "./Atlas.ts";
import {
  ExistingGoalPacket,
  ExplorationManifestEdit,
  ExplorationSnapshot,
  GraduationChildInput,
  GraduationConflict,
  GraduationPlan,
  GraduationPublishedChild,
  GraduationRequest,
} from "./Graduate.schemas.ts";
import type * as Crypto from "effect/Crypto";
import type * as PlatformError from "effect/PlatformError";
import type { MaterializationPlan } from "../Goals/Bootstrap.schemas.ts";

const $I = $RepoCliId.create("commands/Explore/Graduate");

const EXPLORATIONS_DIR = "explorations";
const GRADUATE_LOG_PREFIX = "[explore:graduate]";

const decodeExplorationSlug = S.decodeUnknownEffect(PacketSlug);
const decodeChildInput = S.decodeUnknownEffect(GraduationChildInput);
const decodeManifestText = S.decodeUnknownOption(S.fromJsonString(ExplorationManifest));
const encodeGraduationPlan = S.encodeUnknownEffect(GraduationPlan);

class GoalProvenanceProbe extends S.Class<GoalProvenanceProbe>($I`GoalProvenanceProbe`)(
  { provenance: S.Struct({ exploration: S.String }) },
  $I.annote("GoalProvenanceProbe", {
    description: "The provenance.exploration field a graduated goal manifest records.",
  })
) {}

const decodeProvenance = S.decodeUnknownOption(GoalProvenanceProbe);

type ConflictRow = typeof GraduationConflict.Encoded;
type EditRow = typeof ExplorationManifestEdit.Encoded;

const conflictRow = (reason: ConflictRow["reason"], message: string, child?: string): ConflictRow =>
  child === undefined ? { reason, message } : { reason, child, message };

const provenanceOf = (manifestText: O.Option<string>): O.Option<string> =>
  pipe(
    manifestText,
    O.flatMap(parseGoalManifestText),
    O.flatMap(decodeProvenance),
    O.map((probe) => probe.provenance.exploration)
  );

const readOptionalBytes = Effect.fn("Explore.readOptionalManifestBytes")(function* (filePath: string) {
  const fs = yield* FileSystem.FileSystem;
  return yield* fs.readFile(filePath).pipe(
    Effect.asSome,
    Effect.catchIf(
      (error) => error.reason._tag === "NotFound",
      () => Effect.succeedNone
    ),
    Effect.mapError(GoalPlanOperationalError.new(`Failed to read "${filePath}".`))
  );
});

/**
 * Captures one exploration manifest and the goal fleet as a decoded value.
 *
 * **Details**
 *
 * Only read members of `FileSystem` are called. A missing exploration or
 * manifest is not an error: the snapshot records it and the pure compiler
 * turns it into a plan conflict. Manifest bytes are digested raw so the later
 * writer can pin them. Each goal packet's `provenance.exploration` is read
 * from its manifest, which is how a replay recognizes its own children.
 *
 * **Example** (Build the snapshot effect)
 *
 * ```ts
 * import { readExplorationSnapshot } from "@beep/repo-cli/commands/Explore"
 * import * as Effect from "effect/Effect"
 *
 * console.log(Effect.isEffect(readExplorationSnapshot("typed-agent-skill-contracts"))) // true
 * ```
 *
 * @param exploration - Exploration slug under `explorations/`.
 * @param repoRoot - Repository root the `explorations/` and `goals/` trees resolve against.
 * @returns The read-only snapshot the pure graduation compiler consumes.
 * @category use-cases
 * @since 0.0.0
 */
export const readExplorationSnapshot = Effect.fn("Explore.readExplorationSnapshot")(function* (
  exploration: PacketSlug,
  repoRoot = "."
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const explorationPath = path.join(repoRoot, EXPLORATIONS_DIR, exploration);
  const info = yield* fs.stat(explorationPath).pipe(
    Effect.asSome,
    Effect.catchIf(
      (error) => error.reason._tag === "NotFound",
      () => Effect.succeedNone
    ),
    Effect.mapError(GoalPlanOperationalError.new(`Failed to stat "${explorationPath}".`))
  );
  const exists = O.exists(info, (value) => value.type === "Directory");
  const bytes = exists
    ? yield* readOptionalBytes(path.join(explorationPath, "ops", "manifest.json"))
    : O.none<Uint8Array>();
  const manifestDigest = yield* O.match(bytes, {
    onNone: () => Effect.succeedNone,
    onSome: (value) => Effect.asSome(sha256HexBytes(value)),
  }).pipe(Effect.mapError(GoalPlanOperationalError.new(`Failed to digest the manifest of "${explorationPath}".`)));
  const records = yield* listGoalPackets(repoRoot);
  const goals = A.map(records, (record) =>
    ExistingGoalPacket.make({
      slug: record.slug,
      ...optionalProp("provenanceExploration", provenanceOf(O.fromUndefinedOr(record.manifestText))),
    })
  );
  return ExplorationSnapshot.make({
    exploration,
    manifestPath: `${EXPLORATIONS_DIR}/${exploration}/ops/manifest.json`,
    exists,
    ...optionalProp(
      "manifestText",
      O.map(bytes, (value) => new TextDecoder().decode(value))
    ),
    ...optionalProp("manifestDigest", manifestDigest),
    goals,
  });
});

const explorationConflicts = (
  snapshot: ExplorationSnapshot,
  manifest: O.Option<ExplorationManifest>
): ReadonlyArray<ConflictRow> => {
  const explorationPath = `${EXPLORATIONS_DIR}/${snapshot.exploration}`;
  if (!snapshot.exists) {
    return [conflictRow("exploration-not-found", `Exploration "${explorationPath}" does not exist.`)];
  }
  return O.match(manifest, {
    onNone: () => [
      conflictRow("manifest-undecodable", `Manifest "${snapshot.manifestPath}" is missing or does not decode.`),
    ],
    onSome: ({ exploration }) =>
      exploration.slug !== snapshot.exploration
        ? [
            conflictRow(
              "manifest-undecodable",
              `Manifest "${snapshot.manifestPath}" names slug "${exploration.slug}", not "${snapshot.exploration}".`
            ),
          ]
        : ExplorationStatus.is.graduated(exploration.status) || ExplorationStatus.is.killed(exploration.status)
          ? [
              conflictRow(
                "exploration-closed",
                `Exploration "${explorationPath}" is already ${exploration.status}; graduation is refused.`
              ),
            ]
          : [],
  });
};

interface ChildClassification {
  readonly accepted: ReadonlyArray<GraduationChildInput>;
  readonly conflicts: ReadonlyArray<ConflictRow>;
  readonly pending: ReadonlyArray<GraduationChildInput>;
  readonly published: ReadonlyArray<GraduationChildInput>;
  readonly seen: HashSet.HashSet<string>;
}

const classifyChildren = (
  snapshot: ExplorationSnapshot,
  children: ReadonlyArray<GraduationChildInput>
): ChildClassification => {
  const provenance = `${EXPLORATIONS_DIR}/${snapshot.exploration}`;
  const goals = HashMap.fromIterable(A.map(snapshot.goals, (goal) => [goal.slug, goal] as const));
  return A.reduce(
    children,
    {
      seen: HashSet.empty<string>(),
      pending: A.empty<GraduationChildInput>(),
      published: A.empty<GraduationChildInput>(),
      accepted: A.empty<GraduationChildInput>(),
      conflicts: A.empty<ConflictRow>(),
    } satisfies ChildClassification,
    (state, child): ChildClassification => {
      if (HashSet.has(state.seen, child.slug)) {
        return {
          ...state,
          conflicts: A.append(
            state.conflicts,
            conflictRow("duplicate-child", `Child "${child.slug}" is requested more than once.`, child.slug)
          ),
        };
      }
      const seen = HashSet.add(state.seen, child.slug);
      return O.match(HashMap.get(goals, child.slug), {
        onNone: () => ({
          ...state,
          seen,
          pending: A.append(state.pending, child),
          accepted: A.append(state.accepted, child),
        }),
        onSome: (existing) =>
          existing.provenanceExploration === provenance
            ? {
                ...state,
                seen,
                published: A.append(state.published, child),
                accepted: A.append(state.accepted, child),
              }
            : {
                ...state,
                seen,
                conflicts: A.append(
                  state.conflicts,
                  conflictRow(
                    "foreign-slug",
                    `Packet "goals/${child.slug}" already exists without provenance "${provenance}"; it belongs to another packet.`,
                    child.slug
                  )
                ),
              },
      });
    }
  );
};

const childBootstrapInput = (exploration: string, today: string) => (child: GraduationChildInput) =>
  BootstrapInput.make({
    slug: child.slug,
    title: child.title,
    mission: `${child.title} (graduated from ${EXPLORATIONS_DIR}/${exploration}).`,
    provenanceExploration: exploration,
    today,
  });

const editRow = (
  snapshot: ExplorationSnapshot,
  manifest: ExplorationManifest,
  digest: string,
  appendCandidates: ReadonlyArray<GraduationChildInput>,
  today: string
): EditRow => {
  const linked = HashSet.fromIterable(manifest.exploration.links?.goals ?? A.empty<string>());
  return {
    path: snapshot.manifestPath,
    preImageDigest: digest,
    status: ExplorationStatus.Enum.graduated,
    stage: ExplorationStage.Enum.graduate,
    updated: today,
    appendGoals: pipe(
      appendCandidates,
      A.map((child) => `goals/${child.slug}`),
      A.filter((goal) => !HashSet.has(linked, goal))
    ),
  };
};

/**
 * Compiles a graduation request into a content-addressed plan.
 *
 * **Details**
 *
 * A total function of the snapshot and request. Refusals are data: the
 * exploration missing, undecodable, or already `graduated`/`killed`; no
 * children; a repeated child; a child slug owned by a foreign packet; or a
 * child plan that is itself conflicted. A requested child that exists with
 * this exploration's provenance is `alreadyPublished`, not a conflict, so a
 * crashed graduation resumes by re-running the same command. The plan id is
 * the SHA-256 of the canonical JSON of the children's plan ids, in request
 * order, and the plain edit row.
 *
 * **Example** (Build the compile effect for a missing exploration)
 *
 * ```ts
 * import { compileGraduationPlan, ExplorationSnapshot, GraduationRequest } from "@beep/repo-cli/commands/Explore"
 * import * as Effect from "effect/Effect"
 *
 * const snapshot = ExplorationSnapshot.make({
 *   exploration: "missing-idea",
 *   manifestPath: "explorations/missing-idea/ops/manifest.json",
 *   exists: false,
 *   goals: [],
 * })
 * const program = compileGraduationPlan(snapshot, GraduationRequest.make({ children: [], today: "2026-10-13" }))
 * console.log(Effect.isEffect(program)) // true
 * ```
 *
 * @param snapshot - Read-only capture of the exploration manifest and goal fleet.
 * @param request - Requested children and the explicit plan date.
 * @returns Effect yielding the sealed plan; conflicts list every refusal.
 * @category use-cases
 * @since 0.0.0
 */
export const compileGraduationPlan: {
  (
    snapshot: ExplorationSnapshot,
    request: GraduationRequest
  ): Effect.Effect<GraduationPlan, PlatformError.PlatformError, Crypto.Crypto>;
  (
    request: GraduationRequest
  ): (snapshot: ExplorationSnapshot) => Effect.Effect<GraduationPlan, PlatformError.PlatformError, Crypto.Crypto>;
} = dual(
  2,
  Effect.fnUntraced(function* (snapshot: ExplorationSnapshot, request: GraduationRequest) {
    const manifest = O.flatMap(O.fromUndefinedOr(snapshot.manifestText), decodeManifestText);
    const classification = classifyChildren(snapshot, request.children);
    const existingSlugs = A.map(snapshot.goals, (goal) => goal.slug);
    const children = yield* Effect.forEach(classification.pending, (child) =>
      compileMaterializationPlan(childBootstrapInput(snapshot.exploration, request.today)(child), existingSlugs)
    );
    const childConflicts = A.flatMap(children, (plan: MaterializationPlan) =>
      A.map(plan.conflicts, (conflict) =>
        conflictRow("child-conflicted", `Child plan "${plan.slug}" is conflicted: ${conflict.message}`, plan.slug)
      )
    );
    const noGoals = A.isReadonlyArrayEmpty(request.children)
      ? [conflictRow("no-goals", "Pass at least one --goal <slug>=<title>.")]
      : [];
    const conflicts = [
      ...explorationConflicts(snapshot, manifest),
      ...noGoals,
      ...classification.conflicts,
      ...childConflicts,
    ];
    const edit = pipe(
      O.all({ manifest, digest: O.fromUndefinedOr(snapshot.manifestDigest) }),
      O.filter(({ manifest: decoded }) => decoded.exploration.slug === snapshot.exploration),
      O.map(({ manifest: decoded, digest }) =>
        editRow(snapshot, decoded, digest, classification.accepted, request.today)
      )
    );
    const preimage = canonicalJsonText({
      schemaVersion: "graduation-plan/v1",
      exploration: snapshot.exploration,
      children: A.map(children, (plan) => plan.planId),
      explorationEdit: O.getOrNull(edit),
    });
    return GraduationPlan.make({
      planId: `graduation-plan/v1:${yield* sha256Hex(preimage)}`,
      exploration: snapshot.exploration,
      children,
      ...optionalProp("explorationEdit", O.map(edit, ExplorationManifestEdit.make)),
      alreadyPublished: A.map(classification.published, (child) =>
        GraduationPublishedChild.make({ slug: child.slug, packetPath: `goals/${child.slug}` })
      ),
      conflicts: A.map(conflicts, (row) => GraduationConflict.make(row)),
    });
  })
);

/**
 * Renders a graduation plan as canonical pretty JSON.
 *
 * **Example** (Render an empty conflicted plan)
 *
 * ```ts
 * import { GraduationPlan, renderGraduationPlanJson } from "@beep/repo-cli/commands/Explore"
 * import * as Effect from "effect/Effect"
 *
 * const plan = GraduationPlan.make({
 *   planId: "graduation-plan/v1:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
 *   exploration: "missing-idea",
 *   children: [],
 *   alreadyPublished: [],
 *   conflicts: [],
 * })
 * console.log(Effect.isEffect(renderGraduationPlanJson(plan))) // true
 * ```
 *
 * @param plan - The sealed graduation plan.
 * @returns Effect yielding canonical pretty JSON with a trailing newline.
 * @category formatting
 * @since 0.0.0
 */
export const renderGraduationPlanJson: (plan: GraduationPlan) => Effect.Effect<string, S.SchemaError> =
  Effect.fnUntraced(function* (plan: GraduationPlan) {
    return canonicalJsonTextPretty(yield* encodeGraduationPlan(plan));
  });

/**
 * Renders a graduation plan for local human inspection.
 *
 * **Example** (Render the headline)
 *
 * ```ts
 * import { GraduationPlan, renderGraduationPlanHuman } from "@beep/repo-cli/commands/Explore"
 *
 * const plan = GraduationPlan.make({
 *   planId: "graduation-plan/v1:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
 *   exploration: "missing-idea",
 *   children: [],
 *   alreadyPublished: [],
 *   conflicts: [],
 * })
 * console.log(renderGraduationPlanHuman(plan).startsWith("plan-id:")) // true
 * ```
 *
 * @param plan - The sealed graduation plan.
 * @returns One line per child, published child, edit field, and conflict, under headline counts.
 * @category formatting
 * @since 0.0.0
 */
export const renderGraduationPlanHuman = (plan: GraduationPlan): string => {
  const editLines = pipe(
    O.fromUndefinedOr(plan.explorationEdit),
    O.match({
      onNone: () => ["exploration edit: none"],
      onSome: (edit) => [
        `exploration edit: ${edit.path} (pre-image ${edit.preImageDigest})`,
        `  status=${edit.status} stage=${edit.stage} updated=${edit.updated}`,
        `  append links.goals: ${A.isReadonlyArrayEmpty(edit.appendGoals) ? "(none)" : A.join(edit.appendGoals, ", ")}`,
      ],
    })
  );
  return A.join(
    [
      `plan-id: ${plan.planId}`,
      `exploration: ${EXPLORATIONS_DIR}/${plan.exploration}`,
      `children (${A.length(plan.children)})`,
      ...A.map(plan.children, (child) => `  ${child.packetPath} ${child.planId} (${A.length(child.entries)} entries)`),
      `already published (${A.length(plan.alreadyPublished)})`,
      ...A.map(plan.alreadyPublished, (child) => `  ${child.packetPath}`),
      ...editLines,
      `conflicts (${A.length(plan.conflicts)})`,
      ...A.map(plan.conflicts, (conflict) => `  ${conflict.reason}: ${conflict.message}`),
    ],
    "\n"
  );
};

/**
 * Decodes one `--goal <slug>=<title>` value.
 *
 * **Details**
 *
 * The text splits at the first `=`; a title may itself contain `=`. The slug
 * must satisfy the goal-packet grammar and the title must be non-empty.
 *
 * **Example** (Decode a goal flag)
 *
 * ```ts
 * import { parseGraduationGoal } from "@beep/repo-cli/commands/Explore"
 * import * as Effect from "effect/Effect"
 *
 * console.log(Effect.isEffect(parseGraduationGoal("skill-contract-gates=Skill Contract Gates"))) // true
 * ```
 *
 * @param raw - The flag text, `slug=title`.
 * @returns Effect yielding the decoded child, or a plan input error naming the flag.
 * @category parsing
 * @since 0.0.0
 */
export const parseGraduationGoal = Effect.fn("Explore.parseGraduationGoal")(function* (raw: string) {
  const [slug = "", ...titleParts] = Str.split("=")(raw);
  if (A.isReadonlyArrayEmpty(titleParts)) {
    return yield* GoalPlanInputError.new(`--goal "${raw}" is not <slug>=<title>.`);
  }
  return yield* decodeChildInput({ slug: Str.trim(slug), title: Str.trim(A.join(titleParts, "=")) }).pipe(
    Effect.mapError((issue) => GoalPlanInputError.new(`--goal "${raw}" is invalid: ${issue.message}`))
  );
});

const reportGraduationPlan = (plan: GraduationPlan, json: boolean) =>
  reportCompiledPlan({
    json,
    renderJson: renderGraduationPlanJson(plan),
    renderHuman: () => renderGraduationPlanHuman(plan),
    conflictCount: A.length(plan.conflicts),
    label: "explore graduate",
  });

const decodeExplorationSnapshotSlug = (raw: string) =>
  decodeExplorationSlug(raw).pipe(
    Effect.mapError((issue) => GoalPlanInputError.new(`exploration "${raw}" is invalid: ${issue.message}`))
  );

const runGraduatePlan = Effect.fn("Explore.runGraduatePlan")(function* (options: {
  readonly exploration: string;
  readonly goals: ReadonlyArray<string>;
  readonly today: O.Option<string>;
  readonly plan: boolean;
  readonly json: boolean;
}) {
  if (!options.plan) {
    return yield* GoalPlanInputError.new(
      "Pass --plan to review the graduation plan; --write --expect <planId> lands in E-3c."
    );
  }
  const exploration = yield* decodeExplorationSnapshotSlug(options.exploration);
  const children = yield* Effect.forEach(options.goals, parseGraduationGoal);
  const today = yield* resolveToday(options.today);
  const snapshot = yield* readExplorationSnapshot(exploration);
  const plan = yield* compileGraduationPlan(snapshot, GraduationRequest.make({ children, today })).pipe(
    Effect.mapError(GoalPlanOperationalError.new("Failed to digest the graduation plan."))
  );
  yield* reportGraduationPlan(plan, options.json);
});

const explorationArgument = Argument.String("exploration").pipe(
  Argument.withDescription("Exploration slug under explorations/")
);
const goalFlag = Flag.String("goal").pipe(
  Flag.withDescription("Child goal to graduate, as <slug>=<title>; repeat for each child"),
  Flag.atLeast(0)
);
const planFlag = Flag.Boolean("plan").pipe(
  Flag.withDefault(false),
  Flag.withDescription("Compile and print the graduation plan for review (required until E-3c)")
);
const jsonFlag = Flag.Boolean("json").pipe(
  Flag.withDefault(false),
  Flag.withDescription("Print the plan as canonical JSON")
);

const failGraduate = Effect.fn(function* (error: GoalPlanInputError | GoalPlanOperationalError) {
  yield* Console.error(`${GRADUATE_LOG_PREFIX} ${error.message}`);
  return yield* failWithReportedExit(`explore graduate: ${error.message}`);
});

/**
 * `bun run beep explore graduate` — compile an exploration graduation plan.
 *
 * **Example** (Log command name)
 *
 * ```ts
 * import { exploreGraduateCommand } from "@beep/repo-cli/commands/Explore"
 *
 * console.log(exploreGraduateCommand.name) // "graduate"
 * ```
 *
 * @category cli-commands
 * @since 0.0.0
 */
export const exploreGraduateCommand = Command.make(
  "graduate",
  {
    exploration: explorationArgument,
    goals: goalFlag,
    today: planTodayFlag,
    plan: planFlag,
    json: jsonFlag,
  },
  Effect.fn(function* (options) {
    return yield* runGraduatePlan(options).pipe(
      Effect.catchTags({ GoalPlanInputError: failGraduate, GoalPlanOperationalError: failGraduate })
    );
  })
).pipe(
  Command.withDescription(
    "Compile an exploration graduation plan: one bootstrap plan per --goal plus the manifest flip (--plan --json)"
  )
);
