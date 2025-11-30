import type { UnsafeTypes } from "@beep/types";
import { pipe } from "effect";
import * as A from "effect/Array";
import * as Str from "effect/String";
export default function compressFileName(fileName: UnsafeTypes.UnsafeAny): string {
  // Define the maximum length for the substring
  const maxSubstrLength = 18;

  // Check if the fileName is longer than the maximum length
  if (fileName.length > maxSubstrLength) {
    // Extract the first part of the fileName (before the extension)
    const fileNameWithoutExtension = pipe(Str.split(".")(fileName).slice(0, -1), A.join("."));

    // Extract the extension from the fileName
    const fileExtension = fileName.split(".").pop();

    // Calculate the length of characters to keep in the middle
    const charsToKeep = maxSubstrLength - (fileNameWithoutExtension.length + fileExtension.length + 3);

    // Create the compressed fileName
    return (
      Str.substring(0, maxSubstrLength - fileExtension.length - 3)(fileNameWithoutExtension) +
      "..." +
      Str.slice(-charsToKeep)(fileNameWithoutExtension) +
      "." +
      fileExtension
    );
  }
  // If the fileName is shorter than the maximum length, return it as is
  return Str.trim(fileName);
}
