import * as S from "effect/Schema";
import {JSONSchema} from 'effect/JsonSchema';
import { Console, Effect } from "effect";

export class CountryCode extends S.Class<CountryCode>("CountryCode")(
  {
    FIFA: S.String.annotateKey({
      description: "Codes assigned by the Fédération Internationale de" +
        " Football Association",
      title: "FIFA code"
    }),
    Dial: S.String.annotateKey({
      title: "telephone dialing code",
      description: "Country code from ITU-T recommendation E.164, sometimes followed by area code"
    }),
    "ISO3166-1-Alpha-3": S.String.check(S.isLengthBetween(3, 3)).annotateKey({
      description: "Alpha-3 codes from ISO 3166-1 (synonymous with World" +
        " Bank Codes)",
      title: "ISO3166-1-Alpha-3"
    }),
    MARC: S.String.annotateKey({
      description: "MAchine-Readable Cataloging codes from the Library of" +
        " Congress",
      title: "MARC code"
    }),
    is_independent: S.String.annotateKey({
      description: "Country status, based on the CIA World Factbook",
      title:  "independent country"
    }),
    "ISO3166-1-numeric": S.String.annotateKey({
      description: "Numeric codes from ISO 3166-1",
      title: "ISO3166-1-numeric"
    }),
    GAUL: S.String.annotateKey({
      description: "Global Administrative Unit Layers from the Food and" +
        " Agriculture Organization",
      title: "GAUL code"
    }),
    FIPS: S.String.annotateKey({
      description: "Codes from the U.S. standard FIPS PUB 10-4",
      title: "FIPS code"
    }),
    WMO: S.String.check(S.isMaxLength(2)).annotateKey({
      description: "Country abbreviations by the World Meteorological" +
        " Organization",
      title: "WMO code"
    }),
    "ISO3166-1-Alpha-2": S.String.check(S.isLengthBetween(2, 2)).annotateKey({
      description: "Alpha-2 codes from ISO 3166-1",
      title: "ISO3166-1-Alpha-2"
    }),
    ITU: S.String.annotateKey({
      description: "Codes assigned by the International Telecommunications" +
        " Union",
      title: "ITU code"
    }),
    IOC: S.String.check(S.isMaxLength(3)).annotateKey({
      description: "Codes assigned by the International Olympics Committee",
      title: "IOC code"
    }),
    DS: S.String.annotateKey({
      description: "Distinguishing signs of vehicles in international traffic",
      title: "distinguishing signs of vehicles"
    }),
    "UNTERM Spanish Formal": S.String.annotateKey({
      description: "Country's formal Spanish name from UN Protocol and" +
        " Liaison Service",
      title: "UNTERM Spanish Formal"
    }),
    "Global Code": S.String.annotateKey({
      description: "Country classification from United Nations Statistics" +
        " Division",
      title: "global code"
    }),
    "Intermediate Region Code": S.String.annotateKey({
      description: "Country classification from United Nations Statistics" +
        " Division",
      title: "ntermediate region code",
    }),
    official_name_fr: S.String.annotateKey({
      description: "Country or Area official French short name from UN" +
        " Statistics Division",
      title: "official name French"
    }),
    "UNTERM French Short": S.String.annotateKey({
      description: "Country's short French name from UN Protocol and Liaison" +
        " Service",
      title: "UNTERM French Short"
    }),
    "ISO4217-currency_name": S.String.annotateKey({
      description: "ISO 4217 currency name",
      title: "ISO4217-currency_name"
    }),

  }
) {}
