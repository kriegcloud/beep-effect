import * as Ndjson from "@effect/platform/Ndjson"
import { Effect, Option, Schema, Stream } from "effect"

import { IngestionDecodeError, IngestionFormatError } from "../Errors.js"
import type {
  CsvIngestionOptions,
  EffectiveIngestionFormat,
  IngestionFormat,
  IngestionRow,
  IngestionSource,
  JsonIngestionOptions,
  RowErrorMode,
  TextIngestionOptions
} from "./Models.js"
import {
  IngestionRow as IngestionRowModel,
  IngestionRowOrigin as IngestionRowOriginModel
} from "./Models.js"
import type { ByteSource } from "./SourceReaders.js"

const UnknownJson = Schema.parseJson(Schema.Unknown)
const UnknownJsonArray = Schema.parseJson(Schema.Array(Schema.Unknown))

const removeBom = (text: string, stripBom: boolean): string =>
  stripBom && text.startsWith("\uFEFF") ? text.slice(1) : text

const toDecodeError = (args: {
  readonly message: string
  readonly format: EffectiveIngestionFormat
  readonly sourceTag: "file" | "url" | "stdin"
  readonly sourceRef: string
  readonly rowIndex?: number | undefined
  readonly lineNumber?: number | undefined
}): IngestionDecodeError =>
  new IngestionDecodeError({
    message: args.message,
    format: args.format,
    sourceTag: args.sourceTag,
    sourceRef: args.sourceRef,
    ...(args.rowIndex !== undefined ? { rowIndex: args.rowIndex } : {}),
    ...(args.lineNumber !== undefined ? { lineNumber: args.lineNumber } : {})
  })

const toFormatError = (args: {
  readonly message: string
  readonly format: EffectiveIngestionFormat
  readonly sourceTag: "file" | "url" | "stdin"
  readonly sourceRef: string
}): IngestionFormatError =>
  new IngestionFormatError({
    message: args.message,
    format: args.format,
    sourceTag: args.sourceTag,
    sourceRef: args.sourceRef
  })

const collectTextWithLimit = <R>(
  source: ByteSource<R>,
  format: EffectiveIngestionFormat,
  maxBytes?: number | undefined
): Effect.Effect<string, IngestionDecodeError | IngestionFormatError, R> =>
  Effect.gen(function* () {
    const chunks = yield* Stream.runFoldEffect(
      source.stream.pipe(
        Stream.mapError((error) =>
          toDecodeError({
            message: `Failed to read source stream: ${String(error)}`,
            format,
            sourceTag: source.sourceTag,
            sourceRef: source.sourceRef
          })
        )
      ),
      {
        total: 0,
        values: [] as Array<Uint8Array>
      },
      (state, chunk) => {
        const total = state.total + chunk.byteLength
        if (maxBytes !== undefined && total > maxBytes) {
          return Effect.fail(
            toFormatError({
              message: `Input exceeds maxBytes (${maxBytes}).`,
              format,
              sourceTag: source.sourceTag,
              sourceRef: source.sourceRef
            })
          )
        }

        return Effect.succeed({
          total,
          values: [...state.values, chunk]
        })
      }
    )

    const merged = new Uint8Array(chunks.total)
    let offset = 0
    for (const chunk of chunks.values) {
      merged.set(chunk, offset)
      offset += chunk.byteLength
    }

    return yield* Effect.try({
      try: () => new TextDecoder("utf-8", { fatal: true }).decode(merged),
      catch: (error) =>
        toDecodeError({
          message: `Failed to decode UTF-8 input: ${String(error)}`,
          format,
          sourceTag: source.sourceTag,
          sourceRef: source.sourceRef
        })
    })
  })

const decodeUtf8Stream = <R>(
  source: ByteSource<R>,
  format: EffectiveIngestionFormat
): Stream.Stream<string, IngestionDecodeError, R> =>
  source.stream.pipe(
    Stream.decodeText("utf-8"),
    Stream.mapError((error) =>
      toDecodeError({
        message: `Failed to decode UTF-8 stream: ${String(error)}`,
        format,
        sourceTag: source.sourceTag,
        sourceRef: source.sourceRef
      })
    )
  )

const inferFileLikeFormat = (value: string): EffectiveIngestionFormat => {
  const lowered = value.toLowerCase()
  if (lowered.endsWith(".jsonl") || lowered.endsWith(".ndjson")) {
    return "jsonl"
  }
  if (lowered.endsWith(".json")) {
    return "json"
  }
  if (lowered.endsWith(".csv")) {
    return "csv"
  }
  return "text"
}

export const resolveEffectiveFormat = (
  source: IngestionSource,
  format: IngestionFormat
): EffectiveIngestionFormat => {
  if (format === "text") {
    return "text"
  }
  if (format === "json") {
    return "json"
  }
  if (format === "jsonl") {
    return "jsonl"
  }
  if (format === "csv") {
    return "csv"
  }

  if (format === "file" || format === "url" || format === "stdin") {
    return "text"
  }

  switch (source._tag) {
    case "text":
      return "text"
    case "stdin":
      return "text"
    case "file":
      return inferFileLikeFormat(source.path)
    case "url": {
      try {
        const parsed = new URL(source.url)
        return inferFileLikeFormat(parsed.pathname)
      } catch {
        return "text"
      }
    }
  }
}

const parseLineJson = (
  line: string,
  args: {
    readonly source: ByteSource<unknown>
    readonly rowIndex: number
    readonly lineNumber: number
  }
): Effect.Effect<unknown, IngestionDecodeError> =>
  Schema.decodeUnknown(UnknownJson)(line).pipe(
    Effect.mapError((error) =>
      toDecodeError({
        message: `Invalid JSONL row: ${String(error)}`,
        format: "jsonl",
        sourceTag: args.source.sourceTag,
        sourceRef: args.source.sourceRef,
        rowIndex: args.rowIndex,
        lineNumber: args.lineNumber
      })
    )
  )

const logSkippedRow = (args: {
  readonly format: "jsonl" | "csv"
  readonly source: ByteSource<unknown>
  readonly lineNumber: number
  readonly rowIndex: number
  readonly reason: string
}): Effect.Effect<void> =>
  Effect.logWarning(`Skipping malformed ${args.format} row`).pipe(
    Effect.annotateLogs({
      sourceTag: args.source.sourceTag,
      sourceRef: args.source.sourceRef,
      lineNumber: args.lineNumber,
      rowIndex: args.rowIndex,
      reason: args.reason
    })
  )

const parseCsvRecord = (
  rawLine: string,
  delimiter: string
): Effect.Effect<ReadonlyArray<string>, string> =>
  Effect.sync(() => {
    const values: Array<string> = []
    let current = ""
    let inQuotes = false

    for (let index = 0; index < rawLine.length; index++) {
      const char = rawLine[index]
      if (char === "\"") {
        if (inQuotes && rawLine[index + 1] === "\"") {
          current += "\""
          index += 1
        } else {
          inQuotes = !inQuotes
        }
        continue
      }

      if (char === delimiter && !inQuotes) {
        values.push(current)
        current = ""
        continue
      }

      current += char
    }

    if (inQuotes) {
      throw new Error("Unterminated quoted field")
    }

    values.push(current)
    return values
  }).pipe(
    Effect.mapError((error) => `Invalid CSV row: ${String(error)}`)
  )

const buildCsvRowObject = (
  args: {
    readonly headers: ReadonlyArray<string> | undefined
    readonly values: ReadonlyArray<string>
    readonly rowIndex: number
    readonly lineNumber: number
    readonly source: ByteSource<unknown>
    readonly onRowError: RowErrorMode
  }
): Effect.Effect<Record<string, string>, IngestionDecodeError> =>
  Effect.gen(function* () {
    if (args.headers === undefined) {
      return Object.fromEntries(
        args.values.map((value, index) => [`column_${index + 1}`, value])
      )
    }

    if (args.values.length !== args.headers.length) {
      return yield* toDecodeError({
        message: `CSV column count mismatch. Expected ${args.headers.length}, received ${args.values.length}.`,
        format: "csv",
        sourceTag: args.source.sourceTag,
        sourceRef: args.source.sourceRef,
        rowIndex: args.rowIndex,
        lineNumber: args.lineNumber
      })
    }

    const entries = args.headers.map((header, index) => [header, args.values[index] ?? ""])
    return Object.fromEntries(entries)
  }).pipe(
    Effect.catchAll((error) =>
      args.onRowError === "skip-row"
        ? logSkippedRow({
            format: "csv",
            source: args.source,
            rowIndex: args.rowIndex,
            lineNumber: args.lineNumber,
            reason: error.message
          }).pipe(Effect.zipRight(Effect.fail(error)))
        : Effect.fail(error)
    )
  )

export const decodeTextDocument = <R>(
  source: ByteSource<R>,
  options: TextIngestionOptions | undefined
): Effect.Effect<string, IngestionDecodeError, R> =>
  decodeUtf8Stream(source, "text").pipe(
    Stream.mkString,
    Effect.map((text) =>
      removeBom(text, options?.stripBom ?? true)
    )
  )

export const decodeJsonRows = <R>(
  source: ByteSource<R>,
  options: JsonIngestionOptions | undefined,
  textOptions: TextIngestionOptions | undefined
): Stream.Stream<IngestionRow, IngestionDecodeError | IngestionFormatError, R> =>
  Stream.unwrap(
    collectTextWithLimit(source, "json", options?.maxBytes).pipe(
      Effect.map((raw) => removeBom(raw, textOptions?.stripBom ?? true)),
      Effect.flatMap((raw) =>
        Schema.decodeUnknown(UnknownJsonArray)(raw).pipe(
          Effect.mapError((error) =>
            toDecodeError({
              message: `Invalid JSON array input: ${String(error)}`,
              format: "json",
              sourceTag: source.sourceTag,
              sourceRef: source.sourceRef
            })
          )
        )
      ),
      Effect.map((rows) =>
        Stream.fromIterable(rows).pipe(
          Stream.mapAccum(0, (rowIndex, value) => [
            rowIndex + 1,
            new IngestionRowModel({
              origin: new IngestionRowOriginModel({
                sourceTag: source.sourceTag,
                sourceRef: source.sourceRef,
                rowIndex
              }),
              value
            })
          ])
        )
      )
    )
  )

export const decodeJsonlRows = <R>(
  source: ByteSource<R>,
  options: {
    readonly onRowError: RowErrorMode
    readonly text: TextIngestionOptions | undefined
  }
): Stream.Stream<IngestionRow, IngestionDecodeError, R> => {
  if (options.onRowError === "fail-fast") {
    return source.stream.pipe(
      Stream.pipeThroughChannel(
        Ndjson.unpackSchema(Schema.Unknown)({
          ignoreEmptyLines: true
        })
      ),
      Stream.mapAccum(0, (rowIndex, value) => [
        rowIndex + 1,
        new IngestionRowModel({
          origin: new IngestionRowOriginModel({
            sourceTag: source.sourceTag,
            sourceRef: source.sourceRef,
            rowIndex,
            lineNumber: rowIndex + 1
          }),
          value
        })
      ]),
      Stream.mapError((error) =>
        toDecodeError({
          message: `Failed to parse JSONL stream: ${String(error)}`,
          format: "jsonl",
          sourceTag: source.sourceTag,
          sourceRef: source.sourceRef
        })
      )
    )
  }

  return decodeUtf8Stream(source, "jsonl").pipe(
    Stream.splitLines,
    Stream.mapAccumEffect(
      {
        firstLine: true,
        lineNumber: 0,
        rowIndex: 0
      },
      (state, rawLine) => {
        const lineNumber = state.lineNumber + 1
        const line = state.firstLine
          ? removeBom(rawLine, options.text?.stripBom ?? true)
          : rawLine
        const nextBase = {
          firstLine: false,
          lineNumber,
          rowIndex: state.rowIndex
        }

        if (line.trim().length === 0) {
          return Effect.succeed([nextBase, Option.none<IngestionRow>()] as const)
        }

        const rowIndex = state.rowIndex

        return parseLineJson(line, {
          source,
          rowIndex,
          lineNumber
        }).pipe(
          Effect.map((value) => [
            {
              ...nextBase,
              rowIndex: rowIndex + 1
            },
            Option.some(
              new IngestionRowModel({
                origin: new IngestionRowOriginModel({
                  sourceTag: source.sourceTag,
                  sourceRef: source.sourceRef,
                  rowIndex,
                  lineNumber
                }),
                value
              })
            )
          ] as const),
          Effect.catchAll((error) =>
            logSkippedRow({
              format: "jsonl",
              source,
              lineNumber,
              rowIndex,
              reason: error.message
            }).pipe(
              Effect.as([
                {
                  ...nextBase,
                  rowIndex: rowIndex + 1
                },
                Option.none<IngestionRow>()
              ] as const)
            )
          )
        )
      }
    ),
    Stream.filterMap((value) => value)
  )
}

export const decodeCsvRows = <R>(
  source: ByteSource<R>,
  options: {
    readonly csv: CsvIngestionOptions | undefined
    readonly text: TextIngestionOptions | undefined
    readonly onRowError: RowErrorMode
  }
): Stream.Stream<IngestionRow, IngestionDecodeError | IngestionFormatError, R> => {
  const delimiter = options.csv?.delimiter ?? ","
  if (delimiter.length !== 1) {
    return Stream.fail(
      toFormatError({
        message: `CSV delimiter must be a single character, received '${delimiter}'.`,
        format: "csv",
        sourceTag: source.sourceTag,
        sourceRef: source.sourceRef
      })
    )
  }

  const hasHeader = options.csv?.hasHeader ?? true

  return decodeUtf8Stream(source, "csv").pipe(
    Stream.splitLines,
    Stream.mapAccumEffect(
      {
        firstLine: true,
        lineNumber: 0,
        rowIndex: 0,
        headers: undefined as ReadonlyArray<string> | undefined
      },
      (state, rawLine) => {
        const lineNumber = state.lineNumber + 1
        const line = state.firstLine
          ? removeBom(rawLine, options.text?.stripBom ?? true)
          : rawLine

        const nextState = {
          ...state,
          firstLine: false,
          lineNumber
        }

        if (line.trim().length === 0) {
          return Effect.succeed([nextState, Option.none<IngestionRow>()] as const)
        }

        const rowIndex = state.rowIndex

        return parseCsvRecord(line, delimiter).pipe(
          Effect.mapError((reason) =>
            toDecodeError({
              message: reason,
              format: "csv",
              sourceTag: source.sourceTag,
              sourceRef: source.sourceRef,
              rowIndex,
              lineNumber
            })
          ),
          Effect.flatMap((values) => {
            if (hasHeader && state.headers === undefined) {
              return Effect.succeed([
                {
                  ...nextState,
                  headers: values.map((value) => value.trim())
                },
                Option.none<IngestionRow>()
              ] as const)
            }

            return buildCsvRowObject({
              headers: state.headers,
              values,
              rowIndex,
              lineNumber,
              source,
              onRowError: options.onRowError
            }).pipe(
              Effect.map((record) => [
                {
                  ...nextState,
                  rowIndex: rowIndex + 1,
                  headers: state.headers
                },
                Option.some(
                  new IngestionRowModel({
                    origin: new IngestionRowOriginModel({
                      sourceTag: source.sourceTag,
                      sourceRef: source.sourceRef,
                      rowIndex,
                      lineNumber
                    }),
                    value: record
                  })
                )
              ] as const)
            )
          }),
          Effect.catchAll((error) =>
            options.onRowError === "skip-row"
              ? logSkippedRow({
                  format: "csv",
                  source,
                  lineNumber,
                  rowIndex,
                  reason: error.message
                }).pipe(
                  Effect.as([
                    {
                      ...nextState,
                      rowIndex: rowIndex + 1,
                      headers: state.headers
                    },
                    Option.none<IngestionRow>()
                  ] as const)
                )
              : Effect.fail(error)
          )
        )
      }
    ),
    Stream.filterMap((value) => value)
  )
}
