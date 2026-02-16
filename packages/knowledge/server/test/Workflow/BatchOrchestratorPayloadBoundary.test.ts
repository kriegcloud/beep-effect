import {
  AbortAllEngineBatchPayloadConfig,
  ContinueOnFailureEngineBatchPayloadConfig,
  EngineBatchPayload,
  EngineBatchPayloadConfig,
  EngineDocument,
  RetryFailedEngineBatchPayloadConfig,
} from "@beep/knowledge-server/Workflow";
import { KnowledgeEntityIds, SharedEntityIds, WorkspacesEntityIds } from "@beep/shared-domain";
import { assertTrue, describe, effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";

const makeValidDocument = () =>
  new EngineDocument({
    documentId: WorkspacesEntityIds.DocumentId.create(),
    text: "Sample document text",
    ontologyContent: "Sample ontology content",
  });

const makeValidConfig = () =>
  new ContinueOnFailureEngineBatchPayloadConfig({
    concurrency: 2,
    maxRetries: 0,
    enableEntityResolution: false,
  });

describe("EngineBatchPayload constructor boundary", () => {
  describe("accepts properly constructed instances", () => {
    effect(
      "accepts EngineBatchPayload with EngineDocument instances and config class instance",
      Effect.fn(function* () {
        const payload = new EngineBatchPayload({
          batchId: KnowledgeEntityIds.BatchExecutionId.create(),
          organizationId: SharedEntityIds.OrganizationId.create(),
          ontologyId: KnowledgeEntityIds.OntologyId.create(),
          documents: [makeValidDocument(), makeValidDocument()],
          config: makeValidConfig(),
        });

        strictEqual(payload.documents.length, 2);
        strictEqual(payload.config.failurePolicy, "continue-on-failure");
      })
    );

    effect(
      "accepts single document payload",
      Effect.fn(function* () {
        const doc = makeValidDocument();
        const payload = new EngineBatchPayload({
          batchId: KnowledgeEntityIds.BatchExecutionId.create(),
          organizationId: SharedEntityIds.OrganizationId.create(),
          ontologyId: KnowledgeEntityIds.OntologyId.create(),
          documents: [doc],
          config: makeValidConfig(),
        });

        strictEqual(payload.documents.length, 1);
        strictEqual(payload.documents[0]?.documentId, doc.documentId);
      })
    );
  });

  describe("rejects plain objects for documents (regression guard)", () => {
    effect(
      "rejects plain object where EngineDocument instance is required",
      Effect.fn(function* () {
        const result = Effect.try(() =>
          new EngineBatchPayload({
            batchId: KnowledgeEntityIds.BatchExecutionId.create(),
            organizationId: SharedEntityIds.OrganizationId.create(),
            ontologyId: KnowledgeEntityIds.OntologyId.create(),
            documents: [
              {
                documentId: WorkspacesEntityIds.DocumentId.create(),
                text: "hello",
                ontologyContent: "onto",
              },
            ] as any,
            config: makeValidConfig(),
          })
        );

        const either = yield* Effect.either(result);
        assertTrue(Either.isLeft(either));
      })
    );

    effect(
      "rejects mixed array of plain objects and instances",
      Effect.fn(function* () {
        const result = Effect.try(() =>
          new EngineBatchPayload({
            batchId: KnowledgeEntityIds.BatchExecutionId.create(),
            organizationId: SharedEntityIds.OrganizationId.create(),
            ontologyId: KnowledgeEntityIds.OntologyId.create(),
            documents: [
              makeValidDocument(),
              {
                documentId: WorkspacesEntityIds.DocumentId.create(),
                text: "plain object",
                ontologyContent: "onto",
              },
            ] as any,
            config: makeValidConfig(),
          })
        );

        const either = yield* Effect.either(result);
        assertTrue(Either.isLeft(either));
      })
    );
  });

  describe("all config failure policies produce valid instances", () => {
    effect(
      "ContinueOnFailureEngineBatchPayloadConfig is accepted",
      Effect.fn(function* () {
        const config = new ContinueOnFailureEngineBatchPayloadConfig({
          concurrency: 3,
          maxRetries: 1,
          enableEntityResolution: true,
        });
        const payload = new EngineBatchPayload({
          batchId: KnowledgeEntityIds.BatchExecutionId.create(),
          organizationId: SharedEntityIds.OrganizationId.create(),
          ontologyId: KnowledgeEntityIds.OntologyId.create(),
          documents: [makeValidDocument()],
          config,
        });

        strictEqual(payload.config.failurePolicy, "continue-on-failure");
        strictEqual(payload.config.concurrency, 3);
      })
    );

    effect(
      "AbortAllEngineBatchPayloadConfig is accepted",
      Effect.fn(function* () {
        const config = new AbortAllEngineBatchPayloadConfig({
          concurrency: 1,
          maxRetries: 0,
          enableEntityResolution: false,
        });
        const payload = new EngineBatchPayload({
          batchId: KnowledgeEntityIds.BatchExecutionId.create(),
          organizationId: SharedEntityIds.OrganizationId.create(),
          ontologyId: KnowledgeEntityIds.OntologyId.create(),
          documents: [makeValidDocument()],
          config,
        });

        strictEqual(payload.config.failurePolicy, "abort-all");
        strictEqual(payload.config.concurrency, 1);
      })
    );

    effect(
      "RetryFailedEngineBatchPayloadConfig is accepted",
      Effect.fn(function* () {
        const config = new RetryFailedEngineBatchPayloadConfig({
          concurrency: 5,
          maxRetries: 3,
          enableEntityResolution: true,
        });
        const payload = new EngineBatchPayload({
          batchId: KnowledgeEntityIds.BatchExecutionId.create(),
          organizationId: SharedEntityIds.OrganizationId.create(),
          ontologyId: KnowledgeEntityIds.OntologyId.create(),
          documents: [makeValidDocument()],
          config,
        });

        strictEqual(payload.config.failurePolicy, "retry-failed");
        strictEqual(payload.config.maxRetries, 3);
      })
    );
  });

  describe("rejects plain config objects (regression guard)", () => {
    effect(
      "rejects plain object where EngineBatchPayloadConfig instance is required",
      Effect.fn(function* () {
        const result = Effect.try(() =>
          new EngineBatchPayload({
            batchId: KnowledgeEntityIds.BatchExecutionId.create(),
            organizationId: SharedEntityIds.OrganizationId.create(),
            ontologyId: KnowledgeEntityIds.OntologyId.create(),
            documents: [makeValidDocument()],
            config: {
              failurePolicy: "continue-on-failure",
              concurrency: 2,
              maxRetries: 0,
              enableEntityResolution: false,
            } as any,
          })
        );

        const either = yield* Effect.either(result);
        assertTrue(Either.isLeft(either));
      })
    );

    effect(
      "rejects plain object mimicking abort-all config",
      Effect.fn(function* () {
        const result = Effect.try(() =>
          new EngineBatchPayload({
            batchId: KnowledgeEntityIds.BatchExecutionId.create(),
            organizationId: SharedEntityIds.OrganizationId.create(),
            ontologyId: KnowledgeEntityIds.OntologyId.create(),
            documents: [makeValidDocument()],
            config: {
              failurePolicy: "abort-all",
              concurrency: 1,
              maxRetries: 0,
              enableEntityResolution: false,
            } as any,
          })
        );

        const either = yield* Effect.either(result);
        assertTrue(Either.isLeft(either));
      })
    );
  });
});
