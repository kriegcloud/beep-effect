/**
 * Vocabulary of the 37 CFR 1.84(m) surface-shading rules: what a geometry
 * engine knows about one planar face and one view, the classes and tones the
 * rules assign, and the treatment they decide for the face.
 *
 * **Details**
 *
 * The rules in `Shading.rules.ts` are pure functions of these facts, so the
 * shading policy is tested without a kernel and a geometry engine only builds
 * {@link FaceFacts} and applies the {@link FaceTreatment} it gets back.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $TechnicalDrawingId } from "@beep/identity/packages";
import { LiteralKit, SchemaUtils } from "@beep/schema";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { BoundingBox, ShadingSkipReason, Vec3 } from "./Geometry.schemas.ts";

const $I = $TechnicalDrawingId.create("Shading.schemas");

const SurfaceClassBase = LiteralKit(["level", "upright", "inclined"]);

/**
 * Orientation class of a planar face against the model's up axis (+Z).
 *
 * **Details**
 *
 * `level` faces lie flat (lids, floors), `upright` faces stand vertical
 * (walls), and `inclined` faces are everything between (flaps, ramps).
 *
 * **Example** (Read the classes)
 *
 * ```ts
 * import { SurfaceClass } from "@beep/technical-drawing/Shading.schemas"
 *
 * console.log(SurfaceClass.literals)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const SurfaceClass = SurfaceClassBase.pipe(
  $I.annoteSchema("SurfaceClass", {
    description: "Planar face orientation against model +Z: level, upright, or inclined.",
  }),
  SchemaUtils.withLiteralKitStatics(SurfaceClassBase)
);

/**
 * Type for {@link SurfaceClass}.
 *
 * **Example** (Annotate a class)
 *
 * ```ts
 * import type { SurfaceClass } from "@beep/technical-drawing/Shading.schemas"
 *
 * const wall: SurfaceClass = "upright"
 * console.log(wall)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type SurfaceClass = typeof SurfaceClass.Type;

const FaceAspectBase = LiteralKit(["square-on", "oblique", "sliver"]);

/**
 * How a planar face presents itself in one view.
 *
 * **Details**
 *
 * `square-on` faces look straight at the viewer, `oblique` faces are turned
 * away from the sight line, and `sliver` faces are narrower on the sheet than
 * the shading plan's minimum face span, so they are never hatched.
 *
 * **Example** (Read the aspects)
 *
 * ```ts
 * import { FaceAspect } from "@beep/technical-drawing/Shading.schemas"
 *
 * console.log(FaceAspect.literals)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const FaceAspect = FaceAspectBase.pipe(
  $I.annoteSchema("FaceAspect", {
    description: "Square-on, oblique, or sliver presentation of a planar face in one view.",
  }),
  SchemaUtils.withLiteralKitStatics(FaceAspectBase)
);

/**
 * Type for {@link FaceAspect}.
 *
 * **Example** (Annotate an aspect)
 *
 * ```ts
 * import type { FaceAspect } from "@beep/technical-drawing/Shading.schemas"
 *
 * const aspect: FaceAspect = "square-on"
 * console.log(aspect)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FaceAspect = typeof FaceAspect.Type;

const ShadingToneBase = LiteralKit(["faint", "light", "medium", "dark"]);

/**
 * Banded exposure of a face to the 1.84(m) light, from most lit to darkest.
 *
 * **Details**
 *
 * Graded shading gives every visible planar face a tone, so even a lit face
 * gets a few lines along its shadow edge. The tone sets how far across the
 * face the lines reach and how many there are.
 *
 * **Example** (Read the tones)
 *
 * ```ts
 * import { ShadingTone } from "@beep/technical-drawing/Shading.schemas"
 *
 * console.log(ShadingTone.literals)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const ShadingTone = ShadingToneBase.pipe(
  $I.annoteSchema("ShadingTone", {
    description: "Exposure band of a face under graded shading: faint, light, medium, or dark.",
  }),
  SchemaUtils.withLiteralKitStatics(ShadingToneBase)
);

/**
 * Type for {@link ShadingTone}.
 *
 * **Example** (Annotate a tone)
 *
 * ```ts
 * import type { ShadingTone } from "@beep/technical-drawing/Shading.schemas"
 *
 * const tone: ShadingTone = "dark"
 * console.log(tone)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type ShadingTone = typeof ShadingTone.Type;

/**
 * One straight boundary edge of a planar face, in model units.
 *
 * **Example** (A 40-long bottom edge)
 *
 * ```ts
 * import { FaceEdge } from "@beep/technical-drawing/Shading.schemas"
 *
 * console.log(FaceEdge.make({ start: [0, 0, 0], end: [40, 0, 0], length: 40 }).length)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FaceEdge extends S.Class<FaceEdge>($I`FaceEdge`)(
  {
    start: Vec3.annotateKey({ description: "Start point of the edge." }),
    end: Vec3.annotateKey({ description: "End point of the edge." }),
    length: S.Finite.annotateKey({ description: "Edge length as the kernel measured it." }),
  },
  $I.annote("FaceEdge", {
    description: "A straight boundary edge of a planar face: end points and measured length.",
  })
) {}

/**
 * What a geometry engine knows about one planar face, in model units.
 *
 * **Details**
 *
 * `edges` are the face's straight boundary edges in the kernel's order (outer
 * and inner wires); `outline` samples every boundary edge, curved ones
 * included, so the rules can measure the face's extent; `bounds` is the
 * kernel's own bounding box, which the uniform style measures its reach with.
 *
 * **Example** (A 40 × 20 face looking down -Y)
 *
 * ```ts
 * import { BoundingBox } from "@beep/technical-drawing"
 * import { FaceEdge, FaceFacts } from "@beep/technical-drawing/Shading.schemas"
 *
 * const face = FaceFacts.make({
 *   normal: [0, -1, 0],
 *   center: [0, 0, 10],
 *   edges: [FaceEdge.make({ start: [-20, 0, 0], end: [20, 0, 0], length: 40 })],
 *   outline: [[-20, 0, 0], [20, 0, 0], [20, 0, 20], [-20, 0, 20]],
 *   bounds: BoundingBox.make({ min: [-20, 0, 0], max: [20, 0, 20] })
 * })
 * console.log(face.normal)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FaceFacts extends S.Class<FaceFacts>($I`FaceFacts`)(
  {
    normal: Vec3.annotateKey({ description: "Outward unit normal of the face." }),
    center: Vec3.annotateKey({ description: "Centre of mass of the face." }),
    edges: S.Array(FaceEdge).annotateKey({ description: "Straight boundary edges, in the kernel's order." }),
    outline: S.Array(Vec3).annotateKey({ description: "Sample points on every boundary edge." }),
    bounds: BoundingBox.annotateKey({ description: "Kernel bounding box of the face." }),
  },
  $I.annote("FaceFacts", {
    description: "Normal, centre, straight edges, outline samples, and bounds of one planar face.",
  })
) {}

/**
 * Sheet frame of one view and its 1.84(m) light, in model coordinates.
 *
 * **Details**
 *
 * `eye` points toward the viewer, `right` and `up` span the sheet, and
 * `light` comes from the sheet's upper left, toward the viewer, at 45°.
 *
 * **Example** (The front elevation)
 *
 * ```ts
 * import { ViewFacts } from "@beep/technical-drawing/Shading.schemas"
 *
 * const k = 1 / Math.sqrt(3)
 * const view = ViewFacts.make({ eye: [0, -1, 0], right: [1, 0, 0], up: [0, 0, 1], light: [-k, -k, k] })
 * console.log(view.light)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ViewFacts extends S.Class<ViewFacts>($I`ViewFacts`)(
  {
    eye: Vec3.annotateKey({ description: "Unit direction from the target toward the viewer." }),
    right: Vec3.annotateKey({ description: "Unit sheet-right direction." }),
    up: Vec3.annotateKey({ description: "Unit sheet-up direction." }),
    light: Vec3.annotateKey({ description: "Unit direction toward the 1.84(m) light." }),
  },
  $I.annote("ViewFacts", {
    description: "Sheet frame (eye, right, up) and 1.84(m) light of one view in model coordinates.",
  })
) {}

/**
 * Where graded lines start on a face: the shadow-side extreme and the step
 * direction pointing from it into the face.
 *
 * **Example** (An anchor on the right edge of a front face)
 *
 * ```ts
 * import { FaceAnchor } from "@beep/technical-drawing/Shading.schemas"
 * import * as O from "effect/Option"
 *
 * console.log(FaceAnchor.make({ point: [20, 0, 0], step: [-1, 0, 0], edge: O.none() }).step)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FaceAnchor extends S.Class<FaceAnchor>($I`FaceAnchor`)(
  {
    point: Vec3.annotateKey({ description: "Outline point farthest toward the shadow side." }),
    step: Vec3.annotateKey({ description: "Unit in-plane direction from the anchor into the face." }),
    edge: S.OptionFromOptionalKey(FaceEdge).pipe(
      S.withConstructorDefault(Effect.succeedNone),
      S.annotateKey({
        description: "The straight edge along the hatch direction that lies on the shadow side, when the face has one.",
      })
    ),
  },
  $I.annote("FaceAnchor", {
    description: "Shadow-side anchor point, inward step, and anchor edge of graded shading on one face.",
  })
) {}

const StrokeExtent = S.Finite.check(
  S.isGreaterThan(0, {
    identifier: $I`StrokeExtentMinCheck`,
    title: "Stroke Extent Minimum",
    description: "A stroke must have some length.",
    message: "Expected a stroke extent above 0",
  }),
  S.isLessThanOrEqualTo(1, {
    identifier: $I`StrokeExtentMaxCheck`,
    title: "Stroke Extent Maximum",
    description: "A stroke cannot outrun the chord it is cut from.",
    message: "Expected a stroke extent of at most 1",
  })
);

/**
 * One shading line on a face: the section plane's position along the step
 * and the centred fraction of the resulting chord that is drawn.
 *
 * **Details**
 *
 * Graded shading tapers (1993 Guide, Appendix 4, Examples 32 and 34): the
 * first strokes run the face's full length and later ones shorten toward the
 * light, so `extent` is 1 for a full chord and less for a short stroke
 * centred on it. Uniform shading always draws full chords.
 *
 * **Example** (A full-length line two units in)
 *
 * ```ts
 * import { ShadingCut } from "@beep/technical-drawing/Shading.schemas"
 *
 * console.log(ShadingCut.make({ offset: 2 }).extent) // 1
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ShadingCut extends S.Class<ShadingCut>($I`ShadingCut`)(
  {
    offset: S.Finite.annotateKey({ description: "Plane position along `step`, in model units." }),
    extent: StrokeExtent.pipe(
      S.withConstructorDefault(Effect.succeed(1)),
      S.withDecodingDefaultTypeKey(Effect.succeed(1)),
      S.annotateKey({ description: "Fraction of the chord drawn, centred on it. Defaults to 1 (the full chord)." })
    ),
  },
  $I.annote("ShadingCut", {
    description: "A section plane's offset along the step and the drawn fraction of its chord.",
  })
) {}

/**
 * Parallel shading lines on one face: section planes through
 * `origin + step × offset`, each with normal `step`, drawn over `extent` of
 * the chord they cut. Graded lines list spare positions after the ones they
 * mean to draw, and `keep` says how many visible cuts to draw, so a face whose
 * shadow edge is hidden behind another part still shows its strokes further
 * in.
 *
 * **Example** (Two lines, the second a short stroke)
 *
 * ```ts
 * import { ShadingCut, ShadingLines } from "@beep/technical-drawing/Shading.schemas"
 *
 * const cuts = [ShadingCut.make({ offset: 1 }), ShadingCut.make({ offset: 2.3, extent: 0.6 })]
 * console.log(ShadingLines.make({ origin: [20, 0, 0], step: [-1, 0, 0], cuts }).kind)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ShadingLines extends S.Class<ShadingLines>($I`ShadingLines`)(
  {
    kind: S.tag("lines").annotateKey({ description: "Treatment discriminator." }),
    origin: Vec3.annotateKey({ description: "Point the offsets are measured from." }),
    step: Vec3.annotateKey({ description: "Unit in-plane direction across the lines; also each plane's normal." }),
    cuts: S.Array(ShadingCut).annotateKey({
      description: "Section planes along `step`, each with the fraction of its chord that is drawn.",
    }),
    keep: S.OptionFromOptionalKey(S.Int.check(S.isGreaterThanOrEqualTo(0))).pipe(
      S.withConstructorDefault(Effect.succeedNone),
      S.annotateKey({
        description:
          "How many of the cuts, in order, are drawn once hidden-line removal has shown which are visible; the rest are spare positions deeper in the face. None draws every cut.",
      })
    ),
  },
  $I.annote("ShadingLines", {
    description:
      "Section planes, as origin, step, and cuts, that cut one face into shading lines drawn over a centred fraction of each chord; `keep` caps how many visible cuts are drawn.",
  })
) {}

const CutIndex = S.Int.check(S.isGreaterThanOrEqualTo(0));

/**
 * One planned cut of one face, for the hidden-line pass to find again: the
 * face's index in its shape, the cut's rank among that face's cuts, how many
 * visible cuts the face draws per run, and the extent of its strokes in model
 * space (two faces whose cut lines coincide on the view plane are told apart
 * by where along the line their strokes lie).
 *
 * **Example** (The first cut of face 2)
 *
 * ```ts
 * import { HatchCut } from "@beep/technical-drawing/Shading.schemas"
 *
 * console.log(HatchCut.make({ face: 2, rank: 0, keep: 5, from: [19, -15, 0], to: [19, -15, 20] }).keep)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class HatchCut extends S.Class<HatchCut>($I`HatchCut`)(
  {
    face: CutIndex.annotateKey({ description: "Index of the face in its shape." }),
    rank: CutIndex.annotateKey({ description: "Position of the cut among its face's cuts, from the shadow edge." }),
    keep: CutIndex.annotateKey({ description: "How many visible cuts of each run the face draws." }),
    from: Vec3.annotateKey({ description: "One end of the cut's strokes, in model space." }),
    to: Vec3.annotateKey({
      description: "The other end of the cut's strokes, in model space; the cut line runs through both.",
    }),
  },
  $I.annote("HatchCut", {
    description: "A planned shading cut of one face, as the hidden-line pass needs to find it again.",
  })
) {}

/**
 * A face the rules leave unshaded, with the reason.
 *
 * **Example** (A sliver)
 *
 * ```ts
 * import { ShadingSkipped } from "@beep/technical-drawing/Shading.schemas"
 *
 * console.log(ShadingSkipped.make({ reason: "sliver" }).reason)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ShadingSkipped extends S.Class<ShadingSkipped>($I`ShadingSkipped`)(
  {
    kind: S.tag("skipped").annotateKey({ description: "Treatment discriminator." }),
    reason: ShadingSkipReason.annotateKey({ description: "Why the face gets no lines." }),
  },
  $I.annote("ShadingSkipped", {
    description: "A face left unshaded, with the reason.",
  })
) {}

/**
 * Shading decided for one face: lines or a skip, discriminated on `kind`.
 *
 * **Example** (Branch on a treatment)
 *
 * ```ts
 * import { FaceTreatment, ShadingSkipped } from "@beep/technical-drawing/Shading.schemas"
 *
 * const treatment: FaceTreatment = ShadingSkipped.make({ reason: "back-facing" })
 * console.log(FaceTreatment.guards.skipped(treatment))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const FaceTreatment = S.Union([ShadingLines, ShadingSkipped]).pipe(
  S.toTaggedUnion("kind"),
  $I.annoteSchema("FaceTreatment", {
    description: "Shading lines or a skip with its reason, discriminated on `kind`.",
  })
);

/**
 * Type for {@link FaceTreatment}.
 *
 * **Example** (Annotate a treatment)
 *
 * ```ts
 * import { ShadingSkipped } from "@beep/technical-drawing/Shading.schemas"
 * import type { FaceTreatment } from "@beep/technical-drawing/Shading.schemas"
 *
 * const t: FaceTreatment = ShadingSkipped.make({ reason: "curved" })
 * console.log(t.kind)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FaceTreatment = typeof FaceTreatment.Type;
