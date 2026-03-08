import Sink from '@rdfjs/sink'
import SerializerStream from './lib/SerializerStream.js'

class Serializer extends Sink {
  constructor () {
    super(SerializerStream)
  }
}

export default Serializer
