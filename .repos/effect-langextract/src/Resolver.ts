import { Effect, Layer } from "effect"

import {
  AlignmentStatus,
  ATTRIBUTE_SUFFIX,
  CharInterval,
  Extraction
} from "./Data.js"
import { AlignmentError, ResolverParsingError } from "./Errors.js"
import { FormatHandler } from "./FormatHandler.js"
import { errorMessage } from "./internal/errorMessage.js"
import { asRecord } from "./internal/records.js"
import {
  FUZZY_ALIGNMENT_MIN_THRESHOLD,
  TokenInterval,
  TokenizedText,
  Tokenizer,
  type TokenizerService
} from "./Tokenizer.js"

export const DEFAULT_INDEX_SUFFIX = "_index"
const DEFAULT_ALIGNMENT_DELIMITER = "\u241F"

export interface ResolverService {
  readonly resolve: (
    inputText: string,
    options?: { suppressParseErrors?: boolean }
  ) => Effect.Effect<ReadonlyArray<Extraction>, ResolverParsingError>

  readonly align: (
    extractions: ReadonlyArray<Extraction>,
    sourceText: string,
    tokenOffset: number,
    charOffset: number,
    options?: {
      enableFuzzyAlignment?: boolean
      fuzzyAlignmentThreshold?: number
      acceptMatchLesser?: boolean
    }
  ) => Effect.Effect<ReadonlyArray<Extraction>, AlignmentError>
}

type MatchBlock = {
  readonly i: number
  readonly j: number
  readonly n: number
}

type AlignmentOptions = {
  readonly enableFuzzyAlignment?: boolean | undefined
  readonly fuzzyAlignmentThreshold?: number | undefined
  readonly acceptMatchLesser?: boolean | undefined
}

type ExtractionLocation = {
  readonly groupIndex: number
  readonly itemIndex: number
}

const extractStringField = (
  record: Readonly<Record<string, unknown>>,
  keys: ReadonlyArray<string>
): string | undefined => {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === "string" && value.trim().length > 0) {
      return value
    }
  }
  return undefined
}

const extractNumberField = (
  record: Readonly<Record<string, unknown>>,
  keys: ReadonlyArray<string>
): number | undefined => {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === "number" && Number.isFinite(value)) {
      return value
    }
  }
  return undefined
}

const toAttributeValue = (
  value: unknown
): string | ReadonlyArray<string> | undefined => {
  if (typeof value === "string") {
    return value
  }
  if (
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "bigint"
  ) {
    return String(value)
  }
  if (Array.isArray(value)) {
    const normalized = value
      .map((entry) => (typeof entry === "string" ? entry : String(entry)))
      .filter((entry) => entry.length > 0)
    return normalized.length > 0 ? normalized : undefined
  }
  return undefined
}

const extractAttributes = (
  record: Readonly<Record<string, unknown>>,
  key: string
): Record<string, string | ReadonlyArray<string>> | undefined => {
  const nested = asRecord(record[key])
  if (nested === undefined) {
    return undefined
  }

  const attributes: Record<string, string | ReadonlyArray<string>> = {}
  for (const [attributeKey, attributeValue] of Object.entries(nested)) {
    const coerced = toAttributeValue(attributeValue)
    if (coerced !== undefined) {
      attributes[attributeKey] = coerced
    }
  }
  return Object.keys(attributes).length > 0 ? attributes : undefined
}

const parseDirectExtractionRecord = (
  record: Readonly<Record<string, unknown>>,
  fallbackIndex: number,
  groupIndex: number
): Extraction | undefined => {
  const extractionClass = extractStringField(record, [
    "extractionClass",
    "extraction_class",
    "class",
    "type"
  ])
  if (extractionClass === undefined) {
    return undefined
  }

  const rawText = extractStringField(record, [
    "extractionText",
    "extraction_text",
    "text",
    "value"
  ])
  if (rawText === undefined) {
    return undefined
  }

  const extractionIndex = extractNumberField(record, [
    "extractionIndex",
    "extraction_index",
    "index"
  ])
  const attributes =
    extractAttributes(record, "attributes")
    ?? extractAttributes(record, `${extractionClass}${ATTRIBUTE_SUFFIX}`)

  return new Extraction({
    extractionClass,
    extractionText: rawText,
    extractionIndex:
      extractionIndex !== undefined && Number.isInteger(extractionIndex)
        ? extractionIndex
        : fallbackIndex,
    groupIndex,
    ...(attributes !== undefined ? { attributes } : {})
  })
}

const isPrimitiveExtractionValue = (value: unknown): boolean =>
  typeof value === "string" || typeof value === "number" || typeof value === "boolean"

const extractOrderedExtractions = (
  extractionData: ReadonlyArray<Record<string, unknown>>,
  extractionIndexSuffix: string | undefined,
  attributeSuffix: string | undefined
): Effect.Effect<ReadonlyArray<Extraction>, ResolverParsingError> =>
  Effect.gen(function* () {
    const processed: Array<Extraction> = []
    let fallbackIndex = 0

    for (const [groupIndex, group] of extractionData.entries()) {
      const direct = parseDirectExtractionRecord(group, fallbackIndex + 1, groupIndex)
      if (direct !== undefined) {
        fallbackIndex += 1
        processed.push(direct)
        continue
      }

      for (const [extractionClass, extractionValue] of Object.entries(group)) {
        if (
          extractionIndexSuffix !== undefined &&
          extractionClass.endsWith(extractionIndexSuffix)
        ) {
          if (!Number.isInteger(extractionValue)) {
            return yield* new ResolverParsingError({
              message: "Index must be an integer."
            })
          }
          continue
        }

        if (attributeSuffix !== undefined && extractionClass.endsWith(attributeSuffix)) {
          const attributesRecord = asRecord(extractionValue)
          if (
            extractionValue !== undefined &&
            extractionValue !== null &&
            attributesRecord === undefined
          ) {
            return yield* new ResolverParsingError({
              message: "Extraction attributes must be an object or null."
            })
          }
          continue
        }

        if (extractionClass === "attributes" && asRecord(extractionValue) !== undefined) {
          continue
        }

        if (!isPrimitiveExtractionValue(extractionValue)) {
          return yield* new ResolverParsingError({
            message: "Extraction text must be a primitive value."
          })
        }

        const extractionText = String(extractionValue)
        let extractionIndex: number

        if (extractionIndexSuffix !== undefined) {
          const indexValue = group[`${extractionClass}${extractionIndexSuffix}`]
          if (indexValue === undefined) {
            continue
          }
          if (typeof indexValue !== "number" || !Number.isInteger(indexValue)) {
            return yield* new ResolverParsingError({
              message: "Index must be an integer."
            })
          }
          extractionIndex = indexValue
        } else {
          fallbackIndex += 1
          extractionIndex = fallbackIndex
        }

        const attributes =
          attributeSuffix !== undefined
            ? extractAttributes(group, `${extractionClass}${attributeSuffix}`)
            : undefined

        processed.push(
          new Extraction({
            extractionClass,
            extractionText,
            extractionIndex,
            groupIndex,
            ...(attributes !== undefined ? { attributes } : {})
          })
        )
      }
    }

    return processed.sort(
      (left, right) => (left.extractionIndex ?? 0) - (right.extractionIndex ?? 0)
    )
  })

const tokenizeWithLowercase = (
  tokenizer: TokenizerService,
  text: string
): ReadonlyArray<string> =>
  tokenizer
    .tokenize(text)
    .tokens
    .map((token) => token.text.toLowerCase())

const normalizeToken = (token: string): string => {
  const lowered = token.toLowerCase()
  if (lowered.length > 3 && lowered.endsWith("s") && !lowered.endsWith("ss")) {
    return lowered.slice(0, lowered.length - 1)
  }
  return lowered
}

const countTokenOccurrences = (
  tokens: ReadonlyArray<string>
): Map<string, number> => {
  const counts = new Map<string, number>()
  for (const token of tokens) {
    counts.set(token, (counts.get(token) ?? 0) + 1)
  }
  return counts
}

const countIntersection = (
  left: ReadonlyMap<string, number>,
  right: ReadonlyMap<string, number>
): number => {
  let total = 0
  for (const [token, count] of left.entries()) {
    const rightCount = right.get(token)
    if (rightCount !== undefined) {
      total += Math.min(count, rightCount)
    }
  }
  return total
}

const decrementCount = (counts: Map<string, number>, key: string): void => {
  const current = counts.get(key)
  if (current === undefined) {
    return
  }
  if (current <= 1) {
    counts.delete(key)
    return
  }
  counts.set(key, current - 1)
}

const copyExtraction = (extraction: Extraction): Extraction =>
  new Extraction({
    ...extraction
  })

const stripAlignment = (extraction: Extraction): Extraction =>
  new Extraction({
    extractionClass: extraction.extractionClass,
    extractionText: extraction.extractionText,
    ...(extraction.extractionIndex !== undefined
      ? { extractionIndex: extraction.extractionIndex }
      : {}),
    ...(extraction.groupIndex !== undefined
      ? { groupIndex: extraction.groupIndex }
      : {}),
    ...(extraction.description !== undefined
      ? { description: extraction.description }
      : {}),
    ...(extraction.attributes !== undefined
      ? { attributes: { ...extraction.attributes } }
      : {})
  })

class SequenceMatcher {
  private sourceTokens: ReadonlyArray<string> = []
  private extractionTokens: ReadonlyArray<string> = []
  private tokenIndexes = new Map<string, ReadonlyArray<number>>()

  setSeqs(
    sourceTokens: ReadonlyArray<string>,
    extractionTokens: ReadonlyArray<string>
  ): void {
    this.sourceTokens = sourceTokens
    this.extractionTokens = extractionTokens

    const tokenIndexes = new Map<string, Array<number>>()
    for (const [index, token] of extractionTokens.entries()) {
      const list = tokenIndexes.get(token)
      if (list !== undefined) {
        list.push(index)
      } else {
        tokenIndexes.set(token, [index])
      }
    }

    this.tokenIndexes = new Map(
      [...tokenIndexes.entries()].map(([token, indexes]) => [token, indexes])
    )
  }

  private findLongestMatch(
    sourceStart: number,
    sourceEnd: number,
    extractionStart: number,
    extractionEnd: number
  ): MatchBlock {
    let bestI = sourceStart
    let bestJ = extractionStart
    let bestSize = 0
    let previous = new Map<number, number>()

    for (let i = sourceStart; i < sourceEnd; i += 1) {
      const current = new Map<number, number>()
      const sourceToken = this.sourceTokens[i]
      const candidateIndexes = sourceToken !== undefined
        ? (this.tokenIndexes.get(sourceToken) ?? [])
        : []

      for (const j of candidateIndexes) {
        if (j < extractionStart) {
          continue
        }
        if (j >= extractionEnd) {
          break
        }
        const candidateLength = (previous.get(j - 1) ?? 0) + 1
        current.set(j, candidateLength)
        if (candidateLength > bestSize) {
          bestI = i - candidateLength + 1
          bestJ = j - candidateLength + 1
          bestSize = candidateLength
        }
      }

      previous = current
    }

    while (
      bestI > sourceStart &&
      bestJ > extractionStart &&
      this.sourceTokens[bestI - 1] === this.extractionTokens[bestJ - 1]
    ) {
      bestI -= 1
      bestJ -= 1
      bestSize += 1
    }

    while (
      bestI + bestSize < sourceEnd &&
      bestJ + bestSize < extractionEnd &&
      this.sourceTokens[bestI + bestSize] === this.extractionTokens[bestJ + bestSize]
    ) {
      bestSize += 1
    }

    return { i: bestI, j: bestJ, n: bestSize }
  }

  getMatchingBlocks(): ReadonlyArray<MatchBlock> {
    const sourceLength = this.sourceTokens.length
    const extractionLength = this.extractionTokens.length
    const pending: Array<[number, number, number, number]> = [
      [0, sourceLength, 0, extractionLength]
    ]
    const matches: Array<MatchBlock> = []

    while (pending.length > 0) {
      const current = pending.pop()
      if (current === undefined) {
        break
      }
      const [sourceStart, sourceEnd, extractionStart, extractionEnd] = current
      const match = this.findLongestMatch(
        sourceStart,
        sourceEnd,
        extractionStart,
        extractionEnd
      )

      if (match.n <= 0) {
        continue
      }

      matches.push(match)

      if (sourceStart < match.i && extractionStart < match.j) {
        pending.push([sourceStart, match.i, extractionStart, match.j])
      }
      const nextSourceStart = match.i + match.n
      const nextExtractionStart = match.j + match.n
      if (nextSourceStart < sourceEnd && nextExtractionStart < extractionEnd) {
        pending.push([nextSourceStart, sourceEnd, nextExtractionStart, extractionEnd])
      }
    }

    matches.sort((left, right) => left.i - right.i || left.j - right.j)

    const collapsed: Array<MatchBlock> = []
    let i = 0
    let j = 0
    let n = 0

    for (const block of matches) {
      if (i + n === block.i && j + n === block.j) {
        n += block.n
      } else {
        if (n > 0) {
          collapsed.push({ i, j, n })
        }
        i = block.i
        j = block.j
        n = block.n
      }
    }

    if (n > 0) {
      collapsed.push({ i, j, n })
    }

    collapsed.push({
      i: sourceLength,
      j: extractionLength,
      n: 0
    })

    return collapsed
  }
}

const sumMatchedTokenCount = (
  matcher: SequenceMatcher,
  sourceTokens: ReadonlyArray<string>,
  extractionTokens: ReadonlyArray<string>
): number => {
  matcher.setSeqs(sourceTokens, extractionTokens)
  let total = 0
  for (const block of matcher.getMatchingBlocks()) {
    total += block.n
  }
  return total
}

const fuzzyAlignExtraction = (
  extraction: Extraction,
  sourceTokens: ReadonlyArray<string>,
  tokenizedSource: TokenizedText,
  tokenOffset: number,
  charOffset: number,
  fuzzyAlignmentThreshold: number,
  tokenizer: TokenizerService
): Extraction | undefined => {
  const extractionTokens = tokenizeWithLowercase(tokenizer, extraction.extractionText)
  const extractionTokensNormalized = extractionTokens.map(normalizeToken)

  if (extractionTokensNormalized.length === 0) {
    return undefined
  }

  const extractionLength = extractionTokensNormalized.length
  const extractionCounts = countTokenOccurrences(extractionTokensNormalized)
  const minOverlap = Math.floor(extractionLength * fuzzyAlignmentThreshold)
  const matcher = new SequenceMatcher()

  let bestRatio = 0
  let bestStart = -1
  let bestWindowSize = -1

  const maxWindowSize = Math.min(sourceTokens.length, extractionLength * 3)
  outer: for (
    let windowSize = extractionLength;
    windowSize <= maxWindowSize;
    windowSize += 1
  ) {
    const initial = sourceTokens
      .slice(0, windowSize)
      .map(normalizeToken)
    const windowCounts = countTokenOccurrences(initial)

    for (let startIndex = 0; startIndex + windowSize <= sourceTokens.length; startIndex += 1) {
      const overlap = countIntersection(extractionCounts, windowCounts)
      if (overlap >= minOverlap) {
        const windowTokensNormalized = sourceTokens
          .slice(startIndex, startIndex + windowSize)
          .map(normalizeToken)
        const matchedTokenCount = sumMatchedTokenCount(
          matcher,
          windowTokensNormalized,
          extractionTokensNormalized
        )
        const ratio = extractionLength > 0 ? matchedTokenCount / extractionLength : 0
        if (ratio > bestRatio) {
          bestRatio = ratio
          bestStart = startIndex
          bestWindowSize = windowSize
          if (bestRatio >= 1) {
            break outer
          }
        }
      }

      if (startIndex + windowSize < sourceTokens.length) {
        decrementCount(windowCounts, normalizeToken(sourceTokens[startIndex] ?? ""))
        const nextToken = sourceTokens[startIndex + windowSize]
        if (nextToken !== undefined) {
          const normalized = normalizeToken(nextToken)
          windowCounts.set(normalized, (windowCounts.get(normalized) ?? 0) + 1)
        }
      }
    }
  }

  if (bestStart < 0 || bestWindowSize <= 0 || bestRatio < fuzzyAlignmentThreshold) {
    return undefined
  }

  const startToken = tokenizedSource.tokens[bestStart]
  const endToken = tokenizedSource.tokens[bestStart + bestWindowSize - 1]
  if (startToken === undefined || endToken === undefined) {
    return undefined
  }

  return new Extraction({
    ...extraction,
    tokenInterval: new TokenInterval({
      startIndex: bestStart + tokenOffset,
      endIndex: bestStart + bestWindowSize + tokenOffset
    }),
    charInterval: new CharInterval({
      startPos: (startToken.charInterval.startPos ?? 0) + charOffset,
      endPos:
        (endToken.charInterval.endPos ?? (startToken.charInterval.startPos ?? 0))
        + charOffset
    }),
    alignmentStatus: "match_fuzzy"
  })
}

const alignExtractions = (
  extractionGroups: ReadonlyArray<ReadonlyArray<Extraction>>,
  sourceText: string,
  tokenOffset: number,
  charOffset: number,
  tokenizer: TokenizerService,
  options?: AlignmentOptions
): Effect.Effect<ReadonlyArray<ReadonlyArray<Extraction>>, AlignmentError> =>
  Effect.gen(function* () {
    if (extractionGroups.length === 0) {
      return []
    }

    const sourceTokens = tokenizeWithLowercase(tokenizer, sourceText)
    if (sourceTokens.length === 0) {
      return yield* new AlignmentError({
        message: "Source tokens and extraction tokens cannot be empty."
      })
    }

    const alignedGroups = extractionGroups.map((group) => group.map(copyExtraction))
    const locationByTokenIndex = new Map<number, ExtractionLocation>()
    const delimiterTokenLength = tokenizeWithLowercase(
      tokenizer,
      DEFAULT_ALIGNMENT_DELIMITER
    ).length

    if (delimiterTokenLength !== 1) {
      return yield* new AlignmentError({
        message: "Delimiter must be exactly one token."
      })
    }

    const concatenatedTokens = alignedGroups
      .flatMap((group) => group.map((extraction) => extraction.extractionText))
      .join(` ${DEFAULT_ALIGNMENT_DELIMITER} `)
    const extractionTokens = tokenizeWithLowercase(tokenizer, concatenatedTokens)
    const matcher = new SequenceMatcher()
    matcher.setSeqs(sourceTokens, extractionTokens)

    let extractionTokenIndex = 0
    for (const [groupIndex, group] of alignedGroups.entries()) {
      for (const [itemIndex, extraction] of group.entries()) {
        if (extraction.extractionText.includes(DEFAULT_ALIGNMENT_DELIMITER)) {
          return yield* new AlignmentError({
            message: `Delimiter appears inside extraction text: ${extraction.extractionText}`
          })
        }
        locationByTokenIndex.set(extractionTokenIndex, { groupIndex, itemIndex })
        extractionTokenIndex += tokenizeWithLowercase(tokenizer, extraction.extractionText).length
        extractionTokenIndex += delimiterTokenLength
      }
    }

    const tokenizedSource = tokenizer.tokenize(sourceText)
    const matchedLocations = new Set<string>()
    const acceptMatchLesser = options?.acceptMatchLesser ?? true
    const matchingBlocks = matcher.getMatchingBlocks().slice(0, -1)

    for (const block of matchingBlocks) {
      if (block.n <= 0) {
        continue
      }
      const location = locationByTokenIndex.get(block.j)
      if (location === undefined) {
        continue
      }

      const existing = alignedGroups[location.groupIndex]?.[location.itemIndex]
      if (existing === undefined) {
        continue
      }

      const extractionTokenLength = tokenizeWithLowercase(
        tokenizer,
        existing.extractionText
      ).length
      if (extractionTokenLength < block.n) {
        return yield* new AlignmentError({
          message: `Extraction token length cannot be smaller than match block size: ${existing.extractionText}`
        })
      }

      const startToken = tokenizedSource.tokens[block.i]
      const endToken = tokenizedSource.tokens[block.i + block.n - 1]
      if (startToken === undefined || endToken === undefined) {
        return yield* new AlignmentError({
          message: "Failed to map token match to source character interval."
        })
      }

      if (extractionTokenLength === block.n || acceptMatchLesser) {
        const status: AlignmentStatus =
          extractionTokenLength === block.n ? "match_exact" : "match_lesser"
        alignedGroups[location.groupIndex]![location.itemIndex] = new Extraction({
          ...existing,
          tokenInterval: new TokenInterval({
            startIndex: block.i + tokenOffset,
            endIndex: block.i + block.n + tokenOffset
          }),
          charInterval: new CharInterval({
            startPos: (startToken.charInterval.startPos ?? 0) + charOffset,
            endPos:
              (endToken.charInterval.endPos ?? (startToken.charInterval.startPos ?? 0))
              + charOffset
          }),
          alignmentStatus: status
        })
        matchedLocations.add(`${location.groupIndex}:${location.itemIndex}`)
        continue
      }

      alignedGroups[location.groupIndex]![location.itemIndex] = stripAlignment(existing)
    }

    const enableFuzzyAlignment = options?.enableFuzzyAlignment ?? true
    if (enableFuzzyAlignment) {
      const fuzzyThreshold =
        options?.fuzzyAlignmentThreshold ?? FUZZY_ALIGNMENT_MIN_THRESHOLD

      for (const [groupIndex, group] of alignedGroups.entries()) {
        for (const [itemIndex, extraction] of group.entries()) {
          const locationId = `${groupIndex}:${itemIndex}`
          if (matchedLocations.has(locationId)) {
            continue
          }

          const aligned = fuzzyAlignExtraction(
            extraction,
            sourceTokens,
            tokenizedSource,
            tokenOffset,
            charOffset,
            fuzzyThreshold,
            tokenizer
          )
          if (aligned !== undefined) {
            alignedGroups[groupIndex]![itemIndex] = aligned
            matchedLocations.add(locationId)
          }
        }
      }
    }

    return alignedGroups
  })

const toResolverParsingError = (error: unknown): ResolverParsingError =>
  new ResolverParsingError({
    message: errorMessage(error)
  })

export class Resolver extends Effect.Service<Resolver>()(
  "@effect-langextract/Resolver",
  {
    dependencies: [FormatHandler.Default, Tokenizer.Default],
    effect: Effect.gen(function* () {
      const formatHandler = yield* FormatHandler
      const tokenizer = yield* Tokenizer

      return {
        resolve: (inputText: string, options) => {
          const strict = options?.suppressParseErrors !== true

          const run = formatHandler.parseOutput(inputText, { strict }).pipe(
            Effect.mapError(toResolverParsingError),
            Effect.flatMap((records) =>
              extractOrderedExtractions(
                records,
                DEFAULT_INDEX_SUFFIX,
                formatHandler.config.attributeSuffix
              )
            )
          )

          return options?.suppressParseErrors === true
            ? run.pipe(Effect.catchAll(() => Effect.succeed([])))
            : run
        },
        align: (
          extractions: ReadonlyArray<Extraction>,
          sourceText: string,
          tokenOffset: number,
          charOffset: number,
          options
        ) =>
          alignExtractions(
            [extractions],
            sourceText,
            tokenOffset,
            charOffset,
            tokenizer,
            options
          ).pipe(Effect.map((groups) => groups.flat() as ReadonlyArray<Extraction>))
      } satisfies ResolverService
    })
  }
) {
  static readonly Test: Layer.Layer<Resolver> = Resolver.Default

  static testLayer = (
    service?: ResolverService
  ): Layer.Layer<Resolver, never, FormatHandler | Tokenizer> =>
    service !== undefined
      ? Layer.succeed(Resolver, Resolver.make(service))
      : Resolver.DefaultWithoutDependencies
}

export const ResolverLive: Layer.Layer<Resolver> = Resolver.Default

export const ResolverTest: Layer.Layer<Resolver> = Resolver.Test
