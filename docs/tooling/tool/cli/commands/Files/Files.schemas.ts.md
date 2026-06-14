---
title: Files.schemas.ts
nav_order: 34
parent: "@beep/repo-cli"
---

## Files.schemas.ts overview

Schema models for dataset file curation commands.

Since v0.0.0

---
## Exports Grouped by Category
- [codecs](#codecs)
  - [decodeDetectFacesOptions](#decodedetectfacesoptions)
  - [encodeDetectFacesReport](#encodedetectfacesreport)
- [decoding](#decoding)
  - [decodeArchivePoorCandidatesOptions](#decodearchivepoorcandidatesoptions)
  - [decodeCreateCaptionFilesOptions](#decodecreatecaptionfilesoptions)
  - [decodeCropBordersOptions](#decodecropbordersoptions)
  - [decodeDetectBordersOptions](#decodedetectbordersoptions)
  - [decodeFfprobeOutputJson](#decodeffprobeoutputjson)
  - [decodeImageSizeMetadata](#decodeimagesizemetadata)
  - [decodeNormalizeMaxLongEdge](#decodenormalizemaxlongedge)
  - [decodeRotationNumber](#decoderotationnumber)
  - [decodeSafeFilePrefix](#decodesafefileprefix)
- [encoding](#encoding)
  - [encodeArchivePoorCandidatesManifest](#encodearchivepoorcandidatesmanifest)
  - [encodeDetectBordersReport](#encodedetectbordersreport)
  - [encodeNormalizeManifest](#encodenormalizemanifest)
- [models](#models)
  - [ArchivePoorCandidatesEntry (class)](#archivepoorcandidatesentry-class)
  - [ArchivePoorCandidatesManifest (class)](#archivepoorcandidatesmanifest-class)
  - [ArchivePoorCandidatesManifestOptions (class)](#archivepoorcandidatesmanifestoptions-class)
  - [ArchivePoorCandidatesManifestSummary (class)](#archivepoorcandidatesmanifestsummary-class)
  - [ArchivePoorCandidatesOptions (class)](#archivepoorcandidatesoptions-class)
  - [ArchivePoorCandidatesPlan (class)](#archivepoorcandidatesplan-class)
  - [ArchivePoorCandidatesSkippedEntry (class)](#archivepoorcandidatesskippedentry-class)
  - [ArchivePoorCandidatesSkippedReason (type alias)](#archivepoorcandidatesskippedreason-type-alias)
  - [ArchivePoorCandidatesSummary (class)](#archivepoorcandidatessummary-class)
  - [ArchivedSidecarEntry (class)](#archivedsidecarentry-class)
  - [BorderDetectionKind (type alias)](#borderdetectionkind-type-alias)
  - [BorderDetectionMaxScanPercentage (type alias)](#borderdetectionmaxscanpercentage-type-alias)
  - [BorderDetectionPercentage (type alias)](#borderdetectionpercentage-type-alias)
  - [BorderDetectionTolerance (type alias)](#borderdetectiontolerance-type-alias)
  - [BorderSide (type alias)](#borderside-type-alias)
  - [CandidateAssessmentDecision (type alias)](#candidateassessmentdecision-type-alias)
  - [CandidateAssessmentMetrics (class)](#candidateassessmentmetrics-class)
  - [CandidateAssessmentProfile (type alias)](#candidateassessmentprofile-type-alias)
  - [CandidateAssessmentReason (type alias)](#candidateassessmentreason-type-alias)
  - [CandidateRatioThreshold (type alias)](#candidateratiothreshold-type-alias)
  - [CreateCaptionFilesOptions (class)](#createcaptionfilesoptions-class)
  - [CreateCaptionFilesPlan (class)](#createcaptionfilesplan-class)
  - [CreateCaptionFilesPlanEntry (class)](#createcaptionfilesplanentry-class)
  - [CreateCaptionFilesSkippedEntry (class)](#createcaptionfilesskippedentry-class)
  - [CreateCaptionFilesSkippedReason (type alias)](#createcaptionfilesskippedreason-type-alias)
  - [CreateCaptionFilesSummary (class)](#createcaptionfilessummary-class)
  - [CropBordersOptions (class)](#cropbordersoptions-class)
  - [CropBordersPlan (class)](#cropbordersplan-class)
  - [CropBordersPlanEntry (class)](#cropbordersplanentry-class)
  - [CropBordersSummary (class)](#cropborderssummary-class)
  - [DetectBorderSideMeasurement (class)](#detectbordersidemeasurement-class)
  - [DetectBordersEntry (class)](#detectbordersentry-class)
  - [DetectBordersOptions (class)](#detectbordersoptions-class)
  - [DetectBordersReport (class)](#detectbordersreport-class)
  - [DetectBordersSkippedEntry (class)](#detectbordersskippedentry-class)
  - [DetectBordersSkippedReason (type alias)](#detectbordersskippedreason-type-alias)
  - [DetectBordersSummary (class)](#detectborderssummary-class)
  - [DetectFacesEntry (class)](#detectfacesentry-class)
  - [DetectFacesFlag (type alias)](#detectfacesflag-type-alias)
  - [DetectFacesOptions (class)](#detectfacesoptions-class)
  - [DetectFacesReport (class)](#detectfacesreport-class)
  - [DetectFacesReportOptions (class)](#detectfacesreportoptions-class)
  - [DetectFacesSkippedEntry (class)](#detectfacesskippedentry-class)
  - [DetectFacesSkippedReason (type alias)](#detectfacesskippedreason-type-alias)
  - [DetectFacesSummary (class)](#detectfacessummary-class)
  - [FfprobeOutput (class)](#ffprobeoutput-class)
  - [FfprobeSideData (class)](#ffprobesidedata-class)
  - [FfprobeStream (class)](#ffprobestream-class)
  - [FileSha256Hash (type alias)](#filesha256hash-type-alias)
  - [ImageSizeMetadata (class)](#imagesizemetadata-class)
  - [MediaDimensions (class)](#mediadimensions-class)
  - [MediaKind (type alias)](#mediakind-type-alias)
  - [NonNegativePixelOffset (type alias)](#nonnegativepixeloffset-type-alias)
  - [NormalizeFilesOptions (class)](#normalizefilesoptions-class)
  - [NormalizeImageFormat (type alias)](#normalizeimageformat-type-alias)
  - [NormalizeImageFormatInput (type alias)](#normalizeimageformatinput-type-alias)
  - [NormalizeManifest (class)](#normalizemanifest-class)
  - [NormalizeManifestOptions (class)](#normalizemanifestoptions-class)
  - [NormalizeManifestSummary (class)](#normalizemanifestsummary-class)
  - [NormalizePlan (class)](#normalizeplan-class)
  - [NormalizePlanEntry (class)](#normalizeplanentry-class)
  - [NormalizeSkippedEntry (class)](#normalizeskippedentry-class)
  - [NormalizeSkippedReason (type alias)](#normalizeskippedreason-type-alias)
  - [NormalizeSummary (class)](#normalizesummary-class)
  - [PositiveMediaDimension (type alias)](#positivemediadimension-type-alias)
  - [ProcessFilesFailurePolicy (type alias)](#processfilesfailurepolicy-type-alias)
  - [ProcessFilesOptions (class)](#processfilesoptions-class)
  - [ProcessFilesSummary (class)](#processfilessummary-class)
  - [RenamePlan (class)](#renameplan-class)
  - [RenamePlanEntry (class)](#renameplanentry-class)
  - [RgbChannel (type alias)](#rgbchannel-type-alias)
  - [RgbColor (class)](#rgbcolor-class)
  - [SafeFilePrefix (type alias)](#safefileprefix-type-alias)
  - [SortAndRenameSummary (class)](#sortandrenamesummary-class)
  - [SortableFile (class)](#sortablefile-class)
  - [SortableFileCollection (class)](#sortablefilecollection-class)
  - [StripMetadataPlan (class)](#stripmetadataplan-class)
  - [StripMetadataPlanEntry (class)](#stripmetadataplanentry-class)
  - [StripMetadataSummary (class)](#stripmetadatasummary-class)
  - [SupportedMetadataImageExtension (type alias)](#supportedmetadataimageextension-type-alias)
- [schemas](#schemas)
  - [ArchivePoorCandidatesSkippedReason](#archivepoorcandidatesskippedreason)
  - [BorderDetectionKind](#borderdetectionkind)
  - [BorderDetectionMaxScanPercentage](#borderdetectionmaxscanpercentage)
  - [BorderDetectionPercentage](#borderdetectionpercentage)
  - [BorderDetectionTolerance](#borderdetectiontolerance)
  - [BorderSide](#borderside)
  - [CandidateAssessmentDecision](#candidateassessmentdecision)
  - [CandidateAssessmentProfile](#candidateassessmentprofile)
  - [CandidateAssessmentReason](#candidateassessmentreason)
  - [CandidateRatioThreshold](#candidateratiothreshold)
  - [CreateCaptionFilesSkippedReason](#createcaptionfilesskippedreason)
  - [DetectBordersSkippedReason](#detectbordersskippedreason)
  - [DetectFacesFlag](#detectfacesflag)
  - [DetectFacesSkippedReason](#detectfacesskippedreason)
  - [FileSha256Hash](#filesha256hash)
  - [MediaKind](#mediakind)
  - [NonNegativePixelOffset](#nonnegativepixeloffset)
  - [NormalizeImageFormat](#normalizeimageformat)
  - [NormalizeImageFormatInput](#normalizeimageformatinput)
  - [NormalizeSkippedReason](#normalizeskippedreason)
  - [PositiveMediaDimension](#positivemediadimension)
  - [ProcessFilesFailurePolicy](#processfilesfailurepolicy)
  - [RgbChannel](#rgbchannel)
  - [SafeFilePrefix](#safefileprefix)
  - [SupportedMetadataImageExtension](#supportedmetadataimageextension)
---

# codecs

## decodeDetectFacesOptions

Decode face detection options from unknown input.

**Example**

```ts
import { decodeDetectFacesOptions } from "@beep/repo-cli/commands/Files"
console.log(decodeDetectFacesOptions)
```

**Signature**

```ts
declare const decodeDetectFacesOptions: (input: unknown, options?: ParseOptions) => Effect.Effect<DetectFacesOptions, S.SchemaError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L2422)

Since v0.0.0

## encodeDetectFacesReport

Encode a face detection report into its JSON-safe shape.

**Example**

```ts
import { encodeDetectFacesReport } from "@beep/repo-cli/commands/Files"
console.log(encodeDetectFacesReport)
```

**Signature**

```ts
declare const encodeDetectFacesReport: (input: unknown, options?: ParseOptions) => Effect.Effect<{ readonly directory: string; readonly entries: ReadonlyArray<{ readonly extension: string; readonly faceCount: number; readonly faces: ReadonlyArray<{ readonly box: { readonly height: number; readonly width: number; readonly x: number; readonly y: number; }; readonly confidence: number; readonly landmarks: { readonly leftEye: { readonly x: number; readonly y: number; }; readonly leftMouth: { readonly x: number; readonly y: number; }; readonly nose: { readonly x: number; readonly y: number; }; readonly rightEye: { readonly x: number; readonly y: number; }; readonly rightMouth: { readonly x: number; readonly y: number; }; }; }>; readonly flags: ReadonlyArray<"face-at-edge" | "face-too-small" | "has-face" | "multiple-faces" | "no-face">; readonly hasFace: boolean; readonly height: number; readonly sourceName: string; readonly sourcePath: string; readonly width: number; readonly movedNoFaceName?: string | undefined; readonly movedNoFacePath?: string | undefined; readonly movedNoFaceRelativePath?: string | undefined; readonly primaryFace?: { readonly box: { readonly height: number; readonly width: number; readonly x: number; readonly y: number; }; readonly confidence: number; readonly landmarks: { readonly leftEye: { readonly x: number; readonly y: number; }; readonly leftMouth: { readonly x: number; readonly y: number; }; readonly nose: { readonly x: number; readonly y: number; }; readonly rightEye: { readonly x: number; readonly y: number; }; readonly rightMouth: { readonly x: number; readonly y: number; }; }; } | undefined; readonly primaryFaceAreaPct?: number | undefined; }>; readonly manifestPath: string; readonly manifestWritten: boolean; readonly options: { readonly edgeMarginPct: number; readonly json: boolean; readonly minConfidence: number; readonly minFaceAreaPct: number; readonly modelPath: string; readonly manifest?: string | undefined; readonly moveNoFaceTo?: string | undefined; }; readonly schemaVersion: "beep.files.detect-faces.v1"; readonly skipped: ReadonlyArray<{ readonly message: string; readonly reason: "symlink" | "directory" | "video" | "extensionless" | "non-media" | "unsupported-image" | "unreadable-image" | "detection-failed"; readonly sourceName: string; readonly sourcePath: string; readonly extension?: string | undefined; }>; readonly summary: { readonly analyzedCount: number; readonly directory: string; readonly faceImageCount: number; readonly movedNoFaceCount: number; readonly noFaceImageCount: number; readonly reviewImageCount: number; readonly skippedCount: number; readonly totalCount: number; }; }, S.SchemaError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L2486)

Since v0.0.0

# decoding

## decodeArchivePoorCandidatesOptions

Decode unknown poor-candidate archive options.

**Example**

```ts
import { decodeArchivePoorCandidatesOptions } from "@beep/repo-cli/commands/Files"
console.log(decodeArchivePoorCandidatesOptions)
```

**Signature**

```ts
declare const decodeArchivePoorCandidatesOptions: (input: unknown, options?: ParseOptions) => Effect.Effect<ArchivePoorCandidatesOptions, S.SchemaError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L2384)

Since v0.0.0

## decodeCreateCaptionFilesOptions

Decode unknown caption sidecar creation options.

**Example**

```ts
import { decodeCreateCaptionFilesOptions } from "@beep/repo-cli/commands/Files"
console.log(decodeCreateCaptionFilesOptions)
```

**Signature**

```ts
declare const decodeCreateCaptionFilesOptions: (input: unknown, options?: ParseOptions) => Effect.Effect<CreateCaptionFilesOptions, S.SchemaError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L2397)

Since v0.0.0

## decodeCropBordersOptions

Decode unknown border cropping options.

**Example**

```ts
import { decodeCropBordersOptions } from "@beep/repo-cli/commands/Files"
console.log(decodeCropBordersOptions)
```

**Signature**

```ts
declare const decodeCropBordersOptions: (input: unknown, options?: ParseOptions) => Effect.Effect<CropBordersOptions, S.SchemaError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L2435)

Since v0.0.0

## decodeDetectBordersOptions

Decode unknown border detection options.

**Example**

```ts
import { decodeDetectBordersOptions } from "@beep/repo-cli/commands/Files"
console.log(decodeDetectBordersOptions)
```

**Signature**

```ts
declare const decodeDetectBordersOptions: (input: unknown, options?: ParseOptions) => Effect.Effect<DetectBordersOptions, S.SchemaError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L2410)

Since v0.0.0

## decodeFfprobeOutputJson

Decode an ffprobe JSON document.

**Example**

```ts
import { decodeFfprobeOutputJson } from "@beep/repo-cli/commands/Files"
console.log(decodeFfprobeOutputJson)
```

**Signature**

```ts
declare const decodeFfprobeOutputJson: (input: unknown, options?: ParseOptions) => Effect.Effect<FfprobeOutput, S.SchemaError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L2332)

Since v0.0.0

## decodeImageSizeMetadata

Decode unknown image-size metadata.

**Example**

```ts
import { decodeImageSizeMetadata } from "@beep/repo-cli/commands/Files"
console.log(decodeImageSizeMetadata)
```

**Signature**

```ts
declare const decodeImageSizeMetadata: (input: unknown, options?: ParseOptions) => Effect.Effect<ImageSizeMetadata, S.SchemaError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L2319)

Since v0.0.0

## decodeNormalizeMaxLongEdge

Decode an unknown maximum long-edge value.

**Example**

```ts
import { decodeNormalizeMaxLongEdge } from "@beep/repo-cli/commands/Files"
console.log(decodeNormalizeMaxLongEdge)
```

**Signature**

```ts
declare const decodeNormalizeMaxLongEdge: (input: unknown, options?: ParseOptions) => Effect.Effect<number, S.SchemaError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L2371)

Since v0.0.0

## decodeRotationNumber

Decode an unknown rotation value into an optional number.

**Example**

```ts
import { decodeRotationNumber } from "@beep/repo-cli/commands/Files"
console.log(decodeRotationNumber)
```

**Signature**

```ts
declare const decodeRotationNumber: (input: unknown, options?: ParseOptions) => O.Option<number>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L2345)

Since v0.0.0

## decodeSafeFilePrefix

Decode an unknown safe filename prefix.

**Example**

```ts
import { decodeSafeFilePrefix } from "@beep/repo-cli/commands/Files"
console.log(decodeSafeFilePrefix)
```

**Signature**

```ts
declare const decodeSafeFilePrefix: (input: unknown, options?: ParseOptions) => Effect.Effect<string, S.SchemaError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L2358)

Since v0.0.0

# encoding

## encodeArchivePoorCandidatesManifest

Encode a poor-candidate archive manifest into its JSON-safe shape.

**Example**

```ts
import { encodeArchivePoorCandidatesManifest } from "@beep/repo-cli/commands/Files"
console.log(encodeArchivePoorCandidatesManifest)
```

**Signature**

```ts
declare const encodeArchivePoorCandidatesManifest: (input: unknown, options?: ParseOptions) => Effect.Effect<{ readonly archiveDirectory: string; readonly entries: ReadonlyArray<{ readonly decision: "archive" | "keep"; readonly dimensions: { readonly height: number; readonly width: number; }; readonly extension: string; readonly metrics: { readonly aspectRatio: number; readonly pixelArea: number; readonly shortEdge: number; readonly upscaleToTarget: number; }; readonly reasons: ReadonlyArray<"extreme-aspect-ratio" | "short-edge-too-small" | "upscale-too-large">; readonly sidecars: ReadonlyArray<{ readonly archivePath: string; readonly archiveRelativePath: string; readonly extension: string; readonly sourcePath: string; readonly sourceRelativePath: string; }>; readonly sourceName: string; readonly sourcePath: string; readonly sourceRelativePath: string; readonly sourceSizeBytes: string; readonly archiveName?: string | undefined; readonly archivePath?: string | undefined; readonly archiveRelativePath?: string | undefined; }>; readonly manifestPath: string; readonly options: { readonly maxAspect: number; readonly maxUpscale: number; readonly minShortEdge: number; readonly overwrite: boolean; readonly profile: "character-lora"; readonly sidecars: ReadonlyArray<string>; readonly targetResolution: number; }; readonly schemaVersion: "beep.files.archive-poor-candidates.v1"; readonly skipped: ReadonlyArray<{ readonly message: string; readonly reason: "symlink" | "directory" | "video" | "extensionless" | "non-media" | "unsupported-image" | "unreadable-image"; readonly sourceName: string; readonly sourcePath: string; readonly extension?: string | undefined; }>; readonly sourceDirectory: string; readonly summary: { readonly archivedCount: number; readonly assessedCount: number; readonly keptCount: number; readonly movedSidecarCount: number; readonly skippedCount: number; }; }, S.SchemaError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L2461)

Since v0.0.0

## encodeDetectBordersReport

Encode a detect-borders report into its JSON-safe shape.

**Example**

```ts
import { encodeDetectBordersReport } from "@beep/repo-cli/commands/Files"
console.log(encodeDetectBordersReport)
```

**Signature**

```ts
declare const encodeDetectBordersReport: (input: unknown, options?: ParseOptions) => Effect.Effect<{ readonly directory: string; readonly entries: ReadonlyArray<{ readonly borderCount: number; readonly classification: "none" | "canvas-edge" | "pillarbox" | "letterbox" | "frame" | "mixed"; readonly extension: string; readonly hasBorder: boolean; readonly height: number; readonly sides: ReadonlyArray<{ readonly color: { readonly b: number; readonly g: number; readonly r: number; }; readonly colorHex: string; readonly matched: boolean; readonly score: number; readonly side: "top" | "right" | "bottom" | "left"; readonly widthPct: number; readonly widthPx: number; }>; readonly sourceName: string; readonly sourcePath: string; readonly width: number; }>; readonly options: { readonly dir: string; readonly json: boolean; readonly maxScanPct: number; readonly minSolidPct: number; readonly minWidthPct: number; readonly tolerance: number; }; readonly schemaVersion: "beep.files.detect-borders.v1"; readonly skipped: ReadonlyArray<{ readonly message: string; readonly reason: "symlink" | "directory" | "video" | "extensionless" | "non-media" | "unsupported-image" | "unreadable-image"; readonly sourceName: string; readonly sourcePath: string; readonly extension?: string | undefined; }>; readonly summary: { readonly analyzedCount: number; readonly borderedCount: number; readonly directory: string; readonly skippedCount: number; readonly totalCount: number; }; }, S.SchemaError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L2474)

Since v0.0.0

## encodeNormalizeManifest

Encode a normalize manifest into its JSON-safe shape.

**Example**

```ts
import { encodeNormalizeManifest } from "@beep/repo-cli/commands/Files"
console.log(encodeNormalizeManifest)
```

**Signature**

```ts
declare const encodeNormalizeManifest: (input: unknown, options?: ParseOptions) => Effect.Effect<{ readonly entries: ReadonlyArray<{ readonly format: "png" | "jpg" | "webp"; readonly inputDimensions: { readonly height: number; readonly width: number; }; readonly outputDimensions: { readonly height: number; readonly width: number; }; readonly outputName: string; readonly outputPath: string; readonly outputRelativePath: string; readonly resized: boolean; readonly sourceExtension: string; readonly sourceName: string; readonly sourcePath: string; readonly sourceRelativePath: string; readonly sourceSizeBytes: string; readonly outputHash?: string | undefined; readonly outputSizeBytes?: string | undefined; }>; readonly manifestPath: string; readonly options: { readonly dedupe: boolean; readonly format: "png" | "jpg" | "webp"; readonly overwrite: boolean; readonly maxLongEdge?: number | undefined; readonly moveDuplicatesTo?: string | undefined; }; readonly outputDirectory: string; readonly schemaVersion: "beep.files.normalize.v1"; readonly skipped: ReadonlyArray<{ readonly message: string; readonly reason: "symlink" | "directory" | "video" | "duplicate" | "extensionless" | "non-media" | "unsupported-image"; readonly sourceName: string; readonly sourcePath: string; readonly duplicateOfOutputRelativePath?: string | undefined; readonly duplicateOfSourceRelativePath?: string | undefined; readonly duplicateMovedPath?: string | undefined; readonly duplicateMovedRelativePath?: string | undefined; readonly extension?: string | undefined; readonly outputHash?: string | undefined; }>; readonly sourceDirectory: string; readonly summary: { readonly duplicateCount: number; readonly movedDuplicateCount: number; readonly normalizedCount: number; readonly plannedCount: number; readonly resizedCount: number; readonly skippedCount: number; }; }, S.SchemaError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L2448)

Since v0.0.0

# models

## ArchivePoorCandidatesEntry (class)

Assessed image candidate with an archive or keep decision.

**Example**

```ts
import { ArchivePoorCandidatesEntry } from "@beep/repo-cli/commands/Files"
console.log(ArchivePoorCandidatesEntry)
```

**Signature**

```ts
declare class ArchivePoorCandidatesEntry
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L1566)

Since v0.0.0

## ArchivePoorCandidatesManifest (class)

Manifest written by a successful poor-candidate archive run.

**Example**

```ts
import { ArchivePoorCandidatesManifest } from "@beep/repo-cli/commands/Files"
console.log(ArchivePoorCandidatesManifest)
```

**Signature**

```ts
declare class ArchivePoorCandidatesManifest
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L1706)

Since v0.0.0

## ArchivePoorCandidatesManifestOptions (class)

JSON-safe options recorded in a poor-candidate archive manifest.

**Example**

```ts
import { ArchivePoorCandidatesManifestOptions } from "@beep/repo-cli/commands/Files"
console.log(ArchivePoorCandidatesManifestOptions)
```

**Signature**

```ts
declare class ArchivePoorCandidatesManifestOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L1491)

Since v0.0.0

## ArchivePoorCandidatesManifestSummary (class)

JSON-safe summary recorded by poor-candidate archival.

**Example**

```ts
import { ArchivePoorCandidatesManifestSummary } from "@beep/repo-cli/commands/Files"
console.log(ArchivePoorCandidatesManifestSummary)
```

**Signature**

```ts
declare class ArchivePoorCandidatesManifestSummary
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L1680)

Since v0.0.0

## ArchivePoorCandidatesOptions (class)

Options used by poor-candidate archival.

**Example**

```ts
import { ArchivePoorCandidatesOptions } from "@beep/repo-cli/commands/Files"
console.log(ArchivePoorCandidatesOptions)
```

**Signature**

```ts
declare class ArchivePoorCandidatesOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L1459)

Since v0.0.0

## ArchivePoorCandidatesPlan (class)

Planned poor-candidate archive run.

**Example**

```ts
import { ArchivePoorCandidatesPlan } from "@beep/repo-cli/commands/Files"
console.log(ArchivePoorCandidatesPlan)
```

**Signature**

```ts
declare class ArchivePoorCandidatesPlan
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L1624)

Since v0.0.0

## ArchivePoorCandidatesSkippedEntry (class)

Source entry skipped by poor-candidate archival.

**Example**

```ts
import { ArchivePoorCandidatesSkippedEntry } from "@beep/repo-cli/commands/Files"
console.log(ArchivePoorCandidatesSkippedEntry)
```

**Signature**

```ts
declare class ArchivePoorCandidatesSkippedEntry
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L1598)

Since v0.0.0

## ArchivePoorCandidatesSkippedReason (type alias)

Reason a direct directory entry was skipped by `files archive-poor-candidates`.

**Signature**

```ts
type ArchivePoorCandidatesSkippedReason = typeof ArchivePoorCandidatesSkippedReason.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L559)

Since v0.0.0

## ArchivePoorCandidatesSummary (class)

Summary counts returned by poor-candidate archival.

**Example**

```ts
import { ArchivePoorCandidatesSummary } from "@beep/repo-cli/commands/Files"
console.log(ArchivePoorCandidatesSummary)
```

**Signature**

```ts
declare class ArchivePoorCandidatesSummary
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L1649)

Since v0.0.0

## ArchivedSidecarEntry (class)

Caption or metadata sidecar moved with an archived image.

**Example**

```ts
import { ArchivedSidecarEntry } from "@beep/repo-cli/commands/Files"
console.log(ArchivedSidecarEntry)
```

**Signature**

```ts
declare class ArchivedSidecarEntry
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L1542)

Since v0.0.0

## BorderDetectionKind (type alias)

Classified border layout for an analyzed image.

**Signature**

```ts
type BorderDetectionKind = typeof BorderDetectionKind.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L349)

Since v0.0.0

## BorderDetectionMaxScanPercentage (type alias)

Maximum scan percentage accepted by border detection.

**Signature**

```ts
type BorderDetectionMaxScanPercentage = typeof BorderDetectionMaxScanPercentage.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L685)

Since v0.0.0

## BorderDetectionPercentage (type alias)

Percentage threshold used by border detection options.

**Signature**

```ts
type BorderDetectionPercentage = typeof BorderDetectionPercentage.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L638)

Since v0.0.0

## BorderDetectionTolerance (type alias)

RGB channel tolerance accepted by border detection.

**Signature**

```ts
type BorderDetectionTolerance = typeof BorderDetectionTolerance.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L732)

Since v0.0.0

## BorderSide (type alias)

Side of an image edge scanned for a solid border.

**Signature**

```ts
type BorderSide = typeof BorderSide.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L324)

Since v0.0.0

## CandidateAssessmentDecision (type alias)

Candidate-quality decision produced by `files archive-poor-candidates`.

**Signature**

```ts
type CandidateAssessmentDecision = typeof CandidateAssessmentDecision.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L497)

Since v0.0.0

## CandidateAssessmentMetrics (class)

Derived image metrics used for candidate-quality triage.

**Example**

```ts
import { CandidateAssessmentMetrics } from "@beep/repo-cli/commands/Files"
console.log(CandidateAssessmentMetrics)
```

**Signature**

```ts
declare class CandidateAssessmentMetrics
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L1519)

Since v0.0.0

## CandidateAssessmentProfile (type alias)

Dataset profile used by candidate-quality triage.

**Signature**

```ts
type CandidateAssessmentProfile = typeof CandidateAssessmentProfile.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L472)

Since v0.0.0

## CandidateAssessmentReason (type alias)

Hard-threshold reason that can cause an image to be archived.

**Signature**

```ts
type CandidateAssessmentReason = typeof CandidateAssessmentReason.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L526)

Since v0.0.0

## CandidateRatioThreshold (type alias)

Numeric threshold ratio used by candidate-quality triage.

**Signature**

```ts
type CandidateRatioThreshold = typeof CandidateRatioThreshold.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L591)

Since v0.0.0

## CreateCaptionFilesOptions (class)

Options used by caption sidecar creation.

**Example**

```ts
import { CreateCaptionFilesOptions } from "@beep/repo-cli/commands/Files"
console.log(CreateCaptionFilesOptions)
```

**Signature**

```ts
declare class CreateCaptionFilesOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L1105)

Since v0.0.0

## CreateCaptionFilesPlan (class)

Planned caption sidecar creation run.

**Example**

```ts
import { CreateCaptionFilesPlan } from "@beep/repo-cli/commands/Files"
console.log(CreateCaptionFilesPlan)
```

**Signature**

```ts
declare class CreateCaptionFilesPlan
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L1182)

Since v0.0.0

## CreateCaptionFilesPlanEntry (class)

Planned caption sidecar file creation.

**Example**

```ts
import { CreateCaptionFilesPlanEntry } from "@beep/repo-cli/commands/Files"
console.log(CreateCaptionFilesPlanEntry)
```

**Signature**

```ts
declare class CreateCaptionFilesPlanEntry
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L1128)

Since v0.0.0

## CreateCaptionFilesSkippedEntry (class)

Source entry skipped by caption sidecar creation.

**Example**

```ts
import { CreateCaptionFilesSkippedEntry } from "@beep/repo-cli/commands/Files"
console.log(CreateCaptionFilesSkippedEntry)
```

**Signature**

```ts
declare class CreateCaptionFilesSkippedEntry
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L1155)

Since v0.0.0

## CreateCaptionFilesSkippedReason (type alias)

Reason a direct directory entry was skipped by `files create-captions`.

**Signature**

```ts
type CreateCaptionFilesSkippedReason = typeof CreateCaptionFilesSkippedReason.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L299)

Since v0.0.0

## CreateCaptionFilesSummary (class)

Summary returned by `createCaptionFiles`.

**Example**

```ts
import { CreateCaptionFilesSummary } from "@beep/repo-cli/commands/Files"
console.log(CreateCaptionFilesSummary)
```

**Signature**

```ts
declare class CreateCaptionFilesSummary
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L1206)

Since v0.0.0

## CropBordersOptions (class)

Options used by the image border cropping operation.

**Example**

```ts
import { CropBordersOptions } from "@beep/repo-cli/commands/Files"
console.log(CropBordersOptions)
```

**Signature**

```ts
declare class CropBordersOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L1813)

Since v0.0.0

## CropBordersPlan (class)

Planned border crop entries plus skipped file counts.

**Example**

```ts
import { CropBordersPlan } from "@beep/repo-cli/commands/Files"
console.log(CropBordersPlan)
```

**Signature**

```ts
declare class CropBordersPlan
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L2129)

Since v0.0.0

## CropBordersPlanEntry (class)

Planned crop for an image with detected solid borders.

**Example**

```ts
import { CropBordersPlanEntry } from "@beep/repo-cli/commands/Files"
console.log(CropBordersPlanEntry)
```

**Signature**

```ts
declare class CropBordersPlanEntry
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L2098)

Since v0.0.0

## CropBordersSummary (class)

Summary returned by `cropBordersFiles`.

**Example**

```ts
import { CropBordersSummary } from "@beep/repo-cli/commands/Files"
console.log(CropBordersSummary)
```

**Signature**

```ts
declare class CropBordersSummary
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L2153)

Since v0.0.0

## DetectBorderSideMeasurement (class)

Measurement for one scanned image side.

**Example**

```ts
import { DetectBorderSideMeasurement } from "@beep/repo-cli/commands/Files"
console.log(DetectBorderSideMeasurement)
```

**Signature**

```ts
declare class DetectBorderSideMeasurement
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L1860)

Since v0.0.0

## DetectBordersEntry (class)

Image entry analyzed by `files detect-borders`.

**Example**

```ts
import { DetectBordersEntry } from "@beep/repo-cli/commands/Files"
console.log(DetectBordersEntry)
```

**Signature**

```ts
declare class DetectBordersEntry
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L1886)

Since v0.0.0

## DetectBordersOptions (class)

Options used by the image border detection operation.

**Example**

```ts
import { DetectBordersOptions } from "@beep/repo-cli/commands/Files"
console.log(DetectBordersOptions)
```

**Signature**

```ts
declare class DetectBordersOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L1735)

Since v0.0.0

## DetectBordersReport (class)

JSON report emitted by an image border detection run.

**Example**

```ts
import { DetectBordersReport } from "@beep/repo-cli/commands/Files"
console.log(DetectBordersReport)
```

**Signature**

```ts
declare class DetectBordersReport
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L1962)

Since v0.0.0

## DetectBordersSkippedEntry (class)

Source entry skipped by image border detection.

**Example**

```ts
import { DetectBordersSkippedEntry } from "@beep/repo-cli/commands/Files"
console.log(DetectBordersSkippedEntry)
```

**Signature**

```ts
declare class DetectBordersSkippedEntry
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L1914)

Since v0.0.0

## DetectBordersSkippedReason (type alias)

Reason a direct directory entry was skipped by `files detect-borders`.

**Signature**

```ts
type DetectBordersSkippedReason = typeof DetectBordersSkippedReason.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L382)

Since v0.0.0

## DetectBordersSummary (class)

Summary counts for an image border detection run.

**Example**

```ts
import { DetectBordersSummary } from "@beep/repo-cli/commands/Files"
console.log(DetectBordersSummary)
```

**Signature**

```ts
declare class DetectBordersSummary
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L1938)

Since v0.0.0

## DetectFacesEntry (class)

Image entry analyzed by `files detect-faces`.

**Example**

```ts
import { DetectFacesEntry } from "@beep/repo-cli/commands/Files"
console.log(DetectFacesEntry)
```

**Signature**

```ts
declare class DetectFacesEntry
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L1987)

Since v0.0.0

## DetectFacesFlag (type alias)

Triage flag emitted by `files detect-faces`.

**Signature**

```ts
type DetectFacesFlag = typeof DetectFacesFlag.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L447)

Since v0.0.0

## DetectFacesOptions (class)

Options used by the image face detection operation.

**Example**

```ts
import { DetectFacesOptions } from "@beep/repo-cli/commands/Files"
console.log(DetectFacesOptions)
```

**Signature**

```ts
declare class DetectFacesOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L1760)

Since v0.0.0

## DetectFacesReport (class)

JSON report emitted by an image face detection run.

**Example**

```ts
import { DetectFacesReport } from "@beep/repo-cli/commands/Files"
console.log(DetectFacesReport)
```

**Signature**

```ts
declare class DetectFacesReport
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L2071)

Since v0.0.0

## DetectFacesReportOptions (class)

JSON-safe options recorded by the image face detection report.

**Example**

```ts
import { DetectFacesReportOptions } from "@beep/repo-cli/commands/Files"
console.log(DetectFacesReportOptions)
```

**Signature**

```ts
declare class DetectFacesReportOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L1787)

Since v0.0.0

## DetectFacesSkippedEntry (class)

Source entry skipped by image face detection.

**Example**

```ts
import { DetectFacesSkippedEntry } from "@beep/repo-cli/commands/Files"
console.log(DetectFacesSkippedEntry)
```

**Signature**

```ts
declare class DetectFacesSkippedEntry
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L2020)

Since v0.0.0

## DetectFacesSkippedReason (type alias)

Reason a direct directory entry was skipped by `files detect-faces`.

**Signature**

```ts
type DetectFacesSkippedReason = typeof DetectFacesSkippedReason.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L416)

Since v0.0.0

## DetectFacesSummary (class)

Summary counts for an image face detection run.

**Example**

```ts
import { DetectFacesSummary } from "@beep/repo-cli/commands/Files"
console.log(DetectFacesSummary)
```

**Signature**

```ts
declare class DetectFacesSummary
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L2044)

Since v0.0.0

## FfprobeOutput (class)

JSON document emitted by `ffprobe`.

**Example**

```ts
import { FfprobeOutput } from "@beep/repo-cli/commands/Files"
console.log(FfprobeOutput)
```

**Signature**

```ts
declare class FfprobeOutput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L857)

Since v0.0.0

## FfprobeSideData (class)

Side-data entry returned by `ffprobe`.

**Example**

```ts
import { FfprobeSideData } from "@beep/repo-cli/commands/Files"
console.log(FfprobeSideData)
```

**Signature**

```ts
declare class FfprobeSideData
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L814)

Since v0.0.0

## FfprobeStream (class)

Video stream metadata returned by `ffprobe`.

**Example**

```ts
import { FfprobeStream } from "@beep/repo-cli/commands/Files"
console.log(FfprobeStream)
```

**Signature**

```ts
declare class FfprobeStream
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L834)

Since v0.0.0

## FileSha256Hash (type alias)

SHA-256 hash recorded for normalized file bytes.

**Signature**

```ts
type FileSha256Hash = typeof FileSha256Hash.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L91)

Since v0.0.0

## ImageSizeMetadata (class)

Dimension metadata returned by `image-size`.

**Example**

```ts
import { ImageSizeMetadata } from "@beep/repo-cli/commands/Files"
console.log(ImageSizeMetadata)
```

**Signature**

```ts
declare class ImageSizeMetadata
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L792)

Since v0.0.0

## MediaDimensions (class)

Width and height discovered for an image or video file.

**Example**

```ts
import { MediaDimensions } from "@beep/repo-cli/commands/Files/index"

const dimensions = MediaDimensions.make({ height: 1024, width: 1536 })
console.log(dimensions.width)
```

**Signature**

```ts
declare class MediaDimensions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L1084)

Since v0.0.0

## MediaKind (type alias)

Media kind for selected dataset files.

**Signature**

```ts
type MediaKind = typeof MediaKind.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L157)

Since v0.0.0

## NonNegativePixelOffset (type alias)

Non-negative pixel offset value.

**Signature**

```ts
type NonNegativePixelOffset = typeof NonNegativePixelOffset.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L132)

Since v0.0.0

## NormalizeFilesOptions (class)

Options used by the image normalization operation.

**Example**

```ts
import { NormalizeFilesOptions } from "@beep/repo-cli/commands/Files"
console.log(NormalizeFilesOptions)
```

**Signature**

```ts
declare class NormalizeFilesOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L1231)

Since v0.0.0

## NormalizeImageFormat (type alias)

Canonical image output format emitted by `files normalize`.

**Signature**

```ts
type NormalizeImageFormat = typeof NormalizeImageFormat.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L232)

Since v0.0.0

## NormalizeImageFormatInput (type alias)

CLI image format accepted by `files normalize`.

**Signature**

```ts
type NormalizeImageFormatInput = typeof NormalizeImageFormatInput.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L207)

Since v0.0.0

## NormalizeManifest (class)

Manifest written by a successful image normalization run.

**Example**

```ts
import { NormalizeManifest } from "@beep/repo-cli/commands/Files"
console.log(NormalizeManifest)
```

**Signature**

```ts
declare class NormalizeManifest
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L1432)

Since v0.0.0

## NormalizeManifestOptions (class)

Manifest options recorded for an image normalization run.

**Example**

```ts
import { NormalizeManifestOptions } from "@beep/repo-cli/commands/Files"
console.log(NormalizeManifestOptions)
```

**Signature**

```ts
declare class NormalizeManifestOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L1261)

Since v0.0.0

## NormalizeManifestSummary (class)

JSON-safe summary recorded in an image normalization manifest.

**Example**

```ts
import { NormalizeManifestSummary } from "@beep/repo-cli/commands/Files"
console.log(NormalizeManifestSummary)
```

**Signature**

```ts
declare class NormalizeManifestSummary
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L1407)

Since v0.0.0

## NormalizePlan (class)

Planned image normalization run.

**Example**

```ts
import { NormalizePlan } from "@beep/repo-cli/commands/Files"
console.log(NormalizePlan)
```

**Signature**

```ts
declare class NormalizePlan
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L1347)

Since v0.0.0

## NormalizePlanEntry (class)

Planned source-to-output image transform.

**Example**

```ts
import { NormalizePlanEntry } from "@beep/repo-cli/commands/Files"
console.log(NormalizePlanEntry)
```

**Signature**

```ts
declare class NormalizePlanEntry
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L1285)

Since v0.0.0

## NormalizeSkippedEntry (class)

Source entry skipped by image normalization.

**Example**

```ts
import { NormalizeSkippedEntry } from "@beep/repo-cli/commands/Files"
console.log(NormalizeSkippedEntry)
```

**Signature**

```ts
declare class NormalizeSkippedEntry
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L1318)

Since v0.0.0

## NormalizeSkippedReason (type alias)

Reason a direct directory entry was skipped by `files normalize`.

**Signature**

```ts
type NormalizeSkippedReason = typeof NormalizeSkippedReason.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L265)

Since v0.0.0

## NormalizeSummary (class)

Summary counts for an image normalization run.

**Example**

```ts
import { NormalizeSummary } from "@beep/repo-cli/commands/Files"
console.log(NormalizeSummary)
```

**Signature**

```ts
declare class NormalizeSummary
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L1373)

Since v0.0.0

## PositiveMediaDimension (type alias)

Positive media dimension value.

**Signature**

```ts
type PositiveMediaDimension = typeof PositiveMediaDimension.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L59)

Since v0.0.0

## ProcessFilesFailurePolicy (type alias)

Failure policy for `files process`.

**Signature**

```ts
type ProcessFilesFailurePolicy = typeof ProcessFilesFailurePolicy.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L2256)

Since v0.0.0

## ProcessFilesOptions (class)

Validated options used by `files process`.

**Example**

```ts
import { ProcessFilesOptions } from "@beep/repo-cli/commands/Files"
console.log(ProcessFilesOptions)
```

**Signature**

```ts
declare class ProcessFilesOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L2269)

Since v0.0.0

## ProcessFilesSummary (class)

Summary counts returned by `files process`.

**Example**

```ts
import { ProcessFilesSummary } from "@beep/repo-cli/commands/Files"
console.log(ProcessFilesSummary)
```

**Signature**

```ts
declare class ProcessFilesSummary
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L2295)

Since v0.0.0

## RenamePlan (class)

Planned rename entries plus skipped file counts.

**Example**

```ts
import { RenamePlan } from "@beep/repo-cli/commands/Files"
console.log(RenamePlan)
```

**Signature**

```ts
declare class RenamePlan
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L2200)

Since v0.0.0

## RenamePlanEntry (class)

Planned rename from an existing file path to a generated target path.

**Example**

```ts
import { RenamePlanEntry } from "@beep/repo-cli/commands/Files"
console.log(RenamePlanEntry)
```

**Signature**

```ts
declare class RenamePlanEntry
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L969)

Since v0.0.0

## RgbChannel (type alias)

Integer RGB channel value.

**Signature**

```ts
type RgbChannel = typeof RgbChannel.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L779)

Since v0.0.0

## RgbColor (class)

RGB color sampled from a detected image border.

**Example**

```ts
import { RgbColor } from "@beep/repo-cli/commands/Files"
console.log(RgbColor)
```

**Signature**

```ts
declare class RgbColor
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L1838)

Since v0.0.0

## SafeFilePrefix (type alias)

Safe prefix accepted by `files sort-and-rename`.

**Signature**

```ts
type SafeFilePrefix = typeof SafeFilePrefix.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L923)

Since v0.0.0

## SortAndRenameSummary (class)

Summary returned by `sortAndRenameFiles`.

**Example**

```ts
import { SortAndRenameSummary } from "@beep/repo-cli/commands/Files"
console.log(SortAndRenameSummary)
```

**Signature**

```ts
declare class SortAndRenameSummary
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L999)

Since v0.0.0

## SortableFile (class)

File discovered for deterministic rename planning.

**Example**

```ts
import { SortableFile } from "@beep/repo-cli/commands/Files/index"

const file = SortableFile.make({
  canonicalPath: "/tmp/images/a.png",
  extension: ".png",
  name: "a.png",
  size: 10n,
  sourcePath: "/tmp/images/a.png"
})
console.log(file.name)
```

**Signature**

```ts
declare class SortableFile
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L944)

Since v0.0.0

## SortableFileCollection (class)

Files selected for rename planning plus skipped file counts.

**Example**

```ts
import { SortableFileCollection } from "@beep/repo-cli/commands/Files"
console.log(SortableFileCollection)
```

**Signature**

```ts
declare class SortableFileCollection
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L2179)

Since v0.0.0

## StripMetadataPlan (class)

Planned metadata stripping entries plus skipped file counts.

**Example**

```ts
import { StripMetadataPlan } from "@beep/repo-cli/commands/Files"
console.log(StripMetadataPlan)
```

**Signature**

```ts
declare class StripMetadataPlan
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L2221)

Since v0.0.0

## StripMetadataPlanEntry (class)

Planned metadata strip for a selected image or video file.

**Example**

```ts
import { StripMetadataPlanEntry } from "@beep/repo-cli/commands/Files/index"

const entry = StripMetadataPlanEntry.make({
  extension: ".jpg",
  mediaKind: "image",
  size: 10n,
  sourceName: "photo.jpg",
  sourcePath: "/tmp/dataset/photo.jpg"
})
console.log(entry.mediaKind)
```

**Signature**

```ts
declare class StripMetadataPlanEntry
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L1032)

Since v0.0.0

## StripMetadataSummary (class)

Summary returned by `stripMetadataFiles`.

**Example**

```ts
import { StripMetadataSummary } from "@beep/repo-cli/commands/Files"
console.log(StripMetadataSummary)
```

**Signature**

```ts
declare class StripMetadataSummary
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L1056)

Since v0.0.0

## SupportedMetadataImageExtension (type alias)

Image extension supported by metadata stripping.

**Signature**

```ts
type SupportedMetadataImageExtension = typeof SupportedMetadataImageExtension.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L182)

Since v0.0.0

# schemas

## ArchivePoorCandidatesSkippedReason

Reason a direct directory entry was skipped by `files archive-poor-candidates`.

**Example**

```ts
import { ArchivePoorCandidatesSkippedReason } from "@beep/repo-cli/commands/Files"
console.log(ArchivePoorCandidatesSkippedReason)
```

**Signature**

```ts
declare const ArchivePoorCandidatesSkippedReason: AnnotatedSchema<LiteralKit<readonly ["directory", "extensionless", "non-media", "symlink", "unsupported-image", "unreadable-image", "video"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L539)

Since v0.0.0

## BorderDetectionKind

Classified border layout for an analyzed image.

**Example**

```ts
import { BorderDetectionKind } from "@beep/repo-cli/commands/Files"
console.log(BorderDetectionKind)
```

**Signature**

```ts
declare const BorderDetectionKind: AnnotatedSchema<LiteralKit<readonly ["none", "canvas-edge", "pillarbox", "letterbox", "frame", "mixed"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L337)

Since v0.0.0

## BorderDetectionMaxScanPercentage

Maximum scan percentage accepted by border detection.

**Example**

```ts
import { BorderDetectionMaxScanPercentage } from "@beep/repo-cli/commands/Files"
console.log(BorderDetectionMaxScanPercentage)
```

**Signature**

```ts
declare const BorderDetectionMaxScanPercentage: AnnotatedSchema<S.Finite>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L651)

Since v0.0.0

## BorderDetectionPercentage

Percentage threshold used by border detection options.

**Example**

```ts
import { BorderDetectionPercentage } from "@beep/repo-cli/commands/Files"
console.log(BorderDetectionPercentage)
```

**Signature**

```ts
declare const BorderDetectionPercentage: AnnotatedSchema<S.Finite>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L604)

Since v0.0.0

## BorderDetectionTolerance

RGB channel tolerance accepted by border detection.

**Example**

```ts
import { BorderDetectionTolerance } from "@beep/repo-cli/commands/Files"
console.log(BorderDetectionTolerance)
```

**Signature**

```ts
declare const BorderDetectionTolerance: AnnotatedSchema<S.Finite>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L698)

Since v0.0.0

## BorderSide

Side of an image edge scanned for a solid border.

**Example**

```ts
import { BorderSide } from "@beep/repo-cli/commands/Files"
console.log(BorderSide)
```

**Signature**

```ts
declare const BorderSide: AnnotatedSchema<LiteralKit<readonly ["top", "right", "bottom", "left"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L312)

Since v0.0.0

## CandidateAssessmentDecision

Candidate-quality decision produced by `files archive-poor-candidates`.

**Example**

```ts
import { CandidateAssessmentDecision } from "@beep/repo-cli/commands/Files"
console.log(CandidateAssessmentDecision)
```

**Signature**

```ts
declare const CandidateAssessmentDecision: AnnotatedSchema<LiteralKit<readonly ["archive", "keep"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L485)

Since v0.0.0

## CandidateAssessmentProfile

Dataset profile used by candidate-quality triage.

**Example**

```ts
import { CandidateAssessmentProfile } from "@beep/repo-cli/commands/Files"
console.log(CandidateAssessmentProfile)
```

**Signature**

```ts
declare const CandidateAssessmentProfile: AnnotatedSchema<LiteralKit<readonly ["character-lora"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L460)

Since v0.0.0

## CandidateAssessmentReason

Hard-threshold reason that can cause an image to be archived.

**Example**

```ts
import { CandidateAssessmentReason } from "@beep/repo-cli/commands/Files"
console.log(CandidateAssessmentReason)
```

**Signature**

```ts
declare const CandidateAssessmentReason: AnnotatedSchema<LiteralKit<readonly ["extreme-aspect-ratio", "short-edge-too-small", "upscale-too-large"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L510)

Since v0.0.0

## CandidateRatioThreshold

Numeric threshold ratio used by candidate-quality triage.

**Example**

```ts
import { CandidateRatioThreshold } from "@beep/repo-cli/commands/Files"
console.log(CandidateRatioThreshold)
```

**Signature**

```ts
declare const CandidateRatioThreshold: AnnotatedSchema<S.Finite>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L572)

Since v0.0.0

## CreateCaptionFilesSkippedReason

Reason a direct directory entry was skipped by `files create-captions`.

**Example**

```ts
import { CreateCaptionFilesSkippedReason } from "@beep/repo-cli/commands/Files"
console.log(CreateCaptionFilesSkippedReason)
```

**Signature**

```ts
declare const CreateCaptionFilesSkippedReason: AnnotatedSchema<LiteralKit<readonly ["caption-exists", "caption-target-collision", "caption-target-not-file", "directory", "extensionless", "non-media", "symlink", "video"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L278)

Since v0.0.0

## DetectBordersSkippedReason

Reason a direct directory entry was skipped by `files detect-borders`.

**Example**

```ts
import { DetectBordersSkippedReason } from "@beep/repo-cli/commands/Files"
console.log(DetectBordersSkippedReason)
```

**Signature**

```ts
declare const DetectBordersSkippedReason: AnnotatedSchema<LiteralKit<readonly ["directory", "extensionless", "non-media", "symlink", "unsupported-image", "unreadable-image", "video"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L362)

Since v0.0.0

## DetectFacesFlag

Triage flag emitted by `files detect-faces`.

**Example**

```ts
import { DetectFacesFlag } from "@beep/repo-cli/commands/Files"
console.log(DetectFacesFlag)
```

**Signature**

```ts
declare const DetectFacesFlag: AnnotatedSchema<LiteralKit<readonly ["face-at-edge", "face-too-small", "has-face", "multiple-faces", "no-face"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L429)

Since v0.0.0

## DetectFacesSkippedReason

Reason a direct directory entry was skipped by `files detect-faces`.

**Example**

```ts
import { DetectFacesSkippedReason } from "@beep/repo-cli/commands/Files"
console.log(DetectFacesSkippedReason)
```

**Signature**

```ts
declare const DetectFacesSkippedReason: AnnotatedSchema<LiteralKit<readonly ["detection-failed", "directory", "extensionless", "non-media", "symlink", "unreadable-image", "unsupported-image", "video"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L395)

Since v0.0.0

## FileSha256Hash

SHA-256 hash recorded for normalized file bytes.

**Example**

```ts
import { FileSha256Hash } from "@beep/repo-cli/commands/Files"
console.log(FileSha256Hash)
```

**Signature**

```ts
declare const FileSha256Hash: AnnotatedSchema<S.String>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L72)

Since v0.0.0

## MediaKind

Media kind schema for selected dataset files.

**Example**

```ts
import { MediaKind } from "@beep/repo-cli/commands/Files"
console.log(MediaKind)
```

**Signature**

```ts
declare const MediaKind: AnnotatedSchema<LiteralKit<readonly ["image", "video"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L145)

Since v0.0.0

## NonNegativePixelOffset

Non-negative pixel offset schema.

**Example**

```ts
import { NonNegativePixelOffset } from "@beep/repo-cli/commands/Files"
console.log(NonNegativePixelOffset)
```

**Signature**

```ts
declare const NonNegativePixelOffset: AnnotatedSchema<S.Int>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L104)

Since v0.0.0

## NormalizeImageFormat

Canonical image output format emitted by `files normalize`.

**Example**

```ts
import { NormalizeImageFormat } from "@beep/repo-cli/commands/Files"
console.log(NormalizeImageFormat)
```

**Signature**

```ts
declare const NormalizeImageFormat: AnnotatedSchema<LiteralKit<readonly ["png", "jpg", "webp"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L220)

Since v0.0.0

## NormalizeImageFormatInput

CLI image format accepted by `files normalize`.

**Example**

```ts
import { NormalizeImageFormatInput } from "@beep/repo-cli/commands/Files"
console.log(NormalizeImageFormatInput)
```

**Signature**

```ts
declare const NormalizeImageFormatInput: AnnotatedSchema<LiteralKit<readonly ["png", "jpg", "jpeg", "webp"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L195)

Since v0.0.0

## NormalizeSkippedReason

Reason a direct directory entry was skipped by `files normalize`.

**Example**

```ts
import { NormalizeSkippedReason } from "@beep/repo-cli/commands/Files"
console.log(NormalizeSkippedReason)
```

**Signature**

```ts
declare const NormalizeSkippedReason: AnnotatedSchema<LiteralKit<readonly ["duplicate", "directory", "extensionless", "non-media", "symlink", "unsupported-image", "video"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L245)

Since v0.0.0

## PositiveMediaDimension

Positive media dimension schema.

**Example**

```ts
import { PositiveMediaDimension } from "@beep/repo-cli/commands/Files"
console.log(PositiveMediaDimension)
```

**Signature**

```ts
declare const PositiveMediaDimension: AnnotatedSchema<S.Int>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L31)

Since v0.0.0

## ProcessFilesFailurePolicy

Failure policy for `files process`.

**Example**

```ts
import { ProcessFilesFailurePolicy } from "@beep/repo-cli/commands/Files"
console.log(ProcessFilesFailurePolicy)
```

**Signature**

```ts
declare const ProcessFilesFailurePolicy: AnnotatedSchema<LiteralKit<readonly ["continue", "fail-on-error"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L2244)

Since v0.0.0

## RgbChannel

Integer RGB channel value.

**Example**

```ts
import { RgbChannel } from "@beep/repo-cli/commands/Files"
console.log(RgbChannel)
```

**Signature**

```ts
declare const RgbChannel: AnnotatedSchema<S.Int>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L745)

Since v0.0.0

## SafeFilePrefix

Safe generated filename prefix schema.

**Example**

```ts
import { SafeFilePrefix } from "@beep/repo-cli/commands/Files"
console.log(SafeFilePrefix)
```

**Signature**

```ts
declare const SafeFilePrefix: AnnotatedSchema<S.NonEmptyString>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L877)

Since v0.0.0

## SupportedMetadataImageExtension

Image extension schema supported by metadata stripping.

**Example**

```ts
import { SupportedMetadataImageExtension } from "@beep/repo-cli/commands/Files"
console.log(SupportedMetadataImageExtension)
```

**Signature**

```ts
declare const SupportedMetadataImageExtension: AnnotatedSchema<LiteralKit<readonly ["avif", "jpeg", "jpg", "png", "tif", "tiff", "webp"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.schemas.ts#L170)

Since v0.0.0