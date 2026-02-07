import { GoogleAuthClient } from "@beep/google-workspace-client";
import {
  GmailScopes,
  GoogleAuthenticationError,
  GoogleOAuthToken,
  GoogleScopeExpansionRequiredError,
} from "@beep/google-workspace-domain";
import { emptyInferenceResult, type InferenceResult, SparqlBindings } from "@beep/knowledge-domain/value-objects";
import { ReasonerService } from "@beep/knowledge-server/Reasoning/ReasonerService";
import { SparqlService } from "@beep/knowledge-server/Sparql/SparqlService";
import type { WorkflowPersistenceShape } from "@beep/knowledge-server/Workflow";
import { HttpClient, type HttpClientError, type HttpClientRequest, HttpClientResponse } from "@effect/platform";
import * as A from "effect/Array";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";

export interface MockSparqlServiceConfig {
  readonly knownEntities?: ReadonlyArray<string>;
  readonly knownRelations?: ReadonlyArray<string>;
}

export const makeMockSparqlServiceLayer = (
  config?: MockSparqlServiceConfig
): Layer.Layer<SparqlService, never, never> =>
  Layer.succeed(SparqlService, {
    ask: (query: string) => {
      const knownEntities = config?.knownEntities ?? [];
      const knownRelations = config?.knownRelations ?? [];

      return Effect.gen(function* () {
        const entityExists = A.some(knownEntities, (entityId) => Str.includes(entityId)(query));
        if (entityExists) {
          return true;
        }

        return A.some(knownRelations, (relationId) => Str.includes(relationId)(query));
      });
    },
    select: () => Effect.succeed(new SparqlBindings({ columns: [], rows: [] })),
    construct: () => Effect.succeed([]),
    describe: () => Effect.succeed([]),
    query: () => Effect.succeed(true),
  });

export const makeMockReasonerServiceLayer = (
  inferenceResult: InferenceResult = emptyInferenceResult
): Layer.Layer<ReasonerService, never, never> =>
  Layer.succeed(ReasonerService, {
    infer: (_config, _customRules) => Effect.succeed(inferenceResult),
    inferAndMaterialize: (_config, _materialize, _customRules) => Effect.succeed(inferenceResult),
  });

export interface WorkflowStatusUpdate {
  readonly id: string;
  readonly status: string;
  readonly updates: Parameters<WorkflowPersistenceShape["updateExecutionStatus"]>[2];
}

export const makeWorkflowPersistenceShape = (statusUpdates: Array<WorkflowStatusUpdate>): WorkflowPersistenceShape => ({
  createExecution: (_params) => Effect.void,
  updateExecutionStatus: (id, status, updates) =>
    Effect.sync(() => {
      statusUpdates.push({ id, status, updates });
    }),
  getExecution: () => Effect.die("not used"),
  findLatestBatchExecutionByBatchId: () => Effect.succeed(O.none()),
  cancelExecution: () => Effect.void,
  requireBatchExecutionByBatchId: () => Effect.die("not used"),
});

export const makeGoogleAuthClientLayer = (options?: {
  readonly missingScopes?: boolean;
}): Layer.Layer<GoogleAuthClient, never, never> => {
  const missingScopes = options?.missingScopes ?? false;

  return Layer.succeed(
    GoogleAuthClient,
    GoogleAuthClient.of({
      getValidToken: (requiredScopes) =>
        missingScopes
          ? Effect.fail(
              new GoogleScopeExpansionRequiredError({
                message: "Missing required scopes",
                currentScopes: [],
                requiredScopes: A.fromIterable(requiredScopes),
                missingScopes: A.fromIterable(requiredScopes),
              })
            )
          : Effect.succeed(
              new GoogleOAuthToken({
                accessToken: O.some("mock-access-token"),
                refreshToken: O.none(),
                scope: O.some(GmailScopes.read),
                tokenType: O.some("Bearer"),
                expiryDate: O.some(DateTime.add(DateTime.unsafeNow(), { hours: 1 })),
              })
            ),
      refreshToken: () =>
        Effect.fail(
          new GoogleAuthenticationError({
            message: "Mock client does not support refresh",
          })
        ),
    })
  );
};

export const makeHttpClientMockLayer = (
  handler: (
    request: HttpClientRequest.HttpClientRequest
  ) => Effect.Effect<{ status: number; body: unknown }, never, never>
): Layer.Layer<HttpClient.HttpClient, never, never> =>
  Layer.succeed(
    HttpClient.HttpClient,
    // `HttpClient.make` internally runs `UrlParams.makeUrl(...)`, which consults `globalThis.location`
    // when present; Bun's test environment can populate `location` in a way that causes `InvalidUrl`
    // for otherwise-valid absolute URLs. `makeWith` avoids that URL re-construction step entirely.
    HttpClient.makeWith<never, never, HttpClientError.HttpClientError, never>(
      (requestEffect) =>
        Effect.flatMap(requestEffect, (request) =>
          Effect.gen(function* () {
            const result = yield* handler(request);
            const encoded = yield* S.encodeUnknown(S.parseJson(S.Unknown))(result.body);
            return HttpClientResponse.fromWeb(
              request,
              new Response(encoded, {
                status: result.status,
                headers: { "Content-Type": "application/json" },
              })
            );
          }).pipe(Effect.catchTag("ParseError", Effect.die))
        ),
      (request) => Effect.succeed(request)
    )
  );
