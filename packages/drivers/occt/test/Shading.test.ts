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
  readonly clearance?: number | undefined;
}) =>
  ShadingPlan.make({
    minPitch: 1,
    maxPitch: 3,
    litThreshold: 0.55,
    style: "graded",
    axis: fields?.axis ?? "surface-class",
    minFaceSpan: fields?.minFaceSpan ?? 0,
    minStroke: fields?.minStroke ?? 0,
    clearance: O.fromNullishOr(fields?.clearance),
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
      "grades planar faces around curved and partially hidden geometry without producing degenerate strokes",
      Effect.fnUntraced(function* () {
        const occt = yield* Occt;
        const views = yield* occt.project(
          ProjectionRequest.make({ solid: legacyFixture, cameras: legacyCameras, shading: O.some(graded()) })
        );
        const strokes = A.flatMap(views, (view) => view.shading);
        expect(A.length(strokes)).toBeGreaterThan(0);
        expect(A.every(strokes, (stroke) => lengthOf(stroke) > 0)).toBe(true);
        expect(
          A.some(views, (view) =>
            O.exists(view.shadingCoverage, (coverage) =>
              A.some(coverage.skippedFaces, (skip) => skip.reason === "curved")
            )
          )
        ).toBe(true);
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
      "measures a graded band from the face's own edge, not from a tab that sticks out past it",
      Effect.fnUntraced(function* () {
        const occt = yield* Occt;
        // a wall whose front face carries a coplanar bump 2 wide and 8 tall on its right (shadow) side:
        // a minor appendage, like a locking tab proud of a flap's edge. The probes through the bump see
        // the face reach x = 22, but the band must still start one pitch inside the wall's edge at x = 20.
        const wall = Part.make({
          name: "wall",
          add: [
            Box.make({ min: [-20, -15, 0], max: [20, 15, 20] }),
            Box.make({ min: [20, -15, 5], max: [22, -13, 13] }),
          ],
        });
        const [view] = yield* occt.project(
          ProjectionRequest.make({
            solid: ModelSpec.make({ parts: [wall] }),
            cameras: [front],
            shading: O.some(graded()),
          })
        );
        const xs = pipe(
          view?.shading ?? [],
          A.filter(isVertical),
          A.map((s) => s[0]),
          A.sort(Order.Number)
        );
        expect(A.isReadonlyArrayNonEmpty(xs)).toBe(true);
        // no stroke inside the bump, and the first one a minimum pitch inside the face's edge
        expect(Math.max(...xs)).toBeLessThan(20);
        expect(Math.max(...xs)).toBeCloseTo(19, 1);
      })
    );

    it.effect(
      "bands every separately bounded visible area of a face seen through a lattice, without leaking into its neighbours",
      Effect.fnUntraced(function* () {
        const occt = yield* Occt;
        // a 120 x 60 plate seen from above with thin walls standing on it (their tops are slivers and
        // draw nothing of their own): across the right half at y = 0, across the left half at y = 10,
        // and up the middle from y = 0 to the plate's top edge. The plate's top shows as three areas:
        // the lower one (y < 0 on the right, y < 10 on the left, in one piece below the middle wall),
        // the upper-right one and the upper-left one.
        // Under the upper-left light the plate's right and bottom edges are equally dark and the tie
        // goes to the edge least aligned with the sheet's vertical, the bottom one: lines run
        // horizontally and the step runs up the sheet. The lower area starts at the plate's own edge
        // and gets one band there; each upper area starts behind its own wall and gets a band hugging
        // that wall, drawn only in the rows that saw it; and no band runs on into another area.
        const plate = Part.make({ name: "plate", add: [Box.make({ min: [-60, -30, 0], max: [60, 30, 2] })] });
        const right = Part.make({ name: "right", add: [Box.make({ min: [0, -0.5, 2], max: [60, 0.5, 12] })] });
        const bridge = Part.make({ name: "bridge", add: [Box.make({ min: [-0.5, -0.5, 2], max: [0.5, 30, 12] })] });
        const left = Part.make({ name: "left", add: [Box.make({ min: [-60, 9.5, 2], max: [0, 10.5, 12] })] });
        const [view] = yield* occt.project(
          ProjectionRequest.make({
            solid: ModelSpec.make({ parts: [plate, right, bridge, left] }),
            cameras: [top],
            shading: O.some(graded({ minStroke: 0.5 })),
          })
        );
        // strokes on the plate, not on the walls' own top faces
        const onPlate = A.filter(view?.shading ?? [], ([x1, y1, x2, y2]) => {
          const x = (x1 + x2) / 2;
          const y = (y1 + y2) / 2;
          return !(
            (y > -0.5 && y < 0.5 && x > 0) ||
            (y > 9.5 && y < 10.5 && x < 0) ||
            (x > -0.5 && x < 0.5 && y > -0.5)
          );
        });
        expect(A.isReadonlyArrayNonEmpty(onPlate) && A.every(onPlate, isHorizontal)).toBe(true);
        // strokes (horizontal) that run through a box of the plate
        const through = (x0: number, x1: number, y0: number, y1: number) =>
          A.length(
            A.filter(onPlate, ([xa, y, xb]) => y > y0 && y < y1 && Math.max(xa, xb) > x0 && Math.min(xa, xb) < x1)
          );
        // the lower area: one band at the plate's bottom edge, running through both halves
        expect(through(2, 60, -30, -20)).toBeGreaterThanOrEqual(2);
        expect(through(-60, -2, -30, -20)).toBeGreaterThanOrEqual(2);
        // the upper area: a band above the right wall on the right, and above the left wall on the left
        expect(through(2, 60, 2, 13)).toBeGreaterThanOrEqual(2);
        expect(through(-60, -2, 12, 23)).toBeGreaterThanOrEqual(2);
        // nothing leaks: the right wall's band does not run on into the left half (the lower area's
        // lit side there), the left wall's band does not run on into the right half, and the lower
        // area's lit side stays bare. A band is drawn in the cells of the probes that saw its area,
        // so it may run on past the middle wall by up to half a cell (120 / 18 here) and no further.
        expect(through(-60, -9, 2, 8)).toBe(0);
        expect(through(9, 60, 14, 30)).toBe(0);
        expect(through(-60, 60, -18, -3)).toBe(0);
        assertSome(
          O.flatMap(O.fromNullishOr(view), (v) => O.map(v.shadingCoverage, (c) => c.lostFaces)),
          0
        );
      })
    );

    it.effect(
      "bands a cell walled off by slanting walls on its own, apart from the area outside the walls",
      Effect.fnUntraced(function* () {
        const occt = yield* Occt;
        // a 120 x 120 plate seen from above with a hexagonal ring wall standing on it (inner radius 28,
        // outer 30, vertices on the x axis). The plate shows as the area outside the ring and the cell
        // inside it. Probe rows a pitch apart see the cell's pieces and the outside pieces overlap in
        // range across the slanting walls; only the link test keeps the cell its own area, banded at its
        // own nearest side, instead of folding it into the outside band at the plate's edge.
        const hexagon = (radius: number, z: number) =>
          A.makeBy(6, (k) => [radius * Math.cos((k * Math.PI) / 3), radius * Math.sin((k * Math.PI) / 3), z] as const);
        const plate = Part.make({ name: "plate", add: [Box.make({ min: [-60, -60, 0], max: [60, 60, 2] })] });
        const ring = Part.make({
          name: "ring",
          add: [Prism.make({ profile: A.map(hexagon(30, 2), (p) => [...p]), extrusion: [0, 0, 10] })],
          subtract: [Prism.make({ profile: A.map(hexagon(28, 1), (p) => [...p]), extrusion: [0, 0, 12] })],
        });
        const [view] = yield* occt.project(
          ProjectionRequest.make({
            solid: ModelSpec.make({ parts: [plate, ring] }),
            cameras: [top],
            shading: O.some(graded({ minStroke: 0.5, minFaceSpan: 6 })),
          })
        );
        const strokes = view?.shading ?? [];
        const radiusOf = ([x1, y1, x2, y2]: Segment) => Math.hypot((x1 + x2) / 2, (y1 + y2) / 2);
        // the cell (inside the inner wall, apothem 24.2) carries its own band
        expect(A.length(A.filter(strokes, (s) => radiusOf(s) < 24))).toBeGreaterThanOrEqual(2);
        // the outside area keeps its band at the plate's edge
        expect(A.length(A.filter(strokes, (s) => radiusOf(s) > 40))).toBeGreaterThanOrEqual(2);
        // no stroke runs across the ring: none has one end inside the cell and the other outside the ring
        const within = (radius: number) => (x: number, y: number) =>
          A.every(
            A.makeBy(6, (k) => (Math.PI / 6) * (2 * k + 1)),
            (a) => x * Math.cos(a) + y * Math.sin(a) <= radius * Math.cos(Math.PI / 6) + 1e-6
          );
        const inCell = within(28);
        const inRing = within(30);
        expect(
          A.some(
            strokes,
            ([x1, y1, x2, y2]) => (inCell(x1, y1) && !inRing(x2, y2)) || (inCell(x2, y2) && !inRing(x1, y1))
          )
        ).toBe(false);
        // the ring's own 2 mm top face shows only short chords: a sliver, bare by design and never counted lost
        assertSome(
          O.flatMap(O.fromNullishOr(view), (v) =>
            O.map(v.shadingCoverage, (c) => [c.lostFaces, c.lostStretches] as const)
          ),
          [0, 0] as const
        );
      })
    );

    it.effect(
      "shades every visible stretch of a wall at the side nearest its shadow edge",
      Effect.fnUntraced(function* () {
        const occt = yield* Occt;
        // a wall whose shadow edge (its right end, x = 20) is behind a slab standing in front of x >= 8
        const wall = Part.make({ name: "wall", add: [Box.make({ min: [-20, -15, 0], max: [20, 15, 20] })] });
        const slab = Part.make({ name: "slab", add: [Box.make({ min: [8, -40, -5], max: [26, -25, 25] })] });
        // a post in front of the wall's middle splits its visible area in two
        const post = Part.make({ name: "post", add: [Box.make({ min: [-2, -40, -5], max: [2, -25, 25] })] });
        const strokeXs = (solid: ModelSpec) =>
          occt
            .project(ProjectionRequest.make({ solid, cameras: [front], shading: O.some(graded({ minStroke: 0.5 })) }))
            .pipe(
              Effect.map((views) =>
                pipe(
                  views[0]?.shading ?? [],
                  A.filter((s) => isVertical(s) && s[0] > -19),
                  A.map((s) => s[0]),
                  A.sort(Order.Number)
                )
              )
            );
        const alone = yield* strokeXs(ModelSpec.make({ parts: [wall] }));
        expect(A.isReadonlyArrayNonEmpty(alone) && A.every(alone, (x) => x >= 7)).toBe(true);
        // behind the slab the wall's band hugs the slab's edge: its first line one pitch left of x = 8
        // (the slab's own strokes sit past x = 20)
        const slabbed = A.filter(yield* strokeXs(ModelSpec.make({ parts: [wall, slab] })), (x) => x <= 20);
        expect(A.isReadonlyArrayNonEmpty(slabbed) && A.every(slabbed, (x) => x < 8)).toBe(true);
        expect(Math.max(...slabbed)).toBeCloseTo(7, 1);
        // the post splits the wall: the right stretch keeps its band, the left one gets a band next to the post
        const posted = yield* strokeXs(ModelSpec.make({ parts: [wall, post] }));
        expect(A.some(posted, (x) => x > 7)).toBe(true);
        expect(Math.max(...A.filter(posted, (x) => x < -2))).toBeCloseTo(-3, 1);
        // every face that planned lines drew some: nothing was lost to hidden-line removal
        const views = yield* occt.project(
          ProjectionRequest.make({
            solid: ModelSpec.make({ parts: [wall, post] }),
            cameras: [front],
            shading: O.some(graded({ minStroke: 0.5 })),
          })
        );
        assertSome(
          O.flatMap(O.fromNullishOr(views[0]), (v) => O.map(v.shadingCoverage, (c) => c.lostFaces)),
          0
        );
      })
    );

    it.effect(
      "keeps graded stroke ends the plan's clearance from the outlines",
      Effect.fnUntraced(function* () {
        const occt = yield* Occt;
        const wall = Part.make({ name: "wall", add: [Box.make({ min: [-20, -15, 0], max: [20, 15, 20] })] });
        // lowest and highest end of the wall's vertical strokes in the front view (y is z there)
        const ends = (clearance?: number) =>
          occt
            .project(
              ProjectionRequest.make({
                solid: ModelSpec.make({ parts: [wall] }),
                cameras: [front],
                shading: O.some(graded({ minStroke: 0.5, clearance })),
              })
            )
            .pipe(
              Effect.map((views) => {
                const ys = A.flatMap(A.filter(views[0]?.shading ?? [], isVertical), (s: Segment) => [s[1], s[3]]);
                return [Math.min(...ys), Math.max(...ys)] as const;
              })
            );
        // a bare plan draws the strokes back one pitch from the outlines they ended on
        // (0 and 20) and clears half a pitch, which that already satisfies
        const [low, high] = yield* ends();
        expect(low).toBeGreaterThanOrEqual(0.9);
        expect(low).toBeLessThanOrEqual(1.1);
        expect(high).toBeGreaterThanOrEqual(18.9);
        expect(high).toBeLessThanOrEqual(19.1);
        // a plan that carries a clearance keeps the ends at least that far away
        const [lowCleared, highCleared] = yield* ends(3);
        expect(lowCleared).toBeGreaterThanOrEqual(3);
        expect(highCleared).toBeLessThanOrEqual(17);
      })
    );

    it.effect(
      "maps graded probes through a perspective camera the way the hidden-line pass projects",
      Effect.fnUntraced(function* () {
        const occt = yield* Occt;
        const wall = Part.make({ name: "wall", add: [Box.make({ min: [-20, -15, 0], max: [20, 15, 20] })] });
        const post = Part.make({ name: "post", add: [Box.make({ min: [-2, -40, -5], max: [2, -25, 25] })] });
        // stroke count, shaded faces and lost faces of a view
        const summary = (view: EdgeSet) => [
          A.length(view.shading),
          ...O.getOrElse(
            O.map(view.shadingCoverage, (c) => [c.shadedFaces, c.lostFaces]),
            () => [-1, -1]
          ),
        ];
        const views = yield* occt.project(
          ProjectionRequest.make({
            solid: ModelSpec.make({ parts: [wall, post] }),
            cameras: [
              front,
              Camera.make({ eye: [0, -1, 0], up: [0, 0, 1], focus: O.some(300) }),
              Camera.make({ eye: [-90, -120, 65], up: [0, 0, 1], target: [0, 0, 10] }),
              Camera.make({ eye: [-90, -120, 65], up: [0, 0, 1], target: [0, 0, 10], focus: O.some(300) }),
            ],
            shading: O.some(graded({ minStroke: 0.5 })),
          })
        );
        // a perspective camera draws the same strokes on the same faces as its orthographic
        // twin, from the front (both probe ends at one depth) and from an oblique eye (the far
        // end foreshortened): the window of each partly hidden probe is walked back through
        // the camera's own projection, not read as a fraction of the projected line
        expect(summary(views[1]!)).toEqual(summary(views[0]!));
        expect(summary(views[3]!)).toEqual(summary(views[2]!));
        // from the pictorial eye the post's 4 mm faces have room for a single stroke each and are
        // skipped as narrow by design (a lone line beside an outline reads as a doubled edge), so
        // they count neither as shaded nor as lost; the wall's strokes are drawn only in the probe
        // rows that saw each area, which leaves the band one stroke short of the whole-chord count
        expect(summary(views[2]!)).toEqual([12, 4, 0]);
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
