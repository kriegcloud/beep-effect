import { $TodoxId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as A from "effect/Array";
import * as Eq from "effect/Equal";
import * as O from "effect/Option";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";

const $I = $TodoxId.create("liveblocks-ai-editor/models");

export class Permission extends BS.StringLiteralKit(
  "room:write",
  "room:read",
  "room:presence:write",
  "comments:write",
  "comments:read"
).annotations(
  $I.annotations("Permission", {
    description: "As defined in the source of truth in ApiScope in",
    documentation: "https://github.com/liveblocks/liveblocks-cloudflare/blob/main/src/security.ts",
  })
) {}

export declare namespace Permission {
  export type Type = typeof Permission.Type;
}

export class ReadAccess extends Permission.derive("room:read", "room:presence:write", "comments:read").annotations(
  $I.annotations("ReadAccess", {
    description:
      "Assign this to a room (or wildcard pattern) if you want to grant the user\nread permissions to the storage and comments data for this room. (Note that\nthe user will still have permissions to update their own presence.)",
  })
) {}

export declare namespace ReadAccess {
  export type Type = typeof ReadAccess.Type;
}

export class FullAccess extends Permission.derive("room:write", "comments:write").annotations(
  $I.annotations("FullAccess", {
    description:
      "Assign this to a room (or wildcard pattern) if you want to grant the user\nfull permissions to the storage and comments data for this room. (Note that\nthe user will still have permissions to update their own presence.)",
  })
) {}

export declare namespace FullAccess {
  export type Type = typeof FullAccess.Type;
}

/**
 * No room permissions - user cannot access the room at all.
 */
export const NoRoomPermission = BS.EmptyArray.annotations(
  $I.annotations("NoRoomPermission", {
    description: "Empty permission array indicating no access to the room.",
  })
);

/**
 * Full write access to the room - includes storage, presence, and all operations.
 * This is the highest level of access.
 */
export const FullRoomWritePermission = S.declare(
  (u: unknown): u is readonly ["room:write"] =>
    A.isArray(u) && A.isNonEmptyReadonlyArray(u) && A.headNonEmpty(u) === "room:write"
).annotations(
  $I.annotations("FullRoomWritePermission", {
    description: "Full write permission to the room including storage and all operations.",
  })
);

/**
 * Read-only access with presence updates.
 * User can read room storage but only update their own presence.
 */
export const ReadOnlyWithPresencePermission = S.declare(
  (u: unknown): u is readonly ["room:read", "room:presence:write"] =>
    A.isArray(u) &&
    A.isNonEmptyReadonlyArray(u) &&
    A.headNonEmpty(u) === "room:read" &&
    A.get(1)(u).pipe(O.flatMap(O.liftPredicate(Eq.equals("room:presence:write"))), O.isSome)
).annotations(
  $I.annotations("ReadOnlyWithPresencePermission", {
    description: "Read-only access to room storage with ability to update own presence.",
  })
);

/**
 * Read-only access with presence updates and comment editing.
 * User can read room storage, update presence, and create/edit comments.
 */
export const ReadOnlyWithCommentsWritePermission = S.declare(
  (u: unknown): u is readonly ["room:read", "room:presence:write", "comments:write"] =>
    A.isArray(u) &&
    A.isNonEmptyReadonlyArray(u) &&
    A.headNonEmpty(u) === "room:read" &&
    A.get(1)(u).pipe(O.flatMap(O.liftPredicate(Eq.equals("room:presence:write"))), O.isSome) &&
    A.get(2)(u).pipe(O.flatMap(O.liftPredicate(Eq.equals("comments:write"))), O.isSome)
).annotations(
  $I.annotations("ReadOnlyWithCommentsWritePermission", {
    description: "Read-only access to room storage with presence updates and comment editing.",
  })
);

/**
 * Read-only access with presence updates and comment viewing.
 * User can read room storage, update presence, and view comments (but not create/edit).
 */
export const ReadOnlyWithCommentsReadPermission = S.declare(
  (u: unknown): u is readonly ["room:read", "room:presence:write", "comments:read"] =>
    A.isArray(u) &&
    A.isNonEmptyReadonlyArray(u) &&
    A.headNonEmpty(u) === "room:read" &&
    A.get(1)(u).pipe(O.flatMap(O.liftPredicate(Eq.equals("room:presence:write"))), O.isSome) &&
    A.get(2)(u).pipe(O.flatMap(O.liftPredicate(Eq.equals("comments:read"))), O.isSome)
).annotations(
  $I.annotations("ReadOnlyWithCommentsReadPermission", {
    description: "Read-only access to room storage with presence updates and comment viewing.",
  })
);

/**
 * Union of all valid Liveblocks room permission tuples.
 * Matches the RoomPermission type from @liveblocks/node.
 */
export class RoomPermission extends S.Union(
  NoRoomPermission,
  FullRoomWritePermission,
  ReadOnlyWithPresencePermission,
  ReadOnlyWithCommentsWritePermission,
  ReadOnlyWithCommentsReadPermission
).annotations(
  $I.annotations("RoomPermission", {
    description: "Union of all valid room permission tuples as defined in Liveblocks API.",
    documentation: "https://github.com/liveblocks/liveblocks-cloudflare/blob/main/src/security.ts",
  })
) {}

export declare namespace RoomPermission {
  export type Type = typeof RoomPermission.Type;
}

export class RoomAccesses extends S.Record({
  key: S.String,
  value: RoomPermission,
}).annotations(
  $I.annotations("RoomAccesses", {
    description: "Record of room access permissions as defined in Liveblocks API.",
  })
) {}

export declare namespace RoomAccesses {
  export type Type = typeof RoomAccesses.Type;
}

export class RoomMetadata extends S.Record({
  key: S.String,
  value: S.Union(S.String, S.Array(S.String)),
}).annotations(
  $I.annotations("RoomMetadata", {
    description: "Record of room metadata as defined in Liveblocks API.",
  })
) {}

export declare namespace RoomMetadata {
  export type Type = typeof RoomMetadata.Type;
}

export class QueryRoomMetadata extends S.Record({
  key: S.String,
  value: S.String,
}).annotations(
  $I.annotations("QueryRoomMetadata", {
    description: "Record of room metadata as defined in Liveblocks API.",
  })
) {}

export declare namespace QueryRoomMetadata {
  export type Type = typeof QueryRoomMetadata.Type;
}

export class RoomData extends S.Class<RoomData>($I`RoomData`)(
  {
    type: S.tag("room"),
    id: S.String,
    createdAt: S.DateTimeUtc,
    lastConnectionAt: S.optionalWith(S.DateTimeUtc, { as: "Option" }),
    defaultAccesses: RoomPermission,
    usersAccesses: RoomAccesses,
    groupsAccesses: RoomAccesses,
    metadata: RoomMetadata,
  },
  $I.annotations("RoomData", {
    description: "Record of room data as defined in Liveblocks API.",
  })
) {}

export class RoomDataPlain extends S.Class<RoomDataPlain>($I`RoomDataPlain`)({
  ...RoomData.fields,
  createdAt: S.String,
  lastConnectionAt: S.optionalWith(S.String, { as: "Option" }),
}) {}

export class RoomInfo extends S.Class<RoomInfo>($I`RoomInfo`)(
  {
    name: S.String,
    url: S.URL,
  },
  $I.annotations("RoomInfo", {
    description: "Record of room info as defined in Liveblocks API.",
  })
) {}

export class TypedRoomData extends RoomData.extend<TypedRoomData>($I`TypedRoomData`)(
  {
    metadata: S.Struct({
      pageId: S.String,
    }),
  },
  $I.annotations("TypedRoomData", {
    description: "Record of room data as defined in Liveblocks API.",
  })
) {}

export class TypedRoomDataWithInfo extends TypedRoomData.extend<TypedRoomDataWithInfo>($I`TypedRoomDataWithInfo`)(
  {
    info: RoomInfo,
  },
  $I.annotations("TypedRoomDataWithInfo", {
    description: "Record of room data as defined in Liveblocks API.",
  })
) {}

export const isPoint = (target: Point | Rect): target is Point =>
  "x" in target && "y" in target && !("_left" in target);

export class PointReturnReason extends S.Class<PointReturnReason>($I`PointReturnReason`)(
  {
    isOnTopSide: S.Boolean,
    isOnBottomSide: S.Boolean,
    isOnRightSide: S.Boolean,
    isOnLeftSide: S.Boolean,
  },
  $I.annotations("PointReturnReason", {
    description: "Record of room data as defined in Liveblocks API.",
  })
) {}

export class ContainsPointReturn extends S.Class<ContainsPointReturn>($I`ContainsPointReturn`)(
  {
    result: S.Boolean,
    reason: PointReturnReason,
  },
  $I.annotations("ContainsPointReturn", {
    description: "Record of room data as defined in Liveblocks API.",
  })
) {}

export class RectFrom extends S.Class<RectFrom>($I`RectFrom`)(
  {
    _left: S.Number,
    _top: S.Number,
    _right: S.Number,
    _bottom: S.Number,
  },
  $I.annotations("RectFrom", {
    description: "Record of room data as defined in Liveblocks API.",
  })
) {}

export class Rect extends RectFrom.transformOrFailFrom<Rect>($I`RectFrom`)(
  {},
  {
    decode: (input: RectFrom) => {
      const { _top: top, _bottom: bottom, _left: left, _right: right } = input;
      const [physicTop, physicBottom] = top <= bottom ? [top, bottom] : [bottom, top];

      const [physicLeft, physicRight] = left <= right ? [left, right] : [right, left];

      return ParseResult.succeed({
        _top: physicTop,
        _bottom: physicBottom,
        _left: physicLeft,
        _right: physicRight,
      });
    },
    encode: (encoded) => ParseResult.succeed(encoded),
  },
  {
    ...$I.annotations("RectFrom", {
      description: "Record of room data as defined in Liveblocks API.",
    }),
  }
) {
  /** Lazily initializes and returns the schema-derived equivalence */
  private static equivalence = S.equivalence(Rect);

  get top(): number {
    return this._top;
  }

  get right(): number {
    return this._right;
  }

  get bottom(): number {
    return this._bottom;
  }

  get left(): number {
    return this._left;
  }

  get width(): number {
    return Math.abs(this._left - this._right);
  }

  get height(): number {
    return Math.abs(this._bottom - this._top);
  }

  public readonly equals = (other: Rect): boolean => {
    return Rect.equivalence(this, other);
  };

  public contains(target: Point): ContainsPointReturn;
  public contains(target: Rect): boolean;
  public contains(target: Point | Rect): boolean | ContainsPointReturn {
    if (isPoint(target)) {
      const { x, y } = target;

      const isOnTopSide = y < this._top;
      const isOnBottomSide = y > this._bottom;
      const isOnLeftSide = x < this._left;
      const isOnRightSide = x > this._right;

      const result = !isOnTopSide && !isOnBottomSide && !isOnLeftSide && !isOnRightSide;

      return new ContainsPointReturn({
        reason: new PointReturnReason({
          isOnBottomSide,
          isOnLeftSide,
          isOnRightSide,
          isOnTopSide,
        }),
        result,
      });
    }

    const { top, left, bottom, right } = target;

    return (
      top >= this._top &&
      top <= this._bottom &&
      bottom >= this._top &&
      bottom <= this._bottom &&
      left >= this._left &&
      left <= this._right &&
      right >= this._left &&
      right <= this._right
    );
  }

  public intersectsWith(rect: Rect): boolean {
    const { left: x1, top: y1, width: w1, height: h1 } = rect;
    const { left: x2, top: y2, width: w2, height: h2 } = this;
    const maxX = x1 + w1 >= x2 + w2 ? x1 + w1 : x2 + w2;
    const maxY = y1 + h1 >= y2 + h2 ? y1 + h1 : y2 + h2;
    const minX = x1 <= x2 ? x1 : x2;
    const minY = y1 <= y2 ? y1 : y2;
    return maxX - minX <= w1 + w2 && maxY - minY <= h1 + h2;
  }

  public generateNewRect({ left = this.left, top = this.top, right = this.right, bottom = this.bottom }): Rect {
    return Rect.fromLTRB(left, top, right, bottom);
  }

  static fromLTRB(left: number, top: number, right: number, bottom: number): Rect {
    return new Rect({ _left: left, _top: top, _right: right, _bottom: bottom });
  }

  static fromLWTH(left: number, width: number, top: number, height: number): Rect {
    return Rect.fromLTRB(left, top, left + width, top + height);
  }

  static fromPoints(startPoint: Point, endPoint: Point): Rect {
    const { y: top, x: left } = startPoint;
    const { y: bottom, x: right } = endPoint;
    return Rect.fromLTRB(left, top, right, bottom);
  }

  static fromDOM(dom: HTMLElement): Rect {
    const { top, width, left, height } = dom.getBoundingClientRect();
    return Rect.fromLWTH(left, width, top, height);
  }
}

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

export class HtmlElement extends S.declare(
  (u: unknown): u is HtmlElement => typeof window !== "undefined" && u instanceof HtmlElement
).annotations(
  $I.annotations("HtmlElement", {
    description: "Html element",
  })
) {
  static readonly is = S.is(HtmlElement);
}

export declare namespace HtmlElement {
  export type Type = S.Schema.Type<typeof HtmlElement>;
}
