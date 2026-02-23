"use client";

import { Badge } from "@beep/todox/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@beep/todox/components/ui/table";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Str from "effect/String";
import type { AssembledEntity, SameAsLink } from "../types";

export interface SameAsLinkTableProps {
  readonly links: readonly SameAsLink[];
  readonly entities: Map<string, AssembledEntity>;
}

function formatReason(reason: string): string {
  return F.pipe(reason, Str.split("_"), A.map(Str.capitalize), (words) => words.join(" "));
}

function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

function getConfidenceBadgeVariant(confidence: number): "default" | "secondary" | "outline" {
  if (confidence >= 0.9) return "default";
  if (confidence >= 0.7) return "secondary";
  return "outline";
}

function getEntityMention(entities: Map<string, AssembledEntity>, id: string): string {
  return F.pipe(
    O.fromNullable(entities.get(id)),
    O.map((e) => e.canonicalName ?? e.mention),
    O.getOrElse(() => id)
  );
}

export function SameAsLinkTable({ links, entities }: SameAsLinkTableProps) {
  if (A.isEmptyReadonlyArray(links)) {
    return <div className="text-muted-foreground py-8 text-center">No same-as links found.</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Same-As Links ({A.length(links)})</h3>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Canonical Entity</TableHead>
            <TableHead>Member Entity</TableHead>
            <TableHead>Confidence</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Source</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {A.map(links, (link) => (
            <TableRow key={link.id}>
              <TableCell className="font-medium">{getEntityMention(entities, link.canonicalId)}</TableCell>
              <TableCell>{getEntityMention(entities, link.memberId)}</TableCell>
              <TableCell>
                <Badge variant={getConfidenceBadgeVariant(link.confidence)}>{formatConfidence(link.confidence)}</Badge>
              </TableCell>
              <TableCell>
                <span className="text-muted-foreground">{formatReason(link.reason)}</span>
              </TableCell>
              <TableCell>
                {F.pipe(
                  O.fromNullable(link.sourceId),
                  O.map((sourceId) => getEntityMention(entities, sourceId)),
                  O.getOrElse(() => "-")
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
