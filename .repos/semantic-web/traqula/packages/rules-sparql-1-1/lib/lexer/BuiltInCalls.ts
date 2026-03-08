/* eslint-disable require-unicode-regexp */

import { LexerBuilder, createToken } from '@traqula/core';

export enum BuiltInCalls {
  Str = 'builtInStr',
  Lang = 'builtInLang',
  Langmatches = 'builtInLangmatches',
  Datatype = 'builtInDatatype',
  Bound = 'builtInBound',
  Iri = 'builtInIri',
  Uri = 'builtInUri',
  Bnode = 'builtInBnode',
  Rand = 'builtInRand',
  Abs = 'builtInAbs',
  Ceil = 'builtInCeil',
  Floor = 'builtInFloor',
  Round = 'builtInRound',
  Concat = 'builtInConcat',
  Strlen = 'builtInStrlen',
  Ucase = 'builtInUcase',
  Lcase = 'builtInLcase',
  Encode_for_uri = 'builtInEncode_for_uri',
  Contains = 'builtInContains',
  Strstarts = 'builtInStrstarts',
  Strends = 'builtInStrends',
  Strbefore = 'builtInStrbefore',
  Strafter = 'builtInStrafter',
  Year = 'builtInYear',
  Month = 'builtInMonth',
  Day = 'builtInDay',
  Hours = 'builtInHours',
  Minutes = 'builtInMinutes',
  Seconds = 'builtInSeconds',
  Timezone = 'builtInTimezone',
  Tz = 'builtInTz',
  Now = 'builtInNow',
  Uuid = 'builtInUuid',
  Struuid = 'builtInStruuid',
  Md5 = 'builtInMd5',
  Sha1 = 'builtInSha1',
  Sha256 = 'builtInSha256',
  Sha384 = 'builtInSha384',
  Sha512 = 'builtInSha512',
  Coalesce = 'builtInCoalesce',
  If = 'builtInIf',
  Strlang = 'builtInStrlang',
  Strdt = 'builtInStrdt',
  Sameterm = 'builtInSameterm',
  Isiri = 'builtInIsiri',
  Isuri = 'builtInIsuri',
  Isblank = 'builtInIsblank',
  Isliteral = 'builtInIsliteral',
  Isnumeric = 'builtInIsnumeric',
  Regex = 'builtInRegex',
  Substr = 'builtInSubstr',
  Replace = 'builtInReplace',
  Exists = 'builtInExists',
  Notexists = 'builtInNotexists',
  Count = 'builtInCount',
  Sum = 'builtInSum',
  Min = 'builtInMin',
  Max = 'builtInMax',
  Avg = 'builtInAvg',
  Sample = 'builtInSample',
  Group_concat = 'builtInGroup_concat',
}

function capitalize<T extends string>(string: T): Capitalize<T> {
  return <Capitalize<T>> (string.charAt(0).toUpperCase() + string.slice(1));
}

export const str = createToken({ name: capitalize(BuiltInCalls.Str), pattern: /str/i, label: 'STR' });
export const lang = createToken({ name: capitalize(BuiltInCalls.Lang), pattern: /lang/i, label: 'LANG' });
export const langmatches = createToken({
  name: capitalize(BuiltInCalls.Langmatches),
  pattern: /langmatches/i,
  label: 'LANGMATCHES',
});
export const datatype = createToken({
  name: capitalize(BuiltInCalls.Datatype),
  pattern: /datatype/i,
  label: 'DATATYPE',
});
export const bound = createToken({ name: capitalize(BuiltInCalls.Bound), pattern: /bound/i, label: 'BOUND' });
export const iri = createToken({ name: capitalize(BuiltInCalls.Iri), pattern: /iri/i, label: 'IRI' });
export const uri = createToken({ name: capitalize(BuiltInCalls.Uri), pattern: /uri/i, label: 'URI' });
export const bnode = createToken({ name: capitalize(BuiltInCalls.Bnode), pattern: /bnode/i, label: 'BNODE' });
export const rand = createToken({ name: capitalize(BuiltInCalls.Rand), pattern: /rand/i, label: 'RAND' });
export const abs = createToken({ name: capitalize(BuiltInCalls.Abs), pattern: /abs/i, label: 'ABS' });
export const ceil = createToken({ name: capitalize(BuiltInCalls.Ceil), pattern: /ceil/i, label: 'CEIL' });
export const floor = createToken({ name: capitalize(BuiltInCalls.Floor), pattern: /floor/i, label: 'FLOOR' });
export const round = createToken({ name: capitalize(BuiltInCalls.Round), pattern: /round/i, label: 'ROUND' });
export const concat = createToken({ name: capitalize(BuiltInCalls.Concat), pattern: /concat/i, label: 'CONCAT' });
export const strlen = createToken({ name: capitalize(BuiltInCalls.Strlen), pattern: /strlen/i, label: 'STRLEN' });
export const ucase = createToken({ name: capitalize(BuiltInCalls.Ucase), pattern: /ucase/i, label: 'UCASE' });
export const lcase = createToken({ name: capitalize(BuiltInCalls.Lcase), pattern: /lcase/i, label: 'LCASE' });
export const encode_for_uri = createToken({
  name: capitalize(BuiltInCalls.Encode_for_uri),
  pattern: /encode_for_uri/i,
  label: 'ENCODE_FOR_URI',
});
export const contains = createToken({
  name: capitalize(BuiltInCalls.Contains),
  pattern: /contains/i,
  label: 'CONTAINS',
});
export const strstarts = createToken({
  name: capitalize(BuiltInCalls.Strstarts),
  pattern: /strstarts/i,
  label: 'STRSTARTS',
});
export const strends = createToken({ name: capitalize(BuiltInCalls.Strends), pattern: /strends/i, label: 'STRENDS' });
export const strbefore = createToken({
  name: capitalize(BuiltInCalls.Strbefore),
  pattern: /strbefore/i,
  label: 'STRBEFORE',
});
export const strafter = createToken({
  name: capitalize(BuiltInCalls.Strafter),
  pattern: /strafter/i,
  label: 'STRAFTER',
});
export const year = createToken({ name: capitalize(BuiltInCalls.Year), pattern: /year/i, label: 'YEAR' });
export const month = createToken({ name: capitalize(BuiltInCalls.Month), pattern: /month/i, label: 'MONTH' });
export const day = createToken({ name: capitalize(BuiltInCalls.Day), pattern: /day/i, label: 'DAY' });
export const hours = createToken({ name: capitalize(BuiltInCalls.Hours), pattern: /hours/i, label: 'HOURS' });
export const minutes = createToken({ name: capitalize(BuiltInCalls.Minutes), pattern: /minutes/i, label: 'MINUTES' });
export const seconds = createToken({ name: capitalize(BuiltInCalls.Seconds), pattern: /seconds/i, label: 'SECONDS' });
export const timezone = createToken({
  name: capitalize(BuiltInCalls.Timezone),
  pattern: /timezone/i,
  label: 'TIMEZONE',
});
export const tz = createToken({ name: capitalize(BuiltInCalls.Tz), pattern: /tz/i, label: 'TZ' });
export const now = createToken({ name: capitalize(BuiltInCalls.Now), pattern: /now/i, label: 'NOW' });
export const uuid = createToken({ name: capitalize(BuiltInCalls.Uuid), pattern: /uuid/i, label: 'UUID' });
export const struuid = createToken({ name: capitalize(BuiltInCalls.Struuid), pattern: /struuid/i, label: 'STRUUID' });
export const md5 = createToken({ name: capitalize(BuiltInCalls.Md5), pattern: /md5/i, label: 'MD5' });
export const sha1 = createToken({ name: capitalize(BuiltInCalls.Sha1), pattern: /sha1/i, label: 'SHA1' });
export const sha256 = createToken({ name: capitalize(BuiltInCalls.Sha256), pattern: /sha256/i, label: 'SHA256' });
export const sha384 = createToken({ name: capitalize(BuiltInCalls.Sha384), pattern: /sha384/i, label: 'SHA384' });
export const sha512 = createToken({ name: capitalize(BuiltInCalls.Sha512), pattern: /sha512/i, label: 'SHA512' });
export const coalesce = createToken({
  name: capitalize(BuiltInCalls.Coalesce),
  pattern: /coalesce/i,
  label: 'COALESCE',
});
export const if_ = createToken({ name: capitalize(BuiltInCalls.If), pattern: /if/i, label: 'IF' });
export const strlang = createToken({ name: capitalize(BuiltInCalls.Strlang), pattern: /strlang/i, label: 'STRLANG' });
export const strdt = createToken({ name: capitalize(BuiltInCalls.Strdt), pattern: /strdt/i, label: 'STRDT' });
export const sameterm = createToken({
  name: capitalize(BuiltInCalls.Sameterm),
  pattern: /sameterm/i,
  label: 'SAMETERM',
});
export const isiri = createToken({ name: capitalize(BuiltInCalls.Isiri), pattern: /isiri/i, label: 'ISIRI' });
export const isuri = createToken({ name: capitalize(BuiltInCalls.Isuri), pattern: /isuri/i, label: 'ISURI' });
export const isblank = createToken({ name: capitalize(BuiltInCalls.Isblank), pattern: /isblank/i, label: 'ISBLANK' });
export const isliteral = createToken({
  name: capitalize(BuiltInCalls.Isliteral),
  pattern: /isliteral/i,
  label: 'ISLITERAL',
});
export const isnumeric = createToken({
  name: capitalize(BuiltInCalls.Isnumeric),
  pattern: /isnumeric/i,
  label: 'ISNUMERIC',
});
export const regex = createToken({ name: capitalize(BuiltInCalls.Regex), pattern: /regex/i, label: 'REGEX' });
export const substr = createToken({ name: capitalize(BuiltInCalls.Substr), pattern: /substr/i, label: 'SUBSTR' });
export const replace = createToken({ name: capitalize(BuiltInCalls.Replace), pattern: /replace/i, label: 'REPLACE' });
export const exists = createToken({ name: capitalize(BuiltInCalls.Exists), pattern: /exists/i, label: 'EXISTS' });
export const notexists = createToken({
  name: capitalize(BuiltInCalls.Notexists),
  pattern: /not exists/i,
  label: 'NOT EXISTS',
});
export const count = createToken({ name: capitalize(BuiltInCalls.Count), pattern: /count/i, label: 'COUNT' });
export const sum = createToken({ name: capitalize(BuiltInCalls.Sum), pattern: /sum/i, label: 'SUM' });
export const min = createToken({ name: capitalize(BuiltInCalls.Min), pattern: /min/i, label: 'MIN' });
export const max = createToken({ name: capitalize(BuiltInCalls.Max), pattern: /max/i, label: 'MAX' });
export const avg = createToken({ name: capitalize(BuiltInCalls.Avg), pattern: /avg/i, label: 'AVG' });
export const sample = createToken({ name: capitalize(BuiltInCalls.Sample), pattern: /sample/i, label: 'SAMPLE' });
export const groupConcat = createToken({
  name: capitalize(BuiltInCalls.Group_concat),
  pattern: /group_concat/i,
  label: 'GROUP_CONCAT',
});

export const allBuiltInCalls = LexerBuilder.create().add(
  langmatches,
  datatype,
  lang,
  bound,
  iri,
  uri,
  bnode,
  rand,
  abs,
  ceil,
  floor,
  round,
  concat,
  strlen,
  ucase,
  lcase,
  encode_for_uri,
  contains,
  strstarts,
  strends,
  strbefore,
  strafter,
  year,
  month,
  day,
  hours,
  minutes,
  seconds,
  timezone,
  tz,
  now,
  uuid,
  struuid,
  md5,
  sha1,
  sha256,
  sha384,
  sha512,
  coalesce,
  if_,
  strlang,
  strdt,
  sameterm,
  isiri,
  isuri,
  isblank,
  isliteral,
  isnumeric,
  regex,
  substr,
  replace,
  exists,
  notexists,
  count,
  sum,
  min,
  max,
  avg,
  sample,
  groupConcat,
  str,
);
