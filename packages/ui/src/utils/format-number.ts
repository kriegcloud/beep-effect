export type InputNumberValue = string | number | null | undefined;

function processInput(inputValue: InputNumberValue): number | null {
  if (inputValue == null || Number.isNaN(inputValue)) return null;
  return Number(inputValue);
}
export function fData(inputValue: InputNumberValue) {
  const number = processInput(inputValue);
  if (number === null || number === 0) return "0 bytes";

  const units = ["bytes", "Kb", "Mb", "Gb", "Tb", "Pb", "Eb", "Zb", "Yb"];
  const decimal = 2;
  const baseValue = 1024;

  const index = Math.floor(Math.log(number) / Math.log(baseValue));
  return `${Number.parseFloat((number / baseValue ** index).toFixed(decimal))} ${units[index]}`;
}

const DEFAULT_LOCALE = { code: "en-US", currency: "USD" };

export function fNumber(inputValue: InputNumberValue) {
  const locale = DEFAULT_LOCALE;

  const number = processInput(inputValue);
  if (number === null) return "";

  return new Intl.NumberFormat(locale.code, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(number);
}

export function fCurrency(inputValue: InputNumberValue) {
  const locale = DEFAULT_LOCALE;

  const number = processInput(inputValue);
  if (number === null) return "";

  return new Intl.NumberFormat(locale.code, {
    style: "currency",
    currency: locale.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(number);
}

export function fPercent(inputValue: InputNumberValue) {
  const locale = DEFAULT_LOCALE;

  const number = processInput(inputValue);
  if (number === null) return "";

  return new Intl.NumberFormat(locale.code, {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(number / 100);
}

export function fShortenNumber(inputValue: InputNumberValue) {
  const locale = DEFAULT_LOCALE;

  const number = processInput(inputValue);
  if (number === null) return "";

  const fm = new Intl.NumberFormat(locale.code, {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(number);

  return fm.replace(/[A-Z]/g, (match) => match.toLowerCase());
}
