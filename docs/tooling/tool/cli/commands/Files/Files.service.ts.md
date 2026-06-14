---
title: Files.service.ts
nav_order: 35
parent: "@beep/repo-cli"
---

## Files.service.ts overview

Service implementation for dataset file curation commands.

Since v0.0.0

---
## Exports Grouped by Category
- [layers](#layers)
  - [FilesCommandServiceLive](#filescommandservicelive)
- [services](#services)
  - [FilesCommandService (class)](#filescommandservice-class)
  - [FilesCommandServiceShape (interface)](#filescommandserviceshape-interface)
- [use-cases](#use-cases)
  - [archivePoorCandidates](#archivepoorcandidates)
  - [createCaptionFiles](#createcaptionfiles)
  - [cropBordersFiles](#cropbordersfiles)
  - [detectBordersFiles](#detectbordersfiles)
  - [detectFacesFiles](#detectfacesfiles)
  - [normalizeFiles](#normalizefiles)
  - [printFilesIndex](#printfilesindex)
  - [processFiles](#processfiles)
  - [sortAndRenameFiles](#sortandrenamefiles)
  - [stripMetadataFiles](#stripmetadatafiles)
---

# layers

## FilesCommandServiceLive

Live service layer for dataset file curation operations.

**Example**

```ts
import { FilesCommandServiceLive } from "@beep/repo-cli/commands/Files"
console.log(FilesCommandServiceLive)
```

**Signature**

```ts
declare const FilesCommandServiceLive: Layer.Layer<FilesCommandService, never, FilesCommandServiceRequirements>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.service.ts#L5505)

Since v0.0.0

# services

## FilesCommandService (class)

Service tag for dataset file curation operations.

**Example**

```ts
import { FilesCommandService } from "@beep/repo-cli/commands/Files"
console.log(FilesCommandService)
```

**Signature**

```ts
declare class FilesCommandService
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.service.ts#L426)

Since v0.0.0

## FilesCommandServiceShape (interface)

Service contract for dataset file curation operations.

**Example**

```ts
import type { FilesCommandServiceShape } from "@beep/repo-cli/commands/Files"
const value = {} as FilesCommandServiceShape
console.log(value)
```

**Signature**

```ts
export interface FilesCommandServiceShape {
  /**
   * Archive obvious poor image candidates out of a dataset directory.
   *
   * @since 0.0.0
   */
  readonly archivePoorCandidates: (
    options: ArchivePoorCandidatesOptions
  ) => Effect.Effect<ArchivePoorCandidatesSummary, FilesCommandError>;

  /**
   * Create same-stem caption sidecar files for direct image files.
   *
   * @since 0.0.0
   */
  readonly createCaptionFiles: (
    options: CreateCaptionFilesOptions
  ) => Effect.Effect<CreateCaptionFilesSummary, FilesCommandError>;

  /**
   * Crop solid or near-solid borders from direct image files.
   *
   * @since 0.0.0
   */
  readonly cropBordersFiles: (options: CropBordersOptions) => Effect.Effect<CropBordersSummary, FilesCommandError>;

  /**
   * Detect solid or near-solid borders in direct image files.
   *
   * @since 0.0.0
   */
  readonly detectBordersFiles: (options: DetectBordersOptions) => Effect.Effect<DetectBordersReport, FilesCommandError>;

  /**
   * Detect human faces in direct image files.
   *
   * @since 0.0.0
   */
  readonly detectFacesFiles: (options: DetectFacesOptions) => Effect.Effect<DetectFacesReport, FilesCommandError>;

  /**
   * Normalize direct image files into a reversible output directory.
   *
   * @since 0.0.0
   */
  readonly normalizeFiles: (options: NormalizeFilesOptions) => Effect.Effect<NormalizeSummary, FilesCommandError>;

  /**
   * Process a file or directory into the V1 file-processing proof manifest tree.
   *
   * @since 0.0.0
   */
  readonly processFiles: (options: ProcessFilesOptions) => Effect.Effect<ProcessFilesSummary, FilesCommandError>;

  /**
   * Sort direct regular files in a directory by size and rename them.
   *
   * @since 0.0.0
   */
  readonly sortAndRenameFiles: (
    dir: string,
    prefix: string,
    dryRun: boolean,
    withDimensions?: boolean
  ) => Effect.Effect<SortAndRenameSummary, FilesCommandError>;

  /**
   * Strip user-authored metadata from direct image and video files in a directory.
   *
   * @since 0.0.0
   */
  readonly stripMetadataFiles: (dir: string, dryRun: boolean) => Effect.Effect<StripMetadataSummary, FilesCommandError>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.service.ts#L341)

Since v0.0.0

# use-cases

## archivePoorCandidates

Archive obvious poor image candidates out of a dataset directory.

**Example**

```ts
import { archivePoorCandidates } from "@beep/repo-cli/commands/Files"
console.log(archivePoorCandidates)
```

**Signature**

```ts
declare const archivePoorCandidates: (options: ArchivePoorCandidatesOptions) => Effect.Effect<ArchivePoorCandidatesSummary, FilesCommandError, FilesCommandService>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.service.ts#L5521)

Since v0.0.0

## createCaptionFiles

Create same-stem caption sidecar files for direct image files.

**Example**

```ts
import { createCaptionFiles } from "@beep/repo-cli/commands/Files"
console.log(createCaptionFiles)
```

**Signature**

```ts
declare const createCaptionFiles: (options: CreateCaptionFilesOptions) => Effect.Effect<CreateCaptionFilesSummary, FilesCommandError, FilesCommandService>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.service.ts#L5541)

Since v0.0.0

## cropBordersFiles

Crop solid or near-solid borders from direct image files.

**Example**

```ts
import { cropBordersFiles } from "@beep/repo-cli/commands/Files"
console.log(cropBordersFiles)
```

**Signature**

```ts
declare const cropBordersFiles: (options: CropBordersOptions) => Effect.Effect<CropBordersSummary, FilesCommandError, FilesCommandService>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.service.ts#L5561)

Since v0.0.0

## detectBordersFiles

Detect solid or near-solid borders in direct image files.

**Example**

```ts
import { detectBordersFiles } from "@beep/repo-cli/commands/Files"
console.log(detectBordersFiles)
```

**Signature**

```ts
declare const detectBordersFiles: (options: DetectBordersOptions) => Effect.Effect<DetectBordersReport, FilesCommandError, FilesCommandService>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.service.ts#L5581)

Since v0.0.0

## detectFacesFiles

Detect human faces in direct image files.

**Example**

```ts
import { detectFacesFiles } from "@beep/repo-cli/commands/Files"
console.log(detectFacesFiles)
```

**Signature**

```ts
declare const detectFacesFiles: (options: DetectFacesOptions) => Effect.Effect<DetectFacesReport, FilesCommandError, FilesCommandService>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.service.ts#L5601)

Since v0.0.0

## normalizeFiles

Normalize direct image files into an output directory and write a transform manifest.

**Example**

```ts
import { normalizeFiles } from "@beep/repo-cli/commands/Files"
console.log(normalizeFiles)
```

**Signature**

```ts
declare const normalizeFiles: (options: NormalizeFilesOptions) => Effect.Effect<NormalizeSummary, FilesCommandError, FilesCommandService>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.service.ts#L5621)

Since v0.0.0

## printFilesIndex

Print the files command index.

**Example**

```ts
import { printFilesIndex } from "@beep/repo-cli/commands/Files"
console.log(printFilesIndex)
```

**Signature**

```ts
declare const printFilesIndex: Effect.Effect<void, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.service.ts#L4737)

Since v0.0.0

## processFiles

Process a file or directory into the V1 file-processing proof manifest tree.

**Example**

```ts
import { processFiles } from "@beep/repo-cli/commands/Files"
console.log(processFiles)
```

**Signature**

```ts
declare const processFiles: (options: ProcessFilesOptions) => Effect.Effect<ProcessFilesSummary, FilesCommandError, FilesCommandService>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.service.ts#L5642)

Since v0.0.0

## sortAndRenameFiles

Sort direct regular files in a directory by size and rename them with a generated prefix.

**Example**

```ts
import { sortAndRenameFiles } from "@beep/repo-cli/commands/Files"
console.log(sortAndRenameFiles)
```

**Signature**

```ts
declare const sortAndRenameFiles: (dir: string, prefix: string, dryRun: boolean, withDimensions?: any) => Effect.Effect<SortAndRenameSummary, FilesCommandError, FilesCommandService>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.service.ts#L5665)

Since v0.0.0

## stripMetadataFiles

Strip user-authored metadata from direct image and video files in a directory.
Unless `dryRun` is true, selected files are rewritten in place.

**Example**

```ts
import { stripMetadataFiles } from "@beep/repo-cli/commands/Files/index"

const program = stripMetadataFiles("./tmp", true)
console.log(program)
```

**Signature**

```ts
declare const stripMetadataFiles: (dir: string, dryRun: boolean) => Effect.Effect<StripMetadataSummary, FilesCommandError, FilesCommandService>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.service.ts#L5692)

Since v0.0.0