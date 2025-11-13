import * as Data from "effect/Data";
import type { DetectedFileInfo } from "./FileInfo";
import { FileInfo } from "./FileInfo";
import { FileSignature } from "./FileSignature";
import type { FileValidatorOptions, ValidateFileTypeOptions, ZipValidatorOptions } from "./types";
import {
  fetchFromObject,
  findMatroskaDocTypeElements,
  getFileChunk,
  isAvifStringIncluded,
  isFlvStringIncluded,
  isftypStringIncluded,
  isHeicSignatureIncluded,
} from "./utils";

/**
 * Video files information with their unique signatures
 */
export class VideoTypes extends Data.TaggedClass("VideoTypes") {
  static readonly AVI = FileInfo.make({
    extension: "avi",
    mimeType: "video/x-msvideo",
    description: "Audio Video Interleave video format",
    signatures: [
      FileSignature.make({
        sequence: [0x52, 0x49, 0x46, 0x46, 0x41, 0x56, 0x49, 0x20, 0x4c, 0x49, 0x53, 0x54],
        skippedBytes: [4, 5, 6, 7],
      }),
    ],
  });

  static readonly FLV = FileInfo.make({
    extension: "flv",
    mimeType: "video/x-flv",
    description: "Flash Video file",
    signatures: [
      FileSignature.make({
        sequence: [0x46, 0x4c, 0x56, 0x01],
      }),
      FileSignature.make({
        sequence: [0x66, 0x74, 0x79, 0x70, 0x4d, 0x34, 0x56, 0x20],
        description: "ISO Media, MPEG v4 system, or iTunes AVC-LC file",
        offset: 4,
        compatibleExtensions: ["mp4", "m4v"],
      }),
    ],
  });

  static readonly M4V = FileInfo.make({
    extension: "m4v",
    mimeType: "video/x-m4v",
    description: "Apple's video container format, very similar to MP4",
    signatures: [
      FileSignature.make({
        sequence: [0x66, 0x74, 0x79, 0x70, 0x6d, 0x70, 0x34, 0x32],
        description: "MPEG-4 video | QuickTime file",
        offset: 4,
        compatibleExtensions: ["mp4"],
      }),
      FileSignature.make({
        sequence: [0x66, 0x74, 0x79, 0x70, 0x4d, 0x34, 0x56, 0x20],
        description: "ISO Media, MPEG v4 system, or iTunes AVC-LC file",
        offset: 4,
        compatibleExtensions: ["mp4", "flv"],
      }),
    ],
  });

  static readonly MKV = FileInfo.make({
    extension: "mkv",
    mimeType: "video/x-matroska",
    description:
      "MKV (Matroska Video) is a flexible, open-source media container format that supports multiple audio, video, and subtitle streams in a single file",
    signatures: [
      FileSignature.make({
        sequence: [0x1a, 0x45, 0xdf, 0xa3],
        description: "EBML identifier",
        compatibleExtensions: ["webm", "mka", "mks", "mk3d"],
      }),
    ],
  });

  static readonly MOV = FileInfo.make({
    extension: "mov",
    mimeType: "video/quicktime",
    description: "QuickTime movie file",
    signatures: [
      FileSignature.make({
        sequence: [0x66, 0x74, 0x79, 0x70, 0x71, 0x74, 0x20, 0x20],
        offset: 4,
      }),
      FileSignature.make({
        sequence: [0x6d, 0x6f, 0x6f, 0x76],
        offset: 4,
      }),
    ],
  });

  static readonly MP4 = FileInfo.make({
    extension: "mp4",
    mimeType: "video/mp4",
    description:
      "A multimedia container format widely used for storing audio, video, and other data, and is known for its high compression efficiency and compatibility with many devices",
    signatures: [
      FileSignature.make({
        sequence: [0x66, 0x74, 0x79, 0x70, 0x4d, 0x53, 0x4e, 0x56],
        description: "MPEG-4 video file",
        offset: 4,
      }),
      FileSignature.make({
        sequence: [0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d],
        description: "ISO Base Media file (MPEG-4) v1",
        offset: 4,
      }),
      FileSignature.make({
        sequence: [0x66, 0x74, 0x79, 0x70, 0x4d, 0x34, 0x56, 0x20],
        description: "ISO Media, MPEG v4 system, or iTunes AVC-LC file",
        offset: 4,
        compatibleExtensions: ["m4v", "flv"],
      }),
    ],
  });

  static readonly OGG = FileInfo.make({
    extension: "ogg",
    mimeType: "video/ogg",
    description: "Ogg Vorbis Codec compressed Multimedia file",
    signatures: [
      FileSignature.make({
        sequence: [0x4f, 0x67, 0x67, 0x53, 0x00, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
        compatibleExtensions: ["oga", "ogv", "ogx"],
      }),
    ],
  });

  static readonly SWF = FileInfo.make({
    extension: "swf",
    mimeType: "application/x-shockwave-flash",
    description:
      "SWF (Shockwave Flash) is a file format for multimedia, vector graphics, and ActionScript, used for creating and delivering animations, games, and other interactive web-based content",
    signatures: [
      FileSignature.make({
        sequence: [0x43, 0x57, 0x53],
        description: "Macromedia Shockwave Flash player file (zlib compressed, SWF 6 and later)",
      }),
      FileSignature.make({
        sequence: [0x46, 0x57, 0x53],
        description: "Macromedia Shockwave Flash player file (uncompressed)",
      }),
      FileSignature.make({
        sequence: [0x5a, 0x57, 0x53],
        description: "Macromedia Shockwave Flash player file (uncompressed)",
      }),
    ],
  });

  static readonly WEBM = FileInfo.make({
    extension: "webm",
    mimeType: "video/webm",
    description:
      "WebM is a royalty-free, open-source media file format optimized for web delivery, using efficient VP8 video and Vorbis audio codecs",
    signatures: [
      FileSignature.make({
        sequence: [0x1a, 0x45, 0xdf, 0xa3],
        description: "EBML identifier",
        compatibleExtensions: ["mkv"],
      }),
    ],
  });
}

/**
 * Other files information with their unique signatures
 */
export class OtherTypes {
  static readonly BLEND = FileInfo.make({
    extension: "blend",
    mimeType: "application/x-blender",
    description: "Blender File Format",
    signatures: [
      FileSignature.make({
        sequence: [0x42, 0x4c, 0x45, 0x4e, 0x44, 0x45, 0x52],
      }),
    ],
  });

  static readonly DOC = FileInfo.make({
    extension: "doc",
    mimeType: "application/msword",
    description: "Old Microsoft Word documents",
    signatures: [
      FileSignature.make({
        sequence: [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1], // Word 97-2003 for OLECF
        compatibleExtensions: ["xls", "ppt", "msi", "msg", "dot", "pps", "xla", "wiz"],
        description:
          "An Object Linking and Embedding (OLE) Compound File (CF) (i.e., OLECF) file format, known as Compound Binary File format by Microsoft, used by Microsoft Office 97-2003 applications",
      }),
      FileSignature.make({
        sequence: [0xdb, 0xa5, 0x2d, 0x00],
        description: "Microsoft Word 2.0 file format",
      }),
    ],
  });

  static readonly ELF = FileInfo.make({
    extension: "elf",
    mimeType: "application/x-executable",
    description: "Executable and Linking Format executable file (Linux/Unix)",
    signatures: [
      FileSignature.make({
        sequence: [0x7f, 0x45, 0x4c, 0x46],
      }),
    ],
  });

  static readonly EXE = FileInfo.make({
    extension: "exe",
    mimeType: "application/x-msdownload", // 'application/x-dosexec' is a subtype of 'application/x-msdownload', therefore it is not necessary to include it (https://web.archive.org/web/20160629113130/http://www.webarchive.org.uk/interject/types/application/x-dosexec)
    description: "Windows/DOS executable file and its descendants",
    signatures: [
      FileSignature.make({
        sequence: [0x4d, 0x5a],
        compatibleExtensions: [
          "acm",
          "ax",
          "cpl",
          "com",
          "dll",
          "drv",
          "efi",
          "fon",
          "iec",
          "ime",
          "mui",
          "ocx",
          "olb",
          "pif",
          "qts",
          "qtx",
          "rs",
          "sys",
          "scr",
          "tsp",
          "vbx",
          "vxd",
        ],
      }),
      FileSignature.make({
        sequence: [0x5a, 0x4d],
        description: "DOS ZM executable (rare)",
      }),
    ],
  });

  static readonly INDD = FileInfo.make({
    extension: "indd",
    mimeType: "application/x-indesign",
    description: "Adobe InDesign document",
    signatures: [
      FileSignature.make({
        sequence: [0x06, 0x06, 0xed, 0xf5, 0xd8, 0x1d, 0x46, 0xe5, 0xbd, 0x31, 0xef, 0xe7, 0xfe, 0x74, 0xb7, 0x1d],
        compatibleExtensions: ["indt"],
      }),
    ],
  });

  static readonly MACHO = FileInfo.make({
    extension: "macho",
    mimeType: "application/x-mach-binary",
    description: "Apple OS X ABI Mach-O binary file",
    signatures: [
      FileSignature.make({
        sequence: [0xfe, 0xed, 0xfa, 0xce],
        description: "32-bit",
      }),
      FileSignature.make({
        sequence: [0xce, 0xfa, 0xed, 0xfe],
        description: "32-bit, where target system has reverse byte ordering from host running compiler",
      }),
      FileSignature.make({
        sequence: [0xfe, 0xed, 0xfa, 0xcf],
        description: "64-bit",
      }),
      FileSignature.make({
        sequence: [0xcf, 0xfa, 0xed, 0xfe],
        description: "64-bit, where target system has reverse byte ordering from host running compiler",
      }),
      FileSignature.make({
        sequence: [0xca, 0xfe, 0xba, 0xbe],
        description: "Mach-O Fat Binary",
      }),
    ],
  });

  static readonly PDF = FileInfo.make({
    extension: "pdf",
    mimeType: "application/pdf",
    description: "Portable Document Format",
    signatures: [
      FileSignature.make({
        sequence: [0x25, 0x50, 0x44, 0x46, 0x2d],
      }),
    ],
  });

  static readonly ORC = FileInfo.make({
    extension: "orc",
    mimeType: "application/x-orc",
    description: "Apache ORC (Optimized Row Columnar) file format for columnar storage",
    signatures: [
      FileSignature.make({
        sequence: [0x4f, 0x52, 0x43],
      }),
    ],
  });

  static readonly PARQUET = FileInfo.make({
    extension: "parquet",
    mimeType: "application/vnd.apache.parquet",
    description: "Apache Parquet file format for columnar storage",
    signatures: [
      FileSignature.make({
        sequence: [0x50, 0x41, 0x52, 0x31],
      }),
    ],
  });

  static readonly PS = FileInfo.make({
    extension: "ps",
    mimeType: "application/postscript",
    description: "PostScript document",
    signatures: [
      FileSignature.make({
        sequence: [0x25, 0x21, 0x50, 0x53],
      }),
    ],
  });

  static readonly RTF = FileInfo.make({
    extension: "rtf",
    mimeType: "application/rtf",
    description: "Rich Text Format word processing file",
    signatures: [
      FileSignature.make({
        sequence: [0x7b, 0x5c, 0x72, 0x74, 0x66, 0x31],
      }),
    ],
  });

  static readonly SQLITE = FileInfo.make({
    extension: "sqlite",
    mimeType: "application/x-sqlite3",
    description: "SQLite database file",
    signatures: [
      FileSignature.make({
        sequence: [0x53, 0x51, 0x4c, 0x69, 0x74, 0x65, 0x20, 0x66, 0x6f, 0x72, 0x6d, 0x61, 0x74, 0x20, 0x33, 0x00],
      }),
    ],
  });

  static readonly STL = FileInfo.make({
    extension: "stl",
    mimeType: "application/sla",
    description: "ASCII STL (STereoLithography) file for 3D printing",
    signatures: [
      FileSignature.make({
        sequence: [0x73, 0x6f, 0x6c, 0x69, 0x64],
      }),
    ],
  });

  static readonly TTF = FileInfo.make({
    extension: "ttf",
    mimeType: "application/x-font-ttf",
    description: "TrueType font file",
    signatures: [
      FileSignature.make({
        sequence: [0x74, 0x72, 0x75, 0x65, 0x00],
      }),
      FileSignature.make({
        sequence: [0x00, 0x01, 0x00, 0x00, 0x00],
        compatibleExtensions: ["tte, dfont"],
      }),
    ],
  });

  static readonly PCAP = FileInfo.make({
    extension: "pcap",
    mimeType: "application/vnd.tcpdump.pcap",
    description: "Libpcap File Format",
    signatures: [
      FileSignature.make({
        sequence: [0xd4, 0xc3, 0xb2, 0xa1],
      }),
      FileSignature.make({
        sequence: [0x4d, 0x3c, 0xb2, 0xa1],
        description: "Nanosecond resolution",
      }),
    ],
  });
}

/**
 * Image files information with their unique signatures
 */
export class ImageTypes extends Data.TaggedClass("FileInfo") {
  static readonly AVIF = FileInfo.make({
    extension: "avif",
    mimeType: "image/avif",
    description: "Alliance for Open Media (AOMedia) Video 1 (AV1) Image File",
    signatures: [
      FileSignature.make({
        sequence: [0x00, 0x00, 0x00],
      }),
    ],
  });

  static readonly BMP = FileInfo.make({
    extension: "bmp",
    mimeType: "image/bmp",
    description: "A bitmap format used mostly in Windows",
    signatures: [
      FileSignature.make({
        sequence: [0x42, 0x4d],
        compatibleExtensions: ["dib"],
      }),
    ],
  });

  static readonly BPG = FileInfo.make({
    extension: "bpg",
    mimeType: "image/bpg",
    description: "Better Portable Graphics image format",
    signatures: [
      FileSignature.make({
        sequence: [0x42, 0x50, 0x47, 0xfb],
      }),
    ],
  });

  static readonly CR2 = FileInfo.make({
    extension: "cr2",
    mimeType: "image/x-canon-cr2",
    description: "Canon digital camera RAW file",
    signatures: [
      FileSignature.make({
        sequence: [0x49, 0x49, 0x2a, 0x00, 0x10, 0x00, 0x00, 0x00, 0x43, 0x52],
      }),
    ],
  });

  static readonly EXR = FileInfo.make({
    extension: "exr",
    mimeType: "image/x-exr",
    description: "OpenEXR bitmap image format",
    signatures: [
      FileSignature.make({
        sequence: [0x76, 0x2f, 0x31, 0x01],
      }),
    ],
  });

  static readonly GIF = FileInfo.make({
    extension: "gif",
    mimeType: "image/gif",
    description: "Image file encoded in the Graphics Interchange Format (GIF)",
    signatures: [
      FileSignature.make({
        sequence: [0x47, 0x49, 0x46, 0x38, 0x37, 0x61],
      }),
      FileSignature.make({
        sequence: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61],
      }),
    ],
  });

  static readonly HEIC = FileInfo.make({
    extension: "heic",
    mimeType: "image/heic",
    description: "A variant of the HEIF (High Efficiency Image Format) that store images on the latest Apple devices.",
    signatures: [
      FileSignature.make({
        sequence: [0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x63],
        offset: 4,
      }),
      FileSignature.make({
        sequence: [0x66, 0x74, 0x79, 0x70, 0x6d],
        offset: 4,
      }),
    ],
  });

  static readonly ICO = FileInfo.make({
    extension: "ico",
    mimeType: "image/x-icon",
    description: "Computer icon encoded in ICO file format",
    signatures: [
      FileSignature.make({
        sequence: [0x00, 0x00, 0x01, 0x00],
        compatibleExtensions: ["spl"],
      }),
    ],
  });

  static readonly JPEG = FileInfo.make({
    extension: "jpeg",
    mimeType: "image/jpeg",
    description: "JPEG (Joint Photographic Experts Group) is a widely used lossy image compression format.",
    signatures: [
      FileSignature.make({
        sequence: [0xff, 0xd8, 0xff, 0xe1, 0x45, 0x78, 0x69, 0x66, 0x00],
        skippedBytes: [4, 5],
        description: "Digital camera JPG using Exchangeable Image File Format (EXIF)",
      }),
      FileSignature.make({
        sequence: [0xff, 0xd8, 0xff, 0xe8, 0x53, 0x50, 0x49, 0x46, 0x46, 0x00],
        skippedBytes: [4, 5],
        description: "Still Picture Interchange File Format (SPIFF)",
      }),
      FileSignature.make({
        sequence: [0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x00],
        description: "JPEG raw or in the JFIF or Exif file format",
      }),
      FileSignature.make({
        sequence: [0xff, 0xd8, 0xff, 0xee],
        description: "JPEG raw or in the JFIF or Exif file format",
      }),
      FileSignature.make({
        sequence: [0xff, 0xd8, 0xff, 0xe1, 0x45, 0x78, 0x69, 0x66, 0x00, 0x00],
        skippedBytes: [4, 5],
        description: "JPEG raw or in the JFIF or Exif file format",
      }),
      FileSignature.make({
        sequence: [0xff, 0xd8, 0xff, 0xe0, 0x4a, 0x46, 0x49, 0x46, 0x00],
        skippedBytes: [4, 5],
        description: "JPEG/JFIF graphics file",
        compatibleExtensions: ["jfif", "jpe"],
      }),
      FileSignature.make({
        sequence: [0xff, 0xd8, 0xff, 0xe0],
        description: "JPEG raw or in the JFIF or Exif file format",
      }),
      FileSignature.make({
        sequence: [0xff, 0xd8],
        description: "Generic JPEGimage file",
        compatibleExtensions: ["jpe"],
      }),
    ],
  });

  static readonly PBM = FileInfo.make({
    extension: "pbm",
    mimeType: "image/x-portable-bitmap",
    description:
      "PBM (Portable Bitmap) is a simple monochrome bitmap image format that uses plain text ASCII characters to represent binary image data",
    signatures: [
      FileSignature.make({
        sequence: [0x50, 0x31, 0x0a],
        description: "Portable bitmap ASCII",
      }),
      FileSignature.make({
        sequence: [0x50, 0x34, 0x0a],
        description: "Portable bitmap binary",
      }),
    ],
  });

  static readonly PGM = FileInfo.make({
    extension: "pgm",
    mimeType: "image/x-portable-graymap",
    description:
      "PGM (Portable Graymap) is a simple grayscale image format that uses ASCII text characters to represent binary image data.",
    signatures: [
      FileSignature.make({
        sequence: [0x50, 0x32, 0x0a],
        description: "Portable Gray Map ASCII",
      }),
      FileSignature.make({
        sequence: [0x50, 0x35, 0x0a],
        description: "Portable Gray Map binary",
      }),
    ],
  });

  static readonly PNG = FileInfo.make({
    extension: "png",
    mimeType: "image/png",
    description:
      "PNG (Portable Network Graphics) is a lossless image compression format that supports a wide range of color depths and transparency and is widely used for high-quality graphics.",
    signatures: [
      FileSignature.make({
        sequence: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
      }),
    ],
  });

  static readonly PPM = FileInfo.make({
    extension: "ppm",
    mimeType: "image/x-portable-pixmap",
    description: "PPM (Portable Pixmap) is a simple color image format in the Portable Network Graphics (PNG) suite.",
    signatures: [
      FileSignature.make({
        sequence: [0x50, 0x33, 0x0a],
        description: "Portable Pixmap ASCII",
      }),
      FileSignature.make({
        sequence: [0x50, 0x36, 0x0a],
        description: "Portable Pixmap binary",
      }),
    ],
  });

  static readonly PSD = FileInfo.make({
    extension: "psd",
    mimeType: "image/vnd.adobe.photoshop",
    description: "PSD (Photoshop Document) is an Adobe Photoshop image file format",
    signatures: [
      FileSignature.make({
        sequence: [0x38, 0x42, 0x50, 0x53],
      }),
    ],
  });

  static readonly WEBP = FileInfo.make({
    extension: "webp",
    mimeType: "image/webp",
    description: "A modern image format that provides superior lossless and lossy compression for images on the web",
    signatures: [
      FileSignature.make({
        sequence: [0x52, 0x49, 0x46, 0x46, 0x57, 0x45, 0x42, 0x50],
        skippedBytes: [4, 5, 6, 7],
      }),
    ],
  });
}

/**
 * Compressed files information with their unique signatures
 */
export class CompressedTypes extends Data.TaggedClass("CompressedTypes") {
  static readonly _7Z = FileInfo.make({
    extension: "7z",
    mimeType: "application/x-7z-compressed",
    description: "7-Zip compressed file",
    signatures: [
      FileSignature.make({
        sequence: [0x37, 0x7a, 0xbc, 0xaf, 0x27, 0x1c],
      }),
    ],
  });

  static readonly LZH = FileInfo.make({
    extension: "lzh",
    mimeType: "application/x-lzh-compressed",
    description: "Compressed file using Lempel-Ziv and Haruyasu (LZH) compression algorithm",
    signatures: [
      FileSignature.make({
        sequence: [0x2d, 0x68, 0x6c, 0x30, 0x2d],
        description: "Lempel Ziv Huffman archive file Method 0 (No compression)",
        compatibleExtensions: ["lha"],
      }),
      FileSignature.make({
        sequence: [0x2d, 0x68, 0x6c, 0x35, 0x2d],
        description: "Lempel Ziv Huffman archive file Method 5 (8KiB sliding window)",
        compatibleExtensions: ["lha"],
      }),
    ],
  });

  static readonly RAR = FileInfo.make({
    extension: "rar",
    mimeType: "application/x-rar-compressed",
    description: "Roshal ARchive compressed archive file",
    signatures: [
      FileSignature.make({
        sequence: [0x52, 0x61, 0x72, 0x21, 0x1a, 0x07, 0x00],
        description: "Compressed archive v5.00 onwards",
      }),
      FileSignature.make({
        sequence: [0x52, 0x61, 0x72, 0x21, 0x1a, 0x07, 0x01, 0x00],
        description: "Compressed archive v1.50 onwards",
      }),
    ],
  });

  static readonly ZIP = FileInfo.make({
    extension: "zip",
    mimeType: "application/zip",
    description: "Compressed archive file",
    signatures: [
      FileSignature.make({
        sequence: [0x57, 0x69, 0x6e, 0x5a, 0x69, 0x70],
        offset: 29152,
        description: "WinZip compressed archive",
      }),
      FileSignature.make({
        sequence: [0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x01, 0x00, 0x63, 0x00, 0x00, 0x00, 0x00, 0x00],
        description: "ZLock Pro encrypted ZIP",
      }),
      FileSignature.make({
        sequence: [0x50, 0x4b, 0x4c, 0x49, 0x54, 0x45],
        offset: 30,
        description: "PKLITE compressed ZIP archive (see also PKZIP)",
      }),
      FileSignature.make({
        sequence: [0x50, 0x4b, 0x53, 0x70, 0x58],
        offset: 526,
        description: "PKSFX self-extracting executable compressed file (see also PKZIP)",
      }),
      FileSignature.make({
        sequence: [0x50, 0x4b, 0x03, 0x04],
        description: "PKZIP archive file - zip file format and multiple formats based on it",
        compatibleExtensions: [
          "aar",
          "apk",
          "docx",
          "epub",
          "ipa",
          "jar",
          "kmz",
          "maff",
          "msix",
          "odp",
          "ods",
          "odt",
          "pk3",
          "pk4",
          "pptx",
          "usdz",
          "vsdx",
          "xlsx",
          "xpi",
        ],
      }),
      FileSignature.make({
        sequence: [0x50, 0x4b, 0x05, 0x06],
        description: "PKZIP empty archive file - zip file format and multiple formats based on it",
        compatibleExtensions: [
          "aar",
          "apk",
          "docx",
          "epub",
          "ipa",
          "jar",
          "kmz",
          "maff",
          "msix",
          "odp",
          "ods",
          "odt",
          "pk3",
          "pk4",
          "pptx",
          "usdz",
          "vsdx",
          "xlsx",
          "xpi",
        ],
      }),
      FileSignature.make({
        sequence: [0x50, 0x4b, 0x07, 0x08],
        description: "PKZIP multivolume archive file - zip file format and multiple formats based on it",
        compatibleExtensions: [
          "aar",
          "apk",
          "docx",
          "epub",
          "ipa",
          "jar",
          "kmz",
          "maff",
          "msix",
          "odp",
          "ods",
          "odt",
          "pk3",
          "pk4",
          "pptx",
          "usdz",
          "vsdx",
          "xlsx",
          "xpi",
        ],
      }),
    ],
  });
}

export class AudioTypes extends Data.TaggedClass("AudioTypes") {
  static readonly AAC = FileInfo.make({
    extension: "aac",
    mimeType: "audio/aac",
    description: "Advanced Audio Coding (AAC) is an audio coding standard for lossy digital audio compression",
    signatures: [
      FileSignature.make({
        sequence: [0xff, 0xf1],
        description: "MPEG-4 Advanced Audio Coding (AAC) Low Complexity (LC) audio file",
      }),
      FileSignature.make({
        sequence: [0xff, 0xf9],
        description: "MPEG-2 Advanced Audio Coding (AAC) Low Complexity (LC) audio file",
      }),
    ],
  });
  static readonly AMR = FileInfo.make({
    extension: "amr",
    mimeType: "audio/amr",
    description:
      "Adaptive Multi-Rate ACELP (Algebraic Code Excited Linear Prediction) Codec, commonly audio format with GSM cell phones",
    signatures: [
      FileSignature.make({
        sequence: [0x23, 0x21, 0x41, 0x4d, 0x52],
      }),
    ],
  });

  static readonly FLAC = FileInfo.make({
    extension: "flac",
    mimeType: "audio/x-flac",
    description: "Free Lossless Audio Codec file",
    signatures: [
      FileSignature.make({
        sequence: [0x66, 0x4c, 0x61, 0x43, 0x00, 0x00, 0x00, 0x22],
      }),
    ],
  });

  static readonly M4A = FileInfo.make({
    extension: "m4a",
    mimeType: "audio/x-m4a",
    description: "Apple Lossless Audio Codec file",
    signatures: [
      FileSignature.make(
        {
          sequence: [0x66, 0x74, 0x79, 0x70, 0x4d, 0x34, 0x41, 0x20],
          offset: 4,
          compatibleExtensions: ["aac"],
        },
        {
          disableValidation: true,
        }
      ),
    ],
  });

  static readonly MP3 = FileInfo.make({
    extension: "mp3",
    mimeType: "audio/mpeg",
    description:
      "A digital audio file format that uses compression to reduce file size while maintaining high quality sound",
    signatures: [
      FileSignature.make({
        sequence: [0xff, 0xfb],
        description:
          "MPEG-1 Layer 3 file without an ID3 tag or with an ID3v1 tag (which is appended at the end of the file)",
      }),
      FileSignature.make({
        sequence: [0xff, 0xf3],
        description:
          "MPEG-1 Layer 3 file without an ID3 tag or with an ID3v1 tag (which is appended at the end of the file)",
      }),
      FileSignature.make({
        sequence: [0xff, 0xf2],
        description:
          "MPEG-1 Layer 3 file without an ID3 tag or with an ID3v1 tag (which is appended at the end of the file)",
      }),
      FileSignature.make({
        sequence: [0x49, 0x44, 0x33],
        description: "MP3 file with an ID3v2 container",
      }),
    ],
  });

  static readonly WAV = FileInfo.make({
    extension: "wav",
    mimeType: "audio/wav",
    description: "Waveform Audio File Format",
    signatures: [
      FileSignature.make({
        sequence: [0x52, 0x49, 0x46, 0x46, 0x57, 0x41, 0x56, 0x45, 0x66, 0x6d, 0x74, 0x20],
        skippedBytes: [4, 5, 6, 7],
      }),
    ],
  });
}

export const FILE_TYPES_REQUIRED_ADDITIONAL_CHECK = [
  ...(["m4v", "flv", "mp4", "mkv", "webm", "avif", "heic"] as ReadonlyArray<string>),
];

/**
 * A class hold all supported file typs with their unique signatures
 */
export class FileTypes extends Data.TaggedClass("FileTypes") {
  // audio
  static readonly AAC = AudioTypes.AAC;
  static readonly AMR = AudioTypes.AMR;
  static readonly FLAC = AudioTypes.FLAC;
  static readonly M4A = AudioTypes.M4A;
  static readonly MP3 = AudioTypes.MP3;
  static readonly WAV = AudioTypes.WAV;

  // image
  static readonly AVIF = ImageTypes.AVIF;
  static readonly BMP = ImageTypes.BMP;
  static readonly BPG = ImageTypes.BPG;
  static readonly CR2 = ImageTypes.CR2;
  static readonly EXR = ImageTypes.EXR;
  static readonly GIF = ImageTypes.GIF;
  static readonly ICO = ImageTypes.ICO;
  static readonly JPEG = ImageTypes.JPEG;
  static readonly PBM = ImageTypes.PBM;
  static readonly PGM = ImageTypes.PGM;
  static readonly PNG = ImageTypes.PNG;
  static readonly PPM = ImageTypes.PPM;
  static readonly PSD = ImageTypes.PSD;
  static readonly WEBP = ImageTypes.WEBP;
  static readonly HEIC = ImageTypes.HEIC;

  // video
  static readonly AVI = VideoTypes.AVI;
  static readonly FLV = VideoTypes.FLV;
  static readonly M4V = VideoTypes.M4V;
  static readonly MKV = VideoTypes.MKV;
  static readonly MOV = VideoTypes.MOV;
  static readonly MP4 = VideoTypes.MP4;
  static readonly OGG = VideoTypes.OGG;
  static readonly SWF = VideoTypes.SWF;
  static readonly WEBM = VideoTypes.WEBM;

  // compressed
  static readonly _7Z = CompressedTypes._7Z;
  static readonly LZH = CompressedTypes.LZH;
  static readonly RAR = CompressedTypes.RAR;
  static readonly ZIP = CompressedTypes.ZIP;

  // other
  static readonly BLEND = OtherTypes.BLEND;
  static readonly DOC = OtherTypes.DOC;
  static readonly ELF = OtherTypes.ELF;
  static readonly EXE = OtherTypes.EXE;
  static readonly INDD = OtherTypes.INDD;
  static readonly MACHO = OtherTypes.MACHO;
  static readonly ORC = OtherTypes.ORC;
  static readonly PARQUET = OtherTypes.PARQUET;
  static readonly PCAP = OtherTypes.PCAP;
  static readonly PDF = OtherTypes.PDF;
  static readonly PS = OtherTypes.PS;
  static readonly RTF = OtherTypes.RTF;
  static readonly SQLITE = OtherTypes.SQLITE;
  static readonly STL = OtherTypes.STL;
  static readonly TTF = OtherTypes.TTF;

  /**
   * Receive information on a file type by its property name from FileTypes class
   *
   * @param propertyName Property name from FileTypes class
   *
   * @returns {FileInfo} File type information
   */
  public static getInfoByName(propertyName: string) {
    const file = fetchFromObject(FileTypes, propertyName.toUpperCase());
    return file;
  }

  /**
   * Receive an array of file type signatures by its property name from FileTypes class
   *
   * @param propertyName Property name from FileTypes class
   *
   * @returns {Array<FileSignature>} All unique signatures with their information
   */
  public static getSignaturesByName(propertyName: string): ReadonlyArray<FileSignature.Type> {
    const { signatures } = fetchFromObject(FileTypes, propertyName.toUpperCase());
    return signatures;
  }

  /**
   * Determine if a valid signature exist in a file chunk
   *
   * @param fileChunk A chunk from the beginning of a file content, represents in array of numbers
   * @param acceptedSignatures Valid signatures to search for in fileChunk
   *
   * @returns {boolean} True if found a valid signature inside the chunk, otherwise false
   */
  public static detectSignature(
    fileChunk: Array<number>,
    acceptedSignatures: ReadonlyArray<FileSignature.Type>
  ): FileSignature.Type | undefined {
    for (const signature of acceptedSignatures) {
      let found = true;
      const offset = signature.offset || 0;
      let skippedBytes = 0;
      for (let i = 0; i < signature.sequence.length; i++) {
        if (signature.skippedBytes?.includes(i)) {
          skippedBytes++;
          continue;
        }
        if (fileChunk[offset + i] !== signature.sequence[i - skippedBytes]) {
          found = false;
          break;
        }
      }
      if (found) {
        return signature;
      }
    }
    return undefined;
  }

  /**
   * Perfomrs an additional check for detected file types by their unique structure
   *
   * @param fileChunk A chunk from the beginning of a file content, represents in array of numbers
   * @param detectedFiles A list of detected files
   * @returns {string | undefined} File type extension if found, otherwise undefined
   */
  public static detectTypeByAdditionalCheck(
    fileChunk: Array<number>,
    detectedFiles: Array<DetectedFileInfo.Type | FileInfo.Type>
  ): string | undefined {
    const detectedExtensions = detectedFiles.map((df) => df.extension);

    if (detectedExtensions.some((de) => ["m4v", "flv", "mp4", "heic"].includes(de))) {
      if (detectedExtensions.includes("heic") && isHEIC(fileChunk)) return "heic";
      const isFlv = isFLV(fileChunk);
      if (isFlv) return "flv";
      const isM4v = isM4V(fileChunk) && !isHEIC(fileChunk);
      if (isM4v) return "m4v";
      return "mp4";
    }
    if (detectedExtensions.some((de) => ["mkv", "webm"].includes(de))) {
      const matroskaDocTypeElement = findMatroskaDocTypeElements(fileChunk);
      if (matroskaDocTypeElement === "mkv" && isMKV(fileChunk)) return "mkv";
      if (matroskaDocTypeElement === "webm" && isWEBM(fileChunk)) return "webm";
      return undefined;
    }
    if (detectedExtensions.some((de) => ["avif"].includes(de))) {
      const isAvif = isAvifStringIncluded(fileChunk);
      if (isAvif) return "avif";
    }
    return undefined;
  }

  /**
   * Determine if a file chunk contains a valid signature and return the file signature if exist
   *
   * @param fileChunk A chunk from the beginning of a file content, represents in array of numbers
   * @param acceptedSignatures Valid signatures to search for in fileChunk
   *
   * @returns {FileSignature | undefined } FileSignature if found a valid signature, otherwise undefined
   */
  public static detectBySignatures(
    fileChunk: Array<number>,
    acceptedSignatures: ReadonlyArray<FileSignature.Type>
  ): FileSignature.Type | undefined {
    for (const signature of acceptedSignatures) {
      let skippedBytes = 0;
      let found = true;
      const offset = signature.offset || 0;
      const signatureLength = signature?.skippedBytes
        ? signature.sequence.length + signature.skippedBytes.length
        : signature.sequence.length;
      for (let i = 0; i < signatureLength; i++) {
        if (signature.skippedBytes?.includes(i)) {
          skippedBytes++;
          continue;
        }
        if (fileChunk[offset + i] !== signature.sequence[i - skippedBytes]) {
          found = false;
          break;
        }
      }
      if (found) {
        return signature;
      }
    }
    return undefined;
  }

  /**
   * Determine if file content contains a valid signature of a required type
   *
   * @param fileChunk A chunk from the beginning of a file content, represents in array of numbers
   * @param type The file type to match against
   *
   * @returns {boolean} True if found a signature of the type in file content, otherwise false
   */
  public static checkByFileType(fileChunk: Array<number>, type: string): boolean {
    if (Object.prototype.hasOwnProperty.call(FileTypes, type.toUpperCase())) {
      const acceptedSignatures: ReadonlyArray<FileSignature.Type> = FileTypes.getSignaturesByName(type.toUpperCase());

      const detectedSignature = FileTypes.detectSignature(fileChunk, acceptedSignatures);
      if (detectedSignature) return true;
    }
    return false;
  }
}

/**
 * Determine if file content contains a valid 'aac' file signature
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 * @param options parameters for additional actions
 *
 * @returns {boolean} True if found a signature of type 'aac' in file content, otherwise false
 */
export function isAAC(
  file: Array<number> | ArrayBuffer | Uint8Array,
  options?: FileValidatorOptions | undefined
): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  const iaAac = FileTypes.checkByFileType(fileChunk, "aac");

  if (!iaAac) {
    if (options?.excludeSimilarTypes) return false;
    return isM4A(fileChunk); // since 'm4a' is very similar to 'aac'
  }

  return true;
}

/**
 * Determine if file content contains a valid 'amr' file signature
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type 'amr' in file content, otherwise false
 */
export function isAMR(file: Array<number> | ArrayBuffer | Uint8Array): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  return FileTypes.checkByFileType(fileChunk, "amr");
}

/**
 * Determine if file content contains a valid 'flac' file signature
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type 'flac' in file content, otherwise false
 */
export function isFLAC(file: Array<number> | ArrayBuffer | Uint8Array): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  return FileTypes.checkByFileType(fileChunk, "flac");
}

/**
 * Determine if file content contains a valid 'm4a' file signature
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type 'm4a' in file content, otherwise false
 */
export function isM4A(file: Array<number> | ArrayBuffer | Uint8Array): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  return FileTypes.checkByFileType(fileChunk, "m4a");
}

/**
 * Determine if file content contains a valid 'mp3' file signature
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type 'mp3' in file content, otherwise false
 */
export function isMP3(file: Array<number> | ArrayBuffer | Uint8Array): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  return FileTypes.checkByFileType(fileChunk, "mp3");
}

/**
 * Determine if file content contains a valid 'wav' file signature
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type 'wav' in file content, otherwise false
 */
export function isWAV(file: Array<number> | ArrayBuffer | Uint8Array): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  return FileTypes.checkByFileType(fileChunk, "wav");
}

/**
 * Determine if file content contains a valid '7z' file signature
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type '7z' in file content, otherwise false
 */
export function is7Z(file: Array<number> | ArrayBuffer | Uint8Array): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  return FileTypes.checkByFileType(fileChunk, "_7z");
}

/**
 * Determine if file content contains a valid 'lzh' file signature
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type 'lzh' in file content, otherwise false
 */
export function isLZH(file: Array<number> | ArrayBuffer | Uint8Array): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  return FileTypes.checkByFileType(fileChunk, "lzh");
}

/**
 * Determine if file content contains a valid 'rar' file signature
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type 'rar' in file content, otherwise false
 */
export function isRAR(file: Array<number> | ArrayBuffer | Uint8Array): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  return FileTypes.checkByFileType(fileChunk, "rar");
}

/**
 * Determine if file content contains a valid 'zip' file signature
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 * @param options parameters for additional actions
 *
 * @returns {boolean} True if found a signature of type 'zip' in file content, otherwise false
 */
export function isZIP(
  file: Array<number> | ArrayBuffer | Uint8Array,
  options?: ZipValidatorOptions | undefined
): boolean {
  const fileChunk: Array<number> = getFileChunk(file, options?.chunkSize || 64);
  return FileTypes.checkByFileType(fileChunk, "zip");
}

/**
 * Determine if file content contains a valid 'avif' file signature
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type 'avif' in file content, otherwise false
 */
export function isAVIF(file: Array<number> | ArrayBuffer | Uint8Array): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  const isAVIF = FileTypes.checkByFileType(fileChunk, "avif");
  if (!isAVIF) return false;

  // Search for the presence of the "ftypavif" at bytes 5-12
  return isAvifStringIncluded(fileChunk);
}

/**
 * Determine if file content contains a valid 'bmp' file signature
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type 'bmp' in file content, otherwise false
 */
export function isBMP(file: Array<number> | ArrayBuffer | Uint8Array): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  return FileTypes.checkByFileType(fileChunk, "bmp");
}

/**
 * Determine if file content contains a valid 'bpg' file signature
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type 'bpg' in file content, otherwise false
 */
export function isBPG(file: Array<number> | ArrayBuffer | Uint8Array): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  return FileTypes.checkByFileType(fileChunk, "bpg");
}

/**
 * Determine if file content contains a valid 'cr2' file signature
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type 'cr2' in file content, otherwise false
 */
export function isCR2(file: Array<number> | ArrayBuffer | Uint8Array): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  return FileTypes.checkByFileType(fileChunk, "cr2");
}

/**
 * Determine if file content contains a valid 'exr' file signature
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type 'exr' in file content, otherwise false
 */
export function isEXR(file: Array<number> | ArrayBuffer | Uint8Array): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  return FileTypes.checkByFileType(fileChunk, "exr");
}

/**
 * Determine if file content contains a valid 'gif' file signature
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type 'gif' in file content, otherwise false
 */
export function isGIF(file: Array<number> | ArrayBuffer | Uint8Array): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  return FileTypes.checkByFileType(fileChunk, "gif");
}

/**
 * Determine if file content contains a valid 'heic' file signature
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type 'heic' in file content, otherwise false
 */
export function isHEIC(file: Array<number> | ArrayBuffer | Uint8Array): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  const isHEIC = FileTypes.checkByFileType(fileChunk, "avif");
  if (!isHEIC) return false;

  // Determine if a file chunk contains a HEIC file box
  return isHeicSignatureIncluded(fileChunk);
}

/**
 * Determine if file content contains a valid 'ico' file signature
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type 'ico' in file content, otherwise false
 */
export function isICO(file: Array<number> | ArrayBuffer | Uint8Array): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  return FileTypes.checkByFileType(fileChunk, "ico");
}

/**
 * Determine if file content contains a valid 'jpeg' file signature
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type 'jpeg' in file content, otherwise false
 */
export function isJPEG(file: Array<number> | ArrayBuffer | Uint8Array): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  return FileTypes.checkByFileType(fileChunk, "jpeg");
}

/**
 * Determine if file content contains a valid 'pbm' file signature
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type 'pbm' in file content, otherwise false
 */
export function isPBM(file: Array<number> | ArrayBuffer | Uint8Array): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  return FileTypes.checkByFileType(fileChunk, "pbm");
}

/**
 * Determine if file content contains a valid 'pgm' file signature
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type 'pgm' in file content, otherwise false
 */
export function isPGM(file: Array<number> | ArrayBuffer | Uint8Array): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  return FileTypes.checkByFileType(fileChunk, "pgm");
}

/**
 * Determine if file content contains a valid 'png' file signature
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type 'png' in file content, otherwise false
 */
export function isPNG(file: Array<number> | ArrayBuffer | Uint8Array): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  return FileTypes.checkByFileType(fileChunk, "png");
}

/**
 * Determine if file content contains a valid 'ppm' file signature
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type 'ppm' in file content, otherwise false
 */
export function isPPM(file: Array<number> | ArrayBuffer | Uint8Array): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  return FileTypes.checkByFileType(fileChunk, "ppm");
}

/**
 * Determine if file content contains a valid 'psd' file signature
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type 'psd' in file content, otherwise false
 */
export function isPSD(file: Array<number> | ArrayBuffer | Uint8Array): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  return FileTypes.checkByFileType(fileChunk, "psd");
}

/**
 * Determine if file content contains a valid 'webp' file signature
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type 'webp' in file content, otherwise false
 */
export function isWEBP(file: Array<number> | ArrayBuffer | Uint8Array): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  return FileTypes.checkByFileType(fileChunk, "webp");
}

/**
 * Determine if file content contains a valid 'blend' file signature
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type 'blend' in file content, otherwise false
 */
export function isBLEND(file: Array<number> | ArrayBuffer | Uint8Array): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  return FileTypes.checkByFileType(fileChunk, "blend");
}

/**
 * Determine if file content contains a valid 'elf' file signature
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type 'elf' in file content, otherwise false
 */
export function isELF(file: Array<number> | ArrayBuffer | Uint8Array): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  return FileTypes.checkByFileType(fileChunk, "elf");
}

/**
 * Determine if file content contains a valid 'exe' file signature
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type 'exe' in file content, otherwise false
 */
export function isEXE(file: Array<number> | ArrayBuffer | Uint8Array): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  return FileTypes.checkByFileType(fileChunk, "exe");
}

/**
 * Determine if file content contains a valid 'mach-o' file signature
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type 'mach-o' in file content, otherwise false
 */
export function isMACHO(file: Array<number> | ArrayBuffer | Uint8Array): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  return FileTypes.checkByFileType(fileChunk, "macho");
}

/**
 * Determine if file content contains a valid 'indd' file signature
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type 'indd' in file content, otherwise false
 */
export function isINDD(file: Array<number> | ArrayBuffer | Uint8Array): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  return FileTypes.checkByFileType(fileChunk, "indd");
}

/**
 * Determine if file content contains a valid 'orc' file signature
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type 'orc' in file content, otherwise false
 */
export function isORC(file: Array<number> | ArrayBuffer | Uint8Array): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  return FileTypes.checkByFileType(fileChunk, "orc");
}

/**
 * Determine if file content contains a valid 'parquet' file signature
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type 'parquet' in file content, otherwise false
 */
export function isPARQUET(file: Array<number> | ArrayBuffer | Uint8Array): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  return FileTypes.checkByFileType(fileChunk, "parquet");
}

/**
 * Determine if file content contains a valid 'pdf' file signature
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type 'pdf' in file content, otherwise false
 */
export function isPDF(file: Array<number> | ArrayBuffer | Uint8Array): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  return FileTypes.checkByFileType(fileChunk, "pdf");
}

/**
 * Determine if file content contains a valid 'ps' file signature
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type 'ps' in file content, otherwise false
 */
export function isPS(file: Array<number> | ArrayBuffer | Uint8Array): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  return FileTypes.checkByFileType(fileChunk, "ps");
}

/**
 * Determine if file content contains a valid 'rtf' file signature
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type 'rtf' in file content, otherwise false
 */
export function isRTF(file: Array<number> | ArrayBuffer | Uint8Array): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  return FileTypes.checkByFileType(fileChunk, "rtf");
}

/**
 * Determine if file content contains a valid 'sqlite' file signature
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type 'sqlite' in file content, otherwise false
 */
export function isSQLITE(file: Array<number> | ArrayBuffer | Uint8Array): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  return FileTypes.checkByFileType(fileChunk, "sqlite");
}

/**
 * Determine if file content contains a valid 'stl' file signature
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type 'stl' in file content, otherwise false
 */
export function isSTL(file: Array<number> | ArrayBuffer | Uint8Array): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  return FileTypes.checkByFileType(fileChunk, "stl");
}

/**
 * Determine if file content contains a valid 'ttf' file signature
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type 'ttf' in file content, otherwise false
 */
export function isTTF(file: Array<number> | ArrayBuffer | Uint8Array): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  return FileTypes.checkByFileType(fileChunk, "ttf");
}

/**
 * Determine if file content contains a valid 'doc' file signature
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type 'doc' in file content, otherwise false
 */
export function isDOC(file: Array<number> | ArrayBuffer | Uint8Array): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  return FileTypes.checkByFileType(fileChunk, "doc");
}

/**
 * Determine if file content contains a valid 'pcap' file signature
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type 'pcap' in file content, otherwise false
 */
export function isPCAP(file: Array<number> | ArrayBuffer | Uint8Array): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  return FileTypes.checkByFileType(fileChunk, "pcap");
}

/**
 * Determine if file content contains a valid 'avi' file signature
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type 'avi' in file content, otherwise false
 */
export function isAVI(file: Array<number> | ArrayBuffer | Uint8Array): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  return FileTypes.checkByFileType(fileChunk, "avi");
}

/**
 * Determine if file content contains a valid 'flv' file signature.
 * Since 'flv' and 'm4v' share the same signature - additional check required - check if file content contains a "flv" string in the first few bytes of the file
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type 'flv' & "flv" string in file content, otherwise false
 */
export function isFLV(file: Array<number> | ArrayBuffer | Uint8Array): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  const isFlvSignature = FileTypes.checkByFileType(fileChunk, "flv");
  if (!isFlvSignature) return false;

  // Check if file content contains a "flv" string
  return isFlvStringIncluded(fileChunk);
}

/**
 * Determine if file content contains a valid 'm4v' file signature.
 * Since 'flv' and 'm4v' share the same signature - additional check required - check if file content contains a "ftyp" string in the first few bytes of the file
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type 'm4v' & "ftyp" string in file content, otherwise false
 */
export function isM4V(file: Array<number> | ArrayBuffer | Uint8Array): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  const isM4vSignature = FileTypes.checkByFileType(fileChunk, "m4v");
  if (!isM4vSignature) return false;

  // Check if file content contains a "ftyp" string
  return isftypStringIncluded(fileChunk);
}

/**
 * Determine if file content contains a valid 'mkv' file signature.
 * Since 'mkv' and 'webm' share the same signature - additional check required - search for the presence of the "Segment" element in the mkv header
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type 'mkv' & "ftyp" string in file content, otherwise false
 */
export function isMKV(file: Array<number> | ArrayBuffer | Uint8Array): boolean {
  const fileChunk: Array<number> = getFileChunk(file, 64); // Check the first 64 bytes of the file
  const isMkvSignature = FileTypes.checkByFileType(fileChunk, "mkv");
  if (!isMkvSignature) return false;

  // Search for the presence of the "Segment" element in the mkv header
  return findMatroskaDocTypeElements(fileChunk) === "mkv";
}

/**
 * Determine if file content contains a valid 'mov' file signature
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type 'mov' in file content, otherwise false
 */
export function isMOV(file: Array<number> | ArrayBuffer | Uint8Array): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  return FileTypes.checkByFileType(fileChunk, "mov");
}

/**
 * Determine if file content contains a valid 'mp4' file signature.
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 * @param options parameters for additional actions
 *
 * @returns {boolean} True if found a signature of type 'mp4' in file content, otherwise false
 */
export function isMP4(
  file: Array<number> | ArrayBuffer | Uint8Array,
  options?: FileValidatorOptions | undefined
): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  const isMp4 = FileTypes.checkByFileType(fileChunk, "mp4");

  if (!isMp4) {
    if (options?.excludeSimilarTypes) return false;
    return isM4V(fileChunk); // since 'm4v' is very similar to 'mp4'
  }

  return true;
}

/**
 * Determine if file content contains a valid 'ogg' file signature
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type 'ogg' in file content, otherwise false
 */
export function isOGG(file: Array<number> | ArrayBuffer | Uint8Array): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  return FileTypes.checkByFileType(fileChunk, "ogg");
}

/**
 * Determine if file content contains a valid 'swf' file signature
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type 'swf' in file content, otherwise false
 */
export function isSWF(file: Array<number> | ArrayBuffer | Uint8Array): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  return FileTypes.checkByFileType(fileChunk, "swf");
}

/**
 * Determine if file content contains a valid 'webm' file signature.
 * Since 'mkv' and 'webm' share the same signature - additional check required - search for the presence of the "DocType" element in the webm header
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type 'webm' & "ftyp" string in file content, otherwise false
 */
export function isWEBM(file: Array<number> | ArrayBuffer | Uint8Array): boolean {
  const fileChunk: Array<number> = getFileChunk(file, 64); // Check the first 64 bytes of the file
  const isWebmSignature = FileTypes.checkByFileType(fileChunk, "webm");
  if (!isWebmSignature) return false;

  // Search for the presence of the "DocType" element in the webm header
  return findMatroskaDocTypeElements(fileChunk) === "webm";
}

/**
 * Validates the requested file signature against a list of accepted file types
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 * @param types A list of accepted file types
 * @param options parameters for additional actions
 *
 * @returns {boolean} True if found a type signature from the accepted file types, otherwise false
 */
export function validateFileType(
  file: Array<number> | ArrayBuffer | Uint8Array,
  types: Array<string>,
  options?: ValidateFileTypeOptions | undefined
): boolean {
  let typeExtensions: Array<string> = [];
  const uniqueTypes = [
    ...new Set(
      types.map((type) => {
        const normalizedType = type.split(".").join("").toUpperCase();
        if (normalizedType === "7Z") return `_${normalizedType}`;
        return normalizedType;
      })
    ),
  ];
  for (const type of uniqueTypes) {
    if (!Object.prototype.hasOwnProperty.call(FileTypes, type))
      throw new TypeError(
        `Type \`${type.toLowerCase()}\` is not supported. Please make sure that \`types\` list conatins only supported files`
      );
    typeExtensions.push(type);
  }

  if (options && Object.prototype.hasOwnProperty.call(options, "chunkSize") && (options?.chunkSize ?? 0) <= 0)
    throw new RangeError("chunkSize must be bigger than zero");

  if (!options || !options?.excludeSimilarTypes) {
    const similarTypes: Array<string> = addSimilarTypes(typeExtensions);
    if (similarTypes.length > 0) typeExtensions = typeExtensions.concat(similarTypes);
  }

  let acceptedSignatures: Array<FileSignature> = [];
  const filesRequiredAdditionalCheck: Array<FileInfo> = [];
  for (const type of typeExtensions) {
    const extensionSignatures: ReadonlyArray<FileSignature.Type> = FileTypes.getSignaturesByName(type);
    acceptedSignatures = acceptedSignatures.concat(extensionSignatures);
    if (FILE_TYPES_REQUIRED_ADDITIONAL_CHECK.includes(type.toLowerCase())) {
      filesRequiredAdditionalCheck.push(FileTypes.getInfoByName(type));
    }
  }

  const fileChunk: Array<number> = getFileChunk(file, options?.chunkSize || 64);

  const detectedSignature = FileTypes.detectSignature(fileChunk, acceptedSignatures);

  if (!detectedSignature) return false;

  if (filesRequiredAdditionalCheck.length > 0) {
    const detectedFilesForAdditionalCheck: Array<FileInfo.Type> = filesRequiredAdditionalCheck.filter((frac) =>
      frac.signatures.includes(detectedSignature)
    );
    if (detectedFilesForAdditionalCheck.length > 0) {
      // Some files share the same signature. Additional check required
      const detectedType = FileTypes.detectTypeByAdditionalCheck(fileChunk, detectedFilesForAdditionalCheck);
      if (!detectedType) return false;

      return typeExtensions.some((df) => df.toLowerCase() === detectedType);
    }
  }

  return true;
}

function addSimilarTypes(requiredTypes: Array<string>): Array<string> {
  if (requiredTypes.some((type) => type === "MP4")) return ["M4V"];
  if (requiredTypes.some((type) => type === "AAC")) return ["M4A"];

  return [];
}
