/**
 * Private replicad / opencascade.js glue: build parts from the technical spec,
 * run hidden-line removal through a driver-owned camera, and canonicalise the
 * projected segments.
 *
 * @internal
 */

import { A, N, O } from "@beep/utils";
import { flow, pipe } from "effect/Function";
import * as Order from "effect/Order";
import * as replicad from "replicad";
import { OcctError } from "../Occt.errors.ts";
import { BoundingBox, EdgeSet, ModelSummary, Primitive } from "../Occt.models.ts";
import { hatchCompound } from "./shading.ts";
import { cross } from "./vector.ts";
import type { HLRBRep_HLRToShape, OpenCascadeInstance, TopoDS_Shape } from "replicad-opencascadejs";
import type { Camera, ModelSpec, PartLineStyle, Rotation, Segment2, ShadingPlan } from "../Occt.models.ts";

type Shape3D = replicad.Shape3D;

const CURVE_SAMPLES = 24;
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
 * One built part and the line style it is drawn in.
 *
 * @internal
 */
export interface BuiltPart {
  readonly lineStyle: PartLineStyle;
  readonly shape: Shape3D;
}

/**
 * The parts of a model gathered by line style: the solid (claimed) parts and
 * the broken-line (unclaimed) parts, each as one solid or compound, or none.
 *
 * @internal
 */
export interface BuiltModel {
  readonly broken: O.Option<Shape3D>;
  readonly solid: O.Option<Shape3D>;
}

/**
 * Build every part of a spec as its own solid, in spec order.
 *
 * @internal
 */
export const buildParts = (spec: ModelSpec): ReadonlyArray<BuiltPart> =>
  A.map(spec.parts, (part) => ({ lineStyle: part.lineStyle, shape: buildPart(part.add, part.subtract) }));

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

/**
 * Gather built parts into one compound per line style.
 *
 * **Details**
 *
 * `makeCompound` disposes the part shapes it is given, so each part goes into
 * exactly one compound and must not be read afterwards. With no broken parts
 * the solid compound is exactly the compound the kernel always built.
 *
 * @internal
 */
export const compoundParts = (parts: ReadonlyArray<BuiltPart>): BuiltModel => ({
  solid: compoundOf(shapesIn(parts, "solid")),
  broken: compoundOf(shapesIn(parts, "broken")),
});

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
export const countOverlaps = (parts: ReadonlyArray<BuiltPart>): number =>
  pipe(
    parts,
    A.flatMap((a, i) => A.map(A.drop(parts, i + 1), (b) => [a.shape, b.shape] as const)),
    A.filter(([a, b]) => boxesMeet(a, b) && commonVolume(a, b) > OVERLAP_TOLERANCE),
    A.length
  );

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

const toSegments = (edges: ReadonlyArray<replicad.Edge>): ReadonlyArray<Segment2> =>
  pipe(
    edges,
    A.flatMap((edge) => {
      const samples = edge.geomType === "LINE" ? 1 : CURVE_SAMPLES;
      return A.makeBy(samples, (i) => {
        const a = edge.pointAt(i / samples);
        const b = edge.pointAt((i + 1) / samples);
        return canonical([a.x, a.y], [b.x, b.y]);
      });
    }),
    A.filter((s) => !(s[0] === s[2] && s[1] === s[3])),
    A.sort(segmentOrder)
  );

const visibleEdges = (shapes: HLRBRep_HLRToShape, own: TopoDS_Shape, oc: OpenCascadeInstance) => [
  ...edgesOf(shapes.VCompound(own), oc),
  ...edgesOf(shapes.Rg1LineVCompound(own), oc),
  ...edgesOf(shapes.OutLineVCompound(own), oc),
];

/**
 * Run exact hidden-line removal for one camera and return canonical segments.
 *
 * **Details**
 *
 * The solid compound, the broken-line compound, and the hatch are added to
 * one hidden-line pass, so every part hides what lies behind it whatever its
 * style. Each shape's edges are then read on their own: the solid
 * compound's visible (and, on request, hidden) edges, the broken compound's
 * visible edges only, and the hatch's visible edges. Only solid parts are
 * hatched. With no broken parts the pass is the one the kernel always ran.
 *
 * @internal
 */
export const project = (options: {
  readonly oc: OpenCascadeInstance;
  readonly built: BuiltModel;
  readonly camera: Camera;
  readonly withHidden: boolean;
  readonly shading: O.Option<ShadingPlan>;
}): EdgeSet => {
  const { oc, built, camera, withHidden } = options;
  const hatch = O.flatMap(built.solid, (shape) =>
    O.flatMap(options.shading, (plan) => hatchCompound({ oc, shape, camera, plan }))
  );
  const algo = new oc.HLRBRep_Algo();
  A.forEach([built.solid, built.broken, hatch], (shape) => O.map(shape, (s) => algo.Add(s.wrapped, 0)));
  algo.Projector(makeProjector(oc, camera));
  algo.Update();
  algo.Hide();
  const shapes = new oc.HLRBRep_HLRToShape(algo);
  const visible = O.match(built.solid, {
    onNone: A.empty<replicad.Edge>,
    onSome: (s) => visibleEdges(shapes, s.wrapped, oc),
  });
  const hidden = O.match(
    O.filter(built.solid, () => withHidden),
    {
      onNone: A.empty<replicad.Edge>,
      onSome: (s) => [
        ...edgesOf(shapes.HCompound(s.wrapped), oc),
        ...edgesOf(shapes.Rg1LineHCompound(s.wrapped), oc),
        ...edgesOf(shapes.OutLineHCompound(s.wrapped), oc),
      ],
    }
  );
  // Broken lines mark unclaimed matter (37 CFR 1.152), never hidden lines:
  // only the broken compound's visible edges are read.
  const broken = O.match(built.broken, {
    onNone: A.empty<replicad.Edge>,
    onSome: (s) => visibleEdges(shapes, s.wrapped, oc),
  });
  const shading = O.match(hatch, {
    onNone: A.empty<replicad.Edge>,
    onSome: (shape) => edgesOf(shapes.VCompound(shape.wrapped), oc),
  });
  return EdgeSet.make({
    visible: toSegments(visible),
    hidden: toSegments(hidden),
    shading: toSegments(shading),
    broken: toSegments(broken),
  });
};
