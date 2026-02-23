import { thunkEffectVoid } from "@beep/utils";
import * as Data from "effect/Data";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Eq from "effect/Equal";
import * as Fiber from "effect/Fiber";
import * as Graph from "effect/Graph";
import * as O from "effect/Option";
import * as Ref from "effect/Ref";
import type { EffectGraphModel, VizGraph, VizLink, VizNode } from "./model";
import { modelFromEffectGraph, toEffectGraph } from "./model";
import { renderFrame, type ViewTransform } from "./render";

export type PointerInput = {
  readonly clientX: number;
  readonly clientY: number;
  readonly buttons: number;
  readonly button: number;
  readonly pointerId: number;
  readonly shiftKey: boolean;
  readonly ctrlKey: boolean;
  readonly altKey: boolean;
  readonly metaKey: boolean;
};

export type WheelInput = {
  readonly clientX: number;
  readonly clientY: number;
  readonly deltaY: number;
};

export type ResizeInput = {
  readonly width: number; // CSS pixels
  readonly height: number; // CSS pixels
  readonly dpr: number;
};

export type ForceGraphSimulation = {
  readonly start: (canvas: HTMLCanvasElement) => Effect.Effect<Fiber.RuntimeFiber<never, never>>;
  readonly stop: (fiber: Fiber.RuntimeFiber<never, never>) => Effect.Effect<void>;
  readonly setGraph: (viz: VizGraph) => Effect.Effect<void>;
  readonly setShowLinkLabels: (show: boolean) => Effect.Effect<void>;
  readonly setHighlight: (
    highlight: ReadonlySet<string>,
    hoveredId: string | null,
    selectedId: string | null
  ) => Effect.Effect<void>;
  readonly onPointerDown: (input: PointerInput) => Effect.Effect<void>;
  readonly onPointerMove: (input: PointerInput) => Effect.Effect<void>;
  readonly onPointerUp: (input: PointerInput) => Effect.Effect<void>;
  readonly onWheel: (input: WheelInput) => Effect.Effect<void>;
  readonly onResize: (input: ResizeInput) => Effect.Effect<void>;
  readonly pickNodeAt: (clientX: number, clientY: number) => Effect.Effect<string | null>;
  readonly getTransform: Effect.Effect<ViewTransform>;
};
export type DragState = Data.TaggedEnum<{
  readonly none: {};
  pan: {
    readonly pointerId: number;
    readonly startClientX: number;
    readonly startClientY: number;
    readonly startOffsetX: number;
    readonly startOffsetY: number;
  };
  node: {
    readonly pointerId: number;
    readonly nodeId: string;
    readonly offsetWorldX: number;
    readonly offsetWorldY: number;
  };
}>;

export const DragState = Data.taggedEnum<DragState>();

type State = {
  readonly canvas: HTMLCanvasElement | null;
  readonly ctx: CanvasRenderingContext2D | null;
  readonly width: number;
  readonly height: number;
  readonly dpr: number;
  readonly transform: ViewTransform;
  readonly nodes: Array<VizNode>;
  readonly nodeById: Map<string, VizNode>;
  readonly links: Array<VizLink>;
  readonly degreeById: Map<string, number>;
  readonly highlightIds: ReadonlySet<string>;
  readonly hoveredId: string | null;
  readonly selectedId: string | null;
  readonly showLinkLabels: boolean;
  readonly drag: DragState;
  readonly model: EffectGraphModel | null;
};

const defaultTransform: ViewTransform = {
  offsetX: 0,
  offsetY: 0,
  scale: 1,
};

const clamp = (n: number, min: number, max: number): number => (n < min ? min : n > max ? max : n);

const screenToWorld = (s: State, clientX: number, clientY: number): { readonly x: number; readonly y: number } => {
  const rect = s.canvas?.getBoundingClientRect();
  const sx = rect ? clientX - rect.left : clientX;
  const sy = rect ? clientY - rect.top : clientY;
  const x = (sx - s.transform.offsetX) / s.transform.scale;
  const y = (sy - s.transform.offsetY) / s.transform.scale;
  return { x, y };
};

const pickNodeId = (s: State, worldX: number, worldY: number): string | null => {
  // Linear scan is fine for <= 250 nodes; avoid allocations.
  let bestId: string | null = null;
  let bestD2 = Number.POSITIVE_INFINITY;

  for (const node of s.nodes) {
    const dx = node.x - worldX;
    const dy = node.y - worldY;
    const d2 = dx * dx + dy * dy;

    const degree = s.degreeById.get(node.id) ?? 0;
    const r = 4 + Math.sqrt(Math.min(40, Math.max(0, degree))) * 1.6 + clamp(node.confidence, 0, 1) * 3;
    const hit = r + 6;
    if (d2 <= hit * hit && d2 < bestD2) {
      bestD2 = d2;
      bestId = node.id;
    }
  }

  return bestId;
};

const rebuildDerived = (
  viz: VizGraph
): {
  readonly nodes: Array<VizNode>;
  readonly nodeById: Map<string, VizNode>;
  readonly links: Array<VizLink>;
  readonly degreeById: Map<string, number>;
  readonly model: EffectGraphModel;
} => {
  const nodes = viz.nodes.map((n) => ({ ...n }));
  const links = viz.links.map((l) => ({ ...l }));

  const nodeById = new Map<string, VizNode>();
  for (const n of nodes) nodeById.set(n.id, n);

  const base = toEffectGraph({ ...viz, nodes, links });
  const model = modelFromEffectGraph(base.graph);

  const degreeById = new Map<string, number>();
  for (const [idx, node] of Graph.entries(Graph.nodes(model.graph))) {
    const incoming = Graph.neighborsDirected(model.graph, idx, "incoming").length;
    const outgoing = Graph.neighborsDirected(model.graph, idx, "outgoing").length;
    degreeById.set(node.id, incoming + outgoing);
  }

  return { nodes, nodeById, links, degreeById, model };
};

const applyForces = (s: State): void => {
  const nodes = s.nodes;
  const n = nodes.length;
  const links = s.links;

  // Tuned for 50-250 nodes; stable defaults.
  const repulsion = 1400;
  const springK = 0.015;
  const restLength = 70;
  const centerK = 0.0025;
  const collisionK = 0.08;
  const damping = 0.88;
  const maxSpeed = 14;

  // Pairwise repulsion + collision
  for (let i = 0; i < n; i++) {
    const a = nodes[i]!;
    for (let j = i + 1; j < n; j++) {
      const b = nodes[j]!;
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const d2 = dx * dx + dy * dy + 0.01;
      const d = Math.sqrt(d2);

      const f = repulsion / d2;
      const fx = (dx / d) * f;
      const fy = (dy / d) * f;

      // Collision: stronger separation near overlap radius
      const da =
        4 + Math.sqrt(Math.min(40, Math.max(0, s.degreeById.get(a.id) ?? 0))) * 1.6 + clamp(a.confidence, 0, 1) * 3;
      const db =
        4 + Math.sqrt(Math.min(40, Math.max(0, s.degreeById.get(b.id) ?? 0))) * 1.6 + clamp(b.confidence, 0, 1) * 3;
      const minD = da + db + 6;
      const overlap = minD - d;
      const c = overlap > 0 ? (overlap / minD) * collisionK : 0;
      const cfx = (dx / d) * c;
      const cfy = (dy / d) * c;

      if (!a.pinned) {
        a.vx += fx + cfx;
        a.vy += fy + cfy;
      }
      if (!b.pinned) {
        b.vx -= fx + cfx;
        b.vy -= fy + cfy;
      }
    }
  }

  // Spring forces
  for (const link of links) {
    const sNode = s.nodeById.get(link.sourceId);
    const tNode = s.nodeById.get(link.targetId);
    if (!sNode || !tNode) continue;

    const dx = tNode.x - sNode.x;
    const dy = tNode.y - sNode.y;
    const d = Math.sqrt(dx * dx + dy * dy) + 0.0001;
    const stretch = d - restLength;
    const k = springK * (0.6 + clamp(link.confidence, 0, 1) * 1.2);
    const f = k * stretch;
    const fx = (dx / d) * f;
    const fy = (dy / d) * f;

    if (!sNode.pinned) {
      sNode.vx += fx;
      sNode.vy += fy;
    }
    if (!tNode.pinned) {
      tNode.vx -= fx;
      tNode.vy -= fy;
    }
  }

  // Centering + integrate
  for (const node of nodes) {
    if (!node.pinned) {
      node.vx += -node.x * centerK;
      node.vy += -node.y * centerK;
    }

    node.vx *= damping;
    node.vy *= damping;

    const sp = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
    if (sp > maxSpeed) {
      const m = maxSpeed / sp;
      node.vx *= m;
      node.vy *= m;
    }

    if (!node.pinned) {
      node.x += node.vx;
      node.y += node.vy;
    } else {
      node.vx = 0;
      node.vy = 0;
    }
  }
};

// CanvasRenderingContext2D fillStyle does not accept CSS gradients as strings.
// Keep the background subtle and let nodes/links provide visual richness.
const backgroundFill = "#F6F8FB";

const drawSafe = (s: State): void => {
  if (!s.ctx) return;
  renderFrame({
    ctx: s.ctx,
    width: s.width,
    height: s.height,
    dpr: s.dpr,
    transform: s.transform,
    nodes: s.nodes,
    nodeById: s.nodeById,
    links: s.links,
    degreeById: s.degreeById,
    showLinkLabels: s.showLinkLabels,
    highlightIds: s.highlightIds,
    hoveredId: s.hoveredId,
    selectedId: s.selectedId,
    background: backgroundFill,
  });
};

export const makeForceGraphSimulation: Effect.Effect<ForceGraphSimulation> = Effect.gen(function* () {
  const ref = yield* Ref.make<State>({
    canvas: null,
    ctx: null,
    width: 1,
    height: 1,
    dpr: 1,
    transform: defaultTransform,
    nodes: [],
    nodeById: new Map(),
    links: [],
    degreeById: new Map(),
    highlightIds: new Set(),
    hoveredId: null,
    selectedId: null,
    showLinkLabels: false,
    drag: { _tag: "none" },
    model: null,
  });

  const tick = Effect.gen(function* () {
    while (true) {
      const s = yield* Ref.get(ref);
      if (s.ctx) {
        applyForces(s);
        drawSafe(s);
      }
      yield* Effect.sleep(Duration.millis(16));
    }
  });

  const start: ForceGraphSimulation["start"] = (canvas) =>
    Effect.gen(function* () {
      const ctx = canvas.getContext("2d");
      if (ctx === null) {
        // No rendering possible; still return a fiber so lifecycle stays consistent.
        return yield* Effect.fork(Effect.never);
      }

      yield* Ref.update(ref, (s) => ({ ...s, canvas, ctx }));
      // First paint
      const s = yield* Ref.get(ref);
      if (s.ctx) drawSafe(s);
      return yield* Effect.fork(tick);
    });

  const stop: ForceGraphSimulation["stop"] = (fiber) => Fiber.interrupt(fiber).pipe(Effect.asVoid);

  const setGraph: ForceGraphSimulation["setGraph"] = (viz) =>
    Effect.gen(function* () {
      const derived = rebuildDerived(viz);
      yield* Ref.update(ref, (s) => ({
        ...s,
        nodes: derived.nodes,
        nodeById: derived.nodeById,
        links: derived.links,
        degreeById: derived.degreeById,
        model: derived.model,
      }));
      const s2 = yield* Ref.get(ref);
      if (s2.ctx) drawSafe(s2);
    });

  const setShowLinkLabels: ForceGraphSimulation["setShowLinkLabels"] = (show) =>
    Ref.update(ref, (s) => ({ ...s, showLinkLabels: show }));

  const setHighlight: ForceGraphSimulation["setHighlight"] = (highlight, hoveredId, selectedId) =>
    Ref.update(ref, (s) => ({ ...s, highlightIds: highlight, hoveredId, selectedId }));

  const onResize: ForceGraphSimulation["onResize"] = (input) =>
    Effect.gen(function* () {
      const s = yield* Ref.get(ref);
      if (!s.canvas) return;

      const dpr = input.dpr <= 0 ? 1 : input.dpr;
      const w = Math.max(1, Math.floor(input.width));
      const h = Math.max(1, Math.floor(input.height));

      // Backing store in device pixels, CSS size handled by React layout.
      s.canvas.width = Math.floor(w * dpr);
      s.canvas.height = Math.floor(h * dpr);

      yield* Ref.update(ref, (prev) => {
        // Keep the view centered on first resize.
        const isDefaultOffsets = prev.transform.offsetX === 0 && prev.transform.offsetY === 0;
        const nextTransform = isDefaultOffsets ? { ...prev.transform, offsetX: w / 2, offsetY: h / 2 } : prev.transform;
        return { ...prev, width: w, height: h, dpr, transform: nextTransform };
      });

      const s2 = yield* Ref.get(ref);
      if (s2.ctx) drawSafe(s2);
    });

  const onWheel: ForceGraphSimulation["onWheel"] = (input) =>
    Effect.gen(function* () {
      const s = yield* Ref.get(ref);
      if (!s.canvas) return;

      const before = screenToWorld(s, input.clientX, input.clientY);
      const zoom = Math.exp(-input.deltaY * 0.0012);
      const nextScale = clamp(s.transform.scale * zoom, 0.12, 3.5);

      const rect = s.canvas.getBoundingClientRect();
      const sx = input.clientX - rect.left;
      const sy = input.clientY - rect.top;

      const nextOffsetX = sx - before.x * nextScale;
      const nextOffsetY = sy - before.y * nextScale;

      yield* Ref.update(ref, (prev) => ({
        ...prev,
        transform: { offsetX: nextOffsetX, offsetY: nextOffsetY, scale: nextScale },
      }));
    });

  const onPointerDown: ForceGraphSimulation["onPointerDown"] = (input) =>
    Effect.gen(function* () {
      const s = yield* Ref.get(ref);
      if (!s.canvas) return;
      if (input.button !== 0) return;

      const { x, y } = screenToWorld(s, input.clientX, input.clientY);
      const hit = pickNodeId(s, x, y);

      if (hit) {
        const node = s.nodeById.get(hit);
        if (!node) return;
        node.pinned = true;
        const dx = node.x - x;
        const dy = node.y - y;
        yield* Ref.update(ref, (prev) => ({
          ...prev,
          drag: DragState.node({ pointerId: input.pointerId, nodeId: hit, offsetWorldX: dx, offsetWorldY: dy }),
        }));
      } else {
        yield* Ref.update(ref, (prev) => ({
          ...prev,
          drag: DragState.pan({
            pointerId: input.pointerId,
            startClientX: input.clientX,
            startClientY: input.clientY,
            startOffsetX: prev.transform.offsetX,
            startOffsetY: prev.transform.offsetY,
          }),
        }));
      }
    });

  const onPointerMove: ForceGraphSimulation["onPointerMove"] = Effect.fn(function* (input) {
    const s = yield* Ref.get(ref);
    if (!s.canvas) return;
    yield* DragState.$match(s.drag, {
      pan: Effect.fn(function* (drag) {
        if (Eq.equals(input.pointerId)(drag.pointerId)) {
          const dx = input.clientX - drag.startClientX;
          const dy = input.clientY - drag.startClientY;
          yield* Ref.update(ref, (prev) => ({
            ...prev,
            transform: { ...prev.transform, offsetX: drag.startOffsetX + dx, offsetY: drag.startOffsetY + dy },
          }));
        }
        return yield* Effect.void;
      }),
      node: Effect.fn(function* (drag) {
        const nodeOpt = O.fromNullable(s.nodeById.get(drag.nodeId));
        if (Eq.equals(drag.pointerId)(input.pointerId) && O.isSome(nodeOpt)) {
          const node = nodeOpt.value;
          const { x, y } = screenToWorld(s, input.clientX, input.clientY);
          node.x = x + drag.offsetWorldX;
          node.y = y + drag.offsetWorldY;
          node.vx = 0;
          node.vy = 0;
          return Effect.asVoid;
        }
        return yield* Effect.void;
      }),
      none: thunkEffectVoid,
    });
  });

  const onPointerUp: ForceGraphSimulation["onPointerUp"] = (input) =>
    Effect.gen(function* () {
      const s = yield* Ref.get(ref);
      if (s.drag._tag === "node" && s.drag.pointerId === input.pointerId) {
        const node = s.nodeById.get(s.drag.nodeId);
        if (node) node.pinned = false;
        yield* Ref.update(ref, (prev) => ({ ...prev, drag: DragState.none() }));
        return;
      }
      if (s.drag._tag === "pan" && s.drag.pointerId === input.pointerId) {
        yield* Ref.update(ref, (prev) => ({ ...prev, drag: DragState.none() }));
      }
    });

  const pickNodeAt: ForceGraphSimulation["pickNodeAt"] = (clientX, clientY) =>
    Effect.gen(function* () {
      const s = yield* Ref.get(ref);
      if (!s.canvas) return null;
      const { x, y } = screenToWorld(s, clientX, clientY);
      return pickNodeId(s, x, y);
    });

  const getTransform: ForceGraphSimulation["getTransform"] = Ref.get(ref).pipe(Effect.map((s) => s.transform));

  return {
    start,
    stop,
    setGraph,
    setShowLinkLabels,
    setHighlight,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onWheel,
    onResize,
    pickNodeAt,
    getTransform,
  };
});
