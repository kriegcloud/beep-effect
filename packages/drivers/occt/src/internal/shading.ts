/**
 * Private procedural straight-line shading: read each face's facts from the
 * kernel, let the pure 37 CFR 1.84(m) rules of `@beep/technical-drawing`
 * decide its treatment, and cut the face along the section planes they
 * return. The hatch edges lie on the model's own faces, so the caller
 * projects them through the same hidden-line removal as the outlines.
 *
 * @internal
 */

import {
  BoundingBox,
  coverageOf,
  FaceEdge,
  FaceFacts,
  FaceTreatment,
  HatchCut,
  ShadingSkipped,
  treatmentFor,
  viewFactsOf,
} from "@beep/technical-drawing";
import { A, O } from "@beep/utils";
import { pipe } from "effect/Function";
import * as replicad from "replicad";
import { add, scale } from "./vector.ts";
import type { ShadingCoverage, ViewFacts } from "@beep/technical-drawing";
import type { OpenCascadeInstance } from "replicad-opencascadejs";
import type { Camera, ShadingPlan } from "../Occt.models.ts";
import type { V3 } from "./vector.ts";

const vec = (v: replicad.Vector): V3 => [v.x, v.y, v.z];

// Curved boundary edges are sampled this many times for the face's outline.
const OUTLINE_SAMPLES = 8;

const isLine = (edge: replicad.Edge): boolean => edge.geomType === "LINE";

const outlineOf = (edge: replicad.Edge): ReadonlyArray<V3> =>
  isLine(edge)
    ? [vec(edge.startPoint), vec(edge.endPoint)]
    : A.makeBy(OUTLINE_SAMPLES + 1, (i) => vec(edge.pointAt(i / OUTLINE_SAMPLES)));

// `normalAt` projects the face centre onto the surface, which is exact for
// the planar faces this is called on.
const factsOf = (face: replicad.Face): FaceFacts => {
  const edges = face.edges;
  const [min, max] = face.boundingBox.bounds;
  return FaceFacts.make({
    normal: vec(face.normalAt(face.center)),
    center: vec(face.center),
    edges: pipe(
      edges,
      A.filter(isLine),
      A.map((edge) => FaceEdge.make({ start: vec(edge.startPoint), end: vec(edge.endPoint), length: edge.length }))
    ),
    outline: A.flatMap(edges, outlineOf),
    bounds: BoundingBox.make({ min: [min[0], min[1], min[2]], max: [max[0], max[1], max[2]] }),
  });
};

const sectionEdges = (oc: OpenCascadeInstance, face: replicad.Face, point: V3, normal: V3) => {
  const plane = new oc.gp_Pln(
    new oc.gp_Pnt(point[0], point[1], point[2]),
    new oc.gp_Dir(normal[0], normal[1], normal[2])
  );
  const section = new oc.BRepAlgoAPI_Section(face.wrapped, plane, true);
  const explorer = new oc.TopExp_Explorer(
    section.Shape(),
    oc.TopAbs_ShapeEnum.TopAbs_EDGE,
    oc.TopAbs_ShapeEnum.TopAbs_SHAPE
  );
  const edges = A.empty<replicad.Edge>();
  for (; explorer.More(); explorer.Next()) {
    edges.push(replicad.cast(explorer.Current()) as replicad.Edge);
  }
  return edges;
};

// Chords shorter than the plan's minimum on the view plane are dropped: near a
// pointed corner the graded strokes would otherwise read as a dot ladder.
const longEnough =
  (view: ViewFacts, minStroke: number) =>
  (edge: replicad.Edge): boolean => {
    if (minStroke <= 0) {
      return true;
    }
    const [sx, sy, sz] = vec(edge.startPoint);
    const [ex, ey, ez] = vec(edge.endPoint);
    const length = edge.length;
    if (length <= 0) {
      return false;
    }
    const along = ((ex - sx) * view.eye[0] + (ey - sy) * view.eye[1] + (ez - sz) * view.eye[2]) / length;
    return length * Math.sqrt(Math.max(0, 1 - along * along)) >= minStroke;
  };

// Shorter than this (model units) a trimmed stroke is not made at all: the
// kernel refuses an edge between coincident points, and nothing that short
// survives the minimum-stroke filter anyway.
const SHORTEST_STROKE = 1e-6;

// A stroke shorter than its chord is centred on it (the graded taper); the
// stroke's ends are drawn back from the outline after hidden-line removal.
const trimTo =
  (extent: number) =>
  (edge: replicad.Edge): O.Option<replicad.Edge> =>
    extent >= 1
      ? O.some(edge)
      : edge.length * extent < SHORTEST_STROKE
        ? O.none()
        : O.some(replicad.makeLine(edge.pointAt(0.5 - extent / 2), edge.pointAt(0.5 + extent / 2)));

// Graded strokes are lifted this far off their face along its outward normal
// (model units; a thousandth of a millimetre on the sheet) so the hidden-line
// pass sees them in front of the face they lie on instead of deciding by
// rounding whether a re-made stroke is behind it. The uniform style keeps its
// legacy placement.
const HATCH_LIFT = 1e-3;

const liftFor =
  (face: replicad.Face, plan: ShadingPlan) =>
  (edge: replicad.Edge): replicad.Edge => {
    if (plan.style !== "graded") {
      return edge;
    }
    const [nx, ny, nz] = vec(face.normalAt(face.center));
    return edge.translate(nx * HATCH_LIFT, ny * HATCH_LIFT, nz * HATCH_LIFT);
  };

// Planar faces only: curved faces are counted, never hatched.
const isPlanar = (face: replicad.Face): boolean => face.geomType === "PLANE";

const unitV = (v: V3): V3 => {
  const length = Math.hypot(v[0], v[1], v[2]);
  return length < 1e-12 ? v : [v[0] / length, v[1] / length, v[2] / length];
};

// The extent of one cut's strokes along their common line, for the hidden-line
// pass to find the cut again; none when the cut produced no stroke.
const extentOf = (
  index: number,
  rank: number,
  keep: number,
  strokes: ReadonlyArray<replicad.Edge>
): O.Option<HatchCut> =>
  pipe(
    A.head(strokes),
    O.map((first) => {
      const origin = vec(first.startPoint);
      const direction = unitV(minusV(vec(first.endPoint), origin));
      const along = (p: V3): number =>
        (p[0] - origin[0]) * direction[0] + (p[1] - origin[1]) * direction[1] + (p[2] - origin[2]) * direction[2];
      const ts = A.flatMap(strokes, (e) => [along(vec(e.startPoint)), along(vec(e.endPoint))]);
      const lo = Math.min(...ts);
      const hi = Math.max(...ts);
      return HatchCut.make({
        face: index,
        rank,
        keep,
        from: add(origin, scale(direction, lo)),
        to: add(origin, scale(direction, hi)),
      });
    })
  );

const minusV = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];

const shadeFace =
  (oc: OpenCascadeInstance, view: ViewFacts, plan: ShadingPlan) =>
  (
    face: replicad.Face,
    index: number
  ): {
    readonly treatment: FaceTreatment;
    readonly edges: ReadonlyArray<replicad.Edge>;
    readonly cuts: ReadonlyArray<HatchCut>;
  } => {
    const treatment = isPlanar(face)
      ? treatmentFor({ face: factsOf(face), view, plan })
      : ShadingSkipped.make({ reason: "curved" });
    const planned = FaceTreatment.match(treatment, {
      lines: (lines) => {
        const keep = O.getOrElse(lines.keep, () => A.length(lines.cuts));
        return A.map(lines.cuts, (cut, rank) => {
          const strokes = pipe(
            sectionEdges(oc, face, add(lines.origin, scale(lines.step, cut.offset)), lines.step),
            A.map(trimTo(cut.extent)),
            A.getSomes,
            A.filter(longEnough(view, plan.minStroke)),
            A.map(liftFor(face, plan))
          );
          return { strokes, cut: extentOf(index, rank, keep, strokes) };
        });
      },
      skipped: () => A.empty<{ readonly strokes: ReadonlyArray<replicad.Edge>; readonly cut: O.Option<HatchCut> }>(),
    });
    return {
      treatment,
      edges: A.flatMap(planned, (p) => p.strokes),
      cuts: pipe(
        A.map(planned, (p) => p.cut),
        A.getSomes
      ),
    };
  };

/**
 * Hatch edges for every face of a shape the shading rules give lines, as one
 * compound (none when no face is shaded), and the view's coverage counts.
 *
 * **Details**
 *
 * TODO(design-figure-review-loop, PR #1648): once `Part.lineStyle` lands,
 * faces of `broken` parts are skipped with reason `broken-part` before the
 * rules run; this needs the per-part solids, not only the fused compound.
 *
 * @internal
 */
export const hatchCompound = (options: {
  readonly oc: OpenCascadeInstance;
  readonly shape: replicad.AnyShape;
  readonly camera: Camera;
  readonly plan: ShadingPlan;
}): {
  readonly compound: O.Option<replicad.AnyShape>;
  readonly coverage: ShadingCoverage;
  readonly cuts: ReadonlyArray<HatchCut>;
} => {
  const shaded = A.map(options.shape.faces, shadeFace(options.oc, viewFactsOf(options.camera), options.plan));
  return {
    compound: pipe(
      A.flatMap(shaded, (face) => face.edges),
      O.liftPredicate(A.isReadonlyArrayNonEmpty),
      O.map((edges) => replicad.makeCompound([...edges]))
    ),
    coverage: coverageOf(A.map(shaded, (face) => face.treatment)),
    cuts: A.flatMap(shaded, (face) => face.cuts),
  };
};
