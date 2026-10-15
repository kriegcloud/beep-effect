import {
  BoundingBox,
  Box,
  Camera,
  Cylinder,
  EdgeSet,
  ModelSpec,
  Occt,
  OcctError,
  OverlayLine,
  Part,
  Prism,
  ProjectionRequest,
  Segment2,
  ShadingPlan,
} from "@beep/occt";
import { cameraForView } from "@beep/technical-drawing";
import { it } from "@beep/test-runner";
import { A } from "@beep/utils";
import { NodeServices } from "@effect/platform-node";
import { describe, expect } from "@effect/vitest";
import { assertInstanceOf, assertNone, assertSome } from "@effect/vitest/utils";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as R from "effect/Record";
import * as S from "effect/Schema";

// A 40 × 30 × 20 box with an off-centre wedge on top, so no two principal
// views coincide and the top/bottom distinction is observable.
const fixture = ModelSpec.make({
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
    }),
  ],
});

const top = Camera.make({ eye: [0, 0, 1], up: [0, 1, 0] });
const bottom = Camera.make({ eye: [0, 0, -1], up: [0, 1, 0] });
const front = Camera.make({ eye: [0, -1, 0], up: [0, 0, 1] });
const persp = (focus: number) =>
  Camera.make({ eye: [90, -120, 65], up: [0, 0, 1], target: [0, 0, 15], focus: O.some(focus) });

const TestLayer = Occt.layer.pipe(Layer.provide(NodeServices.layer));

type Seg = readonly [number, number, number, number];
type Point3 = readonly [number, number, number];

// Where a camera draws a model point: the projector's own frame (right = up × eye, sheet up = eye × right, both about
// the target) under its own projection, as the kernel's view mapping reads it.
const drawnAt = (camera: Camera, p: Point3): readonly [number, number] => {
  const unit = (v: Point3): Point3 => [v[0] / Math.hypot(...v), v[1] / Math.hypot(...v), v[2] / Math.hypot(...v)];
  const cross = (a: Point3, b: Point3): Point3 => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
  const dot = (a: Point3, b: Point3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const direction = unit(camera.eye);
  const right = unit(cross(unit(camera.up), direction));
  const up = cross(direction, right);
  const d: Point3 = [p[0] - camera.target[0], p[1] - camera.target[1], p[2] - camera.target[2]];
  const [u, v, w] = [dot(d, right), dot(d, up), dot(d, direction)];
  return O.match(camera.focus, {
    onNone: () => [u, v] as const,
    onSome: (focus) => [(u * focus) / (focus - w), (v * focus) / (focus - w)] as const,
  });
};

// The drawn segment that joins two model points (the kernel rounds to 0.001), if any.
const joining =
  (camera: Camera, segments: ReadonlyArray<Seg>) =>
  (a: Point3, b: Point3): O.Option<Seg> => {
    const [p, q] = [drawnAt(camera, a), drawnAt(camera, b)];
    const near = (x: number, y: number, at: readonly [number, number]) =>
      Math.abs(x - at[0]) < 2e-3 && Math.abs(y - at[1]) < 2e-3;
    return A.findFirst(
      segments,
      ([x1, y1, x2, y2]) => (near(x1, y1, p) && near(x2, y2, q)) || (near(x1, y1, q) && near(x2, y2, p))
    );
  };

// Sine of the angle between two drawn segments: 0 when parallel.
const turnBetween = ([ax1, ay1, ax2, ay2]: Seg, [bx1, by1, bx2, by2]: Seg): number =>
  Math.abs((ax2 - ax1) * (by2 - by1) - (ay2 - ay1) * (bx2 - bx1)) /
  (Math.hypot(ax2 - ax1, ay2 - ay1) * Math.hypot(bx2 - bx1, by2 - by1));
const totalLength = (segments: ReadonlyArray<Seg>): number =>
  A.reduce(segments, 0, (sum, [x1, y1, x2, y2]) => sum + Math.hypot(x2 - x1, y2 - y1));

// Generic crate: two plates crossed at 90° with halving slots (the long wall
// slotted from the top, the cross wall from the bottom), a lid with a slit,
// and a tab through the slit drawn in broken lines. Every contact face has
// zero clearance. Mirrors the technical-drawing synthetic-crate fixture.
const box = (min: readonly [number, number, number], max: readonly [number, number, number]) =>
  Box.make({ min: [...min], max: [...max] });
const longWall = Part.make({
  name: "long-wall",
  add: [box([-40, -2, 0], [40, 2, 40])],
  subtract: [box([-2, -3, 20], [2, 3, 41])],
});
const crossWall = Part.make({
  name: "cross-wall",
  add: [box([-2, -30, 0], [2, 30, 40])],
  subtract: [box([-3, -2, -1], [3, 2, 20])],
});
const lid = Part.make({
  name: "lid",
  add: [box([0, -30, 40], [40, 30, 43])],
  subtract: [box([20, -2, 39], [30, 2, 44])],
});
const tab = Part.make({ name: "tab", add: [box([20, -2, 40], [30, 2, 46])], lineStyle: "broken" });
const crate = ModelSpec.make({ parts: [longWall, crossWall, lid, tab] });

const noView = EdgeSet.make({ visible: [], hidden: [] });

// Names the two views of a plan + front projection; a missing view fails the
// test instead of silently reading as empty.
const planAndFront = (views: ReadonlyArray<EdgeSet>): { readonly plan: EdgeSet; readonly front: EdgeSet } => {
  expect(views).toHaveLength(2);
  const [plan = noView, frontView = noView] = views;
  return { plan, front: frontView };
};

// The projection output of this model before broken-line parts existed:
// SHA-256 of the JSON of each view's visible, hidden and shading segments,
// recorded from main 6e390049ca for the cameras and plan below.
const LEGACY_MODEL = ModelSpec.make({
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
// Re-recorded 2026-10-14: the front view's hidden lines held 49 exact duplicates (two parts meeting on a shared
// plane each reported the boundary); `toSegments` now draws such a line once. Visible and shading output unchanged.
const LEGACY_SHA256 = "6824418a60da2f5a6d77dc7fac46024a7c909aa1552ea78a1e8be18555dd1d42";
const LegacyViews = S.Struct({
  visible: S.Array(Segment2),
  hidden: S.Array(Segment2),
  shading: S.Array(Segment2),
}).pipe(S.Array, S.fromJsonString);
const encodeLegacyViews = S.encodeEffect(LegacyViews);
const sha256Hex = (text: string) =>
  Effect.promise(() => crypto.subtle.digest("SHA-256", new TextEncoder().encode(text))).pipe(
    Effect.map((digest) =>
      pipe(
        A.fromIterable(new Uint8Array(digest)),
        A.map((b) => b.toString(16).padStart(2, "0")),
        A.join("")
      )
    )
  );

describe("@beep/occt service", () => {
  it.effect(
    "rejects model specs exceeding the bounded overlap work limit",
    Effect.fnUntraced(function* () {
      // encoded input: a primitive's decoded line style is an Option, which the decoder does not take back
      const part = { name: "box", add: [{ kind: "box", min: [0, 0, 0], max: [1, 1, 1] }] };
      const decode = S.decodeUnknownEffect(ModelSpec);
      const rejected = yield* Effect.flip(decode({ parts: A.makeBy(257, () => part) }));
      expect(rejected.message).toContain("Expected at most 256 parts");
      expect((yield* decode({ parts: A.makeBy(256, () => part) })).parts).toHaveLength(256);
    })
  );
  it.layer(TestLayer, { timeout: "60 seconds" })((it) => {
    it.effect(
      "reports kernel provenance",
      Effect.fnUntraced(function* () {
        const occt = yield* Occt;
        const kernel = yield* occt.kernel;
        expect(kernel.variant).toBe("single-thread");
        expect(kernel.wasmSha256).toMatch(/^[0-9a-f]{64}$/);
        expect(kernel.wasmBytes).toBeGreaterThan(1_000_000);
      })
    );

    it.effect(
      "measures the fixture",
      Effect.fnUntraced(function* () {
        const occt = yield* Occt;
        const summary = yield* occt.summarize(fixture);
        expect(summary.boundingBox.min).toEqual([-20, -15, 0]);
        expect(summary.boundingBox.max).toEqual([20, 15, 35]);
        // box 40·30·20 plus wedge ½·20·15·20
        expect(summary.volume).toBe(24000 + 3000);
        expect(summary.faceCount).toBe(8);
      })
    );

    it.effect(
      "distinguishes top from bottom and front views",
      Effect.fnUntraced(function* () {
        const occt = yield* Occt;
        const [topView, bottomView, frontView] = yield* occt.project(
          ProjectionRequest.make({ solid: fixture, cameras: [top, bottom, front], withHidden: true })
        );
        // bottom: only the box outline; top: outline plus the wedge's four edges
        expect(bottomView?.visible.length).toBe(4);
        expect(topView?.visible.length).toBe(8);
        expect(bottomView?.hidden.length).toBeGreaterThan(topView?.hidden.length ?? 0);
        expect(frontView?.visible.length).toBe(6);
        expect(topView?.visible).not.toEqual(bottomView?.visible);
      })
    );

    it.effect(
      "projects in perspective when a focus is given",
      Effect.fnUntraced(function* () {
        const occt = yield* Occt;
        const [axo, near] = yield* occt.project(
          ProjectionRequest.make({
            solid: fixture,
            cameras: [Camera.make({ eye: [90, -120, 65], up: [0, 0, 1], target: [0, 0, 15] }), persp(80)],
          })
        );
        expect(axo?.visible.length).toBe(15);
        expect(near?.visible.length).toBe(15);
        expect(axo?.visible).not.toEqual(near?.visible);
        // In the axonometric view the four vertical box edges stay parallel
        // (equal projected direction); in perspective they converge.
        const directionSpread = (segments: ReadonlyArray<readonly [number, number, number, number]>) =>
          pipe(
            segments,
            A.map(([x1, y1, x2, y2]) => Math.atan2(y2 - y1, x2 - x1)),
            A.map((angle) => Math.abs(Math.cos(angle))),
            A.filter((c) => c < 0.3),
            (cs) => Math.max(...cs) - Math.min(...cs)
          );
        expect(directionSpread(axo?.visible ?? [])).toBeLessThan(1e-6);
        expect(directionSpread(near?.visible ?? [])).toBeGreaterThan(1e-3);
      })
    );

    it.effect(
      "keeps every vertical edge vertical in a two-point pictorial, converges level edges, and shows the top or bottom",
      Effect.fnUntraced(function* () {
        const occt = yield* Occt;
        const block = ModelSpec.make({ parts: [Part.make({ name: "block", add: [box([0, 0, 0], [40, 30, 20])] })] });
        const bounds = BoundingBox.make({ min: [0, 0, 0], max: [40, 30, 20] });
        const pictorial = (view: "top-perspective" | "bottom-perspective", projection: "two-point" | "isometric") =>
          cameraForView({ view, box: bounds, projection, azimuthDeg: O.some(30), elevationDeg: O.some(20) });
        const cameras = [
          pictorial("top-perspective", "two-point"),
          pictorial("bottom-perspective", "two-point"),
          pictorial("top-perspective", "isometric"),
        ] as const;
        const views = yield* occt.project(
          ProjectionRequest.make({ solid: block, cameras: [...cameras], withHidden: true })
        );
        expect(views).toHaveLength(3);
        const drawn = A.map(views, (view) => [...view.visible, ...view.hidden]);
        const corners = [
          [0, 0],
          [40, 0],
          [0, 30],
          [40, 30],
        ] as const;
        const isVertical = ([x1, , x2]: Seg) => Math.abs(x2 - x1) < 1e-6;
        A.forEach([0, 1], (index) => {
          const camera = cameras[index]!;
          const segments = drawn[index]!;
          // every vertical model edge is drawn as a vertical segment, and no other edge is
          A.forEach(corners, ([x, y]) => {
            const edge = joining(camera, segments)([x, y, 0], [x, y, 20]);
            expect(O.exists(edge, isVertical)).toBe(true);
          });
          expect(A.length(A.filter(segments, isVertical))).toBe(4);
          // level edges that are parallel on the model run toward a vanishing point on the sheet
          const pairs = [
            [
              [0, 0, 0],
              [40, 0, 0],
              [0, 0, 20],
              [40, 0, 20],
            ],
            [
              [0, 0, 0],
              [0, 30, 0],
              [0, 0, 20],
              [0, 30, 20],
            ],
          ] as const;
          A.forEach(pairs, ([a, b, c, d]) => {
            const lower = O.getOrThrow(joining(camera, segments)(a, b));
            const upper = O.getOrThrow(joining(camera, segments)(c, d));
            expect(turnBetween(lower, upper)).toBeGreaterThan(0.02);
          });
        });
        // the isometric keeps them parallel
        const iso = cameras[2];
        const isoFront = O.getOrThrow(joining(iso, drawn[2]!)([0, 0, 0], [40, 0, 0]));
        const isoFrontTop = O.getOrThrow(joining(iso, drawn[2]!)([0, 0, 20], [40, 0, 20]));
        expect(turnBetween(isoFront, isoFrontTop)).toBeLessThan(1e-4);
        // the eye stands at the front-left, so the far corner is (40, 30): its top end closes the visible top face in
        // the top view and is hidden in the bottom view, and the other way round for its bottom end
        const touching = (camera: Camera, segments: ReadonlyArray<Seg>, p: Point3) => {
          const [x, y] = drawnAt(camera, p);
          return A.length(
            A.filter(
              segments,
              ([x1, y1, x2, y2]) =>
                (Math.abs(x1 - x) < 2e-3 && Math.abs(y1 - y) < 2e-3) ||
                (Math.abs(x2 - x) < 2e-3 && Math.abs(y2 - y) < 2e-3)
            )
          );
        };
        const [upperView, lowerView] = views;
        expect(touching(cameras[0], upperView?.visible ?? [], [40, 30, 20])).toBe(2);
        expect(touching(cameras[0], upperView?.visible ?? [], [40, 30, 0])).toBe(0);
        expect(touching(cameras[1], lowerView?.visible ?? [], [40, 30, 0])).toBe(2);
        expect(touching(cameras[1], lowerView?.visible ?? [], [40, 30, 20])).toBe(0);
        expect(A.map(views, (view) => A.length(view.visible))).toEqual([9, 9, 9]);
      })
    );

    it.effect(
      "lets shading and faced overlays see the top face a two-point camera looks level across",
      Effect.fnUntraced(function* () {
        const occt = yield* Occt;
        const lid = OverlayLine.make({
          name: "lid",
          style: "emphasis",
          points: [
            [10, 15, 20],
            [30, 15, 20],
          ],
          facing: O.some([0, 0, 1]),
        });
        const block = ModelSpec.make({
          parts: [Part.make({ name: "block", add: [box([0, 0, 0], [40, 30, 20])] })],
          overlays: [lid],
        });
        const level = cameraForView({
          view: "top-perspective",
          box: BoundingBox.make({ min: [0, 0, 0], max: [40, 30, 20] }),
          projection: "two-point",
          azimuthDeg: O.some(30),
          elevationDeg: O.some(20),
        });
        // the same camera without its sight reads the top face edge-on; it keeps its hidden-line pass about the target,
        // so only what it reads as facing changes
        const blind = Camera.make({ ...level, sight: O.none() });
        expect(blind.hiddenLinePassAbout).toBe("target");
        const [seen, unseen] = yield* occt.project(
          ProjectionRequest.make({
            solid: block,
            cameras: [level, blind],
            shading: O.some(ShadingPlan.make({ minPitch: 1, maxPitch: 3, litThreshold: 1 })),
          })
        );
        const backFacing = (view: EdgeSet | undefined) =>
          pipe(
            O.fromNullishOr(view),
            O.flatMap((v) => v.shadingCoverage),
            O.flatMap((coverage) => A.findFirst(coverage.skippedFaces, (skip) => skip.reason === "back-facing")),
            O.map((skip) => skip.faces)
          );
        // bottom, rear and right turn away; the level eye alone would add the top
        assertSome(backFacing(seen), 3);
        assertSome(backFacing(unseen), 4);
        expect(totalLength(seen?.emphasis ?? [])).toBeGreaterThan(10);
        expect(unseen?.emphasis).toEqual([]);
        // with the pass origin held, the sight changes what is shaded, never the outline
        expect(seen?.visible).toEqual(unseen?.visible);
      })
    );

    it.effect(
      "hides what a two-point pictorial's near slab covers wherever the model sits about the origin",
      Effect.fnUntraced(function* () {
        const occt = yield* Occt;
        type Corner = readonly [number, number, number];
        // A block on a plate whose underside is the model's z = 0, seen from below, and a table whose top is z = 0,
        // seen from above: OCCT's own perspective eye stands level with the slab's near face in both, so only a pass
        // run about the camera's target hides the block's face against the slab.
        const cases = [
          { view: "bottom-perspective", slab: [0, 4], block: [4, 14], contact: 4 },
          { view: "top-perspective", slab: [-4, 0], block: [-14, -4], contact: -4 },
        ] as const;
        yield* Effect.forEach(
          cases,
          Effect.fnUntraced(function* ({ view, slab, block, contact }) {
            const at = ([tx, ty, tz]: Corner) =>
              ModelSpec.make({
                parts: [
                  Part.make({ name: "slab", add: [box([tx, ty, slab[0] + tz], [40 + tx, 30 + ty, slab[1] + tz])] }),
                  Part.make({
                    name: "block",
                    add: [box([10 + tx, 10 + ty, block[0] + tz], [20 + tx, 20 + ty, block[1] + tz])],
                  }),
                ],
              });
            const camera = cameraForView({
              view,
              box: BoundingBox.make({
                min: [0, 0, Math.min(slab[0], block[0])],
                max: [40, 30, Math.max(slab[1], block[1])],
              }),
              projection: "two-point",
              azimuthDeg: O.some(30),
              elevationDeg: O.some(20),
            });
            const [placed] = yield* occt.project(
              ProjectionRequest.make({ solid: at([0, 0, 0]), cameras: [camera], withHidden: false })
            );
            // the same view of the model moved so the camera's target is the origin
            const [centred] = yield* occt.project(
              ProjectionRequest.make({
                solid: at([-camera.target[0], -camera.target[1], -camera.target[2]]),
                cameras: [Camera.make({ ...camera, target: [0, 0, 0] })],
                withHidden: false,
              })
            );
            const visible = placed?.visible ?? [];
            const footprint = [
              [10, 10],
              [20, 10],
              [20, 20],
              [10, 20],
            ] as const;
            A.forEach(footprint, ([x, y], index) => {
              const [nx, ny] = footprint[(index + 1) % 4]!;
              assertNone(joining(camera, visible)([x, y, contact], [nx, ny, contact]));
            });
            expect(A.length(visible)).toBe(A.length(centred?.visible ?? []));
            expect(totalLength(visible)).toBeCloseTo(totalLength(centred?.visible ?? []), 2);
            // the pass origin, not the sight, decides it: the same camera run about the model's origin draws the
            // block's face against the slab
            const [aboutOrigin] = yield* occt.project(
              ProjectionRequest.make({
                solid: at([0, 0, 0]),
                cameras: [Camera.make({ ...camera, hiddenLinePassAbout: "origin" })],
                withHidden: false,
              })
            );
            expect(
              A.some(footprint, ([x, y], index) => {
                const [nx, ny] = footprint[(index + 1) % 4]!;
                return O.isSome(joining(camera, aboutOrigin?.visible ?? [])([x, y, contact], [nx, ny, contact]));
              })
            ).toBe(true);
          }),
          { discard: true }
        );
      })
    );

    it.effect(
      "is byte-stable across runs",
      Effect.fnUntraced(function* () {
        const occt = yield* Occt;
        const request = ProjectionRequest.make({ solid: fixture, cameras: [top, persp(300)] });
        const first = yield* occt.project(request);
        const second = yield* occt.project(request);
        expect(first).toEqual(second);
        expect(first.length).toBe(2);
      })
    );

    it.effect(
      "shades nothing without a plan, and nothing above a lit threshold of -1",
      Effect.fnUntraced(function* () {
        const occt = yield* Occt;
        const [plain, unlit] = yield* occt.project(ProjectionRequest.make({ solid: fixture, cameras: [front] })).pipe(
          Effect.zip(
            occt.project(
              ProjectionRequest.make({
                solid: fixture,
                cameras: [front],
                shading: O.some(ShadingPlan.make({ minPitch: 1, maxPitch: 3, litThreshold: -1 })),
              })
            )
          ),
          Effect.map(([a, b]) => [a[0], b[0]] as const)
        );
        expect(plain?.shading).toEqual([]);
        expect(unlit?.shading).toEqual([]);
      })
    );

    it.effect(
      "hatches the front elevation with lines along the face's longest edge",
      Effect.fnUntraced(function* () {
        const occt = yield* Occt;
        const [view] = yield* occt.project(
          ProjectionRequest.make({
            solid: fixture,
            cameras: [front],
            shading: O.some(ShadingPlan.make({ minPitch: 1, maxPitch: 3 })),
          })
        );
        const shading = view?.shading ?? [];
        // box front face: lines along its 40-long bottom edge (horizontal); wedge
        // triangle: lines along its hypotenuse, slope -15/20 in this view
        const slopeOf = ([x1, y1, x2, y2]: readonly [number, number, number, number]) =>
          Math.round(((y2 - y1) / (x2 - x1)) * 1000) / 1000;
        const slopes = pipe(shading, A.map(slopeOf), A.dedupe, A.sort(Order.Number));
        expect(slopes).toEqual([-0.75, 0]);
        // outlines are unchanged by shading
        expect(view?.visible.length).toBe(6);
      })
    );

    it.effect(
      "hides hatch lines behind a separate part",
      Effect.fnUntraced(function* () {
        const occt = yield* Occt;
        const post = Part.make({ name: "post", add: [Box.make({ min: [-4, -30, 0], max: [4, -24, 30] })] });
        const plan = O.some(ShadingPlan.make({ minPitch: 1, maxPitch: 3 }));
        const shadingLength = (solid: ModelSpec) =>
          occt.project(ProjectionRequest.make({ solid, cameras: [front], shading: plan })).pipe(
            Effect.map((views) =>
              pipe(
                views[0]?.shading ?? [],
                A.reduce(0, (sum, [x1, y1, x2, y2]) => sum + Math.hypot(x2 - x1, y2 - y1))
              )
            )
          );
        const together = yield* shadingLength(ModelSpec.make({ parts: [...fixture.parts, post] }));
        const bodyAlone = yield* shadingLength(fixture);
        const postAlone = yield* shadingLength(ModelSpec.make({ parts: [post] }));
        expect(together).toBeLessThan(bodyAlone + postAlone - 1);
      })
    );

    it.effect(
      "merges the seam between coplanar faces of fused primitives",
      Effect.fnUntraced(function* () {
        const occt = yield* Occt;
        // two boxes side by side share one flat front face after the fuse
        const slab = ModelSpec.make({
          parts: [
            Part.make({
              name: "slab",
              add: [Box.make({ min: [0, 0, 0], max: [10, 10, 10] }), Box.make({ min: [10, 0, 0], max: [25, 10, 10] })],
            }),
          ],
        });
        const [view] = yield* occt.project(ProjectionRequest.make({ solid: slab, cameras: [front] }));
        expect(view?.visible.length).toBe(4);
        const summary = yield* occt.summarize(slab);
        expect(summary.faceCount).toBe(6);
      })
    );

    it.effect(
      "keeps hatch lines at least the minimum pitch apart on a foreshortened face",
      Effect.fnUntraced(function* () {
        const occt = yield* Occt;
        // a tall slab seen almost edge-on to its +Y face; the lit threshold
        // leaves the +X face clear, so every line belongs to the +Y face
        const post = ModelSpec.make({
          parts: [Part.make({ name: "post", add: [Box.make({ min: [0, 0, 0], max: [60, 10, 80] })] })],
        });
        const [view] = yield* occt.project(
          ProjectionRequest.make({
            solid: post,
            cameras: [Camera.make({ eye: [1, 0.3, 0], up: [0, 0, 1] })],
            shading: O.some(ShadingPlan.make({ minPitch: 1, maxPitch: 3, litThreshold: 0 })),
          })
        );
        const shading = view?.shading ?? [];
        // lines still run along the 80-long vertical edges
        expect(
          pipe(
            shading,
            A.every(([x1, , x2]) => x1 === x2)
          )
        ).toBe(true);
        expect(shading.length).toBeGreaterThan(2);
        const columns = pipe(
          shading,
          A.map(([x]) => x),
          A.sort(Order.Number)
        );
        const gaps = A.zipWith(columns, A.drop(columns, 1), (a, b) => b - a);
        expect(Math.min(...gaps)).toBeGreaterThanOrEqual(0.99);
      })
    );

    it.effect(
      "projects a model without broken parts exactly as before broken-line parts existed",
      Effect.fnUntraced(function* () {
        const occt = yield* Occt;
        const views = yield* occt.project(
          ProjectionRequest.make({
            solid: LEGACY_MODEL,
            cameras: [
              top,
              front,
              Camera.make({ eye: [-1, -1.2, 0.85], up: [0, 0, 1], target: [0, 0, 15], focus: O.some(200) }),
            ],
            withHidden: true,
            shading: O.some(ShadingPlan.make({ minPitch: 1, maxPitch: 3 })),
          })
        );
        expect(A.map(views, (view) => view.broken)).toEqual([[], [], []]);
        expect(A.map(views, (view) => view.emphasis)).toEqual([[], [], []]);
        const json = yield* encodeLegacyViews(
          A.map(views, (view) => ({ visible: view.visible, hidden: view.hidden, shading: view.shading }))
        );
        expect(yield* sha256Hex(json)).toBe(LEGACY_SHA256);
      })
    );

    it.effect(
      "draws a broken part's visible edges in the broken layer only",
      Effect.fnUntraced(function* () {
        const occt = yield* Occt;
        const solidTab = ModelSpec.make({
          parts: [longWall, crossWall, lid, Part.make({ ...tab, lineStyle: "solid" })],
        });
        const projectPlanAndFront = (solid: ModelSpec) =>
          occt.project(ProjectionRequest.make({ solid, cameras: [top, front] })).pipe(Effect.map(planAndFront));
        const broken = yield* projectPlanAndFront(crate);
        const solid = yield* projectPlanAndFront(solidTab);
        // the tab rises 3 above the lid: its top face in plan, its exposed band in front
        expect(totalLength(broken.plan.broken)).toBeGreaterThan(0);
        expect(totalLength(broken.front.broken)).toBeGreaterThan(0);
        expect(solid.plan.broken).toEqual([]);
        // the band above the lid is 10 wide and 3 tall; the part inside the slit stays hidden
        expect(A.every(broken.front.broken, ([, y1, , y2]) => Math.min(y1, y2) >= 43)).toBe(true);
        // what the broken layer draws is exactly what the solid tab added to the outline
        expect(totalLength(broken.front.visible) + totalLength(broken.front.broken)).toBeCloseTo(
          totalLength(solid.front.visible),
          3
        );
        expect(broken.plan.visible.length).toBeGreaterThan(0);
      })
    );

    it.effect(
      "hides broken parts behind solid parts and solid parts behind broken ones",
      Effect.fnUntraced(function* () {
        const occt = yield* Occt;
        // a plate with a low block in front of it, seen from the front: the
        // block hides 10 of the plate's 140-long outline
        const plate = Part.make({ name: "plate", add: [box([-20, 10, 0], [20, 12, 30])] });
        const block = Part.make({ name: "block", add: [box([-5, -10, 0], [5, 0, 10])] });
        const view = (parts: ReadonlyArray<Part>) =>
          occt
            .project(ProjectionRequest.make({ solid: ModelSpec.make({ parts }), cameras: [front], withHidden: true }))
            .pipe(Effect.map((views) => views[0] ?? EdgeSet.make({ visible: [], hidden: [] })));
        const brokenBlock = yield* view([plate, Part.make({ ...block, lineStyle: "broken" })]);
        const brokenPlate = yield* view([Part.make({ ...plate, lineStyle: "broken" }), block]);
        const blockAlone = yield* view([block]);
        // solid plate occluded by the broken block
        expect(totalLength(brokenBlock.visible)).toBeCloseTo(130, 3);
        expect(totalLength(brokenBlock.broken)).toBeCloseTo(40, 3);
        // broken plate occluded by the solid block, the same 130
        expect(totalLength(brokenPlate.broken)).toBeCloseTo(130, 3);
        expect(totalLength(brokenPlate.visible)).toBeCloseTo(40, 3);
        // a broken part's hidden edges are never collected
        expect(brokenPlate.hidden).toEqual(blockAlone.hidden);
      })
    );

    it.effect(
      "never shades a broken part",
      Effect.fnUntraced(function* () {
        const occt = yield* Occt;
        const plan = O.some(ShadingPlan.make({ minPitch: 1, maxPitch: 3, litThreshold: 1 }));
        const slab = Part.make({ name: "slab", add: [box([0, 0, 0], [40, 10, 30])] });
        const shade = (part: Part) =>
          occt
            .project(
              ProjectionRequest.make({ solid: ModelSpec.make({ parts: [part] }), cameras: [front], shading: plan })
            )
            .pipe(Effect.map((views) => views[0] ?? EdgeSet.make({ visible: [], hidden: [] })));
        const solid = yield* shade(slab);
        const broken = yield* shade(Part.make({ ...slab, lineStyle: "broken" }));
        expect(solid.shading.length).toBeGreaterThan(0);
        expect(broken.shading).toEqual([]);
        expect(broken.visible).toEqual([]);
        expect(broken.broken).toEqual(solid.visible);
        // in the crate, hatching is the same whether the tab is broken or absent
        const [withTab] = yield* occt.project(
          ProjectionRequest.make({ solid: crate, cameras: [front], shading: plan })
        );
        const [withoutTab] = yield* occt.project(
          ProjectionRequest.make({
            solid: ModelSpec.make({ parts: [longWall, crossWall, lid] }),
            cameras: [front],
            shading: plan,
          })
        );
        expect(withTab?.shading).toEqual(withoutTab?.shading);
      })
    );

    it.effect(
      "draws an emphasis overlay only in views its face turns toward, behind the parts in front of it",
      Effect.fnUntraced(function* () {
        const occt = yield* Occt;
        // a slab whose front face (y = 0) carries a 20-long heavy line at mid height
        const slab = Part.make({ name: "slab", add: [box([-20, 0, 0], [20, 10, 30])] });
        const seat = OverlayLine.make({
          name: "seat",
          style: "emphasis",
          points: [
            [-10, 0, 15],
            [0, 0, 15],
            [10, 0, 15],
          ],
          facing: O.some([0, -1, 0]),
        });
        const back = Camera.make({ eye: [0, 1, 0], up: [0, 0, 1] });
        const [frontView, backView, topView] = yield* occt.project(
          ProjectionRequest.make({
            solid: ModelSpec.make({ parts: [slab], overlays: [seat] }),
            cameras: [front, back, top],
          })
        );
        const emphasisOf = (view: typeof frontView) => view?.emphasis ?? [];
        expect(totalLength(emphasisOf(frontView))).toBeCloseTo(20, 3);
        expect(A.every(emphasisOf(frontView), ([, y1, , y2]) => y1 === 15 && y2 === 15)).toBe(true);
        // the face is seen from behind in the back view and edge-on in the plan: no line prints over an outline
        expect(emphasisOf(backView)).toEqual([]);
        expect(emphasisOf(topView)).toEqual([]);
        // an overlay draws nothing on the other layers
        const [bare] = yield* occt.project(
          ProjectionRequest.make({ solid: ModelSpec.make({ parts: [slab] }), cameras: [front] })
        );
        expect(frontView?.visible).toEqual(bare?.visible);
        expect(frontView?.broken).toEqual([]);
        // a post standing in front of the right half hides that half
        const post = Part.make({ name: "post", add: [box([0, -20, 0], [15, -10, 30])] });
        const [hidden] = yield* occt.project(
          ProjectionRequest.make({ solid: ModelSpec.make({ parts: [slab, post], overlays: [seat] }), cameras: [front] })
        );
        expect(totalLength(emphasisOf(hidden))).toBeCloseTo(10, 3);
        expect(A.every(emphasisOf(hidden), ([x1, , x2]) => Math.max(x1, x2) <= 0)).toBe(true);
      })
    );

    it.effect(
      "draws a broken overlay in the broken layer",
      Effect.fnUntraced(function* () {
        const occt = yield* Occt;
        const slab = Part.make({ name: "slab", add: [box([-20, 0, 0], [20, 10, 30])] });
        const corrugation = OverlayLine.make({
          name: "corrugation",
          style: "broken",
          points: [
            [-20, 0, 5],
            [20, 0, 5],
          ],
          facing: O.some([0, -1, 0]),
        });
        const [view] = yield* occt.project(
          ProjectionRequest.make({
            solid: ModelSpec.make({ parts: [slab], overlays: [corrugation] }),
            cameras: [front],
          })
        );
        expect(totalLength(view?.broken ?? [])).toBeCloseTo(40, 3);
        expect(view?.emphasis).toEqual([]);
        expect(totalLength(view?.visible ?? [])).toBeCloseTo(140, 3);
        // a corrugation wave of short segments comes back as pieces that meet end to end
        // (the sheet chains them into one dashed subpath): only the wave's two ends are
        // the end of a single piece
        const wave = OverlayLine.make({
          name: "wave",
          style: "broken",
          points: A.makeBy(17, (i) => [-20 + i * 2.5, 0, 15 + (i % 2)] as const),
          facing: O.some([0, -1, 0]),
        });
        const [waved] = yield* occt.project(
          ProjectionRequest.make({ solid: ModelSpec.make({ parts: [slab], overlays: [wave] }), cameras: [front] })
        );
        const pieces = waved?.broken ?? [];
        expect(A.length(pieces)).toBe(16);
        const ends = A.groupBy(
          A.flatMap(pieces, ([x1, y1, x2, y2]) => [`${x1} ${y1}`, `${x2} ${y2}`]),
          (key) => key
        );
        expect(A.length(A.filter(R.values(ends), (at) => A.length(at) === 1))).toBe(2);
      })
    );

    it.effect(
      "measures every part and counts true overlaps only",
      Effect.fnUntraced(function* () {
        const occt = yield* Occt;
        const summary = yield* occt.summarize(crate);
        // the broken tab still counts toward the extents and the volume
        expect(summary.boundingBox.min).toEqual([-40, -30, 0]);
        expect(summary.boundingBox.max).toEqual([40, 30, 46]);
        // walls 80·4·40 + 60·4·40 less the two 4·4·20 slots; lid 40·60·3 less its 10·4·3 slit; tab 10·4·6
        expect(summary.volume).toBe(12800 - 320 + 9600 - 320 + 7200 - 120 + 240);
        // zero-clearance contact faces are not overlaps
        expect(summary.partOverlaps).toBe(0);
        // without the halving slots the walls interpenetrate: one overlapping pair
        const unslotted = yield* occt.summarize(
          ModelSpec.make({
            parts: [Part.make({ ...longWall, subtract: [] }), Part.make({ ...crossWall, subtract: [] }), lid],
          })
        );
        expect(unslotted.partOverlaps).toBe(1);
        const legacy = yield* occt.summarize(fixture);
        expect(legacy.partOverlaps).toBe(0);
      })
    );

    it.effect(
      "reports a typed build failure when a part has zero width",
      Effect.fnUntraced(function* () {
        const occt = yield* Occt;
        const error = yield* Effect.flip(
          occt.summarize(
            ModelSpec.make({
              parts: [Part.make({ name: "degenerate", add: [box([0, 0, 0], [0, 10, 10])] })],
            })
          )
        );
        assertInstanceOf(error, OcctError);
        expect(error.reason).toBe("solid-build");
        expect(error.message).toBe("The kernel could not build the solid.");
        assertNone(error.cause);
      })
    );

    it.effect(
      "rejects a camera with a zero eye vector",
      Effect.fnUntraced(function* () {
        const occt = yield* Occt;
        const error = yield* Effect.flip(
          occt.project(
            ProjectionRequest.make({ solid: fixture, cameras: [Camera.make({ eye: [0, 0, 0], up: [0, 0, 1] })] })
          )
        );
        assertInstanceOf(error, OcctError);
        expect(error.reason).toBe("projection");
        expect(error.message).toBe("Camera vectors must be non-zero.");
        assertNone(error.cause);
      })
    );
  });
});
