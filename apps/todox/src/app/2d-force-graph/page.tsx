"use client";

import { KnowledgeGraph } from "@beep/knowledge-server/Extraction";
import { makeRunClientPromise, useRuntime } from "@beep/runtime-client";
import {
  Box,
  Button,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import * as Arbitrary from "effect/Arbitrary";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as FC from "effect/FastCheck";
import type * as Fiber from "effect/Fiber";
import * as Str from "effect/String";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  degree,
  filterByTypeIri,
  fromKnowledgeGraph,
  neighbors,
  neighborsDirected,
  toEffectGraph,
  type VizGraph,
  type VizLiteralRelation,
  type VizNode,
  vizFromEffectGraph,
} from "../../features/knowledge-graph/viz/model";
import {
  type ForceGraphSimulation,
  makeForceGraphSimulation,
  type PointerInput,
  type ResizeInput,
  type WheelInput,
} from "../../features/knowledge-graph/viz/simulation";

const SchemaOrgTypes = [
  "https://schema.org/Event",
  "https://schema.org/Organization",
  "https://schema.org/Person",
  "https://schema.org/Place",
  "https://schema.org/LocalBusiness",
  "https://schema.org/Product",
  "https://schema.org/Offer",
  "https://schema.org/Action",
] as const;

type TypeFilter = "all" | (typeof SchemaOrgTypes)[number];

type PointerDownInfo = {
  readonly clientX: number;
  readonly clientY: number;
  readonly nodeId: string | null;
};

const emptySet = new Set<string>();

const groupLiterals = (
  rels: ReadonlyArray<VizLiteralRelation>
): ReadonlyArray<{ readonly predicate: string; readonly items: ReadonlyArray<VizLiteralRelation> }> => {
  const map = new Map<string, Array<VizLiteralRelation>>();
  for (const r of rels) {
    const bucket = map.get(r.predicate);
    if (bucket) bucket.push(r);
    else map.set(r.predicate, [r]);
  }
  const out: Array<{ predicate: string; items: ReadonlyArray<VizLiteralRelation> }> = [];
  for (const [predicate, items] of map.entries()) {
    out.push({ predicate, items });
  }
  out.sort((a, b) => a.predicate.localeCompare(b.predicate));
  return out;
};

const compactIri = (iri: string): string => {
  const hash = iri.lastIndexOf("#");
  if (hash >= 0 && hash + 1 < iri.length) return iri.slice(hash + 1);
  const slash = iri.lastIndexOf("/");
  if (slash >= 0 && slash + 1 < iri.length) return iri.slice(slash + 1);
  return iri;
};

const findByMention = (viz: VizGraph, query: string): VizNode | null => {
  const q = Str.toLowerCase(Str.trim(query));
  if (q.length === 0) return null;
  for (const n of viz.nodes) {
    if (Str.toLowerCase(n.label).includes(q)) return n;
  }
  return null;
};

const computeHighlight = (
  viz: VizGraph,
  model: ReturnType<typeof toEffectGraph>,
  hoveredId: string | null,
  selectedId: string | null,
  query: string
): ReadonlySet<string> => {
  const set = new Set<string>();

  const addNeighborhood = (id: string) => {
    set.add(id);
    for (const node of neighbors(model, id)) set.add(node.id);
  };

  const match = findByMention(viz, query);
  if (match) addNeighborhood(match.id);

  if (hoveredId) addNeighborhood(hoveredId);
  if (selectedId) addNeighborhood(selectedId);

  return set;
};

export default function Page() {
  const runtime = useRuntime();
  const run = useMemo(() => makeRunClientPromise(runtime, "todox.2d-force-graph"), [runtime]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasHostRef = useRef<HTMLDivElement | null>(null);

  const simRef = useRef<ForceGraphSimulation | null>(null);
  const simFiberRef = useRef<Fiber.RuntimeFiber<never, never> | null>(null);

  const [seed, setSeed] = useState<number>(42);
  const [showLinkLabels, setShowLinkLabels] = useState(false);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [search, setSearch] = useState("");

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pointerDown, setPointerDown] = useState<PointerDownInfo | null>(null);
  const [cursor, setCursor] = useState<{ readonly x: number; readonly y: number } | null>(null); // canvas-local coords
  const hoverRafRef = useRef<number | null>(null);

  const knowledgeGraph = useMemo(() => {
    const sample = FC.sample(Arbitrary.make(KnowledgeGraph), { seed, numRuns: 1 });
    return sample[0] ?? null;
  }, [seed]);

  const baseViz = useMemo(() => (knowledgeGraph ? fromKnowledgeGraph(knowledgeGraph) : null), [knowledgeGraph]);

  const baseModel = useMemo(() => (baseViz ? toEffectGraph(baseViz) : null), [baseViz]);

  const visibleModel = useMemo(() => {
    if (!baseViz || !baseModel) return null;
    if (typeFilter === "all") return baseModel;
    return filterByTypeIri(baseModel, new Set<string>([typeFilter]));
  }, [baseViz, baseModel, typeFilter]);

  const visibleViz = useMemo(() => {
    if (!baseViz || !visibleModel) return null;
    return vizFromEffectGraph(baseViz, visibleModel);
  }, [baseViz, visibleModel]);

  const highlightIds = useMemo(() => {
    if (!visibleViz || !visibleModel) return emptySet;
    return computeHighlight(visibleViz, visibleModel, hoveredId, selectedId, search);
  }, [visibleViz, visibleModel, hoveredId, selectedId, search]);

  const selectedNode = useMemo(() => {
    if (!visibleViz || !selectedId) return null;
    return visibleViz.nodes.find((n) => n.id === selectedId) ?? null;
  }, [visibleViz, selectedId]);

  const hoveredNode = useMemo(() => {
    if (!visibleViz || !hoveredId) return null;
    return visibleViz.nodes.find((n) => n.id === hoveredId) ?? null;
  }, [visibleViz, hoveredId]);

  // Boot simulation (once).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let disposed = false;

    void run(
      Effect.gen(function* () {
        const sim = yield* makeForceGraphSimulation;
        yield* Effect.sync(() => {
          simRef.current = sim;
        });
        const fiber = yield* sim.start(canvas);
        yield* Effect.sync(() => {
          simFiberRef.current = fiber;
        });
      }).pipe(Effect.asVoid)
    );

    return () => {
      if (disposed) return;
      disposed = true;
      const sim = simRef.current;
      const fiber = simFiberRef.current;
      if (sim && fiber) {
        void run(sim.stop(fiber));
      }
      simRef.current = null;
      simFiberRef.current = null;
    };
  }, [run]);

  // Push graph changes into the simulation.
  useEffect(() => {
    const sim = simRef.current;
    if (!sim || !visibleViz) return;
    void run(sim.setGraph(visibleViz));
  }, [run, visibleViz]);

  // Push render toggles + highlighting into the simulation.
  useEffect(() => {
    const sim = simRef.current;
    if (!sim) return;
    void run(
      Effect.all([sim.setShowLinkLabels(showLinkLabels), sim.setHighlight(highlightIds, hoveredId, selectedId)]).pipe(
        Effect.asVoid
      )
    );
  }, [run, showLinkLabels, highlightIds, hoveredId, selectedId]);

  // ResizeObserver -> canvas size
  useEffect(() => {
    const host = canvasHostRef.current;
    if (!host) return;

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const cr = entry.contentRect;
      const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
      const input: ResizeInput = { width: cr.width, height: cr.height, dpr };
      const sim = simRef.current;
      if (sim) void run(sim.onResize(input));
    });

    ro.observe(host);
    return () => ro.disconnect();
  }, [run]);

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

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const sim = simRef.current;
    if (!sim) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    void run(
      sim.pickNodeAt(e.clientX, e.clientY).pipe(
        Effect.tap((nodeId) =>
          Effect.sync(() => {
            setPointerDown({ clientX: e.clientX, clientY: e.clientY, nodeId });
          })
        ),
        Effect.tap(() => sim.onPointerDown(toPointerInput(e))),
        Effect.asVoid
      )
    );
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const sim = simRef.current;
    if (!sim) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setCursor({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    void run(sim.onPointerMove(toPointerInput(e)));

    if (hoverRafRef.current !== null) return;
    hoverRafRef.current = window.requestAnimationFrame(() => {
      hoverRafRef.current = null;
      void run(
        sim.pickNodeAt(e.clientX, e.clientY).pipe(
          Effect.tap((nodeId) => Effect.sync(() => setHoveredId(nodeId))),
          Effect.asVoid
        )
      );
    });
  };

  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const sim = simRef.current;
    if (!sim) return;
    void run(sim.onPointerUp(toPointerInput(e)));

    const down = pointerDown;
    setPointerDown(null);

    if (!down) return;

    const dx = e.clientX - down.clientX;
    const dy = e.clientY - down.clientY;
    const moved = Math.sqrt(dx * dx + dy * dy);
    if (moved > 6) return;
    if (!down.nodeId) return;

    setSelectedId(down.nodeId);
  };

  const onWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    const sim = simRef.current;
    if (!sim) return;
    e.preventDefault();
    void run(sim.onWheel(toWheelInput(e)));
  };

  const reseed = () => {
    const next = Math.floor(Math.random() * 0x7fffffff);
    setSeed(next);
    setHoveredId(null);
    setSelectedId(null);
  };

  const clearSelection = () => setSelectedId(null);

  const selectedDegree = useMemo(() => {
    if (!visibleModel || !selectedId) return 0;
    return degree(visibleModel, selectedId);
  }, [visibleModel, selectedId]);

  const selectedNeighbors = useMemo(() => {
    if (!visibleModel || !selectedId) return null;
    return neighborsDirected(visibleModel, selectedId);
  }, [visibleModel, selectedId]);

  // If the selected node disappears due to filtering, clear it to avoid confusing inspector state.
  useEffect(() => {
    if (!visibleViz || !selectedId) return;
    const exists = visibleViz.nodes.some((n) => n.id === selectedId);
    if (!exists) setSelectedId(null);
  }, [visibleViz, selectedId]);

  const literalForSelected = useMemo(() => {
    if (!visibleViz || !selectedId) return A.empty<VizLiteralRelation>();
    return visibleViz.literalsBySubjectId[selectedId] ?? A.empty<VizLiteralRelation>();
  }, [visibleViz, selectedId]);

  const tooltipNode = hoveredNode && !selectedNode ? hoveredNode : null;

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "320px 1fr 360px" },
        gap: 2,
        p: 2,
        height: "calc(100vh - 80px)",
        alignItems: "stretch",
      }}
    >
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
          KnowledgeGraph Force View
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Effect-managed simulation loop, Canvas rendering, `effect/Graph` neighborhoods and degrees.
        </Typography>

        <Box sx={{ display: "grid", gap: 1.5 }}>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <TextField
              size="small"
              label="Seed"
              value={String(seed)}
              onChange={(e) => {
                const n = Number(e.target.value);
                if (Number.isFinite(n) && n >= 0) setSeed(Math.floor(n));
              }}
              sx={{ flex: 1 }}
            />
            <Button variant="contained" onClick={reseed}>
              Reseed
            </Button>
          </Box>

          <FormControl size="small">
            <InputLabel id="type-filter-label">Type Filter</InputLabel>
            <Select
              labelId="type-filter-label"
              value={typeFilter}
              label="Type Filter"
              onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
            >
              <MenuItem value="all">All types</MenuItem>
              {SchemaOrgTypes.map((t) => (
                <MenuItem key={t} value={t}>
                  {compactIri(t)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            size="small"
            label="Search mention"
            placeholder="e.g. Alice, Acme, Conference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <FormControlLabel
            control={<Switch checked={showLinkLabels} onChange={(e) => setShowLinkLabels(e.target.checked)} />}
            label="Show link labels"
          />

          <Divider />

          <Box sx={{ display: "grid", gap: 0.75 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Stats
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Seeded demo graph {knowledgeGraph ? "" : "(missing sample)"}
            </Typography>
            <Typography variant="body2">
              Nodes: {visibleViz?.stats.entityCount ?? 0}, Links: {visibleViz?.stats.linkCount ?? 0}, Literals:{" "}
              {visibleViz?.stats.literalRelationCount ?? 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Dropped edges due to missing endpoints: {visibleViz?.stats.droppedLinkCount ?? 0}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Paper
        variant="outlined"
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          position: "relative",
          minHeight: 420,
        }}
      >
        <Box ref={canvasHostRef} sx={{ position: "absolute", inset: 0 }}>
          <canvas
            ref={canvasRef}
            style={{ width: "100%", height: "100%", touchAction: "none", cursor: hoveredId ? "grab" : "default" }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onWheel={onWheel}
          />
        </Box>

        {tooltipNode && cursor && (
          <Paper
            elevation={4}
            sx={{
              position: "absolute",
              left: 0,
              top: 0,
              transform: `translate(${cursor.x + 14}px, ${cursor.y + 12}px)`,
              p: 1.25,
              maxWidth: 320,
              pointerEvents: "none",
              borderRadius: 2,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {tooltipNode.label}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {compactIri(tooltipNode.typeIri)} · confidence {tooltipNode.confidence.toFixed(2)}
            </Typography>
          </Paper>
        )}
      </Paper>

      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, overflow: "auto" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Inspector
          </Typography>
          <Button size="small" onClick={clearSelection} disabled={!selectedNode}>
            Clear
          </Button>
        </Box>

        {!selectedNode ? (
          <Typography variant="body2" color="text.secondary">
            Click a node to lock selection. Hover shows a lightweight tooltip.
          </Typography>
        ) : (
          <Box sx={{ display: "grid", gap: 1.5 }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                {selectedNode.label}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedNode.id}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {compactIri(selectedNode.typeIri)} · confidence {selectedNode.confidence.toFixed(2)} · degree{" "}
                {selectedDegree}
              </Typography>
            </Box>

            <Divider />

            <Box sx={{ display: "grid", gap: 0.75 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Attributes
              </Typography>
              {Object.keys(selectedNode.attributes).length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No attributes on this entity.
                </Typography>
              ) : (
                Object.entries(selectedNode.attributes)
                  .slice(0, 10)
                  .map(([k, v]) => (
                    <Typography key={k} variant="body2">
                      <Box component="span" sx={{ color: "text.secondary" }}>
                        {k}:{" "}
                      </Box>
                      {String(v)}
                    </Typography>
                  ))
              )}
            </Box>

            <Divider />

            <Box sx={{ display: "grid", gap: 0.75 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Neighbors
              </Typography>
              {!selectedNeighbors ? null : (
                <>
                  <Typography variant="caption" color="text.secondary">
                    Incoming ({selectedNeighbors.incoming.length})
                  </Typography>
                  <Box sx={{ display: "grid", gap: 0.5 }}>
                    {selectedNeighbors.incoming.slice(0, 8).map((n) => (
                      <Button
                        key={n.id}
                        variant="text"
                        size="small"
                        onClick={() => setSelectedId(n.id)}
                        sx={{ justifyContent: "flex-start", textTransform: "none" }}
                      >
                        {n.label}
                      </Button>
                    ))}
                  </Box>

                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                    Outgoing ({selectedNeighbors.outgoing.length})
                  </Typography>
                  <Box sx={{ display: "grid", gap: 0.5 }}>
                    {selectedNeighbors.outgoing.slice(0, 8).map((n) => (
                      <Button
                        key={n.id}
                        variant="text"
                        size="small"
                        onClick={() => setSelectedId(n.id)}
                        sx={{ justifyContent: "flex-start", textTransform: "none" }}
                      >
                        {n.label}
                      </Button>
                    ))}
                  </Box>
                </>
              )}
            </Box>

            <Divider />

            <Box sx={{ display: "grid", gap: 0.75 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Literal Relations
              </Typography>
              {literalForSelected.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No literal relations on this entity.
                </Typography>
              ) : (
                groupLiterals(literalForSelected)
                  .slice(0, 8)
                  .map((group) => (
                    <Box key={group.predicate} sx={{ p: 1, borderRadius: 1.5, bgcolor: "rgba(0,0,0,0.03)" }}>
                      <Typography variant="caption" color="text.secondary">
                        {compactIri(group.predicate)}
                      </Typography>
                      {group.items.slice(0, 4).map((r) => (
                        <Typography key={r.id} variant="body2">
                          {r.literalValue}
                          <Box component="span" sx={{ color: "text.secondary" }}>
                            {" "}
                            ({r.confidence.toFixed(2)}
                            {r.literalType ? ` · ${compactIri(r.literalType)}` : ""})
                          </Box>
                        </Typography>
                      ))}
                    </Box>
                  ))
              )}
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
