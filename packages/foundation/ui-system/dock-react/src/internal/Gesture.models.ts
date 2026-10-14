import { AnchoredBox, DockBox, GroupId, PanelId, SplitId, SplitRatio } from "@beep/dock";
import { $DockReactId } from "@beep/identity";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

const $I = $DockReactId.create("Gesture.models");

export class PointerPosition extends S.Opaque<PointerPosition, { readonly brand: unique symbol }>()(
  S.Struct({
    left: S.Finite,
    top: S.Finite,
  }).pipe(
    $I.annoteSchema("PointerPosition", {
      description: "Finite client-space coordinates captured from a pointer event.",
    })
  )
) {}

export class TabDrag extends S.Opaque<TabDrag, { readonly brand: unique symbol }>()(
  S.Struct({
    panelId: PanelId,
    fromGroupId: GroupId,
    pointer: PointerPosition,
    origin: PointerPosition,
    moved: S.Boolean,
    concluded: S.Boolean,
    pointerId: S.Int,
  }).pipe(
    $I.annoteSchema("TabDrag", {
      description:
        "Active tab-drag state: source group, latest and initial pointer positions, whether the pointer has traveled past the drag-promotion threshold, and whether the gesture has concluded (Escape-cancel or commit). A concluded promoted drag stays recorded until its release's trailing click is swallowed — or until the next press — so the click can neither activate the dragged tab nor re-point focus at the source group.",
    })
  )
) {}

export class SashDragBase extends S.Class<SashDragBase, { readonly brand: unique symbol }>($I`SashDragBase`)(
  {
    splitId: SplitId,
    start: PointerPosition,
    initialRatio: SplitRatio,
    extent: S.Finite,
    moved: S.Boolean,
    pointerId: S.Int,
  },
  $I.annote("SashDragBase", {
    description:
      "Shared state captured while resizing a split sash, including the captured pointer identity so cancellation can release the real capture (synthetic pointercancel events carry a default pointerId, not the captured one).",
  })
) {}

export class SashDragHorizontal extends SashDragBase.extend<SashDragHorizontal>($I`SashDragHorizontal`)(
  {
    axis: S.tag("horizontal"),
  },
  $I.annote("SashDragHorizontal", {
    description: "Sash-resize gesture whose pointer delta is measured horizontally.",
  })
) {}

export class SashDragVertical extends SashDragBase.extend<SashDragVertical>($I`SashDragVertical`)(
  {
    axis: S.tag("vertical"),
  },
  $I.annote("SashDragVertical", {
    description: "Sash-resize gesture whose pointer delta is measured vertically.",
  })
) {}

export class TabRect extends S.Opaque<TabRect, { readonly brand: unique symbol }>()(
  S.Struct({
    left: S.Finite,
    width: S.Finite,
  }).pipe(
    $I.annoteSchema("TabRect", {
      description:
        "Root-relative horizontal geometry of one rendered tab, measured from the DOM. Drop targeting uses these instead of group-box arithmetic: the strip's padding and gaps are invisible to the box, and overflowed tabs have no rect at all.",
    })
  )
) {}

export class TabInsertionPreview extends S.Opaque<TabInsertionPreview, { readonly brand: unique symbol }>()(
  S.Struct({
    kind: S.tag("tab-insertion"),
    groupId: GroupId,
    index: S.OptionFromOptionalKey(S.Natural).pipe(S.withConstructorDefault(Effect.succeedNone)),
    caretBox: DockBox,
  }).pipe(
    $I.annoteSchema("TabInsertionPreview", {
      description:
        "Strip-borne drop preview: the dragged tab joins this group's tab list at the caret position, none meaning append. Rendered inside the tab strip so joining a list reads differently from creating a section.",
    })
  )
) {}

export class SectionPreview extends S.Opaque<SectionPreview, { readonly brand: unique symbol }>()(
  S.Struct({
    kind: S.tag("section"),
    box: DockBox,
  }).pipe(
    $I.annoteSchema("SectionPreview", {
      description: "Layout-overlay drop preview: the drop creates a new panel section occupying this box.",
    })
  )
) {}

export const DropPreview = S.Union([TabInsertionPreview, SectionPreview]).pipe(
  S.toTaggedUnion("kind"),
  $I.annoteSchema("DropPreview", {
    description:
      "Kind-discriminated drop preview: tab-list insertion renders in the strip; section creation renders as a layout overlay.",
  })
);
export type DropPreview = typeof DropPreview.Type;

export const SashDrag = S.Union([SashDragHorizontal, SashDragVertical]).pipe(
  S.toTaggedUnion("axis"),
  $I.annoteSchema("SashDrag", {
    description: "Axis-discriminated state for an in-progress split-sash resize gesture.",
  })
);
export type SashDrag = typeof SashDrag.Type;

export class RatioOverride extends S.Opaque<RatioOverride, { readonly brand: unique symbol }>()(
  S.Struct({
    splitId: SplitId,
    ratio: SplitRatio,
  }).pipe(
    $I.annoteSchema("RatioOverride", {
      description: "Transient split-ratio preview applied while a sash is moving.",
    })
  )
) {}

export class FloatingGestureBase extends S.Class<FloatingGestureBase, { readonly brand: unique symbol }>(
  $I`FloatingGestureBase`
)(
  {
    groupId: GroupId,
    start: PointerPosition,
    initial: AnchoredBox,
    initialBox: DockBox,
    moved: S.Boolean,
  },
  $I.annote("FloatingGestureBase", {
    description: "Shared pointer and geometry state for moving or resizing a floating group.",
  })
) {}

export class FloatingGestureMove extends FloatingGestureBase.extend<FloatingGestureMove>($I`FloatingGestureMove`)(
  {
    mode: S.tag("move"),
  },
  $I.annote("FloatingGestureMove", {
    description: "Gesture state for translating a floating group.",
  })
) {}

export class FloatingGestureResize extends FloatingGestureBase.extend<FloatingGestureResize>($I`FloatingGestureResize`)(
  {
    mode: S.tag("resize"),
  },
  $I.annote("FloatingGestureResize", {
    description: "Gesture state for resizing a floating group.",
  })
) {}

export const FloatingGesture = S.Union([FloatingGestureMove, FloatingGestureResize]).pipe(
  S.toTaggedUnion("mode"),
  $I.annoteSchema("FloatingGesture", {
    description: "Mode-discriminated gesture state for a floating dock group.",
  })
);

export type FloatingGesture = typeof FloatingGesture.Type;

export class FloatingOverride extends S.Opaque<FloatingOverride, { readonly brand: unique symbol }>()(
  S.Struct({
    groupId: GroupId,
    anchoredBox: AnchoredBox,
  }).pipe(
    $I.annoteSchema("FloatingOverride", {
      description: "Transient anchored-box preview for a floating dock group.",
    })
  )
) {}
