export interface IManyFieldExample {
    /** docs for string field */
    readonly 'string': string;
    /** docs for integer field */
    readonly 'integer': number;
    /** docs for doubleValue field */
    readonly 'doubleValue': number | "NaN";
    /** docs for optionalItem field */
    readonly 'optionalItem'?: string | null;
    /** docs for items field */
    readonly 'items': ReadonlyArray<string>;
    /** docs for set field */
    readonly 'set': ReadonlyArray<string>;
    /** docs for map field */
    readonly 'map': { readonly [key: string]: string };
    /** docs for alias field */
    readonly 'alias': string;
}
