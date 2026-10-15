/**
 * Pure sheet-domain outline rules: find drawn lines that run side by side
 * closer than a legible centre spacing, and open them to it.
 *
 * **Details**
 *
 * A thin face seen nearly edge-on projects its two long edges as two
 * parallel lines a fraction of a millimetre apart. Closer than twice the line
 * weight (0.7 mm centre to centre for 0.35 mm lines, the least spacing of
 * parallel lines in ISO 128) the pair prints as one line of the double
 * weight an emphasis line has (review loop 4, O-01). A draftsperson opens
 * such a pair to the least spacing and keeps both lines, so the board edge
 * still reads as two lines and every break in them keeps its width;
 * {@link separateCloseOutlines} does the same on the sheet, and
 * {@link closeOutlineGaps} measures what is left.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { A, O } from "@beep/utils";
import { pipe } from "effect/Function";
import * as Order from "effect/Order";
import type { Segment2 } from "./Geometry.schemas.ts";

type Point = readonly [number, number];

// A drawn segment as given (`a` to `b`), with its index, length, unit direction (pointing right, or up when
// vertical) and unit normal.
type Stroke = {
  readonly index: number;
  readonly a: Point;
  readonly b: Point;
  readonly length: number;
  readonly u: Point;
  readonly n: Point;
};

// How a shorter stroke runs beside a longer one: the nearer of its two distances from the longer one's line at the
// ends of their overlap, and the side (±1, along the longer one's normal) it lies on.
type Gap = { readonly near: number; readonly side: number; readonly longer: Stroke };

// Collinear strokes drawn as one line: its longest member, the length its members cover, whether an emphasis stroke
// belongs to it (it then moves only when nothing else can), and whether it is drawn long enough to keep its direction
// when its ends are solved again (a shorter one is a connector, re-ended where the lines it joins went).
type Line = { readonly reference: Stroke; readonly drawn: number; readonly pinned: boolean; readonly rigid: boolean };

// A pair of strokes of two different lines that run side by side.
type Contact = { readonly first: Stroke; readonly second: Stroke; readonly lines: readonly [number, number] };

type Tolerances = {
  readonly minSpacing: number;
  readonly minOverlap: number;
  readonly coincidence: number;
};

// Everything one separation pass reads: the strokes (movable first, then fixed), the line each belongs to, the
// lines, and the contacts between lines.
type Context = {
  readonly strokes: ReadonlyArray<Stroke>;
  readonly owner: ReadonlyArray<number>;
  readonly lines: ReadonlyArray<Line>;
  readonly contacts: ReadonlyArray<Contact>;
  readonly tolerances: Tolerances;
};

// Mutable state of a pass: each line's offset, whether it is settled (pinned, an anchor, or moved), and whether moved.
type Placement = { readonly offsets: Array<Point>; readonly settled: Array<boolean>; readonly moved: Array<boolean> };

// A conflict between two lines: the pair, how many of the two are settled, and the longer one's drawn length.
type Conflict = { readonly pair: readonly [number, number]; readonly settled: number; readonly drawn: number };

// The push one short gap asks of the mover along the anchor's normal: its sign and length.
type Push = { readonly direction: number; readonly length: number };

// One way to open a conflict: the line that moves, the one it moves away from, the offset it moves to, and its rank.
type Candidate = {
  readonly mover: number;
  readonly anchor: number;
  readonly offset: Point;
  readonly pinned: number;
  readonly blocking: number;
  readonly settled: number;
  readonly drawn: number;
};

// A drawing as one separation pass leaves it: the segments, and how far each segment's line moved.
type Drawing = { readonly segments: ReadonlyArray<Segment2>; readonly shifts: ReadonlyArray<Point> };

/**
 * Centre spacing, in mm on the sheet, within which two drawn lines count as
 * one line drawn twice (an emphasis line over its own outline, a partial
 * duplicate of a line): such pairs are neither flagged nor separated.
 *
 * **Example** (Read the tolerance)
 *
 * ```ts
 * import { OUTLINE_COINCIDENCE_MM } from "@beep/technical-drawing/Outline.rules"
 *
 * console.log(OUTLINE_COINCIDENCE_MM) // 0.15
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const OUTLINE_COINCIDENCE_MM = 0.15;

// Two strokes run side by side only within 3° of parallel.
const PARALLEL_ANGLE = (3 * Math.PI) / 180;
const PARALLEL_SINE = Math.sin(PARALLEL_ANGLE);
// An end of a line meets another line through it again when the two cross at least this steeply (10°); past a
// shallower one the meeting point runs off along the lines.
const CROSSING_SINE = Math.sin((10 * Math.PI) / 180);
// A line drawn shorter than this many least spacings is a connector: its ends follow the lines it joins.
const CONNECTOR_SPANS = 3;
// A point touches a stroke within this share of the coincidence tolerance.
const JOIN_SHARE = 0.02;
// Spacings this close under the least spacing are float noise of a separated pair, not a defect.
const SPACING_TOLERANCE = 1e-9;
// A pair is pushed apart and re-measured at most this many times.
const SETTLE_ROUNDS = 4;
// Contacts are kept between lines closer than this many least spacings.
const CONTACT_REACH = 3;
// A pass settles at most this many conflicts per line before it stops.
const ROUNDS_PER_LINE = 4;
// The separated drawing is re-measured and opened again at most this many times.
const PASSES = 4;

const minus = (p: Point, q: Point): Point => [p[0] - q[0], p[1] - q[1]];
const plus = (p: Point, q: Point): Point => [p[0] + q[0], p[1] + q[1]];
const times = (p: Point, k: number): Point => [p[0] * k, p[1] * k];
const dot = (p: Point, q: Point): number => p[0] * q[0] + p[1] * q[1];
const cross = (p: Point, q: Point): number => p[0] * q[1] - p[1] * q[0];
const sign = (value: number): number => (value < 0 ? -1 : 1);
const ORIGIN: Point = [0, 0];

const strokeOf = (segment: Segment2, index: number): Stroke => {
  const a: Point = [segment[0], segment[1]];
  const b: Point = [segment[2], segment[3]];
  const length = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const raw: Point = length > 0 ? times(minus(b, a), 1 / length) : [1, 0];
  const u = raw[0] < 0 || (raw[0] === 0 && raw[1] < 0) ? times(raw, -1) : raw;
  return { index, a, b, length, u, n: [-u[1], u[0]] };
};

const shifted = (stroke: Stroke, by: Point): Stroke => ({ ...stroke, a: plus(stroke.a, by), b: plus(stroke.b, by) });

// Where `other` runs beside `line`: over their overlap along `line` (at least `minOverlap`), the nearer of its
// distances from `line`'s line at the overlap's ends, and its side. None when they are not within 3° of parallel,
// overlap less, or cross (or touch) within the overlap.
const gapBeside = (line: Stroke, other: Stroke, minOverlap: number): O.Option<Gap> => {
  if (other.length === 0 || Math.abs(cross(line.u, other.u)) > PARALLEL_SINE) {
    return O.none();
  }
  const reach = dot(minus(line.b, line.a), line.u);
  const t1 = dot(minus(other.a, line.a), line.u);
  const t2 = dot(minus(other.b, line.a), line.u);
  const lo = Math.max(Math.min(0, reach), Math.min(t1, t2));
  const hi = Math.min(Math.max(0, reach), Math.max(t1, t2));
  const d1 = dot(minus(other.a, line.a), line.n);
  const d2 = dot(minus(other.b, line.a), line.n);
  const at = (t: number): number => d1 + ((d2 - d1) * (t - t1)) / (t2 - t1);
  const [dLo, dHi] = [at(lo), at(hi)];
  return hi - lo >= minOverlap && dLo * dHi > 0
    ? O.some({ near: Math.min(Math.abs(dLo), Math.abs(dHi)), side: sign(dLo), longer: line })
    : O.none();
};

// The gap of two strokes measured on the longer one's line (the lower index on a tie), so either order agrees.
const gapOf = (first: Stroke, second: Stroke, minOverlap: number): O.Option<Gap> =>
  first.length > second.length || (first.length === second.length && first.index < second.index)
    ? gapBeside(first, second, minOverlap)
    : gapBeside(second, first, minOverlap);

// A gap closer than the least spacing but not coincident.
const isShort = (gap: Gap, tolerances: Tolerances): boolean =>
  gap.near > tolerances.coincidence && gap.near < tolerances.minSpacing - SPACING_TOLERANCE;

type Angled = { readonly stroke: Stroke; readonly angle: number };

const byAngle = Order.mapInput(Order.Number, (entry: Angled) => entry.angle);

// The strokes from position `from` up to (not including) `until` while their angle still `reaches`.
const runWhile = (
  sorted: ReadonlyArray<Angled>,
  span: readonly [from: number, until: number],
  reaches: (angle: number) => boolean
): ReadonlyArray<Stroke> => {
  const found: Array<Stroke> = [];
  let at = span[0];
  while (at < span[1] && reaches(A.getUnsafe(sorted, at).angle)) {
    found.push(A.getUnsafe(sorted, at).stroke);
    at += 1;
  }
  return found;
};

// Every pair of non-degenerate strokes within 3° of parallel, each pair once. Directions are angles in (−90°, 90°],
// so a pair either side of the vertical meets across the wrap.
const parallelPairs = (strokes: ReadonlyArray<Stroke>): ReadonlyArray<readonly [Stroke, Stroke]> => {
  const sorted = pipe(
    strokes,
    A.filter((stroke) => stroke.length > 0),
    A.map((stroke) => ({ stroke, angle: Math.atan2(stroke.u[1], stroke.u[0]) })),
    A.sort(byAngle)
  );
  const count = A.length(sorted);
  // the same strokes from the steepest down: position k is sorted position count - 1 - k
  const reversed = A.reverse(sorted);
  return A.flatMap(sorted, ({ stroke, angle }, i) => {
    const ahead = runWhile(sorted, [i + 1, count], (next) => next - angle <= PARALLEL_ANGLE);
    const across =
      angle - PARALLEL_ANGLE < -Math.PI / 2
        ? runWhile(reversed, [0, count - 1 - i], (last) => angle + Math.PI - last <= PARALLEL_ANGLE)
        : A.empty<Stroke>();
    return A.map([...ahead, ...across], (other) => [stroke, other] as const);
  });
};

// The closest spacing of every pair of strokes that runs too close.
const shortGaps = (strokes: ReadonlyArray<Stroke>, tolerances: Tolerances): ReadonlyArray<number> =>
  pipe(
    parallelPairs(strokes),
    A.map(([first, second]) => gapOf(first, second, tolerances.minOverlap)),
    A.getSomes,
    A.filter((gap) => isShort(gap, tolerances)),
    A.map((gap) => gap.near)
  );

// How far a drawing falls short of the least spacing, over all its close pairs.
const shortfallOf = (segments: ReadonlyArray<Segment2>, tolerances: Tolerances): number =>
  A.reduce(shortGaps(A.map(segments, strokeOf), tolerances), 0, (sum, near) => sum + tolerances.minSpacing - near);

// Whether the shorter of two strokes lies within `coincidence` of the longer one's line along its whole length.
const collinear = (first: Stroke, second: Stroke, coincidence: number): boolean => {
  const [longer, shorter] = first.length >= second.length ? [first, second] : [second, first];
  const off = (point: Point) => Math.abs(dot(minus(point, longer.a), longer.n));
  return off(shorter.a) <= coincidence && off(shorter.b) <= coincidence;
};

// Union-find over stroke indices: the line each stroke belongs to, numbered from 0 in order of first stroke.
const lineIndices = (strokes: ReadonlyArray<Stroke>, coincidence: number): ReadonlyArray<number> => {
  const parent = A.map(strokes, (stroke) => stroke.index);
  const root = (index: number): number => {
    let at = index;
    while (A.getUnsafe(parent, at) !== at) {
      at = A.getUnsafe(parent, at);
    }
    return at;
  };
  A.forEach(parallelPairs(strokes), ([first, second]) => {
    if (collinear(first, second, coincidence)) {
      const [x, y] = [root(first.index), root(second.index)];
      parent[Math.max(x, y)] = Math.min(x, y);
    }
  });
  // a root is the least index of its line, so lines are numbered as their roots are first met
  const numbers = A.map(strokes, () => -1);
  let next = 0;
  return A.map(strokes, (stroke) => {
    const r = root(stroke.index);
    if (A.getUnsafe(numbers, r) < 0) {
      numbers[r] = next;
      next += 1;
    }
    return A.getUnsafe(numbers, r);
  });
};

// The length a line's members cover along its reference direction, overlaps counted once.
const coveredLength = (members: ReadonlyArray<Stroke>, u: Point): number => {
  const spans = pipe(
    members,
    A.map((m) => {
      const [s, e] = [dot(m.a, u), dot(m.b, u)];
      return [Math.min(s, e), Math.max(s, e)] as const;
    }),
    A.sort(Order.mapInput(Order.Number, ([s]: readonly [number, number]) => s))
  );
  return A.reduce(spans, { total: 0, end: Number.NEGATIVE_INFINITY }, (acc, [s, e]) =>
    e <= acc.end ? acc : { total: acc.total + e - Math.max(s, acc.end), end: e }
  ).total;
};

const lineOf = (members: ReadonlyArray<Stroke>, firstFixed: number, tolerances: Tolerances): Line => {
  const reference = A.reduce(members, A.getUnsafe(members, 0), (best, m) => (m.length > best.length ? m : best));
  const drawn = coveredLength(members, reference.u);
  return {
    reference,
    drawn,
    pinned: A.some(members, (m) => m.index >= firstFixed),
    rigid: drawn >= CONNECTOR_SPANS * tolerances.minSpacing,
  };
};

const linesOf = (
  strokes: ReadonlyArray<Stroke>,
  owner: ReadonlyArray<number>,
  firstFixed: number,
  tolerances: Tolerances
): ReadonlyArray<Line> => {
  const count = A.reduce(owner, 0, (most, line) => Math.max(most, line + 1));
  const members = A.makeBy(count, (): Array<Stroke> => []);
  A.forEach(strokes, (stroke) => A.getUnsafe(members, A.getUnsafe(owner, stroke.index)).push(stroke));
  return A.map(members, (line) => lineOf(line, firstFixed, tolerances));
};

// Pairs of strokes of different lines that run side by side and could come within the least spacing.
const contactsOf = (
  strokes: ReadonlyArray<Stroke>,
  owner: ReadonlyArray<number>,
  tolerances: Tolerances
): ReadonlyArray<Contact> =>
  pipe(
    parallelPairs(strokes),
    A.filter(
      ([first, second]) =>
        A.getUnsafe(owner, first.index) !== A.getUnsafe(owner, second.index) &&
        O.exists(gapOf(first, second, tolerances.minOverlap), (gap) => gap.near < CONTACT_REACH * tolerances.minSpacing)
    ),
    A.map(([first, second]) => ({
      first,
      second,
      lines: [A.getUnsafe(owner, first.index), A.getUnsafe(owner, second.index)] as const,
    }))
  );

// The gap of a contact with its lines at `offsets`, when it is closer than the least spacing but not coincident.
const shortGap = (contact: Contact, offsets: ReadonlyArray<Point>, tolerances: Tolerances): O.Option<Gap> =>
  pipe(
    gapOf(
      shifted(contact.first, A.getUnsafe(offsets, contact.lines[0])),
      shifted(contact.second, A.getUnsafe(offsets, contact.lines[1])),
      tolerances.minOverlap
    ),
    O.filter((gap) => isShort(gap, tolerances))
  );

const settledCount = (placement: Placement, [x, y]: readonly [number, number]): number =>
  (A.getUnsafe(placement.settled, x) ? 1 : 0) + (A.getUnsafe(placement.settled, y) ? 1 : 0);

// A pair beside a settled line first (it opens outward from what is already placed), then unplaced pairs, then
// pairs of two placed lines; within each, the longest line first, then line order.
const URGENCY = [1, 0, 2];

const conflictOrder = Order.combine(
  Order.mapInput(Order.Number, (c: Conflict) => A.getUnsafe(URGENCY, c.settled)),
  Order.combine(
    Order.flip(Order.mapInput(Order.Number, (c: Conflict) => c.drawn)),
    Order.combine(
      Order.mapInput(Order.Number, (c: Conflict) => Math.min(...c.pair)),
      Order.mapInput(Order.Number, (c: Conflict) => Math.max(...c.pair))
    )
  )
);

const nextConflict = (context: Context, placement: Placement): O.Option<Conflict> =>
  pipe(
    context.contacts,
    A.filter((contact) => O.isSome(shortGap(contact, placement.offsets, context.tolerances))),
    A.map(({ lines: pair }) => ({
      pair,
      settled: settledCount(placement, pair),
      drawn: Math.max(A.getUnsafe(context.lines, pair[0]).drawn, A.getUnsafe(context.lines, pair[1]).drawn),
    })),
    A.sort(conflictOrder),
    A.head
  );

const between = (contact: Contact, anchor: number, mover: number): boolean => {
  const [x, y] = contact.lines;
  return (x === anchor && y === mover) || (x === mover && y === anchor);
};

// The pushes the short gaps between two lines ask of the mover, along the anchor's normal. Moving the shorter
// stroke's points by `v` changes their distance from the longer one's line by `v·n`; moving the longer stroke's line
// by `v` changes it by `−v·n`.
const pushesOf = (anchor: number, mover: number, context: Context, offsets: ReadonlyArray<Point>) => {
  const normal = A.getUnsafe(context.lines, anchor).reference.n;
  return pipe(
    context.contacts,
    A.filter((contact) => between(contact, anchor, mover)),
    A.map((contact) => shortGap(contact, offsets, context.tolerances)),
    A.getSomes,
    A.map((gap): Push => {
      const kappa = dot(normal, gap.longer.n);
      const lead = A.getUnsafe(context.owner, gap.longer.index) === mover ? -1 : 1;
      return {
        direction: sign(gap.side * lead * kappa),
        length: (context.tolerances.minSpacing - gap.near) / Math.max(Math.abs(kappa), 1e-9),
      };
    })
  );
};

// The mover's offset after the largest push, in the direction the largest push takes.
const pushedOffset = (
  anchor: number,
  mover: number,
  context: Context,
  offsets: ReadonlyArray<Point>,
  pushes: A.NonEmptyReadonlyArray<Push>
): Point => {
  const { direction } = A.max(
    pushes,
    Order.mapInput(Order.Number, (p: Push) => p.length)
  );
  const length = A.reduce(pushes, 0, (most, p) => (p.direction === direction ? Math.max(most, p.length) : most));
  const normal = A.getUnsafe(context.lines, anchor).reference.n;
  return plus(A.getUnsafe(offsets, mover), times(normal, direction * length));
};

const otherLine = (contact: Contact, line: number): number =>
  contact.lines[0] === line ? contact.lines[1] : contact.lines[0];

// How many settled lines (other than the anchor) a move would bring, or bring closer, inside the least spacing of
// the mover: those will not give way, so the move only trades one close pair for another (review loop 4, R4-03).
const blockingOf = (
  move: { readonly anchor: number; readonly mover: number; readonly offset: Point },
  context: Context,
  placement: Placement
): number => {
  const after = A.map(placement.offsets, (offset, line) => (line === move.mover ? move.offset : offset));
  return A.length(
    A.filter(context.contacts, (contact) => {
      const other = otherLine(contact, move.mover);
      const beside = (contact.lines[0] === move.mover || contact.lines[1] === move.mover) && other !== move.anchor;
      return (
        beside &&
        A.getUnsafe(placement.settled, other) &&
        O.exists(shortGap(contact, after, context.tolerances), (gap) =>
          O.match(shortGap(contact, placement.offsets, context.tolerances), {
            onNone: () => true,
            onSome: (before) => gap.near < before.near,
          })
        )
      );
    })
  );
};

const candidateOf = (mover: number, anchor: number, context: Context, placement: Placement): O.Option<Candidate> => {
  const pushes = pushesOf(anchor, mover, context, placement.offsets);
  if (!A.isReadonlyArrayNonEmpty(pushes)) {
    return O.none();
  }
  const offset = pushedOffset(anchor, mover, context, placement.offsets, pushes);
  const line = A.getUnsafe(context.lines, mover);
  return O.some({
    mover,
    anchor,
    offset,
    pinned: line.pinned ? 1 : 0,
    blocking: blockingOf({ anchor, mover, offset }, context, placement),
    settled: A.getUnsafe(placement.settled, mover) ? 1 : 0,
    drawn: line.drawn,
  });
};

// An emphasised line moves last; then the move that crowds no settled line, then a line not yet placed, then the
// line drawn shorter, then line order.
const candidateOrder = Order.combineAll([
  Order.mapInput(Order.Number, (c: Candidate) => c.pinned),
  Order.mapInput(Order.Number, (c: Candidate) => c.blocking),
  Order.mapInput(Order.Number, (c: Candidate) => c.settled),
  Order.mapInput(Order.Number, (c: Candidate) => c.drawn),
  Order.mapInput(Order.Number, (c: Candidate) => c.mover),
]);

// Moves the chosen line away from the other until every contact between them clears the least spacing, then
// settles both.
const separatePair = (candidate: Candidate, context: Context, placement: Placement): void => {
  const { anchor, mover } = candidate;
  placement.offsets[mover] = candidate.offset;
  let pushes = pushesOf(anchor, mover, context, placement.offsets);
  let round = 1;
  while (A.isReadonlyArrayNonEmpty(pushes) && round < SETTLE_ROUNDS) {
    placement.offsets[mover] = pushedOffset(anchor, mover, context, placement.offsets, pushes);
    pushes = pushesOf(anchor, mover, context, placement.offsets);
    round += 1;
  }
  placement.settled[anchor] = true;
  placement.settled[mover] = true;
  placement.moved[mover] = true;
};

const resolveConflict = (conflict: Conflict, context: Context, placement: Placement): void => {
  const [x, y] = conflict.pair;
  pipe(
    A.getSomes([candidateOf(y, x, context, placement), candidateOf(x, y, context, placement)]),
    A.sort(candidateOrder),
    A.head,
    O.match({
      onNone: () => {
        placement.settled[x] = true;
        placement.settled[y] = true;
      },
      onSome: (candidate) => separatePair(candidate, context, placement),
    })
  );
};

const touches = (stroke: Stroke, point: Point, tolerance: number): boolean => {
  const run = minus(stroke.b, stroke.a);
  const length2 = dot(run, run);
  const t = length2 === 0 ? 0 : Math.max(0, Math.min(1, dot(minus(point, stroke.a), run) / length2));
  const foot = plus(stroke.a, times(run, t));
  return Math.hypot(point[0] - foot[0], point[1] - foot[1]) <= tolerance;
};

// Where the line through `first` meets the line through `second`.
const meet = (first: Stroke, second: Stroke): Point =>
  plus(first.a, times(first.u, cross(minus(second.a, first.a), second.u) / cross(first.u, second.u)));

const steepest = (strokes: ReadonlyArray<Stroke>, across: Stroke): O.Option<Stroke> =>
  pipe(
    strokes,
    A.map((stroke) => ({ stroke, sine: Math.abs(cross(stroke.u, across.u)) })),
    A.sort(Order.flip(Order.mapInput(Order.Number, (entry: { readonly sine: number }) => entry.sine))),
    A.head,
    O.map(({ stroke }) => stroke)
  );

// The settled pass a drawing's ends are solved against.
type Settled = { readonly context: Context; readonly placement: Placement };

const lineAt = (settled: Settled, stroke: Stroke): number => A.getUnsafe(settled.context.owner, stroke.index);
const offsetOf = (settled: Settled, stroke: Stroke): Point =>
  A.getUnsafe(settled.placement.offsets, lineAt(settled, stroke));
const isMoved = (settled: Settled) => (stroke: Stroke) => A.getUnsafe(settled.placement.moved, lineAt(settled, stroke));
const isRigid = (settled: Settled) => (stroke: Stroke) =>
  A.getUnsafe(settled.context.lines, lineAt(settled, stroke)).rigid;
const placed = (settled: Settled, stroke: Stroke): Stroke => shifted(stroke, offsetOf(settled, stroke));

// The strokes of other lines a point of `stroke` touches.
const incident = (settled: Settled, stroke: Stroke, point: Point): ReadonlyArray<Stroke> => {
  const tolerance = settled.context.tolerances.coincidence * JOIN_SHARE;
  return A.filter(
    settled.context.strokes,
    (other) =>
      other.length > 0 && lineAt(settled, other) !== lineAt(settled, stroke) && touches(other, point, tolerance)
  );
};

// An end of a line drawn long enough to keep its direction stays on that line, moved with it: it meets again the
// steepest line through it that crosses at least 10° — an unmoved one first, so a vertex where unmoved lines meet
// stays put and a moved line is re-ended on the unmoved one — and, with none, it moves with its own line. An unmoved
// line therefore keeps its direction and its ends only slide along it (review loop 4, R4-01, R4-02).
const rigidEnd = (settled: Settled, stroke: Stroke, point: Point): Point => {
  const guides = A.filter(
    incident(settled, stroke, point),
    (other) => isRigid(settled)(other) && Math.abs(cross(other.u, stroke.u)) >= CROSSING_SINE
  );
  const guide = O.orElse(
    steepest(
      A.filter(guides, (other) => !isMoved(settled)(other)),
      stroke
    ),
    () => steepest(A.filter(guides, isMoved(settled)), stroke)
  );
  return isMoved(settled)(stroke) || O.exists(guide, isMoved(settled))
    ? O.match(guide, {
        onNone: () => plus(point, offsetOf(settled, stroke)),
        onSome: (other) => meet(placed(settled, stroke), placed(settled, other)),
      })
    : point;
};

// The end of `stroke` at `point`, when it has one there.
const endAt = (settled: Settled, stroke: Stroke, point: Point): O.Option<Point> => {
  const tolerance = settled.context.tolerances.coincidence * JOIN_SHARE;
  const near = (end: Point) => Math.hypot(end[0] - point[0], end[1] - point[1]) <= tolerance;
  return near(stroke.a) ? O.some(stroke.a) : near(stroke.b) ? O.some(stroke.b) : O.none();
};

// An end of a connector goes where the moved line it joins took that point: to that line's end there, solved again,
// or along with the line when it joins the line's run; joining no moved line, it is solved like any end.
const connectorEnd = (settled: Settled, stroke: Stroke, point: Point): Point =>
  pipe(
    incident(settled, stroke, point),
    A.filter((other) => isRigid(settled)(other) && isMoved(settled)(other)),
    A.head,
    O.match({
      onNone: () => rigidEnd(settled, stroke, point),
      onSome: (line) =>
        O.match(endAt(settled, line, point), {
          onNone: () => plus(point, offsetOf(settled, line)),
          onSome: (end) => rigidEnd(settled, line, end),
        }),
    })
  );

const sameSegment = (segment: Segment2, a: Point, b: Point): boolean =>
  a[0] === segment[0] && a[1] === segment[1] && b[0] === segment[2] && b[1] === segment[3];

// A segment with its ends solved again. A stroke that would turn back on itself is moved whole with its line.
const resolvedSegment = (settled: Settled, segment: Segment2, stroke: Stroke): Segment2 => {
  const end = isRigid(settled)(stroke) ? rigidEnd : connectorEnd;
  const a = end(settled, stroke, stroke.a);
  const b = end(settled, stroke, stroke.b);
  if (sameSegment(segment, a, b)) {
    return segment;
  }
  const forward = dot(minus(b, a), minus(stroke.b, stroke.a)) > 0;
  const whole = placed(settled, stroke);
  const [p, q] = forward ? [a, b] : [whole.a, whole.b];
  return [p[0], p[1], q[0], q[1]];
};

// The pass's lines, contacts, and an empty placement (only lines carrying an emphasis stroke start settled).
const settingOf = (segments: ReadonlyArray<Segment2>, firstFixed: number, tolerances: Tolerances): Settled => {
  const strokes = A.map(segments, strokeOf);
  const owner = lineIndices(strokes, tolerances.coincidence);
  const lines = linesOf(strokes, owner, firstFixed, tolerances);
  return {
    context: { strokes, owner, lines, contacts: contactsOf(strokes, owner, tolerances), tolerances },
    placement: {
      offsets: A.map(lines, () => ORIGIN),
      settled: A.map(lines, (line) => line.pinned),
      moved: A.map(lines, () => false),
    },
  };
};

// One separation pass: settle conflicts until none is left (or each line had its share), then solve every end again.
// None when no line moved.
const separationPass = (
  segments: ReadonlyArray<Segment2>,
  firstFixed: number,
  tolerances: Tolerances
): O.Option<Drawing> => {
  const settled = settingOf(segments, firstFixed, tolerances);
  const { context, placement } = settled;
  let conflict = nextConflict(context, placement);
  let rounds = 0;
  while (O.isSome(conflict) && rounds < ROUNDS_PER_LINE * A.length(context.lines)) {
    resolveConflict(conflict.value, context, placement);
    conflict = nextConflict(context, placement);
    rounds += 1;
  }
  return A.some(placement.moved, (moved) => moved)
    ? O.some({
        segments: A.map(segments, (segment, index) =>
          resolvedSegment(settled, segment, A.getUnsafe(context.strokes, index))
        ),
        shifts: A.map(context.strokes, (stroke) => (isMoved(settled)(stroke) ? offsetOf(settled, stroke) : ORIGIN)),
      })
    : O.none();
};

// Passes until the drawing measures clean, a pass moves nothing, or the passes run out: solving ends again can bring
// a re-ended line beside another (a connector grown past the overlap), and the next pass opens that pair too. The
// drawing that falls least short is kept, so the rule never returns a drawing worse than its input.
const settle = (segments: ReadonlyArray<Segment2>, firstFixed: number, tolerances: Tolerances): Drawing => {
  const start: Drawing = { segments, shifts: A.map(segments, () => ORIGIN) };
  let current = start;
  let best = { drawing: start, shortfall: shortfallOf(segments, tolerances) };
  let pass = 0;
  while (pass < PASSES && best.shortfall > 0) {
    const next = separationPass(current.segments, firstFixed, tolerances);
    if (O.isNone(next)) {
      break;
    }
    current = { segments: next.value.segments, shifts: A.zipWith(current.shifts, next.value.shifts, plus) };
    const shortfall = shortfallOf(current.segments, tolerances);
    best = shortfall < best.shortfall ? { drawing: current, shortfall } : best;
    pass += 1;
  }
  return best.drawing;
};

// How far each line of the input moved in all, for the lines that moved.
const movesOf = (segments: ReadonlyArray<Segment2>, shifts: ReadonlyArray<Point>, coincidence: number) => {
  const owner = lineIndices(A.map(segments, strokeOf), coincidence);
  const count = A.reduce(owner, 0, (most, line) => Math.max(most, line + 1));
  const largest = A.makeBy(count, () => 0);
  A.forEach(shifts, ([x, y], index) => {
    const line = A.getUnsafe(owner, index);
    largest[line] = Math.max(A.getUnsafe(largest, line), Math.hypot(x, y));
  });
  return A.filter(largest, (move) => move > SPACING_TOLERANCE);
};

/**
 * Opens drawn lines that run side by side closer than `minSpacing` (centre
 * to centre) to that spacing, keeping both lines.
 *
 * **Details**
 *
 * Strokes collinear within `coincidence` form one line (a line broken at a
 * crossing, a partial duplicate). Two lines conflict where a stroke of each
 * runs within 3° of parallel beside the other over at least `minOverlap`,
 * their nearer spacing over that overlap lying above `coincidence` and under
 * `minSpacing`. One line moves straight away from the other by the largest
 * shortfall, so a converging pair ends at least `minSpacing` apart
 * everywhere. Of the two, the line that moves is the one whose move brings
 * no settled line beside it too close, then a line not yet placed, then the
 * line drawn shorter; a run of close lines thus opens outward from its
 * longest, and a stacked pair moves away from a neighbour it would crowd.
 * A line carrying a `fixed` (emphasis) stroke moves only when nothing else
 * can, and its emphasis moves with it. `broken` lines move like `segments`.
 *
 * After the moves every end is solved again. A line drawn at least three
 * least spacings long keeps its direction: an end meets again the steepest
 * line through it that crosses at least 10° (an unmoved one first), so an
 * unmoved line's ends only slide along it, a vertex where unmoved lines meet
 * stays put, a moved line is re-ended on the lines it ran to, and a break
 * between two pieces of one line keeps its place on the lines crossing it. A
 * shorter line is a connector: its ends follow the lines it joins. The
 * result is measured again and opened again, at most four times, and the
 * drawing that falls least short of the spacing is returned. Lengths are in
 * the segments' units.
 *
 * **Gotchas**
 *
 * Each returned array is the input array itself when no line moved, so a
 * caller can tell an untouched drawing by reference. Segments keep their
 * order and direction; only moved endpoints change. A spacing exactly at
 * `minSpacing` can print a hair under it once coordinates are rounded, so a
 * caller holding a printed spacing asks for a small margin more.
 *
 * **Example** (A board edge drawn 0.34 apart opens to 0.7)
 *
 * ```ts
 * import { separateCloseOutlines } from "@beep/technical-drawing/Outline.rules"
 *
 * const result = separateCloseOutlines({
 *   segments: [[0, 0, 100, 0], [0, 0.34, 90, 0.34]],
 *   minSpacing: 0.7,
 *   minOverlap: 1,
 *   coincidence: 0.15
 * })
 * console.log(result.segments[1], result.moves) // [0, 0.7, 90, 0.7] [0.36]
 * ```
 *
 * @param input - The movable segments, the broken lines drawn with them, the emphasis lines drawn over them, and
 * the spacing, overlap and coincidence thresholds in the segments' units.
 * @returns The separated segments, broken lines and emphasis lines, and how far each moved line moved.
 * @category utilities
 * @since 0.0.0
 */
export const separateCloseOutlines = (input: {
  readonly segments: ReadonlyArray<Segment2>;
  readonly broken?: ReadonlyArray<Segment2> | undefined;
  readonly fixed?: ReadonlyArray<Segment2> | undefined;
  readonly minSpacing: number;
  readonly minOverlap: number;
  readonly coincidence: number;
}): {
  readonly segments: ReadonlyArray<Segment2>;
  readonly broken: ReadonlyArray<Segment2>;
  readonly fixed: ReadonlyArray<Segment2>;
  readonly moves: ReadonlyArray<number>;
} => {
  const broken = input.broken ?? A.empty<Segment2>();
  const fixed = input.fixed ?? A.empty<Segment2>();
  const tolerances = { minSpacing: input.minSpacing, minOverlap: input.minOverlap, coincidence: input.coincidence };
  const all = [...input.segments, ...broken, ...fixed];
  const firstBroken = A.length(input.segments);
  const firstFixed = firstBroken + A.length(broken);
  const drawing = settle(all, firstFixed, tolerances);
  const moves = movesOf(all, drawing.shifts, input.coincidence);
  return A.isReadonlyArrayNonEmpty(moves)
    ? {
        segments: A.take(drawing.segments, firstBroken),
        broken: A.take(A.drop(drawing.segments, firstBroken), firstFixed - firstBroken),
        fixed: A.drop(drawing.segments, firstFixed),
        moves,
      }
    : { segments: input.segments, broken, fixed, moves };
};

/**
 * Centre spacings of drawn lines that run side by side closer than
 * `minSpacing`: one per pair of segments within 3° of parallel that overlap
 * along their length by at least `minOverlap`, whose nearer spacing over
 * that overlap lies above `coincidence` and under `minSpacing`.
 *
 * **Details**
 *
 * A pair is measured on the longer segment's line, at the two ends of the
 * overlap, so a converging pair reports its closest end. Pairs that cross
 * within the overlap, and pairs within `coincidence` (a line drawn twice),
 * are not reported. A pair {@link separateCloseOutlines} opened measures the
 * least spacing within float noise and is not reported either.
 *
 * **Example** (One pair 0.34 apart)
 *
 * ```ts
 * import { closeOutlineGaps } from "@beep/technical-drawing/Outline.rules"
 *
 * const gaps = closeOutlineGaps({
 *   segments: [[0, 0, 100, 0], [0, 0.34, 100, 0.34], [0, 2, 100, 2]],
 *   minSpacing: 0.7,
 *   minOverlap: 1,
 *   coincidence: 0.15
 * })
 * console.log(gaps) // [0.34]
 * ```
 *
 * @param input - The segments and the spacing, overlap and coincidence thresholds in their units.
 * @returns The closest spacing of every pair that runs too close, in the segments' units.
 * @category utilities
 * @since 0.0.0
 */
export const closeOutlineGaps = (input: {
  readonly segments: ReadonlyArray<Segment2>;
  readonly minSpacing: number;
  readonly minOverlap: number;
  readonly coincidence: number;
}): ReadonlyArray<number> =>
  shortGaps(A.map(input.segments, strokeOf), {
    minSpacing: input.minSpacing,
    minOverlap: input.minOverlap,
    coincidence: input.coincidence,
  });
