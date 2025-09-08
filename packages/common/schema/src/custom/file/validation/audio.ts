import {FileTypes} from "../file-types";
import {getFileChunk} from "../utils";
import {FileValidatorOptions} from "../types";

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
  options?: FileValidatorOptions
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
export function isFLAC(
  file: Array<number> | ArrayBuffer | Uint8Array
): boolean {
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
