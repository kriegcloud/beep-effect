import {
  Box,
  Camera,
  Cylinder,
  ModelSpec,
  Occt,
  Part,
  Prism,
  ProjectionRequest,
  Rotation,
  ShadingPlan,
} from "@beep/occt";
import { ShadingCoverage, ShadingSkip } from "@beep/technical-drawing";
import { it } from "@beep/test-runner";
import { A, O } from "@beep/utils";
import { NodeServices } from "@effect/platform-node";
import { describe, expect } from "@effect/vitest";
import { assertSome } from "@effect/vitest/utils";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as Layer from "effect/Layer";
import * as Order from "effect/Order";
import type { EdgeSet } from "@beep/occt";

type Segment = readonly [number, number, number, number];

// A box with a wedge on top, a through hole, and a separate post in front:
// planar, curved, foreshortened, and partly hidden faces in one model.
const legacyFixture = ModelSpec.make({
  parts: [
    Part.make({
      name: "body",
      add: [
        Box.make({ min: [-20, -15, 0], max: [20, 15, 20] }),
        Prism.make({
          profile: [
            [-20, -5, 20],
            [0, -5, 20],
            [-20, -5, 35],
          ],
          extrusion: [0, 20, 0],
        }),
      ],
      subtract: [Cylinder.make({ base: [10, 0, -1], axis: [0, 0, 1], radius: 4, height: 30 })],
    }),
    Part.make({ name: "post", add: [Box.make({ min: [-4, -30, 0], max: [4, -24, 30] })] }),
  ],
});

const legacyCameras = [
  Camera.make({ eye: [0, 0, 1], up: [0, 1, 0] }),
  Camera.make({ eye: [0, 0, -1], up: [0, 1, 0] }),
  Camera.make({ eye: [0, -1, 0], up: [0, 0, 1] }),
  Camera.make({ eye: [1, 0.3, 0], up: [0, 0, 1] }),
  Camera.make({ eye: [90, -120, 65], up: [0, 0, 1], target: [0, 0, 15] }),
  Camera.make({ eye: [-90, -120, 65], up: [0, 0, 1], target: [0, 0, 15], focus: O.some(300) }),
];

// sha256 of the projected segments the shading generator produced before the
// style, axis and sliver options existed, for lit thresholds -0.2, 0.55, 0.75 and 1.
const LEGACY_SHA256 = "af9b81c85515c2035920293ef17bfc478f7a5464c41b62e07ca7dbff2455c668";

const sha256Of = (text: string) =>
  Effect.promise(() => crypto.subtle.digest("SHA-256", new TextEncoder().encode(text))).pipe(
    Effect.map((digest) =>
      pipe(
        A.fromIterable(new Uint8Array(digest)),
        A.map((b) => b.toString(16).padStart(2, "0")),
        A.join("")
      )
    )
  );

const box = (min: readonly [number, number, number], max: readonly [number, number, number]) =>
  ModelSpec.make({ parts: [Part.make({ name: "box", add: [Box.make({ min, max })] })] });

const front = Camera.make({ eye: [0, -1, 0], up: [0, 0, 1] });
const left = Camera.make({ eye: [-1, 0, 0], up: [0, 0, 1] });
const right = Camera.make({ eye: [1, 0, 0], up: [0, 0, 1] });
const top = Camera.make({ eye: [0, 0, 1], up: [0, 1, 0] });

const graded = (fields?: {
  readonly axis?: "longest-edge" | "surface-class";
  readonly minFaceSpan?: number;
  readonly minStroke?: number;
}) =>
  ShadingPlan.make({
    minPitch: 1,
    maxPitch: 3,
    litThreshold: 0.55,
    style: "graded",
    axis: fields?.axis ?? "surface-class",
    minFaceSpan: fields?.minFaceSpan ?? 0,
    minStroke: fields?.minStroke ?? 0,
  });

const isVertical = ([x1, , x2]: Segment) => Math.abs(x1 - x2) < 1e-6;
const isHorizontal = ([, y1, , y2]: Segment) => Math.abs(y1 - y2) < 1e-6;
const lengthOf = ([x1, y1, x2, y2]: Segment) => Math.hypot(x2 - x1, y2 - y1);
const sumOf = A.reduce(0, (sum: number, n: number) => sum + n);

const TestLayer = Occt.layer.pipe(Layer.provide(NodeServices.layer));

describe("@beep/occt shading", () => {
  it.layer(TestLayer, { timeout: "120 seconds" })((it) => {
    it.effect(
      "reproduces the original hatch byte for byte under the default style, axis and span",
      Effect.fnUntraced(function* () {
        const occt = yield* Occt;
        const run = (plan: (litThreshold: number) => ShadingPlan) =>
          Effect.forEach([-0.2, 0.55, 0.75, 1], (litThreshold) =>
            occt
              .project(
                ProjectionRequest.make({
                  solid: legacyFixture,
                  cameras: legacyCameras,
                  shading: O.some(plan(litThreshold)),
                })
              )
              .pipe(Effect.map(A.map((v: EdgeSet) => [v.visible, v.hidden, v.shading])))
          ).pipe(Effect.flatMap((views) => sha256Of(JSON.stringify(views))));
        expect(yield* run((litThreshold) => ShadingPlan.make({ minPitch: 1, maxPitch: 3, litThreshold }))).toBe(
          LEGACY_SHA256
        );
        expect(
          yield* run((litThreshold) =>
            ShadingPlan.make({
              minPitch: 1,
              maxPitch: 3,
              litThreshold,
              style: "uniform",
              axis: "longest-edge",
              minFaceSpan: 0,
            })
          )
        ).toBe(LEGACY_SHA256);
      })
    );

    it.effect(
      "records coverage: shaded faces and skips by reason",
      Effect.fnUntraced(function* () {
        const occt = yield* Occt;
        const [plain, shaded] = yield* occt
          .project(ProjectionRequest.make({ solid: legacyFixture, cameras: [front], shading: O.none() }))
          .pipe(
            Effect.zip(
              occt.project(
                ProjectionRequest.make({
                  solid: legacyFixture,
                  cameras: [front],
                  shading: O.some(ShadingPlan.make({ minPitch: 1, maxPitch: 3, litThreshold: 0.55 })),
                })
              )
            ),
            Effect.map(([a, b]) => [a[0], b[0]] as const)
          );
        expect(O.isNone(plain?.shadingCoverage ?? O.none())).toBe(true);
        // square-on front faces stay blank under the uniform default; the hole wall is curved
        const coverage = O.flatMap(O.fromNullishOr(shaded), (view) => view.shadingCoverage);
        assertSome(
          O.map(coverage, (c) => A.map(c.skippedFaces, (s) => s.reason)),
          ["back-facing", "curved", "lit"]
        );
      })
    );

    it.effect(
      "drops strokes shorter than the plan's minimum on the view plane; a face too narrow for any stroke is a sliver",
      Effect.fnUntraced(function* () {
        const occt = yield* Occt;
        const solid = box([-20, -15, 0], [20, 15, 20]);
        const [drawn] = yield* occt.project(
          ProjectionRequest.make({ solid, cameras: [front], shading: O.some(graded({ minStroke: 8 })) })
        );
        const [dropped] = yield* occt.project(
          ProjectionRequest.make({ solid, cameras: [front], shading: O.some(graded({ minStroke: 25 })) })
        );
        // the wall is 20 high: the full chords clear 8 after their end insets; nothing clears 25, so the
        // chord-aware offsets find no position and the face is a sliver
        expect(drawn?.shading.length).toBeGreaterThan(1);
        expect(dropped?.shading).toEqual([]);
        assertSome(
          O.flatMap(O.fromNullishOr(dropped), (view) => view.shadingCoverage),
          ShadingCoverage.make({
            shadedFaces: 0,
            skippedFaces: [
              ShadingSkip.make({ reason: "back-facing", faces: 5 }),
              ShadingSkip.make({ reason: "sliver", faces: 1 }),
            ],
          })
        );
      })
    );

    it.effect(
      "hatches a square-on face under graded shading, which the uniform default leaves blank",
      Effect.fnUntraced(function* () {
        const occt = yield* Occt;
        const solid = box([-20, -15, 0], [20, 15, 20]);
        const [uniform] = yield* occt.project(
          ProjectionRequest.make({
            solid,
            cameras: [front],
            shading: O.some(ShadingPlan.make({ minPitch: 1, maxPitch: 3, litThreshold: 0.55 })),
          })
        );
        const [gradedView] = yield* occt.project(
          ProjectionRequest.make({ solid, cameras: [front], shading: O.some(graded()) })
        );
        expect(uniform?.shading).toEqual([]);
        expect(gradedView?.shading.length).toBeGreaterThan(1);
        assertSome(
          O.flatMap(O.fromNullishOr(gradedView), (view) => view.shadingCoverage),
          ShadingCoverage.make({
            shadedFaces: 1,
            skippedFaces: [ShadingSkip.make({ reason: "back-facing", faces: 5 })],
          })
        );
      })
    );

    it.effect(
      "grades the gaps from the shadow edge: first gap the minimum pitch, then growing to the cap",
      Effect.fnUntraced(function* () {
        const occt = yield* Occt;
        const [view] = yield* occt.project(
          ProjectionRequest.make({
            solid: box([-20, -15, 0], [20, 15, 20]),
            cameras: [front],
            shading: O.some(graded()),
          })
        );
        const shading = view?.shading ?? [];
        expect(A.every(shading, isVertical)).toBe(true);
        // the 1.84(m) light comes from the upper left, so the shadow edge is the right one (x = 20)
        const columns = pipe(
          shading,
          A.map(([x]) => x),
          A.dedupe,
          A.sort(Order.flip(Order.Number))
        );
        const gaps = A.zipWith([20, ...columns], columns, (a, b) => Math.round((a - b) * 1e3) / 1e3);
        expect(gaps[0]).toBe(1);
        expect(
          A.every(
            A.zipWith(gaps, A.drop(gaps, 1), (a, b) => b >= a),
            (grows) => grows
          )
        ).toBe(true);
        expect(Math.max(...gaps)).toBeLessThanOrEqual(3);
        expect(A.length(columns)).toBeGreaterThanOrEqual(2);
      })
    );

    it.effect(
      "hatches upright faces vertically in the front and both side views",
      Effect.fnUntraced(function* () {
        const occt = yield* Occt;
        // a wide, low wall: its longest edge is horizontal, so the default axis hatches it horizontally
        const solid = box([-30, -5, 0], [30, 5, 12]);
        const views = yield* occt.project(
          ProjectionRequest.make({ solid, cameras: [front, left, right], shading: O.some(graded()) })
        );
        expect(A.length(views)).toBe(3);
        expect(
          A.map(views, (view) => A.isReadonlyArrayNonEmpty(view.shading) && A.every(view.shading, isVertical))
        ).toEqual([true, true, true]);
        const [longest] = yield* occt.project(
          ProjectionRequest.make({ solid, cameras: [front], shading: O.some(graded({ axis: "longest-edge" })) })
        );
        expect(A.every(longest?.shading ?? [], isHorizontal)).toBe(true);
      })
    );

    it.effect(
      "gives equally inclined faces mirrored about the light azimuth equal bands",
      Effect.fnUntraced(function* () {
        const occt = yield* Occt;
        // a gable roof whose ridge runs along (-1, 1, 0): in the top plan the
        // 1.84(m) light lies in the ridge's vertical plane, so both slopes see it alike
        const roof = ModelSpec.make({
          parts: [
            Part.make({
              name: "roof",
              add: [
                Prism.make({
                  profile: [
                    [-10, -15, 0],
                    [10, -15, 0],
                    [0, -15, 8],
                  ],
                  extrusion: [0, 30, 0],
                  rotate: [Rotation.make({ axis: [0, 0, 1], degrees: 45 })],
                }),
              ],
            }),
          ],
        });
        const [view] = yield* occt.project(
          ProjectionRequest.make({ solid: roof, cameras: [top], shading: O.some(graded()) })
        );
        const shading = view?.shading ?? [];
        // the projected ridge is the line x + y = 0
        const side = ([x1, y1, x2, y2]: Segment) => (x1 + x2 + y1 + y2) / 2;
        const lower = A.filter(shading, (s) => side(s) < 0);
        const upper = A.filter(shading, (s) => side(s) > 0);
        expect(A.length(lower)).toBeGreaterThan(0);
        expect(A.length(lower)).toBe(A.length(upper));
        expect(Math.abs(sumOf(A.map(lower, lengthOf)) - sumOf(A.map(upper, lengthOf)))).toBeLessThan(1e-2);
        assertSome(
          O.flatMap(O.fromNullishOr(view), (v) => O.map(v.shadingCoverage, (c) => c.shadedFaces)),
          2
        );
      })
    );

    it.effect(
      "drops a 2 mm band below the minimum face span",
      Effect.fnUntraced(function* () {
        const occt = yield* Occt;
        // a 40 × 30 × 2 plate seen from above and in front: the front edge band is 2 thick,
        // about 1.4 wide on the view plane, so a minimum span of 2 makes it a sliver
        const plate = box([-20, -15, 0], [20, 15, 2]);
        const camera = Camera.make({ eye: [0, -1, 1], up: [0, 0, 1] });
        const shadeWith = (minFaceSpan: number) =>
          occt
            .project(
              ProjectionRequest.make({ solid: plate, cameras: [camera], shading: O.some(graded({ minFaceSpan })) })
            )
            .pipe(Effect.map((views) => views[0]));
        const all = yield* shadeWith(0);
        const banded = yield* shadeWith(2);
        assertSome(
          O.flatMap(O.fromNullishOr(all), (v) =>
            O.map(v.shadingCoverage, (c) => [c.shadedFaces, A.map(c.skippedFaces, (s) => s.reason)])
          ),
          [2, ["back-facing"]]
        );
        assertSome(
          O.flatMap(O.fromNullishOr(banded), (v) =>
            O.map(v.shadingCoverage, (c) => [c.shadedFaces, A.map(c.skippedFaces, (s) => s.reason)])
          ),
          [1, ["back-facing", "sliver"]]
        );
        // the band's 2-unit chords leave no room past the end insets, so it draws nothing even before the
        // sliver rule; the coverage above is what tells the two apart
        expect(banded?.shading.length).toBeLessThanOrEqual(all?.shading.length ?? 0);
      })
    );
  });
});
