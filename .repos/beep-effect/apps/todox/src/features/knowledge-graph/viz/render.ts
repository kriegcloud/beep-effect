import { colorForType } from "./color";
import type { VizLink, VizNode } from "./model";

export type ViewTransform = {
  readonly offsetX: number;
  readonly offsetY: number;
  readonly scale: number;
};

export type RenderInput = {
  readonly ctx: CanvasRenderingContext2D;
  readonly width: number; // CSS pixels
  readonly height: number; // CSS pixels
  readonly dpr: number;
  readonly transform: ViewTransform;
  readonly nodes: ReadonlyArray<VizNode>;
  readonly nodeById: ReadonlyMap<string, VizNode>;
  readonly links: ReadonlyArray<VizLink>;
  readonly degreeById: ReadonlyMap<string, number>;
  readonly showLinkLabels: boolean;
  readonly highlightIds: ReadonlySet<string>;
  readonly hoveredId: string | null;
  readonly selectedId: string | null;
  readonly background: string;
};

const clamp01 = (n: number): number => (n < 0 ? 0 : n > 1 ? 1 : n);

export const nodeRadius = (node: VizNode, degree: number): number => {
  const d = degree > 40 ? 40 : degree < 0 ? 0 : degree;
  return 4 + Math.sqrt(d) * 1.6 + clamp01(node.confidence) * 3;
};

export const renderFrame = (input: RenderInput): void => {
  const { ctx, width, height, dpr, transform } = input;

  // Reset to CSS pixel coordinates.
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  // Background
  ctx.fillStyle = input.background;
  ctx.fillRect(0, 0, width, height);

  // World transform
  ctx.translate(transform.offsetX, transform.offsetY);
  ctx.scale(transform.scale, transform.scale);

  // Links
  ctx.lineCap = "round";
  ctx.textBaseline = "middle";

  for (const link of input.links) {
    const s = input.nodeById.get(link.sourceId);
    const t = input.nodeById.get(link.targetId);
    if (!s || !t) continue;

    const baseAlpha = 0.12 + clamp01(link.confidence) * 0.55;
    const isHighlighted =
      input.highlightIds.has(s.id) ||
      input.highlightIds.has(t.id) ||
      input.hoveredId === s.id ||
      input.hoveredId === t.id;
    const alpha = isHighlighted ? Math.min(1, baseAlpha + 0.25) : baseAlpha;

    ctx.strokeStyle = `rgba(20, 24, 28, ${alpha})`;
    ctx.lineWidth = 0.6 + clamp01(link.confidence) * 2.2;

    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(t.x, t.y);
    ctx.stroke();

    if (input.showLinkLabels && transform.scale > 0.65) {
      const mx = (s.x + t.x) / 2;
      const my = (s.y + t.y) / 2;
      ctx.fillStyle = `rgba(20, 24, 28, ${Math.min(1, alpha + 0.2)})`;
      ctx.font = "10px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";
      ctx.fillText(compactIri(link.predicate), mx + 3, my);
    }
  }

  // Nodes
  for (const node of input.nodes) {
    const degree = input.degreeById.get(node.id) ?? 0;
    const r = nodeRadius(node, degree);

    const isSelected = input.selectedId === node.id;
    const isHovered = input.hoveredId === node.id;
    const isHighlighted = input.highlightIds.has(node.id) || isSelected || isHovered;

    const fill = colorForType(node.typeIri);

    // Outer ring for selection/highlight
    if (isHighlighted) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, r + 3.5, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? "rgba(0,0,0,0.18)" : "rgba(0,0,0,0.10)";
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();

    ctx.lineWidth = 1.2;
    ctx.strokeStyle = isSelected ? "rgba(0,0,0,0.65)" : "rgba(0,0,0,0.25)";
    ctx.stroke();

    // Label
    const showLabel = transform.scale > 0.45 || isSelected || isHovered;
    if (showLabel) {
      ctx.font = isSelected
        ? "600 12px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial"
        : "11px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";
      ctx.fillStyle = "rgba(20, 24, 28, 0.92)";
      const dx = r + 6;
      ctx.fillText(node.label, node.x + dx, node.y);
    }
  }
};

const compactIri = (iri: string): string => {
  const hash = iri.lastIndexOf("#");
  if (hash >= 0 && hash + 1 < iri.length) return iri.slice(hash + 1);
  const slash = iri.lastIndexOf("/");
  if (slash >= 0 && slash + 1 < iri.length) return iri.slice(slash + 1);
  return iri;
};
