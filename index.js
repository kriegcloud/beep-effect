import Sink from '@rdfjs/sink'
import ParserStream from './lib/ParserStream.js'

class Parser extends Sink {
  constructor (options) {
    super(ParserStream, options)
  }
}

export default Parser
