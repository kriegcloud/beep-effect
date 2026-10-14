/**
 * Pure 37 CFR 1.84(m) surface-shading rules: classify a planar face, band its
 * exposure, find its shadow edge, and decide the section planes that cut it
 * into shading lines.
 *
 * **Details**
 *
 * The default plan (`uniform` style, `longest-edge` axis, no minimum face
 * span) reproduces the original procedural hatch exactly: faces above the lit
 * threshold stay blank, lines run along the longest straight edge, and the
 * pitch grows with exposure. The opt-in `graded` style shades every visible
 * planar face: the first line sits one minimum pitch from the shadow edge and
 * the gaps grow geometrically toward the lit side, as in the USPTO Guide's
 * spaced-line examples. The opt-in `surface-class` axis hatches walls along
 * +Z, inclined faces along their level line, and level faces along their
 * longest edge, so a wall reads the same way in every view.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { A, O } from "@beep/utils";
import { pipe } from "effect/Function";
import * as Order from "effect/Order";
import { HatchAxis, ShadingCoverage, ShadingSkip, ShadingSkipReason } from "./Geometry.schemas.ts";
import {
  FaceAnchor,
  FaceTreatment,
  ShadingCut,
  ShadingLines,
  ShadingSkipped,
  ShadingTone,
  SurfaceClass,
  ViewFacts,
} from "./Shading.schemas.ts";
import type { Camera, ShadingPlan, Vec3 } from "./Geometry.schemas.ts";
import type { FaceAspect, FaceEdge, FaceFacts } from "./Shading.schemas.ts";

type V3 = Vec3;

const dot = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const crossOf = ([ax, ay, az]: V3, [bx, by, bz]: V3): V3 => [ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx];
const plus = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const times = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const unitOf = (a: V3): V3 => times(a, 1 / (Math.hypot(a[0], a[1], a[2]) || 1));
const minus = (a: V3, b: V3): V3 => plus(a, times(b, -1));

const MODEL_UP: V3 = [0, 0, 1];
const MODEL_X: V3 = [1, 0, 0];
// One degree either side decides level, upright, and square-on.
const ANGLE_TOLERANCE = Math.sin(Math.PI / 180);
const COS_TOLERANCE = Math.cos(Math.PI / 180);
// Below this fraction of a step surviving on the sheet, a face is nearly
// edge-on to its hatch step and lines would merge however far apart they are
// on the model.
const MIN_SPREAD = 0.2;
const BACK_FACING = 1e-9;
// Graded gaps grow by this factor from the shadow edge toward the lit side.
const GROWTH = 1.4;
// Graded strokes: this many full-length lines at the shadow edge, then a taper.
const FULL_LINES = 2;
const TAPER_FROM = 0.6;
const TAPER_TO = 0.4;

/**
 * Sheet frame and 1.84(m) light of a camera, in model coordinates.
 *
 * **Example** (The front elevation's light)
 *
 * ```ts
 * import { Camera } from "@beep/technical-drawing"
 * import { viewFactsOf } from "@beep/technical-drawing/Shading.rules"
 *
 * console.log(viewFactsOf(Camera.make({ eye: [0, -1, 0], up: [0, 0, 1] })).light)
 * ```
 *
 * @category shading
 * @since 0.0.0
 */
export const viewFactsOf = (camera: Camera): ViewFacts => {
  const eye = unitOf(camera.eye);
  const right = unitOf(crossOf(unitOf(camera.up), eye));
  const up = crossOf(eye, right);
  return ViewFacts.make({ eye, right, up, light: unitOf(plus(plus(times(right, -1), up), eye)) });
};

/**
 * Orientation class of a face normal against model +Z, within one degree.
 *
 * **Example** (A 45° flap is inclined)
 *
 * ```ts
 * import { surfaceClassOf } from "@beep/technical-drawing/Shading.rules"
 *
 * console.log(surfaceClassOf([0, -Math.SQRT1_2, Math.SQRT1_2])) // "inclined"
 * ```
 *
 * @category shading
 * @since 0.0.0
 */
export const surfaceClassOf = (normal: Vec3): SurfaceClass => {
  const vertical = Math.abs(dot(unitOf(normal), MODEL_UP));
  if (vertical >= COS_TOLERANCE) {
    return "level";
  }
  return vertical <= ANGLE_TOLERANCE ? "upright" : "inclined";
};

const onSheet =
  (view: ViewFacts) =>
  (point: V3): readonly [number, number] => [dot(point, view.right), dot(point, view.up)];

// Narrowest width of the face's projected outline: the extent across each
// projected straight edge (where a convex outline's width is smallest) and
// across every 5° direction, whichever is least.
const projectedSpan = (face: FaceFacts, view: ViewFacts): number => {
  const points = A.map(face.outline, onSheet(view));
  const edgeDirections = pipe(
    face.edges,
    A.map((edge) => {
      const [x, y] = onSheet(view)(minus(edge.end, edge.start));
      return Math.atan2(x, -y);
    })
  );
  const directions = [...A.makeBy(36, (i) => (i * Math.PI) / 36), ...edgeDirections];
  return pipe(
    directions,
    A.map((angle) => {
      const across = A.map(points, ([x, y]) => x * Math.cos(angle) + y * Math.sin(angle));
      return A.isReadonlyArrayNonEmpty(across) ? Math.max(...across) - Math.min(...across) : 0;
    }),
    A.reduce(Number.POSITIVE_INFINITY, (least, width) => Math.min(least, width))
  );
};

/**
 * Presentation of a face in a view: `sliver` when its projected width is
 * under `minFaceSpan` (model units), `square-on` within one degree of the
 * sight line, `oblique` otherwise.
 *
 * **Example** (A 2-wide band under a 3-wide minimum)
 *
 * ```ts
 * import { BoundingBox } from "@beep/technical-drawing"
 * import { aspectOf, viewFactsOf } from "@beep/technical-drawing/Shading.rules"
 * import { FaceFacts } from "@beep/technical-drawing/Shading.schemas"
 * import { Camera } from "@beep/technical-drawing"
 *
 * const face = FaceFacts.make({
 *   normal: [0, -1, 0], center: [0, 0, 1], edges: [],
 *   outline: [[-20, 0, 0], [20, 0, 0], [20, 0, 2], [-20, 0, 2]],
 *   bounds: BoundingBox.make({ min: [-20, 0, 0], max: [20, 0, 2] })
 * })
 * const view = viewFactsOf(Camera.make({ eye: [0, -1, 0], up: [0, 0, 1] }))
 * console.log(aspectOf({ face, view, minFaceSpan: 3 })) // "sliver"
 * ```
 *
 * @category shading
 * @since 0.0.0
 */
export const aspectOf = (input: {
  readonly face: FaceFacts;
  readonly view: ViewFacts;
  readonly minFaceSpan: number;
}): FaceAspect => {
  const { face, view, minFaceSpan } = input;
  if (minFaceSpan > 0 && projectedSpan(face, view) < minFaceSpan) {
    return "sliver";
  }
  return dot(unitOf(face.normal), view.eye) >= COS_TOLERANCE ? "square-on" : "oblique";
};

/**
 * Exposure band: the cosine between a face normal and the 1.84(m) light,
 * banded at 0.6, 0.2, and -0.2. A face seen square-on (exposure 1/√3) is
 * `light`; there is no unshaded band.
 *
 * **Example** (Band a square-on face)
 *
 * ```ts
 * import { toneOf } from "@beep/technical-drawing/Shading.rules"
 *
 * console.log(toneOf(1 / Math.sqrt(3))) // "light"
 * ```
 *
 * @category shading
 * @since 0.0.0
 */
export const toneOf = (exposure: number): ShadingTone => {
  if (exposure >= 0.6) {
    return "faint";
  }
  if (exposure >= 0.2) {
    return "light";
  }
  return exposure >= -0.2 ? "medium" : "dark";
};

// How much of a face a tone covers from its shadow edge, and how many lines:
// the 1993 Guide's flat-face examples (Appendix 4, Examples 32 and 36) put a
// few strokes at the shadow edge, the last within about a third of the span,
// and leave a face square to the light nearly bare.
const toneSpacing = (tone: ShadingTone) =>
  ShadingTone.$match(tone, {
    faint: () => ({ coverage: 0.15, minLines: 1, maxLines: 2 }),
    light: () => ({ coverage: 0.3, minLines: 2, maxLines: 5 }),
    medium: () => ({ coverage: 0.35, minLines: 3, maxLines: 7 }),
    dark: () => ({ coverage: 0.35, minLines: 4, maxLines: 8 }),
  });

/**
 * Line offsets of graded shading across a face `span` wide on the sheet,
 * measured from its shadow edge.
 *
 * **Details**
 *
 * The first line sits `minPitch` from the shadow edge; each gap is `1.4`
 * times the one before, capped at `maxPitch`. Lines stop when they pass the
 * tone's share of the span (once its minimum count is drawn) or its maximum
 * count, and never come within `minPitch` of the far edge. A face too narrow
 * for one line gets none.
 *
 * **Example** (A light 30-wide face)
 *
 * ```ts
 * import { gradedOffsets } from "@beep/technical-drawing/Shading.rules"
 *
 * console.log(gradedOffsets({ span: 30, minPitch: 1, maxPitch: 2.5, tone: "light" }))
 * ```
 *
 * @category shading
 * @since 0.0.0
 */
export const gradedOffsets = (input: {
  readonly span: number;
  readonly minPitch: number;
  readonly maxPitch: number;
  readonly tone: ShadingTone;
}): ReadonlyArray<number> => {
  const { span, minPitch } = input;
  const maxPitch = Math.max(input.maxPitch, minPitch);
  const { coverage, minLines, maxLines } = toneSpacing(input.tone);
  const limit = span - minPitch;
  const next = (offsets: ReadonlyArray<number>, at: number, gap: number): ReadonlyArray<number> => {
    const offset = at + gap;
    const enough = A.length(offsets) >= minLines && offset > coverage * span;
    return A.length(offsets) >= maxLines || offset > limit || enough
      ? offsets
      : next([...offsets, offset], offset, Math.min(maxPitch, gap * GROWTH));
  };
  return next([], 0, minPitch);
};

/**
 * Drawn fraction of each graded line's chord, by line count: the first
 * `fullLines` lines (two by default) run full length and the rest shorten
 * evenly from 60% to 40%.
 *
 * **Details**
 *
 * The taper is the 1993 Guide's (Appendix 4, Examples 32 and 34): strokes
 * are longest at the shadow edge and shorten toward the light, each centred
 * on the chord it would have filled. A face turned toward the light gets no
 * full-length line at all (`fullLines` 0): its one or two strokes are short.
 *
 * **Example** (Five lines, and two short strokes on a lit face)
 *
 * ```ts
 * import { gradedExtents } from "@beep/technical-drawing/Shading.rules"
 *
 * console.log(gradedExtents({ count: 5 })) // [1, 1, 0.6, 0.5, 0.4]
 * console.log(gradedExtents({ count: 2, fullLines: 0 })) // [0.6, 0.4]
 * ```
 *
 * @category shading
 * @since 0.0.0
 */
export const gradedExtents = (input: {
  readonly count: number;
  readonly fullLines?: number;
}): ReadonlyArray<number> => {
  const { count } = input;
  const fullLines = input.fullLines ?? FULL_LINES;
  return count <= 0
    ? A.empty()
    : A.makeBy(count, (index) =>
        index < fullLines
          ? 1
          : TAPER_FROM - (TAPER_FROM - TAPER_TO) * ((index - fullLines) / Math.max(1, count - fullLines - 1))
      );
};

// Lengths are compared to the micrometre so the equal edges of a regular face
// tie instead of ordering by floating-point noise.
const lineLength = (edge: FaceEdge): number => Math.round(edge.length * 1e3) / 1e3;

const rise = (edge: FaceEdge): number => Math.abs(edge.end[2] - edge.start[2]);

// Longest first; among equals the most level edge, so a regular face (an
// equilateral lid flap) is hatched along its horizontal edge in every view.
const hatchEdgeOrder = Order.combine(
  Order.flip(Order.mapInput(Order.Number, lineLength)),
  Order.mapInput(Order.Number, rise)
);

const longestEdgeDirection = (face: FaceFacts): O.Option<V3> =>
  pipe(
    face.edges,
    A.sort(hatchEdgeOrder),
    A.head,
    O.map((edge) => unitOf(plus(edge.end, times(edge.start, -1))))
  );

/**
 * Direction the shading lines run along a face, by hatch axis.
 *
 * **Details**
 *
 * `longest-edge`: the face's longest straight edge. `surface-class`: +Z on
 * upright faces, the level line (`normal × Z`) on inclined faces, and the
 * longest edge on level faces (+X on a level face without straight edges, such
 * as a peg's top). None for a `longest-edge` face without straight edges.
 *
 * **Example** (A wall hatches vertically)
 *
 * ```ts
 * import { BoundingBox } from "@beep/technical-drawing"
 * import { hatchDirectionOf } from "@beep/technical-drawing/Shading.rules"
 * import { FaceFacts } from "@beep/technical-drawing/Shading.schemas"
 *
 * const wall = FaceFacts.make({
 *   normal: [0, -1, 0], center: [0, 0, 10], edges: [], outline: [],
 *   bounds: BoundingBox.make({ min: [0, 0, 0], max: [40, 0, 20] })
 * })
 * console.log(hatchDirectionOf({ face: wall, axis: "surface-class" }))
 * ```
 *
 * @category shading
 * @since 0.0.0
 */
export const hatchDirectionOf = (input: { readonly face: FaceFacts; readonly axis: HatchAxis }): O.Option<Vec3> => {
  const { face } = input;
  return HatchAxis.$match(input.axis, {
    "longest-edge": () => longestEdgeDirection(face),
    "surface-class": () =>
      SurfaceClass.$match(surfaceClassOf(face.normal), {
        upright: () => O.some(MODEL_UP),
        inclined: () => O.some(unitOf(crossOf(unitOf(face.normal), MODEL_UP))),
        level: () => O.orElse(longestEdgeDirection(face), () => O.some(MODEL_X)),
      }),
  });
};

// Fraction of a step along `step` that survives projection toward `eye`: 1
// when the step lies in the picture plane, 0 when it runs along the sight line.
const spread = (step: V3, eye: V3): number => Math.sqrt(Math.max(0, 1 - dot(step, eye) ** 2));

// Distance on the sheet between two lines running along `direction` one unit
// apart along `step`: the projected step's component across the projected lines.
const sheetSpacing = (direction: V3, step: V3, view: ViewFacts): number => {
  const [dx, dy] = onSheet(view)(direction);
  const [sx, sy] = onSheet(view)(step);
  const length = Math.hypot(dx, dy);
  return length < 1e-9 ? 0 : Math.abs(dx * sy - dy * sx) / length;
};

const sign = (value: number): number => (value < 0 ? -1 : 1);

/**
 * Shadow-side anchor of graded lines on a face.
 *
 * **Details**
 *
 * The 1.84(m) light's component in the face plane points to the lit side;
 * the anchor is the outline point farthest the other way along `step`, and
 * the returned step points from it into the face. When the light has no
 * component along `step` (a face lit edge-on to its lines), the shadow side
 * is the sheet's lower right. The anchor edge is the first straight edge, in
 * the kernel's order, that runs along `direction` through the anchor's line.
 *
 * **Example** (A square-on wall anchors on its right edge)
 *
 * ```ts
 * import { BoundingBox, Camera } from "@beep/technical-drawing"
 * import { anchorOf, viewFactsOf } from "@beep/technical-drawing/Shading.rules"
 * import { FaceFacts } from "@beep/technical-drawing/Shading.schemas"
 *
 * const wall = FaceFacts.make({
 *   normal: [0, -1, 0], center: [0, 0, 10], edges: [],
 *   outline: [[-20, 0, 0], [20, 0, 0], [20, 0, 20], [-20, 0, 20]],
 *   bounds: BoundingBox.make({ min: [-20, 0, 0], max: [20, 0, 20] })
 * })
 * const view = viewFactsOf(Camera.make({ eye: [0, -1, 0], up: [0, 0, 1] }))
 * console.log(anchorOf({ face: wall, view, direction: [0, 0, 1] }).point) // [20, 0, 0]
 * ```
 *
 * @category shading
 * @since 0.0.0
 */
export const anchorOf = (input: {
  readonly face: FaceFacts;
  readonly view: ViewFacts;
  readonly direction: Vec3;
}): FaceAnchor => {
  const { face, view, direction } = input;
  const normal = unitOf(face.normal);
  const across = unitOf(crossOf(normal, direction));
  const inPlaneLight = minus(view.light, times(normal, dot(view.light, normal)));
  const toLight = dot(across, inPlaneLight);
  const sheetShadow = dot(across, minus(view.right, view.up));
  const toShadow = Math.abs(toLight) > 1e-9 ? -sign(toLight) : sign(sheetShadow);
  const shadow = times(across, toShadow);
  const point = pipe(
    face.outline,
    A.reduce(O.none<V3>(), (best, candidate) =>
      O.match(best, {
        onNone: () => O.some(candidate),
        onSome: (current) => (dot(candidate, shadow) > dot(current, shadow) + 1e-9 ? O.some(candidate) : best),
      })
    ),
    O.getOrElse(() => face.center)
  );
  const reach = dot(point, shadow);
  const tolerance = 1e-6 * Math.max(1, Math.abs(reach));
  const edge = A.findFirst(
    face.edges,
    (e) =>
      Math.abs(dot(e.start, shadow) - reach) <= tolerance &&
      Math.abs(dot(e.end, shadow) - reach) <= tolerance &&
      e.length > 0
  );
  return FaceAnchor.make({ point, step: times(shadow, -1), edge });
};

const skipped = (reason: ShadingSkipReason): FaceTreatment => ShadingSkipped.make({ reason });

// Exposure → pitch of the uniform style: `minPitch` at -1, `maxPitch` at the
// lit threshold, none above it.
const uniformPitch = (exposure: number, plan: ShadingPlan): O.Option<number> => {
  if (exposure > plan.litThreshold) {
    return O.none();
  }
  const t = (exposure + 1) / (plan.litThreshold + 1);
  return O.some(plan.minPitch + (plan.maxPitch - plan.minPitch) * Math.max(0, Math.min(1, t)));
};

// Lines centred on the face with a half-pitch phase so none lands on the
// face's own boundary, reaching the kernel bounding box's diagonal each way.
const centredLines = (face: FaceFacts, step: V3, pitch: number): FaceTreatment => {
  const { min, max } = face.bounds;
  const reach = Math.hypot(max[0] - min[0], max[1] - min[1], max[2] - min[2]);
  const count = Math.floor((2 * reach) / pitch);
  return ShadingLines.make({
    origin: face.center,
    step,
    cuts: A.makeBy(count + 1, (i) => ShadingCut.make({ offset: -reach + pitch * (i + 0.5) })),
  });
};

// The original hatch: lines along the longest edge, stepped across it unless
// that step is too foreshortened, in which case along it.
const legacyTreatment = (face: FaceFacts, view: ViewFacts, pitch: number): FaceTreatment =>
  pipe(
    longestEdgeDirection(face),
    O.match({
      onNone: () => skipped("no-straight-edge"),
      onSome: (direction) => {
        const across = unitOf(crossOf(face.normal, direction));
        const step =
          spread(across, view.eye) >= MIN_SPREAD || spread(across, view.eye) >= spread(direction, view.eye)
            ? across
            : direction;
        const visibleSpread = spread(step, view.eye);
        return visibleSpread < MIN_SPREAD ? skipped("edge-on") : centredLines(face, step, pitch / visibleSpread);
      },
    })
  );

const gradedTreatment = (input: {
  readonly face: FaceFacts;
  readonly view: ViewFacts;
  readonly plan: ShadingPlan;
  readonly direction: V3;
  readonly factor: number;
}): FaceTreatment => {
  const { face, view, plan, direction, factor } = input;
  const anchor = anchorOf({ face, view, direction });
  const span =
    pipe(
      face.outline,
      A.map((point) => dot(minus(point, anchor.point), anchor.step)),
      A.reduce(0, (most, reach) => Math.max(most, reach))
    ) * factor;
  const tone = toneOf(dot(face.normal, view.light));
  const offsets = gradedOffsets({ span, minPitch: plan.minPitch, maxPitch: plan.maxPitch, tone });
  // a lit face carries short strokes only (Example 32: lit faces are nearly bare)
  const cuts = A.zipWith(
    offsets,
    gradedExtents({ count: A.length(offsets), fullLines: tone === "faint" ? 0 : FULL_LINES }),
    (offset, extent) => ShadingCut.make({ offset: offset / factor, extent })
  );
  return A.isReadonlyArrayNonEmpty(cuts)
    ? ShadingLines.make({ origin: anchor.point, step: anchor.step, cuts })
    : skipped("sliver");
};

/**
 * Shading decided for one planar face in one view.
 *
 * **Details**
 *
 * Faces turned away from the viewer are `back-facing` and faces narrower than
 * `minFaceSpan` are `sliver`s. The default plan then reproduces the original
 * hatch (`lit` above the threshold, `no-straight-edge`, `edge-on`). Any other
 * axis or style hatches along {@link hatchDirectionOf} with the true sheet
 * spacing; `graded` lines start at the shadow edge and never skip a face as
 * lit, while `uniform` lines keep the lit threshold and the centred pitch.
 *
 * **Example** (A square-on wall under graded shading)
 *
 * ```ts
 * import { BoundingBox, Camera, ShadingPlan } from "@beep/technical-drawing"
 * import { treatmentFor, viewFactsOf } from "@beep/technical-drawing/Shading.rules"
 * import { FaceFacts } from "@beep/technical-drawing/Shading.schemas"
 *
 * const wall = FaceFacts.make({
 *   normal: [0, -1, 0], center: [0, 0, 10], edges: [],
 *   outline: [[-20, 0, 0], [20, 0, 0], [20, 0, 20], [-20, 0, 20]],
 *   bounds: BoundingBox.make({ min: [-20, 0, 0], max: [20, 0, 20] })
 * })
 * const view = viewFactsOf(Camera.make({ eye: [0, -1, 0], up: [0, 0, 1] }))
 * const plan = ShadingPlan.make({ minPitch: 1, maxPitch: 3, style: "graded", axis: "surface-class" })
 * console.log(treatmentFor({ face: wall, view, plan }).kind) // "lines"
 * ```
 *
 * @category shading
 * @since 0.0.0
 */
export const treatmentFor = (input: {
  readonly face: FaceFacts;
  readonly view: ViewFacts;
  readonly plan: ShadingPlan;
}): FaceTreatment => {
  const { face, view, plan } = input;
  if (!(dot(face.normal, view.eye) > BACK_FACING)) {
    return skipped("back-facing");
  }
  if (aspectOf({ face, view, minFaceSpan: plan.minFaceSpan }) === "sliver") {
    return skipped("sliver");
  }
  const exposure = dot(face.normal, view.light);
  const pitch = uniformPitch(exposure, plan);
  if (plan.style === "uniform" && O.isNone(pitch)) {
    return skipped("lit");
  }
  if (plan.style === "uniform" && plan.axis === "longest-edge") {
    return legacyTreatment(
      face,
      view,
      O.getOrElse(pitch, () => plan.maxPitch)
    );
  }
  return pipe(
    hatchDirectionOf({ face, axis: plan.axis }),
    O.match({
      onNone: () => skipped("no-straight-edge"),
      onSome: (direction) => {
        const step = unitOf(crossOf(unitOf(face.normal), direction));
        const factor = sheetSpacing(direction, step, view);
        if (factor < MIN_SPREAD) {
          return skipped("edge-on");
        }
        return plan.style === "graded"
          ? gradedTreatment({ face, view, plan, direction, factor })
          : centredLines(face, step, O.getOrElse(pitch, () => plan.maxPitch) / factor);
      },
    })
  );
};

/**
 * Coverage counts of a view: faces given lines, and skipped faces per reason
 * in {@link ShadingSkipReason} order, zero counts left out.
 *
 * **Example** (Two shaded faces and one sliver)
 *
 * ```ts
 * import { coverageOf } from "@beep/technical-drawing/Shading.rules"
 * import { ShadingCut, ShadingLines, ShadingSkipped } from "@beep/technical-drawing/Shading.schemas"
 *
 * const lines = ShadingLines.make({ origin: [0, 0, 0], step: [1, 0, 0], cuts: [ShadingCut.make({ offset: 1 })] })
 * console.log(coverageOf([lines, lines, ShadingSkipped.make({ reason: "sliver" })]))
 * ```
 *
 * @category shading
 * @since 0.0.0
 */
export const coverageOf = (treatments: ReadonlyArray<FaceTreatment>): ShadingCoverage => {
  const reasons = pipe(
    treatments,
    A.filter(FaceTreatment.guards.skipped),
    A.map((t) => t.reason)
  );
  return ShadingCoverage.make({
    shadedFaces: A.length(treatments) - A.length(reasons),
    skippedFaces: pipe(
      ShadingSkipReason.literals,
      A.map((reason) => ShadingSkip.make({ reason, faces: A.length(A.filter(reasons, (r) => r === reason)) })),
      A.filter((skip) => skip.faces > 0)
    ),
  });
};
