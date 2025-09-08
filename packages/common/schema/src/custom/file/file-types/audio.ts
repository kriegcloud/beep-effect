import * as Data from "effect/Data";
import { FileInfo } from "@beep/schema/custom/file/FileInfo.schema";

export class AudioTypes extends Data.TaggedClass("AudioTypes") {
  static readonly AAC = FileInfo.make({
    extension: "aac",
    mimeType: "audio/aac",
    description:
      "Advanced Audio Coding (AAC) is an audio coding standard for lossy digital audio compression",
    signatures: [
      {
        sequence: [0xff, 0xf1],
        description:
          "MPEG-4 Advanced Audio Coding (AAC) Low Complexity (LC) audio file",
      },
      {
        sequence: [0xff, 0xf9],
        description:
          "MPEG-2 Advanced Audio Coding (AAC) Low Complexity (LC) audio file",
      },
    ],
  })
  static readonly AMR = FileInfo.make({
    extension: "amr",
    mimeType: "audio/amr",
    description:
      "Adaptive Multi-Rate ACELP (Algebraic Code Excited Linear Prediction) Codec, commonly audio format with GSM cell phones",
    signatures: [
      {
        sequence: [0x23, 0x21, 0x41, 0x4d, 0x52],
      },
    ],
  });

  static readonly FLAC: FileInfo = {
    extension: "flac",
    mimeType: "audio/x-flac",
    description: "Free Lossless Audio Codec file",
    signatures: [
      {
        sequence: [0x66, 0x4c, 0x61, 0x43, 0x00, 0x00, 0x00, 0x22],
      },
    ],
  };

  static readonly M4A = FileInfo.make({
    extension: "m4a",
    mimeType: "audio/x-m4a",
    description: "Apple Lossless Audio Codec file",
    signatures: [
      {
        sequence: [0x66, 0x74, 0x79, 0x70, 0x4d, 0x34, 0x41, 0x20],
        offset: 4,
        compatibleExtensions: ["aac"],
      },
    ],
  });

  static readonly MP3 = FileInfo.make({
    extension: "mp3",
    mimeType: "audio/mpeg",
    description:
      "A digital audio file format that uses compression to reduce file size while maintaining high quality sound",
    signatures: [
      {
        sequence: [0xff, 0xfb],
        description:
          "MPEG-1 Layer 3 file without an ID3 tag or with an ID3v1 tag (which is appended at the end of the file)",
      },
      {
        sequence: [0xff, 0xf3],
        description:
          "MPEG-1 Layer 3 file without an ID3 tag or with an ID3v1 tag (which is appended at the end of the file)",
      },
      {
        sequence: [0xff, 0xf2],
        description:
          "MPEG-1 Layer 3 file without an ID3 tag or with an ID3v1 tag (which is appended at the end of the file)",
      },
      {
        sequence: [0x49, 0x44, 0x33],
        description: "MP3 file with an ID3v2 container",
      },
    ],
  });

  static readonly WAV = FileInfo.make({
    extension: "wav",
    mimeType: "audio/wav",
    description: "Waveform Audio File Format",
    signatures: [
      {
        sequence: [
          0x52, 0x49, 0x46, 0x46, 0x57, 0x41, 0x56, 0x45, 0x66, 0x6d, 0x74,
          0x20,
        ],
        skippedBytes: [4, 5, 6, 7],
      },
    ],
  })
}