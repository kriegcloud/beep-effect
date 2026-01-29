"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@beep/todox/components/ui/tabs";
import * as A from "effect/Array";
import type { AssembledEntity, EvidenceSpan, Relation } from "../types";
import { EntityCardList } from "./EntityCardList";
import { RelationTable } from "./RelationTable";
import { SourceTextPanel } from "./SourceTextPanel";

interface ResultsTabsProps {
  readonly entities: readonly AssembledEntity[];
  readonly relations: readonly Relation[];
  readonly sourceText: string;
  readonly onEntitySelect?:  undefined | ((entityId: string) => void);
  readonly selectedEntityId?:  undefined | string;
  readonly highlightedSpans?: undefined |  readonly EvidenceSpan[];
  readonly activeSpanIndex?:  undefined | number;
  readonly onEvidenceClick?:  undefined | ((span: EvidenceSpan) => void);
}

export function ResultsTabs({
  entities,
  relations,
  sourceText,
  onEntitySelect,
  selectedEntityId: _selectedEntityId,
  highlightedSpans,
  activeSpanIndex,
  onEvidenceClick,
}: ResultsTabsProps) {
  return (
    <Tabs defaultValue="entities" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="entities">Entities ({A.length(entities)})</TabsTrigger>
        <TabsTrigger value="relations">Relations ({A.length(relations)})</TabsTrigger>
        <TabsTrigger value="source">Source</TabsTrigger>
      </TabsList>
      <TabsContent value="entities" className="mt-4">
        <EntityCardList entities={entities} onEntityClick={onEntitySelect} />
      </TabsContent>
      <TabsContent value="relations" className="mt-4">
        <RelationTable relations={relations} entities={entities} onEvidenceClick={onEvidenceClick} />
      </TabsContent>
      <TabsContent value="source" className="mt-4">
        <SourceTextPanel
          sourceText={sourceText}
          highlightedSpans={highlightedSpans}
          activeSpanIndex={activeSpanIndex}
        />
      </TabsContent>
    </Tabs>
  );
}

export type { ResultsTabsProps };
