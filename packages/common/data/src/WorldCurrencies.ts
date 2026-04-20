/**
 * A comprehensive dataset of major world currencies with symbols, formatting info, and country associations.
 *
 * @see {@link https://jsonlint.com/datasets/currencies | World Currencies JSON Dataset}
 *
 * @category constants
 * @module \@beep/data/WorldCurrencies
 * @since 0.0.0
 */
/**
 * Array of major world currencies with symbols, formatting, and country associations.
 *
 * Each entry contains the ISO currency code, full name, symbol, decimal digit
 * count, and an array of countries using the currency.
 *
 * @example
 * ```typescript
 * import { WorldCurrencies } from "@beep/data"
 *
 * const eur = WorldCurrencies.find(c => c.code === "EUR")
 * console.log(eur?.symbol) // "\u20AC"
 * console.log(eur?.decimal_digits) // 2
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const WorldCurrencies = [
  {
    code: "USD",
    name: "US Dollar",
    symbol: "$",
    decimal_digits: 2,
    countries: ["United States", "Ecuador", "El Salvador"],
  },
  {
    code: "EUR",
    name: "Euro",
    symbol: "€",
    decimal_digits: 2,
    countries: ["Germany", "France", "Italy", "Spain", "Netherlands"],
  },
  {
    code: "GBP",
    name: "British Pound",
    symbol: "£",
    decimal_digits: 2,
    countries: ["United Kingdom"],
  },
  {
    code: "JPY",
    name: "Japanese Yen",
    symbol: "¥",
    decimal_digits: 0,
    countries: ["Japan"],
  },
  {
    code: "CHF",
    name: "Swiss Franc",
    symbol: "CHF",
    decimal_digits: 2,
    countries: ["Switzerland", "Liechtenstein"],
  },
  {
    code: "AUD",
    name: "Australian Dollar",
    symbol: "A$",
    decimal_digits: 2,
    countries: ["Australia"],
  },
  {
    code: "CAD",
    name: "Canadian Dollar",
    symbol: "C$",
    decimal_digits: 2,
    countries: ["Canada"],
  },
  {
    code: "CNY",
    name: "Chinese Yuan",
    symbol: "¥",
    decimal_digits: 2,
    countries: ["China"],
  },
  {
    code: "INR",
    name: "Indian Rupee",
    symbol: "₹",
    decimal_digits: 2,
    countries: ["India"],
  },
  {
    code: "MXN",
    name: "Mexican Peso",
    symbol: "$",
    decimal_digits: 2,
    countries: ["Mexico"],
  },
  {
    code: "BRL",
    name: "Brazilian Real",
    symbol: "R$",
    decimal_digits: 2,
    countries: ["Brazil"],
  },
  {
    code: "KRW",
    name: "South Korean Won",
    symbol: "₩",
    decimal_digits: 0,
    countries: ["South Korea"],
  },
  {
    code: "SGD",
    name: "Singapore Dollar",
    symbol: "S$",
    decimal_digits: 2,
    countries: ["Singapore"],
  },
  {
    code: "HKD",
    name: "Hong Kong Dollar",
    symbol: "HK$",
    decimal_digits: 2,
    countries: ["Hong Kong"],
  },
  {
    code: "NOK",
    name: "Norwegian Krone",
    symbol: "kr",
    decimal_digits: 2,
    countries: ["Norway"],
  },
  {
    code: "SEK",
    name: "Swedish Krona",
    symbol: "kr",
    decimal_digits: 2,
    countries: ["Sweden"],
  },
  {
    code: "DKK",
    name: "Danish Krone",
    symbol: "kr",
    decimal_digits: 2,
    countries: ["Denmark"],
  },
  {
    code: "NZD",
    name: "New Zealand Dollar",
    symbol: "NZ$",
    decimal_digits: 2,
    countries: ["New Zealand"],
  },
  {
    code: "ZAR",
    name: "South African Rand",
    symbol: "R",
    decimal_digits: 2,
    countries: ["South Africa"],
  },
  {
    code: "RUB",
    name: "Russian Ruble",
    symbol: "₽",
    decimal_digits: 2,
    countries: ["Russia"],
  },
  {
    code: "TRY",
    name: "Turkish Lira",
    symbol: "₺",
    decimal_digits: 2,
    countries: ["Turkey"],
  },
  {
    code: "PLN",
    name: "Polish Zloty",
    symbol: "zł",
    decimal_digits: 2,
    countries: ["Poland"],
  },
  {
    code: "THB",
    name: "Thai Baht",
    symbol: "฿",
    decimal_digits: 2,
    countries: ["Thailand"],
  },
  {
    code: "IDR",
    name: "Indonesian Rupiah",
    symbol: "Rp",
    decimal_digits: 0,
    countries: ["Indonesia"],
  },
  {
    code: "MYR",
    name: "Malaysian Ringgit",
    symbol: "RM",
    decimal_digits: 2,
    countries: ["Malaysia"],
  },
  {
    code: "PHP",
    name: "Philippine Peso",
    symbol: "₱",
    decimal_digits: 2,
    countries: ["Philippines"],
  },
  {
    code: "CZK",
    name: "Czech Koruna",
    symbol: "Kč",
    decimal_digits: 2,
    countries: ["Czech Republic"],
  },
  {
    code: "ILS",
    name: "Israeli Shekel",
    symbol: "₪",
    decimal_digits: 2,
    countries: ["Israel"],
  },
  {
    code: "AED",
    name: "UAE Dirham",
    symbol: "د.إ",
    decimal_digits: 2,
    countries: ["United Arab Emirates"],
  },
  {
    code: "SAR",
    name: "Saudi Riyal",
    symbol: "﷼",
    decimal_digits: 2,
    countries: ["Saudi Arabia"],
  },
] as const;
