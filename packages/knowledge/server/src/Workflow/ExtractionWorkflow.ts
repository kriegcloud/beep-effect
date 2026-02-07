import { createHash } from "node:crypto";
import { $KnowledgeServerId } from "@beep/identity/packages";
import type { OntologyParseError, WorkflowNotFoundError } from "@beep/knowledge-domain/errors";
import { ActivityFailedError } from "@beep/knowledge-domain/errors";
import { ExtractionProgressEvent } from "@beep/knowledge-domain/value-objects";
import { DocumentsEntityIds, KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import type * as AiError from "@effect/ai/AiError";
import type * as HttpServerError from "@effect/platform/HttpServerError";
import type * as SqlError from "@effect/sql/SqlError";
import { Activity, Workflow, WorkflowEngine } from "@effect/workflow";
import * as Cause from "effect/Cause";
import * as Context from "effect/Context";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import {
  ExtractionPipeline,
  ExtractionPipelineConfig,
  ExtractionResult,
  type ExtractionResult as ExtractionResultType,
} from "../Extraction/ExtractionPipeline";
import { ProgressStream } from "./ProgressStream";
import { WorkflowPersistence } from "./WorkflowPersistence";

const $I = $KnowledgeServerId.create("Workflow/ExtractionWorkflow");

type ExtractionError = OntologyParseError | HttpServerError.RequestError | AiError.AiError;
type RetryOwner = "activity" | "orchestrator";

export interface ExtractionWorkflowParams {
  readonly documentId: string;
  readonly organizationId: string;
  readonly ontologyId?: string | undefined;
  readonly text: string;
  readonly ontologyContent: string;
  readonly config?: Partial<{
    readonly mergeEntities: boolean;
    readonly enableIncrementalClustering: boolean;
    readonly retryOwner: RetryOwner;
  }>;
}

export interface ExtractionWorkflowShape {
  readonly run: (
    params: ExtractionWorkflowParams
  ) => Effect.Effect<
    ExtractionResultType,
    ExtractionError | ActivityFailedError | WorkflowNotFoundError | SqlError.SqlError
  >;
}

export class ExtractionWorkflow extends Context.Tag($I`ExtractionWorkflow`)<
  ExtractionWorkflow,
  ExtractionWorkflowShape
>() {}

const ACTIVITY_NAMES = {
  runPipeline: "run_extraction_pipeline",
};

const sha256 = (value: string): string => createHash("sha256").update(value).digest("hex");

const resolveOntologyId = (ontologyId: string | undefined) =>
  O.fromNullable(ontologyId).pipe(
    O.map(KnowledgeEntityIds.OntologyId.make),
    O.getOrElse(() => KnowledgeEntityIds.OntologyId.create())
  );

const makePipelineConfig = (params: ExtractionWorkflowParams, ontologyId: KnowledgeEntityIds.OntologyId.Type) =>
  new ExtractionPipelineConfig({
    organizationId: SharedEntityIds.OrganizationId.make(params.organizationId),
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

const emitProgressForStream = Effect.fn("ExtractionWorkflow.emitProgressForStream")(
  function* (
    stream: { readonly emit: (event: ExtractionProgressEvent.Type) => Effect.Effect<void> },
    executionId: KnowledgeEntityIds.WorkflowExecutionId.Type,
    activityName: string,
    status: "started" | "completed" | "failed",
    message: string,
    progress: number
  ) {
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
  },
  Effect.catchAllCause((cause) =>
    Effect.logDebug("Failed to emit progress event").pipe(Effect.annotateLogs({ cause: String(cause) }))
  )
);

const emitProgress = Effect.fn("ExtractionWorkflow.emitProgress")(
  function* (
    progressStream: O.Option<{ readonly emit: (event: ExtractionProgressEvent.Type) => Effect.Effect<void> }>,
    executionId: KnowledgeEntityIds.WorkflowExecutionId.Type,
    activityName: string,
    status: "started" | "completed" | "failed",
    message: string,
    progress: number
  ) {
    return yield* O.match(progressStream, {
      onNone: () => Effect.void,
      onSome: (stream) => emitProgressForStream(stream, executionId, activityName, status, message, progress),
    });
  },
  Effect.catchAllCause((cause) =>
    Effect.logDebug("Failed to emit progress event").pipe(
      Effect.annotateLogs({ cause: String(cause), executionId: "unknown", activityName: "unknown" })
    )
  )
);

const ExtractionEnginePayload = S.Struct({
  documentId: S.String,
  organizationId: S.String,
  ontologyId: S.optional(S.String),
  text: S.String,
  ontologyContent: S.String,
  mergeEntities: S.NullOr(S.Boolean),
  enableIncrementalClustering: S.NullOr(S.Boolean),
  retryOwner: S.Literal("activity", "orchestrator"),
});

const ExtractionEngineWorkflow = Workflow.make({
  name: "knowledge-extraction",
  payload: ExtractionEnginePayload,
  success: ExtractionResult,
  error: S.String,
  idempotencyKey: (payload) =>
    `${payload.documentId}:${sha256(payload.text).slice(0, 12)}:${sha256(payload.ontologyContent).slice(0, 12)}`,
});

const toEnginePayload = (params: ExtractionWorkflowParams) => ({
  documentId: params.documentId,
  organizationId: params.organizationId,
  ontologyId: params.ontologyId,
  text: params.text,
  ontologyContent: params.ontologyContent,
  mergeEntities: params.config?.mergeEntities ?? null,
  enableIncrementalClustering: params.config?.enableIncrementalClustering ?? null,
  retryOwner: params.config?.retryOwner ?? "activity",
});

const serviceEffect = Effect.gen(function* () {
  const maybeWorkflowEngine = yield* Effect.serviceOption(WorkflowEngine.WorkflowEngine);

  const run: ExtractionWorkflowShape["run"] = Effect.fn("ExtractionWorkflow.run")(function* (
    params: ExtractionWorkflowParams
  ) {
    if (O.isNone(maybeWorkflowEngine)) {
      return yield* new ActivityFailedError({
        executionId: KnowledgeEntityIds.WorkflowExecutionId.create(),
        activityName: ACTIVITY_NAMES.runPipeline,
        attempt: 1,
        cause: "WorkflowEngine unavailable",
      });
    }

    return yield* ExtractionEngineWorkflow.execute(toEnginePayload(params)).pipe(
      Effect.provideService(WorkflowEngine.WorkflowEngine, maybeWorkflowEngine.value),
      Effect.catchAllCause(
        (cause) =>
          new ActivityFailedError({
            executionId: KnowledgeEntityIds.WorkflowExecutionId.create(),
            activityName: ACTIVITY_NAMES.runPipeline,
            attempt: 1,
            cause: String(Cause.squash(cause)),
          })
      )
    );
  });

  return ExtractionWorkflow.of({ run });
});

const ExtractionEngineWorkflowLayer = ExtractionEngineWorkflow.toLayer((payload, executionId) =>
  Effect.gen(function* () {
    const pipeline = yield* ExtractionPipeline;
    const persistence = yield* WorkflowPersistence;
    const maybeProgressStream = yield* Effect.serviceOption(ProgressStream);
    const params: ExtractionWorkflowParams = {
      documentId: payload.documentId,
      organizationId: payload.organizationId,
      ontologyId: payload.ontologyId,
      text: payload.text,
      ontologyContent: payload.ontologyContent,
      config: {
        retryOwner: payload.retryOwner,
        ...(payload.mergeEntities === null ? {} : { mergeEntities: payload.mergeEntities }),
        ...(payload.enableIncrementalClustering === null
          ? {}
          : { enableIncrementalClustering: payload.enableIncrementalClustering }),
      },
    };
    const ontologyId = resolveOntologyId(payload.ontologyId);

    yield* persistence
      .createExecution({
        id: executionId,
        organizationId: payload.organizationId,
        workflowType: "extraction",
        input: {
          documentId: payload.documentId,
          organizationId: payload.organizationId,
          ontologyId,
          textLength: Str.length(payload.text),
        },
      })
      .pipe(Effect.catchAll(() => Effect.void));

    yield* persistence.updateExecutionStatus(executionId, "running").pipe(Effect.catchAll(() => Effect.void));
    yield* emitProgress(
      maybeProgressStream,
      executionId,
      ACTIVITY_NAMES.runPipeline,
      "started",
      "Starting extraction pipeline",
      0
    );

    const activity = Activity.make({
      name: `${ACTIVITY_NAMES.runPipeline}:${payload.documentId}`,
      success: ExtractionResult,
      error: S.String,
      execute: pipeline
        .run(payload.text, payload.ontologyContent, makePipelineConfig(params, ontologyId))
        .pipe(Effect.mapError(String)),
    });

    const activityEffect =
      payload.retryOwner === "orchestrator" ? activity.execute : activity.execute.pipe(Activity.retry({ times: 3 }));

    return yield* activityEffect.pipe(
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
      ),
      Effect.tap((result) =>
        persistence
          .updateExecutionStatus(executionId, "completed", {
            output: {
              entityCount: result.stats.entityCount,
              relationCount: result.stats.relationCount,
              mentionCount: result.stats.mentionCount,
              chunkCount: result.stats.chunkCount,
            },
          })
          .pipe(Effect.catchAll(() => Effect.void))
      ),
      Effect.catchAllCause((cause) =>
        persistence
          .updateExecutionStatus(executionId, "failed", {
            error: String(Cause.squash(cause)),
          })
          .pipe(
            Effect.catchAll(() => Effect.void),
            Effect.andThen(Effect.fail(String(Cause.squash(cause))))
          )
      )
    );
  })
);

export const ExtractionWorkflowLive = Layer.effect(ExtractionWorkflow, serviceEffect).pipe(
  Layer.provideMerge(ExtractionEngineWorkflowLayer)
);
