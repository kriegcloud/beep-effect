/**
 * Common measurement units for conversions.
 *
 * @see {@link https://jsonlint.com/datasets/units-of-measurement | Units of Measurement JSON Dataset}
 *
 * @category constants
 * @module \@beep/data/UnitsOfMeasurement
 * @since 0.0.0
 */
/**
 * Array of common measurement units with SI and Imperial system metadata.
 *
 * Each entry contains the unit name, symbol, measurement type, system,
 * whether it is a base unit, and a conversion factor to the base unit.
 *
 * @example
 * ```typescript
 * import { UnitsOfMeasurement } from "@beep/data"
 *
 * const meter = UnitsOfMeasurement.find(u => u.symbol === "m")
 * console.log(meter?.name) // "Meter"
 * console.log(meter?.base_unit) // true
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const UnitsOfMeasurement = [
  {
    name: "Meter",
    symbol: "m",
    type: "Length",
    system: "SI",
    base_unit: true,
    conversion: 1,
  },
  {
    name: "Kilometer",
    symbol: "km",
    type: "Length",
    system: "SI",
    base_unit: false,
    conversion: 1000,
  },
  {
    name: "Centimeter",
    symbol: "cm",
    type: "Length",
    system: "SI",
    base_unit: false,
    conversion: 0.01,
  },
  {
    name: "Millimeter",
    symbol: "mm",
    type: "Length",
    system: "SI",
    base_unit: false,
    conversion: 0.001,
  },
  {
    name: "Mile",
    symbol: "mi",
    type: "Length",
    system: "Imperial",
    base_unit: false,
    conversion: 1609.344,
  },
  {
    name: "Yard",
    symbol: "yd",
    type: "Length",
    system: "Imperial",
    base_unit: false,
    conversion: 0.9144,
  },
  {
    name: "Foot",
    symbol: "ft",
    type: "Length",
    system: "Imperial",
    base_unit: false,
    conversion: 0.3048,
  },
  {
    name: "Inch",
    symbol: "in",
    type: "Length",
    system: "Imperial",
    base_unit: false,
    conversion: 0.0254,
  },
  {
    name: "Kilogram",
    symbol: "kg",
    type: "Mass",
    system: "SI",
    base_unit: true,
    conversion: 1,
  },
  {
    name: "Gram",
    symbol: "g",
    type: "Mass",
    system: "SI",
    base_unit: false,
    conversion: 0.001,
  },
  {
    name: "Milligram",
    symbol: "mg",
    type: "Mass",
    system: "SI",
    base_unit: false,
    conversion: 0.000001,
  },
  {
    name: "Pound",
    symbol: "lb",
    type: "Mass",
    system: "Imperial",
    base_unit: false,
    conversion: 0.453592,
  },
  {
    name: "Ounce",
    symbol: "oz",
    type: "Mass",
    system: "Imperial",
    base_unit: false,
    conversion: 0.0283495,
  },
  {
    name: "Liter",
    symbol: "L",
    type: "Volume",
    system: "SI",
    base_unit: true,
    conversion: 1,
  },
  {
    name: "Milliliter",
    symbol: "mL",
    type: "Volume",
    system: "SI",
    base_unit: false,
    conversion: 0.001,
  },
  {
    name: "Gallon",
    symbol: "gal",
    type: "Volume",
    system: "Imperial",
    base_unit: false,
    conversion: 3.78541,
  },
  {
    name: "Quart",
    symbol: "qt",
    type: "Volume",
    system: "Imperial",
    base_unit: false,
    conversion: 0.946353,
  },
  {
    name: "Pint",
    symbol: "pt",
    type: "Volume",
    system: "Imperial",
    base_unit: false,
    conversion: 0.473176,
  },
  {
    name: "Cup",
    symbol: "cup",
    type: "Volume",
    system: "Imperial",
    base_unit: false,
    conversion: 0.236588,
  },
  {
    name: "Celsius",
    symbol: "°C",
    type: "Temperature",
    system: "SI",
    base_unit: true,
    conversion: null,
  },
  {
    name: "Fahrenheit",
    symbol: "°F",
    type: "Temperature",
    system: "Imperial",
    base_unit: false,
    conversion: null,
  },
  {
    name: "Kelvin",
    symbol: "K",
    type: "Temperature",
    system: "SI",
    base_unit: false,
    conversion: null,
  },
  {
    name: "Second",
    symbol: "s",
    type: "Time",
    system: "SI",
    base_unit: true,
    conversion: 1,
  },
  {
    name: "Minute",
    symbol: "min",
    type: "Time",
    system: "SI",
    base_unit: false,
    conversion: 60,
  },
  {
    name: "Hour",
    symbol: "h",
    type: "Time",
    system: "SI",
    base_unit: false,
    conversion: 3600,
  },
];
