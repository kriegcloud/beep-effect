"use client";

import { Badge } from "@beep/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@beep/ui/components/card";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Str from "effect/String";
import * as Struct from "effect/Struct";
import type { AssembledEntity } from "../types";
import { EmptyState } from "./EmptyState";
import { EntityCardListSkeleton } from "./Skeletons";

interface EntityCardListProps {
  readonly entities: readonly AssembledEntity[];
  readonly onEntityClick?: (entityId: string) => void;
  readonly isLoading?: boolean;
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

export function EntityCardList({ entities, onEntityClick, isLoading = false }: EntityCardListProps) {
  if (isLoading) {
    return <EntityCardListSkeleton count={6} />;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Extracted Entities ({A.length(entities)})</h3>

      {A.isEmptyReadonlyArray(entities) ? (
        <EmptyState emoji="📋" title="No entities yet" description="Extract text to discover entities" />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {A.map(entities, (entity) => {
            const simpleType = getSimpleType(entity.primaryType);
            const attributeEntries = Struct.entries(entity.attributes);

            return (
              <Card
                key={entity.id}
                className={onEntityClick ? "cursor-pointer transition-colors hover:bg-muted/50" : undefined}
                onClick={onEntityClick ? () => onEntityClick(entity.id) : undefined}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{entity.canonicalName ?? entity.mention}</CardTitle>
                    <Badge variant={getTypeBadgeVariant(simpleType)}>{simpleType}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-muted-foreground text-sm">Confidence: {Math.round(entity.confidence * 100)}%</p>
                  {A.isNonEmptyArray(attributeEntries) && (
                    <div className="text-sm">
                      <p className="font-medium">Attributes:</p>
                      <ul className="text-muted-foreground list-inside list-disc">
                        {A.map(attributeEntries, ([key, value]) => (
                          <li key={key}>
                            {key}: {String(value)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
