// SOURCE: https://github.com/Gottox/node-urlify/blob/master/lib/urlify.js

type UrlifyOptions = {
  addEToUmlauts?: boolean;
  extendString?: boolean;
  failureOutput?: string;
  maxLength?: number;
  nonPrintable?: string;
  spaces?: string;
  szToSs?: boolean;
  toLower?: boolean;
  trim?: boolean;
};

const regExpPattern = /[()*+./?[\\\]{|}]/g;

const trim = (text: string, seq: string): string => {
  const pattern = seq.replaceAll(regExpPattern, String.raw`\$&`);

  return text
    .replace(new RegExp(`^${pattern}`), "")
    .replace(new RegExp(`${pattern}$`), "")
    .replaceAll(new RegExp(`(${pattern}){2,}`, "g"), seq);
};

const whitespace = /\s/g;
const nonAlphaNum = /[^\da-z-]/gi;

const generateRegexFromMap = (map: Record<string, string>) => new RegExp(Object.keys(map).join("|"), "g");

const apply = (str: string, map: Record<string, string>): string => {
  const regex = generateRegexFromMap(map);

  return str.replace(regex, (match) => map[match] ?? match);
};

export const urlify = (string = "", id = "", _options: UrlifyOptions = {}): string => {
  if (string == "") return id;

  const defaults = {
    addEToUmlauts: false,
    extendString: false,
    failureOutput: "",
    maxLength: 100,
    nonPrintable: "-",
    spaces: "-",
    szToSs: true,
    toLower: false,
    trim: true,
  };

  const options = {
    ...defaults,
    ..._options,
  };

  if (options.szToSs === true) string = apply(string, szToSs);
  if (options.addEToUmlauts === true) string = apply(string, umlautsWithE);

  string = apply(string, accents);
  string = apply(string, cyrillic);
  string = apply(string, greek);

  string = string.replaceAll(nonAlphaNum, (occ) => {
    return occ.search(whitespace) === -1 ? options.nonPrintable : options.spaces;
  });

  if (options.trim !== false) {
    string = trim(string, options.nonPrintable);
    string = trim(string, options.spaces);
  }
  if (options.maxLength !== null && string.length > options.maxLength) {
    string = string.slice(0, options.maxLength);
  }

  // We run the result through encodeURIComponent to handle any non-latin characters
  string = encodeURIComponent(string);

  if (string == "") return id;
  if (options.toLower) string = string.toLowerCase();
  if (id.length > 0) string = string + options.spaces + id;

  return string;
};

const greek = {
  Α: "A",
  α: "a",
  Β: "B",
  β: "b",
  Γ: "G",
  γ: "g",
  Δ: "D",
  δ: "d",
  Ε: "E",
  ε: "e",
  Ζ: "Z",
  ζ: "z",
  Η: "H",
  η: "h",
  Θ: "TH",
  θ: "th",
  Ι: "I",
  ι: "i",
  Κ: "K",
  κ: "k",
  Λ: "L",
  λ: "l",
  Μ: "M",
  μ: "m",
  Ν: "N",
  ν: "n",
  Ξ: "X",
  ξ: "x",
  Ο: "O",
  ο: "o",
  Π: "P",
  π: "p",
  Ρ: "R",
  ρ: "r",
  Σ: "S",
  σ: "s",
  Τ: "T",
  τ: "t",
  Υ: "U",
  υ: "u",
  Φ: "F",
  φ: "f",
  Χ: "CH",
  χ: "ch",
  Ψ: "PS",
  ψ: "ps",
  Ω: "O",
  ω: "o",
};

const umlautsWithE = {
  Ä: "Ae",
  ä: "ae",
  Ö: "Oe",
  ö: "oe",
  Ü: "Ue",
  ü: "ue",
};

const szToSs = {
  ß: "ss",
};

const accents = {
  "&": "and",
  Á: "A",
  á: "a",
  À: "A",
  à: "a",
  Â: "A",
  â: "a",
  Å: "AA",
  å: "aa",
  Ä: "A",
  ä: "a",
  Ã: "A",
  ã: "a",
  ą: "a",
  Æ: "AE",
  æ: "ae",
  Č: "C",
  č: "c",
  Ç: "C",
  ç: "c",
  Ď: "D",
  ď: "d",
  Ð: "D",
  ð: "d",
  É: "E",
  é: "e",
  È: "E",
  è: "e",
  Ê: "E",
  ê: "e",
  Ě: "E",
  ě: "e",
  Ë: "E",
  ë: "e",
  Ğ: "g",
  ğ: "g",
  Í: "I",
  í: "i",
  Ì: "I",
  ì: "i",
  Î: "I",
  î: "i",
  Ï: "I",
  ï: "i",
  İ: "I",
  ı: "i",
  Ł: "L",
  ł: "l",
  ń: "n",
  Ň: "N",
  ň: "n",
  Ñ: "N",
  ñ: "n",
  Ó: "O",
  ó: "o",
  Ò: "O",
  ò: "o",
  Ô: "O",
  ô: "o",
  Ö: "O",
  ö: "o",
  Õ: "O",
  õ: "o",
  Ø: "OE",
  ø: "oe",
  ō: "o",
  Œ: "OE",
  œ: "oe",
  Ř: "R",
  ř: "r",
  Ś: "S",
  ś: "s",
  Š: "S",
  š: "s",
  Ş: "S",
  ş: "s",
  ß: "sz",
  Ť: "T",
  ť: "t",
  Ú: "U",
  ú: "u",
  Ù: "U",
  ù: "u",
  Û: "U",
  û: "u",
  Ü: "U",
  ü: "u",
  ū: "u",
  Ý: "Y",
  ý: "y",
  ÿ: "y",
  Ž: "Z",
  ž: "z",
  ż: "z",
  Þ: "Th",
  þ: "th",
};

const cyrillic = {
  А: "A",
  а: "a",
  Б: "B",
  б: "b",
  В: "V",
  в: "v",
  Г: "G",
  г: "g",
  Д: "D",
  д: "d",
  Е: "E",
  е: "e",
  Ё: "Yo",
  ё: "yo",
  Ж: "Zh",
  ж: "zh",
  З: "Z",
  з: "z",
  И: "I",
  и: "i",
  Й: "J",
  й: "j",
  К: "K",
  к: "k",
  Л: "L",
  л: "l",
  М: "M",
  м: "m",
  Н: "N",
  н: "n",
  О: "O",
  о: "o",
  П: "P",
  п: "p",
  Р: "R",
  р: "r",
  С: "S",
  с: "s",
  Т: "T",
  т: "t",
  У: "U",
  у: "u",
  Ф: "F",
  ф: "f",
  Х: "H",
  х: "h",
  Ц: "C",
  ц: "c",
  Ч: "Ch",
  ч: "ch",
  Ш: "Sh",
  ш: "sh",
  Щ: "Sh",
  щ: "sh",
  Ъ: "",
  ъ: "",
  Ы: "Y",
  ы: "y",
  Ь: "",
  ь: "",
  Э: "E",
  э: "e",
  Ю: "Yu",
  ю: "yu",
  Я: "Ya",
  я: "ya",
};
