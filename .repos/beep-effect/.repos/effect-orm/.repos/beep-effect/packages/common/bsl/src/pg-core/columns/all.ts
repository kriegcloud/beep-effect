import { bigint } from "./bigint";
import { bigserial } from "./bigserial";
import { boolean } from "./boolean";
import { char } from "./char";
import { cidr } from "./cidr";
import { customType } from "./custom";
import { date } from "./date";
import { doublePrecision } from "./double-precision";
import { inet } from "./inet";
import { integer } from "./integer";
import { interval } from "./interval";
import { json } from "./json";
import { jsonb } from "./jsonb";
import { line } from "./line";
import { macaddr } from "./macaddr";
import { macaddr8 } from "./macaddr8";
import { numeric } from "./numeric";
import { point } from "./point";
import { geometry } from "./postgis_extension/geometry";
import { real } from "./real";
import { serial } from "./serial";
import { smallint } from "./smallint";
import { smallserial } from "./smallserial";
import { text } from "./text";
import { time } from "./time";
import { timestamp } from "./timestamp";
import { uuid } from "./uuid";
import { varchar } from "./varchar";
import { bit } from "./vector_extension/bit";
import { halfvec } from "./vector_extension/halfvec";
import { sparsevec } from "./vector_extension/sparsevec";
import { vector } from "./vector_extension/vector";

export function getPgColumnBuilders() {
  return {
    bigint,
    bigserial,
    boolean,
    char,
    cidr,
    customType,
    date,
    doublePrecision,
    inet,
    integer,
    interval,
    json,
    jsonb,
    line,
    macaddr,
    macaddr8,
    numeric,
    point,
    geometry,
    real,
    serial,
    smallint,
    smallserial,
    text,
    time,
    timestamp,
    uuid,
    varchar,
    bit,
    halfvec,
    sparsevec,
    vector,
  };
}

export type PgColumnsBuilders = ReturnType<typeof getPgColumnBuilders>;
