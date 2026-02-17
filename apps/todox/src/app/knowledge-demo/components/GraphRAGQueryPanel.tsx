"use client";

import type { KnowledgeEntityIds } from "@beep/shared-domain";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@beep/todox/components/ui/card";
import * as React from "react";
import type { GraphRAGConfig, GraphRAGResult } from "../types";
import { DemoHintIcon } from "./DemoHint";
import { ErrorAlert } from "./ErrorAlert";
import { QueryConfigForm } from "./QueryConfigForm";
import QueryInput from "./QueryInput";
import { QueryResultDisplay } from "./QueryResultDisplay";

interface GraphRAGQueryPanelProps {
  readonly onQuery: (query: string, config: GraphRAGConfig) => Promise<GraphRAGResult>;
  readonly onEntitySelect?: undefined | ((entityId: KnowledgeEntityIds.KnowledgeEntityId.Type) => void);
  readonly disabled?: undefined | boolean;
}

export default function GraphRAGQueryPanel({ onQuery, onEntitySelect, disabled = false }: GraphRAGQueryPanelProps) {
  const [queryText, setQueryText] = React.useState("");
  const [topK, setTopK] = React.useState(10);
  const [maxHops, setMaxHops] = React.useState(1);
  const [isQuerying, setIsQuerying] = React.useState(false);
  const [result, setResult] = React.useState<GraphRAGResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = React.useCallback(async () => {
    if (disabled || !queryText.trim()) return;

    setIsQuerying(true);
    setError(null);

    try {
      const queryResult = await onQuery(queryText, { topK, maxHops });
      setResult(queryResult);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Query failed");
    } finally {
      setIsQuerying(false);
    }
  }, [disabled, maxHops, onQuery, queryText, topK]);

  React.useEffect(() => {
    if (!disabled) {
      return;
    }
    setResult(null);
    setError(null);
  }, [disabled]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>GraphRAG Query</CardTitle>
          <DemoHintIcon
            hint="Query persisted graph context. This uses graphrag_query on the knowledge RPC endpoint."
            side="right"
          />
        </div>
        <CardDescription>
          {disabled
            ? "Complete scenario ingest before querying persisted graph context."
            : "Search the organization-scoped knowledge graph with natural language."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <QueryInput
          value={queryText}
          onChange={setQueryText}
          onSubmit={handleSubmit}
          isLoading={isQuerying}
          disabled={disabled}
        />

        <div className="mt-4">
          <QueryConfigForm
            topK={topK}
            maxHops={maxHops}
            onTopKChange={setTopK}
            onMaxHopsChange={setMaxHops}
            disabled={isQuerying || disabled}
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
