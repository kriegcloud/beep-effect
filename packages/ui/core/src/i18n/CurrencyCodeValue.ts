import { StringLiteralKit } from "@beep/schema/derived";
import { RecordUtils } from "@beep/utils/data";

/**
 * @standard ISO 4217
 *
 * @description 157 active currency codes
 *
 * @link https://en.wikipedia.org/wiki/ISO_4217
 */
export const Currency = {
  AED: "United Arab Emirates dirham",

  /** Afghan afghani */
  AFN: "Afghan afghani",

  /** Albanian lek */
  ALL: "Albanian lek",

  /** Armenian dram */
  AMD: "Armenian dram",

  /** Netherlands Antillean guilder */
  ANG: "Netherlands Antillean guilder",

  /** Angolan kwanza */
  AOA: "Angolan kwanza",

  /** Argentine peso */
  ARS: "Argentine peso",

  /** Australian dollar */
  AUD: "Australian dollar",

  /** Aruban florin */
  AWG: "Aruban florin",

  /** Azerbaijani manat */
  AZN: "Azerbaijani manat",

  /** Bosnia and Herzegovina convertible mark */
  BAM: "Bosnia and Herzegovina convertible mark",

  /** Barbados dollar */
  BBD: "Barbados dollar",

  /** Bangladeshi taka */
  BDT: "Bangladeshi taka",

  /** Bulgarian lev */
  BGN: "Bulgarian lev",

  /** Bahraini dinar */
  BHD: "Bahraini dinar",

  /** Burundian franc */
  BIF: "Burundian franc",

  /** Bermudian dollar */
  BMD: "Bermudian dollar",

  /** Brunei dollar */
  BND: "Brunei dollar",

  /** Boliviano */
  BOB: "Boliviano",

  /** Brazilian real */
  BRL: "Brazilian real",

  /** Bahamian dollar */
  BSD: "Bahamian dollar",

  /** Bhutanese ngultrum */
  BTN: "Bhutanese ngultrum",

  /** Botswana pula */
  BWP: "Botswana pula",

  /** Belarusian ruble */
  BYN: "Belarusian ruble",

  /** Belize dollar */
  BZD: "Belize dollar",

  /** Canadian dollar */
  CAD: "Canadian dollar",

  /** Congolese franc */
  CDF: "Congolese franc",

  /** Swiss franc */
  CHF: "Swiss franc",

  /** Chilean peso */
  CLP: "Chilean peso",

  /** Renminbi (Chinese) yuan */
  CNY: "Renminbi (Chinese) yuan",

  /** Colombian peso */
  COP: "Colombian peso",

  /** Costa Rican colon */
  CRC: "Costa Rican colon",

  /** Cuban convertible peso */
  CUC: "Cuban convertible peso",

  /** Cuban peso */
  CUP: "Cuban peso",

  /** Cape Verdean escudo */
  CVE: "Cape Verdean escudo",

  /** Czech koruna */
  CZK: "Czech koruna",

  /** Djiboutian franc */
  DJF: "Djiboutian franc",

  /** Danish krone */
  DKK: "Danish krone",

  /** Dominican peso */
  DOP: "Dominican peso",

  /** Algerian dinar */
  DZD: "Algerian dinar",

  /** Egyptian pound */
  EGP: "Egyptian pound",

  /** Eritrean nakfa */
  ERN: "Eritrean nakfa",

  /** Ethiopian birr */
  ETB: "Ethiopian birr",

  /** Euro */
  EUR: "Euro",

  /** Fijian dollar */
  FJD: "Fijian dollar",

  /** Falkland Islands pound */
  FKP: "Falkland Islands pound",

  /** Pound sterling */
  GBP: "Pound sterling",

  /** Georgian lari */
  GEL: "Georgian lari",

  /** Ghanaian cedi */
  GHS: "Ghanaian cedi",

  /** Gibraltar pound */
  GIP: "Gibraltar pound",

  /** Gambian dalasi */
  GMD: "Gambian dalasi",

  /** Guinean franc */
  GNF: "Guinean franc",

  /** Guatemalan quetzal */
  GTQ: "Guatemalan quetzal",

  /** Guyanese dollar */
  GYD: "Guyanese dollar",

  /** Hong Kong dollar */
  HKD: "Hong Kong dollar",

  /** Honduran lempira */
  HNL: "Honduran lempira",

  /** Croatian kuna */
  HRK: "Croatian kuna",

  /** Haitian gourde */
  HTG: "Haitian gourde",

  /** Hungarian forint */
  HUF: "Hungarian forint",

  /** Indonesian rupiah */
  IDR: "Indonesian rupiah",

  /** Israeli new shekel */
  ILS: "Israeli new shekel",

  /** Indian rupee */
  INR: "Indian rupee",

  /** Iraqi dinar */
  IQD: "Iraqi dinar",

  /** Iranian rial */
  IRR: "Iranian rial",

  /** Icelandic króna */
  ISK: "Icelandic króna",

  /** Jamaican dollar */
  JMD: "Jamaican dollar",

  /** Jordanian dinar */
  JOD: "Jordanian dinar",

  /** Japanese yen */
  JPY: "Japanese yen",

  /** Kenyan shilling */
  KES: "Kenyan shilling",

  /** Kyrgyzstani som */
  KGS: "Kyrgyzstani som",

  /** Cambodian riel */
  KHR: "Cambodian riel",

  /** Comoro franc */
  KMF: "Comoro franc",

  /** North Korean won */
  KPW: "North Korean won",

  /** South Korean won */
  KRW: "South Korean won",

  /** Kuwaiti dinar */
  KWD: "Kuwaiti dinar",

  /** Cayman Islands dollar */
  KYD: "Cayman Islands dollar",

  /** Kazakhstani tenge */
  KZT: "Kazakhstani tenge",

  /** Lao kip */
  LAK: "Lao kip",

  /** Lebanese pound */
  LBP: "Lebanese pound",

  /** Sri Lankan rupee */
  LKR: "Sri Lankan rupee",

  /** Liberian dollar */
  LRD: "Liberian dollar",

  /** Lesotho loti */
  LSL: "Lesotho loti",

  /** Libyan dinar */
  LYD: "Libyan dinar",

  /** Moroccan dirham */
  MAD: "Moroccan dirham",

  /** Moldovan leu */
  MDL: "Moldovan leu",

  /** Malagasy ariary */
  MGA: "Malagasy ariary",

  /** Macedonian denar */
  MKD: "Macedonian denar",

  /** Burmese kyat */
  MMK: "Burmese kyat",

  /** Mongolian tögrög */
  MNT: "Mongolian tögrög",

  /** Macanese pataca */
  MOP: "Macanese pataca",

  /** Mauritanian ouguiya */
  MRU: "Mauritanian ouguiya",

  /** Mauritian rupee */
  MUR: "Mauritian rupee",

  /** Maldivian rufiyaa */
  MVR: "Maldivian rufiyaa",

  /** Malawian kwacha */
  MWK: "Malawian kwacha",

  /** Mexican peso */
  MXN: "Mexican peso",

  /** Malaysian ringgit */
  MYR: "Malaysian ringgit",

  /** Mozambican metical */
  MZN: "Mozambican metical",

  /** Namibian dollar */
  NAD: "Namibian dollar",

  /** Nigerian naira */
  NGN: "Nigerian naira",

  /** Nicaraguan córdoba */
  NIO: "Nicaraguan córdoba",

  /** Norwegian krone */
  NOK: "Norwegian krone",

  /** Nepalese rupee */
  NPR: "Nepalese rupee",

  /** New Zealand dollar */
  NZD: "New Zealand dollar",

  /** Omani rial */
  OMR: "Omani rial",

  /** Panamanian balboa */
  PAB: "Panamanian balboa",

  /** Peruvian sol */
  PEN: "Peruvian sol",

  /** Papua New Guinean kina */
  PGK: "Papua New Guinean kina",

  /** Philippine peso */
  PHP: "Philippine peso",

  /** Pakistani rupee */
  PKR: "Pakistani rupee",

  /** Polish złoty */
  PLN: "Polish złoty",

  /** Paraguayan guaraní */
  PYG: "Paraguayan guaraní",

  /** Qatari riyal */
  QAR: "Qatari riyal",

  /** Romanian leu */
  RON: "Romanian leu",

  /** Serbian dinar */
  RSD: "Serbian dinar",

  /** Russian ruble */
  RUB: "Russian ruble",

  /** Rwandan franc */
  RWF: "Rwandan franc",

  /** Saudi riyal */
  SAR: "Saudi riyal",

  /** Solomon Islands dollar */
  SBD: "Solomon Islands dollar",

  /** Seychelles rupee */
  SCR: "Seychelles rupee",

  /** Sudanese pound */
  SDG: "Sudanese pound",

  /** Swedish krona/kronor */
  SEK: "Swedish krona/kronor",

  /** Singapore dollar */
  SGD: "Singapore dollar",

  /** Saint Helena pound */
  SHP: "Saint Helena pound",

  /** Sierra Leonean leone */
  SLL: "Sierra Leonean leone",

  /** Somali shilling */
  SOS: "Somali shilling",

  /** Surinamese dollar */
  SRD: "Surinamese dollar",

  /** South Sudanese pound */
  SSP: "South Sudanese pound",

  /** São Tomé and Príncipe dobra */
  STN: "São Tomé and Príncipe dobra",

  /** Salvadoran colón */
  SVC: "Salvadoran colón",

  /** Syrian pound */
  SYP: "Syrian pound",

  /** Swazi lilangeni */
  SZL: "Swazi lilangeni",

  /** Thai baht */
  THB: "Thai baht",

  /** Tajikistani somoni */
  TJS: "Tajikistani somoni",

  /** Turkmenistan manat */
  TMT: "Turkmenistan manat",

  /** Tunisian dinar */
  TND: "Tunisian dinar",

  /** Tongan paʻanga */
  TOP: "Tongan paʻanga",

  /** Turkish lira */
  TRY: "Turkish lira",

  /** Trinidad and Tobago dollar */
  TTD: "Trinidad and Tobago dollar",

  /** New Taiwan dollar */
  TWD: "New Taiwan dollar",

  /** Tanzanian shilling */
  TZS: "Tanzanian shilling",

  /** Ukrainian hryvnia */
  UAH: "Ukrainian hryvnia",

  /** Ugandan shilling */
  UGX: "Ugandan shilling",

  /** United States dollar */
  USD: "United States dollar",

  /** Uruguayan peso */
  UYU: "Uruguayan peso",

  /** Uzbekistani soʻm */
  UZS: "Uzbekistani soʻm",

  /** Venezuelan bolívar soberano */
  VES: "Venezuelan bolívar soberano",

  /** Vietnamese đồng */
  VND: "Vietnamese đồng",

  /** Vanuatu vatu */
  VUV: "Vanuatu vatu",

  /** Samoan tālā */
  WST: "Samoan tālā",

  /** Central African CFA franc */
  XAF: "Central African CFA franc",

  /** East Caribbean dollar */
  XCD: "East Caribbean dollar",

  /** West African CFA franc */
  XOF: "West African CFA franc",

  /** CFP franc */
  XPF: "CFP franc",

  /** Yemeni rial */
  YER: "Yemeni rial",

  /** South African rand */
  ZAR: "South African rand",

  /** Zambian kwacha */
  ZMW: "Zambian kwacha",

  /** Zimbabwean dollar */
  ZWL: "Zimbabwean dollar",
} as const;
export type Currency = (typeof Currency)[keyof typeof Currency];

export class CurrencyCodeValue extends StringLiteralKit(...RecordUtils.recordKeys(Currency)) {}

export declare namespace CurrencyCodeValue {
  export type Type = typeof CurrencyCodeValue.Type;
  export type Encoded = typeof CurrencyCodeValue.Encoded;
}
