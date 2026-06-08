/**
 * Fallow advisory envelope mapping for Yeet quality packets.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { findRepoRoot } from "@beep/repo-utils";
import { LiteralKit, NonNegativeInt } from "@beep/schema";
import { decodeJsoncTextAs } from "@beep/schema/Jsonc";
import { Console, Effect, FileSystem, Order, Path, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { commandTextForStep, RepoRunPlan } from "../../../internal/repo-run/index.js";
import { YeetCommandError } from "../Yeet.errors.js";
import { buildQualityIssueIndex, QualityIssue, QualityIssueIndex, QualityIssueRouting } from "./QualityIssueIndex.js";

const $I = $RepoCliId.create("commands/Yeet/internal/FallowFeedback");

const FallowFeatureFamily = LiteralKit([
  "audit",
  "dead-code",
  "dupes",
  "health",
  "boundaries",
  "flags",
  "security",
  "fix-preview",
]).pipe(
  $I.annoteSchema("FallowFeedbackFeatureFamily", {
    description: "Fallow feature family accepted by Yeet advisory feedback.",
  })
);
const fallowEnvelopeFileNames = A.map(FallowFeatureFamily.Options, (feature) => `${feature}.json`);

const FallowFindingAttribution = LiteralKit(["introduced", "inherited-adjacent", "not-applicable"]).pipe(
  $I.annoteSchema("FallowFeedbackFindingAttribution", {
    description: "Attribution class retained from Fallow advisory envelopes.",
  })
);

const PositiveExitStatus = S.Int.pipe(S.brand("FallowFeedbackPositiveExitStatus"))
  .check(
    S.isGreaterThan(0, {
      message: "Expected a positive process exit status",
      description: "A positive process exit status",
    })
  )
  .pipe(
    $I.annoteSchema("FallowFeedbackPositiveExitStatus", {
      description: "Positive process exit status used by failure Fallow envelopes.",
    })
  );

const FallowAttributionKinds = S.NonEmptyArray(FallowFindingAttribution).pipe(
  $I.annoteSchema("FallowFeedbackAttributionKinds", {
    description: "Non-empty attribution-kind list emitted by Fallow report envelopes.",
  })
);

class FallowAttributionSummary extends S.Class<FallowAttributionSummary>($I`FallowAttributionSummary`)(
  {
    introduced: NonNegativeInt,
    inheritedAdjacent: NonNegativeInt,
    notApplicable: NonNegativeInt,
  },
  $I.annote("FallowAttributionSummary", {
    description: "Finding counts grouped by Fallow attribution class.",
  })
) {}

class FallowFinding extends S.Class<FallowFinding>($I`FallowFinding`)(
  {
    id: S.String,
    featureFamily: FallowFeatureFamily,
    attribution: FallowFindingAttribution,
    parser: S.String,
    subCategory: S.String,
    blocking: S.Literal(false),
    sourceRef: S.String,
  },
  $I.annote("FallowFinding", {
    description: "One normalized Fallow finding carried inside an advisory envelope.",
  })
) {}

class FallowReportPayload extends S.Class<FallowReportPayload>($I`FallowReportPayload`)(
  {
    findingCount: NonNegativeInt,
    findings: S.Array(FallowFinding),
  },
  $I.annote("FallowReportPayload", {
    description: "Successful Fallow advisory report payload.",
  })
) {}

const FallowEnvelopeBaseFields = {
  schemaVersion: S.Literal("fallow-report-envelope/v1"),
  toolVersion: S.String,
  command: S.String,
  subcommand: FallowFeatureFamily,
  baseRef: S.String,
  generatedAt: S.String,
  advisory: S.Boolean,
  dirtyWorktree: S.Boolean,
  reportPath: S.String,
  rawOutputRef: S.String,
  attributionKinds: FallowAttributionKinds,
  findingAttributionSummary: FallowAttributionSummary,
} as const;

class FallowOkEnvelope extends S.Class<FallowOkEnvelope>($I`FallowOkEnvelope`)(
  {
    ...FallowEnvelopeBaseFields,
    status: S.Literal("ok"),
    exitStatus: NonNegativeInt,
    report: FallowReportPayload,
  },
  $I.annote("FallowOkEnvelope", {
    description: "Successful Fallow advisory envelope decoded by Yeet.",
  })
) {}

class FallowToolFailedEnvelope extends S.Class<FallowToolFailedEnvelope>($I`FallowToolFailedEnvelope`)(
  {
    ...FallowEnvelopeBaseFields,
    status: S.Literal("tool-failed"),
    exitStatus: PositiveExitStatus,
    stderrExcerpt: S.String,
  },
  $I.annote("FallowToolFailedEnvelope", {
    description: "Fallow envelope emitted when the tool failed without decodable JSON.",
  })
) {}

class FallowInvalidJsonEnvelope extends S.Class<FallowInvalidJsonEnvelope>($I`FallowInvalidJsonEnvelope`)(
  {
    ...FallowEnvelopeBaseFields,
    status: S.Literal("invalid-json"),
    exitStatus: NonNegativeInt,
    stderrExcerpt: S.String,
  },
  $I.annote("FallowInvalidJsonEnvelope", {
    description: "Fallow envelope emitted when Fallow output cannot be decoded as JSON.",
  })
) {}

class FallowInvalidReportEnvelope extends S.Class<FallowInvalidReportEnvelope>($I`FallowInvalidReportEnvelope`)(
  {
    ...FallowEnvelopeBaseFields,
    status: S.Literal("invalid-report"),
    exitStatus: NonNegativeInt,
    stderrExcerpt: S.String,
  },
  $I.annote("FallowInvalidReportEnvelope", {
    description: "Fallow envelope emitted when decoded JSON does not match the expected report shape.",
  })
) {}

class FallowBaseResolutionFailedEnvelope extends S.Class<FallowBaseResolutionFailedEnvelope>(
  $I`FallowBaseResolutionFailedEnvelope`
)(
  {
    ...FallowEnvelopeBaseFields,
    status: S.Literal("base-resolution-failed"),
    exitStatus: PositiveExitStatus,
    stderrExcerpt: S.String,
  },
  $I.annote("FallowBaseResolutionFailedEnvelope", {
    description: "Fallow envelope emitted when a diff-aware base ref cannot be resolved.",
  })
) {}

type FallowFailureEnvelope =
  | FallowToolFailedEnvelope
  | FallowInvalidJsonEnvelope
  | FallowInvalidReportEnvelope
  | FallowBaseResolutionFailedEnvelope;

const FallowEnvelope = S.Union([
  FallowOkEnvelope,
  FallowToolFailedEnvelope,
  FallowInvalidJsonEnvelope,
  FallowInvalidReportEnvelope,
  FallowBaseResolutionFailedEnvelope,
]).pipe(
  $I.annoteSchema("FallowFeedbackEnvelope", {
    description: "Fallow advisory envelope accepted by Yeet feedback commands.",
  })
);
type FallowEnvelope = typeof FallowEnvelope.Type;

class FallowYeetIssueFixture extends S.Class<FallowYeetIssueFixture>($I`FallowYeetIssueFixture`)(
  {
    id: S.String,
    sourceFeature: FallowFeatureFamily,
    sourceEnvelopeRef: S.String,
    sourceFindingId: S.String,
    tool: S.Literal("fallow"),
    parser: S.String,
    subCategory: S.String,
    blocking: S.Literal(false),
    attribution: FallowFindingAttribution,
  },
  $I.annote("FallowYeetIssueFixture", {
    description: "Expected Yeet issue projection for one Fallow fixture finding.",
  })
) {}

class FallowFixtureDocument extends S.Class<FallowFixtureDocument>($I`FallowFixtureDocument`)(
  {
    schemaVersion: S.Literal("fallow-quality-enforcement/report-fixtures/v1"),
    fixtures: S.NonEmptyArray(FallowEnvelope),
    yeetIssueFixtures: S.NonEmptyArray(FallowYeetIssueFixture),
  },
  $I.annote("FallowFixtureDocument", {
    description: "Checked-in Fallow report envelope fixture document.",
  })
) {}

const decodeFallowEnvelopeJson = S.decodeUnknownEffect(S.fromJsonString(FallowEnvelope));
const decodeFallowFixtureDocumentJsonc = decodeJsoncTextAs(FallowFixtureDocument);
const decodeRepoRunPlanJson = S.decodeUnknownEffect(S.fromJsonString(RepoRunPlan));
const decodeQualityIssueIndexJson = S.decodeUnknownEffect(S.fromJsonString(QualityIssueIndex));
const encodeQualityIssueIndexJson = S.encodeUnknownEffect(S.fromJsonString(QualityIssueIndex));

const readFileText = Effect.fn("YeetFallowFeedback.readFileText")(function* (
  filePath: string
): Effect.fn.Return<string, YeetCommandError, FileSystem.FileSystem> {
  const fs = yield* FileSystem.FileSystem;
  return yield* fs
    .readFileString(filePath)
    .pipe(Effect.mapError(YeetCommandError.new(`Failed to read "${filePath}".`, { file: filePath })));
});

const resolveRepoPath = Effect.fn("YeetFallowFeedback.resolveRepoPath")(function* (
  value: string
): Effect.fn.Return<string, YeetCommandError, Path.Path | FileSystem.FileSystem> {
  const path = yield* Path.Path;
  const repoRoot = yield* findRepoRoot().pipe(
    Effect.mapError(YeetCommandError.new("Failed to locate repository root."))
  );
  return path.isAbsolute(value) ? value : path.join(repoRoot, value);
});

const writeQualityIssueIndex = Effect.fn("YeetFallowFeedback.writeQualityIssueIndex")(function* (
  emitPath: string,
  index: QualityIssueIndex
): Effect.fn.Return<void, YeetCommandError, FileSystem.FileSystem | Path.Path> {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const absoluteEmitPath = yield* resolveRepoPath(emitPath);
  const json = yield* encodeQualityIssueIndexJson(index).pipe(
    Effect.mapError(YeetCommandError.new("Failed to encode Fallow quality issue index."))
  );
  yield* fs
    .makeDirectory(path.dirname(absoluteEmitPath), { recursive: true })
    .pipe(Effect.mapError(YeetCommandError.new(`Failed to create output directory for "${absoluteEmitPath}".`)));
  yield* fs
    .writeFileString(absoluteEmitPath, `${json}\n`)
    .pipe(Effect.mapError(YeetCommandError.new(`Failed to write "${absoluteEmitPath}".`)));
});

const readQualityIssueIndex = Effect.fn("YeetFallowFeedback.readQualityIssueIndex")(function* (
  emitPath: string
): Effect.fn.Return<QualityIssueIndex, YeetCommandError, FileSystem.FileSystem | Path.Path> {
  const absoluteEmitPath = yield* resolveRepoPath(emitPath);
  const text = yield* readFileText(absoluteEmitPath);
  return yield* decodeQualityIssueIndexJson(text).pipe(
    Effect.mapError(YeetCommandError.new(`Failed to decode emitted QualityIssueIndex "${absoluteEmitPath}".`))
  );
});

const fallbackPackageName = "@beep/root" as const;

const routeForFallow = (reason: string): ReadonlyArray<QualityIssueRouting> => [
  QualityIssueRouting.make({ skill: "quality-review-fix-loop", reason }),
];

const sourceFileFromRef = (sourceRef: string): O.Option<string> =>
  pipe(Str.split(sourceRef, "#")[0], O.fromUndefinedOr, O.filter(Str.isNonEmpty));

const categoryForFallow = (feature: typeof FallowFeatureFamily.Type): QualityIssue["category"] =>
  feature === "security" ? "security-audit" : "repo-law";

const severityForFallow = (blocking: boolean): QualityIssue["severity"] => (blocking ? "error" : "warning");

const fallowFindingIssue = (envelope: FallowOkEnvelope, finding: FallowFinding, advisory: boolean): QualityIssue => {
  const blocking = advisory ? false : finding.blocking;
  return QualityIssue.make({
    id: `fallow:${envelope.subcommand}:${finding.id}`,
    category: categoryForFallow(finding.featureFamily),
    subCategory: finding.subCategory,
    severity: severityForFallow(blocking),
    blocking,
    confidence: "structured",
    message: `Fallow ${finding.featureFamily} ${finding.attribution} finding: ${finding.id}.`,
    evidence: [envelope.reportPath, finding.sourceRef],
    packageName: fallbackPackageName,
    ...O.getOrElse(
      pipe(
        sourceFileFromRef(finding.sourceRef),
        O.map((file) => ({ file }))
      ),
      () => ({})
    ),
    sourceAnchor: finding.id,
    tool: "fallow",
    parser: finding.parser,
    attribution: finding.attribution,
    command: envelope.command,
    exitCode: envelope.exitStatus,
    rawOutputRef: envelope.rawOutputRef,
    routing: routeForFallow("Fallow advisory finding"),
  });
};

const fallowFailureIssue = (envelope: FallowFailureEnvelope, advisory: boolean): QualityIssue => {
  const blocking = advisory ? false : envelope.status === "base-resolution-failed" || envelope.status === "tool-failed";
  return QualityIssue.make({
    id: `fallow:${envelope.subcommand}:${envelope.status}`,
    category:
      envelope.status === "invalid-json" || envelope.status === "invalid-report" ? "parser-error" : "command-failure",
    subCategory: `fallow:${envelope.subcommand}:${envelope.status}`,
    severity: severityForFallow(blocking),
    blocking,
    confidence: "partial",
    message: `Fallow ${envelope.subcommand} envelope status ${envelope.status}: ${envelope.stderrExcerpt}`,
    evidence: [envelope.reportPath],
    packageName: fallbackPackageName,
    tool: "fallow",
    parser: `fallow/${envelope.subcommand}/v1`,
    attribution: "not-applicable",
    sourceAnchor: envelope.status,
    command: envelope.command,
    exitCode: envelope.exitStatus,
    rawOutputRef: envelope.rawOutputRef,
    rawExcerpt: envelope.stderrExcerpt,
    routing: routeForFallow("Fallow advisory envelope failure"),
  });
};

const issuesFromEnvelope = (envelope: FallowEnvelope, advisory: boolean): ReadonlyArray<QualityIssue> =>
  envelope.status === "ok"
    ? A.map(envelope.report.findings, (finding) => fallowFindingIssue(envelope, finding, advisory))
    : [fallowFailureIssue(envelope, advisory)];

const issueIndexFromEnvelopes = (envelopes: ReadonlyArray<FallowEnvelope>, advisory: boolean): QualityIssueIndex =>
  buildQualityIssueIndex(
    pipe(
      envelopes,
      A.flatMap((envelope) => issuesFromEnvelope(envelope, advisory))
    )
  );

const assertAdvisoryEnvelopes = Effect.fn("YeetFallowFeedback.assertAdvisoryEnvelopes")(function* (
  envelopes: ReadonlyArray<FallowEnvelope>,
  advisory: boolean
): Effect.fn.Return<void, YeetCommandError> {
  if (!advisory) {
    return;
  }
  const nonAdvisoryRefs = pipe(
    envelopes,
    A.filter((envelope) => !envelope.advisory),
    A.map((envelope) => envelope.reportPath)
  );
  if (!A.isReadonlyArrayEmpty(nonAdvisoryRefs)) {
    return yield* YeetCommandError.make({
      message: `Fallow advisory feedback received non-advisory envelope(s): ${A.join(nonAdvisoryRefs, ", ")}`,
      exitCode: 1,
    });
  }
});

const readEnvelopeFile = Effect.fn("YeetFallowFeedback.readEnvelopeFile")(function* (
  filePath: string
): Effect.fn.Return<FallowEnvelope, YeetCommandError, FileSystem.FileSystem> {
  const text = yield* readFileText(filePath);
  return yield* decodeFallowEnvelopeJson(text).pipe(
    Effect.mapError(YeetCommandError.new(`Failed to decode Fallow envelope "${filePath}".`, { file: filePath }))
  );
});

const envelopePaths = Effect.fn("YeetFallowFeedback.envelopePaths")(function* (
  fromPath: string
): Effect.fn.Return<ReadonlyArray<string>, YeetCommandError, FileSystem.FileSystem | Path.Path> {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const absoluteFromPath = yield* resolveRepoPath(fromPath);
  const entries = yield* fs.readDirectory(absoluteFromPath).pipe(Effect.orElseSucceed(A.empty<string>));
  return pipe(
    entries,
    A.filter((entry) => A.contains(fallowEnvelopeFileNames, entry)),
    A.map((entry) => path.join(absoluteFromPath, entry)),
    A.sort(Order.String)
  );
});

const csvValues = (value: string): ReadonlyArray<string> =>
  pipe(Str.split(value, ","), A.map(Str.trim), A.filter(Str.isNonEmpty));

const spaceValues = (value: string): ReadonlyArray<string> =>
  pipe(Str.split(value, " "), A.map(Str.trim), A.filter(Str.isNonEmpty));

const readEnvelopesFromDirectory = Effect.fn("YeetFallowFeedback.readEnvelopesFromDirectory")(function* (
  fromPath: string
): Effect.fn.Return<ReadonlyArray<FallowEnvelope>, YeetCommandError, FileSystem.FileSystem | Path.Path> {
  const paths = yield* envelopePaths(fromPath);
  return yield* Effect.forEach(paths, readEnvelopeFile, { concurrency: 1 });
});

/**
 * Convert Fallow advisory envelopes from a directory into a Yeet issue index.
 *
 * @category commands
 * @since 0.0.0
 */
export const runYeetFallowFeedback = Effect.fn("YeetFallowFeedback.runYeetFallowFeedback")(function* (options: {
  readonly advisory: boolean;
  readonly emit: string;
  readonly from: string;
}): Effect.fn.Return<void, YeetCommandError, FileSystem.FileSystem | Path.Path> {
  const envelopes = yield* readEnvelopesFromDirectory(options.from);
  yield* assertAdvisoryEnvelopes(envelopes, options.advisory);
  const index = issueIndexFromEnvelopes(envelopes, options.advisory);
  yield* writeQualityIssueIndex(options.emit, index);
  yield* Console.log(`[yeet] Fallow advisory issue index written to ${options.emit}`);
});

const fixtureIssueMatches = (issue: QualityIssue, fixture: FallowYeetIssueFixture): boolean =>
  issue.tool === fixture.tool &&
  issue.parser === fixture.parser &&
  issue.subCategory === fixture.subCategory &&
  issue.blocking === fixture.blocking &&
  issue.attribution === fixture.attribution &&
  issue.sourceAnchor === fixture.sourceFindingId;

const fixtureDiagnostics = (
  index: QualityIssueIndex,
  fixtures: ReadonlyArray<FallowYeetIssueFixture>,
  assertions: ReadonlyArray<string>
): ReadonlyArray<string> => [
  ...(A.contains(assertions, "QualityIssueIndex") && index.schemaVersion !== "yeet-quality-issue-index/v1"
    ? ["emitted document is not a QualityIssueIndex"]
    : []),
  ...(A.contains(assertions, "tool=fallow") && A.some(index.issues, (issue) => issue.tool !== "fallow")
    ? ["expected every issue.tool to be fallow"]
    : []),
  ...(A.contains(assertions, "blocking=false") && A.some(index.issues, (issue) => issue.blocking)
    ? ["expected every Fallow advisory issue to be nonblocking"]
    : []),
  ...(A.contains(assertions, "attribution") && A.some(index.issues, (issue) => issue.attribution === undefined)
    ? ["expected every Fallow issue to carry attribution"]
    : []),
  ...A.flatMap(fixtures, (fixture) =>
    A.some(index.issues, (issue) => fixtureIssueMatches(issue, fixture))
      ? []
      : [`missing Yeet issue fixture projection for ${fixture.id}`]
  ),
];

/**
 * Decode checked-in Fallow fixtures and assert Yeet issue projection invariants.
 *
 * @category commands
 * @since 0.0.0
 */
export const runYeetFallowFixtureCheck = Effect.fn("YeetFallowFeedback.runYeetFallowFixtureCheck")(function* (options: {
  readonly assertions: string;
  readonly emit: string;
  readonly fixturePath: string;
}): Effect.fn.Return<void, YeetCommandError, FileSystem.FileSystem | Path.Path> {
  const absoluteFixturePath = yield* resolveRepoPath(options.fixturePath);
  const fixtureText = yield* readFileText(absoluteFixturePath);
  const document = yield* decodeFallowFixtureDocumentJsonc(fixtureText).pipe(
    Effect.mapError(YeetCommandError.new(`Failed to decode Fallow fixture document "${options.fixturePath}".`))
  );
  yield* assertAdvisoryEnvelopes(document.fixtures, true);
  const index = issueIndexFromEnvelopes(document.fixtures, true);
  yield* writeQualityIssueIndex(options.emit, index);
  const emittedIndex = yield* readQualityIssueIndex(options.emit);
  const diagnostics = fixtureDiagnostics(emittedIndex, document.yeetIssueFixtures, csvValues(options.assertions));
  if (!A.isReadonlyArrayEmpty(diagnostics)) {
    return yield* YeetCommandError.make({
      message: `Fallow fixture check failed:\n${A.join(
        A.map(diagnostics, (diagnostic) => `- ${diagnostic}`),
        "\n"
      )}`,
      exitCode: 1,
    });
  }
  yield* Console.log(`[yeet] Fallow fixture check ok: ${options.fixturePath}`);
});

const readStdinText = Effect.fn("YeetFallowFeedback.readStdinText")(function* (
  fromStdin: boolean
): Effect.fn.Return<string, YeetCommandError> {
  if (!fromStdin) {
    return yield* YeetCommandError.make({
      message: "yeet plan-contract-check requires --from-stdin.",
      exitCode: 1,
    });
  }
  if (process.stdin.isTTY) {
    return yield* YeetCommandError.make({
      message: "yeet plan-contract-check --from-stdin received no stdin.",
      exitCode: 1,
    });
  }
  return yield* Effect.tryPromise(() => Bun.stdin.text()).pipe(
    Effect.mapError((cause) =>
      YeetCommandError.make({
        message: `Failed to read yeet plan stdin: ${cause instanceof Error ? cause.message : String(cause)}`,
        exitCode: 1,
      })
    )
  );
});

const decodePlanText = Effect.fn("YeetFallowFeedback.decodePlanText")(function* (
  text: string
): Effect.fn.Return<RepoRunPlan, YeetCommandError> {
  const jsonText = Str.trim(text);
  return yield* decodeRepoRunPlanJson(jsonText).pipe(
    Effect.mapError(YeetCommandError.new("Failed to decode yeet run plan."))
  );
});

const fallowAdvisoryPrecedenceDiagnostics = (
  plan: RepoRunPlan,
  stepIndex: number,
  step: RepoRunPlan["steps"][number]
): ReadonlyArray<string> => {
  if (step.id !== "advisory:01-fallow-feedback") {
    return [];
  }
  const laterPhaseBeforeAdvisory = pipe(
    plan.steps,
    A.take(stepIndex),
    A.filter((candidate) => candidate.phase === "full" || candidate.phase === "publish"),
    A.map((candidate) => candidate.id)
  );
  return [
    ...(step.phase === "feedback" ? [] : [`expected step phase feedback, got ${step.phase}`]),
    ...(A.isReadonlyArrayEmpty(laterPhaseBeforeAdvisory)
      ? []
      : [
          `expected Fallow advisory feedback before full/publish step(s), got before it: ${A.join(laterPhaseBeforeAdvisory, ", ")}`,
        ]),
  ];
};

/**
 * Assert a named Yeet plan step exists with exact command shape.
 *
 * @category commands
 * @since 0.0.0
 */
export const runYeetPlanContractCheck = Effect.fn("YeetFallowFeedback.runYeetPlanContractCheck")(function* (options: {
  readonly expectArgs: string;
  readonly expectCommand: string;
  readonly expectStepId: string;
  readonly expectStepLabel: string;
  readonly fromStdin: boolean;
}): Effect.fn.Return<void, YeetCommandError> {
  const text = yield* readStdinText(options.fromStdin);
  const plan = yield* decodePlanText(text);
  const step = A.findFirst(plan.steps, (candidate) => candidate.id === options.expectStepId);
  if (O.isNone(step)) {
    return yield* YeetCommandError.make({
      message: `missing yeet plan step ${options.expectStepId}`,
      exitCode: 1,
    });
  }
  const stepIndex = A.findFirstIndex(plan.steps, (candidate) => candidate.id === options.expectStepId);
  const expectedArgs = spaceValues(options.expectArgs);
  const diagnostics = [
    ...(step.value.label === options.expectStepLabel
      ? []
      : [`expected step label ${options.expectStepLabel}, got ${step.value.label}`]),
    ...(step.value.command === options.expectCommand
      ? []
      : [`expected step command ${options.expectCommand}, got ${step.value.command}`]),
    ...(A.join(step.value.args, " ") === A.join(expectedArgs, " ")
      ? []
      : [`expected step args ${A.join(expectedArgs, " ")}, got ${A.join(step.value.args, " ")}`]),
    ...pipe(
      stepIndex,
      O.match({
        onNone: () => [],
        onSome: (index) => fallowAdvisoryPrecedenceDiagnostics(plan, index, step.value),
      })
    ),
  ];
  if (!A.isReadonlyArrayEmpty(diagnostics)) {
    return yield* YeetCommandError.make({
      message: `yeet plan-contract-check failed for ${options.expectStepId}:\n${A.join(
        A.map(diagnostics, (diagnostic) => `- ${diagnostic}`),
        "\n"
      )}`,
      command: commandTextForStep(step.value),
      exitCode: 1,
    });
  }
  yield* Console.log(`[yeet] plan contract ok: ${options.expectStepId}`);
});
