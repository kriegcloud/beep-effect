import { useApplication } from "@pixi/react";
import Matter from "matter-js";
import React from "react";

import { RESOLUTION } from "../constants";
import { useEngine } from "./World";

const DRAG_STIFFNESS = 0.6;
const MIN_ZOOM = 0.15;
const MAX_ZOOM = 5;

interface MouseProps {
  children: React.ReactNode;
  zoom: number;
  offset: { x: number; y: number };
  onZoomChange: (zoom: number, offset: { x: number; y: number }) => void;
  onOffsetChange: (offset: { x: number; y: number }) => void;
}

export const Mouse: React.FC<MouseProps> = ({ children, zoom, offset, onZoomChange, onOffsetChange }) => {
  const { app } = useApplication();
  const engine = useEngine();
  const mcRef = React.useRef<Matter.MouseConstraint | null>(null);
  const isPanningRef = React.useRef(false);
  const lastPanRef = React.useRef({ x: 0, y: 0 });

  // Keep refs in sync so event handlers never read stale values
  const zoomRef = React.useRef(zoom);
  const offsetRef = React.useRef(offset);
  const onZoomRef = React.useRef(onZoomChange);
  const onOffsetRef = React.useRef(onOffsetChange);
  zoomRef.current = zoom;
  offsetRef.current = offset;
  onZoomRef.current = onZoomChange;
  onOffsetRef.current = onOffsetChange;

  // Setup Matter.js mouse constraint (runs once)
  React.useEffect(() => {
    if (!engine || !app?.canvas) return;
    const canvas = app.canvas as HTMLCanvasElement;

    const mouse = Matter.Mouse.create(canvas);
    const mc = Matter.MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: DRAG_STIFFNESS },
    });

    // Initial coordinate mapping
    const s = 1 / (RESOLUTION * zoomRef.current);
    Matter.Mouse.setScale(mouse, { x: s, y: s });

    mcRef.current = mc;
    Matter.World.add(engine.world, mc);

    // Cursor feedback while dragging a node
    Matter.Events.on(mc, "startdrag", () => {
      canvas.style.cursor = "grabbing";
    });
    Matter.Events.on(mc, "enddrag", () => {
      canvas.style.cursor = "";
    });

    return () => {
      Matter.Events.off(mc, "startdrag");
      Matter.Events.off(mc, "enddrag");
      Matter.World.remove(engine.world, mc);
      mcRef.current = null;
    };
  }, [app, engine]);

  // Sync Matter.Mouse coordinate mapping when zoom/pan changes
  React.useEffect(() => {
    const mc = mcRef.current;
    if (!mc) return;
    const s = 1 / (RESOLUTION * zoom);
    Matter.Mouse.setScale(mc.mouse, { x: s, y: s });
    Matter.Mouse.setOffset(mc.mouse, {
      x: -offset.x / zoom,
      y: -offset.y / zoom,
    });
  }, [zoom, offset]);

  // Canvas event listeners: wheel zoom + pointer pan (registered once)
  React.useEffect(() => {
    const canvas = app?.canvas as HTMLCanvasElement | undefined;
    if (!canvas || !engine) return;

    // --- Wheel → zoom toward cursor ---
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const z = zoomRef.current;
      const off = offsetRef.current;
      const factor = e.deltaY > 0 ? 0.92 : 1 / 0.92;
      const nz = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z * factor));
      const mx = e.offsetX;
      const my = e.offsetY;
      // Keep the world-point under the cursor fixed
      onZoomRef.current(nz, {
        x: mx - (mx - off.x) * (nz / z),
        y: my - (my - off.y) * (nz / z),
      });
    };

    // --- Pointer → pan on empty space, let Matter drag nodes ---
    const handleDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const z = zoomRef.current;
      const off = offsetRef.current;
      // Screen → physics world
      const wx = (e.offsetX - off.x) / z;
      const wy = (e.offsetY - off.y) / z;
      const bodies = Matter.Composite.allBodies(engine.world).filter((b) => !b.isStatic);
      const hit = Matter.Query.point(bodies, { x: wx, y: wy });

      if (hit.length === 0) {
        // Empty space → pan
        isPanningRef.current = true;
        lastPanRef.current = { x: e.clientX, y: e.clientY };
        canvas.style.cursor = "grabbing";
        // Prevent Matter from accidentally grabbing a body mid-pan
        if (mcRef.current) mcRef.current.constraint.stiffness = 0;
      }
    };

    const handleMove = (e: PointerEvent) => {
      if (!isPanningRef.current) return;
      const dx = e.clientX - lastPanRef.current.x;
      const dy = e.clientY - lastPanRef.current.y;
      lastPanRef.current = { x: e.clientX, y: e.clientY };
      const off = offsetRef.current;
      onOffsetRef.current({ x: off.x + dx, y: off.y + dy });
    };

    const handleUp = () => {
      if (isPanningRef.current) {
        isPanningRef.current = false;
        canvas.style.cursor = "";
        if (mcRef.current) mcRef.current.constraint.stiffness = DRAG_STIFFNESS;
      }
    };

    canvas.addEventListener("wheel", handleWheel, { passive: false });
    canvas.addEventListener("pointerdown", handleDown);
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);

    return () => {
      canvas.removeEventListener("wheel", handleWheel);
      canvas.removeEventListener("pointerdown", handleDown);
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [app, engine]);

  return <React.Fragment>{children}</React.Fragment>;
};
