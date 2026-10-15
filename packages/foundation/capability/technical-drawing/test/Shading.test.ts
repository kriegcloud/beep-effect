import {
  anchorOf,
  aspectOf,
  BandInk,
  BandRun,
  BoundingBox,
  bandLead,
  bandRunLengths,
  Camera,
  cameraForView,
  coverageOf,
  coveringOutlineDistance,
  FaceEdge,
  FaceFacts,
  FaceTreatment,
  faintShareOf,
  gradedExtents,
  gradedOffsets,
  hatchDirectionOf,
  inkOrderSteps,
  inkTwins,
  ladderPitch,
  legibleShading,
  legibleStrokeLength,
  nearestOutlineDistance,
  nextBandTaper,
  pointToSegmentDistance,
  reclippedShading,
  ShadingCoverage,
  ShadingCut,
  ShadingLines,
  ShadingPlan,
  ShadingRoom,
  ShadingSkip,
  ShadingSkipped,
  ShadingStretchSkip,
  ShadingTone,
  ShadingWindow,
  SheetOptions,
  settleBandTapers,
  shadingBandLadderFindings,
  shadingCoverageFindings,
  shadingLoneLineFindings,
  shadingOutlineClearanceFindings,
  shadingSpacingFindings,
  sideBySideGap,
  stretchFitsBand,
  surfaceClassOf,
  toneOf,
  treatmentFor,
  ValidationOptions,
  ViewFacts,
  ViewName,
  viewFactsOf,
} from "@beep/technical-drawing";
import { O } from "@beep/utils";
import { describe, expect, it } from "@effect/vitest";
import { assertNone, assertSome } from "@effect/vitest/utils";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as Order from "effect/Order";
import * as S from "effect/Schema";
import type { BandTaper, Segment2, Vec3 } from "@beep/technical-drawing";
import type * as HashSet from "effect/HashSet";

// A planar quad from four corners in order: straight edges, corner outline, bounds.
const quad = (normal: Vec3, corners: readonly [Vec3, Vec3, Vec3, Vec3]): FaceFacts => {
  const edges = A.map(corners, (start, i) => {
    const end = corners[(i + 1) % 4] ?? start;
    return FaceEdge.make({ start, end, length: Math.hypot(end[0] - start[0], end[1] - start[1], end[2] - start[2]) });
  });
  const axis = (k: 0 | 1 | 2) => A.map(corners, (c) => c[k]);
  const center = A.map([0, 1, 2], (k) => (Math.min(...axis(k as 0 | 1 | 2)) + Math.max(...axis(k as 0 | 1 | 2))) / 2);
  return FaceFacts.make({
    normal,
    center: [center[0] ?? 0, center[1] ?? 0, center[2] ?? 0],
    edges,
    outline: corners,
    bounds: BoundingBox.make({
      min: [Math.min(...axis(0)), Math.min(...axis(1)), Math.min(...axis(2))],
      max: [Math.max(...axis(0)), Math.max(...axis(1)), Math.max(...axis(2))],
    }),
  });
};

// 40 × 20 wall facing -Y.
const wall = quad(
  [0, -1, 0],
  [
    [-20, 0, 0],
    [20, 0, 0],
    [20, 0, 20],
    [-20, 0, 20],
  ]
);
const front = viewFactsOf(Camera.make({ eye: [0, -1, 0], up: [0, 0, 1] }));
const top = viewFactsOf(Camera.make({ eye: [0, 0, 1], up: [0, 1, 0] }));
const plan = (
  fields: Partial<{
    style: "uniform" | "graded";
    axis: "longest-edge" | "surface-class";
    minFaceSpan: number;
    minStroke: number;
  }>
) => ShadingPlan.make({ minPitch: 1, maxPitch: 3, litThreshold: 0.55, ...fields });

// Rounds away floating-point noise and folds -0 into 0.
const clean = (v: Vec3): ReadonlyArray<number> => A.map(v, (x) => Math.round(x * 1e9) / 1e9 + 0);

const linesOf = (treatment: FaceTreatment): O.Option<ShadingLines> =>
  treatment.kind === "lines" ? O.some(treatment) : O.none();

describe("Shading.rules", () => {
  it("defaults every new option to the original behaviour", () => {
    const defaults = ShadingPlan.make({ minPitch: 1, maxPitch: 3 });
    expect([defaults.style, defaults.axis, defaults.minFaceSpan, defaults.litThreshold]).toEqual([
      "uniform",
      "longest-edge",
      0,
      0.75,
    ]);
    const sheet = SheetOptions.make({});
    expect([sheet.shadingStyle, sheet.shadingAxis, sheet.shadingMinFaceSpanMm]).toEqual(["uniform", "longest-edge", 0]);
  });

  it("puts the 1.84(m) light at the sheet's upper left, toward the viewer", () => {
    const k = 1 / Math.sqrt(3);
    expect(clean(front.right)).toEqual([1, 0, 0]);
    expect(clean(front.up)).toEqual([0, 0, 1]);
    A.forEach(front.light, (v, i) => expect(v).toBeCloseTo([-k, -k, k][i] ?? 0, 12));
  });

  it("frames a two-point camera along its sight, keeps sheet-right level, and lands its light at 45° on the picture plane", () => {
    const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const unit = (v: Vec3): Vec3 => [v[0] / Math.hypot(...v), v[1] / Math.hypot(...v), v[2] / Math.hypot(...v)];
    const level: Vec3 = [-Math.sin(Math.PI / 6), -Math.cos(Math.PI / 6), 0];
    A.forEach([1, -1] as const, (zSign) => {
      const sight: Vec3 = [level[0] * 120, level[1] * 120, 45 * zSign];
      const camera = Camera.make({
        eye: level,
        up: [0, 0, 1],
        target: [20, 15, 20 + 45 * zSign],
        focus: O.some(120),
        sight: O.some(sight),
        hiddenLinePassAbout: "target",
      });
      const view = viewFactsOf(camera);
      // the facing direction is the sight, not the level eye
      A.forEach(view.eye, (v, i) => expect(v).toBeCloseTo(unit(sight)[i] ?? 0, 12));
      // sheet right stays level, square to the sight, and sheet up leans with it
      expect(view.right[2]).toBeCloseTo(0, 12);
      expect(dot(view.right, view.eye)).toBeCloseTo(0, 12);
      expect(dot(view.right, level)).toBeCloseTo(0, 12);
      expect(dot(view.up, view.eye)).toBeCloseTo(0, 12);
      expect(view.up[2]).toBeGreaterThan(0);
      // the sheet is the vertical picture plane, square to the level eye: the view carries that normal, and the
      // light's part on it (the level component dropped) falls at 45° from the upper left
      const cosBeta = Math.abs(dot(level, view.eye));
      expect(cosBeta).toBeLessThan(1);
      assertSome(O.map(view.picture, clean), clean(level));
      const onPicture = dot(view.light, level);
      const sheetLight = [dot(view.light, view.right), view.light[2]] as const;
      expect(sheetLight[0]).toBeLessThan(0);
      expect(-sheetLight[0]).toBeCloseTo(sheetLight[1], 12);
      expect(onPicture).toBeCloseTo(1 / Math.sqrt(3), 12);
      expect(dot(view.light, view.eye)).toBeGreaterThan(0);
      // the same camera without its sight reads the level eye, square to its own sheet
      const blind = viewFactsOf(Camera.make({ ...camera, sight: O.none() }));
      A.forEach(blind.eye, (v, i) => expect(v).toBeCloseTo(level[i] ?? 0, 12));
      assertNone(blind.picture);
    });
  });

  it("lights a two-point view on its picture plane, so a wall parallel to the sheet takes one tone above and below", () => {
    // Review loop 4, O-03: the light leaned with the tilted sight, so one wall parallel to the picture plane was lit
    // 0.32 from above (light, four lines) and 0.76 from below (faint, two lines). Lit on the picture plane, the wall
    // takes the square-on exposure 1/√3 and the same band in the two-point top view, the two-point bottom view and
    // the level elevation.
    const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const box = BoundingBox.make({ min: [0, 0, 0], max: [40, 30, 20] });
    const twoPoint = (view: "top-perspective" | "bottom-perspective") =>
      cameraForView({ view, box, projection: "two-point", elevationDeg: O.some(20) });
    const above = twoPoint("top-perspective");
    const below = twoPoint("bottom-perspective");
    const levelEye = above.eye;
    const views = [viewFactsOf(above), viewFactsOf(below), viewFactsOf(Camera.make({ eye: levelEye, up: [0, 0, 1] }))];
    const [fromAbove, fromBelow, level] = views;
    // the two sights tilt opposite ways, so the frames differ
    expect(dot(fromAbove?.eye ?? levelEye, fromBelow?.eye ?? levelEye)).toBeLessThan(0.99);
    A.forEach(views, (view) =>
      A.forEach(view.light, (v, i) => expect(v).toBeCloseTo(level?.light[i] ?? Number.NaN, 12))
    );
    // a 40 × 20 wall facing the level eye
    const along: Vec3 = [-levelEye[1], levelEye[0], 0];
    const at = (x: number, z: number): Vec3 => [10 + along[0] * x, 10 + along[1] * x, z];
    const parallel = quad(levelEye, [at(-20, 0), at(20, 0), at(20, 20), at(-20, 20)]);
    A.forEach(views, (view) => expect(dot(parallel.normal, view.light)).toBeCloseTo(1 / Math.sqrt(3), 12));
    expect(A.map(views, (view) => toneOf(dot(parallel.normal, view.light)))).toEqual(["light", "light", "light"]);
    const gradedPlan = plan({ style: "graded", axis: "surface-class" });
    const bandOf = (view: ViewFacts) =>
      O.map(linesOf(treatmentFor({ face: parallel, view, plan: gradedPlan })), (lines) => ({
        offsets: A.map(lines.cuts, (cut) => Math.round(cut.offset * 1e9) / 1e9),
        extents: A.map(lines.cuts, (cut) => Math.round(cut.extent * 1e9) / 1e9),
      }));
    const bands = A.map(views, bandOf);
    // the light recipe across 40: five lines, two whole and three tapered
    assertSome(
      O.map(bands[0] ?? O.none(), (band) => band.extents),
      [1, 1, 0.6, 0.5, 0.4]
    );
    expect(bands[1]).toEqual(bands[0]);
    expect(bands[2]).toEqual(bands[0]);
  });

  it("classes faces against +Z within a degree", () => {
    expect(surfaceClassOf([0, 0, 1])).toBe("level");
    expect(surfaceClassOf([0, 0.01, -1])).toBe("level");
    expect(surfaceClassOf([1, 0, 0])).toBe("upright");
    expect(surfaceClassOf([0.9998, 0, 0.01])).toBe("upright");
    expect(surfaceClassOf([0, -Math.SQRT1_2, Math.SQRT1_2])).toBe("inclined");
  });

  it("tells square-on, oblique, and sliver faces apart", () => {
    expect(aspectOf({ face: wall, view: front, minFaceSpan: 0 })).toBe("square-on");
    const turned = viewFactsOf(Camera.make({ eye: [0.5, -1, 0], up: [0, 0, 1] }));
    expect(aspectOf({ face: wall, view: turned, minFaceSpan: 0 })).toBe("oblique");
    expect(aspectOf({ face: wall, view: front, minFaceSpan: 19.9 })).toBe("square-on");
    expect(aspectOf({ face: wall, view: front, minFaceSpan: 20.1 })).toBe("sliver");
  });

  it("bands exposure and never leaves a band unshaded", () => {
    expect(A.map([1, 0.6, 1 / Math.sqrt(3), 0.2, 0, -0.2, -1], toneOf)).toEqual([
      "faint",
      "faint",
      "light",
      "light",
      "medium",
      "medium",
      "dark",
    ]);
    expect(ShadingTone.literals).toEqual(["faint", "light", "medium", "dark"]);
  });

  it("anchors graded lines on the shadow edge: lower right of a square-on wall", () => {
    const anchor = anchorOf({ face: wall, view: front, direction: [0, 0, 1] });
    expect(anchor.point).toEqual([20, 0, 0]);
    expect(clean(anchor.step)).toEqual([-1, 0, 0]);
    assertSome(
      O.map(anchor.edge, (e) => [e.start, e.end]),
      [
        [20, 0, 0],
        [20, 0, 20],
      ]
    );
    // horizontal lines on the same wall anchor on the bottom edge (light from above)
    expect(anchorOf({ face: wall, view: front, direction: [1, 0, 0] }).point[2]).toBe(0);
  });

  it("anchors a steeply receding wall's band at its sheet-right end, not its near end", () => {
    // from the viewer at -Y the wall runs from x = 0 (sheet right) away and to the left, 60° off the sheet
    const receding = quad(
      [-Math.sqrt(0.75), -0.5, 0],
      [
        [0, 0, 0],
        [-5, 8.66, 0],
        [-5, 8.66, 20],
        [0, 0, 20],
      ]
    );
    expect(anchorOf({ face: receding, view: front, direction: [0, 0, 1] }).point[0]).toBe(0);
    // a wall the sheet light runs straight across (seen from below, at 60° to the sheet) anchors on
    // its sheet-right end, here the end with the smaller y
    const fromBelow = viewFactsOf(Camera.make({ eye: [-0.82, 0, -0.58], up: [0, 0, 1] }));
    const acrossLit = quad(
      [-0.5, 0.866, 0],
      [
        [-200, 0, 0],
        [-100, 57.7, 0],
        [-100, 57.7, 400],
        [-200, 0, 400],
      ]
    );
    expect(anchorOf({ face: acrossLit, view: fromBelow, direction: [0, 0, 1] }).point[1]).toBe(0);
    // a tab sticking out past the wall's right side does not move the anchor off the wall
    const tabbed = FaceFacts.make({
      ...wall,
      edges: [
        ...wall.edges,
        FaceEdge.make({ start: [20, 0, 8], end: [22, 0, 8], length: 2 }),
        FaceEdge.make({ start: [22, 0, 8], end: [22, 0, 12], length: 4 }),
        FaceEdge.make({ start: [22, 0, 12], end: [20, 0, 12], length: 2 }),
      ],
      outline: [...wall.outline, [22, 0, 8], [22, 0, 12]],
    });
    expect(anchorOf({ face: tabbed, view: front, direction: [0, 0, 1] }).point[0]).toBe(20);
    // a chord must keep the minimum stroke after both ends are drawn back one pitch
    const gradedPlan = (minStroke: number) => plan({ style: "graded", axis: "surface-class", minStroke });
    expect(treatmentFor({ face: wall, view: front, plan: gradedPlan(18) }).kind).toBe("lines");
    expect(treatmentFor({ face: wall, view: front, plan: gradedPlan(19) })).toEqual(
      ShadingSkipped.make({ reason: "sliver" })
    );
  });

  it("spaces graded lines from minPitch, growing, capped, within the tone's share", () => {
    const offsets = gradedOffsets({ span: 40, minPitch: 1, maxPitch: 2.5, tone: "medium" });
    const gaps = A.zipWith([0, ...offsets], offsets, (a, b) => b - a);
    expect(offsets[0]).toBe(1);
    expect(
      A.every(
        A.zipWith(gaps, A.drop(gaps, 1), (a, b) => b >= a - 1e-12),
        (grows) => grows
      )
    ).toBe(true);
    expect(Math.max(...gaps)).toBe(2.5);
    expect(Math.max(...offsets)).toBeLessThanOrEqual(0.35 * 40 + 2.5);
    // a lit face carries two to four short strokes: three fit inside 15% of a 40-wide face, two in an 8-wide one
    expect(gradedOffsets({ span: 40, minPitch: 1, maxPitch: 2.5, tone: "faint" }).length).toBe(3);
    expect(gradedOffsets({ span: 8, minPitch: 1, maxPitch: 2.5, tone: "faint" }).length).toBe(2);
    expect(gradedOffsets({ span: 400, minPitch: 1, maxPitch: 2.5, tone: "faint" }).length).toBe(4);
    expect(gradedOffsets({ span: 400, minPitch: 1, maxPitch: 2.5, tone: "dark" }).length).toBe(8);
    // a narrow face still gets the tone's minimum where it fits, and nothing below one pitch
    expect(gradedOffsets({ span: 4, minPitch: 1, maxPitch: 2.5, tone: "medium" })).toEqual([1, 2.4]);
    expect(gradedOffsets({ span: 1.5, minPitch: 1, maxPitch: 2.5, tone: "dark" })).toEqual([]);
    // positions the face is too narrow for are skipped, not counted: the strokes move inward
    expect(
      A.map(
        gradedOffsets({ span: 40, minPitch: 1, maxPitch: 2.5, tone: "faint", keep: (o) => o >= 3 }),
        (o) => Math.round(o * 10) / 10
      )
    ).toEqual([3, 4.4]);
    // a visible stretch of the face is shaded on its own, from the side nearest the shadow anchor
    const gradedPlan = plan({ style: "graded", axis: "surface-class" });
    const offsetsFrom = (from: number) => (treatment: FaceTreatment) =>
      O.map(linesOf(treatment), (l) => A.map(l.cuts, (c) => Math.round((c.offset - from) * 10) / 10));
    const whole = offsetsFrom(0)(treatmentFor({ face: wall, view: front, plan: gradedPlan }));
    const stretch = offsetsFrom(12)(
      treatmentFor({ face: wall, view: front, plan: gradedPlan, window: ShadingWindow.make({ start: 12, span: 28 }) })
    );
    assertSome(O.map(stretch, A.take(3)), O.getOrThrow(O.map(whole, A.take(3))));
    expect(Math.max(...O.getOrThrow(stretch))).toBeLessThanOrEqual(28 - 1);
    // a stretch cannot start before the anchor: a probe through a tab that sticks out past the
    // face's shadow side sees the face begin inside the tab, and the band still starts at the edge
    const proud = offsetsFrom(0)(
      treatmentFor({ face: wall, view: front, plan: gradedPlan, window: ShadingWindow.make({ start: -2, span: 30 }) })
    );
    assertSome(O.map(proud, A.take(3)), O.getOrThrow(O.map(whole, A.take(3))));
  });

  it("keeps shading legible after hidden-line removal: fragments and doubled lines go", () => {
    const segments: ReadonlyArray<Segment2> = [
      [0, 0, 10, 0], // a full stroke
      [0, 0.3, 4, 0.3], // a shorter line 0.3 beside it: dropped for the longer one
      [0, 0, 0.5, 0], // a fragment under the minimum stroke
      [0, 2, 10, 2], // a neighbour at a legal gap
      [20, 0, 20, 10], // unrelated
    ];
    expect(legibleShading({ segments, minStroke: 1, minSpacing: 0.5 })).toEqual([
      [0, 0, 10, 0],
      [0, 2, 10, 2],
      [20, 0, 20, 10],
    ]);
    // the inset draws every surviving stroke back from both ends
    expect(
      legibleShading({
        segments: [
          [0, 0, 10, 0],
          [0, 5, 1.5, 5],
        ],
        minStroke: 1,
        minSpacing: 0.5,
        inset: 1,
      })
    ).toEqual([[1, 0, 9, 0]]);
    // equal lengths side by side keep the first
    expect(
      legibleShading({
        segments: [
          [0, 0.3, 10, 0.3],
          [0, 0, 10, 0],
        ],
        minStroke: 0,
        minSpacing: 0.5,
      })
    ).toEqual([[0, 0.3, 10, 0.3]]);
    assertSome(sideBySideGap({ first: [0, 0, 10, 0], second: [0, 0.3, 10, 0.3], minSpacing: 0.5 }), 0.3);
    assertNone(sideBySideGap({ first: [0, 0, 10, 0], second: [10.5, 0, 20, 0], minSpacing: 0.5 }));
  });

  it("draws a stroke end back further until it stands clear of an outline it met at a shallow angle", () => {
    // the top end at (5, 0.3) sits 0.2 from the outline y = x / 10; clearance 0.5 needs it at y >= 1
    const [stroke] = legibleShading({
      segments: [[5, 0.3, 5, 19.7]],
      minStroke: 1,
      minSpacing: 0.5,
      outlines: [[0, 0, 20, 2]],
      clearance: 0.5,
    });
    expect(stroke?.[1]).toBeCloseTo(1.05, 6);
    expect(stroke?.[3]).toBe(19.7);
    // a stroke running beside an outline closer than the clearance is dropped
    expect(
      legibleShading({
        segments: [[0.3, 2, 0.3, 18]],
        minStroke: 1,
        minSpacing: 0.5,
        outlines: [[0, 0, 0, 20]],
        clearance: 0.5,
      })
    ).toEqual([]);
    expect(pointToSegmentDistance({ x: 5, y: 3, segment: [0, 0, 10, 0] })).toBe(3);
  });

  it("tapers graded strokes: two full lines, then 60% down to 40% of the chord", () => {
    const rounded = (extents: ReadonlyArray<number>) => A.map(extents, (e) => Math.round(e * 100) / 100);
    expect(rounded(gradedExtents({ count: 5 }))).toEqual([1, 1, 0.6, 0.5, 0.4]);
    expect(rounded(gradedExtents({ count: 3 }))).toEqual([1, 1, 0.6]);
    expect(rounded(gradedExtents({ count: 2 }))).toEqual([1, 1]);
    expect(gradedExtents({ count: 0 })).toEqual([]);
    expect(rounded(gradedExtents({ count: 2, fullLines: 0 }))).toEqual([0.6, 0.4]);
    expect(rounded(gradedExtents({ count: 1, fullLines: 0 }))).toEqual([0.6]);
  });

  it("keeps the original lit cut-off under the default plan and shades the same face when graded", () => {
    const uniform = treatmentFor({ face: wall, view: front, plan: plan({}) });
    expect(uniform).toEqual(ShadingSkipped.make({ reason: "lit" }));
    const graded = treatmentFor({ face: wall, view: front, plan: plan({ style: "graded", axis: "surface-class" }) });
    const lines = linesOf(graded);
    assertSome(
      O.map(lines, (l) => [clean(l.origin), clean(l.step)]),
      [
        [20, 0, 0],
        [-1, 0, 0],
      ]
    );
    const offsets = O.getOrElse(
      O.map(lines, (l) => A.map(l.cuts, (cut) => cut.offset)),
      () => []
    );
    // the taper: the first two strokes run the full chord, later ones shorten toward the light
    const extents = O.getOrElse(
      O.map(lines, (l) => A.map(l.cuts, (cut) => cut.extent)),
      () => []
    );
    expect(A.take(extents, 2)).toEqual([1, 1]);
    expect(
      A.every(
        A.zipWith(extents, A.drop(extents, 1), (a, b) => b <= a),
        (shrinks) => shrinks
      )
    ).toBe(true);
    const gaps = A.zipWith([0, ...offsets], offsets, (a, b) => b - a);
    expect(gaps[0]).toBe(1);
    expect(
      A.every(
        A.zipWith(gaps, A.drop(gaps, 1), (a, b) => b >= a - 1e-12),
        (grows) => grows
      )
    ).toBe(true);
  });

  it("runs a level face's lines along its darkest edge when the light is known", () => {
    // a regular hexagon lid: every edge is longest, so the light decides; under the top-plan light
    // (world +X +Y +Z) the darkest edge is the one whose outward side faces -X -Y
    const corners = A.makeBy(
      6,
      (i) => [100 * Math.cos((i * Math.PI) / 3), 100 * Math.sin((i * Math.PI) / 3), 5] as const
    );
    const lid = FaceFacts.make({
      normal: [0, 0, 1],
      center: [0, 0, 5],
      edges: A.makeBy(6, (i) => {
        const start = corners[i]!;
        const end = corners[(i + 1) % 6]!;
        return FaceEdge.make({ start, end, length: Math.hypot(end[0] - start[0], end[1] - start[1]) });
      }),
      outline: corners,
      bounds: BoundingBox.make({ min: [-100, -87, 5], max: [100, 87, 5] }),
    });
    const topPlan = viewFactsOf(Camera.make({ eye: [0, 0, 1], up: [1, 0, 0] }));
    const direction = O.getOrThrow(hatchDirectionOf({ face: lid, axis: "surface-class", view: topPlan }));
    // the edge from the 180° corner to the 240° corner runs along (0.5, -0.866)
    expect(Math.abs(direction[0] * 0.5 + (direction[1] * -Math.sqrt(3)) / 2)).toBeCloseTo(1, 6);
    // without a light the longest edge (the first among equals) is used as before
    assertSome(
      hatchDirectionOf({ face: lid, axis: "surface-class" }),
      O.getOrThrow(hatchDirectionOf({ face: lid, axis: "longest-edge" }))
    );
  });

  it("hatches upright faces along +Z, inclined faces along their level line or darkest edge, level faces along the longest edge", () => {
    assertSome(hatchDirectionOf({ face: wall, axis: "surface-class" }), [0, 0, 1]);
    assertSome(hatchDirectionOf({ face: wall, axis: "longest-edge" }), [1, 0, 0]);
    const flap = quad(
      [0, -Math.SQRT1_2, Math.SQRT1_2],
      [
        [0, 0, 0],
        [10, 0, 0],
        [10, 30, 30],
        [0, 30, 30],
      ]
    );
    // the darkest edge is read on the sheet: project each edge's outward normal and the light onto
    // the view plane and take the edge turned most away; from an oblique eye below the article the
    // in-plane light would pick a different edge of this flap than the sheet does
    const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    const scale = (a: Vec3, k: number): Vec3 => [a[0] * k, a[1] * k, a[2] * k];
    const dot3 = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const cross3 = (a: Vec3, b: Vec3): Vec3 => [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0],
    ];
    const unit3 = (a: Vec3): Vec3 => scale(a, 1 / Math.hypot(a[0], a[1], a[2]));
    const sheetDarkest = (face: FaceFacts, view: ReturnType<typeof viewFactsOf>) => {
      const onSheet = (v: Vec3): Vec3 => sub(v, scale(view.eye, dot3(v, view.eye)));
      const light = onSheet(view.light);
      const normal = unit3(face.normal);
      const longest = A.reduce(face.edges, 0, (most, edge) => Math.max(most, edge.length));
      return pipe(
        face.edges,
        // the rule reads only major edges (at least a quarter as long as the longest)
        A.filter((edge) => edge.length >= 0.25 * longest),
        A.map((edge) => {
          const along = unit3(sub(edge.end, edge.start));
          const side = unit3(cross3(normal, along));
          const mid = scale(
            [edge.start[0] + edge.end[0], edge.start[1] + edge.end[1], edge.start[2] + edge.end[2]],
            0.5
          );
          const outward = dot3(side, sub(mid, face.center)) < 0 ? scale(side, -1) : side;
          return { edge, darkness: -dot3(unit3(onSheet(outward)), light) };
        }),
        A.sort(Order.flip(Order.mapInput(Order.Number, (e: { readonly darkness: number }) => e.darkness))),
        A.head,
        O.map((e) => unit3(sub(e.edge.end, e.edge.start)))
      );
    };
    const oblique = viewFactsOf(Camera.make({ eye: [-0.82, 0, -0.58], up: [0, 0, 1] }));
    for (const view of [front, oblique]) {
      const expected = O.map(sheetDarkest(flap, view), (d) => clean(A.map(d, Math.abs) as unknown as Vec3));
      const chosen = O.map(hatchDirectionOf({ face: flap, axis: "surface-class", view }), (d) =>
        clean(A.map(d, Math.abs) as unknown as Vec3)
      );
      expect(chosen).toEqual(expected);
    }
    const flapDirection = hatchDirectionOf({ face: flap, axis: "surface-class" });
    assertSome(O.map(flapDirection, clean), [-1, 0, 0]);
    // with the light known, an inclined face runs along the edge turned away from it (here the +X side)
    // and its band anchors on that edge
    expect(
      anchorOf({
        face: flap,
        view: front,
        direction: [0, Math.SQRT1_2, Math.SQRT1_2],
        shadowEdge: FaceEdge.make({ start: [10, 0, 0], end: [10, 30, 30], length: Math.hypot(30, 30) }),
      }).point[0]
    ).toBe(10);
    assertSome(
      O.map(hatchDirectionOf({ face: flap, axis: "surface-class", view: front }), (d) => [
        Math.round(d[0] * 100) / 100,
        Math.round((Math.abs(d[1]) - Math.abs(d[2])) * 100) / 100,
      ]),
      [0, 0]
    );
    const lid = quad(
      [0, 0, 1],
      [
        [0, 0, 5],
        [10, 0, 5],
        [10, 30, 5],
        [0, 30, 5],
      ]
    );
    assertSome(hatchDirectionOf({ face: lid, axis: "surface-class" }), [0, 1, 0]);
    const disc = FaceFacts.make({ ...lid, edges: [] });
    assertSome(hatchDirectionOf({ face: disc, axis: "surface-class" }), [1, 0, 0]);
    assertNone(hatchDirectionOf({ face: disc, axis: "longest-edge" }));
  });

  it("gives faces mirrored about the light azimuth equal bands and equal lines", () => {
    // seen from above, the light's azimuth is the sheet diagonal (-1, 1); these
    // two slopes mirror each other across that vertical plane
    const a = Math.SQRT1_2 * 0.6;
    const c = 0.8;
    const slope = (sign: 1 | -1) =>
      quad(
        [sign * a, sign * a, c],
        [
          [0, 0, 0],
          [-10, 10, 0],
          [-10 + sign * 6 * Math.SQRT1_2, 10 + sign * 6 * Math.SQRT1_2, -4.5],
          [sign * 6 * Math.SQRT1_2, sign * 6 * Math.SQRT1_2, -4.5],
        ]
      );
    const [one, two] = [slope(1), slope(-1)];
    const gradedPlan = plan({ style: "graded", axis: "surface-class" });
    expect(toneOf(one.normal[0] * top.light[0] + one.normal[1] * top.light[1] + one.normal[2] * top.light[2])).toBe(
      toneOf(two.normal[0] * top.light[0] + two.normal[1] * top.light[1] + two.normal[2] * top.light[2])
    );
    const offsetsOf = (face: FaceFacts) =>
      O.map(linesOf(treatmentFor({ face, view: top, plan: gradedPlan })), (l) =>
        A.map(l.cuts, (cut) => Math.round(cut.offset * 1e9) / 1e9)
      );
    const first = offsetsOf(one);
    expect(O.isSome(first)).toBe(true);
    expect(offsetsOf(two)).toEqual(first);
  });

  it("never skips a visible planar face as lit under graded shading", () => {
    const gradedPlan = plan({ style: "graded", axis: "surface-class" });
    const turns = A.makeBy(12, (i) => (i * Math.PI) / 6);
    const treatments = A.flatMap(turns, (azimuth) =>
      A.map([-60, -30, 0, 30, 60], (elevation) => {
        const view = viewFactsOf(
          Camera.make({
            eye: [
              Math.cos(azimuth) * Math.cos((elevation * Math.PI) / 180),
              Math.sin(azimuth) * Math.cos((elevation * Math.PI) / 180),
              Math.sin((elevation * Math.PI) / 180),
            ],
            up: [0, 0, 1],
          })
        );
        return treatmentFor({ face: wall, view, plan: gradedPlan });
      })
    );
    const reasons = A.dedupe(A.map(A.filter(treatments, FaceTreatment.guards.skipped), (t) => t.reason));
    expect(A.every(reasons, (r) => r === "back-facing" || r === "edge-on")).toBe(true);
    expect(A.some(treatments, (t) => t.kind === "lines")).toBe(true);
  });

  it("skips slivers and counts coverage per reason in reason order", () => {
    const sliver = treatmentFor({ face: wall, view: front, plan: plan({ style: "graded", minFaceSpan: 25 }) });
    expect(sliver).toEqual(ShadingSkipped.make({ reason: "sliver" }));
    const back = treatmentFor({ face: wall, view: top, plan: plan({ style: "graded" }) });
    expect(back).toEqual(ShadingSkipped.make({ reason: "back-facing" }));
    const lines = ShadingLines.make({ origin: [0, 0, 0], step: [1, 0, 0], cuts: [ShadingCut.make({ offset: 1 })] });
    expect(coverageOf([sliver, lines, back, ShadingSkipped.make({ reason: "curved" }), back])).toEqual(
      ShadingCoverage.make({
        shadedFaces: 1,
        skippedFaces: [
          ShadingSkip.make({ reason: "back-facing", faces: 2 }),
          ShadingSkip.make({ reason: "curved", faces: 1 }),
          ShadingSkip.make({ reason: "sliver", faces: 1 }),
        ],
      })
    );
  });
});

describe("neighbour ink order", () => {
  const band = (face: number, exposure: number, density: number) => BandInk.make({ face, exposure, density });
  // a lit face (0) that out-inks the dark face (1) across their shared edge, and a lighter face (2) that does not
  const bands = [band(0, 0.5, 0.3), band(1, -0.4, 0.2), band(2, 0.7, 0.1)];
  const facesOf = (steps: HashSet.HashSet<number>) => A.sort(A.fromIterable(steps), Order.Number);

  it("steps the lighter face of a shared edge only when it carries more ink than the darker one", () => {
    expect(facesOf(inkOrderSteps({ bands, shared: [[0, 1]] }))).toEqual([0]);
    expect(facesOf(inkOrderSteps({ bands, shared: [[1, 0]] }))).toEqual([0]);
    // lighter but sparser: nothing to do
    expect(facesOf(inkOrderSteps({ bands, shared: [[2, 1]] }))).toEqual([]);
    // faces that share no visible edge are never compared
    expect(facesOf(inkOrderSteps({ bands, shared: [] }))).toEqual([]);
  });

  it("leaves equally lit faces, and a face bare by design, alone", () => {
    // faces 2 and 3 are the denser ones of their pairs: lit inside the exposure tie (0.001) above face 0, face 2 is
    // its equal and keeps its ink; lit past it, face 3 is the lighter and steps
    const tie = [band(0, 0.5, 0.25), band(1, 0.5, 0.1), band(2, 0.5005, 0.4), band(3, 0.502, 0.4)];
    expect(facesOf(inkOrderSteps({ bands: tie, shared: [[0, 1]] }))).toEqual([]);
    expect(facesOf(inkOrderSteps({ bands: tie, shared: [[0, 2]] }))).toEqual([]);
    expect(facesOf(inkOrderSteps({ bands: tie, shared: [[0, 3]] }))).toEqual([3]);
    // face 3 has no band (a sliver, a narrow face, a broken part): its pairs are not compared
    expect(facesOf(inkOrderSteps({ bands, shared: [[0, 3]] }))).toEqual([]);
  });

  it("steps a band from full to the lit taper to the lit floor, and no further", () => {
    assertSome(nextBandTaper("full"), "lit");
    assertSome(nextBandTaper("lit"), "lit-floor");
    assertNone(nextBandTaper("lit-floor"));
  });

  it("cuts a light band back to short strokes at the same offsets, and to two lines at the floor", () => {
    // a 20 × 20 wall square-on to the front view: a light face with a three-line band
    const square = quad(
      [0, -1, 0],
      [
        [-10, 0, 0],
        [10, 0, 0],
        [10, 0, 20],
        [-10, 0, 20],
      ]
    );
    const gradedPlan = plan({ style: "graded", axis: "surface-class" });
    const cutsOf = (taper?: BandTaper) =>
      O.getOrElse(
        O.map(
          linesOf(
            treatmentFor({ face: square, view: front, plan: gradedPlan, ...(taper === undefined ? {} : { taper }) })
          ),
          (lines) =>
            A.map(lines.cuts, (cut) => [Math.round(cut.offset * 1e9) / 1e9, Math.round(cut.extent * 100) / 100])
        ),
        () => []
      );
    expect(cutsOf()).toEqual([
      [1, 1],
      [2.4, 1],
      [4.36, 0.6],
    ]);
    // the default is the full band, exactly as before tapers existed
    expect(cutsOf("full")).toEqual(cutsOf());
    expect(cutsOf("lit")).toEqual([
      [1, 0.6],
      [2.4, 0.5],
      [4.36, 0.4],
    ]);
    expect(cutsOf("lit-floor")).toEqual([
      [1, 0.6],
      [2.4, 0.4],
    ]);
  });

  it("settles a view's tapers: each inverted face steps until it no longer out-inks its neighbour", () => {
    // ink per taper of each face: 0 needs one step, 2 needs two, and 3 is still denser at the floor
    const ink = (taper: BandTaper, full: number, lit: number, floor: number) =>
      taper === "full" ? full : taper === "lit" ? lit : floor;
    const calls: Array<HashMap.HashMap<number, BandTaper>> = [];
    const inkOf = (tapers: HashMap.HashMap<number, BandTaper>) => {
      calls.push(tapers);
      const taperOf = (face: number): BandTaper => O.getOrElse(HashMap.get(tapers, face), (): BandTaper => "full");
      return [
        band(0, 0.5, ink(taperOf(0), 0.3, 0.15, 0.1)),
        band(1, -0.4, 0.2),
        band(2, 0.3, ink(taperOf(2), 0.4, 0.25, 0.15)),
        band(3, 0.7, ink(taperOf(3), 0.6, 0.5, 0.4)),
        band(4, 0.6, 0.5),
      ];
    };
    const tapers = settleBandTapers({
      shared: [
        [0, 1],
        [1, 2],
        [1, 3],
        [3, 4],
      ],
      inkOf,
    });
    const settled = A.map([0, 1, 2, 3, 4], (face) => O.getOrNull(HashMap.get(tapers, face)));
    expect(settled).toEqual(["lit", null, "lit-floor", "lit-floor", null]);
    // with no shared edges every band stays as its tone gives it, and the view is planned once
    calls.length = 0;
    expect(HashMap.size(settleBandTapers({ shared: [], inkOf }))).toBe(0);
    expect(A.length(calls)).toBe(1);
  });

  it("settles a cascade: a face cut back below its darker neighbour may in turn have to cut back a lighter one", () => {
    // 1 (dark) < 0 (medium) < 2 (light) in exposure; 0 out-inks 1, and once 0 is cut back 2 out-inks 0
    const inkOf = (tapers: HashMap.HashMap<number, BandTaper>) => [
      band(0, 0, HashMap.has(tapers, 0) ? 0.1 : 0.3),
      band(1, -0.5, 0.2),
      band(2, 0.4, HashMap.has(tapers, 2) ? 0.05 : 0.15),
    ];
    const tapers = settleBandTapers({
      shared: [
        [0, 1],
        [0, 2],
      ],
      inkOf,
    });
    expect(A.map([0, 1, 2], (face) => O.getOrNull(HashMap.get(tapers, face)))).toEqual(["lit", null, "lit"]);
  });

  it("refuses a step that would leave the face without a band or would not thin it", () => {
    // stepped to either taper, face 0 loses its band and face 2 gains ink (a band the taper alone would empty is
    // drawn untapered)
    const inkOf = (tapers: HashMap.HashMap<number, BandTaper>) => [
      ...(HashMap.has(tapers, 0) ? [] : [band(0, 0.5, 0.3)]),
      band(1, -0.4, 0.2),
      band(2, 0.3, HashMap.has(tapers, 2) ? 0.35 : 0.3),
    ];
    const tapers = settleBandTapers({
      shared: [
        [0, 1],
        [1, 2],
      ],
      inkOf,
    });
    expect(HashMap.size(tapers)).toBe(0);
  });

  it("tries the lit floor in the same round when the lit taper does not thin a band", () => {
    // face 0's lit taper leaves its strokes too short for a band, so they are drawn untapered and carry more ink;
    // its lit floor, two lines, thins it below the dark face. Face 2 thins at neither and keeps its full band.
    const calls: Array<HashMap.HashMap<number, BandTaper>> = [];
    const inkOf = (tapers: HashMap.HashMap<number, BandTaper>) => {
      calls.push(tapers);
      const taperOf = (face: number): BandTaper => O.getOrElse(HashMap.get(tapers, face), (): BandTaper => "full");
      return [
        band(0, 0.5, taperOf(0) === "full" ? 0.3 : taperOf(0) === "lit" ? 0.35 : 0.15),
        band(1, -0.4, 0.2),
        band(2, 0.3, taperOf(2) === "full" ? 0.3 : 0.4),
      ];
    };
    const tapers = settleBandTapers({
      shared: [
        [0, 1],
        [1, 2],
      ],
      inkOf,
    });
    expect(A.map([0, 1, 2], (face) => O.getOrNull(HashMap.get(tapers, face)))).toEqual(["lit-floor", null, null]);
    // the first plan, the lit step, the lit floor, then the settled view: one round of steps
    expect(A.length(calls)).toBe(4);
  });

  it("settles two faces of one seen area a tone step apart as if they shared an edge", () => {
    // A lit flap (0.6) and its mirror in medium tone (0.05) on opposite sides of an article share no edge, so the lit
    // one kept a band 5% denser than the darker one (review loop 4, F11-04). Of one seen area, they are twins.
    const bands = [band(0, 0.6, 0.063), band(1, 0.05, 0.06), band(2, 0.3, 0.07)];
    const seen = (face: number) => A.getUnsafe([1000, 1040, 400], face);
    const twins = inkTwins({ bands, seen });
    // faces 0 and 1 are twins; face 2 is a third the size, and faces a tone step apart only
    expect(twins).toEqual([[0, 1]]);
    expect(inkTwins({ bands: [band(0, 0.6, 0.063), band(1, 0.45, 0.06)], seen })).toEqual([]);
    // settled with its twin, the lit flap steps; off a shared edge alone nothing stepped
    const inkOf = (tapers: HashMap.HashMap<number, BandTaper>) => [
      band(0, 0.6, HashMap.has(tapers, 0) ? 0.04 : 0.063),
      band(1, 0.05, 0.06),
    ];
    expect(HashMap.size(settleBandTapers({ shared: [], inkOf }))).toBe(0);
    expect(O.getOrNull(HashMap.get(settleBandTapers({ shared: twins, inkOf }), 0))).toBe("lit");
  });
});

describe("bandRunLengths", () => {
  const run = (length: number, extent: number, rank: number) => BandRun.make({ length, extent, rank });

  it("keeps a redrawn band's taper when its shadow-side run is the shorter", () => {
    // At a glimpse's acute tip the run nearest the shadow edge is the shorter (5 against 8). Cut run by run to 0.6
    // and 0.4 of each run's own length (3 and 3.2), the minimum stroke of 4 raised both to 4 alike and the taper was
    // lost (review loop 4, R4-07, F11-05). Against the band's longest run, the shadow-side stroke is the longer.
    const [shadow = 0, lit = 0] = bandRunLengths({ runs: [run(5, 0.6, 0), run(8, 0.4, 1)], minStroke: 4 });
    expect(shadow).toBeCloseTo(5, 12);
    expect(lit).toBeCloseTo(4, 12);
    // above the minimum stroke the band keeps its planned ratio of the longest run, each never beyond its own run
    expect(bandRunLengths({ runs: [run(10, 0.6, 0), run(10, 0.4, 1)], minStroke: 1.5 })).toEqual([6, 4]);
    expect(bandRunLengths({ runs: [run(4, 0.6, 0), run(10, 0.4, 1)], minStroke: 1.5 })).toEqual([4, 4]);
  });

  it("never draws a line longer than one nearer the shadow edge", () => {
    const lengths = bandRunLengths({
      runs: [run(3.2, 0.6, 0), run(9, 0.4, 1), run(3.5, 0.6, 0)],
      minStroke: 1,
    });
    expect(lengths).toEqual([3.2, 3.5, 3.5]);
  });
});

describe("faint ramp", () => {
  // exposures an orthographic view gives a face under the 1.84(m) light: square-on, and turned 30° off square about
  // the sheet vertical toward the light (FACING)
  const SQUARE_ON = 1 / Math.sqrt(3);
  const FACING = (Math.sqrt(3) + 1) / (2 * Math.sqrt(3));
  const gradedPlan = plan({ style: "graded", axis: "surface-class" });
  // an 80 × 40 wall facing -Y: under the light recipe its band is five lines, under the faint one four
  const wide = (turn: number) => {
    const along: Vec3 = [Math.cos((turn * Math.PI) / 180), -Math.sin((turn * Math.PI) / 180), 0];
    const at = (x: number, z: number): Vec3 => [along[0] * x, along[1] * x, z];
    return quad(
      [-Math.sin((turn * Math.PI) / 180), -Math.cos((turn * Math.PI) / 180), 0],
      [at(-40, 0), at(40, 0), at(40, 40), at(-40, 40)]
    );
  };
  // the front view with its light turned to meet the square-on wall at `exposure`, still from the upper left
  const litAt = (exposure: number) => {
    const k = Math.sqrt((1 - exposure * exposure) / 2);
    return ViewFacts.make({ eye: front.eye, right: front.right, up: front.up, light: [-k, -exposure, k] });
  };
  const cutsOf = (face: FaceFacts, view: ViewFacts) =>
    O.getOrElse(
      O.map(linesOf(treatmentFor({ face, view, plan: gradedPlan })), (lines) =>
        A.map(lines.cuts, (cut) => [Math.round(cut.offset * 1e9) / 1e9, Math.round(cut.extent * 1e9) / 1e9] as const)
      ),
      () => A.empty()
    );
  // every stroke of the wall's band runs across its 40 height, so its ink in chord lengths is the sum of the extents
  const inkOf = (cuts: ReadonlyArray<readonly [number, number]>) =>
    A.reduce(cuts, 0, (sum, [, extent]) => sum + extent);

  it("bands a wall alike in any two default views that light it within 0.01 of each other", () => {
    // Upright walls turned 0.1° at a time through each default camera set (the pictorials at the original perspective
    // eye, as isometrics at 45° and as isometrics at 90°, as two-point perspectives at their 20° default and at the 30°
    // bound, and as isometrics lowered to 20°, each with the elevations and plans). The 1.84(m) light is
    // each view's own, so one wall is lit differently from view to view; but whenever two views facing it light it
    // within 0.01 of each other, their bands differ by at most one stroke (in line count, and in ink by at most one
    // chord length) and sit at the same model edge of the wall: no hard edge of a recipe, nor of the side a band takes
    // (`anchorOf`, including its switch to the sheet's lower right for a wall lit edge-on to its lines), may split two
    // views lit alike (review loop 3, K-07). With the recipe's single edge at 0.6, five walls of the perspective set
    // broke this. The wall is 400 wide, so every view's band is held to its tone's line count, never to its span on
    // the sheet.
    const box = BoundingBox.make({ min: [-40, -30, 0], max: [40, 30, 46] });
    const cameraSets = [
      {},
      { projection: "isometric" as const },
      { projection: "isometric" as const, azimuthDeg: O.some(90) },
      { projection: "two-point" as const },
      { projection: "two-point" as const, elevationDeg: O.some(30) },
      { projection: "isometric" as const, elevationDeg: O.some(20) },
    ];
    const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const uprightWall = (deg: number) => {
      const turn = (deg * Math.PI) / 180;
      const along: Vec3 = [-Math.sin(turn), Math.cos(turn), 0];
      const at = (x: number, z: number): Vec3 => [along[0] * x, along[1] * x, z];
      return quad([Math.cos(turn), Math.sin(turn), 0], [at(-200, 0), at(200, 0), at(200, 40), at(-200, 40)]);
    };
    const pairs = A.flatMap(cameraSets, (set) => {
      const views = A.map(ViewName.literals, (view) => viewFactsOf(cameraForView({ view, box, ...set })));
      return A.flatMap(
        A.makeBy(3600, (i) => i / 10),
        (deg) => {
          const face = uprightWall(deg);
          const banded = pipe(
            views,
            A.filter((view) => dot(face.normal, view.eye) > 1e-9),
            A.map((view) =>
              O.map(linesOf(treatmentFor({ face, view, plan: gradedPlan })), (lines) => ({
                exposure: dot(face.normal, view.light),
                extents: A.map(lines.cuts, (cut) => cut.extent),
                // the anchor's step points from the band's model edge into the wall
                step: lines.step,
              }))
            ),
            A.getSomes
          );
          return A.flatMap(banded, (p, i) =>
            pipe(
              A.drop(banded, i + 1),
              A.filter((q) => Math.abs(p.exposure - q.exposure) < 0.01),
              A.map((q) => ({ deg, p, q }))
            )
          );
        }
      );
    });
    const ink = (extents: ReadonlyArray<number>) => A.reduce(extents, 0, (sum, extent) => sum + extent);
    // the sweep does meet views that light a wall alike
    expect(A.length(pairs)).toBeGreaterThan(100);
    const unlike = A.filter(
      pairs,
      ({ p, q }) =>
        Math.abs(A.length(p.extents) - A.length(q.extents)) > 1 ||
        Math.abs(ink(p.extents) - ink(q.extents)) > 1 ||
        dot(p.step, q.step) <= 0
    );
    expect(A.map(unlike, ({ deg }) => deg)).toEqual([]);
  });

  it("turns the light recipe into the faint one between exposures 0.6 and 0.7", () => {
    expect(A.map([0.2, SQUARE_ON, 0.6, 0.7, FACING, 1], faintShareOf)).toEqual([0, 0, 0, 1, 1, 1]);
    expect(faintShareOf(0.65)).toBeCloseTo(0.5, 12);
    // the ramp's ends are the light and faint recipes exactly
    const offsets = (tone: ShadingTone, faintShare?: number) =>
      gradedOffsets({
        span: 40,
        minPitch: 1,
        maxPitch: 2.5,
        tone,
        ...(faintShare === undefined ? {} : { faintShare }),
      });
    expect(offsets("faint", 0)).toEqual(offsets("light"));
    expect(offsets("faint", 1)).toEqual(offsets("faint"));
    expect(offsets("light", 0)).toEqual(offsets("light"));
    expect(A.map([0, 0.5, 1], (share) => offsets("faint", share).length)).toEqual([5, 4, 3]);
    expect(gradedExtents({ count: 5, faintShare: 0 })).toEqual(gradedExtents({ count: 5 }));
    expect(gradedExtents({ count: 4, faintShare: 1 })).toEqual(gradedExtents({ count: 4, fullLines: 0 }));
    expect(A.map(gradedExtents({ count: 4, faintShare: 0.5 }), (e) => Math.round(e * 100) / 100)).toEqual([
      0.8, 0.77, 0.53, 0.4,
    ]);
    // a band already cut back to the lit taper has no full-length line anywhere on the ramp
    expect(gradedExtents({ count: 3, fullLines: 0, faintShare: 0.3 })).toEqual(
      A.map(gradedExtents({ count: 3, fullLines: 0 }), (e) => expect.closeTo(e, 12))
    );
  });

  it("keeps the light and faint bands at the ramp's ends and never drops a third of a band to a small change of exposure", () => {
    const square = wide(0);
    const light = cutsOf(square, litAt(0.59));
    const faint = cutsOf(square, litAt(0.75));
    expect(A.map(light, ([, extent]) => extent)).toEqual([1, 1, 0.6, 0.5, 0.4]);
    expect(A.map(faint, ([, extent]) => Math.round(extent * 100) / 100)).toEqual([0.6, 0.53, 0.47, 0.4]);
    expect(cutsOf(square, litAt(0.6))).toEqual(light);
    expect(cutsOf(square, litAt(0.7))).toEqual(faint);
    // across the ramp the band thins step by step: no 0.006 rise of exposure takes more than one short stroke's
    // ink or more than one line, where the cliff at 0.6 took 1.5 of the band's 3.5 chord lengths at once
    const exposures = A.makeBy(201, (i) => 0.55 + i * 0.001);
    const bands = A.map(exposures, (exposure) => cutsOf(square, litAt(exposure)));
    const pairs = A.zip(bands, A.drop(bands, 6));
    A.forEach(pairs, ([before, after]) => {
      expect(inkOf(before) - inkOf(after)).toBeLessThanOrEqual(0.6);
      expect(A.length(before) - A.length(after)).toBeLessThanOrEqual(1);
    });
    // and the ink only ever falls as the face turns toward the light
    A.forEach(A.zip(bands, A.drop(bands, 1)), ([before, after]) =>
      expect(inkOf(after)).toBeLessThanOrEqual(inkOf(before) + 1e-9)
    );
  });

  it("draws a wall turned 2.0° and 2.6° toward the light almost alike", () => {
    // in the front view these turns put the wall at exposures either side of 0.6 (0.597 and 0.603)
    const turned = (deg: number) => {
      const face = wide(deg);
      const [nx, ny, nz] = face.normal;
      const [lx, ly, lz] = front.light;
      return { exposure: nx * lx + ny * ly + nz * lz, cuts: cutsOf(face, front) };
    };
    const nearer = turned(2);
    const further = turned(2.6);
    expect(nearer.exposure).toBeLessThan(0.6);
    expect(further.exposure).toBeGreaterThan(0.6);
    expect(A.length(further.cuts)).toBe(A.length(nearer.cuts));
    expect(inkOf(further.cuts)).toBeGreaterThan(0.95 * inkOf(nearer.cuts));
  });
});

describe("band gutter beside a ladder of outlines", () => {
  // Synthetic sheet geometry in mm at a 1.5 mm pitch: a band's first stroke runs up x = 0 over 30, its edge is the
  // outline 1.5 to its right, and a wall's two lines stand 1.8 and 3 beyond that edge (review loop 3, O-04).
  const stroke: Segment2 = [0, 0, 0, 30];
  const edge: Segment2 = [1.5, 0, 1.5, 30];
  const wallLines: ReadonlyArray<Segment2> = [
    [3.3, 0, 3.3, 30],
    [4.5, 0, 4.5, 30],
  ];
  const pitchBeside = (outlines: ReadonlyArray<Segment2>, line: Segment2 = stroke) =>
    O.map(ladderPitch({ stroke: line, edge, outlines, reach: 2.5, tolerance: 0.15 }), (p) => Math.round(p * 1e9) / 1e9);

  it("starts a band at its lead and keeps the band's rhythm after it", () => {
    const plain = gradedOffsets({ span: 30, minPitch: 1.5, maxPitch: 6, tone: "dark" });
    const led = gradedOffsets({ span: 30, minPitch: 1.5, maxPitch: 6, tone: "dark", lead: 3.15 });
    const rounded = (offsets: ReadonlyArray<number>) => A.map(offsets, (o) => Math.round(o * 1e9) / 1e9);
    // without a lead the first line sits one pitch in, then 1.4 pitches on, then 1.96
    expect(rounded(plain)).toEqual([1.5, 3.6, 6.54]);
    // with one the first line sits at the lead and the next gap is still 1.4 pitches (2.1, not 1.5 x 1.4 squared)
    expect(rounded(led)).toEqual([3.15, 5.25, 8.19]);
    // a lead of one pitch, or under it, changes nothing
    expect(gradedOffsets({ span: 30, minPitch: 1.5, maxPitch: 6, tone: "dark", lead: 1.5 })).toEqual(plain);
    expect(gradedOffsets({ span: 30, minPitch: 1.5, maxPitch: 6, tone: "dark", lead: 0.5 })).toEqual(plain);
  });

  it("sets the gutter at 1.5 times the band's first gap or the spacing beyond its edge, whichever is wider", () => {
    expect(bandLead({ minPitch: 1.5, groupPitch: O.some(1.8) })).toBeCloseTo(3.15, 9);
    expect(bandLead({ minPitch: 1.5, groupPitch: O.some(2.4) })).toBeCloseTo(3.6, 9);
    expect(bandLead({ minPitch: 1.5, groupPitch: O.none() })).toBe(1.5);
  });

  it("plans a stretch's band from the window's lead", () => {
    const gradedPlan = plan({ style: "graded", axis: "surface-class" });
    const offsets = (window: ShadingWindow) =>
      O.map(linesOf(treatmentFor({ face: wall, view: front, plan: gradedPlan, window })), (l) =>
        A.map(A.take(l.cuts, 3), (c) => Math.round((c.offset - 12) * 1e9) / 1e9)
      );
    assertSome(offsets(ShadingWindow.make({ start: 12, span: 28 })), [1, 2.4, 4.36]);
    assertSome(offsets(ShadingWindow.make({ start: 12, span: 28, lead: O.some(2.1) })), [2.1, 3.5, 5.46]);
  });

  it("reads a ladder where drawn lines run beside the band's edge just beyond it", () => {
    assertSome(pitchBeside([edge, ...wallLines]), 1.8);
    // an edge drawn in pieces, and drawn twice, is still one edge
    assertSome(pitchBeside([[1.5, 0, 1.5, 12], [1.5, 12, 1.5, 30], edge, ...wallLines]), 1.8);
    // the stroke may run either way
    assertSome(pitchBeside([edge, ...wallLines], [0, 30, 0, 0]), 1.8);
    // past the reach nothing reads as a ladder, and lines on the band's own side never do
    assertNone(pitchBeside([edge, [4.5, 0, 4.5, 30]]));
    assertNone(pitchBeside([edge, [-1, 0, -1, 30]]));
    // an edge with nothing beyond it is no ladder
    assertNone(pitchBeside([edge]));
  });

  it("reads no ladder where the outline beyond the edge only steps out around a tab", () => {
    // the edge is drawn below and above a tab 4 tall, whose end stands 1.8 beyond it: within the reach, and beside
    // the stroke for 4 of its 30, but in the edge's gap, never beside the edge
    const tab: ReadonlyArray<Segment2> = [
      [1.5, 0, 1.5, 13],
      [1.5, 13, 3.3, 13],
      [3.3, 13, 3.3, 17],
      [3.3, 17, 1.5, 17],
      [1.5, 17, 1.5, 30],
    ];
    assertNone(pitchBeside(tab));
    // a wall beside only a quarter of the edge is not a ladder either
    assertNone(pitchBeside([edge, [3.3, 0, 3.3, 7.5], [4.5, 0, 4.5, 7.5]]));
    // half the stroke is enough
    assertSome(pitchBeside([edge, [3.3, 0, 3.3, 15], [4.5, 0, 4.5, 15]]), 1.8);
  });

  it("reads a band's edge as the nearest line on one side that runs beside half the stroke", () => {
    const covering = (side: number, outlines: ReadonlyArray<Segment2>) =>
      coveringOutlineDistance({ stroke, side, outlines, within: 3.5, tolerance: 0.15 });
    // the stroke runs up, so its right is +x: a short tick nearer than the edge is passed over
    assertSome(
      covering(-1, [
        [0.8, 0, 0.8, 5],
        [1.5, 0, 1.5, 12],
        [1.5, 12, 1.5, 30],
        [-3, 0, -3, 30],
      ]),
      1.5
    );
    assertSome(
      covering(1, [
        [1.5, 0, 1.5, 30],
        [-3, 0, -3, 30],
      ]),
      3
    );
    assertNone(
      covering(1, [
        [1.5, 0, 1.5, 30],
        [-4, 0, -4, 30],
      ])
    );
  });
});

describe("shadingBandLadderFindings", () => {
  const options = ValidationOptions.make({ expectedPages: O.none() });
  // a wall's two lines 1.8 and 3 beyond a band's edge at x = 1.5, over the band's 30 mm
  const wallLines: ReadonlyArray<Segment2> = [
    [1.5, 0, 1.5, 30],
    [3.3, 0, 3.3, 30],
    [4.5, 0, 4.5, 30],
  ];
  const vertical = (x: number): Segment2 => [x, 0, x, 30];
  const codes = (shadingMm: ReadonlyArray<Segment2>, outlineMm: ReadonlyArray<Segment2> = wallLines) =>
    A.map(shadingBandLadderFindings({ page: 4, shadingMm, outlineMm, options }), (f) => [f.code, f.page]);

  it("flags a band whose first stroke, edge, and the lines beyond it read as one ladder", () => {
    // a three-line band (gaps 2.1, then 2.94) whose first stroke sits 1.5 from the edge: under 1.4 x max(2.1, 1.8)
    expect(codes([vertical(-5.04), vertical(-2.1), vertical(0)])).toEqual([["shading-band-ladder", O.some(4)]]);
    // a gutter under 1.4 times is flagged however far it puts the stroke from its edge: 2.73 is past the lone-line
    // offset (2.5 mm) and still under 2.94
    expect(codes([vertical(-6.27), vertical(-3.33), vertical(-1.23)])).toEqual([["shading-band-ladder", O.some(4)]]);
  });

  it("passes a band behind its gutter, an edge with nothing beyond it, and an edge that steps out around a tab", () => {
    // the renderer's gutter: 3.15 from the edge, at least 1.4 x max(2.1, 1.8)
    expect(codes([vertical(-6.69), vertical(-3.75), vertical(-1.65)])).toEqual([]);
    expect(codes([vertical(-5.04), vertical(-2.1), vertical(0)], [vertical(1.5)])).toEqual([]);
    const tab: ReadonlyArray<Segment2> = [
      [1.5, 0, 1.5, 13],
      [1.5, 13, 3.3, 13],
      [3.3, 13, 3.3, 17],
      [3.3, 17, 1.5, 17],
      [1.5, 17, 1.5, 30],
    ];
    expect(codes([vertical(-5.04), vertical(-2.1), vertical(0)], tab)).toEqual([]);
  });

  it("reads only a band's shadow-edge stroke: never one with companions on both sides, nor the band's lit-side end", () => {
    // a stroke with companions on both sides is inside a band, or between two
    expect(codes([vertical(-2.1), vertical(0), vertical(5.5)])).toEqual([]);
    // the lit-side end of a band, whose last gap (2.94) is wider than its neighbour's (2.1), is not read as an edge
    // stroke, though the outlines beyond it would make a ladder
    const mirrored = A.map(wallLines, ([x1, y1, x2, y2]): Segment2 => [-6.54 - x1, y1, -6.54 - x2, y2]);
    expect(codes([vertical(0), vertical(-2.1), vertical(-5.04)], mirrored)).toEqual([]);
  });

  it("does not read a band of two strokes, whose shadow-edge end cannot be told from its lit-side end", () => {
    // a two-line band (0 and 2.1) with its lit side's outline 1.4 beyond the stroke at 2.1 and a line 1.8 beyond that:
    // read from that end it is a ladder, but the renderer's gutter moves only a band's shadow-side line, so a finding
    // here could never be cleared
    expect(codes([vertical(0), vertical(2.1)], [vertical(3.5), vertical(5.3)])).toEqual([]);
    // beside a three-line band's lit-side end the same lines pass too: that end's wider last gap (2.94) marks it
    expect(codes([vertical(-2.94), vertical(-0.84), vertical(2.1)], [vertical(3.5), vertical(5.3)])).toEqual([]);
    // while a three-line band whose smallest gap is at that end has its shadow edge there, and is read
    expect(codes([vertical(-2.94), vertical(0), vertical(2.1)], [vertical(3.5), vertical(5.3)])).toEqual([
      ["shading-band-ladder", O.some(4)],
    ]);
  });
});

describe("room of a glimpsed stretch", () => {
  const gradedPlan = plan({ style: "graded", axis: "surface-class", minStroke: 1.5 });
  const needed = legibleStrokeLength(gradedPlan);
  // A wall 40√2 wide facing the light from the front-left (exposure 0.82, faint), hatched vertically; its step runs
  // at 45° to the sheet, so a step of 1 shows 1/√2 on the sheet, and its lines lie in the picture plane (spread 1).
  const k = Math.SQRT1_2;
  const litWall = quad(
    [-k, -k, 0],
    [
      [20, -20, 0],
      [-20, 20, 0],
      [-20, 20, 20],
      [20, -20, 20],
    ]
  );
  // A stretch 20 long from the shadow anchor whose visible room rises from nothing at its start (a pointed tip seen
  // past a part in front) to twice the legible stroke length at its far end, measured every unit.
  const roomAt = (offset: number) => (2 * needed * offset) / 20;
  const tip = ShadingWindow.make({
    start: 0,
    span: 20,
    room: O.some(A.makeBy(21, (i) => ShadingRoom.make({ offset: i, length: roomAt(i) }))),
  });
  const cutsOf = (window: ShadingWindow) =>
    O.getOrElse(
      O.map(linesOf(treatmentFor({ face: litWall, view: front, plan: gradedPlan, window })), (l) => l.cuts),
      () => []
    );

  it("judges each band position by the room the stretch shows there, not by the face's whole chord", () => {
    expect(toneOf(-2 * k * front.light[0])).toBe("faint");
    const cuts = cutsOf(tip);
    // every line sits where a whole chord of the glimpse keeps the legible length, and there is a band of them
    expect(A.length(cuts)).toBeGreaterThanOrEqual(2);
    expect(A.every(cuts, (cut) => roomAt(cut.offset) >= needed)).toBe(true);
    // judged by the face's 20-tall chord, the band started one pitch from the tip, where the glimpse shows nothing
    const blind = cutsOf(ShadingWindow.make({ start: 0, span: 20 }));
    expect(O.map(A.head(blind), (cut) => Math.round(cut.offset * 1e9) / 1e9)).toEqual(
      O.some(Math.round(1e9 / k) / 1e9)
    );
    expect(O.exists(A.head(blind), (cut) => roomAt(cut.offset) < needed)).toBe(true);
  });

  it("places a band its taper would empty on whole chords, keeping the taper on its lines", () => {
    // the faint taper draws 0.6 and 0.4 of a chord: no position keeps a tapered second line legible, where even the
    // stretch's tallest room, at its far end, gives the shorter stroke 0.8 of the legible length
    expect(0.4 * roomAt(20)).toBeLessThan(needed);
    const cuts = cutsOf(tip);
    expect(A.length(cuts)).toBe(2);
    // the band's place was chosen for whole chords: each line's whole chord there is legible, and its tapered stroke
    // is not, so the tapered recipe could not have kept it
    expect(A.every(cuts, (cut) => roomAt(cut.offset) >= needed && roomAt(cut.offset) * cut.extent < needed)).toBe(true);
    // and its lines keep the faint taper, for the engine to cut what shows back to
    expect(A.map(cuts, (cut) => cut.extent)).toEqual(gradedExtents({ count: 2, fullLines: 2, faintShare: 1 }));
  });

  it("tells a stretch with room for a band of two legible lines from one without", () => {
    const wallPlan = plan({ style: "graded", axis: "surface-class", minStroke: 1.5 });
    // the 40 × 20 wall in the front elevation: room everywhere, and none in a stretch 2 wide
    expect(
      stretchFitsBand({ face: wall, view: front, plan: wallPlan, window: ShadingWindow.make({ start: 0, span: 40 }) })
    ).toBe(true);
    expect(
      stretchFitsBand({ face: wall, view: front, plan: wallPlan, window: ShadingWindow.make({ start: 0, span: 2 }) })
    ).toBe(false);
    // a measured room below the legible length everywhere has no room for a band
    const low = ShadingWindow.make({
      start: 0,
      span: 40,
      room: O.some(A.makeBy(41, (i) => ShadingRoom.make({ offset: i, length: needed - 0.5 }))),
    });
    expect(stretchFitsBand({ face: wall, view: front, plan: wallPlan, window: low })).toBe(false);
    // the lit wall's glimpse is legible over its far half, 10 along the step and about 7 on the sheet: room for a band
    expect(stretchFitsBand({ face: litWall, view: front, plan: gradedPlan, window: tip })).toBe(true);
    // legible over its last 2 along the step only, 1.4 on the sheet, it has none
    const sharp = ShadingWindow.make({
      start: 0,
      span: 20,
      room: O.some(A.makeBy(21, (i) => ShadingRoom.make({ offset: i, length: i >= 18 ? needed : 0 }))),
    });
    expect(stretchFitsBand({ face: litWall, view: front, plan: gradedPlan, window: sharp })).toBe(false);
  });

  it.effect(
    "decodes a coverage recorded before stretches were counted",
    Effect.fnUntraced(function* () {
      const old = yield* S.decodeEffect(ShadingCoverage)({ shadedFaces: 2, skippedFaces: [], lostFaces: 0 });
      expect([old.skippedStretches, old.redrawnStretches]).toEqual([[], 0]);
      const skip = yield* S.decodeEffect(ShadingStretchSkip)({ reason: "narrow", stretches: 1 });
      expect(skip.fitting).toBe(0);
    })
  );
});

describe("shadingCoverageFindings", () => {
  it("flags a view whose faces planned lines and drew none, and nothing otherwise", () => {
    const lost = ShadingCoverage.make({ shadedFaces: 3, skippedFaces: [], lostFaces: 1 });
    expect(A.map(shadingCoverageFindings({ page: 2, coverage: lost }), (f) => [f.code, f.page])).toEqual([
      ["shading-lost-face", O.some(2)],
    ]);
    // a face that kept another stretch is not lost, but the stretch that drew nothing is reported
    const stretch = ShadingCoverage.make({ shadedFaces: 3, skippedFaces: [], lostStretches: 2 });
    expect(A.map(shadingCoverageFindings({ page: 4, coverage: stretch }), (f) => [f.code, f.page])).toEqual([
      ["shading-lost-stretch", O.some(4)],
    ]);
    expect(
      shadingCoverageFindings({ page: 1, coverage: ShadingCoverage.make({ shadedFaces: 3, skippedFaces: [] }) })
    ).toEqual([]);
  });

  it("flags a stretch skipped by design only where its measured room fits a band", () => {
    const skipped = (fitting: number) =>
      ShadingCoverage.make({
        shadedFaces: 3,
        skippedFaces: [],
        skippedStretches: [
          ShadingStretchSkip.make({ reason: "narrow", stretches: 2, fitting }),
          ShadingStretchSkip.make({ reason: "no-room", stretches: 1 }),
        ],
      });
    expect(A.map(shadingCoverageFindings({ page: 2, coverage: skipped(1) }), (f) => [f.code, f.page])).toEqual([
      ["shading-skipped-stretch", O.some(2)],
    ]);
    expect(shadingCoverageFindings({ page: 2, coverage: skipped(0) })).toEqual([]);
  });
});

describe("shading strokes against the outline", () => {
  const options = ValidationOptions.make({ expectedPages: O.none() });
  // a 40 × 30 face outline
  const outlineMm: ReadonlyArray<Segment2> = [
    [0, 0, 40, 0],
    [40, 0, 40, 30],
    [40, 30, 0, 30],
    [0, 30, 0, 0],
  ];
  const codes = (findings: ReadonlyArray<{ readonly code: string }>) => A.map(findings, (f) => f.code);

  it("flags a stroke end or side within half a millimetre of an outline and passes inset strokes", () => {
    const clearance = (shadingMm: ReadonlyArray<Segment2>) =>
      codes(shadingOutlineClearanceFindings({ page: 1, shadingMm, outlineMm, options }));
    expect(clearance([[38.5, 1.5, 38.5, 28.5]])).toEqual([]);
    expect(clearance([[38.5, 0.2, 38.5, 28.5]])).toEqual(["shading-outline-clearance"]);
    expect(clearance([[39.7, 5, 39.7, 25]])).toEqual(["shading-outline-clearance"]);
  });

  it("flags a stroke that runs alone beside an outline and passes one with a companion", () => {
    const lone: ReadonlyArray<Segment2> = [[38.5, 1.5, 38.5, 28.5]];
    expect(codes(shadingLoneLineFindings({ page: 1, shadingMm: lone, outlineMm, options }))).toEqual([
      "shading-lone-line",
    ]);
    const pair: ReadonlyArray<Segment2> = [...lone, [36.4, 6, 36.4, 24]];
    expect(codes(shadingLoneLineFindings({ page: 1, shadingMm: pair, outlineMm, options }))).toEqual([]);
    // a stroke far from every outline is not lone, however alone it is
    expect(codes(shadingLoneLineFindings({ page: 1, shadingMm: [[20, 5, 20, 25]], outlineMm, options }))).toEqual([]);
  });
});

describe("reclippedShading", () => {
  const clip = (segments: ReadonlyArray<Segment2>, lines: ReadonlyArray<Segment2>) =>
    reclippedShading({ segments, lines, clearance: 0.6, minStroke: 1 });
  const nearest = (strokes: ReadonlyArray<Segment2>, lines: ReadonlyArray<Segment2>) =>
    Math.min(
      ...A.flatMap(strokes, ([x1, y1, x2, y2]) => [
        nearestOutlineDistance({ x: x1, y: y1, outlines: lines }),
        nearestOutlineDistance({ x: x2, y: y2, outlines: lines }),
      ])
    );

  it("cuts strokes back to the clearance from a line moved toward their ends, and drops one left too short", () => {
    // strokes planned 0.6 clear of a line at y = 0, which then moved up 0.3; the third stroke is far from it
    const moved: ReadonlyArray<Segment2> = [[0, 0.3, 10, 0.3]];
    const far: Segment2 = [5, 5, 5, 9];
    const result = clip([[2, 0.6, 2, 10], [4, 0.6, 4, 1.2], far], moved);
    expect(A.map(result.segments, (s) => A.map(s, (v) => Math.round(v * 1e6) / 1e6))).toEqual([
      [2, 0.9, 2, 10],
      [5, 5, 5, 9],
    ]);
    expect(result.segments[1]).toBe(far);
    expect([result.trimmed, result.dropped]).toEqual([1, 1]);
    expect(nearest(result.segments, moved)).toBeGreaterThanOrEqual(0.6);
    // nothing near a moved line: the input comes back as it was
    const strokes: ReadonlyArray<Segment2> = [far];
    expect(clip(strokes, moved).segments).toBe(strokes);
    expect(clip(strokes, []).segments).toBe(strokes);
  });

  it("cuts a stroke a moved line crosses, runs beside, or ends beside, keeping the long pieces", () => {
    // an oblique line moved across a stroke's end: the piece beyond it is under the least stroke and goes
    const crossing = clip([[0, 0, 0, 10]], [[-3, 9.5, 3, 8.5]]);
    expect(A.length(crossing.segments)).toBe(1);
    expect(nearest(crossing.segments, [[-3, 9.5, 3, 8.5]])).toBeGreaterThanOrEqual(0.6);
    expect(crossing.segments[0]?.[3]).toBeLessThan(9);
    // a parallel line moved within 0.4 of a stroke's middle stretch: the stroke keeps its ends beyond that stretch
    const beside = clip([[0, 0, 20, 0]], [[8, 0.4, 12, 0.4]]);
    expect(A.length(beside.segments)).toBe(2);
    expect(A.map(beside.segments, ([x1, , x2]) => [x1 < 8, x2 > 12])).toEqual([
      [true, false],
      [false, true],
    ]);
    expect(nearest(beside.segments, [[8, 0.4, 12, 0.4]])).toBeGreaterThanOrEqual(0.6);
    // a moved line ending 0.2 beside a stroke's middle cuts it in two, both pieces long enough to keep
    const ending = clip([[0, 0, 20, 0]], [[10, 0.2, 10, 8]]);
    expect(A.map(ending.segments, (s) => A.map(s, (v) => Math.round(v * 1e6) / 1e6))).toEqual([
      [0, 0, 9.434315, 0],
      [10.565685, 0, 20, 0],
    ]);
    expect([ending.trimmed, ending.dropped]).toEqual([1, 0]);
  });
});

describe("shadingSpacingFindings", () => {
  const options = ValidationOptions.make({ expectedPages: O.none() });
  const codes = (segmentsMm: ReadonlyArray<readonly [number, number, number, number]>) =>
    A.map(shadingSpacingFindings({ page: 2, segmentsMm, options }), (f) => [f.code, f.page]);

  it("flags side-by-side lines closer than 0.5 mm", () => {
    expect(
      codes([
        [0, 0, 10, 0],
        [0, 0.3, 10, 0.3],
      ])
    ).toEqual([["shading-spacing", O.some(2)]]);
  });

  it("passes lines at the minimum, collinear pieces, crossings, and end-to-end runs", () => {
    expect(
      codes([
        [0, 0, 10, 0],
        [0, 0.6, 10, 0.6],
        [10.2, 0, 20, 0],
        [5, -5, 5, 5],
        [0, 1.2, 4, 1.2],
        [4.2, 1.4, 9, 1.4],
      ])
    ).toEqual([]);
    assertNone(O.fromNullishOr(shadingSpacingFindings({ page: 1, segmentsMm: [], options })[0]));
  });
});
