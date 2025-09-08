import * as Data from "effect/Data";
import { FileInfo } from "@beep/schema/custom/file/FileInfo.schema";

/**
 * Image files information with their unique signatures
 */
export class ImageTypes extends Data.TaggedClass("FileInfo") {
  static readonly AVIF = FileInfo.make({
    extension: "avif",
    mimeType: "image/avif",
    description: "Alliance for Open Media (AOMedia) Video 1 (AV1) Image File",
    signatures: [
      {
        sequence: [0x00, 0x00, 0x00],
      },
    ],
  });

  static readonly BMP = FileInfo.make({
    extension: "bmp",
    mimeType: "image/bmp",
    description: "A bitmap format used mostly in Windows",
    signatures: [
      {
        sequence: [0x42, 0x4d],
        compatibleExtensions: ["dib"],
      },
    ],
  });

  static readonly BPG = FileInfo.make({
    extension: "bpg",
    mimeType: "image/bpg",
    description: "Better Portable Graphics image format",
    signatures: [
      {
        sequence: [0x42, 0x50, 0x47, 0xfb],
      },
    ],
  });

  static readonly CR2 = FileInfo.make({
    extension: "cr2",
    mimeType: "image/x-canon-cr2",
    description: "Canon digital camera RAW file",
    signatures: [
      {
        sequence: [0x49, 0x49, 0x2a, 0x00, 0x10, 0x00, 0x00, 0x00, 0x43, 0x52],
      },
    ],
  });

  static readonly EXR = FileInfo.make({
    extension: "exr",
    mimeType: "image/x-exr",
    description: "OpenEXR bitmap image format",
    signatures: [
      {
        sequence: [0x76, 0x2f, 0x31, 0x01],
      },
    ],
  });

  static readonly GIF = FileInfo.make({
    extension: "gif",
    mimeType: "image/gif",
    description: "Image file encoded in the Graphics Interchange Format (GIF)",
    signatures: [
      {
        sequence: [0x47, 0x49, 0x46, 0x38, 0x37, 0x61],
      },
      {
        sequence: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61],
      },
    ],
  });

  static readonly HEIC = FileInfo.make({
    extension: "heic",
    mimeType: "image/heic",
    description:
      "A variant of the HEIF (High Efficiency Image Format) that store images on the latest Apple devices.",
    signatures: [
      {
        sequence: [0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x63],
        offset: 4,
      },
      {
        sequence: [0x66, 0x74, 0x79, 0x70, 0x6d],
        offset: 4,
      },
    ],
  });

  static readonly ICO = FileInfo.make({
    extension: "ico",
    mimeType: "image/x-icon",
    description: "Computer icon encoded in ICO file format",
    signatures: [
      {
        sequence: [0x00, 0x00, 0x01, 0x00],
        compatibleExtensions: ["spl"],
      },
    ],
  });

  static readonly JPEG = FileInfo.make({
    extension: "jpeg",
    mimeType: "image/jpeg",
    description:
      "JPEG (Joint Photographic Experts Group) is a widely used lossy image compression format.",
    signatures: [
      {
        sequence: [0xff, 0xd8, 0xff, 0xe1, 0x45, 0x78, 0x69, 0x66, 0x00],
        skippedBytes: [4, 5],
        description:
          "Digital camera JPG using Exchangeable Image File Format (EXIF)",
      },
      {
        sequence: [0xff, 0xd8, 0xff, 0xe8, 0x53, 0x50, 0x49, 0x46, 0x46, 0x00],
        skippedBytes: [4, 5],
        description: "Still Picture Interchange File Format (SPIFF)",
      },
      {
        sequence: [
          0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00,
          0x00,
        ],
        description: "JPEG raw or in the JFIF or Exif file format",
      },
      {
        sequence: [0xff, 0xd8, 0xff, 0xee],
        description: "JPEG raw or in the JFIF or Exif file format",
      },
      {
        sequence: [0xff, 0xd8, 0xff, 0xe1, 0x45, 0x78, 0x69, 0x66, 0x00, 0x00],
        skippedBytes: [4, 5],
        description: "JPEG raw or in the JFIF or Exif file format",
      },
      {
        sequence: [0xff, 0xd8, 0xff, 0xe0, 0x4a, 0x46, 0x49, 0x46, 0x00],
        skippedBytes: [4, 5],
        description: "JPEG/JFIF graphics file",
        compatibleExtensions: ["jfif", "jpe"],
      },
      {
        sequence: [0xff, 0xd8, 0xff, 0xe0],
        description: "JPEG raw or in the JFIF or Exif file format",
      },
      {
        sequence: [0xff, 0xd8],
        description: "Generic JPEGimage file",
        compatibleExtensions: ["jpe"],
      },
    ],
  });

  static readonly PBM = FileInfo.make({
    extension: "pbm",
    mimeType: "image/x-portable-bitmap",
    description:
      "PBM (Portable Bitmap) is a simple monochrome bitmap image format that uses plain text ASCII characters to represent binary image data",
    signatures: [
      {
        sequence: [0x50, 0x31, 0x0a],
        description: "Portable bitmap ASCII",
      },
      {
        sequence: [0x50, 0x34, 0x0a],
        description: "Portable bitmap binary",
      },
    ],
  });

  static readonly PGM = FileInfo.make({
    extension: "pgm",
    mimeType: "image/x-portable-graymap",
    description:
      "PGM (Portable Graymap) is a simple grayscale image format that uses ASCII text characters to represent binary image data.",
    signatures: [
      {
        sequence: [0x50, 0x32, 0x0a],
        description: "Portable Gray Map ASCII",
      },
      {
        sequence: [0x50, 0x35, 0x0a],
        description: "Portable Gray Map binary",
      },
    ],
  });

  static readonly PNG = FileInfo.make({
    extension: "png",
    mimeType: "image/png",
    description:
      "PNG (Portable Network Graphics) is a lossless image compression format that supports a wide range of color depths and transparency and is widely used for high-quality graphics.",
    signatures: [
      {
        sequence: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
      },
    ],
  });

  static readonly PPM = FileInfo.make({
    extension: "ppm",
    mimeType: "image/x-portable-pixmap",
    description:
      "PPM (Portable Pixmap) is a simple color image format in the Portable Network Graphics (PNG) suite.",
    signatures: [
      {
        sequence: [0x50, 0x33, 0x0a],
        description: "Portable Pixmap ASCII",
      },
      {
        sequence: [0x50, 0x36, 0x0a],
        description: "Portable Pixmap binary",
      },
    ],
  });

  static readonly PSD = FileInfo.make({
    extension: "psd",
    mimeType: "image/vnd.adobe.photoshop",
    description:
      "PSD (Photoshop Document) is an Adobe Photoshop image file format",
    signatures: [
      {
        sequence: [0x38, 0x42, 0x50, 0x53],
      },
    ],
  });

  static readonly WEBP = FileInfo.make({
    extension: "webp",
    mimeType: "image/webp",
    description:
      "A modern image format that provides superior lossless and lossy compression for images on the web",
    signatures: [
      {
        sequence: [0x52, 0x49, 0x46, 0x46, 0x57, 0x45, 0x42, 0x50],
        skippedBytes: [4, 5, 6, 7],
      },
    ],
  });
}
