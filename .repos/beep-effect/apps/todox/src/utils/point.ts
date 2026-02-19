import { $TodoxId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $TodoxId.create("utils/point");

export class Point extends S.Class<Point>($I`Point`)({
  _x: S.Number,
  _y: S.Number,
}) {
  get x() {
    return this._x;
  }

  get y() {
    return this._y;
  }

  public readonly equivalence = S.equivalence(Point);

  public readonly equals = (point: Point): boolean => {
    return this.equivalence(this, point);
  };
  public calcDeltaXTo = ({ x }: Point) => {
    return this.x - x;
  };
  public readonly calcDeltaYTo = ({ y }: Point) => {
    return this.y - y;
  };
  public readonly calcHorizontalDistanceTo = (point: Point) => {
    return Math.abs(this.calcDeltaXTo(point));
  };
  public readonly calcVerticalDistance = (point: Point) => {
    return Math.abs(this.calcDeltaYTo(point));
  };

  public readonly calcDistanceTo = (point: Point) => {
    return Math.sqrt(this.calcDeltaXTo(point) ** 2 + this.calcDeltaYTo(point) ** 2);
  };
  static readonly is = S.is(Point);
}
