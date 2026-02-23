"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@beep/todox/components/ui/accordion";
import { Badge } from "@beep/todox/components/ui/badge";
import { Card, CardContent } from "@beep/todox/components/ui/card";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Str from "effect/String";
import type { EntityCluster } from "../types";

export interface ClusterListProps {
  readonly clusters: readonly EntityCluster[];
}

function getSimpleType(typeUri: string): string {
  return F.pipe(
    typeUri,
    Str.split(/[/#]/),
    A.last,
    O.getOrElse(() => typeUri)
  );
}

function formatCohesion(cohesion: number): string {
  return `${Math.round(cohesion * 100)}%`;
}

export function ClusterList({ clusters }: ClusterListProps) {
  if (A.isEmptyReadonlyArray(clusters)) {
    return <div className="text-muted-foreground py-8 text-center">No entity clusters found.</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Entity Clusters ({A.length(clusters)})</h3>

      <Accordion>
        {A.map(clusters, (cluster) => {
          const memberCount = A.length(cluster.memberEntities);
          const canonicalName = cluster.canonicalEntity.canonicalName ?? cluster.canonicalEntity.mention;

          return (
            <AccordionItem key={cluster.id} value={cluster.id}>
              <AccordionTrigger>
                <div className="flex flex-1 items-center gap-3">
                  <span className="font-medium">{canonicalName}</span>
                  <Badge variant="secondary">{memberCount} members</Badge>
                  <span className="text-muted-foreground text-sm">Cohesion: {formatCohesion(cluster.cohesion)}</span>
                  {A.isNonEmptyReadonlyArray(cluster.sharedTypes) && (
                    <div className="flex gap-1">
                      {A.map(cluster.sharedTypes, (type) => (
                        <Badge key={type} variant="outline" className="text-xs">
                          {getSimpleType(type)}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pl-4">
                  <div>
                    <p className="text-muted-foreground mb-2 text-sm font-medium">Canonical Entity</p>
                    <Card>
                      <CardContent className="py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {cluster.canonicalEntity.canonicalName ?? cluster.canonicalEntity.mention}
                          </span>
                          <Badge variant="default">{getSimpleType(cluster.canonicalEntity.primaryType)}</Badge>
                          <span className="text-muted-foreground text-sm">
                            ({Math.round(cluster.canonicalEntity.confidence * 100)}% confidence)
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {A.isNonEmptyReadonlyArray(cluster.memberEntities) && (
                    <div>
                      <p className="text-muted-foreground mb-2 text-sm font-medium">Member Entities</p>
                      <div className="space-y-2">
                        {A.map(cluster.memberEntities, (member) => (
                          <Card key={member.id}>
                            <CardContent className="py-2">
                              <div className="flex items-center gap-2">
                                <span>{member.canonicalName ?? member.mention}</span>
                                <Badge variant="outline">{getSimpleType(member.primaryType)}</Badge>
                                <span className="text-muted-foreground text-sm">
                                  ({Math.round(member.confidence * 100)}% confidence)
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
