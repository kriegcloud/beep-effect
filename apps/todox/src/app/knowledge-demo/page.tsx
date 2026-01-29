"use client";

import * as A from "effect/Array";
import * as O from "effect/Option";
import * as React from "react";
import { extractFromText } from "./actions";
import type { AssembledEntity, EvidenceSpan, Relation } from "./types";
import { EmailInputPanel, ResultsTabs } from "./components";
import { EntityDetailDrawer } from "./components/EntityDetailDrawer";

export default function KnowledgeDemoPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [entities, setEntities] = React.useState<AssembledEntity[]>([]);
  const [relations, setRelations] = React.useState<Relation[]>([]);
  const [sourceText, setSourceText] = React.useState<string>("");
  const [selectedEntityId, setSelectedEntityId] = React.useState<string | null>(
    null
  );
  const [highlightedSpans, setHighlightedSpans] = React.useState<
    EvidenceSpan[]
  >([]);
  const [activeSpanIndex, setActiveSpanIndex] = React.useState<
    number | undefined
  >(undefined);

  async function handleExtract(text: string) {
    setIsLoading(true);
    setError(null);
    try {
      const result = await extractFromText(text);
      setEntities([...result.entities]);
      setRelations([...result.relations]);
      setSourceText(result.sourceText);
      setSelectedEntityId(null);
      setHighlightedSpans([]);
      setActiveSpanIndex(undefined);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Extraction failed");
    } finally {
      setIsLoading(false);
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
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive rounded-md">
          <p className="text-destructive font-medium">Error: {error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <EmailInputPanel onExtract={handleExtract} isLoading={isLoading} />
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
