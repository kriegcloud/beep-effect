import {
  fetchFromObject,
  findMatroskaDocTypeElements,
  isAvifStringIncluded,
} from "../utils";
import { AudioTypes } from "./audio";
import { CompressedTypes } from "./compressed";
import { OtherTypes } from "./other";
import { ImageTypes } from "./image";
import { isHEIC, isFLV, isM4V, isWEBM, isMKV } from "../validation";
import { VideoTypes } from "./video";
import {  FileInfo, type DetectedFileInfo } from "../FileInfo.schema";
import { FileSignature } from "../FileSignature.schema";
import { ExtKit} from "../extensions";
import * as Data from "effect/Data";
export const FILE_TYPES_REQUIRED_ADDITIONAL_CHECK = [
  ...ExtKit.pick(
  "m4v",
  "flv",
  "mp4",
  "mkv",
  "webm",
  "avif",
  "heic",
) as ReadonlyArray<string>
]

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
  public static getSignaturesByName(
    propertyName: string
  ): ReadonlyArray<FileSignature.Type> {
    const { signatures } = fetchFromObject(
      FileTypes,
      propertyName.toUpperCase()
    );
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
        if (signature.skippedBytes && signature.skippedBytes.includes(i)) {
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

    if (
      detectedExtensions.some((de) =>
        ["m4v", "flv", "mp4", "heic"].includes(de)
      )
    ) {
      if (detectedExtensions.includes("heic") && isHEIC(fileChunk))
        return "heic";
      const isFlv = isFLV(fileChunk);
      if (isFlv) return "flv";
      const isM4v = isM4V(fileChunk) && !isHEIC(fileChunk);
      if (isM4v) return "m4v";
      return "mp4";
    } else if (detectedExtensions.some((de) => ["mkv", "webm"].includes(de))) {
      const matroskaDocTypeElement = findMatroskaDocTypeElements(fileChunk);
      if (matroskaDocTypeElement === "mkv" && isMKV(fileChunk)) return "mkv";
      else if (matroskaDocTypeElement === "webm" && isWEBM(fileChunk))
        return "webm";
      return undefined;
    } else if (detectedExtensions.some((de) => ["avif"].includes(de))) {
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
        if (signature.skippedBytes && signature.skippedBytes.includes(i)) {
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
  public static checkByFileType(
    fileChunk: Array<number>,
    type: string
  ): boolean {
    if (Object.prototype.hasOwnProperty.call(FileTypes, type.toUpperCase())) {
      const acceptedSignatures: ReadonlyArray<FileSignature.Type> =
        FileTypes.getSignaturesByName(type.toUpperCase());

      const detectedSignature = FileTypes.detectSignature(
        fileChunk,
        acceptedSignatures
      );
      if (detectedSignature) return true;
    }
    return false;
  }
}

