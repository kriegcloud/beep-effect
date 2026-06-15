---
title: Files.media.ts
nav_order: 32
parent: "@beep/repo-cli"
---

## Files.media.ts overview

Media planning and rendering helpers for dataset file curation commands.

Since v0.0.0

---
## Exports Grouped by Category
- [utilities](#utilities)
  - [analyzeSolidBorders](#analyzesolidborders)
  - [assessImageCandidate](#assessimagecandidate)
  - [byNameAscending](#bynameascending)
  - [bySizeDescendingThenNameAscending](#bysizedescendingthennameascending)
  - [classifyBorderSides](#classifybordersides)
  - [collectText](#collecttext)
  - [cropBordersPlanEntryFromDetection](#cropbordersplanentryfromdetection)
  - [formatIndex](#formatindex)
  - [hasSkippedFiles](#hasskippedfiles)
  - [isExifOrientationRotated](#isexiforientationrotated)
  - [isImageFileExtension](#isimagefileextension)
  - [isQuarterTurnRotation](#isquarterturnrotation)
  - [isSupportedMetadataImageExtension](#issupportedmetadataimageextension)
  - [isSupportedMetadataImageFile](#issupportedmetadataimagefile)
  - [isVideoFileExtension](#isvideofileextension)
  - [makeStripMetadataTempEntries](#makestripmetadatatempentries)
  - [maybeSwapDimensions](#maybeswapdimensions)
  - [mediaDimensionsChanged](#mediadimensionschanged)
  - [mediaKindFromExtension](#mediakindfromextension)
  - [normalizeBareExtension](#normalizebareextension)
  - [normalizeOutputDimensions](#normalizeoutputdimensions)
  - [normalizeOutputExtension](#normalizeoutputextension)
  - [renderArchivePoorCandidatesEntry](#renderarchivepoorcandidatesentry)
  - [renderArchivePoorCandidatesSkippedEntry](#renderarchivepoorcandidatesskippedentry)
  - [renderCreateCaptionFilesPlanEntry](#rendercreatecaptionfilesplanentry)
  - [renderCreateCaptionFilesSkippedEntry](#rendercreatecaptionfilesskippedentry)
  - [renderCropBordersPlanEntry](#rendercropbordersplanentry)
  - [renderDetectBordersEntry](#renderdetectbordersentry)
  - [renderDetectBordersSkippedEntry](#renderdetectbordersskippedentry)
  - [renderDetectFacesEntry](#renderdetectfacesentry)
  - [renderDetectFacesSkippedEntry](#renderdetectfacesskippedentry)
  - [renderNormalizePlanEntry](#rendernormalizeplanentry)
  - [renderNormalizeSkippedEntry](#rendernormalizeskippedentry)
  - [renderPlanEntry](#renderplanentry)
  - [renderStripMetadataPlanEntry](#renderstripmetadataplanentry)
  - [rgbToHex](#rgbtohex)
  - [rotationFromStream](#rotationfromstream)
  - [roundCandidateMetric](#roundcandidatemetric)
  - [selectedCanonicalPathSet](#selectedcanonicalpathset)
  - [sharpFormatForNormalize](#sharpformatfornormalize)
  - [targetNameForEntry](#targetnameforentry)
---

# utilities

## analyzeSolidBorders

Analyze raw RGB image pixels for near-solid borders on all four sides.

**Example**

```ts
import { analyzeSolidBorders } from "@beep/repo-cli/commands/Files"
console.log(analyzeSolidBorders)
```

**Signature**

```ts
declare const analyzeSolidBorders: { (thresholds: BorderDetectionThresholds): (image: RawImagePixelData) => ReadonlyArray<DetectBorderSideMeasurement>; (image: RawImagePixelData, thresholds: BorderDetectionThresholds): ReadonlyArray<DetectBorderSideMeasurement>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.media.ts#L944)

Since v0.0.0

## assessImageCandidate

Assess image dimensions against hard candidate-quality thresholds.

**Example**

```ts
import { assessImageCandidate } from "@beep/repo-cli/commands/Files"
console.log(assessImageCandidate)
```

**Signature**

```ts
declare const assessImageCandidate: { (thresholds: CandidateAssessmentThresholds): (dimensions: MediaDimensions) => CandidateAssessmentResult; (dimensions: MediaDimensions, thresholds: CandidateAssessmentThresholds): CandidateAssessmentResult; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.media.ts#L789)

Since v0.0.0

## byNameAscending

Order regular files by name ascending.

**Example**

```ts
import { byNameAscending } from "@beep/repo-cli/commands/Files"
console.log(byNameAscending)
```

**Signature**

```ts
declare const byNameAscending: Order.Order<SortableFile>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.media.ts#L337)

Since v0.0.0

## bySizeDescendingThenNameAscending

Order regular files by size descending, then name ascending.

**Example**

```ts
import { bySizeDescendingThenNameAscending } from "@beep/repo-cli/commands/Files"
console.log(bySizeDescendingThenNameAscending)
```

**Signature**

```ts
declare const bySizeDescendingThenNameAscending: Order.Order<SortableFile>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.media.ts#L321)

Since v0.0.0

## classifyBorderSides

Classify an analyzed image from its matched border sides.

**Example**

```ts
import { classifyBorderSides } from "@beep/repo-cli/commands/Files"
console.log(classifyBorderSides)
```

**Signature**

```ts
declare const classifyBorderSides: (sides: ReadonlyArray<DetectBorderSideMeasurement>) => BorderDetectionKind
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.media.ts#L893)

Since v0.0.0

## collectText

Collect a byte stream into trimmed text.

**Example**

```ts
import { collectText } from "@beep/repo-cli/commands/Files"
console.log(collectText)
```

**Signature**

```ts
declare const collectText: <E>(stream: Stream.Stream<Uint8Array, E>) => Effect.Effect<string, E, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.media.ts#L416)

Since v0.0.0

## cropBordersPlanEntryFromDetection

Convert a detected-border entry into a valid crop plan entry.

**Example**

```ts
import { cropBordersPlanEntryFromDetection } from "@beep/repo-cli/commands/Files"
console.log(cropBordersPlanEntryFromDetection)
```

**Signature**

```ts
declare const cropBordersPlanEntryFromDetection: (entry: DetectBordersEntry) => O.Option<CropBordersPlanEntry>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.media.ts#L1062)

Since v0.0.0

## formatIndex

Format a zero-padded numeric index.

**Example**

```ts
import { formatIndex } from "@beep/repo-cli/commands/Files"
console.log(formatIndex)
```

**Signature**

```ts
declare const formatIndex: { (width: number): (index: number) => string; (index: number, width: number): string; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.media.ts#L398)

Since v0.0.0

## hasSkippedFiles

Check whether a plan skipped any files.

**Example**

```ts
import { hasSkippedFiles } from "@beep/repo-cli/commands/Files"
console.log(hasSkippedFiles)
```

**Signature**

```ts
declare const hasSkippedFiles: (skippedCount: number) => boolean
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.media.ts#L555)

Since v0.0.0

## isExifOrientationRotated

Check whether an EXIF orientation value implies a quarter-turn image.

**Example**

```ts
import { isExifOrientationRotated } from "@beep/repo-cli/commands/Files"
console.log(isExifOrientationRotated)
```

**Signature**

```ts
declare const isExifOrientationRotated: (orientation: number) => boolean
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.media.ts#L439)

Since v0.0.0

## isImageFileExtension

Schema-derived image extension guard.

**Example**

```ts
import { isImageFileExtension } from "@beep/repo-cli/commands/Files"
console.log(isImageFileExtension)
```

**Signature**

```ts
declare const isImageFileExtension: <I>(input: I) => input is I & ("sub" | "png" | "jpg" | "jpeg" | "webp" | "exr" | "avci" | "avcs" | "avif" | "bmp" | "cgm" | "drle" | "emf" | "fits" | "g3" | "gif" | "heic" | "heics" | "heif" | "heifs" | "hej2" | "hsj2" | "ief" | "jls" | "jp2" | "jpg2" | "jpe" | "jfif" | "pjpeg" | "pjp" | "jph" | "jhc" | "jpm" | "jpx" | "jpf" | "jxr" | "jxra" | "jxrs" | "jxs" | "jxsc" | "jxsi" | "jxss" | "ktx" | "ktx2" | "btif" | "pti" | "sgi" | "svg" | "svgz" | "t38" | "tif" | "tiff" | "tfx" | "psd" | "azv" | "uvi" | "uvvi" | "uvg" | "uvvg" | "djvu" | "djv" | "dwg" | "dxf" | "fbs" | "fpx" | "fst" | "mmr" | "rlc" | "ico" | "mdi" | "wdp" | "npx" | "b16" | "tap" | "vtf" | "wbmp" | "xif" | "pcx" | "wmf" | "3ds" | "ras" | "cmx" | "fh" | "fhc" | "fh4" | "fh5" | "fh7" | "jng" | "sid" | "pic" | "pct" | "pnm" | "pbm" | "pgm" | "ppm" | "rgb" | "tga" | "xbm" | "xpm" | "xwd")
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.media.ts#L282)

Since v0.0.0

## isQuarterTurnRotation

Check whether a video rotation value implies a quarter-turn image.

**Example**

```ts
import { isQuarterTurnRotation } from "@beep/repo-cli/commands/Files"
console.log(isQuarterTurnRotation)
```

**Signature**

```ts
declare const isQuarterTurnRotation: (rotation: number) => boolean
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.media.ts#L454)

Since v0.0.0

## isSupportedMetadataImageExtension

Schema-derived metadata-strip image extension guard.

**Example**

```ts
import { isSupportedMetadataImageExtension } from "@beep/repo-cli/commands/Files"
console.log(isSupportedMetadataImageExtension)
```

**Signature**

```ts
declare const isSupportedMetadataImageExtension: <I>(input: I) => input is I & ("png" | "jpg" | "jpeg" | "webp" | "avif" | "tif" | "tiff")
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.media.ts#L308)

Since v0.0.0

## isSupportedMetadataImageFile

Check whether a selected image file can be normalized by metadata stripping.

**Example**

```ts
import { isSupportedMetadataImageFile } from "@beep/repo-cli/commands/Files"
console.log(isSupportedMetadataImageFile)
```

**Signature**

```ts
declare const isSupportedMetadataImageFile: (file: SortableFile) => boolean
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.media.ts#L1155)

Since v0.0.0

## isVideoFileExtension

Schema-derived video extension guard.

**Example**

```ts
import { isVideoFileExtension } from "@beep/repo-cli/commands/Files"
console.log(isVideoFileExtension)
```

**Signature**

```ts
declare const isVideoFileExtension: <I>(input: I) => input is I & ("jpm" | "3gp" | "3gpp" | "3g2" | "h261" | "h263" | "h264" | "m4s" | "jpgv" | "jpgm" | "mj2" | "mjp2" | "ts" | "mp4" | "mp4v" | "mpg4" | "mpeg" | "mpg" | "mpe" | "m1v" | "m2v" | "ogv" | "qt" | "mov" | "uvh" | "uvvh" | "uvm" | "uvvm" | "uvp" | "uvvp" | "uvs" | "uvvs" | "uvv" | "uvvv" | "dvb" | "fvt" | "mxu" | "m4u" | "pyv" | "uvu" | "uvvu" | "viv" | "webm" | "f4v" | "fli" | "flv" | "m4v" | "mkv" | "mk3d" | "mks" | "mng" | "asf" | "asx" | "vob" | "wm" | "wmv" | "wmx" | "wvx" | "avi" | "movie" | "smv")
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.media.ts#L295)

Since v0.0.0

## makeStripMetadataTempEntries

Build temporary output paths for metadata stripping.

**Example**

```ts
import { makeStripMetadataTempEntries } from "@beep/repo-cli/commands/Files"
console.log(makeStripMetadataTempEntries)
```

**Signature**

```ts
declare const makeStripMetadataTempEntries: { (plan: ReadonlyArray<StripMetadataPlanEntry>, path: Path.Path): (tempDir: string) => ReadonlyArray<StripMetadataTempEntry>; (tempDir: string, plan: ReadonlyArray<StripMetadataPlanEntry>, path: Path.Path): ReadonlyArray<StripMetadataTempEntry>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.media.ts#L1123)

Since v0.0.0

## maybeSwapDimensions

Swap dimensions when a media orientation requires it.

**Example**

```ts
import { maybeSwapDimensions } from "@beep/repo-cli/commands/Files"
console.log(maybeSwapDimensions)
```

**Signature**

```ts
declare const maybeSwapDimensions: { (swap: boolean): (dimensions: MediaDimensions) => MediaDimensions; (dimensions: MediaDimensions, swap: boolean): MediaDimensions; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.media.ts#L473)

Since v0.0.0

## mediaDimensionsChanged

Check whether two media dimensions differ.

**Example**

```ts
import { mediaDimensionsChanged } from "@beep/repo-cli/commands/Files"
console.log(mediaDimensionsChanged)
```

**Signature**

```ts
declare const mediaDimensionsChanged: { (right: MediaDimensions): (left: MediaDimensions) => boolean; (left: MediaDimensions, right: MediaDimensions): boolean; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.media.ts#L752)

Since v0.0.0

## mediaKindFromExtension

Resolve a media kind from a file extension.

**Example**

```ts
import { mediaKindFromExtension } from "@beep/repo-cli/commands/Files"
console.log(mediaKindFromExtension)
```

**Signature**

```ts
declare const mediaKindFromExtension: (extension: string) => O.Option<MediaKind>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.media.ts#L370)

Since v0.0.0

## normalizeBareExtension

Normalize a file extension to a lowercase bare extension.

**Example**

```ts
import { normalizeBareExtension } from "@beep/repo-cli/commands/Files"
console.log(normalizeBareExtension)
```

**Signature**

```ts
declare const normalizeBareExtension: (extension: string) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.media.ts#L355)

Since v0.0.0

## normalizeOutputDimensions

Calculate downscaled dimensions for a max long edge without upscaling.

**Example**

```ts
import { normalizeOutputDimensions } from "@beep/repo-cli/commands/Files"
console.log(normalizeOutputDimensions)
```

**Signature**

```ts
declare const normalizeOutputDimensions: { (maxLongEdge: O.Option<number>): (dimensions: MediaDimensions) => MediaDimensions; (dimensions: MediaDimensions, maxLongEdge: O.Option<number>): MediaDimensions; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.media.ts#L718)

Since v0.0.0

## normalizeOutputExtension

Resolve the file extension emitted for a canonical normalize format.

**Example**

```ts
import { normalizeOutputExtension } from "@beep/repo-cli/commands/Files"
console.log(normalizeOutputExtension)
```

**Signature**

```ts
declare const normalizeOutputExtension: (format: NormalizeImageFormat) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.media.ts#L686)

Since v0.0.0

## renderArchivePoorCandidatesEntry

Render a poor-candidate archive plan entry.

**Example**

```ts
import { renderArchivePoorCandidatesEntry } from "@beep/repo-cli/commands/Files"
console.log(renderArchivePoorCandidatesEntry)
```

**Signature**

```ts
declare const renderArchivePoorCandidatesEntry: (entry: ArchivePoorCandidatesEntry) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.media.ts#L839)

Since v0.0.0

## renderArchivePoorCandidatesSkippedEntry

Render a skipped poor-candidate archive source entry.

**Example**

```ts
import { renderArchivePoorCandidatesSkippedEntry } from "@beep/repo-cli/commands/Files"
console.log(renderArchivePoorCandidatesSkippedEntry)
```

**Signature**

```ts
declare const renderArchivePoorCandidatesSkippedEntry: (entry: ArchivePoorCandidatesSkippedEntry) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.media.ts#L861)

Since v0.0.0

## renderCreateCaptionFilesPlanEntry

Render a caption sidecar creation plan entry.

**Example**

```ts
import { renderCreateCaptionFilesPlanEntry } from "@beep/repo-cli/commands/Files"
console.log(renderCreateCaptionFilesPlanEntry)
```

**Signature**

```ts
declare const renderCreateCaptionFilesPlanEntry: (entry: CreateCaptionFilesPlanEntry) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.media.ts#L622)

Since v0.0.0

## renderCreateCaptionFilesSkippedEntry

Render a skipped caption sidecar creation source entry.

**Example**

```ts
import { renderCreateCaptionFilesSkippedEntry } from "@beep/repo-cli/commands/Files"
console.log(renderCreateCaptionFilesSkippedEntry)
```

**Signature**

```ts
declare const renderCreateCaptionFilesSkippedEntry: (entry: CreateCaptionFilesSkippedEntry) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.media.ts#L638)

Since v0.0.0

## renderCropBordersPlanEntry

Render a border crop plan entry.

**Example**

```ts
import { renderCropBordersPlanEntry } from "@beep/repo-cli/commands/Files"
console.log(renderCropBordersPlanEntry)
```

**Signature**

```ts
declare const renderCropBordersPlanEntry: (entry: CropBordersPlanEntry) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.media.ts#L1105)

Since v0.0.0

## renderDetectBordersEntry

Render a detected-border report entry.

**Example**

```ts
import { renderDetectBordersEntry } from "@beep/repo-cli/commands/Files"
console.log(renderDetectBordersEntry)
```

**Signature**

```ts
declare const renderDetectBordersEntry: (entry: DetectBordersEntry) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.media.ts#L969)

Since v0.0.0

## renderDetectBordersSkippedEntry

Render a skipped border-detection source entry.

**Example**

```ts
import { renderDetectBordersSkippedEntry } from "@beep/repo-cli/commands/Files"
console.log(renderDetectBordersSkippedEntry)
```

**Signature**

```ts
declare const renderDetectBordersSkippedEntry: (entry: DetectBordersSkippedEntry) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.media.ts#L993)

Since v0.0.0

## renderDetectFacesEntry

Render a face-detection report entry.

**Example**

```ts
import { renderDetectFacesEntry } from "@beep/repo-cli/commands/Files"
console.log(renderDetectFacesEntry)
```

**Signature**

```ts
declare const renderDetectFacesEntry: (entry: DetectFacesEntry) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.media.ts#L1009)

Since v0.0.0

## renderDetectFacesSkippedEntry

Render a skipped face-detection source entry.

**Example**

```ts
import { renderDetectFacesSkippedEntry } from "@beep/repo-cli/commands/Files"
console.log(renderDetectFacesSkippedEntry)
```

**Signature**

```ts
declare const renderDetectFacesSkippedEntry: (entry: DetectFacesSkippedEntry) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.media.ts#L1037)

Since v0.0.0

## renderNormalizePlanEntry

Render a normalize plan entry.

**Example**

```ts
import { renderNormalizePlanEntry } from "@beep/repo-cli/commands/Files"
console.log(renderNormalizePlanEntry)
```

**Signature**

```ts
declare const renderNormalizePlanEntry: (entry: NormalizePlanEntry) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.media.ts#L654)

Since v0.0.0

## renderNormalizeSkippedEntry

Render a normalize skipped entry.

**Example**

```ts
import { renderNormalizeSkippedEntry } from "@beep/repo-cli/commands/Files"
console.log(renderNormalizeSkippedEntry)
```

**Signature**

```ts
declare const renderNormalizeSkippedEntry: (entry: NormalizeSkippedEntry) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.media.ts#L670)

Since v0.0.0

## renderPlanEntry

Render a rename plan entry.

**Example**

```ts
import { renderPlanEntry } from "@beep/repo-cli/commands/Files"
console.log(renderPlanEntry)
```

**Signature**

```ts
declare const renderPlanEntry: (entry: RenamePlanEntry) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.media.ts#L591)

Since v0.0.0

## renderStripMetadataPlanEntry

Render a metadata strip plan entry.

**Example**

```ts
import { renderStripMetadataPlanEntry } from "@beep/repo-cli/commands/Files"
console.log(renderStripMetadataPlanEntry)
```

**Signature**

```ts
declare const renderStripMetadataPlanEntry: (entry: StripMetadataPlanEntry) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.media.ts#L606)

Since v0.0.0

## rgbToHex

Render an RGB color as a lowercase hexadecimal color.

**Example**

```ts
import { rgbToHex } from "@beep/repo-cli/commands/Files"
console.log(rgbToHex)
```

**Signature**

```ts
declare const rgbToHex: (color: RgbColor) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.media.ts#L877)

Since v0.0.0

## rotationFromStream

Resolve rotation metadata from an ffprobe stream.

**Example**

```ts
import { rotationFromStream } from "@beep/repo-cli/commands/Files"
console.log(rotationFromStream)
```

**Signature**

```ts
declare const rotationFromStream: (stream: FfprobeStream) => O.Option<number>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.media.ts#L500)

Since v0.0.0

## roundCandidateMetric

Round a candidate assessment metric for stable manifest output.

**Example**

```ts
import { roundCandidateMetric } from "@beep/repo-cli/commands/Files"
console.log(roundCandidateMetric)
```

**Signature**

```ts
declare const roundCandidateMetric: (value: number) => number
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.media.ts#L773)

Since v0.0.0

## selectedCanonicalPathSet

Build a hash set of selected canonical source paths.

**Example**

```ts
import { selectedCanonicalPathSet } from "@beep/repo-cli/commands/Files"
console.log(selectedCanonicalPathSet)
```

**Signature**

```ts
declare const selectedCanonicalPathSet: (plan: ReadonlyArray<RenamePlanEntry>) => HashSet.HashSet<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.media.ts#L570)

Since v0.0.0

## sharpFormatForNormalize

Resolve the sharp encoder name for a canonical normalize format.

**Example**

```ts
import { sharpFormatForNormalize } from "@beep/repo-cli/commands/Files"
console.log(sharpFormatForNormalize)
```

**Signature**

```ts
declare const sharpFormatForNormalize: (format: NormalizeImageFormat) => "jpeg" | "png" | "webp"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.media.ts#L701)

Since v0.0.0

## targetNameForEntry

Build a generated filename for a planned rename.

**Example**

```ts
import { targetNameForEntry } from "@beep/repo-cli/commands/Files"
console.log(targetNameForEntry)
```

**Signature**

```ts
declare const targetNameForEntry: { (options: TargetNameForEntryOptions): (prefix: SafeFilePrefix) => string; (prefix: SafeFilePrefix, options: TargetNameForEntryOptions): string; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.media.ts#L526)

Since v0.0.0