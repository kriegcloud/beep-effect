/**
 * Private raster ink-coverage comparison between two binary PPM (P6) pages:
 * how much of the base page's ink the marked page's (dilated) ink covers.
 *
 * @internal
 */

import { InkCoverage } from "../PdfTools.models.ts";
import { parseP6Header } from "./ppm.ts";

type InkMask = {
  readonly width: number;
  readonly height: number;
  readonly ink: Uint8Array;
  readonly count: number;
};

// Rec. 601 luma, integer arithmetic; the same ink rule as page measurement.
const isInk = (bytes: Uint8Array, i: number, blackThreshold: number): boolean =>
  ((bytes[i] ?? 0) * 299 + (bytes[i + 1] ?? 0) * 587 + (bytes[i + 2] ?? 0) * 114) / 1000 <= blackThreshold;

// One byte per pixel: 1 where the pixel is ink.
const inkMask = (options: { readonly bytes: Uint8Array; readonly blackThreshold: number }): InkMask => {
  const { bytes, blackThreshold } = options;
  const { width, height, offset } = parseP6Header(bytes);
  const ink = new Uint8Array(width * height);
  let count = 0;
  for (let p = 0; p < width * height; p += 1) {
    if (isInk(bytes, offset + p * 3, blackThreshold)) {
      ink[p] = 1;
      count += 1;
    }
  }
  return { width, height, ink, count };
};

// One separable pass of a square dilation: along rows (dx = 1) or columns.
const dilatePass = (mask: InkMask, radius: number, alongRows: boolean): Uint8Array => {
  const { width, height, ink } = mask;
  const out = new Uint8Array(width * height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (ink[y * width + x] === 1) {
        const from = Math.max(0, (alongRows ? x : y) - radius);
        const to = Math.min((alongRows ? width : height) - 1, (alongRows ? x : y) + radius);
        for (let t = from; t <= to; t += 1) {
          out[alongRows ? y * width + t : t * width + x] = 1;
        }
      }
    }
  }
  return out;
};

// Grow every ink pixel into a (2r+1)-pixel square.
const dilate = (options: { readonly mask: InkMask; readonly radius: number }): InkMask => {
  const { mask, radius } = options;
  if (radius <= 0) {
    return mask;
  }
  const rows = dilatePass(mask, radius, true);
  const ink = dilatePass({ ...mask, ink: rows }, radius, false);
  return { ...mask, ink };
};

/**
 * Compare two P6 rasters with zero offset from the top-left corner. Base ink
 * outside the marked raster's extent counts as uncovered.
 *
 * @internal
 */
export const inkCoverageOf = (options: {
  readonly base: Uint8Array;
  readonly marked: Uint8Array;
  readonly dilatePx: number;
  readonly blackThreshold: number;
}): InkCoverage => {
  const base = inkMask({ bytes: options.base, blackThreshold: options.blackThreshold });
  const markedInk = inkMask({ bytes: options.marked, blackThreshold: options.blackThreshold });
  const marked = dilate({ mask: markedInk, radius: options.dilatePx });
  let covered = 0;
  for (let y = 0; y < base.height; y += 1) {
    for (let x = 0; x < base.width; x += 1) {
      if (
        base.ink[y * base.width + x] === 1 &&
        x < marked.width &&
        y < marked.height &&
        marked.ink[y * marked.width + x] === 1
      ) {
        covered += 1;
      }
    }
  }
  return InkCoverage.make({
    baseInkPixels: base.count,
    coveredPixels: covered,
    markedInkPixels: markedInk.count,
    coverage: base.count === 0 ? 0 : covered / base.count,
  });
};
