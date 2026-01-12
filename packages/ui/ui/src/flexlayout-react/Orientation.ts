import { $UiId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $UiId.create("flexlayout-react/Orientation");

export class OrientationType extends BS.StringLiteralKit("horz", "vert").annotations(
  $I.annotations("OrientationType", {
    description: "An OrientationType is a string literal of 'horz' or 'vert'",
  })
) {}

export declare namespace OrientationType {
  export type Type = typeof OrientationType.Type;
}

export const orientationBuilder = OrientationType.toTagged("_name").composer({});

export class HorzOrientation extends S.Class<HorzOrientation>($I`HorzOrientation`)(orientationBuilder.horz({})) {
  static readonly new = () => new HorzOrientation();
}

export class VertOrientation extends S.Class<VertOrientation>($I`VertOrientation`)(orientationBuilder.vert({})) {
  static readonly new = () => new VertOrientation({});
}

export class AnyOrientation extends S.Union(HorzOrientation, VertOrientation).annotations(
  $I.annotations("AnyOrientation", {
    description: "An AnyOrientation is a union of HorzOrientation and VertOrientation",
  })
) {}

export declare namespace AnyOrientation {
  export type Type = typeof AnyOrientation.Type;
  export type Encoded = typeof AnyOrientation.Encoded;
}

export class IOrientation extends S.Class<IOrientation>($I`IOrientation`)(
  {
    data: AnyOrientation,
  },
  $I.annotations("IOrientation", {
    description: "An IOrientation is a class of an OrientationData",
  })
) {
  static readonly new = (_name: string) => {
    return {
      horz: HorzOrientation.new(),
      vert: VertOrientation.new(),
    };
  };

  readonly getName = () => this.data._name;
  override readonly toString = () => this.data._name;
}

export class Orientation {
  static HORZ = new Orientation("horz");
  static VERT = new Orientation("vert");

  static flip = (from: Orientation) => {
    if (from === Orientation.HORZ) {
      return Orientation.VERT;
    }
    return Orientation.HORZ;
  };

  /** @internal */
  private readonly _name: string;

  /** @internal */
  private constructor(name: string) {
    this._name = name;
  }

  getName() {
    return this._name;
  }

  toString() {
    return this._name;
  }
}
