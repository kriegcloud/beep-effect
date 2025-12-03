"use client";

import * as Effect from "effect/Effect";
import { useCallback, useRef, useState } from "react";
import { UploadFileService } from "./UploadFileService";
import type { FileUploadProgress, UploadConfig, UploadedFileResult, UploadPipelineError } from "./UploadModels";
import { type UploadPipelineResult, uploadFiles } from "./UploadPipeline";

/**
 * Options for the useUpload hook
 */
export interface UseUploadOptions {
  /** Called when individual file progress updates */
  readonly onProgress?: undefined | ((progress: FileUploadProgress) => void);
  /** Called when a single file completes successfully */
  readonly onSuccess?: undefined | ((result: UploadedFileResult) => void);
  /** Called when any error occurs */
  readonly onError?: undefined | ((error: UploadPipelineError) => void);
  /** Called when all uploads complete (with both successes and failures) */
  readonly onComplete?: undefined | ((result: UploadPipelineResult) => void);
  /** Default configuration for uploads */
  readonly config?: undefined | Omit<UploadConfig, "onProgress" | "onFileComplete" | "onError">;
}

/**
 * State of the upload progress for a single file
 */
export interface UploadProgressState {
  readonly fileId: string;
  readonly fileName: string;
  readonly loaded: number;
  readonly total: number;
  readonly percent: number;
  readonly status: "pending" | "uploading" | "completed" | "failed";
}

/**
 * Return type of the useUpload hook
 */
export interface UseUploadReturn {
  /** Upload multiple files */
  readonly upload: (files: FileList | File[] | ReadonlyArray<File>) => Promise<UploadPipelineResult>;
  /** Upload a single file */
  readonly uploadSingle: (file: File) => Promise<UploadedFileResult>;
  /** Whether any upload is currently in progress */
  readonly isUploading: boolean;
  /** Progress state for each file being uploaded */
  readonly progress: Map<string, UploadProgressState>;
  /** Reset the upload state */
  readonly reset: () => void;
  /** All completed uploads */
  readonly completed: ReadonlyArray<UploadedFileResult>;
  /** All errors that occurred */
  readonly errors: ReadonlyArray<UploadPipelineError>;
}

/**
 * React hook for handling file uploads with the Effect-based upload pipeline.
 *
 * Provides a simple interface for uploading files with progress tracking,
 * error handling, and completion callbacks.
 *
 * @example
 * ```tsx
 * function UploadButton() {
 *   const {
 *     upload,
 *     isUploading,
 *     progress,
 *     completed,
 *     errors
 *   } = useUpload({
 *     onProgress: (p) => console.log(`${p.fileName}: ${p.percent}%`),
 *     onSuccess: (result) => console.log('Uploaded:', result.key),
 *     onError: (error) => console.error('Error:', error.message),
 *   });
 *
 *   const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
 *     if (e.target.files) {
 *       const result = await upload(e.target.files);
 *       console.log('All done:', result);
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       <input type="file" multiple onChange={handleChange} disabled={isUploading} />
 *       {Array.from(progress.values()).map((p) => (
 *         <div key={p.fileId}>{p.fileName}: {p.percent.toFixed(0)}%</div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useUpload(options: UseUploadOptions = {}): UseUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<Map<string, UploadProgressState>>(new Map());
  const [completed, setCompleted] = useState<UploadedFileResult[]>([]);
  const [errors, setErrors] = useState<UploadPipelineError[]>([]);

  // Store options in ref to avoid stale closures
  const optionsRef = useRef(options);
  optionsRef.current = options;

  /**
   * Update progress for a specific file
   */
  const updateProgress = useCallback((fileProgress: FileUploadProgress) => {
    setProgress((prev) => {
      const next = new Map(prev);
      next.set(fileProgress.fileId, {
        ...fileProgress,
        status: fileProgress.percent >= 100 ? "completed" : "uploading",
      });
      return next;
    });

    optionsRef.current.onProgress?.(fileProgress);
  }, []);

  /**
   * Handle successful file upload
   */
  const handleSuccess = useCallback((result: UploadedFileResult) => {
    setProgress((prev) => {
      const next = new Map(prev);
      const existing = next.get(result.fileId);
      if (existing) {
        next.set(result.fileId, { ...existing, status: "completed", percent: 100 });
      }
      return next;
    });

    setCompleted((prev) => [...prev, result]);
    optionsRef.current.onSuccess?.(result);
  }, []);

  /**
   * Handle upload error
   */
  const handleError = useCallback((error: UploadPipelineError) => {
    if (error.fileName) {
      setProgress((prev) => {
        const next = new Map(prev);
        // Find the entry by fileName since we might not have fileId yet
        for (const [id, state] of next) {
          if (state.fileName === error.fileName) {
            next.set(id, { ...state, status: "failed" });
            break;
          }
        }
        return next;
      });
    }

    setErrors((prev) => [...prev, error]);
    optionsRef.current.onError?.(error);
  }, []);

  /**
   * Upload multiple files
   */
  const upload = useCallback(
    async (files: FileList | File[] | ReadonlyArray<File>): Promise<UploadPipelineResult> => {
      const fileArray = Array.from(files);
      if (fileArray.length === 0) {
        return { successes: [], failures: [] };
      }

      setIsUploading(true);

      // Initialize progress for all files
      const initialProgress = new Map<string, UploadProgressState>();
      fileArray.forEach((file, index) => {
        const tempId = `pending-${index}-${Date.now()}`;
        initialProgress.set(tempId, {
          fileId: tempId,
          fileName: file.name,
          loaded: 0,
          total: file.size,
          percent: 0,
          status: "pending",
        });
      });
      setProgress(initialProgress);

      try {
        const config: UploadConfig = {
          ...optionsRef.current.config,
          onProgress: updateProgress,
          onFileComplete: handleSuccess,
          onError: handleError,
        };

        const effect = uploadFiles(fileArray, config).pipe(Effect.provide(UploadFileService.Default));

        const result = await Effect.runPromise(effect);

        optionsRef.current.onComplete?.(result);
        return result;
      } catch (error) {
        const pipelineError: UploadPipelineError = {
          _tag: "PipelineError",
          code: "UNKNOWN",
          message: error instanceof Error ? error.message : String(error),
          cause: error,
        };
        handleError(pipelineError);

        return {
          successes: [],
          failures: [pipelineError],
        };
      } finally {
        setIsUploading(false);
      }
    },
    [updateProgress, handleSuccess, handleError]
  );

  /**
   * Upload a single file
   */
  const uploadSingle = useCallback(
    async (file: File): Promise<UploadedFileResult> => {
      const result = await upload([file]);

      if (result.successes.length > 0) {
        return result.successes[0]!;
      }

      if (result.failures.length > 0) {
        throw new Error(result.failures[0]!.message);
      }

      throw new Error("Upload failed with no error information");
    },
    [upload]
  );

  /**
   * Reset the upload state
   */
  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress(new Map());
    setCompleted([]);
    setErrors([]);
  }, []);

  return {
    upload,
    uploadSingle,
    isUploading,
    progress,
    reset,
    completed,
    errors,
  };
}
