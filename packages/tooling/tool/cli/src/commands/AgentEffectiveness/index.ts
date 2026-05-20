/**
 * Agent-effectiveness command suite.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { DuckDb, DuckDbConnectionOptions } from "@beep/duckdb";
import { $RepoCliId } from "@beep/identity/packages";
import { Phoenix, PhoenixConfigInput } from "@beep/phoenix";
import {
  AGENT_EFFECTIVENESS_PHOENIX_WRITE_CONFIRMATION,
  type AgentEffectivenessAnnotationCheckReport,
  type AgentEffectivenessAnnotationPlan,
  AgentEffectivenessAnnotationPlanInput,
  type AgentEffectivenessDatasetBundle,
  AgentEffectivenessDoctorInput,
  type AgentEffectivenessDoctorReport,
  type AgentEffectivenessError,
  type AgentEffectivenessExperimentBundle,
  AgentEffectivenessPhoenixSyncInput,
  type AgentEffectivenessPhoenixSyncResult,
  type AgentEffectivenessPromptBundle,
  AgentEffectivenessStatus,
  AiMetricsDeployTarget,
  agentEffectivenessAnnotationCheckReportToJson,
  agentEffectivenessAnnotationPlanToJson,
  agentEffectivenessDatasetBundleToJson,
  agentEffectivenessDoctorReportToJson,
  agentEffectivenessExperimentBundleToJson,
  agentEffectivenessPhoenixSyncResultToJson,
  agentEffectivenessPromptBundleToJson,
  DEFAULT_AGENT_EFFECTIVENESS_WORKER_EVAL_REPORT_PATH,
  makeAgentEffectivenessAnnotationCheckReport,
  makeAgentEffectivenessAnnotationPlan,
  makeAgentEffectivenessDatasetBundle,
  makeAgentEffectivenessDoctorReport,
  makeAgentEffectivenessExperimentBundle,
  makeAgentEffectivenessPromptBundle,
  syncAgentEffectivenessPhoenix,
} from "@beep/repo-ai-metrics";
import { A } from "@beep/utils";
import { Console, DateTime, Effect, Layer, Path, pipe } from "effect";
import * as O from "effect/Option";
import { Command, Flag } from "effect/unstable/cli";
import { FetchHttpClient } from "effect/unstable/http";

const $I = $RepoCliId.create("commands/AgentEffectiveness");
void $I;

const defaultAgentEffectivenessDataRoot = ".beep/ai-metrics";
const defaultAgentEffectivenessPhoenixBaseUrl = "https://dankserver.tailc7c348.ts.net:8447";

const jsonFlag = Flag.boolean("json").pipe(Flag.withDescription("Emit machine-readable JSON output"));
const noPhoenixFlag = Flag.boolean("no-phoenix").pipe(
  Flag.withDescription("Skip live Phoenix probes and report Phoenix as unavailable")
);
const targetFlag = Flag.choiceWithValue("target", [
  ["local", AiMetricsDeployTarget.Enum.local],
  ["dankserver", AiMetricsDeployTarget.Enum.dankserver],
]).pipe(
  Flag.withDefault(AiMetricsDeployTarget.Enum.dankserver),
  Flag.withDescription("Agent-effectiveness evidence target")
);
const dataRootFlag = Flag.string("data-root").pipe(
  Flag.withDefault(defaultAgentEffectivenessDataRoot),
  Flag.withDescription("AI metrics data root")
);
const phoenixBaseUrlFlag = Flag.string("phoenix-base-url").pipe(
  Flag.withDefault(defaultAgentEffectivenessPhoenixBaseUrl),
  Flag.withDescription("Read-only Phoenix base URL")
);
const workerEvalReportFlag = Flag.string("worker-eval-report").pipe(
  Flag.withDefault(DEFAULT_AGENT_EFFECTIVENESS_WORKER_EVAL_REPORT_PATH),
  Flag.withDescription("JSDoc worker-eval report or initiative manifest path")
);
const writeFlag = Flag.boolean("write").pipe(
  Flag.withDescription("Perform live Phoenix writes instead of the default dry-run")
);
const confirmPhoenixWriteFlag = Flag.string("confirm-phoenix-write").pipe(
  Flag.withDescription(
    `Confirmation token required for live Phoenix writes: ${AGENT_EFFECTIVENESS_PHOENIX_WRITE_CONFIRMATION}`
  ),
  Flag.optional
);

type AgentEffectivenessProgramError = AgentEffectivenessError;

const runAgentEffectivenessProgram = <A, R>(
  effect: Effect.Effect<A, AgentEffectivenessProgramError, R>
): Effect.Effect<void, AgentEffectivenessProgramError, R> => effect.pipe(Effect.asVoid);

const makeDoctorInput = ({
  dataRoot,
  noPhoenix,
  phoenixBaseUrl,
  target,
  workerEvalReportPath,
}: {
  readonly dataRoot: string;
  readonly noPhoenix: boolean;
  readonly phoenixBaseUrl: string;
  readonly target: AiMetricsDeployTarget;
  readonly workerEvalReportPath: string;
}): AgentEffectivenessDoctorInput =>
  new AgentEffectivenessDoctorInput({
    dataRoot,
    noPhoenix,
    phoenixBaseUrl,
    target,
    workerEvalReportPath,
  });

const provideAgentEffectivenessLayers = Effect.fn("AgentEffectiveness.provideLayers")(function* <A, E, R>({
  dataRoot,
  effect,
}: {
  readonly dataRoot: string;
  readonly effect: Effect.Effect<A, E, R>;
}) {
  const path = yield* Path.Path;
  const duckDbPath = path.resolve(dataRoot, "derived", "ai-metrics.duckdb");
  return yield* Effect.scoped(
    Layer.build(
      Layer.mergeAll(
        DuckDb.makeNodeLayer(new DuckDbConnectionOptions({ databasePath: duckDbPath })),
        FetchHttpClient.layer
      )
    ).pipe(
      Effect.flatMap(
        Effect.fnUntraced(function* (context) {
          return yield* effect.pipe(Effect.provide(context));
        })
      )
    )
  );
});

const provideAgentEffectivenessPhoenixLayers = Effect.fn("AgentEffectiveness.providePhoenixLayers")(function* <
  A,
  E,
  R,
>({
  dataRoot,
  effect,
  phoenixBaseUrl,
}: {
  readonly dataRoot: string;
  readonly effect: Effect.Effect<A, E, R>;
  readonly phoenixBaseUrl: string;
}) {
  const path = yield* Path.Path;
  const duckDbPath = path.resolve(dataRoot, "derived", "ai-metrics.duckdb");
  return yield* Effect.scoped(
    Layer.build(
      Layer.mergeAll(
        DuckDb.makeNodeLayer(new DuckDbConnectionOptions({ databasePath: duckDbPath })),
        FetchHttpClient.layer,
        Phoenix.makeLayer(new PhoenixConfigInput({ baseUrl: phoenixBaseUrl }))
      )
    ).pipe(
      Effect.flatMap(
        Effect.fnUntraced(function* (context) {
          return yield* effect.pipe(Effect.provide(context));
        })
      )
    )
  );
});

const renderDoctorReport = Effect.fn("AgentEffectiveness.renderDoctorReport")(function* (
  report: AgentEffectivenessDoctorReport,
  json: boolean
) {
  if (json) {
    yield* Console.log(yield* agentEffectivenessDoctorReportToJson(report));
    return;
  }

  yield* Console.log(`agent-effectiveness doctor: status=${report.summary.status}`);
  yield* Console.log(`phoenix: ${report.phoenix.status} ${report.phoenix.message}`);
  yield* Console.log(`ai-metrics: ${report.aiMetrics.status} ${report.aiMetrics.message}`);
  yield* Console.log(`jsdoc-worker-eval: ${report.jsdocWorkerEval.status} ${report.jsdocWorkerEval.message}`);
});

const renderAnnotationPlan = Effect.fn("AgentEffectiveness.renderAnnotationPlan")(function* (
  plan: AgentEffectivenessAnnotationPlan,
  json: boolean
) {
  if (json) {
    yield* Console.log(yield* agentEffectivenessAnnotationPlanToJson(plan));
    return;
  }

  yield* Console.log(`agent-effectiveness annotations plan: status=${plan.summary.status}`);
  yield* Console.log(`planned annotations: ${plan.annotations.length}`);
  yield* Console.log(`mutation policy: ${plan.mutationPolicy}`);
});

const renderAnnotationCheck = Effect.fn("AgentEffectiveness.renderAnnotationCheck")(function* (
  report: AgentEffectivenessAnnotationCheckReport,
  json: boolean
) {
  if (json) {
    yield* Console.log(yield* agentEffectivenessAnnotationCheckReportToJson(report));
    return;
  }

  yield* Console.log(`agent-effectiveness annotations check: status=${report.status}`);
  yield* Console.log(`checked annotations: ${report.annotationCount}`);
  yield* Console.log(`findings: ${report.findings.length}`);
});

const renderDatasetBundle = Effect.fn("AgentEffectiveness.renderDatasetBundle")(function* (
  bundle: AgentEffectivenessDatasetBundle,
  json: boolean
) {
  if (json) {
    yield* Console.log(yield* agentEffectivenessDatasetBundleToJson(bundle));
    return;
  }

  yield* Console.log(`agent-effectiveness datasets: ${bundle.datasets.length}`);
  yield* Console.log(`project: ${bundle.projectName}`);
  yield* Console.log(
    `examples: ${pipe(
      bundle.datasets,
      A.reduce(0, (total, dataset) => total + dataset.examples.length)
    )}`
  );
});

const renderPromptBundle = Effect.fn("AgentEffectiveness.renderPromptBundle")(function* (
  bundle: AgentEffectivenessPromptBundle,
  json: boolean
) {
  if (json) {
    yield* Console.log(yield* agentEffectivenessPromptBundleToJson(bundle));
    return;
  }

  yield* Console.log(`agent-effectiveness prompts: ${bundle.prompts.length}`);
  yield* Console.log(`project: ${bundle.projectName}`);
});

const renderExperimentBundle = Effect.fn("AgentEffectiveness.renderExperimentBundle")(function* (
  bundle: AgentEffectivenessExperimentBundle,
  json: boolean
) {
  if (json) {
    yield* Console.log(yield* agentEffectivenessExperimentBundleToJson(bundle));
    return;
  }

  yield* Console.log(`agent-effectiveness experiments: ${bundle.experiments.length}`);
  yield* Console.log(`project: ${bundle.projectName}`);
});

const renderPhoenixSyncResult = Effect.fn("AgentEffectiveness.renderPhoenixSyncResult")(function* (
  result: AgentEffectivenessPhoenixSyncResult,
  json: boolean
) {
  if (json) {
    yield* Console.log(yield* agentEffectivenessPhoenixSyncResultToJson(result));
    return;
  }

  yield* Console.log(`agent-effectiveness phoenix sync: status=${result.status}`);
  yield* Console.log(`dry-run: ${result.dryRun}`);
  yield* Console.log(`mutation policy: ${result.mutationPolicy}`);
  yield* Console.log(`datasets: ${result.datasetCount}`);
  yield* Console.log(`prompts: ${result.promptCount}`);
  yield* Console.log(`experiments: ${result.experimentCount}`);
  yield* Console.log(`annotations: ${result.annotationCount}`);
  yield* Console.log(`skipped annotations: ${result.skippedAnnotationCount}`);
});

const makeDoctorProgram = Effect.fn("AgentEffectiveness.makeDoctorProgram")(function* ({
  dataRoot,
  json,
  noPhoenix,
  phoenixBaseUrl,
  target,
  workerEvalReportPath,
}: {
  readonly dataRoot: string;
  readonly json: boolean;
  readonly noPhoenix: boolean;
  readonly phoenixBaseUrl: string;
  readonly target: AiMetricsDeployTarget;
  readonly workerEvalReportPath: string;
}) {
  const input = makeDoctorInput({ dataRoot, noPhoenix, phoenixBaseUrl, target, workerEvalReportPath });
  const report = yield* provideAgentEffectivenessLayers({
    dataRoot,
    effect: makeAgentEffectivenessDoctorReport(input),
  });
  yield* renderDoctorReport(report, json);
});

const makeAnnotationPlanProgram = Effect.fn("AgentEffectiveness.makeAnnotationPlanProgram")(function* ({
  dataRoot,
  json,
  noPhoenix,
  phoenixBaseUrl,
  target,
  workerEvalReportPath,
}: {
  readonly dataRoot: string;
  readonly json: boolean;
  readonly noPhoenix: boolean;
  readonly phoenixBaseUrl: string;
  readonly target: AiMetricsDeployTarget;
  readonly workerEvalReportPath: string;
}) {
  const doctor = makeDoctorInput({ dataRoot, noPhoenix, phoenixBaseUrl, target, workerEvalReportPath });
  const plan = yield* provideAgentEffectivenessLayers({
    dataRoot,
    effect: makeAgentEffectivenessAnnotationPlan(new AgentEffectivenessAnnotationPlanInput({ doctor })),
  });
  yield* renderAnnotationPlan(plan, json);
});

const makeAnnotationCheckProgram = Effect.fn("AgentEffectiveness.makeAnnotationCheckProgram")(function* ({
  dataRoot,
  json,
  noPhoenix,
  phoenixBaseUrl,
  target,
  workerEvalReportPath,
}: {
  readonly dataRoot: string;
  readonly json: boolean;
  readonly noPhoenix: boolean;
  readonly phoenixBaseUrl: string;
  readonly target: AiMetricsDeployTarget;
  readonly workerEvalReportPath: string;
}) {
  const doctor = makeDoctorInput({ dataRoot, noPhoenix, phoenixBaseUrl, target, workerEvalReportPath });
  const plan = yield* provideAgentEffectivenessLayers({
    dataRoot,
    effect: makeAgentEffectivenessAnnotationPlan(new AgentEffectivenessAnnotationPlanInput({ doctor })),
  });
  const report = makeAgentEffectivenessAnnotationCheckReport(plan);
  yield* renderAnnotationCheck(report, json);
  if (report.status === AgentEffectivenessStatus.Enum.failed) {
    process.exitCode = 1;
  }
});

const makeDatasetBundleProgram = Effect.fn("AgentEffectiveness.makeDatasetBundleProgram")(function* ({
  dataRoot,
  json,
  noPhoenix,
  phoenixBaseUrl,
  target,
  workerEvalReportPath,
}: {
  readonly dataRoot: string;
  readonly json: boolean;
  readonly noPhoenix: boolean;
  readonly phoenixBaseUrl: string;
  readonly target: AiMetricsDeployTarget;
  readonly workerEvalReportPath: string;
}) {
  const input = makeDoctorInput({ dataRoot, noPhoenix, phoenixBaseUrl, target, workerEvalReportPath });
  const report = yield* provideAgentEffectivenessLayers({
    dataRoot,
    effect: makeAgentEffectivenessDoctorReport(input),
  });
  yield* renderDatasetBundle(makeAgentEffectivenessDatasetBundle(report), json);
});

const makePromptBundleProgram = Effect.fn("AgentEffectiveness.makePromptBundleProgram")(function* ({
  json,
}: {
  readonly dataRoot: string;
  readonly json: boolean;
  readonly noPhoenix: boolean;
  readonly phoenixBaseUrl: string;
  readonly target: AiMetricsDeployTarget;
  readonly workerEvalReportPath: string;
}) {
  const generatedAt = yield* DateTime.now.pipe(Effect.map(DateTime.formatIso));
  yield* renderPromptBundle(makeAgentEffectivenessPromptBundle(generatedAt), json);
});

const makeExperimentBundleProgram = Effect.fn("AgentEffectiveness.makeExperimentBundleProgram")(function* ({
  dataRoot,
  json,
  noPhoenix,
  phoenixBaseUrl,
  target,
  workerEvalReportPath,
}: {
  readonly dataRoot: string;
  readonly json: boolean;
  readonly noPhoenix: boolean;
  readonly phoenixBaseUrl: string;
  readonly target: AiMetricsDeployTarget;
  readonly workerEvalReportPath: string;
}) {
  const input = makeDoctorInput({ dataRoot, noPhoenix, phoenixBaseUrl, target, workerEvalReportPath });
  const report = yield* provideAgentEffectivenessLayers({
    dataRoot,
    effect: makeAgentEffectivenessDoctorReport(input),
  });
  const datasetBundle = makeAgentEffectivenessDatasetBundle(report);
  yield* renderExperimentBundle(makeAgentEffectivenessExperimentBundle(datasetBundle), json);
});

const makePhoenixSyncProgram = Effect.fn("AgentEffectiveness.makePhoenixSyncProgram")(function* ({
  confirmPhoenixWrite,
  dataRoot,
  json,
  noPhoenix,
  phoenixBaseUrl,
  target,
  workerEvalReportPath,
  write,
}: {
  readonly confirmPhoenixWrite: O.Option<string>;
  readonly dataRoot: string;
  readonly json: boolean;
  readonly noPhoenix: boolean;
  readonly phoenixBaseUrl: string;
  readonly target: AiMetricsDeployTarget;
  readonly workerEvalReportPath: string;
  readonly write: boolean;
}) {
  const doctor = makeDoctorInput({ dataRoot, noPhoenix, phoenixBaseUrl, target, workerEvalReportPath });
  const result = yield* provideAgentEffectivenessPhoenixLayers({
    dataRoot,
    effect: syncAgentEffectivenessPhoenix(
      new AgentEffectivenessPhoenixSyncInput({
        annotationPlan: new AgentEffectivenessAnnotationPlanInput({ doctor }),
        dryRun: !write,
        ...(O.isSome(confirmPhoenixWrite) ? { confirmToken: confirmPhoenixWrite.value } : {}),
      })
    ),
    phoenixBaseUrl,
  });
  yield* renderPhoenixSyncResult(result, json);
  if (result.status === AgentEffectivenessStatus.Enum.failed) {
    process.exitCode = 1;
  }
});

const doctorCommand = Command.make(
  "doctor",
  {
    dataRoot: dataRootFlag,
    json: jsonFlag,
    noPhoenix: noPhoenixFlag,
    phoenixBaseUrl: phoenixBaseUrlFlag,
    target: targetFlag,
    workerEvalReportPath: workerEvalReportFlag,
  },
  ({ dataRoot, json, noPhoenix, phoenixBaseUrl, target, workerEvalReportPath }) =>
    runAgentEffectivenessProgram(
      makeDoctorProgram({ dataRoot, json, noPhoenix, phoenixBaseUrl, target, workerEvalReportPath })
    )
).pipe(Command.withDescription("Render the local no-mutation agent-effectiveness trust gate"));

const annotationsPlanCommand = Command.make(
  "plan",
  {
    dataRoot: dataRootFlag,
    json: jsonFlag,
    noPhoenix: noPhoenixFlag,
    phoenixBaseUrl: phoenixBaseUrlFlag,
    target: targetFlag,
    workerEvalReportPath: workerEvalReportFlag,
  },
  ({ dataRoot, json, noPhoenix, phoenixBaseUrl, target, workerEvalReportPath }) =>
    runAgentEffectivenessProgram(
      makeAnnotationPlanProgram({ dataRoot, json, noPhoenix, phoenixBaseUrl, target, workerEvalReportPath })
    )
).pipe(Command.withDescription("Render a sanitized local-only Phoenix annotation plan"));

const annotationsCheckCommand = Command.make(
  "check",
  {
    dataRoot: dataRootFlag,
    json: jsonFlag,
    noPhoenix: noPhoenixFlag,
    phoenixBaseUrl: phoenixBaseUrlFlag,
    target: targetFlag,
    workerEvalReportPath: workerEvalReportFlag,
  },
  ({ dataRoot, json, noPhoenix, phoenixBaseUrl, target, workerEvalReportPath }) =>
    runAgentEffectivenessProgram(
      makeAnnotationCheckProgram({ dataRoot, json, noPhoenix, phoenixBaseUrl, target, workerEvalReportPath })
    )
).pipe(Command.withDescription("Check a local annotation plan for schema and privacy safety"));

const annotationsCommand = Command.make(
  "annotations",
  {},
  Effect.fn(function* () {
    yield* Console.log("Agent-effectiveness annotation commands:");
    yield* Console.log("- plan");
    yield* Console.log("- check");
  })
).pipe(
  Command.withDescription("Plan and check local-only agent-effectiveness annotations"),
  Command.withSubcommands([annotationsPlanCommand, annotationsCheckCommand])
);

const datasetsBundleCommand = Command.make(
  "bundle",
  {
    dataRoot: dataRootFlag,
    json: jsonFlag,
    noPhoenix: noPhoenixFlag,
    phoenixBaseUrl: phoenixBaseUrlFlag,
    target: targetFlag,
    workerEvalReportPath: workerEvalReportFlag,
  },
  ({ dataRoot, json, noPhoenix, phoenixBaseUrl, target, workerEvalReportPath }) =>
    runAgentEffectivenessProgram(
      makeDatasetBundleProgram({ dataRoot, json, noPhoenix, phoenixBaseUrl, target, workerEvalReportPath })
    )
).pipe(Command.withDescription("Render the sanitized Phoenix dataset bundle"));

const datasetsCommand = Command.make(
  "datasets",
  {},
  Effect.fn(function* () {
    yield* Console.log("Agent-effectiveness dataset commands:");
    yield* Console.log("- bundle");
  })
).pipe(
  Command.withDescription("Build repo-owned Phoenix dataset specs"),
  Command.withSubcommands([datasetsBundleCommand])
);

const promptsBundleCommand = Command.make(
  "bundle",
  {
    dataRoot: dataRootFlag,
    json: jsonFlag,
    noPhoenix: noPhoenixFlag,
    phoenixBaseUrl: phoenixBaseUrlFlag,
    target: targetFlag,
    workerEvalReportPath: workerEvalReportFlag,
  },
  ({ dataRoot, json, noPhoenix, phoenixBaseUrl, target, workerEvalReportPath }) =>
    runAgentEffectivenessProgram(
      makePromptBundleProgram({ dataRoot, json, noPhoenix, phoenixBaseUrl, target, workerEvalReportPath })
    )
).pipe(Command.withDescription("Render the repo-owned Phoenix prompt bundle"));

const promptsCommand = Command.make(
  "prompts",
  {},
  Effect.fn(function* () {
    yield* Console.log("Agent-effectiveness prompt commands:");
    yield* Console.log("- bundle");
  })
).pipe(
  Command.withDescription("Build repo-owned Phoenix prompt specs"),
  Command.withSubcommands([promptsBundleCommand])
);

const experimentsBundleCommand = Command.make(
  "bundle",
  {
    dataRoot: dataRootFlag,
    json: jsonFlag,
    noPhoenix: noPhoenixFlag,
    phoenixBaseUrl: phoenixBaseUrlFlag,
    target: targetFlag,
    workerEvalReportPath: workerEvalReportFlag,
  },
  ({ dataRoot, json, noPhoenix, phoenixBaseUrl, target, workerEvalReportPath }) =>
    runAgentEffectivenessProgram(
      makeExperimentBundleProgram({ dataRoot, json, noPhoenix, phoenixBaseUrl, target, workerEvalReportPath })
    )
).pipe(Command.withDescription("Render deterministic Phoenix experiment specs"));

const experimentsCommand = Command.make(
  "experiments",
  {},
  Effect.fn(function* () {
    yield* Console.log("Agent-effectiveness experiment commands:");
    yield* Console.log("- bundle");
  })
).pipe(
  Command.withDescription("Build deterministic Phoenix experiment specs"),
  Command.withSubcommands([experimentsBundleCommand])
);

const phoenixSyncCommand = Command.make(
  "sync",
  {
    confirmPhoenixWrite: confirmPhoenixWriteFlag,
    dataRoot: dataRootFlag,
    json: jsonFlag,
    noPhoenix: noPhoenixFlag,
    phoenixBaseUrl: phoenixBaseUrlFlag,
    target: targetFlag,
    workerEvalReportPath: workerEvalReportFlag,
    write: writeFlag,
  },
  ({ confirmPhoenixWrite, dataRoot, json, noPhoenix, phoenixBaseUrl, target, workerEvalReportPath, write }) =>
    runAgentEffectivenessProgram(
      makePhoenixSyncProgram({
        confirmPhoenixWrite,
        dataRoot,
        json,
        noPhoenix,
        phoenixBaseUrl,
        target,
        workerEvalReportPath,
        write,
      })
    )
).pipe(Command.withDescription("Dry-run or confirmed-write agent-effectiveness specs to Phoenix"));

const phoenixCommand = Command.make(
  "phoenix",
  {},
  Effect.fn(function* () {
    yield* Console.log("Agent-effectiveness Phoenix commands:");
    yield* Console.log("- sync");
  })
).pipe(Command.withDescription("Guarded Phoenix sync workflow"), Command.withSubcommands([phoenixSyncCommand]));

/**
 * Agent-effectiveness root command.
 *
 * @example
 * ```ts
 * import { agentEffectivenessCommand } from "@beep/repo-cli/commands/AgentEffectiveness/index"
 * console.log(agentEffectivenessCommand)
 * ```
 * @category commands
 * @since 0.0.0
 */
export const agentEffectivenessCommand = Command.make(
  "agent-effectiveness",
  {},
  Effect.fn(function* () {
    yield* Console.log("Agent-effectiveness commands:");
    yield* Console.log("- doctor");
    yield* Console.log("- annotations plan");
    yield* Console.log("- annotations check");
    yield* Console.log("- datasets bundle");
    yield* Console.log("- prompts bundle");
    yield* Console.log("- experiments bundle");
    yield* Console.log("- phoenix sync");
  })
).pipe(
  Command.withDescription("Inspect and sync AI-agent effectiveness evidence"),
  Command.withSubcommands([
    doctorCommand,
    annotationsCommand,
    datasetsCommand,
    promptsCommand,
    experimentsCommand,
    phoenixCommand,
  ])
);
