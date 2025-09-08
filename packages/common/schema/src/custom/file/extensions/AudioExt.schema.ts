import { stringLiteralKit } from "@beep/schema/kits";
import { RecordUtils } from "@beep/utils";
import type * as S from "effect/Schema";

export const AudioMimeTypeMap = {
  mp3: "audio/mpeg",
  wav: "audio/wav",
  amr: "audio/amr",
  ogg: "audio/ogg",
  aac: "audio/aac",
  flac: "audio/x-flac",
  m4a: "audio/x-m4a",
  wma: "audio/x-ms-wma",
  opus: "audio/opus",
  webm: "audio/webm",
  aiff: "audio/aiff",
} as const;

export const AudioMimeTypeKit = stringLiteralKit(...RecordUtils.recordStringValues(AudioMimeTypeMap), {
  enumMapping: [
    ["audio/amr", "amr"],
    ["audio/mpeg", "mp3"],
    ["audio/wav", "wav"],
    ["audio/ogg", "audio_ogg"],
    ["audio/aac", "aac"],
    ["audio/x-flac", "x-flac"],
    ["audio/x-m4a", "m4a"],
    ["audio/x-ms-wma", "wma"],
    ["audio/opus", "opus"],
    ["audio/webm", "audio_webm"],
    ["audio/aiff", "aiff"],
  ] as const,
});

export const AudioExtKit = stringLiteralKit(
  "flac",
  "amr",
  "mp3",
  "wav",
  "ogg",
  "aac",
  "flac",
  "m4a",
  "wma",
  "opus",
  "webm",
  "aiff"
);

export class AudioMimeType extends AudioMimeTypeKit.Schema.annotations({
  schemaId: Symbol.for("@beep/schema/custom/file/extensions/AudioMimeType"),
  identifier: "AudioMimeType",
  title: "Audio mime type",
  description: "Audio mime type file extensions",
}) {
  static readonly Options = AudioMimeTypeKit.Options;
  static readonly Enum = AudioMimeTypeKit.Enum;
}

export class AudioExt extends AudioExtKit.Schema.annotations({
  schemaId: Symbol.for("@beep/schema/custom/file/extensions/AudioExt"),
  identifier: "AudioExt",
  title: "Audio extension",
  description: "Audio Mime type file extensions",
}) {
  static readonly Options = AudioExtKit.Options;
  static readonly Enum = AudioExtKit.Enum;
}

export namespace AudioExt {
  export type Type = S.Schema.Type<typeof AudioExt>;
  export type Encoded = S.Schema.Encoded<typeof AudioExt>;
}
