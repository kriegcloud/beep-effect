/**
 * Private procedural straight-line shading: read each face's facts from the
 * kernel, let the pure 37 CFR 1.84(m) rules of `@beep/technical-drawing`
 * decide its treatment, and cut the face along the section planes they
 * return. The hatch edges lie on the model's own faces, so the caller
 * projects them through the same hidden-line removal as the outlines. Graded
 * faces are first crossed by probes, so the caller can read which stretches
 * of each face show in the view and have every stretch shaded at its own
 * shadow side.
 *
 * @internal
 */

import {
  BoundingBox,
  coverageOf,
  FaceEdge,
  FaceFacts,
  FaceTreatment,
  ShadingProbe,
  ShadingSkipped,
  treatmentFor,
  viewFactsOf,
} from "@beep/technical-drawing";
import { A, O } from "@beep/utils";
import { pipe } from "effect/Function";
import * as replicad from "replicad";
import { add, cross, scale } from "./vector.ts";
import type { ShadingCoverage, ShadingLines, ShadingWindow, ViewFacts } from "@beep/technical-drawing";
import type { OpenCascadeInstance } from "replicad-opencascadejs";
import type { Camera, ShadingPlan } from "../Occt.models.ts";
import type { V3 } from "./vector.ts";

const vec = (v: replicad.Vector): V3 => [v.x, v.y, v.z];
const dotV = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const minusV = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];

const unitV = (v: V3): V3 => {
  const length = Math.hypot(v[0], v[1], v[2]);
  return length < 1e-12 ? v : [v[0] / length, v[1] / length, v[2] / length];
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

// Graded strokes and probes are lifted this far off their face along its
// outward normal (model units; a thousandth of a millimetre on the sheet) so
// the hidden-line pass sees them in front of the face they lie on instead of
// deciding by rounding whether a re-made stroke is behind it. The uniform
// style keeps its legacy placement.
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

// Probes cross a graded face at this many heights, evenly spread between its
// lowest and highest point along its lines.
const PROBE_HEIGHTS = 5;

// Lowest and highest reach of a face's outline along a unit direction.
const reachOf = (face: FaceFacts, along: V3): readonly [number, number] =>
  pipe(
    face.outline,
    A.map((p) => dotV(p, along)),
    (reaches) => [Math.min(...reaches), Math.max(...reaches)] as const
  );

type Probe = { readonly edge: replicad.Edge; readonly probe: ShadingProbe };

// Probe lines across one graded face: at each height, the face's chord(s)
// along its shading step, lifted off the face like its strokes and tagged
// with the offsets of their ends from the face's shadow anchor.
const probeFace =
  (oc: OpenCascadeInstance, view: ViewFacts, plan: ShadingPlan) =>
  (face: replicad.Face, index: number): ReadonlyArray<Probe> => {
    if (!isPlanar(face)) {
      return A.empty();
    }
    const facts = factsOf(face);
    return FaceTreatment.match(treatmentFor({ face: facts, view, plan }), {
      skipped: () => A.empty<Probe>(),
      lines: (lines) => {
        const direction = unitV(cross(facts.normal, lines.step));
        const [low, high] = reachOf(facts, direction);
        const offsetOf = (p: V3): number => dotV(minusV(p, lines.origin), lines.step);
        return pipe(
          A.makeBy(PROBE_HEIGHTS, (i) => low + ((high - low) * (i + 0.5)) / PROBE_HEIGHTS),
          A.flatMap((height) => sectionEdges(oc, face, scale(direction, height), direction)),
          A.map((edge, rank) => {
            // the ends are read before the lift: translating a replicad edge frees the original
            const from = vec(edge.startPoint);
            const to = vec(edge.endPoint);
            return {
              edge: liftFor(face, plan)(edge),
              probe: ShadingProbe.make({ face: index, rank, from, to, start: offsetOf(from), end: offsetOf(to) }),
            };
          })
        );
      },
    });
  };

/**
 * Probe lines across every graded face of a shape, each with its record, for
 * the hidden-line pass to read each face's visible stretches from. The
 * probes go through that pass as separate shapes, so each one's visible
 * pieces come back on their own.
 *
 * @internal
 */
export const probeEdges = (options: {
  readonly oc: OpenCascadeInstance;
  readonly shape: replicad.AnyShape;
  readonly camera: Camera;
  readonly plan: ShadingPlan;
}): ReadonlyArray<{ readonly edge: replicad.Edge; readonly probe: ShadingProbe }> =>
  A.flatMap(options.shape.faces, probeFace(options.oc, viewFactsOf(options.camera), options.plan));

// The strokes of one treatment on its face: each cut's chord, trimmed to the
// cut's extent, kept when long enough on the view plane, lifted off the face.
const strokesOf =
  (oc: OpenCascadeInstance, view: ViewFacts, plan: ShadingPlan, face: replicad.Face) =>
  (lines: ShadingLines): ReadonlyArray<replicad.Edge> =>
    A.flatMap(lines.cuts, (cut) =>
      pipe(
        sectionEdges(oc, face, add(lines.origin, scale(lines.step, cut.offset)), lines.step),
        A.map(trimTo(cut.extent)),
        A.getSomes,
        A.filter(longEnough(view, plan.minStroke)),
        A.map(liftFor(face, plan))
      )
    );

// Shading of one face: its treatment and strokes. With the face's visible
// stretches known (graded shading after the probe pass), every stretch is
// treated on its own: the face counts as shaded when any stretch gets lines,
// as hidden when no stretch shows, and as a sliver when each is too narrow.
const shadeFace =
  (
    oc: OpenCascadeInstance,
    view: ViewFacts,
    plan: ShadingPlan,
    regions: O.Option<(face: number) => ReadonlyArray<ShadingWindow>>
  ) =>
  (
    face: replicad.Face,
    index: number
  ): { readonly treatment: FaceTreatment; readonly edges: ReadonlyArray<replicad.Edge> } => {
    if (!isPlanar(face)) {
      return { treatment: ShadingSkipped.make({ reason: "curved" }), edges: A.empty() };
    }
    const facts = factsOf(face);
    const whole = treatmentFor({ face: facts, view, plan });
    const treatments: A.NonEmptyReadonlyArray<FaceTreatment> = pipe(
      regions,
      O.filter(() => FaceTreatment.guards.lines(whole)),
      O.match({
        onNone: () => A.of(whole),
        onSome: (windows) =>
          pipe(
            windows(index),
            A.map((window) => treatmentFor({ face: facts, view, plan, window })),
            (stretches) =>
              A.isReadonlyArrayNonEmpty(stretches)
                ? stretches
                : A.of<FaceTreatment>(ShadingSkipped.make({ reason: "hidden" }))
          ),
      })
    );
    return {
      treatment: pipe(
        A.findFirst(treatments, FaceTreatment.guards.lines),
        O.getOrElse(() => A.headNonEmpty(treatments))
      ),
      edges: pipe(treatments, A.filter(FaceTreatment.guards.lines), A.flatMap(strokesOf(oc, view, plan, face))),
    };
  };

/**
 * Hatch edges for every face of a shape the shading rules give lines, as one
 * compound (none when no face is shaded), and the view's coverage counts.
 * With `regions` (graded shading after the probe pass), each face's visible
 * stretches are shaded one by one.
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
  readonly regions: O.Option<(face: number) => ReadonlyArray<ShadingWindow>>;
}): {
  readonly compound: O.Option<replicad.AnyShape>;
  readonly coverage: ShadingCoverage;
} => {
  const shaded = A.map(
    options.shape.faces,
    shadeFace(options.oc, viewFactsOf(options.camera), options.plan, options.regions)
  );
  return {
    compound: pipe(
      A.flatMap(shaded, (face) => face.edges),
      O.liftPredicate(A.isReadonlyArrayNonEmpty),
      O.map((edges) => replicad.makeCompound([...edges]))
    ),
    coverage: coverageOf(A.map(shaded, (face) => face.treatment)),
  };
};
