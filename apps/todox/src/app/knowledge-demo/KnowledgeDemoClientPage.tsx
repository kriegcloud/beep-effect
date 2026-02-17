"use client";

import { Core } from "@beep/iam-client";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import { useIsClient } from "@beep/ui/hooks";
import { SplashScreen } from "@beep/ui/progress/loading-screen/splash-screen";
import { Result } from "@effect-atom/atom-react";
import * as O from "effect/Option";
import * as Redacted from "effect/Redacted";
import * as React from "react";
import { prepareScenarioIngestPayload } from "./actions";
import { DemoCallout, EmailInputPanel, GraphRAGQueryPanel, ResultsTabs } from "./components";
import { EntityDetailDrawer } from "./components/EntityDetailDrawer";
import { ErrorAlert } from "./components/ErrorAlert";
import { CURATED_SCENARIOS } from "./data/scenarios";
import {
  type GetKnowledgeBatchStatusSuccess,
  type QueryKnowledgeGraphSuccess,
  useKnowledgeRpcClient,
} from "./rpc-client";
import type {
  AssembledEntity,
  EvidenceSpan,
  GraphRAGConfig,
  GraphRAGResult,
  IngestLifecycleStatus,
  Relation,
  ScenarioId,
  ScenarioIngestState,
} from "./types";

type ErrorSource = "ingest" | "query" | "session";

interface AppError {
  readonly source: ErrorSource;
  readonly message: string;
}

interface ScenarioViewData {
  readonly sourceText: string;
  readonly entities: readonly AssembledEntity[];
  readonly relations: readonly Relation[];
  readonly loadedBatchId?: undefined | string;
}

type RpcBatchStatus = GetKnowledgeBatchStatusSuccess;
type RpcGraphQuerySuccess = QueryKnowledgeGraphSuccess;

const isInFlightStatus = (status: IngestLifecycleStatus): boolean =>
  status === "pending" || status === "extracting" || status === "resolving";

const unwrapSessionToken = (token: unknown): null | string => {
  if (typeof token === "string") {
    return token;
  }

  if (Redacted.isRedacted(token)) {
    const redactedValue = Redacted.value(token);
    return typeof redactedValue === "string" ? redactedValue : null;
  }

  return null;
};

const makeInitialScenarioStates = (): Record<ScenarioId, ScenarioIngestState> => ({
  "scenario-1": { status: "not-started" },
  "scenario-2": { status: "not-started" },
  "scenario-3": { status: "not-started" },
  "scenario-4": { status: "not-started" },
});

const makeInitialScenarioData = (): Record<ScenarioId, ScenarioViewData> => ({
  "scenario-1": { sourceText: "", entities: [], relations: [] },
  "scenario-2": { sourceText: "", entities: [], relations: [] },
  "scenario-3": { sourceText: "", entities: [], relations: [] },
  "scenario-4": { sourceText: "", entities: [], relations: [] },
});

const getScenarioById = (scenarioId: ScenarioId) =>
  O.getOrElse(O.fromNullable(CURATED_SCENARIOS.find((scenario) => scenario.id === scenarioId)), () => {
    throw new Error(`Unknown scenario "${scenarioId}"`);
  });

const mapGraphResult = (result: RpcGraphQuerySuccess, config: GraphRAGConfig): GraphRAGResult => {
  const entities: readonly AssembledEntity[] = result.entities.map((entity) => {
    const [primaryType] = entity.types;
    const confidence = typeof entity.groundingConfidence === "number" ? entity.groundingConfidence : 0.5;

    return {
      id: entity.id,
      mention: entity.mention,
      primaryType: primaryType ?? "unknown",
      types: entity.types,
      attributes: entity.attributes,
      confidence,
      canonicalName: entity.mention,
    };
  });

  const relations: readonly Relation[] = result.relations.map((relation) => ({
    id: relation.id,
    subjectId: relation.subjectId,
    predicate: relation.predicate,
    objectId: O.match(relation.objectId, {
      onNone: () => undefined,
      onSome: (objectId) => KnowledgeEntityIds.KnowledgeEntityId.make(objectId),
    }),
    literalValue: O.getOrUndefined(relation.literalValue),
    evidence: O.getOrUndefined(relation.evidence),
    groundingConfidence: O.getOrUndefined(relation.groundingConfidence),
  }));

  const scores: Record<string, number> = {};
  for (const entity of entities) {
    scores[entity.id] = entity.confidence;
  }

  return {
    entities,
    relations,
    seeds: [],
    context: result.context,
    scores,
    stats: {
      seedEntityCount: 0,
      totalEntityCount: entities.length,
      totalRelationCount: relations.length,
      hopsTraversed: config.maxHops,
      estimatedTokens: result.tokenCount ?? Math.ceil(result.context.length / 4),
      truncated: false,
    },
  };
};

const mapBatchState = (batchState: RpcBatchStatus): Omit<ScenarioIngestState, "batchId" | "lastIngestAt"> => {
  switch (batchState._tag) {
    case "BatchState.Pending":
      return { status: "pending" };
    case "BatchState.Extracting":
      return {
        status: "extracting",
        progress: batchState.progress,
        completedDocuments: batchState.completedDocuments,
        totalDocuments: batchState.totalDocuments,
      };
    case "BatchState.Resolving":
      return {
        status: "resolving",
        progress: batchState.progress,
      };
    case "BatchState.Completed":
      return {
        status: "completed",
        completedDocuments: batchState.totalDocuments,
        totalDocuments: batchState.totalDocuments,
        progress: 1,
      };
    case "BatchState.Cancelled":
      return {
        status: "cancelled",
        completedDocuments: batchState.completedDocuments,
        totalDocuments: batchState.totalDocuments,
      };
    case "BatchState.Failed":
      return {
        status: "failed",
        error: batchState.error,
      };
  }
};

const KnowledgeDemoClientContent = () => {
  const { sessionResult } = Core.Atoms.use();

  const [error, setError] = React.useState<AppError | null>(null);
  const [scenarioStates, setScenarioStates] =
    React.useState<Record<ScenarioId, ScenarioIngestState>>(makeInitialScenarioStates);
  const [scenarioData, setScenarioData] = React.useState<Record<ScenarioId, ScenarioViewData>>(makeInitialScenarioData);
  const [selectedScenarioId, setSelectedScenarioId] = React.useState<ScenarioId>("scenario-1");
  const [ingestingScenarioId, setIngestingScenarioId] = React.useState<ScenarioId | null>(null);

  const [selectedEntityId, setSelectedEntityId] = React.useState<string | null>(null);
  const [highlightedSpans, setHighlightedSpans] = React.useState<readonly EvidenceSpan[]>([]);
  const [activeSpanIndex, setActiveSpanIndex] = React.useState<number | undefined>(undefined);

  const activeOrganizationId = Result.builder(sessionResult)
    .onInitial(() => null)
    .onDefect(() => null)
    .onFailure(() => null)
    .onSuccess(({ data }: Core.GetSession.Success) =>
      O.match(data, {
        onNone: () => null,
        onSome: (sessionData) => sessionData.session.activeOrganizationId,
      })
    )
    .render();
  const sessionToken = Result.builder(sessionResult)
    .onInitial(() => null)
    .onDefect(() => null)
    .onFailure(() => null)
    .onSuccess(({ data }: Core.GetSession.Success) =>
      O.match(data, {
        onNone: () => null,
        onSome: (sessionData) => unwrapSessionToken(sessionData.session.token),
      })
    )
    .render();
  const { startKnowledgeBatch, getKnowledgeBatchStatus, queryKnowledgeGraph } = useKnowledgeRpcClient(sessionToken);
  const selectedScenario = React.useMemo(() => getScenarioById(selectedScenarioId), [selectedScenarioId]);
  const selectedScenarioState = scenarioStates[selectedScenarioId];
  const selectedScenarioData = scenarioData[selectedScenarioId];

  const selectedEntity = React.useMemo(() => {
    if (selectedEntityId === null) {
      return null;
    }

    return O.getOrNull(O.fromNullable(selectedScenarioData.entities.find((entity) => entity.id === selectedEntityId)));
  }, [selectedEntityId, selectedScenarioData.entities]);

  const clearEntitySelection = React.useCallback(() => {
    setSelectedEntityId(null);
    setHighlightedSpans([]);
    setActiveSpanIndex(undefined);
  }, []);

  const runScenarioGraphQuery = React.useCallback(
    async (scenarioId: ScenarioId, query: string, config: GraphRAGConfig): Promise<GraphRAGResult> => {
      if (activeOrganizationId === null) {
        const message = "No active organization in session.";
        setError({ source: "session", message });
        throw new Error(message);
      }

      try {
        const rpcResult = await queryKnowledgeGraph({
          organizationId: activeOrganizationId,
          query,
          maxEntities: config.topK,
          maxDepth: config.maxHops,
        });

        const mapped = mapGraphResult(rpcResult, config);
        setScenarioData((current) => ({
          ...current,
          [scenarioId]: {
            ...current[scenarioId],
            entities: mapped.entities,
            relations: mapped.relations,
          },
        }));

        if (scenarioId === selectedScenarioId) {
          clearEntitySelection();
        }

        return mapped;
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : "Graph query failed";
        setError({ source: "query", message });
        throw new Error(message);
      }
    },
    [activeOrganizationId, clearEntitySelection, queryKnowledgeGraph, selectedScenarioId]
  );

  const loadCompletedScenarioData = React.useCallback(
    async (scenarioId: ScenarioId, batchId: string) => {
      const scenario = getScenarioById(scenarioId);
      const queryResult = await runScenarioGraphQuery(scenarioId, scenario.querySeed, { topK: 10, maxHops: 1 });

      setScenarioData((current) => ({
        ...current,
        [scenarioId]: {
          ...current[scenarioId],
          entities: queryResult.entities,
          relations: queryResult.relations,
          loadedBatchId: batchId,
        },
      }));
    },
    [runScenarioGraphQuery]
  );

  const handleIngestScenario = React.useCallback(
    async (scenarioId: ScenarioId) => {
      const currentState = scenarioStates[scenarioId];
      if (isInFlightStatus(currentState.status)) {
        setError({
          source: "ingest",
          message: `Scenario ${scenarioId} already has an active ingest batch.`,
        });
        return;
      }

      if (activeOrganizationId === null) {
        setError({
          source: "session",
          message: "No active organization in session.",
        });
        return;
      }

      setIngestingScenarioId(scenarioId);
      setError(null);
      clearEntitySelection();

      try {
        const prepared = await prepareScenarioIngestPayload({ scenarioId });
        const startResult = await startKnowledgeBatch({
          organizationId: activeOrganizationId,
          ontologyId: prepared.ontologyId,
          ontologyContent: prepared.ontologyContent,
          documents: prepared.documents.map((document) => ({
            documentId: document.documentId,
            text: document.text,
          })),
        });

        setScenarioData((current) => ({
          ...current,
          [scenarioId]: {
            ...current[scenarioId],
            sourceText: prepared.sourceText,
            entities: [],
            relations: [],
            loadedBatchId: undefined,
          },
        }));

        setScenarioStates((current) => ({
          ...current,
          [scenarioId]: {
            status: "pending",
            batchId: startResult.batchId,
            completedDocuments: 0,
            totalDocuments: startResult.totalDocuments,
            progress: 0,
            lastIngestAt: Date.now(),
          },
        }));
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : "Scenario ingest failed";
        setError({ source: "ingest", message });
        setScenarioStates((current) => ({
          ...current,
          [scenarioId]: {
            ...current[scenarioId],
            status: "failed",
            error: message,
            lastIngestAt: Date.now(),
          },
        }));
      } finally {
        setIngestingScenarioId(null);
      }
    },
    [activeOrganizationId, clearEntitySelection, scenarioStates, startKnowledgeBatch]
  );

  const pollInFlightBatches = React.useCallback(async () => {
    const inFlightScenarios = CURATED_SCENARIOS.filter((scenario) => {
      const state = scenarioStates[scenario.id];
      return state.batchId !== undefined && isInFlightStatus(state.status);
    });

    if (inFlightScenarios.length === 0) {
      return;
    }

    await Promise.all(
      inFlightScenarios.map(async (scenario) => {
        const state = scenarioStates[scenario.id];
        if (state.batchId === undefined) {
          return;
        }

        try {
          const batchState = await getKnowledgeBatchStatus({ batchId: state.batchId });
          const mappedState = mapBatchState(batchState);

          setScenarioStates((current) => ({
            ...current,
            [scenario.id]: {
              ...current[scenario.id],
              ...mappedState,
              batchId: state.batchId,
              lastIngestAt: Date.now(),
            },
          }));
        } catch (cause) {
          const message = cause instanceof Error ? cause.message : "Failed to poll batch status";
          setScenarioStates((current) => ({
            ...current,
            [scenario.id]: {
              ...current[scenario.id],
              status: "failed",
              error: message,
              lastIngestAt: Date.now(),
            },
          }));
        }
      })
    );
  }, [getKnowledgeBatchStatus, scenarioStates]);

  const hasInFlightBatch = React.useMemo(
    () => CURATED_SCENARIOS.some((scenario) => isInFlightStatus(scenarioStates[scenario.id].status)),
    [scenarioStates]
  );

  React.useEffect(() => {
    if (!hasInFlightBatch) {
      return;
    }

    void pollInFlightBatches();
    const intervalId = window.setInterval(() => {
      void pollInFlightBatches();
    }, 3000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [hasInFlightBatch, pollInFlightBatches]);

  React.useEffect(() => {
    for (const scenario of CURATED_SCENARIOS) {
      const state = scenarioStates[scenario.id];
      if (state.status !== "completed" || state.batchId === undefined) {
        continue;
      }

      const loadedBatchId = scenarioData[scenario.id].loadedBatchId;
      if (loadedBatchId === state.batchId) {
        continue;
      }

      void loadCompletedScenarioData(scenario.id, state.batchId).catch((cause) => {
        const message = cause instanceof Error ? cause.message : "Failed to load scenario data";
        setError({ source: "query", message });
      });
    }
  }, [loadCompletedScenarioData, scenarioData, scenarioStates]);

  const handleScenarioSelect = React.useCallback(
    (scenarioId: ScenarioId) => {
      setSelectedScenarioId(scenarioId);
      setError(null);
      clearEntitySelection();
    },
    [clearEntitySelection]
  );

  const handleGraphQuery = React.useCallback(
    (query: string, config: GraphRAGConfig) => runScenarioGraphQuery(selectedScenarioId, query, config),
    [runScenarioGraphQuery, selectedScenarioId]
  );

  const handleEvidenceClick = React.useCallback(
    (span: EvidenceSpan) => {
      const index = highlightedSpans.findIndex(
        (currentSpan) => currentSpan.startChar === span.startChar && currentSpan.endChar === span.endChar
      );

      if (index === -1) {
        setHighlightedSpans([span]);
        setActiveSpanIndex(0);
        return;
      }

      setActiveSpanIndex(index);
    },
    [highlightedSpans]
  );

  const canQueryGraph = selectedScenarioState.status === "completed";

  return (
    <div className="container mx-auto py-4 px-3">
      <div className="mb-4">
        <h1 className="text-3xl font-bold">Knowledge Graph Demo</h1>
        <p className="text-muted-foreground mt-2">
          Curated Enron scenarios over live knowledge RPC ingestion and GraphRAG query.
        </p>
      </div>

      <DemoCallout
        title="Phase 2 Flow"
        message="1. Select a scenario  2. Click Ingest Scenario (explicit action)  3. Wait for visible batch lifecycle state  4. Query persisted graph context. Meeting prep live synthesis stays deferred to Phase 3."
      />

      {error && (
        <div className="mb-6">
          <ErrorAlert
            title={
              error.source === "ingest" ? "Ingest Failed" : error.source === "query" ? "Query Failed" : "Session Error"
            }
            message={error.message}
            onRetry={
              error.source === "ingest"
                ? () => {
                    void handleIngestScenario(selectedScenarioId);
                  }
                : error.source === "query"
                  ? () => {
                      void handleGraphQuery(selectedScenario.querySeed, { topK: 10, maxHops: 1 });
                    }
                  : undefined
            }
            onDismiss={() => setError(null)}
          />
        </div>
      )}

      <div className="mb-6 flex items-center gap-4">
        <span className="text-muted-foreground text-sm">
          Active scenario: <strong>{selectedScenario.id}</strong>
        </span>
        {selectedScenarioState.batchId !== undefined && (
          <span className="text-muted-foreground text-sm">
            Batch: <code>{selectedScenarioState.batchId}</code>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="flex flex-col gap-4">
          <EmailInputPanel
            scenarios={CURATED_SCENARIOS}
            selectedScenarioId={selectedScenarioId}
            scenarioStates={scenarioStates}
            onSelectScenario={handleScenarioSelect}
            onIngestScenario={handleIngestScenario}
            disabled={ingestingScenarioId !== null}
          />
          <GraphRAGQueryPanel
            onQuery={handleGraphQuery}
            onEntitySelect={setSelectedEntityId}
            disabled={!canQueryGraph}
          />
        </div>

        <ResultsTabs
          entities={selectedScenarioData.entities}
          relations={selectedScenarioData.relations}
          sourceText={selectedScenarioData.sourceText}
          onEntitySelect={setSelectedEntityId}
          selectedEntityId={selectedEntityId ?? undefined}
          highlightedSpans={highlightedSpans}
          activeSpanIndex={activeSpanIndex}
          onEvidenceClick={handleEvidenceClick}
          isLoading={isInFlightStatus(selectedScenarioState.status)}
        />
      </div>

      <EntityDetailDrawer
        entity={selectedEntity}
        relations={selectedScenarioData.relations}
        allEntities={selectedScenarioData.entities}
        open={selectedEntityId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedEntityId(null);
          }
        }}
        onEvidenceClick={handleEvidenceClick}
      />
    </div>
  );
};

export default function KnowledgeDemoClientPage() {
  const isClient = useIsClient();

  if (!isClient) {
    return <SplashScreen />;
  }

  return <KnowledgeDemoClientContent />;
}
