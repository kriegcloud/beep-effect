"use client";

import { Badge } from "@beep/ui/components/badge";
import { Button } from "@beep/ui/components/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@beep/ui/components/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@beep/ui/components/table";
import { CaretDownIcon, CaretRightIcon } from "@phosphor-icons/react";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Str from "effect/String";
import * as React from "react";
import type { AssembledEntity, EvidenceSpan, Relation } from "../types";
import { RelationTableSkeleton } from "./Skeletons";

interface RelationTableProps {
  relations: readonly Relation[];
  entities: readonly AssembledEntity[];
  onRelationSelect?: undefined | ((relationId: string) => void);
  onEvidenceClick?: undefined | ((span: EvidenceSpan) => void);
  selectedRelationId?: undefined | string;
  isLoading?: undefined | boolean;
}

const ALL_PREDICATES = "__all__";

function getPredicateName(uri: string): string {
  return F.pipe(
    uri,
    Str.split(/[/#]/),
    A.last,
    O.getOrElse(() => uri)
  );
}

function getConfidenceBadgeVariant(confidence: number): "default" | "secondary" | "outline" {
  if (confidence >= 0.9) return "default";
  if (confidence >= 0.7) return "secondary";
  return "outline";
}

export function RelationTable({
  relations,
  entities,
  onRelationSelect,
  onEvidenceClick,
  selectedRelationId,
  isLoading = false,
}: RelationTableProps) {
  const [predicateFilter, setPredicateFilter] = React.useState<string>(ALL_PREDICATES);
  const [expandedRelationId, setExpandedRelationId] = React.useState<string | null>(null);

  if (isLoading) {
    return <RelationTableSkeleton rows={5} />;
  }

  const getEntityName = React.useCallback(
    (entityId: string) =>
      F.pipe(
        entities,
        A.findFirst((e) => e.id === entityId),
        O.map((e) => e.canonicalName ?? e.mention),
        O.getOrElse(() => entityId)
      ),
    [entities]
  );

  const uniquePredicates = React.useMemo(
    () =>
      F.pipe(
        relations,
        A.map((r) => r.predicate),
        A.dedupe
      ),
    [relations]
  );

  const filteredRelations = React.useMemo(
    () =>
      predicateFilter === ALL_PREDICATES ? relations : A.filter(relations, (r) => r.predicate === predicateFilter),
    [relations, predicateFilter]
  );

  const handleRowClick = (relationId: string) => {
    setExpandedRelationId((prev) => (prev === relationId ? null : relationId));
    onRelationSelect?.(relationId);
  };

  const handleEvidenceClick = (span: EvidenceSpan) => {
    onEvidenceClick?.(span);
  };

  const handlePredicateFilterChange = (value: unknown) => {
    if (typeof value === "string") {
      setPredicateFilter(value);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Relations ({A.length(filteredRelations)})</h3>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">Filter by predicate:</span>
          <Select value={predicateFilter} onValueChange={handlePredicateFilterChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All predicates" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_PREDICATES}>All predicates</SelectItem>
              {A.map(uniquePredicates, (predicate) => (
                <SelectItem key={predicate} value={predicate}>
                  {getPredicateName(predicate)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {A.isEmptyReadonlyArray(filteredRelations) ? (
        <p className="text-muted-foreground py-8 text-center">
          No relations to display. Extract entities from text to discover relations.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>Subject</TableHead>
              <TableHead>Predicate</TableHead>
              <TableHead>Object</TableHead>
              <TableHead className="w-[100px]">Confidence</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {A.flatMap(filteredRelations, (relation) => {
              const isExpanded = expandedRelationId === relation.id;
              const isSelected = selectedRelationId === relation.id;
              const confidence = relation.groundingConfidence ?? 0;
              const objectDisplay = relation.objectId
                ? getEntityName(relation.objectId)
                : (relation.literalValue ?? "-");

              const rows: React.ReactNode[] = [
                <TableRow
                  key={relation.id}
                  className={`cursor-pointer ${isSelected ? "bg-muted" : ""}`}
                  onClick={() => handleRowClick(relation.id)}
                >
                  <TableCell>
                    {relation.evidence ? (
                      isExpanded ? (
                        <CaretDownIcon className="text-muted-foreground size-4" />
                      ) : (
                        <CaretRightIcon className="text-muted-foreground size-4" />
                      )
                    ) : null}
                  </TableCell>
                  <TableCell className="font-medium">{getEntityName(relation.subjectId)}</TableCell>
                  <TableCell className="text-muted-foreground">{getPredicateName(relation.predicate)}</TableCell>
                  <TableCell>{objectDisplay}</TableCell>
                  <TableCell>
                    <Badge variant={getConfidenceBadgeVariant(confidence)}>{Math.round(confidence * 100)}%</Badge>
                  </TableCell>
                </TableRow>,
              ];

              if (isExpanded && relation.evidence) {
                rows.push(
                  <TableRow key={`${relation.id}-evidence`} className="bg-muted/30">
                    <TableCell />
                    <TableCell colSpan={4}>
                      <div className="space-y-2 py-2">
                        <p className="text-muted-foreground text-xs font-medium uppercase">Evidence</p>
                        <blockquote className="border-primary/30 border-l-2 pl-3 italic">
                          "{relation.evidence.text}"
                        </blockquote>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-xs">
                            Characters {relation.evidence.startChar}-{relation.evidence.endChar}
                            {relation.evidence.confidence !== undefined &&
                              ` | Evidence confidence: ${Math.round(relation.evidence.confidence * 100)}%`}
                          </span>
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEvidenceClick(relation.evidence!);
                            }}
                          >
                            Jump to source
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              }

              return rows;
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

export type { RelationTableProps };
