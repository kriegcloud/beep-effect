import * as ShExJ from 'shexj';

export function construct(baseIRI: string, prefixes?: object, schemaOptions?: object): Parser;
export class Parser {
  parse (text: string): ShExJ.Schema
}
