"use client";

import type { KnowledgeEntityIds } from "@beep/shared-domain";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@beep/todox/components/ui/card";
import * as React from "react";
import { queryGraphRAG } from "../actions";
import type { GraphRAGResult } from "../types";
import { DemoHintIcon } from "./DemoHint";
import { ErrorAlert } from "./ErrorAlert";
import { QueryConfigForm } from "./QueryConfigForm";
import QueryInput from "./QueryInput";
import { QueryResultDisplay } from "./QueryResultDisplay";

interface GraphRAGQueryPanelProps {
  readonly onEntitySelect?: undefined | ((entityId: KnowledgeEntityIds.KnowledgeEntityId.Type) => void);
}

export default function GraphRAGQueryPanel({ onEntitySelect }: GraphRAGQueryPanelProps) {
  const [queryText, setQueryText] = React.useState("");
  const [topK, setTopK] = React.useState(10);
  const [maxHops, setMaxHops] = React.useState(1);
  const [isQuerying, setIsQuerying] = React.useState(false);
  const [result, setResult] = React.useState<GraphRAGResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const handleSubmit = React.useCallback(async () => {
    if (!queryText.trim()) return;

    setIsQuerying(true);
    setError(null);

    try {
      const queryResult = await queryGraphRAG(queryText, { topK, maxHops });
      setResult(queryResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Query failed");
    } finally {
      setIsQuerying(false);
    }
  }, [queryText, topK, maxHops]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>GraphRAG Query</CardTitle>
          <DemoHintIcon
            hint="Query the knowledge graph using natural language. Top K controls how many results to return. Max Hops controls graph traversal depth for related entities."
            side="right"
          />
        </div>
        <CardDescription>Search the knowledge graph with natural language</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <QueryInput value={queryText} onChange={setQueryText} onSubmit={handleSubmit} isLoading={isQuerying} />

        <div className="mt-4">
          <QueryConfigForm
            topK={topK}
            maxHops={maxHops}
            onTopKChange={setTopK}
            onMaxHopsChange={setMaxHops}
            disabled={isQuerying}
          />
        </div>

        {error && <ErrorAlert message={error} onDismiss={() => setError(null)} onRetry={handleSubmit} />}

        {result && (
          <div className="mt-6">
            <QueryResultDisplay result={result} onEntitySelect={onEntitySelect} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
