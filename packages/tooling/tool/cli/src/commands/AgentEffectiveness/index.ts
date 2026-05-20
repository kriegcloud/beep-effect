/**
 * Agent-effectiveness command suite.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { DuckDb, DuckDbConnectionOptions } from "@beep/duckdb";
import { $RepoCliId } from "@beep/identity/packages";
import {
  type AgentEffectivenessAnnotationCheckReport,
  type AgentEffectivenessAnnotationPlan,
  AgentEffectivenessAnnotationPlanInput,
  AgentEffectivenessDoctorInput,
  type AgentEffectivenessDoctorReport,
  type AgentEffectivenessError,
  AiMetricsDeployTarget,
  agentEffectivenessAnnotationCheckReportToJson,
  agentEffectivenessAnnotationPlanToJson,
  agentEffectivenessDoctorReportToJson,
  makeAgentEffectivenessAnnotationCheckReport,
  makeAgentEffectivenessAnnotationPlan,
  makeAgentEffectivenessDoctorReport,
} from "@beep/repo-ai-metrics";
import { Console, Effect, Layer, Path } from "effect";
import { Command, Flag } from "effect/unstable/cli";
import { FetchHttpClient } from "effect/unstable/http";

const $I = $RepoCliId.create("commands/AgentEffectiveness");
void $I;

const defaultAgentEffectivenessDataRoot = ".beep/ai-metrics";
const defaultAgentEffectivenessPhoenixBaseUrl = "https://dankserver.tailc7c348.ts.net:8447";
const defaultAgentEffectivenessWorkerEvalReport =
  "initiatives/jsdoc-worker-eval/history/outputs/2026-05-16-runpod-ollama-qwen3-coder-30b-worker-eval-10-packet.json";

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
  Flag.withDefault(defaultAgentEffectivenessWorkerEvalReport),
  Flag.withDescription("JSDoc worker-eval JSON report path")
);

type AgentEffectivenessProgramError = AgentEffectivenessError;

const runAgentEffectivenessProgram = <A, R>(
  effect: Effect.Effect<A, AgentEffectivenessProgramError, R>
): Effect.Effect<void, never, R> =>
  effect.pipe(
    Effect.catchTags({
      AgentEffectivenessError: Effect.fn(function* (error) {
        process.exitCode = 1;
        yield* Console.error(`agent-effectiveness: ${error.message}`);
      }),
    }),
    Effect.asVoid
  );

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
  })
).pipe(
  Command.withDescription("Inspect local AI-agent effectiveness evidence without mutating Phoenix"),
  Command.withSubcommands([doctorCommand, annotationsCommand])
);
