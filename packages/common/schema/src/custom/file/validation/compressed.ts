import {FileTypes,} from "../file-types";
import {getFileChunk} from "../utils";
import type {ZipValidatorOptions} from "../types";

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
  options?: ZipValidatorOptions
): boolean {
  const fileChunk: Array<number> = getFileChunk(file, options?.chunkSize || 64);
  return FileTypes.checkByFileType(fileChunk, "zip");
}
