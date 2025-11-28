import type { UnsafeTypes } from "@beep/types";
export default function compressFileName(fileName: UnsafeTypes.UnsafeAny): string {
  // Define the maximum length for the substring
  const maxSubstrLength = 18;

  // Check if the fileName is longer than the maximum length
  if (fileName.length > maxSubstrLength) {
    // Extract the first part of the fileName (before the extension)
    const fileNameWithoutExtension = fileName.split(".").slice(0, -1).join(".");

    // Extract the extension from the fileName
    const fileExtension = fileName.split(".").pop();

    // Calculate the length of characters to keep in the middle
    const charsToKeep = maxSubstrLength - (fileNameWithoutExtension.length + fileExtension.length + 3);

    // Create the compressed fileName
    return (
      fileNameWithoutExtension.substring(0, maxSubstrLength - fileExtension.length - 3) +
      "..." +
      fileNameWithoutExtension.slice(-charsToKeep) +
      "." +
      fileExtension
    );
  }
  // If the fileName is shorter than the maximum length, return it as is
  return fileName.trim();
}
