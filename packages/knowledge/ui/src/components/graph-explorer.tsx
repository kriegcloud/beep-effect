"use client";

import * as Effect from "effect/Effect";
import type * as Fiber from "effect/Fiber";
import * as O from "effect/Option";
import * as React from "react";
import type { KnowledgeGraph } from "../fixtures/knowledgeGraph";
import { fromKnowledgeGraph, neighbors, toEffectGraph } from "../viz/model";
import {
  makeForceGraphSimulation,
  type ForceGraphSimulation,
  type PointerInput,
  type ResizeInput,
  type WheelInput,
} from "../viz/simulation";

interface GraphExplorerProps {
  readonly graph: KnowledgeGraph;
  readonly className?: string | undefined;
  readonly onNodeClick?: ((nodeId: string) => void) | undefined;
}

const runSync = <A,>(effect: Effect.Effect<A>): Promise<A> => Effect.runPromise(effect);

export function GraphExplorer({ graph, className, onNodeClick }: GraphExplorerProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const hostRef = React.useRef<HTMLDivElement | null>(null);
  const simRef = React.useRef<ForceGraphSimulation | null>(null);
  const fiberRef = React.useRef<Fiber.RuntimeFiber<never, never> | null>(null);

  const [hoveredId, setHoveredId] = React.useState<string | null>(null);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const hoverRafRef = React.useRef<number | null>(null);
  const pointerDownRef = React.useRef<{ clientX: number; clientY: number; nodeId: string | null } | null>(null);

  const viz = React.useMemo(() => fromKnowledgeGraph(graph), [graph]);
  const model = React.useMemo(() => toEffectGraph(viz), [viz]);

  const highlightIds = React.useMemo(() => {
    const set = new Set<string>();
    const addNeighborhood = (id: string) => {
      set.add(id);
      for (const node of neighbors(model, id)) set.add(node.id);
    };
    if (hoveredId) addNeighborhood(hoveredId);
    if (selectedId) addNeighborhood(selectedId);
    return set;
  }, [model, hoveredId, selectedId]);

  // Boot simulation
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let disposed = false;

    void runSync(
      Effect.gen(function* () {
        const sim = yield* makeForceGraphSimulation;
        if (disposed) return;
        simRef.current = sim;
        const fiber = yield* sim.start(canvas);
        if (disposed) {
          yield* sim.stop(fiber);
          return;
        }
        fiberRef.current = fiber;
      }).pipe(Effect.asVoid)
    );

    return () => {
      disposed = true;
      const sim = simRef.current;
      const fiber = fiberRef.current;
      if (sim && fiber) {
        void runSync(sim.stop(fiber));
      }
      simRef.current = null;
      fiberRef.current = null;
    };
  }, []);

  // Push graph data
  React.useEffect(() => {
    const sim = simRef.current;
    if (!sim) return;
    void runSync(sim.setGraph(viz));
  }, [viz]);

  // Push highlight state
  React.useEffect(() => {
    const sim = simRef.current;
    if (!sim) return;
    void runSync(sim.setHighlight(highlightIds, hoveredId, selectedId).pipe(Effect.asVoid));
  }, [highlightIds, hoveredId, selectedId]);

  // ResizeObserver
  React.useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const ro = new ResizeObserver((entries) => {
      const entry = O.fromNullable(entries[0]);
      if (O.isNone(entry)) return;
      const cr = entry.value.contentRect;
      const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
      const input: ResizeInput = { width: cr.width, height: cr.height, dpr };
      const sim = simRef.current;
      if (sim) void runSync(sim.onResize(input));
    });

    ro.observe(host);
    return () => ro.disconnect();
  }, []);

  const toPointerInput = (e: React.PointerEvent<HTMLCanvasElement>): PointerInput => ({
    clientX: e.clientX,
    clientY: e.clientY,
    buttons: e.buttons,
    button: e.button,
    pointerId: e.pointerId,
    shiftKey: e.shiftKey,
    ctrlKey: e.ctrlKey,
    altKey: e.altKey,
    metaKey: e.metaKey,
  });

  const toWheelInput = (e: React.WheelEvent<HTMLCanvasElement>): WheelInput => ({
    clientX: e.clientX,
    clientY: e.clientY,
    deltaY: e.deltaY,
  });

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const sim = simRef.current;
    if (!sim) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    void runSync(
      sim.pickNodeAt(e.clientX, e.clientY).pipe(
        Effect.tap((nodeId) =>
          Effect.sync(() => {
            pointerDownRef.current = { clientX: e.clientX, clientY: e.clientY, nodeId };
          })
        ),
        Effect.tap(() => sim.onPointerDown(toPointerInput(e))),
        Effect.asVoid
      )
    );
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const sim = simRef.current;
    if (!sim) return;
    void runSync(sim.onPointerMove(toPointerInput(e)));

    if (hoverRafRef.current !== null) return;
    hoverRafRef.current = window.requestAnimationFrame(() => {
      hoverRafRef.current = null;
      void runSync(
        sim.pickNodeAt(e.clientX, e.clientY).pipe(
          Effect.tap((nodeId) => Effect.sync(() => setHoveredId(nodeId))),
          Effect.asVoid
        )
      );
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const sim = simRef.current;
    if (!sim) return;
    void runSync(sim.onPointerUp(toPointerInput(e)));

    const down = pointerDownRef.current;
    pointerDownRef.current = null;
    if (!down) return;

    const dx = e.clientX - down.clientX;
    const dy = e.clientY - down.clientY;
    const moved = Math.sqrt(dx * dx + dy * dy);
    if (moved > 6) return;
    if (!down.nodeId) return;

    setSelectedId(down.nodeId);
    onNodeClick?.(down.nodeId);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    const sim = simRef.current;
    if (!sim) return;
    e.preventDefault();
    void runSync(sim.onWheel(toWheelInput(e)));
  };

  return (
    <div ref={hostRef} className={className} style={{ position: "relative" }}>
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", touchAction: "none", cursor: hoveredId ? "grab" : "default" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
      />
    </div>
  );
}
