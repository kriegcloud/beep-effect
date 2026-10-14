import {
  anchorOf,
  aspectOf,
  BoundingBox,
  Camera,
  coverageOf,
  FaceEdge,
  FaceFacts,
  FaceTreatment,
  gradedExtents,
  gradedOffsets,
  hatchDirectionOf,
  ShadingCoverage,
  ShadingCut,
  ShadingLines,
  ShadingPlan,
  ShadingSkip,
  ShadingSkipped,
  ShadingTone,
  SheetOptions,
  shadingSpacingFindings,
  surfaceClassOf,
  toneOf,
  treatmentFor,
  ValidationOptions,
  viewFactsOf,
} from "@beep/technical-drawing";
import { A, O } from "@beep/utils";
import { describe, expect, it } from "@effect/vitest";
import { assertNone, assertSome } from "@effect/vitest/utils";
import type { Vec3 } from "@beep/technical-drawing";

// A planar quad from four corners in order: straight edges, corner outline, bounds.
const quad = (normal: Vec3, corners: readonly [Vec3, Vec3, Vec3, Vec3]): FaceFacts => {
  const edges = A.map(corners, (start, i) => {
    const end = corners[(i + 1) % 4] ?? start;
    return FaceEdge.make({ start, end, length: Math.hypot(end[0] - start[0], end[1] - start[1], end[2] - start[2]) });
  });
  const axis = (k: 0 | 1 | 2) => A.map(corners, (c) => c[k]);
  const center = [0, 1, 2].map((k) => (Math.min(...axis(k as 0 | 1 | 2)) + Math.max(...axis(k as 0 | 1 | 2))) / 2);
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
  fields: Partial<{ style: "uniform" | "graded"; axis: "longest-edge" | "surface-class"; minFaceSpan: number }>
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
    front.light.forEach((v, i) => expect(v).toBeCloseTo([-k, -k, k][i] ?? 0, 12));
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
    expect(gradedOffsets({ span: 40, minPitch: 1, maxPitch: 2.5, tone: "faint" }).length).toBeLessThanOrEqual(2);
    expect(gradedOffsets({ span: 400, minPitch: 1, maxPitch: 2.5, tone: "dark" }).length).toBe(8);
    // a narrow face still gets the tone's minimum where it fits, and nothing below one pitch
    expect(gradedOffsets({ span: 4, minPitch: 1, maxPitch: 2.5, tone: "medium" })).toEqual([1, 2.4]);
    expect(gradedOffsets({ span: 1.5, minPitch: 1, maxPitch: 2.5, tone: "dark" })).toEqual([]);
  });

  it("tapers graded strokes: two full lines, then 60% down to 40% of the chord", () => {
    const rounded = (extents: ReadonlyArray<number>) => A.map(extents, (e) => Math.round(e * 100) / 100);
    expect(rounded(gradedExtents(5))).toEqual([1, 1, 0.6, 0.5, 0.4]);
    expect(rounded(gradedExtents(3))).toEqual([1, 1, 0.6]);
    expect(rounded(gradedExtents(2))).toEqual([1, 1]);
    expect(gradedExtents(0)).toEqual([]);
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

  it("hatches upright faces along +Z, inclined faces along their level line, level faces along the longest edge", () => {
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
    const flapDirection = hatchDirectionOf({ face: flap, axis: "surface-class" });
    assertSome(O.map(flapDirection, clean), [-1, 0, 0]);
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
