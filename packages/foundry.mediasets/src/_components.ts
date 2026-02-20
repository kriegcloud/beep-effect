/*
 * Copyright 2024 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type * as _Core from "@osdk/foundry.core";

export type LooselyBrandedString<T extends string> = string & {
  __LOOSE_BRAND?: T;
};

/**
 * An affine transformation for geo-referencing.
 *
 * Log Safety: SAFE
 */
export interface AffineTransform {
  xTranslate?: number;
  xScale?: number;
  xShear?: number;
  yTranslate?: number;
  yShear?: number;
  yScale?: number;
}

/**
 * The geometry for an annotation.
 *
 * Log Safety: UNSAFE
 */
export type AnnotateGeometry = { type: "boundingBox" } & BoundingBoxGeometry;

/**
 * Annotates an image with bounding boxes, labels, and colors.
 *
 * Log Safety: UNSAFE
 */
export interface AnnotateImageOperation {
  annotations: Array<Annotation>;
}

/**
 * An annotation to draw on an image.
 *
 * Log Safety: UNSAFE
 */
export interface Annotation {
  geometry: AnnotateGeometry;
  label?: string;
  color?: Color;
  thickness?: number;
  fontSize?: number;
}

/**
 * The output format for encoding archives.
 *
 * Log Safety: UNSAFE
 */
export type ArchiveEncodeFormat = { type: "tar" } & TarFormat;

/**
 * The audio channel layout configuration.
 *
 * Log Safety: UNSAFE
 */
export type AudioChannelLayout = {
  type: "numberOfChannels";
} & NumberOfChannels;

/**
 * Selects a specific channel from multi-channel audio.
 *
 * Log Safety: UNSAFE
 */
export interface AudioChannelOperation {
  encodeFormat: AudioEncodeFormat;
  channel: number;
}

/**
 * Chunks audio into smaller segments of the specified duration.
 *
 * Log Safety: UNSAFE
 */
export interface AudioChunkOperation {
  chunkDurationMilliseconds: number;
  encodeFormat: AudioEncodeFormat;
  chunkIndex: number;
}

/**
 * The format of an audio media item.
 *
 * Log Safety: SAFE
 */
export type AudioDecodeFormat =
  | "FLAC"
  | "MP2"
  | "MP3"
  | "MP4"
  | "NIST_SPHERE"
  | "OGG"
  | "WAV"
  | "WEBM";

/**
 * The output format for encoding audio.
 *
 * Log Safety: UNSAFE
 */
export type AudioEncodeFormat =
  | ({ type: "mp3" } & Mp3Format)
  | ({ type: "wav" } & WavEncodeFormat)
  | ({ type: "ts" } & TsAudioContainerFormat);

/**
 * Metadata for audio media items.
 *
 * Log Safety: SAFE
 */
export interface AudioMediaItemMetadata {
  format: AudioDecodeFormat;
  specification: AudioSpecification;
  sizeBytes: number;
}

/**
 * The operation to perform on audio.
 *
 * Log Safety: UNSAFE
 */
export type AudioOperation =
  | ({ type: "channel" } & AudioChannelOperation)
  | ({ type: "chunk" } & AudioChunkOperation)
  | ({ type: "convert" } & ConvertAudioOperation);

/**
 * Technical specifications for audio media items.
 *
 * Log Safety: SAFE
 */
export interface AudioSpecification {
  bitRate: number;
  durationSeconds: number;
  numberOfChannels?: number;
}

/**
 * The operation to perform for audio to text conversion.
 *
 * Log Safety: UNSAFE
 */
export type AudioToTextOperation =
  | ({ type: "transcribe" } & TranscribeOperation)
  | ({ type: "waveform" } & WaveformOperation);

/**
 * Converts audio to text.
 *
 * Log Safety: UNSAFE
 */
export interface AudioToTextTransformation {
  operation: AudioToTextOperation;
}

/**
 * Transforms audio media items.
 *
 * Log Safety: UNSAFE
 */
export interface AudioTransformation {
  operation: AudioOperation;
}

/**
 * Available embedding models that can be used with the service.
 *
 * Log Safety: SAFE
 */
export type AvailableEmbeddingModelIds = "GOOGLE_SIGLIP_2";

/**
 * Information about a band in an image.
 *
 * Log Safety: UNSAFE
 */
export interface BandInfo {
  dataType?: DataType;
  colorInterpretation?: ColorInterpretation;
  paletteInterpretation?: PaletteInterpretation;
  unitInterpretation?: UnitInterpretation;
}

/**
 * A rectangular bounding box for annotations.
 *
 * Log Safety: SAFE
 */
export interface BoundingBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * A rectangular bounding box geometry for annotations.
 *
 * Log Safety: SAFE
 */
export interface BoundingBoxGeometry {
  boundingBox: BoundingBox;
}

/**
   * A name for a media set branch. Valid branch names must be (a) non-empty, (b) less than 256 characters, and
(c) not a valid ResourceIdentifier.
   *
   * Log Safety: UNSAFE
   */
export type BranchName = LooselyBrandedString<"BranchName">;

/**
 * A resource identifier that identifies a branch of a media set.
 *
 * Log Safety: SAFE
 */
export type BranchRid = LooselyBrandedString<"BranchRid">;

/**
 * An RGBA color value.
 *
 * Log Safety: SAFE
 */
export interface Color {
  r: number;
  g: number;
  b: number;
  a?: number;
}

/**
 * The color interpretation of a band.
 *
 * Log Safety: SAFE
 */
export type ColorInterpretation =
  | "UNDEFINED"
  | "GRAY"
  | "PALETTE_INDEX"
  | "RED"
  | "GREEN"
  | "BLUE"
  | "ALPHA"
  | "HUE"
  | "SATURATION"
  | "LIGHTNESS"
  | "CYAN"
  | "MAGENTA"
  | "YELLOW"
  | "BLACK"
  | "Y_CB_CR_SPACE_Y"
  | "Y_CB_CR_SPACE_CB"
  | "Y_CB_CR_SPACE_CR";

/**
 * Common DICOM data elements.
 *
 * Log Safety: UNSAFE
 */
export interface CommonDicomDataElements {
  numberFrames?: number;
  modality?: Modality;
  patientId?: string;
  studyId?: string;
  studyUid?: string;
  seriesUid?: string;
  studyTime?: string;
  seriesTime?: string;
}

/**
 * Binarize contrast operation.
 *
 * Log Safety: SAFE
 */
export interface ContrastBinarize {
  threshold?: number;
}

/**
 * Equalizes the histogram of an image to improve contrast.
 *
 * Log Safety: SAFE
 */
export interface ContrastEqualize {}

/**
 * Applies contrast adjustments to an image.
 *
 * Log Safety: UNSAFE
 */
export interface ContrastImageOperation {
  contrastType: ContrastType;
}

/**
 * Applies Rayleigh distribution-based contrast adjustment.
 *
 * Log Safety: SAFE
 */
export interface ContrastRayleigh {
  sigma: number;
}

/**
 * The type of contrast adjustment to apply.
 *
 * Log Safety: UNSAFE
 */
export type ContrastType =
  | ({ type: "equalize" } & ContrastEqualize)
  | ({ type: "rayleigh" } & ContrastRayleigh)
  | ({ type: "binarize" } & ContrastBinarize);

/**
 * Converts audio to the specified format.
 *
 * Log Safety: UNSAFE
 */
export interface ConvertAudioOperation {
  encodeFormat: AudioEncodeFormat;
}

/**
 * Converts a document to PDF format.
 *
 * Log Safety: SAFE
 */
export interface ConvertDocumentOperation {}

/**
 * Converts a specified sheet to JSON format.
 *
 * Log Safety: UNSAFE
 */
export interface ConvertSheetToJsonOperation {
  sheetName: string;
}

/**
 * The coordinate reference system for geo-referenced imagery.
 *
 * Log Safety: UNSAFE
 */
export interface CoordinateReferenceSystem {
  wkt?: string;
}

/**
 * Converts an image to a PDF document.
 *
 * Log Safety: SAFE
 */
export interface CreatePdfOperation {}

/**
 * Crops an image to a rectangular sub-window.
 *
 * Log Safety: UNSAFE
 */
export interface CropImageOperation {
  xOffset: number;
  yOffset: number;
  width: number;
  height: number;
}

/**
 * The data type of a band.
 *
 * Log Safety: SAFE
 */
export type DataType =
  | "UNDEFINED"
  | "BYTE"
  | "UINT16"
  | "INT16"
  | "UINT32"
  | "INT32"
  | "FLOAT32"
  | "FLOAT64"
  | "COMPLEX_INT16"
  | "COMPLEX_INT32"
  | "COMPLEX_FLOAT32"
  | "COMPLEX_FLOAT64"
  | "UINT64"
  | "INT64"
  | "INT8";

/**
 * Decrypts bounding boxes in an image using a commutative encryption algorithm.
 *
 * Log Safety: SAFE
 */
export interface DecryptImageOperation {
  polygons: Array<ImageRegionPolygon>;
  cipherLicenseRid: string;
}

/**
 * The key of a DICOM data element.
 *
 * Log Safety: UNSAFE
 */
export type DicomDataElementKey = LooselyBrandedString<"DicomDataElementKey">;

/**
 * Metadata for DICOM (Digital Imaging and Communications in Medicine) media items.
 *
 * Log Safety: UNSAFE
 */
export interface DicomMediaItemMetadata {
  metaInformation: DicomMetaInformation;
  mediaType: DicomMediaType;
  commonDataElements: CommonDicomDataElements;
  otherDataElements: Record<DicomDataElementKey, any>;
  sizeBytes: number;
}

/**
 * The type of DICOM media.
 *
 * Log Safety: SAFE
 */
export type DicomMediaType =
  | "IMAGE"
  | "MULTI_FRAME_IMAGE"
  | "VIDEO"
  | "STRUCTURED_REPORT";

/**
 * DICOM meta information.
 *
 * Log Safety: UNSAFE
 */
export type DicomMetaInformation = { type: "v1" } & DicomMetaInformationV1;

/**
 * DICOM meta information version 1.
 *
 * Log Safety: UNSAFE
 */
export interface DicomMetaInformationV1 {
  mediaStorageSop: string;
  mediaStorageSopInstance: string;
  transferSyntax: string;
}

/**
 * The operation to perform for DICOM to image conversion.
 *
 * Log Safety: UNSAFE
 */
export type DicomToImageOperation = {
  type: "renderImageLayer";
} & RenderImageLayerOperation;

/**
 * Renders DICOM (Digital Imaging and Communications in Medicine) files as images.
 *
 * Log Safety: UNSAFE
 */
export interface DicomToImageTransformation {
  encoding: ImageryEncodeFormat;
  operation: DicomToImageOperation;
}

/**
 * The dimensions of an image.
 *
 * Log Safety: SAFE
 */
export interface Dimensions {
  width: number;
  height: number;
}

/**
 * The format of a document media item.
 *
 * Log Safety: SAFE
 */
export type DocumentDecodeFormat = "PDF" | "DOCX" | "TXT" | "PPTX";

/**
 * The output format for encoding documents.
 *
 * Log Safety: UNSAFE
 */
export type DocumentEncodeFormat = { type: "pdf" } & PdfFormat;

/**
 * Extracts content from a document with layout information preserved.
 *
 * Log Safety: SAFE
 */
export interface DocumentExtractLayoutAwareContentOperation {
  parameters: LayoutAwareExtractionParameters;
}

/**
 * Metadata for document media items.
 *
 * Log Safety: UNSAFE
 */
export interface DocumentMediaItemMetadata {
  format: DocumentDecodeFormat;
  pages?: number;
  sizeBytes: number;
  title?: string;
  author?: string;
}

/**
 * The operation to perform for document to document conversion.
 *
 * Log Safety: UNSAFE
 */
export type DocumentToDocumentOperation =
  | ({ type: "slicePdfRange" } & SlicePdfRangeOperation)
  | ({ type: "convertDocument" } & ConvertDocumentOperation);

/**
 * Transforms documents to documents.
 *
 * Log Safety: UNSAFE
 */
export interface DocumentToDocumentTransformation {
  encoding: DocumentEncodeFormat;
  operation: DocumentToDocumentOperation;
}

/**
 * The operation to perform for document to image conversion.
 *
 * Log Safety: UNSAFE
 */
export type DocumentToImageOperation =
  | ({
    type: "renderPageToFitBoundingBox";
  } & RenderPageToFitBoundingBoxOperation)
  | ({ type: "renderPage" } & RenderPageOperation);

/**
 * Renders document pages as images.
 *
 * Log Safety: UNSAFE
 */
export interface DocumentToImageTransformation {
  encoding: ImageryEncodeFormat;
  operation: DocumentToImageOperation;
}

/**
 * The operation to perform for document to text conversion.
 *
 * Log Safety: UNSAFE
 */
export type DocumentToTextOperation =
  | ({ type: "extractTableOfContents" } & ExtractTableOfContentsOperation)
  | ({ type: "getPdfPageDimensions" } & GetPdfPageDimensionsOperation)
  | ({ type: "extractAllText" } & ExtractAllTextOperation)
  | ({
    type: "extractTextFromPagesToArray";
  } & ExtractTextFromPagesToArrayOperation)
  | ({ type: "ocrOnPage" } & OcrOnPageOperation)
  | ({ type: "extractFormFields" } & ExtractFormFieldsOperation)
  | ({
    type: "extractUnstructuredTextFromPage";
  } & ExtractUnstructuredTextFromPageOperation)
  | ({
    type: "extractLayoutAwareContent";
  } & DocumentExtractLayoutAwareContentOperation)
  | ({ type: "ocrOnPages" } & OcrOnPagesOperation);

/**
 * Extracts text from documents.
 *
 * Log Safety: UNSAFE
 */
export interface DocumentToTextTransformation {
  operation: DocumentToTextOperation;
}

/**
 * Metadata about an email attachment.
 *
 * Log Safety: UNSAFE
 */
export interface EmailAttachment {
  attachmentIndex: number;
  fileName?: string;
  mimeType: string;
}

/**
 * The format of an email media item.
 *
 * Log Safety: SAFE
 */
export type EmailDecodeFormat = "EML";

/**
 * Metadata for email media items.
 *
 * Log Safety: UNSAFE
 */
export interface EmailMediaItemMetadata {
  format: EmailDecodeFormat;
  sizeBytes: number;
  sender: Array<Mailbox>;
  date: string;
  attachmentCount: number;
  to: Array<MailboxOrGroup>;
  cc: Array<MailboxOrGroup>;
  subject?: string;
  attachments: Array<EmailAttachment>;
}

/**
 * The operation to perform for email to attachment extraction.
 *
 * Log Safety: UNSAFE
 */
export type EmailToAttachmentOperation = {
  type: "getEmailAttachment";
} & GetEmailAttachmentOperation;

/**
 * Extracts attachments from email.
 *
 * Log Safety: UNSAFE
 */
export interface EmailToAttachmentTransformation {
  operation: EmailToAttachmentOperation;
}

/**
 * The output format for email body extraction.
 *
 * Log Safety: SAFE
 */
export type EmailToTextEncodeFormat = "TEXT" | "HTML";

/**
 * The operation to perform for email to text extraction.
 *
 * Log Safety: UNSAFE
 */
export type EmailToTextOperation = {
  type: "getEmailBody";
} & GetEmailBodyOperation;

/**
 * Extracts text content from email.
 *
 * Log Safety: UNSAFE
 */
export interface EmailToTextTransformation {
  operation: EmailToTextOperation;
}

/**
 * Encrypts bounding boxes in an image using a commutative encryption algorithm.
 *
 * Log Safety: SAFE
 */
export interface EncryptImageOperation {
  polygons: Array<ImageRegionPolygon>;
  cipherLicenseRid: string;
}

/**
   * Extracts text across all pages of the document.
For PDF documents, includes all text. For DocX documents, includes only regular paragraphs.
   *
   * Log Safety: SAFE
   */
export interface ExtractAllTextOperation {}

/**
 * Extracts the first audio stream from the video unchanged.
 *
 * Log Safety: SAFE
 */
export interface ExtractAudioOperation {}

/**
   * Extracts the first full scene frame from the video.
If both width and height are not specified, preserves the original size.
If only one dimension is specified, the other is calculated to preserve aspect ratio.
   *
   * Log Safety: SAFE
   */
export interface ExtractFirstFrameOperation {
  height?: number;
  width?: number;
}

/**
 * Extracts form field data from a PDF document.
 *
 * Log Safety: SAFE
 */
export interface ExtractFormFieldsOperation {}

/**
   * Extracts frames from the video at specified timestamps.
If only one dimension is specified, the other is calculated to preserve aspect ratio.
   *
   * Log Safety: UNSAFE
   */
export interface ExtractFramesAtTimestampsOperation {
  height?: number;
  width?: number;
  timestamp: number;
}

/**
 * Extracts all scene frames from a video as images in an archive.
 *
 * Log Safety: UNSAFE
 */
export interface ExtractSceneFramesOperation {
  encoding: ImageryEncodeFormat;
  sceneScore?: SceneScore;
}

/**
 * Extracts the table of contents from a document.
 *
 * Log Safety: SAFE
 */
export interface ExtractTableOfContentsOperation {}

/**
 * Extracts text from multiple pages into a list of strings.
 *
 * Log Safety: SAFE
 */
export interface ExtractTextFromPagesToArrayOperation {
  startPage?: number;
  endPage?: number;
}

/**
 * Extracts unstructured text from a specified page.
 *
 * Log Safety: UNSAFE
 */
export interface ExtractUnstructuredTextFromPageOperation {
  pageNumber: number;
}

/**
 * The flip axis from EXIF orientation.
 *
 * Log Safety: SAFE
 */
export type FlipAxis = "HORIZONTAL" | "VERTICAL" | "UNKNOWN";

/**
 * A list of ground control points for geo-referencing.
 *
 * Log Safety: SAFE
 */
export interface GcpList {
  gcps: Array<GroundControlPoint>;
}

/**
 * Generates a vector embedding for an image using the specified model.
 *
 * Log Safety: SAFE
 */
export interface GenerateEmbeddingOperation {
  modelId: AvailableEmbeddingModelIds;
}

/**
 * Embedded geo-referencing data for an image.
 *
 * Log Safety: UNSAFE
 */
export interface GeoMetadata {
  crs?: CoordinateReferenceSystem;
  geotransform?: AffineTransform;
  gcpInfo?: GcpList;
  gpsData?: GpsMetadata;
}

/**
 * Retrieves the bytes of an email attachment by index.
 *
 * Log Safety: UNSAFE
 */
export interface GetEmailAttachmentOperation {
  mimeType: string;
  attachmentIndex: number;
}

/**
 * Gets the email body in the specified format.
 *
 * Log Safety: SAFE
 */
export interface GetEmailBodyOperation {
  outputFormat: EmailToTextEncodeFormat;
}

/**
 * Log Safety: UNSAFE
 */
export interface GetMediaItemInfoResponse {
  viewRid: _Core.MediaSetViewRid;
  path?: _Core.MediaItemPath;
  logicalTimestamp: LogicalTimestamp;
  attribution?: MediaAttribution;
}

/**
 * Log Safety: SAFE
 */
export interface GetMediaItemRidByPathResponse {
  mediaItemRid?: _Core.MediaItemRid;
}

/**
 * Returns the dimensions of each page in a PDF document as JSON (in points).
 *
 * Log Safety: SAFE
 */
export interface GetPdfPageDimensionsOperation {}

/**
 * Returns a list of timestamps for scene frames in the video as JSON.
 *
 * Log Safety: SAFE
 */
export interface GetTimestampsForSceneFramesOperation {
  sceneScore?: SceneScore;
}

/**
 * Response containing the status of a transformation job.
 *
 * Log Safety: UNSAFE
 */
export interface GetTransformationJobStatusResponse {
  status: TransformationJobStatus;
  jobId: TransformationJobId;
}

/**
 * GPS location metadata extracted from EXIF data embedded in the image.
 *
 * Log Safety: UNSAFE
 */
export interface GpsMetadata {
  latitude?: number;
  longitude?: number;
  altitude?: number;
}

/**
 * Converts an image to grayscale.
 *
 * Log Safety: SAFE
 */
export interface GrayscaleImageOperation {}

/**
 * A ground control point for geo-referencing.
 *
 * Log Safety: SAFE
 */
export interface GroundControlPoint {
  pixX?: number;
  pixY?: number;
  projX?: number;
  projY?: number;
  projZ?: number;
}

/**
 * A named group of mailboxes.
 *
 * Log Safety: UNSAFE
 */
export interface Group {
  groupName: string;
  mailboxes: Array<Mailbox>;
}

/**
 * A wrapper for a group in the MailboxOrGroup union.
 *
 * Log Safety: UNSAFE
 */
export interface GroupWrapper {
  group: Group;
}

/**
 * The domain of an image attribute.
 *
 * Log Safety: UNSAFE
 */
export type ImageAttributeDomain = LooselyBrandedString<"ImageAttributeDomain">;

/**
 * The key of an image attribute within a domain.
 *
 * Log Safety: UNSAFE
 */
export type ImageAttributeKey = LooselyBrandedString<"ImageAttributeKey">;

/**
 * Extracts text from an image with layout information preserved.
 *
 * Log Safety: SAFE
 */
export interface ImageExtractLayoutAwareContentOperation {
  parameters: LayoutAwareExtractionParameters;
}

/**
 * Performs OCR (Optical Character Recognition) on an image.
 *
 * Log Safety: UNSAFE
 */
export interface ImageOcrOperation {
  parameters: OcrParameters;
}

/**
 * An operation to perform on an image.
 *
 * Log Safety: UNSAFE
 */
export type ImageOperation =
  | ({ type: "rotate" } & RotateImageOperation)
  | ({ type: "resizeToFitBoundingBox" } & ResizeToFitBoundingBoxOperation)
  | ({ type: "encrypt" } & EncryptImageOperation)
  | ({ type: "contrast" } & ContrastImageOperation)
  | ({ type: "tile" } & TileImageOperation)
  | ({ type: "resize" } & ResizeImageOperation)
  | ({ type: "annotate" } & AnnotateImageOperation)
  | ({ type: "decrypt" } & DecryptImageOperation)
  | ({ type: "crop" } & CropImageOperation)
  | ({ type: "grayscale" } & GrayscaleImageOperation);

/**
 * Coordinate of a pixel in an image (x, y). Top left corner of the image is (0, 0).
 *
 * Log Safety: SAFE
 */
export interface ImagePixelCoordinate {
  x: number;
  y: number;
}

/**
   * Polygon drawn by connecting adjacent coordinates in the list with straight lines.
A line is drawn between the last and first coordinates in the list to create a closed shape.
Used to define regions in an image for operations like encryption/decryption.
   *
   * Log Safety: SAFE
   */
export type ImageRegionPolygon = Array<ImagePixelCoordinate>;

/**
 * The format of an imagery media item.
 *
 * Log Safety: SAFE
 */
export type ImageryDecodeFormat =
  | "BMP"
  | "TIFF"
  | "NITF"
  | "JP2K"
  | "JPG"
  | "PNG"
  | "WEBP";

/**
 * The output format for encoding imagery.
 *
 * Log Safety: UNSAFE
 */
export type ImageryEncodeFormat =
  | ({ type: "jpg" } & JpgFormat)
  | ({ type: "tiff" } & TiffFormat)
  | ({ type: "png" } & PngFormat)
  | ({ type: "webp" } & WebpFormat);

/**
 * Metadata for imagery (image) media items.
 *
 * Log Safety: UNSAFE
 */
export interface ImageryMediaItemMetadata {
  format: ImageryDecodeFormat;
  dimensions?: Dimensions;
  bands: Array<BandInfo>;
  attributes: Record<ImageAttributeDomain, Record<ImageAttributeKey, string>>;
  iccProfile?: string;
  geo?: GeoMetadata;
  pages?: number;
  orientation?: Orientation;
  sizeBytes: number;
}

/**
 * The operation to perform for image to document conversion.
 *
 * Log Safety: UNSAFE
 */
export type ImageToDocumentOperation = {
  type: "createPdf";
} & CreatePdfOperation;

/**
 * Converts images to documents.
 *
 * Log Safety: UNSAFE
 */
export interface ImageToDocumentTransformation {
  operation: ImageToDocumentOperation;
}

/**
 * The operation to perform for image to embedding conversion.
 *
 * Log Safety: UNSAFE
 */
export type ImageToEmbeddingOperation = {
  type: "generateEmbedding";
} & GenerateEmbeddingOperation;

/**
 * Generates embeddings from images.
 *
 * Log Safety: UNSAFE
 */
export interface ImageToEmbeddingTransformation {
  operation: ImageToEmbeddingOperation;
}

/**
 * The operation to perform for image to text conversion.
 *
 * Log Safety: UNSAFE
 */
export type ImageToTextOperation =
  | ({
    type: "extractLayoutAwareContent";
  } & ImageExtractLayoutAwareContentOperation)
  | ({ type: "ocr" } & ImageOcrOperation);

/**
 * Extracts text from images.
 *
 * Log Safety: UNSAFE
 */
export interface ImageToTextTransformation {
  operation: ImageToTextOperation;
}

/**
   * Transforms images with multiple operations applied in sequence.
Operations are applied in the order they appear in the list.
   *
   * Log Safety: UNSAFE
   */
export interface ImageTransformation {
  encoding: ImageryEncodeFormat;
  operations: Array<ImageOperation>;
}

/**
 * JPEG image format.
 *
 * Log Safety: SAFE
 */
export interface JpgFormat {}

/**
 * Parameters for layout-aware content extraction.
 *
 * Log Safety: SAFE
 */
export interface LayoutAwareExtractionParameters {
  languages: Array<OcrLanguage>;
}

/**
   * A number representing a logical ordering to be used for transactions, etc.
This can be interpreted as a timestamp in microseconds, but may differ slightly from system clock time due
to clock drift and slight adjustments for the sake of ordering.
Only positive timestamps (representing times after epoch) are supported.
   *
   * Log Safety: SAFE
   */
export type LogicalTimestamp = string;

/**
 * An email mailbox with an optional display name and email address.
 *
 * Log Safety: UNSAFE
 */
export interface Mailbox {
  displayName?: string;
  emailAddress: string;
}

/**
 * Either a mailbox or a group of mailboxes.
 *
 * Log Safety: UNSAFE
 */
export type MailboxOrGroup =
  | ({ type: "mailbox" } & MailboxWrapper)
  | ({ type: "group" } & GroupWrapper);

/**
 * A wrapper for a mailbox in the MailboxOrGroup union.
 *
 * Log Safety: UNSAFE
 */
export interface MailboxWrapper {
  mailbox: Mailbox;
}

/**
 * Log Safety: SAFE
 */
export interface MediaAttribution {
  creatorId: _Core.UserId;
  creationTimestamp: string;
}

/**
   * Detailed metadata about a media item, including type-specific information such as dimensions for images,
duration for audio/video, page count for documents, etc.
   *
   * Log Safety: UNSAFE
   */
export type MediaItemMetadata =
  | ({ type: "document" } & DocumentMediaItemMetadata)
  | ({ type: "imagery" } & ImageryMediaItemMetadata)
  | ({ type: "spreadsheet" } & SpreadsheetMediaItemMetadata)
  | ({ type: "untyped" } & UntypedMediaItemMetadata)
  | ({ type: "audio" } & AudioMediaItemMetadata)
  | ({ type: "model3d" } & Model3dMediaItemMetadata)
  | ({ type: "video" } & VideoMediaItemMetadata)
  | ({ type: "dicom" } & DicomMediaItemMetadata)
  | ({ type: "email" } & EmailMediaItemMetadata);

/**
 * Format of the media item attempted to be decoded based on the XML structure.
 *
 * Log Safety: SAFE
 */
export type MediaItemXmlFormat = "DOCX" | "XLSX" | "PPTX";

/**
 * Log Safety: UNSAFE
 */
export interface MediaSet {
  rid: _Core.MediaSetRid;
  name: MediaSetName;
  parentFolderRid: _Core.FolderRid;
}

/**
 * Log Safety: UNSAFE
 */
export type MediaSetName = LooselyBrandedString<"MediaSetName">;

/**
 * MKV (Matroska) video container format.
 *
 * Log Safety: SAFE
 */
export interface MkvVideoContainerFormat {}

/**
   * DICOM modality code. A list of modalities and their meanings can be found in the DICOM specification.
https://dicom.nema.org/medical/dicom/current/output/chtml/part03/sect_C.7.3.html#sect_C.7.3.1.1.1
   *
   * Log Safety: SAFE
   */
export type Modality =
  | "AR"
  | "ASMT"
  | "AU"
  | "BDUS"
  | "BI"
  | "BMD"
  | "CR"
  | "CT"
  | "CTPROTOCOL"
  | "DG"
  | "DOC"
  | "DX"
  | "ECG"
  | "EPS"
  | "ES"
  | "FID"
  | "GM"
  | "HC"
  | "HD"
  | "IO"
  | "IOL"
  | "IVOCT"
  | "IVUS"
  | "KER"
  | "KO"
  | "LEN"
  | "LS"
  | "MG"
  | "MR"
  | "M3D"
  | "NM"
  | "OAM"
  | "OCT"
  | "OP"
  | "OPM"
  | "OPT"
  | "OPTBSV"
  | "OPTENF"
  | "OPV"
  | "OSS"
  | "OT"
  | "PLAN"
  | "PR"
  | "PT"
  | "PX"
  | "REG"
  | "RESP"
  | "RF"
  | "RG"
  | "RTDOSE"
  | "RTIMAGE"
  | "RTINTENT"
  | "RTPLAN"
  | "RTRAD"
  | "RTRECORD"
  | "RTSEGANN"
  | "RTSTRUCT"
  | "RWV"
  | "SEG"
  | "SM"
  | "SMR"
  | "SR"
  | "SRF"
  | "STAIN"
  | "TEXTUREMAP"
  | "TG"
  | "US"
  | "VA"
  | "XA"
  | "XC"
  | "AS"
  | "CD"
  | "CF"
  | "CP"
  | "CS"
  | "DD"
  | "DF"
  | "DM"
  | "DS"
  | "EC"
  | "FA"
  | "FS"
  | "LP"
  | "MA"
  | "MS"
  | "OPR"
  | "ST"
  | "VF";

/**
 * The format of a 3D model media item.
 *
 * Log Safety: SAFE
 */
export type Model3dDecodeFormat = "LAS" | "PLY" | "OBJ";

/**
 * Metadata for 3D model media items.
 *
 * Log Safety: SAFE
 */
export interface Model3dMediaItemMetadata {
  format: Model3dDecodeFormat;
  modelType: Model3dType;
  sizeBytes: number;
}

/**
 * The type of 3D model representation.
 *
 * Log Safety: SAFE
 */
export type Model3dType = "POINT_CLOUD" | "MESH";

/**
 * MOV (QuickTime) video container format.
 *
 * Log Safety: SAFE
 */
export interface MovVideoContainerFormat {}

/**
 * MP3 audio format.
 *
 * Log Safety: SAFE
 */
export interface Mp3Format {}

/**
 * MP4 video container format.
 *
 * Log Safety: SAFE
 */
export interface Mp4VideoContainerFormat {}

/**
 * Specifies the number of audio channels. Defaults to 2 (stereo).
 *
 * Log Safety: SAFE
 */
export interface NumberOfChannels {
  numberOfChannels: number;
}

/**
 * hOCR (HTML-based OCR) output format.
 *
 * Log Safety: SAFE
 */
export interface OcrHocrOutputFormat {}

/**
 * Language codes for OCR.
 *
 * Log Safety: SAFE
 */
export type OcrLanguage =
  | "AFR"
  | "AMH"
  | "ARA"
  | "ASM"
  | "AZE"
  | "AZE_CYRL"
  | "BEL"
  | "BEN"
  | "BOD"
  | "BOS"
  | "BRE"
  | "BUL"
  | "CAT"
  | "CEB"
  | "CES"
  | "CHI_SIM"
  | "CHI_SIM_VERT"
  | "CHI_TRA"
  | "CHI_TRA_VERT"
  | "CHR"
  | "COS"
  | "CYM"
  | "DAN"
  | "DEU"
  | "DIV"
  | "DZO"
  | "ELL"
  | "ENG"
  | "ENM"
  | "EPO"
  | "EST"
  | "EUS"
  | "FAO"
  | "FAS"
  | "FIL"
  | "FIN"
  | "FRA"
  | "FRM"
  | "FRY"
  | "GLA"
  | "GLE"
  | "GLG"
  | "GRC"
  | "GUJ"
  | "HAT"
  | "HEB"
  | "HIN"
  | "HRV"
  | "HUN"
  | "HYE"
  | "IKU"
  | "IND"
  | "ISL"
  | "ITA"
  | "ITA_OLD"
  | "JAV"
  | "JPN"
  | "JPN_VERT"
  | "KAN"
  | "KAT"
  | "KAT_OLD"
  | "KAZ"
  | "KHM"
  | "KIR"
  | "KMR"
  | "KOR"
  | "KOR_VERT"
  | "LAO"
  | "LAT"
  | "LAV"
  | "LIT"
  | "LTZ"
  | "MAL"
  | "MAR"
  | "MKD"
  | "MLT"
  | "MON"
  | "MRI"
  | "MSA"
  | "MYA"
  | "NEP"
  | "NLD"
  | "NOR"
  | "OCI"
  | "ORI"
  | "OSD"
  | "PAN"
  | "POL"
  | "POR"
  | "PUS"
  | "QUE"
  | "RON"
  | "RUS"
  | "SAN"
  | "SIN"
  | "SLK"
  | "SLV"
  | "SND"
  | "SPA"
  | "SPA_OLD"
  | "SQI"
  | "SRP"
  | "SRP_LATN"
  | "SUN"
  | "SWA"
  | "SWE"
  | "SYR"
  | "TAM"
  | "TAT"
  | "TEL"
  | "TGK"
  | "THA"
  | "TIR"
  | "TON"
  | "TUR"
  | "UIG"
  | "UKR"
  | "URD"
  | "UZB"
  | "UZB_CYRL"
  | "VIE"
  | "YID"
  | "YOR";

/**
 * Either a specific language or a script for OCR.
 *
 * Log Safety: UNSAFE
 */
export type OcrLanguageOrScript =
  | ({ type: "language" } & OcrLanguageWrapper)
  | ({ type: "script" } & OcrScriptWrapper);

/**
 * Wrapper for an OCR language.
 *
 * Log Safety: SAFE
 */
export interface OcrLanguageWrapper {
  language: OcrLanguage;
}

/**
 * Performs OCR (Optical Character Recognition) on a specific page of a document.
 *
 * Log Safety: UNSAFE
 */
export interface OcrOnPageOperation {
  pageNumber: number;
  parameters: OcrParameters;
}

/**
 * Creates access patterns for OCR across pages of a document.
 *
 * Log Safety: UNSAFE
 */
export interface OcrOnPagesOperation {
  parameters: OcrParameters;
  pageNumber: number;
}

/**
 * The output format for OCR results.
 *
 * Log Safety: UNSAFE
 */
export type OcrOutputFormat =
  | ({ type: "hocr" } & OcrHocrOutputFormat)
  | ({ type: "text" } & OcrTextOutputFormat);

/**
 * Parameters for OCR (Optical Character Recognition) operations.
 *
 * Log Safety: UNSAFE
 */
export interface OcrParameters {
  outputFormat: OcrOutputFormat;
  languages: Array<OcrLanguageOrScript>;
}

/**
 * Script codes for OCR.
 *
 * Log Safety: SAFE
 */
export type OcrScript =
  | "ARABIC"
  | "ARMENIAN"
  | "BENGALI"
  | "CANADIAN_ABORIGINAL"
  | "CHEROKEE"
  | "CYRILLIC"
  | "DEVANAGARI"
  | "ETHIOPIC"
  | "FRAKTUR"
  | "GEORGIAN"
  | "GREEK"
  | "GUJARATI"
  | "GURMUKHI"
  | "HAN_SIMPLIFIED"
  | "HAN_SIMPLIFIED_VERT"
  | "HAN_TRADITIONAL"
  | "HAN_TRADITIONAL_VERT"
  | "HANGUL"
  | "HANGUL_VERT"
  | "HEBREW"
  | "JAPANESE"
  | "JAPANESE_VERT"
  | "KANNADA"
  | "KHMER"
  | "LAO"
  | "LATIN"
  | "MALAYALAM"
  | "MYANMAR"
  | "ORIYA"
  | "SINHALA"
  | "SYRIAC"
  | "TAMIL"
  | "TELUGU"
  | "THAANA"
  | "THAI"
  | "TIBETAN"
  | "VIETNAMESE";

/**
 * Wrapper for an OCR script.
 *
 * Log Safety: SAFE
 */
export interface OcrScriptWrapper {
  script: OcrScript;
}

/**
 * Plain text output format for OCR.
 *
 * Log Safety: SAFE
 */
export interface OcrTextOutputFormat {}

/**
 * The orientation information as encoded in EXIF metadata.
 *
 * Log Safety: SAFE
 */
export interface Orientation {
  rotationAngle?: RotationAngle;
  flipAxis?: FlipAxis;
}

/**
 * The palette interpretation of a band.
 *
 * Log Safety: SAFE
 */
export type PaletteInterpretation = "GRAY" | "RGB" | "RGBA" | "CMYK" | "HLS";

/**
 * PDF document format.
 *
 * Log Safety: SAFE
 */
export interface PdfFormat {}

/**
 * The performance mode for transcription.
 *
 * Log Safety: SAFE
 */
export type PerformanceMode = "MORE_ECONOMICAL" | "MORE_PERFORMANT";

/**
 * Plain text transcription output format.
 *
 * Log Safety: SAFE
 */
export interface PlainTextNoSegmentData {
  addTimestamps: boolean;
}

/**
 * PNG image format.
 *
 * Log Safety: SAFE
 */
export interface PngFormat {}

/**
 * PTTML (Palantir Timed Text Markup Language) transcription output format.
 *
 * Log Safety: SAFE
 */
export interface Pttml {}

/**
 * Log Safety: SAFE
 */
export interface PutMediaItemResponse {
  mediaItemRid: _Core.MediaItemRid;
}

/**
   * Renders a frame of a DICOM file as an image.
If only one dimension is specified, the other is calculated to preserve aspect ratio.
   *
   * Log Safety: SAFE
   */
export interface RenderImageLayerOperation {
  layerNumber?: number;
  height?: number;
  width?: number;
}

/**
   * Renders a PDF page as an image.
If only one dimension is specified, the other is calculated to preserve aspect ratio.
   *
   * Log Safety: SAFE
   */
export interface RenderPageOperation {
  pageNumber?: number;
  height?: number;
  width?: number;
}

/**
 * Renders a PDF page to maximally fit within a bounding box while preserving aspect ratio.
 *
 * Log Safety: SAFE
 */
export interface RenderPageToFitBoundingBoxOperation {
  pageNumber?: number;
  width: number;
  height: number;
}

/**
   * Resizes an image to the specified dimensions.
If only one dimension is specified, the other is calculated to preserve aspect ratio.
   *
   * Log Safety: SAFE
   */
export interface ResizeImageOperation {
  height?: number;
  width?: number;
  autoOrient?: boolean;
}

/**
 * Resizes an image to maximally fit within a bounding box while preserving aspect ratio.
 *
 * Log Safety: SAFE
 */
export interface ResizeToFitBoundingBoxOperation {
  width: number;
  height: number;
}

/**
 * Rotates an image clockwise by the specified angle.
 *
 * Log Safety: SAFE
 */
export interface RotateImageOperation {
  angle: RotationAngle;
}

/**
 * The rotation angle from EXIF orientation.
 *
 * Log Safety: SAFE
 */
export type RotationAngle =
  | "DEGREE_90"
  | "DEGREE_180"
  | "DEGREE_270"
  | "UNKNOWN";

/**
 * The sensitivity threshold for scene detection.
 *
 * Log Safety: SAFE
 */
export type SceneScore = "MORE_SENSITIVE" | "STANDARD" | "LESS_SENSITIVE";

/**
 * Slices a PDF to a specified page range.
 *
 * Log Safety: SAFE
 */
export interface SlicePdfRangeOperation {
  startPageInclusive: number;
  endPageExclusive: number;
  strictlyEnforceEndPage?: boolean;
}

/**
 * The format of a spreadsheet media item.
 *
 * Log Safety: SAFE
 */
export type SpreadsheetDecodeFormat = "XLSX";

/**
 * Metadata for spreadsheet media items.
 *
 * Log Safety: UNSAFE
 */
export interface SpreadsheetMediaItemMetadata {
  format: SpreadsheetDecodeFormat;
  sheetNames: Array<string>;
  sizeBytes: number;
  title?: string;
  author?: string;
}

/**
 * The operation to perform for spreadsheet to text conversion.
 *
 * Log Safety: UNSAFE
 */
export type SpreadsheetToTextOperation = {
  type: "convertSheetToJson";
} & ConvertSheetToJsonOperation;

/**
 * Converts spreadsheet data to text/JSON.
 *
 * Log Safety: UNSAFE
 */
export interface SpreadsheetToTextTransformation {
  operation: SpreadsheetToTextOperation;
}

/**
 * TAR archive format.
 *
 * Log Safety: SAFE
 */
export interface TarFormat {}

/**
 * TIFF image format.
 *
 * Log Safety: SAFE
 */
export interface TiffFormat {}

/**
   * Generates Slippy map tiles (EPSG 3857) from a geo-embedded image.
Only supported for geo-embedded TIFF and NITF images with at most 100M square pixels.
   *
   * Log Safety: UNSAFE
   */
export interface TileImageOperation {
  zoom: number;
  x: number;
  y: number;
}

/**
 * Log Safety: SAFE
 */
export interface TrackedTransformationFailedResponse {}

/**
 * Log Safety: SAFE
 */
export interface TrackedTransformationPendingResponse {}

/**
 * Log Safety: UNSAFE
 */
export type TrackedTransformationResponse =
  | ({ type: "pending" } & TrackedTransformationPendingResponse)
  | ({ type: "failed" } & TrackedTransformationFailedResponse)
  | ({ type: "successful" } & TrackedTransformationSuccessfulResponse);

/**
 * Log Safety: SAFE
 */
export interface TrackedTransformationSuccessfulResponse {}

/**
 * An identifier which represents a transaction on a media set.
 *
 * Log Safety: SAFE
 */
export type TransactionId = string;

/**
 * Encodes video to the specified format.
 *
 * Log Safety: SAFE
 */
export interface TranscodeOperation {}

/**
 * JSON transcription output format.
 *
 * Log Safety: SAFE
 */
export interface TranscribeJson {}

/**
 * Transcribes speech in audio to text.
 *
 * Log Safety: UNSAFE
 */
export interface TranscribeOperation {
  language?: TranscriptionLanguage;
  diarize?: boolean;
  outputFormat?: TranscribeTextEncodeFormat;
  performanceMode?: PerformanceMode;
}

/**
 * The output format for transcription results.
 *
 * Log Safety: UNSAFE
 */
export type TranscribeTextEncodeFormat =
  | ({ type: "plainTextNoSegmentData" } & PlainTextNoSegmentData)
  | ({ type: "json" } & TranscribeJson)
  | ({ type: "pttml" } & Pttml);

/**
   * Language codes for audio transcription.
If not specified, the language will be auto-detected from the first 30 seconds of audio.
   *
   * Log Safety: SAFE
   */
export type TranscriptionLanguage =
  | "AF"
  | "AM"
  | "AR"
  | "AS"
  | "AZ"
  | "BA"
  | "BE"
  | "BG"
  | "BN"
  | "BO"
  | "BR"
  | "BS"
  | "CA"
  | "CS"
  | "CY"
  | "DA"
  | "DE"
  | "EL"
  | "EN"
  | "ES"
  | "ET"
  | "EU"
  | "FA"
  | "FI"
  | "FO"
  | "FR"
  | "GL"
  | "GU"
  | "HA"
  | "HAW"
  | "HE"
  | "HI"
  | "HR"
  | "HT"
  | "HU"
  | "HY"
  | "ID"
  | "IS"
  | "IT"
  | "JA"
  | "JW"
  | "KA"
  | "KK"
  | "KM"
  | "KN"
  | "KO"
  | "LA"
  | "LB"
  | "LN"
  | "LO"
  | "LT"
  | "LV"
  | "MG"
  | "MI"
  | "MK"
  | "ML"
  | "MN"
  | "MR"
  | "MS"
  | "MT"
  | "MY"
  | "NE"
  | "NL"
  | "NN"
  | "false"
  | "OC"
  | "PA"
  | "PL"
  | "PS"
  | "PT"
  | "RO"
  | "RU"
  | "SA"
  | "SD"
  | "SI"
  | "SK"
  | "SL"
  | "SN"
  | "SO"
  | "SQ"
  | "SR"
  | "SU"
  | "SV"
  | "SW"
  | "TA"
  | "TE"
  | "TG"
  | "TH"
  | "TK"
  | "TL"
  | "TR"
  | "TT"
  | "UK"
  | "UR"
  | "UZ"
  | "VI"
  | "YI"
  | "YO"
  | "YUE"
  | "ZH"
  | "AFRIKAANS"
  | "ALBANIAN"
  | "AMHARIC"
  | "ARABIC"
  | "ARMENIAN"
  | "ASSAMESE"
  | "AZERBAIJANI"
  | "BASHKIR"
  | "BASQUE"
  | "BELARUSIAN"
  | "BENGALI"
  | "BOSNIAN"
  | "BRETON"
  | "BULGARIAN"
  | "BURMESE"
  | "CANTONESE"
  | "CASTILIAN"
  | "CATALAN"
  | "CHINESE"
  | "CROATIAN"
  | "CZECH"
  | "DANISH"
  | "DUTCH"
  | "ENGLISH"
  | "ESTONIAN"
  | "FAROESE"
  | "FINNISH"
  | "FLEMISH"
  | "FRENCH"
  | "GALICIAN"
  | "GEORGIAN"
  | "GERMAN"
  | "GREEK"
  | "GUJARATI"
  | "HAITIAN"
  | "HAITIAN_CREOLE"
  | "HAUSA"
  | "HAWAIIAN"
  | "HEBREW"
  | "HINDI"
  | "HUNGARIAN"
  | "ICELANDIC"
  | "INDONESIAN"
  | "ITALIAN"
  | "JAPANESE"
  | "JAVANESE"
  | "KANNADA"
  | "KAZAKH"
  | "KHMER"
  | "KOREAN"
  | "LAO"
  | "LATIN"
  | "LATVIAN"
  | "LETZEBURGESCH"
  | "LINGALA"
  | "LITHUANIAN"
  | "LUXEMBOURGISH"
  | "MACEDONIAN"
  | "MALAGASY"
  | "MALAY"
  | "MALAYALAM"
  | "MALTESE"
  | "MANDARIN"
  | "MAORI"
  | "MARATHI"
  | "MOLDAVIAN"
  | "MOLDOVAN"
  | "MONGOLIAN"
  | "MYANMAR"
  | "NEPALI"
  | "NORWEGIAN"
  | "NYNORSK"
  | "OCCITAN"
  | "PANJABI"
  | "PASHTO"
  | "PERSIAN"
  | "POLISH"
  | "PORTUGUESE"
  | "PUNJABI"
  | "PUSHTO"
  | "ROMANIAN"
  | "RUSSIAN"
  | "SANSKRIT"
  | "SERBIAN"
  | "SHONA"
  | "SINDHI"
  | "SINHALA"
  | "SINHALESE"
  | "SLOVAK"
  | "SLOVENIAN"
  | "SOMALI"
  | "SPANISH"
  | "SUNDANESE"
  | "SWAHILI"
  | "SWEDISH"
  | "TAGALOG"
  | "TAJIK"
  | "TAMIL"
  | "TATAR"
  | "TELUGU"
  | "THAI"
  | "TIBETAN"
  | "TURKISH"
  | "TURKMEN"
  | "UKRAINIAN"
  | "URDU"
  | "UZBEK"
  | "VALENCIAN"
  | "VIETNAMESE"
  | "WELSH"
  | "YIDDISH"
  | "YORUBA";

/**
   * A transformation to apply to a media item. Each variant specifies the type of transformation
and any parameters required for the operation.
   *
   * Log Safety: UNSAFE
   */
export type Transformation =
  | ({ type: "emailToText" } & EmailToTextTransformation)
  | ({ type: "image" } & ImageTransformation)
  | ({ type: "spreadsheetToText" } & SpreadsheetToTextTransformation)
  | ({ type: "videoToAudio" } & VideoToAudioTransformation)
  | ({ type: "audioToText" } & AudioToTextTransformation)
  | ({ type: "emailToAttachment" } & EmailToAttachmentTransformation)
  | ({ type: "videoToArchive" } & VideoToArchiveTransformation)
  | ({ type: "videoToText" } & VideoToTextTransformation)
  | ({ type: "imageToText" } & ImageToTextTransformation)
  | ({ type: "videoToImage" } & VideoToImageTransformation)
  | ({ type: "video" } & VideoTransformation)
  | ({ type: "imageToDocument" } & ImageToDocumentTransformation)
  | ({ type: "dicomToImage" } & DicomToImageTransformation)
  | ({ type: "documentToDocument" } & DocumentToDocumentTransformation)
  | ({ type: "documentToImage" } & DocumentToImageTransformation)
  | ({ type: "imageToEmbedding" } & ImageToEmbeddingTransformation)
  | ({ type: "audio" } & AudioTransformation)
  | ({ type: "documentToText" } & DocumentToTextTransformation);

/**
 * An identifier for a media item transformation job.
 *
 * Log Safety: UNSAFE
 */
export type TransformationJobId = LooselyBrandedString<"TransformationJobId">;

/**
 * The status of a transformation job.
 *
 * Log Safety: SAFE
 */
export type TransformationJobStatus = "PENDING" | "FAILED" | "SUCCESSFUL";

/**
 * Request to transform a media item.
 *
 * Log Safety: UNSAFE
 */
export interface TransformMediaItemRequest {
  transformation: Transformation;
}

/**
 * Response from initiating a media item transformation.
 *
 * Log Safety: UNSAFE
 */
export interface TransformMediaItemResponse {
  status: TransformationJobStatus;
  jobId: TransformationJobId;
}

/**
 * MPEG Transport Stream audio container format.
 *
 * Log Safety: SAFE
 */
export interface TsAudioContainerFormat {}

/**
 * MPEG Transport Stream video container format.
 *
 * Log Safety: SAFE
 */
export interface TsVideoContainerFormat {}

/**
 * The unit interpretation for a band.
 *
 * Log Safety: UNSAFE
 */
export interface UnitInterpretation {
  unit?: string;
  scale?: number;
  offset?: number;
}

/**
 * Metadata for untyped media items (media items without a recognized type).
 *
 * Log Safety: SAFE
 */
export interface UntypedMediaItemMetadata {
  sizeBytes: number;
}

/**
   * Chunks video into smaller segments of the specified duration.
The final chunk may be smaller than the specified duration.
   *
   * Log Safety: UNSAFE
   */
export interface VideoChunkOperation {
  chunkDurationMilliseconds: number;
  chunkIndex: number;
}

/**
 * The format of a video media item.
 *
 * Log Safety: SAFE
 */
export type VideoDecodeFormat = "MP4" | "MKV" | "MOV" | "TS";

/**
 * The output format for encoding video.
 *
 * Log Safety: UNSAFE
 */
export type VideoEncodeFormat =
  | ({ type: "mp4" } & Mp4VideoContainerFormat)
  | ({ type: "mov" } & MovVideoContainerFormat)
  | ({ type: "mkv" } & MkvVideoContainerFormat)
  | ({ type: "ts" } & TsVideoContainerFormat);

/**
 * Metadata for video media items.
 *
 * Log Safety: SAFE
 */
export interface VideoMediaItemMetadata {
  format: VideoDecodeFormat;
  specification: VideoSpecification;
  sizeBytes: number;
}

/**
 * The operation to perform on the video.
 *
 * Log Safety: UNSAFE
 */
export type VideoOperation =
  | ({ type: "transcode" } & TranscodeOperation)
  | ({ type: "chunk" } & VideoChunkOperation);

/**
 * Technical specifications for video media items.
 *
 * Log Safety: SAFE
 */
export interface VideoSpecification {
  bitRate: number;
  durationSeconds: number;
}

/**
 * The operation to perform for video to archive conversion.
 *
 * Log Safety: UNSAFE
 */
export type VideoToArchiveOperation = {
  type: "extractSceneFrames";
} & ExtractSceneFramesOperation;

/**
 * Extracts video frames to an archive format.
 *
 * Log Safety: UNSAFE
 */
export interface VideoToArchiveTransformation {
  encoding: ArchiveEncodeFormat;
  operation: VideoToArchiveOperation;
}

/**
 * The operation to perform for video to audio conversion.
 *
 * Log Safety: UNSAFE
 */
export type VideoToAudioOperation = {
  type: "extractAudio";
} & ExtractAudioOperation;

/**
 * Extracts audio from video.
 *
 * Log Safety: UNSAFE
 */
export interface VideoToAudioTransformation {
  encoding: AudioEncodeFormat;
  operation: VideoToAudioOperation;
}

/**
 * The operation to perform for video to image conversion.
 *
 * Log Safety: UNSAFE
 */
export type VideoToImageOperation =
  | ({ type: "extractFirstFrame" } & ExtractFirstFrameOperation)
  | ({
    type: "extractFramesAtTimestamps";
  } & ExtractFramesAtTimestampsOperation);

/**
 * Extracts video frames as images.
 *
 * Log Safety: UNSAFE
 */
export interface VideoToImageTransformation {
  encoding: ImageryEncodeFormat;
  operation: VideoToImageOperation;
}

/**
 * The operation to perform for video to text conversion.
 *
 * Log Safety: UNSAFE
 */
export type VideoToTextOperation = {
  type: "getTimestampsForSceneFrames";
} & GetTimestampsForSceneFramesOperation;

/**
 * Extracts metadata from video as text/JSON.
 *
 * Log Safety: UNSAFE
 */
export interface VideoToTextTransformation {
  operation: VideoToTextOperation;
}

/**
 * Transforms video media items.
 *
 * Log Safety: UNSAFE
 */
export interface VideoTransformation {
  encoding: VideoEncodeFormat;
  operation: VideoOperation;
}

/**
   * Generates waveform visualization data from audio.
Returns JSON with normalized doubles (0-1) representing amplitude.
   *
   * Log Safety: UNSAFE
   */
export interface WaveformOperation {
  peaksPerSecond: number;
}

/**
 * WAV audio format with optional sample rate and channel layout.
 *
 * Log Safety: UNSAFE
 */
export interface WavEncodeFormat {
  sampleRate?: number;
  audioChannelLayout?: AudioChannelLayout;
}

/**
 * WebP image format.
 *
 * Log Safety: SAFE
 */
export interface WebpFormat {}
