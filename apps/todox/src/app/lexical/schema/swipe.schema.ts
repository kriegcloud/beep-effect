/**
 * Swipe gesture schemas for touch interactions.
 *
 * @since 0.1.0
 */
import { $TodoxId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $TodoxId.create("lexical/schema/swipe");

/**
 * Force vector representing touch movement.
 * Tuple of [deltaX, deltaY] in pixels.
 *
 * @since 0.1.0
 */
export const Force = S.Tuple(S.Number, S.Number).annotations(
  $I.annotations("Force", {
    description: "Force vector [deltaX, deltaY] representing touch movement in pixels",
  })
);

export declare namespace Force {
  export type Type = typeof Force.Type;
}

/**
 * Touch coordinates from a touch event.
 * Tuple of [clientX, clientY] in pixels.
 *
 * @since 0.1.0
 */
export const TouchCoordinates = S.Tuple(S.Number, S.Number).annotations(
  $I.annotations("TouchCoordinates", {
    description: "Touch coordinates [clientX, clientY] in pixels",
  })
);

export declare namespace TouchCoordinates {
  export type Type = typeof TouchCoordinates.Type;
}

/**
 * Swipe direction enumeration.
 *
 * @since 0.1.0
 */
export const SwipeDirection = S.Literal("left", "right", "up", "down").annotations(
  $I.annotations("SwipeDirection", {
    description: "Direction of a swipe gesture",
  })
);

export declare namespace SwipeDirection {
  export type Type = typeof SwipeDirection.Type;
}

/**
 * Swipe detection thresholds.
 *
 * @since 0.1.0
 */
export class SwipeThreshold extends S.Class<SwipeThreshold>($I`SwipeThreshold`)(
  {
    /**
     * Minimum horizontal movement to trigger a swipe (in pixels)
     */
    xThreshold: S.Number.annotations({
      description: "Minimum horizontal movement threshold in pixels",
    }),
    /**
     * Minimum vertical movement to trigger a swipe (in pixels)
     */
    yThreshold: S.Number.annotations({
      description: "Minimum vertical movement threshold in pixels",
    }),
  },
  $I.annotations("SwipeThreshold", {
    description: "Thresholds for swipe gesture detection",
  })
) {}

/**
 * Swipe event data.
 *
 * @since 0.1.0
 */
export class SwipeEvent extends S.Class<SwipeEvent>($I`SwipeEvent`)(
  {
    /**
     * The detected swipe direction
     */
    direction: SwipeDirection,
    /**
     * The force magnitude in the primary direction
     */
    force: S.Number.annotations({
      description: "Force magnitude in pixels",
    }),
    /**
     * The full force vector [deltaX, deltaY]
     */
    forceVector: Force,
  },
  $I.annotations("SwipeEvent", {
    description: "Data from a detected swipe gesture",
  })
) {}
