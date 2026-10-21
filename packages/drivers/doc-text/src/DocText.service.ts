/**
 * JS-native PDF and DOCX text extraction engine.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { ExtractionResult } from "@beep/file-processing/Extraction";
import { DetectionResult, FileProcessingOperationError } from "@beep/file-processing/Operation";
import { classifyFormatFromExtension, FileProcessingEngineDescriptor } from "@beep/file-processing/Strategy";
import * as A from "@beep/utils/Array";
import * as O from "@beep/utils/Option";
import * as Effect from "effect/Effect";
import * as Match from "effect/Match";
import * as MutableHashSet from "effect/MutableHashSet";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { Unzip, UnzipInflate, zipSync } from "fflate";
import mammoth from "mammoth";
import { SaxesParser } from "saxes";
import { extractText, getDocumentProxy } from "unpdf";
import { DocTextError, makeDocTextError } from "./DocText.errors.ts";
import type {
  DetectFileOperation,
  ExportArchiveOperation,
  ExtractFileOperation,
} from "@beep/file-processing/Operation";
import type { FileProcessingEngineShape } from "@beep/file-processing/Service";

/**
 * Version of the canonical text emitted by the JS-native document extractor.
 *
 * **Details**
 *
 * Increment this value when PDF or DOCX extraction semantics change in a way
 * that can alter the canonical text or its UTF-16 offsets.
 *
 * **Example** (Log engine version constant)
 *
 * ```ts
 * import { DOC_TEXT_ENGINE_VERSION } from "@beep/doc-text"
 *
 * console.log(DOC_TEXT_ENGINE_VERSION) // "1"
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const DOC_TEXT_ENGINE_VERSION = "1";

/**
 * JS-native document text file-processing engine descriptor.
 *
 * **Details**
 *
 * The capability contract currently groups text engines under the `tika`
 * engine family; the concrete `doc-text-js` name distinguishes this runtime.
 *
 * **Example** (Log supported formats list)
 *
 * ```ts
 * import { DocTextFileProcessingEngineDescriptor } from "@beep/doc-text"
 *
 * console.log(DocTextFileProcessingEngineDescriptor.supportedFormats) // ["pdf-text-layer", "docx"]
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export const DocTextFileProcessingEngineDescriptor = FileProcessingEngineDescriptor.make({
  capabilities: ["detect", "extract-text"],
  engine: "tika",
  name: "doc-text-js",
  supportedFormats: ["pdf-text-layer", "docx"],
  version: DOC_TEXT_ENGINE_VERSION,
});

const operationFailure = (operation: ExtractFileOperation, error: DocTextError): FileProcessingOperationError =>
  Match.value(error.reason).pipe(
    Match.when("empty-text-layer", () =>
      FileProcessingOperationError.fromReason("file-extraction-failed", {
        artifactId: operation.source.id,
        details: { outcome: "empty-text-layer", ocr: "disabled" },
        engine: DocTextFileProcessingEngineDescriptor.name,
        format: operation.format,
        message: "The PDF has no extractable text layer and OCR is disabled.",
        operationId: operation.operationId,
      })
    ),
    Match.when("source-bytes-unavailable", () =>
      FileProcessingOperationError.fromReason("file-extraction-failed", {
        artifactId: operation.source.id,
        engine: DocTextFileProcessingEngineDescriptor.name,
        format: operation.format,
        message: "Document extraction requires in-memory source bytes.",
        operationId: operation.operationId,
      })
    ),
    Match.when("input-limit", () =>
      FileProcessingOperationError.fromReason("output-limit-exceeded", {
        artifactId: operation.source.id,
        engine: DocTextFileProcessingEngineDescriptor.name,
        format: operation.format,
        message: "Document source or expanded contents exceed the extraction resource limits.",
        operationId: operation.operationId,
      })
    ),
    Match.orElse(() =>
      FileProcessingOperationError.fromReason("file-extraction-failed", {
        artifactId: operation.source.id,
        engine: DocTextFileProcessingEngineDescriptor.name,
        format: operation.format,
        message: "Document text extraction failed inside the driver boundary.",
        operationId: operation.operationId,
      })
    )
  );

const sourceBytes = (operation: ExtractFileOperation): Effect.Effect<Uint8Array, DocTextError> =>
  O.fromUndefinedOr(operation.source.bytes).pipe(
    O.match({
      onNone: () => Effect.fail(makeDocTextError("source-bytes-unavailable")),
      onSome: (bytes) =>
        O.fromUndefinedOr(operation.maxMaterializedBytes).pipe(O.exists((limit) => bytes.byteLength > limit))
          ? Effect.fail(makeDocTextError("input-limit"))
          : Effect.succeed(bytes),
    })
  );

const extractPdf = Effect.fn("DocTextFileProcessingEngine.extractPdf")(function* (
  operation: ExtractFileOperation
): Effect.fn.Return<ExtractionResult, DocTextError> {
  const bytes = yield* sourceBytes(operation);
  const result = yield* Effect.tryPromise({
    // pdfjs transfers the input buffer to its parser, detaching the caller's
    // view; hand it a copy so the operation's source bytes stay intact. Keep
    // recoverable parser warnings inside this driver boundary; extraction
    // failures are returned through the typed operation error below.
    try: () =>
      getDocumentProxy(new Uint8Array(bytes), { verbosity: 0 }).then((proxy) =>
        extractText(proxy, { mergePages: true })
      ),
    catch: () => makeDocTextError("extraction"),
  });

  if (Str.isEmpty(Str.trim(result.text))) {
    return yield* makeDocTextError("empty-text-layer");
  }

  return ExtractionResult.make({
    engine: DocTextFileProcessingEngineDescriptor.name,
    engineVersion: DOC_TEXT_ENGINE_VERSION,
    format: operation.format,
    metadata: { "pdf.totalPages": `${result.totalPages}` },
    operationId: operation.operationId,
    sourceArtifactId: operation.source.id,
    text: result.text,
    warnings: [],
  });
});

// Bound actual streamed output, not ZIP size declarations. Rebuild a stored
// archive from only the validated local entries so JSZip cannot later select
// a different, unvalidated entry from an inconsistent central directory.
const DOCX_MAX_SOURCE_BYTES = 20 * 1024 * 1024;
const DOCX_MAX_EXPANDED_BYTES = 8 * 1024 * 1024;
const DOCX_MAX_ENTRIES = 512;
const DOCX_MAX_XML_NODES = 50_000;
const DOCX_MAX_XML_DEPTH = 128;
const DOCX_COMPRESSED_CHUNK_BYTES = 1_024;

const boundedDocx = Effect.fn("DocTextFileProcessingEngine.boundDocx")((bytes: Uint8Array, maxBytes: number) =>
  Effect.try({
    try: () => {
      if (bytes.byteLength > DOCX_MAX_SOURCE_BYTES) throw makeDocTextError("input-limit");
      let total = 0;
      let entries = 0;
      let completed = 0;
      let nodes = 0;
      let files = R.empty<string, Uint8Array>();
      const names = MutableHashSet.empty<string>();
      const xmlParts = MutableHashSet.empty<string>();
      const parsedParts = MutableHashSet.empty<string>();
      const exceeded = () => {
        throw makeDocTextError("input-limit");
      };
      const chargeNode = () => {
        if (++nodes > DOCX_MAX_XML_NODES) exceeded();
      };
      const unzip = new Unzip((file) => {
        if (++entries > DOCX_MAX_ENTRIES) exceeded();
        // JSZip resolves dot segments and empty components when loading names.
        // Reject aliases so it cannot overwrite a validated part after repacking.
        if (
          MutableHashSet.has(names, file.name) ||
          Str.startsWith("/")(file.name) ||
          Str.includes("\\")(file.name) ||
          Str.includes("//")(file.name) ||
          A.some(Str.split("/")(file.name), (part) => part === "." || part === "..")
        ) {
          throw makeDocTextError("extraction");
        }
        MutableHashSet.add(names, file.name);
        if (file.originalSize !== undefined && file.originalSize > maxBytes - total) exceeded();
        let chunks: ReadonlyArray<Uint8Array> = [];
        file.ondata = (error, data, final) => {
          if (error !== null) throw S.is(DocTextError)(error) ? error : makeDocTextError("extraction");
          total += data.byteLength;
          if (total > maxBytes) exceeded();
          chunks = A.append(chunks, data);
          if (!final) return;
          ++completed;
          files = R.set(files, file.name, Buffer.concat(chunks));
          if (Str.endsWith(".xml")(file.name) || Str.endsWith(".rels")(file.name)) {
            MutableHashSet.add(xmlParts, file.name);
          }
        };
        file.start();
      });
      unzip.register(UnzipInflate);
      // UnzipInflate uses streaming Inflate, which retains only its history and
      // incomplete compressed token. A small push bounds temporary output even
      // when the local or central uncompressed-size declaration is dishonest.
      for (let offset = 0; offset < bytes.byteLength; offset += DOCX_COMPRESSED_CHUNK_BYTES) {
        unzip.push(
          bytes.subarray(offset, offset + DOCX_COMPRESSED_CHUNK_BYTES),
          offset + DOCX_COMPRESSED_CHUNK_BYTES >= bytes.byteLength
        );
      }
      if (entries === 0 || entries !== completed) throw makeDocTextError("extraction");

      // Mammoth follows these relationship types regardless of the target's
      // extension. Discover them from validated relationship parts rather than
      // guessing whether arbitrary binary members look like XML.
      const xmlRelationshipTypes = ["officeDocument", "comments", "endnotes", "footnotes", "numbering", "styles"];
      const rememberRelationship = (name: string, type: string | undefined, target: string | undefined) => {
        if (
          type === undefined ||
          target === undefined ||
          !A.some(
            xmlRelationshipTypes,
            (part) => type === `http://schemas.openxmlformats.org/officeDocument/2006/relationships/${part}`
          )
        )
          return;
        // Mammoth's joinPath concatenates relative targets, resets the
        // base for an absolute target, then strips exactly one leading /.
        // JSZip.file(name) is an exact lookup: it does not resolve .., .,
        // repeated slashes or percent escapes in relationship targets.
        const base = Str.replace(/(?:^|\/)_rels\/[^/]*$/, "")(name);
        const targetName = Str.startsWith("/")(target)
          ? Str.slice(1)(target)
          : Str.isEmpty(base)
            ? target
            : `${base}/${target}`;
        MutableHashSet.add(xmlParts, targetName);
      };
      const parsePart = (name: string) => {
        const content = files[name];
        if (content === undefined) return;
        // Match Mammoth's UTF-8 read and office-xml-reader BOM stripping.
        // Do not transcode parts: that would change canonical extraction text.
        const text = Str.replace(/^\uFEFF+/, "")(new TextDecoder("utf-8", { fatal: true }).decode(content));
        let depth = 0;
        const parser = new SaxesParser({ xmlns: false });
        parser.on("doctype", exceeded);
        parser.on("opentag", (tag) => {
          chargeNode();
          if (++depth > DOCX_MAX_XML_DEPTH) exceeded();
          if (!Str.endsWith(".rels")(name) || !(tag.name === "Relationship" || Str.endsWith(":Relationship")(tag.name)))
            return;
          rememberRelationship(name, tag.attributes.Type, tag.attributes.Target);
        });
        parser.on("closetag", () => {
          --depth;
        });
        parser.on("attribute", chargeNode);
        parser.on("text", chargeNode);
        parser.on("cdata", chargeNode);
        parser.on("comment", chargeNode);
        parser.on("processinginstruction", chargeNode);
        parser.write(text).close();
      };
      let pending = A.fromIterable(xmlParts);
      while (pending.length > 0) {
        for (const name of pending) {
          MutableHashSet.add(parsedParts, name);
          parsePart(name);
        }
        pending = A.filter(A.fromIterable(xmlParts), (name) => !MutableHashSet.has(parsedParts, name));
      }
      return zipSync(files, { level: 0 });
    },
    catch: (cause) => (S.is(DocTextError)(cause) ? cause : makeDocTextError("extraction")),
  })
);

const extractDocx = Effect.fn("DocTextFileProcessingEngine.extractDocx")(function* (
  operation: ExtractFileOperation
): Effect.fn.Return<ExtractionResult, DocTextError> {
  const bytes = yield* sourceBytes(operation);
  const archive = yield* boundedDocx(
    bytes,
    Math.min(operation.maxMaterializedBytes ?? DOCX_MAX_EXPANDED_BYTES, DOCX_MAX_EXPANDED_BYTES)
  );
  const result = yield* Effect.tryPromise({
    try: () => mammoth.extractRawText({ buffer: Buffer.from(archive) }),
    catch: () => makeDocTextError("extraction"),
  });

  return ExtractionResult.make({
    engine: DocTextFileProcessingEngineDescriptor.name,
    engineVersion: DOC_TEXT_ENGINE_VERSION,
    format: operation.format,
    metadata: {},
    operationId: operation.operationId,
    sourceArtifactId: operation.source.id,
    text: result.value,
    warnings: A.map(result.messages, (message) => message.message),
  });
});

/**
 * Create the JS-native PDF and DOCX text extraction engine.
 *
 * **Example** (Create engine and log name)
 *
 * ```ts
 * import { makeDocTextFileProcessingEngine } from "@beep/doc-text"
 *
 * const engine = makeDocTextFileProcessingEngine()
 * console.log(engine.descriptor.name) // "doc-text-js"
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const makeDocTextFileProcessingEngine = (): FileProcessingEngineShape => ({
  descriptor: DocTextFileProcessingEngineDescriptor,
  detect: Effect.fn("DocTextFileProcessingEngine.detect")(function* (operation: DetectFileOperation) {
    const format = classifyFormatFromExtension(operation.source.extension);

    return DetectionResult.make({
      confidence: DocTextFileProcessingEngineDescriptor.supportsFormat(format) ? 1 : 0,
      engine: DocTextFileProcessingEngineDescriptor.name,
      format,
      operationId: operation.operationId,
      sourceArtifactId: operation.source.id,
      ...O.getSomesStruct({
        mediaType: O.fromUndefinedOr(operation.source.mediaType),
      }),
    });
  }),
  exportArchive: Effect.fn("DocTextFileProcessingEngine.exportArchive")(function* (operation: ExportArchiveOperation) {
    return yield* FileProcessingOperationError.fromReason("unsupported-file-format", {
      artifactId: operation.source.id,
      engine: DocTextFileProcessingEngineDescriptor.name,
      format: operation.format,
      message: "The document text driver does not export archive children.",
      operationId: operation.operationId,
    });
  }),
  extract: Effect.fn("DocTextFileProcessingEngine.extract")(function* (operation: ExtractFileOperation) {
    return yield* Match.value(operation.format).pipe(
      Match.when("pdf-text-layer", () =>
        extractPdf(operation).pipe(Effect.mapError((error) => operationFailure(operation, error)))
      ),
      Match.when("docx", () =>
        extractDocx(operation).pipe(Effect.mapError((error) => operationFailure(operation, error)))
      ),
      Match.orElse(() =>
        Effect.fail(
          FileProcessingOperationError.fromReason("unsupported-file-format", {
            artifactId: operation.source.id,
            engine: DocTextFileProcessingEngineDescriptor.name,
            format: operation.format,
            message: `The document text driver does not support ${operation.format}.`,
            operationId: operation.operationId,
          })
        )
      )
    );
  }),
});

/**
 * JS-native PDF and DOCX text extraction engine value.
 *
 * **Example** (Check DOCX format support)
 *
 * ```ts
 * import { DocTextFileProcessingEngine } from "@beep/doc-text"
 *
 * console.log(DocTextFileProcessingEngine.descriptor.supportsFormat("docx")) // true
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export const DocTextFileProcessingEngine: FileProcessingEngineShape = makeDocTextFileProcessingEngine();
