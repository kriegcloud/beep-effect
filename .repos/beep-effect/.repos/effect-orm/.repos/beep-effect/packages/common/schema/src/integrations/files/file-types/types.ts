export interface FileValidatorOptions {
  readonly excludeSimilarTypes?: boolean | undefined;
}

/**
 * Options used to pass to izZip function.
 */
export interface ZipValidatorOptions {
  readonly chunkSize?: number | undefined;
}

/**
 * Options used to pass to validate file type function.
 */
export interface ValidateFileTypeOptions {
  readonly chunkSize?: number | undefined;
  readonly excludeSimilarTypes?: boolean | undefined;
}

/**
 * Options used to pass to detect file function.
 */
export interface DetectFileOptions {
  readonly chunkSize?: number | undefined;
}
