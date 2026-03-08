import {SaxesParser} from "@rubensworks/saxes";
import {RdfXmlParser} from "./RdfXmlParser";

/**
 * An error that includes line and column in the error message.
 */
export class ParseError extends Error {

  constructor(parser: RdfXmlParser, message: string) {
    const saxParser: SaxesParser = (<any>parser).saxParser;
    super(parser.trackPosition ? `Line ${saxParser.line} column ${saxParser.column + 1}: ${message}` : message);
  }

}
