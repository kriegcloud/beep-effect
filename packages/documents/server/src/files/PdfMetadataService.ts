import { $DocumentsServerId } from "@beep/identity/packages";
import {
  constEmptyPdfMetadata,
  PdfEncryptedError,
  PdfFileTooLargeError,
  PdfInvalidError,
  PdfMetadata,
  type PdfMetadataValue,
  PdfParseError,
  PdfTimeoutError,
} from "@beep/schema/integrations/files/pdf-metadata";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Num from "effect/Number";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as Str from "effect/String";

const $I = $DocumentsServerId.create("files/PdfMetadataService");

/**
 * Represents a binary file for PDF metadata extraction.
 */
interface Binaryfile {
  /** Filename with extension (e.g., "document.pdf") */
  readonly name: string;
  /** The binary content of the file */
  readonly data: Uint8Array | ArrayBuffer;
}

/**
 * Get the size of a file or binary file data.
 * Handles both File (has size), Uint8Array (has byteLength), and ArrayBuffer (has byteLength).
 */
const getFileSize = (file: File | Binaryfile): number => {
  if ("size" in file && Num.isNumber(file.size)) {
    return file.size; // File object
  }
  // Binaryfile with data
  const data = (file as Binaryfile).data;
  if (data instanceof ArrayBuffer) {
    return data.byteLength;
  }
  return (data as Uint8Array).byteLength;
};

/**
 * Convert file data to Uint8Array.
 */
const toUint8Array = (file: File | Binaryfile): Effect.Effect<Uint8Array, PdfParseError> =>
  Effect.gen(function* () {
    if ("arrayBuffer" in file && P.isFunction(file.arrayBuffer)) {
      // File object
      const buffer = yield* Effect.tryPromise({
        try: () => file.arrayBuffer(),
        catch: (e) =>
          new PdfParseError({
            message: "Failed to read file as ArrayBuffer",
            cause: e,
            fileName: file.name,
            phase: "read",
          }),
      });
      return new Uint8Array(buffer);
    }
    // Binaryfile
    const data = (file as Binaryfile).data;
    if (data instanceof ArrayBuffer) {
      return new Uint8Array(data);
    }
    return data as Uint8Array;
  });

// Maximum file size for PDF metadata extraction (100MB)
const MAX_PDF_FILE_SIZE = 100 * 1024 * 1024;

// Default timeout for PDF extraction (30 seconds)
const DEFAULT_TIMEOUT_MS = 30_000;

/**
 * Parse a PDF date string to DateTime.
 * PDF dates can be in various formats including:
 * - D:YYYYMMDDHHmmSS
 * - D:YYYYMMDDHHmmSSOHH'mm'
 * - ISO 8601 strings
 */
const parsePdfDate = (dateInput: unknown): O.Option<DateTime.Utc> => {
  if (dateInput instanceof Date) {
    return DateTime.make(dateInput);
  }

  if (!P.isString(dateInput) || Str.isEmpty(dateInput)) {
    return O.none();
  }

  const dateStr = dateInput;

  // Handle PDF date format: D:YYYYMMDDHHmmSS or D:YYYYMMDDHHmmSSOHH'mm'
  if (Str.startsWith("D:")(dateStr)) {
    const cleaned = F.pipe(dateStr, Str.slice(2, dateStr.length));
    // Extract components: YYYY MM DD HH mm SS
    const year = F.pipe(cleaned, Str.slice(0, 4));
    const month = F.pipe(cleaned, Str.slice(4, 6)) || "01";
    const day = F.pipe(cleaned, Str.slice(6, 8)) || "01";
    const hour = F.pipe(cleaned, Str.slice(8, 10)) || "00";
    const minute = F.pipe(cleaned, Str.slice(10, 12)) || "00";
    const second = F.pipe(cleaned, Str.slice(12, 14)) || "00";

    const isoString = `${year}-${month}-${day}T${hour}:${minute}:${second}Z`;
    return DateTime.make(isoString);
  }

  // Try parsing as ISO date or other formats
  return DateTime.make(dateStr);
};

/**
 * Service interface for PDF metadata operations.
 */
interface PdfMetadataServiceShape {
  readonly extractMetadata: (
    file: File | Binaryfile
  ) => Effect.Effect<
    PdfMetadata,
    PdfParseError | PdfFileTooLargeError | PdfTimeoutError | PdfEncryptedError | PdfInvalidError
  >;

  readonly extractRaw: (
    file: File | Binaryfile
  ) => Effect.Effect<
    PdfMetadataValue,
    PdfParseError | PdfFileTooLargeError | PdfTimeoutError | PdfEncryptedError | PdfInvalidError
  >;
}

type PdfMetadataServiceEffect = Effect.Effect<PdfMetadataServiceShape, PdfParseError, never>;

/**
 * PDF metadata service for extracting metadata from PDF documents.
 *
 * Uses pdf-lib for metadata extraction. The library is lazily loaded on first use.
 */
export const pdfMetadataServiceEffect: PdfMetadataServiceEffect = Effect.gen(function* () {
  const pdfLib = yield* Effect.tryPromise({
    try: () => import("pdf-lib"),
    catch: (e) =>
      new PdfParseError({
        message: "Failed to load pdf-lib module",
        cause: e,
        phase: "load",
      }),
  });

  const { PDFDocument } = pdfLib;

  /**
   * Check file size before extraction.
   */
  const checkFileSize = (file: File | Binaryfile): Effect.Effect<void, PdfFileTooLargeError> =>
    Effect.gen(function* () {
      const size = getFileSize(file);
      if (size > MAX_PDF_FILE_SIZE) {
        return yield* Effect.fail(
          new PdfFileTooLargeError({
            message: `File too large for PDF extraction: ${size} bytes (max ${MAX_PDF_FILE_SIZE} bytes)`,
            fileName: file.name,
            fileSize: size,
            maxSize: MAX_PDF_FILE_SIZE,
          })
        );
      }
    });

  /**
   * Load PDF document from file data.
   */
  const loadPdfDocument = (
    data: Uint8Array,
    fileName: string
  ): Effect.Effect<Awaited<ReturnType<typeof PDFDocument.load>>, PdfParseError | PdfEncryptedError | PdfInvalidError> =>
    Effect.tryPromise({
      try: () =>
        PDFDocument.load(data, {
          // Don't throw on encrypted PDFs, we'll check manually
          ignoreEncryption: true,
          // Update modification info
          updateMetadata: false,
        }),
      catch: (e) => {
        const errorMessage = P.isObject(e) && "message" in e ? String(e.message) : String(e);

        // Check for encryption error
        if (
          Str.includes("encrypted")(Str.toLowerCase(errorMessage)) ||
          Str.includes("password")(Str.toLowerCase(errorMessage))
        ) {
          return new PdfEncryptedError({
            message: "PDF is encrypted and requires a password",
            fileName,
          });
        }

        // Check for invalid PDF
        if (
          Str.includes("invalid")(Str.toLowerCase(errorMessage)) ||
          Str.includes("not a pdf")(Str.toLowerCase(errorMessage)) ||
          Str.includes("magic number")(Str.toLowerCase(errorMessage))
        ) {
          return new PdfInvalidError({
            message: "File is not a valid PDF",
            fileName,
            cause: e,
          });
        }

        return new PdfParseError({
          message: "Failed to parse PDF document",
          cause: e,
          fileName,
          phase: "parse",
        });
      },
    });

  const extractRaw: PdfMetadataServiceShape["extractRaw"] = Effect.fn("extractRaw")(function* (file) {
    yield* checkFileSize(file);

    yield* Effect.annotateCurrentSpan("pdf.fileName", file.name);
    yield* Effect.annotateCurrentSpan("pdf.fileSize", getFileSize(file));

    const uint8Array = yield* toUint8Array(file);

    const pdfDoc = yield* F.pipe(
      loadPdfDocument(uint8Array, file.name),
      Effect.timeout(DEFAULT_TIMEOUT_MS),
      Effect.catchTag("TimeoutException", () =>
        Effect.fail(
          new PdfTimeoutError({
            message: `PDF extraction timed out after ${DEFAULT_TIMEOUT_MS}ms`,
            fileName: file.name,
            timeoutMs: DEFAULT_TIMEOUT_MS,
          })
        )
      )
    );

    // Check if encrypted
    const isEncrypted = pdfDoc.isEncrypted;

    // Extract raw metadata
    const raw: PdfMetadataValue = {
      title: pdfDoc.getTitle(),
      author: pdfDoc.getAuthor(),
      subject: pdfDoc.getSubject(),
      keywords: pdfDoc.getKeywords(),
      creator: pdfDoc.getCreator(),
      producer: pdfDoc.getProducer(),
      creationDate: pdfDoc.getCreationDate(),
      modificationDate: pdfDoc.getModificationDate(),
      pageCount: pdfDoc.getPageCount(),
      isEncrypted,
      fileSize: getFileSize(file),
    };

    return raw;
  });

  /**
   * Convert a string value to Option<string>, returning None for empty/undefined values.
   */
  const toStringOption = (value: unknown): O.Option<string> =>
    F.pipe(O.fromNullable(value), O.filter(P.isString), O.filter(Str.isNonEmpty));

  /**
   * Convert a number value to Option<number>, returning None for undefined values.
   */
  const toNumberOption = (value: unknown): O.Option<number> => F.pipe(O.fromNullable(value), O.filter(Num.isNumber));

  const extractMetadata: PdfMetadataServiceShape["extractMetadata"] = Effect.fn("extractMetadata")(function* (file) {
    const raw = yield* extractRaw(file);

    // Transform raw metadata to PdfMetadata schema with proper Option types
    return new PdfMetadata({
      title: toStringOption(raw.title),
      author: toStringOption(raw.author),
      subject: toStringOption(raw.subject),
      keywords: toStringOption(raw.keywords),
      creator: toStringOption(raw.creator),
      producer: toStringOption(raw.producer),
      creationDate: parsePdfDate(raw.creationDate),
      modificationDate: parsePdfDate(raw.modificationDate),
      pdfVersion: O.none(), // pdf-lib doesn't expose version directly
      pageCount: Num.isNumber(raw.pageCount) ? raw.pageCount : 0,
      isEncrypted: raw.isEncrypted === true,
      isLinearized: O.none(), // pdf-lib doesn't expose linearization status
      fileSize: toNumberOption(raw.fileSize),
      raw,
    });
  });

  return {
    extractRaw,
    extractMetadata,
  } satisfies PdfMetadataServiceShape;
});

/**
 * PDF metadata service as an Effect.Service for dependency injection.
 */
export class PdfMetadataService extends Effect.Service<PdfMetadataService>()($I`PdfMetadataService`, {
  accessors: true,
  dependencies: [],
  effect: pdfMetadataServiceEffect,
}) {}

export { constEmptyPdfMetadata };
