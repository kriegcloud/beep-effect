import {stringLiteralKit} from "@beep/schema/kits";
import {RecordUtils} from "@beep/utils";
import type * as S from "effect/Schema";

export const ApplicationExtKit = stringLiteralKit(
  "json",
  "xml",
  "js",
  "mjs",
  "pdf",
  "zip",
  "xls",
  "xlsx",
  "doc",
  "docx",
  "lzh",
  "ppt",
  "rar",
  "pptx",
  "graphql",
  "gql",
  "tar",
  "gzip",
  "7z",
  "rtf",
  "blend",
  "elf",
  "exe",
  "indd",
  "macho",
  "orc",
  "parquet",
  "ps",
  "sqlite",
  "stl",
  "pcap",
  "ttf"
);

export const ApplicationMimeTypeMap = {
  blend: "application/x-blender",
  elf: "application/x-executable",
  exe: "application/x-msdownload",
  indd: "application/x-indesign",
  macho: "application/x-mach-binary",
  orc: "application/x-orc",
  parquet: "application/vnd.apache.parquet",
  ps: "application/postscript",
  sqlite: "application/x-sqlite3",
  stl: "application/sla",
  pcap: "application/vnd.tcpdump.pcap",
  //
  json: "application/json",
  xml: "application/xml",
  js: "application/javascript",
  pdf: "application/pdf",
  lzh: "application/x-lzh-compressed",
  zip: "application/zip",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  doc: "application/msword",
  rar: "application/x-rar-compressed",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  graphql: "application/graphql",
  gql: "application/graphql",
  tar: "application/x-tar",
  gzip: "application/gzip",
  "7z": "application/x-7z-compressed",
  rtf: "application/rtf",
  ttf: "application/x-font-ttf"
} as const;

export const applicationMimeTypeKit = stringLiteralKit(...RecordUtils.recordStringValues(ApplicationMimeTypeMap), {
  enumMapping: [
    ["application/x-blender", "blend"],
    ["application/x-executable", "elf"],
    ["application/x-msdownload", "exe"],
    ["application/x-indesign", "indd"],
    ["application/x-mach-binary", "macho"],
    ["application/x-orc", "orc"],
    ["application/vnd.apache.parquet", "parquet"],
    ["application/postscript", "ps"],
    ["application/x-sqlite3", "sqlite"],
    ["application/sla", "stl"],
    ["application/vnd.tcpdump.pcap", "pcap"],
    ["application/x-lzh-compressed", "lzh"],
    ["application/x-rar-compressed", "rar"],
    ["application/json", "application_json"],
    ["application/xml", "application_xml"],
    ["application/javascript", "application_js"],
    ["application/pdf", "pdf"],
    ["application/zip", "zip"],
    ["application/vnd.ms-excel", "xls"],
    ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "xlsx"],
    ["application/msword", "doc"],
    ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "docx"],
    ["application/vnd.ms-powerpoint", "ppt"],
    ["application/vnd.openxmlformats-officedocument.presentationml.presentation", "pptx"],
    ["application/graphql", "graphql"],
    ["application/graphql", "gql"],
    ["application/x-tar", "tar"],
    ["application/gzip", "gzip"],
    ["application/x-7z-compressed", "7z"],
    ["application/rtf", "rtf"],
    ["application/x-font-ttf", "app_ttf"]
  ],
});

export class ApplicationMimeType extends applicationMimeTypeKit.Schema.annotations({
  schemaId: Symbol.for("@beep/schema/custom/file/extensions/ApplicationMimeType"),
  identifier: "ApplicationMimeType",
  title: "Application mime type",
  description: "Application mime type file extensions",
}) {
  static readonly Options = applicationMimeTypeKit.Options;
  static readonly Enum = applicationMimeTypeKit.Enum;
}

export class ApplicationExt extends ApplicationExtKit.Schema.annotations({
  schemaId: Symbol.for("@beep/schema/custom/file/extensions/ApplicationExt"),
  identifier: "ApplicationExt",
  title: "Application extension",
  description: "Application Mime type file extensions",
}) {
  static readonly Options = ApplicationExtKit.Options;
  static readonly Enum = ApplicationExtKit.Enum;
}

export namespace ApplicationExt {
  export type Type = S.Schema.Type<typeof ApplicationExt>;
  export type Encoded = S.Schema.Encoded<typeof ApplicationExt>;
}
