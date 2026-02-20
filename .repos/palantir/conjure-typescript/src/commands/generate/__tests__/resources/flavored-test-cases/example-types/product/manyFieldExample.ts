import { IStringAliasExample } from "./stringAliasExample";

export interface IManyFieldExample {
    /** docs for string field */
    'string': string;
    /** docs for integer field */
    'integer': number;
    /** docs for doubleValue field */
    'doubleValue': number | "NaN";
    /** docs for optionalItem field */
    'optionalItem'?: string | null;
    /** docs for items field */
    'items': Array<string>;
    /** docs for set field */
    'set': Array<string>;
    /** docs for map field */
    'map': { [key: string]: string };
    /** docs for alias field */
    'alias': IStringAliasExample;
}
