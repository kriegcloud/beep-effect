import Sink from '@rdfjs/sink'
import SerializerStream from './lib/SerializerStream.js'

class Serializer extends Sink {
  constructor (options) {
    super(SerializerStream, options)
  }
}

export default Serializer
