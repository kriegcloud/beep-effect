import * as A from "effect/Array"
import * as S from "effect/Schema"
import type * as AST from "effect/SchemaAST"
import { LiteralKit, type LiteralToKey, literalToKey } from "./LiteralKit.js"

type MappedPair = readonly [AST.LiteralValue, AST.LiteralValue]

type ExtractFromLiterals<Pairs extends ReadonlyArray<MappedPair>> = {
  readonly [K in keyof Pairs]: Pairs[K][0]
}

type ExtractToLiterals<Pairs extends ReadonlyArray<MappedPair>> = {
  readonly [K in keyof Pairs]: Pairs[K][1]
}

type DecodedEnum<Pairs extends ReadonlyArray<MappedPair>> = {
  readonly [P in Pairs[number] as LiteralToKey<P[0]>]: P[1]
}

type EncodedEnum<Pairs extends ReadonlyArray<MappedPair>> = {
  readonly [P in Pairs[number] as LiteralToKey<P[1]>]: P[0]
}

export type MappedLiteralKit<Pairs extends ReadonlyArray<MappedPair>> = S.Codec<
  ExtractToLiterals<Pairs>[number],
  ExtractFromLiterals<Pairs>[number],
  never,
  never
> & {
  readonly From: LiteralKit<[...{ readonly [K in keyof Pairs]: Pairs[K][0] }]>
  readonly To: LiteralKit<[...{ readonly [K in keyof Pairs]: Pairs[K][1] }]>
  readonly Pairs: Pairs
  readonly DecodedEnum: DecodedEnum<Pairs>
  readonly EncodedEnum: EncodedEnum<Pairs>
  readonly decodeMap: ReadonlyMap<
    ExtractFromLiterals<Pairs>[number],
    ExtractToLiterals<Pairs>[number]
  >
  readonly encodeMap: ReadonlyMap<
    ExtractToLiterals<Pairs>[number],
    ExtractFromLiterals<Pairs>[number]
  >
}

export function MappedLiteralKit<const Pairs extends ReadonlyArray<MappedPair>>(
  ...pairs: Pairs
): MappedLiteralKit<Pairs> {
  // TypeScript cannot infer mapped tuple element extraction through Array.map,
  // so we assert at the boundary where the runtime values are provably correct.
  // This matches the pattern in LiteralKit.ts (line 34, 79).
  const fromLiterals = A.map(pairs, (p) => p[0]) as unknown as [
    ...ExtractFromLiterals<Pairs>,
  ]
  const toLiterals = A.map(pairs, (p) => p[1]) as unknown as [
    ...ExtractToLiterals<Pairs>,
  ]

  const transformSchema = S.Literals(fromLiterals).transform(toLiterals)

  const From = LiteralKit(...fromLiterals) as unknown as LiteralKit<
    [...{ readonly [K in keyof Pairs]: Pairs[K][0] }]
  >

  const To = LiteralKit(...toLiterals) as unknown as LiteralKit<
    [...{ readonly [K in keyof Pairs]: Pairs[K][1] }]
  >

  const decodedEnum = A.reduce(
    pairs,
    {} as Record<string, AST.LiteralValue>,
    (acc, [from, to]) => {
      acc[literalToKey(from)] = to
      return acc
    },
  )

  const encodedEnum = A.reduce(
    pairs,
    {} as Record<string, AST.LiteralValue>,
    (acc, [from, to]) => {
      acc[literalToKey(to)] = from
      return acc
    },
  )

  const decodeMap = new Map(A.map(pairs, ([from, to]) => [from, to] as const))
  const encodeMap = new Map(A.map(pairs, ([from, to]) => [to, from] as const))

  return Object.assign(transformSchema, {
    From,
    To,
    Pairs: pairs,
    DecodedEnum: decodedEnum,
    EncodedEnum: encodedEnum,
    decodeMap,
    encodeMap,
  }) as unknown as MappedLiteralKit<Pairs>
}
