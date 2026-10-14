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
  ShadingWindow,
  treatmentFor,
  viewFactsOf,
} from "@beep/technical-drawing";
import { A, O } from "@beep/utils";
import { pipe } from "effect/Function";
import * as Order from "effect/Order";
import * as replicad from "replicad";
import { add, cross, scale } from "./vector.ts";
import type { ShadingCoverage, ShadingLines, ViewFacts } from "@beep/technical-drawing";
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

// A stroke shorter than its chord (the graded taper) is centred on the part
// of the chord that shows (`focus`: the lowest and highest position along
// the lines at which the face's stretch was seen), or on the chord itself;
// the stroke's ends are drawn back from the outline after hidden-line removal.
const trimTo =
  (extent: number, focus: O.Option<readonly [number, number]>, along: V3) =>
  (edge: replicad.Edge): O.Option<replicad.Edge> => {
    if (extent >= 1) {
      return O.some(edge);
    }
    if (edge.length * extent < SHORTEST_STROKE) {
      return O.none();
    }
    const h0 = dotV(vec(edge.startPoint), along);
    const h1 = dotV(vec(edge.endPoint), along);
    const centre = O.match(focus, {
      onNone: () => 0.5,
      onSome: ([low, high]) => {
        const lo = Math.min(h0, h1);
        const hi = Math.max(h0, h1);
        const seenLow = Math.max(lo, low);
        const seenHigh = Math.min(hi, high);
        return hi - lo < 1e-9 || seenLow > seenHigh ? 0.5 : ((seenLow + seenHigh) / 2 - h0) / (h1 - h0);
      },
    });
    const start = Math.max(0, Math.min(1 - extent, centre - extent / 2));
    return O.some(replicad.makeLine(edge.pointAt(start), edge.pointAt(start + extent)));
  };

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
// Nine probes per face: a band planned for one visible area is clipped to the
// cells of the probes that saw it, so a band can run on past that area by at
// most half a cell (a ninth of the face's extent along the lines) before the
// hidden-line pass can stop it.
const PROBE_HEIGHTS = 9;

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
  (oc: OpenCascadeInstance, view: ViewFacts, plan: ShadingPlan, isBrokenFace: (face: replicad.Face) => boolean) =>
  (face: replicad.Face, index: number): ReadonlyArray<Probe> => {
    if (isBrokenFace(face) || !isPlanar(face)) {
      return A.empty();
    }
    const facts = factsOf(face);
    return FaceTreatment.match(treatmentFor({ face: facts, view, plan }), {
      skipped: () => A.empty<Probe>(),
      lines: (lines) => {
        const direction = unitV(cross(facts.normal, lines.step));
        const [low, high] = reachOf(facts, direction);
        const offsetOf = (p: V3): number => dotV(minusV(p, lines.origin), lines.step);
        const reach = (high - low) / (2 * PROBE_HEIGHTS);
        return pipe(
          A.makeBy(PROBE_HEIGHTS, (i) => low + ((high - low) * (i + 0.5)) / PROBE_HEIGHTS),
          A.flatMap((height) =>
            A.map(sectionEdges(oc, face, scale(direction, height), direction), (edge) => ({ edge, height }))
          ),
          A.map(({ edge, height }, rank) => {
            // the ends are read before the lift: translating a replicad edge frees the original
            const from = vec(edge.startPoint);
            const to = vec(edge.endPoint);
            return {
              edge: liftFor(face, plan)(edge),
              probe: ShadingProbe.make({
                face: index,
                rank,
                from,
                to,
                start: offsetOf(from),
                end: offsetOf(to),
                height,
                reach,
              }),
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
 * pieces come back on their own. Faces drawn in broken lines are never
 * probed.
 *
 * @internal
 */
export const probeEdges = (options: {
  readonly oc: OpenCascadeInstance;
  readonly shape: replicad.AnyShape;
  readonly camera: Camera;
  readonly plan: ShadingPlan;
  readonly isBrokenFace: (face: replicad.Face) => boolean;
}): ReadonlyArray<{ readonly edge: replicad.Edge; readonly probe: ShadingProbe }> =>
  A.flatMap(
    options.shape.faces,
    probeFace(options.oc, viewFactsOf(options.camera), options.plan, options.isBrokenFace)
  );

// A chord clipped to the stretch's range along the lines (the cells of the
// probes that saw the stretch): a band planned for one visible area of a
// face must not run on into another area at the same offsets, and the
// hidden-line pass only splits a stroke where something stands in front of it.
const clipTo =
  (focus: O.Option<readonly [number, number]>, along: V3) =>
  (edge: replicad.Edge): O.Option<replicad.Edge> =>
    O.match(focus, {
      onNone: () => O.some(edge),
      onSome: ([low, high]) => {
        const h0 = dotV(vec(edge.startPoint), along);
        const h1 = dotV(vec(edge.endPoint), along);
        if (Math.abs(h1 - h0) < 1e-9) {
          return O.some(edge);
        }
        const lo = Math.max(Math.min(h0, h1), low);
        const hi = Math.min(Math.max(h0, h1), high);
        if (hi - lo < SHORTEST_STROKE) {
          return O.none();
        }
        const t = (h: number) => (h - h0) / (h1 - h0);
        const [t0, t1] = h0 < h1 ? [t(lo), t(hi)] : [t(hi), t(lo)];
        return O.some(replicad.makeLine(edge.pointAt(t0), edge.pointAt(t1)));
      },
    });

// `A.reduce` hands the reducer the index as a third argument, which a
// variadic `Math.min` would take as a value.
const leastOf = (values: ReadonlyArray<number>) =>
  A.reduce(values, Number.POSITIVE_INFINITY, (acc, value) => Math.min(acc, value));
const mostOf = (values: ReadonlyArray<number>) =>
  A.reduce(values, Number.NEGATIVE_INFINITY, (acc, value) => Math.max(acc, value));

// The strokes of one treatment on its face: each cut's chord, drawn once per
// run of neighbouring rows that saw the area at the cut's offset and clipped
// to those rows' cells, trimmed to the cut's extent, cut back to the face's
// claimed part (`claimed`, on a face merged across a solid and a broken
// primitive), kept when long enough on the view plane, lifted off the face. A
// stretch planned over the whole face (no pieces) draws every chord whole.
const strokesOf =
  <P>(
    oc: OpenCascadeInstance,
    view: ViewFacts,
    plan: ShadingPlan,
    face: replicad.Face,
    facts: FaceFacts,
    claimed: O.Option<(edge: replicad.Edge) => ReadonlyArray<replicad.Edge>>
  ) =>
  (lines: ShadingLines, pieces: ReadonlyArray<StretchPiece<P>>): ReadonlyArray<replicad.Edge> => {
    const along = unitV(cross(facts.normal, lines.step));
    const runsAt = (offset: number): ReadonlyArray<O.Option<readonly [number, number]>> =>
      A.isReadonlyArrayNonEmpty(pieces)
        ? pipe(
            pieces,
            A.filter((piece) => piece.from - plan.minPitch <= offset && offset <= piece.to + plan.minPitch),
            A.sort(Order.mapInput(Order.Number, (piece: StretchPiece<P>) => piece.row)),
            A.reduce(A.empty<A.NonEmptyReadonlyArray<StretchPiece<P>>>(), (runs, piece) =>
              O.match(A.last(runs), {
                onNone: () => [A.of(piece)],
                onSome: (run) =>
                  piece.row - A.lastNonEmpty(run).row <= 1
                    ? [...A.dropRight(runs, 1), A.append(run, piece)]
                    : [...runs, A.of(piece)],
              })
            ),
            A.map((run) =>
              O.some([leastOf(A.map(run, (piece) => piece.low)), mostOf(A.map(run, (piece) => piece.high))] as const)
            )
          )
        : [O.none()];
    return A.flatMap(lines.cuts, (cut) =>
      A.flatMap(runsAt(cut.offset), (focus) =>
        pipe(
          sectionEdges(oc, face, add(lines.origin, scale(lines.step, cut.offset)), lines.step),
          A.map(clipTo(focus, along)),
          A.getSomes,
          A.map(trimTo(cut.extent, focus, along)),
          A.getSomes,
          A.flatMap((edge) => O.match(claimed, { onNone: () => [edge], onSome: (claim) => claim(edge) })),
          A.filter(longEnough(view, plan.minStroke)),
          A.map(liftFor(face, plan))
        )
      )
    );
  };

/**
 * A visible piece of a face along its shading step, read by one probe of the
 * hidden-line pass: its offsets from the face's shadow anchor, the probe's
 * range along the lines, whether the piece starts at the face's own outline
 * rather than behind a part in front of the face, and the probe (as the
 * kernel describes it) that saw it, so the kernel can keep the piece's strokes
 * to what that probe crossed.
 *
 * @internal
 */
export type StretchPiece<P> = {
  /** Index of the probe's height among the face's probe heights, lowest first. */
  readonly row: number;
  readonly from: number;
  readonly to: number;
  readonly low: number;
  readonly high: number;
  readonly outline: boolean;
  readonly probes: ReadonlyArray<P>;
};

// The strokes of one planned stretch and the probes that saw it (none for a
// stretch planned over the whole face).
type StrokeSet<P> = {
  readonly edges: ReadonlyArray<replicad.Edge>;
  readonly probes: ReadonlyArray<P>;
};

// Shading of one face: its treatment and the strokes of each of its planned
// stretches. With the face's visible stretches known (graded shading after
// the probe pass), every stretch is treated on its own: the face counts as
// shaded when any stretch gets lines, as hidden when no stretch shows, and as
// a sliver when each is too narrow.
const shadeFace =
  <P>(
    oc: OpenCascadeInstance,
    view: ViewFacts,
    plan: ShadingPlan,
    regions: O.Option<(face: number) => ReadonlyArray<A.NonEmptyReadonlyArray<StretchPiece<P>>>>,
    isBrokenFace: (face: replicad.Face) => boolean,
    claimedOf: (face: replicad.Face) => O.Option<(edge: replicad.Edge) => ReadonlyArray<replicad.Edge>>
  ) =>
  (
    face: replicad.Face,
    index: number
  ): { readonly treatment: FaceTreatment; readonly strokes: ReadonlyArray<StrokeSet<P>> } => {
    // unclaimed matter is never shaded, before any rule reads the face
    if (isBrokenFace(face)) {
      return { treatment: ShadingSkipped.make({ reason: "broken-part" }), strokes: A.empty() };
    }
    if (!isPlanar(face)) {
      return { treatment: ShadingSkipped.make({ reason: "curved" }), strokes: A.empty() };
    }
    const facts = factsOf(face);
    const whole = treatmentFor({ face: facts, view, plan });
    type Planned = {
      readonly treatment: FaceTreatment;
      readonly pieces: ReadonlyArray<StretchPiece<P>>;
      readonly probes: ReadonlyArray<P>;
    };
    // One band for one visible area of the face (the kernel groups the probe pieces into areas). An area that reaches the
    // face's own outline is banded at the shadow anchor, whatever stands in
    // front of parts of it (a wall behind a flap keeps its one band); an area
    // bounded by parts in front of the face on every side (a lid seen through
    // the cells of a lattice) is banded at its own nearest side. The strokes
    // are then drawn only in the rows that saw the area at their offset, so a
    // band tapers along a slanting occluder and never runs on into a
    // neighbouring area.
    const plannedFor = (pieces: A.NonEmptyReadonlyArray<StretchPiece<P>>): Planned => {
      // an area at the outline starts at the face's own edge, which may lie before the anchor's
      // origin (the rule clamps a negative start); an area behind a part in front starts at its nearest side
      const from = leastOf(A.map(pieces, (piece) => piece.from));
      const window = ShadingWindow.make({
        start: from,
        span: mostOf(A.map(pieces, (piece) => piece.to)) - from,
        low: O.some(leastOf(A.map(pieces, (piece) => piece.low))),
        high: O.some(mostOf(A.map(pieces, (piece) => piece.high))),
      });
      return {
        treatment: treatmentFor({ face: facts, view, plan, window }),
        pieces,
        probes: A.flatMap(pieces, (piece) => piece.probes),
      };
    };
    const planned: A.NonEmptyReadonlyArray<Planned> = pipe(
      regions,
      O.filter(() => FaceTreatment.guards.lines(whole)),
      O.match({
        onNone: () => A.of<Planned>({ treatment: whole, pieces: A.empty(), probes: A.empty() }),
        onSome: (pieces) =>
          pipe(pieces(index), A.map(plannedFor), (areas) =>
            A.isReadonlyArrayNonEmpty(areas)
              ? areas
              : A.of<Planned>({
                  treatment: ShadingSkipped.make({ reason: "hidden" }),
                  pieces: A.empty(),
                  probes: A.empty(),
                })
          ),
      })
    );
    const strokes = strokesOf(oc, view, plan, face, facts, claimedOf(face));
    return {
      treatment: pipe(
        A.findFirst(planned, (p) => FaceTreatment.guards.lines(p.treatment)),
        O.map((p) => p.treatment),
        O.getOrElse(() => A.headNonEmpty(planned).treatment)
      ),
      // one stroke set per planned stretch, so the hidden-line pass reports each stretch on its own
      strokes: pipe(
        planned,
        A.map(
          (p): StrokeSet<P> => ({
            edges: p.treatment.kind === "lines" ? strokes(p.treatment, p.pieces) : A.empty<replicad.Edge>(),
            probes: p.probes,
          })
        ),
        A.filter((set) => A.isReadonlyArrayNonEmpty(set.edges))
      ),
    };
  };

/**
 * Shading of every face of a shape: each face's treatment and, when it got
 * lines, one compound of strokes per planned stretch (so the hidden-line
 * pass can report each stretch's visible strokes separately), plus the
 * view's coverage counts. With `regions` (graded shading after the probe
 * pass: the chains of overlapping visible pieces of each face), each face's
 * visible stretches are shaded one by one.
 *
 * **Details**
 *
 * Broken-line parts never reach this pass: the kernel shades the solid
 * compound only. Faces of solid parts that only broken primitives own
 * (`isBrokenFace`) are skipped with reason `broken-part` before the rules
 * run, so they get no lines and are counted under that reason. A face
 * merged across a solid and a broken primitive is shaded as one face, and
 * `claimedOf` cuts each of its strokes back to the part on the solid
 * primitive.
 *
 * @internal
 */
export const hatchCompound = <P>(options: {
  readonly oc: OpenCascadeInstance;
  readonly shape: replicad.AnyShape;
  readonly camera: Camera;
  readonly plan: ShadingPlan;
  readonly regions: O.Option<(face: number) => ReadonlyArray<A.NonEmptyReadonlyArray<StretchPiece<P>>>>;
  readonly isBrokenFace: (face: replicad.Face) => boolean;
  readonly claimedOf: (face: replicad.Face) => O.Option<(edge: replicad.Edge) => ReadonlyArray<replicad.Edge>>;
}): {
  readonly faces: ReadonlyArray<{
    readonly treatment: FaceTreatment;
    readonly stretches: ReadonlyArray<{ readonly shape: replicad.AnyShape; readonly probes: ReadonlyArray<P> }>;
  }>;
  readonly coverage: ShadingCoverage;
} => {
  const shaded = A.map(
    options.shape.faces,
    shadeFace(
      options.oc,
      viewFactsOf(options.camera),
      options.plan,
      options.regions,
      options.isBrokenFace,
      options.claimedOf
    )
  );
  return {
    faces: A.map(shaded, (face) => ({
      treatment: face.treatment,
      stretches: A.map(face.strokes, (set) => ({ shape: replicad.makeCompound([...set.edges]), probes: set.probes })),
    })),
    coverage: coverageOf(A.map(shaded, (face) => face.treatment)),
  };
};
