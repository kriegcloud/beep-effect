"use client";

import { Application, extend } from "@pixi/react";
import { Container, Graphics, Text } from "pixi.js";
import React from "react";
import { RESOLUTION, SCALE } from "../constants";
import { createConnections } from "../logic/createConnections";
import { createEdges } from "../logic/createEdges";
import { createNodes, type NodeType } from "../logic/createNodes";
import { fake_tags } from "../mocks/tags";
import { Border } from "./Border";
import { Label } from "./Label";
import { Line } from "./Line";
import { Mouse } from "./Mouse";
import { Node } from "./Node";
import { World } from "./World";

extend({ Container, Graphics, Text });

export const Graph: React.FC = () => {
  const tags = fake_tags;
  const connections = createConnections(tags);
  const edges = createEdges(connections);
  const [nodes, setNodes] = React.useState<NodeType[]>(createNodes(connections));
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Viewport: zoom + pan
  const [zoom, setZoom] = React.useState(1);
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });

  // Center the graph in the viewport on first mount
  React.useEffect(() => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    setOffset({
      x: (clientWidth - SCALE) / 2,
      y: (clientHeight - SCALE) / 2,
    });
  }, []);

  const handleZoomChange = React.useCallback((newZoom: number, newOffset: { x: number; y: number }) => {
    setZoom(newZoom);
    setOffset(newOffset);
  }, []);

  const handleOffsetChange = React.useCallback((newOffset: { x: number; y: number }) => {
    setOffset(newOffset);
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 w-screen h-screen bg-black [&_canvas]:select-none">
      <Application resizeTo={containerRef} resolution={RESOLUTION} antialias background="#000000">
        <World>
          <Mouse zoom={zoom} offset={offset} onZoomChange={handleZoomChange} onOffsetChange={handleOffsetChange}>
            <pixiContainer x={offset.x} y={offset.y} scale={zoom}>
              <Border />
              {edges.map(({ source, target }) => {
                const sourceNode = nodes.find((node) => node.key === source);
                const targetNode = nodes.find((node) => node.key === target);
                if (!sourceNode) return null;
                if (!targetNode) return null;
                return (
                  <Line
                    key={`${source}-${target}`}
                    x1={sourceNode.position.x}
                    y1={sourceNode.position.y}
                    x2={targetNode.position.x}
                    y2={targetNode.position.y}
                    color="#555555"
                  />
                );
              })}
              {nodes.map((node) => {
                return (
                  <React.Fragment key={node.key}>
                    <Label
                      text={node.key}
                      anchor={0.5}
                      x={node.position.x}
                      y={node.position.y + 20}
                      opacity={1}
                      color="#ffffff"
                    />
                    <Node x={node.position.x} y={node.position.y} radius={20} setNodes={setNodes} id={node.key} />
                  </React.Fragment>
                );
              })}
            </pixiContainer>
          </Mouse>
        </World>
      </Application>
    </div>
  );
};
