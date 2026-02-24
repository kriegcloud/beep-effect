# JSDoc Analysis Report: @beep/schema

> **Generated**: 2025-12-06T05:34:30.309Z
> **Package**: packages/common/schema
> **Status**: 1175 exports need documentation

---

## Instructions for Agent

You are tasked with adding missing JSDoc documentation to this package. Follow these rules:

1. **Required Tags**: Every public export must have:
   - `@category` - Hierarchical category (e.g., "Constructors", "Models/User", "Utils/String")
   - `@example` - Working TypeScript code example with imports
   - `@since` - Version when added (use `0.1.0` for new items)

2. **Example Format**:
   ```typescript
   /**
    * Brief description of what this does.
    *
    * @example
    * ```typescript
    * import { MyThing } from "@beep/schema"
    *
    * const result = MyThing.make({ field: "value" })
    * console.log(result)
    * // => { field: "value" }
    * ```
    *
    * @category Constructors
    * @since 0.1.0
    */
   ```

3. **Workflow**:
   - Work through the checklist below in order
   - Mark items complete by changing `[ ]` to `[x]`
   - After completing all items, delete this file

---

## Progress Checklist

### High Priority (Missing all required tags)

- [ ] `src/builders.ts:12` — **Builders** (const)
  - Missing: @category, @example, @since

- [ ] `src/builders.ts:12` — **JsonSchema** (const)
  - Missing: @category, @example, @since

- [ ] `src/core.ts:15` — **Annotations** (const)
  - Missing: @category, @example, @since

- [ ] `src/core.ts:15` — **Extended** (const)
  - Missing: @category, @example, @since

- [ ] `src/core.ts:16` — **Generics** (const)
  - Missing: @category, @example, @since

- [ ] `src/core.ts:15` — **Utils** (const)
  - Missing: @category, @example, @since

- [ ] `src/core.ts:75` — **ScopesAnnotationId** (const)
  - Missing: @category, @example, @since

- [ ] `src/core.ts:77` — **Scopes** (type)
  - Missing: @category, @example, @since

- [ ] `src/core.ts:28` — **DefaultTaggedClass** (const)
  - Missing: @category, @example, @since

- [ ] `src/core.ts:15` — **WithDefaultsThunk** (const)
  - Missing: @category, @example, @since

- [ ] `src/derived.ts:9` — **ArrayLookupSchema** (interface)
  - Missing: @category, @example, @since

- [ ] `src/derived.ts:46` — **ArrayLookupSchema** (const)
  - Missing: @category, @example, @since

- [ ] `src/derived.ts:9` — **KeyOrderLookupSchema** (interface)
  - Missing: @category, @example, @since

- [ ] `src/derived.ts:91` — **KeyOrderLookupSchema** (const)
  - Missing: @category, @example, @since

- [ ] `src/derived.ts:301` — **makeLiteralKit** (function)
  - Missing: @category, @example, @since
  - Context: Implementation of string literal kit factory.

- [ ] `src/derived.ts:440` — **StringLiteralKit** (function)
  - Missing: @category, @example, @since

- [ ] `src/derived.ts:446` — **StringLiteralKit** (function)
  - Missing: @category, @example, @since

- [ ] `src/derived.ts:5` — **OptionArrayToOptionStructValueSchema** (type)
  - Missing: @category, @example, @since

- [ ] `src/derived.ts:29` — **OptionArrayToOptionStructValueSchema** (const)
  - Missing: @category, @example, @since

- [ ] `src/derived.ts:7` — **OptionArrayToOptionTupleTypeId** (const)
  - Missing: @category, @example, @since

- [ ] `src/derived.ts:10` — **OptionArrayToOptionTupleSchema** (type)
  - Missing: @category, @example, @since

- [ ] `src/derived.ts:41` — **OptionArrayToOptionTupleSchema** (const)
  - Missing: @category, @example, @since

- [ ] `src/derived.ts:9` — **StructToTupleTypeId** (const)
  - Missing: @category, @example, @since

- [ ] `src/derived.ts:36` — **StructToTupleSchema** (type)
  - Missing: @category, @example, @since

- [ ] `src/derived.ts:70` — **StructToTupleSchema** (const)
  - Missing: @category, @example, @since

- [ ] `src/derived.ts:87` — **StructToTupleValueSchema** (type)
  - Missing: @category, @example, @since

- [ ] `src/derived.ts:128` — **StructToTupleValueSchema** (const)
  - Missing: @category, @example, @since

- [ ] `src/derived.ts:33` — **TupleToStructSchema** (type)
  - Missing: @category, @example, @since

- [ ] `src/derived.ts:67` — **TupleToStructSchema** (const)
  - Missing: @category, @example, @since

- [ ] `src/derived.ts:84` — **TupleToStructValueSchema** (type)
  - Missing: @category, @example, @since

- [ ] `src/derived.ts:125` — **TupleToStructValueSchema** (const)
  - Missing: @category, @example, @since

- [ ] `src/identity.ts:13` — **EntityId** (const)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:11` — **AspectRatioDimensions** (class)
  - Missing: @category, @example, @since
  - Context: Encoded representation of an aspect ratio

- [ ] `src/integrations.ts:18` — **AspectRatioDimensions** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:26` — **AspectRatioString** (type)
  - Missing: @category, @example, @since
  - Context: Template literal type for aspect ratio string

- [ ] `src/integrations.ts:31` — **AspectRatioStringSchema** (const)
  - Missing: @category, @example, @since
  - Context: Schema for the decoded aspect ratio string format

- [ ] `src/integrations.ts:78` — **AspectRatio** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:130` — **omitKnownLargeFields** (const)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Clean specific known large fields from EXIF data using Effect's EffStruct.omit

- [ ] `src/integrations.ts:174` — **ExifMetadata** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:317` — **IXmpTag** (interface)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:509` — **ExifTags** (const)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:752` — **ExpandedTags** (const)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:792` — **ExpandedTags** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:797` — **Tags** (const)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:5` — **FileAttributes** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:24` — **FileAttributes** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:16` — **FileType** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:18` — **FileType** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:29` — **UploadAnnotation** (type)
  - Missing: @category, @example, @since
  - Context: Upload observability

- [ ] `src/integrations.ts:33` — **makeFileAnnotations** (const)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:41` — **ValidationError** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:51` — **DetectionError** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:60` — **FileFromSelf** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:124` — **FileFromSelf** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:129` — **FileInstance** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:168` — **FileInstance** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:173` — **FileInstanceFromNative** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:190` — **FileInstanceFromNative** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:9` — **ByteUnit** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:17` — **ByteUnit** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:27` — **BiByteUnit** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:45` — **BiByteUnit** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:55` — **BitUnit** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:73` — **BitUnit** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:83` — **BiBitUnit** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:101` — **BiBitUnit** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:111` — **SiByteUnit** (type)
  - Missing: @category, @example, @since
  - Context: SI decimal byte unit type alias

- [ ] `src/integrations.ts:114` — **IecByteUnit** (type)
  - Missing: @category, @example, @since
  - Context: IEC binary byte unit type alias

- [ ] `src/integrations.ts:117` — **SiBitUnit** (type)
  - Missing: @category, @example, @since
  - Context: SI decimal bit unit type alias

- [ ] `src/integrations.ts:120` — **IecBitUnit** (type)
  - Missing: @category, @example, @since
  - Context: IEC binary bit unit type alias

- [ ] `src/integrations.ts:4` — **FileInfo** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:19` — **FileInfo** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:24` — **DetectedFileInfo** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:39` — **DetectedFileInfo** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:2` — **FileSignature** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:18` — **FileSignature** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:1108` — **isAAC** (function)
  - Missing: @category, @example, @since
  - Has: @param, @param, @returns
  - Context: Determine if file content contains a valid 'aac' file signature

- [ ] `src/integrations.ts:1130` — **isAMR** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'amr' file signature

- [ ] `src/integrations.ts:1142` — **isFLAC** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'flac' file signature

- [ ] `src/integrations.ts:1154` — **isM4A** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'm4a' file signature

- [ ] `src/integrations.ts:1166` — **isMP3** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'mp3' file signature

- [ ] `src/integrations.ts:1178` — **isWAV** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'wav' file signature

- [ ] `src/integrations.ts:1190` — **is7Z** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid '7z' file signature

- [ ] `src/integrations.ts:1202` — **isLZH** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'lzh' file signature

- [ ] `src/integrations.ts:1214` — **isRAR** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'rar' file signature

- [ ] `src/integrations.ts:1227` — **isZIP** (function)
  - Missing: @category, @example, @since
  - Has: @param, @param, @returns
  - Context: Determine if file content contains a valid 'zip' file signature

- [ ] `src/integrations.ts:1242` — **isAVIF** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'avif' file signature

- [ ] `src/integrations.ts:1258` — **isBMP** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'bmp' file signature

- [ ] `src/integrations.ts:1270` — **isBPG** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'bpg' file signature

- [ ] `src/integrations.ts:1282` — **isCR2** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'cr2' file signature

- [ ] `src/integrations.ts:1294` — **isEXR** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'exr' file signature

- [ ] `src/integrations.ts:1306` — **isGIF** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'gif' file signature

- [ ] `src/integrations.ts:1318` — **isHEIC** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'heic' file signature

- [ ] `src/integrations.ts:1334` — **isICO** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'ico' file signature

- [ ] `src/integrations.ts:1346` — **isJPEG** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'jpeg' file signature

- [ ] `src/integrations.ts:1358` — **isPBM** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'pbm' file signature

- [ ] `src/integrations.ts:1370` — **isPGM** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'pgm' file signature

- [ ] `src/integrations.ts:1382` — **isPNG** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'png' file signature

- [ ] `src/integrations.ts:1394` — **isPPM** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'ppm' file signature

- [ ] `src/integrations.ts:1406` — **isPSD** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'psd' file signature

- [ ] `src/integrations.ts:1418` — **isWEBP** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'webp' file signature

- [ ] `src/integrations.ts:1430` — **isBLEND** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'blend' file signature

- [ ] `src/integrations.ts:1442` — **isELF** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'elf' file signature

- [ ] `src/integrations.ts:1454` — **isEXE** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'exe' file signature

- [ ] `src/integrations.ts:1466` — **isMACHO** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'mach-o' file signature

- [ ] `src/integrations.ts:1478` — **isINDD** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'indd' file signature

- [ ] `src/integrations.ts:1490` — **isORC** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'orc' file signature

- [ ] `src/integrations.ts:1502` — **isPARQUET** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'parquet' file signature

- [ ] `src/integrations.ts:1514` — **isPDF** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'pdf' file signature

- [ ] `src/integrations.ts:1526` — **isPS** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'ps' file signature

- [ ] `src/integrations.ts:1538` — **isRTF** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'rtf' file signature

- [ ] `src/integrations.ts:1550` — **isSQLITE** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'sqlite' file signature

- [ ] `src/integrations.ts:1562` — **isSTL** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'stl' file signature

- [ ] `src/integrations.ts:1574` — **isTTF** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'ttf' file signature

- [ ] `src/integrations.ts:1586` — **isDOC** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'doc' file signature

- [ ] `src/integrations.ts:1598` — **isPCAP** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'pcap' file signature

- [ ] `src/integrations.ts:1610` — **isAVI** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'avi' file signature

- [ ] `src/integrations.ts:1623` — **isFLV** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'flv' file signature.

- [ ] `src/integrations.ts:1640` — **isM4V** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'm4v' file signature.

- [ ] `src/integrations.ts:1657` — **isMKV** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'mkv' file signature.

- [ ] `src/integrations.ts:1673` — **isMOV** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'mov' file signature

- [ ] `src/integrations.ts:1686` — **isMP4** (function)
  - Missing: @category, @example, @since
  - Has: @param, @param, @returns
  - Context: Determine if file content contains a valid 'mp4' file signature.

- [ ] `src/integrations.ts:1708` — **isOGG** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'ogg' file signature

- [ ] `src/integrations.ts:1720` — **isSWF** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'swf' file signature

- [ ] `src/integrations.ts:1733` — **isWEBM** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'webm' file signature.

- [ ] `src/integrations.ts:1751` — **validateFileType** (function)
  - Missing: @category, @example, @since
  - Has: @param, @param, @param, @returns
  - Context: Validates the requested file signature against a list of accepted file types

- [ ] `src/integrations.ts:19` — **VideoTypes** (class)
  - Missing: @category, @example, @since
  - Context: Video files information with their unique signatures

- [ ] `src/integrations.ts:175` — **OtherTypes** (class)
  - Missing: @category, @example, @since
  - Context: Other files information with their unique signatures

- [ ] `src/integrations.ts:406` — **ImageTypes** (class)
  - Missing: @category, @example, @since
  - Context: Image files information with their unique signatures

- [ ] `src/integrations.ts:640` — **CompressedTypes** (class)
  - Missing: @category, @example, @since
  - Context: Compressed files information with their unique signatures

- [ ] `src/integrations.ts:789` — **AudioTypes** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:887` — **FILE_TYPES_REQUIRED_ADDITIONAL_CHECK** (const)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:894` — **FileTypes** (class)
  - Missing: @category, @example, @since
  - Context: A class hold all supported file typs with their unique signatures

- [ ] `src/integrations.ts:4` — **fileTypeChecker** (const)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:1` — **FileValidatorOptions** (interface)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:8` — **ZipValidatorOptions** (interface)
  - Missing: @category, @example, @since
  - Context: Options used to pass to izZip function.

- [ ] `src/integrations.ts:15` — **ValidateFileTypeOptions** (interface)
  - Missing: @category, @example, @since
  - Context: Options used to pass to validate file type function.

- [ ] `src/integrations.ts:23` — **DetectFileOptions** (interface)
  - Missing: @category, @example, @since
  - Context: Options used to pass to detect file function.

- [ ] `src/integrations.ts:19` — **getFileChunk** (function)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:46` — **fetchFromObject** (function)
  - Missing: @category, @example, @since
  - Has: @param, @param, @returns
  - Context: Fetch a property of a object by its name

- [ ] `src/integrations.ts:63` — **findMatroskaDocTypeElements** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Identify whether a valid 'mkv'/'web' file is 'mkv' or 'webm'.

- [ ] `src/integrations.ts:88` — **isftypStringIncluded** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if array of numbers contains the "fytp" string.

- [ ] `src/integrations.ts:115` — **isFlvStringIncluded** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if array of numbers contains the "FLV" string.

- [ ] `src/integrations.ts:121` — **isFileContaineJfiforExifHeader** (function)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:141` — **isAvifStringIncluded** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if array of numbers contains the "ftypavif" string.

- [ ] `src/integrations.ts:159` — **isHeicSignatureIncluded** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if a file chunk contains a HEIC file box.

- [ ] `src/integrations.ts:153` — **getTypes** (function)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:158` — **getExtensions** (function)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:166` — **lookup** (function)
  - Missing: @category, @example, @since
  - Context: Lookup the MIME type for a file path/extension.

- [ ] `src/integrations.ts:30` — **extractMimeExtensions** (const)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:50` — **extractMimeTypes** (const)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:63` — **ApplicationMimeType** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:65` — **ApplicationMimeType** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:70` — **VideoMimeType** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:72` — **VideoMimeType** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:77` — **TextMimeType** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:79` — **TextMimeType** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:84` — **ImageMimeType** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:86` — **ImageMimeType** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:91` — **AudioMimeType** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:93` — **AudioMimeType** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:98` — **MiscMimeType** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:100` — **MiscMimeType** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:118` — **MimeType** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:127` — **MimeType** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:132` — **FileExtension** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:134` — **FileExtension** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:139` — **mimeTypes** (const)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:23` — **PrettyBytesOptions** (interface)
  - Missing: @category, @example, @since

- [ ] `src/integrations.ts:100` — **PrettyBytesString** (type)
  - Missing: @category, @example, @since
  - Context: Template literal string type that ensures the unit part is always one of

- [ ] `src/integrations.ts:77` — **DateTimeAllEncoded** (const)
  - Missing: @category, @example, @since

- [ ] `src/internal.ts:3` — **$FormId** (const)
  - Missing: @category, @example, @since

- [ ] `src/internal.ts:3` — **$JsonSchemaId** (const)
  - Missing: @category, @example, @since

- [ ] `src/internal.ts:3` — **$AnnotationsId** (const)
  - Missing: @category, @example, @since

- [ ] `src/internal.ts:3` — **$ExtendedId** (const)
  - Missing: @category, @example, @since

- [ ] `src/internal.ts:3` — **$GenericsId** (const)
  - Missing: @category, @example, @since

- [ ] `src/internal.ts:3` — **$KitsId** (const)
  - Missing: @category, @example, @since

- [ ] `src/internal.ts:3` — **$ConfigId** (const)
  - Missing: @category, @example, @since

- [ ] `src/internal.ts:3` — **$HttpId** (const)
  - Missing: @category, @example, @since

- [ ] `src/internal.ts:3` — **$SqlId** (const)
  - Missing: @category, @example, @since

- [ ] `src/internal.ts:3` — **$FilesId** (const)
  - Missing: @category, @example, @since

- [ ] `src/internal.ts:3` — **$RegexId** (const)
  - Missing: @category, @example, @since

- [ ] `src/internal.ts:4` — **$BinaryId** (const)
  - Missing: @category, @example, @since

- [ ] `src/internal.ts:5` — **$BoolId** (const)
  - Missing: @category, @example, @since

- [ ] `src/internal.ts:6` — **$ContentTypeId** (const)
  - Missing: @category, @example, @since

- [ ] `src/internal.ts:7` — **$FnId** (const)
  - Missing: @category, @example, @since

- [ ] `src/internal.ts:8` — **$GeoId** (const)
  - Missing: @category, @example, @since

- [ ] `src/internal.ts:9` — **$JsonId** (const)
  - Missing: @category, @example, @since

- [ ] `src/internal.ts:10` — **$LocalesId** (const)
  - Missing: @category, @example, @since

- [ ] `src/internal.ts:11` — **$NetworkId** (const)
  - Missing: @category, @example, @since

- [ ] `src/internal.ts:12` — **$NumberId** (const)
  - Missing: @category, @example, @since

- [ ] `src/internal.ts:13` — **$PersonId** (const)
  - Missing: @category, @example, @since

- [ ] `src/internal.ts:14` — **$StringId** (const)
  - Missing: @category, @example, @since

- [ ] `src/internal.ts:15` — **$TemporalId** (const)
  - Missing: @category, @example, @since

- [ ] `src/internal.ts:16` — **$UrlId** (const)
  - Missing: @category, @example, @since

- [ ] `src/internal.ts:17` — **$ArrayId** (const)
  - Missing: @category, @example, @since

- [ ] `src/internal.ts:18` — **$ArrayBufferId** (const)
  - Missing: @category, @example, @since

- [ ] `src/internal.ts:19` — **$DurationId** (const)
  - Missing: @category, @example, @since

- [ ] `src/primitives.ts:3` — **CountryCodeValue** (class)
  - Missing: @category, @example, @since

- [ ] `src/primitives.ts:251` — **CountryCodeValue** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/primitives.ts:11` — **Currency** (const)
  - Missing: @category, @example, @since
  - Has: @standard, @description, @link

- [ ] `src/primitives.ts:482` — **Currency** (type)
  - Missing: @category, @example, @since

- [ ] `src/primitives.ts:484` — **CurrencyCodeValue** (class)
  - Missing: @category, @example, @since

- [ ] `src/primitives.ts:486` — **CurrencyCodeValue** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/primitives.ts:3` — **DecodeString** (class)
  - Missing: @category, @example, @since

- [ ] `src/primitives.ts:9` — **DecodeString** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/primitives.ts:186` — **SignleLiteralWithEncodedDefault** (function)
  - Missing: @category, @example, @since

- [ ] `src/primitives.ts:3` — **tlds** (const)
  - Missing: @category, @example, @since

- [ ] `src/primitives.ts:1420` — **TLD** (class)
  - Missing: @category, @example, @since

- [ ] `src/primitives.ts:1422` — **TLD** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:12` — **Builders** (const)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:12` — **JsonSchema** (const)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:15` — **Annotations** (const)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:15` — **Extended** (const)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:16` — **Generics** (const)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:15` — **Utils** (const)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:75` — **ScopesAnnotationId** (const)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:77` — **Scopes** (type)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:28` — **DefaultTaggedClass** (const)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:15` — **WithDefaultsThunk** (const)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:9` — **ArrayLookupSchema** (interface)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:46` — **ArrayLookupSchema** (const)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:9` — **KeyOrderLookupSchema** (interface)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:91` — **KeyOrderLookupSchema** (const)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:301` — **makeLiteralKit** (function)
  - Missing: @category, @example, @since
  - Context: Implementation of string literal kit factory.

- [ ] `src/schema.ts:440` — **StringLiteralKit** (function)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:446` — **StringLiteralKit** (function)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:5` — **OptionArrayToOptionStructValueSchema** (type)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:29` — **OptionArrayToOptionStructValueSchema** (const)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:7` — **OptionArrayToOptionTupleTypeId** (const)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:10` — **OptionArrayToOptionTupleSchema** (type)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:41` — **OptionArrayToOptionTupleSchema** (const)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:9` — **StructToTupleTypeId** (const)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:36` — **StructToTupleSchema** (type)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:70` — **StructToTupleSchema** (const)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:87` — **StructToTupleValueSchema** (type)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:128` — **StructToTupleValueSchema** (const)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:33` — **TupleToStructSchema** (type)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:67` — **TupleToStructSchema** (const)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:84` — **TupleToStructValueSchema** (type)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:125` — **TupleToStructValueSchema** (const)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:13` — **EntityId** (const)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:11` — **AspectRatioDimensions** (class)
  - Missing: @category, @example, @since
  - Context: Encoded representation of an aspect ratio

- [ ] `src/schema.ts:18` — **AspectRatioDimensions** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:26` — **AspectRatioString** (type)
  - Missing: @category, @example, @since
  - Context: Template literal type for aspect ratio string

- [ ] `src/schema.ts:31` — **AspectRatioStringSchema** (const)
  - Missing: @category, @example, @since
  - Context: Schema for the decoded aspect ratio string format

- [ ] `src/schema.ts:78` — **AspectRatio** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:130` — **omitKnownLargeFields** (const)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Clean specific known large fields from EXIF data using Effect's EffStruct.omit

- [ ] `src/schema.ts:174` — **ExifMetadata** (class)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:317` — **IXmpTag** (interface)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:509` — **ExifTags** (const)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:752` — **ExpandedTags** (const)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:792` — **ExpandedTags** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:797` — **Tags** (const)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:5` — **FileAttributes** (class)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:24` — **FileAttributes** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:16` — **FileType** (class)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:18` — **FileType** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:29` — **UploadAnnotation** (type)
  - Missing: @category, @example, @since
  - Context: Upload observability

- [ ] `src/schema.ts:33` — **makeFileAnnotations** (const)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:41` — **ValidationError** (class)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:51` — **DetectionError** (class)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:60` — **FileFromSelf** (class)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:124` — **FileFromSelf** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:129` — **FileInstance** (class)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:168` — **FileInstance** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:173` — **FileInstanceFromNative** (class)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:190` — **FileInstanceFromNative** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:9` — **ByteUnit** (class)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:17` — **ByteUnit** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:27` — **BiByteUnit** (class)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:45` — **BiByteUnit** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:55` — **BitUnit** (class)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:73` — **BitUnit** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:83` — **BiBitUnit** (class)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:101` — **BiBitUnit** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:111` — **SiByteUnit** (type)
  - Missing: @category, @example, @since
  - Context: SI decimal byte unit type alias

- [ ] `src/schema.ts:114` — **IecByteUnit** (type)
  - Missing: @category, @example, @since
  - Context: IEC binary byte unit type alias

- [ ] `src/schema.ts:117` — **SiBitUnit** (type)
  - Missing: @category, @example, @since
  - Context: SI decimal bit unit type alias

- [ ] `src/schema.ts:120` — **IecBitUnit** (type)
  - Missing: @category, @example, @since
  - Context: IEC binary bit unit type alias

- [ ] `src/schema.ts:4` — **FileInfo** (class)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:19` — **FileInfo** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:24` — **DetectedFileInfo** (class)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:39` — **DetectedFileInfo** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:2` — **FileSignature** (class)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:18` — **FileSignature** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:1108` — **isAAC** (function)
  - Missing: @category, @example, @since
  - Has: @param, @param, @returns
  - Context: Determine if file content contains a valid 'aac' file signature

- [ ] `src/schema.ts:1130` — **isAMR** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'amr' file signature

- [ ] `src/schema.ts:1142` — **isFLAC** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'flac' file signature

- [ ] `src/schema.ts:1154` — **isM4A** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'm4a' file signature

- [ ] `src/schema.ts:1166` — **isMP3** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'mp3' file signature

- [ ] `src/schema.ts:1178` — **isWAV** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'wav' file signature

- [ ] `src/schema.ts:1190` — **is7Z** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid '7z' file signature

- [ ] `src/schema.ts:1202` — **isLZH** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'lzh' file signature

- [ ] `src/schema.ts:1214` — **isRAR** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'rar' file signature

- [ ] `src/schema.ts:1227` — **isZIP** (function)
  - Missing: @category, @example, @since
  - Has: @param, @param, @returns
  - Context: Determine if file content contains a valid 'zip' file signature

- [ ] `src/schema.ts:1242` — **isAVIF** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'avif' file signature

- [ ] `src/schema.ts:1258` — **isBMP** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'bmp' file signature

- [ ] `src/schema.ts:1270` — **isBPG** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'bpg' file signature

- [ ] `src/schema.ts:1282` — **isCR2** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'cr2' file signature

- [ ] `src/schema.ts:1294` — **isEXR** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'exr' file signature

- [ ] `src/schema.ts:1306` — **isGIF** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'gif' file signature

- [ ] `src/schema.ts:1318` — **isHEIC** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'heic' file signature

- [ ] `src/schema.ts:1334` — **isICO** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'ico' file signature

- [ ] `src/schema.ts:1346` — **isJPEG** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'jpeg' file signature

- [ ] `src/schema.ts:1358` — **isPBM** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'pbm' file signature

- [ ] `src/schema.ts:1370` — **isPGM** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'pgm' file signature

- [ ] `src/schema.ts:1382` — **isPNG** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'png' file signature

- [ ] `src/schema.ts:1394` — **isPPM** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'ppm' file signature

- [ ] `src/schema.ts:1406` — **isPSD** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'psd' file signature

- [ ] `src/schema.ts:1418` — **isWEBP** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'webp' file signature

- [ ] `src/schema.ts:1430` — **isBLEND** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'blend' file signature

- [ ] `src/schema.ts:1442` — **isELF** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'elf' file signature

- [ ] `src/schema.ts:1454` — **isEXE** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'exe' file signature

- [ ] `src/schema.ts:1466` — **isMACHO** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'mach-o' file signature

- [ ] `src/schema.ts:1478` — **isINDD** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'indd' file signature

- [ ] `src/schema.ts:1490` — **isORC** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'orc' file signature

- [ ] `src/schema.ts:1502` — **isPARQUET** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'parquet' file signature

- [ ] `src/schema.ts:1514` — **isPDF** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'pdf' file signature

- [ ] `src/schema.ts:1526` — **isPS** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'ps' file signature

- [ ] `src/schema.ts:1538` — **isRTF** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'rtf' file signature

- [ ] `src/schema.ts:1550` — **isSQLITE** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'sqlite' file signature

- [ ] `src/schema.ts:1562` — **isSTL** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'stl' file signature

- [ ] `src/schema.ts:1574` — **isTTF** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'ttf' file signature

- [ ] `src/schema.ts:1586` — **isDOC** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'doc' file signature

- [ ] `src/schema.ts:1598` — **isPCAP** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'pcap' file signature

- [ ] `src/schema.ts:1610` — **isAVI** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'avi' file signature

- [ ] `src/schema.ts:1623` — **isFLV** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'flv' file signature.

- [ ] `src/schema.ts:1640` — **isM4V** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'm4v' file signature.

- [ ] `src/schema.ts:1657` — **isMKV** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'mkv' file signature.

- [ ] `src/schema.ts:1673` — **isMOV** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'mov' file signature

- [ ] `src/schema.ts:1686` — **isMP4** (function)
  - Missing: @category, @example, @since
  - Has: @param, @param, @returns
  - Context: Determine if file content contains a valid 'mp4' file signature.

- [ ] `src/schema.ts:1708` — **isOGG** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'ogg' file signature

- [ ] `src/schema.ts:1720` — **isSWF** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'swf' file signature

- [ ] `src/schema.ts:1733` — **isWEBM** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'webm' file signature.

- [ ] `src/schema.ts:1751` — **validateFileType** (function)
  - Missing: @category, @example, @since
  - Has: @param, @param, @param, @returns
  - Context: Validates the requested file signature against a list of accepted file types

- [ ] `src/schema.ts:19` — **VideoTypes** (class)
  - Missing: @category, @example, @since
  - Context: Video files information with their unique signatures

- [ ] `src/schema.ts:175` — **OtherTypes** (class)
  - Missing: @category, @example, @since
  - Context: Other files information with their unique signatures

- [ ] `src/schema.ts:406` — **ImageTypes** (class)
  - Missing: @category, @example, @since
  - Context: Image files information with their unique signatures

- [ ] `src/schema.ts:640` — **CompressedTypes** (class)
  - Missing: @category, @example, @since
  - Context: Compressed files information with their unique signatures

- [ ] `src/schema.ts:789` — **AudioTypes** (class)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:887` — **FILE_TYPES_REQUIRED_ADDITIONAL_CHECK** (const)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:894` — **FileTypes** (class)
  - Missing: @category, @example, @since
  - Context: A class hold all supported file typs with their unique signatures

- [ ] `src/schema.ts:4` — **fileTypeChecker** (const)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:1` — **FileValidatorOptions** (interface)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:8` — **ZipValidatorOptions** (interface)
  - Missing: @category, @example, @since
  - Context: Options used to pass to izZip function.

- [ ] `src/schema.ts:15` — **ValidateFileTypeOptions** (interface)
  - Missing: @category, @example, @since
  - Context: Options used to pass to validate file type function.

- [ ] `src/schema.ts:23` — **DetectFileOptions** (interface)
  - Missing: @category, @example, @since
  - Context: Options used to pass to detect file function.

- [ ] `src/schema.ts:19` — **getFileChunk** (function)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:46` — **fetchFromObject** (function)
  - Missing: @category, @example, @since
  - Has: @param, @param, @returns
  - Context: Fetch a property of a object by its name

- [ ] `src/schema.ts:63` — **findMatroskaDocTypeElements** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Identify whether a valid 'mkv'/'web' file is 'mkv' or 'webm'.

- [ ] `src/schema.ts:88` — **isftypStringIncluded** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if array of numbers contains the "fytp" string.

- [ ] `src/schema.ts:115` — **isFlvStringIncluded** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if array of numbers contains the "FLV" string.

- [ ] `src/schema.ts:121` — **isFileContaineJfiforExifHeader** (function)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:141` — **isAvifStringIncluded** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if array of numbers contains the "ftypavif" string.

- [ ] `src/schema.ts:159` — **isHeicSignatureIncluded** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if a file chunk contains a HEIC file box.

- [ ] `src/schema.ts:153` — **getTypes** (function)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:158` — **getExtensions** (function)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:166` — **lookup** (function)
  - Missing: @category, @example, @since
  - Context: Lookup the MIME type for a file path/extension.

- [ ] `src/schema.ts:30` — **extractMimeExtensions** (const)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:50` — **extractMimeTypes** (const)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:63` — **ApplicationMimeType** (class)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:65` — **ApplicationMimeType** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:70` — **VideoMimeType** (class)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:72` — **VideoMimeType** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:77` — **TextMimeType** (class)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:79` — **TextMimeType** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:84` — **ImageMimeType** (class)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:86` — **ImageMimeType** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:91` — **AudioMimeType** (class)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:93` — **AudioMimeType** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:98` — **MiscMimeType** (class)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:100` — **MiscMimeType** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:118` — **MimeType** (class)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:127` — **MimeType** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:132` — **FileExtension** (class)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:134` — **FileExtension** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:139` — **mimeTypes** (const)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:23` — **PrettyBytesOptions** (interface)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:100` — **PrettyBytesString** (type)
  - Missing: @category, @example, @since
  - Context: Template literal string type that ensures the unit part is always one of

- [ ] `src/schema.ts:77` — **DateTimeAllEncoded** (const)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:3` — **CountryCodeValue** (class)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:251` — **CountryCodeValue** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:11` — **Currency** (const)
  - Missing: @category, @example, @since
  - Has: @standard, @description, @link

- [ ] `src/schema.ts:482` — **Currency** (type)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:484` — **CurrencyCodeValue** (class)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:486` — **CurrencyCodeValue** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:3` — **DecodeString** (class)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:9` — **DecodeString** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:186` — **SignleLiteralWithEncodedDefault** (function)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:3` — **tlds** (const)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:1420` — **TLD** (class)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:1422` — **TLD** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/builders/builders.ts:12` — **JsonSchema** (const)
  - Missing: @category, @example, @since

- [ ] `src/builders/index.ts:12` — **Builders** (const)
  - Missing: @category, @example, @since

- [ ] `src/builders/index.ts:12` — **JsonSchema** (const)
  - Missing: @category, @example, @since

- [ ] `src/core/index.ts:15` — **Annotations** (const)
  - Missing: @category, @example, @since

- [ ] `src/core/index.ts:15` — **Extended** (const)
  - Missing: @category, @example, @since

- [ ] `src/core/index.ts:16` — **Generics** (const)
  - Missing: @category, @example, @since

- [ ] `src/core/index.ts:15` — **Utils** (const)
  - Missing: @category, @example, @since

- [ ] `src/core/index.ts:75` — **ScopesAnnotationId** (const)
  - Missing: @category, @example, @since

- [ ] `src/core/index.ts:77` — **Scopes** (type)
  - Missing: @category, @example, @since

- [ ] `src/core/index.ts:28` — **DefaultTaggedClass** (const)
  - Missing: @category, @example, @since

- [ ] `src/core/index.ts:15` — **WithDefaultsThunk** (const)
  - Missing: @category, @example, @since

- [ ] `src/derived/ArrayLookup.ts:9` — **ArrayLookupSchema** (interface)
  - Missing: @category, @example, @since

- [ ] `src/derived/ArrayLookup.ts:46` — **ArrayLookupSchema** (const)
  - Missing: @category, @example, @since

- [ ] `src/derived/derived.ts:301` — **makeLiteralKit** (function)
  - Missing: @category, @example, @since
  - Context: Implementation of string literal kit factory.

- [ ] `src/derived/derived.ts:440` — **StringLiteralKit** (function)
  - Missing: @category, @example, @since

- [ ] `src/derived/derived.ts:446` — **StringLiteralKit** (function)
  - Missing: @category, @example, @since

- [ ] `src/derived/index.ts:9` — **ArrayLookupSchema** (interface)
  - Missing: @category, @example, @since

- [ ] `src/derived/index.ts:46` — **ArrayLookupSchema** (const)
  - Missing: @category, @example, @since

- [ ] `src/derived/index.ts:9` — **KeyOrderLookupSchema** (interface)
  - Missing: @category, @example, @since

- [ ] `src/derived/index.ts:91` — **KeyOrderLookupSchema** (const)
  - Missing: @category, @example, @since

- [ ] `src/derived/index.ts:301` — **makeLiteralKit** (function)
  - Missing: @category, @example, @since
  - Context: Implementation of string literal kit factory.

- [ ] `src/derived/index.ts:440` — **StringLiteralKit** (function)
  - Missing: @category, @example, @since

- [ ] `src/derived/index.ts:446` — **StringLiteralKit** (function)
  - Missing: @category, @example, @since

- [ ] `src/derived/index.ts:5` — **OptionArrayToOptionStructValueSchema** (type)
  - Missing: @category, @example, @since

- [ ] `src/derived/index.ts:29` — **OptionArrayToOptionStructValueSchema** (const)
  - Missing: @category, @example, @since

- [ ] `src/derived/index.ts:7` — **OptionArrayToOptionTupleTypeId** (const)
  - Missing: @category, @example, @since

- [ ] `src/derived/index.ts:10` — **OptionArrayToOptionTupleSchema** (type)
  - Missing: @category, @example, @since

- [ ] `src/derived/index.ts:41` — **OptionArrayToOptionTupleSchema** (const)
  - Missing: @category, @example, @since

- [ ] `src/derived/index.ts:9` — **StructToTupleTypeId** (const)
  - Missing: @category, @example, @since

- [ ] `src/derived/index.ts:36` — **StructToTupleSchema** (type)
  - Missing: @category, @example, @since

- [ ] `src/derived/index.ts:70` — **StructToTupleSchema** (const)
  - Missing: @category, @example, @since

- [ ] `src/derived/index.ts:87` — **StructToTupleValueSchema** (type)
  - Missing: @category, @example, @since

- [ ] `src/derived/index.ts:128` — **StructToTupleValueSchema** (const)
  - Missing: @category, @example, @since

- [ ] `src/derived/index.ts:33` — **TupleToStructSchema** (type)
  - Missing: @category, @example, @since

- [ ] `src/derived/index.ts:67` — **TupleToStructSchema** (const)
  - Missing: @category, @example, @since

- [ ] `src/derived/index.ts:84` — **TupleToStructValueSchema** (type)
  - Missing: @category, @example, @since

- [ ] `src/derived/index.ts:125` — **TupleToStructValueSchema** (const)
  - Missing: @category, @example, @since

- [ ] `src/derived/KeyOrderLookup.ts:9` — **KeyOrderLookupSchema** (interface)
  - Missing: @category, @example, @since

- [ ] `src/derived/KeyOrderLookup.ts:91` — **KeyOrderLookupSchema** (const)
  - Missing: @category, @example, @since

- [ ] `src/derived/OptionArrayToOptionStruct.ts:5` — **OptionArrayToOptionStructValueSchema** (type)
  - Missing: @category, @example, @since

- [ ] `src/derived/OptionArrayToOptionStruct.ts:29` — **OptionArrayToOptionStructValueSchema** (const)
  - Missing: @category, @example, @since

- [ ] `src/derived/OptionArrayToOptionTuple.ts:7` — **OptionArrayToOptionTupleTypeId** (const)
  - Missing: @category, @example, @since

- [ ] `src/derived/OptionArrayToOptionTuple.ts:10` — **OptionArrayToOptionTupleSchema** (type)
  - Missing: @category, @example, @since

- [ ] `src/derived/OptionArrayToOptionTuple.ts:41` — **OptionArrayToOptionTupleSchema** (const)
  - Missing: @category, @example, @since

- [ ] `src/derived/StructToTuple.ts:9` — **StructToTupleTypeId** (const)
  - Missing: @category, @example, @since

- [ ] `src/derived/StructToTuple.ts:36` — **StructToTupleSchema** (type)
  - Missing: @category, @example, @since

- [ ] `src/derived/StructToTuple.ts:70` — **StructToTupleSchema** (const)
  - Missing: @category, @example, @since

- [ ] `src/derived/StructToTuple.ts:87` — **StructToTupleValueSchema** (type)
  - Missing: @category, @example, @since

- [ ] `src/derived/StructToTuple.ts:128` — **StructToTupleValueSchema** (const)
  - Missing: @category, @example, @since

- [ ] `src/derived/TupleToStruct.ts:33` — **TupleToStructSchema** (type)
  - Missing: @category, @example, @since

- [ ] `src/derived/TupleToStruct.ts:67` — **TupleToStructSchema** (const)
  - Missing: @category, @example, @since

- [ ] `src/derived/TupleToStruct.ts:84` — **TupleToStructValueSchema** (type)
  - Missing: @category, @example, @since

- [ ] `src/derived/TupleToStruct.ts:125` — **TupleToStructValueSchema** (const)
  - Missing: @category, @example, @since

- [ ] `src/identity/identity.ts:13` — **EntityId** (const)
  - Missing: @category, @example, @since

- [ ] `src/identity/index.ts:13` — **EntityId** (const)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:11` — **AspectRatioDimensions** (class)
  - Missing: @category, @example, @since
  - Context: Encoded representation of an aspect ratio

- [ ] `src/integrations/index.ts:18` — **AspectRatioDimensions** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:26` — **AspectRatioString** (type)
  - Missing: @category, @example, @since
  - Context: Template literal type for aspect ratio string

- [ ] `src/integrations/index.ts:31` — **AspectRatioStringSchema** (const)
  - Missing: @category, @example, @since
  - Context: Schema for the decoded aspect ratio string format

- [ ] `src/integrations/index.ts:78` — **AspectRatio** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:130` — **omitKnownLargeFields** (const)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Clean specific known large fields from EXIF data using Effect's EffStruct.omit

- [ ] `src/integrations/index.ts:174` — **ExifMetadata** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:317` — **IXmpTag** (interface)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:509` — **ExifTags** (const)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:752` — **ExpandedTags** (const)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:792` — **ExpandedTags** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:797` — **Tags** (const)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:5` — **FileAttributes** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:24` — **FileAttributes** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:16` — **FileType** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:18` — **FileType** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:29` — **UploadAnnotation** (type)
  - Missing: @category, @example, @since
  - Context: Upload observability

- [ ] `src/integrations/index.ts:33` — **makeFileAnnotations** (const)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:41` — **ValidationError** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:51` — **DetectionError** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:60` — **FileFromSelf** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:124` — **FileFromSelf** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:129` — **FileInstance** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:168` — **FileInstance** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:173` — **FileInstanceFromNative** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:190` — **FileInstanceFromNative** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:9` — **ByteUnit** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:17` — **ByteUnit** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:27` — **BiByteUnit** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:45` — **BiByteUnit** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:55` — **BitUnit** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:73` — **BitUnit** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:83` — **BiBitUnit** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:101` — **BiBitUnit** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:111` — **SiByteUnit** (type)
  - Missing: @category, @example, @since
  - Context: SI decimal byte unit type alias

- [ ] `src/integrations/index.ts:114` — **IecByteUnit** (type)
  - Missing: @category, @example, @since
  - Context: IEC binary byte unit type alias

- [ ] `src/integrations/index.ts:117` — **SiBitUnit** (type)
  - Missing: @category, @example, @since
  - Context: SI decimal bit unit type alias

- [ ] `src/integrations/index.ts:120` — **IecBitUnit** (type)
  - Missing: @category, @example, @since
  - Context: IEC binary bit unit type alias

- [ ] `src/integrations/index.ts:4` — **FileInfo** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:19` — **FileInfo** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:24` — **DetectedFileInfo** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:39` — **DetectedFileInfo** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:2` — **FileSignature** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:18` — **FileSignature** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:1108` — **isAAC** (function)
  - Missing: @category, @example, @since
  - Has: @param, @param, @returns
  - Context: Determine if file content contains a valid 'aac' file signature

- [ ] `src/integrations/index.ts:1130` — **isAMR** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'amr' file signature

- [ ] `src/integrations/index.ts:1142` — **isFLAC** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'flac' file signature

- [ ] `src/integrations/index.ts:1154` — **isM4A** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'm4a' file signature

- [ ] `src/integrations/index.ts:1166` — **isMP3** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'mp3' file signature

- [ ] `src/integrations/index.ts:1178` — **isWAV** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'wav' file signature

- [ ] `src/integrations/index.ts:1190` — **is7Z** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid '7z' file signature

- [ ] `src/integrations/index.ts:1202` — **isLZH** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'lzh' file signature

- [ ] `src/integrations/index.ts:1214` — **isRAR** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'rar' file signature

- [ ] `src/integrations/index.ts:1227` — **isZIP** (function)
  - Missing: @category, @example, @since
  - Has: @param, @param, @returns
  - Context: Determine if file content contains a valid 'zip' file signature

- [ ] `src/integrations/index.ts:1242` — **isAVIF** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'avif' file signature

- [ ] `src/integrations/index.ts:1258` — **isBMP** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'bmp' file signature

- [ ] `src/integrations/index.ts:1270` — **isBPG** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'bpg' file signature

- [ ] `src/integrations/index.ts:1282` — **isCR2** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'cr2' file signature

- [ ] `src/integrations/index.ts:1294` — **isEXR** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'exr' file signature

- [ ] `src/integrations/index.ts:1306` — **isGIF** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'gif' file signature

- [ ] `src/integrations/index.ts:1318` — **isHEIC** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'heic' file signature

- [ ] `src/integrations/index.ts:1334` — **isICO** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'ico' file signature

- [ ] `src/integrations/index.ts:1346` — **isJPEG** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'jpeg' file signature

- [ ] `src/integrations/index.ts:1358` — **isPBM** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'pbm' file signature

- [ ] `src/integrations/index.ts:1370` — **isPGM** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'pgm' file signature

- [ ] `src/integrations/index.ts:1382` — **isPNG** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'png' file signature

- [ ] `src/integrations/index.ts:1394` — **isPPM** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'ppm' file signature

- [ ] `src/integrations/index.ts:1406` — **isPSD** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'psd' file signature

- [ ] `src/integrations/index.ts:1418` — **isWEBP** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'webp' file signature

- [ ] `src/integrations/index.ts:1430` — **isBLEND** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'blend' file signature

- [ ] `src/integrations/index.ts:1442` — **isELF** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'elf' file signature

- [ ] `src/integrations/index.ts:1454` — **isEXE** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'exe' file signature

- [ ] `src/integrations/index.ts:1466` — **isMACHO** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'mach-o' file signature

- [ ] `src/integrations/index.ts:1478` — **isINDD** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'indd' file signature

- [ ] `src/integrations/index.ts:1490` — **isORC** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'orc' file signature

- [ ] `src/integrations/index.ts:1502` — **isPARQUET** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'parquet' file signature

- [ ] `src/integrations/index.ts:1514` — **isPDF** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'pdf' file signature

- [ ] `src/integrations/index.ts:1526` — **isPS** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'ps' file signature

- [ ] `src/integrations/index.ts:1538` — **isRTF** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'rtf' file signature

- [ ] `src/integrations/index.ts:1550` — **isSQLITE** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'sqlite' file signature

- [ ] `src/integrations/index.ts:1562` — **isSTL** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'stl' file signature

- [ ] `src/integrations/index.ts:1574` — **isTTF** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'ttf' file signature

- [ ] `src/integrations/index.ts:1586` — **isDOC** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'doc' file signature

- [ ] `src/integrations/index.ts:1598` — **isPCAP** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'pcap' file signature

- [ ] `src/integrations/index.ts:1610` — **isAVI** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'avi' file signature

- [ ] `src/integrations/index.ts:1623` — **isFLV** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'flv' file signature.

- [ ] `src/integrations/index.ts:1640` — **isM4V** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'm4v' file signature.

- [ ] `src/integrations/index.ts:1657` — **isMKV** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'mkv' file signature.

- [ ] `src/integrations/index.ts:1673` — **isMOV** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'mov' file signature

- [ ] `src/integrations/index.ts:1686` — **isMP4** (function)
  - Missing: @category, @example, @since
  - Has: @param, @param, @returns
  - Context: Determine if file content contains a valid 'mp4' file signature.

- [ ] `src/integrations/index.ts:1708` — **isOGG** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'ogg' file signature

- [ ] `src/integrations/index.ts:1720` — **isSWF** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'swf' file signature

- [ ] `src/integrations/index.ts:1733` — **isWEBM** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'webm' file signature.

- [ ] `src/integrations/index.ts:1751` — **validateFileType** (function)
  - Missing: @category, @example, @since
  - Has: @param, @param, @param, @returns
  - Context: Validates the requested file signature against a list of accepted file types

- [ ] `src/integrations/index.ts:19` — **VideoTypes** (class)
  - Missing: @category, @example, @since
  - Context: Video files information with their unique signatures

- [ ] `src/integrations/index.ts:175` — **OtherTypes** (class)
  - Missing: @category, @example, @since
  - Context: Other files information with their unique signatures

- [ ] `src/integrations/index.ts:406` — **ImageTypes** (class)
  - Missing: @category, @example, @since
  - Context: Image files information with their unique signatures

- [ ] `src/integrations/index.ts:640` — **CompressedTypes** (class)
  - Missing: @category, @example, @since
  - Context: Compressed files information with their unique signatures

- [ ] `src/integrations/index.ts:789` — **AudioTypes** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:887` — **FILE_TYPES_REQUIRED_ADDITIONAL_CHECK** (const)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:894` — **FileTypes** (class)
  - Missing: @category, @example, @since
  - Context: A class hold all supported file typs with their unique signatures

- [ ] `src/integrations/index.ts:4` — **fileTypeChecker** (const)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:1` — **FileValidatorOptions** (interface)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:8` — **ZipValidatorOptions** (interface)
  - Missing: @category, @example, @since
  - Context: Options used to pass to izZip function.

- [ ] `src/integrations/index.ts:15` — **ValidateFileTypeOptions** (interface)
  - Missing: @category, @example, @since
  - Context: Options used to pass to validate file type function.

- [ ] `src/integrations/index.ts:23` — **DetectFileOptions** (interface)
  - Missing: @category, @example, @since
  - Context: Options used to pass to detect file function.

- [ ] `src/integrations/index.ts:19` — **getFileChunk** (function)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:46` — **fetchFromObject** (function)
  - Missing: @category, @example, @since
  - Has: @param, @param, @returns
  - Context: Fetch a property of a object by its name

- [ ] `src/integrations/index.ts:63` — **findMatroskaDocTypeElements** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Identify whether a valid 'mkv'/'web' file is 'mkv' or 'webm'.

- [ ] `src/integrations/index.ts:88` — **isftypStringIncluded** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if array of numbers contains the "fytp" string.

- [ ] `src/integrations/index.ts:115` — **isFlvStringIncluded** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if array of numbers contains the "FLV" string.

- [ ] `src/integrations/index.ts:121` — **isFileContaineJfiforExifHeader** (function)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:141` — **isAvifStringIncluded** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if array of numbers contains the "ftypavif" string.

- [ ] `src/integrations/index.ts:159` — **isHeicSignatureIncluded** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if a file chunk contains a HEIC file box.

- [ ] `src/integrations/index.ts:153` — **getTypes** (function)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:158` — **getExtensions** (function)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:166` — **lookup** (function)
  - Missing: @category, @example, @since
  - Context: Lookup the MIME type for a file path/extension.

- [ ] `src/integrations/index.ts:30` — **extractMimeExtensions** (const)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:50` — **extractMimeTypes** (const)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:63` — **ApplicationMimeType** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:65` — **ApplicationMimeType** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:70` — **VideoMimeType** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:72` — **VideoMimeType** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:77` — **TextMimeType** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:79` — **TextMimeType** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:84` — **ImageMimeType** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:86` — **ImageMimeType** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:91` — **AudioMimeType** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:93` — **AudioMimeType** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:98` — **MiscMimeType** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:100` — **MiscMimeType** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:118` — **MimeType** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:127` — **MimeType** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:132` — **FileExtension** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:134` — **FileExtension** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:139` — **mimeTypes** (const)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:23` — **PrettyBytesOptions** (interface)
  - Missing: @category, @example, @since

- [ ] `src/integrations/index.ts:100` — **PrettyBytesString** (type)
  - Missing: @category, @example, @since
  - Context: Template literal string type that ensures the unit part is always one of

- [ ] `src/integrations/index.ts:77` — **DateTimeAllEncoded** (const)
  - Missing: @category, @example, @since

- [ ] `src/primitives/index.ts:3` — **CountryCodeValue** (class)
  - Missing: @category, @example, @since

- [ ] `src/primitives/index.ts:251` — **CountryCodeValue** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/primitives/index.ts:11` — **Currency** (const)
  - Missing: @category, @example, @since
  - Has: @standard, @description, @link

- [ ] `src/primitives/index.ts:482` — **Currency** (type)
  - Missing: @category, @example, @since

- [ ] `src/primitives/index.ts:484` — **CurrencyCodeValue** (class)
  - Missing: @category, @example, @since

- [ ] `src/primitives/index.ts:486` — **CurrencyCodeValue** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/primitives/index.ts:3` — **DecodeString** (class)
  - Missing: @category, @example, @since

- [ ] `src/primitives/index.ts:9` — **DecodeString** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/primitives/index.ts:186` — **SignleLiteralWithEncodedDefault** (function)
  - Missing: @category, @example, @since

- [ ] `src/primitives/index.ts:3` — **tlds** (const)
  - Missing: @category, @example, @since

- [ ] `src/primitives/index.ts:1420` — **TLD** (class)
  - Missing: @category, @example, @since

- [ ] `src/primitives/index.ts:1422` — **TLD** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/core/annotations/built-in-annotations.ts:3` — **builtInAnnotations** (const)
  - Missing: @category, @example, @since

- [ ] `src/core/annotations/built-in-annotations.ts:24` — **AllAnnotations** (interface)
  - Missing: @category, @example, @since

- [ ] `src/core/annotations/built-in-annotations.ts:28` — **toASTAnnotations** (const)
  - Missing: @category, @example, @since

- [ ] `src/core/annotations/default.ts:75` — **ScopesAnnotationId** (const)
  - Missing: @category, @example, @since

- [ ] `src/core/annotations/default.ts:77` — **Scopes** (type)
  - Missing: @category, @example, @since

- [ ] `src/core/annotations/index.ts:75` — **ScopesAnnotationId** (const)
  - Missing: @category, @example, @since

- [ ] `src/core/annotations/index.ts:77` — **Scopes** (type)
  - Missing: @category, @example, @since

- [ ] `src/core/generics/index.ts:28` — **DefaultTaggedClass** (const)
  - Missing: @category, @example, @since

- [ ] `src/core/generics/tagged-class.ts:28` — **DefaultTaggedClass** (const)
  - Missing: @category, @example, @since

- [ ] `src/core/utils/index.ts:15` — **WithDefaultsThunk** (const)
  - Missing: @category, @example, @since

- [ ] `src/derived/kits/index.ts:301` — **makeLiteralKit** (function)
  - Missing: @category, @example, @since
  - Context: Implementation of string literal kit factory.

- [ ] `src/derived/kits/index.ts:440` — **StringLiteralKit** (function)
  - Missing: @category, @example, @since

- [ ] `src/derived/kits/index.ts:446` — **StringLiteralKit** (function)
  - Missing: @category, @example, @since

- [ ] `src/derived/kits/string-literal-kit.ts:301` — **makeLiteralKit** (function)
  - Missing: @category, @example, @since
  - Context: Implementation of string literal kit factory.

- [ ] `src/derived/kits/string-literal-kit.ts:440` — **StringLiteralKit** (function)
  - Missing: @category, @example, @since

- [ ] `src/derived/kits/string-literal-kit.ts:446` — **StringLiteralKit** (function)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/AspectRatio.ts:11` — **AspectRatioDimensions** (class)
  - Missing: @category, @example, @since
  - Context: Encoded representation of an aspect ratio

- [ ] `src/integrations/files/AspectRatio.ts:18` — **AspectRatioDimensions** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/AspectRatio.ts:26` — **AspectRatioString** (type)
  - Missing: @category, @example, @since
  - Context: Template literal type for aspect ratio string

- [ ] `src/integrations/files/AspectRatio.ts:31` — **AspectRatioStringSchema** (const)
  - Missing: @category, @example, @since
  - Context: Schema for the decoded aspect ratio string format

- [ ] `src/integrations/files/AspectRatio.ts:78` — **AspectRatio** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/FileAttributes.ts:5` — **FileAttributes** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/FileAttributes.ts:24` — **FileAttributes** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/FileInstance.ts:16` — **FileType** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/FileInstance.ts:18` — **FileType** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/FileInstance.ts:29` — **UploadAnnotation** (type)
  - Missing: @category, @example, @since
  - Context: Upload observability

- [ ] `src/integrations/files/FileInstance.ts:33` — **makeFileAnnotations** (const)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/FileInstance.ts:41` — **ValidationError** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/FileInstance.ts:51` — **DetectionError** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/FileInstance.ts:60` — **FileFromSelf** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/FileInstance.ts:124` — **FileFromSelf** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/FileInstance.ts:129` — **FileInstance** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/FileInstance.ts:168` — **FileInstance** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/FileInstance.ts:173` — **FileInstanceFromNative** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/FileInstance.ts:190` — **FileInstanceFromNative** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/FileSize.ts:9` — **ByteUnit** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/FileSize.ts:17` — **ByteUnit** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/FileSize.ts:27` — **BiByteUnit** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/FileSize.ts:45` — **BiByteUnit** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/FileSize.ts:55` — **BitUnit** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/FileSize.ts:73` — **BitUnit** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/FileSize.ts:83` — **BiBitUnit** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/FileSize.ts:101` — **BiBitUnit** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/FileSize.ts:111` — **SiByteUnit** (type)
  - Missing: @category, @example, @since
  - Context: SI decimal byte unit type alias

- [ ] `src/integrations/files/FileSize.ts:114` — **IecByteUnit** (type)
  - Missing: @category, @example, @since
  - Context: IEC binary byte unit type alias

- [ ] `src/integrations/files/FileSize.ts:117` — **SiBitUnit** (type)
  - Missing: @category, @example, @since
  - Context: SI decimal bit unit type alias

- [ ] `src/integrations/files/FileSize.ts:120` — **IecBitUnit** (type)
  - Missing: @category, @example, @since
  - Context: IEC binary bit unit type alias

- [ ] `src/integrations/files/index.ts:11` — **AspectRatioDimensions** (class)
  - Missing: @category, @example, @since
  - Context: Encoded representation of an aspect ratio

- [ ] `src/integrations/files/index.ts:18` — **AspectRatioDimensions** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:26` — **AspectRatioString** (type)
  - Missing: @category, @example, @since
  - Context: Template literal type for aspect ratio string

- [ ] `src/integrations/files/index.ts:31` — **AspectRatioStringSchema** (const)
  - Missing: @category, @example, @since
  - Context: Schema for the decoded aspect ratio string format

- [ ] `src/integrations/files/index.ts:78` — **AspectRatio** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:130` — **omitKnownLargeFields** (const)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Clean specific known large fields from EXIF data using Effect's EffStruct.omit

- [ ] `src/integrations/files/index.ts:174` — **ExifMetadata** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:317` — **IXmpTag** (interface)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:509` — **ExifTags** (const)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:752` — **ExpandedTags** (const)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:792` — **ExpandedTags** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:797` — **Tags** (const)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:5` — **FileAttributes** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:24` — **FileAttributes** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:16` — **FileType** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:18` — **FileType** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:29` — **UploadAnnotation** (type)
  - Missing: @category, @example, @since
  - Context: Upload observability

- [ ] `src/integrations/files/index.ts:33` — **makeFileAnnotations** (const)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:41` — **ValidationError** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:51` — **DetectionError** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:60` — **FileFromSelf** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:124` — **FileFromSelf** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:129` — **FileInstance** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:168` — **FileInstance** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:173` — **FileInstanceFromNative** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:190` — **FileInstanceFromNative** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:9` — **ByteUnit** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:17` — **ByteUnit** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:27` — **BiByteUnit** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:45` — **BiByteUnit** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:55` — **BitUnit** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:73` — **BitUnit** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:83` — **BiBitUnit** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:101` — **BiBitUnit** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:111` — **SiByteUnit** (type)
  - Missing: @category, @example, @since
  - Context: SI decimal byte unit type alias

- [ ] `src/integrations/files/index.ts:114` — **IecByteUnit** (type)
  - Missing: @category, @example, @since
  - Context: IEC binary byte unit type alias

- [ ] `src/integrations/files/index.ts:117` — **SiBitUnit** (type)
  - Missing: @category, @example, @since
  - Context: SI decimal bit unit type alias

- [ ] `src/integrations/files/index.ts:120` — **IecBitUnit** (type)
  - Missing: @category, @example, @since
  - Context: IEC binary bit unit type alias

- [ ] `src/integrations/files/index.ts:4` — **FileInfo** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:19` — **FileInfo** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:24` — **DetectedFileInfo** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:39` — **DetectedFileInfo** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:2` — **FileSignature** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:18` — **FileSignature** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:1108` — **isAAC** (function)
  - Missing: @category, @example, @since
  - Has: @param, @param, @returns
  - Context: Determine if file content contains a valid 'aac' file signature

- [ ] `src/integrations/files/index.ts:1130` — **isAMR** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'amr' file signature

- [ ] `src/integrations/files/index.ts:1142` — **isFLAC** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'flac' file signature

- [ ] `src/integrations/files/index.ts:1154` — **isM4A** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'm4a' file signature

- [ ] `src/integrations/files/index.ts:1166` — **isMP3** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'mp3' file signature

- [ ] `src/integrations/files/index.ts:1178` — **isWAV** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'wav' file signature

- [ ] `src/integrations/files/index.ts:1190` — **is7Z** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid '7z' file signature

- [ ] `src/integrations/files/index.ts:1202` — **isLZH** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'lzh' file signature

- [ ] `src/integrations/files/index.ts:1214` — **isRAR** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'rar' file signature

- [ ] `src/integrations/files/index.ts:1227` — **isZIP** (function)
  - Missing: @category, @example, @since
  - Has: @param, @param, @returns
  - Context: Determine if file content contains a valid 'zip' file signature

- [ ] `src/integrations/files/index.ts:1242` — **isAVIF** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'avif' file signature

- [ ] `src/integrations/files/index.ts:1258` — **isBMP** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'bmp' file signature

- [ ] `src/integrations/files/index.ts:1270` — **isBPG** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'bpg' file signature

- [ ] `src/integrations/files/index.ts:1282` — **isCR2** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'cr2' file signature

- [ ] `src/integrations/files/index.ts:1294` — **isEXR** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'exr' file signature

- [ ] `src/integrations/files/index.ts:1306` — **isGIF** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'gif' file signature

- [ ] `src/integrations/files/index.ts:1318` — **isHEIC** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'heic' file signature

- [ ] `src/integrations/files/index.ts:1334` — **isICO** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'ico' file signature

- [ ] `src/integrations/files/index.ts:1346` — **isJPEG** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'jpeg' file signature

- [ ] `src/integrations/files/index.ts:1358` — **isPBM** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'pbm' file signature

- [ ] `src/integrations/files/index.ts:1370` — **isPGM** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'pgm' file signature

- [ ] `src/integrations/files/index.ts:1382` — **isPNG** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'png' file signature

- [ ] `src/integrations/files/index.ts:1394` — **isPPM** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'ppm' file signature

- [ ] `src/integrations/files/index.ts:1406` — **isPSD** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'psd' file signature

- [ ] `src/integrations/files/index.ts:1418` — **isWEBP** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'webp' file signature

- [ ] `src/integrations/files/index.ts:1430` — **isBLEND** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'blend' file signature

- [ ] `src/integrations/files/index.ts:1442` — **isELF** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'elf' file signature

- [ ] `src/integrations/files/index.ts:1454` — **isEXE** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'exe' file signature

- [ ] `src/integrations/files/index.ts:1466` — **isMACHO** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'mach-o' file signature

- [ ] `src/integrations/files/index.ts:1478` — **isINDD** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'indd' file signature

- [ ] `src/integrations/files/index.ts:1490` — **isORC** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'orc' file signature

- [ ] `src/integrations/files/index.ts:1502` — **isPARQUET** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'parquet' file signature

- [ ] `src/integrations/files/index.ts:1514` — **isPDF** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'pdf' file signature

- [ ] `src/integrations/files/index.ts:1526` — **isPS** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'ps' file signature

- [ ] `src/integrations/files/index.ts:1538` — **isRTF** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'rtf' file signature

- [ ] `src/integrations/files/index.ts:1550` — **isSQLITE** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'sqlite' file signature

- [ ] `src/integrations/files/index.ts:1562` — **isSTL** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'stl' file signature

- [ ] `src/integrations/files/index.ts:1574` — **isTTF** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'ttf' file signature

- [ ] `src/integrations/files/index.ts:1586` — **isDOC** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'doc' file signature

- [ ] `src/integrations/files/index.ts:1598` — **isPCAP** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'pcap' file signature

- [ ] `src/integrations/files/index.ts:1610` — **isAVI** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'avi' file signature

- [ ] `src/integrations/files/index.ts:1623` — **isFLV** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'flv' file signature.

- [ ] `src/integrations/files/index.ts:1640` — **isM4V** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'm4v' file signature.

- [ ] `src/integrations/files/index.ts:1657` — **isMKV** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'mkv' file signature.

- [ ] `src/integrations/files/index.ts:1673` — **isMOV** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'mov' file signature

- [ ] `src/integrations/files/index.ts:1686` — **isMP4** (function)
  - Missing: @category, @example, @since
  - Has: @param, @param, @returns
  - Context: Determine if file content contains a valid 'mp4' file signature.

- [ ] `src/integrations/files/index.ts:1708` — **isOGG** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'ogg' file signature

- [ ] `src/integrations/files/index.ts:1720` — **isSWF** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'swf' file signature

- [ ] `src/integrations/files/index.ts:1733` — **isWEBM** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'webm' file signature.

- [ ] `src/integrations/files/index.ts:1751` — **validateFileType** (function)
  - Missing: @category, @example, @since
  - Has: @param, @param, @param, @returns
  - Context: Validates the requested file signature against a list of accepted file types

- [ ] `src/integrations/files/index.ts:19` — **VideoTypes** (class)
  - Missing: @category, @example, @since
  - Context: Video files information with their unique signatures

- [ ] `src/integrations/files/index.ts:175` — **OtherTypes** (class)
  - Missing: @category, @example, @since
  - Context: Other files information with their unique signatures

- [ ] `src/integrations/files/index.ts:406` — **ImageTypes** (class)
  - Missing: @category, @example, @since
  - Context: Image files information with their unique signatures

- [ ] `src/integrations/files/index.ts:640` — **CompressedTypes** (class)
  - Missing: @category, @example, @since
  - Context: Compressed files information with their unique signatures

- [ ] `src/integrations/files/index.ts:789` — **AudioTypes** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:887` — **FILE_TYPES_REQUIRED_ADDITIONAL_CHECK** (const)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:894` — **FileTypes** (class)
  - Missing: @category, @example, @since
  - Context: A class hold all supported file typs with their unique signatures

- [ ] `src/integrations/files/index.ts:4` — **fileTypeChecker** (const)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:1` — **FileValidatorOptions** (interface)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:8` — **ZipValidatorOptions** (interface)
  - Missing: @category, @example, @since
  - Context: Options used to pass to izZip function.

- [ ] `src/integrations/files/index.ts:15` — **ValidateFileTypeOptions** (interface)
  - Missing: @category, @example, @since
  - Context: Options used to pass to validate file type function.

- [ ] `src/integrations/files/index.ts:23` — **DetectFileOptions** (interface)
  - Missing: @category, @example, @since
  - Context: Options used to pass to detect file function.

- [ ] `src/integrations/files/index.ts:19` — **getFileChunk** (function)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:46` — **fetchFromObject** (function)
  - Missing: @category, @example, @since
  - Has: @param, @param, @returns
  - Context: Fetch a property of a object by its name

- [ ] `src/integrations/files/index.ts:63` — **findMatroskaDocTypeElements** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Identify whether a valid 'mkv'/'web' file is 'mkv' or 'webm'.

- [ ] `src/integrations/files/index.ts:88` — **isftypStringIncluded** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if array of numbers contains the "fytp" string.

- [ ] `src/integrations/files/index.ts:115` — **isFlvStringIncluded** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if array of numbers contains the "FLV" string.

- [ ] `src/integrations/files/index.ts:121` — **isFileContaineJfiforExifHeader** (function)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:141` — **isAvifStringIncluded** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if array of numbers contains the "ftypavif" string.

- [ ] `src/integrations/files/index.ts:159` — **isHeicSignatureIncluded** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if a file chunk contains a HEIC file box.

- [ ] `src/integrations/files/index.ts:153` — **getTypes** (function)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:158` — **getExtensions** (function)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:166` — **lookup** (function)
  - Missing: @category, @example, @since
  - Context: Lookup the MIME type for a file path/extension.

- [ ] `src/integrations/files/index.ts:30` — **extractMimeExtensions** (const)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:50` — **extractMimeTypes** (const)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:63` — **ApplicationMimeType** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:65` — **ApplicationMimeType** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:70` — **VideoMimeType** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:72` — **VideoMimeType** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:77` — **TextMimeType** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:79` — **TextMimeType** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:84` — **ImageMimeType** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:86` — **ImageMimeType** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:91` — **AudioMimeType** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:93` — **AudioMimeType** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:98` — **MiscMimeType** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:100` — **MiscMimeType** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:118` — **MimeType** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:127` — **MimeType** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:132` — **FileExtension** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:134` — **FileExtension** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:139` — **mimeTypes** (const)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:23` — **PrettyBytesOptions** (interface)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/index.ts:100` — **PrettyBytesString** (type)
  - Missing: @category, @example, @since
  - Context: Template literal string type that ensures the unit part is always one of

- [ ] `src/integrations/sql/common.ts:77` — **DateTimeAllEncoded** (const)
  - Missing: @category, @example, @since

- [ ] `src/integrations/sql/index.ts:77` — **DateTimeAllEncoded** (const)
  - Missing: @category, @example, @since

- [ ] `src/primitives/currency/Currencies.ts:7` — **currencies** (const)
  - Missing: @category, @example, @since

- [ ] `src/primitives/currency/Currencies.ts:3548` — **Currency** (class)
  - Missing: @category, @example, @since

- [ ] `src/primitives/currency/Currencies.ts:3563` — **Currency** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/primitives/geo/country-code-value.ts:3` — **CountryCodeValue** (class)
  - Missing: @category, @example, @since

- [ ] `src/primitives/geo/country-code-value.ts:251` — **CountryCodeValue** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/primitives/geo/index.ts:3` — **CountryCodeValue** (class)
  - Missing: @category, @example, @since

- [ ] `src/primitives/geo/index.ts:251` — **CountryCodeValue** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/primitives/locales/currency-code-value.ts:11` — **Currency** (const)
  - Missing: @category, @example, @since
  - Has: @standard, @description, @link

- [ ] `src/primitives/locales/currency-code-value.ts:482` — **Currency** (type)
  - Missing: @category, @example, @since

- [ ] `src/primitives/locales/currency-code-value.ts:484` — **CurrencyCodeValue** (class)
  - Missing: @category, @example, @since

- [ ] `src/primitives/locales/currency-code-value.ts:486` — **CurrencyCodeValue** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/primitives/locales/index.ts:11` — **Currency** (const)
  - Missing: @category, @example, @since
  - Has: @standard, @description, @link

- [ ] `src/primitives/locales/index.ts:482` — **Currency** (type)
  - Missing: @category, @example, @since

- [ ] `src/primitives/locales/index.ts:484` — **CurrencyCodeValue** (class)
  - Missing: @category, @example, @since

- [ ] `src/primitives/locales/index.ts:486` — **CurrencyCodeValue** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/primitives/number/formatted-number.ts:8` — **BigIntToSiSymbol** (class)
  - Missing: @category, @example, @since

- [ ] `src/primitives/number/formatted-number.ts:18` — **BigIntToSiSymbol** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/primitives/number/formatted-number.ts:47` — **FormattedNumber** (interface)
  - Missing: @category, @example, @since
  - Context: Represents a formatted number with SI symbol.

- [ ] `src/primitives/number/formatted-number.ts:195` — **FormatNumber** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/primitives/number/formatted-number.ts:200` — **FormatNumberFromString** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/primitives/string/decode-string.ts:3` — **DecodeString** (class)
  - Missing: @category, @example, @since

- [ ] `src/primitives/string/decode-string.ts:9` — **DecodeString** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/primitives/string/index.ts:3` — **DecodeString** (class)
  - Missing: @category, @example, @since

- [ ] `src/primitives/string/index.ts:9` — **DecodeString** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/primitives/string/index.ts:186` — **SignleLiteralWithEncodedDefault** (function)
  - Missing: @category, @example, @since

- [ ] `src/primitives/string/literal.ts:186` — **SignleLiteralWithEncodedDefault** (function)
  - Missing: @category, @example, @since

- [ ] `src/primitives/url/index.ts:3` — **tlds** (const)
  - Missing: @category, @example, @since

- [ ] `src/primitives/url/index.ts:1420` — **TLD** (class)
  - Missing: @category, @example, @since

- [ ] `src/primitives/url/index.ts:1422` — **TLD** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/primitives/url/tld.ts:3` — **tlds** (const)
  - Missing: @category, @example, @since

- [ ] `src/primitives/url/tld.ts:1420` — **TLD** (class)
  - Missing: @category, @example, @since

- [ ] `src/primitives/url/tld.ts:1422` — **TLD** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/core/utils/with-defaults-thunk/index.ts:15` — **WithDefaultsThunk** (const)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/exif-metadata/errors.ts:3` — **ExifParseError** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/exif-metadata/ExifMetadata.ts:130` — **omitKnownLargeFields** (const)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Clean specific known large fields from EXIF data using Effect's EffStruct.omit

- [ ] `src/integrations/files/exif-metadata/ExifMetadata.ts:174` — **ExifMetadata** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/exif-metadata/ExifTags.ts:317` — **IXmpTag** (interface)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/exif-metadata/ExifTags.ts:509` — **ExifTags** (const)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/exif-metadata/ExifTags.ts:752` — **ExpandedTags** (const)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/exif-metadata/ExifTags.ts:792` — **ExpandedTags** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/exif-metadata/ExifTags.ts:797` — **Tags** (const)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/exif-metadata/index.ts:130` — **omitKnownLargeFields** (const)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Clean specific known large fields from EXIF data using Effect's EffStruct.omit

- [ ] `src/integrations/files/exif-metadata/index.ts:174` — **ExifMetadata** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/exif-metadata/index.ts:317` — **IXmpTag** (interface)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/exif-metadata/index.ts:509` — **ExifTags** (const)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/exif-metadata/index.ts:752` — **ExpandedTags** (const)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/exif-metadata/index.ts:792` — **ExpandedTags** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/exif-metadata/index.ts:797` — **Tags** (const)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/file-types/detection.ts:15` — **detectFile** (function)
  - Missing: @category, @example, @since
  - Has: @param, @param, @returns
  - Context: Detect a file by searching for a valid file signature inside the file content

- [ ] `src/integrations/files/file-types/FileInfo.ts:4` — **FileInfo** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/file-types/FileInfo.ts:19` — **FileInfo** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/file-types/FileInfo.ts:24` — **DetectedFileInfo** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/file-types/FileInfo.ts:39` — **DetectedFileInfo** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/file-types/FileSignature.ts:2` — **FileSignature** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/file-types/FileSignature.ts:18` — **FileSignature** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/file-types/FileTypes.ts:1108` — **isAAC** (function)
  - Missing: @category, @example, @since
  - Has: @param, @param, @returns
  - Context: Determine if file content contains a valid 'aac' file signature

- [ ] `src/integrations/files/file-types/FileTypes.ts:1130` — **isAMR** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'amr' file signature

- [ ] `src/integrations/files/file-types/FileTypes.ts:1142` — **isFLAC** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'flac' file signature

- [ ] `src/integrations/files/file-types/FileTypes.ts:1154` — **isM4A** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'm4a' file signature

- [ ] `src/integrations/files/file-types/FileTypes.ts:1166` — **isMP3** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'mp3' file signature

- [ ] `src/integrations/files/file-types/FileTypes.ts:1178` — **isWAV** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'wav' file signature

- [ ] `src/integrations/files/file-types/FileTypes.ts:1190` — **is7Z** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid '7z' file signature

- [ ] `src/integrations/files/file-types/FileTypes.ts:1202` — **isLZH** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'lzh' file signature

- [ ] `src/integrations/files/file-types/FileTypes.ts:1214` — **isRAR** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'rar' file signature

- [ ] `src/integrations/files/file-types/FileTypes.ts:1227` — **isZIP** (function)
  - Missing: @category, @example, @since
  - Has: @param, @param, @returns
  - Context: Determine if file content contains a valid 'zip' file signature

- [ ] `src/integrations/files/file-types/FileTypes.ts:1242` — **isAVIF** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'avif' file signature

- [ ] `src/integrations/files/file-types/FileTypes.ts:1258` — **isBMP** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'bmp' file signature

- [ ] `src/integrations/files/file-types/FileTypes.ts:1270` — **isBPG** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'bpg' file signature

- [ ] `src/integrations/files/file-types/FileTypes.ts:1282` — **isCR2** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'cr2' file signature

- [ ] `src/integrations/files/file-types/FileTypes.ts:1294` — **isEXR** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'exr' file signature

- [ ] `src/integrations/files/file-types/FileTypes.ts:1306` — **isGIF** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'gif' file signature

- [ ] `src/integrations/files/file-types/FileTypes.ts:1318` — **isHEIC** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'heic' file signature

- [ ] `src/integrations/files/file-types/FileTypes.ts:1334` — **isICO** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'ico' file signature

- [ ] `src/integrations/files/file-types/FileTypes.ts:1346` — **isJPEG** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'jpeg' file signature

- [ ] `src/integrations/files/file-types/FileTypes.ts:1358` — **isPBM** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'pbm' file signature

- [ ] `src/integrations/files/file-types/FileTypes.ts:1370` — **isPGM** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'pgm' file signature

- [ ] `src/integrations/files/file-types/FileTypes.ts:1382` — **isPNG** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'png' file signature

- [ ] `src/integrations/files/file-types/FileTypes.ts:1394` — **isPPM** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'ppm' file signature

- [ ] `src/integrations/files/file-types/FileTypes.ts:1406` — **isPSD** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'psd' file signature

- [ ] `src/integrations/files/file-types/FileTypes.ts:1418` — **isWEBP** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'webp' file signature

- [ ] `src/integrations/files/file-types/FileTypes.ts:1430` — **isBLEND** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'blend' file signature

- [ ] `src/integrations/files/file-types/FileTypes.ts:1442` — **isELF** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'elf' file signature

- [ ] `src/integrations/files/file-types/FileTypes.ts:1454` — **isEXE** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'exe' file signature

- [ ] `src/integrations/files/file-types/FileTypes.ts:1466` — **isMACHO** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'mach-o' file signature

- [ ] `src/integrations/files/file-types/FileTypes.ts:1478` — **isINDD** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'indd' file signature

- [ ] `src/integrations/files/file-types/FileTypes.ts:1490` — **isORC** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'orc' file signature

- [ ] `src/integrations/files/file-types/FileTypes.ts:1502` — **isPARQUET** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'parquet' file signature

- [ ] `src/integrations/files/file-types/FileTypes.ts:1514` — **isPDF** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'pdf' file signature

- [ ] `src/integrations/files/file-types/FileTypes.ts:1526` — **isPS** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'ps' file signature

- [ ] `src/integrations/files/file-types/FileTypes.ts:1538` — **isRTF** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'rtf' file signature

- [ ] `src/integrations/files/file-types/FileTypes.ts:1550` — **isSQLITE** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'sqlite' file signature

- [ ] `src/integrations/files/file-types/FileTypes.ts:1562` — **isSTL** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'stl' file signature

- [ ] `src/integrations/files/file-types/FileTypes.ts:1574` — **isTTF** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'ttf' file signature

- [ ] `src/integrations/files/file-types/FileTypes.ts:1586` — **isDOC** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'doc' file signature

- [ ] `src/integrations/files/file-types/FileTypes.ts:1598` — **isPCAP** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'pcap' file signature

- [ ] `src/integrations/files/file-types/FileTypes.ts:1610` — **isAVI** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'avi' file signature

- [ ] `src/integrations/files/file-types/FileTypes.ts:1623` — **isFLV** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'flv' file signature.

- [ ] `src/integrations/files/file-types/FileTypes.ts:1640` — **isM4V** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'm4v' file signature.

- [ ] `src/integrations/files/file-types/FileTypes.ts:1657` — **isMKV** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'mkv' file signature.

- [ ] `src/integrations/files/file-types/FileTypes.ts:1673` — **isMOV** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'mov' file signature

- [ ] `src/integrations/files/file-types/FileTypes.ts:1686` — **isMP4** (function)
  - Missing: @category, @example, @since
  - Has: @param, @param, @returns
  - Context: Determine if file content contains a valid 'mp4' file signature.

- [ ] `src/integrations/files/file-types/FileTypes.ts:1708` — **isOGG** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'ogg' file signature

- [ ] `src/integrations/files/file-types/FileTypes.ts:1720` — **isSWF** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'swf' file signature

- [ ] `src/integrations/files/file-types/FileTypes.ts:1733` — **isWEBM** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'webm' file signature.

- [ ] `src/integrations/files/file-types/FileTypes.ts:1751` — **validateFileType** (function)
  - Missing: @category, @example, @since
  - Has: @param, @param, @param, @returns
  - Context: Validates the requested file signature against a list of accepted file types

- [ ] `src/integrations/files/file-types/FileTypes.ts:19` — **VideoTypes** (class)
  - Missing: @category, @example, @since
  - Context: Video files information with their unique signatures

- [ ] `src/integrations/files/file-types/FileTypes.ts:175` — **OtherTypes** (class)
  - Missing: @category, @example, @since
  - Context: Other files information with their unique signatures

- [ ] `src/integrations/files/file-types/FileTypes.ts:406` — **ImageTypes** (class)
  - Missing: @category, @example, @since
  - Context: Image files information with their unique signatures

- [ ] `src/integrations/files/file-types/FileTypes.ts:640` — **CompressedTypes** (class)
  - Missing: @category, @example, @since
  - Context: Compressed files information with their unique signatures

- [ ] `src/integrations/files/file-types/FileTypes.ts:789` — **AudioTypes** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/file-types/FileTypes.ts:887` — **FILE_TYPES_REQUIRED_ADDITIONAL_CHECK** (const)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/file-types/FileTypes.ts:894` — **FileTypes** (class)
  - Missing: @category, @example, @since
  - Context: A class hold all supported file typs with their unique signatures

- [ ] `src/integrations/files/file-types/index.ts:4` — **FileInfo** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/file-types/index.ts:19` — **FileInfo** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/file-types/index.ts:24` — **DetectedFileInfo** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/file-types/index.ts:39` — **DetectedFileInfo** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/file-types/index.ts:2` — **FileSignature** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/file-types/index.ts:18` — **FileSignature** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/file-types/index.ts:1108` — **isAAC** (function)
  - Missing: @category, @example, @since
  - Has: @param, @param, @returns
  - Context: Determine if file content contains a valid 'aac' file signature

- [ ] `src/integrations/files/file-types/index.ts:1130` — **isAMR** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'amr' file signature

- [ ] `src/integrations/files/file-types/index.ts:1142` — **isFLAC** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'flac' file signature

- [ ] `src/integrations/files/file-types/index.ts:1154` — **isM4A** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'm4a' file signature

- [ ] `src/integrations/files/file-types/index.ts:1166` — **isMP3** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'mp3' file signature

- [ ] `src/integrations/files/file-types/index.ts:1178` — **isWAV** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'wav' file signature

- [ ] `src/integrations/files/file-types/index.ts:1190` — **is7Z** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid '7z' file signature

- [ ] `src/integrations/files/file-types/index.ts:1202` — **isLZH** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'lzh' file signature

- [ ] `src/integrations/files/file-types/index.ts:1214` — **isRAR** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'rar' file signature

- [ ] `src/integrations/files/file-types/index.ts:1227` — **isZIP** (function)
  - Missing: @category, @example, @since
  - Has: @param, @param, @returns
  - Context: Determine if file content contains a valid 'zip' file signature

- [ ] `src/integrations/files/file-types/index.ts:1242` — **isAVIF** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'avif' file signature

- [ ] `src/integrations/files/file-types/index.ts:1258` — **isBMP** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'bmp' file signature

- [ ] `src/integrations/files/file-types/index.ts:1270` — **isBPG** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'bpg' file signature

- [ ] `src/integrations/files/file-types/index.ts:1282` — **isCR2** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'cr2' file signature

- [ ] `src/integrations/files/file-types/index.ts:1294` — **isEXR** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'exr' file signature

- [ ] `src/integrations/files/file-types/index.ts:1306` — **isGIF** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'gif' file signature

- [ ] `src/integrations/files/file-types/index.ts:1318` — **isHEIC** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'heic' file signature

- [ ] `src/integrations/files/file-types/index.ts:1334` — **isICO** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'ico' file signature

- [ ] `src/integrations/files/file-types/index.ts:1346` — **isJPEG** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'jpeg' file signature

- [ ] `src/integrations/files/file-types/index.ts:1358` — **isPBM** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'pbm' file signature

- [ ] `src/integrations/files/file-types/index.ts:1370` — **isPGM** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'pgm' file signature

- [ ] `src/integrations/files/file-types/index.ts:1382` — **isPNG** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'png' file signature

- [ ] `src/integrations/files/file-types/index.ts:1394` — **isPPM** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'ppm' file signature

- [ ] `src/integrations/files/file-types/index.ts:1406` — **isPSD** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'psd' file signature

- [ ] `src/integrations/files/file-types/index.ts:1418` — **isWEBP** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'webp' file signature

- [ ] `src/integrations/files/file-types/index.ts:1430` — **isBLEND** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'blend' file signature

- [ ] `src/integrations/files/file-types/index.ts:1442` — **isELF** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'elf' file signature

- [ ] `src/integrations/files/file-types/index.ts:1454` — **isEXE** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'exe' file signature

- [ ] `src/integrations/files/file-types/index.ts:1466` — **isMACHO** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'mach-o' file signature

- [ ] `src/integrations/files/file-types/index.ts:1478` — **isINDD** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'indd' file signature

- [ ] `src/integrations/files/file-types/index.ts:1490` — **isORC** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'orc' file signature

- [ ] `src/integrations/files/file-types/index.ts:1502` — **isPARQUET** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'parquet' file signature

- [ ] `src/integrations/files/file-types/index.ts:1514` — **isPDF** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'pdf' file signature

- [ ] `src/integrations/files/file-types/index.ts:1526` — **isPS** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'ps' file signature

- [ ] `src/integrations/files/file-types/index.ts:1538` — **isRTF** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'rtf' file signature

- [ ] `src/integrations/files/file-types/index.ts:1550` — **isSQLITE** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'sqlite' file signature

- [ ] `src/integrations/files/file-types/index.ts:1562` — **isSTL** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'stl' file signature

- [ ] `src/integrations/files/file-types/index.ts:1574` — **isTTF** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'ttf' file signature

- [ ] `src/integrations/files/file-types/index.ts:1586` — **isDOC** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'doc' file signature

- [ ] `src/integrations/files/file-types/index.ts:1598` — **isPCAP** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'pcap' file signature

- [ ] `src/integrations/files/file-types/index.ts:1610` — **isAVI** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'avi' file signature

- [ ] `src/integrations/files/file-types/index.ts:1623` — **isFLV** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'flv' file signature.

- [ ] `src/integrations/files/file-types/index.ts:1640` — **isM4V** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'm4v' file signature.

- [ ] `src/integrations/files/file-types/index.ts:1657` — **isMKV** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'mkv' file signature.

- [ ] `src/integrations/files/file-types/index.ts:1673` — **isMOV** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'mov' file signature

- [ ] `src/integrations/files/file-types/index.ts:1686` — **isMP4** (function)
  - Missing: @category, @example, @since
  - Has: @param, @param, @returns
  - Context: Determine if file content contains a valid 'mp4' file signature.

- [ ] `src/integrations/files/file-types/index.ts:1708` — **isOGG** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'ogg' file signature

- [ ] `src/integrations/files/file-types/index.ts:1720` — **isSWF** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'swf' file signature

- [ ] `src/integrations/files/file-types/index.ts:1733` — **isWEBM** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if file content contains a valid 'webm' file signature.

- [ ] `src/integrations/files/file-types/index.ts:1751` — **validateFileType** (function)
  - Missing: @category, @example, @since
  - Has: @param, @param, @param, @returns
  - Context: Validates the requested file signature against a list of accepted file types

- [ ] `src/integrations/files/file-types/index.ts:19` — **VideoTypes** (class)
  - Missing: @category, @example, @since
  - Context: Video files information with their unique signatures

- [ ] `src/integrations/files/file-types/index.ts:175` — **OtherTypes** (class)
  - Missing: @category, @example, @since
  - Context: Other files information with their unique signatures

- [ ] `src/integrations/files/file-types/index.ts:406` — **ImageTypes** (class)
  - Missing: @category, @example, @since
  - Context: Image files information with their unique signatures

- [ ] `src/integrations/files/file-types/index.ts:640` — **CompressedTypes** (class)
  - Missing: @category, @example, @since
  - Context: Compressed files information with their unique signatures

- [ ] `src/integrations/files/file-types/index.ts:789` — **AudioTypes** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/file-types/index.ts:887` — **FILE_TYPES_REQUIRED_ADDITIONAL_CHECK** (const)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/file-types/index.ts:894` — **FileTypes** (class)
  - Missing: @category, @example, @since
  - Context: A class hold all supported file typs with their unique signatures

- [ ] `src/integrations/files/file-types/index.ts:4` — **fileTypeChecker** (const)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/file-types/index.ts:1` — **FileValidatorOptions** (interface)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/file-types/index.ts:8` — **ZipValidatorOptions** (interface)
  - Missing: @category, @example, @since
  - Context: Options used to pass to izZip function.

- [ ] `src/integrations/files/file-types/index.ts:15` — **ValidateFileTypeOptions** (interface)
  - Missing: @category, @example, @since
  - Context: Options used to pass to validate file type function.

- [ ] `src/integrations/files/file-types/index.ts:23` — **DetectFileOptions** (interface)
  - Missing: @category, @example, @since
  - Context: Options used to pass to detect file function.

- [ ] `src/integrations/files/file-types/index.ts:19` — **getFileChunk** (function)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/file-types/index.ts:46` — **fetchFromObject** (function)
  - Missing: @category, @example, @since
  - Has: @param, @param, @returns
  - Context: Fetch a property of a object by its name

- [ ] `src/integrations/files/file-types/index.ts:63` — **findMatroskaDocTypeElements** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Identify whether a valid 'mkv'/'web' file is 'mkv' or 'webm'.

- [ ] `src/integrations/files/file-types/index.ts:88` — **isftypStringIncluded** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if array of numbers contains the "fytp" string.

- [ ] `src/integrations/files/file-types/index.ts:115` — **isFlvStringIncluded** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if array of numbers contains the "FLV" string.

- [ ] `src/integrations/files/file-types/index.ts:121` — **isFileContaineJfiforExifHeader** (function)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/file-types/index.ts:141` — **isAvifStringIncluded** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if array of numbers contains the "ftypavif" string.

- [ ] `src/integrations/files/file-types/index.ts:159` — **isHeicSignatureIncluded** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if a file chunk contains a HEIC file box.

- [ ] `src/integrations/files/file-types/typeChecker.ts:4` — **fileTypeChecker** (const)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/file-types/types.ts:1` — **FileValidatorOptions** (interface)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/file-types/types.ts:8` — **ZipValidatorOptions** (interface)
  - Missing: @category, @example, @since
  - Context: Options used to pass to izZip function.

- [ ] `src/integrations/files/file-types/types.ts:15` — **ValidateFileTypeOptions** (interface)
  - Missing: @category, @example, @since
  - Context: Options used to pass to validate file type function.

- [ ] `src/integrations/files/file-types/types.ts:23` — **DetectFileOptions** (interface)
  - Missing: @category, @example, @since
  - Context: Options used to pass to detect file function.

- [ ] `src/integrations/files/file-types/utils.ts:19` — **getFileChunk** (function)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/file-types/utils.ts:46` — **fetchFromObject** (function)
  - Missing: @category, @example, @since
  - Has: @param, @param, @returns
  - Context: Fetch a property of a object by its name

- [ ] `src/integrations/files/file-types/utils.ts:63` — **findMatroskaDocTypeElements** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Identify whether a valid 'mkv'/'web' file is 'mkv' or 'webm'.

- [ ] `src/integrations/files/file-types/utils.ts:88` — **isftypStringIncluded** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if array of numbers contains the "fytp" string.

- [ ] `src/integrations/files/file-types/utils.ts:115` — **isFlvStringIncluded** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if array of numbers contains the "FLV" string.

- [ ] `src/integrations/files/file-types/utils.ts:121` — **isFileContaineJfiforExifHeader** (function)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/file-types/utils.ts:141` — **isAvifStringIncluded** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if array of numbers contains the "ftypavif" string.

- [ ] `src/integrations/files/file-types/utils.ts:159` — **isHeicSignatureIncluded** (function)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Determine if a file chunk contains a HEIC file box.

- [ ] `src/integrations/files/mime-types/application.ts:1` — **application** (const)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/mime-types/audio.ts:1` — **audio** (const)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/mime-types/image.ts:1` — **image** (const)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/mime-types/index.ts:153` — **getTypes** (function)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/mime-types/index.ts:158` — **getExtensions** (function)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/mime-types/index.ts:166` — **lookup** (function)
  - Missing: @category, @example, @since
  - Context: Lookup the MIME type for a file path/extension.

- [ ] `src/integrations/files/mime-types/index.ts:30` — **extractMimeExtensions** (const)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/mime-types/index.ts:50` — **extractMimeTypes** (const)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/mime-types/index.ts:63` — **ApplicationMimeType** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/mime-types/index.ts:65` — **ApplicationMimeType** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/mime-types/index.ts:70` — **VideoMimeType** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/mime-types/index.ts:72` — **VideoMimeType** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/mime-types/index.ts:77` — **TextMimeType** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/mime-types/index.ts:79` — **TextMimeType** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/mime-types/index.ts:84` — **ImageMimeType** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/mime-types/index.ts:86` — **ImageMimeType** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/mime-types/index.ts:91` — **AudioMimeType** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/mime-types/index.ts:93` — **AudioMimeType** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/mime-types/index.ts:98` — **MiscMimeType** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/mime-types/index.ts:100` — **MiscMimeType** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/mime-types/index.ts:118` — **MimeType** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/mime-types/index.ts:127` — **MimeType** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/mime-types/index.ts:132` — **FileExtension** (class)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/mime-types/index.ts:134` — **FileExtension** (namespace)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/mime-types/index.ts:139` — **mimeTypes** (const)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/mime-types/misc.ts:4` — **misc** (const)
  - Missing: @category, @example, @since
  - Context: Random types not worthy of their own file

- [ ] `src/integrations/files/mime-types/text.ts:1` — **text** (const)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/mime-types/video.ts:1` — **video** (const)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/utils/bytes-to-size.ts:1` — **default** (function)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/utils/compress-file-name.ts:5` — **default** (function)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/utils/formatSize.ts:23` — **PrettyBytesOptions** (interface)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/utils/formatSize.ts:100` — **PrettyBytesString** (type)
  - Missing: @category, @example, @since
  - Context: Template literal string type that ensures the unit part is always one of

- [ ] `src/integrations/files/utils/index.ts:23` — **PrettyBytesOptions** (interface)
  - Missing: @category, @example, @since

- [ ] `src/integrations/files/utils/index.ts:100` — **PrettyBytesString** (type)
  - Missing: @category, @example, @since
  - Context: Template literal string type that ensures the unit part is always one of

- [ ] `src/primitives/fn/no-input-void-fn/index.ts:19` — **NoInputVoidFn** (const)
  - Missing: @category, @example, @since

### Medium Priority (Missing some tags)

- [ ] `src/core.ts:22` — **DefaultFormValuesAnnotationId** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Symbol used to store default form value metadata on schemas.

- [ ] `src/core.ts:30` — **DefaultFormValuesAnnotation** (type)
  - Missing: @example
  - Has: @category, @since
  - Context: Default form values annotation payload keyed by form field.

- [ ] `src/core.ts:40` — **getDefaultFormValuesAnnotation** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Reads the default form values annotation from a schema.

- [ ] `src/core.ts:57` — **Struct** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Struct overload that preserves index signatures while enabling batching annotations.

- [ ] `src/core.ts:67` — **Struct** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Struct overload for field-only schemas with batching annotations.

- [ ] `src/core.ts:100` — **Struct** (namespace)
  - Missing: @example
  - Has: @category, @since
  - Context: Namespace for {@link Struct} helper types.

- [ ] `src/core.ts:144` — **Tuple** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Tuple overload that captures rest schemas with batching annotations.

- [ ] `src/core.ts:154` — **Tuple** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Tuple overload for fixed element sequences with batching annotations.

- [ ] `src/derived.ts:230` — **makeGenericLiteralKit** (function)
  - Missing: @example
  - Has: @param, @param, @returns, @since, @category
  - Context: Creates a literal kit from an array of literal values.

- [ ] `src/derived.ts:121` — **IGenericLiteralKit** (interface)
  - Missing: @example
  - Has: @since, @category
  - Context: Interface representing a generic literal kit instance.

- [ ] `src/derived.ts:165` — **makeMappedLiteralKit** (function)
  - Missing: @example
  - Has: @param, @param, @returns, @since, @category
  - Context: Creates a mapped literal kit from pairs.

- [ ] `src/derived.ts:113` — **IMappedLiteralKit** (interface)
  - Missing: @example
  - Has: @since, @category
  - Context: Interface representing a mapped literal kit instance.

- [ ] `src/derived.ts:180` — **isMembers** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Checks whether the provided array of literals constitutes multiple members.

- [ ] `src/derived.ts:190` — **mapMembers** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Maps members using the provided function while preserving member metadata.

- [ ] `src/derived.ts:437` — **StringLiteralKit** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Factory for creating string literal kits with optional enum mappings.

- [ ] `src/integrations.ts:57` — **AspectRatio** (class)
  - Missing: @category, @since
  - Has: @example
  - Context: AspectRatio schema that transforms between dimensions and a simplified ratio string.

- [ ] `src/integrations.ts:115` — **cleanExifData** (const)
  - Missing: @category, @since
  - Has: @param, @returns, @example
  - Context: Clean EXIF data by removing large binary fields like base64, images, etc.

- [ ] `src/integrations.ts:199` — **formatSize** (function)
  - Missing: @category, @since
  - Has: @example
  - Context: Convert bytes (or bits) to a human-readable string: `1337` -> `'1.34 kB'`.

- [ ] `src/primitives.ts:22` — **ArrayOfNumbers** (class)
  - Missing: @example
  - Has: @category, @since
  - Context: Schema for arrays of numbers with identity annotations.

- [ ] `src/primitives.ts:36` — **ArrayOfNumbers** (namespace)
  - Missing: @example
  - Has: @category, @since
  - Context: Namespace describing the encoded and decoded types for {@link ArrayOfNumbers}.

- [ ] `src/primitives.ts:59` — **arrayToCommaSeparatedString** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Transforms between comma-delimited strings and literal arrays.

- [ ] `src/primitives.ts:20` — **ArrayBufferFromSelf** (class)
  - Missing: @example
  - Has: @category, @since
  - Context: Schema for validating native `ArrayBuffer` instances.

- [ ] `src/primitives.ts:34` — **ArrayBufferFromSelf** (namespace)
  - Missing: @example
  - Has: @category, @since
  - Context: Namespace describing the encoded and decoded types for {@link ArrayBufferFromSelf}.

- [ ] `src/primitives.ts:64` — **DurationFromSelfInput** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Union input supporting tagged duration components and HR time tuples.

- [ ] `src/primitives.ts:76` — **TaggedDurationInputUnion** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Tagged union covering all supported duration inputs.

- [ ] `src/primitives.ts:243` — **TaggedDurationInputUnion** (namespace)
  - Missing: @example
  - Has: @category, @since
  - Context: Namespace describing the encoded and decoded types for the tagged duration input union.

- [ ] `src/primitives.ts:266` — **DurationFromSeconds** (class)
  - Missing: @example
  - Has: @category, @since
  - Context: Duration schema that accepts a non-negative seconds value.

- [ ] `src/primitives.ts:288` — **DurationFromSeconds** (namespace)
  - Missing: @example
  - Has: @category, @since
  - Context: Namespace describing the encoded and decoded types for {@link DurationFromSeconds}.

- [ ] `src/primitives.ts:20` — **YearEncoded** (class)
  - Missing: @example
  - Has: @category, @since
  - Context: Number-encoded year schema.

- [ ] `src/primitives.ts:32` — **YearEncoded** (namespace)
  - Missing: @example
  - Has: @category, @since
  - Context: Namespace describing the encoded and decoded types for {@link YearEncoded}.

- [ ] `src/schema.ts:22` — **DefaultFormValuesAnnotationId** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Symbol used to store default form value metadata on schemas.

- [ ] `src/schema.ts:30` — **DefaultFormValuesAnnotation** (type)
  - Missing: @example
  - Has: @category, @since
  - Context: Default form values annotation payload keyed by form field.

- [ ] `src/schema.ts:40` — **getDefaultFormValuesAnnotation** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Reads the default form values annotation from a schema.

- [ ] `src/schema.ts:57` — **Struct** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Struct overload that preserves index signatures while enabling batching annotations.

- [ ] `src/schema.ts:67` — **Struct** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Struct overload for field-only schemas with batching annotations.

- [ ] `src/schema.ts:100` — **Struct** (namespace)
  - Missing: @example
  - Has: @category, @since
  - Context: Namespace for {@link Struct} helper types.

- [ ] `src/schema.ts:144` — **Tuple** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Tuple overload that captures rest schemas with batching annotations.

- [ ] `src/schema.ts:154` — **Tuple** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Tuple overload for fixed element sequences with batching annotations.

- [ ] `src/schema.ts:230` — **makeGenericLiteralKit** (function)
  - Missing: @example
  - Has: @param, @param, @returns, @since, @category
  - Context: Creates a literal kit from an array of literal values.

- [ ] `src/schema.ts:121` — **IGenericLiteralKit** (interface)
  - Missing: @example
  - Has: @since, @category
  - Context: Interface representing a generic literal kit instance.

- [ ] `src/schema.ts:165` — **makeMappedLiteralKit** (function)
  - Missing: @example
  - Has: @param, @param, @returns, @since, @category
  - Context: Creates a mapped literal kit from pairs.

- [ ] `src/schema.ts:113` — **IMappedLiteralKit** (interface)
  - Missing: @example
  - Has: @since, @category
  - Context: Interface representing a mapped literal kit instance.

- [ ] `src/schema.ts:180` — **isMembers** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Checks whether the provided array of literals constitutes multiple members.

- [ ] `src/schema.ts:190` — **mapMembers** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Maps members using the provided function while preserving member metadata.

- [ ] `src/schema.ts:437` — **StringLiteralKit** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Factory for creating string literal kits with optional enum mappings.

- [ ] `src/schema.ts:57` — **AspectRatio** (class)
  - Missing: @category, @since
  - Has: @example
  - Context: AspectRatio schema that transforms between dimensions and a simplified ratio string.

- [ ] `src/schema.ts:115` — **cleanExifData** (const)
  - Missing: @category, @since
  - Has: @param, @returns, @example
  - Context: Clean EXIF data by removing large binary fields like base64, images, etc.

- [ ] `src/schema.ts:199` — **formatSize** (function)
  - Missing: @category, @since
  - Has: @example
  - Context: Convert bytes (or bits) to a human-readable string: `1337` -> `'1.34 kB'`.

- [ ] `src/schema.ts:22` — **ArrayOfNumbers** (class)
  - Missing: @example
  - Has: @category, @since
  - Context: Schema for arrays of numbers with identity annotations.

- [ ] `src/schema.ts:36` — **ArrayOfNumbers** (namespace)
  - Missing: @example
  - Has: @category, @since
  - Context: Namespace describing the encoded and decoded types for {@link ArrayOfNumbers}.

- [ ] `src/schema.ts:59` — **arrayToCommaSeparatedString** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Transforms between comma-delimited strings and literal arrays.

- [ ] `src/schema.ts:20` — **ArrayBufferFromSelf** (class)
  - Missing: @example
  - Has: @category, @since
  - Context: Schema for validating native `ArrayBuffer` instances.

- [ ] `src/schema.ts:34` — **ArrayBufferFromSelf** (namespace)
  - Missing: @example
  - Has: @category, @since
  - Context: Namespace describing the encoded and decoded types for {@link ArrayBufferFromSelf}.

- [ ] `src/schema.ts:64` — **DurationFromSelfInput** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Union input supporting tagged duration components and HR time tuples.

- [ ] `src/schema.ts:76` — **TaggedDurationInputUnion** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Tagged union covering all supported duration inputs.

- [ ] `src/schema.ts:243` — **TaggedDurationInputUnion** (namespace)
  - Missing: @example
  - Has: @category, @since
  - Context: Namespace describing the encoded and decoded types for the tagged duration input union.

- [ ] `src/schema.ts:266` — **DurationFromSeconds** (class)
  - Missing: @example
  - Has: @category, @since
  - Context: Duration schema that accepts a non-negative seconds value.

- [ ] `src/schema.ts:288` — **DurationFromSeconds** (namespace)
  - Missing: @example
  - Has: @category, @since
  - Context: Namespace describing the encoded and decoded types for {@link DurationFromSeconds}.

- [ ] `src/schema.ts:20` — **YearEncoded** (class)
  - Missing: @example
  - Has: @category, @since
  - Context: Number-encoded year schema.

- [ ] `src/schema.ts:32` — **YearEncoded** (namespace)
  - Missing: @example
  - Has: @category, @since
  - Context: Namespace describing the encoded and decoded types for {@link YearEncoded}.

- [ ] `src/core/core.ts:9` — **coreModule** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Core marker module to satisfy documentation coverage.

- [ ] `src/core/index.ts:22` — **DefaultFormValuesAnnotationId** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Symbol used to store default form value metadata on schemas.

- [ ] `src/core/index.ts:30` — **DefaultFormValuesAnnotation** (type)
  - Missing: @example
  - Has: @category, @since
  - Context: Default form values annotation payload keyed by form field.

- [ ] `src/core/index.ts:40` — **getDefaultFormValuesAnnotation** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Reads the default form values annotation from a schema.

- [ ] `src/core/index.ts:57` — **Struct** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Struct overload that preserves index signatures while enabling batching annotations.

- [ ] `src/core/index.ts:67` — **Struct** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Struct overload for field-only schemas with batching annotations.

- [ ] `src/core/index.ts:100` — **Struct** (namespace)
  - Missing: @example
  - Has: @category, @since
  - Context: Namespace for {@link Struct} helper types.

- [ ] `src/core/index.ts:144` — **Tuple** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Tuple overload that captures rest schemas with batching annotations.

- [ ] `src/core/index.ts:154` — **Tuple** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Tuple overload for fixed element sequences with batching annotations.

- [ ] `src/derived/derived.ts:230` — **makeGenericLiteralKit** (function)
  - Missing: @example
  - Has: @param, @param, @returns, @since, @category
  - Context: Creates a literal kit from an array of literal values.

- [ ] `src/derived/derived.ts:121` — **IGenericLiteralKit** (interface)
  - Missing: @example
  - Has: @since, @category
  - Context: Interface representing a generic literal kit instance.

- [ ] `src/derived/derived.ts:165` — **makeMappedLiteralKit** (function)
  - Missing: @example
  - Has: @param, @param, @returns, @since, @category
  - Context: Creates a mapped literal kit from pairs.

- [ ] `src/derived/derived.ts:113` — **IMappedLiteralKit** (interface)
  - Missing: @example
  - Has: @since, @category
  - Context: Interface representing a mapped literal kit instance.

- [ ] `src/derived/derived.ts:180` — **isMembers** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Checks whether the provided array of literals constitutes multiple members.

- [ ] `src/derived/derived.ts:190` — **mapMembers** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Maps members using the provided function while preserving member metadata.

- [ ] `src/derived/derived.ts:437` — **StringLiteralKit** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Factory for creating string literal kits with optional enum mappings.

- [ ] `src/derived/index.ts:230` — **makeGenericLiteralKit** (function)
  - Missing: @example
  - Has: @param, @param, @returns, @since, @category
  - Context: Creates a literal kit from an array of literal values.

- [ ] `src/derived/index.ts:121` — **IGenericLiteralKit** (interface)
  - Missing: @example
  - Has: @since, @category
  - Context: Interface representing a generic literal kit instance.

- [ ] `src/derived/index.ts:165` — **makeMappedLiteralKit** (function)
  - Missing: @example
  - Has: @param, @param, @returns, @since, @category
  - Context: Creates a mapped literal kit from pairs.

- [ ] `src/derived/index.ts:113` — **IMappedLiteralKit** (interface)
  - Missing: @example
  - Has: @since, @category
  - Context: Interface representing a mapped literal kit instance.

- [ ] `src/derived/index.ts:180` — **isMembers** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Checks whether the provided array of literals constitutes multiple members.

- [ ] `src/derived/index.ts:190` — **mapMembers** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Maps members using the provided function while preserving member metadata.

- [ ] `src/derived/index.ts:437` — **StringLiteralKit** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Factory for creating string literal kits with optional enum mappings.

- [ ] `src/integrations/index.ts:57` — **AspectRatio** (class)
  - Missing: @category, @since
  - Has: @example
  - Context: AspectRatio schema that transforms between dimensions and a simplified ratio string.

- [ ] `src/integrations/index.ts:115` — **cleanExifData** (const)
  - Missing: @category, @since
  - Has: @param, @returns, @example
  - Context: Clean EXIF data by removing large binary fields like base64, images, etc.

- [ ] `src/integrations/index.ts:199` — **formatSize** (function)
  - Missing: @category, @since
  - Has: @example
  - Context: Convert bytes (or bits) to a human-readable string: `1337` -> `'1.34 kB'`.

- [ ] `src/primitives/array-buffer.ts:20` — **ArrayBufferFromSelf** (class)
  - Missing: @example
  - Has: @category, @since
  - Context: Schema for validating native `ArrayBuffer` instances.

- [ ] `src/primitives/array-buffer.ts:34` — **ArrayBufferFromSelf** (namespace)
  - Missing: @example
  - Has: @category, @since
  - Context: Namespace describing the encoded and decoded types for {@link ArrayBufferFromSelf}.

- [ ] `src/primitives/array.ts:22` — **ArrayOfNumbers** (class)
  - Missing: @example
  - Has: @category, @since
  - Context: Schema for arrays of numbers with identity annotations.

- [ ] `src/primitives/array.ts:36` — **ArrayOfNumbers** (namespace)
  - Missing: @example
  - Has: @category, @since
  - Context: Namespace describing the encoded and decoded types for {@link ArrayOfNumbers}.

- [ ] `src/primitives/array.ts:59` — **arrayToCommaSeparatedString** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Transforms between comma-delimited strings and literal arrays.

- [ ] `src/primitives/duration.ts:64` — **DurationFromSelfInput** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Union input supporting tagged duration components and HR time tuples.

- [ ] `src/primitives/duration.ts:76` — **TaggedDurationInputUnion** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Tagged union covering all supported duration inputs.

- [ ] `src/primitives/duration.ts:243` — **TaggedDurationInputUnion** (namespace)
  - Missing: @example
  - Has: @category, @since
  - Context: Namespace describing the encoded and decoded types for the tagged duration input union.

- [ ] `src/primitives/duration.ts:266` — **DurationFromSeconds** (class)
  - Missing: @example
  - Has: @category, @since
  - Context: Duration schema that accepts a non-negative seconds value.

- [ ] `src/primitives/duration.ts:288` — **DurationFromSeconds** (namespace)
  - Missing: @example
  - Has: @category, @since
  - Context: Namespace describing the encoded and decoded types for {@link DurationFromSeconds}.

- [ ] `src/primitives/index.ts:22` — **ArrayOfNumbers** (class)
  - Missing: @example
  - Has: @category, @since
  - Context: Schema for arrays of numbers with identity annotations.

- [ ] `src/primitives/index.ts:36` — **ArrayOfNumbers** (namespace)
  - Missing: @example
  - Has: @category, @since
  - Context: Namespace describing the encoded and decoded types for {@link ArrayOfNumbers}.

- [ ] `src/primitives/index.ts:59` — **arrayToCommaSeparatedString** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Transforms between comma-delimited strings and literal arrays.

- [ ] `src/primitives/index.ts:20` — **ArrayBufferFromSelf** (class)
  - Missing: @example
  - Has: @category, @since
  - Context: Schema for validating native `ArrayBuffer` instances.

- [ ] `src/primitives/index.ts:34` — **ArrayBufferFromSelf** (namespace)
  - Missing: @example
  - Has: @category, @since
  - Context: Namespace describing the encoded and decoded types for {@link ArrayBufferFromSelf}.

- [ ] `src/primitives/index.ts:64` — **DurationFromSelfInput** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Union input supporting tagged duration components and HR time tuples.

- [ ] `src/primitives/index.ts:76` — **TaggedDurationInputUnion** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Tagged union covering all supported duration inputs.

- [ ] `src/primitives/index.ts:243` — **TaggedDurationInputUnion** (namespace)
  - Missing: @example
  - Has: @category, @since
  - Context: Namespace describing the encoded and decoded types for the tagged duration input union.

- [ ] `src/primitives/index.ts:266` — **DurationFromSeconds** (class)
  - Missing: @example
  - Has: @category, @since
  - Context: Duration schema that accepts a non-negative seconds value.

- [ ] `src/primitives/index.ts:288` — **DurationFromSeconds** (namespace)
  - Missing: @example
  - Has: @category, @since
  - Context: Namespace describing the encoded and decoded types for {@link DurationFromSeconds}.

- [ ] `src/primitives/index.ts:20` — **YearEncoded** (class)
  - Missing: @example
  - Has: @category, @since
  - Context: Number-encoded year schema.

- [ ] `src/primitives/index.ts:32` — **YearEncoded** (namespace)
  - Missing: @example
  - Has: @category, @since
  - Context: Namespace describing the encoded and decoded types for {@link YearEncoded}.

- [ ] `src/builders/json-schema/index.ts:43` — **$JsonType** (namespace)
  - Missing: @example
  - Has: @category, @since
  - Context: Namespace describing the encoded and decoded types for {@link $JsonType}.

- [ ] `src/builders/json-schema/json-type.ts:43` — **$JsonType** (namespace)
  - Missing: @example
  - Has: @category, @since
  - Context: Namespace describing the encoded and decoded types for {@link $JsonType}.

- [ ] `src/core/annotations/built-in-annotations.ts:59` — **mergeSchemaAnnotations** (const)
  - Missing: @example
  - Has: @param, @param, @returns, @category, @since
  - Context: Merges the given annotations with the AST annotations.

- [ ] `src/core/annotations/default-form-values-annotations.ts:22` — **DefaultFormValuesAnnotationId** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Symbol used to store default form value metadata on schemas.

- [ ] `src/core/annotations/default-form-values-annotations.ts:30` — **DefaultFormValuesAnnotation** (type)
  - Missing: @example
  - Has: @category, @since
  - Context: Default form values annotation payload keyed by form field.

- [ ] `src/core/annotations/default-form-values-annotations.ts:40` — **getDefaultFormValuesAnnotation** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Reads the default form values annotation from a schema.

- [ ] `src/core/annotations/index.ts:22` — **DefaultFormValuesAnnotationId** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Symbol used to store default form value metadata on schemas.

- [ ] `src/core/annotations/index.ts:30` — **DefaultFormValuesAnnotation** (type)
  - Missing: @example
  - Has: @category, @since
  - Context: Default form values annotation payload keyed by form field.

- [ ] `src/core/annotations/index.ts:40` — **getDefaultFormValuesAnnotation** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Reads the default form values annotation from a schema.

- [ ] `src/core/extended/extended-schemas.ts:57` — **Struct** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Struct overload that preserves index signatures while enabling batching annotations.

- [ ] `src/core/extended/extended-schemas.ts:67` — **Struct** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Struct overload for field-only schemas with batching annotations.

- [ ] `src/core/extended/extended-schemas.ts:100` — **Struct** (namespace)
  - Missing: @example
  - Has: @category, @since
  - Context: Namespace for {@link Struct} helper types.

- [ ] `src/core/extended/extended-schemas.ts:144` — **Tuple** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Tuple overload that captures rest schemas with batching annotations.

- [ ] `src/core/extended/extended-schemas.ts:154` — **Tuple** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Tuple overload for fixed element sequences with batching annotations.

- [ ] `src/core/extended/index.ts:57` — **Struct** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Struct overload that preserves index signatures while enabling batching annotations.

- [ ] `src/core/extended/index.ts:67` — **Struct** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Struct overload for field-only schemas with batching annotations.

- [ ] `src/core/extended/index.ts:100` — **Struct** (namespace)
  - Missing: @example
  - Has: @category, @since
  - Context: Namespace for {@link Struct} helper types.

- [ ] `src/core/extended/index.ts:144` — **Tuple** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Tuple overload that captures rest schemas with batching annotations.

- [ ] `src/core/extended/index.ts:154` — **Tuple** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Tuple overload for fixed element sequences with batching annotations.

- [ ] `src/derived/kits/index.ts:230` — **makeGenericLiteralKit** (function)
  - Missing: @example
  - Has: @param, @param, @returns, @since, @category
  - Context: Creates a literal kit from an array of literal values.

- [ ] `src/derived/kits/index.ts:121` — **IGenericLiteralKit** (interface)
  - Missing: @example
  - Has: @since, @category
  - Context: Interface representing a generic literal kit instance.

- [ ] `src/derived/kits/index.ts:165` — **makeMappedLiteralKit** (function)
  - Missing: @example
  - Has: @param, @param, @returns, @since, @category
  - Context: Creates a mapped literal kit from pairs.

- [ ] `src/derived/kits/index.ts:113` — **IMappedLiteralKit** (interface)
  - Missing: @example
  - Has: @since, @category
  - Context: Interface representing a mapped literal kit instance.

- [ ] `src/derived/kits/index.ts:180` — **isMembers** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Checks whether the provided array of literals constitutes multiple members.

- [ ] `src/derived/kits/index.ts:190` — **mapMembers** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Maps members using the provided function while preserving member metadata.

- [ ] `src/derived/kits/index.ts:437` — **StringLiteralKit** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Factory for creating string literal kits with optional enum mappings.

- [ ] `src/derived/kits/literal-kit.ts:230` — **makeGenericLiteralKit** (function)
  - Missing: @example
  - Has: @param, @param, @returns, @since, @category
  - Context: Creates a literal kit from an array of literal values.

- [ ] `src/derived/kits/literal-kit.ts:121` — **IGenericLiteralKit** (interface)
  - Missing: @example
  - Has: @since, @category
  - Context: Interface representing a generic literal kit instance.

- [ ] `src/derived/kits/mapped-literal-kit.ts:165` — **makeMappedLiteralKit** (function)
  - Missing: @example
  - Has: @param, @param, @returns, @since, @category
  - Context: Creates a mapped literal kit from pairs.

- [ ] `src/derived/kits/mapped-literal-kit.ts:113` — **IMappedLiteralKit** (interface)
  - Missing: @example
  - Has: @since, @category
  - Context: Interface representing a mapped literal kit instance.

- [ ] `src/derived/kits/string-literal-kit.ts:180` — **isMembers** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Checks whether the provided array of literals constitutes multiple members.

- [ ] `src/derived/kits/string-literal-kit.ts:190` — **mapMembers** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Maps members using the provided function while preserving member metadata.

- [ ] `src/derived/kits/string-literal-kit.ts:437` — **StringLiteralKit** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Factory for creating string literal kits with optional enum mappings.

- [ ] `src/integrations/files/AspectRatio.ts:57` — **AspectRatio** (class)
  - Missing: @category, @since
  - Has: @example
  - Context: AspectRatio schema that transforms between dimensions and a simplified ratio string.

- [ ] `src/integrations/files/index.ts:57` — **AspectRatio** (class)
  - Missing: @category, @since
  - Has: @example
  - Context: AspectRatio schema that transforms between dimensions and a simplified ratio string.

- [ ] `src/integrations/files/index.ts:115` — **cleanExifData** (const)
  - Missing: @category, @since
  - Has: @param, @returns, @example
  - Context: Clean EXIF data by removing large binary fields like base64, images, etc.

- [ ] `src/integrations/files/index.ts:199` — **formatSize** (function)
  - Missing: @category, @since
  - Has: @example
  - Context: Convert bytes (or bits) to a human-readable string: `1337` -> `'1.34 kB'`.

- [ ] `src/primitives/temporal/index.ts:20` — **YearEncoded** (class)
  - Missing: @example
  - Has: @category, @since
  - Context: Number-encoded year schema.

- [ ] `src/primitives/temporal/index.ts:32` — **YearEncoded** (namespace)
  - Missing: @example
  - Has: @category, @since
  - Context: Namespace describing the encoded and decoded types for {@link YearEncoded}.

- [ ] `src/primitives/temporal/year.ts:20` — **YearEncoded** (class)
  - Missing: @example
  - Has: @category, @since
  - Context: Number-encoded year schema.

- [ ] `src/primitives/temporal/year.ts:32` — **YearEncoded** (namespace)
  - Missing: @example
  - Has: @category, @since
  - Context: Namespace describing the encoded and decoded types for {@link YearEncoded}.

- [ ] `src/integrations/files/exif-metadata/ExifMetadata.ts:115` — **cleanExifData** (const)
  - Missing: @category, @since
  - Has: @param, @returns, @example
  - Context: Clean EXIF data by removing large binary fields like base64, images, etc.

- [ ] `src/integrations/files/exif-metadata/index.ts:115` — **cleanExifData** (const)
  - Missing: @category, @since
  - Has: @param, @returns, @example
  - Context: Clean EXIF data by removing large binary fields like base64, images, etc.

- [ ] `src/integrations/files/utils/formatSize.ts:199` — **formatSize** (function)
  - Missing: @category, @since
  - Has: @example
  - Context: Convert bytes (or bits) to a human-readable string: `1337` -> `'1.34 kB'`.

- [ ] `src/integrations/files/utils/index.ts:199` — **formatSize** (function)
  - Missing: @category, @since
  - Has: @example
  - Context: Convert bytes (or bits) to a human-readable string: `1337` -> `'1.34 kB'`.

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| Total Exports | 2706 |
| Fully Documented | 1531 |
| Missing Documentation | 1175 |
| Missing @category | 1039 |
| Missing @example | 1158 |
| Missing @since | 1039 |

---

## Verification

After completing all documentation, run:

```bash
beep docgen analyze -p packages/common/schema
```

If successful, delete this file. If issues remain, the checklist will be regenerated.