import type { ExtendFile } from "./types";

// Define more types here
const FORMAT_PDF = ["pdf"];
const FORMAT_TEXT = ["txt"];
const FORMAT_PHOTOSHOP = ["psd"];
const FORMAT_WORD = ["doc", "docx"];
const FORMAT_EXCEL = ["xls", "xlsx"];
const FORMAT_ZIP = ["zip", "rar", "iso"];
const FORMAT_ILLUSTRATOR = ["ai", "esp"];
const FORMAT_POWERPOINT = ["ppt", "pptx"];
const FORMAT_AUDIO = ["wav", "aif", "mp3", "aac"];
const FORMAT_IMG = ["jpg", "jpeg", "gif", "bmp", "png", "svg", "webp"];
const FORMAT_VIDEO = ["m4v", "avi", "mpg", "mp4", "webm"];

const iconUrl = (icon: string) => `/assets/icons/files/${icon}.svg`;

export function fileFormat(fileUrl: string) {
  let format: string;

  const fileByUrl = fileTypeByUrl(fileUrl);

  switch (fileUrl.includes(fileByUrl)) {
    case FORMAT_TEXT.includes(fileByUrl):
      format = "txt";
      break;
    case FORMAT_ZIP.includes(fileByUrl):
      format = "zip";
      break;
    case FORMAT_AUDIO.includes(fileByUrl):
      format = "audio";
      break;
    case FORMAT_IMG.includes(fileByUrl):
      format = "image";
      break;
    case FORMAT_VIDEO.includes(fileByUrl):
      format = "video";
      break;
    case FORMAT_WORD.includes(fileByUrl):
      format = "word";
      break;
    case FORMAT_EXCEL.includes(fileByUrl):
      format = "excel";
      break;
    case FORMAT_POWERPOINT.includes(fileByUrl):
      format = "powerpoint";
      break;
    case FORMAT_PDF.includes(fileByUrl):
      format = "pdf";
      break;
    case FORMAT_PHOTOSHOP.includes(fileByUrl):
      format = "photoshop";
      break;
    case FORMAT_ILLUSTRATOR.includes(fileByUrl):
      format = "illustrator";
      break;
    default:
      format = fileTypeByUrl(fileUrl);
  }

  return format;
}

export function fileThumb(fileUrl: string) {
  let thumb: string;

  switch (fileFormat(fileUrl)) {
    case "folder":
      thumb = iconUrl("ic-folder");
      break;
    case "txt":
      thumb = iconUrl("ic-txt");
      break;
    case "zip":
      thumb = iconUrl("ic-zip");
      break;
    case "audio":
      thumb = iconUrl("ic-audio");
      break;
    case "video":
      thumb = iconUrl("ic-video");
      break;
    case "word":
      thumb = iconUrl("ic-word");
      break;
    case "excel":
      thumb = iconUrl("ic-excel");
      break;
    case "powerpoint":
      thumb = iconUrl("ic-power_point");
      break;
    case "pdf":
      thumb = iconUrl("ic-pdf");
      break;
    case "photoshop":
      thumb = iconUrl("ic-pts");
      break;
    case "illustrator":
      thumb = iconUrl("ic-ai");
      break;
    case "image":
      thumb = iconUrl("ic-img");
      break;
    default:
      thumb = iconUrl("ic-file");
  }
  return thumb;
}

export function fileTypeByUrl(fileUrl: string) {
  return fileUrl.split(".").pop() || "";
}

export function fileNameByUrl(fileUrl: string) {
  return fileUrl.split("/").pop();
}

export function fileData(file: File | string) {
  // From url
  if (typeof file === "string") {
    return {
      preview: file,
      name: fileNameByUrl(file),
      type: fileTypeByUrl(file),
      size: undefined,
      path: file,
      lastModified: undefined,
      lastModifiedDate: undefined,
    };
  }

  // From file
  return {
    name: file.name,
    size: file.size,
    path: (file as ExtendFile).path,
    type: file.type,
    preview: (file as ExtendFile).preview,
    lastModified: file.lastModified,
    lastModifiedDate: (file as ExtendFile).lastModifiedDate,
  };
}
