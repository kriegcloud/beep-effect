import { FileTypes } from "../file-types";
import {
  getFileChunk,
  isAvifStringIncluded,
  isHeicSignatureIncluded,
} from "../utils";

/**
 * Determine if file content contains a valid 'avif' file signature
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type 'avif' in file content, otherwise false
 */
export function isAVIF(
  file: Array<number> | ArrayBuffer | Uint8Array
): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  const isAVIF = FileTypes.checkByFileType(fileChunk, "avif");
  if (!isAVIF) return false;

  // Search for the presence of the "ftypavif" at bytes 5-12
  return isAvifStringIncluded(fileChunk);
}

/**
 * Determine if file content contains a valid 'bmp' file signature
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type 'bmp' in file content, otherwise false
 */
export function isBMP(file: Array<number> | ArrayBuffer | Uint8Array): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  return FileTypes.checkByFileType(fileChunk, "bmp");
}

/**
 * Determine if file content contains a valid 'bpg' file signature
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type 'bpg' in file content, otherwise false
 */
export function isBPG(file: Array<number> | ArrayBuffer | Uint8Array): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  return FileTypes.checkByFileType(fileChunk, "bpg");
}

/**
 * Determine if file content contains a valid 'cr2' file signature
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type 'cr2' in file content, otherwise false
 */
export function isCR2(file: Array<number> | ArrayBuffer | Uint8Array): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  return FileTypes.checkByFileType(fileChunk, "cr2");
}

/**
 * Determine if file content contains a valid 'exr' file signature
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type 'exr' in file content, otherwise false
 */
export function isEXR(file: Array<number> | ArrayBuffer | Uint8Array): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  return FileTypes.checkByFileType(fileChunk, "exr");
}

/**
 * Determine if file content contains a valid 'gif' file signature
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type 'gif' in file content, otherwise false
 */
export function isGIF(file: Array<number> | ArrayBuffer | Uint8Array): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  return FileTypes.checkByFileType(fileChunk, "gif");
}

/**
 * Determine if file content contains a valid 'heic' file signature
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type 'heic' in file content, otherwise false
 */
export function isHEIC(
  file: Array<number> | ArrayBuffer | Uint8Array
): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  const isHEIC = FileTypes.checkByFileType(fileChunk, "avif");
  if (!isHEIC) return false;

  // Determine if a file chunk contains a HEIC file box
  return isHeicSignatureIncluded(fileChunk);
}

/**
 * Determine if file content contains a valid 'ico' file signature
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type 'ico' in file content, otherwise false
 */
export function isICO(file: Array<number> | ArrayBuffer | Uint8Array): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  return FileTypes.checkByFileType(fileChunk, "ico");
}

/**
 * Determine if file content contains a valid 'jpeg' file signature
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type 'jpeg' in file content, otherwise false
 */
export function isJPEG(
  file: Array<number> | ArrayBuffer | Uint8Array
): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  return FileTypes.checkByFileType(fileChunk, "jpeg");
}

/**
 * Determine if file content contains a valid 'pbm' file signature
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type 'pbm' in file content, otherwise false
 */
export function isPBM(file: Array<number> | ArrayBuffer | Uint8Array): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  return FileTypes.checkByFileType(fileChunk, "pbm");
}

/**
 * Determine if file content contains a valid 'pgm' file signature
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type 'pgm' in file content, otherwise false
 */
export function isPGM(file: Array<number> | ArrayBuffer | Uint8Array): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  return FileTypes.checkByFileType(fileChunk, "pgm");
}

/**
 * Determine if file content contains a valid 'png' file signature
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type 'png' in file content, otherwise false
 */
export function isPNG(file: Array<number> | ArrayBuffer | Uint8Array): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  return FileTypes.checkByFileType(fileChunk, "png");
}

/**
 * Determine if file content contains a valid 'ppm' file signature
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type 'ppm' in file content, otherwise false
 */
export function isPPM(file: Array<number> | ArrayBuffer | Uint8Array): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  return FileTypes.checkByFileType(fileChunk, "ppm");
}

/**
 * Determine if file content contains a valid 'psd' file signature
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type 'psd' in file content, otherwise false
 */
export function isPSD(file: Array<number> | ArrayBuffer | Uint8Array): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  return FileTypes.checkByFileType(fileChunk, "psd");
}

/**
 * Determine if file content contains a valid 'webp' file signature
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 *
 * @returns {boolean} True if found a signature of type 'webp' in file content, otherwise false
 */
export function isWEBP(
  file: Array<number> | ArrayBuffer | Uint8Array
): boolean {
  const fileChunk: Array<number> = getFileChunk(file);
  return FileTypes.checkByFileType(fileChunk, "webp");
}
