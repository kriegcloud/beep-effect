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

const directionOf = (edge: replicad.Edge): V3 => {
  const [sx, sy, sz] = vec(edge.startPoint);
  const [ex, ey, ez] = vec(edge.endPoint);
  const length = Math.max(edge.length, 1e-12);
  return [(ex - sx) / length, (ey - sy) / length, (ez - sz) / length];
};

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

// A stroke is centred on its chord: it stops `inset` short of the outline at
// both ends (model units along the chord) and then keeps `extent` of what is
// left (the graded taper). A chord with no room for the inset yields nothing.
const trimTo =
  (extent: number, inset: number) =>
  (edge: replicad.Edge): O.Option<replicad.Edge> => {
    const length = edge.length;
    if (extent >= 1 && inset <= 0) {
      return O.some(edge);
    }
    const room = length - 2 * inset;
    const kept = (room * extent) / length;
    return room * extent < SHORTEST_STROKE
      ? O.none()
      : O.some(replicad.makeLine(edge.pointAt(0.5 - kept / 2), edge.pointAt(0.5 + kept / 2)));
  };

// Model-unit inset along a chord that projects to the plan's minimum pitch on
// the view plane; nothing for the uniform style, whose legacy golden draws
// every chord edge to edge.
const insetFor = (view: ViewFacts, plan: ShadingPlan, direction: V3): number => {
  if (plan.style !== "graded") {
    return 0;
  }
  const along = direction[0] * view.eye[0] + direction[1] * view.eye[1] + direction[2] * view.eye[2];
  const seen = Math.sqrt(Math.max(0, 1 - along * along));
  return seen < 1e-6 ? 0 : plan.minPitch / seen;
};

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

/**
 * One planned cut of one face, for the hidden-line pass to find again: the
 * face's index, the cut's rank among its face's cuts, how many visible cuts
 * that face draws, and the cut line in model space.
 *
 * @internal
 */
export interface HatchCut {
  readonly direction: V3;
  readonly face: number;
  readonly keep: number;
  readonly point: V3;
  readonly rank: number;
}

const unitV = (v: V3): V3 => {
  const length = Math.hypot(v[0], v[1], v[2]);
  return length < 1e-12 ? v : [v[0] / length, v[1] / length, v[2] / length];
};

const crossV = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

const cutsOf = (index: number, face: replicad.Face, treatment: FaceTreatment): ReadonlyArray<HatchCut> =>
  FaceTreatment.match(treatment, {
    lines: (lines) => {
      const normal = vec(face.normalAt(face.center));
      const direction = unitV(crossV(normal, lines.step));
      const keep = O.getOrElse(lines.keep, () => A.length(lines.cuts));
      return A.map(lines.cuts, (cut, rank) => ({
        face: index,
        rank,
        keep,
        point: add(lines.origin, scale(lines.step, cut.offset)),
        direction,
      }));
    },
    skipped: () => A.empty<HatchCut>(),
  });

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
    const edges = FaceTreatment.match(treatment, {
      lines: (lines) =>
        A.flatMap(lines.cuts, (cut) =>
          pipe(
            sectionEdges(oc, face, add(lines.origin, scale(lines.step, cut.offset)), lines.step),
            A.map((edge) => trimTo(cut.extent, insetFor(view, plan, directionOf(edge)))(edge)),
            A.getSomes,
            A.filter(longEnough(view, plan.minStroke)),
            A.map(liftFor(face, plan))
          )
        ),
      skipped: () => A.empty<replicad.Edge>(),
    });
    return { treatment, edges, cuts: cutsOf(index, face, treatment) };
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
