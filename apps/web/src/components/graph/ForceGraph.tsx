"use client";

import { type GraphLink, type GraphNode, GraphNodeSchema } from "@beep/web/lib/effect/mappers";
import { Match, pipe, String as Str } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ForceGraphMethods, GraphData, LinkObject, NodeObject } from "react-force-graph-2d";

interface ForceGraphProps {
  readonly graphData: {
    readonly nodes: ReadonlyArray<GraphNode>;
    readonly links: ReadonlyArray<GraphLink>;
  };
  readonly highlightedNodeIds: ReadonlyArray<string>;
  readonly selectedNodeId: O.Option<string>;
  readonly onNodeClick: (node: GraphNode) => void;
  readonly onBackgroundClick: () => void;
}

const decodeGraphNode = S.decodeUnknownOption(GraphNodeSchema);

const nodeColorByType = (type: string): string =>
  Match.value(pipe(type, Str.toLowerCase)).pipe(
    Match.when("module", () => "#16a34a"),
    Match.when("service", () => "#2563eb"),
    Match.when("function", () => "#d97706"),
    Match.when("class", () => "#dc2626"),
    Match.when("guide", () => "#7c3aed"),
    Match.orElse(() => "#64748b")
  );

const hasNodeId = (nodeIds: ReadonlyArray<string>, nodeId: string): boolean =>
  pipe(
    nodeIds,
    A.some((id) => id === nodeId)
  );

const toNodeId = (node: NodeObject<GraphNode>): string => `${node.id ?? ""}`;

export function ForceGraph({
  graphData,
  highlightedNodeIds,
  selectedNodeId,
  onNodeClick,
  onBackgroundClick,
}: ForceGraphProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const forceGraphRef = useRef<ForceGraphMethods<NodeObject<GraphNode>, LinkObject<GraphNode, GraphLink>> | undefined>(
    undefined
  );
  const [forceGraphModule, setForceGraphModule] = useState<null | typeof import("react-force-graph-2d")>(null);

  const [size, setSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    let active = true;

    void import("react-force-graph-2d").then((module) => {
      Match.value(active).pipe(
        Match.when(true, () => {
          setForceGraphModule(module);
          return undefined;
        }),
        Match.orElse(() => undefined)
      );
    });

    return () => {
      active = false;
    };
  }, []);

  const normalizedGraphData = useMemo<GraphData<NodeObject<GraphNode>, LinkObject<GraphNode, GraphLink>>>(
    () => ({
      nodes: A.fromIterable(graphData.nodes),
      links: A.fromIterable(graphData.links),
    }),
    [graphData]
  );

  useEffect(() => {
    const element = containerRef.current;

    if (element === null) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      pipe(
        entries,
        A.fromIterable,
        A.head,
        O.match({
          onNone: () => undefined,
          onSome: (entry) => {
            setSize({
              width: entry.contentRect.width,
              height: entry.contentRect.height,
            });
            return undefined;
          },
        })
      );
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    forceGraphRef.current?.d3ReheatSimulation();
  }, [normalizedGraphData.nodes.length, normalizedGraphData.links.length]);

  useEffect(() => {
    Match.value(normalizedGraphData.nodes.length > 0).pipe(
      Match.when(true, () => {
        forceGraphRef.current?.zoomToFit(350, 40);
        return undefined;
      }),
      Match.orElse(() => undefined)
    );
  }, [normalizedGraphData.nodes.length]);

  return (
    <div ref={containerRef} className="h-full w-full">
      {Match.value(forceGraphModule).pipe(
        Match.when(null, () => <div className="h-full w-full bg-slate-950" />),
        Match.orElse((module) => {
          const Graph2D = module.default;

          return (
            <Graph2D<NodeObject<GraphNode>, LinkObject<GraphNode, GraphLink>>
              ref={forceGraphRef}
              graphData={normalizedGraphData}
              width={size.width}
              height={size.height}
              backgroundColor="#020617"
              nodeLabel={(node) => `${node.name}\n${node.type}`}
              nodeRelSize={6}
              nodeVal={(node) =>
                Match.value(
                  pipe(
                    selectedNodeId,
                    O.match({
                      onNone: () => false,
                      onSome: (nodeId) => nodeId === node.id,
                    })
                  )
                ).pipe(
                  Match.when(true, () => 2.2),
                  Match.orElse(() => 1)
                )
              }
              nodeColor={(node) => {
                const nodeId = toNodeId(node);
                const selected = pipe(
                  selectedNodeId,
                  O.match({
                    onNone: () => false,
                    onSome: (value) => value === nodeId,
                  })
                );

                return Match.value(selected || hasNodeId(highlightedNodeIds, nodeId)).pipe(
                  Match.when(true, () => "#f97316"),
                  Match.orElse(() => nodeColorByType(node.type))
                );
              }}
              linkLabel={(link) => link.label}
              linkColor={(link) => {
                const source = `${link.source}`;
                const target = `${link.target}`;
                const touchesHighlighted =
                  hasNodeId(highlightedNodeIds, source) || hasNodeId(highlightedNodeIds, target);

                return Match.value(touchesHighlighted).pipe(
                  Match.when(true, () => "#fb7185"),
                  Match.orElse(() => "rgba(148, 163, 184, 0.45)")
                );
              }}
              linkWidth={(link) => {
                const source = `${link.source}`;
                const target = `${link.target}`;
                const touchesHighlighted =
                  hasNodeId(highlightedNodeIds, source) || hasNodeId(highlightedNodeIds, target);

                return Match.value(touchesHighlighted).pipe(
                  Match.when(true, () => 2),
                  Match.orElse(() => 1)
                );
              }}
              nodeCanvasObject={(node, context, globalScale) => {
                const label = node.name;
                const fontSize = 12 / globalScale;

                context.font = `${fontSize}px var(--font-geist-sans)`;
                context.textAlign = "center";
                context.textBaseline = "middle";

                const textWidth = context.measureText(label).width;
                const backgroundPadding = fontSize * 0.5;

                context.fillStyle = "rgba(2, 6, 23, 0.85)";
                context.fillRect(
                  node.x ? node.x - textWidth / 2 - backgroundPadding : 0,
                  node.y ? node.y + 10 / globalScale : 0,
                  textWidth + backgroundPadding * 2,
                  fontSize + 4
                );

                context.fillStyle = "#e2e8f0";
                context.fillText(label, node.x ?? 0, (node.y ?? 0) + 16 / globalScale);
              }}
              onNodeClick={(node) =>
                pipe(
                  decodeGraphNode(node),
                  O.match({
                    onNone: () => undefined,
                    onSome: onNodeClick,
                  })
                )
              }
              onBackgroundClick={onBackgroundClick}
            />
          );
        })
      )}
    </div>
  );
}
