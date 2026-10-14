/**
 * Private replicad / opencascade.js glue: build parts from the technical spec,
 * run hidden-line removal through a driver-owned camera, and canonicalise the
 * projected segments.
 *
 * @internal
 */

import { legibleShading, ShadingCoverage } from "@beep/technical-drawing";
import { A, N, O } from "@beep/utils";
import { flow, pipe } from "effect/Function";
import * as Graph from "effect/Graph";
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import * as Order from "effect/Order";
import * as R from "effect/Record";
import * as replicad from "replicad";
import { OcctError } from "../Occt.errors.ts";
import { BoundingBox, EdgeSet, ModelSummary, Primitive } from "../Occt.models.ts";
import { claimedPartOf, claimedStrokes, makeSurveyor, pieceStyles, sightOf, unclaimedOf } from "./claim.ts";
import { hatchCompound, probeEdges } from "./shading.ts";
import { add, cross, scale } from "./vector.ts";
import type { FaceTreatment, ShadingProbe } from "@beep/technical-drawing";
import type { HLRBRep_HLRToShape, OpenCascadeInstance, TopoDS_Shape } from "replicad-opencascadejs";
import type {
  Camera,
  ModelSpec,
  OverlayLine,
  OverlayStyle,
  Part,
  PartLineStyle,
  Rotation,
  Segment2,
  ShadingPlan,
} from "../Occt.models.ts";
import type { Run, Styles, Surveyor, Unclaimed, Viewed } from "./claim.ts";
import type { StretchPiece } from "./shading.ts";
import type { V3 } from "./vector.ts";

type Shape3D = replicad.Shape3D;
type AnyShape = replicad.AnyShape;

const CURVE_SAMPLES = 24;

// Model units: a claimed stretch of a stroke shorter than this is not made (the kernel refuses an edge between
// coincident points).
const SHORTEST_STROKE = 1e-6;
const DECIMALS = 3;

const round = (value: number): number => {
  const rounded = N.round(DECIMALS)(value);
  // -0 and 0 must hash alike.
  return rounded === 0 ? 0 : rounded;
};

const place = (shape: Shape3D, rotate: ReadonlyArray<Rotation>, translate: readonly [number, number, number]) =>
  pipe(
    rotate,
    A.reduce(shape, (acc, r) => acc.rotate(r.degrees, [...r.origin], [...r.axis]) as Shape3D),
    (rotated) => rotated.translate([...translate]) as Shape3D
  );

const buildPrimitive: (primitive: Primitive) => Shape3D = Primitive.match({
  box: (box) => place(replicad.makeBox([...box.min], [...box.max]), box.rotate, box.translate),
  prism: (prism) => {
    const face = replicad.makePolygon(A.map(prism.profile, (p) => [...p] as const));
    const solid = replicad.basicFaceExtrusion(face, new replicad.Vector([...prism.extrusion]));
    return place(solid, prism.rotate, prism.translate);
  },
  cylinder: (cylinder) =>
    place(
      replicad.makeCylinder(cylinder.radius, cylinder.height, [...cylinder.base], [...cylinder.axis]),
      cylinder.rotate,
      cylinder.translate
    ),
});

const buildPart = (add: ReadonlyArray<Primitive>, subtract: ReadonlyArray<Primitive>): Shape3D => {
  const [first, ...rest] = add;
  if (first === undefined) {
    throw OcctError.make({ reason: "solid-build", message: "A part needs at least one primitive to add." });
  }
  const fused = pipe(
    rest,
    A.reduce(buildPrimitive(first), (acc, p) => acc.fuse(buildPrimitive(p)))
  );
  // Booleans leave seam edges where coplanar faces met; merge them so the
  // hidden-line pass does not draw a line the article does not have.
  return pipe(
    subtract,
    A.reduce(fused, (acc, p) => acc.cut(buildPrimitive(p)))
  ).simplify();
};

/**
 * One built part, the line style it is drawn in, and, for a solid part with
 * broken add primitives, its unclaimed matter.
 *
 * @internal
 */
export interface BuiltPart {
  readonly lineStyle: PartLineStyle;
  readonly shape: Shape3D;
  readonly unclaimed: O.Option<Unclaimed>;
}

/**
 * The parts of a model gathered by line style: the solid (claimed) parts and
 * the broken-line (unclaimed) parts, each as one solid or compound, or none,
 * plus the per-primitive line styles when any solid part has unclaimed matter.
 *
 * @internal
 */
export interface BuiltModel {
  readonly broken: O.Option<Shape3D>;
  readonly solid: O.Option<Shape3D>;
  readonly styles: O.Option<Styles>;
}

// A primitive's own line style inside its part: its own when set, else the part's.
const styleIn =
  (part: Part) =>
  (primitive: Primitive): PartLineStyle =>
    O.getOrElse(primitive.lineStyle, () => part.lineStyle);

// The unclaimed matter of a built solid part with broken add primitives: its surface outside every solid add
// primitive. None for a broken part, for a solid part without a broken primitive, and for one whose broken primitives
// lie wholly inside its solid ones.
const unclaimedIn = (part: Part, shape: Shape3D): O.Option<Unclaimed> => {
  const style = styleIn(part);
  if (part.lineStyle === "broken" || !A.some(part.add, (primitive) => style(primitive) === "broken")) {
    return O.none();
  }
  const built = (lineStyle: PartLineStyle) =>
    pipe(
      part.add,
      A.filter((primitive) => style(primitive) === lineStyle),
      A.map(buildPrimitive)
    );
  const solids = built("solid");
  const broken = built("broken");
  try {
    // a face is cut by the solid primitives, which must be solids for the cut to keep what lies outside them
    if (!A.every(solids, (solid) => solid instanceof replicad.Solid)) {
      throw OcctError.make({
        reason: "solid-build",
        message: `Part "${part.name}" has a primitive that is not a solid.`,
      });
    }
    return pipe(
      unclaimedOf({ shape, solids, broken }),
      O.liftPredicate((unclaimed) => A.isReadonlyArrayNonEmpty(unclaimed.pieces))
    );
  } finally {
    A.forEach([...solids, ...broken], (primitive) => primitive.delete());
  }
};

/**
 * Build every part of a spec as its own solid, in spec order, with the
 * unclaimed matter of each solid part that has broken add primitives.
 *
 * **Details**
 *
 * A primitive's `lineStyle`, absent, is its part's. A solid part with a
 * broken add primitive is still fused as one solid, so no seam line crosses
 * where the primitives meet; its surface outside every solid add primitive
 * is then cut out face by face. Without a primitive-level broken style the
 * parts and their output are exactly what they were before primitive styles
 * existed.
 *
 * @internal
 */
export const buildParts = (spec: ModelSpec): ReadonlyArray<BuiltPart> =>
  A.map(spec.parts, (part) => {
    const shape = buildPart(part.add, part.subtract);
    return { lineStyle: part.lineStyle, shape, unclaimed: unclaimedIn(part, shape) };
  });

const compoundOf = (shapes: ReadonlyArray<Shape3D>): O.Option<Shape3D> => {
  if (A.length(shapes) === 0) {
    return O.none();
  }
  const compound = A.length(shapes) === 1 ? shapes[0] : replicad.makeCompound([...shapes]);
  if (!(compound instanceof replicad.Compound || compound instanceof replicad.Solid)) {
    throw OcctError.make({ reason: "solid-build", message: "The parts did not form a solid or a compound." });
  }
  return O.some(compound);
};

const shapesIn = (parts: ReadonlyArray<BuiltPart>, lineStyle: PartLineStyle): ReadonlyArray<Shape3D> =>
  pipe(
    parts,
    A.filter((part) => part.lineStyle === lineStyle),
    A.map((part) => part.shape)
  );

// What the projection needs of the parts' per-primitive styles, read before compounding: the faces and edges are the
// parts' own, which the compound keeps. None when no solid part has unclaimed matter.
const stylesOf = (parts: ReadonlyArray<BuiltPart>): O.Option<Styles> =>
  A.some(parts, (part) => O.isSome(part.unclaimed))
    ? O.some({
        brokenFaces: A.flatMap(parts, (part) =>
          O.match(part.unclaimed, { onNone: A.empty<replicad.Face>, onSome: (u) => u.brokenFaces })
        ),
        mixedFaces: A.flatMap(parts, (part) =>
          O.match(part.unclaimed, {
            onNone: A.empty<Styles["mixedFaces"][number]>,
            onSome: (u) => u.mixedFaces,
          })
        ),
        parts: pipe(
          parts,
          A.filter((part) => part.lineStyle === "solid"),
          A.map((part) => claimedPartOf({ shape: part.shape, unclaimed: part.unclaimed }))
        ),
      })
    : O.none();

/**
 * Gather built parts into one compound per line style.
 *
 * **Details**
 *
 * `makeCompound` disposes the part shapes it is given, so each part goes into
 * exactly one compound and must not be read afterwards; the per-primitive
 * styles are read from the parts first. With no broken parts the solid
 * compound is exactly the compound the kernel always built.
 *
 * @internal
 */
export const compoundParts = (parts: ReadonlyArray<BuiltPart>): BuiltModel => {
  const styles = stylesOf(parts);
  return {
    styles,
    solid: compoundOf(shapesIn(parts, "solid")),
    broken: compoundOf(shapesIn(parts, "broken")),
  };
};

/**
 * Build every part of a spec and gather them into one compound per line style.
 *
 * @internal
 */
export const buildCompound: (spec: ModelSpec) => BuiltModel = flow(buildParts, compoundParts);

// Common volume, in cubic model units, above which two parts overlap. Parts
// modelled to touch (zero clearance) share only a face, whose volume is zero
// up to the boolean's numerical noise.
const OVERLAP_TOLERANCE = 1e-6;

const boxesMeet = (a: Shape3D, b: Shape3D): boolean => {
  const [aMin, aMax] = a.boundingBox.bounds;
  const [bMin, bMax] = b.boundingBox.bounds;
  return A.every([0, 1, 2] as const, (i) => aMin[i] < bMax[i] && bMin[i] < aMax[i]);
};

const commonVolume = (a: Shape3D, b: Shape3D): number => {
  const common = a.intersect(b);
  try {
    return replicad.measureVolume(common);
  } finally {
    common.delete();
  }
};

/**
 * Count the pairs of parts whose common volume exceeds the overlap tolerance.
 *
 * **Details**
 *
 * Reads the part shapes, so it must run before {@link compoundParts} disposes
 * them. Pairs whose bounding boxes do not meet are skipped without a boolean.
 *
 * @internal
 */
export const countOverlaps = (parts: ReadonlyArray<BuiltPart>): number => {
  let count = 0;
  for (const [index, part] of A.entries(parts)) {
    for (const other of A.drop(parts, index + 1)) {
      if (boxesMeet(part.shape, other.shape) && commonVolume(part.shape, other.shape) > OVERLAP_TOLERANCE) {
        count++;
      }
    }
  }
  return count;
};

/**
 * Measure a built model.
 *
 * **Details**
 *
 * `makeCompound` disposes the part shapes it is given, so every measurement
 * reads the compounds, never the parts: volumes and topology counts are
 * summed and the bounding boxes are unioned. With only solid parts this is
 * the single compound's measurement.
 *
 * @internal
 */
export const summarize = (input: { readonly built: BuiltModel; readonly partOverlaps: number }): ModelSummary => {
  const shapes = [...O.toArray(input.built.solid), ...O.toArray(input.built.broken)];
  const bounds = A.map(shapes, (shape) => shape.boundingBox.bounds);
  const lowest = (axis: 0 | 1 | 2) => round(Math.min(...A.map(bounds, ([min]) => min[axis])));
  const highest = (axis: 0 | 1 | 2) => round(Math.max(...A.map(bounds, ([, max]) => max[axis])));
  const sum = (measure: (shape: Shape3D) => number) => A.reduce(shapes, 0, (total, shape) => total + measure(shape));
  return ModelSummary.make({
    boundingBox: BoundingBox.make({
      min: [lowest(0), lowest(1), lowest(2)],
      max: [highest(0), highest(1), highest(2)],
    }),
    volume: round(sum(replicad.measureVolume)),
    faceCount: sum((shape) => shape.faces.length),
    edgeCount: sum((shape) => shape.edges.length),
    partOverlaps: input.partOverlaps,
  });
};

const normalize = (v: readonly [number, number, number]): [number, number, number] => {
  const length = Math.hypot(v[0], v[1], v[2]);
  if (!(length > 0)) {
    throw OcctError.make({ reason: "projection", message: "Camera vectors must be non-zero." });
  }
  return [v[0] / length, v[1] / length, v[2] / length];
};

/**
 * Build the OCCT projector for a camera.
 *
 * **Details**
 *
 * OCCT's `gp_Ax2` for a projector has its origin at the view-plane point, its
 * main direction pointing from the target toward the eye, and its X direction
 * as the horizontal screen axis. The screen Y axis is then `direction × x`,
 * which is the camera's up vector. With a focus, `HLRAlgo_Projector` places
 * the eye `focus` units along the direction and projects in perspective.
 *
 * @internal
 */
const makeProjector = (oc: OpenCascadeInstance, camera: Camera) => {
  const direction = normalize(camera.eye);
  const up = normalize(camera.up);
  const right = normalize(cross(up, direction));
  const origin = new oc.gp_Pnt(camera.target[0], camera.target[1], camera.target[2]);
  const mainDir = new oc.gp_Dir(direction[0], direction[1], direction[2]);
  const xDir = new oc.gp_Dir(right[0], right[1], right[2]);
  const ax2 = new oc.gp_Ax2(origin, mainDir, xDir);
  return O.match(camera.focus, {
    onNone: () => new oc.HLRAlgo_Projector(ax2),
    onSome: (focus) => new oc.HLRAlgo_Projector(ax2, focus),
  });
};

const edgesOf = (shape: Parameters<typeof replicad.cast>[0], oc: OpenCascadeInstance) => {
  if (shape.IsNull()) {
    return [] as ReadonlyArray<replicad.Edge>;
  }
  const edges = replicad.cast(shape).edges;
  A.forEach(edges, (e) => oc.BRepLib.BuildCurves3d(e.wrapped));
  return edges;
};

const segmentOrder = Order.mapInput(
  Order.combineAll([
    Order.mapInput(Order.Number, (s: Segment2) => s[0]),
    Order.mapInput(Order.Number, (s: Segment2) => s[1]),
    Order.mapInput(Order.Number, (s: Segment2) => s[2]),
    Order.mapInput(Order.Number, (s: Segment2) => s[3]),
  ]),
  (s: Segment2) => s
);

const canonical = (a: readonly [number, number], b: readonly [number, number]): Segment2 => {
  const p: readonly [number, number] = [round(a[0]), round(a[1])];
  const q: readonly [number, number] = [round(b[0]), round(b[1])];
  const pFirst = p[0] < q[0] || (p[0] === q[0] && p[1] <= q[1]);
  return pFirst ? [p[0], p[1], q[0], q[1]] : [q[0], q[1], p[0], p[1]];
};

// A projected segment before rounding: [x1, y1, x2, y2] on the view plane, in edge order.
type RawSegment = readonly [number, number, number, number];

// Every projected edge as straight segments (one per straight edge, several per curve), unrounded.
const sampled = (edges: ReadonlyArray<replicad.Edge>): ReadonlyArray<RawSegment> =>
  A.flatMap(edges, (edge) => {
    const samples = edge.geomType === "LINE" ? 1 : CURVE_SAMPLES;
    return A.makeBy(samples, (i): RawSegment => {
      const a = edge.pointAt(i / samples);
      const b = edge.pointAt((i + 1) / samples);
      return [a.x, a.y, b.x, b.y];
    });
  });

// Rounded, direction-normalised, sorted, each segment once.
const canonicalSegments: (segments: ReadonlyArray<RawSegment>) => ReadonlyArray<Segment2> = flow(
  A.map(([x1, y1, x2, y2]: RawSegment) => canonical([x1, y1], [x2, y2])),
  A.filter((s) => !(s[0] === s[2] && s[1] === s[3])),
  A.sort(segmentOrder),
  // two parts meeting on a shared plane each report the boundary: one line, drawn once
  A.dedupeAdjacentWith((a, b) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3])
);

const toSegments = flow(sampled, canonicalSegments);

// The chords of one run of an edge's parameter range: one for a straight edge, else one per `CURVE_SAMPLES`-th of the
// whole range (at least one). The whole range gives exactly the chords `sampled` gives.
const chordsOf =
  (edge: replicad.Edge) =>
  (run: Run): ReadonlyArray<RawSegment> => {
    const span = run.to - run.from;
    const samples = edge.geomType === "LINE" ? 1 : Math.max(1, Math.ceil(CURVE_SAMPLES * span - 1e-9));
    return A.makeBy(samples, (i): RawSegment => {
      const a = edge.pointAt(run.from + (span * i) / samples);
      const b = edge.pointAt(run.from + (span * (i + 1)) / samples);
      return [a.x, a.y, b.x, b.y];
    });
  };

const visibleEdges = (shapes: HLRBRep_HLRToShape, own: TopoDS_Shape, oc: OpenCascadeInstance) => [
  ...edgesOf(shapes.VCompound(own), oc),
  ...edgesOf(shapes.Rg1LineVCompound(own), oc),
  ...edgesOf(shapes.OutLineVCompound(own), oc),
];

type ProbeLine = {
  readonly probe: ShadingProbe;
  readonly point: readonly [number, number];
  readonly along: readonly [number, number];
  readonly length: number;
  // the two ends' distances from the eye along the view direction under a
  // perspective camera (both 1 for an orthographic one), for walking back
  // from a view-plane fraction to a fraction of the probe in space
  readonly depth: readonly [number, number];
};

// A probe's line on the view plane, in the projector's own frame (the frame
// the hidden-line pass reports its edges in) and under its own projection: a
// camera with a focus projects in perspective, the eye `focus` along the view
// direction from the target, exactly as `makeProjector` sets the HLR up.
// None when the probe projects to a point.
const projectedProbe = (camera: Camera, probe: ShadingProbe): O.Option<ProbeLine> => {
  const direction = normalize(camera.eye);
  const right = normalize(cross(normalize(camera.up), direction));
  const up = cross(direction, right);
  const frame = (p: V3): readonly [number, number, number] => {
    const d: V3 = [p[0] - camera.target[0], p[1] - camera.target[1], p[2] - camera.target[2]];
    return [
      d[0] * right[0] + d[1] * right[1] + d[2] * right[2],
      d[0] * up[0] + d[1] * up[1] + d[2] * up[2],
      d[0] * direction[0] + d[1] * direction[1] + d[2] * direction[2],
    ];
  };
  const project = (p: V3): { readonly at: readonly [number, number]; readonly depth: number } => {
    const [u, v, w] = frame(p);
    return O.match(camera.focus, {
      onNone: () => ({ at: [u, v] as const, depth: 1 }),
      onSome: (focus) => ({ at: [(u * focus) / (focus - w), (v * focus) / (focus - w)] as const, depth: focus - w }),
    });
  };
  const from = project(probe.from);
  const to = project(probe.to);
  const length = Math.hypot(to.at[0] - from.at[0], to.at[1] - from.at[1]);
  return length < 1e-9
    ? O.none()
    : O.some({
        probe,
        point: from.at,
        length,
        along: [(to.at[0] - from.at[0]) / length, (to.at[1] - from.at[1]) / length],
        depth: [from.depth, to.depth],
      });
};

// Where a model point lands on the view plane, in the projector's own frame and under its own projection (as
// `projectedProbe` reads a probe's ends), with its nearness to the eye along the view direction.
const viewOf = (camera: Camera): ((p: V3) => Viewed) => {
  const direction = normalize(camera.eye);
  const right = normalize(cross(normalize(camera.up), direction));
  const up = cross(direction, right);
  return (p) => {
    const d: V3 = [p[0] - camera.target[0], p[1] - camera.target[1], p[2] - camera.target[2]];
    const u = d[0] * right[0] + d[1] * right[1] + d[2] * right[2];
    const v = d[0] * up[0] + d[1] * up[1] + d[2] * up[2];
    const w = d[0] * direction[0] + d[1] * direction[1] + d[2] * direction[2];
    return O.match(camera.focus, {
      onNone: () => ({ x: u, y: v, w }),
      onSome: (focus) => ({ x: (u * focus) / (focus - w), y: (v * focus) / (focus - w), w }),
    });
  };
};

// Offset along the face's step, from its shadow anchor, of the point of a
// probe's line nearest a view-plane point. A fraction of the projected line
// is a fraction of the probe in space only under an orthographic camera;
// under perspective the far end is foreshortened, so the fraction is walked
// back through the two ends' depths.
const offsetAt = (line: ProbeLine, x: number, y: number): number => {
  const t = Math.min(
    Math.max(((x - line.point[0]) * line.along[0] + (y - line.point[1]) * line.along[1]) / line.length, 0),
    1
  );
  const [near, far] = line.depth;
  const s = (t * near) / (t * near + (1 - t) * far);
  return line.probe.start + s * (line.probe.end - line.probe.start);
};

// The visible stretches of every probed face along its shading step: each
// visible piece of a probe mapped back to offsets from the face's shadow
// anchor, flagged when it starts at the face's own outline rather than behind
// a part in front of it, and chained with the other pieces of the face where
// they overlap or come within `merge` of each other along the step. The hatch
// planner shades each chain, splitting off the pieces its band cannot reach.
const regionsOf = (options: {
  readonly camera: Camera;
  readonly probes: ReadonlyArray<{ readonly probe: ShadingProbe; readonly pieces: ReadonlyArray<Segment2> }>;
  readonly merge: number;
  readonly outlines: ReadonlyArray<Segment2>;
}): HashMap.HashMap<number, ReadonlyArray<A.NonEmptyReadonlyArray<StretchPiece<ProbeLine>>>> => {
  // a piece also keeps its two ends on the view plane with their offsets, for the link test below
  type End = readonly [x: number, y: number, offset: number];
  type Piece = Omit<StretchPiece<ProbeLine>, "row"> & {
    readonly face: number;
    readonly height: number;
    readonly ends: readonly [End, End];
  };
  const pieces: ReadonlyArray<Piece> = A.flatMap(options.probes, ({ probe, pieces }) =>
    O.match(projectedProbe(options.camera, probe), {
      onNone: A.empty<Piece>,
      onSome: (line) => {
        const edge = Math.min(probe.start, probe.end);
        return A.map(pieces, (s) => {
          const a = offsetAt(line, s[0], s[1]);
          const b = offsetAt(line, s[2], s[3]);
          const from = Math.min(a, b);
          return {
            face: probe.face,
            height: probe.height,
            ends: [
              [s[0], s[1], a],
              [s[2], s[3], b],
            ] as const,
            from,
            to: Math.max(a, b),
            low: probe.height - probe.reach,
            high: probe.height + probe.reach,
            outline: Math.abs(from - edge) <= options.merge,
            probes: [line],
          };
        });
      },
    })
  );
  // the point of a piece at an offset inside its range
  const pointAt = (piece: Piece, offset: number): readonly [number, number] => {
    const [[x1, y1, o1], [x2, y2, o2]] = piece.ends;
    const t = Math.abs(o2 - o1) < 1e-12 ? 0.5 : (offset - o1) / (o2 - o1);
    return [x1 + (x2 - x1) * t, y1 + (y2 - y1) * t];
  };
  // whether the straight link between two points crosses a drawn outline (touching does not count)
  const side = (ax: number, ay: number, bx: number, by: number, px: number, py: number) =>
    (bx - ax) * (py - ay) - (by - ay) * (px - ax);
  const blocked = ([px, py]: readonly [number, number], [qx, qy]: readonly [number, number]): boolean =>
    A.some(options.outlines, ([ax, ay, bx, by]) => {
      if (
        Math.max(ax, bx) < Math.min(px, qx) ||
        Math.min(ax, bx) > Math.max(px, qx) ||
        Math.max(ay, by) < Math.min(py, qy) ||
        Math.min(ay, by) > Math.max(py, qy)
      ) {
        return false;
      }
      return (
        side(ax, ay, bx, by, px, py) * side(ax, ay, bx, by, qx, qy) < 0 &&
        side(px, py, qx, qy, ax, ay) * side(px, py, qx, qy, bx, by) < 0
      );
    });
  type Rowed = Piece & { readonly row: number };
  // Pieces of neighbouring rows belong to one visible area when their ranges overlap and the link between them, at
  // the middle of the overlap, crosses no drawn outline: a slanting wall in front of the face makes the pieces on its
  // two sides overlap in range from one row to the next, and only the link test keeps them apart.
  const linked = (p: Rowed, q: Rowed): boolean => {
    if (Math.abs(p.row - q.row) !== 1) {
      return false;
    }
    const lo = Math.max(p.from, q.from);
    const hi = Math.min(p.to, q.to);
    if (!(lo < hi)) {
      return false;
    }
    const middle = (lo + hi) / 2;
    return !blocked(pointAt(p, middle), pointAt(q, middle));
  };
  // a face's rows are its probe heights, lowest first; its areas are the connected groups of linked pieces
  const areasOf = (group: ReadonlyArray<Piece>): ReadonlyArray<A.NonEmptyReadonlyArray<StretchPiece<ProbeLine>>> => {
    const heights = pipe(
      A.map(group, (piece) => piece.height),
      A.dedupe,
      A.sort(Order.Number)
    );
    const rowed: ReadonlyArray<Rowed> = A.map(group, (piece) => ({
      ...piece,
      row: O.getOrElse(
        A.findFirstIndex(heights, (h) => h === piece.height),
        () => 0
      ),
    }));
    const graph = Graph.undirected<Rowed, null>((mutable) => {
      const nodes = A.map(rowed, (piece) => Graph.addNode(mutable, piece));
      A.forEach(rowed, (p, i) =>
        A.forEach(rowed, (q, j) => {
          if (i < j && linked(p, q)) {
            Graph.addEdge(mutable, nodes[i] ?? 0, nodes[j] ?? 0, null);
          }
        })
      );
    });
    return pipe(
      Graph.connectedComponents(graph),
      A.map(
        (component): ReadonlyArray<StretchPiece<ProbeLine>> =>
          pipe(
            component,
            A.map((index) => Graph.getNode(graph, index)),
            A.getSomes,
            A.map(({ face: _face, height: _height, ends: _ends, ...piece }): StretchPiece<ProbeLine> => piece)
          )
      ),
      A.filter((area): area is A.NonEmptyReadonlyArray<StretchPiece<ProbeLine>> => A.isReadonlyArrayNonEmpty(area))
    );
  };
  return pipe(
    pieces,
    A.filter((piece) => piece.to - piece.from > 0),
    A.groupBy((piece) => `${piece.face}`),
    R.toEntries,
    A.map(([face, group]) => [Number(face), areasOf(group)] as const),
    HashMap.fromIterable
  );
};

// Whether a probe's line on the view plane crosses a drawn piece: the probe
// saw the face visible there, so the piece belongs to the window the probe
// stands for. Pieces at the same offsets in other cells of a lattice are not
// crossed by this window's probes and are left to theirs.
const crosses = (line: ProbeLine, piece: Segment2, tolerance: number): boolean => {
  const [x1, y1, x2, y2] = piece;
  const ex = x2 - x1;
  const ey = y2 - y1;
  const dx = line.along[0] * line.length;
  const dy = line.along[1] * line.length;
  const denominator = dx * ey - dy * ex;
  if (Math.abs(denominator) < 1e-9) {
    return false;
  }
  const qx = x1 - line.point[0];
  const qy = y1 - line.point[1];
  // probe parameter s in [0, 1], piece parameter u in [0, 1] (within tolerance along the piece)
  const s = (qx * ey - qy * ex) / denominator;
  const u = (qx * dy - qy * dx) / denominator;
  const slack = tolerance / Math.max(Math.hypot(ex, ey), 1e-9);
  return s >= -1e-6 && s <= 1 + 1e-6 && u >= -slack && u <= 1 + slack;
};

// An overlay line with a facing is drawn only where its face turns toward the
// eye by more than this cosine: a line on a face seen edge-on or from behind
// would otherwise print over an outline.
const OVERLAY_MIN_FACING = 0.2;

// Whether an overlay line is drawn in this camera's view.
const facesEye =
  (camera: Camera) =>
  (overlay: OverlayLine): boolean =>
    O.match(overlay.facing, {
      onNone: () => true,
      onSome: (facing) => {
        const n = normalize(facing);
        const eye = normalize(camera.eye);
        return n[0] * eye[0] + n[1] * eye[1] + n[2] * eye[2] > OVERLAY_MIN_FACING;
      },
    });

// An overlay polyline as one compound of line edges, moved `lift` along its
// facing so hidden-line removal sees it in front of the face it lies on; none
// when every pair of consecutive points coincides.
const overlayShape = (overlay: OverlayLine): O.Option<AnyShape> => {
  const lift: V3 = O.match(overlay.facing, {
    onNone: () => [0, 0, 0],
    onSome: (facing) => scale(normalize(facing), overlay.lift),
  });
  const points = A.map(overlay.points, (point) => add(point, lift));
  const edges = pipe(
    A.zip(points, A.drop(points, 1)),
    A.filter(([a, b]) => Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) > 1e-9),
    A.map(([a, b]) => replicad.makeLine([...a], [...b]))
  );
  return A.isReadonlyArrayNonEmpty(edges) ? O.some(replicad.makeCompound([...edges])) : O.none();
};

type Lines = {
  readonly visible: ReadonlyArray<replicad.Edge>;
  readonly hidden: ReadonlyArray<replicad.Edge>;
  readonly broken: ReadonlyArray<replicad.Edge>;
  readonly extras: ReadonlyArray<ReadonlyArray<replicad.Edge>>;
};

// One hidden-line pass over the solid and broken-line compounds, with extra
// shapes (one stroke set per planned stretch, one probe, or one overlay line
// each) whose visible pieces come back per shape, in order. Every part hides
// what lies behind it whatever its style; only the broken compound's visible
// edges are read.
const hiddenLines = (options: {
  readonly oc: OpenCascadeInstance;
  readonly built: BuiltModel;
  readonly camera: Camera;
  readonly withHidden: boolean;
  readonly extras: ReadonlyArray<AnyShape>;
}): Lines => {
  const { oc, built, camera } = options;
  const algo = new oc.HLRBRep_Algo();
  A.forEach([built.solid, built.broken], (shape) => O.map(shape, (s) => algo.Add(s.wrapped, 0)));
  A.forEach(options.extras, (shape) => algo.Add(shape.wrapped, 0));
  algo.Projector(makeProjector(oc, camera));
  algo.Update();
  algo.Hide();
  const shapes = new oc.HLRBRep_HLRToShape(algo);
  return {
    visible: O.match(built.solid, {
      onNone: A.empty<replicad.Edge>,
      onSome: (s) => visibleEdges(shapes, s.wrapped, oc),
    }),
    hidden: O.match(
      O.filter(built.solid, () => options.withHidden),
      {
        onNone: A.empty<replicad.Edge>,
        onSome: (s) => [
          ...edgesOf(shapes.HCompound(s.wrapped), oc),
          ...edgesOf(shapes.Rg1LineHCompound(s.wrapped), oc),
          ...edgesOf(shapes.OutLineHCompound(s.wrapped), oc),
        ],
      }
    ),
    broken: O.match(built.broken, {
      onNone: A.empty<replicad.Edge>,
      onSome: (s) => visibleEdges(shapes, s.wrapped, oc),
    }),
    extras: A.map(options.extras, (shape) => edgesOf(shapes.VCompound(shape.wrapped), oc)),
  };
};

type ProjectOptions = {
  readonly oc: OpenCascadeInstance;
  readonly built: BuiltModel;
  readonly camera: Camera;
  readonly withHidden: boolean;
  readonly shading: O.Option<ShadingPlan>;
  readonly overlays: ReadonlyArray<OverlayLine>;
};

const drawView = (options: ProjectOptions, surveyor: O.Option<Surveyor>): EdgeSet => {
  const { oc, built, camera, withHidden } = options;
  // faces only broken primitives own: never probed nor shaded
  const isBrokenFace = (face: replicad.Face): boolean =>
    O.exists(built.styles, (styles) => A.some(styles.brokenFaces, (broken) => broken.isSame(face)));
  // a face merged across a solid and a broken primitive is shaded only where it is claimed
  const claimedOf = (face: replicad.Face): O.Option<(edge: replicad.Edge) => ReadonlyArray<replicad.Edge>> =>
    pipe(
      built.styles,
      O.flatMap((styles) => A.findFirst(styles.mixedFaces, (mixed) => mixed.face.isSame(face))),
      O.flatMap((mixed) =>
        O.map(surveyor, (s) => claimedStrokes({ surveyor: s, pieces: mixed.pieces, shortest: SHORTEST_STROKE }))
      )
    );
  const regions = pipe(
    built.solid,
    O.flatMap((solid) =>
      pipe(
        options.shading,
        O.filter((plan) => plan.style === "graded"),
        O.map((plan) => {
          const probing = probeEdges({ oc, shape: solid, camera, plan, isBrokenFace });
          const pass = A.isReadonlyArrayNonEmpty(probing)
            ? O.some(hiddenLines({ oc, built, camera, withHidden: false, extras: A.map(probing, (p) => p.edge) }))
            : O.none();
          const pieces = O.match(pass, {
            onNone: () => A.empty<ReadonlyArray<replicad.Edge>>(),
            onSome: (p) => p.extras,
          });
          return regionsOf({
            camera,
            probes: A.zipWith(probing, pieces, (p, edges) => ({ probe: p.probe, pieces: toSegments(edges) })),
            merge: plan.minPitch,
            // the outlines the probes were seen past: a link between two pieces that crosses one is not a link
            outlines: O.match(pass, {
              onNone: () => A.empty<Segment2>(),
              onSome: (p) => [...toSegments(p.visible), ...toSegments(p.broken)],
            }),
          });
        })
      )
    )
  );
  const shaded = pipe(
    built.solid,
    O.flatMap((solid) =>
      O.map(options.shading, (plan) =>
        hatchCompound({
          oc,
          shape: solid,
          camera,
          plan,
          isBrokenFace,
          claimedOf,
          regions: O.map(
            regions,
            (byFace) => (face: number) =>
              O.getOrElse(HashMap.get(byFace, face), A.empty<A.NonEmptyReadonlyArray<StretchPiece<ProbeLine>>>)
          ),
        })
      )
    )
  );
  // Each planned stretch's strokes go through the hidden-line pass as a shape
  // of their own, so a stretch left with a single stroke can be emptied (one
  // line beside an outline reads as a doubled edge, never as shading) and a
  // face whose every stroke is lost can be counted.
  const faces: ReadonlyArray<{
    readonly treatment: FaceTreatment;
    readonly stretches: ReadonlyArray<{ readonly shape: AnyShape; readonly probes: ReadonlyArray<ProbeLine> }>;
  }> = O.match(shaded, { onNone: () => [], onSome: (view) => view.faces });
  const stroked = A.flatMap(faces, (face, index) =>
    A.map(face.stretches, (stretch) => ({ index, shape: stretch.shape, probes: stretch.probes }))
  );
  // Overlay lines culled by their facing are never built; the rest go through
  // the same pass as the strokes, after them, as shapes of their own.
  const overlays = pipe(
    options.overlays,
    A.filter(facesEye(camera)),
    A.map((overlay) => O.map(overlayShape(overlay), (shape) => ({ style: overlay.style, shape }))),
    A.getSomes
  );
  const lines = hiddenLines({
    oc,
    built,
    camera,
    withHidden,
    extras: [...A.map(stroked, (s) => s.shape), ...A.map(overlays, (o) => o.shape)],
  });
  const strokePieces = A.take(lines.extras, A.length(stroked));
  const overlayPieces = A.zipWith(overlays, A.drop(lines.extras, A.length(stroked)), (overlay, edges) => ({
    style: overlay.style,
    edges,
  }));
  const overlayEdges = (style: OverlayStyle): ReadonlyArray<replicad.Edge> =>
    pipe(
      overlayPieces,
      A.filter((piece) => piece.style === style),
      A.flatMap((piece) => piece.edges)
    );
  // With unclaimed matter in a solid part, every piece of the solid compound's outline is traced back to the parts'
  // edges and split where it turns unclaimed: a visible unclaimed run joins the broken layer, a hidden one is dropped
  // (a broken part's hidden edges are never drawn either). Without it the pieces are drawn whole, as they always were.
  const traced = pipe(
    built.styles,
    O.flatMap((styles) =>
      O.map(surveyor, (s) =>
        pieceStyles({
          oc,
          styles,
          view: viewOf(camera),
          sight: sightOf({ direction: normalize(camera.eye), focus: camera.focus }),
          surveyor: s,
          visible: lines.visible,
        })
      )
    )
  );
  const split = (layer: "visible" | "hidden", edges: ReadonlyArray<replicad.Edge>) =>
    O.match(traced, {
      onNone: () => ({ claimed: sampled(edges), unclaimed: A.empty<RawSegment>() }),
      onSome: (styles) => {
        const runs = A.flatMap(edges, (edge) => A.map(styles.runs(layer)(edge), (run) => ({ edge, run })));
        const chords = (claimed: boolean) =>
          pipe(
            runs,
            A.filter(({ run }) => run.claimed === claimed),
            A.flatMap(({ edge, run }) => chordsOf(edge)(run))
          );
        return { claimed: chords(true), unclaimed: chords(false) };
      },
    });
  const [outline, behind] = (() => {
    try {
      return [split("visible", lines.visible), split("hidden", lines.hidden)] as const;
    } finally {
      O.map(traced, (styles) => styles.dispose());
    }
  })();
  const visible = canonicalSegments(outline.claimed);
  // broken overlay pieces are drawn exactly like a broken part's edges
  const broken = canonicalSegments([...sampled([...lines.broken, ...overlayEdges("broken")]), ...outline.unclaimed]);
  const emphasis = toSegments(overlayEdges("emphasis"));
  // Graded shading is tidied after the hidden-line pass, stretch by stretch:
  // fragments under the minimum stroke, the shorter of two lines inside half
  // the minimum pitch, and strokes touching or riding a drawn line go; the
  // uniform style is left exactly as the legacy golden records it.
  const legible = (segments: ReadonlyArray<Segment2>): ReadonlyArray<Segment2> =>
    O.match(options.shading, {
      onNone: () => segments,
      onSome: (plan) =>
        plan.style === "graded"
          ? legibleShading({
              segments,
              minStroke: plan.minStroke,
              minSpacing: plan.minPitch / 2,
              inset: plan.minPitch,
              outlines: [...visible, ...broken, ...emphasis],
              // the sheet carries the validator's floor on the plan; a bare plan clears half a pitch
              clearance: O.getOrElse(plan.clearance, () => plan.minPitch / 2),
            })
          : segments,
    });
  const graded = O.exists(options.shading, (plan) => plan.style === "graded");
  const tolerance = O.match(options.shading, { onNone: () => 0, onSome: (plan) => plan.minPitch });
  // a stretch keeps only the pieces its own probes crossed: a stroke planned
  // for one cell of a lattice is cut across the whole face and shows in the
  // neighbouring cells at the same offsets, where it would read as a band on
  // the wrong side; a stretch planned over the whole face (no probes) keeps all its pieces.
  // A visible stretch with room for fewer than two legible strokes (a piece survives the legibility pass only when it
  // is at least the minimum stroke plus an inset of one pitch at each end) is a sliver glimpsed through a gap, such as
  // a far wall seen through a star cell: it stays bare like a sliver face and is never counted lost. A stretch that had
  // room for a band and still drew none is the loss the coverage reports.
  const legibleLength = O.match(options.shading, {
    onNone: () => 0,
    onSome: (plan) => plan.minStroke + 2 * plan.minPitch,
  });
  const lengthOf = ([x1, y1, x2, y2]: Segment2) => Math.hypot(x2 - x1, y2 - y1);
  const drawn = A.zipWith(stroked, strokePieces, (stretch, edges) => {
    const pieces = toSegments(edges);
    const own = A.isReadonlyArrayNonEmpty(stretch.probes)
      ? A.filter(pieces, (piece) => A.some(stretch.probes, (line) => crosses(line, piece, tolerance)))
      : pieces;
    if (graded && A.length(A.filter(own, (piece) => lengthOf(piece) >= legibleLength)) < 2) {
      return { index: stretch.index, sliver: true, segments: A.empty<Segment2>() };
    }
    const segments = legible(own);
    return {
      index: stretch.index,
      sliver: false,
      segments: graded && A.length(segments) < 2 ? A.empty<Segment2>() : segments,
    };
  });
  // a planned stretch that drew nothing: its band was hidden, or clipped below two legible strokes
  const lostStretches = graded
    ? A.length(A.filter(drawn, (stretch) => !stretch.sliver && !A.isReadonlyArrayNonEmpty(stretch.segments)))
    : 0;
  const drawnFaces = pipe(
    A.filter(drawn, (stretch) => A.isReadonlyArrayNonEmpty(stretch.segments)),
    A.map((stretch) => stretch.index),
    HashSet.fromIterable
  );
  // a face whose every planned stretch turned out a sliver is bare by design, not lost
  const sliverFaces = pipe(
    A.filter(drawn, (stretch) => stretch.sliver),
    A.map((stretch) => stretch.index),
    HashSet.fromIterable,
    HashSet.filter((index) =>
      A.every(
        A.filter(drawn, (stretch) => stretch.index === index),
        (stretch) => stretch.sliver
      )
    )
  );
  // only graded faces are planned per visible stretch; a uniform face hidden behind another part is not lost
  const lostFaces = graded
    ? pipe(
        faces,
        A.filter(
          (face, index) =>
            face.treatment.kind === "lines" && !HashSet.has(drawnFaces, index) && !HashSet.has(sliverFaces, index)
        ),
        A.length
      )
    : 0;
  return EdgeSet.make({
    visible,
    hidden: canonicalSegments(behind.claimed),
    shading: pipe(
      drawn,
      A.flatMap((stretch) => stretch.segments),
      A.sort(segmentOrder)
    ),
    broken,
    emphasis,
    shadingCoverage: O.map(shaded, (view) => ShadingCoverage.make({ ...view.coverage, lostFaces, lostStretches })),
  });
};

/**
 * Run exact hidden-line removal for one camera and return canonical segments.
 *
 * **Details**
 *
 * The solid compound, the broken-line compound, the shading strokes, and the
 * overlay lines facing this camera are added to one hidden-line pass, so
 * every part hides what lies behind it whatever its style; the solid
 * compound's visible (and, on request, hidden) edges, the broken compound's
 * visible edges, each stroke set's visible pieces, and each overlay's visible
 * pieces are then read on their own. Broken overlay pieces join the broken
 * layer and emphasis pieces the emphasis layer; overlays draw nothing else,
 * so a model without overlays projects exactly as before they existed. When
 * a solid part has unclaimed matter (broken add primitives), each piece of
 * the solid compound's outline is traced back to the parts' own edges and
 * silhouettes and split where it turns unclaimed: a visible unclaimed run
 * joins the broken layer and a hidden one is dropped, and at a point where
 * several edges project, a visible piece takes the style of the nearest. A
 * face only broken primitives own is never shaded (skipped as
 * `broken-part`), and the strokes on a face merged across both kinds keep to
 * its claimed part. Without unclaimed matter nothing changes. Graded
 * shading takes two passes: a probe across every graded face at several
 * heights goes through hidden-line removal first, as a shape of its own, and
 * its visible pieces give the face's visible stretches; the strokes are then
 * planned per stretch and projected with the outlines. A stretch left with
 * fewer than two legible strokes carries none, and a face whose every stroke
 * is lost is counted in the coverage. The uniform style keeps one pass.
 *
 * @internal
 */
export const project = (options: ProjectOptions): EdgeSet => {
  // one extrema tool answers every distance query of the view's per-primitive styles
  const surveyor = O.map(options.built.styles, makeSurveyor);
  try {
    return drawView(options, surveyor);
  } finally {
    O.map(surveyor, (s) => s.dispose());
  }
};
