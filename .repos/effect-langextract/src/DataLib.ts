import { Schema } from "effect"

import { AnnotatedDocument } from "./Data.js"

export const decodeAnnotatedDocument = (input: unknown) =>
  Schema.decodeUnknown(AnnotatedDocument)(input)

export const encodeAnnotatedDocument = (doc: AnnotatedDocument) =>
  Schema.encode(AnnotatedDocument)(doc)

const AnnotatedDocumentJson = Schema.parseJson(AnnotatedDocument)

export const decodeAnnotatedDocumentJson = (json: string) =>
  Schema.decode(AnnotatedDocumentJson)(json)

export const encodeAnnotatedDocumentJson = (doc: AnnotatedDocument) =>
  Schema.encode(AnnotatedDocumentJson)(doc)
