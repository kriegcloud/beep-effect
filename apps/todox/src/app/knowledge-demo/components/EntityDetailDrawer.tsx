"use client";

import { Badge } from "@beep/ui/components/badge";
import { Button } from "@beep/ui/components/button";
import { ScrollArea } from "@beep/ui/components/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@beep/ui/components/sheet";
import { Table, TableBody, TableCell, TableRow } from "@beep/ui/components/table";
import { ArrowSquareOutIcon } from "@phosphor-icons/react";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Str from "effect/String";
import * as Struct from "effect/Struct";
import type { AssembledEntity, EvidenceSpan, Relation } from "../types";

interface EntityDetailDrawerProps {
  entity: AssembledEntity | null;
  relations: readonly Relation[];
  allEntities: readonly AssembledEntity[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEvidenceClick?: (span: EvidenceSpan) => void;
}

function getSimpleType(typeUri: string): string {
  return F.pipe(
    typeUri,
    Str.split(/[/#]/),
    A.last,
    O.getOrElse(() => typeUri)
  );
}

function getTypeBadgeVariant(type: string): "default" | "secondary" | "outline" {
  if (type === "Person") return "default";
  if (type === "Organization") return "secondary";
  return "outline";
}

function getPredicateLabel(predicate: string): string {
  return F.pipe(
    predicate,
    Str.split(/[/#]/),
    A.last,
    O.getOrElse(() => predicate)
  );
}

export function EntityDetailDrawer({
  entity,
  relations,
  allEntities,
  open,
  onOpenChange,
  onEvidenceClick,
}: EntityDetailDrawerProps) {
  const getEntityName = (id: string): string =>
    F.pipe(
      allEntities,
      A.findFirst((e) => e.id === id),
      O.map((e) => e.canonicalName ?? e.mention),
      O.getOrElse(() => id)
    );

  const relatedRelations = F.pipe(
    relations,
    A.filter((r) => r.subjectId === entity?.id || r.objectId === entity?.id)
  );

  const subjectRelations = F.pipe(
    relatedRelations,
    A.filter((r) => r.subjectId === entity?.id)
  );

  const objectRelations = F.pipe(
    relatedRelations,
    A.filter((r) => r.objectId === entity?.id)
  );

  const evidenceSpans = F.pipe(
    relatedRelations,
    A.filterMap((r) => O.fromNullable(r.evidence))
  );

  const attributeEntries = entity ? Struct.entries(entity.attributes) : [];

  if (!entity) {
    return null;
  }

  const displayName = entity.canonicalName ?? entity.mention;
  const confidencePercent = Math.round(entity.confidence * 100);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="text-lg">{displayName}</SheetTitle>
          {entity.canonicalName && entity.mention !== entity.canonicalName && (
            <p className="text-muted-foreground text-sm">Mentioned as: "{entity.mention}"</p>
          )}
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] pr-4">
          <div className="space-y-6 pb-6">
            {/* Types Section */}
            <section className="space-y-2">
              <h4 className="text-sm font-medium">Types</h4>
              <div className="flex flex-wrap gap-1.5">
                {A.map(entity.types, (type) => {
                  const simpleType = getSimpleType(type);
                  return (
                    <Badge key={type} variant={getTypeBadgeVariant(simpleType)}>
                      {simpleType}
                    </Badge>
                  );
                })}
              </div>
            </section>

            {/* Confidence Section */}
            <section className="space-y-2">
              <h4 className="text-sm font-medium">Confidence</h4>
              <div className="flex items-center gap-3">
                <div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
                  <div
                    className="bg-primary h-full transition-all duration-300"
                    style={{ width: `${confidencePercent}%` }}
                  />
                </div>
                <span className="text-muted-foreground w-12 text-right text-sm tabular-nums">{confidencePercent}%</span>
              </div>
            </section>

            {/* Attributes Section */}
            {A.isNonEmptyArray(attributeEntries) && (
              <section className="space-y-2">
                <h4 className="text-sm font-medium">Attributes</h4>
                <Table>
                  <TableBody>
                    {A.map(attributeEntries, ([key, value]) => (
                      <TableRow key={key}>
                        <TableCell className="text-muted-foreground w-1/3 py-1.5 pl-0 font-medium">{key}</TableCell>
                        <TableCell className="py-1.5 pr-0">{String(value)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </section>
            )}

            {/* Relations as Subject Section */}
            {A.isNonEmptyArray(subjectRelations) && (
              <section className="space-y-2">
                <h4 className="text-sm font-medium">Relations (as subject)</h4>
                <div className="space-y-2">
                  {A.map(subjectRelations, (relation) => (
                    <div
                      key={relation.id}
                      className="bg-muted/50 flex items-start justify-between gap-2 rounded-md p-2"
                    >
                      <div className="space-y-0.5">
                        <div className="text-sm">
                          <span className="text-muted-foreground">{getPredicateLabel(relation.predicate)}</span>{" "}
                          <span className="font-medium">
                            {relation.objectId
                              ? getEntityName(relation.objectId)
                              : (relation.literalValue ?? "Unknown")}
                          </span>
                        </div>
                        {relation.groundingConfidence !== undefined && (
                          <p className="text-muted-foreground text-xs">
                            Confidence: {Math.round(relation.groundingConfidence * 100)}%
                          </p>
                        )}
                      </div>
                      {relation.evidence && onEvidenceClick && (
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => onEvidenceClick(relation.evidence!)}
                          title="Jump to source"
                        >
                          <ArrowSquareOutIcon />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Relations as Object Section */}
            {A.isNonEmptyArray(objectRelations) && (
              <section className="space-y-2">
                <h4 className="text-sm font-medium">Relations (as object)</h4>
                <div className="space-y-2">
                  {A.map(objectRelations, (relation) => (
                    <div
                      key={relation.id}
                      className="bg-muted/50 flex items-start justify-between gap-2 rounded-md p-2"
                    >
                      <div className="space-y-0.5">
                        <div className="text-sm">
                          <span className="font-medium">{getEntityName(relation.subjectId)}</span>{" "}
                          <span className="text-muted-foreground">{getPredicateLabel(relation.predicate)}</span>{" "}
                          <span className="font-medium">{displayName}</span>
                        </div>
                        {relation.groundingConfidence !== undefined && (
                          <p className="text-muted-foreground text-xs">
                            Confidence: {Math.round(relation.groundingConfidence * 100)}%
                          </p>
                        )}
                      </div>
                      {relation.evidence && onEvidenceClick && (
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => onEvidenceClick(relation.evidence!)}
                          title="Jump to source"
                        >
                          <ArrowSquareOutIcon />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Evidence Section */}
            {A.isNonEmptyArray(evidenceSpans) && (
              <section className="space-y-2">
                <h4 className="text-sm font-medium">Evidence Spans</h4>
                <div className="space-y-2">
                  {A.map(evidenceSpans, (span, index) => (
                    <div
                      key={`${span.startChar}-${span.endChar}-${index}`}
                      className="border-border bg-background flex items-start justify-between gap-2 rounded-md border p-2"
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="text-sm leading-relaxed break-words">"{span.text}"</p>
                        <div className="text-muted-foreground flex items-center gap-2 text-xs">
                          <span>
                            Chars {span.startChar}-{span.endChar}
                          </span>
                          {span.confidence !== undefined && (
                            <>
                              <span>|</span>
                              <span>Confidence: {Math.round(span.confidence * 100)}%</span>
                            </>
                          )}
                        </div>
                      </div>
                      {onEvidenceClick && (
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => onEvidenceClick(span)}
                          title="Jump to source"
                          className="shrink-0"
                        >
                          <ArrowSquareOutIcon />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Empty State for Relations */}
            {A.isEmptyReadonlyArray(relatedRelations) && (
              <section className="space-y-2">
                <h4 className="text-sm font-medium">Relations</h4>
                <p className="text-muted-foreground py-4 text-center text-sm">No relations found for this entity.</p>
              </section>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

export type { EntityDetailDrawerProps };
