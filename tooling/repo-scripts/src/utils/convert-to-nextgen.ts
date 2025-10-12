import nodeFs from "node:fs";
import { createRequire } from "node:module";
import nodePath from "node:path";
import { fileURLToPath } from "node:url";
import { removeExt } from "@beep/constants/paths/utils";
import { BS } from "@beep/schema";
import { FsUtils } from "@beep/tooling-utils/FsUtils";
import { DomainError } from "@beep/tooling-utils/repo";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import encodeAvif, { init as initAvifEncode } from "@jsquash/avif/encode";
import decodeJpeg, { init as initJpegDecode } from "@jsquash/jpeg/decode";
import decodePng, { init as initPngDecode } from "@jsquash/png/decode";
import decodeWebp, { init as initWebpDecode } from "@jsquash/webp/decode";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { NextgenConvertableExtensionKit } from "./asset-path.schema";

const repoScriptsDir = nodePath.resolve(nodePath.dirname(fileURLToPath(import.meta.url)), "../../");
const moduleRequire = createRequire(import.meta.url);
const repoRootDir = nodePath.resolve(repoScriptsDir, "../..");
const rootNodeModulesDir = nodePath.join(repoRootDir, "node_modules");
const repoScriptsNodeModulesDir = nodePath.join(repoScriptsDir, "node_modules");

const resolveModuleAssetPath = (specifier: string) =>
  F.pipe(
    [
      (() => {
        try {
          return moduleRequire.resolve(specifier);
        } catch {
          return undefined;
        }
      })(),
      nodePath.join(rootNodeModulesDir, specifier),
      nodePath.join(repoScriptsNodeModulesDir, specifier),
    ],
    A.filterMap(O.fromNullable),
    A.findFirst((candidate) => nodeFs.existsSync(candidate)),
    O.getOrElse(() => nodePath.join(rootNodeModulesDir, specifier))
  );

/** Recursively collect all files under a directory. */
export function collectFiles(dir: string, baseDir: string = dir): string[] {
  const entries = nodeFs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = nodePath.join(dir, entry.name);
    if (entry.isDirectory()) {
      return collectFiles(fullPath, baseDir);
    }

    return nodePath.join(dir, entry.name);
  });
}

export const ConvertableFile = BS.destructiveTransform((i: { _tag: string; path: string }) => {
  const taggedSchema = S.Union(
    S.TaggedStruct("png", {
      path: S.NonEmptyTrimmedString,
      modPath: BS.toOptionalWithDefault(S.NonEmptyTrimmedString)(
        resolveModuleAssetPath("@jsquash/png/codec/pkg/squoosh_png_bg.wasm")
      ),
    }),
    S.TaggedStruct("jpg", {
      path: S.NonEmptyTrimmedString,
      modPath: BS.toOptionalWithDefault(S.NonEmptyTrimmedString)(
        resolveModuleAssetPath("@jsquash/jpeg/codec/dec/mozjpeg_dec.wasm")
      ),
    }),
    S.TaggedStruct("jpeg", {
      path: S.NonEmptyTrimmedString,
      modPath: BS.toOptionalWithDefault(S.NonEmptyTrimmedString)(
        resolveModuleAssetPath("@jsquash/jpeg/codec/dec/mozjpeg_dec.wasm")
      ),
    }),
    S.TaggedStruct("webp", {
      path: S.NonEmptyTrimmedString,
      modPath: BS.toOptionalWithDefault(S.NonEmptyTrimmedString)(
        resolveModuleAssetPath("@jsquash/webp/codec/dec/webp_dec.wasm")
      ),
    })
  );
  return S.decodeUnknownSync(taggedSchema)(i);
})(S.Struct({ _tag: S.String, path: S.NonEmptyTrimmedString }));

export const ConvertableFiles = S.Array(ConvertableFile);

export type Convertable = typeof ConvertableFile.Type;

export const collectConvertableFiles = Effect.fn("collectConvertableFiles")(function* (opts: { readonly dir: string }) {
  const fsUtils = yield* FsUtils;
  const dir = yield* fsUtils.existsOrThrow(opts.dir);

  return F.pipe(
    collectFiles(dir),
    A.filter((path) => {
      return F.pipe(
        Str.split(".")(path)[1],
        O.fromNullable,
        O.match({
          onNone: () => false,
          onSome: NextgenConvertableExtensionKit.is,
        })
      );
    }),
    A.map((path) => {
      const ext = O.fromNullable(Str.split(".")(path)[1]).pipe(
        O.getOrThrowWith(
          () =>
            new DomainError({
              message: `Invalid path: ${path}`,
            })
        ),
        S.decodeUnknownSync(NextgenConvertableExtensionKit.Schema)
      );

      return {
        path,
        _tag: ext,
      };
    }),
    S.decodeUnknownSync(ConvertableFiles),
    (convertableFiles) =>
      ({
        modsToLoad: new Set<Pick<Convertable, "modPath" | "_tag">>(
          A.map(convertableFiles, (e) =>
            Match.value(e).pipe(
              Match.tag("jpg", "jpeg", ({ _tag, modPath }) => ({ _tag, modPath })),
              Match.tagsExhaustive({
                png: ({ _tag, modPath }) => ({ _tag, modPath }),
                webp: ({ _tag, modPath }) => ({ _tag, modPath }),
              })
            )
          )
        ),
        files: convertableFiles,
      }) as const
  );
});

type DecoderTag = Convertable["_tag"];

type DecoderConfig = {
  readonly label: string;
  readonly init: (module: WebAssembly.Module) => Promise<unknown>;
  readonly decode: (buffer: ArrayBuffer) => Promise<ImageData | null | undefined>;
};

const DECODERS: Record<DecoderTag, DecoderConfig> = {
  jpg: { label: "JPEG", init: initJpegDecode, decode: decodeJpeg },
  jpeg: { label: "JPEG", init: initJpegDecode, decode: decodeJpeg },
  png: { label: "PNG", init: initPngDecode, decode: decodePng },
  webp: { label: "WebP", init: initWebpDecode, decode: decodeWebp },
};

class DecodedImageData implements ImageData {
  readonly colorSpace: PredefinedColorSpace;
  readonly data: ImageDataArray;
  readonly width: number;
  readonly height: number;

  constructor(params: { data: ImageDataArray; width: number; height: number; colorSpace?: PredefinedColorSpace }) {
    this.data = params.data;
    this.width = params.width;
    this.height = params.height;
    this.colorSpace = params.colorSpace ?? "srgb";
  }
}

const toArrayBuffer = (input: ArrayBuffer | ArrayBufferView): ArrayBuffer => {
  if (input instanceof ArrayBuffer) {
    return input;
  }

  if (ArrayBuffer.isView(input)) {
    const copy = new ArrayBuffer(input.byteLength);
    const view = new Uint8Array(copy);
    view.set(new Uint8Array(input.buffer, input.byteOffset, input.byteLength));
    return copy;
  }

  throw new TypeError("Expected ArrayBuffer or ArrayBufferView");
};

const domainError = (message: string) => (cause: unknown) => new DomainError({ message, cause });

const isPredefinedColorSpace = (input: unknown): input is PredefinedColorSpace =>
  input === "srgb" || input === "display-p3";

const toDecodedImage = (file: Convertable, value: unknown): ImageData => {
  if (!P.isRecord(value)) {
    throw new DomainError({
      message: `Decoder produced invalid result for ${file.path}`,
    });
  }

  const rawWidth = value.width;
  const rawHeight = value.height;

  if (typeof rawWidth !== "number" || typeof rawHeight !== "number") {
    throw new DomainError({
      message: `Decoder returned image without dimensions for ${file.path}`,
    });
  }

  const pixelData = value.data;
  if (!pixelData) {
    throw new DomainError({
      message: `Decoder returned image without pixel data for ${file.path}`,
    });
  }

  const view = (() => {
    if (pixelData instanceof Uint8ClampedArray || pixelData instanceof Uint8Array) {
      return pixelData;
    }
    if (ArrayBuffer.isView(pixelData)) {
      return pixelData;
    }
    return undefined;
  })();

  if (!view) {
    throw new DomainError({
      message: `Decoder returned unsupported pixel buffer for ${file.path}`,
    });
  }

  const base = new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
  const copyBuffer = new ArrayBuffer(view.byteLength);
  const copy = new Uint8Array(copyBuffer);
  copy.set(base);
  const normalised: ImageDataArray = new Uint8ClampedArray(copyBuffer);

  const derivedColorSpace = (() => {
    if (!("colorSpace" in value)) {
      return undefined;
    }
    const candidate = value.colorSpace;
    return isPredefinedColorSpace(candidate) ? candidate : undefined;
  })();

  return new DecodedImageData({ data: normalised, width: rawWidth, height: rawHeight, colorSpace: derivedColorSpace });
};

const loadWasmModule = (modulePath: string, label: string) =>
  Effect.gen(function* () {
    const fsUtils = yield* FsUtils;
    const fs = yield* FileSystem.FileSystem;

    const resolved = yield* fsUtils.existsOrThrow(modulePath);
    const binary = yield* fs
      .readFile(resolved)
      .pipe(Effect.mapError(domainError(`Failed to read ${label} at ${resolved}`)));
    const buffer = toArrayBuffer(binary);

    return yield* Effect.tryPromise({
      try: () => WebAssembly.compile(buffer),
      catch: domainError(`Failed to compile ${label} at ${resolved}`),
    });
  });

const loadWasmBinary = (modulePath: string, label: string) =>
  Effect.gen(function* () {
    const fsUtils = yield* FsUtils;
    const fs = yield* FileSystem.FileSystem;
    const resolved = yield* fsUtils.existsOrThrow(modulePath);
    return yield* fs.readFile(resolved).pipe(Effect.mapError(domainError(`Failed to read ${label} at ${resolved}`)));
  });

const initializeDecoders = (mods: ReadonlySet<Pick<Convertable, "_tag" | "modPath">>) => {
  const byPath = new Map<string, { modPath: string; tags: DecoderTag[] }>();
  for (const mod of mods) {
    const existing = byPath.get(mod.modPath);
    if (existing) {
      if (!existing.tags.includes(mod._tag)) {
        existing.tags.push(mod._tag);
      }
    } else {
      byPath.set(mod.modPath, { modPath: mod.modPath, tags: [mod._tag] });
    }
  }

  return Effect.forEach(
    byPath.values(),
    ({ modPath, tags }) =>
      Effect.gen(function* () {
        const wasmModule = yield* loadWasmModule(modPath, `decoder module for ${tags.join(", ")}`);
        yield* Effect.forEach(
          tags,
          (tag) =>
            Effect.tryPromise({
              try: () => DECODERS[tag].init(wasmModule),
              catch: domainError(`Failed to initialize ${DECODERS[tag].label} decoder`),
            }),
          { discard: true }
        );
      }),
    { discard: true, concurrency: "unbounded" }
  );
};

const decodeImage = (file: Convertable, buffer: ArrayBuffer) =>
  Effect.tryPromise({
    try: () => DECODERS[file._tag].decode(buffer),
    catch: domainError(`Failed to decode ${DECODERS[file._tag].label} file buffer ${file.path}`),
  }).pipe(
    Effect.flatMap((decoded) =>
      decoded == null
        ? Effect.fail(
            new DomainError({
              message: `Decoder returned empty result for ${file.path}`,
            })
          )
        : Effect.try({
            try: () => toDecodedImage(file, decoded),
            catch: domainError(`Decoder returned invalid image for ${file.path}`),
          })
    )
  );

const encodeImage = (file: Convertable, decoded: ImageData) =>
  Effect.tryPromise({
    try: async () => {
      const output = await encodeAvif(decoded);
      return new Uint8Array(output);
    },
    catch: domainError(`Failed to encode ${DECODERS[file._tag].label} file buffer ${file.path} to AVIF`),
  });

const convertFile = (file: Convertable, publicDir: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

    const original = yield* fs
      .readFile(file.path)
      .pipe(Effect.mapError(domainError(`Failed to read file ${file.path}`)));

    const decoded = yield* decodeImage(file, toArrayBuffer(original));
    const encoded = yield* encodeImage(file, decoded);

    const relative = path.relative(publicDir, file.path);
    if (relative.startsWith("..")) {
      return yield* new DomainError({
        message: `Source file ${file.path} is outside public directory ${publicDir}`,
      });
    }

    const targetPath = path.join(publicDir, `${removeExt(relative)}.avif`);

    yield* fs
      .writeFile(targetPath, encoded)
      .pipe(Effect.mapError(domainError(`Failed to write encoded file ${targetPath}`)));

    if (targetPath !== file.path) {
      yield* fs
        .remove(file.path)
        .pipe(
          Effect.catchTag("SystemError", (error) =>
            error.reason === "NotFound"
              ? Effect.void
              : Effect.fail(domainError(`Failed to remove original file ${file.path}`)(error))
          )
        );
    }

    return { source: file.path, target: targetPath } as const;
  });

export const convertDirectoryToNextgen = Effect.fn("convertDirectoryToNextgen")(function* (opts: {
  readonly dir: string;
}) {
  const { files, modsToLoad } = yield* collectConvertableFiles({ dir: opts.dir });

  if (files.length === 0) {
    return [] as const;
  }

  const avifEncoderBinary = yield* loadWasmBinary(
    resolveModuleAssetPath("@jsquash/avif/codec/enc/avif_enc.wasm"),
    "AVIF encoder"
  );

  yield* Effect.tryPromise({
    try: () => initAvifEncode({ wasmBinary: avifEncoderBinary }),
    catch: domainError("Failed to initialize AVIF encoder"),
  });

  yield* initializeDecoders(modsToLoad);

  return yield* Effect.forEach(files, (file) => convertFile(file, opts.dir), { concurrency: "unbounded" });
});

export type ConversionResult = ReadonlyArray<{ readonly source: string; readonly target: string }>;
