"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@beep/todox/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@beep/todox/components/ui/tabs";
import * as A from "effect/Array";
import { useMemo } from "react";
import type { AssembledEntity, ResolutionResult } from "../types";
import { ClusterList } from "./ClusterList";
import { SameAsLinkTable } from "./SameAsLinkTable";

export interface EntityResolutionPanelProps {
  readonly result: ResolutionResult;
}

function buildEntityMap(result: ResolutionResult): Map<string, AssembledEntity> {
  const map = new Map<string, AssembledEntity>();

  A.forEach(result.clusters, (cluster) => {
    map.set(cluster.canonicalEntity.id, cluster.canonicalEntity);
    A.forEach(cluster.memberEntities, (member) => {
      map.set(member.id, member);
    });
  });

  return map;
}

export function EntityResolutionPanel({ result }: EntityResolutionPanelProps) {
  const { stats, clusters, sameAsLinks } = result;

  const entityMap = useMemo(() => buildEntityMap(result), [result]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Entity Resolution Results</CardTitle>
          <CardDescription>
            Resolved {stats.resolvedEntityCount} unique entities from {stats.originalEntityCount} mentions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.originalEntityCount}</p>
              <p className="text-muted-foreground text-sm">Original Mentions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.resolvedEntityCount}</p>
              <p className="text-muted-foreground text-sm">Unique Entities</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.clusterCount}</p>
              <p className="text-muted-foreground text-sm">Clusters</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.mergedEntityCount}</p>
              <p className="text-muted-foreground text-sm">Merges</p>
            </div>
          </div>
          <p className="text-muted-foreground mt-4 text-center text-sm">
            {stats.sameAsLinkCount} same-as links generated
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="clusters">
        <TabsList>
          <TabsTrigger value="clusters">Clusters ({A.length(clusters)})</TabsTrigger>
          <TabsTrigger value="links">Same-As Links ({A.length(sameAsLinks)})</TabsTrigger>
        </TabsList>

        <TabsContent value="clusters" className="mt-4">
          <ClusterList clusters={clusters} />
        </TabsContent>

        <TabsContent value="links" className="mt-4">
          <SameAsLinkTable links={sameAsLinks} entities={entityMap} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
