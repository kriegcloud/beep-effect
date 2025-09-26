#!/usr/bin/env node
import {DomainError, getWorkspaceDir} from "@beep/tooling-utils/repo";
import {FsUtils, FsUtilsLive} from "@beep/tooling-utils/FsUtils";
import {collectConvertableFiles, ConvertableFile} from "./utils/convert-to-nextgen";
import {removeExt} from "@beep/constants/paths/utils";
import decodeJpeg, {init as initJpegDecode} from "@jsquash/jpeg/decode";
import decodePng, {init as initPngDecode} from "@jsquash/png/decode";
import decodeAvif, {init as initAvifDecode} from "@jsquash/avif/decode";
import encodeWebp, {init as initWebpEncode} from "@jsquash/webp/encode";

import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as Cause from "effect/Cause";
import * as Path from "@effect/platform/Path";
import * as FileSystem from "@effect/platform/FileSystem";
import * as NodeContext from "@effect/platform-node/NodeContext";
import * as NodeRuntime from "@effect/platform-node/NodeRuntime";

type Convertable = typeof ConvertableFile.Type;
type DecoderTag = Convertable["_tag"];

type DecoderConfig = {
  readonly label: string;
  readonly init: (module: WebAssembly.Module) => Promise<unknown>;
  readonly decode: (buffer: ArrayBuffer) => Promise<ImageData | null | undefined>;
  readonly encodeOptions?: Record<string, unknown>;
};

class DecodedImageData implements ImageData {
  readonly colorSpace: PredefinedColorSpace;
  readonly data: ImageDataArray;
  readonly width: number;
  readonly height: number;

  constructor(params: {data: ImageDataArray; width: number; height: number; colorSpace?: PredefinedColorSpace}) {
    this.data = params.data;
    this.width = params.width;
    this.height = params.height;
    this.colorSpace = params.colorSpace ?? "srgb";
  }
}

const DECODERS: Record<DecoderTag, DecoderConfig> = {
  jpg: {label: "JPEG", init: initJpegDecode, decode: decodeJpeg},
  jpeg: {label: "JPEG", init: initJpegDecode, decode: decodeJpeg},
  png: {label: "PNG", init: initPngDecode, decode: decodePng, encodeOptions: {}},
  avif: {label: "AVIF", init: initAvifDecode, decode: decodeAvif},
};

const toArrayBuffer = (input: ArrayBuffer | ArrayBufferView): ArrayBuffer => {
  if (input instanceof ArrayBuffer) {
    return input;
  }
  if (ArrayBuffer.isView(input)) {
    const copy = new Uint8Array(input.byteLength);
    copy.set(new Uint8Array(input.buffer, input.byteOffset, input.byteLength));
    return copy.buffer;
  }
  throw new TypeError("Expected ArrayBuffer or ArrayBufferView");
};

const domainError = (message: string) => (cause: unknown) =>
  new DomainError({message, cause});

const isRecord = (input: unknown): input is Record<string, unknown> =>
  typeof input === "object" && input !== null;

const isPredefinedColorSpace = (input: unknown): input is PredefinedColorSpace =>
  input === "srgb" || input === "display-p3";

const toDecodedImage = (file: Convertable, value: unknown): ImageData => {
  if (!isRecord(value)) {
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

  return new DecodedImageData({data: normalised, width: rawWidth, height: rawHeight, colorSpace: derivedColorSpace});
};

const program = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const fsUtils = yield* FsUtils;

  const loadWasmModule = (modulePath: string, label: string) =>
    Effect.gen(function* () {
      const resolved = yield* fsUtils.existsOrThrow(modulePath);
      const binary = yield* fs.readFile(resolved).pipe(
        Effect.mapError(domainError(`Failed to read ${label} at ${resolved}`))
      );
      return yield* Effect.tryPromise({
        try: () => WebAssembly.compile(toArrayBuffer(binary)),
        catch: domainError(`Failed to compile ${label} at ${resolved}`),
      });
    });

  const initializeDecoders = (mods: ReadonlySet<Pick<Convertable, "_tag" | "modPath">>) => {
    const byPath = new Map<string, {modPath: string; tags: DecoderTag[]}>();
    for (const mod of mods) {
      const group = byPath.get(mod.modPath);
      if (group) {
        if (!group.tags.includes(mod._tag)) {
          group.tags.push(mod._tag);
        }
      } else {
        byPath.set(mod.modPath, {modPath: mod.modPath, tags: [mod._tag]});
      }
    }

    return Effect.forEach(byPath.values(), ({modPath, tags}) =>
      Effect.gen(function* () {
        const wasmModule = yield* loadWasmModule(modPath, `decoder module for ${tags.join(", ")}`);
        yield* Effect.forEach(
          tags,
          (tag) =>
            Effect.tryPromise({
              try: () => DECODERS[tag].init(wasmModule),
              catch: domainError(`Failed to initialize ${DECODERS[tag].label} decoder`),
            }),
          {discard: true}
        );
      }),
    {discard: true, concurrency: "unbounded"});
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
        const options = DECODERS[file._tag].encodeOptions;
        const output = options ? await encodeWebp(decoded, options) : await encodeWebp(decoded);
        return new Uint8Array(output);
      },
      catch: domainError(`Failed to encode ${DECODERS[file._tag].label} file buffer ${file.path}`),
    });

  const convertFile = (file: Convertable, dirs: {publicDir: string}) =>
    Effect.gen(function* () {
      const binary = yield* fs.readFile(file.path).pipe(
        Effect.mapError(domainError(`Failed to read file ${file.path}`))
      );
      const decoded = yield* decodeImage(file, toArrayBuffer(binary));
      const encoded = yield* encodeImage(file, decoded);

      const relative = path.relative(dirs.publicDir, file.path);
      if (relative.startsWith("..")) {
        return yield* new DomainError({
          message: `Source file ${file.path} is outside public directory ${dirs.publicDir}`,
        });
      }

      const targetPath = path.join(dirs.publicDir, `${removeExt(relative)}.webp`);

      yield* fs.writeFile(targetPath, encoded).pipe(
        Effect.mapError(domainError(`Failed to write encoded file ${targetPath}`))
      );

      if (targetPath !== file.path) {
        yield* fs.remove(file.path).pipe(
          Effect.catchTag("SystemError", (error) =>
            error.reason === "NotFound"
              ? Effect.void
              : Effect.fail(domainError(`Failed to remove original file ${file.path}`)(error))
          )
        );
      }

      return {source: file.path, target: targetPath};
    });

  const webDir = yield* getWorkspaceDir("@beep/web");
  yield* Console.log(`WEB DIR: ${webDir}`);

  const publicDir = yield* fsUtils.existsOrThrow(path.resolve(webDir, "public"));
  yield* Console.log(`PUBLIC DIR: ${publicDir}`);

  const {files, modsToLoad} = yield* collectConvertableFiles({dir: publicDir});

  const webpModule = yield* loadWasmModule("./node_modules/@jsquash/webp/codec/enc/webp_enc.wasm", "WebP encoder");
  yield* Effect.tryPromise({
    try: () => initWebpEncode(webpModule),
    catch: domainError("Failed to initialize WebP encoder"),
  });

  yield* initializeDecoders(modsToLoad);

  const results = yield* Effect.forEach(
    files,
    (file) => convertFile(file, {publicDir}),
    {concurrency: "unbounded"}
  );

  yield* Console.log(JSON.stringify(results, null, 2));
});

NodeRuntime.runMain(
  program.pipe(
    Effect.provide([NodeContext.layer, FsUtilsLive]),
    Effect.catchAll((error) =>
      Effect.gen(function* () {
        yield* Console.log("\n💥 Program failed");
        yield* Console.log(Cause.pretty(Cause.fail(error)));
        return yield* Effect.fail(error);
      })
    )
  )
);
