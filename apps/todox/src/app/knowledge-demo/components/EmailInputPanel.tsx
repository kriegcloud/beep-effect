"use client";

import { Badge } from "@beep/todox/components/ui/badge";
import { Button } from "@beep/todox/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@beep/todox/components/ui/card";
import { Label } from "@beep/todox/components/ui/label";
import { Progress } from "@beep/todox/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@beep/todox/components/ui/select";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as React from "react";
import type { CuratedScenario, IngestLifecycleStatus, ScenarioId, ScenarioIngestState } from "../types";
import { DemoHintIcon } from "./DemoHint";

interface EmailInputPanelProps {
  readonly scenarios: readonly CuratedScenario[];
  readonly selectedScenarioId: ScenarioId;
  readonly scenarioStates: Readonly<Record<ScenarioId, ScenarioIngestState>>;
  readonly onSelectScenario: (scenarioId: ScenarioId) => void;
  readonly onIngestScenario: (scenarioId: ScenarioId) => void;
  readonly disabled?: undefined | boolean;
}

const statusLabel = (status: IngestLifecycleStatus): string => {
  switch (status) {
    case "not-started":
      return "Not Started";
    case "pending":
      return "Pending";
    case "extracting":
      return "Extracting";
    case "resolving":
      return "Resolving";
    case "completed":
      return "Completed";
    case "failed":
      return "Failed";
    case "cancelled":
      return "Cancelled";
  }
};

const statusBadgeVariant = (
  status: IngestLifecycleStatus
): "default" | "secondary" | "outline" | "destructive" | null | undefined => {
  switch (status) {
    case "completed":
      return "default";
    case "extracting":
    case "resolving":
    case "pending":
      return "secondary";
    case "failed":
      return "destructive";
    case "cancelled":
      return "outline";
    case "not-started":
      return "outline";
  }
};

const isInFlight = (status: IngestLifecycleStatus): boolean =>
  status === "pending" || status === "extracting" || status === "resolving";

const buttonLabel = (status: IngestLifecycleStatus): string => {
  switch (status) {
    case "not-started":
      return "Ingest Scenario";
    case "pending":
    case "extracting":
    case "resolving":
      return "Ingesting...";
    case "failed":
    case "cancelled":
      return "Retry Ingest";
    case "completed":
      return "Re-ingest Scenario";
  }
};

const getProgress = (state: ScenarioIngestState): undefined | number => {
  if (state.progress !== undefined) {
    return Math.max(0, Math.min(100, Math.round(state.progress * 100)));
  }

  if (state.completedDocuments !== undefined && state.totalDocuments !== undefined && state.totalDocuments > 0) {
    return Math.max(0, Math.min(100, Math.round((state.completedDocuments / state.totalDocuments) * 100)));
  }

  return undefined;
};

export function EmailInputPanel({
  scenarios,
  selectedScenarioId,
  scenarioStates,
  onSelectScenario,
  onIngestScenario,
  disabled = false,
}: EmailInputPanelProps) {
  const selectedScenario = React.useMemo(
    () =>
      O.getOrElse(
        O.orElse(
          A.findFirst(scenarios, (scenario) => scenario.id === selectedScenarioId),
          () => A.head(scenarios)
        ),
        () => {
          throw new Error("No scenarios are available");
        }
      ),
    [scenarios, selectedScenarioId]
  );

  const state = scenarioStates[selectedScenario.id];
  const progress = getProgress(state);
  const ingestDisabled = disabled || isInFlight(state.status);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>Enron Scenario</CardTitle>
          <DemoHintIcon
            hint="Choose one of the fixed Enron scenarios, then explicitly trigger ingest. The demo does not auto-ingest."
            side="right"
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Scenario</Label>
          <Select value={selectedScenario.id} onValueChange={(value) => onSelectScenario(value as ScenarioId)}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a scenario..." />
            </SelectTrigger>
            <SelectContent>
              {A.map(scenarios, (scenario) => (
                <SelectItem key={scenario.id} value={scenario.id}>
                  {scenario.id} - {scenario.useCase}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="border-border rounded-md border p-3 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{selectedScenario.id}</Badge>
            <Badge variant={statusBadgeVariant(state.status)}>{statusLabel(state.status)}</Badge>
            <Badge variant="secondary">{selectedScenario.sourceTitle}</Badge>
          </div>

          <p className="text-muted-foreground text-sm">{selectedScenario.rationale}</p>

          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div>Query seed: {selectedScenario.querySeed}</div>
            <div>Participants: {selectedScenario.participants}</div>
            <div>Messages: {selectedScenario.messageCount}</div>
            <div>Depth: {selectedScenario.depth}</div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {A.map(selectedScenario.categories, (category) => (
              <Badge key={category} variant="outline">
                {category}
              </Badge>
            ))}
          </div>

          {progress !== undefined && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Batch progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {state.error !== undefined && <p className="text-destructive text-xs">{state.error}</p>}

          {state.lastIngestAt !== undefined && (
            <p className="text-muted-foreground text-xs">
              Last ingest: {new Date(state.lastIngestAt).toLocaleString()}
            </p>
          )}
        </div>

        <Button className="w-full" onClick={() => onIngestScenario(selectedScenario.id)} disabled={ingestDisabled}>
          {buttonLabel(state.status)}
        </Button>
      </CardContent>
    </Card>
  );
}
