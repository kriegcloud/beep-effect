import {
  closeOutlineGaps,
  OUTLINE_COINCIDENCE_MM,
  outlineSpacingFindings,
  Segment2,
  separateCloseOutlines,
  ValidationOptions,
} from "@beep/technical-drawing";
import { O } from "@beep/utils";
import { describe, expect, it } from "@effect/vitest";
import * as A from "effect/Array";

// Sheet millimetres at scale 1, with the validator's defaults: 0.7 mm least spacing over 1 mm, pairs within 0.15 mm
// one line drawn twice.
const separate = (
  segments: ReadonlyArray<Segment2>,
  emphasis: ReadonlyArray<Segment2> = [],
  broken: ReadonlyArray<Segment2> = []
) =>
  separateCloseOutlines({
    segments,
    broken,
    emphasis,
    minSpacing: 0.7,
    minOverlap: 1,
    coincidence: OUTLINE_COINCIDENCE_MM,
  });

const gaps = (segments: ReadonlyArray<Segment2>, minSpacing = 0.7) =>
  closeOutlineGaps({ segments, minSpacing, minOverlap: 1, coincidence: OUTLINE_COINCIDENCE_MM });

// Distance from a point to the line through a segment.
const offLine = ([x, y]: readonly [number, number], [x1, y1, x2, y2]: Segment2): number =>
  Math.abs((x - x1) * (y2 - y1) - (y - y1) * (x2 - x1)) / Math.hypot(x2 - x1, y2 - y1);

const round = (segment: Segment2): ReadonlyArray<number> => A.map(segment, (v) => Math.round(v * 1e9) / 1e9 + 0);

describe("separateCloseOutlines", () => {
  it("opens a board edge drawn 0.34 apart to 0.7, keeping both lines, its break, its T-end and its connector", () => {
    // A long outline, and beside it 0.34 above a line broken by a 3-wide crossing gap (B1, B2), with a partial
    // duplicate on it, a T-end standing on it and a short connector from its break down to the long line.
    const a: Segment2 = [0, 0, 100, 0];
    const b1: Segment2 = [5, 0.34, 40, 0.34];
    const b2: Segment2 = [43, 0.34, 95, 0.34];
    const duplicate: Segment2 = [20, 0.34, 30, 0.34];
    const tee: Segment2 = [50, 0.34, 50, 20];
    const connector: Segment2 = [40, 0.34, 41.7, 0];
    const input = [a, b1, b2, duplicate, tee, connector];
    const result = separate(input);
    const [outA, outB1, outB2, outDuplicate, outTee, outConnector] = A.map(result.segments, round);
    // the longer line stays put; the slotted line, its duplicate and every end on it move to 0.7
    expect(result.segments[0]).toBe(a);
    expect(outA).toEqual([0, 0, 100, 0]);
    expect(outB1).toEqual([5, 0.7, 40, 0.7]);
    expect(outB2).toEqual([43, 0.7, 95, 0.7]);
    expect(outDuplicate).toEqual([20, 0.7, 30, 0.7]);
    expect(outTee).toEqual([50, 0.7, 50, 20]);
    expect(outConnector).toEqual([40, 0.7, 41.7, 0]);
    // the crossing gap keeps its width, one line moved by the shortfall, and nothing runs closer than 0.7
    expect((outB2?.[0] ?? 0) - (outB1?.[2] ?? 0)).toBeCloseTo(3, 9);
    expect(A.map(result.moves, (move) => Math.round(move * 1e9) / 1e9)).toEqual([0.36]);
    expect(gaps(result.segments)).toEqual([]);
    expect(Math.min(...A.map(A.drop(result.segments, 1), (s) => offLine([s[0], s[1]], a)))).toBeGreaterThanOrEqual(
      0.7 - 1e-9
    );
    // before, the pairs were 0.34 apart
    expect(A.dedupe(A.map(gaps(input), (gap) => Math.round(gap * 1e9) / 1e9))).toEqual([0.34]);
  });

  it("shifts a converging pair uniformly until its closer end stands 0.7 apart", () => {
    const input: ReadonlyArray<Segment2> = [
      [0, 0, 100, 0],
      [0, 0.5, 100, 0.62],
    ];
    const result = separate(input);
    // the converging line is a hair longer, so the level one moves, once, by the shortfall at the closer end
    expect(A.length(result.moves)).toBe(1);
    expect(result.segments[1]).toBe(input[1]);
    const [x1 = 0, y1 = 0, x2 = 0, y2 = 0] = result.segments[0] ?? [];
    // a shift, not a turn: both ends moved alike
    expect(x1 - 0).toBeCloseTo(x2 - 100, 12);
    expect(y1 - 0).toBeCloseTo(y2 - 0, 12);
    // measured as the validator measures, the pair now stands 0.7 apart at its closer end and nowhere closer
    expect(gaps(result.segments)).toEqual([]);
    const [closest = 0] = gaps(result.segments, 0.71);
    expect(closest).toBeCloseTo(0.7, 9);
    expect(Math.min(...gaps(input))).toBeCloseTo(0.5, 6);
  });

  it("opens a run of three lines 0.6 apart outward from the longest", () => {
    const result = separate([
      [0, 0, 100, 0],
      [0, 0.6, 90, 0.6],
      [0, 1.2, 80, 1.2],
    ]);
    expect(A.map(result.segments, round)).toEqual([
      [0, 0, 100, 0],
      [0, 0.7, 90, 0.7],
      [0, 1.4, 80, 1.4],
    ]);
    expect(A.map(result.moves, (move) => Math.round(move * 1e9) / 1e9)).toEqual([0.1, 0.2]);
  });

  it("slides a vertex along the steep line it meets, and keeps an emphasised outline in place", () => {
    // the short line's left end is a corner on an unmoved line rising at about 31°: the corner slides up that line
    const corner = separate([
      [0, 0, 100, 0],
      [10, 0.4, 90, 0.4],
      [10, 0.4, 60, 30],
    ]);
    const slope = 29.6 / 50;
    expect(A.map(corner.segments, round)).toEqual([
      [0, 0, 100, 0],
      round([10 + 0.3 / slope, 0.7, 90, 0.7]),
      round([10 + 0.3 / slope, 0.7, 60, 30]),
    ]);
    // an emphasis line drawn over the shorter outline pins it: the longer one moves instead
    const pinned = separate(
      [
        [0, 0, 60, 0],
        [0, 0.34, 100, 0.34],
      ],
      [[0, 0.002, 60, 0.002]]
    );
    expect(A.map(pinned.segments, round)).toEqual([
      [0, 0, 60, 0],
      [0, 0.702, 100, 0.702],
    ]);
  });

  it("keeps an unmoved line on its own line where its ends meet moved lines, so it closes no pair again", () => {
    // An anchor drawn in three pieces at y = 0 (breaks at x 30-33 and 67-70), a shorter line beside it 0.34 above,
    // and two obliques at 22° ending on the anchor's centre piece, each 0.5 from a longer partner, so they move.
    // Re-solved point by point, the centre piece followed the obliques and was dragged 0.18 toward the moved line,
    // closing that pair to 0.52 again (review loop 4, R4-01, F11-01).
    const angle = (22 * Math.PI) / 180;
    const [c, s] = [Math.cos(angle), Math.sin(angle)];
    const left: Segment2 = [33 - 40 * c, -40 * s, 33, 0];
    const leftPartner: Segment2 = [33 - 50 * c + 0.5 * s, -50 * s - 0.5 * c, 33 - 2 * c + 0.5 * s, -2 * s - 0.5 * c];
    const right: Segment2 = [67, 0, 67 + 40 * c, -40 * s];
    const rightPartner: Segment2 = [67 + 2 * c - 0.5 * s, -2 * s - 0.5 * c, 67 + 50 * c - 0.5 * s, -50 * s - 0.5 * c];
    const input: ReadonlyArray<Segment2> = [
      [0, 0, 30, 0],
      [33, 0, 67, 0],
      [70, 0, 100, 0],
      [5, 0.34, 95, 0.34],
      left,
      leftPartner,
      right,
      rightPartner,
    ];
    const result = separate(input);
    const at = (i: number) => A.getUnsafe(result.segments, i);
    // every piece of the anchor stays on y = 0, so the anchor stays one straight line
    A.forEach([0, 1, 2], (i) => {
      expect(Math.abs(at(i)[1])).toBeLessThan(1e-9);
      expect(Math.abs(at(i)[3])).toBeLessThan(1e-9);
    });
    // its centre piece's ends slid along it to where the moved obliques now meet it, and the obliques end there
    expect(Math.abs(at(1)[0] - at(4)[2]) + Math.abs(at(1)[1] - at(4)[3])).toBeLessThan(1e-9);
    expect(Math.abs(at(1)[2] - at(6)[0]) + Math.abs(at(1)[3] - at(6)[1])).toBeLessThan(1e-9);
    // nothing runs closer than 0.7 any more
    expect(gaps(result.segments)).toEqual([]);
    expect(A.length(result.moves)).toBe(3);
  });

  it("keeps a vertical vertical and a break its width where a moved line and a moved oblique meet on it", () => {
    // A slotted line 0.34 above a longer anchor, broken by a 3-wide crossing gap (x 40-43) whose edges are unmoved
    // verticals, and a 20° oblique ending at the gap's left end, 0.4 from a longer partner, so it moves too. The
    // vertex on two moved lines was put at their new intersection, leaning the vertical 0.32° and widening the break
    // (review loop 4, R4-02, F11-02).
    const angle = (20 * Math.PI) / 180;
    const [c, s] = [Math.cos(angle), Math.sin(angle)];
    const input: ReadonlyArray<Segment2> = [
      [0, 0, 100, 0],
      [5, 0.34, 40, 0.34],
      [43, 0.34, 95, 0.34],
      [40, 0.34, 40, 20],
      [43, 0.34, 43, 20],
      [40 - 30 * c, 0.34 + 30 * s, 40, 0.34],
      [40 - 45 * c - 0.4 * s, 0.34 + 45 * s - 0.4 * c, 40 - 3 * c - 0.4 * s, 0.34 + 3 * s - 0.4 * c],
    ];
    const result = separate(input);
    const at = (i: number) => A.getUnsafe(result.segments, i);
    // both verticals keep their x at both ends and stand on the moved line
    expect([at(3)[0], at(3)[2], at(4)[0], at(4)[2]]).toEqual([40, 40, 43, 43]);
    expect([at(3)[1], at(4)[1]]).toEqual([at(1)[3], at(2)[1]]);
    // the slotted line moved whole, so its pieces stay collinear and its break keeps its 3 units
    expect(at(1)[1]).toBeCloseTo(0.7, 12);
    expect(at(2)[1]).toBeCloseTo(0.7, 12);
    expect(at(2)[0] - at(1)[2]).toBeGreaterThanOrEqual(3 - 1e-9);
    // the oblique keeps its direction, re-ended on the vertical it ran to
    const direction = ([x1, y1, x2, y2]: Segment2) => Math.atan2(y2 - y1, x2 - x1);
    expect(direction(at(5))).toBeCloseTo(direction(A.getUnsafe(input, 5)), 12);
    expect(at(5)[2]).toBeCloseTo(40, 12);
    expect(gaps(result.segments)).toEqual([]);
  });

  it("moves a line away from a settled neighbour it would crowd, even when it is the longer line", () => {
    // Two thin boards' edge pairs stacked 0.9 apart. The upper pair opens first (its longer line, 120, stays). Moving
    // the lower pair's shorter line up would bring it 0.6 under the settled upper pair, so the lower pair's longer line
    // moves down instead (review loop 4, R4-03).
    const result = separate([
      [0, 0, 100, 0],
      [5, 0.4, 95, 0.4],
      [-10, 1.3, 110, 1.3],
      [8, 1.7, 93, 1.7],
    ]);
    expect(A.map(result.segments, round)).toEqual([
      [0, -0.3, 100, -0.3],
      [5, 0.4, 95, 0.4],
      [-10, 1.3, 110, 1.3],
      [8, 2, 93, 2],
    ]);
    expect(gaps(result.segments)).toEqual([]);
  });

  it("re-ends an emphasis line with the outline it is drawn over", () => {
    // A T-end standing on a line that moves 0.36 carries an emphasis line: both are re-ended on the moved line, so the
    // emphasis never runs past it into the gap between the pair (review loop 4, R4-04).
    const stem: Segment2 = [50, 0.34, 50, 20];
    const result = separate([[0, 0, 100, 0], [5, 0.34, 95, 0.34], stem], [stem]);
    expect(A.map(result.segments, round)).toEqual([
      [0, 0, 100, 0],
      [5, 0.7, 95, 0.7],
      [50, 0.7, 50, 20],
    ]);
    expect(A.map(result.emphasis, round)).toEqual([[50, 0.7, 50, 20]]);
  });

  it("opens pairs of broken lines and of emphasised outlines, which no other line can make room for", () => {
    // Two broken (unclaimed) board edges 0.4 apart move like outlines (review loop 4, R4-05).
    const brokenPair: ReadonlyArray<Segment2> = [
      [0, 0, 100, 0],
      [0, 0.4, 90, 0.4],
    ];
    const broken = separate([], [], brokenPair);
    expect(A.map(broken.broken, round)).toEqual([
      [0, 0, 100, 0],
      [0, 0.7, 90, 0.7],
    ]);
    expect(gaps(broken.broken)).toEqual([]);
    // Two emphasised outlines 0.4 apart: with nothing else to move, the shorter moves, its emphasis with it.
    const outlines: ReadonlyArray<Segment2> = [
      [0, 0, 100, 0],
      [0, 0.4, 90, 0.4],
    ];
    const emphasised = separate(outlines, outlines);
    expect(A.map(emphasised.segments, round)).toEqual([
      [0, 0, 100, 0],
      [0, 0.7, 90, 0.7],
    ]);
    expect(A.map(emphasised.emphasis, round)).toEqual(A.map(emphasised.segments, round));
    expect(gaps([...emphasised.segments, ...emphasised.emphasis])).toEqual([]);
  });

  it("moves only the collinear edge a close line runs beside, never a distant edge level with it", () => {
    // Two boxes' level tops 30 apart, and a long line 0.34 above the first top only. The longer line stays, so the
    // first top moves down; the second top has no close neighbour and stays. Grouped as one line by their common
    // level, both tops moved (review loop 4, thread on Outline.rules.ts:252).
    const firstTop: Segment2 = [0, 0, 30, 0];
    const secondTop: Segment2 = [60, 0, 90, 0];
    const result = separate([firstTop, secondTop, [-50, 0.34, 35, 0.34]]);
    expect(A.map(result.segments, round)).toEqual([
      [0, -0.36, 30, -0.36],
      [60, 0, 90, 0],
      [-50, 0.34, 35, 0.34],
    ]);
    expect(result.segments[1]).toBe(secondTop);
    expect(A.map(result.moves, (move) => Math.round(move * 1e9) / 1e9)).toEqual([0.36]);
    expect(gaps(result.segments)).toEqual([]);
    // the same tops meeting their own sides at their corners: still two lines, and the second top stays
    const boxes = separate([
      firstTop,
      [0, 0, 0, -10],
      [30, 0, 30, -10],
      secondTop,
      [60, 0, 60, -10],
      [90, 0, 90, -10],
      [-50, 0.34, 35, 0.34],
    ]);
    expect(A.map(boxes.segments, round)[0]).toEqual([0, -0.36, 30, -0.36]);
    expect(boxes.segments[3]).toBe(secondTop);
  });

  it("moves the pieces of an edge seen either side of a wide part in front together", () => {
    // A thin board's face seen obliquely: its edges 0.34 apart, sheared 2 along, behind a post 12 wide, so each edge
    // shows as two pieces whose ends facing the post stand in the post's sides. On each side of the post the shorter
    // piece of a close pair moves, and the shear makes that the far edge on the left and the near edge on the right:
    // grouped only across a narrow break, the pieces went opposite ways and both edges jogged across the post.
    const result = separate([
      [0, 0, 40, 0],
      [52, 0, 100, 0],
      [2, 0.34, 40, 0.34],
      [52, 0.34, 102, 0.34],
      [0, 0, 2, 0.34],
      [100, 0, 102, 0.34],
      [40, -8, 40, 8],
      [52, -8, 52, 8],
    ]);
    const [nearLeft, nearRight, farLeft, farRight] = A.map(A.take(result.segments, 4), round);
    expect([nearLeft?.[1], nearLeft?.[3]]).toEqual([nearRight?.[1], nearRight?.[3]]);
    expect([farLeft?.[1], farLeft?.[3]]).toEqual([farRight?.[1], farRight?.[3]]);
    expect(A.map(result.moves, (move) => Math.round(move * 1e9) / 1e9)).toEqual([0.36]);
    expect(gaps(result.segments)).toEqual([]);
  });

  it("re-ends a T-end the kernel rounded off its oblique line on a drawing enlarged ten times", () => {
    // Ten sheet mm a model unit, coordinates rounded to three decimals as the kernel rounds them: an oblique pair 0.034
    // apart (0.34 mm) and a stem standing on the shorter line, whose rounded foot sits 0.00065 off that line. The
    // join tolerance (0.15 mm x 0.02 = 0.0003 units) missed it, so the stem stayed behind when its line moved
    // (review loop 4, thread on Outline.rules.ts:117).
    const a: Segment2 = [0, 0, 8.66, 5];
    const b: Segment2 = [0.416, 0.279, 8.21, 4.779];
    const stem: Segment2 = [1.757, 1.054, 1.41, 3.024];
    const tolerances = { minSpacing: 0.07, minOverlap: 0.1, coincidence: OUTLINE_COINCIDENCE_MM / 10 };
    expect(offLine([stem[0], stem[1]], b)).toBeGreaterThan(tolerances.coincidence * 0.02);
    const result = separateCloseOutlines({ segments: [a, b, stem], quantum: 0.001, ...tolerances });
    const [, movedB = b, movedStem = stem] = result.segments;
    // the shorter line moved 0.0364 off its partner, and the stem's foot followed it along the stem
    expect(A.map(result.moves, (move) => Math.round(move * 1e4) / 1e4)).toEqual([0.0364]);
    expect(offLine([movedStem[0], movedStem[1]], movedB)).toBeLessThan(1e-9);
    expect(offLine([movedStem[0], movedStem[1]], stem)).toBeLessThan(1e-9);
    expect([movedStem[2], movedStem[3]]).toEqual([stem[2], stem[3]]);
    expect(closeOutlineGaps({ segments: result.segments, ...tolerances })).toEqual([]);
  });

  it("returns its input untouched when no pair runs too close", () => {
    const cases: ReadonlyArray<ReadonlyArray<Segment2>> = [
      // 0.75 apart: clear
      [
        [0, 0, 100, 0],
        [0, 0.75, 100, 0.75],
      ],
      // 0.003 apart: one line drawn twice (an emphasis line over its outline)
      [
        [0, 0, 100, 0],
        [0, 0.003, 100, 0.003],
      ],
      // 0.42 apart but overlapping only 0.73: a corner return
      [
        [0, 0, 10, 0],
        [9.27, 0.42, 20, 0.42],
      ],
      [],
    ];
    A.forEach(cases, (segments) => {
      const result = separate(segments, [], segments);
      expect(result.segments).toBe(segments);
      expect(result.broken).toBe(segments);
      expect(result.moves).toEqual([]);
    });
  });
});

describe("outlineSpacingFindings", () => {
  const options = ValidationOptions.make({ expectedPages: O.none() });
  const findings = (pair: ReadonlyArray<Segment2>) =>
    outlineSpacingFindings({ page: 3, segmentsMm: A.map(pair, (s) => Segment2.make(s)), options });

  it("flags drawn lines that run side by side closer than 0.7 mm, once per sheet", () => {
    const flagged = findings([
      [0, 0, 100, 0],
      [0, 0.34, 100, 0.34],
    ]);
    expect(A.map(flagged, (f) => [f.code, f.page])).toEqual([["outline-spacing", O.some(3)]]);
    expect(flagged[0]?.message).toContain("closest are 0.34 mm apart");
    expect([options.minOutlineSpacingMm, options.minOutlineOverlapMm]).toEqual([0.7, 1]);
  });

  it("never prints a spacing a hair under the least spacing as the spacing itself", () => {
    // 0.6997 apart: rounded to two decimals it read "0.70 mm apart" under a 0.7 mm rule (review loop 4, R4-06)
    const [flagged] = findings([
      [0, 0, 100, 0],
      [0, 0.6997, 100, 0.6997],
    ]);
    expect(flagged?.message).toContain("closest are 0.699 mm apart");
  });

  it("passes a clear pair, an emphasis line over its outline, and a short corner return", () => {
    expect(
      findings([
        [0, 0, 100, 0],
        [0, 0.75, 100, 0.75],
      ])
    ).toEqual([]);
    expect(
      findings([
        [0, 0, 100, 0],
        [0, 0.003, 100, 0.003],
      ])
    ).toEqual([]);
    expect(
      findings([
        [0, 0, 10, 0],
        [9.27, 0.42, 20, 0.42],
      ])
    ).toEqual([]);
  });
});
