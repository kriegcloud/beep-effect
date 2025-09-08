import { stringLiteralKit } from "@beep/schema/kits";
import { RecordUtils } from "@beep/utils";
import type * as S from "effect/Schema";

export const VideoMimeTypeMap = {
  mp4: "video/mp4",
  webm: "video/webm",
  ogg: "video/ogg",
  ogv: "video/ogv",
  mv4: "video/mp4",
  avi: "video/x-msvideo",
  mkv: "video/x-matroska",
  flv: "video/x-flv",
  m4v: "video/x-m4v",
  mov: "video/quicktime",
  swf: "application/x-shockwave-flash"
} as const;

export const VideoMimeTypeKit = stringLiteralKit(...RecordUtils.recordStringValues(VideoMimeTypeMap), {
  enumMapping: [
    ["video/mp4", "mp4"],
    ["video/webm", "webm"],
    ["video/ogg", "ogg"],
    ["video/ogv", "ogv"],
    ["video/mp4", "video_mp4"],
    ["video/x-msvideo", "avi"],
    ["video/x-matroska", "mkv"],
    ["video/quicktime", "mov"],
    ["video/x-flv", "flv"],
    ["video/x-m4v", "m4v"],
    ["application/x-shockwave-flash", "swf"]
  ],
});

export const VideoExtKit = stringLiteralKit(
  "mp4",
  "webm",
  "ogg",
  "ogv",
  "m4v",
  "mov",
  "mv4",
  "swf",
  "avi",
  "mkv",
  "flv"
);

export class VideoMimeType extends VideoMimeTypeKit.Schema.annotations({
  schemaId: Symbol.for("@beep/schema/custom/file/extensions/VideoMimeType"),
  identifier: "VideoMimeType",
  title: "Video mime type",
  description: "Video mime type file extensions",
}) {
  static readonly Options = VideoMimeTypeKit.Options;
  static readonly Enum = VideoMimeTypeKit.Enum;
}

export class VideoExt extends VideoExtKit.Schema.annotations({
  schemaId: Symbol.for("@beep/schema/custom/file/extensions/VideoExt"),
  identifier: "VideoExt",
  title: "Video extension",
  description: "Video Mime type file extensions",
}) {
  static readonly Options = VideoExtKit.Options;
  static readonly Enum = VideoExtKit.Enum;
}

export namespace VideoExt {
  export type Type = S.Schema.Type<typeof VideoExt>;
  export type Encoded = S.Schema.Encoded<typeof VideoExt>;
}
