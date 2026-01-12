import { $UiId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as MutableHashMap from "effect/MutableHashMap";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { HorzOrientation, IOrientation, Orientation, VertOrientation } from "./Orientation";
import { Rect } from "./Rect";

const $I = $UiId.create("flexlayout-react/Rect");

export class DockLocationType extends BS.StringLiteralKit("top", "bottom", "left", "right", "center").annotations(
  $I.annotations("DockLocationType", {
    description:
      "A DockLocationType is a string literal that can be one of the following: 'top', 'bottom', 'left', 'right', 'center'",
  })
) {}

export declare namespace DockLocationType {
  export type Type = typeof DockLocationType.Type;
}

export const dockLocationVariant = DockLocationType.toTagged("type").composer({
  name: S.String,
  indexPlus: S.Number,
});

export class TopDockLocation extends S.Class<TopDockLocation>($I`TopDockLocation`)(
  dockLocationVariant.top({}),
  $I.annotations("TopDockLocation", {
    description: "A TopDockLocation is a DockLocation that is docked to the top of the parent container",
  })
) {}

export class BottomDockLocation extends S.Class<TopDockLocation>($I`BottomDockLocation`)(
  dockLocationVariant.bottom({}),
  $I.annotations("BottomDockLocation", {
    description: "A BottomDockLocation is a DockLocation that is docked to the top of the parent container",
  })
) {}

export class LeftDockLocation extends S.Class<LeftDockLocation>($I`LeftDockLocation`)(
  dockLocationVariant.left({}),
  $I.annotations("LeftDockLocation", {
    description: "A LeftDockLocation is a DockLocation that is docked to the top of the parent container",
  })
) {}

export class RightDockLocation extends S.Class<RightDockLocation>($I`RightDockLocation`)(
  dockLocationVariant.right({}),
  $I.annotations("RightDockLocation", {
    description: "A TopDockLocation is a RightDockLocation that is docked to the top of the parent container",
  })
) {}

export class CenterDockLocation extends S.Class<CenterDockLocation>($I`CenterDockLocation`)(
  dockLocationVariant.center({}),
  $I.annotations("CenterDockLocation", {
    description: "A CenterDockLocation is a DockLocation that is docked to the top of the parent container",
  })
) {}

export class AnyDockLocation extends S.Union(
  TopDockLocation,
  BottomDockLocation,
  LeftDockLocation,
  RightDockLocation,
  CenterDockLocation
).annotations(
  $I.annotations("AnyDockLocation", {
    description: "An AnyDockLocation is a union of all possible DockLocation types",
  })
) {}

export declare namespace AnyDockLocation {
  export type Type = typeof AnyDockLocation.Type;
  export type Encoded = typeof AnyDockLocation.Encoded;
}

export class DockLocationValues extends BS.MutableHashMap({
  key: S.String,
  value: AnyDockLocation,
}).annotations(
  $I.annotations("DockLocationValues", {
    description: "A DockLocationValues is a HashMap of DockLocation types",
  })
) {}

export declare namespace DockLocationValues {
  export type Type = typeof DockLocationValues.Type;
  export type Encoded = typeof DockLocationValues.Encoded;
}

export class DockLocationData extends S.Struct({
  values: DockLocationValues,
  name: S.String,
  orientation: IOrientation,
  indexPlus: S.Number,
})
  .pipe(S.mutable)
  .annotations(
    $I.annotations("DockLocationData", {
      description: "A DockLocationData is a mutable struct of DockLocationValues",
    })
  ) {}

export declare namespace DockLocationData {
  export type Type = typeof DockLocationData.Type;
  export type Encoded = typeof DockLocationData.Encoded;
}

export class IDockLocation extends S.Class<IDockLocation>($I`IDockLocation`)({
  data: DockLocationData,
}) {
  private static _values: O.Option<Map<string, IDockLocation>> = O.none();
  private static _TOP: O.Option<IDockLocation> = O.none();
  private static _BOTTOM: O.Option<IDockLocation> = O.none();
  private static _LEFT: O.Option<IDockLocation> = O.none();
  private static _RIGHT: O.Option<IDockLocation> = O.none();
  private static _CENTER: O.Option<IDockLocation> = O.none();

  static readonly new = (name: string, orientation: IOrientation, indexPlus: number) => {
    const instance = new IDockLocation({
      data: {
        values: MutableHashMap.empty<string, AnyDockLocation.Type>(),
        name,
        orientation,
        indexPlus,
      },
    });
    IDockLocation.values.set(name, instance);
    return instance;
  };

  static get values(): Map<string, IDockLocation> {
    return IDockLocation._values.pipe(
      O.getOrElse(() => {
        const map = new Map<string, IDockLocation>();
        IDockLocation._values = O.some(map);
        return map;
      })
    );
  }

  static get TOP(): IDockLocation {
    return IDockLocation._TOP.pipe(
      O.getOrElse(() => {
        const instance = IDockLocation.new("top", new IOrientation({ data: new VertOrientation({}) }), 0);
        IDockLocation._TOP = O.some(instance);
        return instance;
      })
    );
  }

  static get BOTTOM(): IDockLocation {
    return IDockLocation._BOTTOM.pipe(
      O.getOrElse(() => {
        const instance = IDockLocation.new("bottom", new IOrientation({ data: new VertOrientation({}) }), 1);
        IDockLocation._BOTTOM = O.some(instance);
        return instance;
      })
    );
  }

  static get LEFT(): IDockLocation {
    return IDockLocation._LEFT.pipe(
      O.getOrElse(() => {
        const instance = IDockLocation.new("left", new IOrientation({ data: new HorzOrientation({}) }), 0);
        IDockLocation._LEFT = O.some(instance);
        return instance;
      })
    );
  }

  static get RIGHT(): IDockLocation {
    return IDockLocation._RIGHT.pipe(
      O.getOrElse(() => {
        const instance = IDockLocation.new("right", new IOrientation({ data: new HorzOrientation({}) }), 1);
        IDockLocation._RIGHT = O.some(instance);
        return instance;
      })
    );
  }

  static get CENTER(): IDockLocation {
    return IDockLocation._CENTER.pipe(
      O.getOrElse(() => {
        const instance = IDockLocation.new("center", new IOrientation({ data: new VertOrientation({}) }), 0);
        IDockLocation._CENTER = O.some(instance);
        return instance;
      })
    );
  }

  /** @internal */
  static readonly getByName = (name: string): IDockLocation => {
    const location = IDockLocation.values.get(name);
    if (location === undefined) {
      throw new Error(`Unknown DockLocation: ${name}`);
    }
    return location;
  };

  /** @internal */
  static readonly getLocation = (rect: Rect, x: number, y: number): IDockLocation => {
    const normalizedX = (x - rect.x) / rect.width;
    const normalizedY = (y - rect.y) / rect.height;

    if (normalizedX >= 0.25 && normalizedX < 0.75 && normalizedY >= 0.25 && normalizedY < 0.75) {
      return IDockLocation.CENTER;
    }

    // Whether or not the point is in the bottom-left half of the rect
    const bl = normalizedY >= normalizedX;
    // Whether or not the point is in the bottom-right half of the rect
    const br = normalizedY >= 1 - normalizedX;

    if (bl) {
      return br ? IDockLocation.BOTTOM : IDockLocation.LEFT;
    }
    return br ? IDockLocation.RIGHT : IDockLocation.TOP;
  };

  readonly getName = (): string => {
    return this.data.name;
  };

  readonly getOrientation = (): IOrientation => {
    return this.data.orientation;
  };

  /** @internal */
  readonly getDockRect = (r: Rect): Rect => {
    const name = this.data.name;
    if (name === "top") {
      return new Rect(r.x, r.y, r.width, r.height / 2);
    }
    if (name === "bottom") {
      return new Rect(r.x, r.getBottom() - r.height / 2, r.width, r.height / 2);
    }
    if (name === "left") {
      return new Rect(r.x, r.y, r.width / 2, r.height);
    }
    if (name === "right") {
      return new Rect(r.getRight() - r.width / 2, r.y, r.width / 2, r.height);
    }
    return r.clone();
  };

  /** @internal */
  readonly split = (rect: Rect, size: number): { start: Rect; end: Rect } => {
    const name = this.data.name;
    if (name === "top") {
      const r1 = new Rect(rect.x, rect.y, rect.width, size);
      const r2 = new Rect(rect.x, rect.y + size, rect.width, rect.height - size);
      return { start: r1, end: r2 };
    }
    if (name === "left") {
      const r1 = new Rect(rect.x, rect.y, size, rect.height);
      const r2 = new Rect(rect.x + size, rect.y, rect.width - size, rect.height);
      return { start: r1, end: r2 };
    }
    if (name === "right") {
      const r1 = new Rect(rect.getRight() - size, rect.y, size, rect.height);
      const r2 = new Rect(rect.x, rect.y, rect.width - size, rect.height);
      return { start: r1, end: r2 };
    }
    // if (name === "bottom") {
    const r1 = new Rect(rect.x, rect.getBottom() - size, rect.width, size);
    const r2 = new Rect(rect.x, rect.y, rect.width, rect.height - size);
    return { start: r1, end: r2 };
  };

  /** @internal */
  readonly reflect = (): IDockLocation => {
    const name = this.data.name;
    if (name === "top") {
      return IDockLocation.BOTTOM;
    }
    if (name === "left") {
      return IDockLocation.RIGHT;
    }
    if (name === "right") {
      return IDockLocation.LEFT;
    }
    // if (name === "bottom") {
    return IDockLocation.TOP;
  };

  override readonly toString = () => {
    return `(DockLocation: name=${this.data.name}, orientation=${this.data.orientation.toString()})`;
  };
}

export class DockLocation {
  static values = new Map<string, DockLocation>();
  static TOP = new DockLocation("top", Orientation.VERT, 0);
  static BOTTOM = new DockLocation("bottom", Orientation.VERT, 1);
  static LEFT = new DockLocation("left", Orientation.HORZ, 0);
  static RIGHT = new DockLocation("right", Orientation.HORZ, 1);
  static CENTER = new DockLocation("center", Orientation.VERT, 0);

  /** @internal */
  static getByName(name: string): DockLocation {
    return DockLocation.values.get(name)!;
  }

  /** @internal */
  static getLocation(rect: Rect, x: number, y: number) {
    x = (x - rect.x) / rect.width;
    y = (y - rect.y) / rect.height;

    if (x >= 0.25 && x < 0.75 && y >= 0.25 && y < 0.75) {
      return DockLocation.CENTER;
    }

    // Whether or not the point is in the bottom-left half of the rect
    // +-----+
    // |\    |
    // |x\   |
    // |xx\  |
    // |xxx\ |
    // |xxxx\|
    // +-----+
    const bl = y >= x;

    // Whether or not the point is in the bottom-right half of the rect
    // +-----+
    // |    /|
    // |   /x|
    // |  /xx|
    // | /xxx|
    // |/xxxx|
    // +-----+
    const br = y >= 1 - x;

    if (bl) {
      return br ? DockLocation.BOTTOM : DockLocation.LEFT;
    }
    return br ? DockLocation.RIGHT : DockLocation.TOP;
  }

  /** @internal */
  name: string;
  /** @internal */
  orientation: Orientation;
  /** @internal */
  indexPlus: number;

  /** @internal */
  constructor(_name: string, _orientation: Orientation, _indexPlus: number) {
    this.name = _name;
    this.orientation = _orientation;
    this.indexPlus = _indexPlus;
    DockLocation.values.set(this.name, this);
  }

  getName() {
    return this.name;
  }

  getOrientation() {
    return this.orientation;
  }

  /** @internal */
  getDockRect(r: Rect) {
    if (this === DockLocation.TOP) {
      return new Rect(r.x, r.y, r.width, r.height / 2);
    }
    if (this === DockLocation.BOTTOM) {
      return new Rect(r.x, r.getBottom() - r.height / 2, r.width, r.height / 2);
    }
    if (this === DockLocation.LEFT) {
      return new Rect(r.x, r.y, r.width / 2, r.height);
    }
    if (this === DockLocation.RIGHT) {
      return new Rect(r.getRight() - r.width / 2, r.y, r.width / 2, r.height);
    }
    return r.clone();
  }

  /** @internal */
  split(rect: Rect, size: number) {
    if (this === DockLocation.TOP) {
      const r1 = new Rect(rect.x, rect.y, rect.width, size);
      const r2 = new Rect(rect.x, rect.y + size, rect.width, rect.height - size);
      return { start: r1, end: r2 };
    }
    if (this === DockLocation.LEFT) {
      const r1 = new Rect(rect.x, rect.y, size, rect.height);
      const r2 = new Rect(rect.x + size, rect.y, rect.width - size, rect.height);
      return { start: r1, end: r2 };
    }
    if (this === DockLocation.RIGHT) {
      const r1 = new Rect(rect.getRight() - size, rect.y, size, rect.height);
      const r2 = new Rect(rect.x, rect.y, rect.width - size, rect.height);
      return { start: r1, end: r2 };
    }
    // if (this === DockLocation.BOTTOM) {
    const r1 = new Rect(rect.x, rect.getBottom() - size, rect.width, size);
    const r2 = new Rect(rect.x, rect.y, rect.width, rect.height - size);
    return { start: r1, end: r2 };
  }

  /** @internal */
  reflect() {
    if (this === DockLocation.TOP) {
      return DockLocation.BOTTOM;
    }
    if (this === DockLocation.LEFT) {
      return DockLocation.RIGHT;
    }
    if (this === DockLocation.RIGHT) {
      return DockLocation.LEFT;
    }
    // if (this === DockLocation.BOTTOM) {
    return DockLocation.TOP;
  }

  toString() {
    return `(DockLocation: name=${this.name}, orientation=${this.orientation})`;
  }
}
