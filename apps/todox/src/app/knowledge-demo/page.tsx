"use client";

import { Badge } from "@beep/todox/components/ui/badge";
import { Button } from "@beep/todox/components/ui/button";
import { TrashIcon } from "@phosphor-icons/react";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as React from "react";
import { extractFromText, resolveEntities } from "./actions";
import { EmailInputPanel, EntityResolutionPanel, GraphRAGQueryPanel, ResultsTabs } from "./components";
import { EntityDetailDrawer } from "./components/EntityDetailDrawer";
import { ErrorAlert } from "./components/ErrorAlert";
import type { AssembledEntity, EvidenceSpan, ExtractionSession, Relation, ResolutionResult } from "./types";

type ErrorSource = "extraction" | "resolution";

interface AppError {
  readonly source: ErrorSource;
  readonly message: string;
}

export default function KnowledgeDemoPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<AppError | null>(null);
  const [entities, setEntities] = React.useState<AssembledEntity[]>([]);
  const [lastExtractedText, setLastExtractedText] = React.useState<string>("");
  const [relations, setRelations] = React.useState<Relation[]>([]);
  const [sourceText, setSourceText] = React.useState<string>("");
  const [selectedEntityId, setSelectedEntityId] = React.useState<string | null>(null);
  const [highlightedSpans, setHighlightedSpans] = React.useState<EvidenceSpan[]>([]);
  const [activeSpanIndex, setActiveSpanIndex] = React.useState<number | undefined>(undefined);

  const [extractionSessions, setExtractionSessions] = React.useState<readonly ExtractionSession[]>([]);
  const [resolutionResult, setResolutionResult] = React.useState<ResolutionResult | null>(null);
  const [isResolving, setIsResolving] = React.useState(false);

  async function handleExtract(text: string) {
    setIsLoading(true);
    setError(null);
    setLastExtractedText(text);
    try {
      const result = await extractFromText(text);

      const session: ExtractionSession = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        sourceText: result.sourceText,
        entities: result.entities,
        relations: result.relations,
        stats: result.stats,
      };

      setExtractionSessions((prev) => [...prev, session]);

      setEntities([...result.entities]);
      setRelations([...result.relations]);
      setSourceText(result.sourceText);
      setSelectedEntityId(null);
      setHighlightedSpans([]);
      setActiveSpanIndex(undefined);
    } catch (e) {
      const message = e instanceof Error ? e.message : "An unexpected error occurred during extraction";
      setError({ source: "extraction", message });
    } finally {
      setIsLoading(false);
    }
  }

  function handleRetryExtraction() {
    if (lastExtractedText) {
      void handleExtract(lastExtractedText);
    }
  }

  async function handleResolve() {
    if (extractionSessions.length < 2) return;

    setIsResolving(true);
    setError(null);
    try {
      const result = await resolveEntities([...extractionSessions]);
      setResolutionResult(result);
    } catch (e) {
      const message = e instanceof Error ? e.message : "An unexpected error occurred during entity resolution";
      setError({ source: "resolution", message });
    } finally {
      setIsResolving(false);
    }
  }

  function handleDismissError() {
    setError(null);
  }

  function handleClearAll() {
    setIsLoading(false);
    setError(null);
    setEntities([]);
    setLastExtractedText("");
    setRelations([]);
    setSourceText("");
    setSelectedEntityId(null);
    setHighlightedSpans([]);
    setActiveSpanIndex(undefined);
    setExtractionSessions([]);
    setResolutionResult(null);
    setIsResolving(false);
  }

  function getErrorTitle(source: ErrorSource): string {
    switch (source) {
      case "extraction":
        return "Extraction Failed";
      case "resolution":
        return "Resolution Failed";
    }
  }

  const handleEntitySelect = (entityId: string) => {
    setSelectedEntityId(entityId);
  };

  const handleDrawerClose = () => {
    setSelectedEntityId(null);
  };

  const handleEvidenceClick = (span: EvidenceSpan) => {
    const index = A.findFirstIndex(
      highlightedSpans,
      (s) => s.startChar === span.startChar && s.endChar === span.endChar
    );

    O.match(index, {
      onNone: () => {
        setHighlightedSpans([span]);
        setActiveSpanIndex(0);
      },
      onSome: (i) => {
        setActiveSpanIndex(i);
      },
    });
  };

  const selectedEntity = React.useMemo(
    () =>
      O.match(
        A.findFirst(entities, (e) => e.id === selectedEntityId),
        {
          onNone: () => null,
          onSome: (entity) => entity,
        }
      ),
    [entities, selectedEntityId]
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Knowledge Graph Demo</h1>
        <p className="text-muted-foreground mt-2">
          Extract entities from email text using the knowledge graph pipeline.
        </p>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorAlert
            title={getErrorTitle(error.source)}
            message={error.message}
            onRetry={error.source === "extraction" ? handleRetryExtraction : handleResolve}
            onDismiss={handleDismissError}
          />
        </div>
      )}

      <div className="mb-6 flex items-center gap-4">
        <Badge variant="secondary">{extractionSessions.length} extraction(s)</Badge>
        <Button onClick={handleResolve} disabled={extractionSessions.length < 2 || isResolving} variant="outline">
          {isResolving ? "Resolving..." : "Resolve Entities"}
        </Button>
        <Button variant="outline" size="sm" onClick={handleClearAll} disabled={extractionSessions.length === 0}>
          <TrashIcon className="size-4 mr-2" />
          Clear All
        </Button>
      </div>

      {resolutionResult && (
        <div className="mb-8">
          <EntityResolutionPanel result={resolutionResult} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col gap-8">
          <EmailInputPanel onExtract={handleExtract} isLoading={isLoading} />
          <GraphRAGQueryPanel onEntitySelect={setSelectedEntityId} />
        </div>
        <ResultsTabs
          entities={entities}
          relations={relations}
          sourceText={sourceText}
          onEntitySelect={handleEntitySelect}
          selectedEntityId={selectedEntityId ?? undefined}
          highlightedSpans={highlightedSpans}
          activeSpanIndex={activeSpanIndex}
          onEvidenceClick={handleEvidenceClick}
        />
      </div>

      <EntityDetailDrawer
        entity={selectedEntity}
        relations={relations}
        allEntities={entities}
        open={selectedEntityId !== null}
        onOpenChange={(open) => !open && handleDrawerClose()}
        onEvidenceClick={handleEvidenceClick}
      />
    </div>
  );
}
