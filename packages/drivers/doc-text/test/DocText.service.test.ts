import {
  DOC_TEXT_ENGINE_VERSION,
  DocTextError,
  DocTextErrorOptions,
  DocTextErrorReason,
  DocTextFileProcessingEngine,
} from "@beep/doc-text";
import {
  ArtifactId,
  ArtifactLocator,
  ContentDigest,
  OperationId,
  SourceArtifact,
} from "@beep/file-processing/Artifact";
import { ExtractFileOperation } from "@beep/file-processing/Operation";
import { PosixPath } from "@beep/schema/PosixPath";
import { it } from "@beep/test-runner";
import { fcRuns } from "@beep/test-utils";
import * as A from "@beep/utils/Array";
import { describe, expect } from "@effect/vitest";
import { Document, Packer, Paragraph, TextRun } from "docx";
import * as Arbitrary from "effect/Arbitrary";
import * as Effect from "effect/Effect";
import * as R from "effect/Record";
import * as Result from "effect/Result";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { strToU8, Zip, ZipDeflate, zipSync } from "fflate";
import { PDFDocument, StandardFonts } from "pdf-lib";

const decodePosixPath = S.decodeEffect(PosixPath);

const encode = <Codec extends S.Codec<unknown, unknown>>(schema: Codec, value: Codec["Type"]): Codec["Encoded"] =>
  Result.getOrThrow(S.encodeResult(schema)(value));

const decode = <Codec extends S.Codec<unknown, unknown>>(schema: Codec, value: Codec["Encoded"]): Codec["Type"] =>
  Result.getOrThrow(S.decodeUnknownResult(schema)(value));

const fixtureIds = Effect.all({
  artifactId: S.decodeEffect(ArtifactId)("artifact:3a6eb0790f39ac87c94f3856b2dd2c5d110e6811602261a9a923d3bb23adc8b7"),
  digest: S.decodeEffect(ContentDigest)("sha256:3a6eb0790f39ac87c94f3856b2dd2c5d110e6811602261a9a923d3bb23adc8b7"),
  operationId: S.decodeEffect(OperationId)(
    "operation:3a6eb0790f39ac87c94f3856b2dd2c5d110e6811602261a9a923d3bb23adc8b7"
  ),
});

type FixtureIds = {
  readonly artifactId: ArtifactId;
  readonly digest: ContentDigest;
  readonly operationId: OperationId;
};

const makeOperation = Effect.fn("DocTextTest.makeOperation")(function* (
  ids: FixtureIds,
  extension: string,
  format: ExtractFileOperation["format"],
  bytes: Uint8Array,
  maxMaterializedBytes?: number
) {
  const relativePath = yield* decodePosixPath(`fixture.${extension}`);

  return ExtractFileOperation.make({
    format,
    ...(maxMaterializedBytes === undefined ? {} : { maxMaterializedBytes }),
    operationId: ids.operationId,
    operationKind: "extract",
    preference: { engine: "tika" },
    source: SourceArtifact.make({
      bytes,
      digest: ids.digest,
      extension,
      id: ids.artifactId,
      locator: ArtifactLocator.make({ kind: "synthetic", value: relativePath }),
      name: `fixture.${extension}`,
      relativePath,
      sizeBytes: S.Natural.make(bytes.byteLength),
    }),
  });
});

const makePdf = (text: string): Promise<Uint8Array> =>
  PDFDocument.create().then((document) =>
    document.embedFont(StandardFonts.Helvetica).then((font) => {
      const page = document.addPage();
      page.drawText(text, { font });
      return document.save();
    })
  );

const makeEmptyPdf = (): Promise<Uint8Array> =>
  PDFDocument.create().then((document) => {
    document.addPage();
    return document.save();
  });

const makeDocx = (text: string): Promise<Buffer> =>
  Packer.toBuffer(
    new Document({
      sections: [
        {
          children: [new Paragraph({ children: [new TextRun(text)] })],
        },
      ],
    })
  );

const documentXml = (text: string) =>
  `<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>${text}</w:t></w:r></w:p></w:body></w:document>`;

// Visit headers by their declared spans rather than scanning compressed data
// for coincidental ZIP signatures. Mutations affect metadata, never payloads.
const alterZipHeaders = (bytes: Uint8Array, change: (view: DataView, offset: number, central: boolean) => void) => {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = 0;
  while (offset + 4 <= bytes.byteLength) {
    const signature = view.getUint32(offset, true);
    if (signature === 0x04034b50) {
      const next =
        offset +
        30 +
        view.getUint16(offset + 26, true) +
        view.getUint16(offset + 28, true) +
        view.getUint32(offset + 18, true);
      change(view, offset, false);
      offset = next;
    } else if (signature === 0x02014b50) {
      const next =
        offset +
        46 +
        view.getUint16(offset + 28, true) +
        view.getUint16(offset + 30, true) +
        view.getUint16(offset + 32, true);
      change(view, offset, true);
      offset = next;
    } else break;
  }
  return bytes;
};

describe("@beep/doc-text", () => {
  for (const { name, xml } of [
    { name: "expanded bytes", xml: `<document>${Str.repeat(9 * 1024 * 1024)("a")}</document>` },
    { name: "XML nodes", xml: `<document>${Str.repeat(50_001)("<p/>")}</document>` },
    { name: "XML depth", xml: `${Str.repeat(129)("<p>")}${Str.repeat(129)("</p>")}` },
    { name: "DTD", xml: '<!DOCTYPE document [<!ENTITY x "expanded">]><document>&x;</document>' },
  ]) {
    it.effect(`rejects DOCX ${name} before Mammoth extraction`, () =>
      Effect.gen(function* () {
        const ids = yield* fixtureIds;
        const bytes = zipSync({ "word/document.xml": strToU8(xml) });
        const operation = yield* makeOperation(ids, "docx", "docx", bytes);
        const error = yield* Effect.flip(DocTextFileProcessingEngine.extract(operation));
        expect(error.reason).toBe("output-limit-exceeded");
      })
    );
  }

  it.effect("charges actual expanded bytes even when ZIP length declarations understate them", () =>
    Effect.gen(function* () {
      const ids = yield* fixtureIds;
      const bytes = zipSync({ "word/document.xml": strToU8(`<p>${Str.repeat(9 * 1024 * 1024)("a")}</p>`) });
      alterZipHeaders(bytes, (view, offset, central) => view.setUint32(offset + (central ? 24 : 22), 1, true));
      const operation = yield* makeOperation(ids, "docx", "docx", bytes);
      const error = yield* Effect.flip(DocTextFileProcessingEngine.extract(operation));
      expect(error.reason).toBe("output-limit-exceeded");
    })
  );

  const archiveLimitCases: ReadonlyArray<{ readonly name: string; readonly files: Record<string, Uint8Array> }> = [
    {
      name: "aggregate expansion",
      files: {
        "word/document.xml": strToU8(documentXml("safe")),
        "media/a": new Uint8Array(5 * 1024 * 1024),
        "media/b": new Uint8Array(5 * 1024 * 1024),
      },
    },
    {
      name: "entry count",
      files: R.fromEntries(
        A.makeBy(513, (index): readonly [string, Uint8Array] => [`part-${index}`, new Uint8Array(0)])
      ),
    },
    {
      name: "aggregate XML nodes",
      files: {
        "word/document.xml": strToU8(`<p>${Str.repeat(25_001)("<p/>")}</p>`),
        "word/styles.xml": strToU8(`<p>${Str.repeat(25_001)("<p/>")}</p>`),
      },
    },
    {
      name: "XML attributes",
      files: {
        "word/document.xml": strToU8(
          `<p ${A.join(
            A.makeBy(50_001, (index) => `a${index}="x"`),
            " "
          )}/>`
        ),
      },
    },
    {
      name: "relationship-targeted XML without an XML extension",
      files: {
        "_rels/.rels": strToU8(
          '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="main" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/payload.bin"/></Relationships>'
        ),
        "word/payload.bin": strToU8(`<p>${Str.repeat(50_001)("<p/>")}</p>`),
      },
    },
  ];
  for (const { name, files } of archiveLimitCases) {
    it.effect(`rejects DOCX ${name}`, () =>
      Effect.gen(function* () {
        const ids = yield* fixtureIds;
        const bytes = zipSync(files);
        const error = yield* Effect.flip(
          DocTextFileProcessingEngine.extract(yield* makeOperation(ids, "docx", "docx", bytes))
        );
        expect(error.reason).toBe("output-limit-exceeded");
      })
    );
  }

  it.effect("bounds data-descriptor ZIP entries with no local size declarations", () =>
    Effect.gen(function* () {
      const ids = yield* fixtureIds;
      let bytes = new Uint8Array(0);
      const archive = new Zip((error, data) => {
        expect(error).toBeNull();
        bytes = new Uint8Array(Buffer.concat([bytes, data]));
      });
      const part = new ZipDeflate("word/document.xml");
      archive.add(part);
      part.push(strToU8(`<p>${Str.repeat(9 * 1024 * 1024)("a")}</p>`), true);
      archive.end();
      const error = yield* Effect.flip(
        DocTextFileProcessingEngine.extract(yield* makeOperation(ids, "docx", "docx", bytes))
      );
      expect(error.reason).toBe("output-limit-exceeded");
    })
  );

  it.effect("honors the caller's smaller expanded-byte budget", () =>
    Effect.gen(function* () {
      const ids = yield* fixtureIds;
      const bytes = zipSync({ "word/document.xml": strToU8(documentXml(Str.repeat(16_384)("a"))) });
      expect(bytes.byteLength).toBeLessThan(4_096);
      const error = yield* Effect.flip(
        DocTextFileProcessingEngine.extract(yield* makeOperation(ids, "docx", "docx", bytes, 4_096))
      );
      expect(error.reason).toBe("output-limit-exceeded");
    })
  );

  it.effect("does not trust central-directory names to choose the document part", () =>
    Effect.gen(function* () {
      const ids = yield* fixtureIds;
      const bytes = zipSync({
        "word/document.xml": strToU8(documentXml("validated safe text")),
        "word/payload0.bin": strToU8(`<p>${Str.repeat(50_001)("<p/>")}</p>`),
      });
      alterZipHeaders(bytes, (view, offset, central) => {
        if (!central) return;
        const name = bytes.subarray(offset + 46, offset + 46 + view.getUint16(offset + 28, true));
        if (new TextDecoder().decode(name) === "word/payload0.bin") name.set(strToU8("word/document.xml"));
      });
      const result = yield* DocTextFileProcessingEngine.extract(yield* makeOperation(ids, "docx", "docx", bytes));
      expect(result.text).toContain("validated safe text");
    })
  );

  it.effect("ignores central-directory expansion claims after rebuilding validated entries", () =>
    Effect.gen(function* () {
      const ids = yield* fixtureIds;
      const bytes = alterZipHeaders(
        zipSync({ "word/document.xml": strToU8(documentXml("safe text")) }),
        (view, offset, central) => {
          if (central) view.setUint32(offset + 24, 0xfffffff0, true);
        }
      );
      const result = yield* DocTextFileProcessingEngine.extract(yield* makeOperation(ids, "docx", "docx", bytes));
      expect(result.text).toContain("safe text");
    })
  );

  for (const name of ["word/../word/document.xml", "word//document.xml", "word/./document.xml"]) {
    it.effect(`rejects JSZip-normalized name ${name}`, () =>
      Effect.gen(function* () {
        const ids = yield* fixtureIds;
        const bytes = zipSync({ [name]: strToU8(documentXml("ambiguous")) });
        const error = yield* Effect.flip(
          DocTextFileProcessingEngine.extract(yield* makeOperation(ids, "docx", "docx", bytes))
        );
        expect(error.reason).toBe("file-extraction-failed");
      })
    );
  }

  it.effect("preserves custom document relationships and binary members", () =>
    Effect.gen(function* () {
      const ids = yield* fixtureIds;
      const bytes = zipSync({
        "_rels/.rels": strToU8(
          '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="main" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/main.part"/></Relationships>'
        ),
        "word/main.part": strToU8(documentXml("custom document text")),
        "word/media/image.png": new Uint8Array([137, 80, 78, 71, 60, 0, 255]),
      });
      const original = new Uint8Array(bytes);
      const result = yield* DocTextFileProcessingEngine.extract(yield* makeOperation(ids, "docx", "docx", bytes));
      expect(result.text).toContain("custom document text");
      expect(bytes).toEqual(original);
    })
  );

  it.effect("rejects duplicate local names instead of letting JSZip overwrite a part", () =>
    Effect.gen(function* () {
      const ids = yield* fixtureIds;
      const bytes = zipSync({
        "word/document.xml": strToU8(documentXml("safe")),
        "word/payload0.bin": strToU8(documentXml("other")),
      });
      alterZipHeaders(bytes, (view, offset, central) => {
        const start = offset + (central ? 46 : 30);
        const name = bytes.subarray(start, start + view.getUint16(offset + (central ? 28 : 26), true));
        if (new TextDecoder().decode(name) === "word/payload0.bin") name.set(strToU8("word/document.xml"));
      });
      const error = yield* Effect.flip(
        DocTextFileProcessingEngine.extract(yield* makeOperation(ids, "docx", "docx", bytes))
      );
      expect(error.reason).toBe("file-extraction-failed");
    })
  );

  it.effect("rejects UTF-16 XML without changing Mammoth's UTF-8 extraction semantics", () =>
    Effect.gen(function* () {
      const ids = yield* fixtureIds;
      const content = Buffer.concat([
        new Uint8Array([0xff, 0xfe]),
        Buffer.from(documentXml("Unicode café 文書"), "utf16le"),
      ]);
      const bytes = zipSync({ "word/document.xml": content });
      const error = yield* Effect.flip(
        DocTextFileProcessingEngine.extract(yield* makeOperation(ids, "docx", "docx", bytes))
      );
      expect(error.reason).toBe("file-extraction-failed");
    })
  );

  for (const { name, mainTarget, partName } of [
    { name: "root-absolute custom main", mainTarget: "/custom/document.part", partName: "custom/document.part" },
    {
      name: "literal percent-encoded custom main",
      mainTarget: "custom/document%2Epart",
      partName: "custom/document%2Epart",
    },
  ]) {
    it.effect(`budgets ${name} using Mammoth's exact target lookup`, () =>
      Effect.gen(function* () {
        const ids = yield* fixtureIds;
        const bytes = zipSync({
          "_rels/.rels": strToU8(
            `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="main" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="${mainTarget}"/></Relationships>`
          ),
          [partName]: strToU8(`<p>${Str.repeat(50_001)("<p/>")}</p>`),
        });
        const error = yield* Effect.flip(
          DocTextFileProcessingEngine.extract(yield* makeOperation(ids, "docx", "docx", bytes))
        );
        expect(error.reason).toBe("output-limit-exceeded");
      })
    );
  }

  for (const target of ["styles.part", "/custom/styles.part", "styles%2Epart"]) {
    it.effect(`budgets nested custom document styles at ${target}`, () =>
      Effect.gen(function* () {
        const ids = yield* fixtureIds;
        const partName = target === "/custom/styles.part" ? "custom/styles.part" : `nested/deep/${target}`;
        const bytes = zipSync({
          "_rels/.rels": strToU8(
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="main" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="nested/deep/main.part"/></Relationships>'
          ),
          "nested/deep/main.part": strToU8(documentXml("safe document")),
          "nested/deep/_rels/main.part.rels": strToU8(
            `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="styles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="${target}"/></Relationships>`
          ),
          [partName]: strToU8(`<p>${Str.repeat(50_001)("<p/>")}</p>`),
        });
        const error = yield* Effect.flip(
          DocTextFileProcessingEngine.extract(yield* makeOperation(ids, "docx", "docx", bytes))
        );
        expect(error.reason).toBe("output-limit-exceeded");
      })
    );
  }

  for (const target of ["../custom.part", "./custom.part", "custom%2Epart", "custom//part"]) {
    it.effect(`fails an unsupported main target ${target} instead of normalizing it`, () =>
      Effect.gen(function* () {
        const ids = yield* fixtureIds;
        const bytes = zipSync({
          "_rels/.rels": strToU8(
            `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="main" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="${target}"/></Relationships>`
          ),
          "custom.part": strToU8(documentXml("unselected normalized target")),
          "custom/part": strToU8(documentXml("unselected collapsed target")),
        });
        const error = yield* Effect.flip(
          DocTextFileProcessingEngine.extract(yield* makeOperation(ids, "docx", "docx", bytes))
        );
        expect(error.reason).toBe("file-extraction-failed");
      })
    );
  }

  it.effect("leaves unsupported parent-relative styles unconsumed under nested relationships", () =>
    Effect.gen(function* () {
      const ids = yield* fixtureIds;
      const bytes = zipSync({
        "_rels/.rels": strToU8(
          '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="main" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="nested/deep/main.part"/></Relationships>'
        ),
        "nested/deep/main.part": strToU8(documentXml("nested document text")),
        "nested/deep/_rels/main.part.rels": strToU8(
          '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="styles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="../custom.part"/></Relationships>'
        ),
        "nested/custom.part": strToU8(`<p>${Str.repeat(50_001)("<p/>")}</p>`),
      });
      const result = yield* DocTextFileProcessingEngine.extract(yield* makeOperation(ids, "docx", "docx", bytes));
      expect(result.text).toContain("nested document text");
    })
  );

  it.effect("rejects truncated compressed members through the typed extraction error", () =>
    Effect.gen(function* () {
      const ids = yield* fixtureIds;
      const bytes = zipSync({ "word/document.xml": strToU8(documentXml("safe")) });
      const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
      const payloadStart = 30 + view.getUint16(26, true) + view.getUint16(28, true);
      const truncated = bytes.subarray(0, payloadStart + 1);
      const error = yield* Effect.flip(
        DocTextFileProcessingEngine.extract(yield* makeOperation(ids, "docx", "docx", truncated))
      );
      expect(error.reason).toBe("file-extraction-failed");
    })
  );

  // The stable codec law: decoding an encoded value and re-encoding it must
  // reproduce the original encoding byte-for-byte. This holds for every schema,
  // including class schemas whose decoded side is an Error subclass.
  // Decoded-side equivalence additionally pins that the decoded instance equals
  // the generated one. It holds for `S.TaggedError` classes too: Effect derives a
  // Schema class's equivalence from its declared field struct by construction
  // (effect@4.0.0-rc.113), so the `Error` runtime metadata never takes part.
  // Measured on this schema set at 60 seeds x 400 runs on rc.113: DocTextError,
  // DocTextErrorReason and DocTextErrorOptions all 0/24000 unequal (the rc.109
  // run that motivated a class-level hook was 682/24000 on DocTextError; see
  // goals/tsgo-045-effect-idiom-sweep/history/2026-09-12-annote-error-proof.md).
  it.prop(
    "round-trips document text driver schemas",
    {
      encodedReason: Arbitrary.schema(DocTextErrorReason),
      equivalentReason: Arbitrary.schema(DocTextErrorReason),
      encodedOptions: Arbitrary.schema(DocTextErrorOptions),
      equivalentOptions: Arbitrary.schema(DocTextErrorOptions),
      encodedError: Arbitrary.schema(DocTextError),
      equivalentError: Arbitrary.schema(DocTextError),
    },
    ({ encodedReason, equivalentReason, encodedOptions, equivalentOptions, encodedError, equivalentError }) => {
      expect(encode(DocTextErrorReason, decode(DocTextErrorReason, encode(DocTextErrorReason, encodedReason)))).toEqual(
        encode(DocTextErrorReason, encodedReason)
      );
      expect(
        S.toEquivalence(DocTextErrorReason)(
          decode(DocTextErrorReason, encode(DocTextErrorReason, equivalentReason)),
          equivalentReason
        )
      ).toBe(true);
      expect(
        encode(DocTextErrorOptions, decode(DocTextErrorOptions, encode(DocTextErrorOptions, encodedOptions)))
      ).toEqual(encode(DocTextErrorOptions, encodedOptions));
      expect(
        S.toEquivalence(DocTextErrorOptions)(
          decode(DocTextErrorOptions, encode(DocTextErrorOptions, equivalentOptions)),
          equivalentOptions
        )
      ).toBe(true);
      expect(encode(DocTextError, decode(DocTextError, encode(DocTextError, encodedError)))).toEqual(
        encode(DocTextError, encodedError)
      );
      expect(
        S.toEquivalence(DocTextError)(decode(DocTextError, encode(DocTextError, equivalentError)), equivalentError)
      ).toBe(true);
    },
    { arbitrary: fcRuns(10) }
  );

  it.effect(
    "extracts text from a generated PDF text layer",
    Effect.fnUntraced(function* () {
      const ids = yield* fixtureIds;
      const bytes = yield* Effect.promise(() => makePdf("PDF fixture text"));
      const result = yield* DocTextFileProcessingEngine.extract(
        yield* makeOperation(ids, "pdf", "pdf-text-layer", bytes)
      );

      expect(result.text).toContain("PDF fixture text");
      expect(result.metadata["pdf.totalPages"]).toBe("1");
      expect(result.engine).toBe("doc-text-js");
      expect(result.engineVersion).toBe(DOC_TEXT_ENGINE_VERSION);
    })
  );

  it.effect(
    "leaves the caller's PDF bytes intact after extraction",
    Effect.fnUntraced(function* () {
      const ids = yield* fixtureIds;
      const bytes = yield* Effect.promise(() => makePdf("PDF fixture text"));
      const original = new Uint8Array(bytes);
      yield* DocTextFileProcessingEngine.extract(yield* makeOperation(ids, "pdf", "pdf-text-layer", bytes));

      // pdfjs transfers the buffer it is handed; the engine must extract from a
      // copy so intake can still materialize the source bytes verbatim.
      expect(bytes.byteLength).toBe(original.byteLength);
      expect(bytes).toEqual(original);
    })
  );

  it.effect(
    "extracts text from a generated DOCX",
    Effect.fnUntraced(function* () {
      const ids = yield* fixtureIds;
      const bytes = yield* Effect.promise(() => makeDocx("DOCX fixture text"));
      const result = yield* DocTextFileProcessingEngine.extract(yield* makeOperation(ids, "docx", "docx", bytes));

      expect(result.text).toContain("DOCX fixture text");
      expect(result.engine).toBe("doc-text-js");
      expect(result.engineVersion).toBe(DOC_TEXT_ENGINE_VERSION);
    })
  );

  it.effect(
    "rejects unsupported formats",
    Effect.fnUntraced(function* () {
      const ids = yield* fixtureIds;
      const error = yield* DocTextFileProcessingEngine.extract(
        yield* makeOperation(ids, "txt", "plain-text", new TextEncoder().encode("text"))
      ).pipe(Effect.flip);

      expect(error.reason).toBe("unsupported-file-format");
    })
  );

  it.effect(
    "maps corrupt document bytes to an extraction failure",
    Effect.fnUntraced(function* () {
      const ids = yield* fixtureIds;
      const error = yield* DocTextFileProcessingEngine.extract(
        yield* makeOperation(ids, "pdf", "pdf-text-layer", new Uint8Array([0, 1, 2, 3]))
      ).pipe(Effect.flip);

      expect(error.reason).toBe("file-extraction-failed");
    })
  );

  it.effect(
    "rejects an over-cap document before parsing",
    Effect.fnUntraced(function* () {
      const ids = yield* fixtureIds;
      const error = yield* DocTextFileProcessingEngine.extract(
        yield* makeOperation(ids, "pdf", "pdf-text-layer", new Uint8Array([0, 1]), 1)
      ).pipe(Effect.flip);

      expect(error.reason).toBe("output-limit-exceeded");
    })
  );

  it.effect(
    "reports an explicit empty text-layer outcome when OCR would be required",
    Effect.fnUntraced(function* () {
      const ids = yield* fixtureIds;
      const bytes = yield* Effect.promise(makeEmptyPdf);
      const error = yield* DocTextFileProcessingEngine.extract(
        yield* makeOperation(ids, "pdf", "pdf-text-layer", bytes)
      ).pipe(Effect.flip);

      expect(error.reason).toBe("file-extraction-failed");
      expect(error.details).toEqual({ outcome: "empty-text-layer", ocr: "disabled" });
    })
  );
});
