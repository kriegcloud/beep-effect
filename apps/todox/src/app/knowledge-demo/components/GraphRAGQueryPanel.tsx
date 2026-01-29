"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@beep/todox/components/ui/card";
import * as React from "react";
import { queryGraphRAG } from "../actions";
import type { GraphRAGResult } from "../types";
import { QueryConfigForm } from "./QueryConfigForm";
import QueryInput from "./QueryInput";
import { QueryResultDisplay } from "./QueryResultDisplay";

interface GraphRAGQueryPanelProps {
  readonly onEntitySelect?:  undefined | ((entityId: string) => void);
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
        <CardTitle>GraphRAG Query</CardTitle>
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

        {error && <p className="text-sm text-destructive">{error}</p>}

        {result && (
          <div className="mt-6">
            <QueryResultDisplay result={result} onEntitySelect={onEntitySelect} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
