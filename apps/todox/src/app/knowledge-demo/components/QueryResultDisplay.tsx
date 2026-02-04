"use client";

import { Badge } from "@beep/todox/components/ui/badge";
import { Button } from "@beep/todox/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@beep/todox/components/ui/card";
import { ScrollArea } from "@beep/todox/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@beep/todox/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@beep/todox/components/ui/tabs";
import { Textarea } from "@beep/todox/components/ui/textarea";
import { CheckIcon, CopyIcon } from "@phosphor-icons/react";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Str from "effect/String";
import * as React from "react";
import type { AssembledEntity, GraphRAGResult, Relation } from "../types";

interface QueryResultDisplayProps {
  readonly result: GraphRAGResult | null;
  readonly onEntitySelect?: undefined | ((entityId: string) => void);
}

function getSimpleType(typeUri: string): string {
  return F.pipe(
    typeUri,
    Str.split(/[/#]/),
    A.last,
    O.getOrElse(() => typeUri)
  );
}

function getPredicateName(uri: string): string {
  return F.pipe(
    uri,
    Str.split(/[/#]/),
    A.last,
    O.getOrElse(() => uri)
  );
}

function getTypeBadgeVariant(type: string): "default" | "secondary" | "outline" {
  if (type === "Person") return "default";
  if (type === "Organization") return "secondary";
  return "outline";
}

function isSeedEntity(entity: AssembledEntity, seeds: readonly AssembledEntity[]): boolean {
  return A.some(seeds, (seed) => seed.id === entity.id);
}

function StatsBar({ stats }: { stats: GraphRAGResult["stats"] }) {
  return (
    <div className="flex flex-wrap gap-4 mb-4 p-3 bg-muted rounded-lg">
      <div className="flex items-center gap-1.5">
        <span className="text-muted-foreground text-sm">Seeds:</span>
        <Badge variant="outline">{stats.seedEntityCount}</Badge>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-muted-foreground text-sm">Entities:</span>
        <Badge variant="outline">{stats.totalEntityCount}</Badge>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-muted-foreground text-sm">Relations:</span>
        <Badge variant="outline">{stats.totalRelationCount}</Badge>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-muted-foreground text-sm">Hops:</span>
        <Badge variant="outline">{stats.hopsTraversed}</Badge>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-muted-foreground text-sm">Tokens:</span>
        <Badge variant={stats.truncated ? "destructive" : "outline"}>
          ~{stats.estimatedTokens}
          {stats.truncated && " (truncated)"}
        </Badge>
      </div>
    </div>
  );
}

interface EntityCardProps {
  readonly entity: AssembledEntity;
  readonly score: number | undefined;
  readonly isSeed: boolean;
  readonly onClick?: () => void;
}

function EntityCard({ entity, score, isSeed, onClick }: EntityCardProps) {
  const simpleType = getSimpleType(entity.primaryType);

  return (
    <Card className={onClick ? "cursor-pointer transition-colors hover:bg-muted/50" : undefined} onClick={onClick}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{entity.canonicalName ?? entity.mention}</CardTitle>
          <div className="flex gap-1">
            {isSeed && <Badge variant="default">seed</Badge>}
            <Badge variant={getTypeBadgeVariant(simpleType)}>{simpleType}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">relevance: {score !== undefined ? score.toFixed(4) : "N/A"}</p>
      </CardContent>
    </Card>
  );
}

interface EntitiesTabProps {
  readonly entities: readonly AssembledEntity[];
  readonly seeds: readonly AssembledEntity[];
  readonly scores: Record<string, number>;
  readonly onEntitySelect?: (entityId: string) => void;
}

function EntitiesTab({ entities, seeds, scores, onEntitySelect }: EntitiesTabProps) {
  if (A.isEmptyReadonlyArray(entities)) {
    return <p className="text-muted-foreground py-8 text-center">No entities found for this query.</p>;
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pr-4">
        {A.map(entities, (entity) => (
          <EntityCard
            key={entity.id}
            entity={entity}
            score={scores[entity.id]}
            isSeed={isSeedEntity(entity, seeds)}
            onClick={onEntitySelect ? () => onEntitySelect(entity.id) : undefined}
          />
        ))}
      </div>
    </ScrollArea>
  );
}

interface RelationsTabProps {
  readonly relations: readonly Relation[];
  readonly entities: readonly AssembledEntity[];
  readonly scores: Record<string, number>;
}

function RelationsTab({ relations, entities, scores }: RelationsTabProps) {
  const getEntityName = React.useCallback(
    (entityId: string): string =>
      F.pipe(
        entities,
        A.findFirst((e) => e.id === entityId),
        O.map((e) => e.canonicalName ?? e.mention),
        O.getOrElse(() => entityId)
      ),
    [entities]
  );

  if (A.isEmptyReadonlyArray(relations)) {
    return <p className="text-muted-foreground py-8 text-center">No relations found for this query.</p>;
  }

  return (
    <ScrollArea className="h-[400px]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Subject</TableHead>
            <TableHead>Predicate</TableHead>
            <TableHead>Object</TableHead>
            <TableHead className="w-[100px]">Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {A.map(relations, (relation) => {
            const objectDisplay = relation.objectId ? getEntityName(relation.objectId) : (relation.literalValue ?? "-");

            const relationScore = F.pipe(
              O.fromNullable(relation.groundingConfidence),
              O.orElse(() => O.fromNullable(scores[relation.subjectId])),
              O.getOrElse(() => 0)
            );

            return (
              <TableRow key={relation.id}>
                <TableCell className="font-medium">{getEntityName(relation.subjectId)}</TableCell>
                <TableCell className="text-muted-foreground">{getPredicateName(relation.predicate)}</TableCell>
                <TableCell>{objectDisplay}</TableCell>
                <TableCell>
                  <Badge variant="outline">{relationScore.toFixed(2)}</Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}

interface ContextTabProps {
  readonly context: string;
  readonly estimatedTokens: number;
}

function ContextTab({ context, estimatedTokens }: ContextTabProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = React.useCallback(() => {
    void navigator.clipboard.writeText(context).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [context]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">Context for LLM consumption (~{estimatedTokens} tokens)</p>
        <Button variant="outline" size="sm" onClick={handleCopy}>
          {copied ? (
            <>
              <CheckIcon className="size-4 mr-1.5" />
              Copied
            </>
          ) : (
            <>
              <CopyIcon className="size-4 mr-1.5" />
              Copy
            </>
          )}
        </Button>
      </div>
      <Textarea readOnly value={context} className="min-h-[300px] font-mono text-sm resize-none" rows={15} />
    </div>
  );
}

export function QueryResultDisplay({ result, onEntitySelect }: QueryResultDisplayProps) {
  if (result === null) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">Run a query to see results</div>
    );
  }

  return (
    <div className="space-y-4">
      <StatsBar stats={result.stats} />

      <Tabs defaultValue="entities">
        <TabsList>
          <TabsTrigger value="entities">Entities ({A.length(result.entities)})</TabsTrigger>
          <TabsTrigger value="relations">Relations ({A.length(result.relations)})</TabsTrigger>
          <TabsTrigger value="context">Context</TabsTrigger>
        </TabsList>

        <TabsContent value="entities" className="mt-4">
          <EntitiesTab
            entities={result.entities}
            seeds={result.seeds}
            scores={result.scores}
            onEntitySelect={onEntitySelect}
          />
        </TabsContent>

        <TabsContent value="relations" className="mt-4">
          <RelationsTab relations={result.relations} entities={result.entities} scores={result.scores} />
        </TabsContent>

        <TabsContent value="context" className="mt-4">
          <ContextTab context={result.context} estimatedTokens={result.stats.estimatedTokens} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export type { QueryResultDisplayProps };
