export type LowerChar =
  | "a"
  | "b"
  | "c"
  | "d"
  | "e"
  | "f"
  | "g"
  | "h"
  | "i"
  | "j"
  | "k"
  | "l"
  | "m"
  | "n"
  | "o"
  | "p"
  | "q"
  | "r"
  | "s"
  | "t"
  | "u"
  | "v"
  | "w"
  | "x"
  | "y"
  | "z";
export type UpperChar =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L"
  | "M"
  | "N"
  | "O"
  | "P"
  | "Q"
  | "R"
  | "S"
  | "T"
  | "U"
  | "V"
  | "W"
  | "X"
  | "Y"
  | "Z";

export declare namespace CaseTransform {
  export type SnakeToPascal<S extends string> = S extends `${infer Head}_${infer Tail}`
    ? `${Capitalize<Head>}${SnakeToPascal<Capitalize<Tail>>}`
    : Capitalize<S>;

  export type PascalToSnake<S extends string> = S extends `${infer Head}${infer Tail}`
    ? Head extends Lowercase<Head>
      ? `${Head}${PascalToSnake<Tail>}`
      : `_${Lowercase<Head>}${PascalToSnake<Tail>}`
    : S;

  type CleanLeadingUnderscore<S extends string> = S extends `_${infer Rest}` ? Rest : S;
  export type PascalToSnakeClean<S extends string> = CleanLeadingUnderscore<PascalToSnake<S>>;

  type Pluralize<S extends string> =
    // Irregular plurals
    S extends "child"
      ? "children"
      : S extends "person"
        ? "people"
        : S extends "campus"
          ? "campuses"
          : S extends "address"
            ? "addresses"
            : // Words ending in 'y' preceded by consonant
              S extends `${infer Base}${infer Consonant}y`
              ? Consonant extends "a" | "e" | "i" | "o" | "u"
                ? `${S}s`
                : `${Base}${Consonant}ies`
              : // Words ending in s, x, z, ch, sh
                S extends `${string}s` | `${string}x` | `${string}z` | `${string}ch` | `${string}sh`
                ? `${S}es`
                : // Words ending in 'f' or 'fe'
                  S extends `${infer Base}f`
                  ? `${Base}ves`
                  : S extends `${infer Base}fe`
                    ? `${Base}ves`
                    : // Default: add 's'
                      `${S}s`;

  type Singularize<S extends string> =
    // Irregular singulars
    S extends "children"
      ? "child"
      : S extends "people"
        ? "person"
        : S extends "campuses"
          ? "campus"
          : S extends "addresses"
            ? "address"
            : // Regular patterns
              S extends `${infer Base}ies`
              ? `${Base}y`
              : S extends `${infer Base}ves`
                ? `${Base}f`
                : S extends `${infer Base}es`
                  ? Base extends `${string}s` | `${string}x` | `${string}z` | `${string}ch` | `${string}sh`
                    ? `${Base}`
                    : `${Base}e`
                  : S extends `${infer Base}s`
                    ? Base
                    : S;

  export type SnakeToPascalPlural<S extends string> = Pluralize<SnakeToPascal<S>>;
  export type SnakeToPascalSingular<S extends string> = Singularize<SnakeToPascal<S>>;
  export type PascalToSnakePlural<S extends string> = Pluralize<PascalToSnakeClean<S>>;
  export type PascalToSnakeSingular<S extends string> = Singularize<PascalToSnakeClean<S>>;
  export type SnakePluralToPascalSingular<S extends string> = SnakeToPascal<Singularize<S>>;
  export type PascalSingularToSnakePlural<S extends string> = Pluralize<PascalToSnakeClean<S>>;
}
