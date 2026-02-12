import { $SchemaId } from "@beep/identity/packages";
import { invariant } from "@beep/invariant";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { StringLiteralKit } from "../derived";

const $I = $SchemaId.create("primitives/Temperature");

/** @internal */
type Split<S extends string, Delimiter extends string> = string extends S | ""
  ? Array<string>
  : S extends `${infer Head}${Delimiter}${infer Rest}`
    ? [Head, ...Split<Rest, Delimiter>]
    : [S];

/** @internal */
const splitLiteral = <S extends string, Delimiter extends string>(str: S, delimiter: Delimiter): Split<S, Delimiter> =>
  Str.split(delimiter)(str) as Split<S, Delimiter>;

export class TemperatureUnit extends StringLiteralKit("c", "f", "k").annotations(
  $I.annotations("TemperatureUnit", {
    description: "Unit of temperature measurement: Celsius (c), Fahrenheit (f), or Kelvin (k)",
  })
) {}

export declare namespace TemperatureUnit {
  export type Type = typeof TemperatureUnit.Type;
  export type Encoded = typeof TemperatureUnit.Encoded;
}

/**
 * @since 1.0.0
 * @category Temperature Schemas
 */
export class Kelvin extends S.Number.pipe(S.greaterThanOrEqualTo(0), S.brand("Kelvin")).annotations(
  $I.annotations("Kelvin", {
    description: "Temperature in Kelvin (absolute scale), must be >= 0.",
  })
) {}

export declare namespace Kelvin {
  export type Type = typeof Kelvin.Type;
  export type Encoded = typeof Kelvin.Encoded;
}

/**
 * @since 1.0.0
 * @category Temperature Schemas
 */
export class Celsius extends S.Number.pipe(S.greaterThanOrEqualTo(-273.15), S.brand("Celsius")).annotations(
  $I.annotations("Celsius", {
    description: "Temperature in Celsius, must be >= -273.15 (absolute zero).",
  })
) {}

export declare namespace Celsius {
  export type Type = typeof Celsius.Type;
  export type Encoded = typeof Celsius.Encoded;
}

/**
 * @since 1.0.0
 * @category Temperature Schemas
 */
export class Fahrenheit extends S.Number.pipe(S.greaterThanOrEqualTo(-459.67), S.brand("Fahrenheit")).annotations(
  $I.annotations("Fahrenheit", {
    description: "Temperature in Fahrenheit, must be >= -459.67 (absolute zero).",
  })
) {}

export declare namespace Fahrenheit {
  export type Type = typeof Fahrenheit.Type;
  export type Encoded = typeof Fahrenheit.Encoded;
}

/**
 * @since 1.0.0
 * @category Temperature Schemas
 */
export class Temperature extends S.Union(Kelvin, Celsius, Fahrenheit).annotations(
  $I.annotations("Temperature", {
    description: "A temperature value in Kelvin, Celsius, or Fahrenheit with conversion utilities.",
  })
) {
  /**
   * @since 1.0.0
   * @category Temperature Conversions
   */
  public static readonly kelvinToCelsius = (k: S.Schema.Type<Kelvin>): S.Schema.Type<Celsius> =>
    Celsius.make(k - 273.15);

  /**
   * @since 1.0.0
   * @category Temperature Conversions
   */
  public static readonly celsiusToKelvin = (c: S.Schema.Type<Celsius>): S.Schema.Type<Kelvin> =>
    Kelvin.make(c + 273.15);

  /**
   * @since 1.0.0
   * @category Temperature Conversions
   */
  public static readonly kelvinToFahrenheit = (k: S.Schema.Type<Kelvin>): S.Schema.Type<Fahrenheit> =>
    Fahrenheit.make(((k - 273.15) * 9) / 5 + 32);

  /**
   * @since 1.0.0
   * @category Temperature Conversions
   */
  public static readonly fahrenheitToKelvin = (f: S.Schema.Type<Fahrenheit>): S.Schema.Type<Kelvin> =>
    Kelvin.make(((f - 32) * 5) / 9 + 273.15);

  /**
   * @since 1.0.0
   * @category Temperature Conversions
   */
  public static readonly CelsiusToFahrenheit: (c: S.Schema.Type<Celsius>) => S.Schema.Type<Fahrenheit> = F.compose(
    Temperature.celsiusToKelvin,
    Temperature.kelvinToFahrenheit
  );

  /**
   * @since 1.0.0
   * @category Temperature Conversions
   */
  public static readonly FahrenheitToCelsius: (k: S.Schema.Type<Fahrenheit>) => S.Schema.Type<Celsius> = F.compose(
    Temperature.fahrenheitToKelvin,
    Temperature.kelvinToCelsius
  );
}

export declare namespace Temperature {
  export type Type = typeof Temperature.Type;
  export type Encoded = typeof Temperature.Encoded;
}

/**
 * @since 1.0.0
 * @category Temperature Schemas
 */
export class KelvinFromString extends S.transform(S.TemplateLiteral(S.Number, "k"), Kelvin, {
  encode: (value: number) => `${value}k` as const,
  decode: (valueStr: `${number}k`) => {
    const [value] = splitLiteral(valueStr, "k");
    return Number(value);
  },
}).annotations(
  $I.annotations("KelvinFromString", {
    description: "Transforms a template literal string like '273.15k' into a branded Kelvin value.",
  })
) {}

export declare namespace KelvinFromString {
  export type Type = typeof KelvinFromString.Type;
  export type Encoded = typeof KelvinFromString.Encoded;
}

/**
 * @since 1.0.0
 * @category Temperature Schemas
 */
export class CelsiusFromString extends S.transform(S.TemplateLiteral(S.Number, S.Literal("c")), Celsius, {
  encode: (value: number) => `${value}c` as const,
  decode: (valueStr: `${number}c`) => {
    const [value] = splitLiteral(valueStr, "c");
    return Number(value);
  },
}).annotations(
  $I.annotations("CelsiusFromString", {
    description: "Transforms a template literal string like '25c' into a branded Celsius value.",
  })
) {}

export declare namespace CelsiusFromString {
  export type Type = typeof CelsiusFromString.Type;
  export type Encoded = typeof CelsiusFromString.Encoded;
}

/**
 * @since 1.0.0
 * @category Temperature Schemas
 */
export class FahrenheitFromString extends S.transform(S.TemplateLiteral(S.Number, S.Literal("f")), Fahrenheit, {
  encode: (value: number) => `${value}f` as const,
  decode: (valueStr: `${number}f`) => {
    const [value] = splitLiteral(valueStr, "f");
    return Number(value);
  },
}).annotations(
  $I.annotations("FahrenheitFromString", {
    description: "Transforms a template literal string like '98.6f' into a branded Fahrenheit value.",
  })
) {}

export declare namespace FahrenheitFromString {
  export type Type = typeof FahrenheitFromString.Type;
  export type Encoded = typeof FahrenheitFromString.Encoded;
}

/**
 * @since 1.0.0
 * @category Temperature Schemas
 */
export class TemperatureFromString extends S.transformOrFail(
  S.Union(KelvinFromString.from, CelsiusFromString.from, FahrenheitFromString.from),
  Kelvin,
  {
    encode: (value) => ParseResult.succeed(`${value}k` as const),
    decode: (valueStr: `${number}c` | `${number}f` | `${number}k`) => {
      const unit = Str.slice(-1)(valueStr);
      invariant(S.is(TemperatureUnit)(unit), "Invalid temperature unit", {
        file: "@beep/schema/primitives/Temperature.ts",
        line: 176,
        args: [unit],
      });

      const [value] = splitLiteral(valueStr, unit);
      const num = Number(value);
      return Match.value(unit).pipe(
        Match.when("k", () => ParseResult.succeed(num)),
        Match.when("c", () => ParseResult.succeed(Temperature.celsiusToKelvin(Celsius.make(num)))),
        Match.when("f", () => ParseResult.succeed(Temperature.fahrenheitToKelvin(Fahrenheit.make(num)))),
        Match.exhaustive
      );
    },
  }
).annotations(
  $I.annotations("TemperatureFromString", {
    description: "Parses a unit-suffixed temperature string (e.g. '25c', '77f', '300k') and normalizes to Kelvin.",
  })
) {}

export declare namespace TemperatureFromString {
  export type Type = typeof TemperatureFromString.Type;
  export type Encoded = typeof TemperatureFromString.Encoded;
}
