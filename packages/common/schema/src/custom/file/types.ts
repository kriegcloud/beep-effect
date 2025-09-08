export interface FileValidatorOptions {
  excludeSimilarTypes?: boolean;
}

/**
 * Options used to pass to izZip function.
 */
export interface ZipValidatorOptions {
  chunkSize?: number;
}

/**
 * Options used to pass to validate file type function.
 */
export interface ValidateFileTypeOptions {
  chunkSize?: number;
  excludeSimilarTypes?: boolean;
}

/**
 * Options used to pass to detect file function.
 */
export interface DetectFileOptions {
  chunkSize?: number;
}

