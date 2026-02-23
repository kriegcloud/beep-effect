import * as S from "effect/Schema"

type IsGuards<L extends ReadonlyArray<string>> = {
  readonly [K in L[number]]: (i: unknown) => i is K
}

type EnumType<L extends ReadonlyArray<string>> = {
  readonly [K in L[number]]: K
}

export type StringLiteralKit<L extends ReadonlyArray<string>> =
  S.Literals<L> & {
    readonly Options: L
    readonly is: IsGuards<L>
    readonly Enum: EnumType<L>
    readonly pickOptions: <const Keys extends ReadonlyArray<L[number]>>(
      ...keys: Keys
    ) => Keys
    readonly omitOptions: <const Keys extends ReadonlyArray<L[number]>>(
      ...keys: Keys
    ) => ReadonlyArray<Exclude<L[number], Keys[number]>>
  }

export function StringLiteralKit<const L extends ReadonlyArray<string>>(
  ...literals: L
): StringLiteralKit<L> {
  const schema = S.Literals(literals)

  const is = Object.fromEntries(
    literals.map((lit) => [lit, (i: unknown): i is typeof lit => i === lit]),
  ) as IsGuards<L>

  const Enum = Object.fromEntries(
    literals.map((lit) => [lit, lit]),
  ) as EnumType<L>

  const pickOptions = <const Keys extends ReadonlyArray<L[number]>>(
    ...keys: Keys
  ): Keys => keys

  const omitOptions = <const Keys extends ReadonlyArray<L[number]>>(
    ...keys: Keys
  ): ReadonlyArray<Exclude<L[number], Keys[number]>> => {
    const keySet: ReadonlySet<string> = new Set(keys)
    const isExcluded = (
      lit: L[number],
    ): lit is Exclude<L[number], Keys[number]> => !keySet.has(lit)
    return literals.filter(isExcluded)
  }

  return Object.assign(schema, {
    Options: literals,
    is,
    Enum,
    pickOptions,
    omitOptions,
  }) as StringLiteralKit<L>
}
