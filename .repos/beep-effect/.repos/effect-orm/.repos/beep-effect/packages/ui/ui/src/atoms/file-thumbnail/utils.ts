import { v4 as uuidv4 } from "uuid";

export const FILE_FORMATS = {
  txt: ["txt", "md", "rtf", "csv", "log"],
  zip: ["zip", "rar", "7z", "tar", "gz", "bz2", "xz", "iso"],
  audio: ["wav", "aif", "aiff", "mp3", "aac", "flac", "ogg", "m4a", "wma"],
  image: [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "webp",
    "bmp",
    "tif",
    "tiff",
    "heic",
    "heif",
    "ico",
    "jfif",
    "raw",
    "svg",
    "svg+xml",
    "indd",
  ],
  video: ["m4v", "avi", "mpg", "mpeg", "mp4", "webm", "mov", "flv", "mkv", "wmv", "3gp"],
  word: ["doc", "docx", "odt"],
  excel: ["xls", "xlsx", "ods", "csv"],
  powerpoint: ["ppt", "pptx", "odp"],
  pdf: ["pdf", "xps"],
  photoshop: ["psd"],
  illustrator: ["ai", "eps"],
} as const;

export const EXTRA_EXTENSIONS = ["folder"] as const;

export const FILE_ICONS: Record<FileFormat | "folder" | "unknown", string> = {
  txt: "ic-txt",
  zip: "ic-zip",
  pdf: "ic-pdf",
  word: "ic-word",
  image: "ic-img",
  audio: "ic-audio",
  video: "ic-video",
  excel: "ic-excel",
  unknown: "ic-file",
  folder: "ic-folder",
  photoshop: "ic-pts",
  illustrator: "ic-ai",
  powerpoint: "ic-power-point",
};

export type FileFormat = keyof typeof FILE_FORMATS;
export type FileExtension = (typeof FILE_FORMATS)[FileFormat][number];
export type AllExtensions = FileExtension | FileFormat | "folder";
export type FileInput = string | null;

export type FileMetaData = {
  readonly key?: string | undefined;
  readonly name: string;
  readonly type: string;
  readonly size: number;
  readonly path?: string | undefined;
  readonly lastModified?: number | undefined;
  readonly lastModifiedDate?: Date | undefined;
  readonly format?: FileFormat | "unknown" | undefined;
};

const ALL_EXTENSIONS = new Set<AllExtensions>([
  ...EXTRA_EXTENSIONS,
  ...Object.keys(FILE_FORMATS),
  ...Object.values(FILE_FORMATS).flat(),
] as AllExtensions[]);

/**
 * Maps file extensions to their corresponding file format.
 * Example: { 'jpg': 'image', 'mp3': 'audio', 'pdf': 'pdf' }
 */
const EXTENSION_TO_FORMAT: Record<string, FileFormat> = Object.fromEntries(
  Object.entries(FILE_FORMATS).flatMap(([format, exts]) => exts.map((ext) => [ext, format as FileFormat]))
);

const isSupportedExtension = (ext: string): ext is AllExtensions => ALL_EXTENSIONS.has(ext as AllExtensions);

/**
 * Extracts the file name from a URL or path.
 *
 * @example getFileName('https://site.com/docs/file.pdf?v=1') => 'file.pdf'
 * @example getFileName('/path/to/file%20name.txt') => 'file name.txt'
 */
export function getFileName(input?: FileInput | undefined): string {
  if (!input?.trim()) return "";

  try {
    const cleanInput = input.split(/[?#]/)[0]?.trim();
    return decodeURIComponent(cleanInput?.split("/").pop() || "");
  } catch {
    return "";
  }
}

/**
 * Extracts the file extension from a file name or MIME type.
 *
 * @example getFileExtension('file.pdf') => 'pdf'
 * @example getFileExtension('image/jpeg') => 'jpeg'
 * @example getFileExtension('mp3') => 'mp3'
 */
export function getFileExtension(input?: FileInput | undefined): AllExtensions | "unknown" {
  if (!input?.trim()) return "unknown";

  const cleanInput = input.trim().toLowerCase();
  const [mimeType, mimeSubtype] = cleanInput.split("/");
  const ext = getFileName(cleanInput).match(/\.([^.]+)$/)?.[1];

  // 1. Extract extension from file name or URL (e.g., 'file.pdf' -> 'pdf')
  if (ext && isSupportedExtension(ext)) return ext;

  // 2. Subtype from MIME type (e.g. 'jpeg' from 'image/jpeg')
  if (mimeSubtype && isSupportedExtension(mimeSubtype)) return mimeSubtype;

  // 3. Type from MIME type (e.g. 'image' from 'image/jpeg')
  if (mimeType && isSupportedExtension(mimeType)) return mimeType;

  // 4. Check if the whole input is a known extension
  if (isSupportedExtension(cleanInput)) return cleanInput;

  return "unknown";
}

/**
 * Detects the file format from file name or MIME type.
 *
 * @example detectFileFormat('photo.jpg') => 'image'
 * @example detectFileFormat('docx') => 'word'
 * @example detectFileFormat('audio/mp3') => 'audio'
 */
export function detectFileFormat(input?: FileInput | undefined): FileFormat | "unknown" {
  const ext = getFileExtension(input);
  return EXTENSION_TO_FORMAT[ext]! ?? ext;
}

/**
 * Returns the corresponding icon URL based on the file format.
 *
 * @example getFileIcon('file.pdf') => '/assets/icons/documents/ic-pdf.svg'
 * @example getFileIcon('image.png') => '/assets/icons/documents/ic-img.svg'
 */
export function getFileIcon(input?: FileInput | undefined): string {
  const format = detectFileFormat(input);
  const iconName = FILE_ICONS[format] || FILE_ICONS.unknown;

  return `/assets/icons/documents/${iconName}.svg`;
}

/**
 * Builds complete file metadata from a File object or file path.
 *
 * @example getFileMeta(fileObj)
 * @example getFileMeta('/path/to/file.png')
 */
export function getFileMeta(file?: File | string | null | undefined): FileMetaData {
  if (file instanceof File) {
    const formatFromMime = detectFileFormat(file.type);
    const formatFromName = detectFileFormat(file.name);

    return {
      key: uuidv4(),
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified,
      lastModifiedDate: new Date(file.lastModified),
      format: formatFromMime !== "unknown" ? formatFromMime : formatFromName,
      path: (file as File & { readonly path?: string | undefined }).path ?? file.webkitRelativePath,
    };
  }

  if (typeof file === "string") {
    return {
      key: file,
      path: file,
      size: 0,
      name: getFileName(file),
      type: getFileExtension(file),
      format: detectFileFormat(file),
    };
  }

  return {
    name: "",
    type: "",
    size: 0,
    format: "unknown",
  };
}
