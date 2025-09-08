import {
  FileTypes,
  FILE_TYPES_REQUIRED_ADDITIONAL_CHECK,
} from "../file-types";
import { FileSignature } from "../FileSignature.schema";
import { FileInfo } from "../FileInfo.schema"
import { getFileChunk } from "../utils";
import type { ValidateFileTypeOptions } from "../types";
export * from "./audio";
export * from "./compressed";
export * from "./image";
export * from "./other";
export * from "./video";

/**
 * Validates the requested file signature against a list of accepted file types
 *
 * @param file File content represents in Array<number> / ArrayBuffer / Uint8Array
 * @param types A list of accepted file types
 * @param options parameters for additional actions
 *
 * @returns {boolean} True if found a type signature from the accepted file types, otherwise false
 */
export function validateFileType(
  file: Array<number> | ArrayBuffer | Uint8Array,
  types: Array<string>,
  options?: ValidateFileTypeOptions
): boolean {
  let typeExtensions: Array<string> = [];
  const uniqueTypes = [
    ...new Set(
      types.map((type) => {
        const normalizedType = type.split(".").join("").toUpperCase();
        if (normalizedType === "7Z") return `_${normalizedType}`;
        return normalizedType;
      })
    ),
  ];
  for (const type of uniqueTypes) {
    if (!Object.prototype.hasOwnProperty.call(FileTypes, type))
      throw new TypeError(
        `Type \`${type.toLowerCase()}\` is not supported. Please make sure that \`types\` list conatins only supported files`
      );
    typeExtensions.push(type);
  }

  if (
    options &&
    Object.prototype.hasOwnProperty.call(options, "chunkSize") &&
    (options?.chunkSize ?? 0) <= 0
  )
    throw new RangeError("chunkSize must be bigger than zero");

  if (!options || !options?.excludeSimilarTypes) {
    const similarTypes: Array<string> = addSimilarTypes(typeExtensions);
    if (similarTypes.length > 0)
      typeExtensions = typeExtensions.concat(similarTypes);
  }

  let acceptedSignatures: Array<FileSignature> = [];
  const filesRequiredAdditionalCheck: Array<FileInfo> = [];
  for (const type of typeExtensions) {
    const extensionSignatures: ReadonlyArray<FileSignature.Type> =
      FileTypes.getSignaturesByName(type);
    acceptedSignatures = acceptedSignatures.concat(extensionSignatures);
    if (FILE_TYPES_REQUIRED_ADDITIONAL_CHECK.includes(type.toLowerCase())) {
      filesRequiredAdditionalCheck.push(FileTypes.getInfoByName(type));
    }
  }

  const fileChunk: Array<number> = getFileChunk(file, options?.chunkSize || 64);

  const detectedSignature = FileTypes.detectSignature(
    fileChunk,
    acceptedSignatures
  );

  if (!detectedSignature) return false;

  if (filesRequiredAdditionalCheck.length > 0) {
    const detectedFilesForAdditionalCheck: Array<FileInfo.Type> =
      filesRequiredAdditionalCheck.filter((frac) =>
        frac.signatures.includes(detectedSignature)
      );
    if (detectedFilesForAdditionalCheck.length > 0) {
      // Some files share the same signature. Additional check required
      const detectedType = FileTypes.detectTypeByAdditionalCheck(
        fileChunk,
        detectedFilesForAdditionalCheck
      );
      if (!detectedType) return false;

      return typeExtensions.some((df) => df.toLowerCase() === detectedType);
    }
  }

  return true;
}

function addSimilarTypes(requiredTypes: Array<string>): Array<string> {
  if (requiredTypes.some((type) => type === "MP4")) return ["M4V"];
  if (requiredTypes.some((type) => type === "AAC")) return ["M4A"];

  return [];
}
