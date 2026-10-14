/**
 * Private replicad / opencascade.js glue: build parts from the technical spec,
 * run hidden-line removal through a driver-owned camera, and canonicalise the
 * projected segments.
 *
 * @internal
 */

import { legibleShading } from "@beep/technical-drawing";
import { A, N, O } from "@beep/utils";
import { pipe } from "effect/Function";
import * as HashSet from "effect/HashSet";
import * as Order from "effect/Order";
import * as R from "effect/Record";
import * as replicad from "replicad";
import { OcctError } from "../Occt.errors.ts";
import { BoundingBox, EdgeSet, ModelSummary, Primitive } from "../Occt.models.ts";
import { hatchCompound } from "./shading.ts";
import { cross } from "./vector.ts";
import type { OpenCascadeInstance } from "replicad-opencascadejs";
import type { Camera, ModelSpec, Rotation, Segment2, ShadingPlan } from "../Occt.models.ts";
import type { HatchCut } from "./shading.ts";
import type { V3 } from "./vector.ts";

type Shape3D = replicad.Shape3D;
type AnyShape = replicad.AnyShape;

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
 * Build every part of a spec and keep them as separate solids in one compound.
 *
 * @internal
 */
export const buildCompound = (spec: ModelSpec): { readonly compound: Shape3D } => {
  const parts = A.map(spec.parts, (part) => buildPart(part.add, part.subtract));
  const compound = A.length(parts) === 1 ? parts[0] : replicad.makeCompound(parts);
  if (!(compound instanceof replicad.Compound || compound instanceof replicad.Solid)) {
    throw OcctError.make({ reason: "solid-build", message: "The parts did not form a solid or a compound." });
  }
  return { compound };
};

/**
 * Measure a built compound.
 *
 * **Details**
 *
 * `makeCompound` disposes the part shapes it is given, so every measurement
 * reads the compound, never the parts.
 *
 * @internal
 */
export const summarize = (built: ReturnType<typeof buildCompound>): ModelSummary => {
  const [min, max] = built.compound.boundingBox.bounds;
  return ModelSummary.make({
    boundingBox: BoundingBox.make({
      min: [round(min[0]), round(min[1]), round(min[2])],
      max: [round(max[0]), round(max[1]), round(max[2])],
    }),
    volume: round(replicad.measureVolume(built.compound)),
    faceCount: built.compound.faces.length,
    edgeCount: built.compound.edges.length,
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

// How far (model units on the view plane) a visible stroke may sit from the
// projected cut line it came from and still be that cut's.
const CUT_TOLERANCE = 0.05;

// Every cut's line on the view plane, in the projector's own frame: the same
// frame the hidden-line pass reports its edges in.
const projectedCuts = (camera: Camera, cuts: ReadonlyArray<HatchCut>) => {
  const direction = normalize(camera.eye);
  const right = normalize(cross(normalize(camera.up), direction));
  const up = cross(direction, right);
  const to2d = (p: V3): readonly [number, number] => {
    const d: V3 = [p[0] - camera.target[0], p[1] - camera.target[1], p[2] - camera.target[2]];
    return [d[0] * right[0] + d[1] * right[1] + d[2] * right[2], d[0] * up[0] + d[1] * up[1] + d[2] * up[2]];
  };
  return A.map(cuts, (cut) => {
    const point = to2d(cut.point);
    const along = [
      cut.direction[0] * right[0] + cut.direction[1] * right[1] + cut.direction[2] * right[2],
      cut.direction[0] * up[0] + cut.direction[1] * up[1] + cut.direction[2] * up[2],
    ] as const;
    const length = Math.hypot(along[0], along[1]);
    return { cut, point, along: length < 1e-9 ? null : ([along[0] / length, along[1] / length] as const) };
  });
};

const offLine = (
  line: { readonly point: readonly [number, number]; readonly along: readonly [number, number] },
  x: number,
  y: number
): number => Math.abs((x - line.point[0]) * line.along[1] - (y - line.point[1]) * line.along[0]);

// Of a graded view's visible strokes, those on the first `keep` cuts of each
// run of consecutive visible cuts of a face (a cut shows when hidden-line
// removal left it a stroke at least `minStroke` long): a face whose shadow
// edge is behind another part draws its strokes on the spare positions
// further in, and a face that other parts split into several visible regions
// tones each region at its own shadow side, as a draftsperson would.
const visibleCuts = (options: {
  readonly camera: Camera;
  readonly cuts: ReadonlyArray<HatchCut>;
  readonly segments: ReadonlyArray<Segment2>;
  readonly minStroke: number;
}): ReadonlyArray<Segment2> => {
  const lines = pipe(
    projectedCuts(options.camera, options.cuts),
    A.map((line) => (line.along === null ? O.none() : O.some({ cut: line.cut, point: line.point, along: line.along }))),
    A.getSomes
  );
  const owner = (s: Segment2): O.Option<HatchCut> =>
    pipe(
      lines,
      A.findFirst((line) => offLine(line, s[0], s[1]) <= CUT_TOLERANCE && offLine(line, s[2], s[3]) <= CUT_TOLERANCE),
      O.map((line) => line.cut)
    );
  const owned = A.map(options.segments, (segment) => ({ segment, owner: owner(segment) }));
  const length = (s: Segment2) => Math.hypot(s[2] - s[0], s[3] - s[1]);
  const shows = (cut: HatchCut) =>
    A.some(
      owned,
      (o) =>
        O.exists(o.owner, (c) => c.face === cut.face && c.rank === cut.rank) && length(o.segment) >= options.minStroke
    );
  // per face, by rank: the first `keep` cuts of every run of cuts that show a stroke
  const key = (cut: HatchCut) => `${cut.face}:${cut.rank}`;
  const firstOfRuns = (group: A.NonEmptyReadonlyArray<HatchCut>): ReadonlyArray<HatchCut> =>
    pipe(
      A.sort(
        group,
        Order.mapInput(Order.Number, (cut: HatchCut) => cut.rank)
      ),
      A.reduce({ kept: A.empty<HatchCut>(), run: 0 }, (state, cut) =>
        shows(cut)
          ? { kept: state.run < group[0].keep ? [...state.kept, cut] : state.kept, run: state.run + 1 }
          : { kept: state.kept, run: 0 }
      ),
      (state) => state.kept
    );
  const chosen = pipe(
    options.cuts,
    A.groupBy((cut) => `${cut.face}`),
    R.values,
    A.flatMap(firstOfRuns),
    A.map(key),
    HashSet.fromIterable
  );
  return pipe(
    owned,
    A.filter((o) => O.match(o.owner, { onNone: () => true, onSome: (cut) => HashSet.has(chosen, key(cut)) })),
    A.map((o) => o.segment)
  );
};

/**
 * Run exact hidden-line removal for one camera and return canonical segments.
 *
 * @internal
 */
export const project = (options: {
  readonly oc: OpenCascadeInstance;
  readonly compound: AnyShape;
  readonly camera: Camera;
  readonly withHidden: boolean;
  readonly shading: O.Option<ShadingPlan>;
}): EdgeSet => {
  const { oc, compound, camera, withHidden } = options;
  const shaded = O.map(options.shading, (plan) => hatchCompound({ oc, shape: compound, camera, plan }));
  const hatch = O.flatMap(shaded, (view) => view.compound);
  const algo = new oc.HLRBRep_Algo();
  algo.Add(compound.wrapped, 0);
  O.map(hatch, (shape) => algo.Add(shape.wrapped, 0));
  algo.Projector(makeProjector(oc, camera));
  algo.Update();
  algo.Hide();
  const shapes = new oc.HLRBRep_HLRToShape(algo);
  const own = compound.wrapped;
  const visible = [
    ...edgesOf(shapes.VCompound(own), oc),
    ...edgesOf(shapes.Rg1LineVCompound(own), oc),
    ...edgesOf(shapes.OutLineVCompound(own), oc),
  ];
  const hidden = withHidden
    ? [
        ...edgesOf(shapes.HCompound(own), oc),
        ...edgesOf(shapes.Rg1LineHCompound(own), oc),
        ...edgesOf(shapes.OutLineHCompound(own), oc),
      ]
    : [];
  const shading = O.match(hatch, {
    onNone: () => [],
    onSome: (shape) => edgesOf(shapes.VCompound(shape.wrapped), oc),
  });
  // Graded shading is tidied after the hidden-line pass: fragments under the
  // minimum stroke and the shorter of two lines inside half the minimum pitch
  // go; the uniform style is left exactly as the legacy golden records it.
  const legible = (segments: ReadonlyArray<Segment2>): ReadonlyArray<Segment2> =>
    O.match(options.shading, {
      onNone: () => segments,
      onSome: (plan) =>
        plan.style === "graded"
          ? legibleShading({
              segments: visibleCuts({
                camera,
                cuts: O.match(shaded, { onNone: () => [], onSome: (view) => view.cuts }),
                segments,
                minStroke: plan.minStroke,
              }),
              minStroke: plan.minStroke,
              minSpacing: plan.minPitch / 2,
            })
          : segments,
    });
  return EdgeSet.make({
    visible: toSegments(visible),
    hidden: toSegments(hidden),
    shading: legible(toSegments(shading)),
    shadingCoverage: O.map(shaded, (view) => view.coverage),
  });
};
