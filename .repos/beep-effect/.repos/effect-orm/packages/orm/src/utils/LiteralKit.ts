import * as A from "effect/Array"
import * as S from "effect/Schema"
import type * as AST from "effect/SchemaAST"

export type LiteralToKey<L extends AST.LiteralValue> = L extends boolean
  ? L extends true
    ? "true"
    : "false"
  : L extends bigint
    ? `${L}n`
    : L extends number
      ? `n${L}`
      : L & string

type LiteralEnum<L extends ReadonlyArray<AST.LiteralValue>> = {
  readonly [K in L[number] as LiteralToKey<K>]: K
}

type IsGuards<L extends ReadonlyArray<AST.LiteralValue>> = {
  readonly [K in L[number] as LiteralToKey<K>]: (i: unknown) => i is K
}

export function literalToKey(literal: AST.LiteralValue): string {
  if (typeof literal === "boolean") return literal ? "true" : "false"
  if (typeof literal === "bigint") return `${literal}n`
  if (typeof literal === "number") return `n${literal}`
  return literal as string
}

function buildEnum<L extends ReadonlyArray<AST.LiteralValue>>(
  literals: L,
): LiteralEnum<L> {
  return A.reduce(
    literals,
    {} as Record<string, AST.LiteralValue>,
    (acc, l) => {
      acc[literalToKey(l)] = l
      return acc
    },
  ) as LiteralEnum<L>
}

function buildIsGuards<L extends ReadonlyArray<AST.LiteralValue>>(
  literals: L,
): IsGuards<L> {
  return A.reduce(
    literals,
    {} as Record<string, (i: unknown) => boolean>,
    (acc, l) => {
      acc[literalToKey(l)] = (i: unknown): boolean => i === l
      return acc
    },
  ) as IsGuards<L>
}

export type LiteralKit<L extends ReadonlyArray<AST.LiteralValue>> =
  S.Literals<L> & {
    readonly Options: L
    readonly is: IsGuards<L>
    readonly Enum: LiteralEnum<L>
    readonly pickOptions: <const S extends ReadonlyArray<L[number]>>(
      ...keys: S
    ) => S
    readonly omitOptions: <const S extends ReadonlyArray<L[number]>>(
      ...keys: S
    ) => Array<Exclude<L[number], S[number]>>
    readonly derive: <const S extends ReadonlyArray<L[number]>>(
      ...keys: S
    ) => LiteralKit<S>
  }

export function LiteralKit<const L extends ReadonlyArray<AST.LiteralValue>>(
  ...literals: L
): LiteralKit<L> {
  const schema = S.Literals(literals)

  const Enum = buildEnum(literals)
  const is = buildIsGuards(literals)

  const pickOptions = <const Keys extends ReadonlyArray<L[number]>>(
    ...keys: Keys
  ): Keys => keys

  const omitOptions = <const Keys extends ReadonlyArray<L[number]>>(
    ...keys: Keys
  ): Array<Exclude<L[number], Keys[number]>> => {
    const keySet = new Set<AST.LiteralValue>(keys)
    return A.filter(
      literals,
      (l): l is Exclude<L[number], Keys[number]> => !keySet.has(l),
    )
  }

  const derive = <const Keys extends ReadonlyArray<L[number]>>(
    ...keys: Keys
  ): LiteralKit<Keys> => (LiteralKit as Function)(...keys) as LiteralKit<Keys>

  return Object.assign(schema, {
    Options: literals,
    is,
    Enum,
    pickOptions,
    omitOptions,
    derive,
  }) as LiteralKit<L>
}
