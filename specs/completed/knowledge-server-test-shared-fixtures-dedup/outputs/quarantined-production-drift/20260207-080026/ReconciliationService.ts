import { $KnowledgeServerId } from "@beep/identity/packages";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { Storage, type StoredValue } from "./Storage";
import {
  type WikidataApiError,
  type WikidataCandidate,
  WikidataClient,
  type WikidataRateLimitError,
} from "./WikidataClient";

const $I = $KnowledgeServerId.create("Service/ReconciliationService");

export class ReconciliationError extends S.TaggedError<ReconciliationError>()("ReconciliationError", {
  message: S.String,
  entityIri: S.String,
  cause: S.optional(S.Defect),
}) {}

export class ReconciliationConfig extends S.Class<ReconciliationConfig>($I`ReconciliationConfig`)({
  autoLinkThreshold: S.optionalWith(S.Number.pipe(S.between(0, 100)), { default: () => 90 }),
  queueThreshold: S.optionalWith(S.Number.pipe(S.between(0, 100)), { default: () => 50 }),
  maxCandidates: S.optionalWith(S.PositiveInt, { default: () => 5 }),
  language: S.optionalWith(S.String, { default: () => "en" }),
}) {}

export type ReconciliationDecision = "auto_linked" | "queued" | "no_match" | "skipped";

export interface ReconciliationResult {
  readonly entityIri: string;
  readonly label: string;
  readonly decision: ReconciliationDecision;
  readonly candidates: ReadonlyArray<WikidataCandidate>;
  readonly bestMatch?: WikidataCandidate;
  readonly verificationTaskId?: string;
}

export const VerificationTaskSchema = S.Struct({
  id: S.String,
  entityIri: S.String,
  label: S.String,
  candidates: S.Array(
    S.Struct({
      qid: S.String,
      label: S.String,
      description: S.optional(S.String),
      url: S.optional(S.String),
      score: S.Number.pipe(S.between(0, 100)),
    })
  ),
  createdAtMs: S.NonNegativeInt,
  status: S.Literal("pending", "approved", "rejected"),
  approvedQid: S.optional(S.String),
});

export type VerificationTask = S.Schema.Type<typeof VerificationTaskSchema>;

export const WikidataLinkSchema = S.Struct({
  entityIri: S.String,
  qid: S.String,
  wikidataUri: S.String,
  linkedAtMs: S.NonNegativeInt,
});

export type WikidataLink = S.Schema.Type<typeof WikidataLinkSchema>;

const decodeTask = S.decodeUnknown(S.parseJson(VerificationTaskSchema));
const decodeLink = S.decodeUnknown(S.parseJson(WikidataLinkSchema));

const LINKS_PREFIX = "reconciliation/links/";
const QUEUE_PREFIX = "reconciliation/queue/";

const linkKey = (entityIri: string): string => `${LINKS_PREFIX}${encodeURIComponent(entityIri)}`;
const taskKey = (taskId: string): string => `${QUEUE_PREFIX}${taskId}`;

const generateTaskId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return `task-${timestamp}-${random}`;
};

const wikidataUriForQid = (qid: string): string => `http://www.wikidata.org/entity/${qid}`;

export interface ReconciliationServiceShape {
  readonly reconcileEntity: (
    entityIri: string,
    label: string,
    types?: ReadonlyArray<string>,
    config?: ReconciliationConfig
  ) => Effect.Effect<ReconciliationResult, ReconciliationError | WikidataApiError | WikidataRateLimitError>;

  readonly listPendingTasks: () => Effect.Effect<ReadonlyArray<VerificationTask>, ReconciliationError>;
  readonly getTask: (taskId: string) => Effect.Effect<O.Option<VerificationTask>, ReconciliationError>;
  readonly approveTask: (taskId: string, qid: string) => Effect.Effect<O.Option<VerificationTask>, ReconciliationError>;
  readonly rejectTask: (taskId: string) => Effect.Effect<O.Option<VerificationTask>, ReconciliationError>;

  readonly getLink: (entityIri: string) => Effect.Effect<O.Option<WikidataLink>, ReconciliationError>;
}

export class ReconciliationService extends Context.Tag($I`ReconciliationService`)<
  ReconciliationService,
  ReconciliationServiceShape
>() {}

const serviceEffect: Effect.Effect<ReconciliationServiceShape, never, Storage | WikidataClient> = Effect.gen(function* () {
  const storage = yield* Storage;
  const wikidata = yield* WikidataClient;

  const getLink: ReconciliationServiceShape["getLink"] = (entityIri) =>
    storage.get(linkKey(entityIri)).pipe(
      Effect.flatMap(
        O.match({
          onNone: () => Effect.succeed(O.none()),
          onSome: (stored) =>
            decodeLink(stored.value).pipe(
              Effect.map(O.some),
              Effect.mapError(
                (cause) =>
                  new ReconciliationError({
                    message: `Failed to decode stored link JSON: ${String(cause)}`,
                    entityIri,
                    cause,
                  })
              )
            ),
        })
      )
    );

  const storeLink = (entityIri: string, qid: string): Effect.Effect<WikidataLink, ReconciliationError> =>
    Effect.gen(function* () {
      const link: WikidataLink = {
        entityIri,
        qid,
        wikidataUri: wikidataUriForQid(qid),
        linkedAtMs: Date.now(),
      };

      yield* storage.put(linkKey(entityIri), JSON.stringify(link)).pipe(
        Effect.mapError(
          (cause) =>
            new ReconciliationError({
              message: `Failed to store link: ${String(cause)}`,
              entityIri,
              cause,
            })
        )
      );

      return link;
    });

  const queueTask = (
    entityIri: string,
    label: string,
    candidates: ReadonlyArray<WikidataCandidate>
  ): Effect.Effect<string, ReconciliationError> =>
    Effect.gen(function* () {
      const id = generateTaskId();
      const task: VerificationTask = {
        id,
        entityIri,
        label,
        candidates: A.map(candidates, (c) => ({
          qid: c.qid,
          label: c.label,
          description: c.description,
          url: c.url,
          score: c.score,
        })),
        createdAtMs: Date.now(),
        status: "pending",
      };

      yield* storage.put(taskKey(id), JSON.stringify(task)).pipe(
        Effect.mapError(
          (cause) =>
            new ReconciliationError({
              message: `Failed to store verification task: ${String(cause)}`,
              entityIri,
              cause,
            })
        )
      );

      return id;
    });

  const reconcileEntity: ReconciliationServiceShape["reconcileEntity"] = (
    entityIri,
    label,
    _types = [],
    config = new ReconciliationConfig({})
  ) =>
    Effect.gen(function* () {
      const existing = yield* getLink(entityIri);
      if (O.isSome(existing)) {
        yield* Effect.logDebug("ReconciliationService: entity already linked").pipe(Effect.annotateLogs({ entityIri }));
        return {
          entityIri,
          label,
          decision: "skipped" as const,
          candidates: [],
        };
      }

      const candidates = yield* wikidata.searchEntities(label, {
        language: config.language,
        limit: config.maxCandidates,
      });

      if (A.isEmptyReadonlyArray(candidates)) {
        return {
          entityIri,
          label,
          decision: "no_match" as const,
          candidates: [],
        };
      }

      const best = candidates[0];

      if (best.score >= config.autoLinkThreshold) {
        yield* storeLink(entityIri, best.qid);
        return {
          entityIri,
          label,
          decision: "auto_linked" as const,
          candidates,
          bestMatch: best,
        };
      }

      if (best.score >= config.queueThreshold) {
        const taskId = yield* queueTask(entityIri, label, candidates);
        return {
          entityIri,
          label,
          decision: "queued" as const,
          candidates,
          bestMatch: best,
          verificationTaskId: taskId,
        };
      }

      return {
        entityIri,
        label,
        decision: "no_match" as const,
        candidates,
        bestMatch: best,
      };
    }).pipe(
      Effect.withSpan("ReconciliationService.reconcileEntity", {
        captureStackTrace: false,
        attributes: { entityIri, labelLength: Str.length(label) },
      })
    );

  const decodeStoredTask = (
    entityIri: string,
    stored: StoredValue
  ): Effect.Effect<VerificationTask, ReconciliationError> =>
    decodeTask(stored.value).pipe(
      Effect.mapError(
        (cause) =>
          new ReconciliationError({
            message: `Failed to decode verification task JSON: ${String(cause)}`,
            entityIri,
            cause,
          })
      )
    );

  const getTask: ReconciliationServiceShape["getTask"] = (taskId) =>
    storage.get(taskKey(taskId)).pipe(
      Effect.flatMap(
        O.match({
          onNone: () => Effect.succeed(O.none()),
          onSome: (stored) => decodeStoredTask(stored.key, stored).pipe(Effect.map(O.some)),
        })
      )
    );

  const listPendingTasks: ReconciliationServiceShape["listPendingTasks"] = () =>
    storage.list(QUEUE_PREFIX).pipe(
      Effect.flatMap((stored) => Effect.forEach(stored, (entry) => decodeStoredTask(entry.key, entry), { concurrency: 10 })),
      Effect.map((tasks) => A.filter(tasks, (t) => t.status === "pending"))
    );

  const updateTask = (
    taskId: string,
    f: (task: VerificationTask) => VerificationTask
  ): Effect.Effect<O.Option<VerificationTask>, ReconciliationError> =>
    Effect.gen(function* () {
      const maybeStored = yield* storage.get(taskKey(taskId));
      if (O.isNone(maybeStored)) return O.none();

      const stored = maybeStored.value;
      const task = yield* decodeStoredTask(stored.key, stored);
      const updated = f(task);

      const next = yield* storage.put(taskKey(taskId), JSON.stringify(updated), { expectedGeneration: stored.generation }).pipe(
        Effect.mapError(
          (cause) =>
            new ReconciliationError({
              message: `Failed to update verification task: ${String(cause)}`,
              entityIri: task.entityIri,
              cause,
            })
        )
      );

      const decoded = yield* decodeStoredTask(next.key, next);
      return O.some(decoded);
    });

  const approveTask: ReconciliationServiceShape["approveTask"] = (taskId, qid) =>
    updateTask(taskId, (task) => ({ ...task, status: "approved", approvedQid: qid })).pipe(
      Effect.tap((maybeTask) =>
        O.match(maybeTask, {
          onNone: () => Effect.void,
          onSome: (task) => storeLink(task.entityIri, qid).pipe(Effect.asVoid),
        })
      )
    );

  const rejectTask: ReconciliationServiceShape["rejectTask"] = (taskId) =>
    updateTask(taskId, (task) => ({ ...task, status: "rejected", approvedQid: undefined }));

  return ReconciliationService.of({
    reconcileEntity,
    listPendingTasks,
    getTask,
    approveTask,
    rejectTask,
    getLink,
  });
});

export const ReconciliationServiceLive = Layer.effect(ReconciliationService, serviceEffect);

