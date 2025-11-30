import { ArrayOfNumbers, ArrBuffer, Uint8Arr } from "@beep/schema/primitives";
import type { UnsafeTypes } from "@beep/types";
import * as A from "effect/Array";
import * as P from "effect/Predicate";
import type { FileInfo } from "./FileInfo";

/**
 * Determine if array of numbers is a legal file chunk
 *
 * @param fileChunk File content represents in Array<number>
 *
 * @returns {boolean} True if the file content is verified, otherwise false
 */

function isLegalChunk(fileChunk: Array<number>): boolean {
  return fileChunk.every((num) => P.and(P.isNumber, P.not(Number.isNaN))(num));
}

export function getFileChunk(
  file: ReadonlyArray<number> | ArrayBuffer | Uint8Array,
  fileChunkLength = 32 // default length - 32 bytes
): Array<number> {
  const fileToCheck: ReadonlyArray<number> | Uint8Array = file instanceof ArrayBuffer ? new Uint8Array(file) : file;
  let chunk: Array<number> = [];
  if (P.or(P.and(A.isArray, ArrayOfNumbers.is), P.or(ArrBuffer.is, Uint8Arr.is))(file)) {
    chunk = Array.from(fileToCheck.slice(0, fileChunkLength));
  } else {
    throw new TypeError(
      `Expected the \`file\` argument to be of type \`Array<number>\`, \`Uint8Array\`, or \`ArrayBuffer\`, got \`${typeof file}\``
    );
  }

  if (!isLegalChunk(chunk)) throw new TypeError(`File content contains illegal values`);

  return chunk;
}

/**
 * Fetch a property of a object by its name
 *
 * @param obj The required object
 * @param prop The property name
 *
 * @returns {FileInfo} A property of the required object
 */
export function fetchFromObject(obj: UnsafeTypes.UnsafeAny, prop: string): FileInfo.Type {
  const _index = prop.indexOf(".");
  if (_index > -1) {
    return fetchFromObject(obj[prop.slice(0, _index)], prop.slice(_index + 1));
  }
  return obj[prop];
}

/**
 * Identify whether a valid 'mkv'/'web' file is 'mkv' or 'webm'.
 * By checking for the presence of the "DocType" element in the 'webm' header.
 * Or by checking the presence of the "Segment" element in the 'mkv' header.
 *
 * @param fileChunk - A chunk from the beginning of a file content, represents in array of numbers
 *
 * @returns {string | undefined} 'webm' if found webm string A property of the required object
 */
export function findMatroskaDocTypeElements(fileChunk: Array<number>): string | undefined {
  const webmString = "webm";
  const mkvString = "matroska";

  const byteString = fileChunk.map((num) => String.fromCharCode(num)).join("");

  if (byteString.includes(webmString)) {
    return "webm";
  }

  if (byteString.includes(mkvString)) {
    return "mkv";
  }

  return undefined; // File type not identified
}

/**
 * Determine if array of numbers contains the "fytp" string.
 * M4V files typically have a "ftyp" box in the first few bytes, which can be checked by searching for the string "ftyp" in the buffer.
 *
 * @param fileChunk A chunk from the beginning of a file content, represents in array of numbers
 *
 * @returns {boolean} True if found the "ftyp" string in the fileChunk, otherwise false
 */
export function isftypStringIncluded(fileChunk: Array<number>): boolean {
  const ftypSignature = [0x66, 0x74, 0x79, 0x70] as const; // "ftyp" signature

  // Check the first few bytes for the "ftyp" signature
  for (let i = 0; i < fileChunk.length - ftypSignature.length; i++) {
    let found = true;
    for (let j = 0; j < ftypSignature.length; j++) {
      if (fileChunk[i + j] !== ftypSignature[j]) {
        found = false;
        break;
      }
    }
    if (found) {
      return true;
    }
  }
  return false;
}

/**
 * Determine if array of numbers contains the "FLV" string.
 * FLV files typically have a "FLV" string in the first few bytes of the file, which can be checked using TextDecoder or similar.
 *
 * @param fileChunk A chunk from the beginning of a file content, represents in array of numbers
 *
 * @returns {boolean} True if found the "FLV" string in the fileChunk, otherwise false
 */
export function isFlvStringIncluded(fileChunk: Array<number>): boolean {
  const signature = fileChunk.slice(0, 3);
  const signatureString = new TextDecoder().decode(new Uint8Array(signature));
  return signatureString.includes("FLV");
}

export function isFileContaineJfiforExifHeader(file: number[]): boolean {
  // Check if the fourth byte is one of the known JFIF or EXIF header markers
  const headerMarker = file[3];
  if (
    headerMarker === 0xe0 || // JFIF
    headerMarker === 0xe1 // EXIF
  ) {
    return true; // It's a JPEG file
  }
  return false;
}

/**
 * Determine if array of numbers contains the "ftypavif" string.
 * AVIF files typically have a "ftypavif" string at bytes 5-12 of the file, which can be checked using TextDecoder or similar.
 *
 * @param fileChunk A chunk from the beginning of a file content, represents in array of numbers
 *
 * @returns {boolean} True if found the "AVIF" string in the fileChunk, otherwise false
 */
export function isAvifStringIncluded(fileChunk: Array<number>): boolean {
  // Convert the relevant slice of the file chunk from hexadecimal to characters
  const signature = fileChunk
    .slice(4, 12)
    .map((hex) => String.fromCharCode(hex))
    .join("");
  return signature === "ftypavif";
}

/**
 * Determine if a file chunk contains a HEIC file box.
 * HEIC files typically have an 'ftyp' box with specific major brand signatures
 * such as 'heic', 'hevc', 'mif1', and 'msf1' which can be checked by searching
 * for these strings in the file chunk.
 *
 * @param fileChunk A chunk from the beginning of a file content, represented as an array of numbers.
 * @returns {boolean} True if found a HEIC signature in the fileChunk, otherwise false.
 */
export function isHeicSignatureIncluded(fileChunk: Array<number>): boolean {
  // Convert the first part of the file chunk to a string to check for signatures
  const byteString = fileChunk.map((num) => String.fromCharCode(num)).join("");

  // List of possible HEIC 'ftyp' signatures
  const heicSignatures = ["ftypheic", "ftyphevc", "ftypmif1", "ftypmsf1"] as const;

  // Check if any of the HEIC signatures are included in the byte string
  return heicSignatures.some((signature) => byteString.includes(signature));
}
