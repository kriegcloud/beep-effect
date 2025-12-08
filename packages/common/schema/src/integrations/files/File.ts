// import { $SchemaId } from "@beep/identity/packages";
// import { toOptionalWithDefault } from "@beep/schema/core";
// import { StringLiteralKit } from "@beep/schema/derived";
// // import * as P from "effect/Predicate";
// import { ArrayBufferFromSelf } from "@beep/schema/primitives";
// import { Effect, flow, ParseResult } from "effect";
// import * as S from "effect/Schema";
// import {fileTypeChecker, getFileChunkEither} from "@beep/schema/integrations";
//
// const $I = $SchemaId.create("integrations/files/File");
//
// export class FileType extends StringLiteralKit("image", "video", "audio", "pdf", "text", "blob").annotations(
//   $I.annotations("FileType", {
//     description: "The type of the file derived from its mime type.",
//   })
// ) {}
//
// export declare namespace FileType {
//   export type Type = S.Schema.Type<typeof FileType>;
//   export type Encoded = S.Schema.Encoded<typeof FileType>;
// }
//
// const isFile = (i: unknown): i is File => i instanceof File;
//
// export class FileFromSelf extends S.declare(
//   isFile,
//   $I.annotations("FileFromSelf", {
//     description: "A file instance created from a File object.",
//     arbitrary: () => (fc) => fc.tuple(fc.string(), fc.string()).map(([content, path]) => new File([content], path)),
//   })
// ) {}
//
// export declare namespace FileFromSelf {
//   export type Type = S.Schema.Type<typeof FileFromSelf>;
//   export type Encoded = S.Schema.Encoded<typeof FileFromSelf>;
// }
//
// export class ArrayBufferFromFile extends S.transformOrFail(FileFromSelf, ArrayBufferFromSelf, {
//   strict: true,
//   decode: (file, _, ast) =>
//     Effect.tryPromise({
//       try: () => file.arrayBuffer(),
//       catch: () => new ParseResult.Type(ast, file, "Failed to parse file to array buffer."),
//     }),
//   encode: (arrayBuffer, _, ast) =>
//     ParseResult.try({
//       try: () => new File([arrayBuffer], "file"),
//       catch: () => new ParseResult.Type(ast, arrayBuffer, "Failed to parse array buffer to file."),
//     }),
// }).annotations(
//   $I.annotations("ArrayBufferFromFile", {
//     description: "An array buffer created from a File object.",
//   })
// ) {
//   static readonly decode = S.decode(this);
//   static readonly encode = S.encode(this);
//
//   static readonly getFileChunk = flow(
//     this.decode,
//     Effect.flatMap(getFileChunkEither),
//     Effect.flatMap(fileTypeChecker.detectFileEither),
//     Effect.map((detected) => {
//
//     })
//   );
// }
//
// export class FileChunkInput extends S.Union(S.Array(S.Number), ArrayBufferFromSelf, S.Uint8ArrayFromSelf).annotations(
//   $I.annotations("FileChunkInput", {
//     description: "A file chunk input.",
//   })
// ) {}
//
// export class FileChunkFromFileInput extends S.Struct({
//   file: FileFromSelf,
//   fileChunkLength: toOptionalWithDefault(S.NonNegativeInt)(32),
// }).annotations(
//   $I.annotations("FileChunkFromFileInput", {
//     description: "A file chunk input created from a File object.",
//   })
// ) {}
