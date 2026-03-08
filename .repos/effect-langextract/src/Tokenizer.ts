import { Effect, Layer, Schema } from "effect"

import { CharInterval } from "./Data.js"

export const FUZZY_ALIGNMENT_MIN_THRESHOLD = 0.75

export const TokenType = Schema.Literal("word", "number", "punctuation")
export type TokenType = typeof TokenType.Type

export class TokenInterval extends Schema.Class<TokenInterval>("TokenInterval")({
  startIndex: Schema.optionalWith(Schema.Int, { default: () => 0 }),
  endIndex: Schema.optionalWith(Schema.Int, { default: () => 0 })
}) {}

export class Token extends Schema.Class<Token>("Token")({
  index: Schema.Int,
  tokenType: TokenType,
  text: Schema.String,
  charInterval: CharInterval,
  firstTokenAfterNewline: Schema.optionalWith(Schema.Boolean, {
    default: () => false
  })
}) {}

export class TokenizedText extends Schema.Class<TokenizedText>("TokenizedText")({
  text: Schema.String,
  tokens: Schema.optionalWith(Schema.Array(Token), {
    default: () => []
  })
}) {}

export interface TokenizerService {
  readonly tokenize: (text: string) => TokenizedText
  readonly tokensText: (tokenizedText: TokenizedText, interval: TokenInterval) => string
  readonly findSentenceRange: (
    text: string,
    tokens: ReadonlyArray<Token>,
    startTokenIndex: number
  ) => TokenInterval
}

const DigitsPattern = /^\d+$/u
const WordPattern = /^(?:[^\W\d_]+|\d+)$/u
const TokenPattern = /[^\W\d_]+|\d+|([^\w\s]|_)\1*/gu

const tokenTypeFromText = (value: string): TokenType => {
  if (DigitsPattern.test(value)) {
    return "number"
  }
  if (WordPattern.test(value)) {
    return "word"
  }
  return "punctuation"
}

const regexTokenize = (text: string): TokenizedText => {
  const matcher = new RegExp(TokenPattern)
  const tokens: Array<Token> = []
  let match: RegExpExecArray | null = matcher.exec(text)
  let previousEnd = 0

  while (match !== null) {
    const value = match[0]
    const startPos = match.index
    const endPos = startPos + value.length
    const gap = text.slice(previousEnd, startPos)
    const hasNewline =
      tokens.length > 0
      && (
        gap.includes("\n")
        || gap.includes("\r")
      )

    tokens.push(
      new Token({
        index: tokens.length,
        tokenType: tokenTypeFromText(value),
        text: value,
        charInterval: new CharInterval({
          startPos,
          endPos
        }),
        firstTokenAfterNewline: hasNewline
      })
    )

    previousEnd = endPos
    match = matcher.exec(text)
  }

  return new TokenizedText({ text, tokens })
}

type TokenSpan = {
  readonly text: string
  readonly startPos: number
  readonly endPos: number
}

const spansToTokenizedText = (
  text: string,
  spans: ReadonlyArray<TokenSpan>
): TokenizedText => {
  const tokens: Array<Token> = []
  let previousEnd = 0

  for (const span of spans) {
    const gap = text.slice(previousEnd, span.startPos)
    const hasNewline =
      tokens.length > 0 &&
      (gap.includes("\n") || gap.includes("\r"))

    tokens.push(
      new Token({
        index: tokens.length,
        tokenType: tokenTypeFromText(span.text),
        text: span.text,
        charInterval: new CharInterval({
          startPos: span.startPos,
          endPos: span.endPos
        }),
        firstTokenAfterNewline: hasNewline
      })
    )
    previousEnd = span.endPos
  }

  return new TokenizedText({ text, tokens })
}

const segmenterTokenize = (text: string): TokenizedText => {
  const SegmenterCtor = globalThis.Intl?.Segmenter
  if (typeof SegmenterCtor !== "function") {
    return regexTokenize(text)
  }

  const segmenter = new SegmenterCtor(undefined, {
    granularity: "word"
  })
  const spans: Array<TokenSpan> = []

  for (const segment of segmenter.segment(text)) {
    const segmentText = segment.segment
    const segmentStart = segment.index

    if (segment.isWordLike === true) {
      spans.push({
        text: segmentText,
        startPos: segmentStart,
        endPos: segmentStart + segmentText.length
      })
      continue
    }

    const matcher = new RegExp(TokenPattern)
    let match: RegExpExecArray | null = matcher.exec(segmentText)
    while (match !== null) {
      const value = match[0]
      const startPos = segmentStart + match.index
      spans.push({
        text: value,
        startPos,
        endPos: startPos + value.length
      })
      match = matcher.exec(segmentText)
    }
  }

  return spansToTokenizedText(text, spans)
}

const tokensTextImpl = (tokenizedText: TokenizedText, interval: TokenInterval): string => {
  const boundedStart = Math.max(0, interval.startIndex)
  const boundedEnd = Math.max(boundedStart, interval.endIndex)
  return tokenizedText.tokens
    .slice(boundedStart, boundedEnd)
    .map((token: Token) => token.text)
    .join(" ")
}

const findSentenceRangeImpl = (
  _text: string,
  tokens: ReadonlyArray<Token>,
  startTokenIndex: number
): TokenInterval => {
  if (tokens.length === 0) {
    return new TokenInterval({ startIndex: 0, endIndex: 0 })
  }

  let endIndex = Math.max(0, startTokenIndex)
  while (endIndex < tokens.length) {
    const tokenText = tokens[endIndex]?.text ?? ""
    endIndex += 1
    if (/[.!?]$/.test(tokenText)) {
      break
    }
  }

  return new TokenInterval({
    startIndex: Math.max(0, startTokenIndex),
    endIndex: Math.max(0, endIndex)
  })
}

export class Tokenizer extends Effect.Service<Tokenizer>()(
  "@effect-langextract/Tokenizer",
  {
    sync: () => ({
      tokenize: regexTokenize,
      tokensText: tokensTextImpl,
      findSentenceRange: findSentenceRangeImpl
    } satisfies TokenizerService)
  }
) {
  static readonly Test: Layer.Layer<Tokenizer> = Tokenizer.Default

  static testLayer = (service: TokenizerService): Layer.Layer<Tokenizer> =>
    Layer.succeed(Tokenizer, Tokenizer.make(service))
}

export const RegexTokenizerLive: Layer.Layer<Tokenizer> = Tokenizer.Default

export const UnicodeTokenizerLive: Layer.Layer<Tokenizer> =
  Layer.succeed(
    Tokenizer,
    Tokenizer.make({
      tokenize: segmenterTokenize,
      tokensText: tokensTextImpl,
      findSentenceRange: findSentenceRangeImpl
    } satisfies TokenizerService)
  )

export const TokenizerTest: Layer.Layer<Tokenizer> = Tokenizer.Test
