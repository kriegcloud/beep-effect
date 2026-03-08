import { RdfXmlParser as RdfXmlParserBase } from 'rdfxml-streaming-parser'

class RdfXmlParser extends RdfXmlParserBase {
  constructor ({ factory, ...args } = {}) {
    super({ ...args, dataFactory: factory })
  }
}

export default RdfXmlParser
