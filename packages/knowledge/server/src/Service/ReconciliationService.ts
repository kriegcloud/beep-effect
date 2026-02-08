import { $KnowledgeServerId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import * as Layer from "effect/Layer";
import * as P from "effect/Predicate";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { Storage } from "./Storage";
import { WikidataCandidate, WikidataClient, WikidataSearchOptions } from "./WikidataClient";

const $I = $KnowledgeServerId.create("Service/ReconciliationService");

export class ReconciliationError extends S.TaggedError<ReconciliationError>($I`ReconciliationError`)(
  "ReconciliationError",
  {
    message: S.String,
    entityIri: S.String,
    cause: S.optional(S.Unknown),
  },
  $I.annotations("ReconciliationError", { description: "Entity reconciliation failure" })
) {}

export class ReconciliationDecision extends BS.StringLiteralKit(
  "auto_linked",
  "queued",
  "no_match",
  "skipped"
).annotations(
  $I.annotations("ReconciliationDecision", {
    description: "Decision outcome from entity reconciliation (auto linked, queued for review, no match, skipped).",
  })
) {}
export declare namespace ReconciliationDecision {
  export type Type = typeof ReconciliationDecision.Type;
}

export class TaskStatus extends BS.StringLiteralKit("pending", "approved", "rejected").annotations(
  $I.annotations("TaskStatus", {
    description: "Verification task status for reconciliation queue items.",
  })
) {}
export declare namespace TaskStatus {
  export type Type = typeof TaskStatus.Type;
}

export class ReconciliationConfig extends S.Class<ReconciliationConfig>($I`ReconciliationConfig`)(
  {
    autoLinkThreshold: S.optionalWith(S.Number.pipe(S.between(0, 100)), { default: () => 90 }),
    queueThreshold: S.optionalWith(S.Number.pipe(S.between(0, 100)), { default: () => 50 }),
    maxCandidates: S.optionalWith(S.Int.pipe(S.positive()), { default: () => 5 }),
    language: S.optionalWith(S.String, { default: () => "en" }),
  },
  $I.annotations("ReconciliationConfig", {
    description: "Reconciliation configuration with defaults (thresholds, candidate count, language).",
  })
) {}
export class ReconciliationConfigInput extends S.Class<ReconciliationConfigInput>($I`ReconciliationConfigInput`)(
  {
    autoLinkThreshold: S.optionalWith(S.Number.pipe(S.between(0, 100)), { default: () => 90 }),
    queueThreshold: S.optionalWith(S.Number.pipe(S.between(0, 100)), { default: () => 50 }),
    maxCandidates: S.optionalWith(S.Int.pipe(S.positive()), { default: () => 5 }),
    language: S.optionalWith(S.String, { default: () => "en" }),
  },
  $I.annotations("ReconciliationConfigInput", {
    description: "Partial reconciliation configuration overrides (all fields optional).",
  })
) {}

export class VerificationTask extends S.Class<VerificationTask>($I`VerificationTask`)(
  {
    id: S.String,
    entityIri: S.String,
    label: S.String,
    candidates: S.Array(WikidataCandidate),
    createdAt: BS.DateTimeUtcFromAllAcceptable,
    status: TaskStatus,
    approvedQid: S.optionalWith(S.OptionFromNullishOr(S.String, null), { default: O.none<string> }),
  },
  $I.annotations("VerificationTask", {
    description: "Manual verification task for entity reconciliation (candidates + status + optional approved QID).",
  })
) {}

export class ReconciliationResult extends S.Class<ReconciliationResult>($I`ReconciliationResult`)(
  {
    entityIri: S.String,
    label: S.String,
    decision: ReconciliationDecision,
    candidates: S.Array(WikidataCandidate),
    bestMatch: S.optionalWith(S.OptionFromNullishOr(WikidataCandidate, null), { default: O.none<WikidataCandidate> }),
    verificationTaskId: S.optionalWith(S.OptionFromNullishOr(S.String, null), { default: O.none<string> }),
  },
  $I.annotations("ReconciliationResult", {
    description: "Reconciliation result containing decision, candidates, optional best match, and optional task id.",
  })
) {}

export class WikidataLink extends S.Class<WikidataLink>($I`WikidataLink`)(
  {
    entityIri: S.String,
    qid: S.String,
    wikidataUri: S.String,
    linkedAt: BS.DateTimeUtcFromAllAcceptable,
  },
  $I.annotations("WikidataLink", {
    description: "Persisted link between an entity IRI and a Wikidata QID (with timestamp).",
  })
) {}

export interface ReconciliationServiceShape {
  readonly reconcileEntity: (
    entityIri: string,
    label: string,
    types?: ReadonlyArray<string>,
    config?: undefined | ReconciliationConfigInput
  ) => Effect.Effect<ReconciliationResult, ReconciliationError>;

  readonly getPendingTasks: () => Effect.Effect<ReadonlyArray<VerificationTask>, ReconciliationError>;

  readonly approveTask: (taskId: string, qid: string) => Effect.Effect<void, ReconciliationError>;
  readonly rejectTask: (taskId: string) => Effect.Effect<void, ReconciliationError>;

  readonly getLink: (
    entityIri: string
  ) => Effect.Effect<O.Option<{ readonly qid: string; readonly wikidataUri: string }>, ReconciliationError>;

  readonly reconcileBatch: (
    entities: ReadonlyArray<{ readonly iri: string; readonly label: string; readonly types?: ReadonlyArray<string> }>,
    config?: undefined | ReconciliationConfigInput
  ) => Effect.Effect<ReadonlyArray<ReconciliationResult>, ReconciliationError>;
}

export class ReconciliationService extends Context.Tag($I`ReconciliationService`)<
  ReconciliationService,
  ReconciliationServiceShape
>() {}

const LINKS_PREFIX = "reconciliation/links/";
const QUEUE_PREFIX = "reconciliation/queue/";

const encodeWikidataLinkJson = S.encode(S.parseJson(WikidataLink));
const encodeVerificationTaskJson = S.encode(S.parseJson(VerificationTask));
const decodeVerificationTask = S.decodeUnknown(S.parseJson(VerificationTask));
const decodeWikidataLink = S.decodeUnknown(S.parseJson(WikidataLink));

const isReconciliationError = (error: unknown): error is ReconciliationError =>
  P.isObject(error) &&
  P.hasProperty(error, "_tag") &&
  P.isTagged(error, "ReconciliationError");

const mapError =
  (message: string, entityIri = "") =>
  (error: unknown): ReconciliationError =>
    isReconciliationError(error)
      ? error
      : new ReconciliationError({
          message: `${message}: ${String(error)}`,
          entityIri,
          cause: error,
        });

const serviceEffect: Effect.Effect<ReconciliationServiceShape, never, WikidataClient | Storage> = Effect.gen(
  function* () {
    const wikidata = yield* WikidataClient;
    const storage = yield* Storage;

    const generateTaskId = (): string => {
      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).slice(2, 8);
      return `task-${timestamp}-${random}`;
    };

    const storeLink = (entityIri: string, qid: string): Effect.Effect<void, ReconciliationError> =>
      Effect.gen(function* () {
        const now = yield* DateTime.now;
        const link = new WikidataLink({
          entityIri,
          qid,
          wikidataUri: `http://www.wikidata.org/entity/${qid}`,
          linkedAt: now,
        });

        const encodedJson = yield* encodeWikidataLinkJson(link);
        yield* storage.put(`${LINKS_PREFIX}${encodeURIComponent(entityIri)}`, encodedJson);
      }).pipe(
        Effect.mapError(
          (e) =>
            new ReconciliationError({
              message: `Failed to store link: ${String(e)}`,
              entityIri,
              cause: e,
            })
        )
      );

    const queueForVerification = (
      entityIri: string,
      label: string,
      candidates: ReadonlyArray<WikidataCandidate>
    ): Effect.Effect<string, ReconciliationError> =>
      Effect.gen(function* () {
        const taskId = generateTaskId();
        const now = yield* DateTime.now;
        const task = new VerificationTask({
          id: taskId,
          entityIri,
          label,
          candidates: [...candidates],
          createdAt: now,
          status: "pending",
          approvedQid: O.none(),
        });

        const encodedJson = yield* encodeVerificationTaskJson(task);
        yield* storage.put(`${QUEUE_PREFIX}${taskId}`, encodedJson);
        return taskId;
      }).pipe(
        Effect.mapError(
          (e) =>
            new ReconciliationError({
              message: `Failed to queue verification: ${String(e)}`,
              entityIri,
              cause: e,
            })
        )
      );

    const reconcileEntity: ReconciliationServiceShape["reconcileEntity"] = (
      entityIri,
      label,
      _types = [],
      config = new ReconciliationConfigInput()
    ) =>
      Effect.gen(function* () {
        const cfg = new ReconciliationConfig(config);
        const autoLinkThreshold = cfg.autoLinkThreshold ?? 90;
        const queueThreshold = cfg.queueThreshold ?? 50;
        const maxCandidates = cfg.maxCandidates ?? 5;
        const language = cfg.language ?? "en";

        const existing = yield* storage.get(`${LINKS_PREFIX}${encodeURIComponent(entityIri)}`);
        if (O.isSome(existing)) {
          return new ReconciliationResult({
            entityIri,
            label,
            decision: "skipped",
            candidates: [],
            bestMatch: O.none(),
            verificationTaskId: O.none(),
          });
        }

        const candidates = yield* wikidata.searchEntities(
          label,
          new WikidataSearchOptions({ language, limit: maxCandidates })
        );

        if (A.isEmptyReadonlyArray(candidates)) {
          return new ReconciliationResult({
            entityIri,
            label,
            decision: "no_match",
            candidates: [],
            bestMatch: O.none(),
            verificationTaskId: O.none(),
          });
        }

        const best = candidates[0]!;

        if (best.score >= autoLinkThreshold) {
          yield* storeLink(entityIri, best.qid);
          return new ReconciliationResult({
            entityIri,
            label,
            decision: "auto_linked",
            candidates: [...candidates],
            bestMatch: O.some(best),
            verificationTaskId: O.none(),
          });
        }

        if (best.score >= queueThreshold) {
          const taskId = yield* queueForVerification(entityIri, label, candidates);
          return new ReconciliationResult({
            entityIri,
            label,
            decision: "queued",
            candidates: [...candidates],
            bestMatch: O.some(best),
            verificationTaskId: O.some(taskId),
          });
        }

        return new ReconciliationResult({
          entityIri,
          label,
          decision: "no_match",
          candidates: [...candidates],
          bestMatch: O.some(best),
          verificationTaskId: O.none(),
        });
      }).pipe(
        Effect.mapError(
          (e) =>
            new ReconciliationError({
              message: `Reconciliation failed: ${String(e)}`,
              entityIri,
              cause: e,
            })
        ),
        Effect.withSpan("ReconciliationService.reconcileEntity", {
          attributes: { entityIri, labelLength: Str.length(label) },
        })
      );

    const getPendingTasks: ReconciliationServiceShape["getPendingTasks"] = () =>
      Effect.gen(function* () {
        const entries = yield* storage.list(QUEUE_PREFIX);
        const tasks = A.empty<VerificationTask>();

        for (const entry of entries) {
          const decoded = yield* Effect.either(decodeVerificationTask(entry.value));

          if (Either.isRight(decoded) && decoded.right.status === "pending") {
            tasks.push(decoded.right);
          }
        }

        tasks.sort((a, b) => DateTime.toDateUtc(a.createdAt).getTime() - DateTime.toDateUtc(b.createdAt).getTime());
        return tasks;
      }).pipe(
        Effect.mapError(
          (e) =>
            new ReconciliationError({
              message: `Failed to load pending tasks: ${String(e)}`,
              entityIri: "",
              cause: e,
            })
        )
      );

    const approveTask: ReconciliationServiceShape["approveTask"] = (taskId, qid) =>
      Effect.gen(function* () {
        const key = `${QUEUE_PREFIX}${taskId}`;
        const storedOpt = yield* storage.get(key);
        if (O.isNone(storedOpt)) {
          return yield* new ReconciliationError({ message: `Task not found: ${taskId}`, entityIri: "" });
        }

        const decoded = yield* decodeVerificationTask(storedOpt.value.value);

        yield* storeLink(decoded.entityIri, qid);

        const updated = new VerificationTask({
          ...decoded,
          status: "approved",
          approvedQid: O.some(qid),
        });

        const encodedJson = yield* encodeVerificationTaskJson(updated);
        yield* storage.put(key, encodedJson, { expectedGeneration: storedOpt.value.generation });
      }).pipe(Effect.mapError(mapError("Failed to approve task")));

    const rejectTask: ReconciliationServiceShape["rejectTask"] = (taskId) =>
      Effect.gen(function* () {
        const key = `${QUEUE_PREFIX}${taskId}`;
        const storedOpt = yield* storage.get(key);
        if (O.isNone(storedOpt)) {
          return yield* new ReconciliationError({ message: `Task not found: ${taskId}`, entityIri: "" });
        }

        const decoded = yield* decodeVerificationTask(storedOpt.value.value);

        const updated = new VerificationTask({
          ...decoded,
          status: "rejected",
        });

        const encodedJson = yield* encodeVerificationTaskJson(updated);
        yield* storage.put(key, encodedJson, { expectedGeneration: storedOpt.value.generation });
      }).pipe(Effect.mapError(mapError("Failed to reject task")));

    const getLink: ReconciliationServiceShape["getLink"] = (entityIri) =>
      Effect.gen(function* () {
        const storedOpt = yield* storage.get(`${LINKS_PREFIX}${encodeURIComponent(entityIri)}`);
        if (O.isNone(storedOpt)) return O.none();

        const decoded = yield* Effect.either(decodeWikidataLink(storedOpt.value.value));
        if (Either.isLeft(decoded)) return O.none();

        return O.some({ qid: decoded.right.qid, wikidataUri: decoded.right.wikidataUri });
      });

    const reconcileBatch: ReconciliationServiceShape["reconcileBatch"] = (entities, config) =>
      Effect.forEach(entities, (entity) => reconcileEntity(entity.iri, entity.label, entity.types ?? [], config), {
        concurrency: 1,
      }).pipe(Effect.mapError(mapError("Batch reconciliation failed")));

    return ReconciliationService.of({
      reconcileEntity,
      getPendingTasks,
      approveTask,
      rejectTask,
      getLink,
      reconcileBatch,
    });
  }
);

export const ReconciliationServiceLive = Layer.effect(ReconciliationService, serviceEffect);
