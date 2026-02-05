import { $KnowledgeServerId } from "@beep/identity/packages";
import type { ActivityFailedError, OntologyParseError, WorkflowNotFoundError } from "@beep/knowledge-domain/errors";
import { ExtractionProgressEvent } from "@beep/knowledge-domain/value-objects";
import { DocumentsEntityIds, KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import type * as AiError from "@effect/ai/AiError";
import type * as HttpServerError from "@effect/platform/HttpServerError";
import type * as SqlError from "@effect/sql/SqlError";
import * as Context from "effect/Context";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Str from "effect/String";
import { ExtractionPipeline, ExtractionPipelineConfig, type ExtractionResult } from "../Extraction/ExtractionPipeline";
import { DurableActivities } from "./DurableActivities";
import { ProgressStream } from "./ProgressStream";
import { WorkflowPersistence } from "./WorkflowPersistence";

const $I = $KnowledgeServerId.create("Workflow/ExtractionWorkflow");

type ExtractionError = OntologyParseError | HttpServerError.RequestError | AiError.AiError;

export interface ExtractionWorkflowParams {
  readonly documentId: string;
  readonly organizationId: string;
  readonly ontologyId?: string | undefined;
  readonly text: string;
  readonly ontologyContent: string;
  readonly config?: Partial<{
    readonly mergeEntities: boolean;
    readonly enableIncrementalClustering: boolean;
  }>;
}

export interface ExtractionWorkflowShape {
  readonly run: (
    params: ExtractionWorkflowParams
  ) => Effect.Effect<
    ExtractionResult,
    ExtractionError | ActivityFailedError | WorkflowNotFoundError | SqlError.SqlError
  >;
}

export class ExtractionWorkflow extends Context.Tag($I`ExtractionWorkflow`)<
  ExtractionWorkflow,
  ExtractionWorkflowShape
>() {}

const ACTIVITY_NAMES = {
  runPipeline: "run_extraction_pipeline",
} as const;

const emitProgress = (
  progressStream: O.Option<{ readonly emit: (event: ExtractionProgressEvent.Type) => Effect.Effect<void> }>,
  executionId: KnowledgeEntityIds.WorkflowExecutionId.Type,
  activityName: string,
  status: "started" | "completed" | "failed",
  message: string,
  progress: number
) =>
  O.match(progressStream, {
    onNone: () => Effect.void,
    onSome: (stream) =>
      Effect.gen(function* () {
        const now = yield* DateTime.now;
        yield* stream.emit(
          new ExtractionProgressEvent({
            executionId,
            activityName,
            status,
            progress,
            message,
            timestamp: now,
          })
        );
      }).pipe(
        Effect.catchAllCause((cause) =>
          Effect.logDebug("Failed to emit progress event").pipe(
            Effect.annotateLogs({ cause: String(cause), executionId, activityName })
          )
        )
      ),
  });

const serviceEffect = Effect.gen(function* () {
  const pipeline = yield* ExtractionPipeline;
  const persistence = yield* WorkflowPersistence;
  const durableActivities = yield* DurableActivities;
  const maybeProgressStream = yield* Effect.serviceOption(ProgressStream);

  const run: ExtractionWorkflowShape["run"] = Effect.fn("ExtractionWorkflow.run")(function* (
    params: ExtractionWorkflowParams
  ) {
    const executionId = KnowledgeEntityIds.WorkflowExecutionId.create();
    const organizationId = params.organizationId;

    const ontologyId = O.fromNullable(params.ontologyId).pipe(
      O.map(KnowledgeEntityIds.OntologyId.make),
      O.getOrElse(() => KnowledgeEntityIds.OntologyId.create())
    );

    yield* Effect.logInfo("ExtractionWorkflow: creating execution").pipe(
      Effect.annotateLogs({ executionId, documentId: params.documentId })
    );

    yield* persistence.createExecution({
      id: executionId,
      organizationId,
      workflowType: "extraction",
      input: {
        documentId: params.documentId,
        organizationId,
        ontologyId,
        textLength: Str.length(params.text),
      },
    });

    yield* persistence.updateExecutionStatus(executionId, "running");

    yield* emitProgress(
      maybeProgressStream,
      executionId,
      ACTIVITY_NAMES.runPipeline,
      "started",
      "Starting extraction pipeline",
      0
    );

    const config = new ExtractionPipelineConfig({
      organizationId: SharedEntityIds.OrganizationId.make(organizationId),
      ontologyId,
      documentId: DocumentsEntityIds.DocumentId.make(params.documentId),
      sourceUri: O.none(),
      chunkingConfig: O.none(),
      mentionMinConfidence: O.none(),
      entityMinConfidence: O.none(),
      relationMinConfidence: O.none(),
      entityBatchSize: O.none(),
      mergeEntities: O.fromNullable(params.config?.mergeEntities),
      enableIncrementalClustering: O.fromNullable(params.config?.enableIncrementalClustering),
    });

    const result = yield* durableActivities
      .runActivity(
        executionId,
        organizationId,
        ACTIVITY_NAMES.runPipeline,
        pipeline.run(params.text, params.ontologyContent, config)
      )
      .pipe(
        Effect.tap(() =>
          emitProgress(
            maybeProgressStream,
            executionId,
            ACTIVITY_NAMES.runPipeline,
            "completed",
            "Extraction pipeline completed",
            1
          )
        ),
        Effect.tapError(() =>
          emitProgress(
            maybeProgressStream,
            executionId,
            ACTIVITY_NAMES.runPipeline,
            "failed",
            "Extraction pipeline failed",
            0
          )
        )
      );

    const outputRecord: Record<string, unknown> = {
      entityCount: result.stats.entityCount,
      relationCount: result.stats.relationCount,
      mentionCount: result.stats.mentionCount,
      chunkCount: result.stats.chunkCount,
    };

    yield* persistence.updateExecutionStatus(executionId, "completed", {
      output: outputRecord,
    });

    yield* Effect.logInfo("ExtractionWorkflow: execution completed").pipe(
      Effect.annotateLogs({
        executionId,
        entityCount: result.stats.entityCount,
        relationCount: result.stats.relationCount,
      })
    );

    return result;
  });

  const runWithErrorRecovery: ExtractionWorkflowShape["run"] = (params) =>
    run(params).pipe(
      Effect.catchTag("ActivityFailedError", (err) =>
        persistence.updateExecutionStatus(err.executionId, "failed", { error: err.message }).pipe(
          Effect.catchAllCause((cause) =>
            Effect.logWarning("Failed to record workflow failure status").pipe(
              Effect.annotateLogs({ cause: String(cause), executionId: err.executionId })
            )
          ),
          Effect.andThen(Effect.fail(err))
        )
      )
    );

  return ExtractionWorkflow.of({ run: runWithErrorRecovery });
});

export const ExtractionWorkflowLive = Layer.effect(ExtractionWorkflow, serviceEffect);
