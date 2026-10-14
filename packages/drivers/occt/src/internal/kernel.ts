/**
 * Private replicad / opencascade.js glue: build parts from the technical spec,
 * run hidden-line removal through a driver-owned camera, and canonicalise the
 * projected segments.
 *
 * @internal
 */

import { legibleShading, ShadingCoverage, ShadingWindow } from "@beep/technical-drawing";
import { A, N, O } from "@beep/utils";
import { pipe } from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import * as Order from "effect/Order";
import * as R from "effect/Record";
import * as replicad from "replicad";
import { OcctError } from "../Occt.errors.ts";
import { BoundingBox, EdgeSet, ModelSummary, Primitive } from "../Occt.models.ts";
import { hatchCompound, probeEdges } from "./shading.ts";
import { cross } from "./vector.ts";
import type { FaceTreatment, ShadingProbe } from "@beep/technical-drawing";
import type { OpenCascadeInstance } from "replicad-opencascadejs";
import type { Camera, ModelSpec, Rotation, Segment2, ShadingPlan } from "../Occt.models.ts";
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

type ProbeLine = {
  readonly probe: ShadingProbe;
  readonly point: readonly [number, number];
  readonly along: readonly [number, number];
  readonly length: number;
};

// A probe's line on the view plane, in the projector's own frame (the frame
// the hidden-line pass reports its edges in); none when it projects to a point.
const projectedProbe = (camera: Camera, probe: ShadingProbe): O.Option<ProbeLine> => {
  const direction = normalize(camera.eye);
  const right = normalize(cross(normalize(camera.up), direction));
  const up = cross(direction, right);
  const to2d = (p: V3): readonly [number, number] => {
    const d: V3 = [p[0] - camera.target[0], p[1] - camera.target[1], p[2] - camera.target[2]];
    return [d[0] * right[0] + d[1] * right[1] + d[2] * right[2], d[0] * up[0] + d[1] * up[1] + d[2] * up[2]];
  };
  const point = to2d(probe.from);
  const end = to2d(probe.to);
  const length = Math.hypot(end[0] - point[0], end[1] - point[1]);
  return length < 1e-9
    ? O.none()
    : O.some({ probe, point, length, along: [(end[0] - point[0]) / length, (end[1] - point[1]) / length] });
};

// Offset along the face's step, from its shadow anchor, of the point of a
// probe's line nearest a view-plane point.
const offsetAt = (line: ProbeLine, x: number, y: number): number => {
  const t = (x - line.point[0]) * line.along[0] + (y - line.point[1]) * line.along[1];
  return line.probe.start + (Math.min(Math.max(t, 0), line.length) / line.length) * (line.probe.end - line.probe.start);
};

type Stretch = {
  readonly face: number;
  readonly from: number;
  readonly to: number;
  readonly low: number;
  readonly high: number;
};

// The visible stretches of every probed face along its shading step: each
// visible piece of a probe mapped back to offsets from the face's shadow
// anchor, then the pieces of all the face's probes merged where they overlap
// or come within `merge` of each other.
const regionsOf = (options: {
  readonly camera: Camera;
  readonly probes: ReadonlyArray<{ readonly probe: ShadingProbe; readonly pieces: ReadonlyArray<Segment2> }>;
  readonly merge: number;
}): HashMap.HashMap<number, ReadonlyArray<ShadingWindow>> => {
  const stretches: ReadonlyArray<Stretch> = A.flatMap(options.probes, ({ probe, pieces }) =>
    O.match(projectedProbe(options.camera, probe), {
      onNone: () => A.empty<Stretch>(),
      onSome: (line) =>
        A.map(pieces, (s) => {
          const a = offsetAt(line, s[0], s[1]);
          const b = offsetAt(line, s[2], s[3]);
          return {
            face: probe.face,
            from: Math.min(a, b),
            to: Math.max(a, b),
            low: probe.height - probe.reach,
            high: probe.height + probe.reach,
          };
        }),
    })
  );
  const merged = (group: ReadonlyArray<Stretch>): ReadonlyArray<ShadingWindow> =>
    pipe(
      A.sort(
        group,
        Order.mapInput(Order.Number, (s: Stretch) => s.from)
      ),
      A.reduce(A.empty<Stretch>(), (acc, s) =>
        O.match(A.last(acc), {
          onNone: () => [s],
          onSome: (last) =>
            s.from <= last.to + options.merge
              ? [
                  ...A.dropRight(acc, 1),
                  {
                    ...last,
                    to: Math.max(last.to, s.to),
                    low: Math.min(last.low, s.low),
                    high: Math.max(last.high, s.high),
                  },
                ]
              : [...acc, s],
        })
      ),
      A.filter((s) => s.to - s.from > 0),
      A.map((s) => ShadingWindow.make({ start: s.from, span: s.to - s.from, low: O.some(s.low), high: O.some(s.high) }))
    );
  return pipe(
    stretches,
    A.groupBy((s) => `${s.face}`),
    R.toEntries,
    A.map(([face, group]) => [Number(face), merged(group)] as const),
    HashMap.fromIterable
  );
};

type Lines = {
  readonly visible: ReadonlyArray<replicad.Edge>;
  readonly hidden: ReadonlyArray<replicad.Edge>;
  readonly extras: ReadonlyArray<ReadonlyArray<replicad.Edge>>;
};

// One hidden-line pass over the model with extra shapes (shading strokes, or
// one probe each) whose visible pieces come back per shape, in order.
const hiddenLines = (options: {
  readonly oc: OpenCascadeInstance;
  readonly compound: AnyShape;
  readonly camera: Camera;
  readonly withHidden: boolean;
  readonly extras: ReadonlyArray<AnyShape>;
}): Lines => {
  const { oc, compound, camera } = options;
  const algo = new oc.HLRBRep_Algo();
  algo.Add(compound.wrapped, 0);
  A.forEach(options.extras, (shape) => algo.Add(shape.wrapped, 0));
  algo.Projector(makeProjector(oc, camera));
  algo.Update();
  algo.Hide();
  const shapes = new oc.HLRBRep_HLRToShape(algo);
  const own = compound.wrapped;
  return {
    visible: [
      ...edgesOf(shapes.VCompound(own), oc),
      ...edgesOf(shapes.Rg1LineVCompound(own), oc),
      ...edgesOf(shapes.OutLineVCompound(own), oc),
    ],
    hidden: options.withHidden
      ? [
          ...edgesOf(shapes.HCompound(own), oc),
          ...edgesOf(shapes.Rg1LineHCompound(own), oc),
          ...edgesOf(shapes.OutLineHCompound(own), oc),
        ]
      : [],
    extras: A.map(options.extras, (shape) => edgesOf(shapes.VCompound(shape.wrapped), oc)),
  };
};

/**
 * Run exact hidden-line removal for one camera and return canonical segments.
 *
 * **Details**
 *
 * Graded shading takes two passes: a probe across every graded face at
 * several heights goes through hidden-line removal first, as a shape of its
 * own, and its visible pieces give the face's visible stretches; the strokes
 * are then planned per stretch and projected with the outlines. The uniform
 * style keeps its single pass.
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
  const regions = pipe(
    options.shading,
    O.filter((plan) => plan.style === "graded"),
    O.map((plan) => {
      const probing = probeEdges({ oc, shape: compound, camera, plan });
      const pieces = A.isReadonlyArrayNonEmpty(probing)
        ? hiddenLines({ oc, compound, camera, withHidden: false, extras: A.map(probing, (p) => p.edge) }).extras
        : A.empty<ReadonlyArray<replicad.Edge>>();
      return regionsOf({
        camera,
        probes: A.zipWith(probing, pieces, (p, edges) => ({ probe: p.probe, pieces: toSegments(edges) })),
        merge: plan.minPitch,
      });
    })
  );
  const shaded = O.map(options.shading, (plan) =>
    hatchCompound({
      oc,
      shape: compound,
      camera,
      plan,
      regions: O.map(
        regions,
        (windows) => (face: number) => O.getOrElse(HashMap.get(windows, face), () => A.empty<ShadingWindow>())
      ),
    })
  );
  // Each planned stretch's strokes go through the hidden-line pass as a shape
  // of their own, so a stretch left with a single stroke can be emptied (one
  // line beside an outline reads as a doubled edge, never as shading) and a
  // face whose every stroke is lost can be counted.
  const faces: ReadonlyArray<{ readonly treatment: FaceTreatment; readonly stretches: ReadonlyArray<AnyShape> }> =
    O.match(shaded, { onNone: () => [], onSome: (view) => view.faces });
  const stroked = A.flatMap(faces, (face, index) => A.map(face.stretches, (shape) => ({ index, shape })));
  const lines = hiddenLines({ oc, compound, camera, withHidden, extras: A.map(stroked, (s) => s.shape) });
  const outlines = toSegments(lines.visible);
  // Graded shading is tidied after the hidden-line pass, face by face:
  // fragments under the minimum stroke and the shorter of two lines inside
  // half the minimum pitch go; the uniform style is left exactly as the
  // legacy golden records it.
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
              outlines,
              clearance: plan.minPitch / 3,
            })
          : segments,
    });
  const graded = O.exists(options.shading, (plan) => plan.style === "graded");
  const drawn = A.map(lines.extras, (edges) => {
    const segments = legible(toSegments(edges));
    return graded && A.length(segments) < 2 ? A.empty<Segment2>() : segments;
  });
  const drawnFaces = pipe(
    A.zipWith(stroked, drawn, (s, segments) => (A.isReadonlyArrayNonEmpty(segments) ? O.some(s.index) : O.none())),
    A.getSomes,
    HashSet.fromIterable
  );
  const lostFaces = pipe(
    faces,
    A.filter((face, index) => face.treatment.kind === "lines" && !HashSet.has(drawnFaces, index)),
    A.length
  );
  return EdgeSet.make({
    visible: outlines,
    hidden: toSegments(lines.hidden),
    shading: pipe(drawn, A.flatten, A.sort(segmentOrder)),
    shadingCoverage: O.map(shaded, (view) => ShadingCoverage.make({ ...view.coverage, lostFaces })),
  });
};
