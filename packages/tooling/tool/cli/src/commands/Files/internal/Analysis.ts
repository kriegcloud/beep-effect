/**
 * Per-file border analysis for Files commands.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { A } from "@beep/utils";
import * as Effect from "effect/Effect";
import { analyzeSolidBorders, classifyBorderSides } from "../Files.media.ts";
import { DetectBordersEntry } from "../Files.schemas.ts";
import { BorderDetectionThresholds, RawImagePixelData } from "./BorderDetection.ts";
import { readImagePixelsForBorderDetection } from "./MediaExec.ts";
import type { FilesCommandError } from "../Files.errors.ts";
import type { DetectBordersOptions, SortableFile } from "../Files.schemas.ts";

/**
 * Analyze a single image for solid border sides.
 *
 * @param file - Selected image file.
 * @param options - Border detection thresholds.
 * @returns Border detection entry for the image.
 * @category analysis
 * @since 0.0.0
 */
export const analyzeDetectBordersFile = Effect.fn("Files.analyzeDetectBordersFile")(function* (
  file: SortableFile,
  options: DetectBordersOptions
): Effect.fn.Return<DetectBordersEntry, FilesCommandError> {
  const pixels = yield* readImagePixelsForBorderDetection(file);
  const sides = analyzeSolidBorders(RawImagePixelData.make(pixels), BorderDetectionThresholds.make(options));
  const classification = classifyBorderSides(sides);
  const borderCount = A.length(A.filter(sides, (side) => side.matched));

  return DetectBordersEntry.make({
    borderCount,
    classification,
    extension: file.extension,
    hasBorder: borderCount > 0,
    height: pixels.height,
    sides,
    sourceName: file.name,
    sourcePath: file.sourcePath,
    width: pixels.width,
  });
});
