import { BS } from "@beep/schema";
import * as F from "effect/Function";
import * as O from "effect/Option";



export class HorizontalDirection extends BS.StringLiteralKit("right", "left").annotations({
  schemaId: Symbol.for("@beep/ui-core/utils/swipeUtils/HorizontalDirection"),
  title: "Horizontal Direction",
  identifier: "HorizontalDirection",
  description: "Horizontal direction of the swipe",
}) {}

export declare namespace HorizontalDirection {
  export type Type = typeof HorizontalDirection.Type;
  export type Encoded = typeof HorizontalDirection.Encoded;
}

export class VerticalDirection extends BS.StringLiteralKit("up", "down").annotations({
  schemaId: Symbol.for("@beep/ui-core/utils/swipeUtils/VerticalDirection"),
  title: "Vertical Direction",
  identifier: "VerticalDirection",
  description: "Vertical direction of the swipe",
}) {}

export declare namespace VerticalDirection {
  export type Type = typeof VerticalDirection.Type;
  export type Encoded = typeof VerticalDirection.Encoded;
}



export class SwipeDirection extends BS.StringLiteralKit(
  ...HorizontalDirection.Options,
  ...VerticalDirection.Options
).annotations({
  schemaId: Symbol.for("@beep/ui-core/utils/swipeUtils/SwipeDirection"),
  title: "Swipe Direction",
  identifier: "SwipeDirection",
  description: "Direction of the swipe",
}) {

}

export declare namespace SwipeDirection {
  export type Type = typeof SwipeDirection.Type;
  export type Encoded = typeof SwipeDirection.Encoded;
}

/**
 * Takes a mouse or a touch events and returns clientX and clientY values
 * @param event
 * @return {[undefined, undefined]}
 */
// : [number, number]
export const getPointerCoordinates = (event: TouchEvent | MouseEvent): [number, number] => {
  if ((event as TouchEvent).touches) {
    const { clientX, clientY } = F.pipe(
      (event as TouchEvent).touches[0],
      O.fromNullable,
      O.match({
        onNone: () => {
          throw new Error("[getPointerCoordinates]: No touch found");
        },
        onSome: (touch) => touch,
      })
    );
    return [clientX, clientY];
  }

  const { clientX, clientY } = event as MouseEvent;

  return [clientX, clientY];
};

export const getHorizontalDirection = (alpha: number) =>
  alpha < 0 ? SwipeDirection.Enum.right : SwipeDirection.Enum.left;

export const getVerticalDirection = (alpha: number) => (alpha < 0 ? SwipeDirection.Enum.down : SwipeDirection.Enum.up);

type GetDirectionParams = {
  readonly currentPoint: [number, number];
  readonly startingPoint: [number, number];
  readonly alpha: [number, number];
};

export const getDirection = ({ currentPoint, startingPoint, alpha }: GetDirectionParams) => {
  const alphaX = startingPoint[0] - currentPoint[0];
  const alphaY = startingPoint[1] - currentPoint[1];
  if (Math.abs(alphaX) > Math.abs(alphaY)) {
    return getHorizontalDirection(alpha[0]);
  }

  return getVerticalDirection(alpha[1]);
};
