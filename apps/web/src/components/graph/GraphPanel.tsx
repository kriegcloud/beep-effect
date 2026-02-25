"use client";

import type { GraphNode } from "@beep/web/lib/effect/mappers";
import { chatContextNodeAtom } from "@beep/web/state/chat.atoms";
import {
    clearGraphHighlightsAtom,
    expandGraphNodeAtom,
    graphDataAtom,
    graphSearchQueryAtom,
    highlightedNodeIdsAtom,
    loadSeedGraphAtom,
    seedGraphLoadedAtom,
    selectedGraphNodeAtom,
    selectedNodeFactsAtom,
    selectedNodeIdAtom,
} from "@beep/web/state/graph.atoms";
import { useAtom, useAtomValue } from "@effect/atom-react";
import { Match, pipe, String as Str } from "effect";
import * as O from "effect/Option";
import * as AsyncResult from "effect/unstable/reactivity/AsyncResult";
import { useCallback, useEffect } from "react";
import { ForceGraph } from "./ForceGraph";
import { NodeDetail } from "./NodeDetail";

const defaultSeedLimit = 120;
const defaultMaxFacts = 40;
const defaultMaxNeighbors = 50;

export function GraphPanel() {
  const graphData = useAtomValue(graphDataAtom);
  const highlightedNodeIds = useAtomValue(highlightedNodeIdsAtom);
  const selectedNode = useAtomValue(selectedGraphNodeAtom);
  const selectedFacts = useAtomValue(selectedNodeFactsAtom);
  const seedLoaded = useAtomValue(seedGraphLoadedAtom);

  const [searchQuery, setSearchQuery] = useAtom(graphSearchQueryAtom);
  const [selectedNodeId, setSelectedNodeId] = useAtom(selectedNodeIdAtom);
  const [seedLoadResult, triggerSeedLoad] = useAtom(loadSeedGraphAtom);
  const [expandResult, expandNode] = useAtom(expandGraphNodeAtom);
  const [, clearHighlights] = useAtom(clearGraphHighlightsAtom);
  const [, setChatContextNode] = useAtom(chatContextNodeAtom);

  useEffect(() => {
    Match.value(seedLoaded).pipe(
      Match.when(false, () => {
        triggerSeedLoad({
          query: searchQuery,
          limit: defaultSeedLimit,
        });
        return undefined;
      }),
      Match.orElse(() => undefined)
    );
  }, [seedLoaded, triggerSeedLoad, searchQuery]);

  const onSearchSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const query = Str.trim(searchQuery);

      Match.value(Str.isNonEmpty(query)).pipe(
        Match.when(true, () => {
          triggerSeedLoad({
            query,
            limit: defaultSeedLimit,
          });
          return undefined;
        }),
        Match.orElse(() => undefined)
      );
    },
    [searchQuery, triggerSeedLoad]
  );

  const onNodeClick = useCallback(
    (node: GraphNode) => {
      setSelectedNodeId(O.some(node.id));
      setChatContextNode(O.some(node));
      expandNode({
        nodeId: node.id,
        maxFacts: defaultMaxFacts,
        maxNeighbors: defaultMaxNeighbors,
      });
    },
    [expandNode, setChatContextNode, setSelectedNodeId]
  );

  const onBackgroundClick = useCallback(() => {
    setSelectedNodeId(O.none());
    setChatContextNode(O.none());
  }, [setChatContextNode, setSelectedNodeId]);

  const loadingCopy = pipe(
    seedLoadResult,
    AsyncResult.matchWithWaiting({
      onWaiting: () => "Loading seed graph...",
      onError: (error) => `Graph load failed: ${error}`,
      onDefect: (defect) => `Graph load failed: ${String(defect)}`,
      onSuccess: (result) => `Loaded ${result.value.nodes.length} nodes and ${result.value.links.length} links`,
    })
  );

  const expandCopy = pipe(
    expandResult,
    AsyncResult.matchWithWaiting({
      onWaiting: () => "Select a node to expand neighbors",
      onError: (error) => `Expand failed: ${error}`,
      onDefect: (defect) => `Expand failed: ${String(defect)}`,
      onSuccess: (result) => `Expanded with ${result.value.nodes.length} nodes in latest pull`,
    })
  );

  return (
    <section className="flex h-full min-h-0 flex-col bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Knowledge Graph</h1>
          <button
            type="button"
            onClick={() => clearHighlights(undefined)}
            className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-300 hover:bg-slate-800"
          >
            Clear Highlights
          </button>
        </div>

        <form onSubmit={onSearchSubmit} className="mt-3 flex gap-2">
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search entities, modules, concepts..."
            className="h-9 flex-1 rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            className="h-9 rounded-md bg-sky-600 px-3 text-sm font-medium text-white hover:bg-sky-500"
          >
            Search
          </button>
        </form>

        <div className="mt-2 space-y-1 text-xs text-slate-400">
          <p>{loadingCopy}</p>
          <p>{expandCopy}</p>
          <p>
            Graph size: {graphData.nodes.length} nodes / {graphData.links.length} links
          </p>
        </div>
      </header>

      <div className="relative min-h-0 flex-1">
        <ForceGraph
          graphData={graphData}
          highlightedNodeIds={highlightedNodeIds}
          selectedNodeId={selectedNodeId}
          onNodeClick={onNodeClick}
          onBackgroundClick={onBackgroundClick}
        />

        <NodeDetail
          node={selectedNode}
          facts={selectedFacts}
          onClose={() => {
            setSelectedNodeId(O.none());
            setChatContextNode(O.none());
          }}
        />
      </div>
    </section>
  );
}
