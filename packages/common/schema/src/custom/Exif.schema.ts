import type { UnsafeTypes } from "@beep/types";
import * as ParseResult from "effect/ParseResult";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Struct from "effect/Struct";
import { Json } from "./Json.schema";

// Base tag types
const NumberFileTag = S.Struct({
  description: S.String,
  value: S.Number,
});

const NumberArrayFileTag = S.Struct({
  description: S.String,
  value: S.Array(S.Number),
});

const NumberArray2DFileTag = S.Struct({
  description: S.String,
  value: S.Union(S.Array(S.Number), S.Array(S.Array(S.Number))),
});

const makeTypedTag = <A, I, R>(schema: S.Schema<A, I, R>) =>
  S.Struct({
    id: S.Number,
    description: S.Union(S.String, S.Number),
    value: schema,
  });

const RationalTag = makeTypedTag(S.Tuple(S.Number, S.Number));
const NumberTag = makeTypedTag(S.Number);
const NumberArrayTag = makeTypedTag(S.Array(S.Number));
const StringArrayTag = makeTypedTag(S.Array(S.String));
const StringTag = makeTypedTag(S.String);

const ValueTag = S.Struct({
  description: S.String,
  value: S.Union(S.String, S.Number),
});

// File types
const FileTypeTag = S.Struct({
  value: S.Literal("tiff", "jpeg", "png", "heic", "avif", "webp", "gif"),
  description: S.Literal("TIFF", "JPEG", "PNG", "HEIC", "AVIF", "WebP", "GIF"),
});

const FileTags = S.Struct({
  fileType: S.optional(S.Union(FileTypeTag, S.Literal("TIFF", "JPEG", "PNG", "HEIC", "AVIF", "WebP", "GIF"))).pipe(
    S.fromKey("FileType")
  ),
  bitsPerSample: S.optional(NumberFileTag).pipe(S.fromKey("Bits Per Sample")),
  height: S.optional(NumberFileTag).pipe(S.fromKey("Image Height")),
  width: S.optional(NumberFileTag).pipe(S.fromKey("Image Width")),
  colorComponents: S.optional(NumberFileTag).pipe(S.fromKey("Color Components")),
  subsampling: S.optional(NumberArray2DFileTag).pipe(S.fromKey("Subsampling")),
});

// JFIF tags
const JfifResolutionUnitTag = S.Struct({
  value: S.Number,
  description: S.Literal("None", "inches", "cm", "Unknown"),
});

const JfifThumbnailTag = S.Struct({
  value: S.Union(S.instanceOf(ArrayBuffer), S.instanceOf(SharedArrayBuffer), S.instanceOf(Buffer)),
  description: S.Literal("<24-bit RGB pixel data>"),
});

const JfifTags = S.Struct({
  jfifVersion: S.optional(NumberFileTag).pipe(S.fromKey("JFIF Version")),
  resolutionUnit: S.optional(JfifResolutionUnitTag).pipe(S.fromKey("Resolution Unit")),
  xResolution: S.optional(NumberFileTag).pipe(S.fromKey("XResolution")),
  yResolution: S.optional(NumberFileTag).pipe(S.fromKey("YResolution")),
  jfifThumbnailWidth: S.optional(NumberFileTag).pipe(S.fromKey("JFIF Thumbnail Width")),
  jfifThumbnailHeight: S.optional(NumberFileTag).pipe(S.fromKey("JFIF Thumbnail Height")),
  jfifThumbnail: S.optional(JfifThumbnailTag).pipe(S.fromKey("JFIF Thumbnail")),
});

// PNG tags
const PngColorTypeTag = S.Struct({
  value: S.Number,
  description: S.Literal("Grayscale", "RGB", "Palette", "Grayscale with Alpha", "RGB with Alpha", "Unknown"),
});

const PngCompressionTag = S.Struct({
  value: S.Number,
  description: S.Literal("Deflate/Inflate", "Unknown"),
});

const PngFilterTag = S.Struct({
  value: S.Number,
  description: S.Literal("Adaptive", "Unknown"),
});

const PngInterlaceTag = S.Struct({
  value: S.Number,
  description: S.Literal("Noninterlaced", "Adam7 Interlace", "Unknown"),
});

const PngFileTags = S.Struct({
  imageWidth: S.optional(NumberFileTag).pipe(S.fromKey("Image Width")),
  imageHeight: S.optional(NumberFileTag).pipe(S.fromKey("Image Height")),
  bitDepth: S.optional(NumberFileTag).pipe(S.fromKey("Bit Depth")),
  colorType: S.optional(PngColorTypeTag).pipe(S.fromKey("Color Type")),
  compression: S.optional(PngCompressionTag).pipe(S.fromKey("Compression")),
  filter: S.optional(PngFilterTag).pipe(S.fromKey("Filter")),
  interlace: S.optional(PngInterlaceTag).pipe(S.fromKey("Interlace")),
});

const PngPixelUnitsTag = S.Struct({
  value: S.Number,
  description: S.Literal("meters", "Unknown"),
});

const PngPhysTags = S.Struct({
  pixelsPerUnitX: S.optional(NumberFileTag).pipe(S.fromKey("Pixels Per Unit X")),
  pixelsPerUnitY: S.optional(NumberFileTag).pipe(S.fromKey("Pixels Per Unit Y")),
  pixelUnits: S.optional(PngPixelUnitsTag).pipe(S.fromKey("Pixel Units")),
  modifyDate: S.optional(NumberArrayFileTag).pipe(S.fromKey("Modify Date")),
});
// NumberArrayFileTag | undefined' i
const PngTag = S.Struct({
  description: S.String,
  value: S.Union(S.String, S.Number),
});

const PngTags = S.Struct(
  {
    ...PngFileTags.fields,
    ...PngPhysTags.fields,
  },
  S.Record({ key: S.String, value: PngTag })
);

const PngTextTag = S.Struct({
  description: S.String,
  value: S.String,
});

const PngTextTags = S.Record({ key: S.String, value: PngTextTag });

// RIFF tags
const RiffAlphaTag = S.Struct({
  value: S.Literal(0, 1),
  description: S.Literal("No", "Yes"),
});

const RiffAnimationTag = S.Struct({
  value: S.Literal(0, 1),
  description: S.Literal("No", "Yes"),
});

const RiffImageDimensionTag = S.Struct({
  value: S.Number,
  description: S.String,
});

const RiffTags = S.Struct({
  alpha: S.optional(RiffAlphaTag).pipe(S.fromKey("Alpha")),
  animation: S.optional(RiffAnimationTag).pipe(S.fromKey("Animation")),
  imageWidth: S.optional(RiffImageDimensionTag).pipe(S.fromKey("ImageWidth")),
  imageHeight: S.optional(RiffImageDimensionTag).pipe(S.fromKey("ImageHeight")),
});

// GIF tags
const GifVersionTag = S.Struct({
  value: S.Literal("87a", "89a"),
  description: S.Literal("87a", "89a"),
});

const GifBooleanTag = S.Struct({
  value: S.Literal(0, 1),
  description: S.Literal("No", "Yes"),
});

const GifDimensionTag = S.Struct({
  value: S.Number,
  description: S.String,
});

const GifBitsTag = S.Struct({
  value: S.Literal(1, 2, 3, 4, 5, 6, 7, 8),
  description: S.String,
});

const GifTags = S.Struct({
  gifVersion: GifVersionTag.pipe(S.propertySignature, S.fromKey("GIF Version")),
  imageWidth: S.optional(GifDimensionTag).pipe(S.fromKey("Image Width")),
  imageHeight: S.optional(GifDimensionTag).pipe(S.fromKey("Image Height")),
  globalColorMap: S.optional(GifBooleanTag).pipe(S.fromKey("Global Color Map")),
  bitsPerPixel: S.optional(GifBitsTag).pipe(S.fromKey("Bits Per Pixel")),
  colorResolutionDepth: S.optional(GifBitsTag).pipe(S.fromKey("Color Resolution Depth")),
});

// XMP tags (recursive)
export interface IXmpTag {
  value: string | ReadonlyArray<IXmpTag> | Record<string, IXmpTag>;
  attributes: {
    [name: string]: string;
  };
  description: string;
}

const XmpTag = S.Struct({
  value: S.Union(
    S.String,
    S.Array(S.suspend((): S.Schema<IXmpTag> => XmpTag)),
    S.Record({
      key: S.String,
      value: S.suspend((): S.Schema<IXmpTag> => XmpTag),
    })
  ),
  attributes: S.Record({
    key: S.String,
    value: S.String,
  }),
  description: S.String,
});

const XmpTags = S.Record({ key: S.String, value: XmpTag });

// GPS tags
const GpsTags = S.Struct({
  Latitude: S.optional(S.Number),
  Longitude: S.optional(S.Number),
  Altitude: S.optional(S.Number),
});

// MPF Image tags
const MPFImageFlags = S.Struct({
  value: S.Array(S.Number),
  description: S.String,
});

const MPFImageDescriptionTag = S.Struct({
  value: S.Number,
  description: S.String,
});

const MPFImageTags = S.Struct({
  ImageFlags: MPFImageFlags,
  ImageFormat: MPFImageDescriptionTag,
  ImageType: MPFImageDescriptionTag,
  ImageSize: MPFImageDescriptionTag,
  ImageOffset: MPFImageDescriptionTag,
  DependentImage1EntryNumber: MPFImageDescriptionTag,
  DependentImage2EntryNumber: MPFImageDescriptionTag,
  image: S.Union(S.instanceOf(ArrayBuffer), S.instanceOf(SharedArrayBuffer), S.instanceOf(Buffer)),
  base64: S.String,
});

// Photoshop tags
const PhotoshopTags = S.Struct({
  PathInformation: S.optional(StringTag),
  ClippingPathName: S.optional(StringTag),
});

// Canon tags
const CanonAutoRotateTag = S.Struct({
  value: S.Number,
  description: S.Literal("None", "Rotate 90 CW", "Rotate 180", "Rotate 270 CW", "Unknown"),
});

const CanonTags = S.Struct({
  AutoRotate: S.optional(CanonAutoRotateTag),
});

// Pentax tags
const PentaxVersionTag = S.Struct({
  value: S.Array(S.Number),
  description: S.String,
});

const PentaxModelIdTag = S.Struct({
  value: S.Number,
  description: S.String,
});

const PentaxOrientationTag = S.Struct({
  value: S.Number,
  description: S.Literal(
    "Horizontal (normal)",
    "Rotate 270 CW",
    "Rotate 180",
    "Rotate 90 CW",
    "Upwards",
    "Downwards",
    "Unknown"
  ),
});

const PentaxAngleTag = S.Struct({
  value: S.Number,
  description: S.String,
});

const PentaxTags = S.Struct({
  PentaxVersion: S.optional(PentaxVersionTag),
  PentaxModelID: S.optional(PentaxModelIdTag),
  Orientation: S.optional(PentaxOrientationTag),
  RollAngle: S.optional(PentaxAngleTag),
  PitchAngle: S.optional(PentaxAngleTag),
});

// Composite tags
const CompositeValueTag = S.Struct({
  value: S.Number,
  description: S.String,
});

const CompositeTags = S.Struct({
  FocalLength35efl: S.optional(CompositeValueTag),
  ScaleFactorTo35mmEquivalent: S.optional(CompositeValueTag),
  FieldOfView: S.optional(CompositeValueTag),
});

// Thumbnail tags
const ThumbnailTags = S.Struct({
  type: S.Literal("image/jpeg"),
  image: S.Union(S.instanceOf(ArrayBuffer), S.instanceOf(SharedArrayBuffer), S.instanceOf(Buffer)),
  base64: S.optional(S.String),
  Compression: S.optional(NumberTag),
  XResolution: S.optional(RationalTag),
  YResolution: S.optional(RationalTag),
  ResolutionUnit: S.optional(NumberTag),
  JPEGInterchangeFormat: S.optional(NumberTag),
  JPEGInterchangeFormatLength: S.optional(NumberTag),
  ImageWidth: S.optional(NumberTag),
  ImageLength: S.optional(NumberTag),
  YCbCrPositioning: S.optional(NumberTag),
  Orientation: S.optional(NumberTag),
  PhotometricInterpretation: S.optional(NumberTag),
  StripOffsets: S.optional(NumberArrayTag),
  SamplesPerPixel: S.optional(NumberTag),
  RowsPerStrip: S.optional(NumberTag),
  StripByteCounts: S.optional(NumberArrayTag),
});

// ICC tags
const IccTags = S.Record({ key: S.String, value: ValueTag });

// Main EXIF tags
export const ExifTags = S.Struct({
  // Interoperability tags
  interoperabilityIndex: S.optional(StringArrayTag).pipe(S.fromKey("InteroperabilityIndex")),

  // 0th IFD tags
  imageWidth: S.optional(NumberTag).pipe(S.fromKey("ImageWidth")),
  imageLength: S.optional(NumberTag).pipe(S.fromKey("ImageLength")),
  bitsPerSample: S.optional(NumberArrayTag).pipe(S.fromKey("BitsPerSample")),
  compression: S.optional(NumberTag).pipe(S.fromKey("Compression")),
  photometricInterpretation: S.optional(NumberTag).pipe(S.fromKey("PhotometricInterpretation")),
  documentName: S.optional(StringArrayTag).pipe(S.fromKey("DocumentName")),
  imageDescription: S.optional(StringArrayTag).pipe(S.fromKey("ImageDescription")),
  make: S.optional(StringArrayTag).pipe(S.fromKey("Make")),
  model: S.optional(StringArrayTag).pipe(S.fromKey("Model")),
  stripOffsets: S.optional(NumberArrayTag).pipe(S.fromKey("StripOffsets")),
  orientation: S.optional(NumberTag).pipe(S.fromKey("Orientation")),
  samplesPerPixel: S.optional(NumberTag).pipe(S.fromKey("SamplesPerPixel")),
  rowsPerStrip: S.optional(NumberTag).pipe(S.fromKey("RowsPerStrip")),
  stripByteCounts: S.optional(NumberArrayTag).pipe(S.fromKey("StripByteCounts")),
  xResolution: S.optional(S.Union(RationalTag, NumberFileTag)).pipe(S.fromKey("XResolution")),
  yResolution: S.optional(S.Union(RationalTag, NumberFileTag)).pipe(S.fromKey("YResolution")),
  planarConfiguration: S.optional(NumberTag).pipe(S.fromKey("PlanarConfiguration")),
  resolutionUnit: S.optional(NumberTag).pipe(S.fromKey("ResolutionUnit")),
  transferFunction: S.optional(NumberArrayTag).pipe(S.fromKey("TransferFunction")),
  software: S.optional(StringArrayTag).pipe(S.fromKey("Software")),
  dateTime: S.optional(StringArrayTag).pipe(S.fromKey("DateTime")),
  artist: S.optional(StringArrayTag).pipe(S.fromKey("Artist")),
  whitePoint: S.optional(NumberArrayTag).pipe(S.fromKey("WhitePoint")),
  primaryChromaticities: S.optional(NumberArrayTag).pipe(S.fromKey("PrimaryChromaticities")),
  jpegInterchangeFormat: S.optional(NumberTag).pipe(S.fromKey("JPEGInterchangeFormat")),
  jpegInterchangeFormatLength: S.optional(NumberTag).pipe(S.fromKey("JPEGInterchangeFormatLength")),
  yCbCrCoefficients: S.optional(NumberArrayTag).pipe(S.fromKey("YCbCrCoefficients")),
  yCbCrSubSampling: S.optional(NumberArrayTag).pipe(S.fromKey("YCbCrSubSampling")),
  yCbCrPositioning: S.optional(NumberTag).pipe(S.fromKey("YCbCrPositioning")),
  referenceBlackWhite: S.optional(NumberArrayTag).pipe(S.fromKey("ReferenceBlackWhite")),
  copyright: S.optional(StringArrayTag).pipe(S.fromKey("Copyright")),
  exifIfdPointer: S.optional(NumberTag).pipe(S.fromKey("Exif IFD Pointer")),
  gpsInfoIfdPointer: S.optional(NumberTag).pipe(S.fromKey("GPS Info IFD Pointer")),

  // JFIF tags
  jfifVersion: S.optional(NumberFileTag).pipe(S.fromKey("JFIF Version")),
  jfifResolutionUnit: S.optional(JfifResolutionUnitTag).pipe(S.fromKey("Resolution Unit")),
  jfifThumbnailWidth: S.optional(NumberFileTag).pipe(S.fromKey("JFIF Thumbnail Width")),
  jfifThumbnailHeight: S.optional(NumberFileTag).pipe(S.fromKey("JFIF Thumbnail Height")),
  jfifThumbnail: S.optional(JfifThumbnailTag).pipe(S.fromKey("JFIF Thumbnail")),

  // Exif tags
  exposureTime: S.optional(RationalTag).pipe(S.fromKey("ExposureTime")),
  fNumber: S.optional(RationalTag).pipe(S.fromKey("FNumber")),
  exposureProgram: S.optional(NumberTag).pipe(S.fromKey("ExposureProgram")),
  spectralSensitivity: S.optional(StringArrayTag).pipe(S.fromKey("SpectralSensitivity")),
  isoSpeedRatings: S.optional(S.Union(NumberTag, NumberArrayTag)).pipe(S.fromKey("ISOSpeedRatings")),
  oecf: S.optional(S.Unknown).pipe(S.fromKey("OECF")),
  exifVersion: S.optional(NumberArrayTag).pipe(S.fromKey("ExifVersion")),
  dateTimeOriginal: S.optional(StringArrayTag).pipe(S.fromKey("DateTimeOriginal")),
  dateTimeDigitized: S.optional(StringArrayTag).pipe(S.fromKey("DateTimeDigitized")),
  componentsConfiguration: S.optional(NumberArrayTag).pipe(S.fromKey("ComponentsConfiguration")),
  compressedBitsPerPixel: S.optional(RationalTag).pipe(S.fromKey("CompressedBitsPerPixel")),
  shutterSpeedValue: S.optional(RationalTag).pipe(S.fromKey("ShutterSpeedValue")),
  apertureValue: S.optional(RationalTag).pipe(S.fromKey("ApertureValue")),
  brightnessValue: S.optional(RationalTag).pipe(S.fromKey("BrightnessValue")),
  exposureBiasValue: S.optional(RationalTag).pipe(S.fromKey("ExposureBiasValue")),
  maxApertureValue: S.optional(RationalTag).pipe(S.fromKey("MaxApertureValue")),
  subjectDistance: S.optional(RationalTag).pipe(S.fromKey("SubjectDistance")),
  meteringMode: S.optional(NumberTag).pipe(S.fromKey("MeteringMode")),
  lightSource: S.optional(NumberTag).pipe(S.fromKey("LightSource")),
  flash: S.optional(NumberTag).pipe(S.fromKey("Flash")),
  focalLength: S.optional(RationalTag).pipe(S.fromKey("FocalLength")),
  subjectArea: S.optional(NumberArrayTag).pipe(S.fromKey("SubjectArea")),
  makerNote: S.optional(S.Unknown).pipe(S.fromKey("MakerNote")),
  userComment: S.optional(S.Unknown).pipe(S.fromKey("UserComment")),
  subSecTime: S.optional(StringArrayTag).pipe(S.fromKey("SubSecTime")),
  subSecTimeOriginal: S.optional(StringArrayTag).pipe(S.fromKey("SubSecTimeOriginal")),
  subSecTimeDigitized: S.optional(StringArrayTag).pipe(S.fromKey("SubSecTimeDigitized")),
  flashpixVersion: S.optional(NumberArrayTag).pipe(S.fromKey("FlashpixVersion")),
  colorSpace: S.optional(NumberTag).pipe(S.fromKey("ColorSpace")),
  pixelXDimension: S.optional(NumberTag).pipe(S.fromKey("PixelXDimension")),
  pixelYDimension: S.optional(NumberTag).pipe(S.fromKey("PixelYDimension")),
  relatedSoundFile: S.optional(StringArrayTag).pipe(S.fromKey("RelatedSoundFile")),
  interoperabilityIfdPointer: S.optional(NumberTag).pipe(S.fromKey("Interoperability IFD Pointer")),
  flashEnergy: S.optional(NumberTag).pipe(S.fromKey("FlashEnergy")),
  spatialFrequencyResponse: S.optional(S.Unknown).pipe(S.fromKey("SpatialFrequencyResponse")),
  focalPlaneXResolution: S.optional(RationalTag).pipe(S.fromKey("FocalPlaneXResolution")),
  focalPlaneYResolution: S.optional(RationalTag).pipe(S.fromKey("FocalPlaneYResolution")),
  focalPlaneResolutionUnit: S.optional(NumberTag).pipe(S.fromKey("FocalPlaneResolutionUnit")),
  subjectLocation: S.optional(NumberArrayTag).pipe(S.fromKey("SubjectLocation")),
  exposureIndex: S.optional(RationalTag).pipe(S.fromKey("ExposureIndex")),
  sensingMethod: S.optional(NumberTag).pipe(S.fromKey("SensingMethod")),
  fileSource: S.optional(NumberTag).pipe(S.fromKey("FileSource")),
  sceneType: S.optional(NumberTag).pipe(S.fromKey("SceneType")),
  cfaPattern: S.optional(S.Unknown).pipe(S.fromKey("CFAPattern")),
  customRendered: S.optional(NumberTag).pipe(S.fromKey("CustomRendered")),
  exposureMode: S.optional(NumberTag).pipe(S.fromKey("ExposureMode")),
  whiteBalance: S.optional(NumberTag).pipe(S.fromKey("WhiteBalance")),
  digitalZoomRatio: S.optional(RationalTag).pipe(S.fromKey("DigitalZoomRatio")),
  focalLengthIn35mmFilm: S.optional(NumberTag).pipe(S.fromKey("FocalLengthIn35mmFilm")),
  sceneCaptureType: S.optional(NumberTag).pipe(S.fromKey("SceneCaptureType")),
  gainControl: S.optional(NumberTag).pipe(S.fromKey("GainControl")),
  contrast: S.optional(NumberTag).pipe(S.fromKey("Contrast")),
  saturation: S.optional(NumberTag).pipe(S.fromKey("Saturation")),
  sharpness: S.optional(NumberTag).pipe(S.fromKey("Sharpness")),
  deviceSettingDescription: S.optional(S.Unknown).pipe(S.fromKey("DeviceSettingDescription")),
  subjectDistanceRange: S.optional(NumberTag).pipe(S.fromKey("SubjectDistanceRange")),
  imageUniqueId: S.optional(StringArrayTag).pipe(S.fromKey("ImageUniqueID")),
  lensMake: S.optional(StringArrayTag).pipe(S.fromKey("LensMake")),
  lensModel: S.optional(StringArrayTag).pipe(S.fromKey("LensModel")),
  offsetTime: S.optional(StringArrayTag).pipe(S.fromKey("OffsetTime")),
  offsetTimeDigitized: S.optional(StringArrayTag).pipe(S.fromKey("OffsetTimeDigitized")),
  offsetTimeOriginal: S.optional(StringArrayTag).pipe(S.fromKey("OffsetTimeOriginal")),
  gpsHPositioningError: S.optional(NumberArrayTag).pipe(S.fromKey("GPSHPositioningError")),

  // GPS tags
  gpsVersionId: S.optional(NumberTag).pipe(S.fromKey("GPSVersionID")),
  gpsLatitudeRef: S.optional(StringArrayTag).pipe(S.fromKey("GPSLatitudeRef")),
  gpsLatitude: S.optional(
    makeTypedTag(S.Tuple(S.Tuple(S.Number, S.Number), S.Tuple(S.Number, S.Number), S.Tuple(S.Number, S.Number)))
  ).pipe(S.fromKey("GPSLatitude")),
  gpsLongitudeRef: S.optional(StringArrayTag).pipe(S.fromKey("GPSLongitudeRef")),
  gpsLongitude: S.optional(
    makeTypedTag(S.Tuple(S.Tuple(S.Number, S.Number), S.Tuple(S.Number, S.Number), S.Tuple(S.Number, S.Number)))
  ).pipe(S.fromKey("GPSLongitude")),
  gpsAltitudeRef: S.optional(NumberTag).pipe(S.fromKey("GPSAltitudeRef")),
  gpsAltitude: S.optional(RationalTag).pipe(S.fromKey("GPSAltitude")),
  gpsTimeStamp: S.optional(NumberArrayTag).pipe(S.fromKey("GPSTimeStamp")),
  gpsSatellites: S.optional(StringArrayTag).pipe(S.fromKey("GPSSatellites")),
  gpsStatus: S.optional(StringArrayTag).pipe(S.fromKey("GPSStatus")),
  gpsMeasureMode: S.optional(StringArrayTag).pipe(S.fromKey("GPSMeasureMode")),
  gpsDop: S.optional(NumberTag).pipe(S.fromKey("GPSDOP")),
  gpsSpeedRef: S.optional(StringArrayTag).pipe(S.fromKey("GPSSpeedRef")),
  gpsSpeed: S.optional(NumberTag).pipe(S.fromKey("GPSSpeed")),
  gpsTrackRef: S.optional(StringArrayTag).pipe(S.fromKey("GPSTrackRef")),
  gpsTrack: S.optional(NumberTag).pipe(S.fromKey("GPSTrack")),
  gpsImgDirectionRef: S.optional(StringArrayTag).pipe(S.fromKey("GPSImgDirectionRef")),
  gpsImgDirection: S.optional(RationalTag).pipe(S.fromKey("GPSImgDirection")),
  gpsMapDatum: S.optional(StringArrayTag).pipe(S.fromKey("GPSMapDatum")),
  gpsDestLatitudeRef: S.optional(StringArrayTag).pipe(S.fromKey("GPSDestLatitudeRef")),
  gpsDestLatitude: S.optional(NumberArrayTag).pipe(S.fromKey("GPSDestLatitude")),
  gpsDestLongitudeRef: S.optional(StringArrayTag).pipe(S.fromKey("GPSDestLongitudeRef")),
  gpsDestLongitude: S.optional(NumberArrayTag).pipe(S.fromKey("GPSDestLongitude")),
  gpsDestBearingRef: S.optional(StringArrayTag).pipe(S.fromKey("GPSDestBearingRef")),
  gpsDestBearing: S.optional(NumberTag).pipe(S.fromKey("GPSDestBearing")),
  gpsDestDistanceRef: S.optional(StringArrayTag).pipe(S.fromKey("GPSDestDistanceRef")),
  gpsDestDistance: S.optional(NumberTag).pipe(S.fromKey("GPSDestDistance")),
  gpsProcessingMethod: S.optional(S.Unknown).pipe(S.fromKey("GPSProcessingMethod")),
  gpsAreaInformation: S.optional(S.Unknown).pipe(S.fromKey("GPSAreaInformation")),
  gpsDateStamp: S.optional(StringArrayTag).pipe(S.fromKey("GPSDateStamp")),
  gpsDifferential: S.optional(NumberTag).pipe(S.fromKey("GPSDifferential")),

  // MPF tags
  mpfVersion: S.optional(NumberArrayTag).pipe(S.fromKey("MPFVersion")),
  numberOfImages: S.optional(NumberTag).pipe(S.fromKey("NumberOfImages")),
  mpEntry: S.optional(NumberArrayTag).pipe(S.fromKey("MPEntry")),
  imageUidList: S.optional(NumberArrayTag).pipe(S.fromKey("ImageUIDList")),
  totalFrames: S.optional(NumberTag).pipe(S.fromKey("TotalFrames")),
  images: S.optional(S.Array(MPFImageTags)).pipe(S.fromKey("Images")),

  // IPTC tags
  modelVersion: S.optional(NumberArrayTag).pipe(S.fromKey("Model Version")),
  destination: S.optional(NumberArrayTag).pipe(S.fromKey("Destination")),
  fileFormat: S.optional(NumberArrayTag).pipe(S.fromKey("File Format")),
  fileFormatVersion: S.optional(NumberArrayTag).pipe(S.fromKey("File Format Version")),
  serviceIdentifier: S.optional(NumberArrayTag).pipe(S.fromKey("Service Identifier")),
  envelopeNumber: S.optional(NumberArrayTag).pipe(S.fromKey("Envelope Number")),
  productId: S.optional(NumberArrayTag).pipe(S.fromKey("Product ID")),
  envelopePriority: S.optional(NumberArrayTag).pipe(S.fromKey("Envelope Priority")),
  dateSent: S.optional(NumberArrayTag).pipe(S.fromKey("Date Sent")),
  timeSent: S.optional(NumberArrayTag).pipe(S.fromKey("Time Sent")),
  codedCharacterSet: S.optional(NumberArrayTag).pipe(S.fromKey("Coded Character Set")),
  uno: S.optional(NumberArrayTag).pipe(S.fromKey("UNO")),
  armIdentifier: S.optional(NumberArrayTag).pipe(S.fromKey("ARM Identifier")),
  armVersion: S.optional(NumberArrayTag).pipe(S.fromKey("ARM Version")),
  recordVersion: S.optional(NumberArrayTag).pipe(S.fromKey("Record Version")),
  objectTypeReference: S.optional(NumberArrayTag).pipe(S.fromKey("Object Type Reference")),
  objectAttributeReference: S.optional(NumberArrayTag).pipe(S.fromKey("Object Attribute Reference")),
  objectName: S.optional(NumberArrayTag).pipe(S.fromKey("Object Name")),
  editStatus: S.optional(NumberArrayTag).pipe(S.fromKey("Edit Status")),
  editorialUpdate: S.optional(NumberArrayTag).pipe(S.fromKey("Editorial Update")),
  urgency: S.optional(NumberArrayTag).pipe(S.fromKey("Urgency")),
  subjectReference: S.optional(NumberArrayTag).pipe(S.fromKey("Subject Reference")),
  category: S.optional(NumberArrayTag).pipe(S.fromKey("Category")),
  supplementalCategory: S.optional(NumberArrayTag).pipe(S.fromKey("Supplemental Category")),
  fixtureIdentifier: S.optional(NumberArrayTag).pipe(S.fromKey("Fixture Identifier")),
  keywords: S.optional(S.Union(NumberArrayTag, S.Array(NumberArrayTag))).pipe(S.fromKey("Keywords")),
  contentLocationCode: S.optional(NumberArrayTag).pipe(S.fromKey("Content Location Code")),
  contentLocationName: S.optional(NumberArrayTag).pipe(S.fromKey("Content Location Name")),
  releaseDate: S.optional(NumberArrayTag).pipe(S.fromKey("Release Date")),
  releaseTime: S.optional(NumberArrayTag).pipe(S.fromKey("Release Time")),
  expirationDate: S.optional(NumberArrayTag).pipe(S.fromKey("Expiration Date")),
  expirationTime: S.optional(NumberArrayTag).pipe(S.fromKey("Expiration Time")),
  specialInstructions: S.optional(NumberArrayTag).pipe(S.fromKey("Special Instructions")),
  actionAdvised: S.optional(NumberArrayTag).pipe(S.fromKey("Action Advised")),
  referenceService: S.optional(NumberArrayTag).pipe(S.fromKey("Reference Service")),
  referenceDate: S.optional(NumberArrayTag).pipe(S.fromKey("Reference Date")),
  referenceNumber: S.optional(NumberArrayTag).pipe(S.fromKey("Reference Number")),
  dateCreated: S.optional(NumberArrayTag).pipe(S.fromKey("Date Created")),
  timeCreated: S.optional(NumberArrayTag).pipe(S.fromKey("Time Created")),
  digitalCreationDate: S.optional(NumberArrayTag).pipe(S.fromKey("Digital Creation Date")),
  digitalCreationTime: S.optional(NumberArrayTag).pipe(S.fromKey("Digital Creation Time")),
  originatingProgram: S.optional(NumberArrayTag).pipe(S.fromKey("Originating Program")),
  programVersion: S.optional(NumberArrayTag).pipe(S.fromKey("Program Version")),
  objectCycle: S.optional(NumberArrayTag).pipe(S.fromKey("Object Cycle")),
  byline: S.optional(NumberArrayTag).pipe(S.fromKey("By-line")),
  bylineTitle: S.optional(NumberArrayTag).pipe(S.fromKey("By-line Title")),
  city: S.optional(NumberArrayTag).pipe(S.fromKey("City")),
  subLocation: S.optional(NumberArrayTag).pipe(S.fromKey("Sub-location")),
  provinceState: S.optional(NumberArrayTag).pipe(S.fromKey("Province/State")),
  countryPrimaryLocationCode: S.optional(NumberArrayTag).pipe(S.fromKey("Country/Primary Location Code")),
  countryPrimaryLocationName: S.optional(NumberArrayTag).pipe(S.fromKey("Country/Primary Location Name")),
  originalTransmissionReference: S.optional(NumberArrayTag).pipe(S.fromKey("Original Transmission Reference")),
  headline: S.optional(NumberArrayTag).pipe(S.fromKey("Headline")),
  credit: S.optional(NumberArrayTag).pipe(S.fromKey("Credit")),
  source: S.optional(NumberArrayTag).pipe(S.fromKey("Source")),
  copyrightNotice: S.optional(NumberArrayTag).pipe(S.fromKey("Copyright Notice")),
  contact: S.optional(NumberArrayTag).pipe(S.fromKey("Contact")),
  captionAbstract: S.optional(NumberArrayTag).pipe(S.fromKey("Caption/Abstract")),
  writerEditor: S.optional(NumberArrayTag).pipe(S.fromKey("Writer/Editor")),
  rasterizedCaption: S.optional(NumberArrayTag).pipe(S.fromKey("Rasterized Caption")),
  imageType: S.optional(NumberArrayTag).pipe(S.fromKey("Image Type")),
  imageOrientation: S.optional(NumberArrayTag).pipe(S.fromKey("Image Orientation")),
  languageIdentifier: S.optional(NumberArrayTag).pipe(S.fromKey("Language Identifier")),
  audioType: S.optional(NumberArrayTag).pipe(S.fromKey("Audio Type")),
  audioSamplingRate: S.optional(NumberArrayTag).pipe(S.fromKey("Audio Sampling Rate")),
  audioSamplingResolution: S.optional(NumberArrayTag).pipe(S.fromKey("Audio Sampling Resolution")),
  audioDuration: S.optional(NumberArrayTag).pipe(S.fromKey("Audio Duration")),
  audioOutcue: S.optional(NumberArrayTag).pipe(S.fromKey("Audio Outcue")),
  shortDocumentId: S.optional(NumberArrayTag).pipe(S.fromKey("Short Document ID")),
  uniqueDocumentId: S.optional(NumberArrayTag).pipe(S.fromKey("Unique Document ID")),
  ownerId: S.optional(NumberArrayTag).pipe(S.fromKey("Owner ID")),
  objectDataPreviewFileFormat: S.optional(NumberArrayTag).pipe(S.fromKey("ObjectData Preview File Format")),
  record2Destination: S.optional(NumberArrayTag).pipe(S.fromKey("Record 2 destination")),
  objectDataPreviewFileFormatVersion: S.optional(NumberArrayTag).pipe(
    S.fromKey("ObjectData Preview File Format Version")
  ),
  objectDataPreviewData: S.optional(NumberArrayTag).pipe(S.fromKey("ObjectData Preview Data")),
  sizeMode: S.optional(NumberArrayTag).pipe(S.fromKey("Size Mode")),
  maxSubfileSize: S.optional(NumberArrayTag).pipe(S.fromKey("Max Subfile Size")),
  objectDataSizeAnnounced: S.optional(NumberArrayTag).pipe(S.fromKey("ObjectData Size Announced")),
  maximumObjectDataSize: S.optional(NumberArrayTag).pipe(S.fromKey("Maximum ObjectData Size")),

  thumbnail: S.optional(ThumbnailTags).pipe(S.fromKey("Thumbnail")),
});

// Main expanded tags structure
export const ExpandedTags = S.Struct({
  file: S.optional(FileTags),
  jfif: S.optional(JfifTags),
  pngFile: S.optional(PngFileTags),
  pngText: S.optional(PngTextTags),
  png: S.optional(PngTags),
  exif: S.optional(ExifTags),
  iptc: S.optional(ExifTags),
  xmp: S.optional(
    S.Union(
      Json,
      S.Struct(
        {
          _raw: S.String,
        },
        S.Record({ key: S.String, value: XmpTag })
      ),
      S.String
    )
  ), // _raw field combined with dynamic XmpTag fields
  icc: S.optional(IccTags),
  riff: S.optional(RiffTags),
  gif: S.optional(GifTags),
  Thumbnail: S.optional(ThumbnailTags),
  gps: S.optional(GpsTags),
  photoshop: S.optional(PhotoshopTags),
  makerNotes: S.optional(
    S.Struct({
      ...CanonTags.fields,
      ...PentaxTags.fields,
    })
  ),
  composite: S.optional(CompositeTags),
});

export const ExifMetadataFromString = S.transformOrFail(S.String, ExpandedTags, {
  strict: true,
  decode: (i, _, ast) => {
    try {
      return ParseResult.succeed(S.encodeSync(ExpandedTags)(JSON.parse(i)));
    } catch (e) {
      return ParseResult.fail(new ParseResult.Type(ast, i, "Invalid JSON string"));
    }
  },
  encode: (i, _, ast) => {
    try {
      return ParseResult.succeed(JSON.stringify(i));
    } catch (e) {
      return ParseResult.fail(new ParseResult.Type(ast, i, "Invalid JSON string"));
    }
  },
});

// Combined tags type
export const Tags = S.Struct({
  ...XmpTags.fields,
  ...IccTags.fields,
  ...PngTags.fields,
  ...RiffTags.fields,
  ...GifTags.fields,
  ...PhotoshopTags.fields,
  ...CanonTags.fields,
  ...PentaxTags.fields,
  ...CompositeTags.fields,
  Thumbnail: S.optional(ThumbnailTags),
  Images: S.optional(S.Array(MPFImageTags)),
});

// Export type helpers
export type ExpandedTagsType = S.Schema.Type<typeof ExpandedTags>;
export type TagsType = S.Schema.Type<typeof Tags>;
export type ExifTagsType = S.Schema.Type<typeof ExifTags>;

/**
 * Utility functions for processing EXIF data
 */

/**
 * Fields that typically contain large binary data or images that should be omitted
 * to reduce payload size and improve performance
 */
const LARGE_DATA_FIELDS = [
  "base64",
  "image",
  "thumbnail",
  "thumbnailImage",
  "preview",
  "previewImage",
  "rawImage",
  "blob",
  "buffer",
  "data",
  "binaryData",
  "iccProfile",
  "colorProfile",
  "embeddedImage",
  "makerNoteImage",
] as const;

/**
 * Check if a field name indicates it contains large data
 */
const isLargeDataField = (key: string): boolean => {
  const lowerKey = key.toLowerCase();
  return LARGE_DATA_FIELDS.some(
    (field) =>
      lowerKey.includes(field.toLowerCase()) ||
      lowerKey.endsWith("image") ||
      lowerKey.endsWith("thumbnail") ||
      lowerKey.includes("base64")
  );
};

/**
 * Check if a value appears to be large binary data
 */
const isLargeDataValue = (value: unknown): boolean => {
  if (value instanceof ArrayBuffer || value instanceof Uint8Array) {
    return value.byteLength > 1024; // > 1KB
  }

  if (typeof value === "string") {
    // Base64 encoded data or very long strings
    return value.length > 1024 || (/^[A-Za-z0-9+/]+=*$/.test(value) && value.length > 100);
  }

  return false;
};

/**
 * Recursively omit large data fields from an object
 */
const omitLargeDataFromObject = <T extends Record<string, UnsafeTypes.UnsafeAny>>(obj: T): T => {
  const result: Record<string, UnsafeTypes.UnsafeAny> = {};

  for (const [key, value] of Object.entries(obj)) {
    // Skip if field name indicates large data
    if (isLargeDataField(key)) {
      continue;
    }

    // Skip if value appears to be large binary data
    if (isLargeDataValue(value)) {
      continue;
    }

    // Recursively process nested objects
    if (value && typeof value === "object" && !Array.isArray(value)) {
      result[key] = omitLargeDataFromObject(value);
    } else if (Array.isArray(value)) {
      // Process arrays, filtering out large data items
      result[key] = value
        .filter((item) => !isLargeDataValue(item))
        .map((item) =>
          item && typeof item === "object" && !Array.isArray(item) ? omitLargeDataFromObject(item) : item
        );
    } else {
      result[key] = value;
    }
  }

  return result as T;
};

/**
 * Clean EXIF data by removing large binary fields like base64, images, etc.
 * This is useful for reducing payload size when storing or transmitting EXIF metadata.
 *
 * @param exifData - Raw EXIF data from ExifReader
 * @returns Cleaned EXIF data with large binary fields removed
 *
 * @example
 * ```typescript
 * const rawExif = ExifReader.load(imagePath, { expanded: true });
 * const cleanExif = cleanExifData(rawExif);
 * const validated = yield* S.decode(ExpandedTags)(cleanExif);
 * ```
 */
export const cleanExifData = <T extends Record<string, UnsafeTypes.UnsafeAny>>(exifData: T): T => {
  if (!exifData || typeof exifData !== "object") {
    return exifData;
  }

  return omitLargeDataFromObject(exifData);
};

/**
 * Clean specific known large fields from EXIF data using Effect's Struct.omit
 * This is a more targeted approach for known problematic fields.
 *
 * @param exifData - Raw EXIF data from ExifReader
 * @returns EXIF data with specific large fields omitted
 */
export const omitKnownLargeFields = <T extends Record<string, UnsafeTypes.UnsafeAny>>(exifData: T): T => {
  let cleaned = { ...exifData };

  // Clean ICC profile
  if (P.isNotNullable(cleaned.icc) && typeof cleaned.icc === "object") {
    cleaned = {
      ...cleaned,
      icc: Struct.omit("base64", "data", "buffer")(cleaned.icc),
    };
  }

  // Clean XMP data
  if (P.isNotNullable(cleaned.xmp) && typeof cleaned.xmp === "object") {
    cleaned = {
      ...cleaned,
      xmp: Struct.omit("base64", "rawXml", "data")(cleaned.xmp),
    };
  }

  // Clean IPTC data
  if (P.isNotNullable(cleaned.iptc) && typeof cleaned.iptc === "object") {
    cleaned = {
      ...cleaned,
      iptc: Struct.omit("base64", "data", "buffer")(cleaned.iptc),
    };
  }

  // Clean thumbnail data
  if (P.isNotNullable(cleaned.thumbnail) && typeof cleaned.thumbnail === "object") {
    cleaned = {
      ...cleaned,
      thumbnail: Struct.omit("image", "base64", "blob", "buffer")(cleaned.thumbnail),
    };
  }

  // Clean EXIF data recursively for nested structures
  if (P.isNotNullable(cleaned.exif) && typeof cleaned.exif === "object") {
    const exifCleaned = omitLargeDataFromObject(cleaned.exif);
    cleaned = { ...cleaned, exif: exifCleaned };
  }

  return cleaned;
};
